import { createI18n } from 'vue-i18n'
import zh from './zh'
import en from './en'

const i18n = createI18n({
    legacy: false, // Use Composition API
    locale: localStorage.getItem('locale') || 'zh', // Restore user's choice saved by Header.vue
    fallbackLocale: 'en',
    messages: {
        zh,
        en
    }
})

export default i18n
