<template>
  <div class="general-template" ref="templateRef">
    <el-skeleton v-if="loading" :rows="20" animated />
    
    <template v-else>
      <!-- Multi-page rendering -->
      <template v-for="(page, pageIndex) in paginatedPages" :key="pageIndex">
        <PageContainer
          :page-number="pageIndex + 1"
          :total-pages="totalPages"
          :content="content"
          :security-level="securityLevel"
          :export-mode="isExportMode"
          :show-page-number="totalPages > 1"
          @update-field="updateField"
          @update-security-level="securityLevel = $event"
        >
          <!-- Page-specific content -->
          <template v-for="region in page.regions" :key="region.type + '-' + region.startIndex">
            <!-- Report Info Section (only on first page, not continuation) -->
            <template v-if="region.type === 'reportInfo' && !region.isContinuation">
              <div data-section="reportInfo">
                <div class="report-info-row">
                  <span class="label" :style="getFieldStyle('reportNumberLabel')" v-html="getLabelHtml('reportNumberLabel', '报告编号：')"></span>
                  <EditableField 
                    field-id="reportNumber"
                    :placeholder="getPlaceholder('reportNumber', '请输入报告编号')"
                    :value="content.reportNumber"
                    @update="updateField('reportNumber', $event)"
                    text-align="left"
                  />
                </div>
                
                <table class="info-table">
                  <colgroup>
                    <col :style="getColumnWidthStyle('infoTable', 0)">
                    <col :style="getColumnWidthStyle('infoTable', 1)">
                    <col :style="getColumnWidthStyle('infoTable', 2)">
                    <col :style="getColumnWidthStyle('infoTable', 3)">
                  </colgroup>
                  <tr>
                    <td class="label-cell" :style="getFieldStyle('testProjectLabel')" v-html="getLabelHtml('testProjectLabel', '测试项目')"></td>
                    <td class="editable-cell">
                      <EditableField 
                        field-id="testProject"
                        :placeholder="getPlaceholder('testProject', '请输入测试项目')"
                        :value="content.testProject"
                        @update="updateField('testProject', $event)"
                        :text-align="getFieldAlign('testProject')"
                      />
                    </td>
                    <td class="label-cell" :style="getFieldStyle('testConclusionLabel')" v-html="getLabelHtml('testConclusionLabel', '测试结论')"></td>
                    <td class="editable-cell">
                      <EditableField 
                        field-id="testConclusion"
                        :placeholder="getPlaceholder('testConclusion', '请输入测试结论')"
                        :value="content.testConclusion"
                        @update="updateField('testConclusion', $event)"
                        :text-align="getFieldAlign('testConclusion')"
                      />
                    </td>
                  </tr>
                </table>
              </div>
            </template>
            
            <!-- Sample Information Section -->
            <template v-if="region.type === 'sampleInfo'">
              <div class="section" data-section="sampleInfo">
                <div class="section-header" :style="getFieldStyle('sampleInfoHeader')" v-html="getLabelHtml('sampleInfoHeader', '样品信息')"></div>
                <table class="info-table">
                  <colgroup>
                    <col :style="getColumnWidthStyle('sampleTable', 0)">
                    <col :style="getColumnWidthStyle('sampleTable', 1)">
                    <col :style="getColumnWidthStyle('sampleTable', 2)">
                    <col :style="getColumnWidthStyle('sampleTable', 3)">
                    <col :style="getColumnWidthStyle('sampleTable', 4)">
                    <col :style="getColumnWidthStyle('sampleTable', 5)">
                  </colgroup>
                  <tr>
                    <td class="label-cell" :style="getFieldStyle('customerLabel')" v-html="getLabelHtml('customerLabel', '客户')"></td>
                    <td class="editable-cell">
                      <EditableField field-id="customer" :placeholder="getPlaceholder('customer', '请输入客户名称')" :value="content.customer" @update="updateField('customer', $event)" :text-align="getFieldAlign('customer')" />
                    </td>
                    <td class="label-cell" :style="getFieldStyle('departmentLabel')" v-html="getLabelHtml('departmentLabel', '委托部门')"></td>
                    <td class="editable-cell">
                      <EditableField field-id="department" :placeholder="getPlaceholder('department', '请输入委托部门')" :value="content.department" @update="updateField('department', $event)" :text-align="getFieldAlign('department')" />
                    </td>
                    <td class="label-cell" :style="getFieldStyle('sampleCountLabel')" v-html="getLabelHtml('sampleCountLabel', '样品数量')"></td>
                    <td class="editable-cell">
                      <EditableField field-id="sampleCount" :placeholder="getPlaceholder('sampleCount', '数量')" :value="content.sampleCount" @update="updateField('sampleCount', $event)" :text-align="getFieldAlign('sampleCount')" />
                    </td>
                  </tr>
                  <tr>
                    <td class="label-cell" :style="getFieldStyle('projectNameLabel')" v-html="getLabelHtml('projectNameLabel', '项目名称')"></td>
                    <td class="editable-cell">
                      <EditableField field-id="projectName" :placeholder="getPlaceholder('projectName', '请输入项目名称')" :value="content.projectName" @update="updateField('projectName', $event)" :text-align="getFieldAlign('projectName')" />
                    </td>
                    <td class="label-cell" :style="getFieldStyle('requesterLabel')" v-html="getLabelHtml('requesterLabel', '委托人员')"></td>
                    <td class="editable-cell">
                      <EditableField field-id="requester" :placeholder="getPlaceholder('requester', '请输入委托人员')" :value="content.requester" @update="updateField('requester', $event)" :text-align="getFieldAlign('requester')" />
                    </td>
                    <td class="label-cell" :style="getFieldStyle('startTimeLabel')" v-html="getLabelHtml('startTimeLabel', '开始时间')"></td>
                    <td class="editable-cell">
                      <EditableField field-id="startTime" :placeholder="getPlaceholder('startTime', '开始时间')" :value="content.startTime" @update="updateField('startTime', $event)" :text-align="getFieldAlign('startTime')" />
                    </td>
                  </tr>
                  <tr>
                    <td class="label-cell" :style="getFieldStyle('productNameLabel')" v-html="getLabelHtml('productNameLabel', '产品名称')"></td>
                    <td class="editable-cell">
                      <EditableField field-id="productName" :placeholder="getPlaceholder('productName', '请输入产品名称')" :value="content.productName" @update="updateField('productName', $event)" :text-align="getFieldAlign('productName')" />
                    </td>
                    <td class="label-cell" :style="getFieldStyle('sampleStageLabel')" v-html="getLabelHtml('sampleStageLabel', '样品阶段')"></td>
                    <td class="editable-cell">
                      <EditableField field-id="sampleStage" :placeholder="getPlaceholder('sampleStage', '请输入样品阶段')" :value="content.sampleStage" @update="updateField('sampleStage', $event)" :text-align="getFieldAlign('sampleStage')" />
                    </td>
                    <td class="label-cell" :style="getFieldStyle('endTimeLabel')" v-html="getLabelHtml('endTimeLabel', '完成时间')"></td>
                    <td class="editable-cell">
                      <EditableField field-id="endTime" :placeholder="getPlaceholder('endTime', '完成时间')" :value="content.endTime" @update="updateField('endTime', $event)" :text-align="getFieldAlign('endTime')" />
                    </td>
                  </tr>
                  <tr>
                    <td class="label-cell" :style="getFieldStyle('testPurposeLabel')" v-html="getLabelHtml('testPurposeLabel', '测试目的')"></td>
                    <td class="editable-cell" colspan="5">
                      <EditableField field-id="testPurpose" :placeholder="getPlaceholder('testPurpose', '请输入测试目的')" :value="content.testPurpose" @update="updateField('testPurpose', $event)" :text-align="getFieldAlign('testPurpose')" />
                    </td>
                  </tr>
                </table>
              </div>
            </template>
            
            <!-- Equipment Information Section -->
            <template v-if="region.type === 'equipmentInfo'">
              <div class="section" data-section="equipmentInfo">
                <div class="section-header" :style="getFieldStyle('equipmentInfoHeader')" v-html="getLabelHtml('equipmentInfoHeader', '设备信息')"></div>
                <table class="info-table">
                  <colgroup>
                    <col :style="getColumnWidthStyle('equipmentTable', 0)">
                    <col :style="getColumnWidthStyle('equipmentTable', 1)">
                    <col :style="getColumnWidthStyle('equipmentTable', 2)">
                    <col :style="getColumnWidthStyle('equipmentTable', 3)">
                    <col :style="getColumnWidthStyle('equipmentTable', 4)">
                    <col :style="getColumnWidthStyle('equipmentTable', 5)">
                  </colgroup>
                  <tr>
                    <td class="label-cell" :style="getFieldStyle('testEquipmentLabel')" v-html="getLabelHtml('testEquipmentLabel', '测试设备')"></td>
                    <td class="editable-cell">
                      <EditableField field-id="testEquipment" :placeholder="getPlaceholder('testEquipment', '请输入测试设备')" :value="content.testEquipment" @update="updateField('testEquipment', $event)" :text-align="getFieldAlign('testEquipment')" />
                    </td>
                    <td class="label-cell" :style="getFieldStyle('equipmentModelLabel')" v-html="getLabelHtml('equipmentModelLabel', '设备型号')"></td>
                    <td class="editable-cell">
                      <EditableField field-id="equipmentModel" :placeholder="getPlaceholder('equipmentModel', '请输入设备型号')" :value="content.equipmentModel" @update="updateField('equipmentModel', $event)" :text-align="getFieldAlign('equipmentModel')" />
                    </td>
                    <td class="label-cell" :style="getFieldStyle('calibrationDateLabel')" v-html="getLabelHtml('calibrationDateLabel', '校准日期')"></td>
                    <td class="editable-cell">
                      <EditableField field-id="calibrationDate" :placeholder="getPlaceholder('calibrationDate', '校准日期')" :value="content.calibrationDate" @update="updateField('calibrationDate', $event)" :text-align="getFieldAlign('calibrationDate')" />
                    </td>
                  </tr>
                </table>
              </div>
            </template>
            
            <!-- Test Conditions Header -->
            <template v-if="region.type === 'testConditionsHeader'">
              <div class="section">
                <div class="section-header" data-section="testConditionsHeader" :style="getFieldStyle('testConditionsHeader')" v-html="getLabelHtml('testConditionsHeader', '测试条件')"></div>
              </div>
            </template>
            
            <!-- Test Standard Section -->
            <template v-if="region.type === 'testStandard'">
              <div class="subsection" data-section="testStandard">
                <div class="subsection-row centered-label">
                  <span class="label" :style="getFieldStyle('testStandardLabel')" v-html="getLabelHtml('testStandardLabel', '测试标准')"></span>
                  <div class="subsection-content">
                    <EditableField 
                      field-id="testStandard"
                      :placeholder="getPlaceholder('testStandard', '请输入测试标准...')"
                      :value="content.testStandard"
                      @update="updateField('testStandard', $event)"
                      :multiline="true"
                      text-align="left"
                    />
                  </div>
                </div>
              </div>
            </template>
            
            <!-- Judgment Standard Section -->
            <template v-if="region.type === 'judgmentStandard'">
              <div class="subsection" data-section="judgmentStandard">
                <div class="subsection-row centered-label">
                  <span class="label" :style="getFieldStyle('judgmentStandardLabel')" v-html="getLabelHtml('judgmentStandardLabel', '判定标准')"></span>
                  <div class="subsection-content">
                    <EditableField 
                      field-id="judgmentStandard"
                      :placeholder="getPlaceholder('judgmentStandard', '请输入判定标准...')"
                      :value="content.judgmentStandard"
                      @update="updateField('judgmentStandard', $event)"
                      :multiline="true"
                      text-align="left"
                    />
                  </div>
                </div>
              </div>
            </template>
            
            <!-- Test Results Section -->
            <template v-if="region.type === 'testResults'">
              <div class="section">
                <div class="section-header" :style="getFieldStyle('testResultsHeader')">
                  <span v-html="getLabelHtml('testResultsHeader', '测试结果信息')"></span>
                  <span v-if="shouldShowContinuationMark(region, 'testResults')" class="continuation-mark">（续）</span>
                </div>
                
                <table class="result-table">
                  <colgroup>
                    <col :style="getColumnWidthStyle('resultTable', 0) || { width: '40px' }">
                    <col :style="getColumnWidthStyle('resultTable', 1)">
                    <col :style="getColumnWidthStyle('resultTable', 2)">
                    <col :style="getColumnWidthStyle('resultTable', 3)">
                    <col :style="getColumnWidthStyle('resultTable', 4)">
                    <col :style="getColumnWidthStyle('resultTable', 5)">
                  </colgroup>
                  <thead>
                    <tr>
                      <th :style="getFieldStyle('resultIdHeader')" v-html="getLabelHtml('resultIdHeader', '编号')"></th>
                      <th :style="getFieldStyle('appearanceHeader')" v-html="getLabelHtml('appearanceHeader', '实验后外观检查')"></th>
                      <th :style="getFieldStyle('functionHeader')" v-html="getLabelHtml('functionHeader', '实验后功能检查')"></th>
                      <th :style="getFieldStyle('otherHeader')" v-html="getLabelHtml('otherHeader', '其它性能检查')"></th>
                      <th :style="getFieldStyle('conclusionHeader')" v-html="getLabelHtml('conclusionHeader', '测试结论')"></th>
                      <th :style="getFieldStyle('noteHeader')" v-html="getLabelHtml('noteHeader', '备注')"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in getResultRowsForRegion(region)" :key="row.id">
                      <td class="text-center">{{ region.startIndex + index + 1 }}</td>
                      <td class="editable-cell">
                        <EditableField 
                          :field-id="`result_${row.id}_appearance`"
                          :placeholder="getPlaceholder('appearance', '外观检查结果')"
                          :value="row.appearance"
                          @update="updateResultRow(region.startIndex + index, 'appearance', $event)"
                          :text-align="getFieldAlign('appearance')"
                        />
                      </td>
                      <td class="editable-cell">
                        <EditableField 
                          :field-id="`result_${row.id}_function`"
                          :placeholder="getPlaceholder('function', '功能检查结果')"
                          :value="row.function"
                          @update="updateResultRow(region.startIndex + index, 'function', $event)"
                          :text-align="getFieldAlign('function')"
                        />
                      </td>
                      <td class="editable-cell">
                        <EditableField 
                          :field-id="`result_${row.id}_other`"
                          :placeholder="getPlaceholder('other', '其它性能')"
                          :value="row.other"
                          @update="updateResultRow(region.startIndex + index, 'other', $event)"
                          :text-align="getFieldAlign('other')"
                        />
                      </td>
                      <td class="editable-cell">
                        <EditableField 
                          :field-id="`result_${row.id}_conclusion`"
                          :placeholder="getPlaceholder('conclusion', '结论')"
                          :value="row.conclusion"
                          @update="updateResultRow(region.startIndex + index, 'conclusion', $event)"
                          :text-align="getFieldAlign('conclusion')"
                        />
                      </td>
                      <td class="editable-cell">
                        <EditableField 
                          :field-id="`result_${row.id}_note`"
                          :placeholder="getPlaceholder('note', '备注')"
                          :value="row.note"
                          @update="updateResultRow(region.startIndex + index, 'note', $event)"
                          :text-align="getFieldAlign('note')"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
            
            <!-- Judgment Result Section -->
            <template v-if="region.type === 'judgmentResult'">
              <div class="judgment-section" data-section="judgmentResult">
                <div class="judgment-row centered-label">
                  <span class="label" :style="getFieldStyle('judgmentResultLabel')" v-html="getLabelHtml('judgmentResultLabel', '判定结果')"></span>
                  <div class="judgment-content">
                    <EditableField 
                      field-id="judgmentResult"
                      :placeholder="getPlaceholder('judgmentResult', '请输入判定结果...')"
                      :value="content.judgmentResult"
                      @update="updateField('judgmentResult', $event)"
                      :multiline="true"
                      text-align="left"
                    />
                  </div>
                </div>
              </div>
            </template>
            
            <!-- Test Images Section -->
            <template v-if="region.type === 'testImages'">
              <div class="section">
                <div class="section-header" :style="getFieldStyle('testImagesHeader')">
                  <span v-html="getLabelHtml('testImagesHeader', '测试图片')"></span>
                  <span v-if="shouldShowContinuationMark(region, 'testImages')" class="continuation-mark">（续）</span>
                </div>
                
                <!-- Image Headers -->
                <div class="image-headers">
                  <div class="image-header" :style="getFieldStyle('beforeTestLabel')" v-html="getLabelHtml('beforeTestLabel', '测试前')"></div>
                  <div class="image-header" :style="getFieldStyle('duringTestLabel')" v-html="getLabelHtml('duringTestLabel', '测试中')"></div>
                  <div class="image-header" :style="getFieldStyle('afterTestLabel')" v-html="getLabelHtml('afterTestLabel', '测试后')"></div>
                </div>
                
                <!-- Image Rows -->
                <template v-for="(row, rowIndex) in getImageRowsForRegion(region)" :key="row.id">
                  <div class="image-row">
                    <div class="image-row-content">
                      <ImageUploader 
                        :images="row.before"
                        position="before"
                        @update="updateImages(region.startIndex + rowIndex, 'before', $event)"
                      />
                      <ImageUploader 
                        :images="row.during"
                        position="during"
                        @update="updateImages(region.startIndex + rowIndex, 'during', $event)"
                      />
                      <ImageUploader 
                        :images="row.after"
                        position="after"
                        @update="updateImages(region.startIndex + rowIndex, 'after', $event)"
                      />
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </template>
        </PageContainer>
        
        <!-- Page break indicator (between pages in edit mode) -->
        <div v-if="pageIndex < paginatedPages.length - 1 && !isExportMode" class="page-break-indicator">
          <div class="page-break-line"></div>
          <span class="page-break-label">第 {{ pageIndex + 1 }} 页结束 - 第 {{ pageIndex + 2 }} 页开始</span>
          <div class="page-break-line"></div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useReportStore } from '@/stores/report'
import { usePagination, RegionType, createRegion } from '@/composables/usePagination'
import PageContainer from '@/components/report/PageContainer.vue'
import EditableField from '@/components/report/EditableField.vue'
import ImageUploader from '@/components/report/ImageUploader.vue'
import { Plus } from '@element-plus/icons-vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

const reportStore = useReportStore()
const route = useRoute()
const pagination = usePagination()

const templateRef = ref(null)
const loading = ref(true)
const batchAddCount = ref(1)
const batchImageAddCount = ref(1)
const securityLevel = ref('内部公开')
const isExportMode = ref(false)

// Refs for DOM measurement
const measureContainerRef = ref(null)
const measuredHeights = ref({
  reportInfo: 80,
  sampleInfo: 175,
  equipmentInfo: 75,
  testConditionsHeader: 30,
  testStandard: 70,
  judgmentStandard: 70,
  judgmentResult: 65
})

// 动态测量的实际行高
const measuredRowHeight = ref(36)  // 默认值

// Computed content
const content = computed(() => reportStore.content)

// Template content data
const templateContentData = computed(() => reportStore.templateSettings.templateContentData || {})

// Height constants for splittable sections
const SECTION_HEADER_HEIGHT = 28
const TABLE_HEADER_HEIGHT = 32
const ROW_HEIGHT = 36  // 修正后的实际行高：padding(8px) + content(24px) + border(2px) + buffer(2px)
const IMAGE_ROW_HEIGHT = 260 // Actual row height with margin (square image uploaders ~240px + 15px margin + buffer)

// Measure actual DOM heights after content changes
const measureSectionHeights = async () => {
  await nextTick()
  
  if (!templateRef.value) return
  
  // Find all sections across all pages
  const allPages = templateRef.value.querySelectorAll('.a4-page')
  if (!allPages.length) return
  
  const newHeights = { ...measuredHeights.value }
  
  // Collect all measurable sections from all pages
  const sectionTypes = [
    'reportInfo', 'sampleInfo', 'equipmentInfo', 
    'testConditionsHeader', 'testStandard', 'judgmentStandard', 'judgmentResult'
  ]
  
  for (const sectionType of sectionTypes) {
    // Find the first occurrence of this section (not continuation)
    for (const page of allPages) {
      const element = page.querySelector(`[data-section="${sectionType}"]`)
      if (element) {
        const rect = element.getBoundingClientRect()
        // Add small buffer
        newHeights[sectionType] = Math.ceil(rect.height) + 8
        break
      }
    }
  }
  
  // 动态测量测试结果表格的实际行高
  for (const page of allPages) {
    const tableElement = page.querySelector('.result-table tbody tr')
    if (tableElement) {
      const rowRect = tableElement.getBoundingClientRect()
      if (rowRect.height > 0) {
        measuredRowHeight.value = Math.ceil(rowRect.height)
        console.log('[Row Height Measurement] 实际行高:', measuredRowHeight.value, 'px')
        break
      }
    }
  }
  
  measuredHeights.value = newHeights
}

// Watch content changes and remeasure with debounce
let measureTimeout = null
watch(
  () => [
    content.value.testStandard,
    content.value.judgmentStandard, 
    content.value.judgmentResult,
    content.value.testPurpose,
    reportStore.testResultRows.length, 
    reportStore.testImageRows.length
  ],
  () => {
    if (!loading.value) {
      // Debounce measurements
      if (measureTimeout) clearTimeout(measureTimeout)
      measureTimeout = setTimeout(() => {
        measureSectionHeights()
      }, 50)
    }
  },
  { deep: true }
)

// Create paginated content regions with measured heights
const contentRegions = computed(() => {
  const regions = []
  const heights = measuredHeights.value
  
  // Report Info section
  regions.push(createRegion(RegionType.REPORT_INFO, heights.reportInfo))
  
  // Sample Info section
  regions.push(createRegion(RegionType.SAMPLE_INFO, heights.sampleInfo))
  
  // Equipment Info section
  regions.push(createRegion(RegionType.EQUIPMENT_INFO, heights.equipmentInfo))
  
  // Test Conditions - split into header, test standard, and judgment standard
  regions.push(createRegion(RegionType.TEST_CONDITIONS_HEADER, heights.testConditionsHeader))
  regions.push(createRegion(RegionType.TEST_STANDARD, heights.testStandard))
  regions.push(createRegion(RegionType.JUDGMENT_STANDARD, heights.judgmentStandard))
  
  // Test Results section (splittable)
  const resultRows = reportStore.testResultRows
  // 使用动态测量的行高进行更精确的计算
  const resultTableHeight = SECTION_HEADER_HEIGHT + TABLE_HEADER_HEIGHT + (resultRows.length * measuredRowHeight.value) + 45
  regions.push(createRegion(
    RegionType.TEST_RESULTS, 
    resultTableHeight, 
    { rows: resultRows, rowHeight: measuredRowHeight.value },
    true // splittable
  ))
  
  // Judgment Result section
  regions.push(createRegion(RegionType.JUDGMENT_RESULT, heights.judgmentResult))
  
  // Test Images section (splittable)
  const imageRows = reportStore.testImageRows
  const imagesSectionHeight = SECTION_HEADER_HEIGHT + 50 + (imageRows.length * IMAGE_ROW_HEIGHT)
  regions.push(createRegion(
    RegionType.TEST_IMAGES, 
    imagesSectionHeight, 
    { rows: imageRows, rowHeight: IMAGE_ROW_HEIGHT },
    true // splittable
  ))
  
  return regions
})

// Register regions with pagination system and get paginated pages
const paginatedPages = computed(() => {
  pagination.registerRegions(contentRegions.value)
  return pagination.pages.value
})

// Total pages
const totalPages = computed(() => paginatedPages.value.length || 1)

// Get result rows for a specific region
const getResultRowsForRegion = (region) => {
  const startIdx = region.startIndex || 0
  const endIdx = region.endIndex !== null && region.endIndex !== undefined 
    ? region.endIndex 
    : reportStore.testResultRows.length
  return reportStore.testResultRows.slice(startIdx, endIdx)
}

// Get image rows for a specific region
const getImageRowsForRegion = (region) => {
  const startIdx = region.startIndex || 0
  const endIdx = region.endIndex !== null && region.endIndex !== undefined 
    ? region.endIndex 
    : reportStore.testImageRows.length
  return reportStore.testImageRows.slice(startIdx, endIdx)
}

// Determine if continuation mark should be shown for a region
const shouldShowContinuationMark = (region, regionType) => {
  // For test images, only show continuation mark if:
  // 1. It's actually a continuation (isContinuation is true)
  // 2. It's not the first occurrence of this region type on the page
  if (!region.isContinuation) {
    return false
  }
  
  // Check if this is the first occurrence of testImages on this page
  // by looking at the page index and region index
  const currentPageIndex = paginatedPages.value.findIndex(page => 
    page.regions.some(r => r === region)
  )
  
  if (currentPageIndex === -1) return false
  
  const currentPage = paginatedPages.value[currentPageIndex]
  const regionIndexOnPage = currentPage.regions.findIndex(r => r === region)
  
  // Find the first occurrence of this region type on or before this page
  let firstOccurrencePageIndex = -1
  for (let i = 0; i <= currentPageIndex; i++) {
    const page = paginatedPages.value[i]
    const hasRegion = page.regions.some(r => r.type === regionType)
    if (hasRegion) {
      firstOccurrencePageIndex = i
      break
    }
  }
  
  // Show continuation mark only if this is not the first occurrence
  return firstOccurrencePageIndex !== currentPageIndex
}

// Get style for a field from fieldFormats
const getFieldStyle = (fieldId) => {
  const format = reportStore.getFieldFormat(fieldId)
  if (!format) return {}
  
  return {
    ...(format.fontFamily && { fontFamily: format.fontFamily }),
    ...(format.fontSize && { fontSize: `${format.fontSize}px` }),
    ...(format.color && { color: format.color }),
    ...(format.fontWeight && { fontWeight: format.fontWeight }),
    ...(format.fontStyle && { fontStyle: format.fontStyle }),
    ...(format.textDecoration && { textDecoration: format.textDecoration }),
    ...(format.textAlign && { textAlign: format.textAlign })
  }
}

// Helper to get field alignment from template settings
const getFieldAlign = (fieldId) => {
  const format = reportStore.getFieldFormat(fieldId)
  return format?.textAlign || 'center'  // Default to center alignment
}

// Helper to get template label as HTML
const getLabelHtml = (key, defaultValue) => {
  const value = templateContentData.value[key] || defaultValue
  if (!value) return ''
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}

// Helper to get placeholder text
const getPlaceholder = (key, defaultValue) => {
  return templateContentData.value.placeholders?.[key] || defaultValue
}

// Computed column widths
const getColumnWidthStyle = (tableName, columnIndex) => {
  const widths = reportStore.templateSettings.tableColumnWidths?.[tableName]
  if (widths && widths.length > columnIndex && widths[columnIndex] > 0) {
    return { width: `${widths[columnIndex]}px` }
  }
  return {}
}

// Field update handler
const updateField = (fieldId, value) => {
  reportStore.updateField(fieldId, value)
}

// Result row handlers
const addResultRow = () => {
  reportStore.addTestResultRows(1)
}

const addResultRows = (count) => {
  reportStore.addTestResultRows(count)
}

const updateResultRow = (index, field, value) => {
  reportStore.updateTestResultRow(index, field, value)
}



// Image row handlers


const updateImages = (rowIndex, position, images) => {
  reportStore.updateTestImage(rowIndex, position, images)
}



// Load template settings
const loadTemplateSettings = async () => {
  await reportStore.loadAppliedTemplateSettings()
  if (reportStore.templateSettings.securityLevel) {
    securityLevel.value = reportStore.templateSettings.securityLevel
  }
}

// PDF Export handler - now handles multiple pages
const handleExportPdf = async () => {
  try {
    ElMessage.info('正在生成PDF，请稍候...')
    
    isExportMode.value = true
    await nextTick()
    
    // Wait a bit for DOM to update
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pages = templateRef.value.querySelectorAll('.a4-page')
    
    for (let i = 0; i < pages.length; i++) {
      if (i > 0) {
        pdf.addPage()
      }
      
      const canvas = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: pages[i].offsetWidth,
        height: pages[i].offsetHeight,
        ignoreElements: (element) => {
          return element.classList.contains('el-button--danger') ||
                 element.classList.contains('page-break-indicator')
        }
      })
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const imgWidth = 210 // A4 width in mm
      const imgHeight = 297 // A4 height in mm
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)
    }
    
    isExportMode.value = false
    
    // Generate filename
    const title = content.value.testProject || '可靠性测试报告'
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    pdf.save(`${title}_${date}.pdf`)
    
    ElMessage.success('PDF导出成功')
  } catch (error) {
    console.error('PDF export error:', error)
    isExportMode.value = false
    ElMessage.error('PDF导出失败：' + error.message)
  }
}

// Initialize
onMounted(async () => {
  await reportStore.loadTemplate('general')
  await reportStore.loadAutoSave('general')
  await loadTemplateSettings()
  
  loading.value = false
  
  // Measure actual DOM heights after initial render
  await nextTick()
  setTimeout(() => {
    measureSectionHeights()
  }, 100)
  
  window.addEventListener('export-pdf', handleExportPdf)
})

// Watch route changes
watch(
  () => route.path,
  async (newPath) => {
    if (newPath.includes('/report/general')) {
      await loadTemplateSettings()
    }
  }
)

onUnmounted(() => {
  window.removeEventListener('export-pdf', handleExportPdf)
})
</script>

<style lang="scss" scoped>
.general-template {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-break-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 210mm;
  margin: 10px 0;
  gap: 15px;
  
  .page-break-line {
    flex: 1;
    height: 2px;
    background: repeating-linear-gradient(
      to right,
      #409eff,
      #409eff 8px,
      transparent 8px,
      transparent 16px
    );
  }
  
  .page-break-label {
    padding: 4px 12px;
    background: #ecf5ff;
    color: #409eff;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
    border: 1px solid #b3d8ff;
  }
}

.report-info-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 11px;
  
  .label {
    font-weight: 500;
  }
  
  :deep(.editable-field) {
    min-width: 120px;
    min-height: 1.5em;
  }
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
  font-size: 11px;
  table-layout: fixed;
  
  td {
    border: 1px solid #000;
    padding: 4px 8px;
    vertical-align: middle;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .label-cell {
    background-color: #f5f5f5;
    font-weight: 500;
    text-align: center;
    width: 70px;
    min-width: 70px;
    max-width: 70px;
  }
  
  .editable-cell {
    padding: 0;
    
    :deep(.editable-field) {
      padding: 4px 8px;
      min-height: 24px;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: pre-wrap;
    }
  }
}

.section {
  margin-bottom: 15px;
  
  .section-header {
    font-weight: 600;
    font-size: 12px;
    padding: 5px 0;
    border-bottom: 1px solid #000;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 5px;
    
    .continuation-mark {
      color: #909399;
      font-weight: normal;
    }
  }
}

.subsection {
  margin-top: 10px;
  
  .subsection-row {
    display: flex;
    font-size: 11px;
    
    .label {
      width: 60px;
      flex-shrink: 0;
      font-weight: 500;
    }
    
    .subsection-content {
      flex: 1;
      padding: 5px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    &.centered-label {
      .label {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
    }
  }
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
  table-layout: fixed;
  
  th, td {
    border: 1px solid #000;
    padding: 4px 6px;
    text-align: center;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  th {
    background-color: #f5f5f5;
    font-weight: 600;
  }
  
  .editable-cell {
    padding: 0;
    
    :deep(.editable-field) {
      padding: 4px 6px;
      min-height: 24px;
      text-align: center;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: pre-wrap;
    }
  }
}



.judgment-section {
  margin-top: 15px;
  margin-bottom: 15px;
  
  .judgment-row {
    display: flex;
    font-size: 11px;
    
    .label {
      width: 60px;
      flex-shrink: 0;
      font-weight: 500;
    }
    
    .judgment-content {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    &.centered-label {
      .label {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
    }
  }
}

.image-headers {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  
  .image-header {
    flex: 1;
    text-align: center;
    font-size: 11px;
    font-weight: 500;
    padding: 5px;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
}

.image-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 15px;
  
  .image-row-content {
    flex: 1;
    display: flex;
    gap: 10px;
  }
  
  .image-row-actions {
    padding-top: 40px;
  }
}

.text-center {
  text-align: center;
}

// PDF export mode styles
:deep(.pdf-export-mode) {
  .row-controls {
    display: none !important;
  }
  
  .result-table th:last-child,
  .result-table td:last-child {
    display: none !important;
  }
  
  .el-button--danger {
    display: none !important;
  }
  
  .page-number {
    display: none !important;
  }
}
</style>
