import { useTranslation } from 'react-i18next';

export default function PoliticaDevolucoes() {
  const { t } = useTranslation();
  return (
    <section className="legal-screen custom-font">
      <h1>{t('policy.returnPolicy')}</h1>
      <span className="last-updated">Última atualização: 8 de abril de 2026</span>

      <h2>1. Return Conditions</h2>
      <p>
        You may return any item purchased from the Sweevil store within
        <strong> 14 calendar days</strong> of receiving the order, provided that:
      </p>
      <ul>
        <li>The item is in perfect condition, with no signs of use</li>
        <li>The item is returned in its original packaging</li>
        <li>Proof of purchase is provided (order confirmation email)</li>
      </ul>

      <h2>2. How to Start a Return</h2>
      <p>To start the return process, contact us at:</p>
      <ul>
        <li>
          Email:{' '}
          <a href="mailto:silvia.seixas.peralta@gmail.com">silvia.seixas.peralta@gmail.com</a>
        </li>
        <li>Phone: +351 916 828 734</li>
      </ul>
      <p>
        Please provide your order number, the items you wish to return, and the reason for the
        return. Once the return is confirmed, we will send you shipping instructions.
      </p>

      <h2>3. Return Shipping Costs</h2>
      <p>
        Return shipping costs are the customer's responsibility. We recommend using a tracked
        shipping service, as we are not liable for items lost during return transit.
      </p>

      <h2>4. Refunds</h2>
      <p>
        After receiving and inspecting the returned item, we will process the refund within a
        maximum of <strong>14 days</strong>. The refund will be issued via the same payment method
        used in the original purchase:
      </p>
      <ul>
        <li>Credit/debit card (Stripe) — refunded to the card used</li>
        <li>Debit card — refunded to the card used</li>
        <li>MB Way — refunded to the associated phone number</li>
        <li>Revolut — refunded to the Revolut account used</li>
      </ul>

      <h2>5. Defective or Damaged Items</h2>
      <p>
        If you receive a defective or damaged item, contact us immediately (within 48 hours of
        receipt) with photos of the item and the packaging. In this case, return shipping costs will
        be covered by Sweevil and we will arrange a replacement or full refund, according to your
        preference.
      </p>

      <h2>6. Undelivered Orders</h2>
      <p>
        If your order has not been delivered within the estimated timeframe, contact us at{' '}
        <a href="mailto:silvia.seixas.peralta@gmail.com">silvia.seixas.peralta@gmail.com</a> so we
        can follow up with the carrier.
      </p>
    </section>
  );
}
