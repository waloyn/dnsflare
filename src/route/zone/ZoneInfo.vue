<template>

    <el-breadcrumb separator="/">
        <el-breadcrumb-item>
            {{t('app.title')}}
        </el-breadcrumb-item>
        <el-breadcrumb-item :to="{ name: 'ZoneList' }">
            {{t('zoneList.title')}}
        </el-breadcrumb-item>
        <el-breadcrumb-item>
            {{t('recordList.info')}}
        </el-breadcrumb-item>
    </el-breadcrumb>
    <br>
    <ZoneRecordList :zoneId="zoneId" :zoneName="zoneName" />
    <CertInfo :zoneId="zoneId" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ZoneRecordList from './record/List.vue'
import CertInfo from './CertInfo.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const route = useRoute()

const zoneId = computed(() => {
    const {id} = route.params

    return id as string
})

const zoneName = computed(() => {
    const {name} = route.params
    return name as string
})
</script>
