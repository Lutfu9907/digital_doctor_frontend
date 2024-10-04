<template>
  <div class="login-wrapper">
    <TheLogin />
  </div>
</template>

<script setup>
import TheLogin from '../components/TheLogin.vue'
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
