import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DEFAULT_TEMPLATE_SECURITY_LEVEL,
  normalizeTableColumnWidths
} from '@/constants/generalTemplateDefaults'

export const DEFAULT_IMAGE_LAYOUT = 'auto'

const VALID_IMAGE_LAYOUTS = new Set([
  DEFAULT_IMAGE_LAYOUT,
  'horizontal',
  'vertical',
  'grid',
  'grid-bottom-wide',
  'grid-top-wide',
  'grid-2x2'
])

export const createEmptyImageCell = () => ({
  images: [],
  layout: DEFAULT_IMAGE_LAYOUT
})

export const normalizeImageLayout = (layout) => (
  VALID_IMAGE_LAYOUTS.has(layout) ? layout : DEFAULT_IMAGE_LAYOUT
)

export const normalizeImageCell = (cell) => {
  if (Array.isArray(cell)) {
    return {
      images: [...cell],
      layout: DEFAULT_IMAGE_LAYOUT
    }
  }

  if (cell && typeof cell === 'object') {
    return {
      images: Array.isArray(cell.images) ? [...cell.images] : [],
      layout: normalizeImageLayout(cell.layout)
    }
  }

  return createEmptyImageCell()
}

export const getImageCellImages = (cell) => normalizeImageCell(cell).images

export const getAvailableImageLayouts = (count) => {
  if (count < 2) {
    return []
  }

  if (count === 2) {
    return ['horizontal', 'vertical']
  }

  if (count === 3) {
    return ['grid-bottom-wide', 'grid-top-wide', 'grid-2x2', 'horizontal', 'vertical']
  }

  if (count <= 4) {
    return ['grid', 'horizontal', 'vertical']
  }

  return ['grid']
}

export const getDefaultResolvedImageLayout = (count) => {
  if (count <= 1) {
    return 'single'
  }

  if (count === 2) {
    return 'horizontal'
  }

  if (count === 3) {
    return 'grid-bottom-wide'
  }

  return 'grid'
}

export const sanitizeImageLayout = (layout, count) => {
  const normalizedLayout = normalizeImageLayout(layout)
  const availableLayouts = getAvailableImageLayouts(count)

  if (!availableLayouts.length || normalizedLayout === DEFAULT_IMAGE_LAYOUT) {
    return DEFAULT_IMAGE_LAYOUT
  }

  return availableLayouts.includes(normalizedLayout)
    ? normalizedLayout
    : DEFAULT_IMAGE_LAYOUT
}

export const resolveImageLayout = (cell) => {
  const normalizedCell = normalizeImageCell(cell)
  const count = normalizedCell.images.length
  const storedLayout = sanitizeImageLayout(normalizedCell.layout, count)

  if (count <= 1) {
    return 'single'
  }

  return storedLayout === DEFAULT_IMAGE_LAYOUT
    ? getDefaultResolvedImageLayout(count)
    : storedLayout
}

export const updateImageCellImages = (cell, images) => {
  const normalizedCell = normalizeImageCell(cell)
  const nextImages = Array.isArray(images) ? [...images] : []

  return {
    images: nextImages,
    layout: sanitizeImageLayout(normalizedCell.layout, nextImages.length)
  }
}

export const updateImageCellLayout = (cell, layout) => {
  const normalizedCell = normalizeImageCell(cell)

  return {
    images: [...normalizedCell.images],
    layout: sanitizeImageLayout(layout, normalizedCell.images.length)
  }
}

export const getImageLayoutOptions = (count) => {
  const labels = {
    horizontal: '左右',
    vertical: '上下',
    grid: '网格',
    'grid-bottom-wide': '下方通栏',
    'grid-top-wide': '上方通栏',
    'grid-2x2': '四宫格'
  }

  return getAvailableImageLayouts(count).map((layout) => ({
    value: layout,
    label: labels[layout] || layout
  }))
}

const createDefaultTemplateContentData = () => ({
  companyName: '',
  reportTitle: '',
  recordCode: '',
  placeholders: {}
})

const createDefaultSignatures = () => ({
  tester: null,
  reviewer: null,
  approver: null
})

const createDefaultTestResultRows = () => ([
  { id: 1, appearance: '', function: '', other: '', conclusion: '', note: '' },
  { id: 2, appearance: '', function: '', other: '', conclusion: '', note: '' },
  { id: 3, appearance: '', function: '', other: '', conclusion: '', note: '' }
])

const createDefaultTestImageRows = () => ([
  { id: 1, before: createEmptyImageCell(), during: createEmptyImageCell(), after: createEmptyImageCell() },
  { id: 2, before: createEmptyImageCell(), during: createEmptyImageCell(), after: createEmptyImageCell() },
  { id: 3, before: createEmptyImageCell(), during: createEmptyImageCell(), after: createEmptyImageCell() }
])

const cloneReportSnapshot = (snapshot = {}) => ({
  fields: { ...(snapshot.fields || {}) },
  fieldFormats: Object.fromEntries(
    Object.entries(snapshot.fieldFormats || {}).map(([fieldId, format]) => [
      fieldId,
      { ...format }
    ])
  ),
  testResultRows: Array.isArray(snapshot.testResultRows)
    ? snapshot.testResultRows.map(row => ({ ...row }))
    : createDefaultTestResultRows(),
  testImageRows: Array.isArray(snapshot.testImageRows)
    ? snapshot.testImageRows.map(row => ({
      ...row,
      before: normalizeImageCell(row.before),
      during: normalizeImageCell(row.during),
      after: normalizeImageCell(row.after)
    }))
    : createDefaultTestImageRows()
})

const getAutoSaveId = (type = 'general') => `autosave_${type}`

const normalizeTemplateSettings = (type = 'general', data = {}) => {
  const defaultTemplateContentData = createDefaultTemplateContentData()

  return {
    logo: data.logo || null,
    signatures: {
      ...createDefaultSignatures(),
      ...(data.signatures || {})
    },
    departmentSeal: data.departmentSeal || null,
    securityLevel: data.securityLevel || DEFAULT_TEMPLATE_SECURITY_LEVEL,
    tableColumnWidths: normalizeTableColumnWidths(type, data.tableColumnWidths),
    templateContentData: {
      ...defaultTemplateContentData,
      ...(data.templateContentData || {}),
      placeholders: {
        ...defaultTemplateContentData.placeholders,
        ...(data.templateContentData?.placeholders || {})
      }
    },
    fixedTextStyles: data.settings?.fixedTextStyles || data.fixedTextStyles || null,
    editableTextStyles: data.settings?.editableTextStyles || data.editableTextStyles || null
  }
}

export const useReportStore = defineStore('report', () => {
  // State
  const currentDraftId = ref(null)
  const templateType = ref('general')
  const reportTitle = ref('')
  const content = ref({})
  const fieldFormats = ref({}) // Store user-specific format settings for each field in report editor
  const templateFieldFormats = ref({}) // Store template-provided field styles separately from report overrides
  const selectedFields = ref([])
  const isDirty = ref(false)
  const isLoading = ref(false)
  const autoSaveTimer = ref(null)

  // Template data from parsed PDF
  const templateData = ref(null)
  
  // Template settings (logo, signatures, seal, etc.)
  const templateSettings = ref(normalizeTemplateSettings('general'))

  // Dynamic rows for test results and images
  const testResultRows = ref(createDefaultTestResultRows())
  
  const testImageRows = ref(createDefaultTestImageRows())

  // Pagination state
  const currentPage = ref(1)
  const totalPages = ref(1)
  const paginationEnabled = ref(true)

  // Computed
  const hasContent = computed(() => {
    return Object.keys(content.value).length > 0 || 
           testResultRows.value.some(row => row.appearance || row.function || row.other || row.conclusion || row.note)
  })

  // Actions
  const loadTemplate = async (type) => {
    isLoading.value = true
    try {
      const response = await fetch(`/api/template/default/${type}`)
      if (response.ok) {
        templateData.value = await response.json()
        templateType.value = type
      } else {
        throw new Error('Failed to load template')
      }
    } catch (error) {
      console.error('Error loading template:', error)
      ElMessage.error('加载模板失败')
    } finally {
      isLoading.value = false
    }
  }

  const loadTemplateSettings = async (templateId) => {
    try {
      const response = await fetch(`/api/template/custom/${templateId}`)
      if (response.ok) {
        const data = await response.json()
        const resolvedType = data.baseType || templateType.value
        templateType.value = resolvedType
        templateSettings.value = normalizeTemplateSettings(resolvedType, data)
        return true
      }
    } catch (error) {
      console.error('Failed to load template settings:', error)
    }
    templateSettings.value = normalizeTemplateSettings(templateType.value)
    return false
  }

  const applyTemplateSettings = (settings, type = templateType.value) => {
    templateSettings.value = normalizeTemplateSettings(type, settings || {})
  }

  // Apply template field formats (from template editor)
  // Keep template styles separate from report-specific overrides so autosave only stores report edits.
  const applyTemplateFieldFormats = (templateFormats) => {
    // Create a new object with template formats (or empty if template has no formats)
    const newFormats = {}
    if (templateFormats && Object.keys(templateFormats).length > 0) {
      Object.keys(templateFormats).forEach(fieldId => {
        newFormats[fieldId] = { ...templateFormats[fieldId] }
      })
    }
    // Replace the entire object to trigger reactivity (even if empty, to reset to defaults)
    templateFieldFormats.value = newFormats
  }

  const updateField = (fieldId, value) => {
    content.value[fieldId] = value
    markDirty()
  }

  const updateFieldFormat = (fieldId, format) => {
    fieldFormats.value[fieldId] = { ...fieldFormats.value[fieldId], ...format }
    markDirty()
  }

  const getTemplateFieldFormat = (fieldId) => {
    return templateFieldFormats.value[fieldId] || null
  }

  const getReportFieldFormat = (fieldId) => {
    return fieldFormats.value[fieldId] || null
  }

  const getFieldFormat = (fieldId) => {
    const templateFormat = getTemplateFieldFormat(fieldId)
    const reportFormat = getReportFieldFormat(fieldId)
    if (!templateFormat && !reportFormat) {
      return null
    }
    return {
      ...(templateFormat || {}),
      ...(reportFormat || {})
    }
  }

  const updateTestResultRow = (rowIndex, field, value) => {
    if (testResultRows.value[rowIndex]) {
      testResultRows.value[rowIndex][field] = value
      markDirty()
    }
  }

  const addTestResultRows = (count = 1) => {
    const lastId = testResultRows.value.length > 0 
      ? Math.max(...testResultRows.value.map(r => r.id)) 
      : 0
    
    for (let i = 0; i < count; i++) {
      testResultRows.value.push({
        id: lastId + i + 1,
        appearance: '',
        function: '',
        other: '',
        conclusion: '',
        note: ''
      })
    }
    markDirty()
  }

  const deleteTestResultRow = async (rowIndex) => {
    if (testResultRows.value.length <= 1) {
      ElMessage.warning('至少保留一行')
      return
    }
    
    try {
      await ElMessageBox.confirm('确定要删除这一行吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      testResultRows.value.splice(rowIndex, 1)
      markDirty()
    } catch {
      // User cancelled
    }
  }

  // Batch delete test result rows
  const batchDeleteTestResultRows = (indices) => {
    if (indices.length >= testResultRows.value.length) {
      ElMessage.warning('不能删除所有行，至少保留一行')
      return
    }
    
    // Sort indices in descending order to avoid index shifting
    const sortedIndices = [...indices].sort((a, b) => b - a)

    for (const index of sortedIndices) {
      if (index >= 0 && index < testResultRows.value.length) {
        testResultRows.value.splice(index, 1)
      }
    }
    markDirty()
    ElMessage.success(`已删除 ${indices.length} 行`)
  }

  const addTestImageRows = (count = 1) => {
    const lastId = testImageRows.value.length > 0 
      ? Math.max(...testImageRows.value.map(r => r.id)) 
      : 0
    
    for (let i = 0; i < count; i++) {
      testImageRows.value.push({
        id: lastId + i + 1,
        before: createEmptyImageCell(),
        during: createEmptyImageCell(),
        after: createEmptyImageCell()
      })
    }
    markDirty()
  }

  const deleteTestImageRow = async (rowIndex) => {
    if (testImageRows.value.length <= 1) {
      ElMessage.warning('至少保留一行')
      return
    }
    
    try {
      await ElMessageBox.confirm('确定要删除这一行吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      testImageRows.value.splice(rowIndex, 1)
      markDirty()
    } catch {
      // User cancelled
    }
  }

  // Batch delete test image rows
  const batchDeleteTestImageRows = (indices) => {
    if (indices.length >= testImageRows.value.length) {
      ElMessage.warning('不能删除所有行，至少保留一行')
      return
    }
    
    // Sort indices in descending order to avoid index shifting
    const sortedIndices = [...indices].sort((a, b) => b - a)

    for (const index of sortedIndices) {
      if (index >= 0 && index < testImageRows.value.length) {
        testImageRows.value.splice(index, 1)
      }
    }
    markDirty()
    ElMessage.success(`已删除 ${indices.length} 行`)
  }

  const updateTestImage = (rowIndex, position, images) => {
    if (testImageRows.value[rowIndex]) {
      const normalizedCell = normalizeImageCell(images)
      testImageRows.value[rowIndex][position] = normalizedCell
      markDirty()
    }
  }

  const selectField = (fieldId, multiSelect = false) => {
    if (multiSelect) {
      const index = selectedFields.value.indexOf(fieldId)
      if (index > -1) {
        selectedFields.value.splice(index, 1)
      } else {
        selectedFields.value.push(fieldId)
      }
    } else {
      selectedFields.value = [fieldId]
    }
  }

  const clearSelection = () => {
    selectedFields.value = []
  }

  const markDirty = () => {
    isDirty.value = true
    scheduleAutoSave()
  }

  const scheduleAutoSave = () => {
    if (autoSaveTimer.value) {
      clearTimeout(autoSaveTimer.value)
    }
    autoSaveTimer.value = setTimeout(() => {
      autoSave()
    }, 500) // Auto-save after 0.5 second of inactivity
  }

  const applySnapshotToState = (snapshot = {}) => {
    const normalizedSnapshot = cloneReportSnapshot(snapshot)
    content.value = normalizedSnapshot.fields
    fieldFormats.value = normalizedSnapshot.fieldFormats
    testResultRows.value = normalizedSnapshot.testResultRows
    testImageRows.value = normalizedSnapshot.testImageRows
  }

  const autoSave = async () => {
    if (!isDirty.value) return
    
    try {
      const response = await fetch('/api/report/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: getAutoSaveId(templateType.value),
          title: reportTitle.value || 'Auto-saved Report',
          templateType: templateType.value,
          content: {
            fields: content.value,
            fieldFormats: fieldFormats.value,
            testResultRows: testResultRows.value,
            testImageRows: testImageRows.value
          }
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        currentDraftId.value = result.id
        isDirty.value = false
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }

  const loadAutoSave = async (type) => {
    try {
      const response = await fetch(`/api/report/autosave/${type}`)
      if (response.ok) {
        const result = await response.json()
        if (result.exists && result.draft) {
          const draft = result.draft
          currentDraftId.value = getAutoSaveId(draft.templateType || type)
          reportTitle.value = draft.title || ''
          templateType.value = draft.templateType || type
          applySnapshotToState(draft.content)
          return true
        }
      }
    } catch (error) {
      console.error('Failed to load auto-save:', error)
    }
    return false
  }

  const newReport = async () => {
    if (hasContent.value) {
      try {
        await ElMessageBox.confirm(
          '创建新报告将清空当前编辑内容，是否继续？',
          '新建报告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
      } catch {
        return
      }
    }
    
    // Reset all content
    currentDraftId.value = null
    reportTitle.value = ''
    content.value = {}
    fieldFormats.value = {}
    testResultRows.value = createDefaultTestResultRows()
    testImageRows.value = createDefaultTestImageRows()
    selectedFields.value = []
    isDirty.value = false
    
    // Delete autosave data from backend
    try {
      await fetch(`/api/report/autosave/${templateType.value}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Failed to delete autosave:', error)
    }
    
    // Reload the applied template settings to reset to the last applied template
    await loadAppliedTemplateSettings()
    
    ElMessage.success('已创建新报告')
  }

  // Load the applied template settings (used by newReport and initial load)
  const loadAppliedTemplateSettings = async () => {
    try {
      const response = await fetch(`/api/template/applied/${templateType.value}`)
      if (response.ok) {
        const data = await response.json()
        if (data) {
          const resolvedType = data.baseType || templateType.value
          templateType.value = resolvedType
          // Apply template settings
          applyTemplateSettings(data, resolvedType)
          
          // Apply template field formats (styles from template editor)
          // Always replace fieldFormats, even if empty (to reset to defaults)
          applyTemplateFieldFormats(data.fieldFormats || {})
          return
        }
      }
    } catch (error) {
      console.error('Failed to load applied template settings:', error)
    }
    applyTemplateSettings({}, templateType.value)
    applyTemplateFieldFormats({})
  }

  const exportPdf = async () => {
    ElMessage.info('正在生成PDF...')
    // PDF export will be implemented in the report editor component
    // This function will be called from the TopNav
    window.dispatchEvent(new CustomEvent('export-pdf'))
  }

  // Save draft functionality
  const saveDraft = async (title) => {
    try {
      const response = await fetch('/api/report/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          templateType: templateType.value,
          content: {
            fields: content.value,
            fieldFormats: fieldFormats.value,
            testResultRows: testResultRows.value,
            testImageRows: testImageRows.value
          }
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        ElMessage.success(`草稿 "${title}" 保存成功`)
        return result
      } else {
        throw new Error('保存失败')
      }
    } catch (error) {
      console.error('Save draft failed:', error)
      ElMessage.error('保存草稿失败：' + error.message)
      throw error
    }
  }

  // Load draft functionality
  const loadDraft = async (draftId) => {
    try {
      const response = await fetch(`/api/report/drafts/${draftId}`)
      if (response.ok) {
        const draft = await response.json()
        
        // Load the saved draft as a new editing session.
        applySnapshotToState(draft.content)
        
        // Update draft metadata
        reportTitle.value = draft.title || ''
        templateType.value = draft.templateType || 'general'
        
        currentDraftId.value = getAutoSaveId(templateType.value)
        isDirty.value = true
        await autoSave()
        ElMessage.success(`草稿 "${draft.title}" 加载成功`)
        return draft
      } else {
        throw new Error('草稿不存在')
      }
    } catch (error) {
      console.error('Load draft failed:', error)
      ElMessage.error('加载草稿失败：' + error.message)
      throw error
    }
  }

  // List all drafts
  const listDrafts = async () => {
    try {
      const response = await fetch('/api/report/drafts')
      if (response.ok) {
        const result = await response.json()
        return result.drafts || []
      } else {
        throw new Error('获取草稿列表失败')
      }
    } catch (error) {
      console.error('List drafts failed:', error)
      ElMessage.error('获取草稿列表失败：' + error.message)
      return []
    }
  }

  // Delete draft functionality
  const deleteDraft = async (draftId, draftTitle) => {
    try {
      const response = await fetch(`/api/report/drafts/${draftId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        ElMessage.success(`草稿 "${draftTitle}" 删除成功`)
        return true
      } else {
        throw new Error('删除失败')
      }
    } catch (error) {
      console.error('Delete draft failed:', error)
      ElMessage.error('删除草稿失败：' + error.message)
      throw error
    }
  }

  return {
    // State
    currentDraftId,
    templateType,
    reportTitle,
    content,
    fieldFormats,
    templateFieldFormats,
    selectedFields,
    isDirty,
    isLoading,
    templateData,
    templateSettings,
    testResultRows,
    testImageRows,
    
    // Pagination state
    currentPage,
    totalPages,
    paginationEnabled,
    
    // Computed
    hasContent,
    
    // Actions
    loadTemplate,
    loadTemplateSettings,
    loadAppliedTemplateSettings,
    applyTemplateSettings,
    applyTemplateFieldFormats,
    updateField,
    updateFieldFormat,
    getTemplateFieldFormat,
    getReportFieldFormat,
    getFieldFormat,
    updateTestResultRow,
    addTestResultRows,
    deleteTestResultRow,
    batchDeleteTestResultRows,
    addTestImageRows,
    deleteTestImageRow,
    batchDeleteTestImageRows,
    updateTestImage,
    selectField,
    clearSelection,
    markDirty,
    autoSave,
    loadAutoSave,
    newReport,
    exportPdf,
    saveDraft,
    loadDraft,
    listDrafts,
    deleteDraft
  }
})
