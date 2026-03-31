/**
 * Menu import template — header + example row aligned with MenuEditor.jsx
 */

export const MENU_IMPORT_COLUMN_HEADERS = [
  "Item Name",
  "Price",
  "Description",
  "Category",
  "Menu Section",
  "Image URL",
  "Image Alt Text",
  "Status",
];

export const MENU_IMPORT_EXAMPLE_ROW = [
  "Huevos Rancheros",
  "12.50",
  "Traditional breakfast with eggs, salsa, and warm tortillas.",
  "Kitchen",
  "Breakfast Delights",
  "https://placehold.co/600x400?text=Huevos+Rancheros",
  "Plate of Huevos Rancheros with salsa and cilantro garnish.",
  "active",
];

function escapeCsvField(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function getMenuImportCsvTemplate() {
  const row = MENU_IMPORT_EXAMPLE_ROW.map(escapeCsvField).join(",");
  return `${MENU_IMPORT_COLUMN_HEADERS.join(",")}\n${row}\n`;
}

export function isAllowedMenuImportFilename(name) {
  const n = String(name || "").toLowerCase();
  return n.endsWith(".csv") || n.endsWith(".xlsx") || n.endsWith(".xls");
}
