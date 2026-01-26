import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/report/general'
  },
  {
    path: '/report',
    name: 'ReportEdit',
    component: () => import('@/views/ReportEdit.vue'),
    children: [
      {
        path: 'general',
        name: 'ReportGeneral',
        component: () => import('@/views/report/GeneralTemplate.vue'),
        meta: { title: '通用模板', templateType: 'general' }
      },
      {
        path: 'general-en',
        name: 'ReportGeneralEn',
        component: () => import('@/views/report/GeneralEnTemplate.vue'),
        meta: { title: '通用（英文）模板', templateType: 'general_en' }
      },
      {
        path: 'huawei',
        name: 'ReportHuawei',
        component: () => import('@/views/report/HuaweiTemplate.vue'),
        meta: { title: '华为模板', templateType: 'huawei' }
      }
    ]
  },
  {
    path: '/template',
    name: 'TemplateEdit',
    component: () => import('@/views/TemplateEdit.vue'),
    children: [
      {
        path: 'general',
        name: 'TemplateGeneral',
        component: () => import('@/views/template/GeneralTemplate.vue'),
        meta: { title: '通用模板', templateType: 'general' }
      },
      {
        path: 'general-en',
        name: 'TemplateGeneralEn',
        component: () => import('@/views/template/GeneralEnTemplate.vue'),
        meta: { title: '通用（英文）模板', templateType: 'general_en' }
      },
      {
        path: 'huawei',
        name: 'TemplateHuawei',
        component: () => import('@/views/template/HuaweiTemplate.vue'),
        meta: { title: '华为模板', templateType: 'huawei' }
      }
    ]
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: { title: '关于' }
  },
  {
    path: '/changelog',
    name: 'Changelog',
    component: () => import('@/views/Changelog.vue'),
    meta: { title: '更新日志' }
  },
  {
    path: '/changelog/:version',
    name: 'ChangelogDetail',
    component: () => import('@/views/ChangelogDetail.vue'),
    meta: { title: '更新详情' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
