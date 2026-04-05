<template>
  <div class="about-page">
    <div class="about-container">
      <div class="about-header">
        <el-icon :size="64" color="#409eff"><Document /></el-icon>
        <h1>可靠性测试报告编辑工具</h1>
        <p class="version">版本 V0.13（内部测试版）</p>
      </div>

      <el-divider />

      <div class="about-section">
        <h2>使用说明</h2>
        <div class="instruction-list">
          <div class="instruction-item">
            <div class="instruction-number">1</div>
            <div class="instruction-content">
              <h3>报告编辑</h3>
              <p>选择合适的模板，在可编辑区域填写测试信息；报告中的正文内容、样式和动态行数据会自动保存。</p>
            </div>
          </div>

          <div class="instruction-item">
            <div class="instruction-number">2</div>
            <div class="instruction-content">
              <h3>动态内容管理</h3>
              <p>测试结果和测试图片区支持通过左侧侧边栏进行末尾添加、指定插入、末尾删除和指定位置删除等行操作。</p>
            </div>
          </div>

          <div class="instruction-item">
            <div class="instruction-number">3</div>
            <div class="instruction-content">
              <h3>图片上传</h3>
              <p>可在测试图片区点击或拖拽上传图片；每个图片区块支持多图上传，系统会自动排版。</p>
            </div>
          </div>

          <div class="instruction-item">
            <div class="instruction-number">4</div>
            <div class="instruction-content">
              <h3>格式设置</h3>
              <p>使用顶部工具栏调整字体、字号、颜色、粗体、斜体、下划线和对齐方式；支持 `Ctrl + 点击` 多选后批量设置。</p>
            </div>
          </div>

          <div class="instruction-item">
            <div class="instruction-number">5</div>
            <div class="instruction-content">
              <h3>导出 PDF</h3>
              <p>编辑完成后点击“导出 PDF”生成文档；系统优先使用矢量导出，异常时自动回退兼容模式。</p>
            </div>
          </div>

          <div class="instruction-item">
            <div class="instruction-number">6</div>
            <div class="instruction-content">
              <h3>模板编辑</h3>
              <p>可在模板编辑页面自定义 Logo、电子签名、部门章、固定文本、占位文本和表格列宽，并在确认后应用到报告编辑页面。</p>
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
            <span class="info-label">最近更新</span>
            <span class="info-value">2026年4月4日</span>
          </div>
          <div class="info-item">
            <span class="info-label">当前版本</span>
            <span class="info-value">V0.13</span>
          </div>
          <div class="info-item">
            <span class="info-label">所属公司</span>
            <span class="info-value">深圳市欣威智能有限公司</span>
          </div>
        </div>
      </div>

      <el-divider />

      <div class="about-section">
        <h2>V0.13 本版更新</h2>
        <div class="latest-update">
          <div class="update-item">修复模板编辑界面中选中默认单元格后，工具栏未正确显示当前粗体和对齐样式的问题。</div>
          <div class="update-item">统一模板编辑与报告编辑界面的测试图片区样式，提升图片上传和 PDF 导出的视觉一致性。</div>
          <div class="update-item">修复报告编辑界面页脚“备注：保存部门：”和“保存年限：”输入框在实际输入时仍显示灰色的问题。</div>
          <div class="update-item">抽离并统一文本样式读取逻辑，提升工具栏对字重、颜色和对齐方式的识别准确性。</div>
        </div>
      </div>

      <el-divider />

      <div class="about-section">
        <h2>技术支持</h2>
        <p class="support-text">
          如有使用问题或改进建议，请通过企微联系开发人员。
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

.latest-update {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.update-item {
  color: #606266;
  line-height: 1.7;
  padding-left: 16px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 10px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #409eff;
  }
}

.support-text {
  color: #606266;
  line-height: 1.6;
}
</style>
