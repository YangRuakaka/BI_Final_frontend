<template src='./NewsPanel.html'></template>
<script src='./NewsPanel.js'></script>

<style scoped>
#newspanel {
  border: 1px solid lightgray;
  border-radius: 5px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-row {
  margin-bottom: 10px;
  padding: 5px 0;
}

.viewbody {
  flex: 1;
  overflow: hidden;
  display: flex;
  padding: 10px;
}


.news-chart-container {
  padding: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.category-option, .topic-option {
  display: flex;
  align-items: center;
}

.color-block {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 6px;
}

.white-text {
  color: white !important;
  font-weight: bold;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: bold;
}

.trend-chart {
  flex: 1;
  width: 100%;
  min-height: 200px;
}

.no-data-tip {
  margin-top: 10px;
  color: #909399;
  font-size: 13px;
}

.topic-cell {
  display: flex;
  align-items: center;
}

.topic-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}

.category-tags {
  margin: 5px 0 10px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.category-tag {
  cursor: pointer;
  transition: transform 0.2s;
}

.category-tag:hover {
  transform: scale(1.05);
}

.hover-chart-container {
  position: absolute;
  width: 280px;
  height: 200px;
  background: #fff;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  border-radius: 4px;
  z-index: 100;
  padding: 8px;
}

.hover-chart-title {
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 5px;
}

.hover-chart {
  height: 170px;
  width: 100%;
}

.news-chart-container {
  position: relative;
  padding: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pagination {
  display: flex;
  justify-content: center;
  width: 100%; /* 或任何你想要的宽度 */
  margin: 10px auto;
}
</style>