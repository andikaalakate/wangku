<script setup lang="ts">
interface Props {
  title: string
  badge?: string | number
  badgeVariant?: 'amber' | 'primary' | 'muted'
}

const props = withDefaults(defineProps<Props>(), {
  badgeVariant: 'amber'
})

const badgeClasses = {
  amber: 'bg-amber-100 text-amber-700',
  primary: 'bg-primary/10 text-primary',
  muted: 'bg-muted text-muted-foreground'
}
</script>

<template>
  <div class="flex items-center justify-between mb-3 px-1">
    <h3 class="text-base font-semibold">{{ title }}</h3>
    <span 
      v-if="badge" 
      class="text-[10px] font-bold uppercase py-0.5 px-2 rounded-full"
      :class="badgeClasses[badgeVariant]"
    >
      {{ badge }}
    </span>
  </div>
</template>
