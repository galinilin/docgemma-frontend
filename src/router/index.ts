/**
 * Vue Router configuration
 */
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'chat',
      component: () => import('@/views/ChatView.vue'),
      meta: { title: 'DocGemma Chat' },
    },
    {
      path: '/ehr',
      name: 'ehr',
      component: () => import('@/views/EhrView.vue'),
      meta: { title: 'EHR' },
      children: [
        {
          path: '',
          name: 'ehr-patients',
          component: () => import('@/views/PatientListView.vue'),
          meta: { title: 'Patients' },
        },
        {
          path: 'patient/:patientId',
          name: 'ehr-patient',
          component: () => import('@/views/PatientChartView.vue'),
          meta: { title: 'Patient Chart' },
          props: true,
        },
      ],
    },
  ],
})

// Update document title on navigation
router.beforeEach((to) => {
  document.title = (to.meta.title as string) || 'DocGemma'
})

export default router
