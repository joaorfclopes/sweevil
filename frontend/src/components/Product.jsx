import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Placeholder from './Placeholder';

function isSoldOut(product) {
  const s = product.countInStock;
  if (!s) return true;
  if (product.isClothing) {
    return ['xs', 's', 'm', 'l', 'xl', 'xxl'].every((sz) => !s[sz] || s[sz] <= 0);
  }
  return !s.stock || s.stock <= 0;
}

function isCached(url) {
  if (!url) return false;
  const img = new Image();
  img.src = url;
  return img.complete;
}

export default function Product(props) {
  const { product } = props;
  const soldOut = isSoldOut(product);
  const onSale = Boolean(product.originalPrice && product.originalPrice > product.price);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const cached = isCached(product.images[0]);

  const [inView, setInView] = useState(cached);
  const [loaded, setLoaded] = useState(cached);

  useEffect(() => {
    if (cached) return;
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (inView && imgRef.current?.complete && !loaded) {
      setLoaded(true);
    }
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} className="product" key={product._id}>
      <Link to={`/shop/product/${product._id}`}>
        <div className="product-body">
          {soldOut && <span className="sold-out-pill">Sold Out</span>}
          {onSale && <span className="sale-pill">Sale</span>}
          <Placeholder hide={loaded}>
            <div className={`product-image ${loaded ? 'show' : ''}`}>
              <img
                ref={imgRef}
                src={inView ? product.images[0] : undefined}
                alt={product.name}
                onLoad={() => setLoaded(true)}
              />
            </div>
          </Placeholder>
          <Placeholder height="100%" hide={loaded} text>
            <div className={`product-description ${loaded ? 'show' : ''}`}>
              <p className="product-name">{product.name}</p>
              <div className="line"></div>
              {onSale ? (
                <>
                  <p className="product-price-original">{product.originalPrice.toFixed(2)}€</p>
                  <p className="product-price">{product.price.toFixed(2)}€</p>
                </>
              ) : (
                <p className="product-price">{product.price && product.price.toFixed(2)}€</p>
              )}
            </div>
          </Placeholder>
        </div>
      </Link>
    </div>
  );
}
