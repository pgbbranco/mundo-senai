/*
 * Esquema compartilhado entre a apresentação (index.html) e o controle (controle.html).
 * Cada item descreve um controle: como ele aparece no celular, quais valores aceita
 * e qual variável CSS ele altera na parte correspondente.
 */

export const PARTES = [
  { id: 1, nome: 'Parte 1', titulo: 'Por que o front-end importa' },
  { id: 2, nome: 'Parte 2', titulo: 'Responsividade e acessibilidade' },
  { id: 3, nome: 'Parte 3', titulo: 'Sinais de AI Slop' },
]

const fontes = [
  ['sistema', 'Fonte do sistema', 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'],
  ['plex', 'IBM Plex Sans', '"IBM Plex Sans", system-ui, sans-serif'],
  ['fraunces', 'Fraunces (serifada)', '"Fraunces", Georgia, serif'],
  ['jetbrains', 'JetBrains Mono', '"JetBrains Mono", ui-monospace, monospace'],
  ['georgia', 'Georgia', 'Georgia, "Times New Roman", serif'],
  ['times', 'Times New Roman', '"Times New Roman", Times, serif'],
  ['arial', 'Arial', 'Arial, Helvetica, sans-serif'],
  ['verdana', 'Verdana', 'Verdana, Geneva, sans-serif'],
  ['trebuchet', 'Trebuchet MS', '"Trebuchet MS", Tahoma, sans-serif'],
  ['courier', 'Courier New', '"Courier New", Courier, monospace'],
  ['comic', 'Comic Sans', '"Comic Sans MS", "Comic Neue", "Chalkboard SE", cursive'],
  ['impact', 'Impact', 'Impact, "Arial Narrow Bold", sans-serif'],
].map(([valor, rotulo, css]) => ({ valor, rotulo, css }))

const pesos = ['300', '400', '500', '600', '700', '800', '900'].map((p) => ({
  valor: p,
  rotulo: { 300: 'Leve', 400: 'Normal', 500: 'Médio', 600: 'Seminegrito', 700: 'Negrito', 800: 'Extranegrito', 900: 'Preto' }[p],
}))

const preto = 'rgba(0, 0, 0, 0.35)'

export const CONTROLES = [
  {
    grupo: 'Tipografia',
    itens: [
      { chave: 'fonte', rotulo: 'Fonte', tipo: 'select', variavel: '--fonte', opcoes: fontes },
      { chave: 'tamanho', rotulo: 'Tamanho do texto', tipo: 'range', min: 8, max: 72, passo: 1, unidade: 'px', variavel: '--tamanho' },
      { chave: 'escalaTitulos', rotulo: 'Tamanho dos títulos', tipo: 'range', min: 0.8, max: 3, passo: 0.1, unidade: '×', variavel: '--esc-titulos' },
      { chave: 'peso', rotulo: 'Peso da fonte', tipo: 'select', variavel: '--peso', opcoes: pesos },
      {
        chave: 'estiloFonte', rotulo: 'Estilo', tipo: 'select', variavel: '--estilo-fonte',
        opcoes: [{ valor: 'normal', rotulo: 'Normal' }, { valor: 'italic', rotulo: 'Itálico' }],
      },
      {
        chave: 'caixa', rotulo: 'Caixa do texto', tipo: 'select', variavel: '--caixa',
        opcoes: [
          { valor: 'none', rotulo: 'Como foi escrito' },
          { valor: 'uppercase', rotulo: 'MAIÚSCULAS' },
          { valor: 'lowercase', rotulo: 'minúsculas' },
          { valor: 'capitalize', rotulo: 'Primeiras Maiúsculas' },
        ],
      },
      {
        chave: 'alinhamento', rotulo: 'Alinhamento', tipo: 'select', variavel: '--alinhamento',
        opcoes: [
          { valor: 'left', rotulo: 'Esquerda' },
          { valor: 'center', rotulo: 'Centro' },
          { valor: 'right', rotulo: 'Direita' },
          { valor: 'justify', rotulo: 'Justificado' },
        ],
      },
    ],
  },
  {
    grupo: 'Espaçamento',
    itens: [
      { chave: 'altura', rotulo: 'Altura da linha', tipo: 'range', min: 0.8, max: 2.8, passo: 0.05, unidade: '', variavel: '--altura' },
      { chave: 'letras', rotulo: 'Espaço entre letras', tipo: 'range', min: -3, max: 12, passo: 0.5, unidade: 'px', variavel: '--letras' },
      { chave: 'palavras', rotulo: 'Espaço entre palavras', tipo: 'range', min: -4, max: 48, passo: 1, unidade: 'px', variavel: '--palavras' },
      { chave: 'espacoBlocos', rotulo: 'Espaço entre blocos', tipo: 'range', min: 0, max: 64, passo: 1, unidade: 'px', variavel: '--espaco' },
      { chave: 'espacoInterno', rotulo: 'Margem interna do slide', tipo: 'range', min: 0, max: 120, passo: 2, unidade: 'px', variavel: '--esp-interno' },
      { chave: 'larguraTexto', rotulo: 'Largura máxima do texto', tipo: 'range', min: 20, max: 200, passo: 2, unidade: 'ch', variavel: '--largura' },
      {
        chave: 'posicaoVertical', rotulo: 'Posição vertical', tipo: 'select', variavel: '--margem',
        opcoes: [
          { valor: 'topo', rotulo: 'No topo', css: '0 auto' },
          { valor: 'centro', rotulo: 'Centralizado', css: 'auto' },
          { valor: 'base', rotulo: 'Embaixo', css: 'auto auto 0' },
        ],
      },
    ],
  },
  {
    grupo: 'Cores',
    itens: [
      { chave: 'corTexto', rotulo: 'Texto', tipo: 'cor', variavel: '--cor-texto' },
      { chave: 'corFundo', rotulo: 'Fundo', tipo: 'cor', variavel: '--cor-fundo' },
      { chave: 'corTitulo', rotulo: 'Títulos', tipo: 'cor', variavel: '--cor-titulo' },
      { chave: 'corDestaque', rotulo: 'Destaques e código', tipo: 'cor', variavel: '--cor-destaque' },
      { chave: 'corBorda', rotulo: 'Borda', tipo: 'cor', variavel: '--cor-borda' },
    ],
  },
  {
    grupo: 'Forma e fundo',
    itens: [
      { chave: 'bordaEspessura', rotulo: 'Espessura da borda', tipo: 'range', min: 0, max: 24, passo: 1, unidade: 'px', variavel: '--borda-esp' },
      {
        chave: 'bordaEstilo', rotulo: 'Estilo da borda', tipo: 'select', variavel: '--borda-estilo',
        opcoes: [
          { valor: 'solid', rotulo: 'Contínua' },
          { valor: 'dashed', rotulo: 'Tracejada' },
          { valor: 'dotted', rotulo: 'Pontilhada' },
          { valor: 'double', rotulo: 'Dupla' },
          { valor: 'ridge', rotulo: 'Relevo' },
          { valor: 'groove', rotulo: 'Sulco' },
        ],
      },
      { chave: 'raio', rotulo: 'Arredondamento', tipo: 'range', min: 0, max: 64, passo: 1, unidade: 'px', variavel: '--raio' },
      {
        chave: 'sombra', rotulo: 'Sombra', tipo: 'select', variavel: '--sombra',
        opcoes: [
          { valor: 'nenhuma', rotulo: 'Nenhuma', css: 'none' },
          { valor: 'suave', rotulo: 'Suave', css: '0 12px 32px rgba(0, 0, 0, 0.28)' },
          { valor: 'dura', rotulo: 'Dura', css: '10px 10px 0 rgba(0, 0, 0, 0.9)' },
          { valor: 'brilho', rotulo: 'Brilho na cor de destaque', css: '0 0 36px var(--cor-destaque)' },
        ],
      },
      { chave: 'inclinacao', rotulo: 'Inclinação do slide', tipo: 'range', min: -8, max: 8, passo: 0.5, unidade: '°', variavel: '--inclinacao' },
      {
        chave: 'padrao', rotulo: 'Padrão de fundo', tipo: 'select', variavel: '--padrao',
        opcoes: [
          { valor: 'nenhum', rotulo: 'Nenhum', css: 'none', extra: { '--padrao-tam': 'auto' } },
          {
            valor: 'listras', rotulo: 'Listras',
            css: `repeating-linear-gradient(45deg, ${preto} 0 10px, transparent 10px 20px)`,
            extra: { '--padrao-tam': 'auto' },
          },
          {
            valor: 'xadrez', rotulo: 'Xadrez',
            css: `conic-gradient(${preto} 25%, transparent 0 50%, ${preto} 0 75%, transparent 0)`,
            extra: { '--padrao-tam': '40px 40px' },
          },
          {
            valor: 'pontos', rotulo: 'Pontos',
            css: 'radial-gradient(rgba(0, 0, 0, 0.45) 3px, transparent 4px)',
            extra: { '--padrao-tam': '16px 16px' },
          },
        ],
      },
    ],
  },
  {
    grupo: 'Listas e movimento',
    itens: [
      {
        chave: 'marcador', rotulo: 'Marcador das listas', tipo: 'select', variavel: '--marcador',
        opcoes: [
          { valor: 'none', rotulo: 'Sem marcador' },
          { valor: 'disc', rotulo: 'Bolinha' },
          { valor: 'square', rotulo: 'Quadrado' },
          { valor: 'decimal', rotulo: 'Números' },
        ],
      },
      {
        chave: 'animacao', rotulo: 'Animação', tipo: 'select', variavel: '--anim-titulo',
        opcoes: [
          { valor: 'nenhuma', rotulo: 'Nenhuma', css: 'none', extra: { '--anim-corpo': 'none' } },
          { valor: 'piscar', rotulo: 'Títulos piscando', css: 'piscar 0.9s steps(1) infinite', extra: { '--anim-corpo': 'none' } },
          { valor: 'tremer', rotulo: 'Texto tremendo', css: 'none', extra: { '--anim-corpo': 'tremer 0.35s linear infinite' } },
          { valor: 'balancar', rotulo: 'Títulos balançando', css: 'balancar 2.4s ease-in-out infinite', extra: { '--anim-corpo': 'none' } },
          { valor: 'arcoiris', rotulo: 'Cores mudando sozinhas', css: 'none', extra: { '--anim-corpo': 'arcoiris 4s linear infinite' } },
        ],
      },
    ],
  },
]

export const ITENS = Object.fromEntries(CONTROLES.flatMap((g) => g.itens).map((i) => [i.chave, i]))

/* Ponto de partida: três versões diferentes de "horrível". */
export const PADROES = {
  1: {
    fonte: 'comic', tamanho: 11, escalaTitulos: 1.1, peso: '400', estiloFonte: 'italic', caixa: 'none', alinhamento: 'justify',
    altura: 0.9, letras: -1, palavras: 0, espacoBlocos: 0, espacoInterno: 0, larguraTexto: 200, posicaoVertical: 'topo',
    corTexto: '#ff00ff', corFundo: '#ccff00', corTitulo: '#ffff00', corDestaque: '#00ffff', corBorda: '#ff0000',
    bordaEspessura: 10, bordaEstilo: 'ridge', raio: 0, sombra: 'nenhuma', inclinacao: -2, padrao: 'xadrez',
    marcador: 'none', animacao: 'piscar',
  },
  2: {
    fonte: 'times', tamanho: 9, escalaTitulos: 1, peso: '700', estiloFonte: 'normal', caixa: 'uppercase', alinhamento: 'center',
    altura: 1, letras: 5, palavras: 2, espacoBlocos: 2, espacoInterno: 2, larguraTexto: 200, posicaoVertical: 'topo',
    corTexto: '#ffe600', corFundo: '#ffffff', corTitulo: '#ffd1dc', corDestaque: '#ffff99', corBorda: '#00ff00',
    bordaEspessura: 6, bordaEstilo: 'dotted', raio: 0, sombra: 'nenhuma', inclinacao: 1.5, padrao: 'listras',
    marcador: 'none', animacao: 'tremer',
  },
  3: {
    fonte: 'courier', tamanho: 10, escalaTitulos: 1, peso: '400', estiloFonte: 'normal', caixa: 'lowercase', alinhamento: 'right',
    altura: 2.6, letras: 1, palavras: 30, espacoBlocos: 0, espacoInterno: 0, larguraTexto: 200, posicaoVertical: 'topo',
    corTexto: '#00e5ff', corFundo: '#0033ff', corTitulo: '#00ff88', corDestaque: '#ff00ff', corBorda: '#ffff00',
    bordaEspessura: 8, bordaEstilo: 'groove', raio: 0, sombra: 'nenhuma', inclinacao: 0, padrao: 'pontos',
    marcador: 'none', animacao: 'arcoiris',
  },
}

export function estadoInicial() {
  return Object.fromEntries(Object.entries(PADROES).map(([id, valores]) => [id, { ...valores }]))
}

/** Valida um valor recebido pela rede. Retorna o valor limpo ou `undefined` se for inválido. */
export function sanitizar(chave, valor) {
  const item = ITENS[chave]
  if (!item) return undefined

  if (item.tipo === 'range') {
    const n = Number(valor)
    if (!Number.isFinite(n)) return undefined
    return Math.min(item.max, Math.max(item.min, n))
  }
  if (item.tipo === 'select') {
    const v = String(valor)
    return item.opcoes.some((o) => o.valor === v) ? v : undefined
  }
  if (item.tipo === 'cor') {
    return /^#[0-9a-f]{6}$/i.test(String(valor)) ? String(valor).toLowerCase() : undefined
  }
  return undefined
}

/** Converte o estado de uma parte em variáveis CSS. */
export function paraVariaveis(estado) {
  const vars = {}
  for (const item of Object.values(ITENS)) {
    const valor = estado[item.chave]
    if (item.tipo === 'range') {
      const sufixo = item.unidade === '×' || item.unidade === '' ? '' : item.unidade === '°' ? 'deg' : item.unidade
      vars[item.variavel] = `${valor}${sufixo}`
    } else if (item.tipo === 'select') {
      const opcao = item.opcoes.find((o) => o.valor === valor) ?? item.opcoes[0]
      vars[item.variavel] = opcao.css ?? opcao.valor
      Object.assign(vars, opcao.extra)
    } else {
      vars[item.variavel] = valor
    }
  }
  return vars
}

/** Razão de contraste WCAG entre duas cores hexadecimais. */
export function contraste(hexA, hexB) {
  const luminancia = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  }
  const [a, b] = [luminancia(hexA), luminancia(hexB)]
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
