export default function PainSlider({ initialValue = 5 }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-sm">
      <header className="flex items-baseline justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Pain score
          </h3>
          <p className="text-[11px] text-zinc-500">
            0 = no pain, 10 = worst imaginable.
          </p>
        </div>
        <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-50">
          {initialValue}/10
        </span>
      </header>

      <div className="mt-1 flex items-center gap-3">
        <span className="text-[10px] text-zinc-400">0</span>
        <div className="relative h-2 flex-1 rounded-full bg-zinc-100">
          <div
            className="absolute inset-y-0 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
            style={{ width: `${(initialValue / 10) * 100}%` }}
          />
        </div>
        <span className="text-[10px] text-zinc-400">10</span>
      </div>
    </section>
  );
}

