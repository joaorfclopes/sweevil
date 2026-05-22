import { useTranslation } from 'react-i18next';

export default function DireitoArrependimentoScreen() {
  const { t } = useTranslation();
  return (
    <section className="legal-screen custom-font">
      <h1>{t('policy.withdrawalRight')}</h1>
      <span className="last-updated">Last updated: 8 April 2026</span>

      <h2>1. Right to Withdraw</h2>
      <p>
        Under Decree-Law No. 24/2014 of 14 February, you have the right to withdraw from the sales
        contract, without providing any reason, within <strong>14 calendar days</strong> from the
        day you receive the ordered item.
      </p>

      <h2>2. How to Exercise the Right of Withdrawal</h2>
      <p>
        To exercise your right to withdraw, you must notify us before the 14-day period expires with
        an unambiguous statement (for example, by letter, email, or the form below). You can contact
        us by:
      </p>
      <ul>
        <li>
          Email:{' '}
          <a href="mailto:silvia.seixas.peralta@gmail.com">silvia.seixas.peralta@gmail.com</a>
        </li>
        <li>Phone: +351 916 828 734</li>
        <li>Post: Rua das Eirinhas, 157, Casa 6, 4300-166 Porto, Portugal</li>
      </ul>

      <h2>3. Model Withdrawal Form</h2>
      <p>You may use the following model form, though its use is not mandatory:</p>
      <p>
        <em>
          "I/We [*] hereby give notice that I/we withdraw from my/our contract of sale of the
          following goods [*] / for the provision of the following service [*], ordered on [*] /
          received on [*], Name of consumer(s), Address of consumer(s), Signature of consumer(s)
          (only if this form is submitted on paper), Date."
        </em>
      </p>
      <p>[*] Delete as appropriate.</p>

      <h2>4. Effects of Withdrawal</h2>
      <p>
        If you withdraw from the contract, we will refund all payments received, within a maximum of{' '}
        <strong>14 days</strong> from the date we are informed of your decision to withdraw, and
        after receipt of the returned items. The refund will be made using the same payment method
        used in the original transaction.
      </p>

      <h2>5. Returning Items</h2>
      <p>
        You must return the items without undue delay and, in any case, no later than{' '}
        <strong>14 days</strong> after notifying us of your withdrawal. The deadline is met if you
        send back the items before the 14-day period has expired.
      </p>
      <p>
        Return shipping costs are borne by the customer. Items must be returned in the same
        condition in which they were received, unused and in their original packaging.
      </p>

      <h2>6. Exceptions to the Right of Withdrawal</h2>
      <p>
        All products available in the Sweevil store are subject to the right of withdrawal. There
        are no exceptions applicable to the items sold.
      </p>
    </section>
  );
}
