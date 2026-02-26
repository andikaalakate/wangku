import { useSettingsStore } from '@/store/settings'

export async function generateFinancialSummary(balance: number, upcomingTransactions: any[], wishlists: any[]) {
    const settingsStore = useSettingsStore()
    const apiKey = settingsStore.geminiApiKey

    if (!apiKey) {
        return `<p class="text-sm">Silakan isi <strong>Gemini API Key</strong> di menu <a href="/profile" class="text-primary underline">Profile</a> untuk mengaktifkan AI Assistant.</p>`
    }

    const txText = upcomingTransactions.length > 0
        ? upcomingTransactions.map(t => `- ${t.title} (${t.type}): Rp${Number(t.amount).toLocaleString('id-ID')} pada ${new Date(t.date).toLocaleDateString('id-ID')}`).join('\\n')
        : 'Tidak ada transaksi mendatang.'

    const wlText = wishlists.length > 0
        ? wishlists.map(w => `- ${w.item_name}: Rp${Number(w.estimated_cost).toLocaleString('id-ID')}`).join('\\n')
        : 'Belum ada wishlist.'

    const promptText = `
Kamu adalah asisten keuangan pintar di dalam aplikasi "WangKu". 
Tugasmu adalah memberikan ringkasan keuangan dan saran yang sangat ringkas, memotivasi, dan logis.

Data Keuangan Pengguna Saat Ini:
- Saldo: Rp${balance.toLocaleString('id-ID')}
- Transaksi Mendatang:
${txText}
- Wishlist:
${wlText}

Panduan Balasan:
1. Gunakan Bahasa Indonesia bergaya santai tapi profesional.
2. Analisis apakah saldo saat ini cukup untuk membayar tagihan mendatang. Beri saran alokasi dana jika tidak cukup.
3. Beri pandangan sekilas apakah wishlist masuk akal dibeli bulan ini.
4. Output berformat HTML mentah, langsung gunakan tag <p>, <strong>, <ul>, atau <li> untuk merapikan teks.
5. JANGAN membalut teks dengan \`\`\`html ... \`\`\`. Langsung output tag HTML.
    `.trim()

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: promptText }]
                }]
            })
        })

        if (!response.ok) {
            console.error('Gemini API Error:', await response.text())
            return `<p class="text-destructive">Gagal menghubungi Gemini API. Coba lagi atau cek API Key-mu.</p>`
        }

        const data = await response.json()
        let resultHtml = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

        // Cleanup markdown blocks if AI accidentally adds them
        resultHtml = resultHtml.replace(/```html\n/, '').replace(/\n```/g, '').trim()

        return resultHtml
    } catch (e: any) {
        console.error('Request Error:', e)
        return `<p class="text-destructive">Terjadi kesalahan pada AI Service: ${e.message || e}</p>`
    }
}
