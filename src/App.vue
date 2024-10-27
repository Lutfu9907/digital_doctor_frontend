<template>
  <header>
    <nav>
      <RouterLink to="/login"></RouterLink>
      <RouterLink to="/sign-up"></RouterLink>
      <RouterLink to="/modal"></RouterLink>
      <RouterLink to="/home"></RouterLink>
      <RouterLink to="/forgot-password"></RouterLink>
      <RouterLink to="/reset-password"></RouterLink>
      <HomePage v-if="isLoggedIn" @loginSuccess="handleLogin" />
      <HomePage v-if="isSignUpIn" @signUpSuccess="handleSignUp" />
    </nav>
  </header>

  <RouterView />
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import HomePage from './views/HomePage.vue'

const isLoggedIn = ref(false)
const isSignUpIn = ref(false)

const handleLogin = () => {
  isLoggedIn.value = true
}

const handleSignUp = () => {
  isSignUpIn.value = true
}
</script>

<style scoped></style>
