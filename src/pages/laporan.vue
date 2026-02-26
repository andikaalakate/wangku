<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useTransactionStore } from '@/store/transaction'
import { useWishlistStore } from '@/store/wishlist'
import { useProfileStore } from '@/store/profile'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import ListItem from '@/components/ui/ListItem.vue'

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
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount), 0)
)

const totalExpense = computed(() =>
  transactionStore.transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount), 0)
)

const netBalance = computed(() => totalIncome.value - totalExpense.value)

const totalWishlistCost = computed(() =>
  wishlistStore.wishlists.reduce((sum, w) => sum + Number(w.estimated_cost), 0)
)

const pendingExpenses = computed(() => {
  return transactionStore.transactions
    .filter(t => t.type === 'expense' && t.status === 'pending')
    .map(t => ({
      id: t.id,
      title: t.title,
      amount: t.amount,
      date: t.date
    }))
})

const completedTransactions = computed(() =>
  transactionStore.transactions.filter(t => t.status === 'completed')
)

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
</script>

<template>
  <div class="p-6 pb-4">
    <PageHeader 
      title="Laporan Keuangan" 
      description="Analisis arus kas nyata dan rencana pengeluaran"
    />

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 gap-3 mb-6">
      <StatCard label="Total Pemasukan" :value="totalIncome" variant="primary" />
      <StatCard label="Total Pengeluaran" :value="totalExpense" variant="destructive" />
      <StatCard label="Saldo Saat Ini" :value="profileStore.balance" :loading="profileStore.loading" />
      <StatCard label="Total Wishlist" :value="totalWishlistCost" variant="amber" />
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
          class="h-full bg-primary rounded-full transition-all duration-500"
          :style="{ width: totalIncome > 0 ? `${Math.min((totalIncome / (totalIncome + totalExpense)) * 100, 100)}%` : '0%' }"
        ></div>
      </div>
      <div class="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>Pengeluaran</span>
        <span>Pemasukan</span>
      </div>
    </div>

    <!-- Pending Bills / Future Expenses -->
    <section class="mb-6 space-y-3">
      <SectionHeader title="Pengeluaran Akan Datang" :badge="pendingExpenses.length" badge-variant="amber" />
      <div v-if="pendingExpenses.length === 0" class="text-center text-sm py-6 opacity-50 bg-muted/20 rounded-xl border border-dashed">Tidak ada pengeluaran tertunda.</div>
      <div v-else class="space-y-2">
        <ListItem 
          v-for="t in pendingExpenses" 
          :key="t.id"
          :title="t.title"
          :subtitle="`Jatuh tempo: ${formatDate(t.date)}`"
          :amount="t.amount"
          type="expense"
          icon="bx-calendar-event"
          indicator-variant="amber"
        />
      </div>
    </section>

    <!-- Wishlist Budget Feasibility -->
    <section class="mb-6 space-y-3">
      <SectionHeader title="Kelayakan Wishlist" />
      <div v-if="wishlistStore.wishlists.length === 0" class="text-center text-sm py-6 opacity-50 bg-muted/20 rounded-xl border border-dashed">Belum ada wishlist.</div>
      <div v-else class="space-y-3">
        <div v-for="item in wishlistStore.wishlists" :key="item.id" class="p-4 rounded-xl border bg-card space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">{{ item.item_name }}</p>
            <p class="text-sm font-bold">Rp{{ Number(item.estimated_cost).toLocaleString('id-ID') }}</p>
          </div>
          <div class="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              class="h-full rounded-full transition-all duration-500"
              :class="profileStore.balance >= Number(item.estimated_cost) ? 'bg-primary' : 'bg-amber-400'"
              :style="{ width: `${Math.min((profileStore.balance / Number(item.estimated_cost)) * 100, 100)}%` }"
            ></div>
          </div>
          <p class="text-[10px] text-muted-foreground">
            {{ profileStore.balance >= Number(item.estimated_cost) ? '✅ Saldo cukup untuk item ini' : `⚠️ Kurang Rp${(Number(item.estimated_cost) - profileStore.balance).toLocaleString('id-ID')}` }}
          </p>
        </div>
      </div>
    </section>

    <!-- Completed Transactions -->
    <section class="space-y-3">
      <SectionHeader title="Selesai" :badge="completedTransactions.length" badge-variant="muted" />
      <div v-if="completedTransactions.length === 0" class="text-center text-sm py-6 opacity-50 bg-muted/20 rounded-xl border border-dashed">Belum ada transaksi selesai.</div>
      <div v-else class="space-y-2 opacity-60">
        <ListItem 
          v-for="t in completedTransactions" 
          :key="t.id"
          :title="t.title"
          :subtitle="formatDate(t.date)"
          :amount="t.amount"
          :type="t.type"
          indicator-variant="muted"
        />
      </div>
    </section>
  </div>
</template>
