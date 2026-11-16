/** Build a wa.me link with a pre-filled message. */
export function waLink(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
