<template>
    <el-header class="header-wrapper">
        <div class="container app-header">
            <!-- Logo Section -->
            <div class="header-left">
                <router-link :to="homeRoute" class="logo-link">
                    <div class="logo-badge">
                        <FontAwesomeIcon icon="cloud" class="logo-icon" />
                    </div>
                    <span class="logo-text">{{ $t('app.title') }}</span>
                    <span class="logo-tag">DNS</span>
                </router-link>
            </div>

            <!-- Right Actions Section -->
            <div class="header-right">
                <!-- GitHub Link -->
                <el-tooltip :content="$t('app.github')" placement="bottom">
                    <a
                        href="https://github.com/Indexyz/Dnsflare"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="action-btn"
                        aria-label="GitHub"
                    >
                        <svg class="github-icon" viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                        </svg>
                    </a>
                </el-tooltip>

                <!-- Theme Switcher -->
                <el-dropdown trigger="click" @command="handleThemeCommand">
                    <span class="action-btn" :title="$t('theme.placeholder')">
                        <FontAwesomeIcon :icon="currentThemeIcon" />
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu class="app-dropdown-menu">
                            <el-dropdown-item command="light" :class="{ 'is-active': activeTheme === 'light' }">
                                <FontAwesomeIcon icon="sun" class="item-icon" />
                                <span>{{ $t('theme.light') }}</span>
                                <FontAwesomeIcon v-if="activeTheme === 'light'" icon="check" class="check-icon" />
                            </el-dropdown-item>
                            <el-dropdown-item command="dark" :class="{ 'is-active': activeTheme === 'dark' }">
                                <FontAwesomeIcon icon="moon" class="item-icon" />
                                <span>{{ $t('theme.dark') }}</span>
                                <FontAwesomeIcon v-if="activeTheme === 'dark'" icon="check" class="check-icon" />
                            </el-dropdown-item>
                            <el-dropdown-item command="auto" :class="{ 'is-active': activeTheme === 'auto' }">
                                <FontAwesomeIcon icon="gear" class="item-icon" />
                                <span>{{ $t('theme.auto') }}</span>
                                <FontAwesomeIcon v-if="activeTheme === 'auto'" icon="check" class="check-icon" />
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>

                <!-- Language Switcher -->
                <el-dropdown trigger="click" @command="handleLangCommand">
                    <span class="action-btn" :title="$t('language.name')">
                        <FontAwesomeIcon icon="globe" />
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu class="app-dropdown-menu">
                            <el-dropdown-item command="zh" :class="{ 'is-active': locale === 'zh' }">
                                <span class="flag-icon">🇨🇳</span>
                                <span>{{ $t('language.zh') }}</span>
                                <FontAwesomeIcon v-if="locale === 'zh'" icon="check" class="check-icon" />
                            </el-dropdown-item>
                            <el-dropdown-item command="en" :class="{ 'is-active': locale === 'en' }">
                                <span class="flag-icon">🇺🇸</span>
                                <span>{{ $t('language.en') }}</span>
                                <FontAwesomeIcon v-if="locale === 'en'" icon="check" class="check-icon" />
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>

                <!-- User/Login Section -->
                <template v-if="!isLoggedIn">
                    <el-button type="primary" size="default" @click="router.push({ name: 'LoginPage' })">
                        {{ $t('app.login') }}
                    </el-button>
                </template>
                <el-dropdown v-else trigger="click" @command="handleUserCommand">
                    <div class="user-chip">
                        <span class="status-indicator"></span>
                        <FontAwesomeIcon :icon="userStore.type === 'token' ? 'key' : 'envelope'" class="user-chip-icon" />
                        <span class="user-chip-name">{{ userDisplayName }}</span>
                        <FontAwesomeIcon icon="gear" class="user-chip-caret" />
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu class="app-dropdown-menu">
                            <div class="user-menu-header">
                                <div class="user-menu-type">{{ userStore.type === 'token' ? 'API Token' : 'Global API Key' }}</div>
                                <div class="user-menu-detail">{{ userFullDisplay }}</div>
                            </div>
                            <el-dropdown-item command="zones">
                                <FontAwesomeIcon icon="layer-group" class="item-icon" />
                                <span>{{ $t('zoneList.title') }}</span>
                            </el-dropdown-item>
                            <el-dropdown-item divided command="logout" class="danger-item">
                                <FontAwesomeIcon icon="right-from-bracket" class="item-icon" />
                                <span>{{ $t('app.logout') }}</span>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
    </el-header>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDark } from '@vueuse/core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const userStore = useUserStore()
const router = useRouter()
const { locale } = useI18n()

// --- Theme Logic ---
const isDark = useDark()
const storedTheme = localStorage.getItem('vueuse-color-scheme')
const activeTheme = ref<'light' | 'dark' | 'auto'>(storedTheme === 'dark' ? 'dark' : storedTheme === 'light' ? 'light' : 'auto')

const currentThemeIcon = computed(() => (isDark.value ? 'moon' : 'sun'))

function handleThemeCommand(command: string) {
    if (command === 'auto') {
        activeTheme.value = 'auto'
        localStorage.removeItem('vueuse-color-scheme')
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
        activeTheme.value = command as 'light' | 'dark'
        isDark.value = command === 'dark'
    }
}

// --- Language Logic ---
function handleLangCommand(command: string) {
    locale.value = command
    localStorage.setItem('locale', command)
}

// --- User Logic ---
const isLoggedIn = computed(() => {
    return Boolean(userStore.token || userStore.globalToken)
})

const homeRoute = computed(() => {
    return isLoggedIn.value ? { name: 'ZoneList' } : { name: 'LoginPage' }
})

const userDisplayName = computed(() => {
    if (userStore.email) {
        return userStore.email.split('@')[0]
    }
    if (userStore.token) {
        return `Token (${userStore.token.slice(0, 4)}...${userStore.token.slice(-4)})`
    }
    return 'Cloudflare User'
})

const userFullDisplay = computed(() => {
    if (userStore.email) {
        return userStore.email
    }
    if (userStore.token) {
        return `${userStore.token.slice(0, 6)}...${userStore.token.slice(-4)}`
    }
    return ''
})

function handleUserCommand(command: string) {
    if (command === 'logout') {
        userStore.logout()
        router.push({ name: 'LoginPage' })
    } else if (command === 'zones') {
        router.push({ name: 'ZoneList' })
    }
}
</script>

<style lang="scss" scoped>
.header-wrapper {
    background-color: var(--el-bg-color-overlay);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--el-border-color-lighter);
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 0;
    transition: background-color 0.25s ease, border-color 0.25s ease;
}

.app-header {
    height: 64px;
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
        text-decoration: none;
        color: var(--el-text-color-primary);
        transition: transform 0.2s ease;

        &:hover {
            transform: translateY(-1px);
        }

        .logo-badge {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: linear-gradient(135deg, #f6821f 0%, #fa9b47 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            box-shadow: 0 4px 10px -2px rgba(246, 130, 31, 0.4);

            .logo-icon {
                font-size: 1.15rem;
            }
        }

        .logo-text {
            font-size: 1.25rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            background: linear-gradient(135deg, var(--el-text-color-primary) 60%, var(--el-color-primary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .logo-tag {
            font-size: 10px;
            font-weight: 700;
            background-color: rgba(246, 130, 31, 0.12);
            color: #f6821f;
            padding: 2px 6px;
            border-radius: 6px;
            letter-spacing: 0.05em;
        }
    }
}

.header-right {
    display: flex;
    align-items: center;
    gap: 10px;

    .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: 9px;
        cursor: pointer;
        color: var(--el-text-color-regular);
        text-decoration: none;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid transparent;

        &:hover {
            background-color: var(--el-fill-color-light);
            color: var(--el-color-primary);
            border-color: var(--el-border-color-lighter);
        }

        .github-icon {
            display: block;
        }
    }

    .user-chip {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 9999px;
        background-color: var(--el-fill-color-light);
        border: 1px solid var(--el-border-color-lighter);
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        transition: all 0.2s ease;

        &:hover {
            border-color: var(--el-color-primary-light-5);
            background-color: var(--el-fill-color);
        }

        .status-indicator {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background-color: #10b981;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }

        .user-chip-icon {
            color: var(--el-color-primary);
            font-size: 12px;
        }

        .user-chip-name {
            max-width: 140px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .user-chip-caret {
            font-size: 11px;
            color: var(--el-text-color-secondary);
        }
    }
}

.app-dropdown-menu {
    min-width: 180px;

    .user-menu-header {
        padding: 10px 16px 8px;
        border-bottom: 1px solid var(--el-border-color-lighter);
        margin-bottom: 4px;

        .user-menu-type {
            font-size: 11px;
            font-weight: 600;
            color: var(--el-color-primary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .user-menu-detail {
            font-size: 13px;
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin-top: 2px;
            word-break: break-all;
        }
    }

    .item-icon {
        width: 14px;
        margin-right: 8px;
        color: var(--el-text-color-secondary);
    }

    .flag-icon {
        margin-right: 8px;
        font-size: 14px;
    }

    .check-icon {
        margin-left: auto;
        color: var(--el-color-primary);
        font-size: 12px;
    }

    .is-active {
        color: var(--el-color-primary);
        font-weight: 600;
    }

    .danger-item {
        color: var(--el-color-danger) !important;

        .item-icon {
            color: var(--el-color-danger) !important;
        }

        &:hover {
            background-color: var(--el-color-danger-light-9) !important;
        }
    }
}
</style>