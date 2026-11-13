
import "dotenv/config";

import app from "../src/app.js";
import connectDB from "../src/config/db.js";

let dbConnectionPromise;

export default async function handler(req, res) {
  try {
    if (!dbConnectionPromise) {
      dbConnectionPromise = connectDB().catch((error) => {
        dbConnectionPromise = null;
        throw error;
      });
    }

    await dbConnectionPromise;

    return app(req, res);
  } catch (error) {
    console.error("Vercel API initialization error:", error);

    return res.status(503).json({
      success: false,
      message: "API temporarily unavailable",
    });
  }
}
