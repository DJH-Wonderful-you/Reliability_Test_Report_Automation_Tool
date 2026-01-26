<template>
  <div 
    class="resizable-section"
    :class="{ 'is-resizing': isResizing }"
    :style="sectionStyle"
    ref="sectionRef"
  >
    <div class="section-header" v-if="title">
      <span class="section-title">{{ title }}</span>
    </div>
    <div class="section-content" ref="contentRef">
      <slot></slot>
    </div>
    <div 
      class="resize-handle"
      @mousedown="startResize"
    >
      <div class="handle-bar"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  minHeight: {
    type: Number,
    default: 50
  },
  autoHeight: {
    type: Boolean,
    default: true
  },
  initialHeight: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['height-change', 'overflow'])

const sectionRef = ref(null)
const contentRef = ref(null)
const isResizing = ref(false)
const manualHeight = ref(props.initialHeight)
const contentHeight = ref(0)

// A4 page height in pixels (297mm at 96 DPI approximately)
const A4_HEIGHT_PX = 1122

const sectionStyle = computed(() => {
  if (manualHeight.value !== null) {
    return {
      minHeight: `${manualHeight.value}px`
    }
  }
  return {
    minHeight: `${props.minHeight}px`
  }
})

// Start resize operation
const startResize = (e) => {
  e.preventDefault()
  isResizing.value = true
  
  const startY = e.clientY
  const startHeight = sectionRef.value.offsetHeight
  
  const onMouseMove = (moveEvent) => {
    const deltaY = moveEvent.clientY - startY
    const newHeight = Math.max(props.minHeight, startHeight + deltaY)
    manualHeight.value = newHeight
    emit('height-change', newHeight)
  }
  
  const onMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

// Check content height and emit overflow event
const checkContentHeight = () => {
  if (!contentRef.value) return
  
  nextTick(() => {
    const height = contentRef.value.scrollHeight
    contentHeight.value = height
    
    // Check if content overflows the section
    if (sectionRef.value) {
      const sectionHeight = sectionRef.value.offsetHeight
      if (height > sectionHeight) {
        emit('overflow', {
          contentHeight: height,
          sectionHeight: sectionHeight,
          overflow: height - sectionHeight
        })
      }
    }
  })
}

// Watch for content changes using MutationObserver
let observer = null

onMounted(() => {
  checkContentHeight()
  
  // Set up MutationObserver to watch for content changes
  if (contentRef.value) {
    observer = new MutationObserver(() => {
      checkContentHeight()
    })
    
    observer.observe(contentRef.value, {
      childList: true,
      subtree: true,
      characterData: true
    })
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

// Expose methods for parent component
defineExpose({
  checkContentHeight,
  getContentHeight: () => contentHeight.value,
  resetHeight: () => {
    manualHeight.value = null
  }
})
</script>

<style lang="scss" scoped>
.resizable-section {
  position: relative;
  transition: min-height 0.1s ease;
  
  &.is-resizing {
    transition: none;
    user-select: none;
  }
}

.section-header {
  .section-title {
    font-weight: 600;
    font-size: 12px;
    padding: 5px 0;
    border-bottom: 1px solid #000;
    margin-bottom: 8px;
    display: block;
  }
}

.section-content {
  overflow: visible;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
  cursor: ns-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
  
  .handle-bar {
    width: 40px;
    height: 3px;
    background: #409eff;
    border-radius: 2px;
  }
}

.resizable-section:hover .resize-handle {
  opacity: 0.5;
}
</style>
