import dataService from '../../service/dataService.js'
import pipeService from '../../service/pipeService.js';
import * as echarts from 'echarts';

export default {
    name: 'UserPanel',
    components: {},
    props: {},
    computed: {
        filteredUserList() {
            if (!this.searchText) {
                return this.userList;
            }

            const searchLower = this.searchText.toLowerCase();
            return this.userList.filter(user => {
                return user.id.toString().includes(searchLower);
            });
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
            userList: [
                {id: "U271212"},
                {id: 1002},
                {id: 1003},
                {id: 1004},
                {id: 1005},
                {id: 1006},
                {id: 1007},
                {id: 1008},
                {id: 1009},
                {id: 1010}
            ],
            selectedUser: null,
            searchText: '',
            currentTimeIndex: 0,  // 当前时间点索引
            isPlaying: false,     // 是否自动播放
            playSpeed: 1000,      // 播放速度(毫秒)
            playInterval: null,   // 播放计时器

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

            // 模拟用户数据 - 每个用户在不同时间点的兴趣偏好
            userPreferences: {
                1001: [
                    {technology: 45, business: 25, sports: 15, entertainment: 10, politics: 5},
                    {technology: 50, business: 20, sports: 15, entertainment: 10, politics: 5},
                    {technology: 55, business: 20, sports: 10, entertainment: 10, politics: 5},
                    {technology: 50, business: 25, sports: 10, entertainment: 10, politics: 5},
                    {technology: 45, business: 30, sports: 10, entertainment: 10, politics: 5},
                    {technology: 40, business: 35, sports: 10, entertainment: 10, politics: 5},
                    {technology: 35, business: 40, sports: 10, entertainment: 10, politics: 5},
                    {technology: 30, business: 45, sports: 10, entertainment: 10, politics: 5},
                    {technology: 25, business: 50, sports: 10, entertainment: 10, politics: 5},
                    {technology: 20, business: 55, sports: 10, entertainment: 10, politics: 5}
                ],
                1002: [
                    {business: 50, politics: 30, health: 10, science: 10},
                    {business: 45, politics: 35, health: 10, science: 10},
                    {business: 40, politics: 40, health: 10, science: 10},
                    {business: 35, politics: 45, health: 10, science: 10},
                    {business: 30, politics: 50, health: 10, science: 10},
                    {business: 25, politics: 55, health: 10, science: 10},
                    {business: 20, politics: 60, health: 10, science: 10},
                    {business: 15, politics: 65, health: 10, science: 10},
                    {business: 10, politics: 70, health: 10, science: 10},
                    {business: 5, politics: 75, health: 10, science: 10}
                ],
                1003: [
                    {sports: 70, entertainment: 20, technology: 5, health: 5},
                    {sports: 65, entertainment: 25, technology: 5, health: 5},
                    /* 更多时间点... */
                ],
                1004: [
                    {science: 60, technology: 30, business: 5, politics: 5},
                    {science: 55, technology: 35, business: 5, politics: 5},
                    /* 更多时间点... */
                ],
                1005: [
                    {business: 50, politics: 30, entertainment: 15, sports: 5},
                    {business: 45, politics: 35, entertainment: 15, sports: 5},
                    /* 更多时间点... */
                ]
                // 为其他用户添加类似的数据...
            },

            currentRecommendedNews: [], // 当前显示的推荐新闻
            systemTime: null, // 存储系统时间
            newsLoading: false, // 新闻加载状态

            preferenceChart: null,

            // 添加以下属性
            isLargeChartVisible: false, // 改用这个变量名
            largeChart: null
        }
    },
    watch: {
        selectedUser(newUser) {
            if (newUser) {
                this.currentTimeIndex = 0;
                this.updateUserProfile();
                this.fetchRecommendedNews(); // 获取推荐新闻
            }
        },
        currentTimeIndex() {
            this.updateUserProfile();
            this.fetchRecommendedNews(); // 时间点变化时获取推荐新闻
        },
        systemTime() {
            // 系统时间变化时，如果有选中用户则更新推荐
            if (this.selectedUser) {
                this.fetchRecommendedNews();
            }
        }
    },
    mounted: function () {
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
        handleRowClick(row) {
            const startTime = performance.now();
            this.selectedUser = row;
            const endTime = performance.now();

            pipeService.emitQueryLog({
                source: 'UserPanel',
                action: `选择用户 ${row.id}`,
                timestamp: Date.now(),
                responseTime: Math.round(endTime - startTime),
                resultCount: 0 // 将在获取数据后更新
            });
        },

        // 更新用户资料和推荐
        updateUserProfile() {
            if (!this.selectedUser) return;
            const userId = this.selectedUser.id;
            // 更新兴趣饼图
            this.updatePreferenceChart(userId);
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
        async fetchRecommendedNews() {
            if (!this.selectedUser) return;

            const userId = this.selectedUser.id;
            this.newsLoading = true;

            try {
                const startTime = performance.now();
                // 使用正确格式的时间戳
                let timestamp;
                if (this.systemTime) {
                    timestamp = this.formatDateTime(this.systemTime);
                } else {
                    timestamp = this.timePoints[this.currentTimeIndex];
                }
                console.log("timestamp, userId:", timestamp, userId);

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

        // 获取当前推荐新闻 - 修改为直接返回动态获取的数据
        getCurrentRecommendedNews() {
            return this.currentRecommendedNews;
        },

        // 更新兴趣饼图
        updatePreferenceChart(userId) {
            if (!this.preferenceChart) return;
            const startTime = performance.now();
            const preferences = this.userPreferences[userId];
            if (!preferences || !preferences[this.currentTimeIndex]) return;

            const currentPrefs = preferences[this.currentTimeIndex];
            const seriesData = Object.entries(currentPrefs).map(([name, value]) => {
                return {
                    name,
                    value,
                    // 为每个类别设置颜色
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
                            show: false  // 不显示标签文字
                        },
                        emphasis: {
                            label: {
                                show: false  // 悬停时也不显示文字
                            }
                        },
                        labelLine: {
                            show: false  // 不显示引导线
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

            // 确保图表大小适应容器
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

        // 获取分类颜色 (从NewsPanel引用)
        getCategoryColor(category) {
            const colorMap = {
                'technology': '#409EFF',
                'business': '#67C23A',
                'sports': '#E6A23C',
                'entertainment': '#F56C6C',
                'politics': '#909399',
                'health': '#8E44AD',
                'science': '#16A085'
            };
            return colorMap[category] || '#909399';
        },

        // 显示大图
        showLargeChart() {
            if (!this.selectedUser) return; // 如果没有选择用户，不显示大图

            this.isLargeChartVisible = true;

            this.$nextTick(() => {
                const largeDom = document.getElementById('large-preference-chart');
                if (!this.largeChart && largeDom) {
                    this.largeChart = echarts.init(largeDom);
                }

                if (this.largeChart) {
                    // 获取当前用户和时间点的偏好数据
                    const userId = this.selectedUser.id;
                    const preferences = this.userPreferences[userId];
                    if (!preferences || !preferences[this.currentTimeIndex]) return;

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