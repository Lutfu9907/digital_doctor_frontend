<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>Başlık</h2>
      <p>Bu bir modal penceresidir.</p>
      <button @click="closeModal">Kapat</button>
      <button @click="openModal">Aç</button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'

const isVisible = ref(false)

const openModal = () => {
  isVisible.value = true
}

const closeModal = () => {
  isVisible.value = false
}

defineEmits(['openModal'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  width: 400px;
  text-align: center;
}

.close {
  float: right;
  cursor: pointer;
}
</style>
