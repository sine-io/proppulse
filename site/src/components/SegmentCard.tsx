import type {
  CommunitySegmentSeriesEntry,
  WeeklyReportSegmentSnapshot,
} from "../lib/load-json";

interface SegmentCardProps {
  communityName: string;
  segmentLabel: string;
  snapshot: WeeklyReportSegmentSnapshot | null;
  latestEntry: CommunitySegmentSeriesEntry | null;
  onSelect: () => void;
}

function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "暂无";
  }

  return `${value.toLocaleString("zh-CN")} 元/㎡`;
}

export default function SegmentCard({
  communityName,
  segmentLabel,
  snapshot,
  latestEntry,
  onSelect,
}: SegmentCardProps): React.JSX.Element {
  const latest = snapshot?.latest ?? null;

  return (
    <article className="card segment-card">
      <div className="segment-meta">
        <p className="segment-community">{communityName}</p>
        <span className="segment-verdict">{snapshot?.verdict ?? "待补齐"}</span>
      </div>
      <h3>{segmentLabel}</h3>
      <p className="segment-price">
        {formatPrice(latest?.listingUnitPriceMedian ?? latestEntry?.listingUnitPriceMedian)}
      </p>
      <dl className="segment-stat-grid">
        <div>
          <dt>挂牌样本</dt>
          <dd>{latest?.listingsCount ?? latestEntry?.listingsCount ?? "暂无"}</dd>
        </div>
        <div>
          <dt>疑似成交</dt>
          <dd>
            {latest?.suspectedDealCount ?? latestEntry?.suspectedDealCount ?? "暂无"}
          </dd>
        </div>
      </dl>
      <p className="muted">
        {latest
          ? latest.listingsCount > 0
            ? `最新样本 ${latest.listingsCount} 套，适合继续跟踪。`
            : "当前挂牌样本为 0 套，建议补样或等待新周期。"
          : "缺少最新周报快照，暂时只显示基础时间序列。"}
      </p>
      <button
        className="ghost-button"
        type="button"
        onClick={onSelect}
        aria-label={`查看 ${segmentLabel} 详情`}
      >
        查看 {segmentLabel} 详情
      </button>
    </article>
  );
}
