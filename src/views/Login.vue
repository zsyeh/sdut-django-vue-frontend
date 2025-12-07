<template>
    <el-card class="login-card">
        <div class="login-form">
            <img src="@/assets/favicon.ico" alt="logo" />
            <el-input v-model="username" placeholder="请输入用户名" />
            <el-input
                v-model="password"
                type="password"
                placeholder="请输入密码"
                @keyup.enter="handleLogin"
            />
            <el-button type="primary" @click="handleLogin" :loading="loading"
                >登录</el-button
            >
        </div>
    </el-card>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/store/user"
import request from "@/utils/request"
import { ElMessage } from "element-plus"

export default defineComponent({
    name: "Login",
    setup() {
        const username = ref("")
        const password = ref("")
        const loading = ref(false)
        const userStore = useUserStore()
        const router = useRouter()

        const handleLogin = async () => {
            if (!username.value || !password.value) {
                ElMessage.warning("请输入用户名和密码")
                return
            }

            loading.value = true
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data: any = await request.post("/token/", {
                    username: username.value,
                    password: password.value
                })

                if (data.access) {
                    userStore.setTokens(data.access, data.refresh)
                    await userStore.fetchUserInfo()
                    ElMessage.success("登录成功！")

                    const group = userStore.userInfo.user_group
                    if (group === "stu") {
                        router.replace({ path: "/userinfo" })
                    } else if (group === "tch") {
                        router.replace({ path: "/tchinfo" })
                    } else if (group === "mas") {
                        router.replace({ path: "/approveleave_mas" })
                    } else {
                        router.replace({ path: "/" })
                    }
                } else {
                    ElMessage.error("登录失败：无法获取令牌")
                }
            } catch (err: any) {
                console.error("登录失败", err)
                const msg = err.response?.data?.detail || "登录失败，请检查用户名或密码！"
                ElMessage.error(msg)
            } finally {
                loading.value = false
            }
        }

        return {
            username,
            password,
            loading,
            handleLogin
        }
    }
})
</script>

<style scoped>
.login-card {
    max-width: 400px;
    margin: 100px auto;
    padding: 40px;
    /* 【修改】背景色使用变量，适应暗黑模式 */
    background-color: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    /* 【新增】可选：为了更柔和，去掉默认边框，或者使用变量边框 */
    border: 1px solid var(--el-border-color-light);
}

.login-form {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.login-form img {
    width: 50px;
    height: 50px;
    margin-bottom: 20px;
}

.el-input {
    width: 100%;
    margin-bottom: 15px;
}

.el-button {
    width: 100%;
}

@media (max-width: 480px) {
    .login-card {
        width: 90%;
        padding: 20px;
    }
    .el-input,
    .el-button {
        font-size: 14px;
    }
}
</style>