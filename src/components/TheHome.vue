<template>
  <div class="home-container">
    <div class="sidebar">
      <button class="new-chat-button" @click="createNewChat">+ Yeni Sohbet</button>
      <h3>Sohbet Geçmişi</h3>
      <ul>
        <li v-for="chat in chatHistory" :key="chat.id" @click="selectChat(chat)" class="chat-item">
          {{ chat.title }}
        </li>
      </ul>
    </div>
    <div class="chat-container">
      <div class="messages">
        <div v-for="msg in messages" :key="msg.id" class="message-wrapper">
          <div class="message" :class="{ user: msg.fromUser, gpt: !msg.fromUser }">
            {{ msg.content }} {{ msg.text }}
          </div>
        </div>
        <div v-if="isLoading" class="message-loader">Yükleniyor...</div>
      </div>
      <div class="input-container">
        <input
          v-model="userMessage"
          @keyup.enter="sendMessage"
          placeholder="Hangi konuda rahatsızlık yaşıyorsunuz? Detayları yazabilirsiniz."
          class="chat-input"
        />
        <button @click="sendMessage" class="send-button">Gönder</button>
      </div>
      <audio ref="audioPlayer" controls></audio>
    </div>
    <button class="logout-button" @click.prevent="handleLogout('login')">Çıkış Yap</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()

const userMessage = ref('')
const messages = ref([])
const isLoading = ref(false)
const chatHistory = ref([])

const getChatHistory = async () => {
  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    const response = await axios.get('http://localhost:3000/prompt/chatDatabase', {
      headers: { Authorization: `Bearer ${token}` }
    })
    chatHistory.value = response.data.chats
    console.log('sohbet burada', response.data.chats)
  } catch (error) {
    console.error('Sohbet geçmişi alınırken hata oluştu:', error)
  }
}

const selectChat = (chat) => {
  currentChatId.value = chat.id
  messages.value = []
  getMessagesForChat(chat.id)
}

const getMessagesForChat = async (chatId) => {
  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')

    const response = await axios.get(
      `http://localhost:3000/prompt/chatDatabase/${chatId}/messages`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    console.log('Mesajlar alındı:', response.data)
    messages.value = response.data.messages
  } catch (error) {
    console.error('Mesajlar alınırken hata oluştu:', error)
  }
}

const sendMessage = async () => {
  if (userMessage.value.trim() === '') return
  if (isLoading.value) return

  const tempMessage = userMessage.value
  userMessage.value = ''

  messages.value.push({ id: Date.now(), text: tempMessage, fromUser: true })

  isLoading.value = true

  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')

    const response = await axios.post(
      'http://localhost:3000/prompt/promptHandler',
      {
        message: tempMessage,
        chatId: currentChatId.value
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    messages.value.push({ id: Date.now() + 1, text: response.data, fromUser: false })
    await getVoiceResponse(response.data)
  } catch (error) {
    console.error('Hata:', error)
    messages.value.push({
      id: Date.now() + 1,
      text: `Sunucuya bağlanırken hata oluştu: ${error.message}`,
      fromUser: false
    })
  } finally {
    isLoading.value = false
  }
}

const currentChatId = ref(null)

const createNewChat = async () => {
  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    const response = await axios.post(
      'http://localhost:3000/prompt/newChat',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.status === 201) {
      currentChatId.value = response.data.chat._id

      messages.value = []

      console.log('Yeni sohbet oluşturuldu:', response.data)
    } else {
      console.error('Yeni sohbet oluşturulamadı')
    }
  } catch (error) {
    console.error('Yeni sohbet oluşturulurken hata:', error)
  }
}

const isVoiceLoading = ref(false)
const audioPlayer = ref(null)
const getVoiceResponse = async (message) => {
  if (!message.trim() === '') {
    console.error('Kullanıcı mesajı boş.')
    return
  }

  if (isVoiceLoading.value) {
    console.warn('İstek zaten devam ediyor.')
    return
  }

  isVoiceLoading.value = true

  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')

    const response = await axios.post(
      'http://localhost:3000/prompt/ttsHandler',
      { message },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.audioUrl) {
      audioPlayer.value.src = response.data.audioUrl
      audioPlayer.value.play()
    } else {
      console.error('Ses dosyası alınamadı.')
    }
  } catch (error) {
    console.error(
      'Sesli yanıt alınırken hata oluştu:',
      error.response ? error.response.data : error.message
    )
  } finally {
    isVoiceLoading.value = false
  }
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

onMounted(() => {
  getChatHistory()
})
</script>

<style scoped>
.home-container {
  height: 100vh;
  display: flex;
  background-color: #f0f2f5;
}

.sidebar {
  width: 300px;
  padding: 20px;
  background-color: #202123;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-right: 2px solid #333;
  overflow-y: auto;
}

.new-chat-button {
  width: 100%;
  padding: 10px;
  background-color: #2d2f36;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  margin-bottom: 20px;
}

.new-chat-button:hover {
  background-color: #3b3e45;
}

.sidebar h3 {
  font-size: 16px;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #aaa;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chat-item {
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  background-color: #2d2f36;
  cursor: pointer;
  color: white;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-item:hover {
  background-color: #3b3e45;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff;
  border-radius: 8px;
  margin: 20px;
  overflow: hidden;
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

.message-loader {
  text-align: right;
  font-size: 14px;
  color: #007bff;
  margin-top: 10px;
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
  position: absolute;
  bottom: 20px;
  left: 20px;
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
