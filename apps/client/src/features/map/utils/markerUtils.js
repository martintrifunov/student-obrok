import VENDOR_MARKER_COLORS from "@/features/map/config/vendorMarkerColors";

export const getClusterGradient = (cluster, supercluster) => {
  if (!cluster || !supercluster) return null;

  try {
    const leaves = supercluster.getLeaves(cluster.id, Infinity);
    const vendorCountMap = {};

    leaves.forEach((leaf) => {
      const market = leaf.properties?.market;
      if (!market) return;
      const vendorName = market.vendor?.name || market.name;
      const normalizedName = vendorName.trim().toLowerCase();
      vendorCountMap[normalizedName] =
        (vendorCountMap[normalizedName] || 0) + 1;
    });

    const vendorNames = Object.keys(vendorCountMap).sort();
    if (vendorNames.length === 0) return null;

    const vendorColors = vendorNames.map((vendorKey) => {
      return (
        Object.entries(VENDOR_MARKER_COLORS).find(([key]) =>
          vendorKey.includes(key),
        )?.[1] ?? VENDOR_MARKER_COLORS.vero
      );
    });

    if (vendorColors.length === 1) {
      return vendorColors[0];
    }

    const wrappedColors = [...vendorColors, vendorColors[0]];
    const gradientStops = wrappedColors
      .map((color, idx) => {
        const percentage = (idx / (wrappedColors.length - 1)) * 100;
        return `${color} ${percentage}%`;
      })
      .join(", ");

    return `conic-gradient(from 0deg, ${gradientStops})`;
  } catch (e) {
    return null;
  }
};

export const getVendorMarkerColor = (vendorName = "") => {
  const normalizedName = vendorName.trim().toLowerCase();

  return (
    Object.entries(VENDOR_MARKER_COLORS).find(([vendorKey]) =>
      normalizedName.includes(vendorKey),
    )?.[1] ?? VENDOR_MARKER_COLORS.vero
  );
};
