import { createRouter, createWebHistory } from "vue-router"
import { routes } from "@/router/routes"
import { useUserStore } from "@/store/user"

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

// 【核心修复】：全局前置守卫
router.beforeEach(async (to, from, next) => {
    // 注意：useUserStore 必须在 beforeEach 内部调用，确保 Pinia 已经挂载
    const store = useUserStore()
    const token = localStorage.getItem("access_token")

    // 1. 白名单：如果是去登录页、404页或者防伪验证页，直接放行
    // 注意：如果有其他不需要登录的公开页面，请加在这里
    if (
        to.name === "login" ||
        to.name === "NotFound" ||
        to.name === "LeaveVerify"
    ) {
        // 如果已登录但又想访问登录页，根据身份跳转到对应主页
        if (token && to.name === "login") {
            // 确保用户信息已加载
            if (!store.userInfo.user_group) {
                await store.fetchUserInfo()
            }
            const group = store.userInfo.user_group
            if (group === "stu") return next({ path: "/userinfo" })
            if (group === "tch") return next({ path: "/tchinfo" })
            if (group === "mas") return next({ path: "/approveleave_mas" })
        }
        return next()
    }

    // 2. 鉴权：如果没有 Token，强制跳转到登录页
    if (!token) {
        return next({ name: "login" })
    }

    // 3. 状态恢复：如果有 Token 但 Pinia 里没有用户信息（例如刷新后），尝试重新拉取
    if (token && !store.userInfo.user_group) {
        try {
            await store.fetchUserInfo()
        } catch (error) {
            // 如果拉取失败（如 Token 过期），清空状态并跳回登录
            store.clearUserInfo()
            return next({ name: "login" })
        }
    }

    // 4. 权限控制（简单的示例）
    const group = store.userInfo.user_group

    // 禁止学生访问审批页面或管理页面
    if (
        group === "stu" &&
        (to.path.includes("approve") || to.path.includes("classmanage"))
    ) {
        return next({ name: "NotFound" }) // 或跳转到无权限提示页
    }

    // 禁止教师访问管理员专属页面（如果有的话，这里举例）
    if (group === "tch" && to.path.includes("approveleave_mas")) {
        return next({ name: "NotFound" })
    }

    // 放行
    next()
})

export default router