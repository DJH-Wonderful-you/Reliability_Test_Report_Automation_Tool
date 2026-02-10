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
    default: 11
  },
  fontFamily: {
    type: String,
    default: 'Microsoft YaHei'
  },
  color: {
    type: String,
    default: '#000000'
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

// Template format state (font family and size from template)
const templateFormat = ref({
  fontSize: props.fontSize,
  fontFamily: props.fontFamily
})

// Placeholder format state (styles for placeholder text from template)
const placeholderFormat = ref({
  color: '#999',
  fontWeight: 'normal',
  fontStyle: 'italic',
  textDecoration: 'none',
  textAlign: props.textAlign || 'center'  // Default to passed textAlign prop or center
})

// User-modified format state (only for actual content styling in report editor)
const userFormat = ref({
  color: props.color,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  textAlign: props.textAlign
})

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
  fontSize: `${templateFormat.value.fontSize}px`,
  fontFamily: templateFormat.value.fontFamily,
  color: userFormat.value.color,
  fontWeight: userFormat.value.fontWeight,
  fontStyle: userFormat.value.fontStyle,
  textDecoration: userFormat.value.textDecoration,
  textAlign: userFormat.value.textAlign
}))

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
        // Apply placeholder style from placeholderFormat including textAlign
        Object.assign(fieldRef.value.style, {
          color: placeholderFormat.value.color,
          fontStyle: placeholderFormat.value.fontStyle,
          fontWeight: placeholderFormat.value.fontWeight,
          textDecoration: placeholderFormat.value.textDecoration,
          textAlign: placeholderFormat.value.textAlign
        })
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
  
  // Update template format (font family and size) - these apply to both placeholder and content
  if (format.fontFamily !== undefined) templateFormat.value.fontFamily = format.fontFamily
  if (format.fontSize !== undefined) templateFormat.value.fontSize = format.fontSize
  
  // Update user format (other styling properties) - these only apply to actual user input
  if (format.color !== undefined) userFormat.value.color = format.color
  if (format.fontWeight !== undefined) userFormat.value.fontWeight = format.fontWeight
  if (format.fontStyle !== undefined) userFormat.value.fontStyle = format.fontStyle
  if (format.textDecoration !== undefined) userFormat.value.textDecoration = format.textDecoration
  if (format.textAlign !== undefined) userFormat.value.textAlign = format.textAlign
  
  // Save format to store (only for user input styling, not placeholder)
  reportStore.updateFieldFormat(props.fieldId, {
    fontFamily: templateFormat.value.fontFamily,
    fontSize: templateFormat.value.fontSize,
    // Note: color, fontWeight, fontStyle, textDecoration, textAlign are for user input only
    // and are NOT saved to affect placeholder styling
  })
}

// Watch for external value changes (only update when not focused)
watch(() => props.value, (newValue, oldValue) => {
  if (!isFocused.value && !isComposing.value && fieldRef.value) {
    if (newValue) {
      setContent(newValue)
    } else {
      setContent(props.placeholder)
      // Apply placeholder style from placeholderFormat including textAlign
      Object.assign(fieldRef.value.style, {
        color: placeholderFormat.value.color,
        fontStyle: placeholderFormat.value.fontStyle,
        fontWeight: placeholderFormat.value.fontWeight,
        textDecoration: placeholderFormat.value.textDecoration,
        textAlign: placeholderFormat.value.textAlign
      })
    }
  }
})

onMounted(() => {
  window.addEventListener('format-change', handleFormatChange)
  
  // Load saved format from store
  const savedFormat = reportStore.getFieldFormat(props.fieldId)
  if (savedFormat) {
    // Apply font family and size from template
    if (savedFormat.fontFamily) templateFormat.value.fontFamily = savedFormat.fontFamily
    if (savedFormat.fontSize) templateFormat.value.fontSize = savedFormat.fontSize
    // Apply placeholder styling from template (for placeholder text display)
    if (savedFormat.color) placeholderFormat.value.color = savedFormat.color
    if (savedFormat.fontWeight) placeholderFormat.value.fontWeight = savedFormat.fontWeight
    if (savedFormat.fontStyle) placeholderFormat.value.fontStyle = savedFormat.fontStyle
    if (savedFormat.textDecoration) placeholderFormat.value.textDecoration = savedFormat.textDecoration
    // Use saved textAlign or fall back to component's default
    placeholderFormat.value.textAlign = savedFormat.textAlign || props.textAlign
  } else {
    // No saved format - use defaults with component's textAlign setting
    placeholderFormat.value.textAlign = props.textAlign
  }
  
  // Set initial content
  if (fieldRef.value) {
    if (props.value) {
      setContent(props.value)
    } else {
      setContent(props.placeholder)
      // Apply placeholder style from placeholderFormat
      Object.assign(fieldRef.value.style, {
        color: placeholderFormat.value.color,
        fontStyle: placeholderFormat.value.fontStyle,
        fontWeight: placeholderFormat.value.fontWeight,
        textDecoration: placeholderFormat.value.textDecoration
      })
    }
  }
})

// Default placeholder style values
const defaultPlaceholderStyle = {
  color: '#999',
  fontWeight: 'normal',
  fontStyle: 'italic',
  textDecoration: 'none',
  textAlign: props.textAlign || 'left'  // Use passed textAlign or left as default
}

// Default template format values
const defaultTemplateFormat = {
  fontSize: 11,
  fontFamily: 'Microsoft YaHei'
}

// Watch for fieldFormats changes (e.g., when template is loaded after mount)
watch(
  () => reportStore.getFieldFormat(props.fieldId),
  (newFormat) => {
    if (!isFocused.value) {
      if (newFormat) {
        // Apply font family and size from template
        templateFormat.value.fontFamily = newFormat.fontFamily || defaultTemplateFormat.fontFamily
        templateFormat.value.fontSize = newFormat.fontSize || defaultTemplateFormat.fontSize
        // Apply placeholder styling from template (for placeholder text display)
        placeholderFormat.value.color = newFormat.color || defaultPlaceholderStyle.color
        placeholderFormat.value.fontWeight = newFormat.fontWeight || defaultPlaceholderStyle.fontWeight
        placeholderFormat.value.fontStyle = newFormat.fontStyle || defaultPlaceholderStyle.fontStyle
        placeholderFormat.value.textDecoration = newFormat.textDecoration || defaultPlaceholderStyle.textDecoration
        // Use newFormat textAlign or fall back to component's default
        placeholderFormat.value.textAlign = newFormat.textAlign || props.textAlign
      } else {
        // No format found - reset to defaults (template was reset)
        templateFormat.value.fontFamily = props.fontFamily || defaultTemplateFormat.fontFamily
        templateFormat.value.fontSize = props.fontSize || defaultTemplateFormat.fontSize
        placeholderFormat.value.color = defaultPlaceholderStyle.color
        placeholderFormat.value.fontWeight = defaultPlaceholderStyle.fontWeight
        placeholderFormat.value.fontStyle = defaultPlaceholderStyle.fontStyle
        placeholderFormat.value.textDecoration = defaultPlaceholderStyle.textDecoration
        // Reset to component's textAlign setting
        placeholderFormat.value.textAlign = props.textAlign
      }
      
      // If showing placeholder, update DOM style
      if (!props.value && fieldRef.value) {
        Object.assign(fieldRef.value.style, {
          color: placeholderFormat.value.color,
          fontStyle: placeholderFormat.value.fontStyle,
          fontWeight: placeholderFormat.value.fontWeight,
          textDecoration: placeholderFormat.value.textDecoration,
          textAlign: placeholderFormat.value.textAlign  // Apply textAlign to DOM
        })
      }
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
