import mongoose from "mongoose";

const HourlyDataSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    index: true
  },

  temperature: {
    avg: Number,
    min: Number,
    max: Number
  },

  humidity: {
    avg: Number,
    min: Number,
    max: Number
  },

  moisture: {
    avg: Number,
    min: Number,
    max: Number
  },

  light: {
    avg: Number,
    min: Number,
    max: Number
  },

  motion: {
    count: Number,
    peakTime: Date
  },

  pump: {
    onTime: Number,   // seconds pump was ON
    offTime: Number   // seconds pump was OFF
  },

  emotion: {
    type: String,
    default: "neutral"
  }
});

export default mongoose.model("HourlyData", HourlyDataSchema);
