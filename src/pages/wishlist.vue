<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useWishlistStore, type Wishlist } from '@/store/wishlist'
import AddWishlist from '@/components/AddWishlist.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import ListItem from '@/components/ui/ListItem.vue'

const wishlistStore = useWishlistStore()
const isAdding = ref(false)
const editingItem = ref<Wishlist | null>(null)

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
  wishlistStore.fetchWishlists()
})

const pendingItems = computed(() => {
  return wishlistStore.wishlists.filter(i => i.status !== 'completed')
})

const groupedWishlist = computed(() => {
  const groups: { priority: number, items: Wishlist[] }[] = []
  
  pendingItems.value.forEach(item => {
    const existingGroup = groups.find(g => g.priority === item.priority)
    if (existingGroup) {
      existingGroup.items.push(item)
    } else {
      groups.push({ priority: item.priority, items: [item] })
    }
  })
  
  return groups.sort((a, b) => a.priority - b.priority)
})

const totalPendingCost = computed(() => {
  return pendingItems.value.reduce((acc, item) => acc + Number(item.estimated_cost), 0)
})

const completedItemsCount = computed(() => {
  return wishlistStore.wishlists.filter(i => i.status === 'completed').length
})

async function handleSubmit(payload: any) {
  if (payload.id) {
    await wishlistStore.updateWishlist(payload.id, payload)
  } else {
    await wishlistStore.addWishlist(payload)
  }
  isAdding.value = false
  editingItem.value = null
}

const handleDelete = async (id: string) => {
  confirmState.value = {
    show: true,
    title: 'Hapus Wishlist?',
    message: 'Hapus item ini dari wishlist?',
    confirmText: 'Hapus',
    variant: 'destructive',
    icon: 'bx-trash',
    action: async () => {
      await wishlistStore.deleteWishlist(id)
      editingItem.value = null
      confirmState.value.show = false
    }
  }
}

const toggleBuy = (item: Wishlist) => {
  confirmState.value = {
    show: true,
    title: 'Beli Barang?',
    message: `Konfirmasi pembelian "${item.item_name}" seharga Rp${Number(item.estimated_cost).toLocaleString('id-ID')}? Saldo akan terpotong secara otomatis.`,
    confirmText: 'Beli',
    variant: 'primary',
    icon: 'bx-cart-alt',
    action: async () => {
      await wishlistStore.buyWishlist(item.id)
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
      title="Wishlist" 
      description="Target belanja & barang impian" 
    />

    <!-- Wishlist Summary -->
    <div class="grid grid-cols-2 gap-3 mb-6">
      <StatCard label="Total Kebutuhan" :value="totalPendingCost" variant="amber" />
      <StatCard label="Item Tercapai" :value="completedItemsCount" variant="primary" />
    </div>

    <div v-if="wishlistStore.loading && wishlistStore.wishlists.length === 0" class="flex flex-col items-center justify-center py-20 opacity-50">
      <i class="bx bx-loader-alt animate-spin text-4xl mb-3 text-primary"></i>
      <p class="text-sm font-medium">Membuka lemari impian...</p>
    </div>

    <div v-else-if="pendingItems.length === 0" class="flex flex-col items-center justify-center py-20 text-center space-y-6">
      <div class="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/30 text-4xl">
        <i class="bx bx-star"></i>
      </div>
      <div class="space-y-1">
        <p class="text-lg font-bold">Belum ada target?</p>
        <p class="text-muted-foreground text-sm max-w-[200px] mx-auto">Tuliskan barang yang ingin kamu beli di sini!</p>
      </div>
      <Button @click="isAdding = true" size="sm" variant="outline" class="rounded-full px-6 shadow-sm">Tambah Wishlist</Button>
    </div>

    <div v-else class="space-y-8">
      <div v-for="group in groupedWishlist" :key="group.priority" class="space-y-3">
        <SectionHeader :title="`Prioritas Level ${group.priority}`" />

        <div class="space-y-2">
          <ListItem 
            v-for="item in group.items" 
            :key="item.id" 
            @click="editingItem = item"
            :title="item.item_name"
            :amount="item.estimated_cost"
            type="neutral"
            icon="bx-shopping-bag"
            :indicator-variant="group.priority === 1 ? 'primary' : 'muted'"
          >
            <template #action v-if="item.status !== 'completed'">
              <Button 
                variant="outline" 
                size="sm" 
                class="h-7 px-3 rounded-lg text-[10px] font-bold uppercase border-primary/20 text-primary hover:bg-primary/5 shadow-sm"
                @click.stop="toggleBuy(item)"
              >
                Beli
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
      <AddWishlist 
        v-if="isAdding" 
        @close="isAdding = false" 
        @submit="handleSubmit" 
      />
    </Transition>
    <Transition name="sheet">
      <AddWishlist 
        v-if="editingItem" 
        :wishlist="editingItem"
        @close="editingItem = null" 
        @submit="handleSubmit"
        @delete="handleDelete"
      />
    </Transition>
  </div>
</template>
