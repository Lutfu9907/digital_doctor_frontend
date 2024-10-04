<template>
  <header>
    <nav>
      <RouterLink to="/login"></RouterLink>
      <RouterLink to="/signUp"></RouterLink>
      <RouterLink to="/home"></RouterLink>
      <RouterLink to="/forgotPassword"></RouterLink>
    </nav>
  </header>

  <RouterView />
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped></style>
