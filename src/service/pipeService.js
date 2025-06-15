import Vue from 'vue'

var pipeService = new Vue({
    data() {
        return {
            QUERY_LOG_EVENT: 'query-log',
            NEWS_SELECTION_EVENT: 'user-panel-news-selected'
        }
    },
    methods: {
        // 已有的发送查询日志方法
        emitQueryLog(logData) {
            this.$emit(this.QUERY_LOG_EVENT, logData)
        },

        // 监听查询日志事件
        onQueryLog(callback) {
            this.$on(this.QUERY_LOG_EVENT, function(logData) {
                callback(logData)
            })
        },

        // 用户从UserPanel选择新闻时发送事件
        emitClickedUsrPanelNews(eventName, data) {
            this.$emit(eventName, data)
        },

        // 监听用户选择新闻事件
        onClickedUsrPanelNews(eventName, callback) {
            this.$on(eventName, callback)
        }
    }
});

export default pipeService