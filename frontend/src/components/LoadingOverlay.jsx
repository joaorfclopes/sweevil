export default function LoadingOverlay({ loading, children, minHeight }) {
  return (
    <div
      className="loading-overlay-wrap"
      style={{ minHeight: loading && minHeight ? minHeight : undefined }}
    >
      <div
        style={{
          opacity: loading ? 0.25 : 1,
          pointerEvents: loading ? 'none' : undefined,
          transition: 'opacity 0.15s',
        }}
      >
        {children}
      </div>
      {loading && (
        <div className="loading-overlay">
          <img className="spinner" src={window.location.origin + '/icon.svg'} alt="" width="70px" />
        </div>
      )}
    </div>
  );
}
