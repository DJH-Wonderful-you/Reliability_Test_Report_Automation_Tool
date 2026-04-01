<template>
  <div 
    class="editable-field"
    :class="{ 
      'selected': isSelected, 
      'placeholder': showPlaceholder,
      'multiline': multiline
    }"
    :style="showPlaceholder ? placeholderStyle : fieldStyle"
    :contenteditable="true"
    :data-field-id="fieldId"
    @focus="handleFocus"
    @blur="handleBlur"
    @click="handleClick"
    @keydown="handleKeydown"
    @compositionstart="handleCompositionStart"
    @compositionend="handleCompositionEnd"
    ref="fieldRef"
  ></div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useReportStore } from '@/stores/report'

const props = defineProps({
  fieldId: {
    type: String,
    required: true
  },
  value: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容'
  },
  multiline: {
    type: Boolean,
    default: true
  },
  fontSize: {
    type: Number,
    default: null
  },
  fontFamily: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: ''
  },
  placeholderColor: {
    type: String,
    default: ''
  },
  textAlign: {
    type: String,
    default: 'left'
  }
})

const emit = defineEmits(['update'])

const reportStore = useReportStore()
const fieldRef = ref(null)
const isFocused = ref(false)
const isComposing = ref(false) // Track IME composition state

const getDefaultTemplateFormat = () => ({
  fontSize: props.fontSize ?? reportStore.templateSettings.editableTextStyles?.fontSize ?? 11,
  fontFamily: props.fontFamily || reportStore.templateSettings.editableTextStyles?.fontFamily || 'Microsoft YaHei'
})

const getDefaultPlaceholderStyle = () => ({
  color: props.placeholderColor || reportStore.templateSettings.editableTextStyles?.color || '#999',
  fontWeight: 'normal',
  fontStyle: 'italic',
  textDecoration: 'none',
  textAlign: props.textAlign || 'left'
})

const getDefaultUserFormat = () => ({
  fontSize: templateFormat.value.fontSize,
  fontFamily: templateFormat.value.fontFamily,
  color: props.color || '#000000',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  textAlign: props.textAlign
})

// Template format state (font family and size from template)
const templateFormat = ref(getDefaultTemplateFormat())

// Placeholder format state (styles for placeholder text from template)
const placeholderFormat = ref(getDefaultPlaceholderStyle())

// User-modified format state (only for actual content styling in report editor)
const userFormat = ref(getDefaultUserFormat())

// Show placeholder when no value and not focused
const showPlaceholder = computed(() => !props.value && !isFocused.value)

const isSelected = computed(() => {
  return reportStore.selectedFields.includes(props.fieldId)
})

// Style for placeholder text - uses template font settings and template placeholder styling
const placeholderStyle = computed(() => ({
  fontSize: `${templateFormat.value.fontSize}px`,
  fontFamily: templateFormat.value.fontFamily,
  color: placeholderFormat.value.color,
  fontWeight: placeholderFormat.value.fontWeight,
  fontStyle: placeholderFormat.value.fontStyle,
  textDecoration: placeholderFormat.value.textDecoration,
  textAlign: placeholderFormat.value.textAlign
}))

// Style for actual content - uses template font settings + fixed defaults for other properties
const fieldStyle = computed(() => ({
  fontSize: `${userFormat.value.fontSize}px`,
  fontFamily: userFormat.value.fontFamily,
  color: userFormat.value.color,
  fontWeight: userFormat.value.fontWeight,
  fontStyle: userFormat.value.fontStyle,
  textDecoration: userFormat.value.textDecoration,
  textAlign: userFormat.value.textAlign
}))

const syncPlaceholderDomStyle = () => {
  if (!fieldRef.value) return

  Object.assign(fieldRef.value.style, {
    fontSize: `${templateFormat.value.fontSize}px`,
    fontFamily: templateFormat.value.fontFamily,
    color: placeholderFormat.value.color,
    fontStyle: placeholderFormat.value.fontStyle,
    fontWeight: placeholderFormat.value.fontWeight,
    textDecoration: placeholderFormat.value.textDecoration,
    textAlign: placeholderFormat.value.textAlign
  })
}

const applyTemplateFieldFormat = (savedFormat) => {
  const defaultTemplateFormat = getDefaultTemplateFormat()
  const defaultPlaceholderStyle = getDefaultPlaceholderStyle()

  if (savedFormat) {
    templateFormat.value.fontFamily = savedFormat.fontFamily || defaultTemplateFormat.fontFamily
    templateFormat.value.fontSize = savedFormat.fontSize || defaultTemplateFormat.fontSize
    placeholderFormat.value.color = savedFormat.color || defaultPlaceholderStyle.color
    placeholderFormat.value.fontWeight = savedFormat.fontWeight || defaultPlaceholderStyle.fontWeight
    placeholderFormat.value.fontStyle = savedFormat.fontStyle || defaultPlaceholderStyle.fontStyle
    placeholderFormat.value.textDecoration = savedFormat.textDecoration || defaultPlaceholderStyle.textDecoration
    placeholderFormat.value.textAlign = savedFormat.textAlign || defaultPlaceholderStyle.textAlign
    return
  }

  templateFormat.value = defaultTemplateFormat
  placeholderFormat.value = defaultPlaceholderStyle
}

const applyUserFieldFormat = (savedFormat) => {
  const defaultUserFormat = getDefaultUserFormat()

  if (savedFormat) {
    userFormat.value.fontFamily = savedFormat.fontFamily || defaultUserFormat.fontFamily
    userFormat.value.fontSize = savedFormat.fontSize || defaultUserFormat.fontSize
    userFormat.value.color = savedFormat.color || defaultUserFormat.color
    userFormat.value.fontWeight = savedFormat.fontWeight || defaultUserFormat.fontWeight
    userFormat.value.fontStyle = savedFormat.fontStyle || defaultUserFormat.fontStyle
    userFormat.value.textDecoration = savedFormat.textDecoration || defaultUserFormat.textDecoration
    userFormat.value.textAlign = savedFormat.textAlign || defaultUserFormat.textAlign
    return
  }

  userFormat.value = defaultUserFormat
}

// Convert text with newlines to HTML for display
const textToHtml = (text) => {
  if (!text) return ''
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.replace(/\n/g, '<br>')
}

// Convert HTML to text preserving line breaks
const htmlToText = (html) => {
  if (!html) return ''
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div><div>/gi, '\n')
    .replace(/<div>/gi, '\n')
    .replace(/<\/div>/gi, '')
    .replace(/<\/p><p>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '')
  text = text.replace(/<[^>]*>/g, '')
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  text = textarea.value
  if (text.startsWith('\n')) {
    text = text.substring(1)
  }
  return text
}

// Set content without triggering reactivity issues
const setContent = (text) => {
  if (!fieldRef.value) return
  if (text) {
    fieldRef.value.innerHTML = textToHtml(text)
  } else {
    fieldRef.value.innerHTML = ''
  }
}

// Handle IME composition start (Chinese input)
const handleCompositionStart = () => {
  isComposing.value = true
}

// Handle IME composition end
const handleCompositionEnd = () => {
  isComposing.value = false
}

const handleFocus = () => {
  isFocused.value = true
  // If showing placeholder, clear it to allow user input
  if (!props.value) {
    fieldRef.value.innerHTML = ''
    // Note: Don't directly modify DOM style here - let Vue's :style binding handle it
    // The style will automatically switch from placeholderStyle to fieldStyle
    // because isFocused changes showPlaceholder computed value
  }
}

const handleBlur = () => {
  isFocused.value = false
  
  // Don't process if still composing
  if (isComposing.value) return
  
  const html = fieldRef.value?.innerHTML || ''
  const text = htmlToText(html).trim()
  
  // Update if value changed
  if (text !== props.value) {
    emit('update', text)
  }
  
  // If empty, show placeholder with proper styling
  if (!text) {
    nextTick(() => {
      if (fieldRef.value && !isFocused.value) {
        fieldRef.value.innerHTML = textToHtml(props.placeholder)
        syncPlaceholderDomStyle()
      }
    })
  }
}

const handleClick = (e) => {
  const multiSelect = e.ctrlKey || e.metaKey
  reportStore.selectField(props.fieldId, multiSelect)
}

const handleKeydown = (e) => {
  if (e.key === 'Enter') {
    if (props.multiline) {
      // Allow multiline: insert line break
      e.preventDefault()
      
      // Use insertHTML for better cross-browser support
      const selection = window.getSelection()
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        
        // Insert <br> and a zero-width space to ensure cursor moves
        const br = document.createElement('br')
        range.insertNode(br)
        
        // Move cursor after the <br>
        range.setStartAfter(br)
        range.setEndAfter(br)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    } else {
      // Single line: blur on enter
      e.preventDefault()
      fieldRef.value?.blur()
    }
  }
}

// Listen for format changes from toolbar (user modifications in report editor)
// These changes only affect actual user input content, NOT placeholder text
const handleFormatChange = (e) => {
  if (!isSelected.value) return
  const format = e.detail
  
  // Report editor formatting applies only to actual user content and is fully autosaved.
  if (format.fontFamily !== undefined) userFormat.value.fontFamily = format.fontFamily
  if (format.fontSize !== undefined) userFormat.value.fontSize = format.fontSize
  if (format.color !== undefined) userFormat.value.color = format.color
  if (format.fontWeight !== undefined) userFormat.value.fontWeight = format.fontWeight
  if (format.fontStyle !== undefined) userFormat.value.fontStyle = format.fontStyle
  if (format.textDecoration !== undefined) userFormat.value.textDecoration = format.textDecoration
  if (format.textAlign !== undefined) userFormat.value.textAlign = format.textAlign
  
  // Save the full content style to report autosave state.
  reportStore.updateFieldFormat(props.fieldId, {
    fontFamily: userFormat.value.fontFamily,
    fontSize: userFormat.value.fontSize,
    color: userFormat.value.color,
    fontWeight: userFormat.value.fontWeight,
    fontStyle: userFormat.value.fontStyle,
    textDecoration: userFormat.value.textDecoration,
    textAlign: userFormat.value.textAlign
  })
}

// Watch for external value changes (only update when not focused)
watch(() => props.value, (newValue, oldValue) => {
  if (!isFocused.value && !isComposing.value && fieldRef.value) {
    if (newValue) {
      setContent(newValue)
    } else {
      setContent(props.placeholder)
      syncPlaceholderDomStyle()
    }
  }
})

onMounted(() => {
  window.addEventListener('format-change', handleFormatChange)
  
  applyTemplateFieldFormat(reportStore.getTemplateFieldFormat(props.fieldId))
  applyUserFieldFormat(reportStore.getReportFieldFormat(props.fieldId))
  
  // Set initial content
  if (fieldRef.value) {
    if (props.value) {
      setContent(props.value)
    } else {
      setContent(props.placeholder)
      syncPlaceholderDomStyle()
    }
  }
})

// Watch for template field format changes (e.g., when applied template styles load after mount)
watch(
  () => reportStore.getTemplateFieldFormat(props.fieldId),
  (newFormat) => {
    if (!isFocused.value) {
      applyTemplateFieldFormat(newFormat)
      applyUserFieldFormat(reportStore.getReportFieldFormat(props.fieldId))

      if (!props.value && fieldRef.value) {
        syncPlaceholderDomStyle()
      }
    }
  },
  { deep: true }
)

watch(
  () => reportStore.getReportFieldFormat(props.fieldId),
  (newFormat) => {
    if (!isFocused.value) {
      applyUserFieldFormat(newFormat)
    }
  },
  { deep: true }
)

watch(
  () => reportStore.templateSettings.editableTextStyles,
  () => {
    if (isFocused.value || reportStore.getTemplateFieldFormat(props.fieldId)) {
      return
    }

    applyTemplateFieldFormat(null)
    applyUserFieldFormat(reportStore.getReportFieldFormat(props.fieldId))

    if (!props.value && fieldRef.value) {
      syncPlaceholderDomStyle()
    }
  },
  { deep: true }
)

onUnmounted(() => {
  window.removeEventListener('format-change', handleFormatChange)
})
</script>

<style lang="scss" scoped>
.editable-field {
  min-height: 1.5em;
  padding: 2px 4px;
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: text;
  transition: all 0.2s;
  outline: none;
  word-break: break-word;
  white-space: pre-wrap;
  
  &:hover {
    background-color: rgba(64, 158, 255, 0.05);
    border-color: rgba(64, 158, 255, 0.3);
  }
  
  &:focus {
    background-color: white;
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }
  
  &.selected {
    background-color: rgba(64, 158, 255, 0.1);
    border-color: #409eff;
  }
  
  &.placeholder {
    color: #999;
    font-style: italic;
  }
  
  &.multiline {
    min-height: 3em;
  }
}
</style>
