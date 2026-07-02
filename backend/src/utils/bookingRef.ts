/** Generate a human-readable booking reference from the booking's DB id. */
export function generateBookingRef(bookingId: number): string {
  const year = new Date().getFullYear();
  const padded = String(bookingId).padStart(5, '0');
  return `VAC-${year}-${padded}`;
}
