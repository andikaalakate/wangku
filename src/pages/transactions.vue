<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTransactionStore } from '@/store/transaction'
import AddTransaction from '@/components/AddTransaction.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import ListItem from '@/components/ui/ListItem.vue'

const transactionStore = useTransactionStore()
const isAdding = ref(false)
const editingTransaction = ref<any>(null)

const confirmState = ref({
  show: false,
  title: '',
  message: '',
  confirmText: '',
  variant: 'primary' as 'primary' | 'destructive',
  icon: 'bx-help-circle',
  action: null as (() => void) | null
})

onMounted(() => {
  transactionStore.fetchTransactions()
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatMonth = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

const today = new Date().toISOString().split('T')[0]
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

const groupedTransactions = computed(() => {
  const sorted = [...transactionStore.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  const groups: { title: string, items: any[] }[] = []
  
  sorted.forEach(t => {
    let groupTitle = formatMonth(t.date)
    if (t.date === today) groupTitle = 'Hari Ini'
    else if (t.date === yesterday) groupTitle = 'Kemarin'
    
    const existingGroup = groups.find(g => g.title === groupTitle)
    if (existingGroup) {
      existingGroup.items.push(t)
    } else {
      groups.push({ title: groupTitle, items: [t] })
    }
  })
  
  return groups
})

const monthStats = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  const thisMonthTxs = transactionStore.transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.status === 'completed'
  })
  
  const income = thisMonthTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0)
  const expense = thisMonthTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0)
  
  return { income, expense, balance: income - expense }
})

async function handleSubmit(payload: any) {
  if (payload.id) {
    await transactionStore.updateTransaction(payload.id, payload)
  } else {
    await transactionStore.addTransaction(payload)
  }
  isAdding.value = false
  editingTransaction.value = null
}

async function handleDelete(id: string) {
  if (confirm('Hapus transaksi ini?')) {
    await transactionStore.deleteTransaction(id)
    editingTransaction.value = null
  }
}

const confirmUpdateStatus = (transaction: any) => {
  const isIncome = transaction.type === 'income'
  const actionText = isIncome ? 'Terima' : 'Bayar'
  const message = `Konfirmasi ${isIncome ? 'penerimaan' : 'pembayaran'} "${transaction.title}" sebesar Rp${Number(transaction.amount).toLocaleString('id-ID')}?`

  confirmState.value = {
    show: true,
    title: `${actionText} Transaksi?`,
    message,
    confirmText: actionText,
    variant: 'primary',
    icon: isIncome ? 'bx-trending-up' : 'bx-credit-card',
    action: async () => {
      await transactionStore.confirmTransaction(transaction.id)
      confirmState.value.show = false
    }
  }
}
</script>

<template>
  <div class="p-6 pb-4">
    <ConfirmDialog 
      :show="confirmState.show"
      :title="confirmState.title"
      :message="confirmState.message"
      :confirm-text="confirmState.confirmText"
      :variant="confirmState.variant"
      :icon="confirmState.icon"
      @confirm="confirmState.action?.()"
      @cancel="confirmState.show = false"
    />
    
    <PageHeader 
      title="Transaksi" 
      description="Rekam jejak keuanganmu" 
    />

    <!-- Monthly Summary -->
    <div class="grid grid-cols-2 gap-3 mb-6">
      <StatCard label="Masuk Bulan Ini" :value="monthStats.income" variant="primary" />
      <StatCard label="Keluar Bulan Ini" :value="monthStats.expense" variant="destructive" />
    </div>

    <div v-if="transactionStore.loading && transactionStore.transactions.length === 0" class="flex flex-col items-center justify-center py-20 opacity-50">
      <i class="bx bx-loader-alt animate-spin text-4xl mb-3 text-primary"></i>
      <p class="text-sm font-medium">Menyusun data transaksi...</p>
    </div>
    
    <div v-else-if="transactionStore.transactions.length === 0" class="flex flex-col items-center justify-center py-20 text-center space-y-6">
      <div class="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/30 relative">
        <i class="bx bx-receipt text-4xl"></i>
      </div>
      <div class="space-y-1">
        <p class="text-lg font-bold">Dompetmu masih sepi</p>
        <p class="text-muted-foreground text-sm max-w-[200px] mx-auto">Mulai catat transaksi pertamamu untuk melihat analisis keuangan!</p>
      </div>
      <Button @click="isAdding = true" size="sm" class="rounded-full px-6 shadow-sm">Tambah Sekarang</Button>
    </div>
    
    <div v-else class="space-y-8">
      <div v-for="group in groupedTransactions" :key="group.title" class="space-y-3">
        <SectionHeader :title="group.title" />
        
        <div class="space-y-2">
          <ListItem 
            v-for="t in group.items" 
            :key="t.id" 
            @click="editingTransaction = t"
            :title="t.title"
            :subtitle="formatDate(t.date)"
            :amount="t.amount"
            :type="t.type"
            :status="t.status"
            show-status-badge
          >
            <template #action v-if="t.status === 'pending'">
              <Button 
                variant="outline" 
                size="sm" 
                class="h-7 px-3 rounded-lg text-[10px] font-bold uppercase border-primary/20 text-primary hover:bg-primary/5 shadow-sm"
                @click.stop="confirmUpdateStatus(t)"
              >
                {{ t.type === 'income' ? 'Terima' : 'Bayar' }}
              </Button>
            </template>
          </ListItem>
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <button 
      @click="isAdding = true"
      class="fixed bottom-24 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-2xl shadow-[0_8px_30px_rgba(var(--primary),0.3)] flex items-center justify-center z-40 transition-all hover:scale-110 active:scale-95 animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500 delay-300"
    >
      <i class="bx bx-plus text-3xl"></i>
    </button>

    <!-- Modals -->
    <Transition name="sheet">
      <AddTransaction 
        v-if="isAdding" 
        @close="isAdding = false" 
        @submit="handleSubmit" 
      />
    </Transition>
    <Transition name="sheet">
      <AddTransaction 
        v-if="editingTransaction" 
        :transaction="editingTransaction"
        @close="editingTransaction = null" 
        @submit="handleSubmit"
        @delete="handleDelete"
      />
    </Transition>
  </div>
</template>
