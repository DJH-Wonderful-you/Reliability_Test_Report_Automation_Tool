<template>
  <div class="about-page">
    <div class="about-container">
      <div class="about-header">
        <el-icon :size="64" color="#409eff"><Document /></el-icon>
        <h1>可靠性测试报告编辑工具</h1>
        <p class="version">版本 V0.4（内部测试版）</p>
      </div>
      
      <el-divider />
      
      <div class="about-section">
        <h2>使用说明</h2>
        <div class="instruction-list">
          <div class="instruction-item">
            <div class="instruction-number">1</div>
            <div class="instruction-content">
              <h3>报告编辑</h3>
              <p>选择合适的模板（通用模板、英文模板或华为模板），在可编辑区域填写测试信息。蓝色文字区域可修改，黑色文字为固定内容。</p>
            </div>
          </div>
          
          <div class="instruction-item">
            <div class="instruction-number">2</div>
            <div class="instruction-content">
              <h3>动态内容管理</h3>
              <p>在测试结果和测试图片区域，可以根据实际需要添加或删除行数。支持批量添加多行。</p>
            </div>
          </div>
          
          <div class="instruction-item">
            <div class="instruction-number">3</div>
            <div class="instruction-content">
              <h3>图片上传</h3>
              <p>在测试图片区域，点击方框或拖拽图片进行上传。每个方框支持多张图片，系统会自动布局。</p>
            </div>
          </div>
          
          <div class="instruction-item">
            <div class="instruction-number">4</div>
            <div class="instruction-content">
              <h3>格式设置</h3>
              <p>使用顶部工具栏调整文本格式，包括字体、字号、颜色、加粗、斜体等。支持Ctrl+点击多选进行批量格式设置。</p>
            </div>
          </div>
          
          <div class="instruction-item">
            <div class="instruction-number">5</div>
            <div class="instruction-content">
              <h3>导出PDF</h3>
              <p>编辑完成后，点击右上角"导出PDF"按钮生成PDF文档。系统会自动处理分页，确保输出格式规范。</p>
            </div>
          </div>
          
          <div class="instruction-item">
            <div class="instruction-number">6</div>
            <div class="instruction-content">
              <h3>模板编辑</h3>
              <p>在模板编辑页面，可以自定义Logo、电子签名、部门章等元素。支持模板的导入和导出。</p>
            </div>
          </div>
        </div>
      </div>
      
      <el-divider />
      
      <div class="about-section">
        <h2>关于我们</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">开发人员</span>
            <span class="info-value">邓景华</span>
          </div>
          <div class="info-item">
            <span class="info-label">开发日期</span>
            <span class="info-value">2026年2月2日</span>
          </div>
          <div class="info-item">
            <span class="info-label">所属公司</span>
            <span class="info-value">深圳市欣威智能有限公司</span>
          </div>
        </div>
      </div>
      
      <el-divider />
      
      <div class="about-section">
        <h2>技术支持</h2>
        <p class="support-text">
          如有使用问题或建议，请联系开发人员或IT部门。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Document } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.about-page {
  max-width: 800px;
  margin: 0 auto;
}

.about-container {
  background: white;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.about-header {
  text-align: center;
  
  h1 {
    margin: 20px 0 10px;
    color: #303133;
    font-size: 28px;
  }
  
  .version {
    color: #909399;
    font-size: 16px;
  }
}

.about-section {
  h2 {
    font-size: 20px;
    color: #303133;
    margin-bottom: 20px;
  }
}

.instruction-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.instruction-item {
  display: flex;
  gap: 15px;
  
  .instruction-number {
    width: 32px;
    height: 32px;
    background: #409eff;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    flex-shrink: 0;
  }
  
  .instruction-content {
    flex: 1;
    
    h3 {
      font-size: 16px;
      color: #303133;
      margin-bottom: 8px;
    }
    
    p {
      color: #606266;
      line-height: 1.6;
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  
  .info-label {
    font-size: 12px;
    color: #909399;
  }
  
  .info-value {
    font-size: 16px;
    color: #303133;
    font-weight: 500;
  }
}

.support-text {
  color: #606266;
  line-height: 1.6;
}
</style>
