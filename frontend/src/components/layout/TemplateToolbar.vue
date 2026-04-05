<template>
  <div class="template-format-toolbar">
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
        已选择 {{ selectedCount }} 个文本区域
      </span>
      <span v-else class="hint-info">
        Ctrl+点击多选 | Shift+拖拽框选
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useTemplateStore } from '@/stores/template'
import {
  DEFAULT_FONT_COLOR,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  getPrimaryFontFamily,
  isBoldLikeFontWeight,
  normalizeColorValue,
  normalizeTextAlign
} from '@/utils/textFormat'

// Icons (simplified names for template)
const AlignLeft = { template: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h18v2H3V3zm0 8h12v2H3v-2zm0 8h18v2H3v-2zm0-4h12v2H3v-2z"/></svg>' }
const AlignCenter = { template: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h18v2H3V3zm3 8h12v2H6v-2zm-3 8h18v2H3v-2zm3-4h12v2H6v-2z"/></svg>' }
const AlignRight = { template: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h18v2H3V3zm6 8h12v2H9v-2zm-6 8h18v2H3v-2zm6-4h12v2H9v-2z"/></svg>' }

const props = defineProps({
  selectedElements: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['format-change'])

const templateStore = useTemplateStore()

// Format state
const fontFamily = ref('Microsoft YaHei')
const fontSize = ref(11)
const fontColor = ref('#000000')
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)
const textAlign = ref('left')

const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48]

const selectedCount = computed(() => props.selectedElements.length)

const syncToolbarFromElement = (element) => {
  if (!element) return

  const computedStyle = window.getComputedStyle(element)
  fontFamily.value = getPrimaryFontFamily(computedStyle.fontFamily)
  fontSize.value = parseInt(computedStyle.fontSize, 10) || DEFAULT_FONT_SIZE
  fontColor.value = normalizeColorValue(computedStyle.color)
  isBold.value = isBoldLikeFontWeight(computedStyle.fontWeight)
  isItalic.value = computedStyle.fontStyle === 'italic'
  isUnderline.value = computedStyle.textDecoration?.includes('underline')
  textAlign.value = normalizeTextAlign(computedStyle.textAlign, 'left')
}

// Watch for selected elements changes to update toolbar display
watch(() => props.selectedElements, (newSelection) => {
  if (newSelection.length > 0) {
    nextTick(() => {
      syncToolbarFromElement(newSelection[0])
    })
  }
}, { deep: true })

const applyFormat = () => {
  // Only apply format if there are selected elements
  if (props.selectedElements.length === 0) {
    return
  }
  
  const format = {
    fontFamily: fontFamily.value,
    fontSize: fontSize.value,
    color: fontColor.value,
    fontWeight: isBold.value ? 'bold' : 'normal',
    fontStyle: isItalic.value ? 'italic' : 'normal',
    textDecoration: isUnderline.value ? 'underline' : 'none',
    textAlign: textAlign.value
  }
  
  // Emit format change event to apply to selected elements only
  emit('format-change', format)
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

// Initialize with template store values
onMounted(() => {
  fontFamily.value = templateStore.fixedTextStyles.fontFamily || DEFAULT_FONT_FAMILY
  fontSize.value = templateStore.fixedTextStyles.fontSize || DEFAULT_FONT_SIZE
  fontColor.value = templateStore.fixedTextStyles.color || DEFAULT_FONT_COLOR
})
</script>

<style lang="scss" scoped>
.template-format-toolbar {
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
  .selected-info {
    font-size: 12px;
    color: #409eff;
    padding: 4px 8px;
    background: rgba(64, 158, 255, 0.1);
    border-radius: 4px;
  }
  
  .hint-info {
    font-size: 12px;
    color: #909399;
  }
}
</style>
