import dataService from '../../service/dataService.js'
import pipeService from '../../service/pipeService.js';
import * as echarts from 'echarts';

export default {
    name: 'UserPanel',
    components: {},
    props: {},
    computed: {
        currentTimeString() {
            if (!this.systemTime) return '';

            const year = this.systemTime.getFullYear();
            const month = (this.systemTime.getMonth() + 1).toString().padStart(2, '0');
            const day = this.systemTime.getDate().toString().padStart(2, '0');
            const hours = this.systemTime.getHours().toString().padStart(2, '0');
            const minutes = this.systemTime.getMinutes().toString().padStart(2, '0');

            return `${year}-${month}-${day} ${hours}:${minutes}`;
        }
    },
    data() {
        return {
            systemTime: null,
            interestTrendData: {},
            interestTrendLoading: false,
            interestTrendChart: null,
            startDate: '2019-06-13',
            endDate: '2019-07-03',
            userList: [],
            selectedUser: null,
            searchText: '',
            userCurrentPage: 1,   // 用户列表当前页码
            userPageSize: 20,     // 用户列表每页条数
            userTotal: 0,         // 用户总数
            userLoading: false,   // 用户列表加载状
            userBrowseHistory: {},
            userPreferences: {},
            currentRecommendedNews: [],
            newsLoading: false,
            preferenceChart: null,
            isLargeChartVisible: false,
            largeChart: null,
            lastRecommendationTime: null,  // 用于跟踪上次更新推荐的时间
            preferencesLoading: false
        }
    },
    watch: {
        searchText: function(val) {
            if (this.searchTimer) {
                clearTimeout(this.searchTimer);
            }
            this.searchTimer = setTimeout(() => {
                this.handleUserSearch();
            }, 500); // 500ms 延迟搜索
        },
        selectedUser(newUser) {
            if (newUser) {
                this.currentTimeIndex = 0;
                this.updateUserProfile();
                this.fetchRecommendedNews(); // 获取推荐新闻
            }
        },
        systemTime(newTime) {
            if (this.selectedUser && newTime) {
                // 总是更新用户资料（这不涉及推荐新闻API调用）
                this.updateUserProfile();

                console.log('lastRecommendationTime:', this.lastRecommendationTime);

                // 检查是否需要刷新推荐新闻（一分钟刷新一次）
                const shouldRefreshNews = !this.lastRecommendationTime ||
                    (Math.floor((newTime - this.lastRecommendationTime) / 3600000) >= 1);

                if (shouldRefreshNews) {
                    console.log('一分钟时间到，刷新推荐新闻');
                    this.lastRecommendationTime = new Date(newTime);
                    this.fetchRecommendedNews();
                }
            }
        },
    },
    mounted: function () {
        // 初始加载用户列表
        this.fetchUserList();

        // 初始化图表（空状态）
        this.$nextTick(() => {
            this.initPreferenceChart();
            const chartDom = document.getElementById('preference-chart');
            if (chartDom) {
                // 确保在DOM更新后初始化
                this.preferenceChart = echarts.init(chartDom);

                // 显示空状态提示
                this.preferenceChart.setOption({
                    title: {
                        text: '请选择用户查看兴趣偏好',
                        textStyle: {
                            color: '#999',
                            fontSize: 14
                        },
                        left: 'center',
                        top: 'middle'
                    },
                    tooltip: {
                        show: false
                    },
                    series: [{
                        type: 'pie',
                        radius: ['40%', '70%'],
                        center: ['50%', '50%'],
                        data: [],
                        silent: true
                    }]
                });

                // 监听窗口大小变化，自动调整图表大小
                window.addEventListener('resize', () => {
                    this.preferenceChart && this.preferenceChart.resize();
                });

                this.preferenceChart.on('click', this.showLargeChart);
            }
        });
        // 订阅时钟更新事件
        this.$root.$on('clock-time-updated', (time) => {
            this.systemTime = time;
        });
    },
    methods: {
        initPreferenceChart() {
            const chartDom = document.getElementById('preference-chart');
            if (chartDom && !this.preferenceChart) {  // 确保只初始化一次
                console.log('初始化饼图');
                this.preferenceChart = echarts.init(chartDom);

                // 显示空状态提示
                this.preferenceChart.setOption({
                    title: {
                        text: '请选择用户查看兴趣偏好',
                        textStyle: {
                            color: '#999',
                            fontSize: 14
                        },
                        left: 'center',
                        top: 'middle'
                    },
                    tooltip: {
                        show: false
                    },
                    series: [{
                        type: 'pie',
                        radius: ['40%', '70%'],
                        center: ['50%', '50%'],
                        data: [],
                        silent: true
                    }]
                });

                // 监听窗口大小变化，自动调整图表大小
                window.addEventListener('resize', () => {
                    this.preferenceChart && this.preferenceChart.resize();
                });

                this.preferenceChart.on('click', this.showLargeChart);
            } else if (!chartDom) {
                console.error('找不到饼图DOM元素');
            }
        },

        initInterestTrendChart() {
            console.log('初始化或重置折线图');
            const trendChartDom = document.getElementById('interest-trend-chart');
            if (trendChartDom) {
                // 如果已经存在，先销毁
                if (this.interestTrendChart) {
                    this.interestTrendChart.dispose();
                }

                // 重新初始化
                this.interestTrendChart = echarts.init(trendChartDom);
                this.interestTrendChart.setOption({
                    title: {
                        text: '加载兴趣趋势数据...',
                        textStyle: {
                            color: '#999',
                            fontSize: 12
                        },
                        left: 'center',
                        top: 'middle'
                    }
                });

                // 添加窗口大小变化监听
                window.addEventListener('resize', () => {
                    this.interestTrendChart && this.interestTrendChart.resize();
                });
            } else {
                console.error('找不到折线图DOM元素');
            }
        },
        // 更新兴趣趋势图
        updateInterestTrendChart() {
            console.log('开始更新兴趣趋势图', this.interestTrendData);

            // 确保数据有效
            if (!this.interestTrendData || !Array.isArray(this.interestTrendData) || this.interestTrendData.length === 0) {
                console.log('无趋势数据，显示空图表');
                this.showTrendChartError('暂无兴趣趋势数据');
                return;
            }

            // 确保图表对象存在
            if (!this.interestTrendChart) {
                console.log('图表对象不存在，重新初始化');
                this.initInterestTrendChart();
                if (!this.interestTrendChart) {
                    console.error('无法初始化趋势图对象');
                    return;
                }
            }

            try {
                // 首先对数据按日期排序（升序）
                const sortedData = [...this.interestTrendData].sort((a, b) => {
                    // 将日期字符串转换为数字进行比较
                    const dateA = parseInt(String(a.date));
                    const dateB = parseInt(String(b.date));
                    return dateA - dateB;
                });

                // 获取所有日期和分类
                const dates = sortedData.map(item => {
                    // 确保date是字符串
                    const dateStr = String(item.date);
                    // 将YYYYMMDD格式转换为YYYY-MM-DD
                    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
                });

                console.log('处理后的日期数据:', dates);

                // 获取所有不同的分类
                const allCategories = new Set();
                sortedData.forEach(item => {
                    if (item.interests && Array.isArray(item.interests)) {
                        item.interests.forEach(interest => {
                            if (interest && interest.category) {
                                allCategories.add(interest.category);
                            }
                        });
                    }
                });

                console.log('发现的分类:', [...allCategories]);

                // 为每个分类准备数据系列
                const series = [];
                allCategories.forEach(category => {
                    const data = [];

                    // 为每个日期找到对应分类的得分
                    dates.forEach((date, dateIndex) => {
                        const dateItem = sortedData[dateIndex];
                        let score = 0;

                        if (dateItem && dateItem.interests && Array.isArray(dateItem.interests)) {
                            const interest = dateItem.interests.find(i => i && i.category === category);
                            if (interest) {
                                // 确保得分是数字
                                score = parseFloat(interest.score);
                                if (isNaN(score)) {
                                    score = 0;
                                }
                            }
                        }

                        data.push(score);
                    });

                    series.push({
                        name: category,
                        type: 'line',
                        data: data,
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: {
                            width: 2,
                            color: this.getCategoryColor(category)
                        },
                        itemStyle: {
                            color: this.getCategoryColor(category)
                        }
                    });
                });

                // 设置图表配置
                const option = {
                    tooltip: {
                        trigger: 'axis',
                        formatter: function(params) {
                            let result = params[0].axisValue + '<br/>';
                            params.forEach(param => {
                                result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
                            });
                            return result;
                        }
                    },
                    legend: {
                        data: [...allCategories],
                        right: 10,
                        top: 0,
                        textStyle: {
                            fontSize: 10
                        },
                        itemWidth: 10,
                        itemHeight: 10,
                        type: 'scroll'
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '10%',
                        top: '25%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: dates,
                        axisLabel: {
                            formatter: value => value.substring(5), // 只显示月-日
                            fontSize: 10
                        }
                    },
                    yAxis: {
                        type: 'value',
                        name: '兴趣得分',
                        nameTextStyle: {
                            fontSize: 10
                        },
                        axisLabel: {
                            fontSize: 10
                        }
                    },
                    series: series
                };

                console.log('设置折线图配置');
                this.interestTrendChart.setOption(option, true);
                this.interestTrendChart.resize();
                console.log('折线图更新完成');
            } catch (error) {
                console.error('更新折线图时发生错误:', error);
                this.showTrendChartError('图表渲染失败: ' + error.message);
            }
        },

        async fetchUserInterestTrend(userId) {
            if (!userId) return;

            this.interestTrendLoading = true;
            try {
                console.log('开始获取用户兴趣趋势数据:', userId);
                const response = await dataService.getUserInterestTrend(userId, this.startDate, this.endDate);
                console.log('获取到的兴趣趋势数据:', response);

                // 首先检查响应是否存在
                if (!response || !response.data) {
                    throw new Error('API响应格式不正确');
                }

                // 检查数据结构
                const responseData = response.data;
                if (!responseData.data || !responseData.data.items || !Array.isArray(responseData.data.items)) {
                    console.error('API返回的数据结构不正确:', responseData);
                    throw new Error('返回数据结构不正确');
                }

                const trendData = responseData.data.items;

                // 检查每个数据项的结构
                if (trendData.length > 0) {
                    console.log('数据项示例:', trendData[0]);
                }

                // 保存兴趣趋势数据
                this.interestTrendData = trendData;

                // 确保图表存在后再更新
                if (!this.interestTrendChart) {
                    this.initInterestTrendChart();
                }

                // 延迟一帧更新图表，确保DOM已更新
                this.$nextTick(() => {
                    this.updateInterestTrendChart();
                });

            } catch (error) {
                console.error('获取用户兴趣趋势失败:', error);
                // 确保错误信息显示在图表上
                this.$nextTick(() => {
                    if (!this.interestTrendChart) {
                        this.initInterestTrendChart();
                    }
                    this.showTrendChartError('获取数据失败: ' + (error.message || '未知错误'));
                });
            } finally {
                this.interestTrendLoading = false;
            }
        },

        // 添加一个显示趋势图错误的方法
        showTrendChartError(message) {
            if (this.interestTrendChart) {
                this.interestTrendChart.setOption({
                    title: {
                        text: message,
                        textStyle: {
                            color: '#999',
                            fontSize: 12
                        },
                        left: 'center',
                        top: 'middle'
                    },
                    series: []
                });
            }
        },

        async fetchUserList() {
            this.userLoading = true;
            const startTime = performance.now();

            try {
                const params = {
                    page: this.userCurrentPage,
                    pageSize: this.userPageSize
                };

                // 如果有搜索关键词，添加到请求参数
                if (this.searchText) {
                    params.query = this.searchText;
                }

                const response = await dataService.queryUsersData(params);

                if (response.data && response.data.code === 200) {
                    this.userList = response.data.data.items || [];
                    this.userTotal = response.data.data.total || 0;

                    // 确保从响应中获取最新的页码和每页大小
                    if (response.data.data.page) {
                        this.userCurrentPage = response.data.data.page;
                    }
                    if (response.data.data.pageSize) {
                        this.userPageSize = response.data.data.pageSize;
                    }
                } else {
                    console.error('获取用户列表失败:', response.data ? response.data.message : '未知错误');
                    // 清空列表但保持当前页码
                    this.userList = [];
                    this.userTotal = 0;
                }

                const endTime = performance.now();
                pipeService.emitQueryLog({
                    source: 'UserPanel',
                    action: '获取用户列表',
                    timestamp: Date.now(),
                    responseTime: Math.round(endTime - startTime),
                    resultCount: this.userList.length
                });
            } catch (error) {
                console.error('获取用户列表异常:', error);
                this.userList = [];
                this.userTotal = 0;
            } finally {
                this.userLoading = false;
            }
        },

        // 修改分页变化处理方法，确保正确调用获取数据的方法
        handleUserPageChange(page) {
            console.log('页码变更为:', page);
            if (this.userCurrentPage !== page) {
                this.userCurrentPage = page;
                this.fetchUserList();
            }
        },

        // 修改现有的搜索方法
        async handleUserSearch(isEnterKey = false) {
            this.userCurrentPage = 1;
            await this.fetchUserList();

            if (isEnterKey && this.userList.length === 1) {
                this.handleRowClick(this.userList[0]);
            } else if (isEnterKey && this.userList.length === 0) {
                this.$message.warning(`未找到ID为 "${this.searchText}" 的用户`);
            }
        },

        // 清除搜索时也需要清除选中状态
        handleClearUserSearch() {
            this.searchText = '';
            this.userCurrentPage = 1;
            this.fetchUserList();
            this.selectedUser = null; // 清除选中状态
        },

        handleNewsClick(news) {
            const startTime = performance.now();

            // 确保新闻对象包含必要的字段，并统一分类名称格式
            const newsData = {
                newsId: news.newsId,
                headline: news.headline,
                category: news.category ? news.category.toLowerCase() : 'unknown'
            };

            // 发送选中的新闻到 NewsPanel
            pipeService.emitClickedUsrPanelNews('user-panel-news-selected', newsData);

            const endTime = performance.now();

            // 记录用户点击操作
            pipeService.emitQueryLog({
                source: 'UserPanel',
                action: `用户选择推荐新闻: "${news.headline}"`,
                timestamp: Date.now(),
                responseTime: Math.round(endTime - startTime),
                resultCount: 1
            });
        },

        handleRowClick(row) {
            const startTime = performance.now();

            // 如果点击的是同一个用户，不做处理
            if (this.selectedUser && this.selectedUser.id === row.id) {
                return;
            }

            // 先显示加载状态
            this.preferenceChart && this.showLoadingChart();

            // 设置新的选中用户
            this.selectedUser = row;
            this.searchText = row.id; // 自动填充搜索框

            // 重置相关状态
            this.userPreferences = {}; // 清空之前的偏好数据
            this.lastRecommendationTime = null; // 重置上次推荐时间，确保选择新用户后立即获取推荐

            // 初始化折线图（在选择用户后）
            this.$nextTick(() => {
                this.initInterestTrendChart();

                // 加载新用户数据
                this.loadUserBrowseHistory(row.id);

                // 获取用户兴趣趋势数据
                this.fetchUserInterestTrend(row.id);
            });

            const endTime = performance.now();

            pipeService.emitQueryLog({
                source: 'UserPanel',
                action: `选择用户 ${row.id}`,
                timestamp: Date.now(),
                responseTime: Math.round(endTime - startTime),
                resultCount: 0
            });
        },

// 添加回车键处理方法
        handleSearchEnter() {
            this.userCurrentPage = 1;
            this.handleUserSearch(true);
        },

        async loadUserBrowseHistory(userId) {
            if (!userId || !this.systemTime) return;

            this.preferencesLoading = true;
            try {
                const startTime = performance.now();

                // 使用当前系统时间作为参数
                const timestamp = this.formatDateTime(this.systemTime);

                // 获取用户浏览历史，传入时间戳
                const response = await dataService.getUserBrowseHistory(userId, timestamp);
                const browseHistory = response.data.data.items || [];

                // 保存原始浏览历史
                this.userBrowseHistory[userId] = browseHistory;

                // 计算用户喜好数据
                this.processUserPreferences(userId, browseHistory);

                const endTime = performance.now();
                pipeService.emitQueryLog({
                    source: 'UserPanel',
                    action: `获取用户浏览历史 (ID:${userId}, 时间:${timestamp})`,
                    timestamp: Date.now(),
                    responseTime: Math.round(endTime - startTime),
                    resultCount: browseHistory.length
                });

                // 更新用户资料显示
                this.updateUserProfile();
            } catch (error) {
                console.error('加载用户浏览历史失败:', error);
                // 清空偏好数据
                if (!this.userPreferences[userId]) {
                    this.userPreferences[userId] = {};
                }
                this.userPreferences[userId][this.currentTimeIndex] = {};

                // 显示无数据状态
                this.showEmptyChart("暂无数据");
            } finally {
                this.preferencesLoading = false;
            }
        },

        processUserPreferences(userId, browseHistory) {
            // 如果userId对应的偏好数据不存在，初始化
            if (!this.userPreferences[userId]) {
                this.userPreferences[userId] = {};
            }

            // 初始化当前用户的偏好数据（不再依赖时间点索引）
            this.userPreferences[userId] = {};

            // 如果浏览历史为空，直接返回
            if (!browseHistory || browseHistory.length === 0) {
                return;
            }

            // 处理浏览历史
            browseHistory.forEach(item => {
                const category = item.category || 'unknown';
                const score = item.score || 0;

                // 直接使用分数作为兴趣值
                this.userPreferences[userId][category] = score;
            });
        },

        // 修改 updateUserProfile 方法，优化数据检查逻辑
        updateUserProfile() {
            if (!this.selectedUser || !this.systemTime) return;
            const userId = this.selectedUser.id;

            // 显示加载中状态
            if (this.preferencesLoading) {
                this.showLoadingChart();
                return;
            }

            // 检查是否有偏好数据
            if (!this.userPreferences[userId] ||
                Object.keys(this.userPreferences[userId]).length === 0) {
                this.showEmptyChart("暂无喜好数据");
                return;
            }

            // 更新图表（不再传递时间点索引）
            this.updatePreferenceChart(userId);
        },


        // 新增：显示加载中的图表
        showLoadingChart() {
            if (!this.preferenceChart) return;

            this.preferenceChart.setOption({
                title: {
                    text: '加载用户兴趣偏好...',
                    textStyle: {
                        color: '#999',
                        fontSize: 14
                    },
                    left: 'center',
                    top: 'middle'
                },
                tooltip: {
                    show: false
                },
                series: [{
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '50%'],
                    data: [],
                    silent: true
                }]
            });
        },

        // 新增：显示空图表
        showEmptyChart(message = '无浏览记录数据') {
            if (!this.preferenceChart) return;

            this.preferenceChart.setOption({
                title: {
                    text: message,
                    textStyle: {
                        color: '#999',
                        fontSize: 14
                    },
                    left: 'center',
                    top: 'middle'
                },
                tooltip: {
                    show: false
                },
                series: [{
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '50%'],
                    data: [],
                    silent: true
                }]
            });
        },


        // 格式化日期为 'yyyy-MM-dd HH:mm:ss' 格式
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

        // 获取推荐新闻
        // 修改 fetchRecommendedNews 方法，添加 startTime 性能计时
        async fetchRecommendedNews() {
            if (!this.selectedUser || !this.systemTime) return;

            const userId = this.selectedUser.id;
            this.newsLoading = true;
            const startTime = performance.now();

            try {
                // 使用系统时间的时间戳
                const timestamp = this.formatDateTime(this.systemTime);
                const response = await dataService.getUserRecommendations(userId, timestamp);

                this.currentRecommendedNews = response.data.data || [];

                const endTime = performance.now();

                pipeService.emitQueryLog({
                    source: 'UserPanel',
                    action: `获取用户推荐新闻 (ID:${userId}, 时间:${timestamp})`,
                    timestamp: Date.now(),
                    responseTime: Math.round(endTime - startTime),
                    resultCount: this.currentRecommendedNews.length
                });
            } catch (error) {
                console.error('获取用户推荐新闻失败:', error);
                this.currentRecommendedNews = [];
            } finally {
                this.newsLoading = false;
            }
        },

        // 获取当前推荐新闻 - 确保数据格式一致
        getCurrentRecommendedNews() {
            // 处理API返回的数据，确保字段名称和格式一致
            return this.currentRecommendedNews.map(news => {
                return {
                    newsId: news.newsId,
                    headline: news.headline,
                    category: news.category ? news.category.toLowerCase() : 'unknown'
                };
            });
        },

        // 修改更新饼图的方法
        updatePreferenceChart(userId) {
            if (!this.preferenceChart) return;
            const startTime = performance.now();

            const preferences = this.userPreferences[userId];
            if (!preferences) {
                this.showEmptyChart();
                return;
            }

            // 检查是否有数据
            if (Object.keys(preferences).length === 0) {
                this.showEmptyChart();
                return;
            }

            // 计算总分
            const totalScore = Object.values(preferences).reduce((sum, score) => sum + score, 0);

            const seriesData = Object.entries(preferences).map(([name, score]) => {
                const percentage = totalScore > 0 ? ((score / totalScore) * 100).toFixed(1) : 0;
                return {
                    name,
                    value: score,
                    percentage: percentage,
                    itemStyle: {
                        color: this.getCategoryColor(name)
                    }
                };
            }).sort((a, b) => b.value - a.value); // 按分数从高到低排序

            // 更新饼图配置
            const option = {
                tooltip: {
                    trigger: 'item',
                    formatter: function(params) {
                        return `${params.name}<br>分数: ${params.value.toFixed(1)}<br>占比: ${params.data.percentage}%`;
                    }
                },
                series: [
                    {
                        name: '兴趣占比',
                        type: 'pie',
                        radius: ['40%', '70%'],
                        center: ['50%', '50%'],
                        avoidLabelOverlap: false,
                        label: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            label: {
                                show: true,
                                formatter: function(params) {
                                    return `${params.name}\n${params.value.toFixed(1)}分\n${params.data.percentage}%`;
                                },
                                fontSize: '12',
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: seriesData,
                        animationType: 'scale',
                        animationEasing: 'elasticOut',
                        animationDelay: function (idx) {
                            return Math.random() * 200;
                        }
                    }
                ]
            };

            this.preferenceChart.setOption(option, true);
            this.preferenceChart.resize();

            const endTime = performance.now();
            pipeService.emitQueryLog({
                source: 'UserPanel',
                action: `查询用户兴趣 (ID:${userId}, 时间:${this.currentTimeString})`,
                timestamp: Date.now(),
                responseTime: Math.round(endTime - startTime),
                resultCount: Object.keys(preferences).length
            });
        },

        getCategoryColor(category) {
            // 规范化分类名称（转小写）
            const normalizedCategory = category ? category.toLowerCase() : 'unknown';

            const colorMap = {
                'adexperience': '#FF5252',  // 红色
                'autos': '#9C27B0',         // 紫色
                'entertainment': '#E91E63', // 粉红色
                'europe': '#3F51B5',        // 靛蓝色
                'finance': '#00BCD4',       // 青色
                'foodanddrink': '#FF9800',  // 橙色
                'health': '#8BC34A',        // 浅绿色
                'kids': '#FFEB3B',          // 黄色
                'lifestyle': '#009688',     // 茶绿色
                'movies': '#673AB7',        // 深紫色
                'music': '#F44336',         // 红色
                'news': '#4CAF50',          // 绿色
                'northamerica': '#2196F3',  // 蓝色
                'sports': '#03A9F4',        // 浅蓝色
                'travel': '#FFC107',        // 琥珀色
                'tv': '#795548',            // 棕色
                'video': '#607D8B',         // 蓝灰色
                'weather': '#F44336'        // 红色
            };

            return colorMap[normalizedCategory] || '#9E9E9E'; // 默认灰色
        },

        // 同样修改大图表显示逻辑
        showLargeChart() {
            if (!this.selectedUser) return;
            if (this.preferencesLoading) return; // 数据加载中不显示大图

            const userId = this.selectedUser.id;
            const preferences = this.userPreferences[userId];
            if (!preferences || Object.keys(preferences).length === 0) {
                return; // 无数据不显示大图
            }

            this.isLargeChartVisible = true;

            this.$nextTick(() => {
                const largeDom = document.getElementById('large-preference-chart');
                if (!this.largeChart && largeDom) {
                    this.largeChart = echarts.init(largeDom);
                }

                if (this.largeChart) {
                    // 获取当前用户的偏好数据
                    const currentPrefs = preferences;

                    // 计算总分
                    const totalScore = Object.values(currentPrefs).reduce((sum, score) => sum + score, 0);

                    const seriesData = Object.entries(currentPrefs).map(([name, score]) => {
                        const percentage = totalScore > 0 ? ((score / totalScore) * 100).toFixed(1) : 0;
                        return {
                            name,
                            value: score,
                            percentage: percentage,
                            itemStyle: {
                                color: this.getCategoryColor(name)
                            }
                        };
                    }).sort((a, b) => b.value - a.value); // 按分数从高到低排序

                    // 为大图创建新的配置
                    const largeOption = {
                        title: {
                            text: '用户兴趣偏好分析',
                            left: 'center',
                            top: 10,
                            textStyle: {
                                fontSize: 18
                            }
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: function(params) {
                                return `${params.name}<br>分数: ${params.value.toFixed(1)}<br>占比: ${params.data.percentage}%`;
                            }
                        },
                        series: [
                            {
                                name: '兴趣占比',
                                type: 'pie',
                                radius: ['20%', '60%'],
                                center: ['50%', '55%'],
                                avoidLabelOverlap: true,
                                label: {
                                    show: true,
                                    formatter: function(params) {
                                        return `${params.name}\n${params.value.toFixed(1)}分\n${params.data.percentage}%`;
                                    },
                                    fontSize: 14,
                                    fontWeight: 'bold'
                                },
                                emphasis: {
                                    label: {
                                        show: true,
                                        fontSize: 16,
                                        fontWeight: 'bold'
                                    }
                                },
                                labelLine: {
                                    show: true,
                                    smooth: true,
                                    length: 15,
                                    length2: 20
                                },
                                data: seriesData,
                                animationType: 'scale',
                                animationEasing: 'elasticOut',
                                animationDelay: function (idx) {
                                    return Math.random() * 200;
                                }
                            }
                        ]
                    };

                    this.largeChart.setOption(largeOption);
                    this.largeChart.resize();
                }

                // 初始化兴趣趋势图
                const trendChartDom = document.getElementById('interest-trend-chart');
                if (trendChartDom) {
                    this.interestTrendChart = echarts.init(trendChartDom);

                    // 显示空状态提示
                    this.interestTrendChart.setOption({
                        title: {
                            text: '请选择用户查看兴趣趋势',
                            textStyle: {
                                color: '#999',
                                fontSize: 12
                            },
                            left: 'center',
                            top: 'middle'
                        }
                    });

                    // 监听窗口大小变化
                    window.addEventListener('resize', () => {
                        this.interestTrendChart && this.interestTrendChart.resize();
                    });
                }
            });
        },

        // 隐藏大图
        hideLargeChart() {
            this.isLargeChartVisible = false;
        }
    }
}