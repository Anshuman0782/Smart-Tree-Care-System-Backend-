import mongoose from "mongoose";

const DailyDataSchema = new mongoose.Schema({
  date: {
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
    total: Number
  },

  pump: {
    onTime: Number
  },

  emotion: {
    dominant: String
  }
});

export default mongoose.model("DailyData", DailyDataSchema);
