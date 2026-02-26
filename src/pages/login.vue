<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const isRegister = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  loading.value = true
  errorMsg.value = ''
  
  if (isRegister.value) {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    if (error) errorMsg.value = error.message
    else alert('Check your email for the confirmation link!')
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) errorMsg.value = error.message
    else router.push('/')
  }
  
  loading.value = false
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-background">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl text-center">{{ isRegister ? 'Create Account' : 'Welcome Back' }}</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div v-if="errorMsg" class="p-3 bg-destructive/15 hidden?text-destructive text-sm rounded-md text-destructive">
            {{ errorMsg }}
          </div>
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" v-model="email" required placeholder="m@example.com" />
          </div>
          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input id="password" type="password" v-model="password" required />
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Loading...' : (isRegister ? 'Sign Up' : 'Sign In') }}
          </Button>
          <div class="text-center text-sm">
            <button type="button" @click="isRegister = !isRegister" class="text-primary hover:underline">
              {{ isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up" }}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
