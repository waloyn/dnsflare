<template>
    <div class="app-layout">
        <AppHeader />
        <el-main class="container main-content">
            <Suspense>
                <router-view />
            </Suspense>
        </el-main>
    </div>
</template>

<script lang="ts" setup>
import AppHeader from '@/components/Header.vue'

</script>

<style>
.app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--el-bg-color);
    color: var(--el-text-color-primary);
}

.main-content {
    flex: 1;
    padding-top: 2rem !important;
}
</style>
