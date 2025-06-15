import pipeService from '../../service/pipeService.js';

export default {
    name: 'LogView',
    components: {
    },
    props: {
    },
    computed: {
    },
    data() {
        return {
            queryLogs: []
        }
    },
    mounted: function() {
        // 监听查询日志事件
        pipeService.onQueryLog(this.addQueryLog);
    },
    methods: {
        addQueryLog(logData) {
            // 添加新的日志记录到列表
            this.queryLogs.unshift({
                source: logData.source || '',
                action: logData.action || '',
                timestamp: new Date(logData.timestamp).toLocaleString(),
                responseTime: logData.responseTime || 0,
                resultCount: logData.resultCount !== undefined ? logData.resultCount : '-'
            });

            // 保持日志数量在合理范围
            if (this.queryLogs.length > 100) {
                this.queryLogs = this.queryLogs.slice(0, 100);
            }
        }
    }
}