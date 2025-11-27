export const Footer = () => {
  return (
    <section className="rounded-2xl border border-border bg-background/70 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-foreground">
            Recent recordings
          </p>
          <p className="text-[11px] text-primary-foreground mt-0.5">
            History is stored locally on this device.
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center rounded-xl border border-dashed border-foreground px-3 py-6 text-[11px] text-primary-foreground">
        No recordings yet. Start your first one above.
      </div>
    </section>
  );
};
