<template src='./clock.html'></template>
<script src='./clock.js'>
</script>

<style scoped>
.clock-container {
  position: relative;
  display: inline-block;
}

.clock-trigger {
  cursor: pointer;
  padding: 0 10px;
  color: white;
  height: 100%;
  display: flex;
  align-items: center;
}

.clock-trigger:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.clock-panel {
  position: absolute;
  top: 60px;
  right: 0;
  width: 320px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  color: #333;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #e4e7ed;
  font-weight: bold;
}

.close-icon {
  cursor: pointer;
  color: #909399;
}

.close-icon:hover {
  color: #409EFF;
}

.panel-body {
  padding: 15px;
}

.current-time {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #409EFF;
}

.speed-control {
  margin-bottom: 15px;
}

.time-control {
  display: flex;
  justify-content: space-around;
}
</style>