<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useTransactionStore } from '@/store/transaction'
import { useWishlistStore } from '@/store/wishlist'
import { useProfileStore } from '@/store/profile'
import { generateFinancialSummary } from '@/lib/aiService'

const authStore = useAuthStore()
const transactionStore = useTransactionStore()
const wishlistStore = useWishlistStore()
const profileStore = useProfileStore()

const AI_CACHE_KEY = 'wangku-ai-summary'
const AI_CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 jam

const aiSummary = ref('')
const isRefreshing = ref(false)
const lastUpdated = ref<Date | null>(null)

function getCachedSummary(): string | null {
  try {
    const raw = localStorage.getItem(AI_CACHE_KEY)
    if (!raw) return null
    const { summary, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp < AI_CACHE_TTL_MS) {
      lastUpdated.value = new Date(timestamp)
      return summary
    }
  } catch {}
  return null
}

function cacheSummary(summary: string) {
  const timestamp = Date.now()
  localStorage.setItem(AI_CACHE_KEY, JSON.stringify({ summary, timestamp }))
  lastUpdated.value = new Date(timestamp)
}

async function loadAiSummary(force = false) {
  if (!force) {
    const cached = getCachedSummary()
    if (cached) {
      aiSummary.value = cached
      return
    }
  }

  isRefreshing.value = true
  aiSummary.value = 'Menganalisis keuanganmu...'
  const result = await generateFinancialSummary(
    profileStore.balance,
    transactionStore.transactions,
    wishlistStore.wishlists
  ) as string
  aiSummary.value = result
  cacheSummary(result)
  isRefreshing.value = false
}

const formatTime = (d: Date) =>
  d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })

onMounted(async () => {
  await profileStore.fetchProfile()
  const txFetch = transactionStore.transactions.length === 0 ? transactionStore.fetchTransactions() : Promise.resolve()
  const wlFetch = wishlistStore.wishlists.length === 0 ? wishlistStore.fetchWishlists() : Promise.resolve()
  await Promise.all([txFetch, wlFetch])
  await loadAiSummary()
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground pb-20">
    <header class="p-6 pb-4">
      <h1 class="text-2xl font-bold">WangKu</h1>
      <p class="text-muted-foreground text-sm">Halo, {{ profileStore.name || authStore.user?.email || 'Pengguna' }}!</p>
    </header>

    <main class="px-6 flex flex-col gap-6">
      <section class="bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div class="absolute right-0 top-0 opacity-10 blur-2xl">
          <div class="w-32 h-32 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <p class="text-sm font-medium opacity-90 mb-1">Total Saldo</p>
        <h2 class="text-4xl font-bold tracking-tight">
          <span v-if="profileStore.loading" class="opacity-60">...</span>
          <span v-else>Rp{{ profileStore.balance.toLocaleString('id-ID') }}</span>
        </h2>
        <p v-if="profileStore.error" class="text-xs mt-2 opacity-75">⚠️ {{ profileStore.error }}</p>
      </section>

      <section class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">AI Assistant</h3>
          <button
            @click="loadAiSummary(true)"
            :disabled="isRefreshing"
            class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          >
            <i class="bx text-base" :class="isRefreshing ? 'bx-loader-alt animate-spin' : 'bx-refresh'"></i>
            {{ isRefreshing ? 'Menganalisis...' : 'Perbarui' }}
          </button>
        </div>
        <div class="bg-card border rounded-xl p-4 shadow-sm text-sm leading-relaxed text-muted-foreground">
          <p v-html="aiSummary || 'Ketuk Perbarui untuk memulai analisis AI.'" class="mb-2"></p>
          <p v-if="lastUpdated" class="text-[10px] opacity-50 mt-2 border-t pt-2">
            Terakhir diperbarui: {{ formatTime(lastUpdated) }}
          </p>
        </div>
      </section>
    </main>
  </div>
</template>
