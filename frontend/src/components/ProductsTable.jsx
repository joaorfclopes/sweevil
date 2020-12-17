import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import Paper from "@material-ui/core/Paper";
import DeleteIcon from "@material-ui/icons/Add";
import { deleteProduct, listProducts } from "../actions/productActions";
import { PRODUCT_DELETE_RESET } from "../constants/productConstants";

export default function ProductsTable() {
  const dispatch = useDispatch();

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
    dispatch(listProducts());
    if (successDelete) {
      dispatch({ type: PRODUCT_DELETE_RESET });
    }
  }, [dispatch, successDelete]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const deleteHandler = (product) => {
    if (window.confirm(`Delete ${product.name}?`)) {
      dispatch(deleteProduct(product._id));
      const counter =
        Math.min(
          rowsPerPage,
          (products && products.length) - page * rowsPerPage
        ) - 1;
      if (counter === 0 && page !== 0) {
        setPage(page - 1);
      }
    }
  };

  return (
    <div className="products-table">
      <Paper className="paper">
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
                <IconButton aria-label="create">
                  <DeleteIcon />
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
                          {product.price.toFixed(2)}€
                        </TableCell>
                        <TableCell align="center">{product.category}</TableCell>
                        <TableCell align="right">
                          <button className="secondary">Edit</button>
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
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </div>
  );
}
