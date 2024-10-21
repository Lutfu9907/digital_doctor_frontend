<template>
  <div class="home-container">
    <div class="chat-container">
      <div class="messages">
        <div v-for="msg in messages" :key="msg.id" class="message-wrapper">
          <div class="message" :class="{ user: msg.fromUser, gpt: !msg.fromUser }">
            {{ msg.text }}
          </div>
        </div>
      </div>
      <div class="input-container">
        <input
          v-model="userMessage"
          @keyup.enter="sendMessage"
          placeholder="Mesajını buraya gir..."
          class="chat-input"
        />
        <button @click="sendMessage" class="send-button">Gönder</button>
      </div>
    </div>
    <button class="logout-button" @click.prevent="handleLogout('login')">Çıkış Yap</button>
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
  background-color: #f0f2f5;
}

.chat-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.messages {
  width: 100%;
  height: 400px;
  overflow-y: auto;
  padding: 15px;
  background-color: #f9f9f9;
}

.message-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 6px;
}

.message {
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 80%;
  word-wrap: break-word;
  font-size: 14px;
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
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 20px;
  margin-right: 10px;
  font-size: 14px;
  outline: none;
}

.input-container {
  display: flex;
  width: 100%;
  padding: 10px;
  background-color: #f1f1f1;
  border-top: 1px solid #ccc;
}

.send-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-left: 10px;
}

.send-button:hover {
  background-color: #0056b3;
}

.logout-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #ff4b5c;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #c0392b;
}

/* Scroll styling */
.messages::-webkit-scrollbar {
  width: 8px;
}

.messages::-webkit-scrollbar-thumb {
  background-color: #007bff;
  border-radius: 4px;
}

.messages::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}
</style>
