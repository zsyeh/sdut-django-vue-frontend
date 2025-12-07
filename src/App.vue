<template>
    <div class="common-layout">
        <el-container class="layout-container">
            <el-header class="header">
                <div class="header-content">
                    <span class="logo" @click="confirmLogout">请假页</span>
                    
                    <div class="theme-switch" @click="toggleTheme">
                        <span v-if="isDark" title="切换亮色模式">🌞</span>
                        <span v-else title="切换暗色模式">🌙</span>
                    </div>
                </div>
            </el-header>

            <el-main>
                <router-view />
            </el-main>

            <el-footer class="navibar">
                <div v-if="isStu">
                    <Stu_Navbar />
                </div>
                <div v-else-if="isTch">
                    <Tch_Navbar />
                </div>
                <div v-else-if="isMas">
                    <Mas_Navbar />
                </div>
                <div
                    class="copyright"
                    :class="{ 'copyright-small': isStu || isTch || isMas }"
                >
                    © Copyright 2025 eh all rights reserved.
                </div>
            </el-footer>
        </el-container>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue"
import { useRouter } from "vue-router"
import { ElMessageBox, ElMessage } from "element-plus"
import { useUserStore } from "@/store/user"

import Stu_Navbar from "./views/Stu_Navbar.vue"
import Tch_Navbar from "./views/Tch_Navbar.vue"
import Mas_Navbar from "./views/Mas_Navbar.vue"

const store = useUserStore()
const router = useRouter()

// ... (原有的 onMounted 和 userGroup 逻辑保持不变) ...
onMounted(async () => {
    await store.initializeUser()
    // 初始化主题
    initTheme()
})

const userGroup = computed(() => store.userInfo?.user_group)
const isStu = computed(() => userGroup.value === "stu")
const isTch = computed(() => userGroup.value === "tch")
const isMas = computed(() => userGroup.value === "mas")

// --- 【新增】主题切换逻辑 ---
const isDark = ref(false)

const initTheme = () => {
    // 读取本地存储或系统偏好
    const savedTheme = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        isDark.value = true
        document.documentElement.classList.add('dark')
    } else {
        isDark.value = false
        document.documentElement.classList.remove('dark')
    }
}

const toggleTheme = () => {
    isDark.value = !isDark.value
    if (isDark.value) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
    } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
    }
}
// --------------------------

async function confirmLogout() {
    // ... (保持不变) ...
    try {
        await ElMessageBox.confirm("确认要取消登录吗？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
        })
        store.clearUserInfo()
        router.push("/")
        ElMessage.success("已退出登录")
    } catch { }
}
</script>

<style scoped>
/* ... (原有的样式) ... */
.layout-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.header {
    background-color: #003366;
    color: #fff;
    padding: 10px 20px;
    display: flex;
    align-items: center;
}

/* 修改 header-content 为 flex 布局，撑开两端 */
.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between; /* 让 Logo 和 切换按钮 分布在两端 */
    width: 100%;
}

.logo {
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
}

/* 【新增】切换按钮样式 */
.theme-switch {
    cursor: pointer;
    font-size: 20px;
    padding: 5px;
    user-select: none;
    transition: transform 0.3s;
}
.theme-switch:hover {
    transform: scale(1.1);
}

/* ... (其余样式保持不变) ... */

.navibar {
    /* 修改这里：使用 Element Plus 的背景色变量 */
    background-color: var(--el-bg-color-overlay); 
    padding: 0;
    position: relative;
    /* 可选：添加一条顶部边框，增加层次感 */
    border-top: 1px solid var(--el-border-color-light); 
}

/* ... 版权信息样式 ... */
.navibar .copyright {
    /* ... */
    /* 修改这里：文字颜色也使用变量 */
    color: var(--el-text-color-secondary); 
    /* ... */
}
</style>