// import cron from "node-cron";
// import HourlyData from "../models/HourlyData.js";
// import MinuteData from "../models/MinuteData.js";

// export default function hourlyCron() {
//   console.log("⏳ Hourly Cron Registered...");

//   cron.schedule("0 * * * *", async () => {
//     console.log("🚀 Running Hourly Aggregation Cron...");

//     try {
//       // CURRENT hour (floored)
//       const now = new Date();
//       const thisHour = new Date(now.setMinutes(0, 0, 0));   // 10:00:00
//       const lastHour = new Date(thisHour.getTime() - 60 * 60 * 1000); // 09:00 → 10:00

//       // Fetch only minutes inside last hour
//       const minutes = await MinuteData.find({
//         timestamp: { $gte: lastHour, $lt: thisHour },
//       }).sort({ timestamp: 1 });

//       if (minutes.length === 0) {
//         console.log("⚠ No minute data for this hour.");
//         return;
//       }

//       const avg = (x) => (x.length ? x.reduce((a, b) => a + b, 0) / x.length : 0);
//       const min = (x) => (x.length ? Math.min(...x) : 0);
//       const max = (x) => (x.length ? Math.max(...x) : 0);

//       const temps = minutes.map((m) => m.temperature.avg);
//       const hums = minutes.map((m) => m.humidity.avg);
//       const moist = minutes.map((m) => m.moisture.avg);
//       const lights = minutes.map((m) => m.light.avg);

//       const motionCount = minutes.reduce(
//         (sum, m) => sum + (m.motion?.count || 0),
//         0
//       );

//       const pumpOn = minutes.reduce(
//         (sum, m) => sum + (m.pump?.onTime || 0),
//         0
//       );

//       const summary = new HourlyData({
//         timestamp: thisHour, // IMPORTANT FIX
//         temperature: { avg: avg(temps), min: min(temps), max: max(temps) },
//         humidity: { avg: avg(hums), min: min(hums), max: max(hums) },
//         moisture: { avg: avg(moist), min: min(moist), max: max(moist) },
//         light: { avg: avg(lights), min: min(lights), max: max(lights) },

//         motion: { count: motionCount },
//         pump: { onTime: pumpOn },

//         emotion: "neutral",
//       });

//       await summary.save();
//       console.log("✅ Saved Hourly Summary from MinuteData");

//       // ⛔ Delete any hours older than 48 hours
//       const oldCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
//       await HourlyData.deleteMany({ timestamp: { $lt: oldCutoff } });

//       console.log("🧹 Cleaned hourly data older than 48 hours");
//     } catch (err) {
//       console.error("❌ hourlyCron Error:", err.message);
//     }
//   });
// }


import cron from "node-cron";
import HourlyData from "../models/HourlyData.js";
import MinuteData from "../models/MinuteData.js";

export default function hourlyCron() {
  console.log("⏳ Hourly Cron Registered...");

  cron.schedule("0 * * * *", async () => {
    console.log("🚀 Running Hourly Aggregation Cron...");

    try {
      // USE LAST 60 MINUTES ALWAYS — FIXES TIMEZONE ISSUES
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      let minutes = await MinuteData.find({
        timestamp: { $gte: oneHourAgo, $lte: now },
      }).sort({ timestamp: 1 });

      if (minutes.length === 0) {
        console.log("⚠ No minute data found for last 60 minutes.");
        return;
      }

      const avg = (x) =>
        x.length ? x.reduce((a, b) => a + b, 0) / x.length : 0;
      const min = (x) => (x.length ? Math.min(...x) : 0);
      const max = (x) => (x.length ? Math.max(...x) : 0);

      const temps = minutes.map((m) => m.temperature?.avg ?? m.temperature ?? 0);
      const hums = minutes.map((m) => m.humidity?.avg ?? m.humidity ?? 0);
      const moist = minutes.map((m) => m.moisture?.avg ?? m.moisture ?? 0);
      const lights = minutes.map((m) => m.light?.avg ?? m.light ?? 0);

      const motionCount = minutes.reduce(
        (sum, m) => sum + (m.motion?.count ?? m.motion ?? 0),
        0
      );

      const pumpOn = minutes.reduce(
        (sum, m) => sum + (m.pump?.onTime ?? m.pump ?? 0),
        0
      );

      const summary = new HourlyData({
        timestamp: new Date(),
        temperature: { avg: avg(temps), min: min(temps), max: max(temps) },
        humidity: { avg: avg(hums), min: min(hums), max: max(hums) },
        moisture: { avg: avg(moist), min: min(moist), max: max(moist) },
        light: { avg: avg(lights), min: min(lights), max: max(lights) },
        motion: { count: motionCount },
        pump: { onTime: pumpOn },
        emotion: "neutral",
      });

      await summary.save();
      console.log("✅ HOURLY SUMMARY SAVED");

      // cleanup
      const oldCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
      await HourlyData.deleteMany({ timestamp: { $lt: oldCutoff } });

      console.log("🧹 Old hourly data cleaned");

    } catch (err) {
      console.error("❌ hourlyCron Error:", err);
    }
  });
}
