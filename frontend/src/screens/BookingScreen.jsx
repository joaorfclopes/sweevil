import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { LocalizationProvider, DateCalendar, PickersDay } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Axios from "axios";
import dayjs from "dayjs";
import MessageBox from "../components/MessageBox";
import LoadingBox from "../components/LoadingBox";

function StripeCheckoutForm({ price, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [stripeError, setStripeError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setStripeError("");
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });
    if (error) {
      setStripeError(error.message);
      setPaying(false);
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {stripeError && (
        <MessageBox variant="error">{stripeError}</MessageBox>
      )}
      <button
        type="submit"
        disabled={!stripe || paying}
        className="primary"
        style={{ marginTop: "1rem", width: "100%" }}
      >
        {paying ? "Processing..." : `Pay €${price?.toFixed(2)}`}
      </button>
    </form>
  );
}

function AvailableDay(props) {
  const { availableDates, day, outsideCurrentMonth, ...other } = props;
  const dateStr = dayjs(day).format("YYYY-MM-DD");
  const isAvailable = availableDates.includes(dateStr);

  return (
    <PickersDay
      {...other}
      outsideCurrentMonth={outsideCurrentMonth}
      day={day}
      sx={
        isAvailable && !outsideCurrentMonth
          ? {
              backgroundColor: "rgba(0,0,0,0.06)",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.12)" },
              "&.Mui-selected": { backgroundColor: "#1a1a1a" },
            }
          : {}
      }
    />
  );

}

const STEPS = { CALENDAR: 0, SLOTS: 1, FORM: 2, PAYMENT: 3, CONFIRMED: 4 };

export default function BookingScreen(props) {
  const [searchParams] = useSearchParams();

  const [availability, setAvailability] = useState([]);
  const [loadingAvail, setLoadingAvail] = useState(true);
  const [availError, setAvailError] = useState("");

  const [step, setStep] = useState(STEPS.CALENDAR);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "", phone: "", notes: "" });

  const [booking, setBooking] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handledRedirect = useRef(false);

  useEffect(() => {
    Axios.get("/api/availability")
      .then(({ data }) => {
        setAvailability(data);
        setLoadingAvail(false);
      })
      .catch(() => {
        setAvailError("Failed to load availability.");
        setLoadingAvail(false);
      });
  }, []);

  const availMap = {};
  availability.forEach((a) => {
    const key = dayjs(a.date).format("YYYY-MM-DD");
    availMap[key] = a;
  });

  const availableDates = Object.keys(availMap).filter((key) =>
    availMap[key].slots.some((s) => s.isAvailable && !s.isBooked)
  );

  const shouldDisableDate = (date) => {
    const key = dayjs(date).format("YYYY-MM-DD");
    return (
      !availableDates.includes(key) ||
      dayjs(date).isBefore(dayjs(), "day")
    );
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep(STEPS.SLOTS);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(STEPS.FORM);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const dateKey = dayjs(selectedDate).format("YYYY-MM-DD");
      const { data: createdBooking } = await Axios.post("/api/bookings", {
        date: dateKey,
        slot: selectedSlot,
        guestInfo,
      });
      setBooking(createdBooking);

      const { data: piData } = await Axios.post(
        `/api/bookings/${createdBooking._id}/create-payment-intent`
      );
      setClientSecret(piData.clientSecret);

      const { data: publishableKey } = await Axios.get("/api/config/stripe");
      setStripePromise(loadStripe(publishableKey));

      setStep(STEPS.PAYMENT);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      await Axios.put(`/api/bookings/${booking._id}/pay`, { paymentIntentId });
      setStep(STEPS.CONFIRMED);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Payment verification failed.");
    }
  };

  useEffect(() => {
    if (handledRedirect.current || !booking) return;
    const paymentIntentId = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");
    if (paymentIntentId && redirectStatus === "succeeded") {
      handledRedirect.current = true;
      handlePaymentSuccess(paymentIntentId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, booking]);

  const dateKey = selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : null;
  const dayAvailability = dateKey ? availMap[dateKey] : null;
  const availableSlots = dayAvailability
    ? dayAvailability.slots.filter((s) => s.isAvailable && !s.isBooked)
    : [];

  return (
    <motion.section
      className="booking-screen"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      <div className="booking-container">
        {step === STEPS.CONFIRMED ? (
          <div className="booking-confirmed">
            <h1 className="custom-font">Booking Confirmed!</h1>
            <p>
              Your booking for <strong>{selectedSlot}</strong> on{" "}
              <strong>{dayjs(selectedDate).format("DD/MM/YYYY")}</strong> is confirmed.
              Check your email for details.
            </p>
          </div>
        ) : (
          <>
            <h1 className="custom-font">Book a Session</h1>

            {step > STEPS.CALENDAR && (
              <div className="booking-breadcrumb">
                <button
                  className="booking-back"
                  onClick={() => setStep(step - 1)}
                >
                  ← Back
                </button>
                <span>
                  {dayjs(selectedDate).format("DD/MM/YYYY")}
                  {selectedSlot && ` — ${selectedSlot}`}
                </span>
              </div>
            )}

            {step === STEPS.CALENDAR && (
              <div className="booking-step">
                <h2>Select a date</h2>
                {loadingAvail ? (
                  <LoadingBox />
                ) : availError ? (
                  <MessageBox variant="error">{availError}</MessageBox>
                ) : (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar
                      disablePast
                      shouldDisableDate={shouldDisableDate}
                      onChange={handleDateSelect}
                      slots={{ day: AvailableDay }}
                      slotProps={{ day: { availableDates } }}
                    />
                  </LocalizationProvider>
                )}
              </div>
            )}

            {step === STEPS.SLOTS && (
              <div className="booking-step">
                <h2>Select a time slot</h2>
                {availableSlots.length === 0 ? (
                  <MessageBox variant="error">No slots available for this date.</MessageBox>
                ) : (
                  <div className="booking-slots">
                    {availableSlots.map((s) => (
                      <button
                        key={s.time}
                        className="booking-slot-btn primary"
                        onClick={() => handleSlotSelect(s.time)}
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                )}
                {dayAvailability && (
                  <p className="booking-price">
                    Price: <strong>{dayAvailability.price.toFixed(2)}€</strong>
                  </p>
                )}
              </div>
            )}

            {step === STEPS.FORM && (
              <div className="booking-step">
                <h2>Your details</h2>
                {submitError && <MessageBox variant="error">{submitError}</MessageBox>}
                <form onSubmit={handleFormSubmit} className="booking-form">
                  <div>
                    <label>Name *</label>
                    <input
                      required
                      value={guestInfo.name}
                      onChange={(e) =>
                        setGuestInfo({ ...guestInfo, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label>Email *</label>
                    <input
                      type="email"
                      required
                      value={guestInfo.email}
                      onChange={(e) =>
                        setGuestInfo({ ...guestInfo, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label>Phone *</label>
                    <input
                      type="tel"
                      required
                      value={guestInfo.phone}
                      onChange={(e) =>
                        setGuestInfo({ ...guestInfo, phone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label>Notes</label>
                    <textarea
                      rows={3}
                      value={guestInfo.notes}
                      onChange={(e) =>
                        setGuestInfo({ ...guestInfo, notes: e.target.value })
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    className="primary"
                    disabled={submitting}
                  >
                    {submitting ? "Please wait..." : `Continue to Payment — ${dayAvailability?.price.toFixed(2)}€`}
                  </button>
                </form>
              </div>
            )}

            {step === STEPS.PAYMENT && (
              <div className="booking-step">
                <h2>Payment</h2>
                {submitError && <MessageBox variant="error">{submitError}</MessageBox>}
                {!clientSecret || !stripePromise ? (
                  <LoadingBox />
                ) : (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripeCheckoutForm
                      price={dayAvailability?.price}
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </motion.section>
  );
}
