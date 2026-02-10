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

  // Apply template field formats (from template editor)
  // This will completely replace existing formats with template formats
  const applyTemplateFieldFormats = (templateFieldFormats) => {
    // Create a new object with template formats (or empty if template has no formats)
    const newFormats = {}
    if (templateFieldFormats && Object.keys(templateFieldFormats).length > 0) {
      Object.keys(templateFieldFormats).forEach(fieldId => {
        newFormats[fieldId] = { ...templateFieldFormats[fieldId] }
      })
    }
    // Replace the entire object to trigger reactivity (even if empty, to reset to defaults)
    fieldFormats.value = newFormats
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
    scheduleAutoSave()
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

  // Batch delete test result rows
  const batchDeleteTestResultRows = (indices) => {
    if (indices.length >= testResultRows.value.length) {
      ElMessage.warning('不能删除所有行，至少保留一行')
      return
    }
    
    // Sort indices in descending order to avoid index shifting
    indices.sort((a, b) => b - a)
    
    for (const index of indices) {
      if (index >= 0 && index < testResultRows.value.length) {
        testResultRows.value.splice(index, 1)
      }
    }
    isDirty.value = true
    ElMessage.success(`已删除 ${indices.length} 行`)
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
    scheduleAutoSave()
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

  // Batch delete test image rows
  const batchDeleteTestImageRows = (indices) => {
    if (indices.length >= testImageRows.value.length) {
      ElMessage.warning('不能删除所有行，至少保留一行')
      return
    }
    
    // Sort indices in descending order to avoid index shifting
    indices.sort((a, b) => b - a)
    
    for (const index of indices) {
      if (index >= 0 && index < testImageRows.value.length) {
        testImageRows.value.splice(index, 1)
      }
    }
    isDirty.value = true
    ElMessage.success(`已删除 ${indices.length} 行`)
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
          // Apply template settings
          applyTemplateSettings({
            logo: data.logo,
            signatures: data.signatures,
            departmentSeal: data.departmentSeal,
            securityLevel: data.securityLevel,
            tableColumnWidths: data.tableColumnWidths,
            templateContentData: data.templateContentData || {
              companyName: '',
              reportTitle: '',
              recordCode: '',
              placeholders: {}
            },
            fixedTextStyles: data.settings?.fixedTextStyles || null,
            editableTextStyles: data.settings?.editableTextStyles || null
          })
          
          // Apply template field formats (styles from template editor)
          // Always replace fieldFormats, even if empty (to reset to defaults)
          applyTemplateFieldFormats(data.fieldFormats || {})
        }
      }
    } catch (error) {
      console.error('Failed to load applied template settings:', error)
    }
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
        
        // Load draft content
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
        
        // Update draft metadata
        currentDraftId.value = draft.id
        reportTitle.value = draft.title || ''
        templateType.value = draft.templateType || 'general'
        
        isDirty.value = false
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
