<template>
    <div class="zone-list-page">
        <!-- Breadcrumb Header -->
        <el-breadcrumb separator="/" class="app-breadcrumb">
            <el-breadcrumb-item>
                <FontAwesomeIcon icon="cloud" class="breadcrumb-icon" />
                {{ t('app.title') }}
            </el-breadcrumb-item>
            <el-breadcrumb-item>
                {{ t('zoneList.title') }}
            </el-breadcrumb-item>
        </el-breadcrumb>

        <!-- Main Card Container -->
        <el-card class="zone-card" :body-style="{ padding: '0px' }">
            <!-- Card Header Toolbar -->
            <template #header>
                <div class="zone-toolbar">
                    <div class="toolbar-title-group">
                        <div class="title-row">
                            <span class="toolbar-title">{{ t('zoneList.title') }}</span>
                            <span v-if="pageInfo.total > 0" class="zone-count-badge">
                                {{ t('zoneList.totalCount', { count: pageInfo.total }) }}
                            </span>
                        </div>
                        <span class="toolbar-subtitle">{{ t('zoneList.subtitle') }}</span>
                    </div>

                    <div class="toolbar-actions">
                        <el-input
                            v-model="filterList"
                            clearable
                            :placeholder="t('zoneList.search')"
                            class="search-input"
                            @input="updateFilter"
                        >
                            <template #prefix>
                                <FontAwesomeIcon icon="magnifying-glass" class="search-icon" />
                            </template>
                        </el-input>

                        <el-button
                            :loading="isLoading"
                            class="refresh-btn"
                            @click="refreshList"
                        >
                            <FontAwesomeIcon icon="rotate-right" :spin="isLoading" class="btn-icon" />
                            <span>{{ t('zoneList.refresh') }}</span>
                        </el-button>
                    </div>
                </div>
            </template>

            <!-- Zones Table -->
            <el-table
                v-loading="isLoading"
                :data="filterTableData"
                class="zone-table"
                row-class-name="zone-table-row"
            >
                <template #empty>
                    <el-empty :description="t('zoneList.empty')">
                        <el-button v-if="filterList" text type="primary" @click="filterList = ''">
                            {{ t('app.reset') }}
                        </el-button>
                    </el-empty>
                </template>

                <!-- Domain Column -->
                <el-table-column
                    prop="name"
                    :label="t('zoneList.domain')"
                    min-width="220"
                >
                    <template #default="scope">
                        <div class="domain-cell">
                            <div class="domain-avatar">
                                <FontAwesomeIcon icon="globe" />
                            </div>
                            <div class="domain-info">
                                <a
                                    class="domain-name"
                                    href="javascript:void(0)"
                                    @click="listZoneRecord(scope.row)"
                                >
                                    {{ scope.row.name }}
                                </a>
                            </div>
                            <el-tooltip :content="t('app.copied')" trigger="hover" :visible="copiedRowId === scope.row.id">
                                <button
                                    class="copy-domain-btn"
                                    :title="scope.row.name"
                                    @click.stop="copyText(scope.row.name, scope.row.id)"
                                >
                                    <FontAwesomeIcon :icon="copiedRowId === scope.row.id ? 'check' : 'copy'" />
                                </button>
                            </el-tooltip>
                        </div>
                    </template>
                </el-table-column>

                <!-- Status Column -->
                <el-table-column
                    prop="status"
                    :label="t('zoneList.status')"
                    width="140"
                >
                    <template #default="scope">
                        <div class="status-cell">
                            <span
                                class="status-dot"
                                :class="{
                                    active: scope.row.status === 'active',
                                    pending: scope.row.status === 'pending'
                                }"
                            ></span>
                            <el-tag
                                :type="getStatusTagType(scope.row.status)"
                                effect="light"
                                size="small"
                                round
                            >
                                {{ getStatusLabel(scope.row.status) }}
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>

                <!-- Provider Column -->
                <el-table-column
                    :label="t('zoneList.provider')"
                    width="160"
                >
                    <template #default="scope">
                        <div class="provider-badge">
                            <FontAwesomeIcon icon="server" class="provider-icon" />
                            <span>{{ (scope.row.host || { name: 'Cloudflare' }).name }}</span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Plan Column -->
                <el-table-column
                    prop="plan.name"
                    :label="t('zoneList.plan')"
                    width="150"
                >
                    <template #default="scope">
                        <span class="plan-tag" :class="getPlanClass(scope.row.plan?.name)">
                            {{ scope.row.plan?.name || 'Free' }}
                        </span>
                    </template>
                </el-table-column>

                <!-- Last Updated Column -->
                <el-table-column
                    :label="t('zoneList.lastUpdated')"
                    width="190"
                >
                    <template #default="scope">
                        <div class="date-cell">
                            <FontAwesomeIcon icon="clock" class="date-icon" />
                            <span>{{ formatDate(scope.row.modifiedOn) }}</span>
                        </div>
                    </template>
                </el-table-column>

                <!-- Actions Column -->
                <el-table-column
                    fixed="right"
                    :label="t('zoneList.actions')"
                    width="130"
                    align="center"
                >
                    <template #default="scope">
                        <el-button
                            type="primary"
                            size="small"
                            class="manage-btn"
                            @click.prevent="listZoneRecord(scope.row)"
                        >
                            <FontAwesomeIcon icon="pen" class="manage-btn-icon" />
                            <span>{{ t('zoneList.action_edit') }}</span>
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- Table Footer / Pagination -->
            <div v-if="!isFullyLoaded && pageInfo.total > pageInfo.size" class="pagination-wrapper">
                <el-pagination
                    :page-size="pageInfo.size"
                    :current-page="pageInfo.page"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next"
                    :total="pageInfo.total"
                    @current-change="changePage"
                    @size-change="changeSize"
                />
            </div>
        </el-card>
    </div>
</template>

<script lang="ts" setup>
import { Ref, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { listUserZones, listUserZonesAll } from '../../api/zone'
import { PaginationDetails, convertPagination, fullLoadPages } from '../../utils/pagination'
import { getErrorMessage, describeApiResponse } from '@/utils/apiError'
import { CloudflareZoneRecord, PageSettings } from '@/api'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { t } = useI18n()
const filterList: Ref<string> = ref('')
const isLoading: Ref<boolean> = ref(true)
const datas: Ref<CloudflareZoneRecord[]> = ref([])
const copiedRowId = ref<string | null>(null)

const pageInfo: Ref<PaginationDetails> = ref({
    page: 1,
    size: 10,
    total: 0,
})

const router = useRouter()
const isFullyLoaded: Ref<boolean> = ref(false)

const filterTableData = computed(() => {
    if (filterList.value.length === 0) {
        return datas.value
    }
    const query = filterList.value.toLowerCase().trim()
    return datas.value.filter(it => it.name.toLowerCase().includes(query))
})

async function loadPage(page?: PageSettings) {
    isLoading.value = true
    try {
        const zones = await listUserZones(page)

        if (zones.result) {
            datas.value = zones.result
            if (zones.resultInfo) {
                pageInfo.value = convertPagination(zones.resultInfo)
            }
        } else {
            ElMessage.error(describeApiResponse(zones, '加载域名列表失败'))
        }
    } catch (err) {
        ElMessage.error(getErrorMessage(err))
    } finally {
        isLoading.value = false
    }
}

function refreshList() {
    return loadPage({
        perPage: pageInfo.value.size,
        page: pageInfo.value.page,
    })
}

function changePage(pageNumber: number) {
    return loadPage({
        perPage: pageInfo.value.size,
        page: pageNumber,
    })
}

function changeSize(pageSize: number) {
    pageInfo.value.size = pageSize
    return loadPage({
        perPage: pageSize,
        page: 1,
    })
}

function formatDate(date: string) {
    if (!date) return '-'
    const d = new Date(date)
    return d.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).replace(/\//g, '-')
}

function getStatusTagType(status: string) {
    if (status === 'active') return 'success'
    if (status === 'pending') return 'warning'
    return 'info'
}

function getStatusLabel(status: string) {
    if (status === 'active') return t('zoneList.statusActive')
    if (status === 'pending') return t('zoneList.statusPending')
    return status
}

function getPlanClass(planName?: string) {
    const p = (planName || '').toLowerCase()
    if (p.includes('pro')) return 'plan-pro'
    if (p.includes('business')) return 'plan-biz'
    if (p.includes('enterprise')) return 'plan-ent'
    return 'plan-free'
}

function copyText(text: string, rowId: string) {
    navigator.clipboard.writeText(text).then(() => {
        copiedRowId.value = rowId
        ElMessage.success(t('app.copied'))
        setTimeout(() => {
            if (copiedRowId.value === rowId) {
                copiedRowId.value = null
            }
        }, 1500)
    })
}

function listZoneRecord(data: CloudflareZoneRecord) {
    router.push({
        name: 'ZoneRecordList',
        params: {
            id: data.id,
            name: data.name,
        },
    })
}

async function updateFilter() {
    if (isFullyLoaded.value || isLoading.value) {
        return
    }

    isLoading.value = true
    try {
        const pages = await fullLoadPages(listUserZonesAll)
        pageInfo.value = pages.pageDetail
        datas.value = pages.data
        isFullyLoaded.value = true
    } catch (err) {
        ElMessage.error(getErrorMessage(err))
    } finally {
        isLoading.value = false
    }
}

await loadPage({
    perPage: 10,
    page: 1,
})
</script>

<style lang="scss" scoped>
.zone-list-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.app-breadcrumb {
    font-size: 13px;
    margin-bottom: 4px;

    .breadcrumb-icon {
        color: var(--el-color-primary);
        margin-right: 6px;
    }
}

.zone-card {
    border-radius: 14px;
    overflow: hidden;
}

.zone-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;

    .toolbar-title-group {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .title-row {
            display: flex;
            align-items: center;
            gap: 10px;

            .toolbar-title {
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--el-text-color-primary);
                letter-spacing: -0.01em;
            }

            .zone-count-badge {
                font-size: 11px;
                font-weight: 600;
                background-color: rgba(246, 130, 31, 0.12);
                color: var(--el-color-primary);
                padding: 2px 8px;
                border-radius: 9999px;
            }
        }

        .toolbar-subtitle {
            font-size: 13px;
            color: var(--el-text-color-secondary);
        }
    }

    .toolbar-actions {
        display: flex;
        align-items: center;
        gap: 12px;

        .search-input {
            width: 260px;

            @media (max-width: 640px) {
                width: 100%;
            }

            .search-icon {
                color: var(--el-text-color-placeholder);
                font-size: 12px;
            }
        }

        .refresh-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;

            .btn-icon {
                font-size: 13px;
            }
        }
    }
}

.zone-table {
    width: 100%;

    .domain-cell {
        display: flex;
        align-items: center;
        gap: 12px;

        .domain-avatar {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background-color: rgba(246, 130, 31, 0.1);
            color: var(--el-color-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            flex-shrink: 0;
        }

        .domain-info {
            display: flex;
            flex-direction: column;

            .domain-name {
                font-size: 14px;
                font-weight: 600;
                color: var(--el-text-color-primary);
                text-decoration: none;
                transition: color 0.2s ease;

                &:hover {
                    color: var(--el-color-primary);
                }
            }
        }

        .copy-domain-btn {
            opacity: 0;
            background: none;
            border: none;
            padding: 4px;
            cursor: pointer;
            color: var(--el-text-color-placeholder);
            font-size: 12px;
            border-radius: 4px;
            transition: all 0.2s ease;

            &:hover {
                color: var(--el-color-primary);
                background-color: var(--el-fill-color);
            }
        }

        &:hover .copy-domain-btn {
            opacity: 1;
        }
    }

    .status-cell {
        display: flex;
        align-items: center;
    }

    .provider-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--el-text-color-regular);

        .provider-icon {
            color: var(--el-text-color-placeholder);
            font-size: 12px;
        }
    }

    .plan-tag {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;

        &.plan-free {
            background-color: var(--el-fill-color);
            color: var(--el-text-color-secondary);
        }

        &.plan-pro {
            background-color: #dbeafe;
            color: #1d4ed8;
        }

        &.plan-biz {
            background-color: #ede9fe;
            color: #6d28d9;
        }

        &.plan-ent {
            background-color: #fef3c7;
            color: #b45309;
        }
    }

    .date-cell {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--el-text-color-secondary);

        .date-icon {
            font-size: 12px;
            color: var(--el-text-color-placeholder);
        }
    }

    .manage-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;

        .manage-btn-icon {
            font-size: 11px;
        }
    }
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
}
</style>