<template>
  <div class="login-wrapper">
    <TheSignUp />
  </div>
</template>

<script setup>
import TheSignUp from '@/components/TheSignUp.vue'
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
