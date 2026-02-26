<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const emit = defineEmits(['close', 'submit'])

const title = ref('')
const amount = ref<number | ''>('')
const type = ref<'income' | 'expense'>('expense')
const date = ref(new Date().toISOString().split('T')[0])

function handleSubmit() {
  if (!title.value || !amount.value) return
  emit('submit', {
    title: title.value,
    amount: Number(amount.value),
    type: type.value,
    date: date.value
  })
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center sm:items-center">
    <div class="fixed inset-0" @click="emit('close')"></div>
    <Card class="w-full sm:max-w-md relative animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-full sm:data-[state=closed]:zoom-out-95">
      <CardHeader>
        <CardTitle class="text-xl">Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <Button type="button" :variant="type === 'expense' ? 'default' : 'outline'" @click="type = 'expense'">Expense</Button>
            <Button type="button" :variant="type === 'income' ? 'default' : 'outline'" @click="type = 'income'">Income</Button>
          </div>
          
          <div class="space-y-2">
            <Label for="title">Title</Label>
            <Input id="title" v-model="title" required placeholder="e.g. SPaylater, Wifi" />
          </div>
          
          <div class="space-y-2">
            <Label for="amount">Amount (Rp)</Label>
            <Input id="amount" type="number" v-model.number="amount" required placeholder="100000" />
          </div>

          <div class="space-y-2">
            <Label for="date">Date</Label>
            <Input id="date" type="date" v-model="date" required />
          </div>

          <div class="flex gap-2 pt-2">
            <Button type="button" variant="outline" class="w-full" @click="emit('close')">Cancel</Button>
            <Button type="submit" class="w-full">Save</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
