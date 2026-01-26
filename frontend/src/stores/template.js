import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export const useTemplateStore = defineStore('template', () => {
  // State
  const currentTemplateId = ref(null)
  const templateType = ref('general')
  const templateName = ref('')
  const templateData = ref(null)
  const isLoading = ref(false)
  const isDirty = ref(false)

  // Logo and signature settings
  const logo = ref({
    dataUrl: null,
    size: 100,
    position: { x: 20, y: 10 }
  })

  const signatures = ref({
    tester: { dataUrl: null, size: 15 },
    reviewer: { dataUrl: null, size: 15 },
    approver: { dataUrl: null, size: 15 }
  })

  const departmentSeal = ref({
    dataUrl: null,
    size: 120,
    position: { x: 400, y: 650 },
    opacity: 0.3 // Lower opacity for editing, full opacity for export
  })

  // Text style settings for fixed content
  const fixedTextStyles = ref({
    color: '#000000',
    fontFamily: 'Microsoft YaHei',
    fontSize: 11
  })

  // Text style settings for editable area placeholders
  const editableTextStyles = ref({
    color: '#999999',
    fontFamily: 'Microsoft YaHei',
    fontSize: 11
  })

  // Template data for custom text content
  const templateContentData = ref({
    companyName: '',
    reportTitle: '',
    recordCode: '',
    placeholders: {}
  })

  // Security level selection
  const securityLevel = ref('内部公开')

  // Table column widths configuration
  const tableColumnWidths = ref({
    infoTable: [], // Main info table widths
    sampleTable: [], // Sample information table widths
    equipmentTable: [], // Equipment table widths
    resultTable: [] // Test result table widths
  })

  // Actions
  const loadDefaultTemplate = async (type) => {
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

  const loadCustomTemplate = async (templateId) => {
    isLoading.value = true
    try {
      const response = await fetch(`/api/template/custom/${templateId}`)
      if (response.ok) {
        const data = await response.json()
        currentTemplateId.value = data.id
        templateName.value = data.name
        templateType.value = data.baseType
        
        if (data.logo) logo.value = data.logo
        if (data.signatures) signatures.value = data.signatures
        if (data.departmentSeal) departmentSeal.value = data.departmentSeal
        if (data.settings?.fixedTextStyles) fixedTextStyles.value = data.settings.fixedTextStyles
        if (data.settings?.editableTextStyles) editableTextStyles.value = data.settings.editableTextStyles
        if (data.templateContentData) templateContentData.value = data.templateContentData
        if (data.securityLevel) securityLevel.value = data.securityLevel
        if (data.tableColumnWidths) tableColumnWidths.value = data.tableColumnWidths
      } else {
        throw new Error('Failed to load template')
      }
    } catch (error) {
      console.error('Error loading custom template:', error)
      ElMessage.error('加载自定义模板失败')
    } finally {
      isLoading.value = false
    }
  }

  const uploadLogo = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'logo')
    
    try {
      const response = await fetch('/api/template/upload-image', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        logo.value.dataUrl = result.dataUrl
        isDirty.value = true
        ElMessage.success('Logo上传成功')
      }
    } catch (error) {
      console.error('Logo upload failed:', error)
      ElMessage.error('Logo上传失败')
    }
  }

  const uploadSignature = async (type, file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'signature')
    
    try {
      const response = await fetch('/api/template/upload-image', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        signatures.value[type].dataUrl = result.dataUrl
        isDirty.value = true
        ElMessage.success('签名上传成功')
      }
    } catch (error) {
      console.error('Signature upload failed:', error)
      ElMessage.error('签名上传失败')
    }
  }

  const uploadDepartmentSeal = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'seal')
    
    try {
      const response = await fetch('/api/template/upload-image', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        departmentSeal.value.dataUrl = result.dataUrl
        isDirty.value = true
        ElMessage.success('部门章上传成功')
      }
    } catch (error) {
      console.error('Department seal upload failed:', error)
      ElMessage.error('部门章上传失败')
    }
  }

  const updateLogoSize = (size) => {
    logo.value.size = size
    isDirty.value = true
  }

  const updateLogoPosition = (position) => {
    logo.value.position = position
    isDirty.value = true
  }

  const updateSignatureSize = (type, size) => {
    signatures.value[type].size = size
    isDirty.value = true
  }

  const updateDepartmentSealSize = (size) => {
    departmentSeal.value.size = size
    isDirty.value = true
  }

  const updateDepartmentSealPosition = (position) => {
    departmentSeal.value.position = position
    isDirty.value = true
  }

  const updateFixedTextStyles = (styles) => {
    fixedTextStyles.value = { ...fixedTextStyles.value, ...styles }
    isDirty.value = true
  }

  const updateEditableTextStyles = (styles) => {
    editableTextStyles.value = { ...editableTextStyles.value, ...styles }
    isDirty.value = true
  }

  const updateTemplateData = (field, value) => {
    templateContentData.value[field] = value
    isDirty.value = true
  }

  const updatePlaceholder = (field, value) => {
    if (!templateContentData.value.placeholders) {
      templateContentData.value.placeholders = {}
    }
    templateContentData.value.placeholders[field] = value
    isDirty.value = true
  }

  const updateSecurityLevel = (level) => {
    securityLevel.value = level
    isDirty.value = true
  }

  const updateTableColumnWidths = (tableName, widths) => {
    if (tableColumnWidths.value[tableName]) {
      tableColumnWidths.value[tableName] = [...widths]
      isDirty.value = true
    }
  }

  const saveTemplate = async (silent = false) => {
    const templatePayload = {
      name: templateName.value || '自定义模板',
      baseType: templateType.value,
      settings: {
        fixedTextStyles: fixedTextStyles.value,
        editableTextStyles: editableTextStyles.value
      },
      logo: logo.value,
      signatures: signatures.value,
      departmentSeal: departmentSeal.value,
      templateContentData: templateContentData.value,
      securityLevel: securityLevel.value,
      tableColumnWidths: tableColumnWidths.value
    }

    try {
      const url = currentTemplateId.value 
        ? `/api/template/custom/${currentTemplateId.value}`
        : '/api/template/custom'
      const method = currentTemplateId.value ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templatePayload)
      })
      
      if (response.ok) {
        const result = await response.json()
        currentTemplateId.value = result.id
        isDirty.value = false
        if (!silent) {
          ElMessage.success('模板保存成功')
        }
      }
    } catch (error) {
      console.error('Template save failed:', error)
      if (!silent) {
        ElMessage.error('模板保存失败')
      }
    }
  }

  const exportTemplate = async () => {
    if (!currentTemplateId.value) {
      await saveTemplate()
    }
    
    try {
      window.open(`/api/template/export/${currentTemplateId.value}`, '_blank')
      ElMessage.success('模板导出成功')
    } catch (error) {
      console.error('Template export failed:', error)
      ElMessage.error('模板导出失败')
    }
  }

  const importTemplate = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch('/api/template/import', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        await loadCustomTemplate(result.id)
        ElMessage.success('模板导入成功')
      } else {
        const error = await response.json()
        ElMessage.error(error.error || '模板导入失败')
      }
    } catch (error) {
      console.error('Template import failed:', error)
      ElMessage.error('模板导入失败')
    }
  }

  const resetToDefault = async () => {
    // Delete all custom templates of current type from backend
    try {
      const response = await fetch(`/api/template/reset/${templateType.value}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error('Failed to reset templates on server')
      }
    } catch (error) {
      console.error('Error resetting templates on server:', error)
      // Continue with local reset even if server reset fails
    }
    
    // Reset local state
    currentTemplateId.value = null
    templateName.value = ''
    logo.value = { dataUrl: null, size: 100, position: { x: 20, y: 10 } }
    signatures.value = {
      tester: { dataUrl: null, size: 15 },
      reviewer: { dataUrl: null, size: 15 },
      approver: { dataUrl: null, size: 15 }
    }
    departmentSeal.value = {
      dataUrl: null,
      size: 120,
      position: { x: 400, y: 650 },
      opacity: 0.3
    }
    fixedTextStyles.value = {
      color: '#000000',
      fontFamily: 'Microsoft YaHei',
      fontSize: 11
    }
    editableTextStyles.value = {
      color: '#999999',
      fontFamily: 'Microsoft YaHei',
      fontSize: 11
    }
    templateContentData.value = {
      companyName: '',
      reportTitle: '',
      recordCode: '',
      placeholders: {}
    }
    securityLevel.value = '内部公开'
    tableColumnWidths.value = {
      infoTable: [],
      sampleTable: [],
      equipmentTable: [],
      resultTable: []
    }
    isDirty.value = false
  }

  return {
    // State
    currentTemplateId,
    templateType,
    templateName,
    templateData,
    isLoading,
    isDirty,
    logo,
    signatures,
    departmentSeal,
    fixedTextStyles,
    editableTextStyles,
    templateContentData,
    securityLevel,
    tableColumnWidths,
    
    // Actions
    loadDefaultTemplate,
    loadCustomTemplate,
    uploadLogo,
    uploadSignature,
    uploadDepartmentSeal,
    updateLogoSize,
    updateLogoPosition,
    updateSignatureSize,
    updateDepartmentSealSize,
    updateDepartmentSealPosition,
    updateFixedTextStyles,
    updateEditableTextStyles,
    updateTemplateData,
    updatePlaceholder,
    updateSecurityLevel,
    updateTableColumnWidths,
    saveTemplate,
    exportTemplate,
    importTemplate,
    resetToDefault
  }
})
