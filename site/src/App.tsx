import {
  Activity,
  BadgeDollarSign,
  Building2,
  Radar,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";

import { ChartPanel } from "./components/dashboard/ChartPanel";
import {
  type DashboardIconKey,
  dashboardKpis,
  droppedListings,
  timelineItems,
} from "./components/dashboard/dashboard-data";
import { DroppedListingsTable } from "./components/dashboard/DroppedListingsTable";
import { KpiCard } from "./components/dashboard/KpiCard";
import { Sidebar } from "./components/dashboard/Sidebar";
import { TimelineFeed } from "./components/dashboard/TimelineFeed";
import { TopHeader } from "./components/dashboard/TopHeader";

const iconMap: Record<DashboardIconKey, typeof TrendingDown> = {
  "badge-dollar-sign": BadgeDollarSign,
  "building-2": Building2,
  activity: Activity,
  "shield-alert": ShieldAlert,
};

export default function App(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="min-h-screen lg:pl-64">
        <div className="flex h-screen flex-col">
          <TopHeader lastUpdatedLabel="10分钟前" />
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium uppercase tracking-[0.32em] text-slate-400">
                      Housing Dashboard
                    </p>
                    <div className="space-y-2">
                      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        天津核心小区降价线索总览
                      </h1>
                      <p className="max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                        聚焦降价房源、价格洼地与异常波动，给首页一个可快速扫描、可持续扩展的纯静态 Dashboard。
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.28em] text-emerald-300">
                        Favorable
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-white">
                        12
                      </div>
                      <div className="text-sm text-emerald-100/80">
                        套房源低于板块均价
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
                        Watchlist
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-white">
                        8
                      </div>
                      <div className="text-sm text-slate-300">重点监控小区</div>
                    </div>
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.28em] text-rose-300">
                        Risk
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-white">
                        3
                      </div>
                      <div className="text-sm text-rose-100/80">
                        个小区出现逆势涨价
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section
                aria-label="核心指标"
                className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
              >
                {dashboardKpis.map((item) => {
                  const { icon, ...rest } = item;

                  return (
                    <KpiCard key={item.title} icon={iconMap[icon]} {...rest} />
                  );
                })}
              </section>

              <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
                <div className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <ChartPanel
                      title="核心小区挂牌均价走势 (近30天)"
                      subtitle="跟踪重点小区挂牌均价拐点，预留 Recharts 折线图容器。"
                      icon={TrendingDown}
                      accent="emerald"
                      placeholder="[ Recharts Line Chart Placeholder ]"
                    />
                    <ChartPanel
                      title="单价洼地雷达"
                      subtitle="对比面积、总价与楼层等维度，预留散点 / 气泡图容器。"
                      icon={Radar}
                      accent="sky"
                      placeholder="[ Recharts Scatter / Bubble Chart Placeholder ]"
                    />
                  </div>

                  <DroppedListingsTable items={droppedListings} />
                </div>

                <TimelineFeed items={timelineItems} />
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
