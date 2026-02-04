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
  'v0.6': {
    version: 'V0.6',
    title: '多页分页布局优化',
    date: '2026年2月4日',
    type: 'warning',
    tag: '内部测试版',
    sections: [
      {
        title: '分页逻辑重构',
        items: [
          '拆分“测试条件”区域为三个独立可分页元素：测试条件标题、测试标准、判定标准',
          '当“测试标准”内容过多时，只有该文本框移到下一页，“判定标准”保留在原页面（如果空间足够）',
          '每个子元素独立计算高度，实现更精细的页面空间利用',
          '新增 testConditionsHeader、testStandard、judgmentStandard 区域类型'
        ]
      },
      {
        title: '缺陷修复',
        items: [
          '修复测试图片行接触页面底部时被遮挡的问题',
          '修复 IMAGE_ROW_HEIGHT 计算不准确的问题（从 175px 调整为 260px）',
          '修复内容减少后无法正确回流到原页面的问题',
          '修复第二页及以后页面的换页判定阈值与第一页不一致的问题'
        ]
      },
      {
        title: '分页阈值优化',
        items: [
          '重新校准 HEADER_HEIGHT_PX（120px → 75px）和 FOOTER_HEIGHT_PX（100px → 95px）',
          'USABLE_CONTENT_HEIGHT 从 788px 增加到 843px，增加 55px 可用空间',
          '统一所有页面的换页判定阈值，确保布局一致性',
          '优化安全边距设置，最大化页面空间利用率'
        ]
      },
      {
        title: 'DOM 测量优化',
        items: [
          '使用防抖（debounce）机制监听文本内容变化',
          '监听具体字段变化（testStandard、judgmentStandard、judgmentResult 等）',
          '遍历所有页面进行测量，确保获取完整的元素高度',
          '为每个区域添加 data-section 属性用于 DOM 查询'
        ]
      },
      {
        title: '技术改进',
        items: [
          'usePagination.js 新增 TEST_CONDITIONS_HEADER、TEST_STANDARD、JUDGMENT_STANDARD 区域类型',
          '导出 USABLE_CONTENT_HEIGHT 等常量供其他组件使用',
          '移除动态 usableHeight 的复杂逻辑，统一使用预设常量',
          'GeneralTemplate.vue 模板拆分为细粒度可分页元素'
        ]
      }
    ]
  },
  'v0.5': {
    version: 'V0.5',
    title: '报告编辑界面重构',
    date: '2026年2月2日',
    type: 'warning',
    tag: '内部测试版',
    sections: [
      {
        title: '界面重构',
        items: [
          '重构报告编辑界面布局，新增统一的左侧功能侧边栏',
          '将原有的顶部导航栏操作控件迁移至左侧边栏',
          '保持与模板编辑界面一致的设计语言和交互模式',
          '优化界面空间利用，提升操作效率'
        ]
      },
      {
        title: '功能迁移',
        items: [
          '导出PDF功能从顶部导航栏移至左侧边栏',
          '新建报告功能从顶部导航栏移至左侧边栏',
          '移除顶部导航栏中的重复操作控件，避免界面冗余',
          '保持原有功能的完整性和可用性'
        ]
      },
      {
        title: '草稿管理增强',
        items: [
          '新增保存草稿功能：用户可为当前编辑内容命名并保存',
          '新增打开草稿功能：支持从已保存草稿列表中选择加载',
          '新增删除草稿功能：提供安全的草稿删除机制',
          '删除操作具有双重确认机制，防止误删重要数据',
          '草稿列表显示更新时间，便于用户识别最新版本'
        ]
      },
      {
        title: '用户体验优化',
        items: [
          '统一的操作入口，降低学习成本',
          '更直观的功能组织，符合用户操作习惯',
          '减少鼠标移动距离，提高操作效率',
          '保持视觉一致性，提升整体美观度'
        ]
      },
      {
        title: '技术实现',
        items: [
          '前端新增 reportStore 的 saveDraft、loadDraft、listDrafts、deleteDraft 方法',
          '完善后端 /api/report/drafts 相关API接口',
          '实现基于Element Plus的消息提示和确认对话框',
          '优化组件间的数据传递和状态管理'
        ]
      }
    ]
  },
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
