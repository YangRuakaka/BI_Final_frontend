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
            userIdInput: '',  // 添加用户ID输入框的值
            // 聊天相关数据
            userInput: '',
            messages: [
                {
                    type: 'bot',
                    content: '您好！我是数据分析助手，有什么可以帮您分析的吗？'
                }
            ],

            queryForm: {
                dateRange: ['2019-06-13', '2019-07-03'],
                topic: '',           // 单个主题（不是数组）
                category: '',        // 单个分类（不是数组）
                titleLengthRange: [10, 50],
                contentLengthRange: [100, 1000],
                users: []            // 用户ID列表保持不变，可以有多个
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
        handleUserIdEnter() {
            console.log('用户ID输入:', this.userIdInput);
            if (this.userIdInput && this.userIdInput.trim()) {
                // 确保users数组已初始化
                if (!this.queryForm.users) {
                    this.queryForm.users = [];
                }
                // 添加新用户ID（避免重复）
                const userId = this.userIdInput.trim();
                if (!this.queryForm.users.includes(userId)) {
                    this.queryForm.users.push(userId);
                    console.log('添加用户筛选条件:', this.queryForm.users);
                }
                // 清空输入框 - 这一行很重要，之前缺少这个操作
                this.userIdInput = '';
            }
        },

        // 移除已选用户ID
        removeSelectedUser(userId) {
            const index = this.queryForm.users.indexOf(userId);
            if (index !== -1) {
                this.queryForm.users.splice(index, 1);
            }
        },

        // 清除用户ID输入
        handleClearUserIdInput() {
            this.userIdInput = '';
        },

        // 处理清除分类输入
        handleClearCategory() {
            this.queryForm.categoryInput = '';
            this.queryForm.category = ''; // 同时清除已保存的分类值
            console.log('已清除分类筛选条件');
        },

        handleClearTopic() {
            this.queryForm.topicInput = '';
            this.queryForm.topic = ''; // 同时清除已保存的主题
            console.log('已清除主题筛选条件');
        },

        executeQuery() {
            console.log("开始查询，当前页：", this.currentPage, "每页条数：", this.pageSize);
            this.queryLoading = true;
            const startTime = performance.now();

            // 构建查询参数
            const params = {
                startDate: this.queryForm.dateRange[0],
                endDate: this.queryForm.dateRange[1],
                page: this.currentPage,
                pageSize: this.pageSize,
                titleLengthMin: this.queryForm.titleLengthRange[0],
                titleLengthMax: this.queryForm.titleLengthRange[1],
                contentLengthMin: this.queryForm.contentLengthRange[0],
                contentLengthMax: this.queryForm.contentLengthRange[1]
            };

            // 在发送请求前打印检查
            console.log('分页参数:', { page: this.currentPage, pageSize: this.pageSize, total: this.total });
            // 添加主题参数（如果有）
            if (this.queryForm.topic) {
                params.topic = this.queryForm.topic;
                console.log('发送topic参数:', params.topic);
            }

            // 添加分类参数（如果有）
            if (this.queryForm.category) {
                params.category = this.queryForm.category;
                console.log('发送category参数:', params.category);
            }

            // 处理用户参数（这里保持多选功能）
            if (this.queryForm.users && this.queryForm.users.length > 0) {
                // 单个用户ID使用userId
                if (this.queryForm.users.length === 1) {
                    params.userId = this.queryForm.users[0];
                } else {
                    // 多个用户ID使用userIds
                    params.userIds = this.queryForm.users.join(',');
                }
            }

            console.log('完整的查询参数:', JSON.stringify(params));

            dataService.getStatistics(params)
                .then(async (response) => {
                    if (response.data && response.data.code === 200) {
                        // 提取响应数据
                        const responseData = response.data.data;

                        // 更新分页相关数据
                        this.total = responseData.totalNews || 0;
                        this.currentPage = parseInt(responseData.page) || 1;
                        this.pageSize = parseInt(responseData.pageSize) || 20;

                        console.log('API返回的分页数据:', {
                            total: this.total,
                            currentPage: this.currentPage,
                            pageSize: this.pageSize
                        });
                        // 获取统计API返回的新闻ID列表
                        const newsIds = responseData.newsStats || [];

                        // 更新统计数据
                        this.statisticsData = {
                            totalClicks: responseData.totalClicks || 0,
                            totalNews: responseData.totalNews || 0,
                            totalPages: responseData.totalPages || 0,
                            newsStats: responseData.newsStats || []
                        };

                        // 如果有新闻ID，获取详细信息
                        if (newsIds.length > 0) {
                            try {
                                // 批量获取新闻详情
                                const newsDetailsData = await this.fetchNewsDetails(newsIds);
                                this.tableData = newsDetailsData;
                            } catch (error) {
                                console.error('获取新闻详情失败:', error);
                                this.$message.error('获取新闻详情失败，请稍后重试');
                                this.tableData = [];
                            }
                        } else {
                            this.tableData = [];
                        }

                        // 如果当前是图表标签页，初始化图表
                        if (this.activeTab === 'chart') {
                            this.$nextTick(() => {
                                this.initChart();
                            });
                        }

                        const endTime = performance.now();
                        // 发送查询日志
                        pipeService.emitQueryLog({
                            source: 'AnalysisView',
                            action: '新闻数据查询',
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

// 添加新方法：批量获取新闻详情
        async fetchNewsDetails(newsIds) {
            // 如果输入不是数组或为空，直接返回空数组
            if (!Array.isArray(newsIds) || newsIds.length === 0) {
                return [];
            }

            console.log('开始获取新闻详情，总数:', newsIds.length);

            // 使用Promise.all并行获取所有新闻详情
            const newsDetailsPromises = newsIds.map(async (newsItem) => {
                try {
                    // 检查newsItem是否为对象并且具有id属性，或者直接就是id字符串
                    const newsId = typeof newsItem === 'object' ? newsItem.newsId : newsItem;

                    if (!newsId) {
                        console.error('无效的新闻ID:', newsItem);
                        return null;
                    }

                    const response = await dataService.getNewsDetail(newsId);

                    if (response.data && response.data.code === 200) {
                        return {
                            newsId: newsId,
                            headline: response.data.data.headline,
                            topic: response.data.data.topic,
                            category: response.data.data.category,
                            publishDate: response.data.data.publishDate ? response.data.data.publishDate.substring(0, 10) : '',
                            body: response.data.data.body
                        };
                    } else {
                        console.error(`获取新闻详情失败，ID: ${newsId}`);
                        return null;
                    }
                } catch (error) {
                    console.error(`获取新闻详情出错，ID: ${typeof newsItem === 'object' ? newsItem.newsId : newsItem}`, error);
                    return null;
                }
            });

            // 等待所有请求完成
            const results = await Promise.all(newsDetailsPromises);

            // 过滤掉null值并返回结果
            return results.filter(item => item !== null);
        },

        resetQuery() {
            this.$refs.queryForm.resetFields();
            this.queryForm = {
                dateRange: ['2019-06-13', '2019-06-15'],
                topicInput: '',
                topic: '',            // 重置为空字符串
                categoryInput: '',
                category: '',         // 重置为空字符串
                titleLengthRange: [10, 50],
                contentLengthRange: [100, 1000],
                currentPage: 1,
                users: []
            };
            console.log('已重置查询条件');
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

        handleSizeChange(val) {
            console.log('页大小改变:', val);
            this.pageSize = val;
            this.currentPage = 1; // 页大小改变时重置为第一页
            this.executeQuery(); // 重新执行查询
        },

        handleCurrentChange(val) {
            console.log('页码改变:', val);
            this.currentPage = val;
            this.executeQuery(); // 重新执行查询
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
        }
    }
}