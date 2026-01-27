<template>
  <div class="general-template" ref="templateRef">
    <el-skeleton v-if="loading" :rows="20" animated />
    
    <template v-else>
      <!-- Page 1 -->
      <div class="a4-page" ref="page1Ref">
        <!-- Main Content Area -->
        <div class="page-content">
          <!-- Header -->
          <div class="page-header">
            <!-- Logo -->
            <div 
              v-if="reportStore.templateSettings.logo?.dataUrl" 
              class="logo-area"
              :style="logoStyle"
            >
              <img :src="reportStore.templateSettings.logo.dataUrl" alt="Logo" />
            </div>
            <div class="company-name" v-html="getLabelHtml('companyName', '深圳市欣威智能有限公司')"></div>
            <div class="report-title" v-html="getLabelHtml('reportTitle', '可靠性实验报告')"></div>
            <div class="record-code" v-html="getLabelHtml('recordCode', '记录代码：F-SUN1-XV-15.11.1.1/A0')"></div>
          </div>
        
        <!-- Report Number -->
        <div class="report-info-row">
          <span class="label" v-html="getLabelHtml('reportNumberLabel', '报告编号：')"></span>
          <EditableField 
            field-id="reportNumber"
            :placeholder="getPlaceholder('reportNumber', '请输入报告编号')"
            :value="content.reportNumber"
            @update="updateField('reportNumber', $event)"
            text-align="left"
          />
        </div>
        
        <!-- Test Project and Conclusion -->
        <table class="info-table">
          <colgroup>
            <col :style="getColumnWidthStyle('infoTable', 0)">
            <col :style="getColumnWidthStyle('infoTable', 1)">
            <col :style="getColumnWidthStyle('infoTable', 2)">
            <col :style="getColumnWidthStyle('infoTable', 3)">
          </colgroup>
          <tr>
            <td class="label-cell" v-html="getLabelHtml('testProjectLabel', '测试项目')"></td>
            <td class="editable-cell">
              <EditableField 
                field-id="testProject"
                :placeholder="getPlaceholder('testProject', '请输入测试项目')"
                :value="content.testProject"
                @update="updateField('testProject', $event)"
              />
            </td>
            <td class="label-cell" v-html="getLabelHtml('testConclusionLabel', '测试结论')"></td>
            <td class="editable-cell">
              <EditableField 
                field-id="testConclusion"
                :placeholder="getPlaceholder('testConclusion', '请输入测试结论')"
                :value="content.testConclusion"
                @update="updateField('testConclusion', $event)"
              />
            </td>
          </tr>
        </table>
        
        <!-- Sample Information Section -->
        <div class="section">
          <div class="section-header" v-html="getLabelHtml('sampleInfoHeader', '样品信息')"></div>
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
              <td class="label-cell" v-html="getLabelHtml('customerLabel', '客户')"></td>
              <td class="editable-cell">
                <EditableField field-id="customer" :placeholder="getPlaceholder('customer', '请输入客户名称')" :value="content.customer" @update="updateField('customer', $event)" />
              </td>
              <td class="label-cell" v-html="getLabelHtml('departmentLabel', '委托部门')"></td>
              <td class="editable-cell">
                <EditableField field-id="department" :placeholder="getPlaceholder('department', '请输入委托部门')" :value="content.department" @update="updateField('department', $event)" />
              </td>
              <td class="label-cell" v-html="getLabelHtml('sampleCountLabel', '样品数量')"></td>
              <td class="editable-cell">
                <EditableField field-id="sampleCount" :placeholder="getPlaceholder('sampleCount', '数量')" :value="content.sampleCount" @update="updateField('sampleCount', $event)" />
              </td>
            </tr>
            <tr>
              <td class="label-cell" v-html="getLabelHtml('projectNameLabel', '项目名称')"></td>
              <td class="editable-cell">
                <EditableField field-id="projectName" :placeholder="getPlaceholder('projectName', '请输入项目名称')" :value="content.projectName" @update="updateField('projectName', $event)" />
              </td>
              <td class="label-cell" v-html="getLabelHtml('requesterLabel', '委托人员')"></td>
              <td class="editable-cell">
                <EditableField field-id="requester" :placeholder="getPlaceholder('requester', '请输入委托人员')" :value="content.requester" @update="updateField('requester', $event)" />
              </td>
              <td class="label-cell" v-html="getLabelHtml('startTimeLabel', '开始时间')"></td>
              <td class="editable-cell">
                <EditableField field-id="startTime" :placeholder="getPlaceholder('startTime', '开始时间')" :value="content.startTime" @update="updateField('startTime', $event)" />
              </td>
            </tr>
            <tr>
              <td class="label-cell" v-html="getLabelHtml('productNameLabel', '产品名称')"></td>
              <td class="editable-cell">
                <EditableField field-id="productName" :placeholder="getPlaceholder('productName', '请输入产品名称')" :value="content.productName" @update="updateField('productName', $event)" />
              </td>
              <td class="label-cell" v-html="getLabelHtml('sampleStageLabel', '样品阶段')"></td>
              <td class="editable-cell">
                <EditableField field-id="sampleStage" :placeholder="getPlaceholder('sampleStage', '请输入样品阶段')" :value="content.sampleStage" @update="updateField('sampleStage', $event)" />
              </td>
              <td class="label-cell" v-html="getLabelHtml('endTimeLabel', '完成时间')"></td>
              <td class="editable-cell">
                <EditableField field-id="endTime" :placeholder="getPlaceholder('endTime', '完成时间')" :value="content.endTime" @update="updateField('endTime', $event)" />
              </td>
            </tr>
            <tr>
              <td class="label-cell" v-html="getLabelHtml('testPurposeLabel', '测试目的')"></td>
              <td class="editable-cell" colspan="5">
                <EditableField field-id="testPurpose" :placeholder="getPlaceholder('testPurpose', '请输入测试目的')" :value="content.testPurpose" @update="updateField('testPurpose', $event)" />
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Equipment Information Section -->
        <div class="section">
          <div class="section-header" v-html="getLabelHtml('equipmentInfoHeader', '设备信息')"></div>
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
              <td class="label-cell" v-html="getLabelHtml('testEquipmentLabel', '测试设备')"></td>
              <td class="editable-cell">
                <EditableField field-id="testEquipment" :placeholder="getPlaceholder('testEquipment', '请输入测试设备')" :value="content.testEquipment" @update="updateField('testEquipment', $event)" />
              </td>
              <td class="label-cell" v-html="getLabelHtml('equipmentModelLabel', '设备型号')"></td>
              <td class="editable-cell">
                <EditableField field-id="equipmentModel" :placeholder="getPlaceholder('equipmentModel', '请输入设备型号')" :value="content.equipmentModel" @update="updateField('equipmentModel', $event)" />
              </td>
              <td class="label-cell" v-html="getLabelHtml('calibrationDateLabel', '校准日期')"></td>
              <td class="editable-cell">
                <EditableField field-id="calibrationDate" :placeholder="getPlaceholder('calibrationDate', '校准日期')" :value="content.calibrationDate" @update="updateField('calibrationDate', $event)" />
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Test Conditions Section -->
        <div class="section">
          <div class="section-header" v-html="getLabelHtml('testConditionsHeader', '测试条件')"></div>
          
          <div class="subsection">
            <div class="subsection-row centered-label">
              <span class="label" v-html="getLabelHtml('testStandardLabel', '测试标准')"></span>
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
          
          <div class="subsection">
            <div class="subsection-row centered-label">
              <span class="label" v-html="getLabelHtml('judgmentStandardLabel', '判定标准')"></span>
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
        </div>
        
        <!-- Test Results Section -->
        <div class="section">
          <div class="section-header" v-html="getLabelHtml('testResultsHeader', '测试结果信息')"></div>
          
          <!-- Row Controls -->
          <div class="row-controls">
            <el-button size="small" type="primary" @click="addResultRow">
              <el-icon><Plus /></el-icon> 添加行
            </el-button>
            <el-input-number 
              v-model="batchAddCount" 
              :min="1" 
              :max="20" 
              size="small" 
              class="row-count-input"
            />
            <el-button size="small" @click="addResultRows(batchAddCount)">批量添加</el-button>
          </div>
          
          <table class="result-table">
            <colgroup>
              <col :style="getColumnWidthStyle('resultTable', 0) || { width: '40px' }">
              <col :style="getColumnWidthStyle('resultTable', 1)">
              <col :style="getColumnWidthStyle('resultTable', 2)">
              <col :style="getColumnWidthStyle('resultTable', 3)">
              <col :style="getColumnWidthStyle('resultTable', 4)">
              <col :style="getColumnWidthStyle('resultTable', 5)">
              <col style="width: 60px;">
            </colgroup>
            <thead>
              <tr>
                <th v-html="getLabelHtml('resultIdHeader', '编号')"></th>
                <th v-html="getLabelHtml('appearanceHeader', '实验后外观检查')"></th>
                <th v-html="getLabelHtml('functionHeader', '实验后功能检查')"></th>
                <th v-html="getLabelHtml('otherHeader', '其它性能检查')"></th>
                <th v-html="getLabelHtml('conclusionHeader', '测试结论')"></th>
                <th v-html="getLabelHtml('noteHeader', '备注')"></th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in reportStore.testResultRows" :key="row.id">
                <td class="text-center">{{ index + 1 }}</td>
                <td class="editable-cell">
                  <EditableField 
                    :field-id="`result_${row.id}_appearance`"
                    :placeholder="getPlaceholder('appearance', '外观检查结果')"
                    :value="row.appearance"
                    @update="updateResultRow(index, 'appearance', $event)"
                  />
                </td>
                <td class="editable-cell">
                  <EditableField 
                    :field-id="`result_${row.id}_function`"
                    :placeholder="getPlaceholder('function', '功能检查结果')"
                    :value="row.function"
                    @update="updateResultRow(index, 'function', $event)"
                  />
                </td>
                <td class="editable-cell">
                  <EditableField 
                    :field-id="`result_${row.id}_other`"
                    :placeholder="getPlaceholder('other', '其它性能')"
                    :value="row.other"
                    @update="updateResultRow(index, 'other', $event)"
                  />
                </td>
                <td class="editable-cell">
                  <EditableField 
                    :field-id="`result_${row.id}_conclusion`"
                    :placeholder="getPlaceholder('conclusion', '结论')"
                    :value="row.conclusion"
                    @update="updateResultRow(index, 'conclusion', $event)"
                  />
                </td>
                <td class="editable-cell">
                  <EditableField 
                    :field-id="`result_${row.id}_note`"
                    :placeholder="getPlaceholder('note', '备注')"
                    :value="row.note"
                    @update="updateResultRow(index, 'note', $event)"
                  />
                </td>
                <td class="text-center">
                  <el-button 
                    type="danger" 
                    size="small" 
                    circle
                    @click="deleteResultRow(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Judgment Result -->
          <div class="judgment-section">
            <div class="judgment-row centered-label">
              <span class="label" v-html="getLabelHtml('judgmentResultLabel', '判定结果')"></span>
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
        </div>
        
        <!-- Test Images Section -->
        <div class="section" ref="imagesSectionRef">
          <div class="section-header" v-html="getLabelHtml('testImagesHeader', '测试图片')"></div>
          
          <!-- Row Controls -->
          <div class="row-controls">
            <el-button size="small" type="primary" @click="addImageRow">
              <el-icon><Plus /></el-icon> 添加行
            </el-button>
            <el-input-number 
              v-model="batchImageAddCount" 
              :min="1" 
              :max="10" 
              size="small" 
              class="row-count-input"
            />
            <el-button size="small" @click="addImageRows(batchImageAddCount)">批量添加</el-button>
          </div>
          
          <!-- Image Headers -->
          <div class="image-headers">
            <div class="image-header" v-html="getLabelHtml('beforeTestLabel', '测试前')"></div>
            <div class="image-header" v-html="getLabelHtml('duringTestLabel', '测试中')"></div>
            <div class="image-header" v-html="getLabelHtml('afterTestLabel', '测试后')"></div>
          </div>
          
          <!-- Image Rows -->
          <template v-for="(row, rowIndex) in reportStore.testImageRows" :key="row.id">
            <div class="image-row">
              <div class="image-row-content">
                <ImageUploader 
                  :images="row.before"
                  position="before"
                  @update="updateImages(rowIndex, 'before', $event)"
                />
                <ImageUploader 
                  :images="row.during"
                  position="during"
                  @update="updateImages(rowIndex, 'during', $event)"
                />
                <ImageUploader 
                  :images="row.after"
                  position="after"
                  @update="updateImages(rowIndex, 'after', $event)"
                />
              </div>
              <div class="image-row-actions">
                <el-button 
                  type="danger" 
                  size="small" 
                  circle
                  @click="deleteImageRow(rowIndex)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
        </div>
        
        <!-- Department Seal -->
        <div 
          v-if="reportStore.templateSettings.departmentSeal?.dataUrl"
          class="department-seal"
          :style="sealStyle"
        >
          <img :src="reportStore.templateSettings.departmentSeal.dataUrl" alt="Seal" />
        </div>
        </div>
        
        <!-- Footer -->
        <div class="page-footer">
          <div class="signature-row">
            <div class="signature-item">
              <span class="label" v-html="getLabelHtml('testerLabel', '测试员：')"></span>
              <img v-if="reportStore.templateSettings.signatures?.tester?.dataUrl" :src="reportStore.templateSettings.signatures.tester.dataUrl" class="signature-img" :style="{ maxHeight: (reportStore.templateSettings.signatures.tester.size || 30) + 'px' }" />
              <EditableField v-else field-id="tester" :placeholder="getPlaceholder('tester', '测试员姓名')" :value="content.tester" @update="updateField('tester', $event)" />
            </div>
            <div class="signature-item">
              <span class="label" v-html="getLabelHtml('reviewerLabel', '审核：')"></span>
              <img v-if="reportStore.templateSettings.signatures?.reviewer?.dataUrl" :src="reportStore.templateSettings.signatures.reviewer.dataUrl" class="signature-img" :style="{ maxHeight: (reportStore.templateSettings.signatures.reviewer.size || 30) + 'px' }" />
              <EditableField v-else field-id="reviewer" :placeholder="getPlaceholder('reviewer', '审核人姓名')" :value="content.reviewer" @update="updateField('reviewer', $event)" />
            </div>
            <div class="signature-item">
              <span class="label" v-html="getLabelHtml('approverLabel', '核准：')"></span>
              <img v-if="reportStore.templateSettings.signatures?.approver?.dataUrl" :src="reportStore.templateSettings.signatures.approver.dataUrl" class="signature-img" :style="{ maxHeight: (reportStore.templateSettings.signatures.approver.size || 30) + 'px' }" />
              <EditableField v-else field-id="approver" :placeholder="getPlaceholder('approver', '核准人姓名')" :value="content.approver" @update="updateField('approver', $event)" />
            </div>
          </div>
          <div class="footer-note">
            <div class="footer-note-content">
              <div class="footer-note-item">
                <span v-html="getLabelHtml('saveDeptLabel', '备注：保存部门：')"></span>
                <EditableField field-id="saveDept" :placeholder="getPlaceholder('saveDept', '部门')" :value="content.saveDept" @update="updateField('saveDept', $event)" style="width: 80px;" />
              </div>
              <div class="footer-note-item center">
                <span v-html="getLabelHtml('saveYearsLabel', '保存年限：')"></span>
                <EditableField field-id="saveYears" :placeholder="getPlaceholder('saveYears', '年限')" :value="content.saveYears" @update="updateField('saveYears', $event)" style="width: 60px;" />
              </div>
              <div class="footer-note-item security-level-section">
                <span v-html="getLabelHtml('securityLevelLabel', '保密等级：')"></span>
                <el-radio-group v-model="securityLevel" size="small">
                  <el-radio label="绝密">绝密</el-radio>
                  <el-radio label="机密">机密</el-radio>
                  <el-radio label="内部公开">内部公开</el-radio>
                  <el-radio label="外部公开">外部公开</el-radio>
                </el-radio-group>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onActivated, watch, nextTick } from 'vue'
import { useReportStore } from '@/stores/report'
import EditableField from '@/components/report/EditableField.vue'
import ImageUploader from '@/components/report/ImageUploader.vue'
import ResizableSection from '@/components/report/ResizableSection.vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

const reportStore = useReportStore()
const route = useRoute()

const templateRef = ref(null)
const page1Ref = ref(null)
const imagesSectionRef = ref(null)
const loading = ref(true)
const batchAddCount = ref(1)
const batchImageAddCount = ref(1)
const securityLevel = ref('内部公开')

// Track which rows should show page break headers
const pageBreakRows = ref(new Set())

// Computed styles for logo and seal
const logoStyle = computed(() => {
  const logo = reportStore.templateSettings.logo
  if (!logo) return {}
  return {
    position: 'absolute',
    left: `${logo.position?.x || 20}px`,
    top: `${logo.position?.y || 10}px`,
    width: `${logo.size || 100}px`,
    zIndex: 10
  }
})

const sealStyle = computed(() => {
  const seal = reportStore.templateSettings.departmentSeal
  if (!seal) return {}
  return {
    position: 'absolute',
    left: `${seal.position?.x || 400}px`,
    top: `${seal.position?.y || 650}px`,
    width: `${seal.size || 120}px`,
    opacity: 1, // Full opacity in report view
    zIndex: 5
  }
})

// Template content data for labels and placeholders
const templateContentData = computed(() => reportStore.templateSettings.templateContentData || {})

// Helper to get template label with fallback
const getLabel = (key, defaultValue) => {
  return templateContentData.value[key] || defaultValue
}

// Helper to get template label as HTML (converts newlines to <br>)
const getLabelHtml = (key, defaultValue) => {
  const value = templateContentData.value[key] || defaultValue
  if (!value) return ''
  // Escape HTML entities and convert newlines to <br>
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}

// Helper to get placeholder text with fallback
const getPlaceholder = (key, defaultValue) => {
  return templateContentData.value.placeholders?.[key] || defaultValue
}

// Computed column widths for each table
const getColumnWidthStyle = (tableName, columnIndex) => {
  const widths = reportStore.templateSettings.tableColumnWidths?.[tableName]
  if (widths && widths.length > columnIndex && widths[columnIndex] > 0) {
    return { width: `${widths[columnIndex]}px` }
  }
  return {}
}

// Helper to generate colgroup with saved widths
const getTableColWidths = (tableName, defaultWidths) => {
  const savedWidths = reportStore.templateSettings.tableColumnWidths?.[tableName]
  if (savedWidths && savedWidths.length > 0) {
    return savedWidths
  }
  return defaultWidths
}

// Page overflow tracking
const pageOverflows = ref([])
const continuedSections = ref([]) // Sections that continue to next page

// A4 dimensions in mm and approximate px (at 96 DPI)
const A4_HEIGHT_MM = 297
const A4_WIDTH_MM = 210
const PAGE_CONTENT_HEIGHT_PX = 1050 // Approximate usable height in pixels

const content = computed(() => reportStore.content)

// Handle section overflow - track which sections need to continue on next page
const handleSectionOverflow = (sectionName, overflowData) => {
  const existingIndex = pageOverflows.value.findIndex(p => p.section === sectionName)
  if (existingIndex > -1) {
    pageOverflows.value[existingIndex] = { section: sectionName, ...overflowData }
  } else {
    pageOverflows.value.push({ section: sectionName, ...overflowData })
  }
  
  // If content overflows, mark section as continued
  if (overflowData.overflow > 0 && !continuedSections.value.includes(sectionName)) {
    continuedSections.value.push(sectionName)
  }
}

// Check if a section should show continued header
const shouldShowContinuedHeader = (sectionName) => {
  return continuedSections.value.includes(sectionName)
}

// Check page content height and update page breaks
const checkPageBreaks = () => {
  nextTick(() => {
    if (!page1Ref.value) return
    
    const pageContent = page1Ref.value
    const contentHeight = pageContent.scrollHeight
    const maxHeight = PAGE_CONTENT_HEIGHT_PX
    
    // If content exceeds page height, we need to handle overflow
    if (contentHeight > maxHeight) {
      // Find sections that overflow
      const sections = pageContent.querySelectorAll('.section')
      let accumulatedHeight = 0
      
      sections.forEach(section => {
        const sectionRect = section.getBoundingClientRect()
        const pageRect = pageContent.getBoundingClientRect()
        const sectionBottom = sectionRect.bottom - pageRect.top
        
        if (sectionBottom > maxHeight) {
          const sectionName = section.querySelector('.section-header')?.textContent || 'unknown'
          if (!continuedSections.value.includes(sectionName)) {
            continuedSections.value.push(sectionName)
          }
        }
      })
    }
  })
}

// Watch for content changes and check page breaks
watch(
  () => [reportStore.testResultRows.length, reportStore.content],
  () => {
    checkPageBreaks()
  },
  { deep: true }
)

// Field update handler
const updateField = (fieldId, value) => {
  reportStore.updateField(fieldId, value)
  // Check page breaks after content update
  nextTick(() => checkPageBreaks())
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

const deleteResultRow = (index) => {
  reportStore.deleteTestResultRow(index)
}

// Image row handlers
const addImageRow = () => {
  reportStore.addTestImageRows(1)
}

const addImageRows = (count) => {
  reportStore.addTestImageRows(count)
}

const updateImages = (rowIndex, position, images) => {
  reportStore.updateTestImage(rowIndex, position, images)
}

const deleteImageRow = (index) => {
  reportStore.deleteTestImageRow(index)
}

// Load template settings from backend
const loadTemplateSettings = async () => {
  try {
    const response = await fetch('/api/template/latest/general')
    if (response.ok) {
      const data = await response.json()
      if (data) {
        reportStore.applyTemplateSettings({
          logo: data.logo,
          signatures: data.signatures,
          departmentSeal: data.departmentSeal,
          securityLevel: data.securityLevel,
          tableColumnWidths: data.tableColumnWidths,
          templateContentData: data.templateContentData || {
            companyName: '',
            reportTitle: '',
            recordCode: '',
            placeholders: {}
          },
          fixedTextStyles: data.settings?.fixedTextStyles || null,
          editableTextStyles: data.settings?.editableTextStyles || null
        })
        // Set default security level from template
        if (data.securityLevel) {
          securityLevel.value = data.securityLevel
        }
      }
    }
  } catch (error) {
    console.error('Failed to load template settings:', error)
  }
}

// PDF Export handler
const handleExportPdf = async () => {
  try {
    ElMessage.info('正在生成PDF，请稍候...')
    
    // Add export mode class to hide controls
    templateRef.value.classList.add('pdf-export-mode')
    
    const pdf = new jsPDF('p', 'mm', 'a4')
    const page = page1Ref.value
    
    if (page) {
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        ignoreElements: (element) => {
          // Ignore row controls, delete buttons, and other UI elements
          return element.classList.contains('row-controls') ||
                 element.classList.contains('image-row-actions') ||
                 element.classList.contains('el-button--danger') ||
                 element.closest('.row-controls') !== null ||
                 element.closest('.image-row-actions') !== null
        }
      })
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)
    }
    
    // Remove export mode class
    templateRef.value.classList.remove('pdf-export-mode')
    
    // Generate filename
    const title = content.value.testProject || '可靠性测试报告'
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    pdf.save(`${title}_${date}.pdf`)
    
    ElMessage.success('PDF导出成功')
  } catch (error) {
    console.error('PDF export error:', error)
    // Remove export mode class in case of error
    if (templateRef.value) {
      templateRef.value.classList.remove('pdf-export-mode')
    }
    ElMessage.error('PDF导出失败：' + error.message)
  }
}

// Initialize
onMounted(async () => {
  // Load template and auto-saved content
  await reportStore.loadTemplate('general')
  await reportStore.loadAutoSave('general')
  
  // Load template settings from saved template
  await loadTemplateSettings()
  
  loading.value = false
  
  // Listen for export event
  window.addEventListener('export-pdf', handleExportPdf)
  
  // Initial page break check
  nextTick(() => {
    checkPageBreaks()
  })
})

// Watch route changes to reload template settings when navigating back to this page
watch(
  () => route.path,
  async (newPath) => {
    if (newPath.includes('/report/general')) {
      // Reload template settings when navigating to this page
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

.a4-page {
  width: 210mm;
  min-height: 297mm;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin: 0 auto 20px;
  padding: 10mm 15mm 15mm 15mm;
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  
  // Page height indicator - shows exact A4 boundary
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(to right, 
      transparent 0%, 
      #e74c3c 20%, 
      #e74c3c 80%, 
      transparent 100%
    );
    opacity: 0.5;
  }
}

.page-content {
  flex: 1 0 auto;
  position: relative;
}

.logo-area {
  img {
    max-width: 100%;
    height: auto;
  }
}

.department-seal {
  img {
    max-width: 100%;
    height: auto;
  }
}

.page-header {
  text-align: center;
  margin-bottom: 15px;
  
  .company-name {
    font-size: 18px;
    font-weight: 600;
    color: #000;
    font-family: SimSun, serif;
  }
  
  .report-title {
    font-size: 16px;
    font-weight: 600;
    margin-top: 8px;
  }
  
  .record-code {
    font-size: 9px;
    color: #666;
    margin-top: 5px;
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
  position: relative;
  page-break-inside: avoid;
  
  .section-header {
    font-weight: 600;
    font-size: 12px;
    padding: 5px 0;
    border-bottom: 1px solid #000;
    margin-bottom: 8px;
    page-break-after: avoid;
  }
  
  // Resize handle for manual height adjustment
  &:hover::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: #409eff;
    border-radius: 2px;
    opacity: 0.5;
    cursor: ns-resize;
  }
}

// Allow test results and images sections to break across pages
.section.allow-break {
  page-break-inside: auto;
  
  // Repeat header after page break
  .section-header {
    display: table-header-group;
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

.row-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  
  .row-count-input {
    width: 80px;
  }
}

.judgment-section {
  margin-top: 15px;
  
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

.page-footer {
  flex-shrink: 0;
  margin-top: auto;
  padding-top: 20px;
  border-top: none;
  
  .signature-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 11px;
    
    .signature-item {
      display: flex;
      align-items: center;
      gap: 5px;
      flex: 1;
      
      .label {
        font-weight: 500;
        flex-shrink: 0;
      }
      
      .signature-img {
        object-fit: contain;
      }
      
      :deep(.editable-field) {
        min-width: 80px;
        min-height: 1.5em;
        flex-shrink: 0;
      }
    }
  }
  
  .footer-note {
    font-size: 9px;
    color: #666;
    
    .footer-note-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      
      .footer-note-item {
        display: flex;
        align-items: center;
        gap: 4px;
        
        :deep(.editable-field) {
          min-height: 1.5em;
        }
        
        &.center {
          justify-content: center;
        }
        
        &.security-level-section {
          justify-content: flex-end;
        }
      }
    }
  }
}

.page-break {
  position: relative;
  height: 30px;
  margin: 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 210mm;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: repeating-linear-gradient(
      to right,
      #dcdfe6,
      #dcdfe6 5px,
      transparent 5px,
      transparent 10px
    );
  }
  
  .page-break-label {
    padding: 0 15px;
    color: #909399;
    font-size: 12px;
    background: #f5f7fa;
    white-space: nowrap;
  }
}

// Image section styles
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
  page-break-inside: avoid;
  
  .image-row-content {
    flex: 1;
    display: flex;
    gap: 10px;
  }
  
  .image-row-actions {
    padding-top: 40px;
  }
}

.image-page-break {
  margin: 20px 0;
  padding-top: 20px;
  border-top: 2px dashed #e4e7ed;
  page-break-before: always;
  
  .page-break-marker {
    text-align: center;
    color: #909399;
    font-size: 12px;
    margin-bottom: 15px;
  }
  
  .continued-header {
    font-weight: 600;
    font-size: 12px;
    padding: 5px 0;
    border-bottom: 1px solid #000;
    margin-bottom: 8px;
  }
}

.text-center {
  text-align: center;
}

// PDF export mode - hide UI controls
.pdf-export-mode {
  .row-controls {
    display: none !important;
  }
  
  .image-row-actions {
    display: none !important;
  }
  
  .result-table th:last-child,
  .result-table td:last-child {
    display: none !important;
  }
  
  .el-button--danger {
    display: none !important;
  }
}
</style>
