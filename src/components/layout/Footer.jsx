const TICKER_TEXT =
  '#GOWESBARENG • RIDE OR DIE • KEEP PEDALING • JANGAN LUPA HELM • GOWES TERUS • ';

export default function Footer() {
  return (
    <footer className="mt-auto border-t-4 border-black bg-inverse-surface text-inverse-on-surface">
      {/* Footer Marquee */}
      <div className="neo-marquee">
        <div className="neo-marquee-inner">
          {TICKER_TEXT}
          {TICKER_TEXT}
          {TICKER_TEXT}
          {TICKER_TEXT}
        </div>
      </div>

      {/* Footer Content */}
      <div className="max-w-6xl mx-auto px-grid-margin py-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {/* Brand */}
          <div>
            <h3 className="font-display text-headline-md text-primary-container uppercase tracking-tighter mb-xs">
              GOWESBARENG
            </h3>
            <p className="font-body text-body-md text-inverse-on-surface/70 leading-relaxed">
              Platform komunitas sepeda Indonesia. Berbagi momen, cari event, dan jadi yang terdepan di leaderboard.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-label text-label-md uppercase text-primary-container mb-sm">
              Navigasi
            </h4>
            <div className="flex flex-col gap-xs">
              {['Feed', 'Events', 'Leaderboard', 'Post'].map((item) => (
                <span
                  key={item}
                  className="font-mono text-label-md text-inverse-on-surface/60 hover:text-primary-container transition-neo cursor-pointer"
                >
                  → {item}
                </span>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-label text-label-md uppercase text-primary-container mb-sm">
              Komunitas
            </h4>
            <div className="flex flex-col gap-xs">
              <span className="font-mono text-label-md text-inverse-on-surface/60">
                📍 Indonesia
              </span>
              <span className="font-mono text-label-md text-inverse-on-surface/60">
                🚴 Semua jenis sepeda
              </span>
              <span className="font-mono text-label-md text-inverse-on-surface/60">
                ⚡ Powered by passion
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="h-[4px] bg-inverse-on-surface/20 w-full my-md" />
        <div className="flex items-center justify-between flex-wrap gap-xs">
          <span className="font-mono text-label-sm text-inverse-on-surface/40 uppercase tracking-wider">
            © {new Date().getFullYear()} GOWESBARENG — All rights reserved
          </span>
          <span className="font-mono text-label-sm text-inverse-on-surface/40 uppercase tracking-wider italic">
            Built with 🔥 for the riding community
          </span>
        </div>
      </div>
    </footer>
  );
}
