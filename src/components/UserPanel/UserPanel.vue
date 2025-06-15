<template src='./UserPanel.html'></template>
<script src='./UserPanel.js'></script>

<style scoped>
#userpanel {
  border: 1px solid lightgray;
  border-radius: 5px;
}

.viewbody {
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
  height: 330px;
}

.preference-chart {
  width: 100%;
  height: 180px;  /* 从200px减少到180px */
  margin-bottom: -30px;  /* 从-20px调整到-30px，使饼图更往上 */
  margin-top: -10px;  /* 添加负的上边距，进一步向上移动 */
}

.news-list {
  overflow-y: auto;
  height: 350px;
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
  width: 700px;  /* 从500px增加到700px */
  height: 500px; /* 从400px增加到500px */
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  padding: 20px;
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

.preference-table .el-table {
  max-height: 130px;
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
  height: 130px;
  margin-top: 10px;
}
</style>