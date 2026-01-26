<template>
  <div 
    class="image-uploader"
    :class="{ 'has-images': images.length > 0 }"
    @click="triggerUpload"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
    :style="{ borderColor: isDragging ? '#409eff' : undefined }"
  >
    <template v-if="images.length === 0">
      <div class="upload-placeholder">
        <el-icon :size="32"><Picture /></el-icon>
        <p>点击或拖拽上传图片</p>
      </div>
    </template>
    
    <template v-else>
      <div class="images-container" :class="layoutClass">
        <div 
          v-for="(img, index) in images" 
          :key="index"
          class="image-item"
          @click.stop
          draggable="true"
          @dragstart="handleImageDragStart(index, $event)"
          @dragover.prevent
          @drop.prevent="handleImageDrop(index, $event)"
        >
          <img :src="img.dataUrl" :alt="`Image ${index + 1}`" />
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
        
        <div 
          v-if="images.length < 9"
          class="add-more"
          @click.stop="triggerUpload"
        >
          <el-icon :size="24"><Plus /></el-icon>
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

const props = defineProps({
  images: {
    type: Array,
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

// Determine layout class based on image count
const layoutClass = computed(() => {
  const count = props.images.length
  if (count === 1) return 'layout-1'
  if (count === 2) return 'layout-2'
  if (count <= 4) return 'layout-4'
  return 'layout-9'
})

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (e) => {
  const files = Array.from(e.target.files || [])
  await processFiles(files)
  // Reset input to allow selecting same file again
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleDragOver = (e) => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = async (e) => {
  isDragging.value = false
  
  const files = []
  const items = e.dataTransfer?.items
  
  if (items) {
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        if (file && file.type.startsWith('image/')) {
          files.push(file)
        }
      }
    }
  }
  
  if (files.length > 0) {
    await processFiles(files)
  }
}

const processFiles = async (files) => {
  const validFiles = files.filter(file => file.type.startsWith('image/'))
  
  if (validFiles.length === 0) {
    ElMessage.warning('请选择有效的图片文件')
    return
  }
  
  const remainingSlots = props.maxImages - props.images.length
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
    emit('update', [...props.images, ...newImages])
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
  const newImages = [...props.images]
  newImages.splice(index, 1)
  emit('update', newImages)
}

// Image reordering via drag and drop
const handleImageDragStart = (index, e) => {
  draggedImageIndex.value = index
  e.dataTransfer.effectAllowed = 'move'
}

const handleImageDrop = (targetIndex, e) => {
  if (draggedImageIndex.value === null || draggedImageIndex.value === targetIndex) {
    return
  }
  
  const newImages = [...props.images]
  const [draggedImage] = newImages.splice(draggedImageIndex.value, 1)
  newImages.splice(targetIndex, 0, draggedImage)
  
  emit('update', newImages)
  draggedImageIndex.value = null
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

.images-container {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 4px;
  padding: 4px;
  
  &.layout-1 {
    grid-template-columns: 1fr;
  }
  
  &.layout-2 {
    grid-template-columns: 1fr 1fr;
  }
  
  &.layout-4 {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }
  
  &.layout-9 {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
  }
}

.image-item {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  background: #f0f0f0;
  cursor: move;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

.add-more {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  color: #909399;
  
  &:hover {
    border-color: #409eff;
    color: #409eff;
  }
}
</style>
