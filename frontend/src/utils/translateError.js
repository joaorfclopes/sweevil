import i18next from 'i18next';

const MESSAGE_MAP = {
  'Product not Found': 'error.productNotFound',
  'This slot is already booked': 'error.slotAlreadyBooked',
  'Slot not available': 'error.slotNotAvailable',
  'No availability for this date': 'error.noAvailability',
  'Too many booking requests, please try again later.': 'error.tooManyRequests',
  'Too many payment requests, please try again later.': 'error.tooManyRequests',
  'Too many requests, please try again later.': 'error.tooManyRequests',
  'Too many upload requests, please try again later.': 'error.tooManyRequests',
  'Order already paid': 'error.orderAlreadyPaid',
  'Original price must be greater than the current price.': 'error.originalPriceValidation',
};

export function translateBackendMessage(message) {
  if (!message || typeof message !== 'string') return message;
  const key = MESSAGE_MAP[message];
  if (key) {
    return i18next.t(key);
  }
  return message;
}
