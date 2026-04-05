export const DEFAULT_FONT_FAMILY = 'Microsoft YaHei'
export const DEFAULT_FONT_SIZE = 11
export const DEFAULT_FONT_COLOR = '#000000'

export const getPrimaryFontFamily = (fontFamilyValue) => {
  return fontFamilyValue?.split(',')[0]?.replace(/['"]/g, '').trim() || DEFAULT_FONT_FAMILY
}

export const normalizeColorValue = (colorValue) => {
  if (!colorValue) return DEFAULT_FONT_COLOR
  if (colorValue.startsWith('#')) return colorValue

  const channelValues = colorValue.match(/\d+(\.\d+)?/g)
  if (!channelValues || channelValues.length < 3) {
    return DEFAULT_FONT_COLOR
  }

  const toHex = (value) => Math.max(0, Math.min(255, Math.round(Number(value))))
    .toString(16)
    .padStart(2, '0')

  return `#${toHex(channelValues[0])}${toHex(channelValues[1])}${toHex(channelValues[2])}`
}

export const normalizeTextAlign = (textAlignValue, fallback = 'left') => {
  if (!textAlignValue) return fallback

  const normalized = textAlignValue.trim().toLowerCase()

  if (normalized === 'start') return 'left'
  if (normalized === 'end') return 'right'
  if (normalized === 'justify') return fallback

  return ['left', 'center', 'right'].includes(normalized) ? normalized : fallback
}

export const isBoldLikeFontWeight = (fontWeightValue) => {
  if (!fontWeightValue) return false

  const normalized = String(fontWeightValue).trim().toLowerCase()
  if (normalized === 'bold' || normalized === 'bolder') {
    return true
  }

  const numeric = parseInt(normalized, 10)
  return Number.isFinite(numeric) && numeric >= 600
}
