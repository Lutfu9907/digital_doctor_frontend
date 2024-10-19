<template>
  <div class="home-container">
    <div class="chat-container">
      <div class="messages" v-for="msg in messages" :key="msg.id">
        <div class="message" :class="{ user: msg.fromUser, gpt: !msg.fromUser }">
          {{ msg.text }}
        </div>
      </div>
      <input
        v-model="userMessage"
        @keyup.enter="sendMessage"
        placeholder="Mesajını buraya gir..."
        class="chat-input"
      />
      <button @click="sendMessage" class="send-button">Send</button>
    </div>
    <button class="login100-form-btn" @click.prevent="handleLogout('login')">Çıkış Yap</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const userMessage = ref('')
const messages = ref([])

const sendMessage = async () => {
  if (userMessage.value.trim() === '') return

  messages.value.push({ id: Date.now(), text: userMessage.value, fromUser: true })

  try {
    const response = await axios.post('http://localhost:3000/prompt/promptHandler', {
      message: userMessage.value
    })

    messages.value.push({ id: Date.now() + 1, text: response.data, fromUser: false })
  } catch (error) {
    console.error('Hata:', error)
    messages.value.push({
      id: Date.now() + 1,
      text: `Sunucuya bağlanırken hata oluştu: ${error.message}`,
      fromUser: false
    })
  }

  userMessage.value = ''
}
const handleLogout = async () => {
  try {
    await axios.post('http://localhost:3000/auth/logout')

    await localStorage.removeItem('authToken')
    await sessionStorage.removeItem('authToken')

    await router.push('/login')
  } catch (error) {
    console.error('Çıkış işlemi sırasında bir hata oluştu:', error)
  }
}
</script>

<style scoped>
.home-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chat-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1500px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
}

.messages {
  width: 100%;
  height: 300px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
}

.message {
  margin: 1px 0;
  padding: 8px;
  border-radius: 5px;
  max-width: 100%;
  word-wrap: break-word;
}

.user {
  background-color: #d1e7dd;
  align-self: flex-end;
}

.gpt {
  background-color: #e2e3e5;
  align-self: flex-start;
}

.chat-input {
  width: calc(100% - 100px);
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin: 10px 0;
}

.send-button {
  padding: 10px 100px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.send-button:hover {
  background-color: #0056b3;
}
</style>
