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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

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
    console.error('Error:', error)
    messages.value.push({
      id: Date.now() + 1,
      text: `Error connecting to server: ${error.message}`,
      fromUser: false
    })
  }

  userMessage.value = ''
}
</script>

<style scoped>
.home-container {
  padding: 20px;
  text-align: center;
}

h1 {
  color: #007bff;
}

.chat-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  width: 100%;
  max-width: 1000px; /* Maksimum genişlik */
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

.messages {
  width: 100%;
  height: 300px; /* Mesaj alanı yüksekliği */
  overflow-y: auto; /* Aşırı mesajlar için kaydırma */
  padding: 10px;
  background-color: #f9f9f9;
}

.message {
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
  max-width: 70%;
  word-wrap: break-word;
}

.user {
  background-color: #d1e7dd; /* Kullanıcı mesaj rengi */
  align-self: flex-end; /* Sağ tarafa hizala */
}

.gpt {
  background-color: #e2e3e5; /* GPT mesaj rengi */
  align-self: flex-start; /* Sol tarafa hizala */
}

.chat-input {
  width: calc(100% - 100px); /* Genişlik hesaplama */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin: 10px 0;
}

.send-button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.send-button:hover {
  background-color: #0056b3; /* Hover rengi */
}
</style>
