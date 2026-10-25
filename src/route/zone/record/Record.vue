<template>
    <el-dialog
        :title="modeLocale"
        :model-value="dialogVisible"
        class="record-dialog"
        width="560px"
        destroy-on-close
        :before-close="handleClose"
    >
        <div class="dialog-content">
            <el-form
                ref="ruleFormRef"
                label-position="top"
                :model="model"
                :rules="validationRules"
                class="record-form"
            >
                <!-- Record Type -->
                <el-form-item prop="type" :label="t('recordForm.type')">
                    <el-select
                        v-model="model.type"
                        :placeholder="t('recordForm.select')"
                        class="full-width"
                        size="large"
                    >
                        <el-option
                            v-for="item in dnsTypes"
                            :key="item"
                            :label="item"
                            :value="item"
                        >
                            <div class="type-option-item">
                                <span class="dns-type-tag" :class="`type-${item}`">{{ item }}</span>
                                <span class="type-desc">{{ getTypeDescription(item) }}</span>
                            </div>
                        </el-option>
                    </el-select>
                </el-form-item>

                <!-- Record Name -->
                <el-form-item prop="name">
                    <template #label>
                        <div class="form-item-label">
                            <span>{{ t('recordForm.name') }}</span>
                            <span class="label-hint">({{ t('recordForm.namePlaceholder') }})</span>
                        </div>
                    </template>
                    <el-input
                        v-model="model.name"
                        :placeholder="t('recordForm.namePlaceholder')"
                        size="large"
                        clearable
                    >
                        <template #prefix>
                            <FontAwesomeIcon icon="file" class="field-icon" />
                        </template>
                    </el-input>
                </el-form-item>

                <!-- Record Content / Value -->
                <el-form-item prop="content">
                    <template #label>
                        <div class="form-item-label">
                            <span>{{ t('recordForm.content') }}</span>
                            <span class="label-hint">({{ t('recordForm.contentPlaceholder') }})</span>
                        </div>
                    </template>
                    <el-input
                        v-model="model.content"
                        :placeholder="t('recordForm.contentPlaceholder')"
                        size="large"
                        clearable
                    >
                        <template #prefix>
                            <FontAwesomeIcon icon="font" class="field-icon" />
                        </template>
                    </el-input>
                </el-form-item>

                <!-- Priority (if MX or SRV) -->
                <el-form-item
                    v-if="requirePriority"
                    prop="priority"
                    :label="t('recordForm.priority')"
                >
                    <el-input-number
                        v-model="model.priority"
                        :min="0"
                        :max="65535"
                        size="large"
                    />
                </el-form-item>

                <!-- TTL Configuration Card -->
                <el-form-item :label="t('recordForm.ttl')" prop="ttl">
                    <div class="ttl-config-box">
                        <div class="ttl-auto-row">
                            <div class="ttl-text">
                                <span class="ttl-title">{{ t('recordForm.ttl_auto') }}</span>
                                <span class="ttl-desc">由 Cloudflare 自动分配最佳缓存时间</span>
                            </div>
                            <el-switch v-model="model.autoTTL" />
                        </div>

                        <div v-if="!model.autoTTL" class="ttl-custom-row">
                            <span class="custom-label">TTL (秒):</span>
                            <el-input-number
                                v-model="model.ttl"
                                :min="60"
                                :step="60"
                                size="default"
                            />
                        </div>
                    </div>
                </el-form-item>

                <!-- Cloudflare Proxy Setting -->
                <el-form-item :label="t('recordForm.proxied')">
                    <div
                        class="proxy-toggle-card"
                        :class="{ 'is-active': model.proxied }"
                        @click="model.proxied = !model.proxied"
                    >
                        <div class="proxy-icon-box">
                            <FontAwesomeIcon icon="cloud" />
                        </div>
                        <div class="proxy-info">
                            <div class="proxy-title">
                                <span>{{ model.proxied ? t('recordList.proxiedBadge') : t('recordList.dnsOnlyBadge') }}</span>
                            </div>
                            <div class="proxy-desc">
                                {{ model.proxied ? t('recordList.proxiedTooltip') : t('recordList.dnsOnlyTooltip') }}
                            </div>
                        </div>
                        <el-switch
                            v-model="model.proxied"
                            @click.stop
                        />
                    </div>
                </el-form-item>
            </el-form>
        </div>

        <template #footer>
            <div class="dialog-actions">
                <el-button @click="handleClose">
                    {{ t('recordForm.cancel') }}
                </el-button>
                <el-button
                    type="primary"
                    :loading="isLoading"
                    @click="createRecord"
                >
                    {{ t('recordForm.save') }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, Ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { DnsRecordTypeEnum } from '@/api/enum'
import { createDnsRecord, putRecord } from '@/api/dns'
import { DnsRecordType, CloudflareDnsRecord } from '@/api'
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { t } = useI18n()
const ruleFormRef = ref<FormInstance>()
const emits = defineEmits<{
    (event: 'close'): void
    (event: 'success'): void
}>()

const props = defineProps<{
    zone: string
}>()

type RecordModalType = {
    name: string
    content: string
    type: DnsRecordType
    ttl: number
    autoTTL?: boolean
    proxied: boolean
    priority?: number
}

const DefaultModalValue: RecordModalType = {
    name: '',
    content: '',
    type: 'A' as DnsRecordType,
    ttl: 300,
    autoTTL: true,
    proxied: false,
    priority: 0,
}

const isLoading = ref(false)
const dialogVisible = ref(false)
const record: Ref<CloudflareDnsRecord | null> = ref(null)
const model = ref<RecordModalType>({ ...DefaultModalValue })

const requirePriority = computed(() => {
    return model.value.type === 'MX' || model.value.type === 'SRV'
})

const dnsTypes = computed(() => {
    return Object.keys(DnsRecordTypeEnum)
})

const isEditMode = computed(() => {
    return !!record.value
})

const modeLocale = computed(() => {
    return isEditMode.value ? t('recordForm.modify') : t('recordForm.create')
})

function getTypeDescription(type: string): string {
    switch (type) {
        case 'A': return 'IPv4 地址'
        case 'AAAA': return 'IPv6 地址'
        case 'CNAME': return '指向另一个域名'
        case 'TXT': return '文本记录 (SPF/验证等)'
        case 'MX': return '邮件交换记录'
        case 'NS': return '名称服务器'
        case 'SRV': return '服务定位记录'
        case 'CAA': return 'CA 授权限制'
        default: return ''
    }
}

function display() {
    dialogVisible.value = true
}

function handleClose() {
    dialogVisible.value = false
    emits('close')
}

const validationRules = reactive<FormRules>({
    name: [{ required: true, message: t('recordForm.name_msg'), trigger: 'blur' }],
    content: [{ required: true, message: t('recordForm.content_msg'), trigger: 'blur' }],
    type: [{ required: true, message: t('recordForm.type_msg'), trigger: 'change' }],
})

function setRecord(r: CloudflareDnsRecord) {
    record.value = r
}

function reset() {
    model.value = { ...DefaultModalValue }
    record.value = null
}

function setModel(m: Partial<RecordModalType>) {
    model.value = Object.assign({}, model.value, m)
}

async function createRecord() {
    const valid = await ruleFormRef.value?.validate().catch(() => false)
    if (!valid) {
        return
    }

    isLoading.value = true

    const submit = async (doc: RecordModalType) => {
        if (isEditMode.value) {
            if (!record.value) {
                return
            }
            return await putRecord(
                {
                    ...record.value,
                    zoneId: props.zone,
                },
                doc
            )
        } else {
            return await createDnsRecord(props.zone, doc)
        }
    }

    const requestBody: RecordModalType = {
        name: model.value.name,
        content: model.value.content,
        type: model.value.type,
        ttl: model.value.autoTTL ? 1 : model.value.ttl,
        proxied: model.value.proxied,
    }

    if (requirePriority.value) {
        requestBody.priority = model.value.priority
    }

    try {
        const res = await submit(requestBody)

        if (!res) {
            emits('success')
            ElMessage.success(`${modeLocale.value}成功`)
            handleClose()
        } else {
            ElMessage.error(`${modeLocale.value}失败: ${res}`)
        }
    } finally {
        isLoading.value = false
    }
}

defineExpose({
    display,
    reset,
    setModel,
    setRecord,
})
</script>

<style lang="scss" scoped>
.record-dialog {
    :deep(.el-dialog__body) {
        padding-top: 10px;
    }
}

.full-width {
    width: 100%;
}

.form-item-label {
    display: flex;
    align-items: center;
    gap: 6px;

    .label-hint {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        font-weight: normal;
    }
}

.field-icon {
    font-size: 13px;
    color: var(--el-text-color-placeholder);
}

.type-option-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .type-desc {
        font-size: 12px;
        color: var(--el-text-color-secondary);
    }
}

.ttl-config-box {
    width: 100%;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    padding: 12px 16px;
    background-color: var(--el-fill-color-light);

    .ttl-auto-row {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .ttl-text {
            display: flex;
            flex-direction: column;

            .ttl-title {
                font-size: 13px;
                font-weight: 600;
                color: var(--el-text-color-primary);
            }

            .ttl-desc {
                font-size: 12px;
                color: var(--el-text-color-secondary);
            }
        }
    }

    .ttl-custom-row {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--el-border-color-lighter);
        display: flex;
        align-items: center;
        gap: 12px;

        .custom-label {
            font-size: 13px;
            color: var(--el-text-color-regular);
        }
    }
}

.proxy-toggle-card {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-light);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: var(--el-border-color-hover);
        background-color: var(--el-fill-color);
    }

    &.is-active {
        border-color: rgba(246, 130, 31, 0.4);
        background-color: rgba(246, 130, 31, 0.06);

        .proxy-icon-box {
            background-color: #f6821f;
            color: #ffffff;
            box-shadow: 0 2px 8px rgba(246, 130, 31, 0.4);
        }

        .proxy-title {
            color: #f6821f;
        }
    }

    .proxy-icon-box {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background-color: var(--el-fill-color);
        color: var(--el-text-color-placeholder);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: all 0.2s ease;
        flex-shrink: 0;
    }

    .proxy-info {
        flex: 1;

        .proxy-title {
            font-size: 13px;
            font-weight: 600;
            color: var(--el-text-color-primary);
        }

        .proxy-desc {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-top: 2px;
            line-height: 1.3;
        }
    }
}

.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>