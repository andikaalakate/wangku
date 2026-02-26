<script setup lang="ts">
interface Props {
  title: string
  description?: string
  showAction?: boolean
  actionIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  showAction: false,
  actionIcon: 'bx-plus'
})

const emit = defineEmits(['action'])
</script>

<template>
  <header class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">{{ title }}</h1>
      <p v-if="description" class="text-muted-foreground text-sm">{{ description }}</p>
    </div>
    <button 
      v-if="showAction" 
      @click="emit('action')" 
      class="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all"
    >
      <i class="bx text-xl" :class="actionIcon"></i>
    </button>
  </header>
</template>
