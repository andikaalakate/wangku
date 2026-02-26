<script setup lang="ts">
import BottomNav from '@/components/BottomNav.vue'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground pb-20">
    <RouterView />
    <BottomNav />
  </div>
</template>
