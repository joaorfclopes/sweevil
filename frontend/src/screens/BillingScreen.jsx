import { zodResolver } from '@hookform/resolvers/zod';
import Popover from '@mui/material/Popover';
import { getCountryDataList } from 'countries-list';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { saveBillingInfo } from '../actions/cartActions';
import CheckoutStepper from '../components/CheckoutStepper';

const COUNTRY_LIST = getCountryDataList()
  .map(({ iso2, name }) => ({ code: iso2, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

const safeText = /^[\p{L}\p{N}\s\-'.,#/()+&]+$/u;

function getSchema(t, sameAsShipping) {
  if (sameAsShipping) {
    return z.object({
      billingFullName: z.string().optional(),
      billingStreet: z.string().optional(),
      billingCity: z.string().optional(),
      billingPostalCode: z.string().optional(),
      billingCountry: z.string().optional(),
      vatNif: z.string().max(30).optional().or(z.literal('')),
    });
  }
  return z.object({
    billingFullName: z
      .string()
      .min(2, t('shipping.nameRequired'))
      .max(100)
      .regex(/^[\p{L}\s\-'.]+$/u, t('shipping.nameChars')),
    billingStreet: z
      .string()
      .min(3, t('shipping.addressRequired'))
      .max(200)
      .regex(safeText, t('shipping.addressChars')),
    billingCity: z
      .string()
      .min(2, t('shipping.cityRequired'))
      .max(100)
      .regex(/^[\p{L}\s\-'.]+$/u, t('shipping.cityChars')),
    billingPostalCode: z
      .string()
      .min(3, t('shipping.postalRequired'))
      .max(20)
      .regex(/^[\w\s\-]+$/, t('shipping.postalInvalid')),
    billingCountry: z.string().min(1, t('shipping.countryRequired')),
    vatNif: z.string().max(30).optional().or(z.literal('')),
  });
}

export default function BillingScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const {
    cartItems,
    shippingDetails,
    billingDetails: savedBillingDetails,
    vatNif: savedVatNif,
  } = cart;

  const [sameAsShipping, setSameAsShipping] = useState(() => {
    const stored = localStorage.getItem('sameAsShipping');
    if (stored !== null) return stored === 'true';
    return false;
  });

  const [vatNifAnchorEl, setVatNifAnchorEl] = useState(null);

  const schema = useMemo(() => getSchema(t, sameAsShipping), [t, sameAsShipping]);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      billingFullName: sameAsShipping
        ? (shippingDetails.fullName ?? '')
        : (savedBillingDetails?.fullName ?? ''),
      billingStreet: sameAsShipping
        ? (shippingDetails.address ?? '')
        : (savedBillingDetails?.address ?? ''),
      billingCity: sameAsShipping
        ? (shippingDetails.city ?? '')
        : (savedBillingDetails?.city ?? ''),
      billingPostalCode: sameAsShipping
        ? (shippingDetails.postalCode ?? '')
        : (savedBillingDetails?.postalCode ?? ''),
      billingCountry: sameAsShipping
        ? (shippingDetails.country ?? '')
        : (savedBillingDetails?.country ?? ''),
      vatNif: savedVatNif || '',
    },
  });

  useEffect(() => {
    if (cartItems.length <= 0) navigate('/cart');
  }, [cartItems, navigate]);

  useEffect(() => {
    if (!shippingDetails.email) navigate('/cart/shipping');
  }, [shippingDetails, navigate]);

  const handleSameAsShippingChange = (checked) => {
    setSameAsShipping(checked);
    localStorage.setItem('sameAsShipping', String(checked));
    if (checked) {
      setValue('billingFullName', shippingDetails.fullName || '');
      setValue('billingStreet', shippingDetails.address || '');
      setValue('billingCity', shippingDetails.city || '');
      setValue('billingPostalCode', shippingDetails.postalCode || '');
      setValue('billingCountry', shippingDetails.country || '');
    } else {
      setValue('billingFullName', '');
      setValue('billingStreet', '');
      setValue('billingCity', '');
      setValue('billingPostalCode', '');
      setValue('billingCountry', '');
      dispatch(saveBillingInfo(null, getValues('vatNif') || ''));
    }
  };

  const onSubmit = (data) => {
    const billingData = sameAsShipping
      ? {
          fullName: shippingDetails.fullName,
          address: shippingDetails.address,
          city: shippingDetails.city,
          postalCode: shippingDetails.postalCode,
          country: shippingDetails.country,
        }
      : {
          fullName: data.billingFullName,
          address: data.billingStreet,
          city: data.billingCity,
          postalCode: data.billingPostalCode,
          country: data.billingCountry,
        };
    dispatch(saveBillingInfo(billingData, data.vatNif || ''));
    navigate('/cart/placeorder');
  };

  return (
    <section className="shipping">
      <div className="shipping-container">
        <div className="shipping-inner">
          <CheckoutStepper
            steps={[t('stepper.shipping'), t('stepper.billing'), t('stepper.review')]}
            activeStep={1}
            onStepClick={(i) => i === 0 && navigate('/cart/shipping')}
          />
          <form className="shipping-form" onSubmit={handleSubmit(onSubmit)}>
            <h2>{t('shipping.billingAddress')}</h2>
            <div className="billing-section">
              <div className="same-as-shipping-row">
                <input
                  type="checkbox"
                  id="sameAsShipping"
                  checked={sameAsShipping}
                  onChange={(e) => handleSameAsShippingChange(e.target.checked)}
                />
                <label htmlFor="sameAsShipping">{t('shipping.sameAsShipping')}</label>
              </div>
              <div>
                <label htmlFor="billingFullName">{t('shipping.billingFullName')}</label>
                <input
                  type="text"
                  id="billingFullName"
                  maxLength={100}
                  disabled={sameAsShipping}
                  {...register('billingFullName')}
                />
                {errors.billingFullName && (
                  <span className="field-error">{errors.billingFullName.message}</span>
                )}
              </div>
              <div>
                <label htmlFor="billingStreet">{t('shipping.billingAddressLabel')}</label>
                <input
                  type="text"
                  id="billingStreet"
                  maxLength={200}
                  disabled={sameAsShipping}
                  {...register('billingStreet')}
                />
                {errors.billingStreet && (
                  <span className="field-error">{errors.billingStreet.message}</span>
                )}
              </div>
              <div>
                <label htmlFor="billingCity">{t('shipping.billingCity')}</label>
                <input
                  type="text"
                  id="billingCity"
                  maxLength={85}
                  disabled={sameAsShipping}
                  {...register('billingCity')}
                />
                {errors.billingCity && (
                  <span className="field-error">{errors.billingCity.message}</span>
                )}
              </div>
              <div>
                <label htmlFor="billingPostalCode">{t('shipping.billingPostalCode')}</label>
                <input
                  type="text"
                  id="billingPostalCode"
                  maxLength={20}
                  disabled={sameAsShipping}
                  {...register('billingPostalCode')}
                />
                {errors.billingPostalCode && (
                  <span className="field-error">{errors.billingPostalCode.message}</span>
                )}
              </div>
              <div>
                <label htmlFor="billingCountry">{t('shipping.billingCountry')}</label>
                <Controller
                  name="billingCountry"
                  control={control}
                  render={({ field }) => (
                    <select
                      id="billingCountry"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={sameAsShipping}
                    >
                      <option value="">{t('shipping.selectCountry')}</option>
                      {COUNTRY_LIST.map(({ code, name }) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.billingCountry && (
                  <span className="field-error">{errors.billingCountry.message}</span>
                )}
              </div>
              <div>
                <label htmlFor="vatNif">
                  {t('shipping.vatNif')}
                  <button
                    type="button"
                    className="shipping-info-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      setVatNifAnchorEl(e.currentTarget);
                    }}
                    aria-label="Tax ID info"
                  >
                    ⓘ
                  </button>
                </label>
                <Popover
                  open={Boolean(vatNifAnchorEl)}
                  anchorEl={vatNifAnchorEl}
                  onClose={() => setVatNifAnchorEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  disableScrollLock
                >
                  <p className="shipping-info-popover">{t('shipping.vatNifTooltip')}</p>
                </Popover>
                <input
                  type="text"
                  id="vatNif"
                  maxLength={30}
                  placeholder={t('common.optional')}
                  {...register('vatNif')}
                />
                {errors.vatNif && <span className="field-error">{errors.vatNif.message}</span>}
              </div>
            </div>
            <div>
              <button className="primary" type="submit">
                {t('shipping.continue')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
