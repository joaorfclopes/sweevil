import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { getCountryDataList } from "countries-list";
import { saveShippingAddress } from "../actions/cartActions";

const COUNTRY_LIST = getCountryDataList()
  .map(({ iso2, name }) => ({ code: iso2, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

const safeText = /^[\p{L}\p{N}\s\-'.,#/()+&]+$/u;

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  phoneNumber: z.string().min(7, "Enter a valid phone number"),
  fullName: z
    .string()
    .min(2, "Full name is required")
    .max(100)
    .regex(/^[\p{L}\s\-'.]+$/u, "Only letters, spaces, hyphens and apostrophes"),
  country: z.string().min(1, "Country is required"),
  address: z
    .string()
    .min(3, "Address is required")
    .max(200)
    .regex(safeText, "Invalid characters in address"),
  city: z
    .string()
    .min(2, "City is required")
    .max(100)
    .regex(/^[\p{L}\s\-'.]+$/u, "Only letters allowed"),
  postalCode: z
    .string()
    .min(3, "Postal code is required")
    .max(20)
    .regex(/^[\w\s\-]+$/, "Invalid postal code"),
});

export default function ShippingScreen(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { cartItems, shippingAddress } = cart;

  const [phoneCountry, setPhoneCountry] = useState(
    shippingAddress.country ? shippingAddress.country.toLowerCase() : "pt"
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      email: shippingAddress.email || "",
      phoneNumber: shippingAddress.phoneNumber || "",
      fullName: shippingAddress.fullName || "",
      country: shippingAddress.country || "",
      address: shippingAddress.address || "",
      city: shippingAddress.city || "",
      postalCode: shippingAddress.postalCode || "",
    },
  });

  useEffect(() => {
    if (cartItems.length <= 0) navigate("/cart");
  }, [cartItems, navigate]);

  useEffect(() => {
    if (shippingAddress.country) return;
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then(({ country_code }) => {
        if (!country_code) return;
        setValue("country", country_code.toUpperCase());
        setPhoneCountry(country_code.toLowerCase());
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (data) => {
    dispatch(saveShippingAddress(data));
    navigate("/cart/placeorder");
  };

  return (
    <motion.section
      className="shipping"
      initial="out"
      animate="in"
      exit="out"
      variants={props.pageVariants}
      transition={props.pageTransition}
    >
      <div className="shipping-container">
        <div className="shipping-inner">
          <h1 className="custom-font">Shipping Details</h1>
          <form className="shipping-form" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" maxLength={254} {...register("email")} />
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </div>
            <div>
              <label>Phone Number</label>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    country={phoneCountry}
                    value={field.value}
                    onChange={field.onChange}
                    inputProps={{ id: "phoneNumber" }}
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
              <label htmlFor="fullName">Full Name</label>
              <input type="text" id="fullName" maxLength={100} {...register("fullName")} />
              {errors.fullName && <span className="field-error">{errors.fullName.message}</span>}
            </div>
            <div>
              <label htmlFor="country">Country</label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <select id="country" value={field.value} onChange={field.onChange} onBlur={field.onBlur}>
                    <option value="">Select a country</option>
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
              <label htmlFor="address">Address</label>
              <input type="text" id="address" maxLength={200} {...register("address")} />
              {errors.address && <span className="field-error">{errors.address.message}</span>}
            </div>
            <div>
              <label htmlFor="city">City</label>
              <input type="text" id="city" maxLength={85} {...register("city")} />
              {errors.city && <span className="field-error">{errors.city.message}</span>}
            </div>
            <div>
              <label htmlFor="postalCode">Postal Code</label>
              <input type="text" id="postalCode" maxLength={20} {...register("postalCode")} />
              {errors.postalCode && (
                <span className="field-error">{errors.postalCode.message}</span>
              )}
            </div>
            <div>
              <button className="primary" type="submit">
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.section>
  );
}
