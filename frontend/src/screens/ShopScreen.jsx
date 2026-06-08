import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../actions/productActions';
import { listProductCategories } from '../actions/productCategoryActions';
import MessageBox from '../components/MessageBox';
import Placeholder from '../components/Placeholder';
import Product from '../components/Product';
import { scrollTop } from '../utils.js';
import { displayName } from '../utils/i18nDisplay';

function ProductSkeleton() {
  return (
    <div className="product">
      <div className="product-body">
        <div className="product-image-skeleton">
          <Placeholder aspectRatio="1/1" />
        </div>
        <div style={{ marginTop: '7px' }}>
          <Placeholder height="59px" text />
        </div>
      </div>
    </div>
  );
}

function FilterSkeleton() {
  return (
    <div className="filters">
      {[60, 80, 50, 70].map((w, i) => (
        <div key={i} className="filter" style={{ width: `${w}px`, pointerEvents: 'none' }}>
          <Placeholder text height="1em" />
        </div>
      ))}
    </div>
  );
}

export default function ShopScreen(props) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const productList = useSelector((state) => state.productList);
  const { loading, products, error } = productList;
  const { categories = [], loading: categoriesLoading } = useSelector(
    (state) => state.productCategoryList
  );

  const [selectedCategory, setSelectedCategory] = useState('*');

  useEffect(() => {
    scrollTop();
    dispatch(listProducts());
    dispatch(listProductCategories());
  }, [dispatch]);

  const visibleProducts = (products || []).filter(
    (p) => p.images[0] && p.name && p.price && p.visible !== false
  );

  const categoriesInUse = categories.filter((cat) =>
    visibleProducts.some((p) => p.category === cat.name)
  );

  const filtered =
    selectedCategory === '*'
      ? visibleProducts
      : visibleProducts.filter((p) => p.category === selectedCategory);

  return (
    <section className="shop">
      <div className="free-shipping-banner">{t('shop.freeShipping')}</div>
      <div className="shop-container">
        {categoriesLoading ? (
          <FilterSkeleton />
        ) : categoriesInUse.length > 0 ? (
          <div className="filters">
            <div
              className={`filter${selectedCategory === '*' ? ' active' : ''}`}
              onClick={() => setSelectedCategory('*')}
            >
              {t('shop.filterAll')}
            </div>
            {categoriesInUse.map((cat) => (
              <div
                key={cat._id}
                className={`filter${selectedCategory === cat.name ? ' active' : ''}`}
                onClick={() => setSelectedCategory(cat.name)}
              >
                {displayName(cat, i18n.language)}
              </div>
            ))}
          </div>
        ) : null}
        <div className="row center">
          {loading && !products?.length ? (
            Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
          ) : error ? (
            <MessageBox variant="error">{error}</MessageBox>
          ) : (
            filtered.map((product) => <Product key={product._id} product={product} />)
          )}
        </div>
      </div>
    </section>
  );
}
