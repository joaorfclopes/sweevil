import $ from 'jquery';
import { useEffect, useRef, useState } from 'react';
import Placeholder from '../components/Placeholder';

export default function Video(props) {
  const [hidePlaceholder, setHidePlaceholder] = useState(false);
  const imgRef = useRef(null);

  const videoLoaded = () => {
    $('.video-desktop').addClass('show');
    $('.video-mobile').addClass('show');
    $('.video-subtitle').addClass('show');
    setHidePlaceholder(true);
  };

  useEffect(() => {
    if (imgRef.current?.complete) videoLoaded();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const videoElem = document.getElementById('video');
    videoElem.onended = () => {
      videoElem.pause();
      videoElem.removeAttribute('src');
      videoElem.load();
    };
  }, []);

  return (
    <div className={`video ${props.mobile ? 'mobile' : 'desktop'}`}>
      <Placeholder height="100%" hide={hidePlaceholder}>
        <video
          id="video"
          className={`video-${props.mobile ? 'mobile' : 'desktop'}`}
          poster={props.poster}
          controls
          preload="none"
        >
          {props.webmSrc && <source src={props.webmSrc} type="video/webm" />}
          Your browser does not support the video tag.
        </video>
        <div className="poster">
          <img ref={imgRef} src={props.poster} alt="" onLoad={videoLoaded} />
        </div>
      </Placeholder>
      <div className="video-subtitle-container">
        <Placeholder height="100%" text hide={hidePlaceholder}>
          <p className="video-subtitle">{props.subtitle}</p>
        </Placeholder>
      </div>
    </div>
  );
}
