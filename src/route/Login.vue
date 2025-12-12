<template>
    <el-card class="box-card login-panel">
        <template #header>
            <div class="clearfix">
                <span>{{t('app.login')}}</span>
            </div>
        </template>
        <el-form
            ref="form"
            :model="model"
            label-width="120px"
        >
            <el-form-item
                :label="t('app.token')"
                prop="token"
            >
                <el-input v-model="model.token" />
            </el-form-item>
            <el-divider>{{t('app.or')}}</el-divider>
            <el-form-item
                :label="t('app.email')"
                prop="email"
            >
                <el-input v-model="model.email" />
            </el-form-item>
            <el-form-item
                :label="t('app.globalToken')"
                prop="globalToken"
            >
                <el-input v-model="model.globalToken" />
            </el-form-item>

            <el-form-item :label="t('app.save')">
                <el-switch v-model="model.save" />
            </el-form-item>
            <el-form-item>
                <el-button
                    type="primary"
                    :loading="isLoading"
                    @click="submit"
                >
                    {{t('app.submit')}}
                </el-button>
                <el-button @click="reset">
                    {{t('app.reset')}}
                </el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<script lang="ts" setup>
import { reactive, ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { userTokenVerify, userEmailVerify } from '@/api/account'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const model = reactive({
    token: '',
    save: false,
    email: '',
    globalToken: '',
})

const isLoading = ref(false)

const useToken = computed(() => {
    if (model.token.length === 40) {
        return true
    }

    return false
})

const router = useRouter()
const userStore = useUserStore()

if (!userStore.saveToken) {
    userStore.logout()
}

model.token = userStore.token
model.save = userStore.saveToken
model.email = userStore.email
model.globalToken = userStore.globalToken

if (model.save) {
    submit()
}


function onLoginSuccessful() {
    ElMessage('登录成功, 即将跳转管理页面')

    setTimeout(() => {
        router.push({ name: 'ZoneList' })
    }, 1000)
}

async function submit() {
    isLoading.value = true
    if (useToken.value) {
        const status = await userTokenVerify(model.token)

        if (status) {
            userStore.loginByToken(model)
            onLoginSuccessful()
        } else {
            ElMessage({
                type: 'error',
                message: 'Token 错误',
            })
        }
    } else {
        const status = await userEmailVerify(model.email, model.globalToken)

        if (status) {
            userStore.loginByEmail(model)
            onLoginSuccessful()
        } else {
            ElMessage({
                type: 'error',
                message: '邮箱或者全局 Key 错误',
            })
        }
    }

    isLoading.value = false
}

function reset() {
    model.token = ''
    model.save = false
}
</script>

<style lang="scss" scoped>
    .login-panel {
        margin: auto;
        margin-top: 50px;
        max-width: 600px;
    }
</style>
