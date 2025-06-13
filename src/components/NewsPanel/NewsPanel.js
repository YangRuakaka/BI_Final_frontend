import dataService from '../../service/dataService.js'
import pipeService from '../../service/pipeService.js';
import * as echarts from 'echarts';

export default {
    name: 'NewsPanel',
    components: {},
    props: {},
    computed: {
        // 提取所有分类选项
        categoryOptions() {
            return [...new Set(this.newsList.map(item => item.category))];
        },
        // 提取所有主题选项
        topicOptions() {
            return [...new Set(this.newsList.map(item => item.topic))];
        },
        // 过滤后的新闻列表
        filteredNewsList() {
            return this.newsList;
        },
        dateRange() {
            // 生成从6月13号到7月14号的日期数组
            const dates = [];
            const startDate = new Date('2019-06-13');
            const endDate = new Date('2019-07-03');

            for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                dates.push(`${year}-${month}-${day}`);
            }

            return dates;
        },
        // 获取选中新闻的唯一分类
        selectedCategories() {
            return [...new Set(this.selectedNews.map(news => news.category))];
        },
        // 构建API请求参数
        newsApiParams() {
            const params = {
                page: this.currentPage,
                pageSize: this.pageSize,
                sortOrder: 'desc'
            };

            if (this.filterCategory) params.category = this.filterCategory;
            if (this.filterTopic) params.topic = this.filterTopic;
            if (this.searchText) params.searchText = this.searchText;

            return params;
        }
    },
    data() {
        return {
            newsList: [],  // 从API获取的新闻列表
            newsDetails: {}, // 缓存已获取的新闻详情
            currentPage: 1,  // 当前页码
            pageSize: 20,    // 每页条数
            total: 0,        // 总记录数
            loading: false,  // 加载状态
            // 新闻点击历史数据 - 记录每条新闻在过去14天内的点击次数
            categoryClickHistory: {},
            newsClickHistory: {},
            // 分类热度数据
            hoveredCategory: null,  // 当前悬停的分类
            hoverChartInstance: null, // 悬浮图表实例
            filterCategory: '', // 分类筛选
            filterTopic: '',    // 主题筛选
            searchText: '',     // 搜索文本
            selectedNews: [],   // 选中的新闻数组，最多两条
            chartInstance: null // 图表实例
        }
    },
    watch: {
        selectedNews: {
            deep: true,
            handler() {
                this.updateChart();
            }
        },
        // 监听过滤条件变化，重新加载数据
        newsApiParams: {
            deep: true,
            handler() {
                this.currentPage = 1; // 重置到第一页
                this.fetchNewsList();
            }
        }
    },
    mounted: function () {
        this.$nextTick(() => {
            // 初始加载新闻列表
            this.fetchNewsList();
            this.initChart();
        });
    },
    methods: {
        // 从API获取新闻列表
        async fetchNewsList() {
            const startTime = performance.now();
            this.loading = true;


            try {
                const response = await dataService.queryNewsData(this.newsApiParams);

                if (response.data.code === 200) {
                    this.newsList = response.data.data.items;
                    this.total = response.data.data.total;
                    this.currentPage = response.data.data.page;
                    this.pageSize = response.data.data.pageSize;
                } else {
                    console.error('获取新闻列表失败:', response.data.message);
                }

                const endTime = performance.now();
                pipeService.emitQueryLog({
                    source: 'NewsPanel',
                    action: '获取新闻列表',
                    timestamp: Date.now(),
                    responseTime: Math.round(endTime - startTime),
                    resultCount: this.newsList.length
                });
            } catch (error) {
                console.error('获取新闻列表异常:', error);
            } finally {
                this.loading = false;
            }
        },

        // 获取单个新闻详情
        async fetchNewsDetail(newsId) {
            // 如果已经缓存，直接返回
            if (this.newsDetails[newsId]) {
                return this.newsDetails[newsId];
            }

            const startTime = performance.now();

            try {
                const response = await dataService.getNewsDetail(newsId);

                if (response.data.code === 200) {
                    // 缓存新闻详情
                    this.newsDetails[newsId] = response.data.data;

                    // 获取该新闻的热度历史数据
                    this.fetchNewsPopularity(newsId);

                    const endTime = performance.now();
                    pipeService.emitQueryLog({
                        source: 'NewsPanel',
                        action: `获取新闻详情 (${newsId})`,
                        timestamp: Date.now(),
                        responseTime: Math.round(endTime - startTime),
                        resultCount: 1
                    });

                    return response.data.data;
                } else {
                    console.error('获取新闻详情失败:', response.data.message);
                    return null;
                }
            } catch (error) {
                console.error('获取新闻详情异常:', error);
                return null;
            }
        },

        // 获取新闻热度历史数据
        async fetchNewsPopularity(newsId) {
            try {
                // 如果已经有缓存数据，则不重复获取
                if (this.newsClickHistory[newsId] && this.newsClickHistory[newsId].length > 0) {
                    return;
                }

                const startTime = performance.now();
                // 使用与图表日期范围一致的时间区间
                const startDate = '2019-06-13';
                const endDate = '2019-07-03';

                const response = await dataService.getNewsPopularity(newsId, startDate, endDate, 'day');

                if (response.data.code === 200) {
                    // 直接使用API返回的数据
                    this.newsClickHistory[newsId] = response.data.data;
                    console.log(`新闻 ${newsId} 热度历史数据:`, this.newsClickHistory[newsId]);
                    // 更新图表，如果该新闻被选中的话
                    if (this.selectedNews.find(news => news.id === newsId)) {
                        this.updateChart();
                    }

                    const endTime = performance.now();
                    pipeService.emitQueryLog({
                        source: 'NewsPanel',
                        action: `获取新闻热度历史数据 (${newsId})`,
                        timestamp: Date.now(),
                        responseTime: Math.round(endTime - startTime),
                        resultCount: this.newsClickHistory[newsId].length
                    });
                }
            } catch (error) {
                console.error(`获取新闻 ${newsId} 热度历史数据异常:`, error);
            }
        },

        // 获取分类热度历史数据
        async fetchCategoryPopularity(category) {
            try {
                // 如果已经有缓存数据，则不重复获取
                if (this.categoryClickHistory[category] && this.categoryClickHistory[category].length > 0) {
                    return;
                }

                const startTime = performance.now();
                const startDate = '2019-06-13';
                const endDate = '2019-07-03';

                const response = await dataService.getCategoryPopularity(category, startDate, endDate, 'day');

                if (response.data.code === 200) {
                    // 直接使用API返回的数据
                    this.categoryClickHistory[category] = response.data.data;

                    // 如果当前正在悬停该分类，则更新悬浮图表
                    if (this.hoveredCategory === category) {
                        this.updateHoverChart(category);
                    }

                    const endTime = performance.now();
                    pipeService.emitQueryLog({
                        source: 'NewsPanel',
                        action: `获取分类热度数据 (${category})`,
                        timestamp: Date.now(),
                        responseTime: Math.round(endTime - startTime),
                        resultCount: this.categoryClickHistory[category].length
                    });
                }
            } catch (error) {
                console.error(`获取分类 ${category} 热度历史数据异常:`, error);
            }
        },

        // 处理分页变化
        handlePageChange(page) {
            this.currentPage = page;
            this.fetchNewsList();
        },

        getCategoryColor(category) {
            const colorMap = {
                'sports': '#2196F3',
                'news': '#4CAF50',
                'foodanddrink': '#FF9800',
                'weather': '#F44336',
                'autos': '#9C27B0',
                'finance': '#00BCD4',
                'tv': '#8BC34A'
            };
            return colorMap[category] || '#9E9E9E';
        },

        // 处理行点击事件
        async handleRowClick(row) {
            const startTime = performance.now();

            // 获取完整的新闻详情
            const newsDetail = await this.fetchNewsDetail(row.id);
            if (!newsDetail) return;

            // 以下使用详情数据而非列表数据
            const completeRow = newsDetail;

            const index = this.selectedNews.findIndex(news => news.id === completeRow.id);
            if (index > -1) {
                this.selectedNews.splice(index, 1);
            } else {
                if (this.selectedNews.length < 2) {
                    this.selectedNews.push(completeRow);
                } else {
                    // 如果已选择两条新闻，替换最早选择的一条
                    this.selectedNews.shift();
                    this.selectedNews.push(completeRow);
                }
            }

            const endTime = performance.now();
            pipeService.emitQueryLog({
                source: 'NewsPanel',
                action: `${index > -1 ? '取消选择' : '选择'}新闻 ${completeRow.id}`,
                timestamp: Date.now(),
                responseTime: Math.round(endTime - startTime),
                resultCount: this.selectedNews.length
            });
        },

        // 检查新闻是否被选中
        isNewsSelected(newsId) {
            return this.selectedNews.some(news => news.id === newsId);
        },

        // 更新图表数据
        updateChart() {
            if (!this.chartInstance) return;
            const startTime = performance.now();
            // 准备图表配置
            const option = {
                title: {
                    text: '新闻热度变化趋势',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params) {
                        let result = params[0].axisValueLabel + '<br/>';
                        params.forEach(param => {
                            result += `${param.marker} ${param.seriesName}: ${param.value} 次点击<br/>`;
                        });
                        return result;
                    }
                },
                // 移除底部图例
                legend: {
                    show: false
                },
                grid: {
                    left: '8%',
                    right: '8%',
                    bottom: '8%',
                    top: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: this.dateRange,
                    axisLabel: {
                        formatter: (value) => value.substring(5) // 只显示月-日
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '点击次数'
                },
                series: this.getChartSeries()
            };

            // 应用配置
            this.chartInstance.setOption(option);
            const endTime = performance.now();
            pipeService.emitQueryLog({
                source: 'NewsPanel',
                action: '更新新闻趋势图表',
                timestamp: Date.now(),
                responseTime: Math.round(endTime - startTime),
                resultCount: this.selectedNews.length
            });
        },

        // 获取图表系列数据
        // 获取图表系列数据
        getChartSeries() {
            return this.selectedNews.map(news => {
                const clickData = this.newsClickHistory[news.id] || [];

                // 确保数据与日期范围一致
                const data = this.dateRange.map(date => {
                    const record = clickData.find(item => item.date === date);
                    return record ? record.count : 0;
                });

                return {
                    name: news.headline,
                    type: 'line',
                    data: data,
                    smooth: true,
                    lineStyle: {
                        color: this.getTopicColor(news.topic),
                        width: 3
                    },
                    itemStyle: {
                        color: this.getTopicColor(news.topic)
                    },
                    emphasis: {
                        focus: 'series'
                    }
                };
            });
        },

        // 清空选中的新闻
        clearSelectedNews() {
            this.selectedNews = [];

            // 确保图表显示为空状态
            if (this.chartInstance) {
                const emptyOption = {
                    title: {
                        text: '新闻热度变化趋势',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        show: false
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '8%',
                        top: '15%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: this.dateRange,
                        axisLabel: {
                            formatter: (value) => value.substring(5)
                        }
                    },
                    yAxis: {
                        type: 'value',
                        name: '点击次数'
                    },
                    series: [] // 空系列数据
                };

                this.chartInstance.setOption(emptyOption, true);
            }
        },

        // 获取主题颜色方法
        getTopicColor(topic) {
            const colorMap = {
                'soccer': '#1565C0',
                'basketball': '#0D47A1',
                'tennis': '#0277BD',
                'ai': '#2E7D32',
                'space': '#1B5E20',
                'cybersecurity': '#388E3C',
                'finance': '#EF6C00',
                'retail': '#E65100',
                'automotive': '#F57F17',
                'elections': '#C62828',
                'international': '#B71C1C',
                'legislation': '#D32F2F',
                'movies': '#7B1FA2',
                'music': '#6A1B9A',
                'television': '#4A148C',
                'research': '#00838F',
                'nutrition': '#006064',
                'mental health': '#00695C',
                'climate': '#558B2F',
                'medicine': '#33691E'
            };
            return colorMap[topic] || '#607D8B';
        },

        // 初始化图表
        initChart() {
            const chartDom = document.getElementById('news-trend-chart');
            if (chartDom) {
                this.chartInstance = echarts.init(chartDom);
                this.updateChart();
            }

            // 初始化悬浮图表（但不显示）
            const hoverChartDom = document.getElementById('category-hover-chart');
            if (hoverChartDom) {
                this.hoverChartInstance = echarts.init(hoverChartDom);
            }
        },

        // 处理分类标签悬停
        handleCategoryHover(category, event) {
            this.hoveredCategory = category;

            if (category) {
                // 显示悬浮图表
                const hoverContainer = document.getElementById('hover-chart-container');
                if (hoverContainer && event) {
                    // 定位悬浮图表
                    const rect = event.target.getBoundingClientRect();
                    const container = document.querySelector('.news-chart-container').getBoundingClientRect();

                    hoverContainer.style.top = (rect.bottom - container.top + 10) + 'px';
                    hoverContainer.style.left = (rect.left - container.left) + 'px';

                    // 获取分类热度数据
                    this.fetchCategoryPopularity(category);

                    this.$nextTick(() => {
                        this.updateHoverChart(category);
                    });
                }
            }
        },

        // 更新悬浮图表
        updateHoverChart(category) {
            if (!this.hoverChartInstance || !category) return;
            const startTime = performance.now();

            // 获取分类数据
            const categoryData = this.categoryClickHistory[category] || [];

            // 处理API返回数据
            const data = this.dateRange.map(date => {
                const record = categoryData.find(item => item.date === date);
                return record ? record.count : 0;
            });

            const option = {
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params) {
                        let result = params[0].axisValueLabel + '<br/>';
                        params.forEach(param => {
                            result += `${param.marker} ${param.seriesName}: ${param.value} 次点击<br/>`;
                        });
                        return result;
                    }
                },
                grid: {
                    left: '10%',
                    right: '5%',
                    bottom: '15%',
                    top: '15%',  // 从10%增加到15%，给顶部留更多空间
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: this.dateRange,
                    axisLabel: {
                        formatter: (value) => value.substring(5),
                        fontSize: 10
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '点击次数',
                    nameTextStyle: {
                        fontSize: 10
                    },
                    axisLabel: {
                        fontSize: 10
                    }
                },
                series: [{
                    name: `${category} 分类热度`,
                    type: 'line',
                    data: data,
                    smooth: true,
                    lineStyle: {
                        color: this.getCategoryColor(category),
                        width: 2
                    },
                    itemStyle: {
                        color: this.getCategoryColor(category)
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    // 使用区域填充
                    areaStyle: {
                        opacity: 0.3,
                        color: this.getCategoryColor(category)
                    }
                }]
            };

            this.hoverChartInstance.setOption(option);

            // 调整大小以适应容器
            this.hoverChartInstance.resize();
            const endTime = performance.now();
            pipeService.emitQueryLog({
                source: 'NewsPanel',
                action: `查询分类热度 (${category})`,
                timestamp: Date.now(),
                responseTime: Math.round(endTime - startTime),
                resultCount: data.length
            });
        }
    }
}