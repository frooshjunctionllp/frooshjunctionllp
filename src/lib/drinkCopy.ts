/** Customer-facing wording; stored menu records and order history stay intact. */
export function drinkCopy(text: string): string {
  return text
    .replace(/\bthickshakes?\b/gi, (word) => {
      const label = word.toLowerCase().endsWith("s") ? "shakes" : "shake";
      return word[0] === word[0].toUpperCase() ? label[0].toUpperCase() + label.slice(1) : label;
    })
    .replace(/\bthick\s+/gi, "");
}
