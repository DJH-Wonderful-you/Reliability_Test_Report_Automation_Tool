const EMPTY_TABLE_COLUMN_WIDTHS = Object.freeze({
  infoTable: Object.freeze([]),
  sampleTable: Object.freeze([]),
  equipmentTable: Object.freeze([]),
  resultTable: Object.freeze([])
})

export const DEFAULT_TEMPLATE_SECURITY_LEVEL = '内部公开'

export const GENERAL_DEFAULT_TABLE_COLUMN_WIDTHS = Object.freeze({
  infoTable: Object.freeze([70, 270, 70, 270]),
  sampleTable: Object.freeze([70, 157, 70, 157, 70, 156]),
  equipmentTable: Object.freeze([70, 157, 70, 157, 70, 156]),
  resultTable: Object.freeze([40, 128, 128, 128, 128, 128])
})

export const GENERAL_SHARED_FIELD_STYLES = Object.freeze({
  companyName: Object.freeze({
    color: '#000000',
    fontFamily: 'SimSun, serif',
    fontSize: '20px',
    fontWeight: 'bold'
  }),
  reportTitle: Object.freeze({
    color: '#000000',
    fontFamily: '"Microsoft YaHei", sans-serif',
    fontSize: '18px',
    fontWeight: 'normal'
  }),
  recordCode: Object.freeze({
    color: '#000000',
    fontFamily: '"Microsoft YaHei", sans-serif',
    fontSize: '9px'
  }),
  signatureLabel: Object.freeze({
    color: '#000000',
    fontFamily: '"Microsoft YaHei", sans-serif',
    fontSize: '12px'
  }),
  signaturePlaceholder: Object.freeze({
    color: '#999999',
    fontFamily: '"Microsoft YaHei", sans-serif',
    fontSize: '12px',
    fontStyle: 'italic'
  }),
  footerNoteLabel: Object.freeze({
    color: '#000000',
    fontFamily: '"Microsoft YaHei", sans-serif',
    fontSize: '9px'
  }),
  footerNotePlaceholder: Object.freeze({
    color: '#999999',
    fontFamily: '"Microsoft YaHei", sans-serif',
    fontSize: '9px',
    fontStyle: 'italic'
  })
})

export const GENERAL_PAGE_HEADER_HEIGHT_PX = 82
export const GENERAL_PAGE_FOOTER_HEIGHT_PX = 60

const cloneTableColumnWidths = (widths) => Object.fromEntries(
  Object.entries(widths).map(([tableName, tableWidths]) => [tableName, [...tableWidths]])
)

export const createDefaultTableColumnWidths = (type = 'general') => {
  if (type === 'general') {
    return cloneTableColumnWidths(GENERAL_DEFAULT_TABLE_COLUMN_WIDTHS)
  }

  return cloneTableColumnWidths(EMPTY_TABLE_COLUMN_WIDTHS)
}

export const normalizeTableColumnWidths = (type = 'general', widths = {}) => {
  const defaults = createDefaultTableColumnWidths(type)

  if (!widths || typeof widths !== 'object') {
    return defaults
  }

  return Object.fromEntries(
    Object.keys(defaults).map((tableName) => {
      const tableWidths = widths[tableName]
      return [
        tableName,
        Array.isArray(tableWidths) && tableWidths.length > 0
          ? [...tableWidths]
          : defaults[tableName]
      ]
    })
  )
}
