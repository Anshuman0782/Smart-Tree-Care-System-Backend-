import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Store latest sensor values
let sensorData = {
  temperature: null,
  humidity: null,
  moisture: null,
  motion: null,
  light: null,
  pump: null,
  lastUpdate: null,
};

// Receive data from ESP8266
app.post("/api/sensor", (req, res) => {
  const { temperature, humidity, moisture, motion, light, pump } = req.body;

  sensorData = {
    temperature,
    humidity,
    moisture,
    motion,
    light,
    pump,
    lastUpdate: new Date().toISOString(),
  };

  console.log("Received Sensor Data:", sensorData);

  res.json({ message: "Data received", sensorData });
});

// Frontend request latest data
app.get("/api/sensor", (req, res) => {
  res.json(sensorData);
});

app.listen(5000, () => {
  console.log("🚀 Backend Server running on port 5000");
});
