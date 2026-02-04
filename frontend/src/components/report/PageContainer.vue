<template>
  <div class="a4-page" :class="{ 'pdf-export-mode': exportMode }">
    <!-- Page Header -->
    <div class="page-header">
      <!-- Logo -->
      <div 
        v-if="templateSettings.logo?.dataUrl" 
        class="logo-area"
        :style="logoStyle"
      >
        <img :src="templateSettings.logo.dataUrl" alt="Logo" />
      </div>
      <div class="company-name" :style="getFieldStyle('companyName')" v-html="getLabelHtml('companyName', '深圳市欣威智能有限公司')"></div>
      <div class="report-title" :style="getFieldStyle('reportTitle')" v-html="getLabelHtml('reportTitle', '可靠性实验报告')"></div>
      <div class="record-code" :style="getFieldStyle('recordCode')" v-html="getLabelHtml('recordCode', '记录代码：F-SUN1-XV-15.11.1.1/A0')"></div>
    </div>
    
    <!-- Page Content -->
    <div class="page-content">
      <slot></slot>
    </div>
    
    <!-- Department Seal (positioned absolutely) -->
    <div 
      v-if="templateSettings.departmentSeal?.dataUrl"
      class="department-seal"
      :style="sealStyle"
    >
      <img :src="templateSettings.departmentSeal.dataUrl" alt="Seal" />
    </div>
    
    <!-- Page Footer -->
    <div class="page-footer">
      <div class="signature-row">
        <div class="signature-item">
          <span class="label" :style="getSignatureLabelStyle('testerLabel')" v-html="getLabelHtml('testerLabel', '测试员：')"></span>
          <img v-if="templateSettings.signatures?.tester?.dataUrl" :src="templateSettings.signatures.tester.dataUrl" class="signature-img" :style="{ maxHeight: (templateSettings.signatures.tester.size || 30) + 'px' }" />
          <EditableField v-else field-id="tester" :placeholder="getPlaceholder('tester', '测试员姓名')" :value="content.tester" @update="$emit('update-field', 'tester', $event)" :font-size="12" font-family="Microsoft YaHei" color="#999" />
        </div>
        <div class="signature-item">
          <span class="label" :style="getSignatureLabelStyle('reviewerLabel')" v-html="getLabelHtml('reviewerLabel', '审核：')"></span>
          <img v-if="templateSettings.signatures?.reviewer?.dataUrl" :src="templateSettings.signatures.reviewer.dataUrl" class="signature-img" :style="{ maxHeight: (templateSettings.signatures.reviewer.size || 30) + 'px' }" />
          <EditableField v-else field-id="reviewer" :placeholder="getPlaceholder('reviewer', '审核人姓名')" :value="content.reviewer" @update="$emit('update-field', 'reviewer', $event)" :font-size="12" font-family="Microsoft YaHei" color="#999" />
        </div>
        <div class="signature-item">
          <span class="label" :style="getSignatureLabelStyle('approverLabel')" v-html="getLabelHtml('approverLabel', '核准：')"></span>
          <img v-if="templateSettings.signatures?.approver?.dataUrl" :src="templateSettings.signatures.approver.dataUrl" class="signature-img" :style="{ maxHeight: (templateSettings.signatures.approver.size || 30) + 'px' }" />
          <EditableField v-else field-id="approver" :placeholder="getPlaceholder('approver', '核准人姓名')" :value="content.approver" @update="$emit('update-field', 'approver', $event)" :font-size="12" font-family="Microsoft YaHei" color="#999" />
        </div>
      </div>
      <div class="footer-note">
        <div class="footer-note-content">
          <div class="footer-note-item">
            <span :style="getFooterNoteLabelStyle('saveDeptLabel')" v-html="getLabelHtml('saveDeptLabel', '备注：保存部门：')"></span>
            <EditableField field-id="saveDept" :placeholder="getPlaceholder('saveDept', '部门')" :value="content.saveDept" @update="$emit('update-field', 'saveDept', $event)" style="width: 80px;" :font-size="9" color="#999" />
          </div>
          <div class="footer-note-item center">
            <span :style="getFooterNoteLabelStyle('saveYearsLabel')" v-html="getLabelHtml('saveYearsLabel', '保存年限：')"></span>
            <EditableField field-id="saveYears" :placeholder="getPlaceholder('saveYears', '年限')" :value="content.saveYears" @update="$emit('update-field', 'saveYears', $event)" style="width: 60px;" :font-size="9" color="#999" />
          </div>
          <div class="footer-note-item security-level-section">
            <span :style="getFooterNoteLabelStyle('securityLevelLabel')" v-html="getLabelHtml('securityLevelLabel', '保密等级：')"></span>
            <el-radio-group v-model="localSecurityLevel" size="small" @change="$emit('update-security-level', $event)">
              <el-radio label="绝密">绝密</el-radio>
              <el-radio label="机密">机密</el-radio>
              <el-radio label="内部公开">内部公开</el-radio>
              <el-radio label="外部公开">外部公开</el-radio>
            </el-radio-group>
          </div>
        </div>
      </div>
      
      <!-- Page number indicator -->
      <div v-if="showPageNumber" class="page-number">
        第 {{ pageNumber }} 页 / 共 {{ totalPages }} 页
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import EditableField from '@/components/report/EditableField.vue'
import { useReportStore } from '@/stores/report'

const props = defineProps({
  pageNumber: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    default: 1
  },
  showPageNumber: {
    type: Boolean,
    default: true
  },
  exportMode: {
    type: Boolean,
    default: false
  },
  content: {
    type: Object,
    default: () => ({})
  },
  securityLevel: {
    type: String,
    default: '内部公开'
  }
})

const emit = defineEmits(['update-field', 'update-security-level'])

const reportStore = useReportStore()
const localSecurityLevel = ref(props.securityLevel)

// Watch for external securityLevel changes
watch(() => props.securityLevel, (newVal) => {
  localSecurityLevel.value = newVal
})

// Template settings from store
const templateSettings = computed(() => reportStore.templateSettings)

// Template content data for labels
const templateContentData = computed(() => reportStore.templateSettings.templateContentData || {})

// Logo style
const logoStyle = computed(() => {
  const logo = templateSettings.value.logo
  if (!logo) return {}
  return {
    position: 'absolute',
    left: `${logo.position?.x || 20}px`,
    top: `${logo.position?.y || 10}px`,
    width: `${logo.size || 100}px`,
    zIndex: 10
  }
})

// Seal style
const sealStyle = computed(() => {
  const seal = templateSettings.value.departmentSeal
  if (!seal) return {}
  return {
    position: 'absolute',
    left: `${seal.position?.x || 400}px`,
    top: `${seal.position?.y || 650}px`,
    width: `${seal.size || 120}px`,
    opacity: 1,
    zIndex: 5
  }
})

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

// Get style for signature labels
const getSignatureLabelStyle = (fieldId) => {
  const defaultStyle = {
    color: '#000000',
    fontFamily: '"Microsoft YaHei", sans-serif',
    fontSize: '12px'
  }
  const format = reportStore.getFieldFormat(fieldId)
  if (!format) return defaultStyle
  
  return {
    ...defaultStyle,
    ...(format.fontFamily && { fontFamily: format.fontFamily }),
    ...(format.fontSize && { fontSize: `${format.fontSize}px` }),
    ...(format.color && { color: format.color }),
    ...(format.fontWeight && { fontWeight: format.fontWeight }),
    ...(format.fontStyle && { fontStyle: format.fontStyle }),
    ...(format.textDecoration && { textDecoration: format.textDecoration }),
    ...(format.textAlign && { textAlign: format.textAlign })
  }
}

// Get style for footer note labels
const getFooterNoteLabelStyle = (fieldId) => {
  const defaultStyle = {
    color: '#000000',
    fontFamily: '"Microsoft YaHei", sans-serif',
    fontSize: '9px'
  }
  const format = reportStore.getFieldFormat(fieldId)
  if (!format) return defaultStyle
  
  return {
    ...defaultStyle,
    ...(format.fontFamily && { fontFamily: format.fontFamily }),
    ...(format.fontSize && { fontSize: `${format.fontSize}px` }),
    ...(format.color && { color: format.color }),
    ...(format.fontWeight && { fontWeight: format.fontWeight }),
    ...(format.fontStyle && { fontStyle: format.fontStyle }),
    ...(format.textDecoration && { textDecoration: format.textDecoration }),
    ...(format.textAlign && { textAlign: format.textAlign })
  }
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
</script>

<style lang="scss" scoped>
.a4-page {
  width: 210mm;
  min-height: 297mm;
  max-height: 297mm;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin: 0 auto 20px;
  padding: 10mm 15mm 15mm 15mm;
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  
  &.pdf-export-mode {
    box-shadow: none;
    margin: 0;
  }
}

.page-content {
  flex: 1;
  overflow: hidden;
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
  flex-shrink: 0;
  
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

.page-footer {
  flex-shrink: 0;
  margin-top: auto;
  padding-top: 15px;
  position: relative;
  
  .signature-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 12px;
    
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
          
          :deep(.el-radio-group) {
            display: flex;
            gap: 8px;
            
            .el-radio {
              margin-right: 0;
              
              .el-radio__label {
                font-size: 9px;
                padding-left: 4px;
              }
            }
          }
        }
      }
    }
  }
  
  .page-number {
    text-align: center;
    font-size: 10px;
    color: #666;
    margin-top: 8px;
    padding-top: 5px;
    border-top: 1px solid #e4e7ed;
  }
}
</style>
