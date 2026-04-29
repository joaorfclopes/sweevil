import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  deleteProduct,
  listProducts,
} from "../actions/productActions";
import {
  listProductCategories,
  createProductCategory,
  deleteProductCategory,
} from "../actions/productCategoryActions";
import {
  PRODUCT_DELETE_RESET,
} from "../constants/productConstants";
import {
  PRODUCT_CATEGORY_CREATE_RESET,
  PRODUCT_CATEGORY_DELETE_RESET,
} from "../constants/productCategoryConstants";
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";

export default function ProductsTable() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const productList = useSelector((state) => state.productList);
  const { loading, products, error } = productList;
  const productDelete = useSelector((state) => state.productDelete);
  const {
    loading: loadingDelete,
    success: successDelete,
    error: errorDelete,
  } = productDelete;

  const { categories = [] } = useSelector((state) => state.productCategoryList);
  const { loading: loadingCatCreate, success: successCatCreate, error: errorCatCreate } = useSelector((state) => state.productCategoryCreate);
  const { loading: loadingCatDelete, success: successCatDelete, error: errorCatDelete } = useSelector((state) => state.productCategoryDelete);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIsClothing, setNewCatIsClothing] = useState(false);

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, (products && products.length) - page * rowsPerPage);

  useEffect(() => {
    if (successDelete) {
      dispatch({ type: PRODUCT_DELETE_RESET });
    }
    dispatch(listProducts());
  }, [dispatch, successDelete]);

  useEffect(() => {
    if (successCatCreate) {
      dispatch({ type: PRODUCT_CATEGORY_CREATE_RESET });
      setNewCatName("");
      setNewCatIsClothing(false);
    }
    if (successCatDelete) {
      dispatch({ type: PRODUCT_CATEGORY_DELETE_RESET });
    }
    dispatch(listProductCategories());
  }, [dispatch, successCatCreate, successCatDelete]);

  const handleAddCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    dispatch(createProductCategory(name, newCatIsClothing));
  };

  const handleDeleteCategory = (cat) => {
    Swal.fire({
      title: `Delete "${cat.name}"?`,
      text: "Products using this category will keep their current value.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) dispatch(deleteProductCategory(cat._id));
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const deleteHandler = (product) => {
    Swal.fire({
      title: `Delete ${product.name}?`,
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteProduct(product._id));
        const counter =
          Math.min(
            rowsPerPage,
            (products && products.length) - page * rowsPerPage
          ) - 1;
        if (counter === 0 && page !== 0) {
          setPage(page - 1);
        }
        Swal.fire("Deleted!", "", "success");
      }
    });
  };

  const createHandler = () => {
    navigate("/admin/product/new/edit");
  };

  return (
    <div className="products-table" style={{ marginBottom: "50px" }}>
      <Paper className="paper" style={{ backgroundColor: "#F4F4F4" }}>
        {loadingDelete && <LoadingBox />}
        {errorDelete && <MessageBox variant="error">{errorDelete}</MessageBox>}
        {loading ? (
          <LoadingBox lineHeight="60vh" />
        ) : error ? (
          <MessageBox variant="error">{error}</MessageBox>
        ) : (
          <>
            <Toolbar>
              <Typography
                style={{ width: "100%" }}
                className="title"
                variant="h6"
                id="tableTitle"
                component="div"
              >
                <b>Products</b>
              </Typography>
              <Tooltip title="Create Product">
                <IconButton aria-label="create" onClick={createHandler}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Toolbar>
            <div style={{ padding: "0 16px 16px", borderBottom: "1px solid #e0e0e0" }}>
              <Typography variant="subtitle2" style={{ color: "#555", marginBottom: 8 }}>
                <b>Categories</b>
              </Typography>
              {(loadingCatCreate || loadingCatDelete) && <LoadingBox />}
              {errorCatCreate && <MessageBox variant="error">{errorCatCreate}</MessageBox>}
              {errorCatDelete && <MessageBox variant="error">{errorCatDelete}</MessageBox>}
              {[{ label: "Clothing", items: categories.filter((c) => c.isClothing) }, { label: "Other", items: categories.filter((c) => !c.isClothing) }].map(({ label, items }) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <Typography variant="caption" style={{ color: "#888" }}>{label}</Typography>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                    {items.map((cat) => (
                      <div key={cat._id} style={{ display: "flex", alignItems: "center", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 16, padding: "2px 4px 2px 10px", background: "#e0e0e0", fontSize: "0.8rem", fontFamily: "inherit" }}>
                        <span style={{ userSelect: "none" }}>{cat.name}</span>
                        <Tooltip title="Delete">
                          <IconButton size="small" sx={{ padding: "2px" }} onClick={() => handleDeleteCategory(cat)}>
                            <DeleteIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    ))}
                    {items.length === 0 && <span style={{ color: "#aaa", fontSize: "0.85rem" }}>None</span>}
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                <TextField
                  size="small"
                  placeholder="New category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={handleAddCategory} disabled={!newCatName.trim() || loadingCatCreate}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  style={{ width: 220 }}
                />
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={newCatIsClothing} onChange={(e) => setNewCatIsClothing(e.target.checked)} />
                  Size-based stock (clothing)
                </label>
              </div>
            </div>
            <TableContainer>
              <Table className="table" aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">
                      <b>Name</b>
                    </TableCell>
                    <TableCell align="center">
                      <b>Price</b>
                    </TableCell>
                    <TableCell align="center">
                      <b>Category</b>
                    </TableCell>
                    <TableCell align="center">
                      <b>Visible</b>
                    </TableCell>
                    <TableCell align="right">
                      <b>Actions</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products &&
                    (rowsPerPage > 0
                      ? products.slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                      : products
                    ).map((product) => (
                      <TableRow key={product._id}>
                        <TableCell align="center">{product.name}</TableCell>
                        <TableCell align="center">
                          {product.price && product.price.toFixed(2)}€
                        </TableCell>
                        <TableCell align="center">{product.category}</TableCell>
                        <TableCell align="center">
                          {product.visible ? "Yes" : "No"}
                        </TableCell>
                        <TableCell align="right">
                          <button
                            className="secondary"
                            onClick={() =>
                              navigate(`/admin/product/${product._id}/edit`)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="dangerous-outline"
                            onClick={() => deleteHandler(product)}
                          >
                            Delete
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 69 * emptyRows }}>
                      <TableCell colSpan={5} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={products ? products.length : 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </div>
  );
}
