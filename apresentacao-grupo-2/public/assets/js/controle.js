import { PARTES, CONTROLES, ITENS, estadoInicial, sanitizar, paraVariaveis, contraste } from './config.js'
import { abrirCliente } from './sync.js'

const $ = (seletor, raiz = document) => raiz.querySelector(seletor)
const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)]

const parametros = new URLSearchParams(location.search)
const hostId = parametros.get('h')
const idCliente = crypto.randomUUID().slice(0, 8)

let estado = estadoInicial()
let travas = {}
let parteAtiva = null
let parteEscolhida = Number(sessionStorage.getItem('controle.parte') ?? parametros.get('p') ?? 1)
if (![1, 2, 3].includes(parteEscolhida)) parteEscolhida = 1

let recebeuEstado = false
let ultimoEstadoEm = 0
let rede = 'conectando'
const ultimaEdicao = new Map()

const formulario = $('#controles')

/* ---------- Formulário gerado a partir do esquema ---------- */

function formatar(item, valor) {
  if (item.tipo !== 'range') return String(valor)
  const casas = String(item.passo).includes('.') ? String(item.passo).split('.')[1].length : 0
  const numero = Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
  return item.unidade === '×' ? `${numero}×` : `${numero}${item.unidade ? (item.unidade === '°' ? '°' : ` ${item.unidade}`) : ''}`
}

function criarCampo(item) {
  const id = `c-${item.chave}`
  const campo = document.createElement('div')
  campo.className = 'campo'

  const rotulo = document.createElement('label')
  rotulo.htmlFor = id
  rotulo.textContent = item.rotulo
  campo.append(rotulo)

  if (item.tipo === 'range') {
    const saida = document.createElement('output')
    saida.className = 'campo__valor'
    saida.htmlFor = id
    const entrada = Object.assign(document.createElement('input'), {
      id, type: 'range', min: item.min, max: item.max, step: item.passo,
    })
    entrada.dataset.chave = item.chave
    campo.append(saida, entrada)
  } else if (item.tipo === 'select') {
    const seletor = document.createElement('select')
    seletor.id = id
    seletor.dataset.chave = item.chave
    for (const opcao of item.opcoes) seletor.append(new Option(opcao.rotulo, opcao.valor))
    campo.append(seletor)
  } else {
    const caixa = document.createElement('div')
    caixa.className = 'campo__cor'
    const entrada = Object.assign(document.createElement('input'), { id, type: 'color' })
    entrada.dataset.chave = item.chave
    const hex = document.createElement('span')
    hex.className = 'campo__hex'
    caixa.append(entrada, hex)
    campo.append(caixa)
  }
  return campo
}

CONTROLES.forEach((grupo, indice) => {
  const detalhes = document.createElement('details')
  detalhes.className = 'grupo'
  detalhes.open = indice === 0 || grupo.grupo === 'Cores'

  const titulo = document.createElement('summary')
  titulo.textContent = grupo.grupo

  const campos = document.createElement('div')
  campos.className = 'grupo__campos'
  campos.append(...grupo.itens.map(criarCampo))

  detalhes.append(titulo, campos)
  formulario.append(detalhes)
})

/* ---------- Desenho do estado ---------- */

function bloqueada() {
  return !recebeuEstado || Boolean(travas[parteEscolhida])
}

function preencherCampos() {
  const valores = estado[parteEscolhida]
  for (const entrada of $$('[data-chave]', formulario)) {
    const chave = entrada.dataset.chave
    const item = ITENS[chave]
    if (Date.now() - (ultimaEdicao.get(`${parteEscolhida}.${chave}`) ?? 0) < 1000) continue

    entrada.value = valores[chave]
    if (item.tipo === 'range') {
      entrada.closest('.campo').querySelector('output').textContent = formatar(item, valores[chave])
    } else if (item.tipo === 'cor') {
      entrada.closest('.campo').querySelector('.campo__hex').textContent = valores[chave]
    }
  }
}

function desenharContraste() {
  const v = estado[parteEscolhida]
  const linhas = [
    ['#contraste-texto', contraste(v.corTexto, v.corFundo)],
    ['#contraste-titulo', contraste(v.corTitulo, v.corFundo)],
  ]
  for (const [seletor, razao] of linhas) {
    const linha = $(seletor)
    const aprovado = razao >= 4.5
    linha.dataset.resultado = aprovado ? 'ok' : 'erro'
    $('.contraste__razao', linha).textContent = `${razao.toFixed(1).replace('.', ',')} : 1`
    $('.contraste__veredito', linha).textContent =
      razao >= 7 ? 'AAA, ótimo' : razao >= 4.5 ? 'AA, aprovado' : razao >= 3 ? 'Só texto grande' : 'Reprovado'
  }
}

function desenharPrevia() {
  const previa = $('#previa')
  for (const [nome, valor] of Object.entries(paraVariaveis(estado[parteEscolhida]))) {
    previa.style.setProperty(nome, valor)
  }
}

function desenharAbas() {
  for (const aba of $$('.aba')) {
    const parte = Number(aba.dataset.parte)
    aba.setAttribute('aria-pressed', String(parte === parteEscolhida))
    const fechada = Boolean(travas[parte])
    const noAr = parteAtiva === parte
    aba.dataset.fechada = String(fechada)

    const selo = $('.aba__selo', aba)
    selo.hidden = !(fechada || noAr)
    selo.textContent = fechada ? 'Fechada' : 'No ar agora'
  }
}

function desenharAviso() {
  const aviso = $('#aviso')
  if (!recebeuEstado) {
    aviso.textContent = hostId
      ? 'Procurando a apresentação. Se demorar, confira se o celular está na mesma rede e recarregue a página.'
      : 'Esta página não tem o código da apresentação. Escaneie o QR code no canto do telão.'
  } else if (travas[parteEscolhida]) {
    aviso.textContent = `A edição da Parte ${parteEscolhida} está fechada. Os apresentadores liberam quando for a vez do seu grupo.`
  } else {
    aviso.textContent = ''
  }
}

function desenhar() {
  desenharAbas()
  desenharAviso()
  preencherCampos()
  desenharContraste()
  desenharPrevia()
  formulario.dataset.bloqueado = String(bloqueada())
  $('#restaurar').disabled = bloqueada()
  formulario.toggleAttribute('inert', bloqueada())
}

function desenharStatus() {
  const recente = Date.now() - ultimoEstadoEm < 10000
  const situacao = recente ? 'online' : rede === 'offline' ? 'offline' : 'conectando'
  $('#status-ponto').dataset.estado = situacao
  $('#status-texto').textContent = { online: 'Ao vivo', conectando: 'Conectando', offline: 'Sem conexão' }[situacao]
}
setInterval(desenharStatus, 1000)

/* ---------- Rede ---------- */

function receber(msg) {
  if (!msg || msg.tipo !== 'estado' || !msg.estado) return

  for (const parte of PARTES) {
    for (const chave of Object.keys(ITENS)) {
      const valor = sanitizar(chave, msg.estado[parte.id]?.[chave])
      if (valor !== undefined) estado[parte.id][chave] = valor
    }
  }
  travas = msg.travas ?? {}
  parteAtiva = msg.parteAtiva ?? null
  recebeuEstado = true
  ultimoEstadoEm = Date.now()
  desenhar()
  desenharStatus()
}

const cliente = abrirCliente({
  hostId,
  aoReceber: receber,
  aoMudarRede: (situacao) => {
    rede = situacao
    if (situacao === 'online') dizerOi()
    desenharStatus()
  },
})

function dizerOi() {
  cliente.enviar({ tipo: 'oi', id: idCliente })
}
dizerOi()
setInterval(dizerOi, 4000)
document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && dizerOi())

/* ---------- Envio das alterações ---------- */

const pendentes = new Map()
let quadro = 0

function enviarAlteracao(parte, chave, valor) {
  pendentes.set(`${parte}.${chave}`, { tipo: 'alterar', parte, chave, valor })
  if (quadro) return
  quadro = requestAnimationFrame(() => {
    quadro = 0
    pendentes.forEach((msg) => cliente.enviar(msg))
    pendentes.clear()
  })
}

formulario.addEventListener('input', (e) => {
  const entrada = e.target
  const chave = entrada.dataset?.chave
  if (!chave || bloqueada()) return

  const valor = sanitizar(chave, entrada.value)
  if (valor === undefined) return

  estado[parteEscolhida][chave] = valor
  ultimaEdicao.set(`${parteEscolhida}.${chave}`, Date.now())

  const item = ITENS[chave]
  if (item.tipo === 'range') entrada.closest('.campo').querySelector('output').textContent = formatar(item, valor)
  if (item.tipo === 'cor') entrada.closest('.campo').querySelector('.campo__hex').textContent = valor

  desenharContraste()
  desenharPrevia()
  enviarAlteracao(parteEscolhida, chave, valor)
})

/* ---------- Abas e restauração ---------- */

for (const aba of $$('.aba')) {
  aba.addEventListener('click', () => {
    parteEscolhida = Number(aba.dataset.parte)
    sessionStorage.setItem('controle.parte', String(parteEscolhida))
    ultimaEdicao.clear()
    desenhar()
  })
}

$('#restaurar').addEventListener('click', () => {
  if (bloqueada()) return
  cliente.enviar({ tipo: 'restaurar', parte: parteEscolhida })
})

desenhar()
desenharStatus()
