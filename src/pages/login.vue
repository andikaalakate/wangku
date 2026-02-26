<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
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
  
  try {
    if (isRegister.value) {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      alert('Silakan cek email kamu untuk tautan konfirmasi!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      router.push('/')
    }
  } catch (err: any) {
    errorMsg.value = err.message || 'Terjadi kesalahan sistem.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#F8F9FA]">
    <!-- Decorative Background Elements -->
    <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[100px] rounded-full"></div>
    
    <div class="w-full max-w-sm relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <!-- Branding Area -->
      <div class="text-center space-y-2">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 mb-2 rotate-3 hover:rotate-0 transition-transform duration-500">
          <i class="bx bxs-wallet text-3xl"></i>
        </div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground italic">Wang<span class="text-primary not-italic">Ku</span></h1>
        <p class="text-sm text-muted-foreground font-medium">Asisten keuangan cerdas dalam genggaman</p>
      </div>

      <Card class="border-none shadow-2xl bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white">
        <CardContent class="p-8 pb-10">
          <div class="mb-8 space-y-1">
            <h2 class="text-xl font-bold">{{ isRegister ? 'Mulai Sekarang' : 'Selamat Datang' }}</h2>
            <p class="text-xs text-muted-foreground">{{ isRegister ? 'Buat akun untuk mulai mengelola keuanganmu.' : 'Masuk untuk memantau arus kas harianmu.' }}</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div v-if="errorMsg" class="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold rounded-xl flex items-center gap-2 animate-in zoom-in-95 duration-300">
              <i class="bx bx-error-circle text-base"></i>
              {{ errorMsg }}
            </div>

            <div class="space-y-1.5">
              <Label for="email" class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</Label>
              <Input 
                id="email" 
                type="email" 
                v-model="email" 
                required 
                placeholder="m@example.com" 
                class="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/40 font-medium" 
              />
            </div>

            <div class="space-y-1.5">
              <Label for="password" class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Password</Label>
              <Input 
                id="password" 
                type="password" 
                v-model="password" 
                required 
                class="h-12 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/40 font-medium" 
                placeholder="••••••••"
              />
            </div>

            <Button 
              type="submit" 
              class="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-2" 
              :disabled="loading"
            >
              <i v-if="loading" class="bx bx-loader-alt animate-spin text-lg mr-2"></i>
              {{ isRegister ? 'Daftar Sekarang' : 'Masuk Aplikasi' }}
            </Button>

            <div class="text-center pt-2">
              <button 
                type="button" 
                @click="isRegister = !isRegister" 
                class="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-2 px-4 rounded-lg hover:bg-secondary tracking-tight"
              >
                {{ isRegister ? 'Sudah punya akun? Masuk' : "Belum punya akun? Buat Baru" }}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Footer Info -->
      <div class="text-center space-y-1 opacity-60">
        <p class="text-[9px] font-bold tracking-[.2em] uppercase text-muted-foreground">Privasi & Keamanan Terjamin</p>
        <div class="flex items-center justify-center gap-2 text-[8px] text-muted-foreground/60">
          <span>End-to-End Encrypted</span>
          <span class="w-1 h-1 rounded-full bg-muted-foreground/20"></span>
          <span>Supabase Protected</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Focus effect enhancements */
input:focus {
  background: rgba(0, 0, 0, 0.02);
}
</style>
