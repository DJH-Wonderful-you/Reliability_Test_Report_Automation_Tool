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
          <h3 class="section-title">行操作</h3>
          <div class="row-operations">
            <!-- 测试结果信息行操作 -->
            <div class="operation-group">
              <h4 class="group-title">测试结果信息</h4>
              
              <div class="operation-row">
                <el-button size="small" type="success" @click="addBatchTestResultRows">
                  <el-icon><Plus /></el-icon> 末尾添加行
                </el-button>
                <el-input-number 
                  v-model="batchAddResultCount" 
                  :min="1" 
                  :max="20" 
                  size="small" 
                  class="row-count-input"
                />
              </div>
              
              <div class="operation-row">
                <el-button size="small" type="primary" @click="openInsertResultDialog">
                  <el-icon><CirclePlus /></el-icon> 指定位置插入行
                </el-button>
              </div>
              
              <div class="operation-row">
                <el-button size="small" type="warning" @click="deleteTailResultRows">
                  <el-icon><Remove /></el-icon> 末尾删除行
                </el-button>
                <el-input-number 
                  v-model="tailDeleteResultCount" 
                  :min="1" 
                  :max="20" 
                  size="small" 
                  class="row-count-input"
                />
              </div>
              
              <div class="operation-row">
                <el-button size="small" type="danger" @click="openBatchDeleteResultDialog">
                  <el-icon><Delete /></el-icon> 指定位置删除行
                </el-button>
              </div>
            </div>
            
            <el-divider />
            
            <!-- 测试图片行操作 -->
            <div class="operation-group">
              <h4 class="group-title">测试图片</h4>
              
              <div class="operation-row">
                <el-button size="small" type="success" @click="addBatchTestImageRows">
                  <el-icon><Plus /></el-icon> 末尾添加行
                </el-button>
                <el-input-number 
                  v-model="batchAddImageCount" 
                  :min="1" 
                  :max="10" 
                  size="small" 
                  class="row-count-input"
                />
              </div>
              
              <div class="operation-row">
                <el-button size="small" type="primary" @click="openInsertImageDialog">
                  <el-icon><CirclePlus /></el-icon> 指定位置插入行
                </el-button>
              </div>
              
              <div class="operation-row">
                <el-button size="small" type="warning" @click="deleteTailImageRows">
                  <el-icon><Remove /></el-icon> 末尾删除行
                </el-button>
                <el-input-number 
                  v-model="tailDeleteImageCount" 
                  :min="1" 
                  :max="10" 
                  size="small" 
                  class="row-count-input"
                />
              </div>
              
              <div class="operation-row">
                <el-button size="small" type="danger" @click="openBatchDeleteImageDialog">
                  <el-icon><Delete /></el-icon> 指定位置删除行
                </el-button>
              </div>
            </div>
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
import { Download, Plus, DocumentAdd, FolderOpened, Delete, CirclePlus, Remove } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElInput } from 'element-plus'

const reportStore = useReportStore()
const containerRef = ref(null)

// Batch add counts
const batchAddResultCount = ref(1)
const batchAddImageCount = ref(1)
// Tail delete counts
const tailDeleteResultCount = ref(1)
const tailDeleteImageCount = ref(1)
// Insert positions
const insertResultPosition = ref(1)
const insertResultCount = ref(1)
const insertImagePosition = ref(1)
const insertImageCount = ref(1)

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

// Row operations
const addBatchTestResultRows = () => {
  if (batchAddResultCount.value < 1) {
    ElMessage.warning('请输入有效的行数')
    return
  }
  reportStore.addTestResultRows(batchAddResultCount.value)
  ElMessage.success(`已批量添加 ${batchAddResultCount.value} 行测试结果`)
}

const addBatchTestImageRows = () => {
  if (batchAddImageCount.value < 1) {
    ElMessage.warning('请输入有效的行数')
    return
  }
  reportStore.addTestImageRows(batchAddImageCount.value)
  ElMessage.success(`已批量添加 ${batchAddImageCount.value} 行测试图片`)
}

// 从末尾删除行
const deleteTailResultRows = async () => {
  const currentRowCount = reportStore.testResultRows.length
  if (currentRowCount <= 1) {
    ElMessage.warning('至少保留一行')
    return
  }
  
  if (tailDeleteResultCount.value >= currentRowCount) {
    ElMessage.warning('删除行数不能超过总行数减一')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要从末尾删除 ${tailDeleteResultCount.value} 行吗？此操作不可撤销！`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 从末尾删除指定数量的行
    const startIndex = currentRowCount - tailDeleteResultCount.value
    reportStore.testResultRows.splice(startIndex, tailDeleteResultCount.value)
    reportStore.isDirty = true
    ElMessage.success(`已从末尾删除 ${tailDeleteResultCount.value} 行`)
  } catch {
    // 用户取消
  }
}

const deleteTailImageRows = async () => {
  const currentRowCount = reportStore.testImageRows.length
  if (currentRowCount <= 1) {
    ElMessage.warning('至少保留一行')
    return
  }
  
  if (tailDeleteImageCount.value >= currentRowCount) {
    ElMessage.warning('删除行数不能超过总行数减一')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要从末尾删除 ${tailDeleteImageCount.value} 行吗？此操作不可撤销！`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 从末尾删除指定数量的行
    const startIndex = currentRowCount - tailDeleteImageCount.value
    reportStore.testImageRows.splice(startIndex, tailDeleteImageCount.value)
    reportStore.isDirty = true
    ElMessage.success(`已从末尾删除 ${tailDeleteImageCount.value} 行`)
  } catch {
    // 用户取消
  }
}

// 指定位置插入行
const openInsertResultDialog = async () => {
  try {
    const currentRowCount = reportStore.testResultRows.length
    
    const dialogContent = `
      <div>
        <p>在指定位置插入行：</p>
        <div style="margin: 15px 0;">
          <label>在第 
            <input type="number" id="insertResultPosition" min="1" max="${currentRowCount}" value="1" 
                   style="width: 60px; padding: 4px; border: 1px solid #dcdfe6; border-radius: 4px; margin: 0 5px;">
          行后插入
          </label>
        </div>
        <div style="margin: 15px 0;">
          <label>插入数量：
            <input type="number" id="insertResultCount" min="1" max="20" value="1" 
                   style="width: 60px; padding: 4px; border: 1px solid #dcdfe6; border-radius: 4px; margin-left: 5px;">
          </label>
        </div>
        <p style="color: #909399; font-size: 12px;">
          当前行数：${currentRowCount} 行
        </p>
      </div>
    `
    
    const { value } = await ElMessageBox.confirm(
      dialogContent,
      '指定位置插入行',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '插入',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    const positionInput = document.getElementById('insertResultPosition')
    const countInput = document.getElementById('insertResultCount')
    
    const position = parseInt(positionInput?.value) || 1
    const count = parseInt(countInput?.value) || 1
    
    if (position < 1 || position > currentRowCount) {
      ElMessage.error('插入位置无效')
      return
    }
    
    if (count < 1 || count > 20) {
      ElMessage.error('插入数量无效')
      return
    }
    
    // 计算插入位置的索引（在指定行之后）
    const insertIndex = position
    
    // 生成新行
    const lastId = reportStore.testResultRows.length > 0 
      ? Math.max(...reportStore.testResultRows.map(r => r.id)) 
      : 0
      
    const newRows = []
    for (let i = 0; i < count; i++) {
      newRows.push({
        id: lastId + i + 1,
        appearance: '',
        function: '',
        other: '',
        conclusion: '',
        note: ''
      })
    }
    
    // 插入新行
    reportStore.testResultRows.splice(insertIndex, 0, ...newRows)
    reportStore.isDirty = true
    ElMessage.success(`已在第 ${position} 行后插入 ${count} 行`)
  } catch {
    // 用户取消
  }
}

const openInsertImageDialog = async () => {
  try {
    const currentRowCount = reportStore.testImageRows.length
    
    const dialogContent = `
      <div>
        <p>在指定位置插入行：</p>
        <div style="margin: 15px 0;">
          <label>在第 
            <input type="number" id="insertImagePosition" min="1" max="${currentRowCount}" value="1" 
                   style="width: 60px; padding: 4px; border: 1px solid #dcdfe6; border-radius: 4px; margin: 0 5px;">
          行后插入
          </label>
        </div>
        <div style="margin: 15px 0;">
          <label>插入数量：
            <input type="number" id="insertImageCount" min="1" max="10" value="1" 
                   style="width: 60px; padding: 4px; border: 1px solid #dcdfe6; border-radius: 4px; margin-left: 5px;">
          </label>
        </div>
        <p style="color: #909399; font-size: 12px;">
          当前行数：${currentRowCount} 行
        </p>
      </div>
    `
    
    const { value } = await ElMessageBox.confirm(
      dialogContent,
      '指定位置插入行',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '插入',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    const positionInput = document.getElementById('insertImagePosition')
    const countInput = document.getElementById('insertImageCount')
    
    const position = parseInt(positionInput?.value) || 1
    const count = parseInt(countInput?.value) || 1
    
    if (position < 1 || position > currentRowCount) {
      ElMessage.error('插入位置无效')
      return
    }
    
    if (count < 1 || count > 10) {
      ElMessage.error('插入数量无效')
      return
    }
    
    // 计算插入位置的索引（在指定行之后）
    const insertIndex = position
    
    // 生成新行
    const lastId = reportStore.testImageRows.length > 0 
      ? Math.max(...reportStore.testImageRows.map(r => r.id)) 
      : 0
      
    const newRows = []
    for (let i = 0; i < count; i++) {
      newRows.push({
        id: lastId + i + 1,
        before: [],
        during: [],
        after: []
      })
    }
    
    // 插入新行
    reportStore.testImageRows.splice(insertIndex, 0, ...newRows)
    reportStore.isDirty = true
    ElMessage.success(`已在第 ${position} 行后插入 ${count} 行`)
  } catch {
    // 用户取消
  }
}

const openBatchDeleteResultDialog = async () => {
  try {
    const currentRowCount = reportStore.testResultRows.length
    if (currentRowCount <= 1) {
      ElMessage.warning('至少保留一行')
      return
    }

    // 创建对话框内容 - 提供两种删除方式
    const dialogContent = `
      <div>
        <p>选择删除方式（至少保留一行）：</p>
        
        <div style="margin: 15px 0;">
          <strong>方式一：复选框选择</strong>
          <div style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin-top: 5px;">
            ${Array.from({length: currentRowCount}, (_, i) => `
              <label style="display: block; margin: 3px 0;">
                <input type="checkbox" name="deleteRows" value="${i}" style="margin-right: 8px;">
                第 ${i + 1} 行
              </label>
            `).join('')}
          </div>
        </div>
        
        <div style="margin: 15px 0;">
          <strong>方式二：输入行号范围</strong>
          <div style="margin-top: 5px;">
            <input type="text" id="rangeInput" placeholder="例如：3-7 或 2,5,8" 
                   style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;">
            <div style="font-size: 12px; color: #909399; margin-top: 5px;">
              支持格式：单个数字(5)、范围(3-7)、逗号分隔(2,5,8)、混合(1,3-5,8)
            </div>
          </div>
        </div>
        
        <p style="margin-top: 15px; color: #f56c6c; font-size: 12px;">
          ⚠️ 警告：此操作不可撤销！
        </p>
      </div>
    `

    const { value } = await ElMessageBox.confirm(
      dialogContent,
      '批量删除测试结果行',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '删除选中行',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 获取选中的行
    let selectedIndices = []
    
    // 先检查复选框
    const checkboxes = document.querySelectorAll('input[name="deleteRows"]:checked')
    selectedIndices = Array.from(checkboxes).map(cb => parseInt(cb.value))
    
    // 如果没有选中复选框，检查文本输入
    if (selectedIndices.length === 0) {
      const rangeInput = document.getElementById('rangeInput')
      const rangeValue = rangeInput?.value.trim()
      
      if (rangeValue) {
        selectedIndices = parseRowRange(rangeValue, currentRowCount)
        if (selectedIndices.length === 0) {
          ElMessage.error('输入的行号格式不正确或超出范围')
          return
        }
      }
    }

    if (selectedIndices.length === 0) {
      ElMessage.info('未选择任何行')
      return
    }

    if (selectedIndices.length >= currentRowCount) {
      ElMessage.warning('不能删除所有行，至少保留一行')
      return
    }

    // 排序并删除
    selectedIndices.sort((a, b) => b - a)
    for (const index of selectedIndices) {
      reportStore.testResultRows.splice(index, 1)
    }
    
    reportStore.isDirty = true
    ElMessage.success(`已删除 ${selectedIndices.length} 行`)
  } catch {
    // 用户取消
  }
}

const openBatchDeleteImageDialog = async () => {
  try {
    const currentRowCount = reportStore.testImageRows.length
    if (currentRowCount <= 1) {
      ElMessage.warning('至少保留一行')
      return
    }

    // 创建对话框内容 - 提供两种删除方式
    const dialogContent = `
      <div>
        <p>选择删除方式（至少保留一行）：</p>
        
        <div style="margin: 15px 0;">
          <strong>方式一：复选框选择</strong>
          <div style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin-top: 5px;">
            ${Array.from({length: currentRowCount}, (_, i) => `
              <label style="display: block; margin: 3px 0;">
                <input type="checkbox" name="deleteImageRows" value="${i}" style="margin-right: 8px;">
                第 ${i + 1} 行
              </label>
            `).join('')}
          </div>
        </div>
        
        <div style="margin: 15px 0;">
          <strong>方式二：输入行号范围</strong>
          <div style="margin-top: 5px;">
            <input type="text" id="imageRangeInput" placeholder="例如：3-7 或 2,5,8" 
                   style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;">
            <div style="font-size: 12px; color: #909399; margin-top: 5px;">
              支持格式：单个数字(5)、范围(3-7)、逗号分隔(2,5,8)、混合(1,3-5,8)
            </div>
          </div>
        </div>
        
        <p style="margin-top: 15px; color: #f56c6c; font-size: 12px;">
          ⚠️ 警告：此操作不可撤销！
        </p>
      </div>
    `

    const { value } = await ElMessageBox.confirm(
      dialogContent,
      '批量删除测试图片行',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '删除选中行',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 获取选中的行
    let selectedIndices = []
    
    // 先检查复选框
    const checkboxes = document.querySelectorAll('input[name="deleteImageRows"]:checked')
    selectedIndices = Array.from(checkboxes).map(cb => parseInt(cb.value))
    
    // 如果没有选中复选框，检查文本输入
    if (selectedIndices.length === 0) {
      const rangeInput = document.getElementById('imageRangeInput')
      const rangeValue = rangeInput?.value.trim()
      
      if (rangeValue) {
        selectedIndices = parseRowRange(rangeValue, currentRowCount)
        if (selectedIndices.length === 0) {
          ElMessage.error('输入的行号格式不正确或超出范围')
          return
        }
      }
    }

    if (selectedIndices.length === 0) {
      ElMessage.info('未选择任何行')
      return
    }

    if (selectedIndices.length >= currentRowCount) {
      ElMessage.warning('不能删除所有行，至少保留一行')
      return
    }

    // 排序并删除
    selectedIndices.sort((a, b) => b - a)
    for (const index of selectedIndices) {
      reportStore.testImageRows.splice(index, 1)
    }
    
    reportStore.isDirty = true
    ElMessage.success(`已删除 ${selectedIndices.length} 行`)
  } catch {
    // 用户取消
  }
}

// 解析行号范围字符串
const parseRowRange = (rangeStr, maxRows) => {
  const result = new Set()
  const parts = rangeStr.split(',').map(p => p.trim()).filter(p => p)
  
  for (const part of parts) {
    if (part.includes('-')) {
      // 范围格式：3-7
      const [start, end] = part.split('-').map(n => parseInt(n.trim()))
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= maxRows) {
            result.add(i - 1) // 转换为0基索引
          }
        }
      }
    } else {
      // 单个数字：5
      const num = parseInt(part)
      if (!isNaN(num) && num >= 1 && num <= maxRows) {
        result.add(num - 1) // 转换为0基索引
      }
    }
  }
  
  return Array.from(result).sort((a, b) => a - b)
}
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

.row-operations {
  .operation-group {
    .group-title {
      font-size: 14px;
      font-weight: normal;
      margin-bottom: 15px;
      color: #303133;
    }
    
    .operation-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 15px;
      min-height: 36px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .el-button {
        flex: 1;
        height: 32px;
        font-size: 14px;
        justify-content: center;
      }
      
      .row-count-input {
        width: 100px;
        height: 32px;
        
        :deep(.el-input__wrapper) {
          height: 32px;
        }
        
        :deep(.el-input__inner) {
          height: 32px;
          font-size: 14px;
        }
      }
    }
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
