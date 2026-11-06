export function AtlasPanel() {
  return (
    <aside className="atlas-panel" aria-label="برگ اطلس معماری">
      <div className="atlas-panel__head">
        <p className="atlas-panel__code">THE KNOWLEDGE ATLAS</p>
        <p className="atlas-panel__chapter">۰۱</p>
      </div>

      <div className="atlas-panel__map">
        <div className="atlas-panel__map-head">
          <p className="atlas-panel__code">BOUNDARY / ۰۱</p>
          <p className="atlas-panel__map-index">۰۱</p>
        </div>
        <div className="atlas-panel__diagram">
          <div className="atlas-panel__ring">
            <div className="atlas-panel__core">DOMAIN ←</div>
          </div>
        </div>
      </div>

      <p className="atlas-panel__guide">DEPENDENCIES POINT INWARD</p>
      <h2 className="atlas-panel__title">معماری تمیز در عمل</h2>
      <p className="atlas-panel__note">از مرزها شروع می‌کنیم؛ نه از ابزارها.</p>
    </aside>
  );
}
