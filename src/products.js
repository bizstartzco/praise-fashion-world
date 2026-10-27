/*
 * The catalogue. One object per product. After editing, run:  node tools/build.js
 *
 * IMPORTANT: these items are a starter catalogue built on licensed stock photos
 * (Freepik). They are NOT your real stock. Replace each image with a photo of the
 * piece you actually sell, and set the real name, price and sizes before going live.
 *
 * id:          becomes the page address: products/<id>.html (lowercase, hyphens)
 * category:    Jackets, Shirts, Blazers, Outerwear or Shoes (a new name makes a new filter)
 * price:       number in rupees, or null to show "Ask for price"
 * image:       file in assets/img/ (portrait 4:5 works best)
 * description: one or two sentences shown on the product page
 * details:     short bullet points shown under the description
 * tag:         optional badge, e.g. "New" ("" for none)
 */
module.exports = [
  {
    id: "black-leather-biker-jacket",
    name: "Black Leather Biker Jacket",
    category: "Jackets",
    price: 8500,
    sizes: ["S", "M", "L", "XL"],
    image: "hero-leather.webp",
    alt: "Black leather biker jacket worn over a black turtleneck",
    description: "The jacket that makes a plain t-shirt look like a decision. Asymmetric zip, notched lapels and a cut that sits right at the waist.",
    details: ["Asymmetric front zip", "Zip pockets", "Wear open or closed"],
    tag: "New"
  },
  {
    id: "quilted-leather-jacket",
    name: "Quilted Leather Jacket",
    category: "Jackets",
    price: 7200,
    sizes: ["M", "L", "XL"],
    image: "jacket-black.webp",
    alt: "Black leather jacket with quilted shoulders over a dark shirt with blue jeans",
    description: "A cleaner take on leather with a stand collar and quilted shoulders. Easy over a shirt for work, or over a tee at the weekend.",
    details: ["Stand collar", "Quilted shoulder panels", "Straight, easy fit"],
    tag: ""
  },
  {
    id: "indigo-denim-jacket",
    name: "Indigo Denim Jacket",
    category: "Jackets",
    price: 3800,
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "denim-jacket.webp",
    alt: "Dark indigo denim jacket styled with matching jeans and boots",
    description: "Deep indigo denim that gets better the more you wear it. Layer it over a hoodie when the evenings turn cold.",
    details: ["Button front", "Two chest pockets", "Classic trucker cut"],
    tag: "New"
  },
  {
    id: "navy-coach-jacket",
    name: "Navy Coach Jacket",
    category: "Jackets",
    price: 3200,
    sizes: ["M", "L", "XL"],
    image: "navy-jacket.webp",
    alt: "Back view of a relaxed navy coach jacket",
    description: "Light, relaxed and easy to throw on. The navy goes with everything you already own.",
    details: ["Snap front", "Relaxed fit", "Lightweight"],
    tag: ""
  },
  {
    id: "heritage-check-blazer",
    name: "Heritage Check Blazer",
    category: "Blazers",
    price: 5500,
    sizes: ["38", "40", "42", "44"],
    image: "blazer-check.webp",
    alt: "Rust and brown check blazer worn over a white shirt",
    description: "Warm rust and brown check for weddings, dinners and any day you want to look like you tried. Works with chinos or dark jeans.",
    details: ["Two-button front", "Notch lapel", "Pairs with chinos or denim"],
    tag: ""
  },
  {
    id: "sage-wool-overcoat",
    name: "Sage Wool Overcoat",
    category: "Outerwear",
    price: 6500,
    sizes: ["M", "L", "XL"],
    image: "overcoat.webp",
    alt: "Long sage-green overcoat layered over a grey knit sweater",
    description: "A long coat in a soft sage. It sits over a sweater or a blazer and does the work of making winter look good.",
    details: ["Below-the-hip length", "Layers over knitwear", "Button front"],
    tag: "New"
  },
  {
    id: "sky-blue-oxford-shirt",
    name: "Sky Blue Oxford Shirt",
    category: "Shirts",
    price: 1900,
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "oxford-blue.webp",
    alt: "Folded sky blue button-down oxford shirt",
    description: "The shirt you'll reach for most. Button-down collar, soft oxford weave, smart enough for the office.",
    details: ["Button-down collar", "Chest pocket", "Regular fit"],
    tag: ""
  },
  {
    id: "blue-check-shirt",
    name: "Blue Check Shirt",
    category: "Shirts",
    price: 2100,
    sizes: ["M", "L", "XL"],
    image: "check-shirt.webp",
    alt: "Folded blue and white check shirt on a wooden surface",
    description: "Bold blue check that works tucked in with chinos or open over a white tee.",
    details: ["Button-down collar", "Regular fit", "Wear tucked or open"],
    tag: ""
  },
  {
    id: "washed-denim-shirt",
    name: "Washed Denim Shirt",
    category: "Shirts",
    price: 2400,
    sizes: ["S", "M", "L", "XL"],
    image: "denim-shirt.webp",
    alt: "Light washed denim shirt with two chest pockets",
    description: "Light-wash denim with two chest pockets. Wear it as a shirt, or open as a light jacket.",
    details: ["Two flap pockets", "Light wash", "Regular fit"],
    tag: ""
  },
  {
    id: "navy-everyday-shirt",
    name: "Navy Everyday Shirt",
    category: "Shirts",
    price: 1800,
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "navy-shirt.webp",
    alt: "Folded navy button-down shirt with a chest pocket",
    description: "Dark navy that hides a long day well. Easy under a blazer, easy on its own.",
    details: ["Button-down collar", "Chest pocket", "Regular fit"],
    tag: ""
  },
  {
    id: "tan-brogue-oxford",
    name: "Tan Brogue Oxford",
    category: "Shoes",
    price: 4800,
    sizes: ["39", "40", "41", "42", "43", "44"],
    image: "shoe-brogue.webp",
    alt: "Tan leather wingtip brogue shoe seen from the side",
    description: "A tan wingtip brogue that dresses up chinos and dresses down a suit. The shoe that finishes a blazer.",
    details: ["Wingtip brogue detailing", "Lace-up", "Pairs with chinos or tailoring"],
    tag: "New"
  },
  {
    id: "black-tassel-loafer",
    name: "Black Tassel Loafer",
    category: "Shoes",
    price: 4500,
    sizes: ["39", "40", "41", "42", "43", "44"],
    image: "shoe-loafer.webp",
    alt: "Black leather tassel loafer on a white background",
    description: "Slip-on and sharp. Wear it with trousers for an event, or with cropped jeans and no socks.",
    details: ["Slip-on", "Tassel and kiltie detail", "Smart or casual"],
    tag: ""
  },
  {
    id: "black-derby",
    name: "Black Derby Shoe",
    category: "Shoes",
    price: 3900,
    sizes: ["39", "40", "41", "42", "43", "44"],
    image: "shoe-derby.webp",
    alt: "Black lace-up derby shoes with a chunky stitched sole",
    description: "An everyday black derby on a sturdy sole. Office shoes that won't mind the walk there.",
    details: ["Lace-up derby", "Stitched chunky sole", "Office to evening"],
    tag: ""
  },
  {
    id: "white-high-top-sneaker",
    name: "White High-Top Sneaker",
    category: "Shoes",
    price: 3200,
    sizes: ["39", "40", "41", "42", "43", "44"],
    image: "shoe-hightop.webp",
    alt: "Clean white canvas high-top sneakers worn with black trousers",
    description: "Clean white high-tops with black jeans, a bomber or a denim jacket. Simple and easy to style.",
    details: ["High-top", "Lace-up", "Clean white upper"],
    tag: ""
  },
  {
    id: "white-low-sneaker",
    name: "White Low Sneaker",
    category: "Shoes",
    price: 2900,
    sizes: ["39", "40", "41", "42", "43", "44"],
    image: "shoe-sneaker.webp",
    alt: "Minimal white low-top sneakers worn with white socks",
    description: "The minimal white sneaker. Goes with shorts, chinos, jeans and most of this shop.",
    details: ["Low-top", "Minimal design", "Everyday wear"],
    tag: ""
  },
  {
    id: "tan-lace-up-boot",
    name: "Tan Lace-Up Boot",
    category: "Shoes",
    price: 5200,
    sizes: ["40", "41", "42", "43", "44"],
    image: "shoe-boot.webp",
    alt: "Tan leather lace-up ankle boot with a black lug sole",
    description: "A tan ankle boot with a lug sole for cold mornings and uneven streets.",
    details: ["Ankle height", "Lug sole", "Speed-hook lacing"],
    tag: ""
  },
  {
    id: "brown-work-boot",
    name: "Brown Work Boot",
    category: "Shoes",
    price: 5800,
    sizes: ["40", "41", "42", "43", "44"],
    image: "shoe-workboot.webp",
    alt: "Reddish-brown leather work boots worn with cuffed blue jeans",
    description: "Reddish-brown leather with a moc toe. Best with cuffed jeans, and it looks better with age.",
    details: ["Moc toe", "Lace-up", "Wear with cuffed denim"],
    tag: "New"
  }
];
