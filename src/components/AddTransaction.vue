<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import CurrencyInput from '@/components/ui/CurrencyInput.vue'
import { useUiStore } from '@/store/ui'

import ConfirmDialog from './ConfirmDialog.vue'

const props = defineProps<{
  transaction?: any
}>()

const emit = defineEmits(['close', 'submit', 'delete'])
const uiStore = useUiStore()

const title = ref('')
const amount = ref<number | ''>('')
const type = ref<'income' | 'expense'>('expense')
const date = ref(new Date().toISOString().split('T')[0])
const status = ref<'pending' | 'completed'>('completed')

// Confirmation State
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
  uiStore.setModalOpen(true)
  if (props.transaction) {
    title.value = props.transaction.title
    amount.value = props.transaction.amount
    type.value = props.transaction.type
    date.value = props.transaction.date
    status.value = props.transaction.status
  }
})

onUnmounted(() => {
  uiStore.setModalOpen(false)
})

function triggerDelete() {
  confirmState.value = {
    show: true,
    title: 'Hapus Transaks?',
    message: 'Tindakan ini tidak dapat dibatalkan.',
    confirmText: 'Hapus',
    variant: 'destructive',
    icon: 'bx-trash',
    action: () => {
      emit('delete', props.transaction.id)
      confirmState.value.show = false
    }
  }
}

function handleConfirmSubmit() {
  const payload = {
    id: props.transaction?.id,
    title: title.value,
    amount: Number(amount.value),
    type: type.value,
    date: date.value,
    status: status.value
  }

  confirmState.value = {
    show: true,
    title: props.transaction ? 'Simpan Perubahan?' : 'Simpan Transaksi?',
    message: `Akan menyimpan transaksi "${title.value}" sebesar Rp${Number(amount.value).toLocaleString('id-ID')}.`,
    confirmText: 'Simpan',
    variant: 'primary',
    icon: 'bx-save',
    action: () => {
      emit('submit', payload)
      confirmState.value.show = false
    }
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-end justify-center overflow-y-auto">
    <div class="fixed inset-0" @click="emit('close')"></div>
    
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

    <Card class="modal-card w-full max-w-lg relative rounded-t-[2.5rem] rounded-b-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-x overflow-hidden bg-card">
      <!-- Handle line for bottom sheet feel -->
      <div class="w-12 h-1.5 bg-muted rounded-full mx-auto mt-4 mb-2 opacity-40"></div>
      
      <CardHeader class="flex flex-row items-center justify-between pb-4 pt-2">
        <CardTitle class="text-xl font-bold">{{ props.transaction ? 'Edit' : 'Tambah' }} Transaksi</CardTitle>
        <Button v-if="props.transaction" type="button" variant="ghost" size="icon" class="text-destructive hover:bg-destructive/10 rounded-full h-8 w-8" @click="triggerDelete">
          <i class="bx bx-trash text-lg"></i>
        </Button>
      </CardHeader>
      <CardContent class="pb-10 px-6">
        <form @submit.prevent="handleConfirmSubmit" class="space-y-6">
          <!-- Type Switcher -->
          <div class="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-2xl border">
            <button 
              type="button" 
              class="h-11 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              :class="type === 'expense' ? 'bg-destructive text-white shadow-lg shadow-destructive/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
              @click="type = 'expense'"
            >
              Uang Keluar
            </button>
            <button 
              type="button" 
              class="h-11 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              :class="type === 'income' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
              @click="type = 'income'"
            >
              Uang Masuk
            </button>
          </div>
          
          <div class="space-y-1.5">
            <Label for="title" class="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Keterangan</Label>
            <Input 
              id="title" 
              v-model="title" 
              required 
              placeholder="Contoh: Kopi Brew, Gaji Bulanan" 
              class="h-12 rounded-xl focus-visible:ring-primary px-4 font-bold text-sm bg-muted/20 border-muted" 
            />
          </div>
          
          <CurrencyInput 
            id="amount"
            v-model="amount"
            label="Jumlah Nominal"
            required
            placeholder="0"
          />

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <Label for="date" class="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Tanggal</Label>
              <Input 
                id="date" 
                type="date" 
                v-model="date" 
                required 
                class="h-12 rounded-xl focus-visible:ring-primary px-3 font-bold text-sm bg-muted/20 border-muted" 
              />
            </div>

            <div class="space-y-1.5">
              <Label class="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Status Pembayaran</Label>
              <div class="flex gap-2">
                <button 
                  type="button" 
                  class="flex-1 h-12 rounded-xl text-[10px] font-bold uppercase tracking-tight border transition-all flex flex-col items-center justify-center leading-none gap-1"
                  :class="status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-transparent border-muted text-muted-foreground opacity-40'"
                  @click="status = 'completed'"
                >
                  <i class="bx text-lg" :class="status === 'completed' ? 'bxs-check-circle' : 'bx-check-circle'"></i>
                  <span>Lunas</span>
                </button>
                <button 
                  type="button" 
                  class="flex-1 h-12 rounded-xl text-[10px] font-bold uppercase tracking-tight border transition-all flex flex-col items-center justify-center leading-none gap-1"
                  :class="status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' : 'bg-transparent border-muted text-muted-foreground opacity-40'"
                  @click="status = 'pending'"
                >
                  <i class="bx text-lg" :class="status === 'pending' ? 'bxs-time-five' : 'bx-time-five'"></i>
                  <span>Nanti</span>
                </button>
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-6">
            <Button type="button" variant="ghost" class="flex-1 h-14 rounded-2xl font-bold text-sm hover:bg-muted" @click="emit('close')">Batal</Button>
            <Button type="submit" class="flex-1 h-14 rounded-2xl font-bold text-sm bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">Simpan Transaksi</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
