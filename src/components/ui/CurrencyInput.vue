<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  modelValue: number | ''
  label: string
  id: string
  placeholder?: string
  required?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '0',
  required: false
})

const emit = defineEmits(['update:modelValue'])

const displayValue = ref('')

function formatCurrency(val: number | string): string {
  const num = typeof val === 'string' ? parseInt(val.replace(/\D/g, '')) : val
  if (num === null || isNaN(num)) return ''
  return num.toLocaleString('id-ID')
}

function handleInput(e: Event) {
  const input = e.target as HTMLInputElement
  const rawValue = input.value.replace(/\D/g, '')
  const numValue = rawValue ? parseInt(rawValue) : ''
  
  emit('update:modelValue', numValue)
  displayValue.value = formatCurrency(numValue)
}

watch(() => props.modelValue, (newVal) => {
  const formatted = formatCurrency(newVal as number)
  if (formatted !== displayValue.value) {
    displayValue.value = formatted
  }
}, { immediate: true })

onMounted(() => {
  displayValue.value = formatCurrency(props.modelValue as number)
})
</script>

<template>
  <div class="space-y-1.5">
    <Label :for="id" class="text-xs font-medium text-muted-foreground ml-1">{{ label }}</Label>
    <div class="relative">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">Rp</span>
      <Input 
        :id="id" 
        type="text" 
        :value="displayValue" 
        @input="handleInput"
        :required="required" 
        :placeholder="placeholder" 
        inputmode="numeric"
        class="h-12 rounded-xl focus-visible:ring-primary pl-10 text-xl font-bold" 
        :class="error ? 'border-destructive' : ''"
      />
    </div>
    <p v-if="error" class="text-[10px] text-destructive ml-1">{{ error }}</p>
  </div>
</template>
