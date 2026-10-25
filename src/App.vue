<template>
    <el-config-provider :locale="elementLocale">
        <div class="app-layout">
            <AppHeader />
            <el-main class="container main-content">
                <router-view v-slot="{ Component }">
                    <transition name="fade-slide" mode="out-in">
                        <Suspense>
                            <component :is="Component" />
                        </Suspense>
                    </transition>
                </router-view>
            </el-main>
            <footer class="app-footer">
                <div class="container footer-content">
                    <span>Dnsflare &copy; {{ currentYear }} · Fast Cloudflare DNS Manager</span>
                    <a href="https://github.com/Indexyz/Dnsflare" target="_blank" rel="noopener noreferrer" class="footer-link">
                        GitHub
                    </a>
                </div>
            </footer>
        </div>
    </el-config-provider>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import enUs from 'element-plus/es/locale/lang/en'
import AppHeader from '@/components/Header.vue'

const { locale } = useI18n()
const elementLocale = computed(() => (locale.value === 'en' ? enUs : zhCn))
const currentYear = new Date().getFullYear()
</script>

<style lang="scss">
.app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--el-bg-color-page, var(--el-bg-color));
    color: var(--el-text-color-primary);
    background-image: 
        radial-gradient(at 0% 0%, rgba(246, 130, 31, 0.04) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.04) 0px, transparent 50%);
    background-attachment: fixed;
}

.main-content {
    flex: 1;
    padding-top: 1.5rem !important;
    padding-bottom: 2.5rem !important;
}

.app-footer {
    border-top: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-bg-color-overlay);
    padding: 16px 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);

    .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        @media (max-width: 600px) {
            flex-direction: column;
            gap: 8px;
            text-align: center;
        }
    }

    .footer-link {
        color: var(--el-text-color-secondary);
        text-decoration: none;
        transition: color 0.2s;

        &:hover {
            color: var(--el-color-primary);
        }
    }
}

/* Page transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(6px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>
