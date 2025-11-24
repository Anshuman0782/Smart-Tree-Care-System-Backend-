import express from "express";
import {
  getToday,
  getMonth,
  getYear,
  getCalendar,
  getLast60
} from "../controllers/history.controller.js";

const router = express.Router();

router.get("/last60", getLast60);
router.get("/today", getToday);
router.get("/month", getMonth);
router.get("/year", getYear);
router.get("/calendar/:year/:month", getCalendar);


export default router;
