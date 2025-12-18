import express from "express";
import {
    createSession,
    getSessions,
    getSessionMessages,
    sendMessage,
    archiveSession
} from "../controllers/chatController.js";

const router = express.Router();

// All routes require authentication
// router.use(protect);

// Session management
router.post("/", createSession);
router.get("/", getSessions);
router.get("/:sessionId/messages", getSessionMessages);
router.patch("/:sessionId/archive", archiveSession);

import { askAI } from "../controllers/ragController.js";

// Message streaming endpoint
router.post("/messages", sendMessage);

// RAG Q&A endpoint
router.post("/ask", askAI);

export default router;
