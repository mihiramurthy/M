/** Regional grid carbon intensity simulation + flexible-load planner. */

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
};

export function listRegions() {
  return Object.entries(REGIONS).map(([id, r]) => ({ id, name: r.name }));
}

function hourShape(hour, region) {
  // Demand index ~ residential + commercial pattern
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
  intensity = Math.max(80, intensity);
  return { demand, solar, wind, intensity };
}

export function buildForecast(regionId = "midatlantic", hours = 48, startHour = 0) {
  const region = REGIONS[regionId] || REGIONS.midatlantic;
  const series = [];
  for (let h = 0; h < hours; h++) {
    const hourOfDay = (startHour + h) % 24;
    const shape = hourShape(hourOfDay, region);
    series.push({
      t: h,
      hourOfDay,
      label: `H+${h}`,
      gCo2PerKwh: Math.round(shape.intensity),
      demandIndex: Number(shape.demand.toFixed(3)),
      solarIndex: Number(shape.solar.toFixed(3)),
      windIndex: Number(shape.wind.toFixed(3)),
    });
  }
  const avg =
    series.reduce((s, p) => s + p.gCo2PerKwh, 0) / Math.max(1, series.length);
  return {
    regionId,
    regionName: region.name,
    unit: "gCO2e/kWh",
    average: Math.round(avg),
    series,
  };
}

/**
 * Place each flexible load in the lowest-intensity contiguous window
 * that fits its duration within the horizon.
 */
export function planLoads(forecast, loads) {
  const series = forecast.series;
  const placements = [];
  let totalKwh = 0;
  let optimizedGrams = 0;
  let naiveGrams = 0;

  for (const load of loads) {
    const duration = Math.max(1, Math.round(load.hours));
    const kwh = Number(load.kwh);
    totalKwh += kwh;

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

    // Naive: start at evening peak window (hour 18) on day 0 if possible
    let naiveStart = series.findIndex((p) => p.hourOfDay === 18);
    if (naiveStart < 0 || naiveStart > series.length - duration) naiveStart = 0;
    let naiveAvg = 0;
    for (let i = 0; i < duration; i++) {
      naiveAvg += series[naiveStart + i].gCo2PerKwh;
    }
    naiveAvg /= duration;

    const optGrams = bestAvg * kwh;
    const naiGrams = naiveAvg * kwh;
    optimizedGrams += optGrams;
    naiveGrams += naiGrams;

    placements.push({
      id: load.id,
      name: load.name,
      kwh,
      durationHours: duration,
      startHourOffset: bestStart,
      endHourOffset: bestStart + duration,
      avgIntensity: Math.round(bestAvg),
      naiveAvgIntensity: Math.round(naiveAvg),
      gramsSaved: Math.round(naiGrams - optGrams),
      windowHours: series.slice(bestStart, bestStart + duration).map((p) => p.hourOfDay),
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

export const DEFAULT_LOADS = [
  { id: "ev", name: "EV charge", kwh: 24, hours: 4 },
  { id: "dryer", name: "Heat-pump dryer", kwh: 2.5, hours: 1 },
  { id: "dishwasher", name: "Dishwasher", kwh: 1.2, hours: 1 },
  { id: "water", name: "Water heater boost", kwh: 3.5, hours: 2 },
];
