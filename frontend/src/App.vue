<template>
  <div class="app-container">
    <TopNav />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import TopNav from '@/components/layout/TopNav.vue'
</script>

<style lang="scss">
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.main-content {
  flex: 1;
  padding: 20px;
  // Removed overflow-y: auto to allow sticky positioning in child components
}
</style>
