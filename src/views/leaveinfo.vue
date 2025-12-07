<template>
    <div class="leave-info">
        <el-row>
            <el-col :span="24">
                <h2>我的请假信息</h2>

                <el-table
                    v-if="leaveRequests.length > 0"
                    :data="leaveRequests"
                    border
                    style="width: 100%"
                    :fit="true"
                >
                    <el-table-column
                        label="请假日期"
                        :formatter="formatLeaveDate"
                        width="300"
                    />
                    <el-table-column label="请假事由" prop="reason" />
                    <el-table-column
                        label="状态"
                        :formatter="formatStatus"
                        width="150"
                    />
                    <el-table-column label="操作" width="280">
                        <template #default="{ row }">
                            <el-button
                                v-if="row.status === 1 || row.status === 3 || row.status === 0 || row.status === 2 || row.status === 4 || row.status === 5"
                                type="primary"
                                size="small"
                                @click="viewLeaveDetail(row, false)"
                            >
                                查看
                            </el-button>

                            <el-button
                                v-if="row.status === 1 || row.status === 3"
                                type="warning"
                                size="small"
                                @click="viewLeaveDetail(row, true)"
                            >
                                下载
                            </el-button>

                            <el-button
                                v-if="row.status === 0"
                                type="danger"
                                size="small"
                                @click="cancelLeave(row.id)"
                            >
                                取消
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <p v-else>没有请假信息</p>

                <el-dialog
                    v-model="dialogVisible"
                    title="请假条详情"
                    width="650px"
                    align-center
                    destroy-on-close
                    @closed="onDialogClosed"
                >
                    <leave-detail
                        v-if="selectedLeave"
                        :leave="selectedLeave"
                        :auto-download="isAutoDownload"
                        @close="dialogVisible = false"
                        @refresh="fetchLeaveRequests"
                    />
                </el-dialog>

                <el-pagination
                    v-if="total > 0"
                    background
                    layout="prev, pager, next, sizes, total"
                    :total="total"
                    :page-size="pageSize"
                    :current-page="currentPage"
                    @current-change="onPageChange"
                    @size-change="onSizeChange"
                    style="margin-top: 20px; text-align: center"
                />
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { ref, onMounted } from "vue"
import request from "@/utils/request"
import LeaveDetail from "./LeaveDetail.vue"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { ElMessage, ElMessageBox } from "element-plus"

dayjs.extend(utc)

export default {
    name: "LeaveRequestList",
    components: { LeaveDetail },
    setup() {
        const leaveRequests = ref([])
        const selectedLeave = ref(null)
        const isAutoDownload = ref(false)
        // 新增：控制弹窗显示的变量
        const dialogVisible = ref(false)

        const currentPage = ref(1)
        const pageSize = ref(10)
        const total = ref(0)

        const formatDate = (utcStr) => {
            const date = dayjs(utcStr)
            return date.local().format("MM月DD日 HH时mm分")
        }
        const formatLeaveDate = (row) => {
            const start = formatDate(row.start_date)
            const end = formatDate(row.end_date)
            return `从${start}到${end}`
        }
        const formatStatus = (row) => {
            const s = Number(row.status)
            switch (s) {
                case 0: return "待批准"
                case 1: return "已批准"
                case 2: return row.reject_reason ? `已驳回: ${row.reject_reason}` : "已驳回"
                case 3: return "已销假"
                case 4: return "待审核"
                case 5: return "已审核"
                default: return "未知状态"
            }
        }

        const cancelLeave = async (leaveId) => {
            try {
                await ElMessageBox.confirm("确定要取消这条请假吗？", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                })
                await request.patch(`/cancel-leave/${leaveId}/`)
                ElMessage.success("取消成功")
                fetchLeaveRequests()
            } catch (error) {
                if (error !== "cancel") {
                    console.error("取消失败:", error)
                    ElMessage.error("取消失败，请稍后重试")
                }
            }
        }

        const fetchLeaveRequests = async () => {
            try {
                const resp = await request.get("/view-leave/", {
                    params: {
                        page: currentPage.value,
                        page_size: pageSize.value
                    }
                })
                leaveRequests.value = resp.results
                total.value = resp.count
            } catch (error) {
                console.error("获取请假信息失败:", error)
            }
        }

        // 修改：点击查看/下载时，打开弹窗
        const viewLeaveDetail = (row, autoDownload = false) => {
            selectedLeave.value = row
            isAutoDownload.value = autoDownload
            dialogVisible.value = true // 显示弹窗
        }

        // 修改：弹窗关闭动画结束后的清理
        const onDialogClosed = () => {
            selectedLeave.value = null
            isAutoDownload.value = false
        }

        const onPageChange = (page) => {
            currentPage.value = page
            fetchLeaveRequests()
        }
        const onSizeChange = (size) => {
            pageSize.value = size
            currentPage.value = 1
            fetchLeaveRequests()
        }

        onMounted(() => {
            fetchLeaveRequests()
        })

        return {
            leaveRequests,
            selectedLeave,
            isAutoDownload,
            dialogVisible, // 导出
            onDialogClosed, // 导出
            formatLeaveDate,
            formatStatus,
            viewLeaveDetail,
            cancelLeave,
            fetchLeaveRequests,
            currentPage,
            pageSize,
            total,
            onPageChange,
            onSizeChange
        }
    }
}
</script>

<style scoped>
.leave-info {
    padding: 20px;
}
h2 {
    margin-bottom: 20px;
    font-size: 22px;
    color: #333;
}
.el-table {
    width: 100%;
}
.el-table-column {
    text-align: center;
}
.el-button {
    margin-right: 5px;
    margin-left: 5px;
}
</style>