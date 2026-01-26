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
    default: 'center'
  }
})

const emit = defineEmits(['update'])

const reportStore = useReportStore()
const fieldRef = ref(null)
const isFocused = ref(false)
const isComposing = ref(false) // Track IME composition state

// Local format state
const localFormat = ref({
  fontSize: props.fontSize,
  fontFamily: props.fontFamily,
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

// Style for placeholder text (uses default/template styles)
const placeholderStyle = computed(() => ({
  fontSize: `${props.fontSize}px`,
  fontFamily: props.fontFamily,
  color: '#999',
  fontWeight: 'normal',
  fontStyle: 'italic',
  textDecoration: 'none',
  textAlign: 'left'
}))

// Style for actual content (uses user-modified styles)
const fieldStyle = computed(() => ({
  fontSize: `${localFormat.value.fontSize}px`,
  fontFamily: localFormat.value.fontFamily,
  color: localFormat.value.color,
  fontWeight: localFormat.value.fontWeight,
  fontStyle: localFormat.value.fontStyle,
  textDecoration: localFormat.value.textDecoration,
  textAlign: localFormat.value.textAlign
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
  // If showing placeholder, clear it and set actual content
  if (!props.value) {
    fieldRef.value.innerHTML = ''
    // Apply user format style when focused (even if empty)
    Object.assign(fieldRef.value.style, {
      fontSize: `${localFormat.value.fontSize}px`,
      fontFamily: localFormat.value.fontFamily,
      color: localFormat.value.color,
      fontWeight: localFormat.value.fontWeight,
      fontStyle: localFormat.value.fontStyle,
      textDecoration: localFormat.value.textDecoration,
      textAlign: localFormat.value.textAlign
    })
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
  
  // If empty, show placeholder
  if (!text) {
    nextTick(() => {
      if (fieldRef.value && !isFocused.value) {
        fieldRef.value.innerHTML = textToHtml(props.placeholder)
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

// Listen for format changes from toolbar
const handleFormatChange = (e) => {
  if (!isSelected.value) return
  const format = e.detail
  Object.assign(localFormat.value, format)
  // Save format to store
  reportStore.updateFieldFormat(props.fieldId, format)
}

// Watch for external value changes (only update when not focused)
watch(() => props.value, (newValue, oldValue) => {
  if (!isFocused.value && !isComposing.value && fieldRef.value) {
    if (newValue) {
      setContent(newValue)
    } else {
      setContent(props.placeholder)
    }
  }
})

onMounted(() => {
  window.addEventListener('format-change', handleFormatChange)
  
  // Load saved format from store
  const savedFormat = reportStore.getFieldFormat(props.fieldId)
  if (savedFormat) {
    Object.assign(localFormat.value, savedFormat)
  }
  
  // Set initial content
  if (fieldRef.value) {
    if (props.value) {
      setContent(props.value)
    } else {
      setContent(props.placeholder)
    }
  }
})

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
