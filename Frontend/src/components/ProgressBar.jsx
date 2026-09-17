export default function ProgressBar({ confirmed, total }) {
  const pct = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between text-xs text-ink/60 mb-1">
        <span>{confirmed} of {total} confirmed</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full bg-line rounded overflow-hidden">
        <div
          className="h-full bg-forest transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
