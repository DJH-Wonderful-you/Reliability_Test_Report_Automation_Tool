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
    id: 'v0.3',
    version: 'V0.3',
    title: '样式持久化修复',
    date: '2026年1月29日',
    type: 'warning',
    tag: '内部测试版',
    highlights: [
      '修复模板编辑界面中文本样式修改无法自动保存的问题',
      '新增单独文本框样式持久化功能',
      '修复页面导航后样式状态丢失的问题'
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
