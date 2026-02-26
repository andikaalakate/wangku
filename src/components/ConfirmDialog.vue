<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Props {
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'primary' | 'destructive'
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Ya, Lanjutkan',
  cancelText: 'Batal',
  variant: 'primary',
  icon: 'bx-help-circle'
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center p-6 text-center">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-background/90 backdrop-blur-sm" @click="emit('cancel')"></div>
      
      <!-- Dialog Card -->
      <Card class="w-full max-w-[320px] relative z-10 shadow-2xl border-none rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <CardContent class="p-6 space-y-4">
          <div 
            class="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
            :class="variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'"
          >
            <i class="bx text-3xl" :class="icon"></i>
          </div>
          
          <div class="space-y-1">
            <h3 class="font-bold text-lg leading-tight">{{ title }}</h3>
            <p class="text-sm text-muted-foreground">{{ message }}</p>
          </div>
          
          <div class="flex gap-2 pt-2">
            <Button 
              variant="ghost" 
              class="flex-1 h-11 rounded-xl font-bold text-sm" 
              @click="emit('cancel')"
            >
              {{ cancelText }}
            </Button>
            <Button 
              :variant="variant === 'destructive' ? 'destructive' : 'default'" 
              class="flex-1 h-11 rounded-xl font-bold text-sm shadow-sm"
              @click="emit('confirm')"
            >
              {{ confirmText }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </Transition>
</template>
