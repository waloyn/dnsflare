import { defineStore } from 'pinia'


type LoginType = 'token' | 'email'
type UserStoreState = {
    token: string
    saveToken: boolean

    email: string
    globalToken: string

    type: LoginType
}

// Credentials persist to localStorage only when the user enabled "save credentials";
// otherwise they stay in sessionStorage and are gone once the tab closes.
const credentialStorage = {
    getItem(key: string): string | null {
        return localStorage.getItem(key) ?? sessionStorage.getItem(key)
    },

    setItem(key: string, value: string): void {
        let saveToken = false
        try {
            saveToken = JSON.parse(value)?.saveToken === true
        } catch {
            saveToken = false
        }

        if (saveToken) {
            sessionStorage.removeItem(key)
            localStorage.setItem(key, value)
        } else {
            localStorage.removeItem(key)
            sessionStorage.setItem(key, value)
        }
    },

    removeItem(key: string): void {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
    },
} as Storage

export const useUserStore = defineStore('user', {
    state: (): UserStoreState => {
        return {
            token: '',
            saveToken: false,
            email: '',
            globalToken: '',
            type: 'token'
        }
    },

    persist: {
        storage: credentialStorage,
    },

    actions: {
        setToken(token: string) {
            this.token = token
        },

        setSaveState(save: boolean) {
            this.saveToken = save
        },

        setEmail(email: string) {
            this.email = email
        },

        setGlobalToken(global: string) {
            this.globalToken = global
        },

        setLoginType(type: LoginType) {
            this.type = type
        },

        logout() {
            this.token = ''
            this.email = ''
            this.globalToken = ''
            this.saveToken = false
        },

        loginByToken(document: { save: boolean, token: string }) {
            this.setToken(document.token)
            this.setSaveState(document.save)
            this.setEmail('')
            this.setGlobalToken('')
            this.setLoginType('token')
        },

        loginByEmail(document: { save: boolean, email: string, globalToken: string }) {
            this.setEmail(document.email)
            this.setToken('')
            this.setSaveState(document.save)
            this.setGlobalToken(document.globalToken)
            this.setLoginType('email')
        }
    }
})
