/*
 * Transições entre slides, usadas pela apresentação e pela prévia do painel.
 * Cada efeito devolve os quadros-chave do slide que entra e do que sai.
 * `direcao` vale 1 ao avançar e -1 ao voltar, para o movimento seguir o sentido da navegação.
 */

const PERSPECTIVA = 'perspective(1600px)'

const EFEITOS = {
  desvanecer: () => ({
    entra: [{ opacity: 0 }, { opacity: 1 }],
    sai: [{ opacity: 1 }, { opacity: 0 }],
  }),
  deslizar: (d) => ({
    entra: [{ transform: `translateX(${100 * d}%)` }, { transform: 'translateX(0%)' }],
    sai: [{ transform: 'translateX(0%)' }, { transform: `translateX(${-100 * d}%)` }],
  }),
  subir: (d) => ({
    entra: [{ transform: `translateY(${100 * d}%)` }, { transform: 'translateY(0%)' }],
    sai: [{ transform: 'translateY(0%)' }, { transform: `translateY(${-100 * d}%)` }],
  }),
  zoom: () => ({
    entra: [{ opacity: 0, transform: 'scale(0.5)' }, { opacity: 1, transform: 'scale(1)' }],
    sai: [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.6)' }],
  }),
  virar: (d) => ({
    entra: [
      { opacity: 0, transform: `${PERSPECTIVA} rotateY(${90 * d}deg)` },
      { opacity: 1, transform: `${PERSPECTIVA} rotateY(0deg)` },
    ],
    sai: [
      { opacity: 1, transform: `${PERSPECTIVA} rotateY(0deg)` },
      { opacity: 0, transform: `${PERSPECTIVA} rotateY(${-90 * d}deg)` },
    ],
  }),
  girar: (d) => ({
    entra: [
      { opacity: 0, transform: `rotate(${-180 * d}deg) scale(0.2)` },
      { opacity: 1, transform: 'rotate(0deg) scale(1)' },
    ],
    sai: [
      { opacity: 1, transform: 'rotate(0deg) scale(1)' },
      { opacity: 0, transform: `rotate(${180 * d}deg) scale(0.2)` },
    ],
  }),
  cortina: (d) => ({
    entra: [
      { clipPath: d > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)' },
      { clipPath: 'inset(0 0 0 0)' },
    ],
    sai: null,
  }),
  desfoque: () => ({
    entra: [{ opacity: 0, filter: 'blur(32px)' }, { opacity: 1, filter: 'blur(0px)' }],
    sai: [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(32px)' }],
  }),
}

const CURVAS = {
  linear: 'linear',
  suave: 'ease-in-out',
  saida: 'ease-out',
  rebote: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
}

export const reduzirMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Anima a troca entre dois slides já posicionados um sobre o outro.
 * Devolve `{ cancelar }`. `aoFim` roda uma única vez, ao terminar ou ao cancelar.
 */
export function transicionar({ saindo, entrando, tipo, duracao, curva, direcao, aoFim }) {
  let finalizado = false
  const animacoes = []

  const finalizar = () => {
    if (finalizado) return
    finalizado = true
    animacoes.forEach((a) => a.cancel())
    aoFim?.()
  }

  const efeito = EFEITOS[tipo]
  if (!efeito) {
    finalizar()
    return { cancelar: finalizar }
  }

  const quadros = efeito(direcao >= 0 ? 1 : -1)
  const opcoes = {
    duration: Math.max(50, duracao * 1000),
    easing: CURVAS[curva] ?? CURVAS.suave,
    fill: 'both',
  }

  animacoes.push(entrando.animate(quadros.entra, opcoes))
  if (quadros.sai) animacoes.push(saindo.animate(quadros.sai, opcoes))

  Promise.all(animacoes.map((a) => a.finished)).then(finalizar, () => {})
  return { cancelar: finalizar }
}
