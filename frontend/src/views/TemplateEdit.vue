<template>
  <div 
    class="template-edit-container"
    @mousedown="startSelection"
    @mousemove="updateSelection"
    @mouseup="endSelection"
    ref="containerRef"
  >
    <!-- Format Toolbar -->
    <TemplateToolbar 
      :selected-elements="selectedElements" 
      @format-change="applyFormatToSelected"
    />
    
    <div class="template-edit-layout">
      <!-- Left Sidebar -->
      <aside class="template-sidebar">
        <div class="sidebar-section">
          <h3 class="section-title">Logo管理</h3>
          <div class="upload-area">
            <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept="image/png,image/jpeg,image/jpg"
              @change="handleLogoUpload"
            >
              <el-button type="primary" size="small">
                <el-icon><Upload /></el-icon> 上传Logo
              </el-button>
            </el-upload>
            <div v-if="templateStore.logo.dataUrl" class="image-preview">
              <img :src="templateStore.logo.dataUrl" alt="Logo" />
            </div>
          </div>
          <div v-if="templateStore.logo.dataUrl" class="size-control">
            <span class="control-label">大小：</span>
            <el-slider 
              v-model="templateStore.logo.size" 
              :min="50" 
              :max="200" 
              size="small"
              @change="handleLogoSizeChange"
            />
          </div>
          <div v-if="templateStore.logo.dataUrl" class="position-control">
            <span class="control-label">位置：</span>
            <div class="position-inputs">
              <el-input-number 
                v-model="templateStore.logo.position.x" 
                :min="0" 
                :max="600" 
                size="small"
                controls-position="right"
                @change="handleLogoPositionChange"
              >
                <template #prefix>X</template>
              </el-input-number>
              <el-input-number 
                v-model="templateStore.logo.position.y" 
                :min="0" 
                :max="1000" 
                size="small"
                controls-position="right"
                @change="handleLogoPositionChange"
              >
                <template #prefix>Y</template>
              </el-input-number>
            </div>
          </div>
        </div>
        
        <el-divider />
        
        <div class="sidebar-section">
          <h3 class="section-title">电子签名</h3>
          
          <div class="signature-item">
            <span class="signature-label">测试员签名：</span>
            <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept="image/png,image/jpeg,image/jpg"
              @change="(file) => handleSignatureUpload('tester', file)"
            >
              <el-button size="small">上传</el-button>
            </el-upload>
            <div v-if="templateStore.signatures.tester.dataUrl" class="mini-preview">
              <img :src="templateStore.signatures.tester.dataUrl" alt="Tester" />
            </div>
          </div>
          <div v-if="templateStore.signatures.tester.dataUrl" class="size-control signature-size">
            <span class="control-label">大小：</span>
            <el-slider 
              v-model="templateStore.signatures.tester.size" 
              :min="0" 
              :max="30" 
              size="small"
              @change="(size) => handleSignatureSizeChange('tester', size)"
            />
          </div>
          
          <div class="signature-item">
            <span class="signature-label">审核签名：</span>
            <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept="image/png,image/jpeg,image/jpg"
              @change="(file) => handleSignatureUpload('reviewer', file)"
            >
              <el-button size="small">上传</el-button>
            </el-upload>
            <div v-if="templateStore.signatures.reviewer.dataUrl" class="mini-preview">
              <img :src="templateStore.signatures.reviewer.dataUrl" alt="Reviewer" />
            </div>
          </div>
          <div v-if="templateStore.signatures.reviewer.dataUrl" class="size-control signature-size">
            <span class="control-label">大小：</span>
            <el-slider 
              v-model="templateStore.signatures.reviewer.size" 
              :min="0" 
              :max="30" 
              size="small"
              @change="(size) => handleSignatureSizeChange('reviewer', size)"
            />
          </div>
          
          <div class="signature-item">
            <span class="signature-label">核准签名：</span>
            <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept="image/png,image/jpeg,image/jpg"
              @change="(file) => handleSignatureUpload('approver', file)"
            >
              <el-button size="small">上传</el-button>
            </el-upload>
            <div v-if="templateStore.signatures.approver.dataUrl" class="mini-preview">
              <img :src="templateStore.signatures.approver.dataUrl" alt="Approver" />
            </div>
          </div>
          <div v-if="templateStore.signatures.approver.dataUrl" class="size-control signature-size">
            <span class="control-label">大小：</span>
            <el-slider 
              v-model="templateStore.signatures.approver.size" 
              :min="0" 
              :max="30" 
              size="small"
              @change="(size) => handleSignatureSizeChange('approver', size)"
            />
          </div>
        </div>
        
        <el-divider />
        
        <div class="sidebar-section">
          <h3 class="section-title">部门章</h3>
          <div class="upload-area">
            <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept="image/png"
              @change="handleSealUpload"
            >
              <el-button type="primary" size="small">
                <el-icon><Upload /></el-icon> 上传部门章
              </el-button>
            </el-upload>
            <p class="upload-tip">支持PNG透明背景图片</p>
            <div v-if="templateStore.departmentSeal.dataUrl" class="image-preview">
              <img :src="templateStore.departmentSeal.dataUrl" alt="Seal" />
            </div>
          </div>
          <div v-if="templateStore.departmentSeal.dataUrl" class="size-control">
            <span class="control-label">大小：</span>
            <el-slider 
              v-model="templateStore.departmentSeal.size" 
              :min="60" 
              :max="200" 
              size="small"
            />
          </div>
          <div v-if="templateStore.departmentSeal.dataUrl" class="position-control">
            <span class="control-label">位置：</span>
            <div class="position-inputs">
              <el-input-number 
                v-model="templateStore.departmentSeal.position.x" 
                :min="0" 
                :max="600" 
                size="small"
                controls-position="right"
                @change="handleSealPositionChange"
              >
                <template #prefix>X</template>
              </el-input-number>
              <el-input-number 
                v-model="templateStore.departmentSeal.position.y" 
                :min="0" 
                :max="1000" 
                size="small"
                controls-position="right"
                @change="handleSealPositionChange"
              >
                <template #prefix>Y</template>
              </el-input-number>
            </div>
          </div>
        </div>
        
        <el-divider />
        
        <div class="sidebar-section">
          <h3 class="section-title">模板操作</h3>
          <div class="action-buttons">
            <el-button type="primary" @click="applyToReport">
              <el-icon><Check /></el-icon> 应用于报告编辑
            </el-button>
            <el-button type="warning" @click="confirmResetTemplate">
              <el-icon><RefreshRight /></el-icon> 重置模板
            </el-button>
          </div>
          <div class="action-buttons-row">
            <el-button @click="exportTemplate">
              <el-icon><Download /></el-icon> 导出模板
            </el-button>
            <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept=".json"
              @change="importTemplate"
              class="import-upload"
            >
              <el-button>
                <el-icon><Upload /></el-icon> 导入模板
              </el-button>
            </el-upload>
          </div>
        </div>
      </aside>
      
      <!-- Main Template Preview -->
      <main class="template-preview" ref="previewRef">
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Upload, Download, Check, RefreshRight } from '@element-plus/icons-vue'
import { useTemplateStore } from '@/stores/template'
import TemplateToolbar from '@/components/layout/TemplateToolbar.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const templateStore = useTemplateStore()
const containerRef = ref(null)
const previewRef = ref(null)

// Auto-save state (no UI display, silent save like report edit)
let autoSaveTimer = null

// Selection state
const isSelecting = ref(false)
const selectionStart = ref({ x: 0, y: 0 })
const selectionEnd = ref({ x: 0, y: 0 })
const selectedElements = ref([])

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

// Start selection on mousedown
const startSelection = (e) => {
  // Only start selection if clicking in the preview area
  const isInPreview = e.target.closest('.template-preview') || e.target.closest('.a4-page')
  const isOnToolbar = e.target.closest('.template-format-toolbar')
  const isOnSidebar = e.target.closest('.template-sidebar')
  const isOnButton = e.target.closest('.el-button')
  const isOnUpload = e.target.closest('.el-upload')
  const isOnDraggableImage = e.target.closest('.logo-area, .department-seal')
  
  if (!isInPreview || isOnToolbar || isOnSidebar || isOnButton || isOnUpload) {
    return
  }
  
  // If clicking on a draggable image, don't start selection
  if (isOnDraggableImage) {
    return
  }
  
  // Check if clicking on a selectable text element (both fixed and editable)
  // Include editable areas: .cell-input, .placeholder-text (editable placeholders with gray text)
  // Include .image-header for test image section headers (测试前、测试中、测试后)
  const clickedElement = e.target.closest('.fixed-text-item, .label, .section-header, .company-name, .report-title, .record-code, .label-cell, th, .placeholder-text, .cell-input, .image-header, .footer-note-item > .editable-text')
  
  if (clickedElement) {
    // Handle Ctrl+click for multi-selection
    if (e.ctrlKey || e.metaKey) {
      const index = selectedElements.value.indexOf(clickedElement)
      if (index > -1) {
        // Deselect
        selectedElements.value.splice(index, 1)
        clickedElement.classList.remove('text-selected')
      } else {
        // Add to selection
        selectedElements.value.push(clickedElement)
        clickedElement.classList.add('text-selected')
      }
      // Prevent default to avoid focusing the contenteditable element
      e.preventDefault()
    } else {
      // Single click - clear previous and select new
      clearSelection()
      selectedElements.value = [clickedElement]
      clickedElement.classList.add('text-selected')
    }
    return
  }
  
  // Only start rectangle selection when holding Shift key
  if (!e.shiftKey) {
    // Clear selection if clicking on empty area without Shift
    if (!e.ctrlKey && !e.metaKey) {
      clearSelection()
    }
    return
  }
  
  // Start rectangle selection (only with Shift key)
  const rect = containerRef.value.getBoundingClientRect()
  selectionStart.value = {
    x: e.clientX - rect.left + containerRef.value.scrollLeft,
    y: e.clientY - rect.top + containerRef.value.scrollTop
  }
  selectionEnd.value = { ...selectionStart.value }
  isSelecting.value = true
  
  // Clear previous selection if not holding Ctrl
  if (!e.ctrlKey && !e.metaKey) {
    clearSelection()
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

// End selection and find intersecting text elements
const endSelection = () => {
  if (!isSelecting.value) return
  
  // Calculate selection box bounds
  const boxLeft = Math.min(selectionStart.value.x, selectionEnd.value.x)
  const boxTop = Math.min(selectionStart.value.y, selectionEnd.value.y)
  const boxRight = Math.max(selectionStart.value.x, selectionEnd.value.x)
  const boxBottom = Math.max(selectionStart.value.y, selectionEnd.value.y)
  
  // Check if selection is large enough (avoid click-through)
  if (boxRight - boxLeft > 10 && boxBottom - boxTop > 10) {
    // Find all selectable text elements within selection box
    // Include both fixed text elements and editable areas (.cell-input, .placeholder-text)
    // Include .image-header for test image section headers (测试前、测试中、测试后)
    const containerRect = containerRef.value.getBoundingClientRect()
    const selectableElements = containerRef.value.querySelectorAll(
      '.label, .section-header, .company-name, .report-title, .record-code, .label-cell, th, .placeholder-text, .cell-input, .image-header, .footer-note-item > .editable-text'
    )
    
    selectableElements.forEach(el => {
      const elRect = el.getBoundingClientRect()
      const elLeft = elRect.left - containerRect.left + containerRef.value.scrollLeft
      const elTop = elRect.top - containerRect.top + containerRef.value.scrollTop
      const elRight = elLeft + elRect.width
      const elBottom = elTop + elRect.height
      
      // Check if element intersects with selection box
      if (elLeft < boxRight && elRight > boxLeft && 
          elTop < boxBottom && elBottom > boxTop) {
        if (!selectedElements.value.includes(el)) {
          selectedElements.value.push(el)
          el.classList.add('text-selected')
        }
      }
    })
  }
  
  isSelecting.value = false
}

// Clear all selections
const clearSelection = () => {
  selectedElements.value.forEach(el => {
    el.classList.remove('text-selected')
  })
  selectedElements.value = []
}

// Apply format to selected elements
const applyFormatToSelected = (format) => {
  selectedElements.value.forEach(el => {
    el.style.fontFamily = format.fontFamily
    el.style.fontSize = `${format.fontSize}px`
    el.style.color = format.color
    el.style.fontWeight = format.fontWeight
    el.style.fontStyle = format.fontStyle
    el.style.textDecoration = format.textDecoration
    el.style.textAlign = format.textAlign
  })
}

const handleLogoUpload = (uploadFile) => {
  const file = uploadFile.raw
  if (file) {
    templateStore.uploadLogo(file)
  }
}

const handleLogoSizeChange = (size) => {
  templateStore.updateLogoSize(size)
}

const handleLogoPositionChange = () => {
  // Position is already updated via v-model, just mark dirty
  templateStore.updateLogoPosition(templateStore.logo.position)
}

const handleSealPositionChange = () => {
  // Position is already updated via v-model, just mark dirty
  templateStore.updateDepartmentSealPosition(templateStore.departmentSeal.position)
}

const handleSignatureUpload = (type, uploadFile) => {
  const file = uploadFile.raw
  if (file) {
    templateStore.uploadSignature(type, file)
  }
}

const handleSignatureSizeChange = (type, size) => {
  templateStore.updateSignatureSize(type, size)
}

const handleSealUpload = (uploadFile) => {
  const file = uploadFile.raw
  if (file) {
    templateStore.uploadDepartmentSeal(file)
  }
}

const saveTemplate = () => {
  templateStore.saveTemplate()
}

const exportTemplate = () => {
  templateStore.exportTemplate()
}

const importTemplate = (uploadFile) => {
  const file = uploadFile.raw
  if (file) {
    templateStore.importTemplate(file)
  }
}

// Apply template to report editing
const applyToReport = async () => {
  try {
    await templateStore.saveTemplate(true) // silent mode, we show our own message
    ElMessage.success('模板已成功应用于报告编辑')
  } catch (error) {
    ElMessage.error('应用失败：' + error.message)
  }
}

// Confirm reset template
const confirmResetTemplate = () => {
  ElMessageBox.confirm(
    '确定要重置模板吗？所有修改将会丢失并恢复为默认模板。',
    '重置模板确认',
    {
      confirmButtonText: '确定重置',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    await templateStore.resetToDefault()
    ElMessage.success('模板已重置为默认设置')
  }).catch(() => {
    // User cancelled
  })
}

// Auto-save functionality (silent save, no UI feedback)
const performAutoSave = async () => {
  if (!templateStore.isDirty) return
  
  try {
    await templateStore.saveTemplate(true) // silent mode
  } catch (error) {
    console.error('Auto-save failed:', error)
  }
}

const scheduleAutoSave = () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  autoSaveTimer = setTimeout(performAutoSave, 500) // Auto-save after 0.5 second of inactivity
}

// Watch for changes to trigger auto-save
watch(
  () => templateStore.isDirty,
  (isDirty) => {
    if (isDirty) {
      scheduleAutoSave()
    }
  }
)

// Load saved template on mount
onMounted(async () => {
  try {
    const response = await fetch('/api/template/latest/general')
    if (response.ok) {
      const data = await response.json()
      if (data && data.id) {
        await templateStore.loadCustomTemplate(data.id)
      }
    }
  } catch (error) {
    console.error('Failed to load saved template:', error)
  }
})

// Clean up auto-save timer on unmount
onUnmounted(() => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
})
</script>

<style lang="scss" scoped>
.template-edit-container {
  width: 100%;
  position: relative;
  user-select: none;
}

.template-edit-layout {
  display: flex;
  gap: 20px;
}

.template-sidebar {
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

.upload-area {
  .upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
  }
}

.image-preview {
  margin-top: 12px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  text-align: center;
  
  img {
    max-width: 100%;
    max-height: 100px;
    object-fit: contain;
  }
}

.mini-preview {
  margin-top: 8px;
  
  img {
    max-width: 60px;
    max-height: 30px;
    object-fit: contain;
  }
}

.size-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  
  .control-label {
    font-size: 12px;
    color: #606266;
    white-space: nowrap;
  }
  
  .el-slider {
    flex: 1;
  }
}

.position-control {
  margin-top: 12px;
  
  .control-label {
    font-size: 12px;
    color: #606266;
    display: block;
    margin-bottom: 8px;
  }
  
  .position-inputs {
    display: flex;
    gap: 10px;
    
    .el-input-number {
      flex: 1;
      width: 100%;
    }
  }
}

.signature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  
  .signature-label {
    font-size: 12px;
    color: #606266;
    width: 80px;
  }
}

.size-control.signature-size {
  margin-bottom: 12px;
  padding-left: 80px;
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

.action-buttons-row {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  
  .el-button {
    flex: 1;
  }
  
  .import-upload {
    flex: 1;
    
    .el-button {
      width: 100%;
    }
  }
}

.template-preview {
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

<style>
/* Global style for selected text elements */
.text-selected {
  outline: 2px solid #409eff !important;
  background-color: rgba(64, 158, 255, 0.1) !important;
}
</style>
