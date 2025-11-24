// import express from "express";
// import { getLiveData } from "../controllers/sensor.controller.js";

// const router = express.Router();

// // GET → Live sensor data from Firebase
// router.get("/live", getLiveData);

// export default router;


import express from "express";
import { getFirebaseLive } from "../controllers/sensor.controller.js";

const router = express.Router();

router.get("/firebase-live", getFirebaseLive);

export default router;
