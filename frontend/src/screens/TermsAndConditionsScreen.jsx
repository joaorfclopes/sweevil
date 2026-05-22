import { useTranslation } from 'react-i18next';

export default function TermosCondicoesScreen() {
  const { t } = useTranslation();
  return (
    <section className="legal-screen custom-font">
      <h1>{t('policy.termsConditions')}</h1>
      <span className="last-updated">Last updated: 8 April 2026</span>

      <h2>1. Seller Identification</h2>
      <p>
        Sílvia Seixas Pinho Peralta, trading under the brand Sweevil, NIF 247 911 780, registered
        address at Rua das Eirinhas, 157, Casa 6, 4300-166 Porto, Portugal.
      </p>
      <p>
        Contact:{' '}
        <a href="mailto:silvia.seixas.peralta@gmail.com">silvia.seixas.peralta@gmail.com</a> | +351
        916 828 734
      </p>

      <h2>2. Scope</h2>
      <p>
        These Terms and Conditions govern all purchases made in the Sweevil online store
        (sweevil.pt). By completing an order, the customer fully accepts these terms.
      </p>

      <h2>3. Products and Prices</h2>
      <p>
        All prices shown include VAT at the applicable legal rate. Sweevil reserves the right to
        change prices without prior notice; the price applicable is the one in effect at the time of
        the order. Product images are for illustrative purposes only and may differ slightly from
        the actual items.
      </p>

      <h2>4. Payment Methods</h2>
      <p>The following payment methods are accepted:</p>
      <ul>
        <li>Credit/debit card (Stripe)</li>
        <li>Debit card</li>
        <li>MB Way</li>
        <li>Revolut</li>
      </ul>
      <p>
        Payment is processed at the time of the order. If payment is not confirmed, the order will
        be automatically cancelled.
      </p>

      <h2>5. Shipping and Delivery</h2>
      <p>
        Orders are shipped across Europe via CTT, DPD, DHL, and GLS carriers. The estimated delivery
        time is 5 business days after payment confirmation, and may vary depending on the
        destination and selected carrier.
      </p>
      <p>Shipping costs are calculated at checkout based on the destination and order weight.</p>

      <h2>6. Right of Withdrawal</h2>
      <p>
        The customer has 14 calendar days from the date of receipt of the item to exercise the right
        to withdraw from the contract, without providing any reason. For more information, please
        see our <a href="/right-of-withdrawal">Right of Withdrawal Policy</a>.
      </p>

      <h2>7. Returns and Refunds</h2>
      <p>
        Returned items must be in perfect condition, unused, and in their original packaging. Return
        shipping costs are borne by the customer. Refunds are issued via the same payment method
        used for the purchase, within 14 days of receiving the returned item. For more details,
        please see our <a href="/returns-policy">Returns and Refunds Policy</a>.
      </p>

      <h2>8. Dispute Resolution</h2>
      <p>
        In the event of a dispute, the consumer may contact an Alternative Dispute Resolution (ADR)
        entity. The European online dispute resolution platform is available at{' '}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">
          ec.europa.eu/consumers/odr
        </a>
        .
      </p>
      <p>
        You may also file a complaint through the Electronic Complaints Book at{' '}
        <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noreferrer">
          www.livroreclamacoes.pt
        </a>
        .
      </p>

      <h2>9. Applicable Law</h2>
      <p>
        These Terms and Conditions are governed by Portuguese law. For any disputes arising from the
        contractual relationship, the courts of Porto shall have jurisdiction, without prejudice to
        applicable consumer protection legislation.
      </p>
    </section>
  );
}
