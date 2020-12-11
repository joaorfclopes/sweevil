import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { detailsOrder } from "../actions/orderActions";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";

export default function OrderScreen(props) {
  const dispatch = useDispatch();
  const orderId = props.match.params.id;

  const orderDetails = useSelector((state) => state.orderDetails);
  const { loading, order, error } = orderDetails;

  useEffect(() => {
    dispatch(detailsOrder(orderId));
  }, [dispatch, orderId]);

  return (
    <section>
      {loading ? (
        <LoadingBox lineHeight="70vh" />
      ) : error ? (
        <MessageBox variant="error">{error}</MessageBox>
      ) : (
        <div className="order">
          <h1>Order {order._id}</h1>
        </div>
      )}
    </section>
  );
}
