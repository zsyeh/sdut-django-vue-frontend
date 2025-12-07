import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"
import HomeView from "@/views/HomeView.vue"
import LeaveVerify from "@/views/LeaveVerify.vue"

export const routes = [
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: () => import("@/views/NotFound.vue")
    },
    {
        path: "/askleave",
        name: "askleave",
        component: () => import("@/views/askleave.vue")
    },
    {
        path: "/leaveinfo",
        name: "leaveinfo",
        component: () => import("@/views/leaveinfo.vue")
    },
    {
        path: "/userinfo",
        name: "userinfo",
        component: () => import("@/views/userinfo.vue")
    },
    {
        path: "/tchinfo",
        name: "tchinfo",
        component: () => import("@/views/tchinfo.vue")
    },
    {
        path: "/",
        name: "login",
        component: () => import("@/views/Login.vue")
    },
    {
        path: "/masinfo",
        name: "masinfo",
        component: () => import("@/views/masinfo.vue")
    },
    {
        path: "/approveleave",
        name: "approveleave",
        component: () => import("@/views/approveleave.vue")
    },
    {
        path: "/leavedetail",
        name: "leavedetail",
        component: () => import("@/views/LeaveDetail.vue")
    },
    {
        path: "/approveleave_mas",

        name: "approveleave_mas",
        component: () => import("@/views/approveleave_mas.vue")
    },
    {
        path: "/classmanage",
        name: "classmanage",
        component: () => import("@/views/classmanage.vue")
    },
    {
        path: "/leave/verify/:uuid",
        name: "LeaveVerify",
        component: LeaveVerify,
        props: true
    },
    {
        path: "/statistics",
        name: "statistics",
        component: () => import("@/views/Statistics.vue")
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
