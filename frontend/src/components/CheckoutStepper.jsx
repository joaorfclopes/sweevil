export default function CheckoutStepper({ steps, activeStep, onStepClick }) {
  return (
    <nav className="checkout-stepper" aria-label="Checkout progress">
      {steps.map((label, i) => {
        const isCompleted = i < activeStep;
        const isActive = i === activeStep;
        const isFuture = i > activeStep;

        return (
          <span key={i} style={{ display: 'contents' }}>
            {i > 0 && (
              <div
                className={`stepper-connector${isFuture ? ' stepper-connector--future' : ''}`}
                aria-hidden="true"
              />
            )}
            <div className="stepper-step">
              <button
                type="button"
                className={[
                  'stepper-bubble',
                  isActive ? 'stepper-bubble--active' : '',
                  isFuture ? 'stepper-bubble--future' : '',
                  isCompleted ? 'stepper-bubble--completed' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => isCompleted && onStepClick?.(i)}
                disabled={isFuture}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${i + 1}: ${label}${isCompleted ? ' (completed)' : isActive ? ' (current)' : ''}`}
              >
                {i + 1}
              </button>
              <span
                className={[
                  'stepper-label',
                  isActive ? 'stepper-label--active' : '',
                  isCompleted ? 'stepper-label--completed' : '',
                  isFuture ? 'stepper-label--future' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {label}
              </span>
            </div>
          </span>
        );
      })}
    </nav>
  );
}
