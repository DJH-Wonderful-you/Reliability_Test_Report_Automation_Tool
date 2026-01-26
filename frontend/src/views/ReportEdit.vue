<template>
  <div 
    class="report-edit-container"
    @mousedown="startSelection"
    @mousemove="updateSelection"
    @mouseup="endSelection"
    ref="containerRef"
  >
    <!-- Format Toolbar -->
    <Toolbar />
    
    <!-- Report Content -->
    <div class="report-content">
      <router-view />
    </div>
    
    <!-- Selection Box -->
    <div 
      v-if="isSelecting" 
      class="selection-box"
      :style="selectionBoxStyle"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Toolbar from '@/components/layout/Toolbar.vue'
import { useReportStore } from '@/stores/report'

const reportStore = useReportStore()
const containerRef = ref(null)

// Selection box state
const isSelecting = ref(false)
const selectionStart = ref({ x: 0, y: 0 })
const selectionEnd = ref({ x: 0, y: 0 })

// Computed style for selection box
const selectionBoxStyle = computed(() => {
  const left = Math.min(selectionStart.value.x, selectionEnd.value.x)
  const top = Math.min(selectionStart.value.y, selectionEnd.value.y)
  const width = Math.abs(selectionEnd.value.x - selectionStart.value.x)
  const height = Math.abs(selectionEnd.value.y - selectionStart.value.y)
  
  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`
  }
})

// Start selection on mousedown (only with Shift key)
const startSelection = (e) => {
  // Only start selection if holding Shift key
  if (!e.shiftKey) {
    return
  }
  
  // Only start selection if not clicking on an editable field or toolbar
  if (e.target.closest('.editable-field') || e.target.closest('.format-toolbar') || e.target.closest('.row-controls') || e.target.closest('.el-button')) {
    return
  }
  
  const rect = containerRef.value.getBoundingClientRect()
  selectionStart.value = {
    x: e.clientX - rect.left + containerRef.value.scrollLeft,
    y: e.clientY - rect.top + containerRef.value.scrollTop
  }
  selectionEnd.value = { ...selectionStart.value }
  isSelecting.value = true
  
  // Clear previous selection if not holding Ctrl
  if (!e.ctrlKey && !e.metaKey) {
    reportStore.clearSelection()
  }
}

// Update selection box
const updateSelection = (e) => {
  if (!isSelecting.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  selectionEnd.value = {
    x: e.clientX - rect.left + containerRef.value.scrollLeft,
    y: e.clientY - rect.top + containerRef.value.scrollTop
  }
}

// End selection and find intersecting editable fields
const endSelection = () => {
  if (!isSelecting.value) return
  
  // Calculate selection box bounds
  const boxLeft = Math.min(selectionStart.value.x, selectionEnd.value.x)
  const boxTop = Math.min(selectionStart.value.y, selectionEnd.value.y)
  const boxRight = Math.max(selectionStart.value.x, selectionEnd.value.x)
  const boxBottom = Math.max(selectionStart.value.y, selectionEnd.value.y)
  
  // Check if selection is large enough (avoid click-through)
  if (boxRight - boxLeft > 10 && boxBottom - boxTop > 10) {
    // Find all editable fields within selection box
    const containerRect = containerRef.value.getBoundingClientRect()
    const editableFields = containerRef.value.querySelectorAll('.editable-field')
    
    editableFields.forEach(field => {
      const fieldRect = field.getBoundingClientRect()
      const fieldLeft = fieldRect.left - containerRect.left + containerRef.value.scrollLeft
      const fieldTop = fieldRect.top - containerRect.top + containerRef.value.scrollTop
      const fieldRight = fieldLeft + fieldRect.width
      const fieldBottom = fieldTop + fieldRect.height
      
      // Check if field intersects with selection box
      if (fieldLeft < boxRight && fieldRight > boxLeft && 
          fieldTop < boxBottom && fieldBottom > boxTop) {
        // Get field ID from the component's data attribute or props
        const fieldId = field.dataset.fieldId || field.getAttribute('field-id')
        if (fieldId) {
          reportStore.selectField(fieldId, true) // Multi-select mode
        }
      }
    })
  }
  
  isSelecting.value = false
}
</script>

<style lang="scss" scoped>
.report-edit-container {
  max-width: 100%;
  margin: 0 auto;
  position: relative;
  user-select: none;
}

.report-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.selection-box {
  position: absolute;
  border: 2px dashed #409eff;
  background-color: rgba(64, 158, 255, 0.1);
  pointer-events: none;
  z-index: 100;
}
</style>
