import { escapeSelector } from '@unocss/core'
import { globalKeywords } from '../mappings'
import { numberRE, numberWithUnitRE, unitOnlyRE } from './regex'

// Not all, but covers most high frequency attributes
const cssProps = [
  // basic props
  'color', 'border-color', 'background-color', 'flex-grow', 'flex', 'flex-shrink',
  'caret-color', 'font', 'gap', 'opacity', 'visibility', 'z-index', 'font-weight',
  'zoom', 'text-shadow', 'transform', 'box-shadow',

  // positions
  'backround-position', 'left', 'right', 'top', 'bottom', 'object-position',

  // sizes
  'max-height', 'min-height', 'max-width', 'min-width', 'height', 'width',
  'border-width', 'margin', 'padding', 'outline-width', 'outline-offset',
  'font-size', 'line-height', 'text-indent', 'vertical-align',
  'border-spacing', 'letter-spacing', 'word-spacing',

  // enhances
  'stroke', 'filter', 'backdrop-filter', 'fill', 'mask', 'mask-size', 'mask-border', 'clip-path', 'clip',
  'border-radius',
]

function round(n: number) {
  return n.toFixed(10).replace(/\.0+$/, '').replace(/(\.\d+?)0+$/, '$1')
}

export function numberWithUnit(str: string) {
  const match = str.match(numberWithUnitRE)
  if (!match)
    return
  const [, n, unit] = match
  const num = parseFloat(n)
  if (unit && !Number.isNaN(num))
    return `${round(num)}${unit}`
}

export function auto(str: string) {
  if (str === 'auto' || str === 'a')
    return 'auto'
}

export function rem(str: string) {
  if (str.match(unitOnlyRE))
    return `1${str}`
  const match = str.match(numberWithUnitRE)
  if (!match)
    return
  const [, n, unit] = match
  const num = parseFloat(n)
  if (!Number.isNaN(num)) {
    if (num === 0)
      return '0'
    return unit ? `${round(num)}${unit}` : `${round(num / 4)}rem`
  }
}

export function remToRpx(str: string) {
  if (str.match(unitOnlyRE))
    return `1${str}`
  const match = str.match(numberWithUnitRE)
  if (!match)
    return
  const [, n, unit] = match
  const num = parseFloat(n)

  // 32 = 2 * rem
  if (!Number.isNaN(num)) {
    if (num === 0)
      return '0'
    return unit ? `${round(num)}${unit}` : `${round(32 * num / 4)}rpx`
  }
}

// 小程序 rpx
export function rpx(str: string) {
  if (str.match(unitOnlyRE))
    return `1${str}`
  const match = str.match(numberWithUnitRE)
  if (!match)
    return
  const [, n, unit] = match
  const num = parseFloat(n)
  if (!Number.isNaN(num)) {
    if (num === 0)
      return '0'
    return unit ? `${round(num)}${unit}` : `${num}rpx`
  }
}

export function px(str: string) {
  if (str.match(unitOnlyRE))
    return `1${str}`
  const match = str.match(numberWithUnitRE)
  if (!match)
    return
  const [, n, unit] = match
  const num = parseFloat(n)
  if (!Number.isNaN(num)) {
    if (num === 0)
      return '0'
    return unit ? `${round(num)}${unit}` : `${round(num)}px`
  }
}

export function number(str: string) {
  if (!numberRE.test(str))
    return
  const num = parseFloat(str)
  if (!Number.isNaN(num))
    return round(num)
}

export function percent(str: string) {
  if (str.endsWith('%'))
    str = str.slice(0, -1)
  const num = parseFloat(str)
  if (!Number.isNaN(num))
    return `${round(num / 100)}`
}

export function fraction(str: string) {
  if (str === 'full')
    return '100%'
  // 小程序百分比 / 改为 _
  const [left, right] = str.split(/[\/\_]/)

  const num = parseFloat(left) / parseFloat(right)
  if (!Number.isNaN(num)) {
    if (num === 0)
      return '0'
    return `${round(num * 100)}%`
  }
}
const bracketTypeRe = /^\[(color|length|position|quoted|string):/i
function bracketWithType(str: string, requiredType?: string) {
  if (str && str.startsWith('[') && str.endsWith(']')) {
    let base: string | undefined
    let hintedType: string | undefined

    const match = str.match(bracketTypeRe)
    if (!match) {
      base = str.slice(1, -1)
    }
    else {
      if (!requiredType)
        hintedType = match[1]
      base = str.slice(match[0].length, -1)
    }

    if (!base)
      return

    let curly = 0
    for (const i of base) {
      if (i === '[') {
        curly += 1
      }
      else if (i === ']') {
        curly -= 1
        if (curly < 0)
          return
      }
    }

    if (curly)
      return

    switch (hintedType) {
      case 'string': return base
        .replace(/(^|[^\\])_/g, '$1 ')
        .replace(/\\_/g, '_')

      case 'quoted': return base
        .replace(/(^|[^\\])_/g, '$1 ')
        .replace(/\\_/g, '_')
        .replace(/(["\\])/g, '\\$1')
        .replace(/^(.+)$/, '"$1"')
    }

    return base
      .replace(/(url\(.*?\))/g, v => v.replace(/_/g, '\\_'))
      .replace(/(^|[^\\])_/g, '$1 ')
      .replace(/\\_/g, '_')
      .replace(/(?:calc|clamp|max|min)\((.*)/g, (match) => {
        const vars: string[] = []
        return match
          .replace(/var\((--.+?)[,)]/g, (match, g1) => {
            vars.push(g1)
            return match.replace(g1, '--un-calc')
          })
          .replace(/(-?\d*\.?\d(?!\b-\d.+[,)](?![^+\-/*])\D)(?:%|[a-z]+)?|\))([+\-/*])/g, '$1 $2 ')
          .replace(/--un-calc/g, () => vars.shift()!)
      })
  }
}

export function bracket(str: string) {
  return bracketWithType(str)
}

export function bracketOfColor(str: string) {
  return bracketWithType(str, 'color')
}

export function bracketOfLength(str: string) {
  return bracketWithType(str, 'length')
}

export function bracketOfPosition(str: string) {
  return bracketWithType(str, 'position')
}

export function cssvar(str: string) {
  if (str.match(/^\$\S/))
    return `var(--${escapeSelector(str.slice(1))})`
}

export function time(str: string) {
  const match = str.match(/^(-?[0-9.]+)(s|ms)?$/i)
  if (!match)
    return
  const [, n, unit] = match
  const num = parseFloat(n)
  if (!Number.isNaN(num)) {
    if (num === 0 && !unit)
      return '0s'
    return unit ? `${round(num)}${unit}` : `${round(num)}ms`
  }
}

export function degree(str: string) {
  const match = str.match(/^(-?[0-9.]+)(deg|rad|grad|turn)?$/i)
  if (!match)
    return
  const [, n, unit] = match
  const num = parseFloat(n)
  if (!Number.isNaN(num)) {
    if (num === 0)
      return '0'
    return unit ? `${round(num)}${unit}` : `${round(num)}deg`
  }
}

export function global(str: string) {
  if (globalKeywords.includes(str))
    return str
}

export function properties(str: string) {
  if (str.split(',').every(prop => cssProps.includes(prop)))
    return str
}

export function position(str: string) {
  if (['top', 'left', 'right', 'bottom', 'center'].includes(str))
    return str
}
