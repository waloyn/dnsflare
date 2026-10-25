<template>
    <div class="dns-records-wrapper">
        <RecordModal
            ref="record"
            :zone="zoneId"
            @success="refresh"
        />

        <div class="dns-records-container">
            <!-- Filter & Action Toolbar -->
            <div class="dns-toolbar">
                <div class="toolbar-left">
                    <!-- Search Input -->
                    <el-input
                        v-model="filterList"
                        clearable
                        :placeholder="t('recordList.search')"
                        class="record-search-input"
                        @input="updateFilter"
                    >
                        <template #prefix>
                            <FontAwesomeIcon icon="magnifying-glass" class="search-icon" />
                        </template>
                    </el-input>

                    <!-- Type Quick Filter Pills -->
                    <div class="type-filter-group">
                        <button
                            class="type-pill"
                            :class="{ active: selectedTypeFilter === 'ALL' }"
                            @click="selectedTypeFilter = 'ALL'"
                        >
                            {{ t('recordList.allTypes') }}
                        </button>
                        <button
                            v-for="tName in commonTypes"
                            :key="tName"
                            class="type-pill"
                            :class="{ active: selectedTypeFilter === tName }"
                            @click="selectedTypeFilter = tName"
                        >
                            {{ tName }}
                        </button>
                    </div>
                </div>

                <div class="toolbar-right">
                    <span v-if="filterTableData.length > 0" class="records-counter">
                        {{ t('recordList.recordsCount', { count: filterTableData.length }) }}
                    </span>

                    <el-button
                        :loading="isLoading"
                        class="refresh-btn"
                        @click="refresh"
                    >
                        <FontAwesomeIcon icon="rotate-right" :spin="isLoading" class="btn-icon" />
                        <span>{{ t('recordList.refresh') }}</span>
                    </el-button>

                    <el-button
                        type="primary"
                        class="create-btn"
                        @click="displayCreate"
                    >
                        <FontAwesomeIcon icon="plus" class="btn-icon" />
                        <span>{{ t('recordList.action_create') }}</span>
                    </el-button>
                </div>
            </div>

            <!-- DNS Records Table -->
            <el-table
                v-loading="isLoading"
                :data="filterTableData"
                class="records-table"
                row-class-name="record-table-row"
            >
                <template #empty>
                    <el-empty :description="t('recordList.empty')">
                        <el-button v-if="filterList || selectedTypeFilter !== 'ALL'" text type="primary" @click="resetFilters">
                            {{ t('app.reset') }}
                        </el-button>
                        <el-button v-else type="primary" @click="displayCreate">
                            <FontAwesomeIcon icon="plus" class="mr-1" />
                            {{ t('recordList.action_create') }}
                        </el-button>
                    </el-empty>
                </template>

                <!-- Type Column -->
                <el-table-column
                    prop="type"
                    :label="t('recordList.type')"
                    width="110"
                >
                    <template #default="scope">
                        <span class="dns-type-tag" :class="`type-${scope.row.type}`">
                            {{ scope.row.type }}
                        </span>
                    </template>
                </el-table-column>

                <!-- Name Column -->
                <el-table-column
                    prop="name"
                    :label="t('recordList.name')"
                    min-width="180"
                >
                    <template #default="scope">
                        <div class="name-cell">
                            <span class="record-name" :title="scope.row.name">
                                {{ formatRecordName(scope.row.name) }}
                            </span>
                            <el-tooltip :content="t('app.copied')" trigger="hover" :visible="copiedNameId === scope.row.id">
                                <button class="cell-copy-btn" @click.stop="copyRecordText(scope.row.name, 'name', scope.row.id)">
                                    <FontAwesomeIcon :icon="copiedNameId === scope.row.id ? 'check' : 'copy'" />
                                </button>
                            </el-tooltip>
                        </div>
                    </template>
                </el-table-column>

                <!-- Content Column -->
                <el-table-column
                    prop="content"
                    :label="t('recordList.content')"
                    min-width="260"
                >
                    <template #default="scope">
                        <div class="content-cell">
                            <el-tooltip
                                :content="scope.row.content"
                                placement="top"
                                :show-after="500"
                                max-width="400"
                            >
                                <span class="record-content-text">
                                    {{ scope.row.content }}
                                </span>
                            </el-tooltip>
                            <el-tooltip :content="t('app.copied')" trigger="hover" :visible="copiedContentId === scope.row.id">
                                <button class="cell-copy-btn" @click.stop="copyRecordText(scope.row.content, 'content', scope.row.id)">
                                    <FontAwesomeIcon :icon="copiedContentId === scope.row.id ? 'check' : 'copy'" />
                                </button>
                            </el-tooltip>
                        </div>
                    </template>
                </el-table-column>

                <!-- TTL Column -->
                <el-table-column
                    :label="t('recordList.ttl')"
                    width="120"
                >
                    <template #default="scope">
                        <span v-if="scope.row.ttl === 1" class="ttl-tag ttl-auto">
                            {{ t('recordList.ttl_auto') }}
                        </span>
                        <span v-else class="ttl-tag ttl-manual">
                            {{ formatTTL(scope.row.ttl) }}
                        </span>
                    </template>
                </el-table-column>

                <!-- CDN / Proxied Column -->
                <el-table-column
                    :label="t('recordList.cdn')"
                    width="150"
                >
                    <template #default="scope">
                        <template v-if="scope.row.proxiable">
                            <el-tooltip
                                :content="scope.row.proxied ? t('recordList.proxiedTooltip') : t('recordList.dnsOnlyTooltip')"
                                placement="top"
                            >
                                <div
                                    class="cf-proxy-badge"
                                    :class="scope.row.proxied ? 'is-proxied' : 'is-dns-only'"
                                    @click="toggleProxy(scope.row)"
                                >
                                    <FontAwesomeIcon icon="cloud" class="cloud-icon" />
                                    <span>{{ scope.row.proxied ? t('recordList.proxiedBadge') : t('recordList.dnsOnlyBadge') }}</span>
                                </div>
                            </el-tooltip>
                        </template>
                        <template v-else>
                            <span class="unproxiable-label">-</span>
                        </template>
                    </template>
                </el-table-column>

                <!-- Actions Column -->
                <el-table-column
                    fixed="right"
                    :label="t('recordList.actions')"
                    width="140"
                    align="center"
                >
                    <template #default="scope">
                        <div class="row-actions">
                            <el-tooltip :content="t('recordList.action_edit')" placement="top">
                                <el-button
                                    size="small"
                                    circle
                                    class="action-icon-btn edit-btn"
                                    @click.prevent="editRecord(scope.row)"
                                >
                                    <FontAwesomeIcon icon="pen" />
                                </el-button>
                            </el-tooltip>

                            <el-popconfirm
                                :title="t('recordList.action_delete_confirm')"
                                :confirm-button-text="t('recordList.action_delete_confirm_ok')"
                                :cancel-button-text="t('recordList.action_delete_confirm_cancel')"
                                confirm-button-type="danger"
                                width="220"
                                @confirm="doDeleteRecord(scope.row)"
                            >
                                <template #reference>
                                    <el-button
                                        size="small"
                                        circle
                                        class="action-icon-btn delete-btn"
                                    >
                                        <FontAwesomeIcon icon="trash" />
                                    </el-button>
                                </template>
                            </el-popconfirm>
                        </div>
                    </template>
                </el-table-column>
            </el-table>

            <!-- Table Footer / Pagination -->
            <div v-if="pageInfo.total > pageInfo.size" class="pagination-wrapper">
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
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, Ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { listZoneDnsRecord, deleteRecord, patchRecord, listZoneDnsRecordAll } from '@/api/dns'
import RecordModal from './Record.vue'
import { CloudflareDnsRecord, PageSettings } from '@/api'
import { PaginationDetails, convertPagination, LoadPageResponse, fullLoadPages } from '@/utils/pagination'
import { getErrorMessage, describeApiResponse } from '@/utils/apiError'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { t } = useI18n()
const filterList = ref('')
const selectedTypeFilter = ref('ALL')
const isLoading = ref(true)
const copiedNameId = ref<string | null>(null)
const copiedContentId = ref<string | null>(null)

const commonTypes = ['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS']

const props = defineProps<{
    zoneId: string,
    zoneName: string
}>()

const record = ref<typeof RecordModal>()
const datas: Ref<CloudflareDnsRecord[]> = ref<CloudflareDnsRecord[]>([])
const pageInfo = ref<PaginationDetails>({
    page: 1,
    size: 20,
    total: 0,
})

const zoneId = computed(() => props.zoneId)
const zoneName = computed(() => props.zoneName)

const filterTableData = computed(() => {
    let result = datas.value

    if (selectedTypeFilter.value !== 'ALL') {
        result = result.filter(it => it.type === selectedTypeFilter.value)
    }

    if (filterList.value.trim().length > 0) {
        const q = filterList.value.toLowerCase().trim()
        result = result.filter(it =>
            it.name.toLowerCase().includes(q) || it.content.toLowerCase().includes(q)
        )
    }

    return result
})

const isFullyLoaded = ref(false)

async function updateFilter() {
    if (isFullyLoaded.value || isLoading.value) {
        return
    }

    isLoading.value = true
    try {
        const pages = await fullLoadPages(listZoneDnsRecordAll(props.zoneId))
        pageInfo.value = pages.pageDetail
        datas.value = pages.data
        isFullyLoaded.value = true
    } catch (err) {
        ElMessage.error(getErrorMessage(err))
    } finally {
        isLoading.value = false
    }
}

function resetFilters() {
    filterList.value = ''
    selectedTypeFilter.value = 'ALL'
}

function formatRecordName(name: string) {
    if (name === props.zoneName) {
        return '@'
    }
    const suffix = '.' + props.zoneName
    if (name.endsWith(suffix)) {
        return name.slice(0, -suffix.length)
    }
    return name
}

function formatTTL(ttl: number) {
    if (ttl < 60) return `${ttl}s`
    if (ttl < 3600) return `${Math.round(ttl / 60)}m`
    return `${Math.round(ttl / 3600)}h`
}

function copyRecordText(text: string, type: 'name' | 'content', id: string) {
    navigator.clipboard.writeText(text).then(() => {
        if (type === 'name') {
            copiedNameId.value = id
            setTimeout(() => {
                if (copiedNameId.value === id) copiedNameId.value = null
            }, 1500)
        } else {
            copiedContentId.value = id
            setTimeout(() => {
                if (copiedContentId.value === id) copiedContentId.value = null
            }, 1500)
        }
        ElMessage.success(t('app.copied'))
    })
}

async function rawLoadPage(page?: PageSettings): Promise<LoadPageResponse<any>> {
    const records = await listZoneDnsRecord(zoneId.value, page)

    if (!records.result || !records.resultInfo) {
        throw new Error(describeApiResponse(records, '加载解析记录失败'))
    }

    return {
        pageDetail: convertPagination(records.resultInfo),
        data: records.result.map(rec => ({
            ...rec,
            zoneId: zoneId.value,
            zoneName: zoneName.value,
        })),
    }
}

async function loadPage(page?: PageSettings) {
    isLoading.value = true
    try {
        const data = await rawLoadPage(page)
        datas.value = data.data
        pageInfo.value = data.pageDetail
    } catch (err) {
        ElMessage.error(getErrorMessage(err))
    } finally {
        isLoading.value = false
    }
}

function refresh() {
    return loadPage({
        perPage: pageInfo.value.size,
        page: pageInfo.value.page,
    })
}

async function toggleProxy(row: CloudflareDnsRecord) {
    if (!row.proxiable) return
    await changeProxied(row, !row.proxied)
}

async function changeProxied(rec: CloudflareDnsRecord, proxied: boolean) {
    isLoading.value = true
    try {
        const res = await patchRecord(rec, { proxied })

        if (!res) {
            ElMessage.success('代理状态已修改')
            await refresh()
        } else {
            ElMessage.error(`修改失败: ${res}`)
        }
    } finally {
        isLoading.value = false
    }
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

async function doDeleteRecord(rec: CloudflareDnsRecord) {
    const deleteError = await deleteRecord({
        ...rec,
        zoneId: rec.zoneId || props.zoneId || zoneId.value,
    })

    if (deleteError) {
        ElMessage.error(`删除失败: ${deleteError}`)
    } else {
        ElMessage.success('记录已成功删除')
    }

    await refresh()
}

const getRecord = computed(() => {
    return record.value as typeof RecordModal
})

function displayCreate() {
    getRecord.value.reset()
    getRecord.value.display()
}

function editRecord(rec: CloudflareDnsRecord) {
    getRecord.value.reset()
    getRecord.value.display()

    getRecord.value.setModel({
        name: rec.name,
        content: rec.content,
        type: rec.type,
        ttl: rec.ttl,
        proxied: rec.proxied,
        autoTTL: rec.ttl === 1,
        priority: rec.priority,
    })

    getRecord.value.setRecord(rec)
}

loadPage()
</script>

<style lang="scss" scoped>
.dns-records-wrapper {
    background-color: var(--app-card-bg);
}

.dns-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    padding: 18px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .toolbar-left {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;

        .record-search-input {
            width: 250px;

            @media (max-width: 640px) {
                width: 100%;
            }

            .search-icon {
                color: var(--el-text-color-placeholder);
                font-size: 12px;
            }
        }

        .type-filter-group {
            display: flex;
            align-items: center;
            gap: 4px;
            background-color: var(--el-fill-color-light);
            padding: 3px;
            border-radius: 8px;
            border: 1px solid var(--el-border-color-lighter);
            overflow-x: auto;

            .type-pill {
                background: none;
                border: none;
                padding: 4px 10px;
                font-size: 12px;
                font-weight: 600;
                color: var(--el-text-color-regular);
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;

                &:hover {
                    color: var(--el-color-primary);
                }

                &.active {
                    background-color: var(--app-card-bg);
                    color: var(--el-color-primary);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
            }
        }
    }

    .toolbar-right {
        display: flex;
        align-items: center;
        gap: 12px;

        .records-counter {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            font-weight: 500;
        }

        .refresh-btn, .create-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;

            .btn-icon {
                font-size: 12px;
            }
        }
    }
}

.records-table {
    width: 100%;

    .name-cell {
        display: flex;
        align-items: center;
        gap: 8px;

        .record-name {
            font-size: 13px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
    }

    .content-cell {
        display: flex;
        align-items: center;
        gap: 8px;

        .record-content-text {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 13px;
            color: var(--el-text-color-regular);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 480px;
        }
    }

    .cell-copy-btn {
        opacity: 0;
        background: none;
        border: none;
        padding: 3px 5px;
        cursor: pointer;
        color: var(--el-text-color-placeholder);
        font-size: 11px;
        border-radius: 4px;
        transition: all 0.2s ease;
        flex-shrink: 0;

        &:hover {
            color: var(--el-color-primary);
            background-color: var(--el-fill-color);
        }
    }

    tr:hover .cell-copy-btn {
        opacity: 1;
    }

    .ttl-tag {
        display: inline-block;
        font-size: 12px;
        font-weight: 500;
        padding: 2px 8px;
        border-radius: 6px;

        &.ttl-auto {
            background-color: var(--el-fill-color);
            color: var(--el-text-color-secondary);
        }

        &.ttl-manual {
            background-color: var(--el-fill-color-light);
            color: var(--el-text-color-regular);
            border: 1px solid var(--el-border-color-lighter);
        }
    }

    .cf-proxy-badge {
        cursor: pointer;

        &:hover {
            opacity: 0.85;
            transform: scale(1.02);
        }
    }

    .unproxiable-label {
        color: var(--el-text-color-placeholder);
        padding-left: 10px;
    }

    .row-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        .action-icon-btn {
            border: 1px solid var(--el-border-color-lighter);
            color: var(--el-text-color-regular);
            transition: all 0.2s ease;

            &.edit-btn:hover {
                color: var(--el-color-primary);
                border-color: var(--el-color-primary-light-5);
                background-color: var(--el-color-primary-light-9);
            }

            &.delete-btn:hover {
                color: var(--el-color-danger);
                border-color: var(--el-color-danger-light-5);
                background-color: var(--el-color-danger-light-9);
            }
        }
    }
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
}

.mr-1 {
    margin-right: 4px;
}
</style>