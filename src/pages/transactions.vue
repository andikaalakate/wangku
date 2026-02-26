<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTransactionStore } from '@/store/transaction'
import AddTransaction from '@/components/AddTransaction.vue'

const transactionStore = useTransactionStore()
const isAdding = ref(false)

onMounted(() => {
  transactionStore.fetchTransactions()
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function handleAdd(payload: any) {
  await transactionStore.addTransaction(payload)
  isAdding.value = false
}
</script>

<template>
  <div class="p-6">
    <header class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Transactions</h1>
        <p class="text-muted-foreground text-sm">Managing your upcoming bills and history</p>
      </div>
      <button @click="isAdding = true" class="w-10 h-10 flex-shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
        <i class="bx bx-plus text-xl"></i>
      </button>
    </header>

    <div v-if="transactionStore.loading && transactionStore.transactions.length === 0" class="text-center text-sm py-10 opacity-50">Loading transactions...</div>
    <div v-else-if="transactionStore.transactions.length === 0" class="text-center text-sm py-10 opacity-50">
      No transactions found. Add one!
    </div>
    
    <div v-else class="space-y-4">
      <div v-for="t in transactionStore.transactions" :key="t.id" class="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center', 
              t.type === 'expense' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
            ]">
              <i :class="['bx text-xl', t.type === 'expense' ? 'bx-down-arrow-alt' : 'bx-up-arrow-alt']"></i>
            </div>
            <div>
              <p class="font-medium text-sm">{{ t.title }}</p>
              <p class="text-xs text-muted-foreground">Due {{ formatDate(t.date) }}</p>
            </div>
          </div>
          <p :class="['font-semibold', t.type === 'expense' ? 'text-destructive' : 'text-primary']">
            {{ t.type === 'expense' ? '-' : '+' }}Rp{{ Number(t.amount).toLocaleString('id-ID') }}
          </p>
        </div>
      </div>
    </div>

    <AddTransaction 
      v-if="isAdding" 
      @close="isAdding = false" 
      @submit="handleAdd" 
    />
  </div>
</template>
