// FILE: src/cron/monthlyCron.js

import cron from "node-cron";
import DailyData from "../models/DailyData.js";
import MonthlyData from "../models/MonthlyData.js";

export default function monthlyCron() {
  console.log("📆 Monthly Cron Registered (runs 00:00 on day 1)");

  // Run on the 1st day of every month at midnight
  cron.schedule("0 0 1 * *", async () => {
    console.log("🚀 Running Monthly Aggregation Cron...");

    try {
      const now = new Date();

      // Current month and year
      const year = now.getFullYear();
      const month = now.getMonth(); // 0–11

      // Start of the month we just completed
      const monthStart = new Date(year, month - 1, 1); 
      const monthEnd = new Date(year, month, 1);

      // Edge case: if month = January, fix year and previous month
      if (month === 0) {
        monthStart.setFullYear(year - 1);
        monthStart.setMonth(11); // December
      }

      console.log(`📅 Aggregating month: ${monthStart.toISOString()}`);


      // Fetch all daily documents from that month
      const daily = await DailyData.find({
        date: { $gte: monthStart, $lt: monthEnd },
      });

      if (daily.length === 0) {
        console.log("⚠ No daily data found for last month.");
        return;
      }

      // Safe aggregation helpers
      const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
      const min = (arr) => (arr.length ? Math.min(...arr) : 0);
      const max = (arr) => (arr.length ? Math.max(...arr) : 0);

      // Collect arrays for each metric
      const tempAvgArr = daily.map(d => d.temperature.avg ?? 0);
      const tempMinArr = daily.map(d => d.temperature.min ?? 0);
      const tempMaxArr = daily.map(d => d.temperature.max ?? 0);

      const humAvgArr = daily.map(d => d.humidity.avg ?? 0);
      const humMinArr = daily.map(d => d.humidity.min ?? 0);
      const humMaxArr = daily.map(d => d.humidity.max ?? 0);

      const moistAvgArr = daily.map(d => d.moisture.avg ?? 0);
      const moistMinArr = daily.map(d => d.moisture.min ?? 0);
      const moistMaxArr = daily.map(d => d.moisture.max ?? 0);

      const lightAvgArr = daily.map(d => d.light.avg ?? 0);
      const lightMinArr = daily.map(d => d.light.min ?? 0);
      const lightMaxArr = daily.map(d => d.light.max ?? 0);

      const totalMotion = daily.reduce((sum, d) => sum + (d.motion?.total || 0), 0);
      const totalPumpOn = daily.reduce((sum, d) => sum + (d.pump?.onTime || 0), 0);

      const emotion = "neutral"; // Future ML upgrade

      const summary = {
        month: `${monthStart.getFullYear()}-${(monthStart.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`, // "2025-02"

        temperature: {
          avg: avg(tempAvgArr),
          min: min(tempMinArr),
          max: max(tempMaxArr),
        },
        humidity: {
          avg: avg(humAvgArr),
          min: min(humMinArr),
          max: max(humMaxArr),
        },
        moisture: {
          avg: avg(moistAvgArr),
          min: min(moistMinArr),
          max: max(moistMaxArr),
        },
        light: {
          avg: avg(lightAvgArr),
          min: min(lightMinArr),
          max: max(lightMaxArr),
        },

        motion: { total: totalMotion },
        pump: { onTime: totalPumpOn },
        emotion: { dominant: emotion },
      };

      // Remove old summary (avoid duplicates)
      await MonthlyData.deleteOne({ month: summary.month });

      // Save monthly summary
      const saved = await MonthlyData.create(summary);
      console.log("✅ Saved Monthly Summary:", saved._id);

      // Cleanup: remove monthly data older than 3 years
      const cutoff = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
      await MonthlyData.deleteMany({
        month: { $lt: `${cutoff.getFullYear()}-01` },
      });

      console.log("🧹 Cleaned monthly data older than 3 years");

    } catch (err) {
      console.error("❌ Monthly Cron Error:", err.message);
    }
  });
}
