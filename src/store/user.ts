import { defineStore } from "pinia"
import { ref } from "vue"
import request from "@/utils/request"

// 定义接口，确保返回的数据符合期望的结构
interface UserInfo {
    class_name: string | null
    email: string | null
    first_name: string | null
    last_name: string | null
    student_number: string | null
    user_group: string | null
}

interface RefreshResponse {
    access: string
    refresh: string
}

export const useUserStore = defineStore("user", () => {
    // 存储 access_token 和 refresh_token
    const accessToken = ref<string | null>(
        localStorage.getItem("access_token") || null
    )
    const refreshToken = ref<string | null>(
        localStorage.getItem("refresh_token") || null
    )

    // 存储用户的详细信息
    const userInfo = ref<UserInfo>(
        JSON.parse(localStorage.getItem("user_info") || "null") || {
            class_name: null,
            email: null,
            first_name: null,
            last_name: null,
            student_number: null,
            user_group: null
        }
    )

    // 设置 tokens
    const setTokens = (access: string, refresh: string) => {
        accessToken.value = access
        refreshToken.value = refresh

        // 将 tokens 保存在 localStorage 中，方便后续使用
        localStorage.setItem("access_token", access)
        localStorage.setItem("refresh_token", refresh)
    }

    // 清空用户信息 (登出或 Token 失效时调用)
    const clearUserInfo = () => {
        userInfo.value = {
            class_name: null,
            email: null,
            first_name: null,
            last_name: null,
            student_number: null,
            user_group: null
        }
        accessToken.value = null
        refreshToken.value = null

        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user_info")
    }

    // 刷新 accessToken
    const refreshAccessToken = async () => {
        if (refreshToken.value) {
            try {
                const response = await request.post<RefreshResponse>(
                    "/refresh-token/",
                    {
                        refresh: refreshToken.value
                    }
                )
                if (response && response.access) {
                    setTokens(
                        response.access,
                        response.refresh || refreshToken.value
                    )
                }
            } catch (error) {
                console.error("刷新 token 失败", error)
                clearUserInfo() // 刷新失败时清空用户状态，强制重登
            }
        }
    }

    // 获取用户信息
    const fetchUserInfo = async () => {
        try {
            const response = await request.get<UserInfo>("/UserInfoView/")
            if (response) {
                userInfo.value = {
                    class_name: response.class_name || null,
                    email: response.email || null,
                    first_name: response.first_name || null,
                    last_name: response.last_name || null,
                    student_number: response.student_number || null,
                    user_group: response.user_group || null
                }

                // 持久化用户信息
                localStorage.setItem(
                    "user_info",
                    JSON.stringify(userInfo.value)
                )
                return userInfo.value // 返回数据以便调用者判断
            }
        } catch (error) {
            console.error("获取用户信息失败", error)
            // 如果获取用户信息失败（通常是 Token 失效），抛出错误让调用者处理或直接清理
            throw error
        }
    }

    // 初始化时检查 accessToken 是否有效
    // 【核心修复】：在 App.vue 挂载时调用此方法
    const initializeUser = async () => {
        if (accessToken.value) {
            try {
                await fetchUserInfo() // 尝试从后端获取最新信息
            } catch (error) {
                console.error("初始化用户信息失败，尝试刷新或清理", error)
                // 可以在这里尝试 refreshAccessToken，如果还不行则清理
                // 为简单起见，这里如果获取用户信息失败（401），直接登出
                clearUserInfo()
            }
        } else {
            clearUserInfo()
        }
    }

    return {
        accessToken,
        refreshToken,
        userInfo,
        setTokens,
        refreshAccessToken,
        fetchUserInfo,
        initializeUser,
        clearUserInfo
    }
})