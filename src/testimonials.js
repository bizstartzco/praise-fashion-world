/*
 * Customer reviews shown in the "What customers say" section. After editing, run:
 *   node tools/build.js
 *
 * Only add REAL reviews: words a real customer actually sent you (a WhatsApp message,
 * an Instagram comment, a Facebook review). Ask their permission, and use only the
 * name they're happy to show (e.g. "Aarav S."). Inventing reviews is illegal under
 * consumer protection law and against Google's spam policies.
 *
 * quote:   their words (trim, but don't change the meaning)
 * name:    as they agreed to be named
 * place:   optional, e.g. "Kathmandu"
 * product: optional product id from src/products.js, which links the review to that product
 * rating:  optional 1-5, only if they actually gave a star rating
 * sample:  true marks a design placeholder. Delete these three once you have real reviews.
 *
 * Remove every entry and the section disappears from the site.
 */
module.exports = [
  {
    sample: true,
    quote: "A real customer's words go here: what they bought, how it fitted, and how ordering and delivery went.",
    name: "Customer name",
    place: "City"
  },
  {
    sample: true,
    quote: "Paste a short WhatsApp or Instagram message a happy customer sent you. Two or three lines read best.",
    name: "Customer name",
    place: "City",
    product: "black-leather-biker-jacket"
  },
  {
    sample: true,
    quote: "Reviews that mention a specific piece and a detail (the size, the colour, a wedding they wore it to) are the most convincing.",
    name: "Customer name",
    place: "City",
    product: "tan-brogue-oxford"
  }
];
