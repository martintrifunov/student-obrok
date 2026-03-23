import VENDOR_MARKER_COLORS from "@/features/map/config/vendorMarkerColors";

const FALLBACK = ["Vero", "Ramstore"];

export const KNOWN_VENDOR_NAMES = Object.keys(VENDOR_MARKER_COLORS).map(
  (key) => key.charAt(0).toUpperCase() + key.slice(1),
);

const parseDefaultVisibleVendors = () => {
  const raw = import.meta.env.VITE_DEFAULT_VISIBLE_VENDORS;
  if (!raw) return FALLBACK;

  const requested = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (requested.length === 0) return FALLBACK;

  const valid = KNOWN_VENDOR_NAMES.filter((name) =>
    requested.includes(name.toLowerCase()),
  );

  return valid.length > 0 ? valid : FALLBACK;
};

export const DEFAULT_VISIBLE_VENDORS = parseDefaultVisibleVendors();
