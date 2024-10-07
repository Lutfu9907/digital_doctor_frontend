import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/HomePage.vue'
import SignUp from '@/views/SignUp.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'

const isAuthenticated = () => {
  return !!localStorage.getItem('authToken')
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPassword
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: SignUp
    },
    {
      path: '/home',
      name: 'home',
      component: HomePage
    }
  ]
})

router.beforeEach((to, _, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ name: 'login' })
  } else {
    next()
  }
})

router.beforeEach((to, _, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ name: 'sign-up' })
  } else {
    next()
  }
})

export default router
