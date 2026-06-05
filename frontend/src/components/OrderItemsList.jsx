import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLazyLoad } from '../hooks/useLazyLoad';
import Placeholder from './Placeholder';

function ItemImage({ item, idPrefix }) {
  const [containerRef, inView] = useLazyLoad('300px');
  const imgRef = useRef(null);
  const imgId = `${item.product}-${idPrefix}-img`;

  useEffect(() => {
    if (inView && imgRef.current?.complete) {
      document.getElementById(imgId)?.classList.add('show');
    }
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} className="item-image">
      <Placeholder height="100%" hide={inView}>
        <div id={imgId} className="item-image-inner">
          <Link to={`/shop/product/${item.product}`}>
            <img
              ref={imgRef}
              className="small"
              src={inView ? item.image : undefined}
              alt={item.name}
              onLoad={() => document.getElementById(imgId)?.classList.add('show')}
            />
          </Link>
        </div>
      </Placeholder>
    </div>
  );
}

export default function OrderItemsList({ items, namespace, idPrefix }) {
  const { t } = useTranslation();

  return (
    <ul className="cart-items">
      {items.map((item, index) => (
        <li key={item.product}>
          <ItemImage item={item} idPrefix={idPrefix} />
          <div className="item-content">
            <div className="item-name">
              <p>{item.name}</p>
              {item.size && (
                <p className="item-size">
                  {t(`${namespace}.size`)}: {item.size}
                </p>
              )}
              <p className="item-qty">
                {t(`${namespace}.quantity`)}: {item.qty}
              </p>
            </div>
            <div className="item-price">
              <p>{item.price && item.price.toFixed(2)}€</p>
            </div>
          </div>
          {items[index + 1] && (
            <div style={{ clear: 'both', paddingTop: '1rem' }}>
              <hr style={{ margin: 0 }} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
