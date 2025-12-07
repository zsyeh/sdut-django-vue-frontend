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
                        <router-link to="/approveleave">假条批准</router-link>
                    </el-menu-item>
                    <el-menu-item index="3">
                        <router-link to="/tchinfo">个人信息</router-link>
                    </el-menu-item>
                    <el-menu-item index="4">
                        <router-link to="/classmanage">学生管理</router-link>
                    </el-menu-item>
                </el-menu>
            </el-col>
        </el-row>
    </el-footer>
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue'
// 无需额外逻辑，保持 setup 语法一致性
</script>

<style scoped>
/* 底部固定导航栏样式 */
.navbar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    /* 【修改】背景色改为跟随主题 */
    background-color: var(--el-bg-color-overlay);
    /* 【修改】文字颜色 */
    color: var(--el-text-color-primary);
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    padding: 0;
    margin: 0;
    /* 可选：添加顶部边框增加层次感 */
    border-top: 1px solid var(--el-border-color-light);
}

/* 容器 */
.navbar-container {
    width: 100%;
    padding: 0;
    margin: 0;
}

/* 菜单样式 */
.navbar-menu {
    display: flex;
    justify-content: space-evenly;
    padding: 0;
    margin: 0;
    /* 【修改】背景色改为跟随主题 */
    background-color: var(--el-bg-color-overlay);
    border-radius: 0;
    white-space: nowrap; 
    border-bottom: none; /* 去掉默认边框 */
}

/* 隐藏 Element-Plus 自动添加的 overflow 按钮 */
.navbar-menu .el-menu__overflowed-button,
.navbar-menu .el-menu__overflowed-dropdown {
    display: none !important;
}

/* 单个菜单项样式 */
.navbar-menu .el-menu-item {
    font-size: 16px;
    font-weight: 500;
    border: none;
    text-align: center;
    /* 【修改】默认文字颜色 */
    color: var(--el-text-color-primary);
}

/* 鼠标悬停效果 */
.navbar-menu .el-menu-item:hover {
    /* 【修改】悬停时文字颜色和背景色 */
    color: var(--el-color-primary);
    text-decoration: none;
    background-color: var(--el-fill-color-light);
}

/* 激活态 */
.navbar-menu .el-menu-item.is-active {
    /* 【修改】激活状态背景色 */
    background-color: var(--el-color-primary-light-9);
    /* 【修改】激活状态文字颜色 */
    color: var(--el-color-primary);
}

/* 链接样式修复：让 router-link 继承颜色并撑满容器 */
.navbar-menu .el-menu-item a {
    color: inherit;
    text-decoration: none;
    display: block;
    width: 100%;
    height: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .navbar-menu .el-menu-item {
        padding: 0 15px;
        font-size: 14px;
    }
}
</style>