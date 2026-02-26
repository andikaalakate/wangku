import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
    const geminiApiKey = ref(localStorage.getItem('wangku-gemini-key') || import.meta.env.VITE_GEMINI_API_KEY || '')
    const termaiApiKey = ref(localStorage.getItem('wangku-termai-key') || '')

    watch(geminiApiKey, (newVal) => { localStorage.setItem('wangku-gemini-key', newVal) })
    watch(termaiApiKey, (newVal) => { localStorage.setItem('wangku-termai-key', newVal) })

    return { geminiApiKey, termaiApiKey }
})
