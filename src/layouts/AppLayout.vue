<script setup lang="ts">
import BottomNav from '@/components/BottomNav.vue'
</script>

<template>
  <div class="min-h-dvh bg-background text-foreground pb-20">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
    <BottomNav />
  </div>
</template>
