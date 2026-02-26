import { supabase } from '@/lib/supabase'
import { useSettingsStore } from '@/store/settings'
import { useProfileStore } from '@/store/profile'
import { useAuthStore } from '@/store/auth'

export interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    text: string
    timestamp: Date
}

const TERMAI_URL = 'https://api.termai.cc'

export async function fetchChatHistory(userId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true })

    if (error) {
        console.error('Error fetching chat history:', error)
        return []
    }

    return data.map(m => ({
        id: m.id,
        role: m.role,
        text: m.text,
        timestamp: new Date(m.timestamp)
    }))
}

export async function saveChatMessage(userId: string, role: 'user' | 'assistant', text: string): Promise<void> {
    const { error } = await supabase
        .from('chat_messages')
        .insert({
            user_id: userId,
            role,
            text,
            timestamp: new Date().toISOString()
        })

    if (error) {
        console.error('Error saving chat message:', error)
    }
}

export async function resetChatSession(conversationId: string): Promise<boolean> {
    const settingsStore = useSettingsStore()
    const apiKey = settingsStore.termaiApiKey
    if (!apiKey) return false

    try {
        const res = await fetch(`${TERMAI_URL}/api/chat/logic-bell/reset?id=${conversationId}&key=${apiKey}`)
        const data = await res.json()
        return data.status === true
    } catch (e) {
        console.error('Error resetting chat:', e)
        return false
    }
}

export async function sendChatMessage(text: string, conversationId: string, financialContext?: {
    balance: number,
    upcomingTransactions: any[],
    recentTransactions: any[],
    wishlists: any[]
}): Promise<string> {
    const settingsStore = useSettingsStore()
    const profileStore = useProfileStore()
    const authStore = useAuthStore()

    const apiKey = settingsStore.termaiApiKey
    if (!apiKey) {
        return 'Silakan isi TerMai API Key di menu Profile untuk menggunakan AI Chat.'
    }

    const senderName = profileStore.name || authStore.user?.email?.split('@')[0] || 'Pengguna'

    let contextText = ''
    if (financialContext) {
        const txUpcomingText = financialContext.upcomingTransactions.length > 0
            ? financialContext.upcomingTransactions.map(t => `- ${t.title} (${t.type}): Rp${Number(t.amount).toLocaleString('id-ID')} pada ${new Date(t.date).toLocaleDateString('id-ID')}`).join('\n')
            : 'Tidak ada transaksi mendatang.'

        const txRecentText = financialContext.recentTransactions.length > 0
            ? financialContext.recentTransactions.map(t => `- ${t.title} (${t.type}): Rp${Number(t.amount).toLocaleString('id-ID')} (${new Date(t.date).toLocaleDateString('id-ID')})`).join('\n')
            : 'Belum ada transaksi tercatat.'

        const wlText = financialContext.wishlists.length > 0
            ? financialContext.wishlists.map(w => `- ${w.item_name}: Rp${Number(w.estimated_cost).toLocaleString('id-ID')}`).join('\n')
            : 'Belum ada wishlist.'

        contextText = `
Data Keuangan Pengguna Saat Ini:
- Saldo: Rp${financialContext.balance.toLocaleString('id-ID')}
- Transaksi Terakhir (Sudah Terjadi):
${txRecentText}
- Transaksi Mendatang (Pending):
${txUpcomingText}
- Wishlist:
${wlText}

Gunakan data di atas untuk menjawab jika pengguna bertanya tentang keuangan mereka.`
    }

    const body = {
        text,
        id: conversationId,
        fullainame: 'WangKu AI',
        nickainame: 'Wangi',
        senderName,
        ownerName: senderName,
        date: new Date().toISOString().split('T')[0], // Use ISO date for stability
        role: 'Asisten Keuangan',
        msgtype: 'text',
        custom_profile: `- Namamu adalah Wangi, asisten keuangan pintar dari aplikasi WangKu.
- Kamu membantu pengguna bernama ${senderName} untuk merencanakan keuangan, menganalisis pengeluaran, dan memberi saran finansial.
- Kamu menggunakan Bahasa Indonesia santai namun tetap profesional.
- Kamu paham tentang budgeting, investasi, menabung, dan manajemen utang.
- Kalau ditanya hal di luar keuangan, jawab singkat lalu arahkan kembali ke topik keuangan.
- Responsmu ringkas, jelas, dan memotivasi.

${contextText}

### MANDATORY ACTION RULES ###
If the user asks to record/add/save a transaction or wishlist, you MUST append a tag at the very END of your response.
Format:
@@ACTION:{"type": "ADD_TRANSACTION", "data": {"title": "...", "amount": 0, "type": "income", "date": "YYYY-MM-DD", "status": "completed"}}@@
OR
@@ACTION:{"type": "ADD_WISHLIST", "data": {"item_name": "...", "estimated_cost": 0, "priority": 1}}@@

Rules for Fields:
- "type" for transaction: MUST be "income" (for pemasukan/pendapatan) or "expense" (for pengeluaran/biaya). DO NOT use Indonesian.
- "date": MUST be YYYY-MM-DD.
- "status": use "completed" if it already happened, "pending" if it hasn't.
- Amount: Use numbers ONLY.

DO NOT forget the @@ACTION:...@@ tag if the user wants to record sesuatu. Ini penting untuk aplikasi.`
    }

    try {
        const res = await fetch(`${TERMAI_URL}/api/chat/logic-bell?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        const data = await res.json()
        console.log('TerMai Response:', data)

        if (data.status !== true) {
            return `Gagal: ${data.msg || data.message || data.error || JSON.stringify(data)}`
        }

        // Broad search for reply content
        const reply = data.data?.msg
            ?? data.data?.text
            ?? data.data?.content
            ?? data.msg
            ?? data.text
            ?? data.reply
            ?? data.message
            ?? data.result
            ?? (Object.keys(data.data || {}).length === 0 ? null : JSON.stringify(data.data))

        if (reply) return String(reply)

        if (data.status === true && (Object.keys(data.data || {}).length === 0)) {
            // If data is empty but status is true, it might be a transient error or session issue
            return "Wangi sedang berpikir, tapi tidak ada jawaban. Coba klik tombol Reset di pojok kanan atas layar chat ya."
        }

        return `Terjadi kesalahan respon dari AI: ${JSON.stringify(data)}`
    } catch (e: any) {
        if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
            return 'Gagal terhubung ke server TerMai. Pastikan API Key valid dan koneksi internet stabil.'
        }
        return `Error: ${e.message}`
    }
}
