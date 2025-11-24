
import axios from "axios";
import { emitLiveData } from "../utils/socket.js";

export const getFirebaseLive = async (req, res) => {
  try {
    const url = `${process.env.FIREBASE_URL}/currentData.json`;

    const fb = await axios.get(url);

    if (!fb.data) {
      return res.json({ success: true, data: null });
    }

    // Emit to socket.io
    emitLiveData(fb.data);

    // Correct API response
    res.json({
      success: true,
      data: fb.data,
    });

  } catch (err) {
    console.error("🔥 Firebase Fetch Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Firebase fetch failed",
    });
  }
};

