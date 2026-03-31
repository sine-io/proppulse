import type { CityMarketSeriesEntry } from "../lib/load-json";

interface MarketCardProps {
  latestEntry: CityMarketSeriesEntry | null;
}

const verdictScale = ["偏强", "中性", "偏弱"] as const;

function formatIndex(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "暂无";
  }

  return value.toFixed(1);
}

export default function MarketCard({
  latestEntry,
}: MarketCardProps): React.JSX.Element {
  return (
    <section className="card market-card" data-testid="market-card">
      <div className="eyebrow">城市体感</div>
      <div className="card-header">
        <div>
          <h2>天津二手房市场</h2>
          <p className="muted">
            以国家统计局二手房价格指数为准，给出当前监测周期的方向判断。
          </p>
        </div>
        <div
          aria-label="当前市场判断"
          className="market-pulse"
          data-state={latestEntry?.verdict ?? "未知"}
          data-testid="current-market-verdict"
        >
          {latestEntry?.verdict ?? "待更新"}
        </div>
      </div>
      <div className="market-scale" aria-label="市场刻度">
        {verdictScale.map((label) => (
          <span
            key={label}
            className="scale-pill"
            data-active={latestEntry?.verdict === label}
          >
            {label}
          </span>
        ))}
      </div>
      <dl className="metric-strip">
        <div>
          <dt>最新周</dt>
          <dd>{latestEntry?.date ?? "暂无"}</dd>
        </div>
        <div>
          <dt>环比指数</dt>
          <dd>{formatIndex(latestEntry?.secondaryHomePriceIndexMom)}</dd>
        </div>
        <div>
          <dt>同比指数</dt>
          <dd>{formatIndex(latestEntry?.secondaryHomePriceIndexYoy)}</dd>
        </div>
      </dl>
    </section>
  );
}
