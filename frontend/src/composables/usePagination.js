import { ref, computed, watch, nextTick } from 'vue'

/**
 * Pagination composable for multi-page PDF report generation
 * Handles content measurement, page break calculation, and content distribution
 */

// A4 page dimensions
const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297

// Page padding in mm
const PAGE_PADDING = {
  top: 10,
  bottom: 15,
  left: 15,
  right: 15
}

// Convert mm to pixels (at 96 DPI, 1mm ≈ 3.78px)
const MM_TO_PX = 3.78

// Page dimensions in pixels
const A4_WIDTH_PX = Math.round(A4_WIDTH_MM * MM_TO_PX)  // ~794px
const A4_HEIGHT_PX = Math.round(A4_HEIGHT_MM * MM_TO_PX) // ~1123px

// Header height in pixels (company name, title, record code, report number, test project table)
const HEADER_HEIGHT_PX = 120

// Footer height in pixels (signatures, remarks)
const FOOTER_HEIGHT_PX = 100

// Padding in pixels
const PADDING_TOP_PX = Math.round(PAGE_PADDING.top * MM_TO_PX)
const PADDING_BOTTOM_PX = Math.round(PAGE_PADDING.bottom * MM_TO_PX)

// Usable content height per page (excluding header, footer, and paddings)
const USABLE_CONTENT_HEIGHT = A4_HEIGHT_PX - HEADER_HEIGHT_PX - FOOTER_HEIGHT_PX - PADDING_TOP_PX - PADDING_BOTTOM_PX

// Section header height (for repeated headers on continuation pages)
const SECTION_HEADER_HEIGHT = 30

// Table header row height
const TABLE_HEADER_HEIGHT = 30

// Minimum row height for tables
const MIN_ROW_HEIGHT = 35

// Image row height (approximate)
const IMAGE_ROW_HEIGHT = 180

/**
 * Content region types
 */
export const RegionType = {
  REPORT_INFO: 'reportInfo',
  SAMPLE_INFO: 'sampleInfo', 
  EQUIPMENT_INFO: 'equipmentInfo',
  TEST_CONDITIONS: 'testConditions',
  TEST_RESULTS: 'testResults',
  TEST_IMAGES: 'testImages',
  JUDGMENT_RESULT: 'judgmentResult'
}

/**
 * Create a content region object
 */
export function createRegion(type, height, data = {}, splittable = false) {
  return {
    type,
    height,
    data,
    splittable,
    isContinuation: false,
    startIndex: 0,
    endIndex: null
  }
}

/**
 * Main pagination composable
 */
export function usePagination() {
  // Content regions with measured heights
  const contentRegions = ref([])
  
  // Distributed pages
  const pages = ref([])
  
  // Total page count
  const totalPages = computed(() => pages.value.length)
  
  // Reference to measurement container (hidden)
  const measurementContainer = ref(null)
  
  /**
   * Register content regions with their heights
   */
  const registerRegions = (regions) => {
    contentRegions.value = regions
    recalculatePages()
  }
  
  /**
   * Update a specific region's height
   */
  const updateRegionHeight = (type, height) => {
    const region = contentRegions.value.find(r => r.type === type)
    if (region) {
      region.height = height
      recalculatePages()
    }
  }
  
  /**
   * Measure element height
   */
  const measureHeight = (element) => {
    if (!element) return 0
    return element.getBoundingClientRect().height
  }
  
  /**
   * Split a region that spans multiple pages
   */
  const splitRegion = (region, availableHeight, usableHeight) => {
    const parts = []
    
    if (region.type === RegionType.TEST_RESULTS) {
      // Split test results table by rows
      const rows = region.data.rows || []
      const headerHeight = TABLE_HEADER_HEIGHT + SECTION_HEADER_HEIGHT
      const rowHeight = region.data.rowHeight || MIN_ROW_HEIGHT
      
      let currentStart = region.startIndex || 0
      let remainingHeight = availableHeight
      
      // First part - check if we need to account for section header
      if (!region.isContinuation) {
        remainingHeight -= headerHeight
      } else {
        remainingHeight -= TABLE_HEADER_HEIGHT // Just table header for continuation
      }
      
      const rowsInFirstPart = Math.max(0, Math.floor(remainingHeight / rowHeight))
      
      if (rowsInFirstPart > 0 && currentStart < rows.length) {
        const endIndex = Math.min(currentStart + rowsInFirstPart, rows.length)
        parts.push({
          ...region,
          height: (rowsInFirstPart * rowHeight) + (region.isContinuation ? TABLE_HEADER_HEIGHT : headerHeight),
          startIndex: currentStart,
          endIndex: endIndex,
          isContinuation: region.isContinuation
        })
        currentStart = endIndex
      }
      
      // Additional parts for remaining rows
      while (currentStart < rows.length) {
        const contentHeight = usableHeight - SECTION_HEADER_HEIGHT - TABLE_HEADER_HEIGHT
        const rowsPerPage = Math.floor(contentHeight / rowHeight)
        const endIndex = Math.min(currentStart + rowsPerPage, rows.length)
        
        parts.push({
          ...region,
          height: ((endIndex - currentStart) * rowHeight) + SECTION_HEADER_HEIGHT + TABLE_HEADER_HEIGHT,
          startIndex: currentStart,
          endIndex: endIndex,
          isContinuation: true
        })
        currentStart = endIndex
      }
      
    } else if (region.type === RegionType.TEST_IMAGES) {
      // Split image rows
      const imageRows = region.data.rows || []
      const rowHeight = region.data.rowHeight || IMAGE_ROW_HEIGHT
      const headerHeight = SECTION_HEADER_HEIGHT
      
      let currentStart = region.startIndex || 0
      let remainingHeight = availableHeight
      
      // Account for section header
      if (!region.isContinuation) {
        remainingHeight -= headerHeight
      }
      
      const rowsInFirstPart = Math.max(0, Math.floor(remainingHeight / rowHeight))
      
      if (rowsInFirstPart > 0 && currentStart < imageRows.length) {
        const endIndex = Math.min(currentStart + rowsInFirstPart, imageRows.length)
        parts.push({
          ...region,
          height: (rowsInFirstPart * rowHeight) + (region.isContinuation ? 0 : headerHeight),
          startIndex: currentStart,
          endIndex: endIndex,
          isContinuation: region.isContinuation
        })
        currentStart = endIndex
      }
      
      // Additional parts for remaining image rows
      while (currentStart < imageRows.length) {
        const contentHeight = usableHeight - SECTION_HEADER_HEIGHT
        const rowsPerPage = Math.floor(contentHeight / rowHeight)
        const endIndex = Math.min(currentStart + rowsPerPage, imageRows.length)
        
        parts.push({
          ...region,
          height: ((endIndex - currentStart) * rowHeight) + SECTION_HEADER_HEIGHT,
          startIndex: currentStart,
          endIndex: endIndex,
          isContinuation: true
        })
        currentStart = endIndex
      }
    }
    
    return parts
  }
  
  /**
   * Distribute content across pages
   */
  const distributeContent = (regions, usableHeight) => {
    const resultPages = []
    let currentPage = { 
      regions: [], 
      remainingHeight: usableHeight,
      pageNumber: 1
    }
    
    for (let i = 0; i < regions.length; i++) {
      const region = regions[i]
      
      if (region.height <= currentPage.remainingHeight) {
        // Fits on current page
        currentPage.regions.push({ ...region })
        currentPage.remainingHeight -= region.height
      } else if (region.splittable) {
        // Split across pages
        const parts = splitRegion(region, currentPage.remainingHeight, usableHeight)
        
        for (let j = 0; j < parts.length; j++) {
          const part = parts[j]
          
          if (j === 0 && part.height <= currentPage.remainingHeight) {
            // First part fits on current page
            currentPage.regions.push(part)
            currentPage.remainingHeight -= part.height
          } else {
            // Start new page for this part
            if (currentPage.regions.length > 0 || j > 0) {
              resultPages.push(currentPage)
              currentPage = {
                regions: [],
                remainingHeight: usableHeight,
                pageNumber: resultPages.length + 1
              }
            }
            currentPage.regions.push(part)
            currentPage.remainingHeight -= part.height
          }
        }
      } else {
        // Non-splittable region doesn't fit - start new page
        if (currentPage.regions.length > 0) {
          resultPages.push(currentPage)
          currentPage = {
            regions: [],
            remainingHeight: usableHeight,
            pageNumber: resultPages.length + 1
          }
        }
        currentPage.regions.push({ ...region })
        currentPage.remainingHeight -= region.height
      }
    }
    
    // Add the last page if it has content
    if (currentPage.regions.length > 0) {
      resultPages.push(currentPage)
    }
    
    return resultPages
  }
  
  /**
   * Recalculate page distribution
   */
  const recalculatePages = () => {
    if (contentRegions.value.length === 0) {
      pages.value = []
      return
    }
    
    pages.value = distributeContent(contentRegions.value, USABLE_CONTENT_HEIGHT)
  }
  
  /**
   * Get regions for a specific page
   */
  const getPageRegions = (pageIndex) => {
    if (pageIndex < 0 || pageIndex >= pages.value.length) {
      return []
    }
    return pages.value[pageIndex].regions
  }
  
  /**
   * Check if a region type exists on a specific page
   */
  const hasRegionOnPage = (pageIndex, regionType) => {
    const pageRegions = getPageRegions(pageIndex)
    return pageRegions.some(r => r.type === regionType)
  }
  
  /**
   * Get test result rows for a specific page
   */
  const getTestResultRowsForPage = (pageIndex, allRows) => {
    const pageRegions = getPageRegions(pageIndex)
    const resultRegion = pageRegions.find(r => r.type === RegionType.TEST_RESULTS)
    
    if (!resultRegion) return { rows: [], isContinuation: false }
    
    const startIdx = resultRegion.startIndex || 0
    const endIdx = resultRegion.endIndex !== null ? resultRegion.endIndex : allRows.length
    
    return {
      rows: allRows.slice(startIdx, endIdx),
      isContinuation: resultRegion.isContinuation,
      startIndex: startIdx
    }
  }
  
  /**
   * Get image rows for a specific page
   */
  const getImageRowsForPage = (pageIndex, allRows) => {
    const pageRegions = getPageRegions(pageIndex)
    const imageRegion = pageRegions.find(r => r.type === RegionType.TEST_IMAGES)
    
    if (!imageRegion) return { rows: [], isContinuation: false }
    
    const startIdx = imageRegion.startIndex || 0
    const endIdx = imageRegion.endIndex !== null ? imageRegion.endIndex : allRows.length
    
    return {
      rows: allRows.slice(startIdx, endIdx),
      isContinuation: imageRegion.isContinuation,
      startIndex: startIdx
    }
  }
  
  // Watch for changes and recalculate
  watch(contentRegions, recalculatePages, { deep: true })
  
  return {
    // State
    contentRegions,
    pages,
    totalPages,
    measurementContainer,
    
    // Constants
    A4_WIDTH_PX,
    A4_HEIGHT_PX,
    USABLE_CONTENT_HEIGHT,
    HEADER_HEIGHT_PX,
    FOOTER_HEIGHT_PX,
    SECTION_HEADER_HEIGHT,
    TABLE_HEADER_HEIGHT,
    MIN_ROW_HEIGHT,
    IMAGE_ROW_HEIGHT,
    
    // Methods
    registerRegions,
    updateRegionHeight,
    measureHeight,
    recalculatePages,
    getPageRegions,
    hasRegionOnPage,
    getTestResultRowsForPage,
    getImageRowsForPage,
    createRegion,
    
    // Region types
    RegionType
  }
}

export default usePagination
