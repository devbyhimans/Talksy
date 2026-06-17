import express from "express";
import { googleCallback } from "../controllers/oauth.controller.js";

const router = express.Router();

// The frontend will perform the OAuth redirect, get the 'code' from Google, and POST it here
router.post("/google", googleCallback);

export default router;
