<template>
    <el-footer class="navbar">
        <el-row type="flex" justify="center" align="middle" class="navbar-container">
            <el-col :span="24">
                <el-menu
                    mode="horizontal"
                    class="navbar-menu"
                    :ellipsis="false" 
                >
                    <el-menu-item index="1">
                        <router-link to="/askleave">提交请假</router-link>
                    </el-menu-item>
                    <el-menu-item index="2">
                        <router-link to="/leaveinfo">查询请假信息</router-link>
                    </el-menu-item>
                    <el-menu-item index="3">
                        <router-link to="/userinfo">个人信息</router-link>
                    </el-menu-item>
                </el-menu>
            </el-col>
        </el-row>
    </el-footer>
</template>

<script lang="ts" setup>
// script 部分不需要动
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
}

/* 菜单样式 */
.navbar-menu {
    display: flex;
    justify-content: space-evenly;
    padding: 0;
    margin: 0;
    /* 【修改】菜单背景色改为透明或跟随主题 */
    background-color: var(--el-bg-color-overlay);
    border-radius: 0;
    border-bottom: none; /* 去掉默认边框 */
    white-space: nowrap;
}

/* 菜单项样式 */
.navbar-menu .el-menu-item {
    font-size: 16px;
    font-weight: 500;
    border: none;
    text-align: center;
    /* 【修改】默认文字颜色 */
    color: var(--el-text-color-primary);
}

/* 悬停效果 */
.navbar-menu .el-menu-item:hover {
    color: var(--el-color-primary); /* 使用主题主色（蓝色） */
    text-decoration: none; /* 去掉下划线，Element风格一般不需要 */
    /* 【修改】悬停背景色 */
    background-color: var(--el-fill-color-light); 
}

/* 激活态 */
.navbar-menu .el-menu-item.is-active {
    /* 【修改】激活背景色 */
    background-color: var(--el-color-primary-light-9);
    /* 【修改】激活文字颜色 */
    color: var(--el-color-primary);
}

/* 链接样式修复：Vue Router 的 link 默认会有颜色，需要继承 */
.navbar-menu .el-menu-item a {
    color: inherit;
    text-decoration: none;
    display: block;
    width: 100%;
    height: 100%;
}

@media (max-width: 768px) {
    .navbar-menu .el-menu-item {
        padding: 0 15px;
        font-size: 14px;
    }
}
</style>