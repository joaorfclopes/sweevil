import { useEffect, useRef, useState } from 'react';
import Placeholder from '../components/Placeholder';

export default function Video(props) {
  const [hidePlaceholder, setHidePlaceholder] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElem = videoRef.current;

    const videoLoaded = () => {
      document.querySelectorAll('.video-desktop, .video-mobile, .video-subtitle').forEach((el) => {
        el.classList.add('show');
      });
      setHidePlaceholder(true);
    };

    const onEnded = () => {
      videoElem.pause();
      videoElem.load();
    };

    videoElem.addEventListener('loadedmetadata', videoLoaded, { once: true });
    videoElem.addEventListener('ended', onEnded);

    const originalPlay = videoElem.play.bind(videoElem);
    videoElem.play = function () {
      return originalPlay().catch((err) => {
        if (err.name === 'AbortError') return;
        throw err;
      });
    };

    return () => {
      if (!videoElem) return;
      videoElem.removeEventListener('loadedmetadata', videoLoaded);
      videoElem.removeEventListener('ended', onEnded);
      videoElem.play = originalPlay;
    };
  }, []);

  return (
    <div className={`video ${props.mobile ? 'mobile' : 'desktop'}`}>
      <Placeholder height="100%" hide={hidePlaceholder}>
        <video
          ref={videoRef}
          className={`video-${props.mobile ? 'mobile' : 'desktop'}`}
          poster={props.poster}
          controls
          preload="metadata"
        >
          {props.webmSrc && <source src={props.webmSrc} type="video/webm" />}
          Your browser does not support the video tag.
        </video>
      </Placeholder>
      <div className="video-subtitle-container">
        <Placeholder height="100%" text hide={hidePlaceholder}>
          <p className="video-subtitle">{props.subtitle}</p>
        </Placeholder>
      </div>
    </div>
  );
}
