import type {
  CommunitySegmentSeriesEntry,
  WeeklyReportLatestSnapshot,
} from "../lib/load-json";

interface DataQualityCardProps {
  latest: WeeklyReportLatestSnapshot | null;
  latestSeriesEntry: CommunitySegmentSeriesEntry | null;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "暂无";
  }

  return value.replace("T", " ").replace(".000Z", "Z");
}

export default function DataQualityCard({
  latest,
  latestSeriesEntry,
}: DataQualityCardProps): React.JSX.Element {
  if (!latest && !latestSeriesEntry) {
    return (
      <section className="card quality-card" data-testid="data-quality-card">
        <div className="eyebrow">数据质量</div>
        <h3>缺少可用样本</h3>
        <p className="empty-state">
          这一户型缺少最新周报快照和时间序列点位，当前只能等待下一次数据构建。
        </p>
      </section>
    );
  }

  const warnings: string[] = [];

  if ((latest?.listingsCount ?? latestSeriesEntry?.listingsCount ?? 0) < 3) {
    warnings.push("挂牌样本低于 3 套，当前结论稳定性不足。");
  }

  if ((latest?.manualDealCount ?? latestSeriesEntry?.manualDealCount ?? 0) === 0) {
    warnings.push("暂无人工成交样本，成交验证链条仍然缺失。");
  }

  if (latestSeriesEntry?.derivedFrom === "community-fallback") {
    warnings.push("当前价格来自小区级回退值，不是该户型独立样本。");
  }

  return (
    <section className="card quality-card" data-testid="data-quality-card">
      <div className="eyebrow">数据质量</div>
      <h3>样本与缺口</h3>
      <dl className="quality-grid">
        <div>
          <dt>挂牌样本</dt>
          <dd>{latest?.listingsCount ?? latestSeriesEntry?.listingsCount ?? "暂无"}</dd>
        </div>
        <div>
          <dt>人工成交</dt>
          <dd>
            {latest?.manualDealCount ?? latestSeriesEntry?.manualDealCount ?? "暂无"}
          </dd>
        </div>
        <div>
          <dt>取值来源</dt>
          <dd>
            {latestSeriesEntry?.derivedFrom === "segment-teasers"
              ? "户型挂牌样本"
              : "小区级回退"}
          </dd>
        </div>
        <div>
          <dt>最近补样</dt>
          <dd>{formatDateTime(latestSeriesEntry?.manualLatestSampleAt)}</dd>
        </div>
      </dl>
      <ul className="warning-list">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </section>
  );
}
