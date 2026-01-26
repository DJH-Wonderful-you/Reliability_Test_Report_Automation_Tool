<template>
  <div class="format-toolbar">
    <div class="toolbar-group">
      <span class="toolbar-label">字体：</span>
      <el-select v-model="fontFamily" size="small" style="width: 140px;" @change="applyFormat">
        <el-option label="微软雅黑" value="Microsoft YaHei" />
        <el-option label="宋体" value="SimSun" />
        <el-option label="黑体" value="SimHei" />
        <el-option label="楷体" value="KaiTi" />
        <el-option label="仿宋" value="FangSong" />
        <el-option label="Arial" value="Arial" />
        <el-option label="Times New Roman" value="Times New Roman" />
      </el-select>
    </div>
    
    <div class="toolbar-group">
      <span class="toolbar-label">字号：</span>
      <el-select v-model="fontSize" size="small" style="width: 80px;" @change="applyFormat">
        <el-option v-for="size in fontSizes" :key="size" :label="size" :value="size" />
      </el-select>
    </div>
    
    <div class="toolbar-group">
      <span class="toolbar-label">颜色：</span>
      <el-color-picker v-model="fontColor" size="small" @change="applyFormat" />
    </div>
    
    <div class="toolbar-group">
      <el-button-group size="small">
        <el-button :type="isBold ? 'primary' : ''" @click="toggleBold">
          <strong>B</strong>
        </el-button>
        <el-button :type="isItalic ? 'primary' : ''" @click="toggleItalic">
          <em>I</em>
        </el-button>
        <el-button :type="isUnderline ? 'primary' : ''" @click="toggleUnderline">
          <u>U</u>
        </el-button>
      </el-button-group>
    </div>
    
    <div class="toolbar-group">
      <span class="toolbar-label">对齐：</span>
      <el-button-group size="small">
        <el-button :type="textAlign === 'left' ? 'primary' : ''" @click="setAlign('left')">
          <el-icon><AlignLeft /></el-icon>
        </el-button>
        <el-button :type="textAlign === 'center' ? 'primary' : ''" @click="setAlign('center')">
          <el-icon><AlignCenter /></el-icon>
        </el-button>
        <el-button :type="textAlign === 'right' ? 'primary' : ''" @click="setAlign('right')">
          <el-icon><AlignRight /></el-icon>
        </el-button>
      </el-button-group>
    </div>
    
    <div class="toolbar-spacer"></div>
    
    <div class="toolbar-info">
      <span v-if="selectedCount > 0" class="selected-info">
        已选择 {{ selectedCount }} 个字段
      </span>
      <span class="selection-hint">Ctrl+点击多选 | Shift+拖拽框选</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useReportStore } from '@/stores/report'

// Icons (simplified names for template)
const AlignLeft = { template: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h18v2H3V3zm0 8h12v2H3v-2zm0 8h18v2H3v-2zm0-4h12v2H3v-2z"/></svg>' }
const AlignCenter = { template: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h18v2H3V3zm3 8h12v2H6v-2zm-3 8h18v2H3v-2zm3-4h12v2H6v-2z"/></svg>' }
const AlignRight = { template: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h18v2H3V3zm6 8h12v2H9v-2zm-6 8h18v2H3v-2zm6-4h12v2H9v-2z"/></svg>' }

const reportStore = useReportStore()

// Format state
const fontFamily = ref('Microsoft YaHei')
const fontSize = ref(11)
const fontColor = ref('#000000')
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)
const textAlign = ref('left')

const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48]

const selectedCount = computed(() => reportStore.selectedFields.length)

// Watch for selected fields changes to update toolbar display
watch(() => reportStore.selectedFields, (newSelection) => {
  if (newSelection.length > 0) {
    nextTick(() => {
      const firstFieldId = newSelection[0]
      
      // First try to get saved format from store
      const savedFormat = reportStore.getFieldFormat(firstFieldId)
      if (savedFormat) {
        fontFamily.value = savedFormat.fontFamily || 'Microsoft YaHei'
        fontSize.value = savedFormat.fontSize || 11
        fontColor.value = savedFormat.color || '#000000'
        isBold.value = savedFormat.fontWeight === 'bold'
        isItalic.value = savedFormat.fontStyle === 'italic'
        isUnderline.value = savedFormat.textDecoration === 'underline'
        textAlign.value = savedFormat.textAlign || 'left'
      } else {
        // Fallback to default values (not from DOM to avoid placeholder styles)
        fontFamily.value = 'Microsoft YaHei'
        fontSize.value = 11
        fontColor.value = '#000000'
        isBold.value = false
        isItalic.value = false
        isUnderline.value = false
        textAlign.value = 'left'
      }
    })
  }
}, { deep: true })

const applyFormat = () => {
  // Emit format change event for selected fields
  window.dispatchEvent(new CustomEvent('format-change', {
    detail: {
      fontFamily: fontFamily.value,
      fontSize: fontSize.value,
      color: fontColor.value,
      fontWeight: isBold.value ? 'bold' : 'normal',
      fontStyle: isItalic.value ? 'italic' : 'normal',
      textDecoration: isUnderline.value ? 'underline' : 'none',
      textAlign: textAlign.value
    }
  }))
}

const toggleBold = () => {
  isBold.value = !isBold.value
  applyFormat()
}

const toggleItalic = () => {
  isItalic.value = !isItalic.value
  applyFormat()
}

const toggleUnderline = () => {
  isUnderline.value = !isUnderline.value
  applyFormat()
}

const setAlign = (align) => {
  textAlign.value = align
  applyFormat()
}
</script>

<style lang="scss" scoped>
.format-toolbar {
  position: sticky;
  top: 104px;
  z-index: 50;
  background: white;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 15px;
  border-right: 1px solid #e4e7ed;
  
  &:last-child {
    border-right: none;
    padding-right: 0;
  }
}

.toolbar-label {
  color: #909399;
  font-size: 12px;
  white-space: nowrap;
}

.toolbar-spacer {
  flex: 1;
}

.toolbar-info {
  display: flex;
  align-items: center;
  gap: 15px;
  
  .selected-info {
    font-size: 12px;
    color: #409eff;
    padding: 4px 8px;
    background: rgba(64, 158, 255, 0.1);
    border-radius: 4px;
  }
  
  .selection-hint {
    font-size: 12px;
    color: #909399;
  }
}
</style>
