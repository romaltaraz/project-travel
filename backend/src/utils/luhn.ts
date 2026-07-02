/** Standard Luhn algorithm to validate a card number string (digits only). */
export function luhnCheck(cardNumber: string): boolean {
  const num = cardNumber.replace(/\s|-/g, '');
  if (!/^\d{13,19}$/.test(num)) return false;

  let sum = 0;
  let isEven = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

/** Returns true if expiry (MM/YY) is not in the past. */
export function validateExpiry(expiry: string): boolean {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const cardExpiry = new Date(year, month - 1, 1);
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return cardExpiry >= currentMonth;
}

/** Returns true if CVV is 3 or 4 digits. */
export function validateCvv(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}
