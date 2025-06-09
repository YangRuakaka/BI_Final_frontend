import dataService from '../../service/dataService.js'
import pipeService from '../../service/pipeService.js';
import * as echarts from 'echarts';

export default {
    name: 'UserPanel',
    components: {
    },
    props: {
    },
    computed: {
        filteredUserList() {
            if (!this.searchText) {
                return this.userList;
            }

            const searchLower = this.searchText.toLowerCase();
            return this.userList.filter(user => {
                return user.id.toString().includes(searchLower);
            });
        }
    },
    data() {
        return {
            userList: [
                { id: 1001 },
                { id: 1002 },
                { id: 1003 },
                { id: 1004 },
                { id: 1005 },
                { id: 1006 },
                { id: 1007 },
                { id: 1008 },
                { id: 1009 },
                { id: 1010 }
            ],
            selectedUser: null,
            searchText: '',
            currentTimeIndex: 0,  // 当前时间点索引
            isPlaying: false,     // 是否自动播放
            playSpeed: 1000,      // 播放速度(毫秒)
            playInterval: null,   // 播放计时器

            // 模拟时间点数据
            timePoints: [
                "2023-07-10 08:00",
                "2023-07-10 10:00",
                "2023-07-10 12:00",
                "2023-07-10 14:00",
                "2023-07-10 16:00",
                "2023-07-10 18:00",
                "2023-07-10 20:00",
                "2023-07-11 08:00",
                "2023-07-11 10:00",
                "2023-07-11 12:00"
            ],

            // 模拟用户数据 - 每个用户在不同时间点的兴趣偏好
            userPreferences: {
                1001: [
                    { technology: 45, business: 25, sports: 15, entertainment: 10, politics: 5 },
                    { technology: 50, business: 20, sports: 15, entertainment: 10, politics: 5 },
                    { technology: 55, business: 20, sports: 10, entertainment: 10, politics: 5 },
                    { technology: 50, business: 25, sports: 10, entertainment: 10, politics: 5 },
                    { technology: 45, business: 30, sports: 10, entertainment: 10, politics: 5 },
                    { technology: 40, business: 35, sports: 10, entertainment: 10, politics: 5 },
                    { technology: 35, business: 40, sports: 10, entertainment: 10, politics: 5 },
                    { technology: 30, business: 45, sports: 10, entertainment: 10, politics: 5 },
                    { technology: 25, business: 50, sports: 10, entertainment: 10, politics: 5 },
                    { technology: 20, business: 55, sports: 10, entertainment: 10, politics: 5 }
                ],
                1002: [
                    { business: 50, politics: 30, health: 10, science: 10 },
                    { business: 45, politics: 35, health: 10, science: 10 },
                    { business: 40, politics: 40, health: 10, science: 10 },
                    { business: 35, politics: 45, health: 10, science: 10 },
                    { business: 30, politics: 50, health: 10, science: 10 },
                    { business: 25, politics: 55, health: 10, science: 10 },
                    { business: 20, politics: 60, health: 10, science: 10 },
                    { business: 15, politics: 65, health: 10, science: 10 },
                    { business: 10, politics: 70, health: 10, science: 10 },
                    { business: 5, politics: 75, health: 10, science: 10 }
                ],
                1003: [
                    { sports: 70, entertainment: 20, technology: 5, health: 5 },
                    { sports: 65, entertainment: 25, technology: 5, health: 5 },
                    /* 更多时间点... */
                ],
                1004: [
                    { science: 60, technology: 30, business: 5, politics: 5 },
                    { science: 55, technology: 35, business: 5, politics: 5 },
                    /* 更多时间点... */
                ],
                1005: [
                    { business: 50, politics: 30, entertainment: 15, sports: 5 },
                    { business: 45, politics: 35, entertainment: 15, sports: 5 },
                    /* 更多时间点... */
                ]
                // 为其他用户添加类似的数据...
            },

            // 模拟推荐新闻 - 每个用户在不同时间点的推荐内容
            recommendedNews: {
                1001: [
                    [
                        { id: 101, headline: "新一代人工智能技术突破", category: "technology", topic: "AI" },
                        { id: 102, headline: "科技巨头推出新款智能手表", category: "technology", topic: "Gadgets" },
                        { id: 103, headline: "企业数字化转型加速", category: "business", topic: "Digital" },
                        { id: 104, headline: "量子计算研究获重大进展", category: "technology", topic: "Computing" },
                        { id: 105, headline: "大型科技公司财报超预期", category: "business", topic: "Finance" }
                    ],
                    [
                        { id: 106, headline: "新型芯片技术问世", category: "technology", topic: "Hardware" },
                        { id: 107, headline: "科技公司并购案获批", category: "business", topic: "M&A" },
                        { id: 108, headline: "可穿戴设备市场增长迅速", category: "technology", topic: "Wearables" },
                        { id: 109, headline: "远程办公软件需求激增", category: "technology", topic: "Software" },
                        { id: 110, headline: "初创企业获大额融资", category: "business", topic: "Investment" }
                    ],
                    // 更多时间点的推荐新闻...
                    [
                        { id: 111, headline: "5G技术全面普及", category: "technology", topic: "Networking" },
                        { id: 112, headline: "自动驾驶汽车测试取得成功", category: "technology", topic: "Automotive" },
                        { id: 113, headline: "科技股持续上涨", category: "business", topic: "Stocks" },
                        { id: 114, headline: "新能源技术取得突破", category: "technology", topic: "Energy" },
                        { id: 115, headline: "大数据分析助力企业决策", category: "business", topic: "Analytics" }
                    ],
                    // 更多时间点的推荐新闻...
                ],
                1002: [
                    [
                        { id: 201, headline: "全球经济政策调整", category: "politics", topic: "Economy" },
                        { id: 202, headline: "重要贸易协定签署", category: "business", topic: "Trade" },
                        { id: 203, headline: "国际关系新动向", category: "politics", topic: "International" },
                        { id: 204, headline: "医疗保健政策变革", category: "health", topic: "Policy" },
                        { id: 205, headline: "科研项目获政府支持", category: "science", topic: "Research" }
                    ],
                    [
                        { id: 206, headline: "政府推出经济刺激计划", category: "politics", topic: "Economy" },
                        { id: 207, headline: "企业税收政策调整", category: "business", topic: "Tax" },
                        { id: 208, headline: "国际组织召开年度会议", category: "politics", topic: "International" },
                        { id: 209, headline: "公共卫生体系改革", category: "health", topic: "Reform" },
                        { id: 210, headline: "科学创新促进经济发展", category: "science", topic: "Innovation" }
                    ],
                    // 更多时间点的推荐新闻...
                ]
                // 为其他用户添加类似的数据...
            },

            preferenceChart: null
        }
    },
    watch: {
        selectedUser(newUser) {
            if (newUser) {
                this.currentTimeIndex = 0;
                this.stopPlayback();
                this.updateUserProfile();
            }
        },
        currentTimeIndex() {
            this.updateUserProfile();
        }
    },
    mounted: function() {
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
            }
        });
    },
    methods: {
        handleRowClick(row) {
            const startTime = performance.now();

            this.selectedUser = row;

            const endTime = performance.now();

            // 获取推荐新闻数量
            const newsCount = this.getCurrentRecommendedNews().length;

            pipeService.emitQueryLog({
                source: 'UserPanel',
                action: `选择用户 ${row.id}`,
                timestamp: Date.now(),
                responseTime: Math.round(endTime - startTime),
                resultCount: newsCount
            });
        },

        // 更新用户资料和推荐
        updateUserProfile() {
            if (!this.selectedUser) return;

            const userId = this.selectedUser.id;

            // 更新兴趣饼图
            this.updatePreferenceChart(userId);

            // 推荐新闻会自动通过计算属性更新
        },

        // 更新兴趣饼图
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

            const option = {

                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                // legend: {
                //     orient: 'horizontal',
                //     bottom: 10,
                //     data: Object.keys(currentPrefs)
                // },
                series: [
                    {
                        name: '兴趣占比',
                        type: 'pie',
                        radius: ['10%', '30%'],
                        center: ['50%', '50%'],
                        avoidLabelOverlap: false,
                        label: {
                            show: true,
                            formatter: '{b}: {d}%',
                            fontSize: 12,
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: 14,
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: true,
                            smooth: true
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

        // 获取当前推荐新闻
        getCurrentRecommendedNews() {
            if (!this.selectedUser) return [];

            const userId = this.selectedUser.id;
            const newsForUser = this.recommendedNews[userId];

            if (!newsForUser || !newsForUser[this.currentTimeIndex]) {
                return [];
            }

            return newsForUser[this.currentTimeIndex];
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

        // 播放控制
        startPlayback() {
            if (this.isPlaying) return;

            this.isPlaying = true;
            this.playInterval = setInterval(() => {
                if (this.currentTimeIndex < this.timePoints.length - 1) {
                    this.currentTimeIndex++;
                } else {
                    this.stopPlayback();
                }
            }, this.playSpeed);
        },

        stopPlayback() {
            this.isPlaying = false;
            if (this.playInterval) {
                clearInterval(this.playInterval);
                this.playInterval = null;
            }
        },

        // 时间轴操作
        setTimePoint(index) {
            const startTime = performance.now();

            this.stopPlayback();
            this.currentTimeIndex = index;

            const endTime = performance.now();

            if (this.selectedUser) {
                pipeService.emitQueryLog({
                    source: 'UserPanel',
                    action: `切换时间点 (${this.timePoints[index]})`,
                    timestamp: Date.now(),
                    responseTime: Math.round(endTime - startTime),
                    resultCount: this.getCurrentRecommendedNews().length
                });
            }
        }
    }
}