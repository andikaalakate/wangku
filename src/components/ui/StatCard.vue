<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  variant?: 'primary' | 'destructive' | 'amber' | 'muted'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'muted',
  loading: false
})

const variantClasses = {
  primary: 'text-primary',
  destructive: 'text-destructive',
  amber: 'text-amber-500',
  muted: 'text-muted-foreground'
}
</script>

<template>
  <div class="p-4 rounded-xl bg-card border shadow-sm transition-all hover:shadow-md">
    <p class="text-[10px] font-bold uppercase mb-1" :class="variant === 'muted' ? 'text-muted-foreground' : variantClasses[variant]">
      {{ label }}
    </p>
    <p v-if="loading" class="font-bold text-lg animate-pulse opacity-50">...</p>
    <p v-else class="font-bold text-lg tracking-tight" :class="variantClasses[variant]">
      {{ typeof value === 'number' ? `Rp${value.toLocaleString('id-ID')}` : value }}
    </p>
  </div>
</template>
