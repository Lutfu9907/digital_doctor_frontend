import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/HomePage.vue'
import SignUp from '@/views/SignUp.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import ModalPage from '@/views/ModalPage.vue'
import axios from 'axios'

const isAuthenticatedAxios = async () => {
  const token = window.localStorage.getItem('authToken')

  try {
    const res = await axios.get('http://localhost:3000/auth/authRouter', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!res.data) {
      window.localStorage.clear()
      router.push({ name: 'login' })
    }
  } catch (error) {
    console.error('Error in authentication:', error)
    window.localStorage.clear()
    router.push({ name: 'login' })
  }
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
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPassword
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: SignUp
    },
    {
      path: '/modal',
      name: 'modal',
      component: ModalPage
    },
    {
      path: '/home',
      name: 'home',
      meta: { requiresAuth: true },
      component: HomePage
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    await isAuthenticatedAxios()
  }
  next()
})

export default router
