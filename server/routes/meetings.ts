import express from "express";
import { createMeeting, getMeetingById, joinMeeting } from "../controller/meetingController";


const router = express.Router();

// Create meeting
router.post("/", createMeeting);

router.post("/join", joinMeeting);

// Get meeting by ID
router.get("/:meetingId", getMeetingById);

export default router;
