import DataQualityCard from "./DataQualityCard";
import ManualInputCard from "./ManualInputCard";
import TrendChart from "./TrendChart";

import type {
  CommunitySegmentSeriesEntry,
  CommunitySegmentSeriesFile,
  WeeklyReportLatestSnapshot,
} from "../lib/load-json";
import type { CommunityStatus } from "../../../lib/types";

interface ComparisonCommunity {
  id: string;
  name: string;
  district: string;
  segmentLabel: string;
  verdict: string | null;
  latestPrice: number | null;
  listingsCount: number | null;
}

interface DetailViewProps {
  communityName: string;
  communityStatus: CommunityStatus;
  segmentLabel: string;
  verdict: string | null;
  latest: WeeklyReportLatestSnapshot | null;
  latestSeriesEntry: CommunitySegmentSeriesEntry | null;
  seriesFile: CommunitySegmentSeriesFile | null;
  comparisonCommunities: ComparisonCommunity[];
  issueFormUrl: string;
  onBack: () => void;
}

function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "暂无";
  }

  return `${value.toLocaleString("zh-CN")} 元/㎡`;
}

function formatListingsCount(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "暂无";
  }

  return `${value} 套`;
}

function buildConclusionText(
  communityName: string,
  communityStatus: CommunityStatus,
  segmentLabel: string,
  verdict: string | null,
  latest: WeeklyReportLatestSnapshot | null,
  latestSeriesEntry: CommunitySegmentSeriesEntry | null,
): string {
  const latestSnapshot = latest ?? latestSeriesEntry;

  if (communityStatus === "pending_verification") {
    if (!latestSnapshot) {
      return `${communityName} ${segmentLabel} 当前状态为待复核，等待下一次周报构建后再补充摘要。`;
    }

    return `${communityName} ${segmentLabel} 当前状态为待复核，暂不作为已验证自动监控结论展示。最新挂牌中位价 ${formatPrice(
      latestSnapshot.listingUnitPriceMedian,
    )}，挂牌 ${latestSnapshot.listingsCount} 套，疑似成交 ${latestSnapshot.suspectedDealCount} 套。`;
  }

  if (latest) {
    return `${communityName} ${segmentLabel} 当前判定为${verdict ?? "待观察"}，最新挂牌中位价 ${formatPrice(
      latest.listingUnitPriceMedian,
    )}，挂牌 ${latest.listingsCount} 套，疑似成交 ${latest.suspectedDealCount} 套。`;
  }

  if (latestSeriesEntry) {
    return `${communityName} ${segmentLabel} 当前判定为${verdict ?? "待观察"}，最新挂牌中位价 ${formatPrice(
      latestSeriesEntry.listingUnitPriceMedian,
    )}，挂牌 ${latestSeriesEntry.listingsCount} 套，疑似成交 ${latestSeriesEntry.suspectedDealCount} 套。`;
  }

  return `${communityName} ${segmentLabel} 当前缺少最新结论，等待下一次周报构建。`;
}

export default function DetailView({
  communityName,
  communityStatus,
  segmentLabel,
  verdict,
  latest,
  latestSeriesEntry,
  seriesFile,
  comparisonCommunities,
  issueFormUrl,
  onBack,
}: DetailViewProps): React.JSX.Element {
  const conclusionText = buildConclusionText(
    communityName,
    communityStatus,
    segmentLabel,
    verdict,
    latest,
    latestSeriesEntry,
  );

  return (
    <section className="detail-shell">
      <button className="back-link" type="button" onClick={onBack}>
        返回概览
      </button>
      <header className="detail-header">
        <div className="eyebrow">户型详情</div>
        <h2>{segmentLabel}</h2>
        <p className="muted">
          用同一套静态 JSON 同时呈现趋势、结论、对比小区和样本质量。
        </p>
      </header>

      <section className="card narrative-card">
        <div className="eyebrow">最新结论</div>
        <p className="narrative">{conclusionText}</p>
      </section>

      <section className="card">
        <div className="eyebrow">趋势图</div>
        <TrendChart series={seriesFile?.series ?? []} segmentLabel={segmentLabel} />
      </section>

      <DataQualityCard
        communityStatus={communityStatus}
        latest={latest}
        latestSeriesEntry={latestSeriesEntry}
      />

      <section className="card" data-testid="comparison-communities">
        <div className="eyebrow">横向对比</div>
        <h3>另外 {comparisonCommunities.length} 个监控小区</h3>
        <ul className="comparison-list">
          {comparisonCommunities.map((community) => (
            <li
              key={community.id}
              className="comparison-row"
              data-testid={`comparison-community-${community.id}`}
            >
              <div>
                <strong>{community.name}</strong>
                <p className="muted">{community.segmentLabel}</p>
                <p className="muted">{community.district}</p>
              </div>
              <div className="comparison-metrics">
                <span>{community.verdict ?? "待补齐"}</span>
                <span>{formatPrice(community.latestPrice)}</span>
                <span>{formatListingsCount(community.listingsCount)}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <ManualInputCard issueFormUrl={issueFormUrl} />
    </section>
  );
}
