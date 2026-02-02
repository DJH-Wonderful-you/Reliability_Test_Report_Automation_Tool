<template>
  <div class="changelog-detail-page">
    <div class="changelog-detail-container">
      <div class="back-button">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon> 返回更新日志
        </el-button>
      </div>
      
      <div class="version-detail" v-if="versionData">
        <div class="version-header">
          <div class="version-title-row">
            <h1>{{ versionData.version }}</h1>
            <el-tag :type="versionData.type" size="large">{{ versionData.tag }}</el-tag>
          </div>
          <p class="version-subtitle">{{ versionData.title }}</p>
          <p class="version-date">发布日期：{{ versionData.date }}</p>
        </div>
        
        <el-divider />
        
        <div class="version-content">
          <div v-for="section in versionData.sections" :key="section.title" class="content-section">
            <h2>{{ section.title }}</h2>
            <ul>
              <li v-for="(item, index) in section.items" :key="index">
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div v-else class="not-found">
        <el-empty description="版本信息未找到" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const versionsData = {
  'v0.4': {
    version: 'V0.4',
    title: '模板应用机制重构',
    date: '2026年2月2日',
    type: 'warning',
    tag: '内部测试版',
    sections: [
      {
        title: '功能重构',
        items: [
          '重构模板与报告编辑隔离机制：模板编辑页面的修改不再自动同步到报告编辑页面',
          '新增"已应用模板"概念：只有点击"应用于报告编辑"按钮后，修改才会应用到报告编辑页面',
          '优化"新建报告"功能：点击后自动加载最后应用的模板状态，无需刷新页面'
        ]
      },
      {
        title: '缺陷修复',
        items: [
          '修复模板编辑中可编辑字段样式（粗体、斜体、下划线、颜色）无法正确应用到报告编辑占位文本的问题',
          '修复点击"新建报告"后模板样式重置为默认而非最后应用模板的问题',
          '修复重置模板后样式无法正确清除的问题',
          '修复报告编辑工具栏格式修改功能不生效的问题',
          '修复工具栏格式修改错误影响占位文本样式的问题'
        ]
      },
      {
        title: '功能优化',
        items: [
          '报告编辑工具栏样式修改现在只影响用户输入内容，不影响占位文本',
          '模板重置后的默认样式能够正确应用到报告编辑界面',
          '优化样式分离机制：占位文本样式由模板定义，用户输入样式独立管理'
        ]
      },
      {
        title: '技术改进',
        items: [
          '后端新增 /api/template/applied/<type> 接口获取已应用模板',
          '后端新增 /api/template/apply/<id> 接口标记模板为已应用',
          '前端 reportStore 新增 loadAppliedTemplateSettings 方法',
          '优化 applyTemplateFieldFormats 方法支持完全替换格式（包括重置为空）',
          'EditableField 组件新增 placeholderFormat 状态分离占位文本样式'
        ]
      }
    ]
  },
  'v0.3': {
    version: 'V0.3',
    title: '样式持久化修复',
    date: '2026年1月29日',
    type: 'warning',
    tag: '内部测试版',
    sections: [
      {
        title: '缺陷修复',
        items: [
          '修复模板编辑界面中文本样式修改无法自动保存的问题',
          '修复修改某个文本框样式时导致其他同类型文本框被同步修改的问题',
          '修复页面导航后样式状态丢失的问题（从报告编辑页面返回模板编辑页面后样式恢复默认）',
          '修复"应用于报告编辑"功能中样式修改无法成功应用到报告编辑界面的问题',
          '修复报告编辑界面页脚区域默认样式与模板编辑界面不一致的问题'
        ]
      },
      {
        title: '功能优化',
        items: [
          '新增单独文本框样式持久化功能，每个文本框可独立保存样式',
          '优化样式恢复机制，确保页面切换后能正确恢复保存的样式'
        ]
      },
      {
        title: '技术改进',
        items: [
          '后端 API 新增 fieldFormats 字段支持',
          '前端采用响应式样式绑定替代 DOM 直接操作'
        ]
      }
    ]
  },
  'v0.2': {
    version: 'V0.2',
    title: '功能优化与缺陷修复',
    date: '2026年1月23日',
    type: 'warning',
    tag: '内部测试版',
    sections: [
      {
        title: '新功能',
        items: [
          '新增文本框对齐功能，支持左对齐、居中对齐、右对齐',
          '在模板编辑界面侧边栏新增模板操作区域'
        ]
      },
      {
        title: '缺陷修复',
        items: [
          '修复模板编辑界面中图片移动时错位、超出 PDF 范围的问题',
          '修复文本框无法换行的问题',
          '修复报告编辑页面编辑文本样式时影响提示文本的问题',
          '修复选中文本框后工具栏样式显示不会动态变化的问题',
          '修复模板编辑界面上传的图片无法应用到报告编辑页面的问题'
        ]
      },
      {
        title: '优化改进',
        items: [
          '调整框选触发方式为 Shift + 拖拽框选，避免误触发',
          '优化图片尺寸调整功能',
          '优化模板编辑器侧边栏控件布局',
          '调整模板编辑界面中文本的默认样式，与原始文件保持一致',
          '优化短文本文本框最小宽度设置',
          '优化报告编辑页面中文本框输入逻辑，确保输入内容与提示文本样式隔离'
        ]
      }
    ]
  },
  'v0.1': {
    version: 'V0.1',
    title: '初始版本发布',
    date: '2026年1月21日',
    type: 'warning',
    tag: '内部测试版',
    sections: [
      {
        title: '新功能',
        items: [
          '报告编辑器：支持通用模板的报告编辑功能',
          '可编辑字段：蓝色文字区域可修改，黑色文字为固定内容',
          '格式工具栏：支持字体、字号、颜色、加粗、斜体等格式设置',
          '批量选择：支持 Ctrl + 点击多选进行批量格式设置',
          '动态行管理：测试结果和测试图片区域支持行的添加和删除',
          '批量添加：支持批量添加指定数量的行',
          '图片上传：支持点击上传、拖拽上传和多图上传',
          '图片布局：根据图片数量自动调整布局',
          '图片排序：支持拖拽调整图片顺序',
          'PDF 导出：将报告内容导出为规范的 PDF 文档',
          '模板编辑器：支持自定义模板的固定内容样式',
          'Logo 管理：支持上传和调整公司 Logo',
          '电子签名：支持上传测试员、审核、核准的电子签名',
          '部门章管理：支持上传和自由定位部门章',
          '模板导入导出：支持模板配置的 JSON 格式导入导出',
          '自动保存：编辑内容自动保存，防止数据丢失',
          '草稿管理：支持保存和加载多个报告草稿'
        ]
      },
      {
        title: '界面特性',
        items: [
          '现代化 UI 设计，使用 Element Plus 组件库',
          '协调的蓝色主题配色方案',
          '标签导航系统，快速切换功能模块',
          'A4 页面预览，所见即所得',
          '页面分隔线提示，清晰显示分页位置',
          '响应式工具栏，粘性定位便于操作'
        ]
      },
      {
        title: '技术特性',
        items: [
          '本地离线运行，无需网络连接',
          'Flask 后端 + Vue.js 前端架构',
          '本地数据存储，保护数据隐私',
          '客户端 PDF 生成，使用 html2canvas 和 jsPDF'
        ]
      }
    ]
  }
}

const versionData = computed(() => {
  const versionId = route.params.version
  return versionsData[versionId] || null
})

const goBack = () => {
  router.push('/changelog')
}
</script>

<style lang="scss" scoped>
.changelog-detail-page {
  max-width: 800px;
  margin: 0 auto;
}

.changelog-detail-container {
  background: white;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.back-button {
  margin-bottom: 20px;
}

.version-header {
  .version-title-row {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;
    
    h1 {
      font-size: 32px;
      color: #303133;
      margin: 0;
    }
  }
  
  .version-subtitle {
    font-size: 18px;
    color: #606266;
    margin-bottom: 8px;
  }
  
  .version-date {
    font-size: 14px;
    color: #909399;
  }
}

.version-content {
  .content-section {
    margin-bottom: 30px;
    
    h2 {
      font-size: 20px;
      color: #303133;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #409eff;
    }
    
    ul {
      padding-left: 25px;
      
      li {
        color: #606266;
        font-size: 14px;
        line-height: 2;
        
        &::marker {
          color: #409eff;
        }
      }
    }
  }
}

.not-found {
  padding: 40px 0;
}
</style>
