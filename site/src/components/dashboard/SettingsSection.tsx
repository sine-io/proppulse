import { Settings } from "lucide-react";

import type { SettingsItem } from "./dashboard-types";

interface SettingsSectionProps {
  items: SettingsItem[];
}

export function SettingsSection({
  items,
}: SettingsSectionProps): React.JSX.Element {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">系统设置</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            说明当前数据刷新、监控覆盖和本地验证方式。
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-300 ring-8 ring-violet-500/10">
          <Settings className="h-5 w-5" />
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5"
            >
              <p className="text-sm font-medium text-slate-400">{item.title}</p>
              <p className="mt-3 text-base font-semibold text-white">{item.value}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 px-6 py-10 text-center text-sm text-slate-400">
          暂无可展示的系统设置数据。
        </div>
      )}
    </section>
  );
}
