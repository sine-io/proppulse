/// <reference types="vite/client" />

declare module "echarts/dist/echarts.esm.js" {
  import echarts = require("echarts");

  export = echarts;
}
