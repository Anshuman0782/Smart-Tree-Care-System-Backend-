// import HourlyData from "../models/HourlyData.js";
// import DailyData from "../models/DailyData.js";
// import MonthlyData from "../models/MonthlyData.js";
// import MinuteData from "../models/MinuteData.js";

// // ===============================
// //  TODAY → MINUTE-LEVEL DATA (1-min resolution)
// // ===============================
// export const getToday = async (req, res) => {
//   try {
//     const now = new Date();

//     // We keep 24 hours of minute data max
//     const last24 = new Date(now.getTime() - 24 * 60 * 60 * 1000);

//     const data = await MinuteData.find({
//       timestamp: { $gte: last24, $lte: now }
//     }).sort({ timestamp: 1 });

//     res.json({ success: true, data });
//   } catch (err) {
//     res.status(500).json({ success: false, msg: err.message });
//   }
// };


// // ===============================
// //  WEEK → PAST 7 DAYS (Daily Data)
// // ===============================
// export const getWeek = async (req, res) => {
//   try {
//     const now = new Date();
//     const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

//     const data = await DailyData.find({
//       date: { $gte: weekAgo, $lte: now }
//     }).sort({ date: 1 });

//     res.json({ success: true, data });
//   } catch (err) {
//     res.status(500).json({ success: false, msg: err.message });
//   }
// };

// // ===============================
// //  MONTH → PAST 30 DAYS (Daily Data)
// // ===============================
// export const getMonth = async (req, res) => {
//   try {
//     const now = new Date();
//     const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

//     const data = await DailyData.find({
//       date: { $gte: monthAgo, $lte: now }
//     }).sort({ date: 1 });

//     res.json({ success: true, data });
//   } catch (err) {
//     res.status(500).json({ success: false, msg: err.message });
//   }
// };

// // ===============================
// //  YEAR → MONTHLY DATA (12 records)
// // ===============================
// export const getYear = async (req, res) => {
//   try {
//     const year = new Date().getFullYear();

//     const prefix = `${year}-`; // e.g. "2025-"

//     const data = await MonthlyData.find({
//       month: { $regex: "^" + prefix }
//     }).sort({
//       month: 1
//     });

//     res.json({ success: true, data });
//   } catch (err) {
//     res.status(500).json({ success: false, msg: err.message });
//   }
// };

// // ===============================
// //  CALENDAR HEATMAP (DAILY DATA)
// // ===============================
// export const getCalendar = async (req, res) => {
//   try {
//     const year = parseInt(req.params.year);
//     const month = parseInt(req.params.month); // 1–12

//     if (!year || !month)
//       return res.status(400).json({ success: false, msg: "Invalid date" });

//     const start = new Date(year, month - 1, 1);       // start of month
//     const end = new Date(year, month, 1);             // next month start

//     const data = await DailyData.find({
//       date: { $gte: start, $lt: end }
//     }).sort({ date: 1 });

//     // ===============================
//     // Health score (simple version)
//     // Later we plug ML here
//     // ===============================
//     const calculateHealth = (d) => {
//       let score = 100;

//       // Temperature penalty
//       if (d.temperature.avg > 35) score -= 20;
//       if (d.temperature.avg < 10) score -= 20;

//       // Moisture penalty
//       if (d.moisture.avg < 30) score -= 25;
//       if (d.moisture.avg > 90) score -= 10;

//       // Light penalty
//       if (d.light.avg < 20) score -= 15;

//       // Motion (animals) penalty
//       if (d.motion.total > 10) score -= 10;

//       // Pump unusual behavior
//       if (d.pump.onTime > 1800) score -= 10; // more than 30 mins

//       if (score < 0) score = 0;
//       if (score > 100) score = 100;

//       return score;
//     };

//     // Convert to heatmap format
//     const days = data.map((d) => {
//       const healthScore = calculateHealth(d);

//       let color = "green";
//       if (healthScore < 40) color = "red";
//       else if (healthScore < 70) color = "yellow";

//       return {
//         date: d.date,
//         temperature: d.temperature,
//         moisture: d.moisture,
//         humidity: d.humidity,
//         light: d.light,
//         motion: d.motion,
//         pump: d.pump,
//         emotion: d.emotion?.dominant || "neutral",
//         healthScore,
//         color
//       };
//     });

//     res.json({ success: true, days });

//   } catch (err) {
//     res.status(500).json({ success: false, msg: err.message });
//   }
// };


// FILE: src/controllers/history.controller.js

import HourlyData from "../models/HourlyData.js";
import DailyData from "../models/DailyData.js";
import MonthlyData from "../models/MonthlyData.js";
import MinuteData from "../models/MinuteData.js";

/* ============================================================
   TODAY → last 12 hours of minute data
   ============================================================ */
export const getToday = async (req, res) => {
  try {
    const now = new Date();
    const last12 = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours

    const data = await MinuteData.find({
      timestamp: { $gte: last12, $lte: now }
    }).sort({ timestamp: 1 });

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

/* ============================================================
   LAST 60 MINUTES → Fast graph data
   ============================================================ */
export const getLast60 = async (req, res) => {
  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 60 * 60 * 1000);

    const docs = await MinuteData.find({
      timestamp: { $gte: cutoff, $lte: now }
    }).sort({ timestamp: 1 });

    const data = docs.map((d) => {
      const ts = new Date(d.timestamp);
      return {
        time: ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        temperature: d.temperature?.avg ?? 0,
        humidity: d.humidity?.avg ?? 0,
        moisture: d.moisture?.avg ?? 0,
        light: d.light?.avg ?? 0,
        pump: d.pump?.onTime ?? 0,
        motion: d.motion?.count ?? 0,
      };
    });

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

/* ============================================================
   MONTH → last 30 days
   ============================================================ */
export const getMonth = async (req, res) => {
  try {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const data = await DailyData.find({
      date: { $gte: monthAgo, $lte: now }
    }).sort({ date: 1 });

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

/* ============================================================
   YEAR → monthly summaries
   ============================================================ */
export const getYear = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const prefix = `${year}-`; // "2025-"

    const data = await MonthlyData.find({
      month: { $regex: "^" + prefix }  // matches 2025-01, 2025-02...
    }).sort({ month: 1 });

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

/* ============================================================
   CALENDAR HEATMAP
   ============================================================ */
export const getCalendar = async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month); // 1–12

    if (!year || !month)
      return res.status(400).json({ success: false, msg: "Invalid date" });

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const data = await DailyData.find({
      date: { $gte: start, $lt: end }
    }).sort({ date: 1 });

    const calculateHealth = (d) => {
      let score = 100;

      const temp = d.temperature?.avg ?? 0;
      const moist = d.moisture?.avg ?? 0;
      const light = d.light?.avg ?? 0;
      const motion = d.motion?.total ?? 0;
      const pump = d.pump?.onTime ?? 0;

      if (temp > 35 || temp < 10) score -= 20;
      if (moist < 30 || moist > 90) score -= 20;
      if (light < 20) score -= 10;
      if (motion > 10) score -= 10;
      if (pump > 1800) score -= 10;

      return Math.max(0, Math.min(100, score));
    };

    const days = data.map((d) => ({
      date: d.date,
      temperature: d.temperature,
      moisture: d.moisture,
      humidity: d.humidity,
      light: d.light,
      motion: d.motion,
      pump: d.pump,
      emotion: d.emotion?.dominant || "neutral",
      healthScore: calculateHealth(d),
      color:
        calculateHealth(d) < 40
          ? "red"
          : calculateHealth(d) < 70
          ? "yellow"
          : "green",
    }));

    res.json({ success: true, days });

  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
