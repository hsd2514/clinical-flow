const demoTicks = [0, 25, 50, 75, 100];

export default function LineChart({ title, data, insight }) {
  const values = data?.values ?? [38, 42, 36, 40, 35, 39];

  return (
    <section className="flex flex-col rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm">
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          {title}
        </h3>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700">
          trend
        </span>
      </header>

      <div className="mt-4 grid grid-cols-[auto,1fr] gap-3">
        <div className="flex flex-col justify-between text-right text-[10px] text-zinc-400">
          {demoTicks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="relative flex h-32 items-end gap-2 rounded-xl bg-zinc-50/80 p-3">
          <div className="pointer-events-none absolute inset-0">
            {demoTicks.map((t, i) => (
              <div
                key={t}
                className="absolute left-0 right-0 border-t border-dashed border-zinc-200/80"
                style={{ bottom: `${(i / (demoTicks.length - 1)) * 100}%` }}
              />
            ))}
          </div>
          {values.map((val, i) => (
            <div
              key={i}
              style={{ height: `${val}%` }}
              className="relative z-10 w-5 flex-1 rounded-full bg-linear-to-t from-sky-500 to-cyan-400 shadow-sm shadow-sky-500/40 transition hover:from-sky-600 hover:to-cyan-500"
            />
          ))}
        </div>
      </div>

      {insight && (
        <p className="mt-3 text-[11px] font-medium text-sky-700">
          <span className="mr-1 text-sky-500">●</span>
          {insight}
        </p>
      )}
    </section>
  );
}

