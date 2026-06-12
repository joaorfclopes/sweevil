import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CheckoutStepper from '../components/CheckoutStepper';

const STEPS = ['Shipping', 'Billing', 'Review'];

describe('CheckoutStepper', () => {
  it('renders the correct number of step bubbles', () => {
    render(<CheckoutStepper steps={STEPS} activeStep={0} />);
    const bubbles = screen.getAllByRole('button');
    expect(bubbles).toHaveLength(3);
  });

  it('displays each step label', () => {
    render(<CheckoutStepper steps={STEPS} activeStep={0} />);
    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('marks the active step with aria-current="step"', () => {
    render(<CheckoutStepper steps={STEPS} activeStep={1} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toHaveAttribute('aria-current');
    expect(buttons[1]).toHaveAttribute('aria-current', 'step');
    expect(buttons[2]).not.toHaveAttribute('aria-current');
  });

  it('calls onStepClick with the correct index when a completed step is clicked', async () => {
    const onStepClick = vi.fn();
    render(<CheckoutStepper steps={STEPS} activeStep={2} onStepClick={onStepClick} />);
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[0]);
    expect(onStepClick).toHaveBeenCalledWith(0);
    await userEvent.click(buttons[1]);
    expect(onStepClick).toHaveBeenCalledWith(1);
  });

  it('does not call onStepClick when the active step is clicked', async () => {
    const onStepClick = vi.fn();
    render(<CheckoutStepper steps={STEPS} activeStep={1} onStepClick={onStepClick} />);
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[1]);
    expect(onStepClick).not.toHaveBeenCalled();
  });

  it('does not call onStepClick when a future step button is clicked', async () => {
    const onStepClick = vi.fn();
    render(<CheckoutStepper steps={STEPS} activeStep={0} onStepClick={onStepClick} />);
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[2]);
    expect(onStepClick).not.toHaveBeenCalled();
  });

  it('renders n-1 connector divs for n steps', () => {
    const { container } = render(<CheckoutStepper steps={STEPS} activeStep={0} />);
    const connectors = container.querySelectorAll('.stepper-connector');
    expect(connectors).toHaveLength(2);
  });

  it('does not throw when onStepClick is not provided and a completed step is clicked', async () => {
    render(<CheckoutStepper steps={STEPS} activeStep={2} />);
    const buttons = screen.getAllByRole('button');
    await expect(userEvent.click(buttons[0])).resolves.not.toThrow();
  });
});
