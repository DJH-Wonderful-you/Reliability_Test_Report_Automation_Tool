<template>
  <div class="changelog-page">
    <div class="changelog-container">
      <div class="changelog-header">
        <h1>更新日志</h1>
        <p>查看版本更新历史和改进内容</p>
      </div>
      
      <div class="version-list">
        <div 
          v-for="version in versions" 
          :key="version.id"
          class="version-card"
          @click="goToDetail(version.id)"
        >
          <div class="version-info">
            <div class="version-header">
              <span class="version-number">{{ version.version }}</span>
              <el-tag :type="version.type" size="small">{{ version.tag }}</el-tag>
            </div>
            <h3 class="version-title">{{ version.title }}</h3>
            <p class="version-date">{{ version.date }}</p>
          </div>
          <div class="version-summary">
            <ul>
              <li v-for="(item, index) in version.highlights" :key="index">{{ item }}</li>
            </ul>
          </div>
          <div class="version-action">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()

const versions = ref([
  {
    id: 'v0.9',
    version: 'V0.9',
    title: '表格文本对齐优化',
    date: '2026年2月10日',
    type: 'warning',
    tag: '内部测试版',
    highlights: [
      '统一模板和报告编辑界面中表格内文本框占位符文本为居中对齐',
      '修复报告编辑界面表格占位符文本未继承模板对齐设置的问题',
      '确保模板编辑界面的对齐样式修改能正确同步到报告编辑界面',
      '修复 EditableField 组件语法错误，优化样式继承机制'
    ]
  },
  {
    id: 'v0.8',
    version: 'V0.8',
    title: '稳定性与体验优化',
    date: '2026年2月6日',
    type: 'warning',
    tag: '内部测试版',
    highlights: [
      '修复"测试条件"小标题样式不一致问题，统一各区域标题显示效果',
      '修复新增行无法自动保存的缺陷，提升数据持久化可靠性',
      '优化自动保存机制，确保空白行也能被正确保存',
      '改善用户体验，减少因刷新导致的数据丢失问题'
    ]
  },
  {
    id: 'v0.7',
    version: 'V0.7',
    title: '行操作界面优化',
    date: '2026年2月5日',
    type: 'warning',
    tag: '内部测试版',
    highlights: [
      '重新设计行操作界面，统一控件布局和视觉风格',
      '新增指定位置插入行和末尾删除行功能',
      '优化控件命名：批量添加行更名为末尾添加行',
      '改进颜色区分：绿色(批量)、蓝色(指定)、橙色(警告)',
      '调整界面细节：标题取消加粗，控件高度降低',
      '完善安全机制：所有删除操作均需用户确认'
    ]
  },
  {
    id: 'v0.6',
    version: 'V0.6',
    title: '多页分页布局优化',
    date: '2026年2月4日',
    type: 'warning',
    tag: '内部测试版',
    highlights: [
      '拆分"测试条件"区域为独立可分页元素',
      '修复测试图片行高度计算不准确导致的遮挡问题',
      '统一所有页面的换页判定阈值',
      '优化 DOM 测量机制，内容减少时能正确回流',
      '修复行高估算不准确导致的分页空白区域不一致问题',
      '实现动态行高测量，提高分页计算精度'
    ]
  },
  {
    id: 'v0.5',
    version: 'V0.5',
    title: '报告编辑界面重构',
    date: '2026年2月2日',
    type: 'warning',
    tag: '内部测试版',
    highlights: [
      '重构报告编辑界面布局，新增左侧功能侧边栏',
      '将导出PDF和新建报告功能移至侧边栏',
      '新增草稿管理功能：保存草稿、打开草稿、删除草稿',
      '移除顶部导航栏中的重复操作控件'
    ]
  },
  {
    id: 'v0.4',
    version: 'V0.4',
    title: '模板应用机制重构',
    date: '2026年2月2日',
    type: 'warning',
    tag: '内部测试版',
    highlights: [
      '重构模板与报告编辑隔离机制，修改需点击"应用"才生效',
      '修复可编辑字段样式同步问题，支持全部样式属性',
      '修复"新建报告"后模板状态重置问题',
      '优化报告编辑工具栏，确保样式与占位文本隔离'
    ]
  },
  {
    id: 'v0.3',
    version: 'V0.3',
    title: '样式持久化修复',
    date: '2026年1月29日',
    type: 'warning',
    tag: '内部测试版',
    highlights: [
      '修复模板编辑界面中文本样式修改无法自动保存的问题',
      '修复"应用于报告编辑"功能中样式修改无法成功应用的问题',
      '修复报告编辑界面页脚默认样式不一致的问题'
    ]
  },
  {
    id: 'v0.2',
    version: 'V0.2',
    title: '功能优化与缺陷修复',
    date: '2026年1月23日',
    type: 'warning',
    tag: '内部测试版',
    highlights: [
      '新增文本框对齐功能',
      '调整框选触发方式为 Shift + 拖拽',
      '修复图片移动错位、超出范围等问题',
      '优化模板编辑器侧边栏布局',
      '修复多个文本编辑相关问题'
    ]
  },
  {
    id: 'v0.1',
    version: 'V0.1',
    title: '初始版本发布',
    date: '2026年1月21日',
    type: 'warning',
    tag: '内部测试版',
    highlights: [
      '支持通用模板报告编辑',
      '可编辑字段和固定内容区分',
      '动态行增删功能',
      '图片上传和自动布局',
      'PDF导出功能',
      '模板编辑器基础功能',
      '自动保存和草稿管理'
    ]
  }
])

const goToDetail = (versionId) => {
  router.push(`/changelog/${versionId}`)
}
</script>

<style lang="scss" scoped>
.changelog-page {
  max-width: 800px;
  margin: 0 auto;
}

.changelog-container {
  background: white;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.changelog-header {
  margin-bottom: 30px;
  
  h1 {
    font-size: 28px;
    color: #303133;
    margin-bottom: 10px;
  }
  
  p {
    color: #909399;
  }
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.version-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #409eff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
    
    .version-action {
      color: #409eff;
    }
  }
}

.version-info {
  width: 180px;
  flex-shrink: 0;
  
  .version-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    
    .version-number {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .version-title {
    font-size: 14px;
    color: #606266;
    margin-bottom: 8px;
  }
  
  .version-date {
    font-size: 12px;
    color: #909399;
  }
}

.version-summary {
  flex: 1;
  
  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      color: #606266;
      font-size: 14px;
      line-height: 1.8;
    }
  }
}

.version-action {
  display: flex;
  align-items: center;
  color: #c0c4cc;
  font-size: 20px;
}
</style>
