<template>
  <div class="template-general">
    <div class="a4-page template-page" ref="pageRef">
      <!-- Main Content Area -->
      <div class="page-content">
        <!-- Header -->
        <div class="page-header">
        <div 
          v-if="templateStore.logo.dataUrl" 
          class="logo-area"
          :style="logoStyle"
          @mousedown="startLogoDrag"
        >
          <img :src="templateStore.logo.dataUrl" alt="Logo" draggable="false" />
        </div>
        <div class="company-name editable-text" :style="getFieldStyle('companyName', companyNameStyle)" contenteditable="true" data-field-id="companyName" @blur="updateFixedText('companyName', $event)">{{ templateData.companyName || '深圳市欣威智能有限公司' }}</div>
        <div class="report-title editable-text" :style="getFieldStyle('reportTitle', reportTitleStyle)" contenteditable="true" data-field-id="reportTitle" @blur="updateFixedText('reportTitle', $event)">{{ templateData.reportTitle || '可靠性实验报告' }}</div>
        <div class="record-code editable-text" :style="getFieldStyle('recordCode', { ...fixedTextStyle, fontSize: '9px' })" contenteditable="true" data-field-id="recordCode" @blur="updateFixedText('recordCode', $event)">{{ templateData.recordCode || '记录代码：F-SUN1-XV-15.11.1.1/A0' }}</div>
      </div>
      
      <!-- Report Number -->
      <div class="report-info-row">
        <span class="label editable-text" :style="getFieldStyle('reportNumberLabel', fixedTextStyle)" contenteditable="true" data-field-id="reportNumberLabel" @blur="updateFixedText('reportNumberLabel', $event)" @keydown="handleKeydown($event, false)">{{ templateData.reportNumberLabel || '报告编号：' }}</span>
        <span class="placeholder-text editable-text" :style="getFieldStyle('reportNumber', editableTextStyle)" contenteditable="true" data-field-id="reportNumber" @blur="updatePlaceholder('reportNumber', $event)" @keydown="handleKeydown($event, true)">{{ templateData.placeholders?.reportNumber || '请输入报告编号' }}</span>
      </div>
      
      <!-- Test Project and Conclusion -->
      <ResizableTable
        ref="infoTableRef"
        table-id="infoTable"
        :initial-widths="templateStore.tableColumnWidths.infoTable"
        :external-edges="getExternalEdges('infoTable')"
        @widths-change="(widths) => handleTableWidthsChange('infoTable', widths)"
        @edges-change="handleEdgesChange"
      >
        <tbody>
          <tr>
            <td class="label-cell editable-text" :style="getFieldStyle('testProjectLabel', fixedTextStyle)" contenteditable="true" data-field-id="testProjectLabel" @blur="updateFixedText('testProjectLabel', $event)">{{ templateData.testProjectLabel || '测试项目' }}</td>
            <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('testProject', editableTextStyle)" contenteditable="true" data-field-id="testProject" @blur="updatePlaceholder('testProject', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('testProject', '请输入测试项目')"></span></td>
            <td class="label-cell editable-text" :style="getFieldStyle('testConclusionLabel', fixedTextStyle)" contenteditable="true" data-field-id="testConclusionLabel" @blur="updateFixedText('testConclusionLabel', $event)">{{ templateData.testConclusionLabel || '测试结论' }}</td>
            <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('testConclusion', editableTextStyle)" contenteditable="true" data-field-id="testConclusion" @blur="updatePlaceholder('testConclusion', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('testConclusion', '请输入测试结论')"></span></td>
          </tr>
        </tbody>
      </ResizableTable>
      
      <!-- Sample Information Section -->
      <div class="section">
        <div class="section-header editable-text" :style="getFieldStyle('sampleInfoHeader', fixedTextStyle)" contenteditable="true" data-field-id="sampleInfoHeader" @blur="updateFixedText('sampleInfoHeader', $event)">{{ templateData.sampleInfoHeader || '样品信息' }}</div>
        <ResizableTable
          ref="sampleTableRef"
          table-id="sampleTable"
          :initial-widths="templateStore.tableColumnWidths.sampleTable"
          :external-edges="getExternalEdges('sampleTable')"
          @widths-change="(widths) => handleTableWidthsChange('sampleTable', widths)"
          @edges-change="handleEdgesChange"
        >
          <tbody>
            <tr>
              <td class="label-cell editable-text" :style="getFieldStyle('customerLabel', fixedTextStyle)" contenteditable="true" data-field-id="customerLabel" @blur="updateFixedText('customerLabel', $event)">{{ templateData.customerLabel || '客户' }}</td>
              <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('customer', editableTextStyle)" contenteditable="true" data-field-id="customer" @blur="updatePlaceholder('customer', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('customer', '请输入客户名称')"></span></td>
              <td class="label-cell editable-text" :style="getFieldStyle('departmentLabel', fixedTextStyle)" contenteditable="true" data-field-id="departmentLabel" @blur="updateFixedText('departmentLabel', $event)">{{ templateData.departmentLabel || '委托部门' }}</td>
              <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('department', editableTextStyle)" contenteditable="true" data-field-id="department" @blur="updatePlaceholder('department', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('department', '请输入委托部门')"></span></td>
              <td class="label-cell editable-text" :style="getFieldStyle('sampleCountLabel', fixedTextStyle)" contenteditable="true" data-field-id="sampleCountLabel" @blur="updateFixedText('sampleCountLabel', $event)">{{ templateData.sampleCountLabel || '样品数量' }}</td>
              <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('sampleCount', editableTextStyle)" contenteditable="true" data-field-id="sampleCount" @blur="updatePlaceholder('sampleCount', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('sampleCount', '数量')"></span></td>
            </tr>
            <tr>
              <td class="label-cell editable-text" :style="getFieldStyle('projectNameLabel', fixedTextStyle)" contenteditable="true" data-field-id="projectNameLabel" @blur="updateFixedText('projectNameLabel', $event)">{{ templateData.projectNameLabel || '项目名称' }}</td>
              <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('projectName', editableTextStyle)" contenteditable="true" data-field-id="projectName" @blur="updatePlaceholder('projectName', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('projectName', '请输入项目名称')"></span></td>
              <td class="label-cell editable-text" :style="getFieldStyle('requesterLabel', fixedTextStyle)" contenteditable="true" data-field-id="requesterLabel" @blur="updateFixedText('requesterLabel', $event)">{{ templateData.requesterLabel || '委托人员' }}</td>
              <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('requester', editableTextStyle)" contenteditable="true" data-field-id="requester" @blur="updatePlaceholder('requester', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('requester', '请输入委托人员')"></span></td>
              <td class="label-cell editable-text" :style="getFieldStyle('startTimeLabel', fixedTextStyle)" contenteditable="true" data-field-id="startTimeLabel" @blur="updateFixedText('startTimeLabel', $event)">{{ templateData.startTimeLabel || '开始时间' }}</td>
              <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('startTime', editableTextStyle)" contenteditable="true" data-field-id="startTime" @blur="updatePlaceholder('startTime', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('startTime', '开始时间')"></span></td>
            </tr>
            <tr>
              <td class="label-cell editable-text" :style="getFieldStyle('productNameLabel', fixedTextStyle)" contenteditable="true" data-field-id="productNameLabel" @blur="updateFixedText('productNameLabel', $event)">{{ templateData.productNameLabel || '产品名称' }}</td>
              <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('productName', editableTextStyle)" contenteditable="true" data-field-id="productName" @blur="updatePlaceholder('productName', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('productName', '请输入产品名称')"></span></td>
              <td class="label-cell editable-text" :style="getFieldStyle('sampleStageLabel', fixedTextStyle)" contenteditable="true" data-field-id="sampleStageLabel" @blur="updateFixedText('sampleStageLabel', $event)">{{ templateData.sampleStageLabel || '样品阶段' }}</td>
              <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('sampleStage', editableTextStyle)" contenteditable="true" data-field-id="sampleStage" @blur="updatePlaceholder('sampleStage', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('sampleStage', '请输入样品阶段')"></span></td>
              <td class="label-cell editable-text" :style="getFieldStyle('endTimeLabel', fixedTextStyle)" contenteditable="true" data-field-id="endTimeLabel" @blur="updateFixedText('endTimeLabel', $event)">{{ templateData.endTimeLabel || '完成时间' }}</td>
              <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('endTime', editableTextStyle)" contenteditable="true" data-field-id="endTime" @blur="updatePlaceholder('endTime', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('endTime', '完成时间')"></span></td>
            </tr>
            <tr>
              <td class="label-cell editable-text" :style="getFieldStyle('testPurposeLabel', fixedTextStyle)" contenteditable="true" data-field-id="testPurposeLabel" @blur="updateFixedText('testPurposeLabel', $event)">{{ templateData.testPurposeLabel || '测试目的' }}</td>
              <td class="editable-cell" colspan="5"><span class="cell-input editable-text" :style="getFieldStyle('testPurpose', editableTextStyle)" contenteditable="true" data-field-id="testPurpose" @blur="updatePlaceholder('testPurpose', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('testPurpose', '请输入测试目的')"></span></td>
            </tr>
          </tbody>
        </ResizableTable>
      </div>
      
      <!-- Equipment Information Section -->
      <div class="section">
        <div class="section-header editable-text" :style="getFieldStyle('equipmentInfoHeader', fixedTextStyle)" contenteditable="true" data-field-id="equipmentInfoHeader" @blur="updateFixedText('equipmentInfoHeader', $event)">{{ templateData.equipmentInfoHeader || '设备信息' }}</div>
        <ResizableTable
          ref="equipmentTableRef"
          table-id="equipmentTable"
          :initial-widths="templateStore.tableColumnWidths.equipmentTable"
          :external-edges="getExternalEdges('equipmentTable')"
          @widths-change="(widths) => handleTableWidthsChange('equipmentTable', widths)"
          @edges-change="handleEdgesChange"
        >
          <tbody>
            <tr>
              <td class="label-cell editable-text" :style="getFieldStyle('testEquipmentLabel', fixedTextStyle)" contenteditable="true" data-field-id="testEquipmentLabel" @blur="updateFixedText('testEquipmentLabel', $event)">{{ templateData.testEquipmentLabel || '测试设备' }}</td>
              <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('testEquipment', editableTextStyle)" contenteditable="true" data-field-id="testEquipment" @blur="updatePlaceholder('testEquipment', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('testEquipment', '请输入测试设备')"></span></td>
              <td class="label-cell editable-text" :style="getFieldStyle('equipmentModelLabel', fixedTextStyle)" contenteditable="true" data-field-id="equipmentModelLabel" @blur="updateFixedText('equipmentModelLabel', $event)">{{ templateData.equipmentModelLabel || '设备型号' }}</td>
              <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('equipmentModel', editableTextStyle)" contenteditable="true" data-field-id="equipmentModel" @blur="updatePlaceholder('equipmentModel', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('equipmentModel', '请输入设备型号')"></span></td>
              <td class="label-cell editable-text" :style="getFieldStyle('calibrationDateLabel', fixedTextStyle)" contenteditable="true" data-field-id="calibrationDateLabel" @blur="updateFixedText('calibrationDateLabel', $event)">{{ templateData.calibrationDateLabel || '校准日期' }}</td>
              <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('calibrationDate', editableTextStyle)" contenteditable="true" data-field-id="calibrationDate" @blur="updatePlaceholder('calibrationDate', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('calibrationDate', '校准日期')"></span></td>
            </tr>
          </tbody>
        </ResizableTable>
      </div>
      
      <!-- Test Conditions Section -->
      <div class="section">
        <div class="section-header editable-text" :style="getFieldStyle('testConditionsHeader', fixedTextStyle)" contenteditable="true" data-field-id="testConditionsHeader" @blur="updateFixedText('testConditionsHeader', $event)">{{ templateData.testConditionsHeader || '测试条件' }}</div>
        
        <div class="subsection">
          <div class="subsection-row centered-label">
            <span class="label editable-text" :style="getFieldStyle('testStandardLabel', fixedTextStyle)" contenteditable="true" data-field-id="testStandardLabel" @blur="updateFixedText('testStandardLabel', $event)" @keydown="handleKeydown($event, true)">{{ templateData.testStandardLabel || '测试标准' }}</span>
            <div class="subsection-content">
              <span class="placeholder-text editable-text multiline" :style="getFieldStyle('testStandard', editableTextStyle)" contenteditable="true" data-field-id="testStandard" @blur="updatePlaceholder('testStandard', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('testStandard', '请输入测试标准...')"></span>
            </div>
          </div>
        </div>
        
        <div class="subsection">
          <div class="subsection-row centered-label">
            <span class="label editable-text" :style="getFieldStyle('judgmentStandardLabel', fixedTextStyle)" contenteditable="true" data-field-id="judgmentStandardLabel" @blur="updateFixedText('judgmentStandardLabel', $event)" @keydown="handleKeydown($event, true)">{{ templateData.judgmentStandardLabel || '判定标准' }}</span>
            <div class="subsection-content">
              <span class="placeholder-text editable-text multiline" :style="getFieldStyle('judgmentStandard', editableTextStyle)" contenteditable="true" data-field-id="judgmentStandard" @blur="updatePlaceholder('judgmentStandard', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('judgmentStandard', '请输入判定标准...')"></span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Test Results Section -->
      <div class="section">
        <div class="section-header editable-text" :style="getFieldStyle('testResultsHeader', fixedTextStyle)" contenteditable="true" data-field-id="testResultsHeader" @blur="updateFixedText('testResultsHeader', $event)">{{ templateData.testResultsHeader || '测试结果信息' }}</div>
        <ResizableTable
          ref="resultTableRef"
          table-id="resultTable"
          :initial-widths="templateStore.tableColumnWidths.resultTable"
          :external-edges="getExternalEdges('resultTable')"
          @widths-change="(widths) => handleTableWidthsChange('resultTable', widths)"
          @edges-change="handleEdgesChange"
          class="result-table-wrapper"
        >
          <thead>
            <tr>
              <th class="editable-text" :style="getFieldStyle('resultIdHeader', fixedTextStyle)" contenteditable="true" data-field-id="resultIdHeader" @blur="updateFixedText('resultIdHeader', $event)">{{ templateData.resultIdHeader || '编号' }}</th>
              <th class="editable-text" :style="getFieldStyle('appearanceHeader', fixedTextStyle)" contenteditable="true" data-field-id="appearanceHeader" @blur="updateFixedText('appearanceHeader', $event)">{{ templateData.appearanceHeader || '实验后外观检查' }}</th>
              <th class="editable-text" :style="getFieldStyle('functionHeader', fixedTextStyle)" contenteditable="true" data-field-id="functionHeader" @blur="updateFixedText('functionHeader', $event)">{{ templateData.functionHeader || '实验后功能检查' }}</th>
              <th class="editable-text" :style="getFieldStyle('otherHeader', fixedTextStyle)" contenteditable="true" data-field-id="otherHeader" @blur="updateFixedText('otherHeader', $event)">{{ templateData.otherHeader || '其它性能检查' }}</th>
              <th class="editable-text" :style="getFieldStyle('conclusionHeader', fixedTextStyle)" contenteditable="true" data-field-id="conclusionHeader" @blur="updateFixedText('conclusionHeader', $event)">{{ templateData.conclusionHeader || '测试结论' }}</th>
              <th class="editable-text" :style="getFieldStyle('noteHeader', fixedTextStyle)" contenteditable="true" data-field-id="noteHeader" @blur="updateFixedText('noteHeader', $event)">{{ templateData.noteHeader || '备注' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-center" :style="getFieldStyle('resultId1', fixedTextStyle)">1</td>
              <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('appearance', editableTextStyle)" contenteditable="true" data-field-id="appearance" @blur="updatePlaceholder('appearance', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('appearance', '外观检查结果')"></span></td>
              <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('function', editableTextStyle)" contenteditable="true" data-field-id="function" @blur="updatePlaceholder('function', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('function', '功能检查结果')"></span></td>
              <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('other', editableTextStyle)" contenteditable="true" data-field-id="other" @blur="updatePlaceholder('other', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('other', '其它性能')"></span></td>
              <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('conclusion', editableTextStyle)" contenteditable="true" data-field-id="conclusion" @blur="updatePlaceholder('conclusion', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('conclusion', '结论')"></span></td>
              <td class="editable-cell"><span class="cell-input editable-text" :style="getFieldStyle('note', editableTextStyle)" contenteditable="true" data-field-id="note" @blur="updatePlaceholder('note', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('note', '备注')"></span></td>
            </tr>
          </tbody>
        </ResizableTable>
        
        <div class="judgment-section">
          <div class="judgment-row centered-label">
            <span class="label editable-text" :style="getFieldStyle('judgmentResultLabel', fixedTextStyle)" contenteditable="true" data-field-id="judgmentResultLabel" @blur="updateFixedText('judgmentResultLabel', $event)" @keydown="handleKeydown($event, true)">{{ templateData.judgmentResultLabel || '判定结果' }}</span>
            <div class="judgment-content">
              <span class="placeholder-text editable-text multiline" :style="getFieldStyle('judgmentResult', editableTextStyle)" contenteditable="true" data-field-id="judgmentResult" @blur="updatePlaceholder('judgmentResult', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('judgmentResult', '请输入判定结果...')"></span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Test Images Section -->
      <div class="section">
        <div class="section-header editable-text" :style="getFieldStyle('testImagesHeader', fixedTextStyle)" contenteditable="true" data-field-id="testImagesHeader" @blur="updateFixedText('testImagesHeader', $event)">{{ templateData.testImagesHeader || '测试图片' }}</div>
        
        <!-- Image column headers -->
        <div class="image-headers">
          <div class="image-header editable-text" :style="getFieldStyle('beforeTestLabel', fixedTextStyle)" contenteditable="true" data-field-id="beforeTestLabel" @blur="updateFixedText('beforeTestLabel', $event)">{{ templateData.beforeTestLabel || '测试前' }}</div>
          <div class="image-header editable-text" :style="getFieldStyle('duringTestLabel', fixedTextStyle)" contenteditable="true" data-field-id="duringTestLabel" @blur="updateFixedText('duringTestLabel', $event)">{{ templateData.duringTestLabel || '测试中' }}</div>
          <div class="image-header editable-text" :style="getFieldStyle('afterTestLabel', fixedTextStyle)" contenteditable="true" data-field-id="afterTestLabel" @blur="updateFixedText('afterTestLabel', $event)">{{ templateData.afterTestLabel || '测试后' }}</div>
        </div>
        
        <!-- Sample image row -->
        <div class="image-row">
          <div class="image-cell">
            <div class="image-placeholder" :style="getFieldStyle('imagePlaceholder1', editableTextStyle)">
              <span>图片占位</span>
            </div>
          </div>
          <div class="image-cell">
            <div class="image-placeholder" :style="getFieldStyle('imagePlaceholder2', editableTextStyle)">
              <span>图片占位</span>
            </div>
          </div>
          <div class="image-cell">
            <div class="image-placeholder" :style="getFieldStyle('imagePlaceholder3', editableTextStyle)">
              <span>图片占位</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Department Seal -->
      <div 
        v-if="templateStore.departmentSeal.dataUrl"
        class="department-seal"
        :style="sealStyle"
        @mousedown="startSealDrag"
      >
        <img :src="templateStore.departmentSeal.dataUrl" alt="Seal" draggable="false" />
      </div>
    </div>
    
    <!-- Footer (sticky to bottom) -->
    <div class="page-footer">
      <div class="signature-row">
        <div class="signature-item">
          <span class="label editable-text" :style="getFieldStyle('testerLabel', signatureLabelStyle)" contenteditable="true" data-field-id="testerLabel" @blur="updateFixedText('testerLabel', $event)">{{ templateData.testerLabel || '测试员：' }}</span>
          <img v-if="templateStore.signatures.tester.dataUrl" :src="templateStore.signatures.tester.dataUrl" class="signature-img" :style="signatureStyle('tester')" />
          <span v-else class="placeholder-text editable-text" :style="getFieldStyle('tester', signaturePlaceholderStyle)" contenteditable="true" data-field-id="tester" @blur="updatePlaceholder('tester', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('tester', '测试员姓名')"></span>
        </div>
        <div class="signature-item">
          <span class="label editable-text" :style="getFieldStyle('reviewerLabel', signatureLabelStyle)" contenteditable="true" data-field-id="reviewerLabel" @blur="updateFixedText('reviewerLabel', $event)">{{ templateData.reviewerLabel || '审核：' }}</span>
          <img v-if="templateStore.signatures.reviewer.dataUrl" :src="templateStore.signatures.reviewer.dataUrl" class="signature-img" :style="signatureStyle('reviewer')" />
          <span v-else class="placeholder-text editable-text" :style="getFieldStyle('reviewer', signaturePlaceholderStyle)" contenteditable="true" data-field-id="reviewer" @blur="updatePlaceholder('reviewer', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('reviewer', '审核人姓名')"></span>
        </div>
        <div class="signature-item">
          <span class="label editable-text" :style="getFieldStyle('approverLabel', signatureLabelStyle)" contenteditable="true" data-field-id="approverLabel" @blur="updateFixedText('approverLabel', $event)">{{ templateData.approverLabel || '核准：' }}</span>
          <img v-if="templateStore.signatures.approver.dataUrl" :src="templateStore.signatures.approver.dataUrl" class="signature-img" :style="signatureStyle('approver')" />
          <span v-else class="placeholder-text editable-text" :style="getFieldStyle('approver', signaturePlaceholderStyle)" contenteditable="true" data-field-id="approver" @blur="updatePlaceholder('approver', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('approver', '核准人姓名')"></span>
        </div>
      </div>
      <div class="footer-note-row">
        <div class="footer-note-content">
          <div class="footer-note-item">
            <span class="editable-text" :style="getFieldStyle('saveDeptLabel', footerNoteLabelStyle)" contenteditable="true" data-field-id="saveDeptLabel" @blur="updateFixedText('saveDeptLabel', $event)">{{ templateData.saveDeptLabel || '备注：保存部门：' }}</span>
            <span class="placeholder-text editable-text" :style="getFieldStyle('saveDept', { color: editableTextStyle.color, fontStyle: 'italic', fontSize: '9px' })" contenteditable="true" data-field-id="saveDept" @blur="updatePlaceholder('saveDept', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('saveDept', '部门')"></span>
          </div>
          <div class="footer-note-item center">
            <span class="editable-text" :style="getFieldStyle('saveYearsLabel', footerNoteLabelStyle)" contenteditable="true" data-field-id="saveYearsLabel" @blur="updateFixedText('saveYearsLabel', $event)">{{ templateData.saveYearsLabel || '保存年限：' }}</span>
            <span class="placeholder-text editable-text" :style="getFieldStyle('saveYears', { color: editableTextStyle.color, fontStyle: 'italic', fontSize: '9px' })" contenteditable="true" data-field-id="saveYears" @blur="updatePlaceholder('saveYears', $event)" @keydown="handleKeydown($event, true)" v-html="getPlaceholderHtml('saveYears', '年限')"></span>
          </div>
          <div class="footer-note-item security-level-section">
            <span class="editable-text" :style="getFieldStyle('securityLevelLabel', footerNoteLabelStyle)" contenteditable="true" data-field-id="securityLevelLabel" @blur="updateFixedText('securityLevelLabel', $event)">{{ templateData.securityLevelLabel || '保密等级：' }}</span>
            <el-radio-group v-model="securityLevel" size="small" @change="updateSecurityLevel">
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
</div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, reactive, watch, nextTick } from 'vue'
import { useTemplateStore } from '@/stores/template'
import ResizableTable from '@/components/report/ResizableTable.vue'

const templateStore = useTemplateStore()
const pageRef = ref(null)

// Table refs
const infoTableRef = ref(null)
const sampleTableRef = ref(null)
const equipmentTableRef = ref(null)
const resultTableRef = ref(null)

// Template data - use computed to sync with store
const templateData = computed(() => templateStore.templateContentData)

// Security level selection
const securityLevel = ref('内部公开')

// Cross-table alignment: store edges for each table
const tableEdges = reactive({
  infoTable: [],
  sampleTable: [],
  equipmentTable: [],
  resultTable: []
})

// Get external edges for a table (all edges except its own)
const getExternalEdges = (currentTableId) => {
  const allEdges = []
  for (const [tableId, edges] of Object.entries(tableEdges)) {
    if (tableId !== currentTableId && edges.length > 0) {
      // Add all edges from other tables
      allEdges.push(...edges)
    }
  }
  // Remove duplicates
  return [...new Set(allEdges)]
}

// Handle edges change from a table
const handleEdgesChange = ({ tableId, edges }) => {
  if (tableId && tableEdges.hasOwnProperty(tableId)) {
    tableEdges[tableId] = edges
  }
}

// Drag state
const isDragging = ref(false)
const dragTarget = ref(null) // 'logo' or 'seal'
const dragOffset = ref({ x: 0, y: 0 })
const dragElementSize = ref({ width: 0, height: 0 }) // Store actual element size during drag

const fixedTextStyle = computed(() => ({
  color: templateStore.fixedTextStyles.color,
  fontFamily: templateStore.fixedTextStyles.fontFamily,
  fontSize: `${templateStore.fixedTextStyles.fontSize}px`
}))

// Apply saved format to DOM element
const applyFieldFormat = (fieldId, element) => {
  const savedFormat = templateStore.getFieldFormat(fieldId)
  if (savedFormat && element) {
    if (savedFormat.fontFamily) element.style.fontFamily = savedFormat.fontFamily
    if (savedFormat.fontSize) element.style.fontSize = `${savedFormat.fontSize}px`
    if (savedFormat.color) element.style.color = savedFormat.color
    if (savedFormat.fontWeight) element.style.fontWeight = savedFormat.fontWeight
    if (savedFormat.fontStyle) element.style.fontStyle = savedFormat.fontStyle
    if (savedFormat.textDecoration) element.style.textDecoration = savedFormat.textDecoration
    if (savedFormat.textAlign) element.style.textAlign = savedFormat.textAlign
  }
}

// Get merged style for a field (base style + saved field format)
const getFieldStyle = (fieldId, baseStyle) => {
  const savedFormat = templateStore.getFieldFormat(fieldId)
  if (!savedFormat) return baseStyle
  
  return {
    ...baseStyle,
    ...(savedFormat.fontFamily && { fontFamily: savedFormat.fontFamily }),
    ...(savedFormat.fontSize && { fontSize: `${savedFormat.fontSize}px` }),
    ...(savedFormat.color && { color: savedFormat.color }),
    ...(savedFormat.fontWeight && { fontWeight: savedFormat.fontWeight }),
    ...(savedFormat.fontStyle && { fontStyle: savedFormat.fontStyle }),
    ...(savedFormat.textDecoration && { textDecoration: savedFormat.textDecoration }),
    ...(savedFormat.textAlign && { textAlign: savedFormat.textAlign })
  }
}

// Company name style: SimSun 20px bold
const companyNameStyle = computed(() => ({
  color: templateStore.fixedTextStyles.color,
  fontFamily: 'SimSun, serif',
  fontSize: '20px',
  fontWeight: 'bold'
}))

// Report title style: Microsoft YaHei 18px
const reportTitleStyle = computed(() => ({
  color: templateStore.fixedTextStyles.color,
  fontFamily: '"Microsoft YaHei", sans-serif',
  fontSize: '18px'
}))

// Signature label style: Microsoft YaHei 12px
const signatureLabelStyle = computed(() => ({
  color: templateStore.fixedTextStyles.color,
  fontFamily: '"Microsoft YaHei", sans-serif',
  fontSize: '12px'
}))

// Signature placeholder style: 12px for tester/reviewer/approver names
const signaturePlaceholderStyle = computed(() => ({
  color: templateStore.editableTextStyles.color,
  fontFamily: '"Microsoft YaHei", sans-serif',
  fontSize: '12px',
  fontStyle: 'italic'
}))

// Footer note label style: 9px
const footerNoteLabelStyle = computed(() => ({
  color: templateStore.fixedTextStyles.color,
  fontFamily: templateStore.fixedTextStyles.fontFamily,
  fontSize: '9px'
}))

const editableTextStyle = computed(() => ({
  color: templateStore.editableTextStyles.color,
  fontFamily: templateStore.editableTextStyles.fontFamily,
  fontSize: `${templateStore.editableTextStyles.fontSize}px`,
  fontStyle: 'italic'
}))

const logoStyle = computed(() => ({
  position: 'absolute',
  left: `${templateStore.logo.position.x}px`,
  top: `${templateStore.logo.position.y}px`,
  width: `${templateStore.logo.size}px`,
  cursor: 'move',
  zIndex: isDragging.value && dragTarget.value === 'logo' ? 1000 : 10
}))

const sealStyle = computed(() => ({
  position: 'absolute',
  left: `${templateStore.departmentSeal.position.x}px`,
  top: `${templateStore.departmentSeal.position.y}px`,
  width: `${templateStore.departmentSeal.size}px`,
  opacity: templateStore.departmentSeal.opacity,
  cursor: 'move',
  zIndex: isDragging.value && dragTarget.value === 'seal' ? 1000 : 5
}))

// Dynamic signature style based on store size
const signatureStyle = (type) => {
  const size = templateStore.signatures[type]?.size || 15
  return {
    height: `${size}px`,
    maxHeight: `${size}px`,
    width: 'auto',
    objectFit: 'contain'
  }
}

// Start dragging logo
const startLogoDrag = (e) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = true
  dragTarget.value = 'logo'
  
  if (!pageRef.value) return
  
  // Get actual element size from DOM
  const elementRect = e.currentTarget.getBoundingClientRect()
  dragElementSize.value = {
    width: elementRect.width,
    height: elementRect.height
  }
  
  const pageRect = pageRef.value.getBoundingClientRect()
  // Calculate offset: mouse position relative to page minus current element position
  // This ensures the element stays at the same position relative to the mouse cursor
  dragOffset.value = {
    x: e.clientX - pageRect.left - templateStore.logo.position.x,
    y: e.clientY - pageRect.top - templateStore.logo.position.y
  }
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
}

// Start dragging seal
const startSealDrag = (e) => {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = true
  dragTarget.value = 'seal'
  
  if (!pageRef.value) return
  
  // Get actual element size from DOM
  const elementRect = e.currentTarget.getBoundingClientRect()
  dragElementSize.value = {
    width: elementRect.width,
    height: elementRect.height
  }
  
  const pageRect = pageRef.value.getBoundingClientRect()
  // Calculate offset: mouse position relative to page minus current element position
  // This ensures the element stays at the same position relative to the mouse cursor
  dragOffset.value = {
    x: e.clientX - pageRect.left - templateStore.departmentSeal.position.x,
    y: e.clientY - pageRect.top - templateStore.departmentSeal.position.y
  }
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
}

// Handle drag movement
const handleDrag = (e) => {
  if (!isDragging.value || !pageRef.value) return
  
  const pageRect = pageRef.value.getBoundingClientRect()
  
  // Calculate new position: mouse position relative to page minus the initial offset
  const newX = e.clientX - pageRect.left - dragOffset.value.x
  const newY = e.clientY - pageRect.top - dragOffset.value.y
  
  // Use actual element size from DOM for proper boundary calculation
  const elementWidth = dragElementSize.value.width
  const elementHeight = dragElementSize.value.height
  
  // Get computed padding from the page element
  // The page has padding: 10mm 15mm 15mm 15mm (top right bottom left)
  const computedStyle = window.getComputedStyle(pageRef.value)
  const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0
  const paddingTop = parseFloat(computedStyle.paddingTop) || 0
  const paddingRight = parseFloat(computedStyle.paddingRight) || 0
  const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0
  
  // Calculate the content area (excluding padding)
  const contentWidth = pageRect.width - paddingLeft - paddingRight
  const contentHeight = pageRect.height - paddingTop - paddingBottom
  
  // Constrain to content bounds
  // maxX ensures the element's right edge doesn't exceed the content area
  // maxY ensures the element's bottom edge doesn't exceed the content area
  const maxX = contentWidth - elementWidth
  const maxY = contentHeight - elementHeight
  
  const constrainedX = Math.max(0, Math.min(newX, maxX))
  const constrainedY = Math.max(0, Math.min(newY, maxY))
  
  if (dragTarget.value === 'logo') {
    templateStore.updateLogoPosition({ x: constrainedX, y: constrainedY })
  } else if (dragTarget.value === 'seal') {
    templateStore.updateDepartmentSealPosition({ x: constrainedX, y: constrainedY })
  }
}

// Stop dragging
const stopDrag = () => {
  isDragging.value = false
  dragTarget.value = null
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// Update fixed text content
const updateFixedText = (field, event) => {
  // Use innerHTML to preserve line breaks, then convert to text with newlines
  const html = event.target.innerHTML
  const value = htmlToText(html)
  templateData[field] = value
  templateStore.updateTemplateData(field, value)
}

// Update placeholder text
const updatePlaceholder = (field, event) => {
  // Handle both input elements and contenteditable elements
  let value
  if (event.target.value !== undefined) {
    value = event.target.value
  } else {
    // Use innerHTML to preserve line breaks
    const html = event.target.innerHTML
    value = htmlToText(html)
  }
  if (!templateData.placeholders) {
    templateData.placeholders = {}
  }
  templateData.placeholders[field] = value
  templateStore.updatePlaceholder(field, value)
}

// Convert HTML to text preserving line breaks
const htmlToText = (html) => {
  // Replace <br> and </div><div> with newlines
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div><div>/gi, '\n')
    .replace(/<div>/gi, '\n')
    .replace(/<\/div>/gi, '')
    .replace(/<\/p><p>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '')
  // Remove any remaining HTML tags
  text = text.replace(/<[^>]*>/g, '')
  // Decode HTML entities
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  text = textarea.value
  // Trim leading newline if present
  if (text.startsWith('\n')) {
    text = text.substring(1)
  }
  return text
}

// Convert text with newlines to HTML for display
const textToHtml = (text) => {
  if (!text) return ''
  // Escape HTML entities first
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // Convert newlines to <br>
  return escaped.replace(/\n/g, '<br>')
}

// Get display HTML for placeholder fields
const getPlaceholderHtml = (field, defaultValue) => {
  const value = templateData.value.placeholders?.[field]
  if (value) {
    return textToHtml(value)
  }
  return defaultValue
}

// Handle keydown for contenteditable elements
const handleKeydown = (event, allowMultiline) => {
  if (event.key === 'Enter') {
    if (allowMultiline) {
      // Allow line break by inserting <br>
      event.preventDefault()
      document.execCommand('insertLineBreak')
    } else {
      // Prevent line break in single-line fields
      event.preventDefault()
      event.target.blur()
    }
  }
}

// Update security level
const updateSecurityLevel = (value) => {
  templateStore.updateSecurityLevel(value)
}

// Handle table column widths change
const handleTableWidthsChange = (tableName, widths) => {
  templateStore.updateTableColumnWidths(tableName, widths)
}

onMounted(async () => {
  // Only load default template if no custom template is loaded
  // TemplateEdit.vue handles loading the latest custom template
  if (!templateStore.currentTemplateId) {
    // Check if there's a saved custom template first
    try {
      const response = await fetch('/api/template/latest/general')
      if (response.ok) {
        const data = await response.json()
        if (data && data.id) {
          await templateStore.loadCustomTemplate(data.id)
        } else {
          // No custom template exists, load default
          templateStore.loadDefaultTemplate('general')
        }
      } else {
        templateStore.loadDefaultTemplate('general')
      }
    } catch (error) {
      console.error('Failed to check for saved template:', error)
      templateStore.loadDefaultTemplate('general')
    }
  }
  
  // Load saved security level
  if (templateStore.securityLevel) {
    securityLevel.value = templateStore.securityLevel
  }
  
  // Restore saved field formats to DOM elements
  nextTick(() => {
    restoreFieldFormats()
  })
})

// Restore saved field formats to DOM elements
const restoreFieldFormats = () => {
  if (!pageRef.value) return
  
  // Find all elements with data-field-id
  const elements = pageRef.value.querySelectorAll('[data-field-id]')
  elements.forEach(el => {
    const fieldId = el.dataset.fieldId
    if (fieldId) {
      applyFieldFormat(fieldId, el)
    }
  })
}

// Watch for fieldFormats changes to restore styles after template load
watch(
  () => templateStore.fieldFormats,
  (newFormats) => {
    if (newFormats && Object.keys(newFormats).length > 0) {
      nextTick(() => {
        restoreFieldFormats()
      })
    }
  },
  { deep: true, immediate: true }
)

// Also watch for template ID changes (when switching back to this page)
watch(
  () => templateStore.currentTemplateId,
  (newId) => {
    if (newId) {
      nextTick(() => {
        restoreFieldFormats()
      })
    }
  }
)

onUnmounted(() => {
  // Clean up event listeners
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style lang="scss" scoped>
.template-general {
  width: 100%;
}

.a4-page {
  width: 210mm;
  min-height: 297mm;
  height: auto;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  padding: 10mm 15mm 15mm 15mm;
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.page-content {
  flex: 1 0 auto;
  position: relative;
}

.template-page {
  // Specific styles for template editing view
}

.logo-area {
  z-index: 10;
  
  img {
    max-width: 100%;
    height: auto;
  }
  
  &:hover {
    outline: 2px dashed #409eff;
  }
}

.department-seal {
  z-index: 5;
  
  img {
    max-width: 100%;
    height: auto;
  }
  
  &:hover {
    outline: 2px dashed #409eff;
  }
}

.page-header {
  text-align: center;
  margin-bottom: 15px;
  
  .company-name {
    font-size: 18px;
    font-weight: 600;
    font-family: SimSun, serif;
  }
  
  .report-title {
    font-size: 16px;
    font-weight: normal;
    margin-top: 8px;
  }
  
  .record-code {
    margin-top: 5px;
  }
}

.placeholder-text {
  font-style: italic;
  white-space: pre-wrap;
  
  &.multiline {
    display: block;
    min-height: 1.5em;
  }
}

.report-info-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 11px;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
  font-size: 11px;
  
  td {
    border: 1px solid #000;
    padding: 0;
    vertical-align: middle;
  }
  
  .label-cell {
    background-color: #f5f5f5;
    font-weight: 500;
    text-align: center;
    width: 70px;
    padding: 4px 8px;
  }
  
  .editable-cell {
    padding: 0;
    
    .cell-input {
      display: flex;
      align-items: center;
    }
  }
}

// Input style that fills entire cell
.cell-input {
  width: 100%;
  min-height: 20px;
  padding: 4px 8px;
  border: none;
  background: transparent;
  font-style: italic;
  text-align: left;
  box-sizing: border-box;
  display: block;
  white-space: pre-wrap;
  word-break: break-word;
  outline: none;
  vertical-align: middle;
  
  &:focus {
    outline: 2px solid #409eff;
    background-color: rgba(64, 158, 255, 0.1);
  }
  
  &:hover {
    background-color: rgba(64, 158, 255, 0.05);
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
  
  th, td {
    border: 1px solid #000;
    padding: 0;
    text-align: center;
    vertical-align: middle;
  }
  
  th {
    background-color: #f5f5f5;
    font-weight: 600;
    padding: 4px 6px;
  }
  
  .editable-cell {
    padding: 0;
    
    .cell-input {
      display: flex;
      align-items: center;
    }
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

.image-headers {
  display: flex;
  border: 1px solid #000;
  border-bottom: none;
  
  .image-header {
    flex: 1;
    padding: 8px;
    text-align: center;
    font-weight: 600;
    background-color: #f5f5f5;
    border-right: 1px solid #000;
    
    &:last-child {
      border-right: none;
    }
  }
}

.image-row {
  display: flex;
  border: 1px solid #000;
  border-top: none;
  
  &:first-of-type {
    border-top: 1px solid #000;
  }
  
  .image-cell {
    flex: 1;
    padding: 8px;
    border-right: 1px solid #000;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:last-child {
      border-right: none;
    }
    
    .image-placeholder {
      width: 100%;
      height: 60px;
      border: 1px dashed #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 12px;
      font-style: italic;
      border-radius: 4px;
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
        flex-shrink: 0;
      }
      
      .signature-img {
        object-fit: contain;
      }
      
      .placeholder-text {
        flex-shrink: 0;
      }
    }
  }
  
  .footer-note-row {
    display: flex;
    align-items: center;
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
  
  .footer-note {
    color: #666;
  }
}

.editable-text {
  cursor: text;
  min-width: 20px;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
  white-space: pre-wrap;
  
  &:hover {
    background-color: rgba(64, 158, 255, 0.1);
  }
  
  &:focus {
    outline: 2px solid #409eff;
    background-color: rgba(64, 158, 255, 0.1);
  }
}

.text-center {
  text-align: center;
}
</style>
