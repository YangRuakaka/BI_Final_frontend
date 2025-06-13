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
        <el-row :gutter="4">
          <el-col :span="8" style="padding:2px;">
            <LogView />
          </el-col>
          <el-col :span="16" style="padding:2px;">
            <AnalysisView />
          </el-col>
        </el-row>
        <el-row :gutter="4">
          <el-col :span="12" style="padding:2px;">
            <NewsPanel />
          </el-col>
          <el-col :span="12" style="padding:2px;">
            <UserPanel />
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
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  margin: 0 auto;
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
  height: 700px;
}

.viewheader {
  font-weight: bold;
  text-align: start;
  padding: 5px;
  background: #e5e9f2;
}

.viewbody {
  height: 325px;
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
