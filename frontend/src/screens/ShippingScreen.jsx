import { zodResolver } from '@hookform/resolvers/zod';
import Popover from '@mui/material/Popover';
import { getCountryDataList } from 'countries-list';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import _PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { saveBillingInfo, saveShippingDetails } from '../actions/cartActions';

const PhoneInput = _PhoneInput.default || _PhoneInput;

const COUNTRY_LIST = getCountryDataList()
  .map(({ iso2, name }) => ({ code: iso2, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

const DIAL_CODES = Object.fromEntries(
  getCountryDataList().map(({ iso2, phone }) => [iso2, String(phone[0])])
);

const safeText = /^[\p{L}\p{N}\s\-'.,#/()+&]+$/u;

function getSchema(t, sameAsShipping) {
  return z
    .object({
      email: z.string().email(t('shipping.validEmail')),
      phoneNumber: z.string().min(7, t('shipping.validPhone')),
      fullName: z
        .string()
        .min(2, t('shipping.nameRequired'))
        .max(100)
        .regex(/^[\p{L}\s\-'.]+$/u, t('shipping.nameChars')),
      country: z.string().min(1, t('shipping.countryRequired')),
      address: z
        .string()
        .min(3, t('shipping.addressRequired'))
        .max(200)
        .regex(safeText, t('shipping.addressChars')),
      city: z
        .string()
        .min(2, t('shipping.cityRequired'))
        .max(100)
        .regex(/^[\p{L}\s\-'.]+$/u, t('shipping.cityChars')),
      postalCode: z
        .string()
        .min(3, t('shipping.postalRequired'))
        .max(20)
        .regex(/^[\w\s\-]+$/, t('shipping.postalInvalid')),
      billingFullName: z.string().max(100).optional(),
      billingStreet: z.string().max(200).optional(),
      billingCity: z.string().max(100).optional(),
      billingPostalCode: z.string().max(20).optional(),
      billingCountry: z.string().optional(),
      vatNif: z.string().max(30).optional(),
    })
    .superRefine((data, ctx) => {
      if (sameAsShipping) return;
      if (!data.billingFullName?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['billingFullName'],
          message: t('shipping.nameRequired'),
        });
      }
      if (!data.billingStreet?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['billingStreet'],
          message: t('shipping.addressRequired'),
        });
      }
      if (!data.billingCity?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['billingCity'],
          message: t('shipping.cityRequired'),
        });
      }
      if (!data.billingPostalCode?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['billingPostalCode'],
          message: t('shipping.postalRequired'),
        });
      }
      if (!data.billingCountry) {
        ctx.addIssue({
          code: 'custom',
          path: ['billingCountry'],
          message: t('shipping.countryRequired'),
        });
      }
    });
}

export default function ShippingScreen(props) {
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

  const [phoneCountry, setPhoneCountry] = useState(
    shippingDetails.country ? shippingDetails.country.toLowerCase() : 'pt'
  );

  const [vatNifAnchorEl, setVatNifAnchorEl] = useState(null);

  const [sameAsShipping, setSameAsShipping] = useState(() => {
    const stored = localStorage.getItem('sameAsShipping');
    if (stored !== null) return stored === 'true';
    return savedBillingDetails === null || savedBillingDetails === undefined;
  });

  const schema = useMemo(() => getSchema(t, sameAsShipping), [t, sameAsShipping]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      email: shippingDetails.email || '',
      phoneNumber: shippingDetails.phoneNumber || '',
      fullName: shippingDetails.fullName || '',
      country: shippingDetails.country || '',
      address: shippingDetails.address || '',
      city: shippingDetails.city || '',
      postalCode: shippingDetails.postalCode || '',
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
    if (shippingDetails.country) return;
    fetch('/api/geo')
      .then((res) => res.json())
      .then(({ country }) => {
        if (!country || country.length !== 2) return;
        const code = country.toUpperCase();
        const dialCode = DIAL_CODES[code];
        const currentPhone = getValues('phoneNumber');
        reset(
          {
            ...getValues(),
            country: code,
            ...(!currentPhone && dialCode ? { phoneNumber: `+${dialCode}` } : {}),
          },
          { keepDirty: true, keepTouched: true, keepErrors: true }
        );
        setPhoneCountry(code.toLowerCase());
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const watchedShipping = watch(['fullName', 'address', 'city', 'postalCode', 'country']);

  useEffect(() => {
    if (!sameAsShipping) return;
    setValue('billingFullName', watchedShipping[0] || '');
    setValue('billingStreet', watchedShipping[1] || '');
    setValue('billingCity', watchedShipping[2] || '');
    setValue('billingPostalCode', watchedShipping[3] || '');
    setValue('billingCountry', watchedShipping[4] || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sameAsShipping,
    watchedShipping[0],
    watchedShipping[1],
    watchedShipping[2],
    watchedShipping[3],
    watchedShipping[4],
  ]);

  const handleSameAsShippingChange = (checked) => {
    setSameAsShipping(checked);
    localStorage.setItem('sameAsShipping', String(checked));
    if (checked) {
      const { fullName, address, city, postalCode, country } = getValues();
      setValue('billingFullName', fullName || '');
      setValue('billingStreet', address || '');
      setValue('billingCity', city || '');
      setValue('billingPostalCode', postalCode || '');
      setValue('billingCountry', country || '');
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
    const shippingData = {
      email: data.email,
      phoneNumber: data.phoneNumber,
      fullName: data.fullName,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      country: data.country,
    };
    const billingData = sameAsShipping
      ? {
          fullName: data.fullName,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country,
        }
      : {
          fullName: data.billingFullName,
          address: data.billingStreet,
          city: data.billingCity,
          postalCode: data.billingPostalCode,
          country: data.billingCountry,
        };
    dispatch(saveShippingDetails(shippingData));
    dispatch(saveBillingInfo(billingData, data.vatNif || ''));
    navigate('/cart/placeorder');
  };

  return (
    <section className="shipping">
      <button className="back-button" onClick={() => navigate(-1)}>
        &#8592;
      </button>
      <div className="shipping-container">
        <div className="shipping-inner">
          <form className="shipping-form" onSubmit={handleSubmit(onSubmit)}>
            <h2>{t('shipping.title')}</h2>
            <div>
              <label htmlFor="email">{t('shipping.email')}</label>
              <input type="email" id="email" maxLength={254} {...register('email')} />
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </div>
            <div>
              <label>{t('shipping.phone')}</label>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    country={phoneCountry}
                    value={field.value}
                    onChange={(value) => field.onChange(value ? `+${value}` : value)}
                    inputProps={{ id: 'phoneNumber' }}
                    containerClass="phone-input-container"
                    inputClass="phone-input-field"
                  />
                )}
              />
              {errors.phoneNumber && (
                <span className="field-error">{errors.phoneNumber.message}</span>
              )}
            </div>
            <div>
              <label htmlFor="fullName">{t('shipping.fullName')}</label>
              <input type="text" id="fullName" maxLength={100} {...register('fullName')} />
              {errors.fullName && <span className="field-error">{errors.fullName.message}</span>}
            </div>
            <div>
              <label htmlFor="country">{t('shipping.country')}</label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <select
                    id="country"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
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
              {errors.country && <span className="field-error">{errors.country.message}</span>}
            </div>
            <div>
              <label htmlFor="address">{t('shipping.address')}</label>
              <input type="text" id="address" maxLength={200} {...register('address')} />
              {errors.address && <span className="field-error">{errors.address.message}</span>}
            </div>
            <div>
              <label htmlFor="city">{t('shipping.city')}</label>
              <input type="text" id="city" maxLength={85} {...register('city')} />
              {errors.city && <span className="field-error">{errors.city.message}</span>}
            </div>
            <div>
              <label htmlFor="postalCode">{t('shipping.postalCode')}</label>
              <input type="text" id="postalCode" maxLength={20} {...register('postalCode')} />
              {errors.postalCode && (
                <span className="field-error">{errors.postalCode.message}</span>
              )}
            </div>
            <div className="billing-section">
              <h2>{t('shipping.billingAddress')}</h2>
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
