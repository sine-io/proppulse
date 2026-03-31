interface ManualInputCardProps {
  issueFormUrl: string;
}

export default function ManualInputCard({
  issueFormUrl,
}: ManualInputCardProps): React.JSX.Element {
  return (
    <section className="card manual-card">
      <div className="eyebrow">补样入口</div>
      <h2>手工补充成交样本</h2>
      <p className="muted">
        当挂牌样本偏少时，用一条可信成交补样能显著提升每周结论的可读性。
      </p>
      <a
        className="primary-link"
        href={issueFormUrl}
        rel="noreferrer"
        target="_blank"
      >
        新增一条样本
      </a>
    </section>
  );
}
