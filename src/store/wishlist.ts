import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { useTransactionStore } from '@/store/transaction'

export interface Wishlist {
    id: string
    user_id: string
    item_name: string
    estimated_cost: number
    priority: number
    status: 'pending' | 'completed'
    created_at: string
}

export const useWishlistStore = defineStore('wishlist', () => {
    const wishlists = ref<Wishlist[]>([])
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

    async function addWishlist(payload: { item_name: string, estimated_cost: number, priority: number, status?: 'pending' | 'completed' }) {
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
                priority: payload.priority,
                status: payload.status || 'pending'
            }])
            .select()
            .single()

        if (err) error.value = err.message
        else if (data) wishlists.value.push(data)

        loading.value = false
    }

    async function updateWishlist(id: string, updates: any) {
        loading.value = true
        error.value = null
        const { data, error: err } = await supabase
            .from('wishlists')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (err) error.value = err.message
        else if (data) {
            const index = wishlists.value.findIndex(w => w.id === id)
            if (index !== -1) wishlists.value[index] = data
        }
        loading.value = false
    }

    async function deleteWishlist(id: string) {
        loading.value = true
        error.value = null
        const { error: err } = await supabase
            .from('wishlists')
            .delete()
            .eq('id', id)

        if (err) error.value = err.message
        else {
            wishlists.value = wishlists.value.filter(w => w.id !== id)
        }
        loading.value = false
    }

    async function buyWishlist(id: string) {
        const item = wishlists.value.find(w => w.id === id) as Wishlist
        if (!item) return

        loading.value = true
        // 1. Mark as completed
        await updateWishlist(id, { status: 'completed' })

        // 2. Create expense transaction
        const transactionStore = useTransactionStore()
        await transactionStore.addTransaction({
            title: `Beli ${item.item_name}`,
            amount: Number(item.estimated_cost),
            type: 'expense',
            date: new Date().toISOString().slice(0, 10),
            status: 'completed'
        })
        loading.value = false
    }

    return { wishlists, loading, error, fetchWishlists, addWishlist, updateWishlist, deleteWishlist, buyWishlist }
})
