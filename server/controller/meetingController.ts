import { Request, Response } from "express";
import Meeting from "../models/Meeting";

// Create meeting
export const createMeeting = async (req: Request, res: Response) => {
  try {
    const { name, hostName } = req.body;
    if (!name || !hostName) return res.status(400).json({ error: "Name and host required" });

    console.log(name,hostName);
    

    const meetingId = Math.random().toString(36).substring(2, 11);

    const meeting = new Meeting({
      name,
      meetingId,
      participants: [{ name: hostName, isHost: true }],
    });

    await meeting.save();
    res.json({ success: true, meeting });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const joinMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId, name } = req.body;

    if (!meetingId || !name)
      return res.status(400).json({ error: "Meeting ID and participant name required" });

    console.log(meetingId,"sfrs");
    
    // Find the meeting
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) return res.status(404).json({ error: "Meeting not found" });

    // Check if participant already exists
   const participantExists = meeting.participants.some((p: any) => p.name === name);

    if (participantExists)
      return res.status(400).json({ error: "Participant already joined" });

    // Add participant
    meeting.participants.push({ name, isHost: false });
    await meeting.save();

    res.json({ success: true, meeting });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get meeting by ID
export const getMeetingById = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) return res.status(404).json({ error: "Meeting not found" });

    res.json({ success: true, meeting });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
