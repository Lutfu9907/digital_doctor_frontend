<template>
  <div class="login-wrapper">
    <TheResetPassword />
  </div>
</template>

<script setup>
import TheResetPassword from '../components/TheResetPassword.vue'
</script>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}
</style>
