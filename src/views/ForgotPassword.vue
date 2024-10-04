<template>
  <div class="login-wrapper">
    <ThePassword />
  </div>
</template>

<script setup>
import ThePassword from '@/components/ThePassword.vue'
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
