<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const emit = defineEmits(['close', 'submit'])

const itemName = ref('')
const cost = ref<number | ''>('')
const priority = ref<number>(1)

function handleSubmit() {
  if (!itemName.value || !cost.value) return
  emit('submit', {
    item_name: itemName.value,
    estimated_cost: Number(cost.value),
    priority: priority.value
  })
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center sm:items-center">
    <div class="fixed inset-0" @click="emit('close')"></div>
    <Card class="w-full sm:max-w-md relative animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-full sm:data-[state=closed]:zoom-out-95">
      <CardHeader>
        <CardTitle class="text-xl">Add Wishlist</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="itemName">Item Name</Label>
            <Input id="itemName" v-model="itemName" required placeholder="e.g. PC Case" />
          </div>
          
          <div class="space-y-2">
            <Label for="cost">Estimated Cost (Rp)</Label>
            <Input id="cost" type="number" v-model.number="cost" required placeholder="500000" />
          </div>

          <div class="space-y-2">
            <Label for="priority">Priority</Label>
            <Input id="priority" type="number" v-model.number="priority" required />
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
