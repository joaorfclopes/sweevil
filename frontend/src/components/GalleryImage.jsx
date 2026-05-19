import { useEffect, useRef, useState } from 'react';
import { useLazyLoad } from '../hooks/useLazyLoad';
import Placeholder from './Placeholder';

function isCached(url) {
  if (!url) return false;
  const img = new Image();
  img.src = url;
  return img.complete;
}

export default function GalleryImage({ galleryImage }) {
  const cached = isCached(galleryImage.image);
  const [containerRef, inView] = useLazyLoad('300px', cached);
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(cached);

  useEffect(() => {
    if (inView && imgRef.current?.complete && !loaded) setLoaded(true);
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  const aspectRatio = loaded
    ? undefined
    : galleryImage.width && galleryImage.height
      ? `${galleryImage.width}/${galleryImage.height}`
      : '4/3';

  return (
    <div ref={containerRef} className={`gallery-image ${galleryImage.category}`}>
      <Placeholder hide={loaded} aspectRatio={aspectRatio}>
        <div className={`gallery-image-inner${loaded ? ' show' : ''}`}>
          <img
            ref={imgRef}
            src={inView ? galleryImage.image : undefined}
            alt={galleryImage.description || ''}
            onLoad={() => setLoaded(true)}
          />
        </div>
      </Placeholder>
    </div>
  );
}
