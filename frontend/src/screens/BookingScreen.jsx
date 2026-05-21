import { zodResolver } from '@hookform/resolvers/zod';
import { DateCalendar, LocalizationProvider, PickersDay } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import * as Sentry from '@sentry/react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import LoadingOverlay from '../components/LoadingOverlay';
import MessageBox from '../components/MessageBox';
import useScrollLock from '../hooks/useScrollLock';
import { convertIfHeic } from '../utils/convertHeic';

const bookingFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name is required')
    .max(100)
    .regex(/^[\p{L}\s\-'.]+$/u, 'Only letters, spaces, hyphens and apostrophes'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  notes: z
    .string()
    .max(1000, 'Notes must be under 1000 characters')
    .regex(/^[\p{L}\p{N}\s\-'.,!?()\n]*$/u, 'Invalid characters in notes')
    .optional()
    .or(z.literal('')),
});

function StripeCheckoutForm({ price, onSuccess, onProcessing }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [stripeError, setStripeError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setStripeError('');
    Sentry.metrics.count('booking.payment_initiated', 1);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });
    if (error) {
      console.warn(`[booking] Stripe error — ${error.message}`);
      setStripeError(error.message);
      setPaying(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else if (paymentIntent?.status === 'processing') {
      onProcessing(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {stripeError && <MessageBox variant="error">{stripeError}</MessageBox>}
      <button
        type="submit"
        disabled={!stripe || paying}
        className="primary"
        style={{ marginTop: '1rem', width: '100%' }}
      >
        {paying ? 'Processing...' : `Pay €${price?.toFixed(2)}`}
      </button>
    </form>
  );
}

function AvailableDay(props) {
  const { availableDates, day, outsideCurrentMonth, ...other } = props;
  const dateStr = dayjs(day).format('YYYY-MM-DD');
  const isAvailable = availableDates.includes(dateStr);

  return (
    <PickersDay
      {...other}
      outsideCurrentMonth={outsideCurrentMonth}
      day={day}
      sx={
        isAvailable && !outsideCurrentMonth
          ? {
              backgroundColor: 'rgba(0,0,0,0.06)',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.12)' },
              '&.Mui-selected': { backgroundColor: '#1a1a1a' },
            }
          : {}
      }
    />
  );
}

const STEPS = { CALENDAR: 0, SLOTS: 1, FORM: 2, PAYMENT: 3, CONFIRMED: 4 };

const EXCLUSIVITY_TEXT =
  'Every design is an original, custom-drawn piece created with authenticity. To ensure exclusivity, I do not repeat designs. If you are interested in a previous piece, feel free to send it as a reference, and I will create a new, unique design inspired by it.';

export default function BookingScreen(props) {
  const [searchParams] = useSearchParams();
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  useScrollLock(infoModalOpen);

  const [availability, setAvailability] = useState([]);
  const [loadingAvail, setLoadingAvail] = useState(true);
  const [availError, setAvailError] = useState('');

  const [step, setStep] = useState(STEPS.CALENDAR);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const {
    register: registerBooking,
    handleSubmit: handleBookingSubmit,
    control: bookingControl,
    formState: { errors: bookingErrors },
  } = useForm({
    resolver: zodResolver(bookingFormSchema),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', phone: '', notes: '' },
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [booking, setBooking] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [stripePromise, setStripePromise] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [awaitingMbway, setAwaitingMbway] = useState(false);

  const handledRedirect = useRef(false);

  useEffect(() => {
    Axios.get('/api/availability')
      .then(({ data }) => {
        setAvailability(data);
        setLoadingAvail(false);
      })
      .catch(() => {
        setAvailError('Failed to load availability.');
        setLoadingAvail(false);
      });
  }, []);

  const availMap = {};
  availability.forEach((a) => {
    const key = dayjs(a.date).format('YYYY-MM-DD');
    availMap[key] = a;
  });

  const availableDates = Object.keys(availMap).filter((key) =>
    availMap[key].slots.some((s) => s.isAvailable && !s.isBooked)
  );

  const shouldDisableDate = (date) => {
    const key = dayjs(date).format('YYYY-MM-DD');
    const minDate = dayjs().add(7, 'day');
    return !availableDates.includes(key) || dayjs(date).isBefore(minDate, 'day');
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

  const handleImageChange = async (e) => {
    const selected = await Promise.all(Array.from(e.target.files).map(convertIfHeic));
    const combined = [...imageFiles, ...selected].slice(0, 10);
    setImageFiles(combined);
    setImagePreviews(combined.map((f) => URL.createObjectURL(f)));
    e.target.value = '';
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    const files = imageFiles.filter((_, i) => i !== index);
    const previews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(files);
    setImagePreviews(previews);
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      let uploadedUrls = [];
      if (imageFiles.length > 0) {
        const fd = new FormData();
        imageFiles.forEach((f) => fd.append('images', f));
        const { data } = await Axios.post('/api/uploads/booking-images', fd);
        uploadedUrls = data.urls;
      }

      const dateKey = dayjs(selectedDate).format('YYYY-MM-DD');
      const { data: createdBooking } = await Axios.post('/api/bookings', {
        date: dateKey,
        slot: selectedSlot,
        guestInfo: formData,
        images: uploadedUrls,
      });
      setBooking(createdBooking);
      Sentry.metrics.count('booking.submit_attempted', 1);
      console.log(
        `[booking] Created — ${createdBooking._id}, ${dateKey} ${selectedSlot} for ${formData.email}`
      );

      const { data: piData } = await Axios.post(
        `/api/bookings/${createdBooking._id}/create-payment-intent`,
        { confirmToken: createdBooking.confirmToken }
      );
      setClientSecret(piData.clientSecret);

      const { data: publishableKey } = await Axios.get('/api/config/stripe');
      setStripePromise(loadStripe(publishableKey));

      setStep(STEPS.PAYMENT);
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong.';
      console.warn(`[booking] Form submit error — ${msg}`);
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      await Axios.put(`/api/bookings/${booking._id}/pay`, {
        paymentIntentId,
        confirmToken: booking.confirmToken,
      });
      Sentry.metrics.count('booking.completed', 1);
      Sentry.metrics.gauge('booking.amount', booking.price);
      console.log(`[booking] Payment confirmed — ${booking._id}`);
      setStep(STEPS.CONFIRMED);
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment verification failed.';
      console.warn(`[booking] Payment verification failed — ${booking._id} — ${msg}`);
      setSubmitError(msg);
    }
  };

  const handleProcessing = (paymentIntentId) => {
    setAwaitingMbway(true);
    const POLL_INTERVAL = 3000;
    const TIMEOUT = 5 * 60 * 1000;
    const start = Date.now();

    const interval = setInterval(async () => {
      if (Date.now() - start > TIMEOUT) {
        clearInterval(interval);
        setAwaitingMbway(false);
        setSubmitError('Payment confirmation timed out. Please contact support.');
        return;
      }
      try {
        const { data } = await Axios.get(`/api/bookings/${booking._id}/payment-status`);
        if (data.isPaid) {
          clearInterval(interval);
          setAwaitingMbway(false);
          setStep(STEPS.CONFIRMED);
        }
      } catch {}
    }, POLL_INTERVAL);
  };

  useEffect(() => {
    if (handledRedirect.current || !booking) return;
    const paymentIntentId = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');
    if (paymentIntentId && redirectStatus === 'succeeded') {
      handledRedirect.current = true;
      handlePaymentSuccess(paymentIntentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, booking]);

  const dateKey = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null;
  const dayAvailability = dateKey ? availMap[dateKey] : null;
  const availableSlots = dayAvailability
    ? dayAvailability.slots.filter((s) => s.isAvailable && !s.isBooked)
    : [];

  return (
    <section className="booking-screen">
      <div className="booking-container">
        {step === STEPS.CONFIRMED ? (
          <div className="booking-confirmed">
            <img
              src="/booking-confirmation.avif"
              alt="Booking confirmed"
              className="booking-confirmed-img"
            />
            <h1 className="custom-font">Booking Confirmed!</h1>
            <p>
              Your booking for <strong>{selectedSlot}</strong> on{' '}
              <strong>{dayjs(selectedDate).format('DD/MM/YYYY')}</strong> is confirmed. Check your
              email for details.
            </p>
          </div>
        ) : (
          <>
            <div className="booking-calendar-outer">
              <img src="/bookings.avif" alt="" className="booking-hero-img" />
              <div className="booking-calendar-content">
                <h1 className="custom-font">Book a Session</h1>
                {step > STEPS.CALENDAR && (
                  <div className="booking-breadcrumb">
                    <button className="booking-back" onClick={() => setStep(step - 1)}>
                      ← Back
                    </button>
                    <span>
                      {dayjs(selectedDate).format('DD/MM/YYYY')}
                      {selectedSlot && ` — ${selectedSlot}`}
                    </span>
                  </div>
                )}

                {step === STEPS.CALENDAR && (
                  <div className="booking-step booking-step--calendar">
                    <h2>Select a date</h2>
                    {availError ? (
                      <MessageBox variant="error">{availError}</MessageBox>
                    ) : (
                      <LoadingOverlay loading={loadingAvail} minHeight="300px">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DateCalendar
                            minDate={dayjs().add(7, 'day')}
                            shouldDisableDate={shouldDisableDate}
                            onChange={handleDateSelect}
                            slots={{ day: AvailableDay }}
                            slotProps={{ day: { availableDates } }}
                          />
                        </LocalizationProvider>
                      </LoadingOverlay>
                    )}
                  </div>
                )}

                {step === STEPS.SLOTS && (
                  <div className="booking-step">
                    <h2>Select a time slot</h2>
                    {availableSlots.length === 0 ? (
                      <MessageBox variant="error">No slots available for this date.</MessageBox>
                    ) : (
                      <>
                        <div className="booking-slots">
                          {availableSlots.map((s) => (
                            <button
                              key={s.time}
                              className="booking-slot-btn primary"
                              onClick={() => handleSlotSelect(s.time)}
                            >
                              <span className="slot-time">{s.time}</span>
                            </button>
                          ))}
                        </div>
                        {dayAvailability && (
                          <p className="booking-slot-price">
                            Deposit: {dayAvailability.price.toFixed(2)}€
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {step === STEPS.FORM && (
                  <div className="booking-step">
                    <h2>Your details</h2>
                    {submitError && <MessageBox variant="error">{submitError}</MessageBox>}
                    <form onSubmit={handleBookingSubmit(handleFormSubmit)} className="booking-form">
                      <div>
                        <label>Name *</label>
                        <input maxLength={100} {...registerBooking('name')} />
                        {bookingErrors.name && (
                          <span className="field-error">{bookingErrors.name.message}</span>
                        )}
                      </div>
                      <div>
                        <label>Email *</label>
                        <input type="email" maxLength={254} {...registerBooking('email')} />
                        {bookingErrors.email && (
                          <span className="field-error">{bookingErrors.email.message}</span>
                        )}
                      </div>
                      <div>
                        <label>Phone *</label>
                        <Controller
                          name="phone"
                          control={bookingControl}
                          render={({ field }) => (
                            <PhoneInput
                              country="pt"
                              value={field.value}
                              onChange={field.onChange}
                              containerClass="phone-input-container"
                              inputClass="phone-input-field"
                            />
                          )}
                        />
                        {bookingErrors.phone && (
                          <span className="field-error">{bookingErrors.phone.message}</span>
                        )}
                      </div>
                      <div>
                        <label>Notes</label>
                        <textarea rows={3} maxLength={1000} {...registerBooking('notes')} />
                        {bookingErrors.notes && (
                          <span className="field-error">{bookingErrors.notes.message}</span>
                        )}
                      </div>
                      <div>
                        <label>
                          Photos{' '}
                          <span style={{ fontWeight: 400, color: '#888' }}>(optional, max 10)</span>
                        </label>
                        {imagePreviews.length > 0 && (
                          <div className="booking-image-previews">
                            {imagePreviews.map((src, i) => (
                              <div key={i} className="booking-image-preview">
                                <img src={src} alt="" />
                                <button
                                  type="button"
                                  className="booking-image-remove"
                                  onClick={() => removeImage(i)}
                                  aria-label="Remove photo"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {imageFiles.length < 10 && (
                          <label className="booking-image-add">
                            + Add photos
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              style={{ display: 'none' }}
                              onChange={handleImageChange}
                            />
                          </label>
                        )}
                      </div>
                      <button type="submit" className="primary" disabled={submitting}>
                        {submitting
                          ? 'Please wait...'
                          : `Continue to Payment — ${dayAvailability?.price.toFixed(2)}€`}
                      </button>
                    </form>
                  </div>
                )}

                {step === STEPS.PAYMENT && (
                  <div className="booking-step">
                    <h2>Payment</h2>
                    {submitError && <MessageBox variant="error">{submitError}</MessageBox>}
                    {dayAvailability && (
                      <div className="booking-price-summary">
                        <p>Deposit: {dayAvailability.price.toFixed(2)}€</p>
                        <p>
                          IVA (23%): {((dayAvailability.price * 0.23) / 1.23).toFixed(2)}€ included
                        </p>
                      </div>
                    )}
                    {awaitingMbway ? (
                      <LoadingOverlay loading minHeight="120px">
                        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                          Waiting for MBWay confirmation in your app…
                        </p>
                      </LoadingOverlay>
                    ) : !clientSecret || !stripePromise ? (
                      <LoadingOverlay loading minHeight="120px">
                        <div />
                      </LoadingOverlay>
                    ) : (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <StripeCheckoutForm
                          price={dayAvailability?.price}
                          onSuccess={handlePaymentSuccess}
                          onProcessing={handleProcessing}
                        />
                      </Elements>
                    )}
                  </div>
                )}
              </div>
            </div>
            <p className="booking-contact-info">
              <em>Please note that the booking value is non-refundable.</em>
              <br />
              For price inquiries before booking, please contact:{' '}
              <a href={`mailto:${import.meta.env.VITE_SENDER_EMAIL_ADDRESS}`}>
                {import.meta.env.VITE_SENDER_EMAIL_ADDRESS}
              </a>
              <br />
              <button
                type="button"
                className="booking-info-link"
                onClick={() => setInfoModalOpen(true)}
              >
                Click here for more info
              </button>
            </p>
          </>
        )}
      </div>
      {infoModalOpen && (
        <div className="booking-modal-overlay" onClick={() => setInfoModalOpen(false)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="booking-modal-close"
              onClick={() => setInfoModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <p>{EXCLUSIVITY_TEXT}</p>
          </div>
        </div>
      )}
    </section>
  );
}
