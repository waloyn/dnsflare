<template>
    <el-header class="header-wrapper">
        <div class="container app-header">
            <!-- Logo Section -->
            <div class="header-left">
                <el-link :underline="false" href="https://github.com/Indexyz/Dnsflare" class="logo-link">
                    <FontAwesomeIcon icon="cloud" class="logo-icon" />
                    <span class="logo-text">{{ $t('app.title') }}</span>
                </el-link>
            </div>

            <!-- Right Actions Section -->
            <div class="header-right">
                <!-- Theme Switcher -->
                <el-dropdown trigger="click" @command="handleThemeCommand">
                    <span class="action-btn">
                        <FontAwesomeIcon :icon="currentThemeIcon" />
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="light">
                                <FontAwesomeIcon icon="sun" class="mr-2" /> {{ $t('theme.light') }}
                            </el-dropdown-item>
                            <el-dropdown-item command="dark">
                                <FontAwesomeIcon icon="moon" class="mr-2" /> {{ $t('theme.dark') }}
                            </el-dropdown-item>
                            <el-dropdown-item command="auto">
                                <FontAwesomeIcon icon="gear" class="mr-2" /> {{ $t('theme.auto') }}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>

                <!-- Language Switcher -->
                <el-dropdown trigger="click" @command="handleLangCommand">
                    <span class="action-btn">
                        <FontAwesomeIcon icon="globe-asia" />
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="zh">🇨🇳 {{ $t('language.zh') }}</el-dropdown-item>
                            <el-dropdown-item command="en">🇺🇸 {{ $t('language.en') }}</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>

                <!-- User/Login Section -->
                <template v-if="!displayLogout">
                    <el-button type="primary" round @click="router.push({ name: 'LoginPage' })">
                        {{ $t('app.login') }}
                    </el-button>
                </template>
                <el-dropdown v-else trigger="click" @command="handleUserCommand">
                    <span class="action-btn user-btn">
                        <FontAwesomeIcon icon="gear" />
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="logout" divided>
                                {{ $t('app.logout') }}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
    </el-header>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDark, useToggle } from '@vueuse/core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

// --- Theme Logic ---
const isDark = useDark()
const toggleDark = useToggle(isDark)

const currentThemeIcon = computed(() => isDark.value ? 'moon' : 'sun')

function handleThemeCommand(command: string) {
    if (command === 'auto') {
        // Simple auto logic: follow system preference reset
        // @vueuse/core useDark handles 'auto' by default if no storage value, 
        // but here we might want to explictly clear storage to revert to system
        localStorage.removeItem('vueuse-color-scheme')
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
        isDark.value = command === 'dark'
    }
}

// --- Language Logic ---
function handleLangCommand(command: string) {
    locale.value = command
    localStorage.setItem('locale', command)
}

// --- User Logic ---
const displayLogout = computed(() => {
    return route.name !== 'LoginPage'
})

function handleUserCommand(command: string) {
    if (command === 'logout') {
        userStore.logout()
        router.push({ name: 'LoginPage' })
    }
}
</script>

<style lang="scss" scoped>
.header-wrapper {
    /* Glassmorphism background */
    background-color: var(--el-bg-color-overlay);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--el-border-color-light);
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 0;
    transition: background-color 0.3s;
}

.app-header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.header-left {
    display: flex;
    align-items: center;

    .logo-link {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--el-text-color-primary);
        
        &:hover {
            color: var(--el-color-primary);
        }

        .logo-icon {
            font-size: 1.5rem;
            color: var(--el-color-primary);
        }
    }
}

.header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        cursor: pointer;
        color: var(--el-text-color-regular);
        transition: all 0.2s;

        &:hover {
            background-color: var(--el-fill-color);
            color: var(--el-color-primary);
        }
    }
    
    .mr-2 {
        margin-right: 8px;
    }
}
</style>
