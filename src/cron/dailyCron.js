import cron from "node-cron";
import HourlyData from "../models/HourlyData.js";
import DailyData from "../models/DailyData.js";

export default function dailyCron() {
  console.log("📅 Daily Cron Registered (runs every midnight)");

  // Runs every day at 00:00 (server local time)
  cron.schedule("0 0 * * *", async () => {
    console.log("\n🚀 Running Daily Aggregation Cron...");

    try {
      const now = new Date();

      // Today 00:00
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0, 0, 0, 0
      );

      // Yesterday 00:00
      const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayEnd = todayStart;

      console.log("📊 Aggregate Range:", yesterdayStart.toISOString(), "→", yesterdayEnd.toISOString());

      // Get yesterday hourly docs
      const hourly = await HourlyData.find({
        timestamp: { $gte: yesterdayStart, $lt: yesterdayEnd }
      }).sort({ timestamp: 1 });

      if (hourly.length === 0) {
        console.log("⚠ No hourly data found — skipping.");
        return;
      }

      const avg = arr => arr.length ? arr.reduce((a,b) => a+b, 0) / arr.length : 0;
      const min = arr => arr.length ? Math.min(...arr) : 0;
      const max = arr => arr.length ? Math.max(...arr) : 0;

      // Extract arrays
      const tAvg = hourly.map(h => h.temperature?.avg ?? 0);
      const tMin = hourly.map(h => h.temperature?.min ?? 0);
      const tMax = hourly.map(h => h.temperature?.max ?? 0);

      const hAvg = hourly.map(h => h.humidity?.avg ?? 0);
      const hMin = hourly.map(h => h.humidity?.min ?? 0);
      const hMax = hourly.map(h => h.humidity?.max ?? 0);

      const mAvg = hourly.map(h => h.moisture?.avg ?? 0);
      const mMin = hourly.map(h => h.moisture?.min ?? 0);
      const mMax = hourly.map(h => h.moisture?.max ?? 0);

      const lAvg = hourly.map(h => h.light?.avg ?? 0);
      const lMin = hourly.map(h => h.light?.min ?? 0);
      const lMax = hourly.map(h => h.light?.max ?? 0);

      const motionTotal = hourly.reduce((sum, h) => sum + (h.motion?.count ?? 0), 0);
      const pumpTotal   = hourly.reduce((sum, h) => sum + (h.pump?.onTime ?? 0), 0);

      // Avoid duplicate summary for same day
      await DailyData.deleteOne({ date: yesterdayStart });

      const saved = await DailyData.create({
        date: yesterdayStart,
        temperature: { avg: avg(tAvg), min: min(tMin), max: max(tMax) },
        humidity:    { avg: avg(hAvg), min: min(hMin), max: max(hMax) },
        moisture:    { avg: avg(mAvg), min: min(mMin), max: max(mMax) },
        light:       { avg: avg(lAvg), min: min(lMin), max: max(lMax) },
        motion:      { total: motionTotal },
        pump:        { onTime: pumpTotal },
        emotion:     { dominant: "neutral" }
      });

      console.log("✅ DAILY SUMMARY SAVED →", saved._id);

      // Cleanup older than 1 year
      const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      await DailyData.deleteMany({ date: { $lt: cutoff } });

      console.log("🧹 Cleaned old daily records.");
    }
    catch (err) {
      console.error("❌ Daily Cron Error:", err);
    }
  });
}
