export default function KpiCard({
  label,
  value,
  sub,
  accent = "text-base-100",
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-base-700 bg-base-900 p-4">
      <div className="text-xs text-base-400">{label}</div>
      <div className={`mt-2 font-mono text-2xl font-semibold ${accent}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-base-500">{sub}</div>}
    </div>
  );
}
