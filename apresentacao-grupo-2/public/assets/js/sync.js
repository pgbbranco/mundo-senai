/*
 * Transporte em tempo real sem servidor próprio.
 *  - WebRTC (PeerJS): celular do público <-> navegador da apresentação.
 *  - BroadcastChannel: abas do mesmo navegador (útil para ensaiar sozinho).
 * As mensagens são idempotentes, então receber a mesma pelos dois caminhos é inofensivo.
 */

const CANAL = 'slides-ao-vivo-v1'
const ICE = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ],
}

export const PREFIXO_ID = 'slideaovivo-'

export function novoId() {
  const letras = 'abcdefghjkmnpqrstuvwxyz23456789'
  const sorteio = crypto.getRandomValues(new Uint8Array(8))
  return PREFIXO_ID + Array.from(sorteio, (n) => letras[n % letras.length]).join('')
}

function abrirCanal(aoReceber) {
  if (!('BroadcastChannel' in window)) return null
  const canal = new BroadcastChannel(CANAL)
  canal.onmessage = (e) => aoReceber(e.data)
  return canal
}

/**
 * Lado da apresentação.
 * aoReceber(mensagem, responder) é chamado para cada mensagem vinda de um controle.
 */
export function abrirHost({ id, aoReceber, aoMudarRede, aoMudarId }) {
  const conexoes = new Set()
  let peer = null
  let idAtual = id
  let tentativa = null

  const canal = abrirCanal((msg) => aoReceber(msg, (resposta) => canal.postMessage(resposta)))

  function enviar(msg) {
    canal?.postMessage(msg)
    conexoes.forEach((c) => c.open && c.send(msg))
  }

  function reiniciar(atraso) {
    clearTimeout(tentativa)
    tentativa = setTimeout(iniciar, atraso)
  }

  function iniciar() {
    peer?.destroy()
    if (!window.Peer) {
      aoMudarRede('offline')
      return
    }
    aoMudarRede('conectando')
    peer = new window.Peer(idAtual, { config: ICE, debug: 0 })

    peer.on('open', () => aoMudarRede('online'))

    peer.on('connection', (conn) => {
      conn.on('open', () => conexoes.add(conn))
      conn.on('data', (msg) => aoReceber(msg, (resposta) => conn.open && conn.send(resposta)))
      conn.on('close', () => conexoes.delete(conn))
      conn.on('error', () => conexoes.delete(conn))
    })

    peer.on('disconnected', () => {
      aoMudarRede('conectando')
      if (!peer.destroyed) peer.reconnect()
    })

    peer.on('error', (erro) => {
      if (erro.type === 'unavailable-id') {
        idAtual = novoId()
        aoMudarId(idAtual)
        reiniciar(200)
        return
      }
      aoMudarRede('offline')
      reiniciar(5000)
    })
  }

  iniciar()
  return { enviar }
}

/** Lado do celular. */
export function abrirCliente({ hostId, aoReceber, aoMudarRede }) {
  let peer = null
  let conn = null
  let tentativa = null

  const canal = abrirCanal(aoReceber)

  function enviar(msg) {
    canal?.postMessage(msg)
    if (conn?.open) conn.send(msg)
  }

  function reconectar(atraso) {
    clearTimeout(tentativa)
    tentativa = setTimeout(conectar, atraso)
  }

  function conectar() {
    if (!hostId || !window.Peer) return
    aoMudarRede('conectando')
    conn?.close()
    conn = peer.connect(hostId, { reliable: true })

    const limite = setTimeout(() => {
      if (!conn.open) {
        conn.close()
        reconectar(1500)
      }
    }, 8000)

    conn.on('open', () => {
      clearTimeout(limite)
      aoMudarRede('online')
    })
    conn.on('data', aoReceber)
    conn.on('close', () => {
      aoMudarRede('offline')
      reconectar(2000)
    })
  }

  function iniciar() {
    if (!hostId || !window.Peer) return
    peer = new window.Peer({ config: ICE, debug: 0 })
    peer.on('open', conectar)
    peer.on('disconnected', () => !peer.destroyed && peer.reconnect())
    peer.on('error', (erro) => {
      aoMudarRede('offline')
      if (erro.type === 'peer-unavailable') {
        reconectar(3000)
      } else if (!peer.open) {
        peer.destroy()
        setTimeout(iniciar, 4000)
      }
    })
  }

  iniciar()
  return { enviar }
}
