const img = (seed, w = 600, h = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const initialMenu = [
  {
    id: "huevos",
    name: "Huevos Rancheros",
    blurb: "Traditional Mexican breakfast with fried eggs.",
    price: 12.5,
    status: "active", // active | draft
    image: img("huevos-hero"),
    alt: "Huevos Rancheros with fried eggs and salsa",
    description:
      "Traditional Mexican breakfast with **fried eggs**, salsa ranchera, and warm tortillas. Served with black beans and avocado.",
  },
  {
    id: "waffles",
    name: "Belgian Waffles",
    blurb: "Crispy waffles served with fresh berries.",
    price: 9.75,
    status: "draft",
    image: img("waffles-hero"),
    alt: "Belgian waffles with berries",
    description:
      "Crispy, golden Belgian waffles served with fresh berries and syrup.",
  },
  {
    id: "caddy-burger",
    name: "CaddyCall Burger",
    blurb: "Flame-grilled patty with cheddar.",
    price: 16.99,
    status: "draft",
    image: img("burger-hero"),
    alt: "Premium burger with cheddar",
    description:
      "Our signature burger with a flame-grilled patty, cheddar, and brioche bun.",
  },
  {
    id: "club-sandwich",
    name: "Club Sandwich",
    blurb: "Turkey, bacon, lettuce, tomato.",
    price: 13.5,
    status: "draft",
    image: img("club-hero"),
    alt: "Club sandwich cut in halves",
    description:
      "Classic triple-decker sandwich with turkey, bacon, lettuce, and tomato.",
  },
  {
    id: "caesar",
    name: "Caesar Salad with Chicken",
    blurb: "Romaine lettuce, parmesan & croutons.",
    price: 15.0,
    status: "draft",
    image: img("caesar-hero"),
    alt: "Chicken Caesar salad",
    description:
      "Fresh romaine lettuce, parmesan cheese, croutons, and grilled chicken.",
  },
];

// Visual assets grid (random placeholders)
export const initialAssets = [
  { id: "food-icon", label: "Food Icon", src: img("food-icon", 160, 120) },
  { id: "course-map", label: "Course Map", src: img("course-map", 160, 120) },
  { id: "promo", label: "Promo Banner", src: img("promo", 160, 120) },
  { id: "drink", label: "Drink Icon", src: img("drink", 160, 120) },
  { id: "burger", label: "Burger", src: img("burger-tile", 160, 120) },
  { id: "salad", label: "Salad", src: img("salad", 160, 120) },
  { id: "coffee", label: "Coffee", src: img("coffee", 160, 120) },
  { id: "cocktail", label: "Cocktail", src: img("cocktail", 160, 120) },
];
