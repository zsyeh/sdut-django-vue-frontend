// src/utils/request.ts
import axios from "axios"
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios"

const BASE_URL = import.meta.env.VITE_REQUEST_BASE_URL as string
const BASE_PREFIX = import.meta.env.VITE_REQUEST_BASE_PREFIX as string
const TIMEOUT = Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 10000

// 【新增】定义白名单，不需要携带 Token 的接口
const WHITE_LIST = ["/token/"]

const request = axios.create({
    baseURL: `${BASE_URL}${BASE_PREFIX}`,
    timeout: TIMEOUT
})

// 请求拦截器
request.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("access_token")
        
        // 【修改】核心逻辑：只有 Token 存在 且 请求 URL 不在白名单中，才添加 Authorization
        // config.url 可能包含 undefined，所以要用 config.url || ""
        const isWhitelisted = WHITE_LIST.some(url => config.url?.includes(url))

        if (token && config.headers && !isWhitelisted) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器保持不变...
request.interceptors.response.use(
    (response: AxiosResponse) => {
        return (response.data && (response.data as any).data) ?? response.data
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default request