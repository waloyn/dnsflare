<template>
    <div v-if="isVisible" class="cert-info-container">
        <div class="cert-card-body" v-loading="isLoading">
            <!-- Header Info -->
            <div class="cert-header">
                <div class="cert-icon-box">
                    <FontAwesomeIcon icon="shield-halved" class="cert-icon" />
                </div>
                <div class="cert-header-text">
                    <h3 class="cert-title">{{ t('certInfo.title') }}</h3>
                    <p class="cert-desc">{{ t('certInfo.desc') }}</p>
                </div>
            </div>

            <!-- Current CA Display -->
            <div class="current-ca-box">
                <div class="ca-status-item">
                    <span class="label">{{ t('certInfo.certificateAuthority') }}:</span>
                    <div class="current-ca-badge">
                        <span class="status-dot active"></span>
                        <span class="ca-name">{{ CertificateAuthorityDisplay[certOwner] || certOwner || '-' }}</span>
                    </div>
                </div>
            </div>

            <!-- Modify CA Form -->
            <div class="ca-modify-section">
                <div class="form-row">
                    <el-select
                        v-model="newCertOwner"
                        :placeholder="t('certInfo.select')"
                        class="ca-select"
                        size="large"
                    >
                        <el-option
                            v-for="(label, value) in CertificateAuthorityDisplay"
                            :key="value"
                            :label="label"
                            :value="value"
                        >
                            <div class="ca-option">
                                <FontAwesomeIcon icon="lock" class="option-icon" />
                                <span>{{ label }}</span>
                            </div>
                        </el-option>
                    </el-select>

                    <el-button
                        type="primary"
                        size="large"
                        :loading="isLoading"
                        :disabled="newCertOwner === certOwner"
                        class="save-ca-btn"
                        @click="modifyCertAuthority"
                    >
                        {{ t('certInfo.modify') }}
                    </el-button>
                </div>
            </div>

            <!-- Info Note -->
            <div class="cert-notice">
                <FontAwesomeIcon icon="circle-info" class="notice-icon" />
                <span>变更 CA 机构后，Cloudflare 将在下一次证书轮换续期时自动签发新证书，期间现有证书不受影响。</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { getCertInfo, CertificateAuthorityDisplay, CertificateAuthority, patchCertAuthority } from '@/api/cert'
import { ElMessage } from 'element-plus'
import { getErrorMessage } from '@/utils/apiError'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps<{
    zoneId: string
}>()

const isLoading = ref(false)
const isVisible = ref(true)
const certOwner = ref('')
const newCertOwner = ref<CertificateAuthority>('lets_encrypt')
const { t } = useI18n()

async function loadInfo() {
    isLoading.value = true
    try {
        const info = await getCertInfo(props.zoneId)

        if (info.success && info.result) {
            certOwner.value = info.result.certificateAuthority
            newCertOwner.value = info.result.certificateAuthority
            isVisible.value = true
        } else {
            isVisible.value = false
        }
    } catch (err) {
        ElMessage.error(getErrorMessage(err))
        isVisible.value = false
    } finally {
        isLoading.value = false
    }
}

async function modifyCertAuthority() {
    isLoading.value = true
    try {
        const res = await patchCertAuthority(props.zoneId, newCertOwner.value)
        if (res.success) {
            ElMessage.success('证书颁发机构修改成功')
            await loadInfo()
        } else {
            ElMessage.error(`修改失败: ${res.errors?.[0]?.message ?? '未知错误'}`)
        }
    } finally {
        isLoading.value = false
    }
}

loadInfo()
</script>

<style lang="scss" scoped>
.cert-info-container {
    background-color: var(--app-card-bg);
    padding: 24px;
}

.cert-card-body {
    max-width: 680px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.cert-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;

    .cert-icon-box {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background-color: rgba(16, 185, 129, 0.1);
        color: #10b981;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
        border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .cert-header-text {
        .cert-title {
            font-size: 1.15rem;
            font-weight: 700;
            margin: 0;
            color: var(--el-text-color-primary);
        }

        .cert-desc {
            font-size: 13px;
            color: var(--el-text-color-secondary);
            margin: 4px 0 0;
            line-height: 1.5;
        }
    }
}

.current-ca-box {
    background-color: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
    padding: 14px 18px;
    border-radius: 10px;

    .ca-status-item {
        display: flex;
        align-items: center;
        gap: 12px;

        .label {
            font-size: 13px;
            color: var(--el-text-color-secondary);
            font-weight: 500;
        }

        .current-ca-badge {
            display: inline-flex;
            align-items: center;
            background-color: var(--app-card-bg);
            border: 1px solid var(--el-border-color);
            padding: 4px 12px;
            border-radius: 9999px;

            .ca-name {
                font-size: 13px;
                font-weight: 600;
                color: var(--el-text-color-primary);
            }
        }
    }
}

.ca-modify-section {
    .form-row {
        display: flex;
        align-items: center;
        gap: 12px;

        .ca-select {
            flex: 1;
        }

        .save-ca-btn {
            font-weight: 600;
            padding: 0 24px;
        }
    }
}

.ca-option {
    display: flex;
    align-items: center;
    gap: 8px;

    .option-icon {
        font-size: 12px;
        color: var(--el-text-color-placeholder);
    }
}

.cert-notice {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
    background-color: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-lighter);
    padding: 10px 14px;
    border-radius: 8px;

    .notice-icon {
        color: var(--el-color-primary);
        font-size: 14px;
        margin-top: 2px;
        flex-shrink: 0;
    }
}
</style>