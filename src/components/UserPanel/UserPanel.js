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
        },
        currentPreferenceData() {
            if (!this.selectedUser || !this.userPreferences[this.selectedUser.id] ||
                !this.userPreferences[this.selectedUser.id][this.currentTimeIndex]) {
                return [];
            }

            const currentPrefs = this.userPreferences[this.selectedUser.id][this.currentTimeIndex];
            const total = Object.values(currentPrefs).reduce((sum, value) => sum + value, 0);

            return Object.entries(currentPrefs).map(([name, value]) => {
                return {
                    name,
                    value,
                    percentage: ((value / total) * 100).toFixed(1),
                    color: this.getCategoryColor(name)
                };
            }).sort((a, b) => b.value - a.value); // 按值从大到小排序
        }
    },
    data() {
        return {
            systemTime: null,
            userList: [],
            selectedUser: null,
            searchText: '',
            currentTimeIndex: 0,  // 当前时间点索引
            isPlaying: false,     // 是否自动播放
            playSpeed: 1000,      // 播放速度(毫秒)
            playInterval: null,   // 播放计时器
            userCurrentPage: 1,   // 用户列表当前页码
            userPageSize: 20,     // 用户列表每页条数
            userTotal: 0,         // 用户总数
            userLoading: false,   // 用户列表加载状态
            // 模拟时间点数据
            timePoints: [
                "2019-07-10 08:00",
                "2019-07-10 10:00",
                "2019-07-10 12:00",
                "2019-07-10 14:00",
                "2019-07-10 16:00",
                "2019-07-10 18:00",
                "2019-07-10 20:00",
                "2019-07-11 08:00",
                "2019-07-11 10:00",
                "2019-07-11 12:00"
            ],

            userBrowseHistory: {},
            userPreferences: {},
            currentRecommendedNews: [],
            newsLoading: false,
            preferenceChart: null,
            isLargeChartVisible: false,
            largeChart: null,
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
                this.updateUserProfile();
                this.fetchRecommendedNews();
            }
        }
    },
    mounted: function () {
        // 初始加载用户列表
        this.fetchUserList();

        // 初始化图表（空状态）
        this.$nextTick(() => {
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
        this.$root.$on('clock-time-updated', (time) => {
            this.systemTime = time;
        });
    },
    methods: {
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

                if (response.data.code === 200) {
                    this.userList = response.data.data.items;
                    this.userTotal = response.data.data.total;
                    this.userCurrentPage = response.data.data.page;
                    this.userPageSize = response.data.data.pageSize;
                } else {
                    console.error('获取用户列表失败:', response.data.message);
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
            } finally {
                this.userLoading = false;
            }
        },

        // 处理用户列表分页变化
        handleUserPageChange(page) {
            this.userCurrentPage = page;
            this.fetchUserList();
        },

        // 处理搜索
        handleUserSearch() {
            this.userCurrentPage = 1; // 重置到第一页
            this.fetchUserList();
        },

        // 清除搜索
        handleClearUserSearch() {
            this.searchText = '';
            this.userCurrentPage = 1;
            this.fetchUserList();
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
            this.selectedUser = row;
            this.loadUserBrowseHistory(row.id); // 新增：加载用户浏览历史
            const endTime = performance.now();

            pipeService.emitQueryLog({
                source: 'UserPanel',
                action: `选择用户 ${row.id}`,
                timestamp: Date.now(),
                responseTime: Math.round(endTime - startTime),
                resultCount: 0
            });
        },

        async loadUserBrowseHistory(userId) {
            if (!userId) return;

            this.preferencesLoading = true;
            try {
                const startTime = performance.now();

                // 获取用户浏览历史
                const response = await dataService.getUserBrowseHistory(userId);
                const browseHistory = response.data.data || [];

                // 保存原始浏览历史
                this.userBrowseHistory[userId] = browseHistory;

                // 将浏览历史转换为时间点对应的偏好数据
                this.processUserPreferences(userId, browseHistory);

                const endTime = performance.now();
                pipeService.emitQueryLog({
                    source: 'UserPanel',
                    action: `获取用户浏览历史 (ID:${userId})`,
                    timestamp: Date.now(),
                    responseTime: Math.round(endTime - startTime),
                    resultCount: browseHistory.length
                });

                // 更新用户资料显示
                this.updateUserProfile();
            } catch (error) {
                console.error('加载用户浏览历史失败:', error);
                // 清空偏好数据
                this.userPreferences[userId] = [];
                for (let i = 0; i < this.timePoints.length; i++) {
                    this.userPreferences[userId][i] = {};
                }
            } finally {
                this.preferencesLoading = false;
            }
        },

        // 新增：处理用户浏览历史，转换为偏好数据
        processUserPreferences(userId, browseHistory) {
            // 如果userId对应的偏好数据不存在，初始化
            if (!this.userPreferences[userId]) {
                this.userPreferences[userId] = {};
            }


            // 遍历浏览历史，按时间点分组
            browseHistory.forEach(item => {
                const timestamp = new Date(item.timestamp).getTime();

                if (!timestamp) return;

                if (!this.userPreferences[userId][timestamp]) {
                    this.userPreferences[userId][timestamp] = {};
                }
                // 找到最接近的时间点索引
                const timeIndex = this.findClosestTimePointIndex(timestamp);
                if (timeIndex === -1) return;

                // 获取新闻分类
                const category = item.category || 'unknown';

                // 在对应时间点累加分类的点击次数
                if (!this.userPreferences[userId][timeIndex][category]) {
                    this.userPreferences[userId][timeIndex][category] = 0;
                }
                this.userPreferences[userId][timeIndex][category] += 1;
            });
        },

        // 新增：找到最接近的时间点索引
        findClosestTimePointIndex(timestamp) {
            // 将传入的时间戳转换为Date对象
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return -1;

            // 将所有时间点转换为Date对象
            const timePointDates = this.timePoints.map(tp => new Date(tp));

            // 找出最近的时间点
            let closestIndex = 0;
            let minDiff = Math.abs(date - timePointDates[0]);

            for (let i = 1; i < timePointDates.length; i++) {
                const diff = Math.abs(date - timePointDates[i]);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestIndex = i;
                }
            }

            return closestIndex;
        },

        // 更新用户资料和推荐
        updateUserProfile() {
            if (!this.selectedUser || !this.systemTime) return;
            const userId = this.selectedUser.id;

            // 显示加载中状态...
            if (this.preferencesLoading) {
                this.showLoadingChart();
                return;
            }

            // 查找最接近当前系统时间的偏好数据
            const currentTimestamp = this.systemTime.getTime();
            let closestTimestamp = null;
            let minDiff = Infinity;

            // 找出最接近的时间点
            if (this.userPreferences[userId]) {
                for (const timestamp in this.userPreferences[userId]) {
                    const diff = Math.abs(currentTimestamp - parseInt(timestamp));
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestTimestamp = timestamp;
                    }
                }
            }

            // 检查是否有偏好数据
            if (!closestTimestamp || !this.userPreferences[userId][closestTimestamp] ||
                Object.keys(this.userPreferences[userId][closestTimestamp]).length === 0) {
                this.showEmptyChart();
                return;
            }

            // 使用找到的时间点更新图表
            this.updatePreferenceChart(userId, closestTimestamp);
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
        showEmptyChart() {
            if (!this.preferenceChart) return;

            this.preferenceChart.setOption({
                title: {
                    text: '无浏览记录数据',
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
            const startTime = performance.now(); // 添加这一行来初始化 startTime

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

        // 更新兴趣饼图
        // 修改updatePreferenceChart方法，添加错误处理
        updatePreferenceChart(userId, timestamp) {
            if (!this.preferenceChart) return;
            const startTime = performance.now();
            const preferences = this.userPreferences[userId];
            if (!preferences || !preferences[this.currentTimeIndex]) {
                this.showEmptyChart();
                return;
            }

            const currentPrefs = preferences[this.currentTimeIndex];
            // 检查是否有数据
            if (Object.keys(currentPrefs).length === 0) {
                this.showEmptyChart();
                return;
            }

            const seriesData = Object.entries(currentPrefs).map(([name, value]) => {
                return {
                    name,
                    value,
                    itemStyle: {
                        color: this.getCategoryColor(name)
                    }
                };
            });

            // 更新兴趣饼图方法中的配置
            const option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                series: [
                    {
                        name: '兴趣占比',
                        type: 'pie',
                        radius: ['40%', '70%'],
                        center: ['50%', '50%'],
                        avoidLabelOverlap: false,
                        label: {
                            show: false
                        },
                        emphasis: {
                            label: {
                                show: false
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
                action: `查询用户兴趣 (ID:${userId}, 时间点:${this.timePoints[this.currentTimeIndex]})`,
                timestamp: Date.now(),
                responseTime: Math.round(endTime - startTime),
                resultCount: Object.keys(preferences[this.currentTimeIndex]).length
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

        // 修改showLargeChart方法以适应新的数据结构
        showLargeChart() {
            if (!this.selectedUser) return;
            if (this.preferencesLoading) return; // 数据加载中不显示大图

            const userId = this.selectedUser.id;
            const preferences = this.userPreferences[userId];
            if (!preferences || !preferences[this.currentTimeIndex] ||
                Object.keys(preferences[this.currentTimeIndex]).length === 0) {
                return; // 无数据不显示大图
            }

            this.isLargeChartVisible = true;

            this.$nextTick(() => {
                const largeDom = document.getElementById('large-preference-chart');
                if (!this.largeChart && largeDom) {
                    this.largeChart = echarts.init(largeDom);
                }

                if (this.largeChart) {
                    // 获取当前用户和时间点的偏好数据
                    const currentPrefs = preferences[this.currentTimeIndex];

                    const seriesData = Object.entries(currentPrefs).map(([name, value]) => {
                        return {
                            name,
                            value,
                            itemStyle: {
                                color: this.getCategoryColor(name)
                            }
                        };
                    });

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
                            formatter: '{a} <br/>{b}: {c} ({d}%)'
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
                                    formatter: '{b}: {d}%',
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
            });
        },

        // 隐藏大图
        hideLargeChart() {
            this.isLargeChartVisible = false;
        }
    }
}