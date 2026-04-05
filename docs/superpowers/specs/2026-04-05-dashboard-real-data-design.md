# Dashboard 首页切换到真实数据设计

日期：2026-04-05

## 1. 目标

将当前首页从“静态演示数据驱动”切换为“真实数据驱动”。

本次改动的目标是：

- KPI 使用真实聚合数据
- 图表区使用真实序列数据
- 降价榜基于真实 `data/runs/*.json` 推导
- 时间线基于真实 `data/runs/*.json` 推导
- 保持现有 Dashboard UI 结构基本不变

本次不是重做页面，而是把现有静态 UI 换成真实数据入口。

## 2. 当前现状

当前首页执行路径已经是纯静态 Dashboard：

- `site/src/App.tsx`
- `site/src/components/dashboard/dashboard-data.ts`

首页现在直接读取：

- `dashboardKpis`
- `droppedListings`
- `timelineItems`

这些都是手写静态 fixture，不来自仓库真实数据产物。

但仓库里真实数据链路仍然存在：

- `site/src/lib/load-json.ts`
- `data/reports/*.json`
- `data/series/city-market/tianjin.json`
- `data/series/communities/*/*.json`
- `data/runs/*.json`

所以当前问题不是“没有真实数据”，而是“首页没有接真实数据”。

## 3. 设计结论

采用“真实数据加载 + 首页视图转换层”方案。

具体做法：

1. 继续使用 `loadDashboardData()` 读取真实聚合数据
2. 新增一个首页视图转换层，把真实数据转换成 Dashboard 组件当前所需结构
3. KPI 和图表区直接读真实聚合数据
4. 榜单和时间线从真实 `data/runs/*.json` 推导
5. 尽量不改现有组件，只改数据入口和必要字段

这个方案的优点是：

- 复用现有真实数据产物
- 保持现有 SaaS UI 不需要大改
- 推导逻辑集中在转换层，后续可继续演进
- 风险小于“重构整套数据管线”

## 4. 非目标

本次不做：

- 接入真正的 Recharts 图形渲染
- 引入后端服务或数据库
- 重构整个采集管线
- 做高复杂度模糊匹配算法
- 做跨城市泛化架构

本次目标只限于：首页真实数据化。

## 5. 数据来源拆分

### 5.1 直接读取的真实聚合数据

用于：

- KPI
- 市场均价趋势图
- 小区级统计

来源：

- `data/config/communities.json`
- `data/config/segments.json`
- `data/reports/<latest>.json`
- `data/series/city-market/tianjin.json`
- `data/series/communities/<community>/<segment>.json`

通过：

- `site/src/lib/load-json.ts`

### 5.2 由真实快照推导的数据

用于：

- 降价榜
- 时间线

来源：

- `data/runs/latest.json`
- 最近若干个 `data/runs/*.json`

本次不要求新增专用首页 JSON，而是在前端转换层中先完成推导。

## 6. 首页视图转换层

推荐新增：

- `site/src/lib/dashboard-view.ts`

职责固定为：

- 输入：真实 `DashboardData` 与最近若干 run artifact
- 输出：首页视图模型

例如输出结构：

```ts
{
  lastUpdatedLabel,
  kpis,
  droppedListings,
  timelineItems,
}
```

这样：

- `App.tsx` 仍然只负责页面编排
- 组件继续消费简单展示结构
- 推导规则集中在一个地方，方便测试

## 7. KPI 规则

### 7.1 监控小区总数

来源：

- `communities.length`

### 7.2 在售房源总数

优先使用最近 run artifact 中各小区的：

- `fangCommunity.listingCount`

如果某小区缺失，再回退到：

- `latestReport.communities[*].segments[*].latest.listingsCount`

### 7.3 今日降价套数

当前真实数据里没有现成字段，因此采用推导口径：

- 比较最近两次 run 中匹配上的 teaser 房源
- 统计总价下降的样本数量

### 7.4 市场均价走势

来源：

- `city-market/tianjin.json`

展示值可取最新一日相对前一日的变化，或直接显示当前最新市场走势口径。

## 8. 降价榜规则

### 8.1 真实来源

`data/runs/*.json` 中每个小区的：

- `fangCommunity.currentListingTeasers`

字段包括：

- `title`
- `roomCount`
- `areaSqm`
- `totalPriceWan`
- `unitPriceYuanPerSqm`

### 8.2 匹配规则

由于没有稳定房源 ID，本次采用“近似同房源匹配”：

- `communityId` 相同
- `roomCount` 相同
- `areaSqm` 误差在小范围内
- `title` 相同或高度相似

这是推导口径，不是假定仓库已有严格房源主键。

### 8.3 榜单生成

匹配成功后，如果：

- 最新 `totalPriceWan` < 上一次 `totalPriceWan`

则生成一条降价样本。

榜单字段：

- `小区`
- `面积`
- `原价`
- `现价`
- `降幅`
- `上架天数`

### 8.4 “上架天数”口径

真实数据里目前没有严格挂牌天数字段，因此本次推荐改成更准确的代理口径：

- **连续观测天数**

即该 teaser 在连续 run 中被观测到的跨度天数。

如果产品文案必须保持“上架天数”，则需要在实现说明里明确它当前是推导值。

我更推荐直接把表头改成：

- `连续观测天数`

## 9. 时间线规则

时间线同样基于最近若干个 run artifact 推导。

### 9.1 事件类型

至少支持：

- `new`
  - 最新 run 新出现的 teaser
- `drop`
  - 匹配到旧 teaser 且价格下降
- `alert`
  - 小区采集失败、skipped、样本不足或异常状态
- `refresh`
  - 最新 run 刷新完成

### 9.2 时间字段

使用：

- `generatedAt`

前端再格式化为：

- `2 分钟前`
- `14 分钟前`
- `1 小时前`

### 9.3 事件文案

允许使用规则化文案，例如：

- `鸣泉花园 88㎡ 房源出现降价`
- `柏溪花园 新增 2 套可跟进样本`
- `万科东第 当前缺少有效挂牌样本`
- `今日监控样本已刷新完成`

## 10. 组件与页面边界

推荐只做最小修改：

- `site/src/App.tsx`
  - 从静态 fixture 改成真实数据加载 + 视图转换
- `site/src/lib/load-json.ts`
  - 保持真实数据加载职责
- `site/src/lib/dashboard-view.ts`
  - 新增视图转换与推导逻辑
- `site/src/components/dashboard/*`
  - 尽量保持现有组件接口

如果榜单列名从“上架天数”改成“连续观测天数”，则：

- 仅最小调整表头组件
- 不扩大为布局重做

## 11. 测试策略

### 11.1 单元测试

推荐新增：

- `tests/site/dashboard-view.test.ts`

重点覆盖：

- KPI 汇总规则
- teaser 匹配规则
- 降价样本识别
- 时间线事件生成
- 时间格式化逻辑

### 11.2 页面测试

保留现有页面结构测试，但改为真实数据驱动：

- 页面可以成功读取真实数据
- KPI / 榜单 / 时间线渲染非空
- 更新时间来自真实 `generatedAt`

### 11.3 smoke test

继续验证：

- 页面成功加载
- 核心模块可见
- 榜单存在真实行
- 时间线存在真实事件

## 12. 验证方式

实现完成后至少执行：

```bash
npm run test -- tests/site/app.test.tsx
npm run typecheck
npm run build:site
npx playwright test tests/e2e/site-smoke.spec.ts
```

如新增转换层测试，再补：

```bash
npm run test -- tests/site/dashboard-view.test.ts
```

## 13. 最终结果

本次改动完成后，首页应满足：

- 不再使用静态演示数据
- KPI 来自真实聚合数据
- 图表区来自真实序列数据
- 榜单与时间线来自真实 run 推导
- 页面视觉结构保持当前 SaaS 首页风格
