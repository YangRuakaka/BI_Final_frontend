import Vue from 'vue'

var pipeService = new Vue({
    data: {
        TESTEVENT: 'test_event',
        QUERY_LOG_EVENT: 'query_log_event', // 新增查询日志事件
    },
    methods: {
        emitTestEvent: function(msg) {
            this.$emit(this.TESTEVENT, msg)
        },
        onTestEvent: function(callback) {
            this.$on(this.TESTEVENT, function(msg) {
                callback(msg)
            })
        },
        // 新增日志相关方法
        emitQueryLog: function(logData) {
            this.$emit(this.QUERY_LOG_EVENT, logData)
        },
        onQueryLog: function(callback) {
            this.$on(this.QUERY_LOG_EVENT, function(logData) {
                callback(logData)
            })
        }
    }
})
export default pipeService