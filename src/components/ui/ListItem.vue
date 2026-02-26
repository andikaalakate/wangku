<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  subtitle?: string
  amount?: number | string
  type?: 'income' | 'expense' | 'neutral'
  status?: 'pending' | 'completed' | string
  icon?: string
  priority?: number
  isClickable?: boolean
  showStatusBadge?: boolean
  indicatorVariant?: 'primary' | 'destructive' | 'amber' | 'muted'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'neutral',
  isClickable: true,
  showStatusBadge: false
})

const colorClasses = computed(() => {
  if (props.indicatorVariant) {
    const map = {
      primary: 'bg-primary/10 text-primary',
      destructive: 'bg-destructive/10 text-destructive',
      amber: 'bg-amber-500/10 text-amber-600',
      muted: 'bg-muted text-muted-foreground'
    }
    return map[props.indicatorVariant]
  }
  
  if (props.type === 'expense') return 'bg-destructive/10 text-destructive'
  if (props.type === 'income') return 'bg-primary/10 text-primary'
  return 'bg-muted text-muted-foreground'
})

const iconClass = computed(() => {
  if (props.icon) return props.icon
  if (props.type === 'expense') return 'bx-trending-down'
  if (props.type === 'income') return 'bx-trending-up'
  return 'bx-receipt'
})
</script>

<template>
  <div 
    class="p-3 rounded-xl border bg-card flex items-center justify-between transition-colors"
    :class="isClickable ? 'hover:bg-muted/30 cursor-pointer' : ''"
  >
    <div class="flex items-center gap-3 overflow-hidden">
      <div :class="['w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center', colorClasses]">
        <i class="bx text-xl" :class="iconClass"></i>
      </div>
      <div class="min-w-0">
        <p class="text-sm font-medium truncate">{{ title }}</p>
        <div class="flex items-center gap-2">
          <p v-if="subtitle" class="text-xs text-muted-foreground truncate">{{ subtitle }}</p>
          <span 
            v-if="showStatusBadge && status === 'pending'" 
            class="text-[9px] font-bold uppercase py-0.5 px-1.5 bg-amber-100 text-amber-700 rounded-md whitespace-nowrap"
          >
            {{ type === 'income' ? 'Prediksi' : 'Tagihan' }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="flex flex-col items-end gap-1 flex-shrink-0">
      <p v-if="amount !== undefined" :class="['text-sm font-bold whitespace-nowrap', type === 'expense' ? 'text-destructive' : type === 'income' ? 'text-primary' : '']">
        {{ type === 'expense' ? '-' : type === 'income' ? '+' : '' }}Rp{{ Number(amount).toLocaleString('id-ID') }}
      </p>
      <slot name="action"></slot>
    </div>
  </div>
</template>
