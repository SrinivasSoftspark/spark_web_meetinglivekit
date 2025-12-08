import mongoose, { Schema, Document } from "mongoose";

interface Participant {
  name: string;
  joinedAt?: Date;
  isHost?: boolean;
}

export interface IMeeting extends Document {
  name: string;
  meetingId: string;
  participants: Participant[];
  createdAt: Date;
}

const ParticipantSchema = new Schema<Participant>({
  name: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
  isHost: { type: Boolean, default: false },
});

const MeetingSchema = new Schema<IMeeting>({
  name: { type: String, required: true },
  meetingId: { type: String, required: true, unique: true },
  participants: [ParticipantSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Meeting || mongoose.model<IMeeting>("Meeting", MeetingSchema);
