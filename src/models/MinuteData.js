// // FILE: src/models/MinuteData.js

// import mongoose from "mongoose";

// const MinuteDataSchema = new mongoose.Schema(
//   {
//     timestamp: {
//       type: Date,
//       required: true,
//       index: true,
//     },

//     temperature: {
//       avg: Number,
//       min: Number,
//       max: Number,
//     },

//     humidity: {
//       avg: Number,
//       min: Number,
//       max: Number,
//     },

//     moisture: {
//       avg: Number,
//       min: Number,
//       max: Number,
//     },

//     light: {
//       avg: Number,
//       min: Number,
//       max: Number,
//     },

//     motion: {
//       count: Number,
//     },

//     pump: {
//       onTime: Number, // seconds ON in this minute
//       offTime: Number,
//     },

//     emotion: {
//       type: String,
//       default: "neutral",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("MinuteData", MinuteDataSchema);


import mongoose from "mongoose";

const MinuteDataSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    index: true, // for fast last-60-min search
  },

  temperature: {
    avg: Number,
    min: Number,
    max: Number,
  },

  humidity: {
    avg: Number,
    min: Number,
    max: Number,
  },

  moisture: {
    avg: Number,
    min: Number,
    max: Number,
  },

  light: {
    avg: Number,
    min: Number,
    max: Number,
  },

  motion: {
    count: Number, // number of motion events within this minute
  },

  pump: {
    onTime: Number, // seconds pump ON within this minute
  },

  // Emotion not stored for minute-level data (too sparse)
});

export default mongoose.model("MinuteData", MinuteDataSchema);
