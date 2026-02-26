<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'
import { useProfileStore } from '@/store/profile'
import { useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const profileStore = useProfileStore()
const router = useRouter()

const editingName = ref('')
const saving = ref(false)
const showLogoutConfirm = ref(false)

onMounted(async () => {
  await profileStore.fetchProfile()
  editingName.value = profileStore.name
})

async function saveName() {
  saving.value = true
  await profileStore.upsertProfile({ name: editingName.value })
  saving.value = false
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="p-6 pb-4">
    <ConfirmDialog 
      :show="showLogoutConfirm"
      title="Keluar Akun?"
      message="Apakah kamu yakin ingin keluar dari akun WangKu?"
      confirm-text="Keluar"
      variant="destructive"
      icon="bx-log-out"
      @confirm="handleLogout"
      @cancel="showLogoutConfirm = false"
    />

    <PageHeader 
      title="Profil" 
      description="Kelola akun dan pengaturan aplikasi"
    />

    <div class="space-y-6">
      <!-- Balance Quick View -->
      <StatCard 
        label="Saldo Saat Ini" 
        :value="profileStore.balance" 
        :loading="profileStore.loading"
        variant="primary"
      />

      <Card class="rounded-2xl border-none shadow-sm bg-card/60 backdrop-blur-sm">
        <CardHeader class="pb-3">
          <CardTitle class="text-base font-bold">Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent class="space-y-5">
          <div class="space-y-1.5 px-0.5">
            <Label class="text-[10px] font-bold uppercase text-muted-foreground ml-1">Email</Label>
            <div class="p-3 rounded-xl bg-muted/40 border text-sm font-medium">
              {{ authStore.user?.email || 'Guest' }}
            </div>
          </div>
          
          <div class="space-y-1.5 px-0.5">
            <Label for="name" class="text-[10px] font-bold uppercase text-muted-foreground ml-1">Nama Tampilan</Label>
            <div class="relative group">
              <Input 
                id="name" 
                v-model="editingName" 
                placeholder="Nama kamu..." 
                @keyup.enter="saveName" 
                class="h-12 rounded-xl border-muted/60 focus-visible:ring-primary/30 pr-14 font-medium"
              />
              <button 
                @click="saveName" 
                :disabled="saving"
                class="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                <i class="bx text-xl" :class="saving ? 'bx-loader-alt animate-spin' : 'bx-check'"></i>
              </button>
            </div>
          </div>

          <Button 
            variant="ghost" 
            @click="showLogoutConfirm = true" 
            class="w-full h-11 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/5 font-bold text-sm gap-2"
          >
            <i class="bx bx-log-out text-lg"></i>
            Keluar Akun
          </Button>
        </CardContent>
      </Card>

      <Card class="rounded-2xl border-none shadow-sm bg-card/60 backdrop-blur-sm">
        <CardHeader class="pb-3">
          <CardTitle class="text-base font-bold flex items-center gap-2">
            <i class="bx bx-bot text-primary"></i>
            Konfigurasi AI
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-5">
          <p class="text-xs text-muted-foreground leading-relaxed">
            WangKu menggunakan <span class="text-foreground font-medium">Google Gemini</span> untuk Ringkasan AI, dan <span class="text-foreground font-medium">TerMai</span> untuk fitur AI Chat.
          </p>
          
          <div class="space-y-1.5 px-0.5">
            <Label for="apiKey" class="text-[10px] font-bold uppercase text-muted-foreground ml-1">Gemini API Key</Label>
            <Input 
              id="apiKey" 
              type="password" 
              placeholder="AIzaSy..." 
              v-model="settingsStore.geminiApiKey"
              class="h-11 rounded-xl border-muted/60 focus-visible:ring-primary/30 text-sm"
            />
          </div>
          
          <div class="space-y-1.5 px-0.5">
            <Label for="termaiKey" class="text-[10px] font-bold uppercase text-muted-foreground ml-1">TerMai API Key</Label>
            <Input 
              id="termaiKey" 
              type="password" 
              placeholder="Key dari api.termai.cc..." 
              v-model="settingsStore.termaiApiKey"
              class="h-11 rounded-xl border-muted/60 focus-visible:ring-primary/30 text-sm"
            />
          </div>
          
          <div class="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
            <i class="bx bx-info-circle text-amber-500 text-lg mt-0.5"></i>
            <p class="text-[10px] text-amber-700 font-medium leading-normal">
              Keys disimpan di browser lokal kamu secara aman dan tidak pernah dikirim ke server backend kami.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div class="text-center space-y-1 pt-4 opacity-40">
        <p class="text-[10px] font-bold tracking-widest uppercase">WangKu App &copy; 2026</p>
        <p class="text-[9px] font-medium">Crafted with Vue 3, Supabase & Tailwind</p>
      </div>
    </div>
  </div>
</template>
