import axios from 'axios'
import globalConfig from './globalConfig'

// 创建axios实例，使用相对路径
const apiClient = axios.create({
    baseURL: globalConfig.apiBaseURL,  // 使用 '/api' 作为基础URL
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
// 请求拦截器 - 增强版
apiClient.interceptors.request.use(config => {
    // 构建完整URL（包含baseURL和查询参数）
    let fullUrl = `${config.baseURL}${config.url}`;

    // 如果有查询参数，拼接到URL上显示
    if (config.params) {
        const queryString = new URLSearchParams(config.params).toString();
        fullUrl += `?${queryString}`;
    }

    console.log(`发送请求: ${config.method.toUpperCase()} ${fullUrl}`);
    console.log('请求参数:', config.params);
    console.log('请求头:', config.headers);

    return config;
}, error => {
    return Promise.reject(error);
});

// 响应拦截器
apiClient.interceptors.response.use(response => {
    return response;
}, error => {
    console.error('API 请求错误:', error);
    return Promise.reject(error);
});

export default {
    // 获取新闻列表，支持多条件组合查询
    async queryNewsData(params) {
        try {
            const response = await apiClient.get('/news', { params });
            console.log("查询新闻数据成功:", response.data);
            return response;
        } catch (error) {
            console.error('查询新闻数据失败:', error);
            throw error;
        }
    },

    // 获取单个新闻详情
    async getNewsDetail(newsId) {
        try {
            const response = await apiClient.get(`/news/${newsId}`);
            console.log(`获取新闻详情成功 (${newsId}):`, response.data);
            return response;
        } catch (error) {
            console.error(`获取新闻详情失败 (${newsId}):`, error);
            throw error;
        }
    },

    // 获取新闻热度历史数据
    async getNewsPopularity(newsId, startDate, endDate, interval = 'day') {
        try {
            const params = { startDate, endDate, interval };
            console.log("获取新闻热度历史数据参数:", params);
            return await apiClient.get(`/news/${newsId}/popularity`, {params});
        } catch (error) {
            console.error(`获取新闻热度历史数据失败 (${newsId}):`, error);
            throw error;
        }
    },

    // 获取分类热度历史数据
    async getCategoryPopularity(categories, startDate, endDate, interval = 'day') {
        try {
            const params = { categories, startDate, endDate, interval };
            const response = await apiClient.get('/news/categories/popularity', { params });
            return response;
        } catch (error) {
            console.error(`获取分类热度历史数据失败:`, error);
            throw error;
        }
    },

    // 搜索用户
    async searchUsers(query) {
        try {
            const response = await apiClient.get('/users', { params: { query } });
            return response;
        } catch (error) {
            console.error('搜索用户失败:', error);
            throw error;
        }
    },

    async queryUsersData(params) {
        try {
            // params 应该包含 page, pageSize, query 等参数
            const response = await apiClient.get('/users', { params });
            return response;
        } catch (error) {
            console.error('搜索用户失败:', error);
            throw error;
        }
    },

    async getUserBrowseHistory(userId, timestamp, page = 1, pageSize = 20) {
        try {
            const params = { timestamp, page, pageSize };
            const response = await apiClient.get(`/users/${userId}/browse-history`, { params });
            return response;
        } catch (error) {
            console.error(`获取用户浏览历史失败 (${userId}):`, error);
            throw error;
        }
    },

    // 获取用户推荐新闻
    async getUserRecommendations(userId, timestamp) {
        try {
            const params = { timestamp };
            const response = await apiClient.get(`/news/users/${userId}/recommendations`, { params });
            console.log(`获取用户推荐新闻成功 (${userId}):`, response.data);
            return response;
        } catch (error) {
            console.error(`获取用户推荐新闻失败 (${userId}):`, error);
            throw error;
        }
    },

    async sendAgentMessage(message, timestamp) {
        try {
            // 使用代理路径访问智能助手API
            const agentResponse = await apiClient.post('/agent', {
                input: message,
                session_id: 'default'
            });
            
            // 包装成统一格式返回
            return {
                data: {
                    code: 200,
                    data: {
                        message: agentResponse.data.response,
                        tools_used: agentResponse.data.tools_used
                    }
                }
            };
        } catch (error) {
            console.error('发送智能助手消息失败:', error);
            throw error;
        }
    },

    // 统计查询
    async getStatistics(params) {
        try {
            console.log('调用统计查询API, 参数:', params);
            const response = await apiClient.get('/news/statistics', { params });
            console.log('统计查询响应:', response.data);
            return response;
        } catch (error) {
            console.error('统计查询失败:', error);
            throw error;
        }
    },

    async getUserInterestTrend(userId, startDate, endDate, page = 1, pageSize = 20) {
        try {
            const params = { startDate, endDate, page, pageSize };
            const response = await apiClient.get(`/users/${userId}/interest`, { params });
            return response;
        } catch (error) {
            console.error(`获取用户兴趣趋势数据失败 (${userId}):`, error);
            throw error;
        }
    }
}