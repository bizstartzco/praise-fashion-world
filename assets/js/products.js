/*
 * The catalogue. One object per product.
 *
 * IMPORTANT: these 10 items are a starter catalogue built on licensed stock
 * photos (Freepik). They are NOT your real stock. Replace each image with a
 * photo of the piece you actually sell, and set the real name and price,
 * before the site goes live.
 *
 * image: file in assets/img/  (portrait 4:5 or square both work)
 * price: number in rupees, or null to show "Ask for price"
 * tag:   optional badge, e.g. "New" or "Best seller" (leave "" for none)
 */
window.PFW_PRODUCTS = [
  {
    id: "leather-coat",
    name: "Black Leather Biker Jacket",
    category: "Jackets",
    price: 8500,
    sizes: ["S", "M", "L", "XL"],
    image: "assets/img/hero-leather.webp",
    alt: "Black leather biker jacket worn over a black turtleneck",
    tag: "New"
  },
  {
    id: "biker-jacket",
    name: "Quilted Leather Jacket",
    category: "Jackets",
    price: 7200,
    sizes: ["M", "L", "XL"],
    image: "assets/img/jacket-black.webp",
    alt: "Black leather jacket with quilted shoulders over a dark shirt with blue jeans",
    tag: ""
  },
  {
    id: "denim-trucker",
    name: "Indigo Denim Jacket",
    category: "Jackets",
    price: 3800,
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "assets/img/denim-jacket.webp",
    alt: "Dark indigo denim jacket styled with matching jeans and boots",
    tag: "New"
  },
  {
    id: "navy-coach",
    name: "Navy Coach Jacket",
    category: "Jackets",
    price: 3200,
    sizes: ["M", "L", "XL"],
    image: "assets/img/navy-jacket.webp",
    alt: "Back view of a relaxed navy coach jacket",
    tag: ""
  },
  {
    id: "check-blazer",
    name: "Heritage Check Blazer",
    category: "Blazers",
    price: 5500,
    sizes: ["38", "40", "42", "44"],
    image: "assets/img/blazer-check.webp",
    alt: "Rust and brown check blazer worn over a white shirt",
    tag: ""
  },
  {
    id: "wool-overcoat",
    name: "Sage Wool Overcoat",
    category: "Outerwear",
    price: 6500,
    sizes: ["M", "L", "XL"],
    image: "assets/img/overcoat.webp",
    alt: "Long sage-green overcoat layered over a grey knit sweater",
    tag: "New"
  },
  {
    id: "oxford-blue",
    name: "Sky Blue Oxford Shirt",
    category: "Shirts",
    price: 1900,
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "assets/img/oxford-blue.webp",
    alt: "Folded sky blue button-down oxford shirt",
    tag: ""
  },
  {
    id: "check-shirt",
    name: "Blue Check Shirt",
    category: "Shirts",
    price: 2100,
    sizes: ["M", "L", "XL"],
    image: "assets/img/check-shirt.webp",
    alt: "Folded blue and white check shirt on a wooden surface",
    tag: ""
  },
  {
    id: "denim-shirt",
    name: "Washed Denim Shirt",
    category: "Shirts",
    price: 2400,
    sizes: ["S", "M", "L", "XL"],
    image: "assets/img/denim-shirt.webp",
    alt: "Light washed denim shirt with two chest pockets",
    tag: ""
  },
  {
    id: "navy-shirt",
    name: "Navy Everyday Shirt",
    category: "Shirts",
    price: 1800,
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "assets/img/navy-shirt.webp",
    alt: "Folded navy button-down shirt with a chest pocket",
    tag: ""
  }
];
