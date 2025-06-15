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
            if (this.searchKeyword) params.searchText = this.searchKeyword; // 使用 searchKeyword 而不是 searchText

            return params;
        },
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
            searchText: '',     // 搜索框中的文本
            searchKeyword: '',  // 实际用于搜索的关键词（按回车后的值）
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

            // 监听来自UserPanel的新闻选择事件
            pipeService.onClickedUsrPanelNews('user-panel-news-selected', (news) => {
                console.log('收到UserPanel新闻点击事件:', news); // 添加日志，帮助调试
                this.handleUserPanelNewsSelection(news);
            });
        });
    },
    methods: {
        handleSearch() {
            if (this.searchText !== this.searchKeyword) {
                this.searchKeyword = this.searchText;
                this.loading = true; // 立即显示加载状态
                this.currentPage = 1; // 重置到第一页
                this.fetchNewsList();
            }
        },

        // 修改清除搜索功能
        handleClearSearch() {
            this.searchText = '';
            this.searchKeyword = '';
            this.currentPage = 1;
            this.fetchNewsList();
        },

        async fetchNewsList() {
            const startTime = performance.now();
            this.loading = true; // 确保设置加载状态

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
                this.loading = false; // 无论成功还是失败，都结束加载状态
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
                    // 确保数据是数组格式
                    const responseData = response.data.data;
                    console.log("分类热度历史数据:", responseData);

                    this.categoryClickHistory[category] = Array.isArray(responseData) ? responseData : [];
                    const keys = Object.keys(responseData);
                    const firstCategory = keys[0];
                    // 获取对应的数据数组
                    const firstCategoryData = responseData[firstCategory];
                    console.log(`第一个分类是 ${firstCategory}，数据为:`, firstCategoryData);
                    this.categoryClickHistory[firstCategory] = firstCategoryData;

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
                // 初始化为空数组以避免后续错误
                this.categoryClickHistory[category] = [];
            }
        },

        // 处理分页变化
        handlePageChange(page) {
            this.currentPage = page;
            this.fetchNewsList();
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
            this.chartInstance.setOption(option, true);
            const endTime = performance.now();
            pipeService.emitQueryLog({
                source: 'NewsPanel',
                action: '更新新闻趋势图表',
                timestamp: Date.now(),
                responseTime: Math.round(endTime - startTime),
                resultCount: this.selectedNews.length
            });
        },

        getChartSeries() {
            return this.selectedNews.map((news, index) => {
                const clickData = this.newsClickHistory[news.id] || [];

                // 确保数据与日期范围一致
                const data = this.dateRange.map(date => {
                    const record = clickData.find(item => item.date === date);
                    return record ? record.count : 0;
                });

                // 使用新闻分类对应的颜色
                const color = this.getCategoryColor(news.category);

                return {
                    name: news.headline,
                    type: 'line',
                    data: data,
                    smooth: true,
                    lineStyle: {
                        color: color,
                        width: 3
                    },
                    itemStyle: {
                        color: color
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    // 添加z值，确保新添加的线条显示在最上层
                    z: this.selectedNews.length - index
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

        async handleUserPanelNewsSelection(news) {
            if (!news || !news.newsId) {
                console.error('接收到无效的新闻数据:', news);
                return;
            }

            // 获取更详细的新闻信息
            console.log('处理来自UserPanel的新闻选择:', news);
            console.log('正在获取新闻详情:', news.newsId);
            const newsDetail = await this.fetchNewsDetail(news.newsId);
            if (!newsDetail) return;

            // 确保分类信息正确
            if (news.category && !newsDetail.category) {
                newsDetail.category = news.category;
            }

            // 检查是否已经在选中列表中
            const index = this.selectedNews.findIndex(item => item.id === news.newsId);
            if (index > -1) {
                // 已经选中则不重复添加
                return;
            }

            // 如果已有两条新闻，替换最早的一条
            if (this.selectedNews.length >= 2) {
                this.selectedNews.shift();
            }

            // 添加到选中列表
            this.selectedNews.push(newsDetail);

            // 确保获取该新闻的热度历史数据
            this.fetchNewsPopularity(news.newsId);
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
            const categoryData = this.categoryClickHistory[category];

            // 如果数据不存在或不是数组，记录错误并返回
            if (!categoryData) {
                console.error(`分类 ${category} 的数据不存在`);
                return;
            }

            if (!Array.isArray(categoryData)) {
                console.error(`分类 ${category} 数据格式错误，应为数组但得到:`, typeof categoryData, categoryData);
                return;
            }

            // 处理API返回数据
            const data = this.dateRange.map(date => {
                // 安全地查找记录
                const matchingItem = categoryData.find(item => item && typeof item === 'object' && item.date === date);
                return matchingItem ? matchingItem.count : 0;
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
                    top: '15%',
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
                    areaStyle: {
                        opacity: 0.3,
                        color: this.getCategoryColor(category)
                    }
                }]
            };

            this.hoverChartInstance.setOption(option);
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