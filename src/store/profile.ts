import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'

export const useProfileStore = defineStore('profile', () => {
    const balance = ref<number>(0)
    const name = ref<string>('')
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchProfile() {
        const authStore = useAuthStore()
        if (!authStore.user) return

        loading.value = true
        error.value = null

        const { data, error: err } = await supabase
            .from('profiles')
            .select('name, current_balance')
            .eq('id', authStore.user.id)
            .single()

        if (err) {
            // Profile might not exist yet, try to upsert it
            if (err.code === 'PGRST116') {
                await upsertProfile({ name: '', current_balance: 0 })
            } else {
                error.value = err.message
            }
        } else if (data) {
            name.value = data.name || ''
            balance.value = Number(data.current_balance) || 0
        }

        loading.value = false
    }

    async function upsertProfile(payload: { name?: string, current_balance?: number }) {
        const authStore = useAuthStore()
        if (!authStore.user) return

        const { data, error: err } = await supabase
            .from('profiles')
            .upsert({
                id: authStore.user.id,
                name: payload.name ?? name.value,
                current_balance: payload.current_balance ?? balance.value
            })
            .select()
            .single()

        if (err) error.value = err.message
        else if (data) {
            name.value = data.name || ''
            balance.value = Number(data.current_balance) || 0
        }
    }

    async function updateBalance(newBalance: number) {
        balance.value = newBalance
        await upsertProfile({ current_balance: newBalance })
    }

    return { balance, name, loading, error, fetchProfile, updateBalance, upsertProfile }
})
