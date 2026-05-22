export default function LoadingBox(props) {
  return (
    <div className="loading-box" style={{ lineHeight: props.lineHeight }}>
      <img
        className="spinner"
        src={window.location.origin + '/icon.svg'}
        alt=""
        width={props.width ? props.width : '70px'}
      />
    </div>
  );
}
