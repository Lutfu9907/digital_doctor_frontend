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
  background-color: #f4f7f6;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.sidebar {
  width: 300px;
  padding: 20px;
  background-color: #2c8fad;
  color: white;
  display: flex;
  flex-direction: column;
  border-right: 2px solid #1f6e8c;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.new-chat-button {
  width: 100%;
  padding: 12px;
  background-color: #1f6e8c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background-color 0.3s ease;
  font-weight: 600;
}

.new-chat-button:hover {
  background-color: #1a5f7a;
}

.new-chat-button:disabled {
  background-color: #a0c4d4;
  cursor: not-allowed;
}

.chat-item {
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 10px;
  background-color: #4da6c4;
  cursor: pointer;
  color: white;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background-color 0.3s ease;
}

.chat-item:hover {
  background-color: #3b8bb5;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #ffffff;
  border-radius: 10px;
  margin: 20px;
  overflow: hidden;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.messages {
  width: 100%;
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f0f4f7;
}

.message-wrapper {
  display: flex;
  margin-bottom: 12px;
}

.message {
  padding: 10px 15px;
  border-radius: 12px;
  max-width: 80%;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.message-loader {
  text-align: right;
  font-size: 14px;
  color: #2c8fad;
  margin-top: 10px;
  font-style: italic;
}

.user {
  background-color: #e6f2f7;
  color: #1f6e8c;
  margin-left: auto;
}

.gpt {
  background-color: #f0f4f7;
  color: #2c8fad;
  margin-right: auto;
}

.input-container {
  display: flex;
  width: 100%;
  padding: 15px;
  background-color: #f4f7f6;
  border-top: 1px solid #e0e0e0;
}

.chat-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #b0c4de;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

.chat-input:focus {
  border-color: #2c8fad;
  box-shadow: 0 0 0 2px rgba(44, 143, 173, 0.2);
}

.send-button {
  padding: 12px 20px;
  background-color: #2c8fad;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-left: 10px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.send-button:hover {
  background-color: #1f6e8c;
}

.logout-button {
  position: absolute;
  bottom: 20px;
  left: 20px;
  padding: 10px 20px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background-color: #c0392b;
}

.messages::-webkit-scrollbar {
  width: 8px;
}

.messages::-webkit-scrollbar-track {
  background: #f0f4f7;
}

.messages::-webkit-scrollbar-thumb {
  background-color: #2c8fad;
  border-radius: 4px;
}
</style>
