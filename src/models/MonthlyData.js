import mongoose from "mongoose";

const MonthlyDataSchema = new mongoose.Schema({
  month: {
    type: String,
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

export default mongoose.model("MonthlyData", MonthlyDataSchema);
