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

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const profileStore = useProfileStore()
const router = useRouter()

const editingName = ref('')
const saving = ref(false)

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
  <div class="p-6 pb-24">
    <header class="mb-6">
      <h1 class="text-2xl font-bold">Profile</h1>
      <p class="text-muted-foreground text-sm">Manage your account and app settings</p>
    </header>

    <div class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Account Info</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <Label class="text-muted-foreground">Email</Label>
            <p class="font-medium mt-1">{{ authStore.user?.email || 'Guest' }}</p>
          </div>
          <div class="space-y-2">
            <Label for="name">Nama Tampilan</Label>
            <div class="flex gap-2">
              <Input id="name" v-model="editingName" placeholder="Nama kamu..." @keyup.enter="saveName" />
              <Button @click="saveName" :disabled="saving" size="sm">
                <i class="bx" :class="saving ? 'bx-loader-alt animate-spin' : 'bx-check'"></i>
              </Button>
            </div>
          </div>
          <div>
            <Label class="text-muted-foreground">Saldo Terkini</Label>
            <p class="font-bold text-primary text-xl mt-1">Rp{{ profileStore.balance.toLocaleString('id-ID') }}</p>
            <p class="text-xs text-muted-foreground">Edit saldo langsung dari halaman Beranda.</p>
          </div>
          <Button variant="destructive" @click="handleLogout" class="w-full">
            <i class="bx bx-log-out mr-2 text-lg"></i>
            Log Out
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-lg flex items-center gap-2">
            <i class="bx bx-bot text-primary"></i>
            AI Configuration
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <p class="text-sm text-muted-foreground">
            WangKu uses Google Gemini for the AI Summary, and TerMai for the AI Chat feature.
          </p>
          <div class="space-y-2">
            <Label for="apiKey">Gemini API Key <span class="text-muted-foreground">(AI Summary)</span></Label>
            <Input 
              id="apiKey" 
              type="password" 
              placeholder="AIzaSy..." 
              v-model="settingsStore.geminiApiKey"
            />
          </div>
          <div class="space-y-2">
            <Label for="termaiKey">TerMai API Key <span class="text-muted-foreground">(AI Chat)</span></Label>
            <Input 
              id="termaiKey" 
              type="password" 
              placeholder="Key dari api.termai.cc..." 
              v-model="settingsStore.termaiApiKey"
            />
          </div>
          <p class="text-[10px] text-muted-foreground">Keys disimpan di browser lokal kamu, tidak dikirim ke server kami.</p>
        </CardContent>
      </Card>
      
      <div class="text-center text-xs text-muted-foreground pt-4">
        WangKu App &copy; 2026<br/>
        Built with Vite, Vue 3, and Supabase
      </div>
    </div>
  </div>
</template>
