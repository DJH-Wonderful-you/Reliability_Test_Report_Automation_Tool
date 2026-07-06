import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  DEFAULT_TEMPLATE_SECURITY_LEVEL,
  createDefaultTableColumnWidths,
  normalizeTableColumnWidths
} from '@/constants/generalTemplateDefaults'

const createDefaultLogo = () => ({
  dataUrl: null,
  size: 100,
  position: { x: 20, y: 10 }
})

const createDefaultSignatures = () => ({
  tester: { dataUrl: null, size: 15 },
  reviewer: { dataUrl: null, size: 15 },
  approver: { dataUrl: null, size: 15 }
})

const createDefaultDepartmentSeal = () => ({
  dataUrl: null,
  size: 120,
  position: { x: 400, y: 650 },
  opacity: 0.3
})

const createDefaultFixedTextStyles = () => ({
  color: '#000000',
  fontFamily: 'Microsoft YaHei',
  fontSize: 11
})

const createDefaultEditableTextStyles = () => ({
  color: '#999999',
  fontFamily: 'Microsoft YaHei',
  fontSize: 11
})

const createDefaultTemplateContentData = () => ({
  companyName: '',
  reportTitle: '',
  recordCode: '',
  placeholders: {}
})

const normalizeTemplateState = (type = 'general', data = {}) => {
  const defaultLogo = createDefaultLogo()
  const defaultSignatures = createDefaultSignatures()
  const defaultDepartmentSeal = createDefaultDepartmentSeal()
  const defaultFixedTextStyles = createDefaultFixedTextStyles()
  const defaultEditableTextStyles = createDefaultEditableTextStyles()
  const defaultTemplateContentData = createDefaultTemplateContentData()

  return {
    logo: {
      ...defaultLogo,
      ...(data.logo || {}),
      position: {
        ...defaultLogo.position,
        ...(data.logo?.position || {})
      }
    },
    signatures: Object.fromEntries(
      Object.keys(defaultSignatures).map((key) => [
        key,
        {
          ...defaultSignatures[key],
          ...(data.signatures?.[key] || {})
        }
      ])
    ),
    departmentSeal: {
      ...defaultDepartmentSeal,
      ...(data.departmentSeal || {}),
      position: {
        ...defaultDepartmentSeal.position,
        ...(data.departmentSeal?.position || {})
      }
    },
    fixedTextStyles: {
      ...defaultFixedTextStyles,
      ...(data.settings?.fixedTextStyles || data.fixedTextStyles || {})
    },
    editableTextStyles: {
      ...defaultEditableTextStyles,
      ...(data.settings?.editableTextStyles || data.editableTextStyles || {})
    },
    templateContentData: {
      ...defaultTemplateContentData,
      ...(data.templateContentData || {}),
      placeholders: {
        ...defaultTemplateContentData.placeholders,
        ...(data.templateContentData?.placeholders || {})
      }
    },
    securityLevel: data.securityLevel || DEFAULT_TEMPLATE_SECURITY_LEVEL,
    tableColumnWidths: normalizeTableColumnWidths(type, data.tableColumnWidths),
    fieldFormats: { ...(data.fieldFormats || {}) }
  }
}

const sanitizeTemplateFileName = (name) => {
  const safeName = String(name || 'template')
    .replace(/[\\/:*?"<>|]/g, '_')
    .trim()

  return safeName || 'template'
}

const ensureJsonFileName = (name) => {
  const safeName = sanitizeTemplateFileName(name)
  return safeName.toLowerCase().endsWith('.json') ? safeName : `${safeName}.json`
}

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => {
    window.URL.revokeObjectURL(url)
  }, 1000)
}

const saveBlobWithPicker = async (blob, filename) => {
  if (!window.showSaveFilePicker) {
    downloadBlob(blob, filename)
    return 'download'
  }

  const fileHandle = await window.showSaveFilePicker({
    suggestedName: filename,
    types: [
      {
        description: 'JSON template file',
        accept: {
          'application/json': ['.json']
        }
      }
    ]
  })
  const writable = await fileHandle.createWritable()
  await writable.write(blob)
  await writable.close()
  return 'picker'
}

const createJsonSaveFileHandle = async (filename) => {
  if (!window.showSaveFilePicker) {
    return null
  }

  return window.showSaveFilePicker({
    suggestedName: filename,
    types: [
      {
        description: 'JSON template file',
        accept: {
          'application/json': ['.json']
        }
      }
    ]
  })
}

const writeBlobToFileHandle = async (fileHandle, blob) => {
  const writable = await fileHandle.createWritable()
  await writable.write(blob)
  await writable.close()
}

export const useTemplateStore = defineStore('template', () => {
  // State
  const currentTemplateId = ref(null)
  const templateType = ref('general')
  const templateName = ref('')
  const templateData = ref(null)
  const isLoading = ref(false)
  const isDirty = ref(false)

  // Logo and signature settings
  const logo = ref(createDefaultLogo())

  const signatures = ref(createDefaultSignatures())

  const departmentSeal = ref(createDefaultDepartmentSeal())

  // Text style settings for fixed content
  const fixedTextStyles = ref(createDefaultFixedTextStyles())

  // Text style settings for editable area placeholders
  const editableTextStyles = ref(createDefaultEditableTextStyles())

  // Template data for custom text content
  const templateContentData = ref(createDefaultTemplateContentData())

  // Security level selection
  const securityLevel = ref(DEFAULT_TEMPLATE_SECURITY_LEVEL)

  // Table column widths configuration
  const tableColumnWidths = ref(createDefaultTableColumnWidths('general'))

  // Individual field formats for each text element
  const fieldFormats = ref({})

  const applyTemplateState = (type, data = {}) => {
    const nextState = normalizeTemplateState(type, data)
    logo.value = nextState.logo
    signatures.value = nextState.signatures
    departmentSeal.value = nextState.departmentSeal
    fixedTextStyles.value = nextState.fixedTextStyles
    editableTextStyles.value = nextState.editableTextStyles
    templateContentData.value = nextState.templateContentData
    securityLevel.value = nextState.securityLevel
    tableColumnWidths.value = nextState.tableColumnWidths
    fieldFormats.value = nextState.fieldFormats
  }

  // Actions
  const loadDefaultTemplate = async (type) => {
    isLoading.value = true
    try {
      const response = await fetch(`/api/template/default/${type}`)
      if (response.ok) {
        templateData.value = await response.json()
        templateType.value = type
        currentTemplateId.value = null
        templateName.value = ''
        applyTemplateState(type)
        isDirty.value = false
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
        applyTemplateState(data.baseType, data)
        isDirty.value = false
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

  const updateFieldFormat = (fieldId, format) => {
    fieldFormats.value[fieldId] = { ...fieldFormats.value[fieldId], ...format }
    isDirty.value = true
  }

  const getFieldFormat = (fieldId) => {
    return fieldFormats.value[fieldId] || null
  }

  const saveTemplate = async (silent = false, forReportApply = false) => {
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
      tableColumnWidths: tableColumnWidths.value,
      fieldFormats: fieldFormats.value
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
        // 只有当不是为了应用到报告时才清除脏标记
        if (!forReportApply) {
          isDirty.value = false
        }
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

  // 专门用于应用到报告编辑的保存方法
  const exportTemplate = async () => {
    try {
      const defaultFileName = ensureJsonFileName(
        templateName.value || (currentTemplateId.value ? `template_${currentTemplateId.value}` : 'custom_template')
      )
      const fileHandle = await createJsonSaveFileHandle(defaultFileName)

      await saveTemplate(true)
      if (!currentTemplateId.value) {
        throw new Error('Template save failed')
      }

      const response = await fetch(`/api/template/export/${currentTemplateId.value}`)
      if (!response.ok) {
        throw new Error('Template export failed')
      }

      const blob = await response.blob()
      if (fileHandle) {
        await writeBlobToFileHandle(fileHandle, blob)
      } else {
        await saveBlobWithPicker(blob, defaultFileName)
      }

      ElMessage.success('模板导出成功')
    } catch (error) {
      if (error?.name === 'AbortError') {
        return
      }
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
    applyTemplateState(templateType.value)
    isDirty.value = true // 设置为脏状态，表示需要保存
    
    // 立即保存重置后的默认模板到后端
    await saveTemplate(true) // silent mode
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
    fieldFormats,
    
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
    updateFieldFormat,
    getFieldFormat,
    saveTemplate,
    exportTemplate,
    importTemplate,
    resetToDefault
  }
})
