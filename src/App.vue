<template>
  <header>
    <nav>
      <RouterLink to="/login"></RouterLink>
      <RouterLink to="/sign-up"></RouterLink>
      <RouterLink to="/home"></RouterLink>
      <RouterLink to="/forgot-password"></RouterLink>
      <HomePage v-if="isLoggedIn" @loginSuccess="handleLogin" />
    </nav>
  </header>

  <RouterView />
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HomePage from './views/HomePage.vue'
</script>

<style scoped></style>
