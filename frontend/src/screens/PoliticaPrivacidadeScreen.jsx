export default function PoliticaPrivacidadeScreen() {
  return (
    <section className="legal-screen custom-font">
      <h1>Privacy Policy</h1>
      <span className="last-updated">Last updated: 8 April 2026</span>

      <h2>1. Data Controller</h2>
      <p>
        Sílvia Seixas Pinho Peralta (Sweevil), NIF 247 911 780, Rua das Eirinhas, 157, Casa 6,
        4300-166 Porto, Portugal.
      </p>
      <p>
        Privacy enquiries:{' '}
        <a href="mailto:silvia.seixas.peralta@gmail.com">silvia.seixas.peralta@gmail.com</a>
      </p>

      <h2>2. Personal Data Collected</h2>
      <p>
        We collect only the data strictly necessary for order processing and customer communication:
      </p>
      <ul>
        <li>Full name</li>
        <li>Delivery address</li>
        <li>Email address</li>
        <li>Phone number (optional)</li>
        <li>Payment data (processed by the payment provider; not stored by Sweevil)</li>
      </ul>

      <h2>3. Purpose and Legal Basis for Processing</h2>
      <p>Data is processed for the following purposes:</p>
      <ul>
        <li>Order processing and management (performance of a contract — Art. 6(1)(b) GDPR)</li>
        <li>
          Order-related communication, such as confirmations and shipping updates (legitimate
          interest — Art. 6(1)(f) GDPR)
        </li>
        <li>
          Compliance with legal obligations, such as invoicing (legal obligation — Art. 6(1)(c)
          GDPR)
        </li>
      </ul>

      <h2>4. Sharing Data with Third Parties</h2>
      <p>
        Personal data may be shared with carriers (CTT, DPD, DHL, GLS) solely for delivery purposes,
        and with the payment processor (Stripe) for transaction processing. We do not share data
        with third parties for marketing or advertising purposes.
      </p>

      <h2>5. Retention Period</h2>
      <p>
        Data is retained for the minimum period required to fulfil legal obligations (in particular
        tax and accounting obligations), generally no longer than 10 years, in accordance with
        Portuguese tax legislation.
      </p>

      <h2>6. Data Subject Rights</h2>
      <p>Under the GDPR, data subjects have the right to:</p>
      <ul>
        <li>Access their personal data</li>
        <li>Rectify inaccurate or incomplete data</li>
        <li>Request erasure of their data ("right to be forgotten")</li>
        <li>Restrict or object to processing</li>
        <li>Data portability</li>
        <li>
          Lodge a complaint with the CNPD (National Data Protection Commission) at{' '}
          <a href="https://www.cnpd.pt" target="_blank" rel="noreferrer">
            www.cnpd.pt
          </a>
        </li>
      </ul>
      <p>
        To exercise any of these rights, contact us at{' '}
        <a href="mailto:silvia.seixas.peralta@gmail.com">silvia.seixas.peralta@gmail.com</a>.
      </p>

      <h2>7. Security</h2>
      <p>
        We implement appropriate technical and organisational measures to protect your personal data
        against unauthorised access, loss, or destruction. Payment data is processed directly by
        payment providers in a secure environment and is not stored in our systems.
      </p>
    </section>
  );
}
