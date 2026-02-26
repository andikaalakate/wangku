<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useTransactionStore } from '@/store/transaction'
import { useWishlistStore } from '@/store/wishlist'
import { useProfileStore } from '@/store/profile'

const transactionStore = useTransactionStore()
const wishlistStore = useWishlistStore()
const profileStore = useProfileStore()

onMounted(async () => {
  await profileStore.fetchProfile()
  if (transactionStore.transactions.length === 0) await transactionStore.fetchTransactions()
  if (wishlistStore.wishlists.length === 0) await wishlistStore.fetchWishlists()
})

const totalIncome = computed(() =>
  transactionStore.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)
)

const totalExpense = computed(() =>
  transactionStore.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)
)

const netBalance = computed(() => totalIncome.value - totalExpense.value)

const totalWishlistCost = computed(() =>
  wishlistStore.wishlists.reduce((sum, w) => sum + Number(w.estimated_cost), 0)
)

const pendingExpenses = computed(() =>
  transactionStore.transactions.filter(t => t.type === 'expense' && t.status === 'pending')
)

const completedTransactions = computed(() =>
  transactionStore.transactions.filter(t => t.status === 'completed')
)

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
</script>

<template>
  <div class="p-6 pb-24">
    <header class="mb-6">
      <h1 class="text-2xl font-bold">Laporan</h1>
      <p class="text-muted-foreground text-sm">Ringkasan keuangan kamu</p>
    </header>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 gap-3 mb-6">
      <div class="p-4 rounded-xl bg-card border shadow-sm">
        <p class="text-xs text-muted-foreground mb-1">Total Pemasukan</p>
        <p class="font-bold text-primary text-lg">Rp{{ totalIncome.toLocaleString('id-ID') }}</p>
      </div>
      <div class="p-4 rounded-xl bg-card border shadow-sm">
        <p class="text-xs text-muted-foreground mb-1">Total Pengeluaran</p>
        <p class="font-bold text-destructive text-lg">Rp{{ totalExpense.toLocaleString('id-ID') }}</p>
      </div>
      <div class="p-4 rounded-xl bg-card border shadow-sm">
        <p class="text-xs text-muted-foreground mb-1">Saldo Saat Ini</p>
        <p class="font-bold text-foreground text-lg">
          <span v-if="profileStore.loading">...</span>
          <span v-else>Rp{{ profileStore.balance.toLocaleString('id-ID') }}</span>
        </p>
      </div>
      <div class="p-4 rounded-xl bg-card border shadow-sm">
        <p class="text-xs text-muted-foreground mb-1">Total Wishlist</p>
        <p class="font-bold text-amber-500 text-lg">Rp{{ totalWishlistCost.toLocaleString('id-ID') }}</p>
      </div>
    </div>

    <!-- Net Cashflow Bar -->
    <div class="mb-6 p-4 rounded-xl bg-card border shadow-sm">
      <div class="flex justify-between items-center mb-2">
        <p class="text-sm font-semibold">Selisih Kas (Net)</p>
        <p :class="['font-bold text-sm', netBalance >= 0 ? 'text-primary' : 'text-destructive']">
          {{ netBalance >= 0 ? '+' : '' }}Rp{{ netBalance.toLocaleString('id-ID') }}
        </p>
      </div>
      <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          class="h-full bg-primary rounded-full transition-all"
          :style="{ width: totalIncome > 0 ? `${Math.min((totalIncome / (totalIncome + totalExpense)) * 100, 100)}%` : '0%' }"
        ></div>
      </div>
      <div class="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>Pengeluaran</span>
        <span>Pemasukan</span>
      </div>
    </div>

    <!-- Pending Bills -->
    <section class="mb-6 space-y-3">
      <h2 class="text-base font-semibold">Tagihan Tertunda ({{ pendingExpenses.length }})</h2>
      <div v-if="pendingExpenses.length === 0" class="text-center text-sm py-6 opacity-50">Tidak ada tagihan tertunda.</div>
      <div v-for="t in pendingExpenses" :key="t.id" class="p-3 rounded-xl border bg-card flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <i class="bx bx-time text-base"></i>
          </div>
          <div>
            <p class="text-sm font-medium">{{ t.title }}</p>
            <p class="text-xs text-muted-foreground">{{ formatDate(t.date) }}</p>
          </div>
        </div>
        <p class="text-sm font-semibold text-destructive">-Rp{{ Number(t.amount).toLocaleString('id-ID') }}</p>
      </div>
    </section>

    <!-- Wishlist Budget Feasibility -->
    <section class="mb-6 space-y-3">
      <h2 class="text-base font-semibold">Kelayakan Wishlist</h2>
      <div v-if="wishlistStore.wishlists.length === 0" class="text-center text-sm py-6 opacity-50">Belum ada wishlist.</div>
      <div v-for="item in wishlistStore.wishlists" :key="item.id" class="p-3 rounded-xl border bg-card space-y-1">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium">{{ item.item_name }}</p>
          <p class="text-sm font-semibold">Rp{{ Number(item.estimated_cost).toLocaleString('id-ID') }}</p>
        </div>
        <div class="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            class="h-full rounded-full transition-all"
            :class="profileStore.balance >= Number(item.estimated_cost) ? 'bg-primary' : 'bg-amber-400'"
            :style="{ width: `${Math.min((profileStore.balance / Number(item.estimated_cost)) * 100, 100)}%` }"
          ></div>
        </div>
        <p class="text-[10px] text-muted-foreground">
          {{ profileStore.balance >= Number(item.estimated_cost) ? '✅ Saldo cukup untuk item ini' : `⚠️ Kurang Rp${(Number(item.estimated_cost) - profileStore.balance).toLocaleString('id-ID')}` }}
        </p>
      </div>
    </section>

    <!-- Completed Transactions -->
    <section class="space-y-3">
      <h2 class="text-base font-semibold">Selesai ({{ completedTransactions.length }})</h2>
      <div v-if="completedTransactions.length === 0" class="text-center text-sm py-6 opacity-50">Belum ada transaksi selesai.</div>
      <div v-for="t in completedTransactions" :key="t.id" class="p-3 rounded-xl border bg-card flex items-center justify-between opacity-60">
        <div>
          <p class="text-sm font-medium line-through">{{ t.title }}</p>
          <p class="text-xs text-muted-foreground">{{ formatDate(t.date) }}</p>
        </div>
        <p :class="['text-sm font-semibold', t.type === 'expense' ? 'text-destructive' : 'text-primary']">
          {{ t.type === 'expense' ? '-' : '+' }}Rp{{ Number(t.amount).toLocaleString('id-ID') }}
        </p>
      </div>
    </section>
  </div>
</template>
