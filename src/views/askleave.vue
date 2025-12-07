<template>
    <el-card class="leave-request-card">
        <h3>请假申请</h3>

        <el-form
            :model="leaveForm"
            :rules="rules"
            ref="formRef"
            :label-width="labelPosition === 'top' ? 'auto' : '80px'"
            :label-position="labelPosition"
            size="large"
            @submit.prevent="submitLeaveRequest"
        >
            <el-form-item label="开始" prop="start_date">
                <el-date-picker
                    ref="startDateRef"
                    v-model="leaveForm.start_date"
                    type="datetime"
                    placeholder="点击选择时间"
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DD HH:mm"
                    style="width: 100%"
                    :editable="false" 
                ></el-date-picker>
            </el-form-item>

            <el-form-item label="结束" prop="end_date">
                <el-date-picker
                    ref="endDateRef"
                    v-model="leaveForm.end_date"
                    type="datetime"
                    placeholder="点击选择时间"
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DD HH:mm"
                    style="width: 100%"
                    :editable="false"
                ></el-date-picker>
            </el-form-item>

            <div v-if="durationStr" class="duration-feedback">
                预计请假时长：<span :class="{ 'long-leave-warning': isLongLeave }">{{ durationStr }}</span>
            </div>

            <el-form-item label="原因" prop="reason">
                <div class="quick-tags">
                    <el-tag 
                        v-for="tag in quickReasons" 
                        :key="tag"
                        type="info" 
                        effect="plain"
                        round
                        @click="selectReason(tag)"
                        class="reason-tag"
                    >
                        {{ tag }}
                    </el-tag>
                </div>
                
                <el-input
                    v-model="leaveForm.reason"
                    type="textarea"
                    placeholder="可点击上方标签或手动输入..."
                    :rows="3"
                    resize="none"
                ></el-input>
            </el-form-item>

            <el-form-item>
                <div class="action-buttons">
                    <el-button
                        type="primary"
                        :loading="isSubmitting"
                        @click="submitLeaveRequest"
                        class="submit-btn"
                    >
                        提交
                    </el-button>
                    <el-button @click="resetForm" class="reset-btn">重置</el-button>
                </div>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted, computed, nextTick, watch } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import type { FormInstance, FormRules } from 'element-plus'
import request from "@/utils/request"
import dayjs from "dayjs"

const formRef = ref<FormInstance>()
const startDateRef = ref()
const endDateRef = ref()
const labelPosition = ref('right')
const isSubmitting = ref(false)

const leaveForm = reactive({
    start_date: null,
    end_date: null,
    reason: ""
})

const quickReasons = ["身体不适", "家中急事", "看病就医", "外出实习", "补办证件"]

const rules = reactive<FormRules>({
    start_date: [{ required: true, message: "请选择开始时间", trigger: "change" }],
    end_date: [{ required: true, message: "请选择结束时间", trigger: "change" }],
    reason: [{ required: true, message: "请输入或选择原因", trigger: "blur" }]
})

// --- 【新增功能】长假监控逻辑 ---
// 监听日期变化，如果时长 >= 6天，弹出警告
watch(
    [() => leaveForm.start_date, () => leaveForm.end_date],
    ([newStart, newEnd]) => {
        if (newStart && newEnd) {
            const start = dayjs(newStart)
            const end = dayjs(newEnd)
            const diffDays = end.diff(start, 'day', true)

            // 6天(含)以上触发弹窗
            if (diffDays >= 6) {
                ElMessageBox.alert(
                    '您申请的请假时长已达到或超过 6 天！\n\n根据规定，此类长假需要进行【二次审批】（通常需院级审核）。\n请务必检查请假时长是否设置正确，并提前联系辅导员说明情况。',
                    '⚠️ 长假特别提示',
                    {
                        confirmButtonText: '我已知晓',
                        type: 'warning',
                        draggable: true,
                        center: true
                    }
                ).catch(() => {}) // 捕获可能的取消操作，防止控制台报错
            }
        }
    }
)

const isLongLeave = computed(() => {
    if (!leaveForm.start_date || !leaveForm.end_date) return false
    const diff = dayjs(leaveForm.end_date).diff(dayjs(leaveForm.start_date), 'day', true)
    return diff >= 6
})
// ------------------------------

// 强制禁用输入框的键盘交互
const disableMobileKeyboard = (pickerRef: any) => {
    if (!pickerRef) return
    nextTick(() => {
        const inputEl = pickerRef.$el.querySelector('input')
        if (inputEl) {
            inputEl.setAttribute('inputmode', 'none')
            inputEl.setAttribute('readonly', 'readonly')
        }
    })
}

const selectReason = (reason: string) => {
    if (leaveForm.reason) {
        leaveForm.reason += `，${reason}`
    } else {
        leaveForm.reason = reason
    }
}

const durationStr = computed(() => {
    if (!leaveForm.start_date || !leaveForm.end_date) return ""
    const start = dayjs(leaveForm.start_date)
    const end = dayjs(leaveForm.end_date)
    const diffHours = end.diff(start, 'hour', true)
    
    if (diffHours <= 0) return "时间选择有误"
    
    const days = Math.floor(diffHours / 24)
    const hours = (diffHours % 24).toFixed(1)
    
    if (days > 0) {
        return `${days}天 ${hours}小时`
    } else {
        return `${hours}小时`
    }
})

const handleResize = () => {
    labelPosition.value = window.innerWidth < 768 ? 'top' : 'right'
}

const submitLeaveRequest = async () => {
    if (isSubmitting.value) return
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
        if (valid) {
            // 提交前再次校验长假逻辑（可选，双重保险）
            if (isLongLeave.value) {
                try {
                    await ElMessageBox.confirm(
                        '您正在提交一个超过 6 天的长假申请，请确认已与辅导员沟通过？',
                        '提交确认',
                        {
                            confirmButtonText: '确认提交',
                            cancelButtonText: '再检查一下',
                            type: 'warning'
                        }
                    )
                } catch {
                    return // 用户点击取消，终止提交
                }
            }

            try {
                isSubmitting.value = true
                await request.post("/request-leave/", leaveForm)
                ElMessage.success("请假申请提交成功！")
                resetForm()
            } catch (error) {
                console.error("提交出错:", error)
                ElMessage.error("提交失败，请稍后重试")
            } finally {
                setTimeout(() => { isSubmitting.value = false }, 1000)
            }
        }
    })
}

const resetForm = () => {
    if (!formRef.value) return
    formRef.value.resetFields()
}

onMounted(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    
    disableMobileKeyboard(startDateRef.value)
    disableMobileKeyboard(endDateRef.value)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.leave-request-card {
    width: 100%;
    max-width: 600px;
    margin: 20px auto;
    border-radius: 8px;
    overflow: visible; 
}

h3 {
    text-align: center;
    margin-bottom: 20px;
    color: #303133;
}

.quick-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
}

.reason-tag {
    cursor: pointer;
    user-select: none;
    transition: all 0.2s;
}

.reason-tag:active {
    background-color: #e9e9eb;
    transform: scale(0.95);
}

.duration-feedback {
    text-align: right;
    font-size: 14px;
    color: #909399;
    margin-bottom: 18px;
    padding-right: 10px;
}
.duration-feedback span {
    color: #e6a23c;
    font-weight: bold;
}
/* 长假时文字变红 */
.duration-feedback span.long-leave-warning {
    color: #f56c6c;
}

.action-buttons {
    display: flex;
    width: 100%;
    gap: 15px;
    margin-top: 10px;
}

.submit-btn, .reset-btn {
    flex: 1;
    height: 44px;
    font-size: 16px;
}

@media (max-width: 480px) {
    .leave-request-card {
        margin: 10px auto;
        border: none;
        box-shadow: none;
    }

    :deep(.el-date-editor .el-input__inner) {
        pointer-events: none;
    }
}
</style>