const REGIONS = {
  midatlantic: {
    name: "Mid-Atlantic",
    baseloadGCo2: 380,
    peakBoost: 160,
    solarDepth: 140,
    windDepth: 70,
    nightCoalBump: 40,
  },
  pacific: {
    name: "Pacific Coast",
    baseloadGCo2: 220,
    peakBoost: 90,
    solarDepth: 180,
    windDepth: 100,
    nightCoalBump: 15,
  },
  plains: {
    name: "Central Plains",
    baseloadGCo2: 450,
    peakBoost: 120,
    solarDepth: 100,
    windDepth: 160,
    nightCoalBump: 50,
  },
} as const;

export type RegionId = keyof typeof REGIONS;

function hourShape(hour: number, region: (typeof REGIONS)[RegionId]) {
  const demand =
    0.72 +
    0.18 * Math.sin(((hour - 8) / 24) * Math.PI * 2) +
    0.12 * Math.sin(((hour - 18) / 24) * Math.PI * 2);
  const solar = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI)) ** 1.4;
  const wind = 0.45 + 0.35 * Math.sin(((hour + 3) / 24) * Math.PI * 2);
  let intensity =
    region.baseloadGCo2 +
    region.peakBoost * Math.max(0, demand - 0.85) -
    region.solarDepth * solar -
    region.windDepth * wind * 0.55;
  if (hour < 5 || hour > 22) intensity += region.nightCoalBump * 0.35;
  return { demand, solar, wind, intensity: Math.max(80, intensity) };
}

export function buildForecast(regionId: RegionId = "midatlantic", hours = 48) {
  const region = REGIONS[regionId] || REGIONS.midatlantic;
  const series = Array.from({ length: hours }, (_, h) => {
    const hourOfDay = h % 24;
    const shape = hourShape(hourOfDay, region);
    return {
      t: h,
      hourOfDay,
      gCo2PerKwh: Math.round(shape.intensity),
      demandIndex: Number(shape.demand.toFixed(3)),
    };
  });
  const average = Math.round(
    series.reduce((s, p) => s + p.gCo2PerKwh, 0) / series.length
  );
  return { regionId, regionName: region.name, average, series };
}

export const DEFAULT_LOADS = [
  { id: "ev", name: "EV charge", kwh: 24, hours: 4 },
  { id: "dryer", name: "Heat-pump dryer", kwh: 2.5, hours: 1 },
  { id: "dishwasher", name: "Dishwasher", kwh: 1.2, hours: 1 },
  { id: "water", name: "Water heater boost", kwh: 3.5, hours: 2 },
];

export function planLoads(
  forecast: ReturnType<typeof buildForecast>,
  loads = DEFAULT_LOADS
) {
  const series = forecast.series;
  const placements = [];
  let optimizedGrams = 0;
  let naiveGrams = 0;
  let totalKwh = 0;

  for (const load of loads) {
    const duration = Math.max(1, Math.round(load.hours));
    totalKwh += load.kwh;
    let bestStart = 0;
    let bestAvg = Infinity;
    for (let start = 0; start <= series.length - duration; start++) {
      let sum = 0;
      for (let i = 0; i < duration; i++) sum += series[start + i].gCo2PerKwh;
      const avg = sum / duration;
      if (avg < bestAvg) {
        bestAvg = avg;
        bestStart = start;
      }
    }
    let naiveStart = series.findIndex((p) => p.hourOfDay === 18);
    if (naiveStart < 0 || naiveStart > series.length - duration) naiveStart = 0;
    let naiveAvg = 0;
    for (let i = 0; i < duration; i++) naiveAvg += series[naiveStart + i].gCo2PerKwh;
    naiveAvg /= duration;
    optimizedGrams += bestAvg * load.kwh;
    naiveGrams += naiveAvg * load.kwh;
    placements.push({
      id: load.id,
      name: load.name,
      kwh: load.kwh,
      durationHours: duration,
      startHourOffset: bestStart,
      endHourOffset: bestStart + duration,
      avgIntensity: Math.round(bestAvg),
      naiveAvgIntensity: Math.round(naiveAvg),
      gramsSaved: Math.round(naiveAvg * load.kwh - bestAvg * load.kwh),
    });
  }

  return {
    placements,
    totals: {
      kwh: totalKwh,
      optimizedKg: Number((optimizedGrams / 1000).toFixed(2)),
      naiveKg: Number((naiveGrams / 1000).toFixed(2)),
      savedKg: Number(((naiveGrams - optimizedGrams) / 1000).toFixed(2)),
    },
  };
}

export const regionOptions = Object.entries(REGIONS).map(([id, r]) => ({
  id: id as RegionId,
  name: r.name,
}));
