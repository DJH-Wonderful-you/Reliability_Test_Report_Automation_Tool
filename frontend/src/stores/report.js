import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export const useReportStore = defineStore('report', () => {
  // State
  const currentDraftId = ref(null)
  const templateType = ref('general')
  const reportTitle = ref('')
  const content = ref({})
  const fieldFormats = ref({}) // Store format settings for each field
  const selectedFields = ref([])
  const isDirty = ref(false)
  const isLoading = ref(false)
  const autoSaveTimer = ref(null)

  // Template data from parsed PDF
  const templateData = ref(null)
  
  // Template settings (logo, signatures, seal, etc.)
  const templateSettings = ref({
    logo: null,
    signatures: {
      tester: null,
      reviewer: null,
      approver: null
    },
    departmentSeal: null,
    securityLevel: '内部公开',
    tableColumnWidths: {
      infoTable: [],
      sampleTable: [],
      equipmentTable: [],
      resultTable: []
    },
    // Template content data (labels, placeholders, etc.)
    templateContentData: {
      companyName: '',
      reportTitle: '',
      recordCode: '',
      placeholders: {}
    },
    // Text styles
    fixedTextStyles: null,
    editableTextStyles: null
  })

  // Dynamic rows for test results and images
  const testResultRows = ref([
    { id: 1, appearance: '', function: '', other: '', conclusion: '', note: '' },
    { id: 2, appearance: '', function: '', other: '', conclusion: '', note: '' },
    { id: 3, appearance: '', function: '', other: '', conclusion: '', note: '' }
  ])
  
  const testImageRows = ref([
    { id: 1, before: [], during: [], after: [] },
    { id: 2, before: [], during: [], after: [] },
    { id: 3, before: [], during: [], after: [] }
  ])

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
        templateSettings.value = {
          logo: data.logo || null,
          signatures: data.signatures || {
            tester: null,
            reviewer: null,
            approver: null
          },
          departmentSeal: data.departmentSeal || null,
          securityLevel: data.securityLevel || '内部公开',
          tableColumnWidths: data.tableColumnWidths || {
            infoTable: [],
            sampleTable: [],
            equipmentTable: [],
            resultTable: []
          },
          templateContentData: data.templateContentData || {
            companyName: '',
            reportTitle: '',
            recordCode: '',
            placeholders: {}
          },
          fixedTextStyles: data.settings?.fixedTextStyles || null,
          editableTextStyles: data.settings?.editableTextStyles || null
        }
        return true
      }
    } catch (error) {
      console.error('Failed to load template settings:', error)
    }
    return false
  }

  const applyTemplateSettings = (settings) => {
    if (settings) {
      templateSettings.value = { ...templateSettings.value, ...settings }
    }
  }

  const updateField = (fieldId, value) => {
    content.value[fieldId] = value
    isDirty.value = true
    scheduleAutoSave()
  }

  const updateFieldFormat = (fieldId, format) => {
    fieldFormats.value[fieldId] = { ...fieldFormats.value[fieldId], ...format }
    isDirty.value = true
    scheduleAutoSave()
  }

  const getFieldFormat = (fieldId) => {
    return fieldFormats.value[fieldId] || null
  }

  const updateTestResultRow = (rowIndex, field, value) => {
    if (testResultRows.value[rowIndex]) {
      testResultRows.value[rowIndex][field] = value
      isDirty.value = true
      scheduleAutoSave()
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
    isDirty.value = true
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
      isDirty.value = true
    } catch {
      // User cancelled
    }
  }

  const addTestImageRows = (count = 1) => {
    const lastId = testImageRows.value.length > 0 
      ? Math.max(...testImageRows.value.map(r => r.id)) 
      : 0
    
    for (let i = 0; i < count; i++) {
      testImageRows.value.push({
        id: lastId + i + 1,
        before: [],
        during: [],
        after: []
      })
    }
    isDirty.value = true
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
      isDirty.value = true
    } catch {
      // User cancelled
    }
  }

  const updateTestImage = (rowIndex, position, images) => {
    if (testImageRows.value[rowIndex]) {
      testImageRows.value[rowIndex][position] = images
      isDirty.value = true
      scheduleAutoSave()
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

  const scheduleAutoSave = () => {
    if (autoSaveTimer.value) {
      clearTimeout(autoSaveTimer.value)
    }
    autoSaveTimer.value = setTimeout(() => {
      autoSave()
    }, 500) // Auto-save after 0.5 second of inactivity
  }

  const autoSave = async () => {
    if (!isDirty.value) return
    
    try {
      const response = await fetch('/api/report/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentDraftId.value,
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
        if (!currentDraftId.value) {
          currentDraftId.value = result.id
        }
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
          currentDraftId.value = draft.id
          reportTitle.value = draft.title || ''
          
          if (draft.content) {
            content.value = draft.content.fields || {}
            fieldFormats.value = draft.content.fieldFormats || {}
            if (draft.content.testResultRows) {
              testResultRows.value = draft.content.testResultRows
            }
            if (draft.content.testImageRows) {
              testImageRows.value = draft.content.testImageRows
            }
          }
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
    testResultRows.value = [
      { id: 1, appearance: '', function: '', other: '', conclusion: '', note: '' },
      { id: 2, appearance: '', function: '', other: '', conclusion: '', note: '' },
      { id: 3, appearance: '', function: '', other: '', conclusion: '', note: '' }
    ]
    testImageRows.value = [
      { id: 1, before: [], during: [], after: [] },
      { id: 2, before: [], during: [], after: [] },
      { id: 3, before: [], during: [], after: [] }
    ]
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
    
    ElMessage.success('已创建新报告')
  }

  const exportPdf = async () => {
    ElMessage.info('正在生成PDF...')
    // PDF export will be implemented in the report editor component
    // This function will be called from the TopNav
    window.dispatchEvent(new CustomEvent('export-pdf'))
  }

  return {
    // State
    currentDraftId,
    templateType,
    reportTitle,
    content,
    fieldFormats,
    selectedFields,
    isDirty,
    isLoading,
    templateData,
    templateSettings,
    testResultRows,
    testImageRows,
    
    // Computed
    hasContent,
    
    // Actions
    loadTemplate,
    loadTemplateSettings,
    applyTemplateSettings,
    updateField,
    updateFieldFormat,
    getFieldFormat,
    updateTestResultRow,
    addTestResultRows,
    deleteTestResultRow,
    addTestImageRows,
    deleteTestImageRow,
    updateTestImage,
    selectField,
    clearSelection,
    autoSave,
    loadAutoSave,
    newReport,
    exportPdf
  }
})
