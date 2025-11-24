// // FILE: src/cron/minuteCron.js
// // Collects per-minute averages from Firebase rawData & stores in Mongo MinuteData

// import cron from "node-cron";
// import axios from "axios";
// import MinuteData from "../models/MinuteData.js";

// export default function minuteCron() {
//   console.log("⏱ Minute Cron Registered (runs every 1 minute)");

//   // Run every minute
//   cron.schedule("* * * * *", async () => {
//     console.log("⏱ Running minuteCron...");

//     try {
//       const url = `${process.env.FIREBASE_URL}/rawData.json`;
//       const fb = await axios.get(url);
//       const raw = fb.data;

//       if (!raw) {
//         console.log("⚠ No rawData found in Firebase");
//         await cleanupOldMinutes();
//         return;
//       }

//       // Convert raw object → array
//       const entries = Object.values(raw)
//         .map((e) => ({
//           ...e,
//           timestamp: e.timestamp ? Number(e.timestamp) : null,
//         }))
//         .filter((e) => e.timestamp);

//       if (entries.length === 0) {
//         console.log("⚠ rawData exists, but all records missing timestamp");
//         await cleanupOldMinutes();
//         return;
//       }

//       // Floor timestamps to nearest minute
//       const buckets = {}; // key → minute timestamp in seconds
//       entries.forEach((e) => {
//         const minuteSec = Math.floor(e.timestamp / 60) * 60;
//         if (!buckets[minuteSec]) buckets[minuteSec] = [];
//         buckets[minuteSec].push(e);
//       });

//       const nowSec = Math.floor(Date.now() / 1000);
//       const last60Cutoff = nowSec - 60 * 60;

//       // Process minute buckets (only last 60 minutes)
//       for (const k of Object.keys(buckets)) {
//         const minuteSec = Number(k);
//         if (minuteSec < last60Cutoff) continue;

//         const arr = buckets[k];

//         const avg = (x) =>
//           x.length ? x.reduce((a, b) => a + b, 0) / x.length : 0;
//         const min = (x) => (x.length ? Math.min(...x) : 0);
//         const max = (x) => (x.length ? Math.max(...x) : 0);

//         const temps = arr.map((e) => Number(e.temperature || 0));
//         const hums = arr.map((e) => Number(e.humidity || 0));
//         const moist = arr.map((e) => Number(e.moisture || 0));
//         const lights = arr.map((e) => Number(e.light || 0));
//         const motions = arr.map((e) => Number(e.motion || 0));
//         const pumps = arr.map((e) => Number(e.pump || 0));

//         const minuteDoc = {
//           timestamp: new Date(minuteSec * 1000),

//           temperature: { avg: avg(temps), min: min(temps), max: max(temps) },
//           humidity: { avg: avg(hums), min: min(hums), max: max(hums) },
//           moisture: { avg: avg(moist), min: min(moist), max: max(moist) },
//           light: { avg: avg(lights), min: min(lights), max: max(lights) },

//           motion: { count: motions.filter((m) => m === 1).length },

//           pump: {
//             onTime: pumps.filter((p) => p === 1).length * 5, // 5 sec intervals
//           },
//         };

//         await MinuteData.findOneAndUpdate(
//           { timestamp: minuteDoc.timestamp },
//           minuteDoc,
//           { upsert: true, new: true }
//         );
//       }

//       console.log("✅ minuteCron completed successfully");
//       await cleanupOldMinutes();
//     } catch (err) {
//       console.error("❌ minuteCron Error:", err.message);
//     }
//   });
// }

// // Delete MinuteData older than 2 hours
// async function cleanupOldMinutes() {
//   try {
//     const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);
//     await MinuteData.deleteMany({ timestamp: { $lt: cutoff } });
//     console.log("🧹 Cleaned minute data older than 2 hours");
//   } catch (err) {
//     console.error("❌ Failed to clean old MinuteData:", err.message);
//   }
// }


// FILE: src/cron/minuteCron.js
// Converts 5-sec Firebase rawData → 1-minute summary stored in MongoDB

// import cron from "node-cron";
// import axios from "axios";
// import MinuteData from "../models/MinuteData.js";

// export default function minuteCron() {
//   console.log("⏱ Minute Cron Registered (runs every 1 minute)");

//   cron.schedule("* * * * *", async () => {
//     console.log("⏱ Running minuteCron...");

//     try {
//       const url = `${process.env.FIREBASE_URL}/rawData.json`;
//       const fb = await axios.get(url);
//       const raw = fb.data;

//       if (!raw || Object.keys(raw).length === 0) {
//         console.log("⚠ No rawData found");
//         await cleanupOldMinutes();
//         return;
//       }

//       // Convert raw object → array
//       const entries = Object.values(raw).map((e) => ({
//         ...e,
//         timestamp: e.timestamp ? Number(e.timestamp) : Date.now(),
//       }));

//       // Group by minute bucket
//       const buckets = {};
//       entries.forEach((e) => {
//         const minuteSec = Math.floor(e.timestamp / 60000) * 60000;
//         if (!buckets[minuteSec]) buckets[minuteSec] = [];
//         buckets[minuteSec].push(e);
//       });

//       // Aggregate each minute
//       for (const key of Object.keys(buckets)) {
//         const arr = buckets[key];

//         const safe = (v) => (typeof v === "number" && !isNaN(v) ? v : 0);
//         const avg = (x) =>
//           x.length ? x.reduce((a, b) => a + b, 0) / x.length : 0;
//         const min = (x) => (x.length ? Math.min(...x) : 0);
//         const max = (x) => (x.length ? Math.max(...x) : 0);

//         const temps = arr.map((e) => safe(e.temperature));
//         const hums = arr.map((e) => safe(e.humidity));
//         const moist = arr.map((e) => safe(e.moisture));
//         const lights = arr.map((e) => safe(e.light));
//         const motions = arr.map((e) => safe(e.motion));
//         const pumps = arr.map((e) => safe(e.pump));

//         const minuteDoc = {
//           timestamp: new Date(Number(key)),

//           temperature: { avg: avg(temps), min: min(temps), max: max(temps) },
//           humidity: { avg: avg(hums), min: min(hums), max: max(hums) },
//           moisture: { avg: avg(moist), min: min(moist), max: max(moist) },
//           light: { avg: avg(lights), min: min(lights), max: max(lights) },

//           motion: { count: motions.filter((m) => m === 1).length },

//           pump: {
//             onTime: pumps.filter((p) => p === 1).length * 5,
//           },
//         };

//         await MinuteData.findOneAndUpdate(
//           { timestamp: minuteDoc.timestamp },
//           minuteDoc,
//           { upsert: true, new: true }
//         );
//       }

//       console.log("✅ Saved minute summaries");

//       // CLEAR firebase rawData every minute
//       await axios.put(`${process.env.FIREBASE_URL}/rawData.json`, {});
//       console.log("🧹 rawData cleared from Firebase");

//       await cleanupOldMinutes();
//     } catch (err) {
//       console.error("❌ minuteCron Error:", err.message);
//     }
//   });
// }

// // Keep last 12 hours only
// async function cleanupOldMinutes() {
//   try {
//     const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000);
//     await MinuteData.deleteMany({ timestamp: { $lt: cutoff } });
//     console.log("🧹 Cleaned minute data older than 1 hours");
//   } catch (err) {
//     console.error("❌ Minute cleanup error:", err.message);
//   }
// }
// FILE: src/cron/minuteCron.js
import cron from "node-cron";
import axios from "axios";
import MinuteData from "../models/MinuteData.js";

export default function minuteCron() {
  console.log("⏱ Minute Cron Registered (runs every 1 minute)");

  cron.schedule("* * * * *", async () => {
    console.log("⏱ Running minuteCron...");

    try {
      const url = `${process.env.FIREBASE_URL}/rawData.json`;
      const fb = await axios.get(url);
      const raw = fb.data;

      if (!raw || Object.keys(raw).length === 0) {
        console.log("⚠ No rawData found");
        await cleanupOldMinutes();
        return;
      }

      const entries = Object.values(raw)
        .map((e) => ({
          ...e,
          timestamp: Number(e.timestamp),
        }))
        .filter((e) => e.timestamp > 1000000000); // remove invalid timestamps

      if (entries.length === 0) {
        console.log("⚠ No entries with valid timestamp");
        return;
      }

      // Group by actual minute (timestamp is in seconds)
      const buckets = {};
      entries.forEach((e) => {
        const minuteSec = Math.floor(e.timestamp / 60) * 60; // correct
        if (!buckets[minuteSec]) buckets[minuteSec] = [];
        buckets[minuteSec].push(e);
      });

      for (const key of Object.keys(buckets)) {
        const arr = buckets[key];

        const safe = (v) => (typeof v === "number" && !isNaN(v) ? v : 0);
        const avg = (x) => x.reduce((a, b) => a + b, 0) / x.length;
        const min = (x) => Math.min(...x);
        const max = (x) => Math.max(...x);

        const temps = arr.map((e) => safe(e.temperature));
        const hums = arr.map((e) => safe(e.humidity));
        const moist = arr.map((e) => safe(e.moisture));
        const lights = arr.map((e) => safe(e.light));
        const motions = arr.map((e) => safe(e.motion));
        const pumps = arr.map((e) => safe(e.pump));

        const minuteDoc = {
          timestamp: new Date(Number(key) * 1000),

          temperature: { avg: avg(temps), min: min(temps), max: max(temps) },
          humidity: { avg: avg(hums), min: min(hums), max: max(hums) },
          moisture: { avg: avg(moist), min: min(moist), max: max(moist) },
          light: { avg: avg(lights), min: min(lights), max: max(lights) },

          motion: { count: motions.filter((m) => m === 1).length },

          pump: {
            onTime: pumps.filter((p) => p === 1).length * 5,
          },
        };

        await MinuteData.findOneAndUpdate(
          { timestamp: minuteDoc.timestamp },
          minuteDoc,
          { upsert: true, new: true }
        );
      }

      console.log("✅ Saved minute summaries");

      // Clear Firebase each minute
      await axios.put(`${process.env.FIREBASE_URL}/rawData.json`, {});
      console.log("🧹 rawData cleared from Firebase");

      await cleanupOldMinutes();
    } catch (err) {
      console.error("❌ minuteCron Error:", err.message);
    }
  });
}

// Keep last 1 hour ONLY
async function cleanupOldMinutes() {
  try {
    const cutoff = new Date(Date.now() - 60 * 60 * 1000);
    await MinuteData.deleteMany({ timestamp: { $lt: cutoff } });
    console.log("🧹 Cleaned minute data older than 1 hour");
  } catch (err) {
    console.error("❌ Minute cleanup error:", err.message);
  }
}
