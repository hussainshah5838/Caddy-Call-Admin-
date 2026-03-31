export const PRO_SHOP_IMPORT_HEADERS = [
  "Item Name",
  "Price",
  "Description",
  "Category",
  "Image URL",
  "Image Alt Text",
  "Status",
];

export const PRO_SHOP_IMPORT_EXAMPLE_ROW = [
  "Classic Green Polo",
  "26",
  "A breathable cotton polo shirt designed for comfort during long golf rounds.",
  "Shirt",
  "https://placehold.co/600x400?text=Pro+Shop+Item",
  "Golfer wearing a classic green polo shirt on the golf course.",
  "active",
];

function escapeCsvField(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function getProShopImportCsvTemplate() {
  const row = PRO_SHOP_IMPORT_EXAMPLE_ROW.map(escapeCsvField).join(",");
  return `${PRO_SHOP_IMPORT_HEADERS.join(",")}\n${row}\n`;
}
