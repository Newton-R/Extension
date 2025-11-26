export const Footer = () => {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-50">
            Recent recordings
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            History is stored locally on this device.
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center rounded-xl border border-dashed border-slate-700 px-3 py-6 text-[11px] text-slate-500">
        No recordings yet. Start your first one above.
      </div>
    </section>
  );
};
