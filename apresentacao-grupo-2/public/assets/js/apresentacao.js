import { PARTES, CONTROLES, ITENS, PADROES, estadoInicial, sanitizar, paraVariaveis } from './config.js'
import { abrirHost, novoId, PREFIXO_ID } from './sync.js'

const CHAVE_ESTADO = 'slides.estado.v1'
const CHAVE_TRAVAS = 'slides.travas.v1'
const CHAVE_ID = 'slides.hostId.v1'

const $ = (seletor, raiz = document) => raiz.querySelector(seletor)
const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)]

/* ---------- Estado persistido ---------- */

function lerJson(chave) {
  try {
    return JSON.parse(localStorage.getItem(chave) ?? 'null')
  } catch {
    return null
  }
}

function carregarEstado() {
  const salvo = lerJson(CHAVE_ESTADO)
  const estado = estadoInicial()
  if (!salvo) return estado
  for (const parte of Object.keys(estado)) {
    for (const chave of Object.keys(estado[parte])) {
      const valor = sanitizar(chave, salvo[parte]?.[chave])
      if (valor !== undefined) estado[parte][chave] = valor
    }
  }
  return estado
}

const estado = carregarEstado()
const travas = { 1: false, 2: false, 3: false, ...(lerJson(CHAVE_TRAVAS) ?? {}) }
let hostId = localStorage.getItem(CHAVE_ID)
if (!hostId?.startsWith(PREFIXO_ID)) {
  hostId = novoId()
  localStorage.setItem(CHAVE_ID, hostId)
}

let salvarTimer = null
function salvar() {
  clearTimeout(salvarTimer)
  salvarTimer = setTimeout(() => {
    localStorage.setItem(CHAVE_ESTADO, JSON.stringify(estado))
    localStorage.setItem(CHAVE_TRAVAS, JSON.stringify(travas))
  }, 250)
}

/* ---------- Aplicação do estilo ---------- */

function aplicar(parte) {
  const elemento = $(`.parte[data-parte="${parte}"]`)
  for (const [nome, valor] of Object.entries(paraVariaveis(estado[parte]))) {
    elemento.style.setProperty(nome, valor)
  }
}

/* ---------- Slides ---------- */

const slides = $$('.slide')
const parteDoSlide = (slide) => Number(slide.closest('.parte').dataset.parte)
let atual = 0

function mostrar(indice) {
  atual = Math.min(slides.length - 1, Math.max(0, indice))
  const parteAtual = parteDoSlide(slides[atual])

  slides.forEach((slide, i) => slide.classList.toggle('ativo', i === atual))
  $$('.parte').forEach((p) => p.classList.toggle('ativa', Number(p.dataset.parte) === parteAtual))
  $$('[data-ir]').forEach((b) => {
    if (Number(b.dataset.ir) === parteAtual) b.setAttribute('aria-current', 'true')
    else b.removeAttribute('aria-current')
  })

  $('#contador').textContent = `${atual + 1} / ${slides.length}`
  $('#anterior').disabled = atual === 0
  $('#proximo').disabled = atual === slides.length - 1
  history.replaceState(null, '', `#slide-${atual + 1}`)
  agendarEnvio()
}

const irParaParte = (parte) => mostrar(slides.findIndex((s) => parteDoSlide(s) === parte))

$('#anterior').addEventListener('click', () => mostrar(atual - 1))
$('#proximo').addEventListener('click', () => mostrar(atual + 1))
$$('[data-ir]').forEach((b) => b.addEventListener('click', () => irParaParte(Number(b.dataset.ir))))

function alternarPainel() {
  const painel = $('#painel')
  painel.hidden = !painel.hidden
  $('#alternar-painel').setAttribute('aria-expanded', String(!painel.hidden))
}
$('#alternar-painel').addEventListener('click', alternarPainel)

document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  if (e.key === 'c' || e.key === 'C') {
    alternarPainel()
    return
  }
  const emBotao = e.target instanceof HTMLElement && e.target.closest('button, a')
  if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !emBotao)) mostrar(atual + 1)
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') mostrar(atual - 1)
  else if (e.key === 'Home') mostrar(0)
  else if (e.key === 'End') mostrar(slides.length - 1)
  else if (['1', '2', '3'].includes(e.key)) irParaParte(Number(e.key))
  else return
  if (e.key === ' ') e.preventDefault()
})

/* ---------- Avisos de alterações ---------- */

const ultimoAviso = new Map()
function avisar(texto, chaveAviso) {
  const agora = Date.now()
  if (agora - (ultimoAviso.get(chaveAviso) ?? 0) < 2500) return
  ultimoAviso.set(chaveAviso, agora)
  const lista = $('#avisos')
  const item = document.createElement('p')
  item.className = 'avisos__item'
  item.textContent = texto
  lista.append(item)
  while (lista.children.length > 3) lista.firstElementChild.remove()
  item.addEventListener('animationend', () => item.remove())
}

/* ---------- Travas de edição ---------- */

function desenharTravas() {
  $$('[data-trava]').forEach((botao) => {
    const parte = botao.dataset.trava
    const aberta = !travas[parte]
    botao.setAttribute('aria-pressed', String(aberta))
    botao.textContent = `Parte ${parte}: ${aberta ? 'aberta' : 'fechada'}`
  })
}

$$('[data-trava]').forEach((botao) =>
  botao.addEventListener('click', () => {
    const parte = botao.dataset.trava
    travas[parte] = !travas[parte]
    desenharTravas()
    salvar()
    agendarEnvio()
  }),
)

$('#restaurar-tudo').addEventListener('click', () => {
  if (!confirm('Voltar as três partes ao estilo original, feio e ilegível?')) return
  for (const parte of PARTES) {
    estado[parte.id] = { ...PADROES[parte.id] }
    aplicar(parte.id)
  }
  salvar()
  agendarEnvio()
})

/* ---------- Rede ---------- */

const presentes = new Map()

function instantaneo() {
  return {
    tipo: 'estado',
    estado,
    travas,
    parteAtiva: parteDoSlide(slides[atual]),
    slide: atual + 1,
    total: slides.length,
  }
}

let envioTimer = null
let host = null
function agendarEnvio() {
  if (!host || envioTimer) return
  envioTimer = setTimeout(() => {
    envioTimer = null
    host.enviar(instantaneo())
  }, 60)
}

function receber(msg, responder) {
  if (!msg || typeof msg !== 'object') return

  if (msg.tipo === 'oi' && typeof msg.id === 'string') {
    presentes.set(msg.id.slice(0, 32), Date.now())
    responder(instantaneo())
    return
  }

  const parte = String(msg.parte)
  if (!estado[parte] || travas[parte]) return

  if (msg.tipo === 'alterar') {
    const valor = sanitizar(msg.chave, msg.valor)
    if (valor === undefined || estado[parte][msg.chave] === valor) return
    estado[parte][msg.chave] = valor
    aplicar(parte)
    salvar()
    agendarEnvio()
    avisar(`Parte ${parte}: ${ITENS[msg.chave].rotulo.toLowerCase()} mudou`, `${parte}.${msg.chave}`)
  } else if (msg.tipo === 'restaurar') {
    estado[parte] = { ...PADROES[parte] }
    aplicar(parte)
    salvar()
    agendarEnvio()
    avisar(`Parte ${parte} voltou ao estilo original`, `${parte}.restaurar`)
  }
}

const rotulosRede = { conectando: 'Conectando', online: 'Ao vivo', offline: 'Sem conexão, tentando de novo' }
function mudarRede(situacao) {
  $('#rede-ponto').dataset.estado = situacao
  $('#rede-texto').textContent = rotulosRede[situacao]
}

setInterval(() => {
  const limite = Date.now() - 12000
  for (const [id, quando] of presentes) if (quando < limite) presentes.delete(id)
  $('#presentes').textContent = presentes.size
}, 2000)

/* ---------- QR code ---------- */

function desenharQr() {
  const url = new URL('controle.html', location.href)
  url.searchParams.set('h', hostId)

  const qr = window.qrcode(0, 'M')
  qr.addData(url.href)
  qr.make()
  $('#qr').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 4, scalable: true }).replace('<svg ', '<svg shape-rendering="crispEdges" ')

  const link = $('#link-controle')
  link.href = url.href
  link.textContent = url.href.replace(/^https?:\/\//, '')
}

/* ---------- Início ---------- */

PARTES.forEach((p) => aplicar(p.id))
desenharTravas()
desenharQr()
$('#aviso-local').hidden = !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)

const inicial = Number.parseInt(location.hash.replace(/^#(slide-)?/, ''), 10)
mostrar(Number.isFinite(inicial) ? inicial - 1 : 0)
document.body.classList.remove('carregando')

host = abrirHost({
  id: hostId,
  aoReceber: receber,
  aoMudarRede: mudarRede,
  aoMudarId: (novo) => {
    hostId = novo
    localStorage.setItem(CHAVE_ID, novo)
    desenharQr()
  },
})
