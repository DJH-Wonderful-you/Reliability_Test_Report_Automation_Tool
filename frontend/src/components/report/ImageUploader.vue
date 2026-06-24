<template>
  <div
    class="image-uploader"
    :class="{ 'has-images': imageCount > 0 }"
    @click="handleContainerClick"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
    :style="{ borderColor: isDragging ? '#409eff' : undefined }"
  >
    <template v-if="imageCount === 0">
      <div class="upload-placeholder">
        <el-icon :size="32"><Picture /></el-icon>
        <p>点击或拖拽上传图片</p>
      </div>
    </template>

    <template v-else>
      <div class="images-shell">
        <div v-if="showToolbar" class="image-toolbar" @click.stop>
          <div v-if="layoutOptions.length > 1" class="layout-controls">
            <el-popover
              trigger="click"
              placement="bottom-start"
              width="220"
              popper-class="image-layout-popover"
            >
              <template #reference>
                <button type="button" class="layout-button" @click.stop>
                  布局：{{ currentLayoutLabel }}
                </button>
              </template>

              <div class="image-layout-menu" @click.stop>
                <button
                  v-for="option in layoutOptions"
                  :key="option.value"
                  type="button"
                  class="image-layout-option"
                  :class="{ active: resolvedLayout === option.value }"
                  @click.stop="handleLayoutChange(option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </el-popover>
          </div>

          <button
            v-if="canAddMore"
            type="button"
            class="add-more-button"
            @click.stop="triggerUpload"
          >
            <el-icon :size="14"><Plus /></el-icon>
            <span>添加</span>
          </button>
        </div>

        <div
          class="images-container"
          :class="containerClasses"
          :style="layoutStyle"
        >
          <div
            v-for="(img, index) in imageList"
            :key="getImageKey(img)"
            class="image-item"
            :class="{
              'is-drag-source': draggedImageIndex === index,
              'is-drag-target': dragOverImageIndex === index
            }"
            @click.stop
            draggable="true"
            @dragstart="handleImageDragStart(index, $event)"
            @dragend="handleImageDragEnd"
            @dragover.prevent.stop="handleImageDragOver(index, $event)"
            @drop.prevent.stop="handleImageDrop(index, $event)"
          >
            <img :src="img.dataUrl" :alt="`Image ${index + 1}`" draggable="false" />
            <div class="image-actions">
              <el-button
                type="danger"
                size="small"
                circle
                @click.stop="removeImage(index)"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      style="display: none;"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Picture, Close, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getImageLayoutOptions,
  normalizeImageCell,
  resolveImageLayout,
  updateImageCellImages,
  updateImageCellLayout
} from '@/stores/report'

const props = defineProps({
  images: {
    type: [Array, Object],
    default: () => []
  },
  position: {
    type: String,
    default: 'before'
  },
  maxImages: {
    type: Number,
    default: 9
  }
})

const emit = defineEmits(['update'])

const fileInput = ref(null)
const isDragging = ref(false)
const draggedImageIndex = ref(null)
const dragOverImageIndex = ref(null)
const INTERNAL_IMAGE_DRAG_TYPE = 'application/x-report-image-index'
const imageKeyMap = new WeakMap()
let imageKeySeed = 0

const imageCell = computed(() => normalizeImageCell(props.images))
const imageList = computed(() => imageCell.value.images)
const imageCount = computed(() => imageList.value.length)
const resolvedLayout = computed(() => resolveImageLayout(imageCell.value))
const layoutOptions = computed(() => getImageLayoutOptions(imageCount.value))
const currentLayoutLabel = computed(() => {
  return layoutOptions.value.find(option => option.value === resolvedLayout.value)?.label || '自动'
})
const canAddMore = computed(() => imageCount.value < props.maxImages)
const showToolbar = computed(() => layoutOptions.value.length > 1 || canAddMore.value)
const containerClasses = computed(() => [
  `layout-${resolvedLayout.value}`,
  `count-${Math.min(imageCount.value, 9)}`
])

const layoutStyle = computed(() => {
  const count = imageCount.value

  if (count <= 1) {
    return {
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'minmax(0, 1fr)'
    }
  }

  if (resolvedLayout.value === 'horizontal') {
    return {
      gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
      gridTemplateRows: 'minmax(0, 1fr)'
    }
  }

  if (resolvedLayout.value === 'vertical') {
    return {
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: `repeat(${count}, minmax(0, 1fr))`
    }
  }

  const size = count <= 4 ? 2 : 3
  return {
    gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`
  }
})

const getImageKey = (image) => {
  if (!image || typeof image !== 'object') {
    return `image-${String(image)}`
  }

  if (!imageKeyMap.has(image)) {
    imageKeyMap.set(image, `image-${imageKeySeed++}`)
  }

  return imageKeyMap.get(image)
}

const emitUpdatedCell = (nextCell) => {
  emit('update', normalizeImageCell(nextCell))
}

const emitUpdatedImages = (nextImages) => {
  emitUpdatedCell(updateImageCellImages(imageCell.value, nextImages))
}

const handleContainerClick = () => {
  if (imageCount.value === 0) {
    triggerUpload()
  }
}

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleLayoutChange = (layout) => {
  emitUpdatedCell(updateImageCellLayout(imageCell.value, layout))
}

const handleFileSelect = async (e) => {
  const files = Array.from(e.target.files || [])
  await processFiles(files)
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleDragOver = (e) => {
  if (draggedImageIndex.value !== null || isInternalImageDrag(e)) {
    return
  }
  isDragging.value = true
}

const handleDragLeave = () => {
  if (draggedImageIndex.value !== null) {
    return
  }
  isDragging.value = false
}

const handleDrop = async (e) => {
  isDragging.value = false

  if (isInternalImageDrag(e)) {
    handleImageDragEnd()
    return
  }

  const files = extractImageFiles(e)
  if (files.length > 0) {
    await processFiles(files)
  }
}

const extractImageFiles = (e) => {
  const files = []
  const items = e.dataTransfer?.items

  if (items?.length) {
    for (const item of items) {
      if (item.kind !== 'file') {
        continue
      }

      const file = item.getAsFile()
      if (file && file.type.startsWith('image/')) {
        files.push(file)
      }
    }
  }

  if (!files.length) {
    return Array.from(e.dataTransfer?.files || []).filter(file => file.type.startsWith('image/'))
  }

  return files
}

const processFiles = async (files) => {
  const validFiles = files.filter(file => file.type.startsWith('image/'))

  if (validFiles.length === 0) {
    ElMessage.warning('请选择有效的图片文件')
    return
  }

  const remainingSlots = props.maxImages - imageCount.value
  const filesToProcess = validFiles.slice(0, remainingSlots)

  if (validFiles.length > remainingSlots) {
    ElMessage.warning(`最多只能上传 ${props.maxImages} 张图片`)
  }

  const newImages = []

  for (const file of filesToProcess) {
    try {
      const dataUrl = await readFileAsDataUrl(file)
      newImages.push({
        filename: file.name,
        dataUrl
      })
    } catch (error) {
      console.error('Error reading file:', error)
    }
  }

  if (newImages.length > 0) {
    emitUpdatedImages([...imageList.value, ...newImages])
  }
}

const readFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const removeImage = (index) => {
  const newImages = [...imageList.value]
  newImages.splice(index, 1)
  emitUpdatedImages(newImages)
}

const isInternalImageDrag = (e) => Array.from(e.dataTransfer?.types || []).includes(INTERNAL_IMAGE_DRAG_TYPE)

const getDraggedImageIndex = (e) => {
  const rawIndex = e.dataTransfer?.getData(INTERNAL_IMAGE_DRAG_TYPE)
  const parsedIndex = Number.parseInt(rawIndex, 10)
  return Number.isInteger(parsedIndex) ? parsedIndex : draggedImageIndex.value
}

const handleImageDragStart = (index, e) => {
  draggedImageIndex.value = index
  dragOverImageIndex.value = index
  isDragging.value = false
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.dropEffect = 'move'
  e.dataTransfer.setData(INTERNAL_IMAGE_DRAG_TYPE, String(index))
  e.dataTransfer.setData('text/plain', String(index))
}

const handleImageDragOver = (index, e) => {
  if (!isInternalImageDrag(e) && draggedImageIndex.value === null) {
    return
  }

  dragOverImageIndex.value = index
  e.dataTransfer.dropEffect = 'move'
}

const handleImageDragEnd = () => {
  draggedImageIndex.value = null
  dragOverImageIndex.value = null
  isDragging.value = false
}

const handleImageDrop = async (targetIndex, e) => {
  if (!isInternalImageDrag(e) && draggedImageIndex.value === null) {
    await handleDrop(e)
    return
  }

  const sourceIndex = getDraggedImageIndex(e)
  if (sourceIndex === null || sourceIndex === targetIndex) {
    handleImageDragEnd()
    return
  }

  const newImages = [...imageList.value]
  const [draggedImage] = newImages.splice(sourceIndex, 1)
  if (!draggedImage) {
    handleImageDragEnd()
    return
  }

  newImages.splice(targetIndex, 0, draggedImage)
  emitUpdatedImages(newImages)
  handleImageDragEnd()
}
</script>

<style lang="scss" scoped>
.image-uploader {
  width: 100%;
  aspect-ratio: 1;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #fafafa;
  overflow: hidden;
  position: relative;

  &:hover {
    border-color: #409eff;
    background-color: rgba(64, 158, 255, 0.02);
  }

  &.has-images {
    border-style: solid;
    cursor: default;
    align-items: stretch;
    justify-content: stretch;
  }
}

.upload-placeholder {
  text-align: center;
  color: #909399;

  p {
    font-size: 12px;
    margin-top: 8px;
  }
}

.images-shell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.image-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 4px 4px 0;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.layout-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.layout-button,
.add-more-button {
  border: 1px solid #dcdfe6;
  border-radius: 999px;
  background: #ffffff;
  color: #606266;
  font-size: 11px;
  line-height: 1;
  padding: 4px 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.layout-button:hover,
.add-more-button:hover {
  border-color: #409eff;
  color: #409eff;
}

.layout-button.active {
  border-color: #409eff;
  background: #ecf5ff;
  color: #409eff;
}

:global(.image-layout-popover .image-layout-menu) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

:global(.image-layout-popover .image-layout-option) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #ffffff;
  color: #606266;
  font-size: 12px;
  line-height: 1.2;
  padding: 6px 8px;
  cursor: pointer;
  text-align: center;
}

:global(.image-layout-popover .image-layout-option:hover),
:global(.image-layout-popover .image-layout-option.active) {
  border-color: #409eff;
  background: #ecf5ff;
  color: #409eff;
}

.images-container {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  gap: 4px;
  padding: 4px;
}

.images-container.layout-grid.count-3 {
  .image-item:last-child:nth-child(3) {
    grid-column: 1 / -1;
  }
}

.images-container.layout-grid-bottom-wide.count-3 {
  .image-item:last-child:nth-child(3) {
    grid-column: 1 / -1;
  }
}

.images-container.layout-grid-top-wide.count-3 {
  .image-item:first-child:nth-child(1) {
    grid-column: 1 / -1;
  }
}

.images-container.layout-grid-2x2.count-3 {
  .image-item {
    grid-column: auto;
  }
}

.image-item {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  background: #f0f0f0;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  transition: box-shadow 0.2s ease, opacity 0.2s ease;

  &.is-drag-source {
    opacity: 0.6;
  }

  &.is-drag-target {
    box-shadow: inset 0 0 0 2px #409eff;
  }

  img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    object-position: center;
  }

  .image-actions {
    position: absolute;
    top: 2px;
    right: 2px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .image-actions {
    opacity: 1;
  }
}
</style>
