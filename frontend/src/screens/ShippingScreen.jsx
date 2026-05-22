import { zodResolver } from '@hookform/resolvers/zod';
import { getCountryDataList } from 'countries-list';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { saveShippingAddress } from '../actions/cartActions';

const COUNTRY_LIST = getCountryDataList()
  .map(({ iso2, name }) => ({ code: iso2, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

const DIAL_CODES = Object.fromEntries(
  getCountryDataList().map(({ iso2, phone }) => [iso2, String(phone[0])])
);

const safeText = /^[\p{L}\p{N}\s\-'.,#/()+&]+$/u;

const schema = z.object({
  email: z.string().email('Insira um endereço de email válido'),
  phoneNumber: z.string().min(7, 'Insira um número de telefone válido'),
  fullName: z
    .string()
    .min(2, 'O nome completo é obrigatório')
    .max(100)
    .regex(/^[\p{L}\s\-'.]+$/u, 'Apenas letras, espaços, hífens e apóstrofos'),
  country: z.string().min(1, 'País é obrigatório'),
  address: z
    .string()
    .min(3, 'A morada é obrigatória')
    .max(200)
    .regex(safeText, 'Caracteres inválidos na morada'),
  city: z
    .string()
    .min(2, 'A cidade é obrigatória')
    .max(100)
    .regex(/^[\p{L}\s\-'.]+$/u, 'Apenas letras são permitidas'),
  postalCode: z
    .string()
    .min(3, 'O código postal é obrigatório')
    .max(20)
    .regex(/^[\w\s\-]+$/, 'Código postal inválido'),
});

export default function ShippingScreen(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { cartItems, shippingAddress } = cart;

  const [phoneCountry, setPhoneCountry] = useState(
    shippingAddress.country ? shippingAddress.country.toLowerCase() : 'pt'
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      email: shippingAddress.email || '',
      phoneNumber: shippingAddress.phoneNumber || '',
      fullName: shippingAddress.fullName || '',
      country: shippingAddress.country || '',
      address: shippingAddress.address || '',
      city: shippingAddress.city || '',
      postalCode: shippingAddress.postalCode || '',
    },
  });

  useEffect(() => {
    if (cartItems.length <= 0) navigate('/cart');
  }, [cartItems, navigate]);

  useEffect(() => {
    if (shippingAddress.country) return;
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

  const onSubmit = (data) => {
    dispatch(saveShippingAddress(data));
    navigate('/cart/placeorder');
  };

  return (
    <section className="shipping">
      <div className="shipping-container">
        <div className="shipping-inner">
          <h1 className="custom-font">{t('shipping.title')}</h1>
          <form className="shipping-form" onSubmit={handleSubmit(onSubmit)}>
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
