export type DashboardIconKey =
  | "badge-dollar-sign"
  | "building-2"
  | "activity"
  | "shield-alert";

export type KpiCardTone = "highlight" | "positive" | "neutral" | "negative";
export type TimelineTone = "positive" | "negative" | "neutral";

export interface DashboardKpi {
  title: string;
  value: string;
  change: string;
  hint: string;
  tone: KpiCardTone;
  icon: DashboardIconKey;
}

export interface DroppedListing {
  id: string;
  community: string;
  area: string;
  originalPrice: string;
  currentPrice: string;
  drop: string;
  daysOnMarket: number;
  note: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: TimelineTone;
}

export const dashboardKpis: DashboardKpi[] = [
  {
    title: "今日降价套数",
    value: "27",
    change: "+8 较昨日",
    hint: "监控范围内新增降价房源继续放量。",
    tone: "highlight",
    icon: "badge-dollar-sign",
  },
  {
    title: "重点小区均价偏离",
    value: "-4.8%",
    change: "优于板块均值",
    hint: "价格洼地线索主要集中在梅江与奥城板块。",
    tone: "positive",
    icon: "building-2",
  },
  {
    title: "新增预警小区",
    value: "3",
    change: "+1 较昨日",
    hint: "逆势涨价与高挂牌周期叠加，需要人工复核。",
    tone: "negative",
    icon: "shield-alert",
  },
  {
    title: "在监控活跃房源",
    value: "146",
    change: "72% 在 30 天内",
    hint: "主城区样本活跃度维持稳定，可继续扩展榜单维度。",
    tone: "neutral",
    icon: "activity",
  },
];

export const droppedListings: DroppedListing[] = [
  {
    id: "aocheng-a1",
    community: "奥城公馆",
    area: "89㎡",
    originalPrice: "235万",
    currentPrice: "219万",
    drop: "-6.8%",
    daysOnMarket: 11,
    note: "现价低于近30天同户型挂牌均值",
  },
  {
    id: "meijiang-b2",
    community: "梅江南云水园",
    area: "102㎡",
    originalPrice: "318万",
    currentPrice: "296万",
    drop: "-6.9%",
    daysOnMarket: 18,
    note: "价格回撤后进入可谈区间",
  },
  {
    id: "shuishang-c3",
    community: "水上温泉花园",
    area: "76㎡",
    originalPrice: "188万",
    currentPrice: "178万",
    drop: "-5.3%",
    daysOnMarket: 7,
    note: "小面积刚需盘，成交转化概率高",
  },
  {
    id: "hexi-d4",
    community: "海逸长洲",
    area: "128㎡",
    originalPrice: "468万",
    currentPrice: "438万",
    drop: "-6.4%",
    daysOnMarket: 29,
    note: "高总价改善盘，议价空间继续扩大",
  },
];

export const timelineItems: TimelineItem[] = [
  {
    id: "timeline-1",
    title: "奥城公馆 89㎡ 房源再次降价",
    description: "2 小时内二次调价，累计跌幅扩大到 6.8%。",
    time: "2 分钟前",
    tone: "positive",
  },
  {
    id: "timeline-2",
    title: "梅江南云水园进入价格洼地名单",
    description: "当前挂牌单价低于板块中位数约 5.1%，值得优先跟进。",
    time: "14 分钟前",
    tone: "positive",
  },
  {
    id: "timeline-3",
    title: "海河教育园出现逆势上调",
    description: "单套房源 24 小时内提价 2.3%，触发风险观察。",
    time: "28 分钟前",
    tone: "negative",
  },
  {
    id: "timeline-4",
    title: "今日监控样本已刷新完成",
    description: "挂牌样本与手工标签同步完成，可继续补充图表数据源。",
    time: "1 小时前",
    tone: "neutral",
  },
];
