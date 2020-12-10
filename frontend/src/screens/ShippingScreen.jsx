import React from "react";

export default function ShippingScreen() {
  return (
    <section>
      <form className="form shipping">
        <div>
          <h1>Shipping</h1>
        </div>
        <div>
          <label htmlFor="fullName">Full Name</label>
          <input type="text" id="fullName" required />
        </div>
        <div>
          <label htmlFor="phoneNumber">Phone Number</label>
          <input type="number" id="phoneNumber" required />
        </div>
        <div>
          <label htmlFor="address">Address</label>
          <input type="text" id="address" required />
        </div>
        <div>
          <label htmlFor="city">City</label>
          <input type="text" id="city" required />
        </div>
        <div>
          <label htmlFor="postalCode">Postal Code</label>
          <input type="text" id="postalCode" required />
        </div>
        <div>
          <label htmlFor="country">Country</label>
          <input type="text" id="country" required />
        </div>
        <div>
          <button className="primary" type="submit">
            Continue
          </button>
        </div>
      </form>
    </section>
  );
}
