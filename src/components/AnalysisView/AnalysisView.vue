<template src='./AnalysisView.html'></template>
<script src='./AnalysisView.js'>
</script>

<style scoped>
#analysisview {
  border: 1px solid lightgray;
  border-radius: 5px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.viewheader {
  font-weight: bold;
  font-size: 16px;
  padding: 5px;
  background: #e5e9f2;
  text-align: start;
}

.content-row {
  flex: 1;
  overflow: hidden;
}

.chart-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ebeef5;
}

.el-form {
  margin-bottom: 15px;
}

.query-buttons {
  display: flex;
  justify-content: flex-start;
}

.result-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.loading-container i {
  font-size: 32px;
  margin-bottom: 10px;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.no-data i {
  font-size: 48px;
  margin-bottom: 10px;
}

.result-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.el-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.el-tabs__content {
  flex: 1;
  overflow: hidden;
}

.el-tab-pane {
  height: 100%;
}

.chart-wrapper {
  height: 100%;
  min-height: 300px;
}

.pagination-container {
  text-align: right;
  padding: 10px 0;
  background-color: #fff;
}

.analysis-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.analysis-placeholder i {
  font-size: 48px;
  margin-bottom: 10px;
}

.chat-container {
  height: 325px;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.chat-header {
  padding: 8px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  font-weight: 600;
  font-size: 14px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9fafc;
}

.chat-messages::-webkit-scrollbar {
  width: 2px;
  height: 2px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background-color: rgba(220, 223, 230, 0.3);
  border-radius: 0;
}

.chat-messages::-webkit-scrollbar-track {
  background-color: transparent;
}

.message {
  margin-bottom: 10px;
  max-width: 80%;
  word-break: break-word;
}

.user-message {
  margin-left: auto;
}

.bot-message {
  margin-right: auto;
}

.message-content {
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.4;
}

.user-message .message-content {
  background-color: #409eff;
  color: white;
  border-top-right-radius: 3px;
}

.bot-message .message-content {
  background-color: #e4e7ed;
  color: #333;
  border-top-left-radius: 3px;
}

.chat-input {
  padding: 10px;
  display: flex;
  background-color: #fff;
  border-top: 1px solid #ebeef5;
}

.chat-input .el-input {
  margin-right: 5px;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  height: 320px;
}

.compact-form {
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 8px;
  border: 1px solid #ebeef5;
}

.compact-form .el-form-item {
  margin-bottom: 8px;
}

.compact-form .el-form-item__label {
  padding-right: 8px;
  line-height: 28px;
}

.compact-form .el-slider {
  margin-top: 8px;
  margin-bottom: 8px;
}

.action-buttons {
  margin-bottom: 0 !important;
  margin-left: -48px !important;
  display: flex;
  justify-content: flex-start;
}

.action-buttons .el-button {
  margin-right: 6px;
  padding: 5px 10px;
}

.result-container.expanded {
  flex: 1;
}

.el-table {
  font-size: 12px;
}

.el-table td, .el-table th {
  padding: 6px 0;
}

.compact-slider .el-slider {
  height: 20px;
  margin: 4px 0;
}

.compact-slider .el-slider__runway {
  height: 4px;
  margin: 8px 0;
}

.compact-slider .el-slider__button-wrapper {
  width: 18px;
  top: -7px;
}

.compact-slider .el-slider__button {
  height: 12px;
  width: 12px;
}

.compact-slider .el-slider__marks-text {
  font-size: 10px;
  margin-top: -2px;
}

.statistics-wrapper {
  padding: 10px;
  height: 100%;
  overflow-y: auto;
}

.statistics-card {
  margin-bottom: 15px;
}

.total-clicks {
  text-align: center;
  padding: 20px 0;
}

.total-clicks-value {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
}

.total-clicks-label {
  font-size: 14px;
  color: #606266;
  margin-top: 5px;
}
</style>