<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWishlistStore } from '@/store/wishlist'
import AddWishlist from '@/components/AddWishlist.vue'

const wishlistStore = useWishlistStore()
const isAdding = ref(false)

onMounted(() => {
  wishlistStore.fetchWishlists()
})

async function handleAdd(payload: any) {
  await wishlistStore.addWishlist(payload)
  isAdding.value = false
}
</script>

<template>
  <div class="p-6">
    <header class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Wishlist</h1>
        <p class="text-muted-foreground text-sm">Your goals and required items</p>
      </div>
      <button @click="isAdding = true" class="w-10 h-10 flex-shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
        <i class="bx bx-plus text-xl"></i>
      </button>
    </header>

    <div v-if="wishlistStore.loading && wishlistStore.wishlists.length === 0" class="text-center text-sm py-10 opacity-50">Loading wishlists...</div>
    <div v-else-if="wishlistStore.wishlists.length === 0" class="text-center text-sm py-10 opacity-50">
      No items in wishlist. Add one!
    </div>

    <div v-else class="grid grid-cols-2 gap-4">
      <div v-for="item in wishlistStore.wishlists" :key="item.id" class="p-4 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col justify-between aspect-square">
        <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
          <i class="bx bx-package text-xl"></i>
        </div>
        <div>
          <p class="font-medium text-sm leading-tight mb-1">{{ item.item_name }}</p>
          <p class="font-bold text-primary text-sm">Rp{{ Number(item.estimated_cost).toLocaleString('id-ID') }}</p>
        </div>
      </div>
    </div>

    <AddWishlist 
      v-if="isAdding" 
      @close="isAdding = false" 
      @submit="handleAdd" 
    />
  </div>
</template>
