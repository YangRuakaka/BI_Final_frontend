<template src='./UserPanel.html'></template>
<script src='./UserPanel.js'></script>

<style scoped>
#userpanel {
  border: 1px solid lightgray;
  border-radius: 5px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.viewbody {
  flex: 0 0 600px; /* 使用固定高度替代flex: 1 */
  overflow-y: auto;
  display: flex;
  padding: 10px;
}

.section-header {
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-label {
  font-size: 12px;
  color: #666;
  font-weight: normal;
}

.user-search {
  margin-bottom: 15px;
}

.user-list-container,
.user-profile-container,
.recommendation-container {
  display: flex;
  flex-direction: column;
  height: 400px;
}

.preference-chart {
  width: 100%;
  height: 200px;
}

.news-list {
  flex: 1;
  overflow-y: auto;
}

.news-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.news-item:hover {
  background-color: #f9f9f9;
}

.news-category {
  margin-bottom: 5px;
}

.news-headline {
  font-size: 14px;
}

.white-text {
  color: white;
}

.no-data,
.no-user-selected {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-style: italic;
}

.timeline-container {
  border-top: 1px solid #eee;
}

.timeline-controls {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.timeline-slider {
  margin-left: 15px;
  flex-grow: 1;
}

.timeline-markers {
  display: flex;
  justify-content: space-between;
}

.time-marker {
  font-size: 12px;
  color: #666;
  cursor: pointer;
  padding: 5px;
}

.time-marker.active {
  color: #409EFF;
  font-weight: bold;
}

/* 在 UserPanel.vue 的 <style> 部分添加 */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: #909399;
}

.loading-container i {
  font-size: 24px;
  margin-bottom: 10px;
}

#large-chart-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 600px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  padding: 20px;
}

.charts-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modal-title {
  text-align: center;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
}

.large-chart {
  flex: 1;
  width: 100%;
  min-height: 250px;
}

.interest-trend-chart-container {
  /* 删除 display: none 或者改为 */
  display: block;
  margin-top: 10px;
  height: 150px;
}

#large-preference-chart {
  width: 100%;
  height: 100%;
}

.preference-chart {
  cursor: pointer; /* 添加鼠标指针样式，表明可点击 */
}

/* 修改表格高度，使其可滚动 */
.preference-table {
  margin-top: 10px;
  font-size: 12px;
  max-height: 130px;
  overflow-y: auto;
}

/* 调整推荐新闻表格样式 */
.news-list .el-table {
  font-size: 12px;
}

.news-list .el-table__row {
  cursor: pointer;
}

.news-list .el-table__row:hover {
  background-color: #f0f9ff;
}

/* 避免无数据时表格空白区域过大 */
.no-data {
  padding: 20px;
  text-align: center;
  color: #909399;
}

/* 在 src/components/UserPanel/UserPanel.vue 的 <style> 部分添加 */
.selected-user-hint {
  font-size: 12px;
  font-weight: normal;
  margin-left: 10px;
  color: #606266;
}

.selected-user-hint .el-tag {
  margin-left: 5px;
}

.interest-trend-chart {
  width: 100%;
  height: 150px;
}

.modal-title {
  text-align: center;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
}

.large-chart {
  flex: 1;
  width: 100%;
  min-height: 250px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

</style>