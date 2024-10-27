<template>
  <div class="login-wrapper">
    <TheModal />
  </div>
</template>

<script setup>
import TheModal from '@/components/TheModal.vue'
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
