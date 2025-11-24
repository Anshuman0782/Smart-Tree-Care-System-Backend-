// src/utils/calculateAvg.js

export function calculateAggregateFromArray(items) {
  if (!items || items.length === 0) {
    return {
      avgTemperature: null, minTemperature: null, maxTemperature: null,
      avgHumidity: null, avgSoil: null, avgLight: null,
      pumpOnCount: 0, motionCount: 0, emotionCounts: {}
    };
  }

  let tSum = 0, hSum = 0, sSum = 0, lSum = 0;
  let tMin = Infinity, tMax = -Infinity;
  let hMin = Infinity, hMax = -Infinity;
  let sMin = Infinity, sMax = -Infinity;
  let lMin = Infinity, lMax = -Infinity;
  let pumpOnCount = 0, motionCount = 0;
  const emotionCounts = {};
  let count = 0;

  for (const it of items) {
    if (typeof it.temperature === "number") { tSum += it.temperature; tMin = Math.min(tMin, it.temperature); tMax = Math.max(tMax, it.temperature); }
    if (typeof it.humidity === "number") { hSum += it.humidity; hMin = Math.min(hMin, it.humidity); hMax = Math.max(hMax, it.humidity); }
    if (typeof it.moisture === "number") { sSum += it.moisture; sMin = Math.min(sMin, it.moisture); sMax = Math.max(sMax, it.moisture); }
    if (typeof it.light === "number") { lSum += it.light; lMin = Math.min(lMin, it.light); lMax = Math.max(lMax, it.light); }
    if (it.pump) pumpOnCount++;
    if (it.motion) motionCount++;
    if (it.emotion) emotionCounts[it.emotion] = (emotionCounts[it.emotion] || 0) + 1;
    count++;
  }

  return {
    avgTemperature: count ? tSum / count : null,
    minTemperature: isFinite(tMin) ? tMin : null,
    maxTemperature: isFinite(tMax) ? tMax : null,
    avgHumidity: count ? hSum / count : null,
    avgSoil: count ? sSum / count : null,
    avgLight: count ? lSum / count : null,
    pumpOnCount, motionCount, emotionCounts
  };
}

export function mostCommonEmotion(emotionCounts) {
  let best = null, bestCount = 0;
  for (const [k, v] of Object.entries(emotionCounts || {})) {
    if (v > bestCount) { best = k; bestCount = v; }
  }
  return best;
}
