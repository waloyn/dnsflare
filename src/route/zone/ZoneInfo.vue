<template>
    <div class="zone-info-page">
        <!-- Breadcrumb Navigation -->
        <el-breadcrumb separator="/" class="app-breadcrumb">
            <el-breadcrumb-item :to="{ name: 'ZoneList' }">
                <FontAwesomeIcon icon="cloud" class="breadcrumb-icon" />
                {{ t('app.title') }}
            </el-breadcrumb-item>
            <el-breadcrumb-item :to="{ name: 'ZoneList' }">
                {{ t('zoneList.title') }}
            </el-breadcrumb-item>
            <el-breadcrumb-item>
                {{ zoneName }}
            </el-breadcrumb-item>
        </el-breadcrumb>

        <!-- Domain Hero Banner -->
        <div class="domain-hero-banner">
            <div class="hero-left">
                <el-button class="back-btn" @click="router.push({ name: 'ZoneList' })">
                    <FontAwesomeIcon icon="arrow-left" class="btn-icon" />
                    <span>{{ t('recordList.backToZones') }}</span>
                </el-button>
                <div class="domain-title-wrapper">
                    <div class="domain-icon-box">
                        <FontAwesomeIcon icon="globe" class="domain-icon" />
                    </div>
                    <div class="domain-header-texts">
                        <div class="domain-title-row">
                            <h2 class="domain-title">{{ zoneName }}</h2>
                            <span class="active-badge">
                                <span class="status-dot active"></span>
                                Active
                            </span>
                        </div>
                        <div class="zone-id-row">
                            <span class="zone-id-label">{{ t('recordList.zoneIdLabel') }}:</span>
                            <code class="zone-id-code">{{ zoneId }}</code>
                            <el-tooltip :content="t('app.copied')" trigger="hover" :visible="copiedZoneId">
                                <button class="copy-zone-btn" @click="copyZoneId">
                                    <FontAwesomeIcon :icon="copiedZoneId ? 'check' : 'copy'" />
                                    <span>{{ t('recordList.copyZoneId') }}</span>
                                </button>
                            </el-tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section Tabs (DNS Records & SSL/TLS Certificate) -->
        <el-tabs v-model="activeTab" class="zone-tabs" type="border-card">
            <el-tab-pane name="dns">
                <template #label>
                    <span class="tab-label">
                        <FontAwesomeIcon icon="server" class="tab-icon" />
                        <span>{{ t('recordList.tabDns') }}</span>
                    </span>
                </template>
                <ZoneRecordList :zoneId="zoneId" :zoneName="zoneName" />
            </el-tab-pane>

            <el-tab-pane name="ssl">
                <template #label>
                    <span class="tab-label">
                        <FontAwesomeIcon icon="shield-halved" class="tab-icon" />
                        <span>{{ t('recordList.tabSsl') }}</span>
                    </span>
                </template>
                <CertInfo :zoneId="zoneId" />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ZoneRecordList from './record/List.vue'
import CertInfo from './CertInfo.vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const activeTab = ref('dns')
const copiedZoneId = ref(false)

const zoneId = computed(() => {
    const { id } = route.params
    return id as string
})

const zoneName = computed(() => {
    const { name } = route.params
    return name as string
})

function copyZoneId() {
    navigator.clipboard.writeText(zoneId.value).then(() => {
        copiedZoneId.value = true
        ElMessage.success(t('app.copied'))
        setTimeout(() => {
            copiedZoneId.value = false
        }, 1500)
    })
}
</script>

<style lang="scss" scoped>
.zone-info-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.app-breadcrumb {
    font-size: 13px;
    margin-bottom: 2px;

    .breadcrumb-icon {
        color: var(--el-color-primary);
        margin-right: 6px;
    }
}

.domain-hero-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--app-card-bg);
    border: 1px solid var(--app-card-border);
    box-shadow: var(--app-card-shadow);
    border-radius: 14px;
    padding: 18px 24px;
    flex-wrap: wrap;
    gap: 16px;

    .hero-left {
        display: flex;
        align-items: center;
        gap: 18px;
        flex-wrap: wrap;

        .back-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            border-radius: 8px;

            .btn-icon {
                font-size: 12px;
            }
        }

        .domain-title-wrapper {
            display: flex;
            align-items: center;
            gap: 14px;

            .domain-icon-box {
                width: 44px;
                height: 44px;
                border-radius: 12px;
                background: linear-gradient(135deg, rgba(246, 130, 31, 0.15) 0%, rgba(246, 130, 31, 0.05) 100%);
                color: var(--el-color-primary);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                border: 1px solid rgba(246, 130, 31, 0.2);
            }

            .domain-header-texts {
                display: flex;
                flex-direction: column;
                gap: 4px;

                .domain-title-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    .domain-title {
                        font-size: 1.35rem;
                        font-weight: 700;
                        margin: 0;
                        color: var(--el-text-color-primary);
                        letter-spacing: -0.01em;
                    }

                    .active-badge {
                        display: inline-flex;
                        align-items: center;
                        font-size: 12px;
                        font-weight: 600;
                        color: #10b981;
                        background-color: rgba(16, 185, 129, 0.1);
                        border: 1px solid rgba(16, 185, 129, 0.2);
                        padding: 2px 8px;
                        border-radius: 9999px;
                    }
                }

                .zone-id-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: var(--el-text-color-secondary);

                    .zone-id-label {
                        font-weight: 500;
                    }

                    .zone-id-code {
                        background-color: var(--el-fill-color-light);
                        border: 1px solid var(--el-border-color-lighter);
                        padding: 1px 6px;
                        border-radius: 4px;
                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                        font-size: 11px;
                        color: var(--el-text-color-primary);
                    }

                    .copy-zone-btn {
                        background: none;
                        border: none;
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                        color: var(--el-color-primary);
                        font-size: 11px;
                        cursor: pointer;
                        padding: 2px 6px;
                        border-radius: 4px;
                        transition: background-color 0.2s;

                        &:hover {
                            background-color: var(--el-fill-color);
                        }
                    }
                }
            }
        }
    }
}

.zone-tabs {
    border-radius: 14px !important;
    overflow: hidden;
    border: 1px solid var(--app-card-border) !important;
    box-shadow: var(--app-card-shadow) !important;
    background-color: var(--app-card-bg) !important;

    :deep(.el-tabs__header) {
        background-color: var(--el-fill-color-light);
        border-bottom: 1px solid var(--el-border-color-lighter);
        margin: 0;

        .el-tabs__item {
            height: 48px;
            line-height: 48px;
            font-size: 14px;
            font-weight: 600;
            color: var(--el-text-color-regular);
            border-right: 1px solid var(--el-border-color-lighter);
            transition: all 0.2s ease;

            &.is-active {
                background-color: var(--app-card-bg);
                color: var(--el-color-primary);
                border-bottom-color: var(--app-card-bg);
            }
        }
    }

    :deep(.el-tabs__content) {
        padding: 0;
    }

    .tab-label {
        display: inline-flex;
        align-items: center;
        gap: 8px;

        .tab-icon {
            font-size: 14px;
        }
    }
}
</style>