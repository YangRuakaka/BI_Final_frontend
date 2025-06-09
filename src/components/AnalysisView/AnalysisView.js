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
                dateRange: [this.getLastMonthDate(), this.formatDate(new Date())],
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
            exportLoading: false
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
    },
    beforeDestroy() {
        if (this.chart) {
            this.chart.dispose();
        }
    },
    methods: {
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

            // 调用接口获取数据
            dataService.queryNewsData(params)
                .then(response => {
                    if (response.code === 200) {
                        this.tableData = response.data.items;
                        this.total = response.data.total;

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
                        this.$message.error(response.message || '查询失败');
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
                dateRange: [this.getLastMonthDate(), this.formatDate(new Date())],
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
        sendMessage() {
            if (!this.userInput.trim()) return;

            const startTime = performance.now();

            // 添加用户消息
            this.messages.push({
                type: 'user',
                content: this.userInput
            });

            // 模拟处理时间
            setTimeout(() => {
                // 添加机器人响应
                this.messages.push({
                    type: 'bot',
                    content: this.getBotResponse(this.userInput)
                });

                const endTime = performance.now();

                // 记录查询日志
                pipeService.emitQueryLog({
                    source: 'AnalysisView',
                    action: `智能分析查询: "${this.userInput}"`,
                    timestamp: Date.now(),
                    responseTime: Math.round(endTime - startTime),
                    resultCount: 1
                });

                this.userInput = '';
            }, 500);
        },

        getBotResponse(input) {
            // 简单的响应逻辑，后续可以对接真实AI
            const responses = [
                "正在分析您的请求...",
                "已找到相关数据，根据分析结果显示...",
                "您的查询非常有趣，这需要进一步分析...",
                "根据历史数据，这个问题的答案是...",
                "正在处理您的数据分析请求，请稍候..."
            ];
            return responses[Math.floor(Math.random() * responses.length)];
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
                    if (response.code === 200) {
                        this.categoryOptions = response.data;
                    }
                })
                .catch(error => {
                    console.error('获取分类列表失败:', error);
                });
        },

        fetchTopicOptions() {
            dataService.getTopics()
                .then(response => {
                    if (response.code === 200) {
                        this.topicOptions = response.data;
                    }
                })
                .catch(error => {
                    console.error('获取主题列表失败:', error);
                });
        }
    }
}