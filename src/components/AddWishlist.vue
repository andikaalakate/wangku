<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { type Wishlist } from '@/store/wishlist'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import CurrencyInput from '@/components/ui/CurrencyInput.vue'
import { useUiStore } from '@/store/ui'

import ConfirmDialog from './ConfirmDialog.vue'

const props = defineProps<{
  wishlist?: Wishlist | null
}>()

const emit = defineEmits(['close', 'submit', 'delete'])
const uiStore = useUiStore()

const itemName = ref('')
const cost = ref<number | ''>('')
const priority = ref<number>(1)

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
  if (props.wishlist) {
    itemName.value = props.wishlist.item_name
    cost.value = props.wishlist.estimated_cost
    priority.value = props.wishlist.priority
  }
})

onUnmounted(() => {
  uiStore.setModalOpen(false)
})

function triggerDelete() {
  confirmState.value = {
    show: true,
    title: 'Hapus Wishlist?',
    message: 'Tindakan ini tidak dapat dibatalkan.',
    confirmText: 'Hapus',
    variant: 'destructive',
    icon: 'bx-trash',
    action: () => {
      emit('delete', props.wishlist!.id)
      confirmState.value.show = false
    }
  }
}

function handleConfirmSubmit() {
  if (!itemName.value || !cost.value) return
  const payload = {
    id: props.wishlist?.id,
    item_name: itemName.value,
    estimated_cost: Number(cost.value),
    priority: priority.value
  }

  confirmState.value = {
    show: true,
    title: props.wishlist ? 'Simpan Perubahan?' : 'Simpan Wishlist?',
    message: `Akan menyimpan "${itemName.value}" dengan estimasi Rp${Number(cost.value).toLocaleString('id-ID')}.`,
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
        <CardTitle class="text-xl font-bold">{{ props.wishlist ? 'Edit' : 'Tambah' }} Wishlist</CardTitle>
        <Button v-if="props.wishlist" type="button" variant="ghost" size="icon" class="text-destructive hover:bg-destructive/10 rounded-full h-8 w-8" @click="triggerDelete">
          <i class="bx bx-trash text-lg"></i>
        </Button>
      </CardHeader>
      <CardContent class="pb-10 px-6">
        <form @submit.prevent="handleConfirmSubmit" class="space-y-6">
          <div class="space-y-1.5">
            <Label for="itemName" class="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Nama Barang</Label>
            <Input 
              id="itemName" 
              v-model="itemName" 
              required 
              placeholder="Contoh: MacBook Pro, Sepatu Lari" 
              class="h-12 rounded-xl focus-visible:ring-primary px-4 font-bold text-sm bg-muted/20 border-muted" 
            />
          </div>
          
          <CurrencyInput 
            id="cost"
            v-model="cost"
            label="Estimasi Harga"
            required
            placeholder="0"
          />

          <div class="space-y-3">
            <Label class="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Tingkat Prioritas</Label>
            <div class="grid grid-cols-3 gap-3">
              <button 
                v-for="p in [1, 2, 3]" 
                :key="p"
                type="button" 
                class="h-12 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 group"
                :class="priority === p ? 'bg-primary/10 border-primary/40 text-primary shadow-sm' : 'bg-transparent border-muted text-muted-foreground opacity-60 hover:opacity-100 hover:bg-muted/30'"
                @click="priority = p"
              >
                <div class="flex gap-0.5">
                  <i v-for="i in p" :key="i" class="bx bxs-star text-[10px]"></i>
                </div>
                <span class="text-[10px] font-bold uppercase">Level {{ p }}</span>
              </button>
            </div>
          </div>

          <div class="flex gap-3 pt-6">
            <Button type="button" variant="ghost" class="flex-1 h-14 rounded-2xl font-bold text-sm hover:bg-muted" @click="emit('close')">Batal</Button>
            <Button type="submit" class="flex-1 h-14 rounded-2xl font-bold text-sm bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">Simpan Impian</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
