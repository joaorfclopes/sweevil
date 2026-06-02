export default function PlaceHolder({ children, height, hide, text, aspectRatio }) {
  return (
    <div
      className={`placeholder${hide ? ' hide' : ''}${text ? ' text' : ''}`}
      style={{ minHeight: height, aspectRatio }}
    >
      {children}
    </div>
  );
}
