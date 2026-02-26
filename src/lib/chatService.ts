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

export async function sendChatMessage(text: string, conversationId: string): Promise<string> {
    const settingsStore = useSettingsStore()
    const profileStore = useProfileStore()
    const authStore = useAuthStore()

    const apiKey = settingsStore.termaiApiKey
    if (!apiKey) {
        return 'Silakan isi TerMai API Key di menu Profile untuk menggunakan AI Chat.'
    }

    const senderName = profileStore.name || authStore.user?.email?.split('@')[0] || 'Pengguna'

    const body = {
        text,
        id: conversationId,
        fullainame: 'WangKu Assistant',
        nickainame: 'Wangi',
        senderName,
        ownerName: senderName,
        date: new Date(),
        role: 'Asisten Keuangan Pribadi',
        msgtype: 'text',
        custom_profile: `- Namamu adalah Wangi, asisten keuangan pintar dari aplikasi WangKu.
- Kamu membantu pengguna bernama ${senderName} untuk merencanakan keuangan, menganalisis pengeluaran, dan memberi saran finansial.
- Kamu menggunakan Bahasa Indonesia santai namun tetap profesional.
- Kamu paham tentang budgeting, investasi, menabung, dan manajemen utang.
- Kalau ditanya hal di luar keuangan, jawab singkat lalu arahkan kembali ke topik keuangan.
- Responsmu ringkas, jelas, dan memotivasi.`
    }

    try {
        const res = await fetch(`${TERMAI_URL}/api/chat/logic-bell?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        const data = await res.json()

        // Try all possible response fields
        if (!data.status && data.status !== true) {
            return `Gagal: ${data.msg || data.message || data.error || JSON.stringify(data)}`
        }

        // API returns { status: true, data: { msg: '...', energy: '...' } }
        const reply = data.data?.msg
            ?? data.result
            ?? data.reply
            ?? data.text
            ?? data.message
            ?? data.msg
            ?? data.content
            ?? data.answer
        if (reply) return String(reply)

        return `Response tidak dikenali: ${JSON.stringify(data)}`
    } catch (e: any) {
        if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
            return 'Gagal terhubung ke server TerMai. Pastikan API Key valid dan koneksi internet stabil.'
        }
        return `Error: ${e.message}`
    }
}
