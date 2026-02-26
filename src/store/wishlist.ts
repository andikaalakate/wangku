import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'

export const useWishlistStore = defineStore('wishlist', () => {
    const wishlists = ref<any[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchWishlists() {
        loading.value = true
        error.value = null
        const { data, error: err } = await supabase
            .from('wishlists')
            .select('*')
            .order('priority', { ascending: true })

        if (err) error.value = err.message
        else wishlists.value = data || []

        loading.value = false
    }

    async function addWishlist(payload: { item_name: string, estimated_cost: number, priority: number }) {
        const authStore = useAuthStore()
        if (!authStore.user) return

        loading.value = true
        error.value = null
        const { data, error: err } = await supabase
            .from('wishlists')
            .insert([{
                user_id: authStore.user.id,
                item_name: payload.item_name,
                estimated_cost: payload.estimated_cost,
                priority: payload.priority
            }])
            .select()
            .single()

        if (err) error.value = err.message
        else if (data) wishlists.value.push(data)

        loading.value = false
    }

    return { wishlists, loading, error, fetchWishlists, addWishlist }
})
