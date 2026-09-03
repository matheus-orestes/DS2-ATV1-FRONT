interface MetricCardProps {
  label: string;
  value: number;
  hint: string;
  accent?: boolean;
}

export function MetricCard({ label, value, hint, accent }: MetricCardProps) {
  return (
    <div className="card metric-card">
      <div className="metric-label">{label}</div>
      <div className={`metric-value ${accent ? 'accent-value' : ''}`}>{value}</div>
      <div className="metric-hint">{hint}</div>
    </div>
  );
}
