import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  deleteProduct,
  listProducts,
} from "../actions/productActions";
import {
  PRODUCT_DELETE_RESET,
} from "../constants/productConstants";
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
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, (products && products.length) - page * rowsPerPage);

  useEffect(() => {
    if (successDelete) {
      dispatch({ type: PRODUCT_DELETE_RESET });
    }
    dispatch(listProducts());
  }, [dispatch, successDelete]);

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
