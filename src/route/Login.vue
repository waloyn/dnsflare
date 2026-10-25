<template>
    <div class="login-wrapper">
        <el-card class="login-card">
            <!-- Brand Hero Header -->
            <div class="login-header">
                <div class="login-logo-badge">
                    <FontAwesomeIcon icon="cloud" class="login-logo-icon" />
                </div>
                <h1 class="login-title">{{ t('app.title') }}</h1>
                <p class="login-subtitle">{{ t('app.subtitle') }}</p>
            </div>

            <!-- If Already Logged In Banner -->
            <div v-if="alreadyLoggedIn" class="already-logged-in-box">
                <div class="logged-in-status">
                    <span class="status-dot active"></span>
                    <span class="logged-in-text">{{ t('app.alreadyLoggedIn') }}</span>
                </div>
                <div class="user-preview">
                    {{ currentAccountDisplay }}
                </div>
                <div class="logged-in-actions">
                    <el-button type="primary" size="large" class="enter-btn" @click="goToDashboard">
                        {{ t('app.enterDashboard') }}
                    </el-button>
                    <el-button text @click="handleSwitchAccount">
                        {{ t('app.logout') }}
                    </el-button>
                </div>
            </div>

            <!-- Login Tabs Form -->
            <div v-else>
                <el-tabs v-model="activeTab" class="login-tabs" stretch>
                    <!-- Tab 1: API Token -->
                    <el-tab-pane name="token">
                        <template #label>
                            <span class="tab-label">
                                <FontAwesomeIcon icon="key" class="tab-icon" />
                                <span>{{ t('app.apiTokenTab') }}</span>
                            </span>
                        </template>

                        <div class="tab-content">
                            <div class="form-hint">
                                <span>{{ t('app.tokenHint') }}</span>
                                <a
                                    href="https://dash.cloudflare.com/profile/api-tokens"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="hint-link"
                                >
                                    {{ t('app.openCloudflare') }}
                                    <FontAwesomeIcon icon="arrow-up-right-from-square" class="external-icon" />
                                </a>
                            </div>

                            <el-form label-position="top" @submit.prevent="submit">
                                <el-form-item :label="t('app.token')">
                                    <el-input
                                        v-model="model.token"
                                        type="password"
                                        show-password
                                        clearable
                                        :placeholder="t('app.tokenPlaceholder')"
                                        size="large"
                                    >
                                        <template #prefix>
                                            <FontAwesomeIcon icon="key" class="input-icon" />
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-form>
                        </div>
                    </el-tab-pane>

                    <!-- Tab 2: Global API Key -->
                    <el-tab-pane name="globalKey">
                        <template #label>
                            <span class="tab-label">
                                <FontAwesomeIcon icon="lock" class="tab-icon" />
                                <span>{{ t('app.globalKeyTab') }}</span>
                            </span>
                        </template>

                        <div class="tab-content">
                            <div class="form-hint">
                                <span>{{ t('app.globalKeyHint') }}</span>
                                <a
                                    href="https://dash.cloudflare.com/profile/api-tokens"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="hint-link"
                                >
                                    {{ t('app.openCloudflare') }}
                                    <FontAwesomeIcon icon="arrow-up-right-from-square" class="external-icon" />
                                </a>
                            </div>

                            <el-form label-position="top" @submit.prevent="submit">
                                <el-form-item :label="t('app.email')">
                                    <el-input
                                        v-model="model.email"
                                        type="email"
                                        clearable
                                        :placeholder="t('app.emailPlaceholder')"
                                        size="large"
                                    >
                                        <template #prefix>
                                            <FontAwesomeIcon icon="envelope" class="input-icon" />
                                        </template>
                                    </el-input>
                                </el-form-item>

                                <el-form-item :label="t('app.globalToken')">
                                    <el-input
                                        v-model="model.globalToken"
                                        type="password"
                                        show-password
                                        clearable
                                        :placeholder="t('app.globalTokenPlaceholder')"
                                        size="large"
                                    >
                                        <template #prefix>
                                            <FontAwesomeIcon icon="key" class="input-icon" />
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-form>
                        </div>
                    </el-tab-pane>
                </el-tabs>

                <!-- Options & Submit -->
                <div class="form-options">
                    <el-checkbox v-model="model.save" class="save-checkbox">
                        {{ t('app.save') }}
                    </el-checkbox>
                    <el-button text size="small" @click="reset">
                        {{ t('app.reset') }}
                    </el-button>
                </div>

                <div class="submit-section">
                    <el-button
                        type="primary"
                        size="large"
                        class="submit-btn"
                        :loading="isLoading"
                        @click="submit"
                    >
                        {{ t('app.submit') }}
                    </el-button>
                </div>

                <div class="security-note">
                    <FontAwesomeIcon icon="shield-halved" class="shield-icon" />
                    <span>{{ t('app.securityNote') }}</span>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { userTokenVerify, userEmailVerify } from '@/api/account'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const model = reactive({
    token: '',
    save: false,
    email: '',
    globalToken: '',
})

const isLoading = ref(false)
const activeTab = ref<'token' | 'globalKey'>('token')

// Initialize form from store
model.token = userStore.token
model.save = userStore.saveToken
model.email = userStore.email
model.globalToken = userStore.globalToken

if (userStore.type === 'email' || (userStore.email && !userStore.token)) {
    activeTab.value = 'globalKey'
}

const alreadyLoggedIn = computed(() => {
    return Boolean(userStore.token || (userStore.email && userStore.globalToken))
})

const currentAccountDisplay = computed(() => {
    if (userStore.email) {
        return userStore.email
    }
    if (userStore.token) {
        return `API Token: ${userStore.token.slice(0, 6)}...${userStore.token.slice(-4)}`
    }
    return ''
})

if (model.save && !alreadyLoggedIn.value) {
    submit()
}

function goToDashboard() {
    router.push({ name: 'ZoneList' })
}

function handleSwitchAccount() {
    userStore.logout()
    reset()
}

function onLoginSuccessful() {
    ElMessage.success(t('zoneList.title') + ' - 验证成功，即将进入')
    setTimeout(() => {
        router.push({ name: 'ZoneList' })
    }, 600)
}

async function submit() {
    isLoading.value = true

    try {
        if (activeTab.value === 'token') {
            if (!model.token.trim()) {
                ElMessage.warning('请输入 API Token')
                isLoading.value = false
                return
            }

            const status = await userTokenVerify(model.token.trim())
            if (status) {
                userStore.loginByToken({
                    save: model.save,
                    token: model.token.trim(),
                })
                onLoginSuccessful()
            } else {
                ElMessage.error('API Token 无效或无权访问，请检查权限')
            }
        } else {
            if (!model.email.trim() || !model.globalToken.trim()) {
                ElMessage.warning('请输入邮箱地址与 Global API Key')
                isLoading.value = false
                return
            }

            const status = await userEmailVerify(model.email.trim(), model.globalToken.trim())
            if (status) {
                userStore.loginByEmail({
                    save: model.save,
                    email: model.email.trim(),
                    globalToken: model.globalToken.trim(),
                })
                onLoginSuccessful()
            } else {
                ElMessage.error('邮箱或 Global API Key 错误')
            }
        }
    } catch {
        ElMessage.error('登录请求异常，请检查网络或凭证')
    } finally {
        isLoading.value = false
    }
}

function reset() {
    model.token = ''
    model.email = ''
    model.globalToken = ''
    model.save = false
}
</script>

<style lang="scss" scoped>
.login-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 180px);
    padding: 20px 0;
}

.login-card {
    width: 100%;
    max-width: 480px;
    border-radius: 16px !important;
    overflow: hidden;
    box-shadow: var(--app-card-shadow-hover) !important;
    border: 1px solid var(--app-card-border) !important;
    background-color: var(--app-card-bg) !important;
}

.login-header {
    text-align: center;
    padding: 10px 0 20px;

    .login-logo-badge {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: linear-gradient(135deg, #f6821f 0%, #fa9b47 100%);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        box-shadow: 0 8px 16px -4px rgba(246, 130, 31, 0.45);
        margin-bottom: 12px;

        .login-logo-icon {
            font-size: 1.75rem;
        }
    }

    .login-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
        color: var(--el-text-color-primary);
        letter-spacing: -0.02em;
    }

    .login-subtitle {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        margin: 6px 0 0;
    }
}

.already-logged-in-box {
    text-align: center;
    padding: 20px 10px 10px;

    .logged-in-status {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 500;
        color: var(--el-text-color-regular);
        margin-bottom: 8px;
    }

    .user-preview {
        font-size: 15px;
        font-weight: 600;
        color: var(--el-color-primary);
        word-break: break-all;
        background-color: var(--el-fill-color-light);
        padding: 10px 16px;
        border-radius: 8px;
        margin-bottom: 20px;
        border: 1px solid var(--el-border-color-lighter);
    }

    .logged-in-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .enter-btn {
            width: 100%;
        }
    }
}

.login-tabs {
    :deep(.el-tabs__header) {
        margin-bottom: 16px;
    }

    :deep(.el-tabs__nav-wrap::after) {
        height: 1px;
    }

    .tab-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 500;

        .tab-icon {
            font-size: 12px;
        }
    }
}

.tab-content {
    padding-top: 4px;
}

.form-hint {
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
    background-color: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
    padding: 8px 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .hint-link {
        color: var(--el-color-primary);
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-weight: 500;

        &:hover {
            text-decoration: underline;
        }

        .external-icon {
            font-size: 10px;
        }
    }
}

.input-icon {
    color: var(--el-text-color-placeholder);
    font-size: 13px;
}

.form-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 6px;
    margin-bottom: 16px;
}

.submit-section {
    .submit-btn {
        width: 100%;
        font-size: 15px;
        font-weight: 600;
        height: 44px;
    }
}

.security-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 18px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-align: center;
    line-height: 1.4;

    .shield-icon {
        color: #10b981;
        font-size: 13px;
        flex-shrink: 0;
    }
}
</style>