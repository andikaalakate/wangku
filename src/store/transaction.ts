import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { useProfileStore } from '@/store/profile'

export interface Transaction {
    id: string
    user_id: string
    title: string
    amount: number
    type: 'income' | 'expense'
    date: string
    status: 'pending' | 'completed'
    created_at: string
}

export const useTransactionStore = defineStore('transaction', () => {
    const transactions = ref<Transaction[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchTransactions() {
        loading.value = true
        error.value = null

        const { data, error: err } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: true })

        if (err) error.value = err.message
        else transactions.value = data || []

        loading.value = false
    }

    async function addTransaction(payload: { title: string, amount: number, type: 'income' | 'expense', date: string, status?: 'pending' | 'completed' }) {
        const authStore = useAuthStore()
        if (!authStore.user) return

        loading.value = true
        error.value = null
        const { data, error: err } = await supabase
            .from('transactions')
            .insert([{
                user_id: authStore.user.id,
                title: payload.title,
                amount: payload.amount,
                type: payload.type,
                date: payload.date,
                status: payload.status || 'pending'
            }])
            .select()
            .single()

        if (err) error.value = err.message
        else if (data) {
            transactions.value.push(data)
            if (data.status === 'completed') {
                const profileStore = useProfileStore()
                await profileStore.fetchProfile()
            }
        }

        loading.value = false
    }

    async function updateTransaction(id: string, updates: any) {
        loading.value = true
        error.value = null
        const { data, error: err } = await supabase
            .from('transactions')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (err) error.value = err.message
        else if (data) {
            const index = transactions.value.findIndex(t => t.id === id)
            if (index !== -1) transactions.value[index] = data

            const profileStore = useProfileStore()
            await profileStore.fetchProfile()
        }
        loading.value = false
    }

    async function deleteTransaction(id: string) {
        loading.value = true
        error.value = null
        const { error: err } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)

        if (err) error.value = err.message
        else {
            transactions.value = transactions.value.filter(t => t.id !== id)
            const profileStore = useProfileStore()
            await profileStore.fetchProfile()
        }
        loading.value = false
    }

    async function confirmTransaction(id: string) {
        await updateTransaction(id, { status: 'completed' })
    }

    return {
        transactions, loading, error,
        fetchTransactions, addTransaction, updateTransaction,
        deleteTransaction, confirmTransaction
    }
})

