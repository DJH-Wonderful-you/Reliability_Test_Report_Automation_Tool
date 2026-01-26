<template>
  <div class="resizable-table-wrapper" ref="tableWrapper">
    <!-- Alignment guides -->
    <div 
      v-for="(guide, index) in visibleGuides" 
      :key="index"
      class="alignment-guide"
      :class="{ 'cross-table': guide.isCrossTable }"
      :style="getGuideStyle(guide)"
    ></div>
    
    <table 
      class="resizable-table" 
      :style="tableStyle"
      ref="tableRef"
    >
      <colgroup>
        <col 
          v-for="(width, index) in columnWidths" 
          :key="index" 
          :style="{ width: `${width}px` }"
        />
      </colgroup>
      <slot></slot>
    </table>
    
    <!-- Column resize handles -->
    <div 
      v-for="(pos, index) in resizeHandlePositions" 
      :key="`handle-${index}`"
      class="column-resize-handle"
      :class="{ 'is-dragging': isDragging && dragColumnIndex === index }"
      :style="{ left: `${pos}px` }"
      @mousedown="startResize($event, index)"
    >
      <div class="handle-line"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  // Initial column widths (array of numbers in pixels)
  initialWidths: {
    type: Array,
    default: () => []
  },
  // Minimum column width
  minWidth: {
    type: Number,
    default: 40
  },
  // Snap threshold in pixels (how close to snap to alignment)
  snapThreshold: {
    type: Number,
    default: 5
  },
  // Table total width (fixed, will be calculated from initial widths if not provided)
  totalWidth: {
    type: Number,
    default: null
  },
  // External edges from other tables for cross-table alignment
  externalEdges: {
    type: Array,
    default: () => []
  },
  // Unique table identifier for cross-table alignment
  tableId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['column-resize', 'widths-change', 'edges-change'])

const tableWrapper = ref(null)
const tableRef = ref(null)
const columnWidths = ref([])
const fixedTotalWidth = ref(0) // Store fixed total width to prevent overflow
const isDragging = ref(false)
const dragColumnIndex = ref(-1)
const dragStartX = ref(0)
const dragStartLeftWidth = ref(0) // Width of left column at drag start
const dragStartRightWidth = ref(0) // Width of right column at drag start
const visibleGuides = ref([]) // Now stores objects: { position: number, isCrossTable: boolean }
const currentEdgePosition = ref(0) // Track current edge position for alignment guide

// Get alignment guide style
const getGuideStyle = (guide) => {
  if (typeof guide === 'number') {
    return { left: `${guide}px` }
  }
  return { left: `${guide.position}px` }
}

// Calculate resize handle positions (internal borders only)
const resizeHandlePositions = computed(() => {
  const positions = []
  let accumulator = 0
  // Only create handles for internal borders (not first left or last right)
  for (let i = 0; i < columnWidths.value.length - 1; i++) {
    accumulator += columnWidths.value[i]
    positions.push(accumulator)
  }
  return positions
})

// Table style - use fixed total width
const tableStyle = computed(() => {
  if (fixedTotalWidth.value > 0) {
    return { width: `${fixedTotalWidth.value}px` }
  }
  return { width: '100%' }
})

// Calculate all edge positions for this table
const calculateEdges = () => {
  const edges = []
  let accumulator = 0
  
  for (let i = 0; i < columnWidths.value.length; i++) {
    edges.push(accumulator) // Left edge of column
    accumulator += columnWidths.value[i]
  }
  edges.push(accumulator) // Right edge of last column
  
  return edges
}

// Emit edges change event
const emitEdgesChange = () => {
  if (props.tableId) {
    emit('edges-change', {
      tableId: props.tableId,
      edges: calculateEdges()
    })
  }
}

// Initialize column widths from table
const initColumnWidths = () => {
  if (props.initialWidths.length > 0) {
    columnWidths.value = [...props.initialWidths]
    // Calculate fixed total width
    fixedTotalWidth.value = props.totalWidth || props.initialWidths.reduce((sum, w) => sum + w, 0)
    nextTick(() => emitEdgesChange())
    return
  }
  
  nextTick(() => {
    if (!tableRef.value) return
    
    const cells = tableRef.value.querySelectorAll('tr:first-child > *')
    const widths = []
    
    cells.forEach(cell => {
      widths.push(cell.offsetWidth)
    })
    
    if (widths.length > 0) {
      columnWidths.value = widths
      // Set fixed total width from actual table width
      fixedTotalWidth.value = props.totalWidth || widths.reduce((sum, w) => sum + w, 0)
      emitEdgesChange()
    }
  })
}

// Start column resize - resize affects both left and right columns
const startResize = (e, columnIndex) => {
  e.preventDefault()
  e.stopPropagation()
  
  isDragging.value = true
  dragColumnIndex.value = columnIndex
  dragStartX.value = e.clientX
  // Store both left and right column widths at drag start
  dragStartLeftWidth.value = columnWidths.value[columnIndex]
  dragStartRightWidth.value = columnWidths.value[columnIndex + 1]
  
  // Calculate initial edge position
  let edgePos = 0
  for (let i = 0; i <= columnIndex; i++) {
    edgePos += columnWidths.value[i]
  }
  currentEdgePosition.value = edgePos
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  
  // Add body class to prevent text selection
  document.body.classList.add('resizing-column')
}

// Handle resize movement - adjust both adjacent columns
const handleResize = (e) => {
  if (!isDragging.value) return
  
  const deltaX = e.clientX - dragStartX.value
  
  // Calculate new widths for both columns
  let newLeftWidth = dragStartLeftWidth.value + deltaX
  let newRightWidth = dragStartRightWidth.value - deltaX
  
  // Enforce minimum widths
  if (newLeftWidth < props.minWidth) {
    newLeftWidth = props.minWidth
    newRightWidth = dragStartLeftWidth.value + dragStartRightWidth.value - props.minWidth
  }
  if (newRightWidth < props.minWidth) {
    newRightWidth = props.minWidth
    newLeftWidth = dragStartLeftWidth.value + dragStartRightWidth.value - props.minWidth
  }
  
  // Calculate the new edge position
  let newEdgePosition = 0
  for (let i = 0; i < dragColumnIndex.value; i++) {
    newEdgePosition += columnWidths.value[i]
  }
  newEdgePosition += newLeftWidth
  
  // Check for snap alignment with other column edges (including external edges)
  const snapResult = findSnapPosition(newEdgePosition, dragColumnIndex.value)
  
  if (snapResult.snapped) {
    // Calculate how much to adjust
    const adjustment = snapResult.position - newEdgePosition
    newLeftWidth += adjustment
    newRightWidth -= adjustment
    
    // Re-check minimum widths after snap adjustment
    if (newLeftWidth >= props.minWidth && newRightWidth >= props.minWidth) {
      newEdgePosition = snapResult.position
      visibleGuides.value = [{ position: snapResult.position, isCrossTable: snapResult.isCrossTable }]
    } else {
      visibleGuides.value = []
    }
  } else {
    visibleGuides.value = []
  }
  
  // Update current edge position for guide
  currentEdgePosition.value = newEdgePosition
  
  // Update column widths - only change the two adjacent columns
  const newWidths = [...columnWidths.value]
  newWidths[dragColumnIndex.value] = newLeftWidth
  newWidths[dragColumnIndex.value + 1] = newRightWidth
  columnWidths.value = newWidths
  
  emit('column-resize', { 
    columnIndex: dragColumnIndex.value, 
    leftWidth: newLeftWidth,
    rightWidth: newRightWidth
  })
}

// Find snap position based on other column edges (excluding the two being resized)
// Also checks external edges from other tables for cross-table alignment
const findSnapPosition = (position, leftColumnIndex) => {
  const rightColumnIndex = leftColumnIndex + 1
  const internalEdges = []
  let accumulator = 0
  
  // Collect all internal edges except those of the two columns being resized
  for (let i = 0; i < columnWidths.value.length; i++) {
    // Add left edge of column (if not one of the resizing columns)
    if (i !== leftColumnIndex && i !== rightColumnIndex) {
      internalEdges.push(accumulator)
    }
    accumulator += columnWidths.value[i]
    // Add right edge of column (if not one of the resizing columns)
    if (i !== leftColumnIndex && i !== rightColumnIndex) {
      internalEdges.push(accumulator)
    }
  }
  
  // First check internal edges (same table) - higher priority
  for (const edge of internalEdges) {
    if (Math.abs(position - edge) <= props.snapThreshold) {
      return { snapped: true, position: edge, isCrossTable: false }
    }
  }
  
  // Then check external edges (other tables) for cross-table alignment
  for (const edge of props.externalEdges) {
    if (Math.abs(position - edge) <= props.snapThreshold) {
      return { snapped: true, position: edge, isCrossTable: true }
    }
  }
  
  return { snapped: false, position, isCrossTable: false }
}

// Stop resize
const stopResize = () => {
  isDragging.value = false
  dragColumnIndex.value = -1
  visibleGuides.value = []
  
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.classList.remove('resizing-column')
  
  emit('widths-change', [...columnWidths.value])
  // Emit edges change after resize is complete
  emitEdgesChange()
}

// Watch for initial widths changes
watch(() => props.initialWidths, (newWidths) => {
  if (newWidths.length > 0) {
    columnWidths.value = [...newWidths]
    fixedTotalWidth.value = props.totalWidth || newWidths.reduce((sum, w) => sum + w, 0)
    nextTick(() => emitEdgesChange())
  }
}, { immediate: true })

onMounted(() => {
  initColumnWidths()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.classList.remove('resizing-column')
})

// Expose methods
defineExpose({
  getColumnWidths: () => [...columnWidths.value],
  setColumnWidths: (widths) => {
    columnWidths.value = [...widths]
    fixedTotalWidth.value = props.totalWidth || widths.reduce((sum, w) => sum + w, 0)
    nextTick(() => emitEdgesChange())
  },
  resetWidths: () => {
    initColumnWidths()
  },
  getEdges: () => calculateEdges()
})
</script>

<style lang="scss" scoped>
.resizable-table-wrapper {
  position: relative;
  overflow: visible;
}

.resizable-table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  font-size: 11px;
  margin-bottom: 10px;
  
  :deep(td), :deep(th) {
    border: 1px solid #000;
    padding: 4px 8px;
    vertical-align: middle;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  :deep(th) {
    background-color: #f5f5f5;
    font-weight: 600;
  }
  
  :deep(.label-cell) {
    background-color: #f5f5f5;
    font-weight: 500;
    text-align: center;
  }
  
  :deep(.editable-cell) {
    padding: 0;
  }
  
  :deep(.text-center) {
    text-align: center;
  }
}

.column-resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  transform: translateX(-4px);
  cursor: col-resize;
  z-index: 10;
  
  &:hover, &.is-dragging {
    .handle-line {
      opacity: 1;
      background: #409eff;
    }
  }
  
  .handle-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 2px;
    transform: translateX(-50%);
    background: #409eff;
    opacity: 0;
    transition: opacity 0.2s;
  }
}

.alignment-guide {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #e74c3c;
  z-index: 20;
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -3px;
    width: 7px;
    height: 7px;
    background: #e74c3c;
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: -3px;
    width: 7px;
    height: 7px;
    background: #e74c3c;
    border-radius: 50%;
  }
  
  // Cross-table alignment guide - different color and extended height
  &.cross-table {
    background: #3498db;
    // Extend above and below the table to show cross-table alignment
    top: -200px;
    bottom: -200px;
    z-index: 100;
    
    &::before {
      background: #3498db;
      top: 195px; // Adjust to be near the top of the table
    }
    
    &::after {
      background: #3498db;
      bottom: 195px; // Adjust to be near the bottom of the table
    }
  }
}
</style>

<style>
/* Global style to prevent text selection during resize */
body.resizing-column {
  cursor: col-resize !important;
  user-select: none !important;
}

body.resizing-column * {
  cursor: col-resize !important;
}
</style>
