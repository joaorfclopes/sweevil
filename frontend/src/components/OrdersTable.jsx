import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { deleteOrder, listOrders } from "../actions/orderActions";
import { ORDER_DELETE_RESET } from "../constants/orderConstants";
import { formatDateDay, formatName } from "../utils";
import LoadingBox from "./LoadingBox";
import MessageBox from "./MessageBox";

export default function OrdersTable({ props }) {
  const dispatch = useDispatch();
  const orderAdminList = useSelector((state) => state.orderAdminList);
  const { loading, orders, error } = orderAdminList;
  const orderDelete = useSelector((state) => state.orderDelete);
  const {
    loading: loadingDelete,
    success: successDelete,
    error: errorDelete,
  } = orderDelete;

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, (orders && orders.length) - page * rowsPerPage);

  useEffect(() => {
    dispatch(listOrders());
    if (successDelete) {
      dispatch({ type: ORDER_DELETE_RESET });
    }
  }, [dispatch, successDelete]);

  const deleteHandler = (order) => {
    Swal.fire({
      title: `Delete ${formatName(order.shippingAddress.fullName)}'s Order?`,
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteOrder(order._id));
        const counter =
          Math.min(
            rowsPerPage,
            (orders && orders.length) - page * rowsPerPage
          ) - 1;
        if (counter === 0 && page !== 0) {
          setPage(page - 1);
        }
        Swal.fire("Deleted!", "", "success");
      }
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="orders-table" style={{ marginBottom: "50px" }}>
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
                <b>Orders</b>
              </Typography>
            </Toolbar>
            <TableContainer>
              <Table className="table" aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>ID</b>
                    </TableCell>
                    <TableCell align="center">
                      <b>User</b>
                    </TableCell>
                    <TableCell align="center">
                      <b>Date</b>
                    </TableCell>
                    <TableCell align="center">
                      <b>Total</b>
                    </TableCell>
                    <TableCell align="center">
                      <b>Paid</b>
                    </TableCell>
                    <TableCell align="center">
                      <b>Delivered</b>
                    </TableCell>
                    <TableCell align="center">
                      <b>Status</b>
                    </TableCell>
                    <TableCell align="right">
                      <b>Actions</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders &&
                    (rowsPerPage > 0
                      ? orders.slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                      : orders
                    ).map((order) => (
                      <TableRow key={order._id}>
                        <TableCell component="th" scope="row">
                          {order._id}
                        </TableCell>
                        <TableCell align="center">
                          {formatName(order.shippingAddress.fullName)}
                        </TableCell>
                        <TableCell align="center">
                          {formatDateDay(order.createdAt)}
                        </TableCell>
                        <TableCell align="center">
                          {order.totalPrice && order.totalPrice.toFixed(2)}€
                        </TableCell>
                        <TableCell align="center">
                          {order.isPaid ? formatDateDay(order.paidAt) : "No"}
                        </TableCell>
                        <TableCell align="center">
                          {order.isDelivered
                            ? formatDateDay(order.deliveredAt)
                            : "No"}
                        </TableCell>
                        <TableCell align="center">{order.status}</TableCell>
                        <TableCell align="right">
                          <button
                            className="secondary"
                            onClick={() =>
                              props.history.push(`/cart/order/${order._id}`)
                            }
                          >
                            Details
                          </button>
                          <button
                            className="dangerous-outline"
                            onClick={() => deleteHandler(order)}
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
              count={orders ? orders.length : 0}
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
