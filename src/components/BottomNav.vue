<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUiStore } from '@/store/ui'

const route = useRoute()
const uiStore = useUiStore()

const navItems = [
  { name: 'Home', path: '/', icon: 'bx-home-alt' },
  { name: 'Transaksi', path: '/transactions', icon: 'bx-wallet' },
  { name: 'Chat AI', path: '/chat', icon: 'bx-bot' },
  { name: 'Laporan', path: '/laporan', icon: 'bx-bar-chart-alt-2' },
  { name: 'Wishlist', path: '/wishlist', icon: 'bx-heart' },
  { name: 'Profile', path: '/profile', icon: 'bx-user' }
]
</script>

<template>
  <nav 
    class="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-t text-card-foreground shadow-[0_-8px_30px_rgba(0,0,0,0.04)] pb-safe pt-2 px-2 flex justify-around items-center h-[72px] transition-transform duration-500 ease-in-out"
    :class="{ 'translate-y-full': uiStore.isModalOpen }"
  >
    <RouterLink
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 relative group"
      :class="route.path === item.path ? 'text-primary scale-110' : 'text-muted-foreground/60 hover:text-foreground'"
    >
      <div 
        v-if="route.path === item.path" 
        class="absolute -top-1 w-8 h-1 bg-primary rounded-full shadow-[0_2px_10px_rgba(var(--primary),0.4)]"
      ></div>
      <i :class="['bx text-xl transition-transform duration-300', item.icon, route.path === item.path ? 'font-bold' : '']"></i>
      <span :class="['text-[9px] font-bold uppercase tracking-tighter transition-all duration-300', route.path === item.path ? 'opacity-100' : 'opacity-0 scale-75 group-hover:opacity-40']">
        {{ item.name }}
      </span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

.router-link-active i {
  filter: drop-shadow(0 0 8px rgba(var(--primary), 0.2));
}
</style>
