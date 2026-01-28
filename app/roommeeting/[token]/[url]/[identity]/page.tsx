"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  LiveKitRoom,
  ParticipantTile,
  ControlBar,
  Chat,
  useTracks,
  useParticipants,
  ParticipantName,
  ChatCloseIcon,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Button,
  Tooltip,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import ChatIcon from "@mui/icons-material/Chat";
import PeopleIcon from "@mui/icons-material/People";

import { RoomEvent, Track } from "livekit-client";

export default function RoomMeeting() {
  const router = useRouter();
  const params = useParams();
  const { token, url, identity } = params;

  const [joined, setJoined] = useState(false);

  if (!token || !url || !identity)
    return <Typography>Missing meeting parameters.</Typography>;

  const safeUrl = (() => {
    try {
      const decoded = decodeURIComponent(String(url));
      if (!decoded.startsWith("ws://") && !decoded.startsWith("wss://")) {
        return `ws://${decoded}`;
      }
      return decoded;
    } catch {
      return "ws://localhost:7880";
    }
  })();


  return (
    <LiveKitRoom
      token={String(token)}
      serverUrl={safeUrl}
      connect
      audio
      video
      onDisconnected={() => setTimeout(() => router.push("/"), 300)}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0a1929",
        color: "white",
      }}
    >
      <RoomContent router={router} identity={String(identity)} />
    </LiveKitRoom>
  );
}

function RoomContent({ router, identity }: { router: any; identity: string }) {
  const room = useRoomContext();
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);

  const [ccEnabled, setCcEnabled] = useState(false);
  const [currentSpeakerForCC, setCurrentSpeakerForCC] = useState<string | null>(
    null
  );
  const [captions, setCaptions] = useState<string>("");

  return (
    <>
      <AudioTracks />

      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#0f172a",
          zIndex: 10,
          borderBottom: "1px solid #334155",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6">Spark Meet</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="subtitle1">User: {identity}</Typography>
            <Tooltip title="Leave Meeting">
              <IconButton color="inherit" onClick={() => router.push("/")}>
                <LogoutIcon sx={{ color: "white" }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pt: "64px",
          overflow: "hidden",
          position: "relative",
          height: "calc(100vh - 64px - 56px)",
        }}
      >
        <MainVideoGrid
          ccEnabled={ccEnabled}
          setCurrentSpeakerForCC={setCurrentSpeakerForCC}
          currentSpeakerForCC={currentSpeakerForCC}
        />
      </Box>

      {ccEnabled && currentSpeakerForCC && (
        <Box
          sx={{
            position: "fixed",
            bottom: 76,
            width: "100%",
            textAlign: "center",
            color: "white",
            backgroundColor: "rgba(0,0,0,0.6)",
            py: 1,
            fontSize: 14,
            maxHeight: 50,
            overflow: "hidden",
          }}
        >
          <Typography variant="body2">
            {currentSpeakerForCC}: {captions || "[Speaking...]"}
          </Typography>
        </Box>
      )}

      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "#0f172a",
          p: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderTop: "1px solid #334155",
          gap: 1.5,
        }}
      >
        <ControlBar
          variation="minimal"
          controls={{
            camera: true,
            microphone: true,
            screenShare: true,
            leave: false,
          }}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            color: "white",
            gap: "0.75rem",
          }}
        />

        <Tooltip title="Participants">
          <IconButton
            sx={{ color: "white" }}
            onClick={() => setParticipantsOpen(true)}
          >
            <PeopleIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Chat">
          <IconButton sx={{ color: "white" }} onClick={() => setChatOpen(true)}>
            <ChatIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Closed Captions">
          <IconButton
            sx={{ color: ccEnabled ? "#22c55e" : "white" }}
            onClick={() => setCcEnabled(!ccEnabled)}
          >
            <Typography variant="button">CC</Typography>
          </IconButton>
        </Tooltip>

        <Tooltip title="Leave Meeting">
          <IconButton
            sx={{
              color: "#ef4444",
              ml: 1,
              "&:hover": { bgcolor: "rgba(239,68,68,0.15)" },
            }}
            onClick={() => router.push("/")}
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Paper>

         {ccEnabled && (
        <SpeechToText setCaptions={setCaptions} />
      )}

      <Drawer
        anchor="right"
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        PaperProps={{
          sx: {
            width: 550,
            bgcolor: "#1e293b",
            color: "white",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #334155",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">Chat</Typography>
          <Button onClick={() => setChatOpen(false)} sx={{ color: "white" }}>
            <ChatCloseIcon />
          </Button>
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          <Chat />
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={participantsOpen}
        onClose={() => setParticipantsOpen(false)}
        PaperProps={{
          sx: {
            width: 400,
            bgcolor: "#1e293b",
            color: "white",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #334155",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "#1e293b",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Participants
          </Typography>
          <IconButton
            onClick={() => setParticipantsOpen(false)}
            sx={{
              color: "white",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ChatCloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          <ParticipantsList />
        </Box>
      </Drawer>
    </>
  );
}

/* ---------------------- SHARED SUBCOMPONENTS ---------------------- */

function AudioTracks() {
  const tracks = useTracks([{ source: Track.Source.Microphone, withPlaceholder: false }]);

  useEffect(() => {
    tracks.forEach((t) => {
      if (!t.publication) return;
      const mediaTrack =
        t.publication.audioTrack?.mediaStreamTrack ||
        t.publication.track?.mediaStreamTrack;
      if (!mediaTrack) return;

      let el = document.getElementById(
        t.publication?.trackSid || ""
      ) as HTMLAudioElement | null;
      if (!el) {
        el = document.createElement("audio");
        el.id = t.publication.trackSid;
        el.autoplay = true;
        el.muted = t.participant.isLocal;
        el.srcObject = new MediaStream([mediaTrack]);
        document.body.appendChild(el);
        const playAudio = () => el?.play().catch(() => {});
        playAudio();
        document.body.addEventListener("click", playAudio, { once: true });
      }
    });

    return () => {
      tracks.forEach((t) => {
        if (!t.publication) return;
        const el = document.getElementById(
          t.publication.trackSid
        ) as HTMLAudioElement | null;
        if (el) {
          el.srcObject = null;
          el.remove();
        }
      });
    };
  }, [tracks]);

  return null;
}

function MainVideoGrid({
  ccEnabled,
  setCurrentSpeakerForCC,
  currentSpeakerForCC,
}: {
  ccEnabled: boolean;
  setCurrentSpeakerForCC: (identity: string | null) => void;
  currentSpeakerForCC: string | null;
}) {
  const tracks = useTracks(
    [
      { source: Track.Source.ScreenShare, withPlaceholder: false },
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.Microphone, withPlaceholder: false },
    ],
    { updateOnlyOn: [RoomEvent.TrackSubscribed, RoomEvent.ParticipantMetadataChanged] }
  );

  const screenTrack = tracks.find((t) => t.source === "screen_share");
  const cameraTracks = tracks.filter((t) => t.source === "camera");

  const activeSpeaker = useMemo(() => {
    const speaking = tracks.find(
      (t) => t.source === "microphone" && t.participant.isSpeaking
    );
    return speaking?.participant.identity || null;
  }, [tracks]);

  useEffect(() => {
    if (!ccEnabled) return;
    if (!currentSpeakerForCC) setCurrentSpeakerForCC(activeSpeaker || null);
  }, [activeSpeaker, ccEnabled, currentSpeakerForCC, setCurrentSpeakerForCC]);

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0a1929",
          overflow: "hidden",
          borderRadius: "12px",
          transition: "border 0.3s ease",
        }}
      >
        {screenTrack ? (
          <ParticipantTile
            trackRef={screenTrack}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : cameraTracks[0] ? (
          <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
            <ParticipantTile
              trackRef={cameraTracks[0]}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
        ) : (
          <Typography color="white">No video</Typography>
        )}
      </Box>

      {cameraTracks.length > 1 && (
        <Box
          sx={{
            width: 200,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            p: 1,
            overflowY: "auto",
            bgcolor: "#0f172a",
            borderLeft: "1px solid #334155",
          }}
        >
          {(screenTrack ? cameraTracks : cameraTracks.slice(1)).map((track) => (
            <SideVideo
              key={track.participant.identity}
              track={track}
              isActive={activeSpeaker === track.participant.identity}
              isScreenSharing={
                screenTrack?.participant.identity === track.participant.identity
              }
              ccEnabled={ccEnabled}
              setCurrentSpeakerForCC={setCurrentSpeakerForCC}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

function SideVideo({
  track,
  isActive,
  isScreenSharing,
  ccEnabled,
  setCurrentSpeakerForCC,
}: {
  track: any;
  isActive?: boolean;
  isScreenSharing?: boolean;
  ccEnabled: boolean;
  setCurrentSpeakerForCC: (identity: string) => void;
}) {
  return (
    <Paper
      onClick={() => ccEnabled && setCurrentSpeakerForCC(track.participant.identity)}
      sx={{
        height: 120,
        position: "relative",
        cursor: ccEnabled ? "pointer" : "default",
        border: isScreenSharing
          ? "2px solid #3b82f6"
          : isActive
          ? "2px solid #22c55e"
          : "1px solid transparent",
        borderRadius: "8px",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      <ParticipantTile
        trackRef={track}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </Paper>
  );
}

function ParticipantsList() {
  const participants = useParticipants();

  return (
    <List>
      {participants.map((p) => (
        <ListItem key={p.identity}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: "#334155" }}>
              {p.identity.charAt(0).toUpperCase()}
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={p.identity} />
        </ListItem>
      ))}
    </List>
  );
}

function SpeechToText({ setCaptions }: { setCaptions: (text: string) => void }) {
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setCaptions(transcript);
    };

    recognition.start();

    return () => recognition.stop();
  }, [setCaptions]);

  return null;
}