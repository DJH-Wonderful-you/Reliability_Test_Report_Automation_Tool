<template>
  <header class="top-nav">
    <div class="nav-container">
      <div class="logo">
        <el-icon :size="24"><Document /></el-icon>
        <span class="logo-text">可靠性测试报告编辑工具</span>
      </div>
      
      <nav class="main-tabs">
        <el-tabs v-model="activeMainTab" @tab-click="handleMainTabClick">
          <el-tab-pane label="报告编辑" name="report" />
          <el-tab-pane label="模板编辑" name="template" />
          <el-tab-pane label="关于" name="about" />
          <el-tab-pane label="更新日志" name="changelog" />
        </el-tabs>
      </nav>

      <div class="nav-actions">
        <el-button v-if="showExportButton" type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出PDF
        </el-button>
        <el-button v-if="showNewButton" @click="handleNew">
          <el-icon><Plus /></el-icon>
          新建报告
        </el-button>
      </div>
    </div>

    <!-- Sub tabs for report and template editing -->
    <div v-if="showSubTabs" class="sub-tabs">
      <el-tabs v-model="activeSubTab" @tab-click="handleSubTabClick">
        <el-tab-pane label="通用模板" name="general" />
        <el-tab-pane label="通用（英文）模板" name="general-en" />
        <el-tab-pane label="华为模板" name="huawei" />
      </el-tabs>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Document, Download, Plus } from '@element-plus/icons-vue'
import { useReportStore } from '@/stores/report'

const router = useRouter()
const route = useRoute()
const reportStore = useReportStore()

const activeMainTab = ref('report')
const activeSubTab = ref('general')

const showSubTabs = computed(() => {
  return activeMainTab.value === 'report' || activeMainTab.value === 'template'
})

const showExportButton = computed(() => {
  return activeMainTab.value === 'report'
})

const showNewButton = computed(() => {
  return activeMainTab.value === 'report'
})

// Sync tabs with route
const syncTabsWithRoute = () => {
  const path = route.path
  if (path.startsWith('/report')) {
    activeMainTab.value = 'report'
    if (path.includes('general-en')) {
      activeSubTab.value = 'general-en'
    } else if (path.includes('huawei')) {
      activeSubTab.value = 'huawei'
    } else {
      activeSubTab.value = 'general'
    }
  } else if (path.startsWith('/template')) {
    activeMainTab.value = 'template'
    if (path.includes('general-en')) {
      activeSubTab.value = 'general-en'
    } else if (path.includes('huawei')) {
      activeSubTab.value = 'huawei'
    } else {
      activeSubTab.value = 'general'
    }
  } else if (path.startsWith('/about')) {
    activeMainTab.value = 'about'
  } else if (path.startsWith('/changelog')) {
    activeMainTab.value = 'changelog'
  }
}

onMounted(() => {
  syncTabsWithRoute()
})

watch(() => route.path, () => {
  syncTabsWithRoute()
})

const handleMainTabClick = (tab) => {
  const tabName = tab.paneName
  if (tabName === 'report') {
    router.push(`/report/${activeSubTab.value}`)
  } else if (tabName === 'template') {
    router.push(`/template/${activeSubTab.value}`)
  } else if (tabName === 'about') {
    router.push('/about')
  } else if (tabName === 'changelog') {
    router.push('/changelog')
  }
}

const handleSubTabClick = (tab) => {
  const subTabName = tab.paneName
  if (activeMainTab.value === 'report') {
    router.push(`/report/${subTabName}`)
  } else if (activeMainTab.value === 'template') {
    router.push(`/template/${subTabName}`)
  }
}

const handleExport = () => {
  reportStore.exportPdf()
}

const handleNew = () => {
  reportStore.newReport()
}
</script>

<style lang="scss" scoped>
.top-nav {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  border-bottom: 1px solid #ebeef5;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-weight: 600;
  
  .logo-text {
    font-size: 16px;
    white-space: nowrap;
  }
}

.main-tabs {
  flex: 1;
  margin-left: 40px;
  
  :deep(.el-tabs__header) {
    margin: 0;
  }
  
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
  
  :deep(.el-tabs__item) {
    font-size: 15px;
    height: 60px;
    line-height: 60px;
  }
}

.nav-actions {
  display: flex;
  gap: 10px;
}

.sub-tabs {
  padding: 0 20px;
  background-color: #fafafa;
  border-bottom: 1px solid #ebeef5;
  
  :deep(.el-tabs__header) {
    margin: 0;
  }
  
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
  
  :deep(.el-tabs__item) {
    height: 44px;
    line-height: 44px;
  }
}
</style>
