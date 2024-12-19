<template>
  <div class="home-container">
    <div class="sidebar">
      <button class="new-chat-button" @click="createNewChat" :disabled="isCreatingChat">
        {{ isCreatingChat ? 'Yükleniyor...' : '+ Yeni Sohbet' }}
      </button>
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
      <audio ref="audioPlayer" controls class="audio-player"></audio>
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
const isCreatingChat = ref(false)

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
  if (isCreatingChat.value) return

  isCreatingChat.value = true

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
  } finally {
    setTimeout(() => {
      isCreatingChat.value = false
    }, 2000)
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
  background-color: #e8f4f8;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
}

.sidebar {
  width: 300px;
  padding: 20px;
  background-color: #1976d2;
  color: white;
  display: flex;
  flex-direction: column;
  border-right: 2px solid #1565c0;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 2;
}

.sidebar h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

.new-chat-button {
  width: 100%;
  padding: 14px;
  background-color: #19ba54;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background-color 0.3s ease;
  font-weight: 600;
  font-size: 16px;
  animation: buttonAnimation 0.4s ease-out;
}

.new-chat-button:hover {
  background-color: #128e34;
}

.new-chat-button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.chat-item {
  padding: 14px;
  border-radius: 6px;
  margin-bottom: 12px;
  background-color: #42a5f5;
  cursor: pointer;
  color: white;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background-color 0.3s ease;
}
.audio-player {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 300px;
  width: calc(100% - 300px);
  padding: 0px;
  background-color: rgba(255, 255, 255, 0.95);
  border-top: 1px solid #e3f2fd;
  z-index: 1000;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

.audio-player > * {
  max-width: 95%;
  flex: 1;
}

.chat-item:hover {
  background-color: #2196f3;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  background: none;
  border-radius: 0;
  margin: 0;
  padding-bottom: 53px;
  overflow: hidden;
  box-shadow: 0 6px 12px rgba(25, 118, 210, 0.1);
}

.chat-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(to bottom, rgba(139, 7, 7, 0.1), rgba(255, 255, 255, 0.1)),
    url('/images/bg-02.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(1.2);
  z-index: 1;
}

.messages {
  width: 100%;
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.85);
  position: relative;
  z-index: 2;
}

.message-wrapper {
  display: flex;
  margin-bottom: 15px;
  justify-content: start;
}

.message {
  padding: 12px 18px;
  border-radius: 12px;
  max-width: 80%;
  word-wrap: break-word;
  font-size: 16px;
  line-height: 1.6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.message-loader {
  text-align: right;
  font-size: 16px;
  color: #1976d2;
  margin-top: 10px;
  font-style: italic;
}

.user {
  background-color: #075e54;
  color: #ffffff;
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.gpt {
  background-color: #0f0d0dc7;
  color: #ffffff;
  margin-right: auto;
  border-bottom-left-radius: 4px;
}

.input-container {
  display: flex;
  width: 100%;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.95);
  border-top: 1px solid #e3f2fd;
  position: relative;
  z-index: 2;
}

.chat-input {
  flex: 1;
  padding: 14px;
  border: 2px solid #90caf9;
  border-radius: 6px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

.chat-input:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.send-button {
  padding: 14px 20px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-left: 10px;
  font-weight: 600;
  font-size: 16px;
  transition: background-color 0.3s ease;
  animation: buttonAnimation 0.4s ease-out;
}

.send-button:hover {
  background-color: #1565c0;
}

.logout-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 250px;
  padding: 12px 20px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 18px;
  z-index: 1000;
}

.logout-button:hover {
  background-color: #d32f2f;
}

.messages::-webkit-scrollbar {
  width: 8px;
}

.messages::-webkit-scrollbar-track {
  background: #f5f9fc;
}

.messages::-webkit-scrollbar-thumb {
  background-color: #1976d2;
  border-radius: 4px;
}

@keyframes buttonAnimation {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
