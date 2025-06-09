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
  height: 230px;
}

.preference-chart {
  width: 100%;
  height: 200px;
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
</style>