<template>
    <div class="statistics-container" v-loading="loading">
        <div class="header-section">
            <h2 class="page-title">📊 数据分析看板</h2>
            <div class="subtitle">实时监控 / 趋势预测 / 分布统计</div>
        </div>

        <el-card class="chart-card full-width" shadow="hover">
            <template #header>
                <div class="card-header">
                    <span class="header-title">请假趋势与智能预测 (滤波算法)</span>
                    <el-tag type="success" effect="dark" round> 预测</el-tag>
                </div>
            </template>
            <div ref="trendChartRef" class="chart-box big-chart"></div>
        </el-card>

        <div class="row-charts">
            <el-card class="chart-card" shadow="hover">
                <template #header><span class="header-title">各班级请假占比</span></template>
                <div ref="classChartRef" class="chart-box"></div>
            </el-card>

            <el-card class="chart-card" shadow="hover">
                <template #header><span class="header-title">请假时长结构分布</span></template>
                <div ref="durationChartRef" class="chart-box"></div>
            </el-card>
        </div>

        <el-card class="chart-card full-width" shadow="hover">
            <template #header>
                <div class="card-header">
                    <span class="header-title">请假高发期热力图 (周 x 月)</span>
                    <el-tooltip content="颜色越深代表该时间段请假人数越多" placement="top">
                        <el-icon><InfoFilled /></el-icon>
                    </el-tooltip>
                </div>
            </template>
            <div ref="heatmapChartRef" class="chart-box big-chart"></div>
        </el-card>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue"
import * as echarts from "echarts"
import request from "@/utils/request"
import { ElMessage } from "element-plus"
import { InfoFilled } from "@element-plus/icons-vue"

const loading = ref(false)

// 图表 DOM 引用
const trendChartRef = ref<HTMLElement>()
const classChartRef = ref<HTMLElement>()
const durationChartRef = ref<HTMLElement>()
const heatmapChartRef = ref<HTMLElement>()

// ECharts 实例变量
let trendChart: echarts.ECharts | null = null
let classChart: echarts.ECharts | null = null
let durationChart: echarts.ECharts | null = null
let heatmapChart: echarts.ECharts | null = null

// --- 1. 获取后端数据 ---
const fetchData = async () => {
    loading.value = true
    try {
        // 调用后端 StatisticsDataView 接口
        const res: any = await request.get("/statistics/dashboard/")
        
        // 等待 DOM 更新后再渲染，防止图表宽高计算错误
        await nextTick()
        
        // 初始化各个图表
        initTrendChart(res.trend_data)
        initClassChart(res.class_stats)
        initDurationChart(res.duration_stats)
        initHeatmapChart(res.heatmap_data)
        
    } catch (error) {
        console.error("获取统计数据失败", error)
        ElMessage.error("数据加载失败，请检查网络或权限")
    } finally {
        loading.value = false
    }
}

// --- 2. 趋势预测图 (折线图) ---
const initTrendChart = (data: any) => {
    if (!trendChartRef.value) return
    trendChart = echarts.init(trendChartRef.value)
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } }
        },
        legend: { data: ['实际申请数', '趋势预测(滤波)'], bottom: 0 },
        grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.dates,
            axisLine: { lineStyle: { color: '#999' } }
        },
        yAxis: { 
            type: 'value',
            splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
        },
        series: [
            {
                name: '实际申请数',
                type: 'line',
                data: data.real_values,
                smooth: true,
                showSymbol: false,
                lineStyle: { width: 1, color: '#909399' }, 
                areaStyle: { opacity: 0.1, color: '#909399' }
            },
            {
                name: '趋势预测(滤波)',
                type: 'line',
                data: data.predict_values,
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 3, color: '#409EFF', shadowBlur: 10, shadowColor: 'rgba(64,158,255,0.5)' },
                itemStyle: { color: '#409EFF' }
            }
        ]
    }
    trendChart.setOption(option)
}

// --- 3. 班级分布图 (饼图) ---
// src/views/Statistics.vue

// ... 其他代码 ...

// 2. 初始化班级分布图 (优化版：玫瑰图 + 滚动图例)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initClassChart = (data: any) => {
    if (!classChartRef.value) return
    classChart = echarts.init(classChartRef.value)

    // 1. 数据预处理：按数量从大到小排序，让玫瑰图形状更协调
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortedData = data.sort((a: any, b: any) => (b.value || 0) - (a.value || 0))

    const option = {
        // 高级质感配色 (莫兰迪色系)
        color: [
            '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', 
            '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
        ],
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            textStyle: { color: '#333' },
            // 自定义 Tooltip 格式，显示更清晰
            formatter: (params: any) => {
                return `
                    <div style="font-weight: 600; margin-bottom: 4px;">${params.marker} ${params.name}</div>
                    <div style="display: flex; justify-content: space-between; gap: 15px;">
                        <span>人数:</span>
                        <span style="font-weight: bold;">${params.value}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; gap: 15px;">
                        <span>占比:</span>
                        <span style="font-weight: bold;">${params.percent}%</span>
                    </div>
                `
            }
        },
        // 侧边滚动图例，解决班级过多的问题
        legend: {
            type: 'scroll',
            orient: 'vertical',
            right: 10,
            top: 20,
            bottom: 20,
            icon: 'circle',
            itemWidth: 10,
            itemHeight: 10,
            itemGap: 15,
            textStyle: { color: '#666' },
            pageIconColor: '#409EFF',
            pageTextStyle: { color: '#999' }
        },
        series: [
            {
                name: '班级分布',
                type: 'pie',
                // 内半径 20，外半径 120 (根据容器大小适配)
                radius: [20, '75%'],
                // 图表位置偏左，给右侧图例留出空间
                center: ['40%', '50%'],
                // 【核心优化】开启玫瑰图模式：半径表示数值大小
                roseType: 'radius',
                itemStyle: {
                    borderRadius: 6, // 圆角扇区
                    borderColor: '#fff',
                    borderWidth: 1.5
                },
                // 默认标签不显示，保持界面整洁
                label: {
                    show: false
                },
                // 悬停高亮配置
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#409EFF',
                        // 悬停时显示：班级名 + 换行 + 人数
                        formatter: '{b}\n{c}人'
                    },
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.2)'
                    }
                },
                data: sortedData
            }
        ]
    }
    classChart.setOption(option)
}

// ... 其他代码 ...

// --- 4. 时长分布图 (柱状图) ---
const initDurationChart = (data: any) => {
    if (!durationChartRef.value) return
    durationChart = echarts.init(durationChartRef.value)

    const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: {
            type: 'category',
            data: data.map((item: any) => item.name),
            axisTick: { alignWithLabel: true }
        },
        yAxis: { type: 'value' },
        series: [
            {
                name: '数量',
                type: 'bar',
                barWidth: '40%',
                data: data.map((item: any) => ({
                    value: item.value,
                    itemStyle: {
                        // 动态颜色：长假用红色警示，短假用绿色
                        color: item.name.includes('3天') ? '#F56C6C' : (item.name.includes('1-3天') ? '#E6A23C' : '#67C23A')
                    }
                })),
                label: { show: true, position: 'top' }
            }
        ]
    }
    durationChart.setOption(option)
}

// --- 5. 热力图 (核心高级功能) ---
const initHeatmapChart = (rawData: any) => {
    if (!heatmapChartRef.value) return
    heatmapChart = echarts.init(heatmapChartRef.value)

    // 坐标轴配置
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    // 后端 ExtractWeekDay: 1=周日, 2=周一 ... 7=周六
    // 我们希望图表从周一显示到周日，或者周日到周六。这里映射为 ECharts 索引
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

    // 数据转换：将后端 [{month:1, weekday:2, count:5}] 转为 [[x, y, value]]
    const data = rawData.map((item: any) => {
        // x轴: 月份 (month - 1)
        // y轴: 星期 (weekday - 1)
        return [item.month - 1, item.weekday - 1, item.count || item.value]
    })

    // 找出最大值，用于设置 visualMap 的范围
    const maxVal = Math.max(...data.map((i: any) => i[2]), 5) // 默认至少为5

    const option = {
        tooltip: { position: 'top' },
        grid: { height: '60%', top: '10%' },
        xAxis: { type: 'category', data: months, splitArea: { show: true } },
        yAxis: { type: 'category', data: days, splitArea: { show: true } },
        visualMap: {
            min: 0,
            max: maxVal,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '5%',
            inRange: {
                color: ['#f0f9ff', '#bae6fd', '#0ea5e9', '#0284c7'] // 浅蓝到深蓝渐变
            }
        },
        series: [{
            name: '请假频次',
            type: 'heatmap',
            data: data,
            label: { show: true },
            emphasis: {
                itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' }
            }
        }]
    }
    heatmapChart.setOption(option)
}

// 响应式调整
const handleResize = () => {
    trendChart?.resize()
    classChart?.resize()
    durationChart?.resize()
    heatmapChart?.resize()
}

onMounted(() => {
    fetchData()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    trendChart?.dispose()
    classChart?.dispose()
    durationChart?.dispose()
    heatmapChart?.dispose()
})
</script>

<style scoped>
.statistics-container {
    padding: 24px;
    background-color: #f5f7fa; /* 浅灰底色 */
    min-height: 100vh;
}

.header-section {
    margin-bottom: 24px;
}

.page-title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
}

.subtitle {
    font-size: 14px;
    color: #909399;
}

.chart-card {
    border-radius: 12px;
    margin-bottom: 24px;
    border: none; /* 去掉边框，用阴影代替 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* 柔和阴影 */
    transition: transform 0.3s ease;
}

.chart-card:hover {
    transform: translateY(-2px); /* 悬浮微动效 */
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-title {
    font-weight: bold;
    font-size: 16px;
    color: #333;
}

.chart-box {
    height: 320px;
    width: 100%;
}

.big-chart {
    height: 420px;
}

/* 布局：第二行双图并排 */
.row-charts {
    display: flex;
    gap: 24px;
}

.row-charts .chart-card {
    flex: 1;
    min-width: 0; /* 防止 flex 子项溢出 */
}

/* 移动端适配 */
@media (max-width: 768px) {
    .row-charts {
        flex-direction: column;
    }
    .chart-box {
        height: 280px;
    }
    .big-chart {
        height: 300px;
    }
}
</style>