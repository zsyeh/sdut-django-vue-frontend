<template>
    <div class="leave-detail" ref="leaveCardRef">
        <h2 class="title">请假条</h2>
        <div v-if="leave && userInfo" class="leave-content">
            <div class="header-info">
                <p>姓名：{{ leave.student_name }}</p>
                <p>学号：{{ leave.student_number }}</p>
                <p>班级：{{ leave.student_class }}</p>
                <p>学院：电气与电子工程学院</p>
            </div>

            <div class="leave-body">
                <p><strong>请假原因：</strong>{{ leave.reason }}</p>
                <p><strong>请假时间：</strong>{{ formattedLeaveDate }}</p>
                <p><strong>当前状态：</strong>{{ formattedStatus }}</p>
            </div>

            <div class="warning">
                <p>注：防伪二维码含有个人信息，请勿透漏给陌生人</p>
                <p>
                    除维护等特殊情况外无防伪二维码或二维码无法扫描查询均视为假条无效
                </p>
            </div>

            <div class="footer-info">
                <div class="qrcode-block">
                    <p class="qrcode-title">防伪二维码</p>
                    <img
                        v-if="qrcodeUrl"
                        :src="qrcodeUrl"
                        alt="防伪二维码"
                        class="qrcode-image"
                        @load="onImageLoad" 
                    />
                    <p v-else class="qrcode-hint">二维码加载中…</p>
                </div>

                <div class="stamp-sign">
                    <div class="stamp">
                        <span>团委盖章:</span>
                        <img
                            src="@/assets/stamp.png"
                            alt="stamp"
                            class="stamp-image"
                        />
                    </div>
                    <div class="sign">
                        <span>批准人:</span>
                        <img
                            v-if="signatureImage"
                            :src="signatureImage"
                            alt="签字"
                            class="sign-image"
                        />
                        <span class="sign-placeholder" v-else
                            >签字人：{{ leave.approver || '待定' }}</span
                        >
                    </div>
                </div>
            </div>

            <div class="actions" data-html2canvas-ignore="true">
                <el-button 
                    type="primary" 
                    size="small" 
                    @click="handleSaveImage" 
                    :loading="saving"
                >
                    保存图片
                </el-button>

                <template v-if="canApprove">
                    <el-button type="success" size="small" @click="handleApprove"
                        >批准</el-button
                    >
                    <el-button type="danger" size="small" @click="handleReject"
                        >拒绝</el-button
                    >
                </template>
                
                <el-button type="default" size="small" @click="closeDetail"
                    >关闭</el-button
                >
            </div>
        </div>
        <div v-else>
            <p>正在加载请假信息...</p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick } from "vue"
import { ElMessage } from "element-plus"
import request from "@/utils/request"
import { useUserStore } from "@/store/user"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import html2canvas from "html2canvas"

dayjs.extend(utc)

// 接收 autoDownload 属性
const props = defineProps({
    leave: {
        type: Object,
        required: true
    },
    autoDownload: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(["close", "refresh"])

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const leaveCardRef = ref<HTMLElement | null>(null)
const saving = ref(false)

const canApprove = computed(() => {
    const group = userInfo.value?.user_group
    const status = props.leave.status
    return (group === 'tch' || group === 'mas') && (status === 0 || status === 4)
})

const qrcodeUrl = ref("")

const signatures = import.meta.glob("@/assets/signatures/*.png", { eager: true })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const signatureMap: Record<string, string> = {}
for (const path in signatures) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fileName = path.split("/").pop()?.split(".")[0] || ""
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signatureMap[fileName] = (signatures[path] as any).default
}

// 核心逻辑：监听 uuid 变化加载二维码，并在加载完成后检查是否需要自动下载
watch(
    () => props.leave.verification_uuid,
    async (uuid) => {
        if (!uuid) {
            // 如果没有 uuid (比如未批准)，且要求自动下载，则直接下载不带二维码的
            if (props.autoDownload) {
                await nextTick()
                handleSaveImage()
            }
            return
        }
        try {
            const res = await request.get(
                `/view-leave/qrcode/${uuid}/`,
                { responseType: "blob" }
            )
            qrcodeUrl.value = URL.createObjectURL(res as unknown as Blob)
            
            // 注意：这里我们不立即下载，而是等待 <img @load> 事件触发 onImageLoad
            // 这样能确保二维码图片真正渲染到 DOM 上后再截图，防止白屏
        } catch (err) {
            console.error("二维码加载失败:", err)
        }
    },
    { immediate: true }
)

// 图片加载完毕的回调
const onImageLoad = async () => {
    if (props.autoDownload) {
        // 等待一下 DOM 渲染
        await nextTick()
        handleSaveImage()
    }
}

const formatDate = (utcStr: string) => {
    if (!utcStr) return "未知时间"
    const date = dayjs.utc(utcStr).local()
    return `${date.format("YYYY-MM-DD HH:mm")}`
}

const formattedLeaveDate = computed(() => {
    return `从 ${formatDate(props.leave.start_date)} 到 ${formatDate(props.leave.end_date)}`
})

const formattedStatus = computed(() => {
    switch (props.leave.status) {
        case 0: return "待批准"
        case 1: return "已批准"
        case 2: return "已驳回"
        case 3: return "已销假"
        case 4: return "待审核"
        case 5: return "已审核"
        default: return "未知状态"
    }
})

const signatureImage = computed(() => {
    return signatureMap[props.leave.approver] || ""
})

const handleSaveImage = async () => {
    if (!leaveCardRef.value) return
    saving.value = true
    try {
        // 稍微延迟一下，确保样式完全应用
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const canvas = await html2canvas(leaveCardRef.value, {
            useCORS: true,
            scale: 2,
            backgroundColor: "#ffffff"
        })

        const link = document.createElement("a")
        link.href = canvas.toDataURL("image/png")
        link.download = `请假条_${props.leave.student_name}_${dayjs().format("YYYYMMDD")}.png`
        link.click()
        ElMessage.success("保存成功")
    } catch (error) {
        console.error("保存图片失败:", error)
        ElMessage.error("保存图片失败，请稍后重试")
    } finally {
        saving.value = false
    }
}

const handleApprove = async () => {
    try {
        await request.post("/approve-leave/", { leaveId: props.leave.id })
        ElMessage.success("请假已批准")
        emit("refresh") 
        emit("close")
    } catch (error) {
        ElMessage.error("批准失败")
    }
}

const handleReject = async () => {
    try {
        await request.post("/reject-leave/", { leaveId: props.leave.id })
        ElMessage.success("请假已拒绝")
        emit("refresh")
        emit("close")
    } catch (error) {
        ElMessage.error("拒绝失败")
    }
}

const closeDetail = () => {
    emit("close")
}
</script>

<style scoped>
.leave-detail {
    padding: 15px;
    max-width: 600px;
    margin: 0 auto;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    background-color: #fff;
    position: relative;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.title {
    text-align: center;
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: bold;
    color: #303133;
}

.header-info p, .leave-body p {
    margin: 8px 0;
    font-size: 15px;
    color: #606266;
}

.warning {
    margin: 20px 0;
    font-size: 12px;
    color: #f56c6c;
    background: #fef0f0;
    padding: 8px;
    border-radius: 4px;
}

.footer-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 30px;
    padding-bottom: 10px;
    border-bottom: 1px dashed #eee;
}

.qrcode-block {
    text-align: center;
}
.qrcode-image {
    width: 100px;
    height: 100px;
}

.stamp-sign {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
}

.sign-image, .stamp-image {
    width: 90px;
    height: auto;
    vertical-align: middle;
}

.actions {
    margin-top: 20px;
    text-align: center;
    display: flex;
    justify-content: center;
    gap: 15px;
}
</style>