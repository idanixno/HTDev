export default function AdminLoading() {
  return (
    <div className="admin-loading" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">در حال بارگذاری…</span>
      <div className="admin-loading__header">
        <div className="admin-shimmer admin-shimmer--eyebrow" />
        <div className="admin-shimmer admin-shimmer--title" />
        <div className="admin-shimmer admin-shimmer--line" />
      </div>
      <div className="admin-loading__grid">
        <div className="admin-shimmer admin-shimmer--card" />
        <div className="admin-shimmer admin-shimmer--card" />
        <div className="admin-shimmer admin-shimmer--card" />
        <div className="admin-shimmer admin-shimmer--card" />
      </div>
      <div className="admin-shimmer admin-shimmer--panel" />
      <div className="admin-shimmer admin-shimmer--table" />
    </div>
  );
}
