import Axios from "axios";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createProduct,
  detailsProduct,
  listProducts,
  updateProduct,
} from "../actions/productActions";
import { listProductCategories } from "../actions/productCategoryActions";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/opacity.css";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { PRODUCT_CREATE_RESET, PRODUCT_DETAILS_RESET, PRODUCT_UPDATE_RESET } from "../constants/productConstants";

function ImageCard({ item, isCover }) {
  const src = item.type === "saved" ? item.url : item.preview;
  return (
    <div className={`product-image-card${isCover ? " product-image-card--cover" : ""}`}>
      <LazyLoadImage src={src} alt="" effect="opacity" width="100%" height="100%"
        style={{ opacity: item.type === "pending" ? 0.6 : 1 }} />
    </div>
  );
}

function SortableImageCard({ item, isCover, onDelete, onSetCover, isActive }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isActive ? 0 : 1 };
  const src = item.type === "saved" ? item.url : item.preview;
  const stop = (e) => e.stopPropagation();
  return (
    <div ref={setNodeRef} style={style} className={`product-image-card${isCover ? " product-image-card--cover" : ""}`}>
      <LazyLoadImage src={src} alt="" effect="opacity" width="100%" height="100%"
        style={{ opacity: item.type === "pending" ? 0.6 : 1 }} />
      <div className="product-image-card-overlay">
        <Tooltip title={isCover ? "Cover image" : "Set as cover"}>
          <IconButton size="small" className={`product-image-icon-btn${isCover ? " product-image-icon-btn--star" : ""}`}
            onPointerDown={stop} onClick={(e) => { stop(e); onSetCover(item); }}>
            {isCover ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" className="product-image-icon-btn product-image-icon-btn--danger"
            onPointerDown={stop} onClick={(e) => { stop(e); onDelete(item); }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Drag to reorder">
          <IconButton size="small" className="product-image-icon-btn product-image-drag-handle"
            {...attributes} {...listeners}>
            <DragIndicatorIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}

export default function ProductEditScreen(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: productId } = useParams();

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const productDetails = useSelector((state) => state.productDetails);
  const { loading, product, error } = productDetails;
  const productUpdate = useSelector((state) => state.productUpdate);
  const {
    loading: loadingUpdate,
    success: successUpdate,
    error: errorUpdate,
  } = productUpdate;
  const { categories: productCategories = [] } = useSelector((state) => state.productCategoryList);
  const productCreate = useSelector((state) => state.productCreate);
  const {
    loading: loadingCreate,
    success: successCreate,
    error: errorCreate,
  } = productCreate;

  const isNew = productId === "new";

  // Clear stale product from Redux on mount so we always fetch fresh data
  useEffect(() => {
    if (!isNew) dispatch({ type: PRODUCT_DETAILS_RESET });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  // Each item: { id, type: 'saved', url } | { id, type: 'pending', file, preview }
  const [imageItems, setImageItems] = useState([]);
  const [activeImageId, setActiveImageId] = useState(null);
  const [category, setCategory] = useState("");
  const [isClothing, setIsClothing] = useState(false);
  const [countInStock, setCountInStock] = useState("");
  const [countInStockXS, setCountInStockXS] = useState("");
  const [countInStockS, setCountInStockS] = useState("");
  const [countInStockM, setCountInStockM] = useState("");
  const [countInStockL, setCountInStockL] = useState("");
  const [countInStockXL, setCountInStockXL] = useState("");
  const [countInStockXXL, setCountInStockXXL] = useState("");
  const [description, setDescription] = useState("");
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [errorUpload, setErrorUpload] = useState("");
  const [taxPrice, setTaxPrice] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [visible, setVisible] = useState(false);

  const fileInputRef = useRef();
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    dispatch(listProductCategories());
  }, [dispatch]);

  useEffect(() => {
    if (successCreate) {
      dispatch({ type: PRODUCT_CREATE_RESET });
      dispatch(listProducts());
      navigate("/admin");
      return;
    }
    if (successUpdate) {
      dispatch({ type: PRODUCT_UPDATE_RESET });
      dispatch(listProducts());
      navigate("/admin");
      return;
    }
    if (isNew) return;
    if (!product || product._id !== productId) {
      dispatch(detailsProduct(productId));
    } else {
      setName(product.name);
      setPrice(product.price);
      setImageItems((product.images || []).map((url) => ({ id: url, type: "saved", url })));
      setCategory(product.category || "");
      const cat = productCategories.find((c) => c.name === product.category);
      if (cat?.isClothing) {
        setIsClothing(true);
        setCountInStock("");
      } else {
        setIsClothing(false);
        setCountInStockXS("");
        setCountInStockS("");
        setCountInStockM("");
        setCountInStockL("");
        setCountInStockXL("");
        setCountInStockXXL("");
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
  }, [dispatch, navigate, product, productId, successUpdate, successCreate, isNew, props]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (loadingUpload) return;
    setLoadingUpload(true);
    setErrorUpload("");
    const finalUrls = [];
    try {
      for (const item of imageItems) {
        if (item.type === "saved") {
          finalUrls.push(item.url);
        } else {
          const formData = new FormData();
          formData.append("image", item.file);
          const { data } = await Axios.post("/api/uploads/s3", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
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
    };
    if (isNew) {
      dispatch(createProduct(productData));
    } else {
      dispatch(updateProduct({ _id: productId, ...productData }));
    }
  };

  const handleFileInput = (files) => {
    const newItems = Array.from(files).map((file) => ({
      id: `pending-${Date.now()}-${Math.random()}`,
      type: "pending",
      file,
      preview: URL.createObjectURL(file),
    }));
    setImageItems((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileInput(e.dataTransfer.files);
  };

  const handleDeleteImage = (item) => {
    if (item.type === "saved") {
      Axios.delete("/api/uploads/s3", {
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
    if (cat?.isClothing) {
      setIsClothing(true);
      setCountInStock("");
    } else {
      setIsClothing(false);
      setCountInStockXS("");
      setCountInStockS("");
      setCountInStockM("");
      setCountInStockL("");
      setCountInStockXL("");
      setCountInStockXXL("");
    }
  };

  return (
    <motion.section
      className="product-edit"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      {!isNew && loading ? (
        <LoadingBox lineHeight="75vh" width="100px" />
      ) : !isNew && error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <>
          <h1>{isNew ? "New Product" : `Edit ${product?.name || ""}`}</h1>
          <form className="form" onSubmit={submitHandler}>
            {(loadingUpdate || loadingCreate) && <LoadingBox lineHeight="100vh" width="100px" />}
            {errorUpdate && (
              <MessageBox variant="error">{errorUpdate}</MessageBox>
            )}
            {errorCreate && (
              <MessageBox variant="error">{errorCreate}</MessageBox>
            )}
            <>
              <div>
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="price">Price (EUR)</label>
                <input
                  type="number"
                  step="0.01"
                  id="price"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPriceAndTax(e.target.value)}
                />
              </div>
              <div>
                <label>Images</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => handleFileInput(e.target.files)}
                />
                {loadingUpload && <LoadingBox />}
                {errorUpload && <MessageBox variant="danger">{errorUpload}</MessageBox>}
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
                      <span className="product-dropzone-placeholder" onClick={() => fileInputRef.current?.click()}>
                        Click or drop images here
                      </span>
                    ) : (
                      <SortableContext items={imageItems.map((i) => i.id)} strategy={rectSortingStrategy}>
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
                          <div className="product-images-add-tile" onClick={() => fileInputRef.current?.click()}>
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
                <label htmlFor="category">Category</label>
                <select value={category} onChange={(e) => setCategoryAndClothing(e)}>
                  {category === "" && <option value="">Select a category</option>}
                  <optgroup label="Clothing">
                    {productCategories.filter((c) => c.isClothing).map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Other">
                    {productCategories.filter((c) => !c.isClothing).map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              {isClothing ? (
                <div>
                  <label>Count In Stock</label>
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
                  <label htmlFor="countInStock">Count In Stock</label>
                  <input
                    type="number"
                    id="countInStock"
                    placeholder="Enter count in stock"
                    value={countInStock}
                    onChange={(e) => setCountInStock(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label htmlFor="description">Description</label>
                <textarea
                  type="text"
                  rows="3"
                  id="description"
                  placeholder="Enter description"
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
                <label htmlFor="visible">Visible</label>
              </div>
              <div>
                <label />
                <div className="no-flex" style={{ display: "flex", gap: "8px" }}>
                  <button className="secondary" type="button" onClick={() => navigate("/admin")} style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button className="primary" type="submit" style={{ flex: 1 }}>
                    {isNew ? "Create" : "Update"}
                  </button>
                </div>
              </div>
            </>
          </form>
        </>
      )}
    </motion.section>
  );
}
