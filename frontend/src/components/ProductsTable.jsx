import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import AddIcon from "@material-ui/icons/Add";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  createProduct,
  deleteProduct,
  listProducts,
} from "../actions/productActions";
import {
  PRODUCT_CREATE_RESET,
  PRODUCT_DELETE_RESET,
} from "../constants/productConstants";
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";

export default function ProductsTable({ props }) {
  const dispatch = useDispatch();

  const productList = useSelector((state) => state.productList);
  const { loading, products, error } = productList;
  const productDelete = useSelector((state) => state.productDelete);
  const {
    loading: loadingDelete,
    success: successDelete,
    error: errorDelete,
  } = productDelete;
  const productCreate = useSelector((state) => state.productCreate);
  const {
    loading: loadingCreate,
    success: successCreate,
    product: createdProduct,
    error: errorCreate,
  } = productCreate;

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, (products && products.length) - page * rowsPerPage);

  useEffect(() => {
    dispatch(listProducts());
    if (successDelete) {
      dispatch({ type: PRODUCT_DELETE_RESET });
      dispatch(listProducts());
    }
    if (successCreate) {
      dispatch({ type: PRODUCT_CREATE_RESET });
      props.history.push(`/admin/product/${createdProduct._id}/edit`);
      dispatch(listProducts());
    }
  }, [dispatch, successDelete, successCreate, props, createdProduct]);

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
    dispatch(createProduct());
  };

  return (
    <div className="products-table" style={{ marginBottom: "50px" }}>
      <Paper className="paper" style={{ backgroundColor: "#F4F4F4" }}>
        {loadingDelete && <LoadingBox />}
        {errorDelete && <MessageBox variant="error">{errorDelete}</MessageBox>}
        {loadingCreate && <LoadingBox />}
        {errorCreate && (
          <MessageBox variant="error" dismissible>
            {errorCreate}
          </MessageBox>
        )}
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
                    <TableCell>
                      <b>ID</b>
                    </TableCell>
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
                        <TableCell component="th" scope="row">
                          {product._id}
                        </TableCell>
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
                              props.history.push(
                                `/admin/product/${product._id}/edit`
                              )
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
                      <TableCell colSpan={6} />
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
