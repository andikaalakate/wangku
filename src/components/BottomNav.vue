<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

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
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-card border-t text-card-foreground shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe pt-2 px-6 flex justify-around items-center h-[70px]">
    <RouterLink
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors"
      :class="route.path === item.path ? 'text-primary' : 'text-muted-foreground hover:text-foreground'"
    >
      <i :class="['bx text-2xl', item.icon, route.path === item.path ? 'bx-tada' : '']"></i>
      <span class="text-[10px] font-medium">{{ item.name }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
