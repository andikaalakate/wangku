<script setup lang="ts">
import { ref, nextTick, onMounted, computed } from 'vue'
import { useSettingsStore } from '@/store/settings'
import { useProfileStore } from '@/store/profile'
import { useAuthStore } from '@/store/auth'
import { sendChatMessage, fetchChatHistory, saveChatMessage, type ChatMessage } from '@/lib/chatService'

const settingsStore = useSettingsStore()
const profileStore = useProfileStore()
const authStore = useAuthStore()

const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const isSending = ref(false)
const messagesEnd = ref<HTMLElement | null>(null)

// Use user's supabase ID as conversation session ID for continuity
const conversationId = computed(() => authStore.user?.id || 'guest-chat')

function scrollToBottom() {
  nextTick(() => {
    messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

onMounted(async () => {
  await profileStore.fetchProfile()
  
  // Fetch chat history if user is logged in
  if (authStore.user?.id) {
    const history = await fetchChatHistory(authStore.user.id)
    if (history.length > 0) {
      messages.value = history
    } else {
      // Welcome message only if no history
      messages.value.push({
        id: 'welcome',
        role: 'assistant',
        text: `Halo ${profileStore.name || 'kamu'}! 👋 Aku **Wangi**, asisten keuangan pribadimu di WangKu. Mau tanya apa seputar keuanganmu hari ini?`,
        timestamp: new Date()
      })
    }
  }

  // delay to ensure UI is rendered before scrolling
  setTimeout(() => {
    window.scrollTo(0, 0)
    scrollToBottom()
  }, 100)
})

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isSending.value) return

  const userMsg: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    text,
    timestamp: new Date()
  }
  messages.value.push(userMsg)
  inputText.value = ''
  scrollToBottom()

  isSending.value = true
  
  // Save user message to DB
  if (authStore.user?.id) {
    await saveChatMessage(authStore.user.id, 'user', text)
  }

  const reply = await sendChatMessage(text, conversationId.value)

  const assistantMsg: ChatMessage = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    text: reply,
    timestamp: new Date()
  }
  messages.value.push(assistantMsg)

  // Save assistant message to DB
  if (authStore.user?.id) {
    await saveChatMessage(authStore.user.id, 'assistant', reply)
  }

  isSending.value = false
  scrollToBottom()
}

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex flex-col h-dvh bg-background text-foreground">
    <!-- Header -->
    <header class="flex fixed top-0 left-0 right-0 items-center gap-3 px-4 py-3 border-b bg-card shadow-sm flex-shrink-0">
      <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <i class="bx bx-bot text-xl text-primary-foreground"></i>
      </div>
      <div>
        <p class="font-semibold text-sm">Wangi</p>
        <p class="text-xs text-muted-foreground">Asisten Keuangan WangKu</p>
      </div>
    </header>

    <!-- No API Key Warning -->

    <!-- Messages -->
    <div :class="!settingsStore.termaiApiKey ? 'pt-4' : 'pt-20'" class="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32" style="overscroll-behavior: contain;">
      <div v-if="!settingsStore.termaiApiKey" class="mx-4 mt-16 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm flex gap-2">
        <i class="bx bx-error-circle text-xl flex-shrink-0 mt-0.5"></i>
        <div>
          <p class="font-medium">TerMai API Key belum diisi</p>
          <p class="text-xs mt-0.5">Pergi ke <a href="/profile" class="underline font-medium">Profile</a> → AI Chat untuk mengisi API Key dari <strong>api.termai.cc</strong>.</p>
        </div>
      </div>
      <div v-for="msg in messages" :key="msg.id" class="flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
        <!-- Assistant avatar -->
        <div v-if="msg.role === 'assistant'" class="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mr-2 mt-1">
          <i class="bx bx-bot text-sm text-primary-foreground"></i>
        </div>
        
        <div class="max-w-[80%] space-y-1">
          <div
            :class="[
              'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-card border rounded-bl-sm text-card-foreground'
            ]"
          >
            <p v-html="msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')"></p>
          </div>
          <p class="text-[10px] text-muted-foreground" :class="msg.role === 'user' ? 'text-right' : 'text-left'">
            {{ formatTime(msg.timestamp) }}
          </p>
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="isSending" class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <i class="bx bx-bot text-sm text-primary-foreground"></i>
        </div>
        <div class="bg-card border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
          <span class="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style="animation-delay: 0ms"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style="animation-delay: 150ms"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style="animation-delay: 300ms"></span>
        </div>
      </div>

      <div ref="messagesEnd"></div>
    </div>

    <!-- Input Bar -->
    <div class="flex-shrink-0 fixed bottom-17 left-0 right-0 border-t bg-card px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <form @submit.prevent="sendMessage" class="flex items-center gap-2">
        <input
          v-model="inputText"
          type="text"
          placeholder="Tulis pesan..."
          :disabled="isSending"
          class="flex-1 bg-background border rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          :disabled="!inputText.trim() || isSending"
          class="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
        >
          <i class="bx bx-send text-lg"></i>
        </button>
      </form>
    </div>
  </div>
</template>
