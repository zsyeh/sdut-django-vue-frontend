<template>
    <div class="mas-leave-list">
        <h2>全院请假审批列表</h2>

        <el-tabs v-model="activeTab" stretch>
            <el-tab-pane label="长假待审核" name="4"></el-tab-pane>
            <el-tab-pane label="普通待审批" name="0"></el-tab-pane>
            <el-tab-pane label="已批准" name="1"></el-tab-pane>
            <el-tab-pane label="已拒绝" name="2"></el-tab-pane>
            <el-tab-pane label="已销假" name="3"></el-tab-pane>
            <el-tab-pane label="已审核" name="5"></el-tab-pane>
        </el-tabs>

        <el-table
            :data="leaveRequests"
            border
            stripe
            style="width: 100%"
            v-loading="isLoading"
        >
            <el-table-column prop="student_name" label="学生" width="120" />
            
            <el-table-column prop="reason" label="请假事由" min-width="180" show-overflow-tooltip />
            
            <el-table-column label="开始日期" width="160">
                <template #default="{ row }">
                    {{ formatDate(row.start_date) }}
                </template>
            </el-table-column>
            
            <el-table-column label="结束日期" width="160">
                <template #default="{ row }">
                    {{ formatDate(row.end_date) }}
                </template>
            </el-table-column>

            <el-table-column label="处理人" width="120">
                <template #default="{ row }">
                    <el-tag v-if="row.approver" type="info" effect="plain">
                        {{ row.approver }}
                    </el-tag>
                    <span v-else class="text-gray-400">-</span>
                </template>
            </el-table-column>

            <el-table-column
                prop="status"
                label="状态"
                width="120"
                :formatter="formatStatus"
            />
            
            <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                    <template v-if="activeTab === '4'">
                        <el-button
                            type="success"
                            size="small"
                            @click="approveLeave(row.id)"
                            :loading="loadingMap[row.id]?.approving"
                            >批准</el-button
                        >
                        <el-button
                            type="danger"
                            size="small"
                            @click="rejectLeave(row.id)"
                            :loading="loadingMap[row.id]?.rejecting"
                            >拒绝</el-button
                        >
                    </template>
                    <span v-else class="text-gray-400 text-sm">已归档</span>
                </template>
            </el-table-column>
        </el-table>

       <el-pagination
            background
            layout="prev, pager, next, sizes, total, jumper"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="onPageChange"
            @size-change="onSizeChange"
            class="mt-4"
        />
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue"
import request from "@/utils/request"
import { ElMessage, ElMessageBox } from "element-plus"
import dayjs from "dayjs"

const leaveRequests = ref([])
const isLoading = ref(false)
const activeTab = ref("4") 
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loadingMap = reactive({})

function formatDate(iso) {
    if (!iso) return '-'
    return dayjs(iso).format('YYYY-MM-DD HH:mm')
}

function formatStatus(row) {
    const s = Number(row.status)
    switch (s) {
        case 0: return "普通待审批"
        case 1: return "已批准"
        case 2: return row.reject_reason ? `已驳回: ${row.reject_reason}` : "已驳回"
        case 3: return "已销假"
        case 4: return "长假待审核"
        case 5: return "已审核"
        default: return "未知状态"
    }
}

async function fetchData() {
    isLoading.value = true
    try {
        const resp = await request.get("/admin/leaves/", {
            params: {
                status: activeTab.value,
                page: currentPage.value,
                page_size: pageSize.value
            }
        })
        total.value = resp.count
        leaveRequests.value = resp.results
    } catch {
        ElMessage.error("获取列表失败")
    } finally {
        isLoading.value = false
    }
}

// 监听 Tab 切换，重置页码
watch(activeTab, () => {
    currentPage.value = 1
    fetchData()
})

// 分页事件
function onPageChange(p) { 
    currentPage.value = p; 
    fetchData() 
}

function onSizeChange(s) { 
    pageSize.value = s; 
    currentPage.value = 1; 
    fetchData() 
}

async function approveLeave(id) {
    loadingMap[id] = loadingMap[id] || {}
    loadingMap[id].approving = true
    try {
        await request.patch(`/admin/mas-approve-leave/${id}/`, {})
        ElMessage.success("批准成功")
        fetchData()
    } catch {
        ElMessage.error("批准失败")
    } finally {
        loadingMap[id].approving = false
    }
}

async function rejectLeave(id) {
    try {
        const { value: reason } = await ElMessageBox.prompt("请输入拒绝理由", "拒绝长假", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            inputValidator: (v) => !!v.trim() || "理由不能为空"
        })
        loadingMap[id] = loadingMap[id] || {}
        loadingMap[id].rejecting = true
        await request.post(`/admin/reject-leave/${id}/`, { reject_reason: reason })
        ElMessage.success("拒绝成功")
        fetchData()
    } catch (err) {
        if (err !== "cancel") ElMessage.error("拒绝失败")
    } finally {
        loadingMap[id].rejecting = false
    }
}

onMounted(fetchData)
</script>

<style scoped>
.mas-leave-list { padding: 20px; }
h2 { margin-bottom: 20px; font-size: 24px; }
.mt-4 { margin-top: 20px; text-align: center; }
.text-gray-400 { color: #9ca3af; }
.text-sm { font-size: 0.875rem; }
</style>