import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createProduct,
  deleteProduct,
  detailsProduct,
  listProducts,
  updateProduct,
} from '../actions/productActions';
import { listProductCategories } from '../actions/productCategoryActions';
import LoadingOverlay from '../components/LoadingOverlay';
import MessageBox from '../components/MessageBox';
import {
  PRODUCT_CREATE_RESET,
  PRODUCT_DELETE_RESET,
  PRODUCT_DETAILS_RESET,
  PRODUCT_UPDATE_RESET,
} from '../constants/productConstants';
import Swal from '../utils/swal';

function ImageCard({ item, isCover }) {
  return (
    <div className={`product-image-card${isCover ? ' product-image-card--cover' : ''}`}>
      {item.type === 'saved' ? (
        <img src={item.url} alt="" width="100%" height="100%" style={{ display: 'block' }} />
      ) : (
        <img
          src={item.preview}
          alt=""
          width="100%"
          height="100%"
          style={{ opacity: 0.6, display: 'block' }}
        />
      )}
    </div>
  );
}

function SortableImageCard({ item, isCover, onDelete, onSetCover, isActive }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isActive ? 0 : 1,
  };
  const stop = (e) => e.stopPropagation();
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`product-image-card${isCover ? ' product-image-card--cover' : ''}`}
    >
      {item.type === 'saved' ? (
        <img src={item.url} alt="" width="100%" height="100%" style={{ display: 'block' }} />
      ) : (
        <img
          src={item.preview}
          alt=""
          width="100%"
          height="100%"
          style={{ opacity: 0.6, display: 'block' }}
        />
      )}
      <div className="product-image-card-overlay">
        <Tooltip title={isCover ? t('productEdit.coverImage') : t('productEdit.setAsCover')}>
          <IconButton
            size="small"
            className={`product-image-icon-btn${isCover ? ' product-image-icon-btn--star' : ''}`}
            onPointerDown={stop}
            onClick={(e) => {
              stop(e);
              onSetCover(item);
            }}
          >
            {isCover ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title={t('productEdit.delete')}>
          <IconButton
            size="small"
            className="product-image-icon-btn product-image-icon-btn--danger"
            onPointerDown={stop}
            onClick={(e) => {
              stop(e);
              onDelete(item);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('productEdit.dragToReorder')}>
          <IconButton
            size="small"
            className="product-image-icon-btn product-image-drag-handle"
            {...attributes}
            {...listeners}
          >
            <DragIndicatorIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}

export default function ProductEditScreen(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: productId } = useParams();

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const productDetails = useSelector((state) => state.productDetails);
  const { loading, product, error } = productDetails;
  const productUpdate = useSelector((state) => state.productUpdate);
  const { loading: loadingUpdate, success: successUpdate, error: errorUpdate } = productUpdate;
  const { categories: productCategories = [] } = useSelector((state) => state.productCategoryList);
  const productCreate = useSelector((state) => state.productCreate);
  const { loading: loadingCreate, success: successCreate, error: errorCreate } = productCreate;
  const productDelete = useSelector((state) => state.productDelete);
  const { loading: loadingDelete, success: successDelete } = productDelete;

  const isNew = productId === 'new';

  // Clear stale product from Redux on mount so we always fetch fresh data
  useEffect(() => {
    if (!isNew) dispatch({ type: PRODUCT_DETAILS_RESET });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (product?.slug && /^[a-f0-9]{24}$/.test(productId)) {
      navigate(`/admin/product/${product.slug}/edit`, { replace: true });
    }
  }, [product?.slug, productId, navigate]);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  // Each item: { id, type: 'saved', url } | { id, type: 'pending', file, preview }
  const [imageItems, setImageItems] = useState([]);
  const [activeImageId, setActiveImageId] = useState(null);
  const [category, setCategory] = useState('');
  const [isClothing, setIsClothing] = useState(false);
  const [countInStock, setCountInStock] = useState('');
  const [countInStockXS, setCountInStockXS] = useState('');
  const [countInStockS, setCountInStockS] = useState('');
  const [countInStockM, setCountInStockM] = useState('');
  const [countInStockL, setCountInStockL] = useState('');
  const [countInStockXL, setCountInStockXL] = useState('');
  const [countInStockXXL, setCountInStockXXL] = useState('');
  const [description, setDescription] = useState('');
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [errorUpload, setErrorUpload] = useState('');
  const [taxPrice, setTaxPrice] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [visible, setVisible] = useState(false);

  const fileInputRef = useRef();
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    dispatch(listProductCategories());
  }, [dispatch]);

  useEffect(() => {
    if (successDelete) {
      dispatch({ type: PRODUCT_DELETE_RESET });
      navigate('/admin');
      return;
    }
  }, [dispatch, navigate, successDelete]);

  useEffect(() => {
    if (successCreate) {
      dispatch({ type: PRODUCT_CREATE_RESET });
      dispatch(listProducts());
      navigate('/admin');
      return;
    }
    if (successUpdate) {
      dispatch({ type: PRODUCT_UPDATE_RESET });
      dispatch(listProducts());
      navigate('/admin');
      return;
    }
    if (isNew) return;
    if (!product || product.slug !== productId) {
      dispatch(detailsProduct(productId));
    } else {
      setName(product.name);
      setPrice(product.price);
      setOriginalPrice(product.originalPrice || '');
      setImageItems((product.images || []).map((url) => ({ id: url, type: 'saved', url })));
      setCategory(product.category || '');
      const cat = productCategories.find((c) => c.name === product.category);
      if (cat?.isClothing) {
        setIsClothing(true);
        setCountInStock('');
      } else {
        setIsClothing(false);
        setCountInStockXS('');
        setCountInStockS('');
        setCountInStockM('');
        setCountInStockL('');
        setCountInStockXL('');
        setCountInStockXXL('');
      }
      if (product.countInStock) {
        setCountInStock(product.countInStock.stock);
        setCountInStockXS(product.countInStock.xs);
        setCountInStockS(product.countInStock.s);
        setCountInStockM(product.countInStock.m);
        setCountInStockL(product.countInStock.l);
        setCountInStockXL(product.countInStock.xl);
        setCountInStockXXL(product.countInStock.xxl);
      }
      setDescription(product.description);
      setTaxPrice(product.taxPrice);
      setFinalPrice(product.finalPrice);
      setVisible(product.visible);
    }
  }, [dispatch, navigate, product, productId, successUpdate, successCreate, isNew]);

  const deleteHandler = () => {
    Swal.fire({
      title: t('productEdit.deleteTitle', { name: product?.name }),
      showCancelButton: true,
      confirmButtonText: t('productEdit.deleteBtn'),
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) dispatch(deleteProduct(productId));
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (originalPrice !== '' && parseFloat(originalPrice) <= parseFloat(price)) {
      setErrorUpload(t('productEdit.originalPriceMustBeGreater'));
      return;
    }
    if (loadingUpload) return;
    setLoadingUpload(true);
    setErrorUpload('');
    const finalUrls = [];
    try {
      for (const item of imageItems) {
        if (item.type === 'saved') {
          finalUrls.push(item.url);
        } else {
          const formData = new FormData();
          formData.append('image', item.file);
          const { data } = await Axios.post('/api/uploads/s3', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${userInfo.token}`,
            },
          });
          finalUrls.push(data.location);
        }
      }
    } catch (err) {
      setErrorUpload(err.response?.data?.message || err.message);
      setLoadingUpload(false);
      return;
    }
    setLoadingUpload(false);
    const productData = {
      name,
      price,
      images: finalUrls,
      category,
      isClothing,
      countInStock: {
        stock: countInStock,
        xs: countInStockXS,
        s: countInStockS,
        m: countInStockM,
        l: countInStockL,
        xl: countInStockXL,
        xxl: countInStockXXL,
      },
      description,
      taxPrice,
      finalPrice,
      visible,
      originalPrice: originalPrice !== '' ? parseFloat(originalPrice) : null,
    };
    if (isNew) {
      dispatch(createProduct(productData));
    } else {
      dispatch(updateProduct({ slug: productId, ...productData }));
    }
  };

  const handleFileInput = (files) => {
    const newItems = Array.from(files).map((file) => ({
      id: `pending-${Date.now()}-${Math.random()}`,
      type: 'pending',
      file,
      preview: URL.createObjectURL(file),
    }));
    setImageItems((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileInput(e.dataTransfer.files);
  };

  const handleDeleteImage = (item) => {
    if (item.type === 'saved') {
      Axios.delete('/api/uploads/s3', {
        data: { url: item.url },
        headers: { Authorization: `Bearer ${userInfo.token}` },
      }).catch(() => {});
    }
    setImageItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleImageDragEnd = useCallback(({ active, over }) => {
    setActiveImageId(null);
    if (!over || active.id === over.id) return;
    setImageItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const handleSetCover = useCallback((item) => {
    setImageItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx === 0) return prev;
      return arrayMove(prev, idx, 0);
    });
  }, []);

  const setPriceAndTax = (val) => {
    setPrice(val);
    setTaxPrice((0.23 * val).toFixed(2));
    setFinalPrice((parseFloat(val) + parseFloat(0.23 * val)).toFixed(2));
  };

  const setCategoryAndClothing = (e) => {
    const selected = e.target.value;
    setCategory(selected);
    const cat = productCategories.find((c) => c.name === selected);
    setIsClothing(!!cat?.isClothing);
    setCountInStock('');
    setCountInStockXS('');
    setCountInStockS('');
    setCountInStockM('');
    setCountInStockL('');
    setCountInStockXL('');
    setCountInStockXXL('');
  };

  return (
    <section className="product-edit">
      {!isNew && error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <LoadingOverlay
          loading={
            (!isNew && loading) || loadingUpdate || loadingCreate || loadingUpload || loadingDelete
          }
          minHeight="75vh"
        >
          <h1>
            {isNew
              ? t('productEdit.newProduct')
              : t('productEdit.editProduct', { name: product?.name || '' })}
          </h1>
          <form className="form" onSubmit={submitHandler}>
            {errorUpdate && <MessageBox variant="error">{errorUpdate}</MessageBox>}
            {errorCreate && <MessageBox variant="error">{errorCreate}</MessageBox>}
            <>
              <div>
                <label htmlFor="name">{t('productEdit.name')}</label>
                <input
                  type="text"
                  id="name"
                  placeholder={t('productEdit.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="price">{t('productEdit.price')}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  id="price"
                  placeholder={t('productEdit.pricePlaceholder')}
                  value={price}
                  onChange={(e) => setPriceAndTax(e.target.value)}
                />
              </div>
              <div>
                {errorUpload && <MessageBox variant="error">{errorUpload}</MessageBox>}
                <label htmlFor="originalPrice">{t('productEdit.originalPrice')}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="originalPrice"
                  placeholder={t('productEdit.originalPricePlaceholder')}
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
              </div>
              <div>
                <label>{t('productEdit.images')}</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileInput(e.target.files)}
                />
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={({ active }) => setActiveImageId(active.id)}
                  onDragEnd={handleImageDragEnd}
                  onDragCancel={() => setActiveImageId(null)}
                >
                  <div
                    className="product-dropzone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    {imageItems.length === 0 ? (
                      <span
                        className="product-dropzone-placeholder"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {t('productEdit.dropzonePlaceholder')}
                      </span>
                    ) : (
                      <SortableContext
                        items={imageItems.map((i) => i.id)}
                        strategy={rectSortingStrategy}
                      >
                        <div className="product-images-row">
                          {imageItems.map((item, idx) => (
                            <SortableImageCard
                              key={item.id}
                              item={item}
                              isCover={idx === 0}
                              onDelete={handleDeleteImage}
                              onSetCover={handleSetCover}
                              isActive={item.id === activeImageId}
                            />
                          ))}
                          <div
                            className="product-images-add-tile"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <span>+</span>
                          </div>
                        </div>
                      </SortableContext>
                    )}
                  </div>
                  <DragOverlay>
                    {activeImageId ? (
                      <ImageCard
                        item={imageItems.find((i) => i.id === activeImageId)}
                        isCover={imageItems.findIndex((i) => i.id === activeImageId) === 0}
                      />
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
              <div>
                <label htmlFor="category">{t('productEdit.category')}</label>
                <select value={category} onChange={(e) => setCategoryAndClothing(e)}>
                  {category === '' && <option value="">{t('productEdit.selectCategory')}</option>}
                  <optgroup label={t('productEdit.categoryClothing')}>
                    {productCategories
                      .filter((c) => c.isClothing)
                      .map((c) => (
                        <option key={c._id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label={t('productEdit.categoryOther')}>
                    {productCategories
                      .filter((c) => !c.isClothing)
                      .map((c) => (
                        <option key={c._id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>
              {isClothing ? (
                <div>
                  <label>{t('productEdit.stock')}</label>
                  <input
                    type="number"
                    id="countInStockXS"
                    placeholder="XS"
                    value={countInStockXS}
                    onChange={(e) => setCountInStockXS(e.target.value)}
                  />
                  <br />
                  <input
                    type="number"
                    id="countInStockS"
                    placeholder="S"
                    value={countInStockS}
                    onChange={(e) => setCountInStockS(e.target.value)}
                  />
                  <br />
                  <input
                    type="number"
                    id="countInStockM"
                    placeholder="M"
                    value={countInStockM}
                    onChange={(e) => setCountInStockM(e.target.value)}
                  />
                  <br />
                  <input
                    type="number"
                    id="countInStockL"
                    placeholder="L"
                    value={countInStockL}
                    onChange={(e) => setCountInStockL(e.target.value)}
                  />
                  <br />
                  <input
                    type="number"
                    id="countInStockXL"
                    placeholder="XL"
                    value={countInStockXL}
                    onChange={(e) => setCountInStockXL(e.target.value)}
                  />
                  <br />
                  <input
                    type="number"
                    id="countInStockXXL"
                    placeholder="XXL"
                    value={countInStockXXL}
                    onChange={(e) => setCountInStockXXL(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="countInStock">{t('productEdit.stock')}</label>
                  <input
                    type="number"
                    id="countInStock"
                    placeholder={t('productEdit.stock')}
                    value={countInStock}
                    onChange={(e) => setCountInStock(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label htmlFor="description">{t('productEdit.description')}</label>
                <textarea
                  type="text"
                  rows="3"
                  id="description"
                  placeholder={t('productEdit.descriptionPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="no-flex">
                <input
                  type="checkbox"
                  id="visible"
                  name="visible"
                  checked={visible}
                  onChange={() => setVisible(!visible)}
                />
                <label htmlFor="visible">{t('productEdit.visible')}</label>
              </div>
              <div>
                <label />
                <div className="no-flex" style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="secondary"
                    type="button"
                    onClick={() => navigate('/admin')}
                    style={{ flex: 1 }}
                  >
                    {t('admin.cancel')}
                  </button>
                  <button className="primary" type="submit" style={{ flex: 1 }}>
                    {t('productEdit.save')}
                  </button>
                  {!isNew && (
                    <button
                      className="dangerous"
                      type="button"
                      onClick={deleteHandler}
                      style={{ flex: 1 }}
                    >
                      {t('productEdit.delete')}
                    </button>
                  )}
                </div>
              </div>
            </>
          </form>
        </LoadingOverlay>
      )}
    </section>
  );
}
