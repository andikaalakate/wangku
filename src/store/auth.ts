import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const loading = ref(true)

    async function initialize() {
        loading.value = true
        const { data: { session } } = await supabase.auth.getSession()
        user.value = session?.user || null

        supabase.auth.onAuthStateChange((_event, session) => {
            user.value = session?.user || null
        })
        loading.value = false
    }

    async function logout() {
        await supabase.auth.signOut()
        user.value = null
    }

    return { user, loading, initialize, logout }
})
