import axios from 'axios'
import globalConfig from './globalConfig'
const GET_REQUEST = 'get'
const POST_REQUEST = 'post'
const dataServerUrl = `http://127.0.0.1:${globalConfig.backendPort}/api`

function request(url, params, type, callback) {
    let func
    if (type === GET_REQUEST) {
        func = axios.get
    } else if (type === POST_REQUEST) {
        func = axios.post
    }

    func(url, params).then((response) => {
        if (response.status === 200) {
            callback(response["data"])
        } else {
            console.error(response) /* eslint-disable-line */
        }
    })
        .catch((error) => {
            console.error(error) /* eslint-disable-line */
        })
}

// 创建axios实例
const apiClient = axios.create({
    baseURL: dataServerUrl,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default {
    dataServerUrl,

    // 获取新闻列表，支持多条件组合查询
    async queryNewsData(params) {
        try {
            const response = await apiClient.get('/news', { params });
            return response.data;
        } catch (error) {
            console.error('查询新闻数据失败:', error);
            throw error;
        }
    },

    // 获取新闻分类列表
    async getCategories() {
        try {
            const response = await apiClient.get('/categories');
            return response.data;
        } catch (error) {
            console.error('获取分类列表失败:', error);
            throw error;
        }
    },

    // 获取新闻主题列表
    async getTopics(category) {
        try {
            const params = category ? { category } : {};
            const response = await apiClient.get('/topics', { params });
            return response.data;
        } catch (error) {
            console.error('获取主题列表失败:', error);
            throw error;
        }
    },

    // 搜索用户
    async searchUsers(query) {
        try {
            const response = await apiClient.get('/users/search', { params: { query } });
            return response.data;
        } catch (error) {
            console.error('搜索用户失败:', error);
            throw error;
        }
    },

    // 导出新闻数据
    async exportNewsData(params) {
        try {
            const response = await apiClient.post('/news/export', params);
            return response.data;
        } catch (error) {
            console.error('导出数据失败:', error);
            throw error;
        }
    },

    // 获取统计分析数据
    async getNewsAnalytics(params) {
        try {
            const response = await apiClient.get('/news/analytics', { params });
            return response.data;
        } catch (error) {
            console.error('获取统计分析数据失败:', error);
            throw error;
        }
    }
}