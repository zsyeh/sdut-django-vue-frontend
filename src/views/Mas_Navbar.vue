<template>
    <el-footer class="navbar">
        <el-row
            type="flex"
            justify="center"
            align="middle"
            class="navbar-container"
        >
            <el-col :span="24">
                <el-menu
                    mode="horizontal"
                    class="navbar-menu"
                    :ellipsis="false"
                >
                    <template #overflowed-indicator></template>

                    <el-menu-item index="1">
                        <router-link to="/approveleave_mas">假条批准</router-link>
                    </el-menu-item>
                    
                    <el-menu-item index="3">
                        <router-link to="/tchinfo">个人信息</router-link>
                    </el-menu-item>
                    
                    <el-menu-item index="4">
                        <router-link to="/classmanage">学生管理</router-link>
                    </el-menu-item>

                    <el-menu-item index="5">
                        <router-link to="/statistics">数据分析</router-link>
                    </el-menu-item>
                </el-menu>
            </el-col>
        </el-row>
    </el-footer>
</template>

<script lang="ts" setup>
// 无需额外逻辑
</script>

<style scoped>
/* 底部固定导航栏样式 (适配暗黑模式) */
.navbar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: var(--el-bg-color-overlay);
    color: var(--el-text-color-primary);
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    padding: 0;
    margin: 0;
    border-top: 1px solid var(--el-border-color-light);
}

.navbar-container {
    width: 100%;
    padding: 0;
    margin: 0;
}

.navbar-menu {
    display: flex;
    justify-content: space-evenly;
    padding: 0;
    margin: 0;
    background-color: var(--el-bg-color-overlay);
    border-radius: 0;
    white-space: nowrap;
    border-bottom: none;
}

/* 隐藏溢出按钮 */
.navbar-menu .el-menu__overflowed-button,
.navbar-menu .el-menu__overflowed-dropdown {
    display: none !important;
}

.navbar-menu .el-menu-item {
    font-size: 16px;
    font-weight: 500;
    border: none;
    text-align: center;
    color: var(--el-text-color-primary);
}

.navbar-menu .el-menu-item:hover {
    color: var(--el-color-primary);
    background-color: var(--el-fill-color-light);
}

.navbar-menu .el-menu-item.is-active {
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
}

.navbar-menu .el-menu-item a {
    color: inherit;
    text-decoration: none;
    display: block;
    width: 100%;
    height: 100%;
}

@media (max-width: 768px) {
    .navbar-menu .el-menu-item {
        padding: 0 10px; /* 移动端稍微减小间距以容纳更多按钮 */
        font-size: 14px;
    }
}
</style>