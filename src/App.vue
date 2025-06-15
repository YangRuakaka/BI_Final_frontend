<template>
  <div id="app" style="width: 100%">
    <el-container>
      <el-header id="systemHeader">
        <div class="header-content">
          <span class="logo">BI</span>
          <div class="header-right">
            <clock></clock>
          </div>
        </div>
      </el-header>
      <el-main id="systemMain">
        <el-row :gutter="4" style="height: 50%; margin-bottom: 4px;">
          <el-col :span="8" style="padding:2px; height: 100%;">
            <LogView style="height: 100%;" />
          </el-col>
          <el-col :span="16" style="padding:2px; height: 100%;">
            <AnalysisView style="height: 100%;" />
          </el-col>
        </el-row>
        <el-row :gutter="4" style="height: 50%;">
          <el-col :span="12" style="padding:2px; height: 100%;">
            <NewsPanel style="height: 100%;" />
          </el-col>
          <el-col :span="12" style="padding:2px; height: 100%;">
            <UserPanel style="height: 100%;" />
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
/* global d3 $ _ */
import NewsPanel from "./components/NewsPanel/NewsPanel.vue"
import UserPanel from "./components/UserPanel/UserPanel.vue"
import LogView from "./components/LogView/LogView.vue"
import AnalysisView from "./components/AnalysisView/AnalysisView.vue"
import Clock from './components/clock/clock.vue'
export default {
  name: "app",
  components: {
    UserPanel,
    NewsPanel,
    LogView,
    AnalysisView,
    Clock
  },
  data() {
    return {};
  },
  watch: {},
  mounted: function () {
    console.log("d3: ", d3); /* eslint-disable-line */
    console.log("$: ", $); /* eslint-disable-line */
    console.log("this: ", this, this.components);
    console.log(
        "_",
        _.partition([1, 2, 3, 4], (n) => n % 2)
    ); /* eslint-disable-line */
  },
  methods: {}
};
</script>

<style>
/* 全局重置样式 */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

.el-container {
  height: 100%;
}

.viewcontainer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

#systemHeader {
  background-color: #2c3e50;
  color: white;
  text-align: start;
  font-weight: bold;
  font-size: 25px;
  line-height: 60px;
}

#systemMain {
  padding: 5px;
  /* background-color: #E9EEF3; */
  color: #333;
  text-align: center;
  height: calc(100vh - 60px); /* 动态计算高度 */
  overflow: hidden; /* 防止整体滚动 */
}

.viewheader {
  font-weight: bold;
  text-align: start;
  padding: 5px;
  background: #e5e9f2;
}

.viewbody {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 在App.vue的style部分添加 */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.logo {
  font-weight: bold;
  font-size: 25px;
}

.header-right {
  display: flex;
  align-items: center;
  height: 100%;
}
</style>
