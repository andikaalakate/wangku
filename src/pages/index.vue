<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useTransactionStore } from '@/store/transaction'
import { useWishlistStore } from '@/store/wishlist'
import { useProfileStore } from '@/store/profile'
import { generateFinancialSummary } from '@/lib/aiService'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import ListItem from '@/components/ui/ListItem.vue'

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

const now = new Date()
const currentMonth = now.getMonth()
const currentYear = now.getFullYear()

const monthlyTransactions = computed(() => {
  return transactionStore.transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.status === 'completed'
  })
})

const monthlyIncome = computed(() => 
  monthlyTransactions.value.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0)
)

const monthlyExpense = computed(() => 
  monthlyTransactions.value.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0)
)

const monthlyNet = computed(() => monthlyIncome.value - monthlyExpense.value)

const recentTransactions = computed(() => {
  return [...transactionStore.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
})

const pendingBills = computed(() => {
  return transactionStore.transactions
    .filter(t => t.type === 'expense' && t.status === 'pending')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2)
})

const topWishlist = computed(() => {
  return wishlistStore.wishlists
    .filter(w => w.status !== 'completed')
    .sort((a, b) => a.priority - b.priority)[0]
})

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

onMounted(async () => {
  await profileStore.fetchProfile()
  const txFetch = transactionStore.transactions.length === 0 ? transactionStore.fetchTransactions() : Promise.resolve()
  const wlFetch = wishlistStore.wishlists.length === 0 ? wishlistStore.fetchWishlists() : Promise.resolve()
  await Promise.all([txFetch, wlFetch])
  await loadAiSummary()
})
</script>

<template>
  <div class="p-6 pb-4">
    <PageHeader 
      title="WangKu" 
      :description="`Halo, ${profileStore.name || 'Pengguna'}!`"
    />

    <main class="space-y-6">
      <!-- 4-Card Summary Grid -->
      <div class="grid grid-cols-2 gap-3">
        <StatCard 
          label="Saldo Utama" 
          :value="profileStore.balance" 
          :loading="profileStore.loading"
        />
        <StatCard 
          label="Masuk (Bln Ini)" 
          :value="monthlyIncome" 
          variant="primary"
        />
        <StatCard 
          label="Keluar (Bln Ini)" 
          :value="monthlyExpense" 
          variant="destructive"
        />
        <StatCard 
          label="Net (Bln Ini)" 
          :value="monthlyNet" 
          :variant="monthlyNet >= 0 ? 'primary' : 'destructive'"
        />
      </div>

      <!-- Recent Transactions -->
      <section v-if="recentTransactions.length > 0" class="space-y-3">
        <SectionHeader title="Transaksi Terakhir" />
        <div class="space-y-2">
          <ListItem 
            v-for="t in recentTransactions" 
            :key="t.id"
            :title="t.title"
            :subtitle="formatDate(t.date)"
            :amount="t.amount"
            :type="t.type"
          />
        </div>
      </section>

      <!-- Pending Bills / Upcoming -->
      <section v-if="pendingBills.length > 0" class="space-y-3">
        <SectionHeader title="Tagihan Mendatang" />
        <div class="space-y-2">
          <ListItem 
            v-for="t in pendingBills" 
            :key="t.id"
            :title="t.title"
            :subtitle="`Jatuh tempo: ${formatDate(t.date)}`"
            :amount="t.amount"
            type="neutral"
            indicator-variant="amber"
            status="pending"
            show-status-badge
          />
        </div>
      </section>

      <!-- Wishlist Highlight -->
      <section v-if="topWishlist" class="space-y-3">
        <SectionHeader title="Target Utama" />
        <div class="p-4 rounded-xl border bg-card space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">{{ topWishlist.item_name }}</p>
            <p class="text-sm font-bold">Rp{{ Number(topWishlist.estimated_cost).toLocaleString('id-ID') }}</p>
          </div>
          <div class="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary rounded-full transition-all duration-500"
              :style="{ width: `${Math.min((profileStore.balance / Number(topWishlist.estimated_cost)) * 100, 100)}%` }"
            ></div>
          </div>
          <p class="text-[10px] text-muted-foreground">
            {{ profileStore.balance >= Number(topWishlist.estimated_cost) ? '✅ Saldo cukup' : `⚠️ Kurang Rp${(Number(topWishlist.estimated_cost) - profileStore.balance).toLocaleString('id-ID')}` }}
          </p>
        </div>
      </section>

      <!-- AI Assistant -->
      <section class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-base font-semibold">AI Assistant</h3>
          <button @click="loadAiSummary(true)" :disabled="isRefreshing" class="p-1 px-2 rounded-lg bg-secondary text-[10px] font-bold flex items-center gap-1 transition-colors hover:bg-muted">
            <i class="bx text-xs" :class="isRefreshing ? 'bx-loader-alt animate-spin' : 'bx-refresh'"></i>
            Perbarui
          </button>
        </div>
        <div class="p-4 rounded-xl bg-card border text-sm text-muted-foreground leading-relaxed shadow-sm">
          <p v-html="aiSummary || 'Menganalisis keuanganmu...'"></p>
        </div>
      </section>

      <!-- Quick Links -->
      <div class="grid grid-cols-2 gap-3">
        <router-link to="/transactions" class="p-3 rounded-xl border flex items-center gap-3 bg-card hover:bg-muted/50 transition-all active:scale-[0.98] shadow-sm">
          <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <i class="bx bx-list-ul text-lg"></i>
          </div>
          <span class="text-xs font-bold">Transaksi</span>
        </router-link>
        <router-link to="/wishlist" class="p-3 rounded-xl border flex items-center gap-3 bg-card hover:bg-muted/50 transition-all active:scale-[0.98] shadow-sm">
          <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <i class="bx bx-heart text-lg"></i>
          </div>
          <span class="text-xs font-bold">Wishlist</span>
        </router-link>
      </div>
    </main>
  </div>
</template>
