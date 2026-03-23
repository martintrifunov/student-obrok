import MARKER_COLORS from "@/features/map/config/markerColors";

export const getClusterGradient = (cluster, supercluster) => {
  if (!cluster || !supercluster) return null;

  try {
    const leaves = supercluster.getLeaves(cluster.id, Infinity);
    const chainCountMap = {};

    leaves.forEach((leaf) => {
      const market = leaf.properties?.market;
      if (!market) return;
      const chainName = market.chain?.name || market.name;
      const normalizedName = chainName.trim().toLowerCase();
      chainCountMap[normalizedName] =
        (chainCountMap[normalizedName] || 0) + 1;
    });

    const chainNames = Object.keys(chainCountMap).sort();
    if (chainNames.length === 0) return null;

    const chainColors = chainNames.map((chainKey) => {
      return (
        Object.entries(MARKER_COLORS).find(([key]) =>
          chainKey.includes(key),
        )?.[1] ?? MARKER_COLORS.vero
      );
    });

    if (chainColors.length === 1) {
      return chainColors[0];
    }

    const wrappedColors = [...chainColors, chainColors[0]];
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

export const getMarkerColor = (chainName = "") => {
  const normalizedName = chainName.trim().toLowerCase();

  return (
    Object.entries(MARKER_COLORS).find(([chainKey]) =>
      normalizedName.includes(chainKey),
    )?.[1] ?? MARKER_COLORS.vero
  );
};
