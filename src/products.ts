// src/products.ts
export type Material =
  | "PLA" | "PETG" | "ABS" | "ASA" | "TPU" | "PC" | "PA" | "PVA"
  | "PETG-CF" | "PLA-CF" | "PA-CF" | "ASA-CF"; // abrasive flags

export interface Product {
  brand: string;
  material: Material;
  product: string;
  url: string;
  weightKg: number; // e.g., 1.0, 0.75, etc.
  abrasive?: boolean; // set true for CF/GF/glow/etc.
}

export const PRODUCTS: Product[] = [
  // --- Bambu Lab (official US store) ---
  { brand: "Bambu Lab", material: "PLA", product: "PLA Basic", url: "https://us.store.bambulab.com/products/pla-basic", weightKg: 1.0 },
  { brand: "Bambu Lab", material: "PETG", product: "PETG HF", url: "https://us.store.bambulab.com/products/petg-hf", weightKg: 1.0 },
  { brand: "Bambu Lab", material: "ABS", product: "ABS", url: "https://us.store.bambulab.com/products/abs-filament", weightKg: 1.0 },
  { brand: "Bambu Lab", material: "ASA", product: "ASA", url: "https://us.store.bambulab.com/products/asa-filament", weightKg: 1.0 },
  { brand: "Bambu Lab", material: "TPU", product: "TPU 95A HF", url: "https://us.store.bambulab.com/products/tpu-95a-hf", weightKg: 1.0 },
  { brand: "Bambu Lab", material: "PC", product: "PC Basic", url: "https://us.store.bambulab.com/products/pc-filament", weightKg: 1.0 },
  { brand: "Bambu Lab", material: "PVA", product: "PVA (Support)", url: "https://us.store.bambulab.com/products/pva", weightKg: 0.5 },
  // Abrasive options (require hardened nozzle/extruder)
  { brand: "Bambu Lab", material: "PETG-CF", product: "PETG-CF", url: "https://us.store.bambulab.com/products/petg-cf", weightKg: 1.0, abrasive: true },
  { brand: "Bambu Lab", material: "PA-CF", product: "PA6-CF", url: "https://us.store.bambulab.com/products/pa6-cf", weightKg: 1.0, abrasive: true },

  // --- Polymaker (official US) ---
  { brand: "Polymaker", material: "PLA", product: "PolyLite PLA", url: "https://us.polymaker.com/products/polylite-pla", weightKg: 1.0 },
  { brand: "Polymaker", material: "PETG", product: "PolyLite PETG", url: "https://us.polymaker.com/products/polylite-translucent-petg", weightKg: 1.0 },
  { brand: "Polymaker", material: "ABS", product: "PolyLite ABS", url: "https://us.polymaker.com/products/polylite-abs", weightKg: 1.0 },
  { brand: "Polymaker", material: "ASA", product: "PolyLite ASA", url: "https://us.polymaker.com/products/polylite-asa", weightKg: 1.0 },
  { brand: "Polymaker", material: "TPU", product: "PolyFlex TPU95-HF", url: "https://us.polymaker.com/products/polyflex-tpu95-hf", weightKg: 1.0 },
  { brand: "Polymaker", material: "PC", product: "PolyLite PC", url: "https://us.polymaker.com/products/polylite-pc", weightKg: 1.0 },
  { brand: "Polymaker", material: "PA", product: "PolyMide CoPA (0.75kg)", url: "https://us.polymaker.com/products/polymide-copa", weightKg: 0.75 },

  // --- MatterHackers (house brand) ---
  { brand: "MatterHackers", material: "PLA", product: "MH Build Series PLA", url: "https://www.matterhackers.com/store/3d-printer-filament/175mm-pla-filament-black-1-kg", weightKg: 1.0 },
  { brand: "MatterHackers", material: "PETG", product: "MH Build Series PETG", url: "https://www.matterhackers.com/store/c/mh-build-series-petg", weightKg: 1.0 },
  { brand: "MatterHackers", material: "ABS", product: "MH Build Series ABS", url: "https://www.matterhackers.com/store/c/mh-build-series-abs", weightKg: 1.0 },
  { brand: "MatterHackers", material: "ASA", product: "MH Build Series ASA", url: "https://www.matterhackers.com/store/c/mh-build-series-asa", weightKg: 1.0 },
  { brand: "MatterHackers", material: "TPU", product: "MH Build Series TPU", url: "https://www.matterhackers.com/store/c/mh-build-series-tpu", weightKg: 1.0 },
  { brand: "MatterHackers", material: "PA", product: "MH Build Series Nylon", url: "https://www.matterhackers.com/store/c/mh-build-series-nylon", weightKg: 1.0 },

  // --- SUNLU (official) ---
  { brand: "SUNLU", material: "PLA", product: "PLA 1kg", url: "https://www.sunlu.com/collections/all-products", weightKg: 1.0 },
  { brand: "SUNLU", material: "PETG", product: "PETG 1kg", url: "https://www.sunlu.com/collections/petg", weightKg: 1.0 },
  { brand: "SUNLU", material: "ABS", product: "ABS 1kg", url: "https://www.sunlu.com/collections/abs", weightKg: 1.0 },
  { brand: "SUNLU", material: "ASA", product: "ASA 1kg", url: "https://www.sunlu.com/products/sunlu-asa-filament-1-75mm", weightKg: 1.0 },
  { brand: "SUNLU", material: "TPU", product: "TPU 1kg", url: "https://www.sunlu.com/collections/filaments/products/sunlu-tpu-filament-1-75mm", weightKg: 1.0 },
];
