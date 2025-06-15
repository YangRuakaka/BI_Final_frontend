module.exports = {
    devServer: {
        port: 8081,  // 设置前端开发服务器运行在8081端口
        proxy: {
            '/api': {  // 只代理 API 请求
                target: 'http://127.0.0.1:8080',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''  // 移除 /api 前缀
                }
            },
            '/agent': {  // 代理智能助手 API
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                ws: false
            }
        }
    }
}