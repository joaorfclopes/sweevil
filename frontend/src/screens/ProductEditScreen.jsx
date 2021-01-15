import Axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import {
  detailsProduct,
  listProducts,
  updateProduct,
} from "../actions/productActions";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { PRODUCT_UPDATE_RESET } from "../constants/productConstants";

export default function ProductEditScreen(props) {
  const dispatch = useDispatch();

  const productId = props.match.params.id;

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

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState("");
  const [isClothing, setIsClothing] = useState("");
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

  const fileInput = useRef();

  const artworkOptions = ["Prints", "Pinturas", "Tapetes"];

  const clothingOptions = ["T-Shirts", "Hoodies"];

  const accessoriesOptions = [
    "Carteiras",
    "Diskettes",
    "Jóias",
    "Bags",
    "Lenços",
  ];

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: PRODUCT_UPDATE_RESET });
      dispatch(listProducts());
      props.history.push("/admin");
    }
    if (!product || product._id !== productId || successUpdate) {
      dispatch({ type: PRODUCT_UPDATE_RESET });
      dispatch(detailsProduct(productId));
    } else {
      setName(product.name);
      setPrice(product.price);
      setImages(product.images);
      setCategory(product.category || "Prints");
      if (product.category === "T-Shirts" || product.category === "Hoodies") {
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
    }
  }, [dispatch, product, productId, successUpdate, props]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (!loadingUpload) {
      dispatch(
        updateProduct({
          _id: productId,
          name,
          price,
          images,
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
        })
      );
    }
  };

  const uploadFileHandler = async (e) => {
    setLoadingUpload(true);
    const files = fileInput.current.files;
    const imagesArray = [...images];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = e.target.files[i];
        const bodyFormData = new FormData();
        bodyFormData.append("image", file);
        const { data } = await Axios.post("/api/uploads/s3", bodyFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${userInfo.token}`,
          },
        });
        imagesArray.push(data);
      }
      setImages(imagesArray);
      setLoadingUpload(false);
    } catch (error) {
      setErrorUpload(error.message);
      setLoadingUpload(false);
    }
  };

  const clearImages = () => {
    Swal.fire({
      title: `Clear Product Images?`,
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        setImages([]);
        Swal.fire("Cleared!", "", "success");
      }
    });
  };

  const setPriceAndTax = (val) => {
    setPrice(val);
    setTaxPrice((0.23 * val).toFixed(2));
    setFinalPrice((parseFloat(val) + parseFloat(0.23 * val)).toFixed(2));
  };

  const setCategoryAndClothing = (e) => {
    setCategory(e.target.value);
    if (e.target.value === "T-Shirts" || e.target.value === "Hoodies") {
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
      {loading ? (
        <LoadingBox lineHeight="70vh" width="100px" />
      ) : error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <>
          <h1>Edit {product && product.name ? product.name : "New Product"}</h1>
          <form className="form" onSubmit={submitHandler}>
            {loadingUpdate && <LoadingBox lineHeight="70vh" width="100px" />}
            {errorUpdate && (
              <MessageBox variant="error">{errorUpdate}</MessageBox>
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
                <label htmlFor="imageFile">Image File</label>
                <input
                  ref={fileInput}
                  type="file"
                  id="imageFile"
                  label="Choose image"
                  onChange={uploadFileHandler}
                  multiple
                />
                <button
                  type="button"
                  className="secondary clear-images-btn"
                  onClick={clearImages}
                >
                  Clear Images
                </button>
                {loadingUpload && <LoadingBox />}
                {errorUpload && !images && (
                  <MessageBox variant="danger">{errorUpload}</MessageBox>
                )}
                <div className="preview">
                  {images &&
                    images.map((image) => (
                      <img key={image} src={image} alt="imagePreview" />
                    ))}
                </div>
              </div>
              <div>
                <label htmlFor="category">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategoryAndClothing(e)}
                >
                  <optgroup label="Artwork">
                    {artworkOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Clothing">
                    {clothingOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Accessories">
                    {accessoriesOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              {category === "T-Shirts" || category === "Hoodies" ? (
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
              <div>
                <label />
                <button className="primary" type="submit">
                  Update
                </button>
              </div>
            </>
          </form>
        </>
      )}
    </motion.section>
  );
}
