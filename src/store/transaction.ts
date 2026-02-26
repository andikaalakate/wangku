import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'

export const useTransactionStore = defineStore('transaction', () => {
    const transactions = ref<any[]>([])
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

    async function addTransaction(payload: { title: string, amount: number, type: 'income' | 'expense', date: string }) {
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
                status: 'pending'
            }])
            .select()
            .single()

        if (err) error.value = err.message
        else if (data) transactions.value.push(data)

        loading.value = false
    }

    return { transactions, loading, error, fetchTransactions, addTransaction }
})
