<template src='./LogView.html'></template>
<script src='./LogView.js'></script>

<style scoped>
#logview {
  border: 1px solid lightgray;
  border-radius: 5px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.viewheader {
  font-weight: bold;
  font-size: 16px;
}

.viewbody {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: calc(100% - 40px); /* 减去header高度 */
}

.el-table {
  flex-grow: 1;
}

/* 调整表头文字大小和样式 */
.el-table th {
  font-size: 12px !important;
  font-weight: 600;
}

/* 紧凑表格整体高度 */
.el-table__body, .el-table__header {
  margin: 0 !important;
}

/* 确保表格行高一致且紧凑 */
.el-table .cell {
  line-height: 20px;
  padding-left: 8px;
  padding-right: 8px;
}

/* 自定义滚动条样式 - 极细线 */
.el-table__body-wrapper::-webkit-scrollbar {
  width: 1px !important; /* 设置为最小可见值 */
  height: 1px !important;
}

.el-table__body-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(220, 223, 230, 0.2) !important; /* 更低的不透明度 */
  border-radius: 0 !important; /* 移除圆角 */
}

.el-table__body-wrapper::-webkit-scrollbar-track {
  background-color: transparent !important; /* 确保轨道完全透明 */
}

.el-table__body-wrapper:hover::-webkit-scrollbar-thumb {
  background-color: rgba(220, 223, 230, 0.3) !important; /* 悬停时仍然很淡 */
}

/* 调整行高度和内边距，使表格更紧凑 */
.el-table td, .el-table th {
  padding: 8px 0;
}

/* 保证组件占满父容器 */
.el-row {
  height: 100%;
}

.el-col {
  height: 100%;
}
</style>