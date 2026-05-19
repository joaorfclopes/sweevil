import { useEffect, useRef, useState } from 'react';
import { useLazyLoad } from '../hooks/useLazyLoad';
import Placeholder from './Placeholder';

const loadedUrls = new Set();

export default function GalleryImage({ galleryImage }) {
  const alreadyLoaded = loadedUrls.has(galleryImage.image);
  const [containerRef, inView] = useLazyLoad('300px', alreadyLoaded);
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(alreadyLoaded);

  useEffect(() => {
    if (!inView) return;
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) {
      loadedUrls.add(galleryImage.image);
      setLoaded(true);
      return;
    }
    const onLoad = () => {
      loadedUrls.add(galleryImage.image);
      setLoaded(true);
    };
    img.addEventListener('load', onLoad);
    return () => img.removeEventListener('load', onLoad);
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
          />
        </div>
      </Placeholder>
    </div>
  );
}
