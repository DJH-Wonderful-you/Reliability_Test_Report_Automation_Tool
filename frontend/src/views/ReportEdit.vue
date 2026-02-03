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
    
    <div class="report-edit-layout">
      <!-- Left Sidebar -->
      <aside class="report-sidebar">
        <div class="sidebar-section">
          <h3 class="section-title">报告操作</h3>
          <div class="action-buttons">
            <el-button type="primary" @click="handleExportPdf">
              <el-icon><Download /></el-icon> 导出PDF
            </el-button>
            <el-button @click="handleNewReport">
              <el-icon><Plus /></el-icon> 新建报告
            </el-button>
          </div>
        </div>
        
        <el-divider />
        
        <div class="sidebar-section">
          <h3 class="section-title">草稿管理</h3>
          <div class="action-buttons">
            <el-button type="success" @click="handleSaveDraft">
              <el-icon><DocumentAdd /></el-icon> 保存草稿
            </el-button>
            <el-button @click="handleOpenDraft">
              <el-icon><FolderOpened /></el-icon> 打开草稿
            </el-button>
            <el-button type="danger" @click="handleDeleteDraft">
              <el-icon><Delete /></el-icon> 删除草稿
            </el-button>
          </div>
        </div>
      </aside>
      
      <!-- Report Content -->
      <main class="report-content">
        <router-view />
      </main>
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
import { Download, Plus, DocumentAdd, FolderOpened, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElInput } from 'element-plus'

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

// Handle export PDF
const handleExportPdf = () => {
  reportStore.exportPdf()
}

// Handle new report
const handleNewReport = async () => {
  await reportStore.newReport()
}

// Handle save draft
const handleSaveDraft = async () => {
  try {
    // Prompt user for draft title
    const { value } = await ElMessageBox.prompt(
      '请输入草稿名称：',
      '保存草稿',
      {
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        inputPlaceholder: '草稿名称'
      }
    )
    
    if (value) {
      await reportStore.saveDraft(value)
    }
  } catch {
    // User cancelled
  }
}

// Handle open draft
const handleOpenDraft = async () => {
  try {
    // Get list of drafts
    const drafts = await reportStore.listDrafts()
    
    if (drafts.length === 0) {
      ElMessage.info('暂无保存的草稿')
      return
    }
    
    // Show draft selection dialog
    const draftOptions = drafts.map(draft => ({
      label: `${draft.title} (${new Date(draft.updatedAt).toLocaleString()})`,
      value: draft.id
    }))
    
    const { value: selectedDraftId } = await ElMessageBox.confirm(
      `<div>
        <p>选择要打开的草稿：</p>
        <select id="draft-selector" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; margin-top: 10px;">
          ${draftOptions.map(option => 
            `<option value="${option.value}">${option.label}</option>`
          ).join('')}
        </select>
        <p style="margin-top: 15px; color: #f56c6c; font-size: 12px;">
          ⚠️ 警告：此操作将覆盖当前未保存的内容！
        </p>
      </div>`,
      '打开草稿',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '打开',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // Get selected draft ID from the select element
    const selector = document.getElementById('draft-selector')
    const draftId = selector?.value
    
    if (draftId) {
      await reportStore.loadDraft(draftId)
    }
  } catch {
    // User cancelled
  }
}

// Handle delete draft
const handleDeleteDraft = async () => {
  try {
    // Get list of drafts
    const drafts = await reportStore.listDrafts()
    
    if (drafts.length === 0) {
      ElMessage.info('暂无保存的草稿')
      return
    }
    
    // Show draft selection dialog
    const draftOptions = drafts.map(draft => ({
      label: `${draft.title} (${new Date(draft.updatedAt).toLocaleString()})`,
      value: draft.id
    }))
    
    const { value: selectedDraftId } = await ElMessageBox.confirm(
      `<div>
        <p>选择要删除的草稿：</p>
        <select id="delete-draft-selector" style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; margin-top: 10px;">
          ${draftOptions.map(option => 
            `<option value="${option.value}">${option.label}</option>`
          ).join('')}
        </select>
        <p style="margin-top: 15px; color: #f56c6c; font-size: 12px;">
          ⚠️ 警告：此操作不可撤销！
        </p>
      </div>`,
      '删除草稿',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // Get selected draft ID and title from the select element
    const selector = document.getElementById('delete-draft-selector')
    const draftId = selector?.value
    
    if (draftId) {
      // Find the draft title for the confirmation message
      const selectedDraft = drafts.find(draft => draft.id === draftId)
      const draftTitle = selectedDraft?.title || '未知草稿'
      
      // Show final confirmation
      await ElMessageBox.confirm(
        `确定要删除草稿 "${draftTitle}" 吗？此操作不可撤销！`,
        '确认删除',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'error'
        }
      )
      
      await reportStore.deleteDraft(draftId, draftTitle)
    }
  } catch {
    // User cancelled
  }
}
</script>

<style lang="scss" scoped>
.report-edit-container {
  max-width: 100%;
  margin: 0 auto;
  position: relative;
  user-select: none;
}

.report-edit-layout {
  display: flex;
  gap: 20px;
}

.report-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  position: sticky;
  top: 150px;
}

.sidebar-section {
  .section-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #303133;
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  .el-button {
    width: 100%;
    margin: 0;
  }
}

.report-content {
  flex: 1;
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
