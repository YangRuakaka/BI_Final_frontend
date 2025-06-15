import dataService from '../../service/dataService.js'
import pipeService from '../../service/pipeService.js';
import * as echarts from 'echarts';

export default {
    name: 'AnalysisView',
    components: {
    },
    props: {
    },
    computed: {
        hasResults() {
            return this.tableData.length > 0;
        }
    },
    data() {
        return {
            // 系统时间
            systemTime: null,
            
            // 聊天相关数据
            userInput: '',
            messages: [
                {
                    type: 'bot',
                    content: '您好！我是数据分析助手，有什么可以帮您分析的吗？'
                }
            ],

            // 查询相关数据
            queryForm: {
                dateRange: ['2019-06-13', '2019-06-15'],
                topics: [],
                categories: [],
                titleLengthRange: [10, 50],
                contentLengthRange: [100, 1000],
                users: []
            },

            // 选项数据
            topicOptions: [],
            categoryOptions: [],
            userOptions: [],
            userLoading: false,

            // 查询结果数据
            queryLoading: false,
            tableData: [],
            currentPage: 1,
            pageSize: 20,
            total: 0,

            // 图表相关
            activeTab: 'table',
            chart: null,

            // 其他状态
            exportLoading: false,
            statisticsData: null,
            statisticsLoading: false,
            analyticsData: null,
            analyticsLoading: false,
        }
    },
    watch: {
        messages() {
            this.$nextTick(() => {
                this.scrollToBottom();
            });
        },
        activeTab(val) {
            if (val === 'chart' && this.tableData.length > 0) {
                this.$nextTick(() => {
                    this.initChart();
                });
            }
        }
    },
    mounted() {
        this.fetchCategoryOptions();
        this.fetchTopicOptions();
        
        // 监听系统时间更新
        this.$root.$on('clock-time-updated', (time) => {
            this.systemTime = time;
        });
    },
    beforeDestroy() {
        if (this.chart) {
            this.chart.dispose();
        }
    },
    methods: {
        // 渲染分析图表
        renderAnalyticsChart() {
            if (!this.analyticsData || !this.chart) return;

            // 准备图表数据
            const { userTrends, topicDistribution, categoryComparison } = this.analyticsData;

            // 设置图表选项 - 综合分析图表
            const option = {
                title: [
                    {
                        text: '用户行为趋势',
                        left: '25%',
                        top: '5%',
                        textAlign: 'center'
                    },
                    {
                        text: '主题分布',
                        left: '75%',
                        top: '5%',
                        textAlign: 'center'
                    },
                    {
                        text: '分类对比',
                        left: 'center',
                        top: '55%',
                        textAlign: 'center'
                    }
                ],
                grid: [
                    {left: '5%', right: '55%', top: '15%', height: '35%'},
                    {left: '55%', right: '5%', top: '15%', height: '35%'},
                    {left: '5%', right: '5%', top: '65%', height: '30%'}
                ],
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: [
                    {
                        gridIndex: 0,
                        type: 'category',
                        data: userTrends.map(item => item.date),
                        axisLabel: {
                            formatter: value => value.substring(5) // 只显示月-日
                        }
                    },
                    {
                        gridIndex: 2,
                        type: 'category',
                        data: categoryComparison.map(item => item.name)
                    }
                ],
                yAxis: [
                    {gridIndex: 0, type: 'value', name: '互动数'},
                    {gridIndex: 2, type: 'value', name: '新闻数'}
                ],
                series: [
                    {
                        name: '用户互动',
                        type: 'line',
                        xAxisIndex: 0,
                        yAxisIndex: 0,
                        data: userTrends.map(item => item.count),
                        smooth: true,
                        lineStyle: {width: 3},
                        areaStyle: {opacity: 0.2}
                    },
                    {
                        name: '主题分布',
                        type: 'pie',
                        radius: '70%',
                        center: ['75%', '25%'],
                        data: topicDistribution.map(item => ({
                            name: item.name,
                            value: item.count
                        })),
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    },
                    {
                        name: '分类数量',
                        type: 'bar',
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        data: categoryComparison.map(item => item.count),
                        itemStyle: {
                            color: params => {
                                const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];
                                return colors[params.dataIndex % colors.length];
                            }
                        }
                    }
                ]
            };

            this.chart.setOption(option);
        },

        // 执行组合查询，调用 getNewsAnalytics API
        executeAnalyticsQuery() {
            this.analyticsLoading = true;
            const startTime = performance.now();

            // 构建查询参数
            const params = {
                startDate: this.queryForm.dateRange[0],
                endDate: this.queryForm.dateRange[1]
            };

            // 添加可选参数
            if (this.queryForm.topics.length > 0) {
                params.topics = this.queryForm.topics.join(',');
            }

            if (this.queryForm.categories.length > 0) {
                params.categories = this.queryForm.categories.join(',');
            }

            if (this.queryForm.users.length > 0) {
                params.users = this.queryForm.users.join(',');
            }

            // 调用统计分析 API
            return dataService.getNewsAnalytics(params)
                .then(response => {
                    if (response.data && response.data.code === 200) {
                        this.analyticsData = response.data.data;

                        // 更新统计图表
                        if (this.activeTab === 'chart') {
                            this.$nextTick(() => {
                                this.renderAnalyticsChart();
                            });
                        }

                        const endTime = performance.now();
                        // 发送查询日志
                        pipeService.emitQueryLog({
                            source: 'AnalysisView',
                            action: '新闻数据综合分析',
                            timestamp: Date.now(),
                            responseTime: Math.round(endTime - startTime),
                            resultCount: Object.keys(this.analyticsData || {}).length,
                            params: JSON.stringify(params)
                        });
                    } else {
                        this.$message.error(response.message || '统计分析查询失败');
                    }
                })
                .catch(error => {
                    console.error('统计分析查询失败:', error);
                    this.$message.error('统计分析查询失败，请稍后重试');
                })
                .finally(() => {
                    this.analyticsLoading = false;
                });
        },

        // 获取统计数据
        fetchStatistics() {
            this.statisticsLoading = true;
            const startTime = performance.now();

            // 构建查询参数
            const params = {
                startDate: this.queryForm.dateRange[0],
                endDate: this.queryForm.dateRange[1]
            };

            // 添加可选参数
            if (this.queryForm.topics.length > 0) {
                params.topics = this.queryForm.topics.join(',');
            }

            if (this.queryForm.categories.length > 0) {
                params.categories = this.queryForm.categories.join(',');
            }

            return dataService.getStatistics(params)
                .then(response => {
                    if (response.data && response.data.code === 200) {
                        this.statisticsData = response.data.data;

                        const endTime = performance.now();
                        // 发送查询日志
                        pipeService.emitQueryLog({
                            source: 'AnalysisView',
                            action: '新闻统计数据查询',
                            timestamp: Date.now(),
                            responseTime: Math.round(endTime - startTime),
                            resultCount: Object.keys(this.statisticsData || {}).length
                        });
                    } else {
                        this.$message.error(response.message || '查询统计数据失败');
                    }
                })
                .catch(error => {
                    console.error('查询统计数据失败:', error);
                    this.$message.error('查询统计数据失败，请稍后重试');
                })
                .finally(() => {
                    this.statisticsLoading = false;
                });
        },
        // 查询表单相关方法
        executeQuery() {
            this.queryLoading = true;
            const startTime = performance.now();

            // 构建查询参数
            const params = {
                startDate: this.queryForm.dateRange[0],
                endDate: this.queryForm.dateRange[1],
                page: this.currentPage,
                pageSize: this.pageSize,
                minTitleLength: this.queryForm.titleLengthRange[0],
                maxTitleLength: this.queryForm.titleLengthRange[1],
                minContentLength: this.queryForm.contentLengthRange[0],
                maxContentLength: this.queryForm.contentLengthRange[1]
            };

            if (this.queryForm.topics.length > 0) {
                params.topics = this.queryForm.topics.join(',');
            }

            if (this.queryForm.categories.length > 0) {
                params.categories = this.queryForm.categories.join(',');
            }

            if (this.queryForm.users.length > 0) {
                params.users = this.queryForm.users.join(',');
            }

            // 同时获取列表数据、统计数据和分析数据
            Promise.all([
                dataService.queryNewsData(params),
                this.fetchStatistics(),
                this.executeAnalyticsQuery()
            ])
                .then(([newsResponse]) => {
                    if (newsResponse.data && newsResponse.data.code === 200) {
                        this.tableData = newsResponse.data.data.items || [];
                        this.total = newsResponse.data.data.total || 0;

                        // 根据当前标签页更新图表
                        if (this.activeTab === 'chart') {
                            this.$nextTick(() => {
                                this.initChart();
                            });
                        }

                        const endTime = performance.now();
                        // 发送查询日志
                        pipeService.emitQueryLog({
                            source: 'AnalysisView',
                            action: `新闻数据高级查询`,
                            timestamp: Date.now(),
                            responseTime: Math.round(endTime - startTime),
                            resultCount: this.total,
                            params: JSON.stringify(params)
                        });
                    } else {
                        this.$message.error(newsResponse.message || '查询失败');
                    }
                })
                .catch(error => {
                    console.error('查询失败:', error);
                    this.$message.error('查询失败，请稍后重试');
                })
                .finally(() => {
                    this.queryLoading = false;
                });
        },

        resetQuery() {
            this.$refs.queryForm.resetFields();
            this.queryForm = {
                dateRange: ['2019-06-13', '2019-06-15'],
                topics: [],
                categories: [],
                titleLengthRange: [10, 50],
                contentLengthRange: [100, 1000],
                users: []
            };
        },

        remoteSearchUsers(query) {
            if (query !== '') {
                this.userLoading = true;
                dataService.searchUsers(query)
                    .then(response => {
                        if (response.code === 200) {
                            this.userOptions = response.data;
                        }
                    })
                    .finally(() => {
                        this.userLoading = false;
                    });
            } else {
                this.userOptions = [];
            }
        },

        // 分页相关方法
        handleSizeChange(val) {
            this.pageSize = val;
            this.executeQuery();
        },

        handleCurrentChange(val) {
            this.currentPage = val;
            this.executeQuery();
        },

        // 图表相关方法
        initChart() {
            if (this.chart) {
                this.chart.dispose();
            }

            this.chart = echarts.init(this.$refs.chartContainer);

            // 准备图表数据
            const categoryData = {};
            this.tableData.forEach(item => {
                if (!categoryData[item.category]) {
                    categoryData[item.category] = 1;
                } else {
                    categoryData[item.category]++;
                }
            });

            const categories = Object.keys(categoryData);
            const data = categories.map(key => categoryData[key]);

            // 设置图表选项
            const option = {
                title: {
                    text: '查询结果分类统计',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    data: categories
                },
                series: [
                    {
                        name: '分类统计',
                        type: 'pie',
                        radius: '55%',
                        center: ['50%', '60%'],
                        data: categories.map(category => ({
                            name: category,
                            value: categoryData[category]
                        })),
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };

            this.chart.setOption(option);

            // 窗口大小调整时重新绘制图表
            window.addEventListener('resize', () => {
                if (this.chart) {
                    this.chart.resize();
                }
            });
        },

        handleTabClick() {
            if (this.activeTab === 'chart' && this.tableData.length > 0) {
                this.$nextTick(() => {
                    this.initChart();
                });
            }
        },

        // 聊天相关方法
        // 在 AnalysisView.js 中修改 sendMessage 方法
        async sendMessage() {
            if (!this.userInput.trim()) return;

            const startTime = performance.now();
            const userMessage = this.userInput;

            // 添加用户消息
            this.messages.push({
                type: 'user',
                content: userMessage
            });

            // 清空输入框
            this.userInput = '';

            // 添加临时消息表示正在处理
            this.messages.push({
                type: 'bot',
                content: '正在思考...'
            });

            try {
                // 获取当前系统时间戳
                let timestamp;
                if (this.systemTime) {
                    timestamp = this.formatDateTime(this.systemTime);
                } else {
                    // 如果没有系统时间，使用当前时间
                    timestamp = this.formatDateTime(new Date());
                }

                // 调用API获取响应，传入时间戳参数
                const response = await dataService.sendAgentMessage(userMessage, timestamp);

                // 移除临时消息
                this.messages.pop();

                // 添加API返回的真实响应
                if (response.data && response.data.code === 200) {
                    this.messages.push({
                        type: 'bot',
                        content: response.data.data.message || '抱歉，我无法理解您的问题。'
                    });
                } else {
                    throw new Error('API响应格式错误');
                }

                const endTime = performance.now();

                // 记录查询日志
                pipeService.emitQueryLog({
                    source: 'AnalysisView',
                    action: `智能分析查询: "${userMessage}"`,
                    timestamp: Date.now(),
                    responseTime: Math.round(endTime - startTime),
                    resultCount: 1
                });
            } catch (error) {
                console.error('获取智能助手响应失败:', error);

                // 移除临时消息
                this.messages.pop();

                // 添加错误提示
                this.messages.push({
                    type: 'bot',
                    content: '抱歉，系统暂时无法响应，请稍后再试。'
                });
            }
        },

        scrollToBottom() {
            const container = this.$refs.chatMessages;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        },

        // 数据导出相关方法
        handleExportCommand(command) {
            if (!this.tableData.length) {
                this.$message.warning('暂无数据可导出');
                return;
            }

            this.exportLoading = true;

            if (command === 'excel' || command === 'csv') {
                dataService.exportNewsData({
                    format: command,
                    ...this.buildExportParams()
                }).then(response => {
                    this.downloadFile(response.data.url, `新闻数据_${this.formatDate(new Date())}.${command}`);
                    this.$message.success('导出成功');
                }).catch(() => {
                    this.$message.error('导出失败');
                }).finally(() => {
                    this.exportLoading = false;
                });
            } else if (command === 'image') {
                if (this.chart) {
                    const dataURL = this.chart.getDataURL();
                    this.downloadDataURL(dataURL, `新闻数据图表_${this.formatDate(new Date())}.png`);
                    this.$message.success('导出成功');
                } else {
                    this.$message.warning('请先切换到图表视图');
                }
                this.exportLoading = false;
            }
        },

        // 辅助方法
        buildExportParams() {
            const params = {
                startDate: this.queryForm.dateRange[0],
                endDate: this.queryForm.dateRange[1],
                minTitleLength: this.queryForm.titleLengthRange[0],
                maxTitleLength: this.queryForm.titleLengthRange[1],
                minContentLength: this.queryForm.contentLengthRange[0],
                maxContentLength: this.queryForm.contentLengthRange[1]
            };

            if (this.queryForm.topics.length > 0) {
                params.topics = this.queryForm.topics.join(',');
            }

            if (this.queryForm.categories.length > 0) {
                params.categories = this.queryForm.categories.join(',');
            }

            if (this.queryForm.users.length > 0) {
                params.users = this.queryForm.users.join(',');
            }

            return params;
        },

        downloadFile(url, filename) {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },

        downloadDataURL(dataURL, filename) {
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },

        getLastMonthDate() {
            const date = new Date();
            date.setMonth(date.getMonth() - 1);
            return this.formatDate(date);
        },

        formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        
        formatDateTime(date) {
            if (!date) return '';
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        },

        viewNewsDetail(row) {
            // 可以通过对话框或导航到详情页面展示新闻详情
            this.$alert(`
                <h3>${row.headline}</h3>
                <p><strong>分类:</strong> ${row.category}</p>
                <p><strong>主题:</strong> ${row.topic}</p>
                <p><strong>发布日期:</strong> ${row.publishDate}</p>
                <p><strong>内容:</strong> ${row.body || '暂无详细内容'}</p>
            `, '新闻详情', {
                dangerouslyUseHTMLString: true
            });
        },

        // 初始化选项数据的方法
        fetchCategoryOptions() {
            dataService.getCategories()
                .then(response => {
                    if (response.data && response.data.code === 200) {
                        this.categoryOptions = response.data.data || [];
                    }
                })
                .catch(error => {
                    console.error('获取分类列表失败:', error);
                });
        },

        fetchTopicOptions() {
            dataService.getTopics()
                .then(response => {
                    if (response.data && response.data.code === 200) {
                        this.topicOptions = response.data.data || [];
                    }
                })
                .catch(error => {
                    console.error('获取主题列表失败:', error);
                });
        }
    }
}