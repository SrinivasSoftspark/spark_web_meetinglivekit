"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function CreateMeetingPage() {
  const router = useRouter();

  const [meetingName, setMeetingName] = useState("");
  const [hostName, setHostName] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const createMeeting = async () => {
    setError("");
    if (!meetingName || !hostName) {
      setError("Please enter both Meeting Name and Host Name");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("https://officeapi.softspark.org/api/meeting/livekit-token", {
        roomName: meetingName,
        userName: hostName,
      });

      const data = res.data;
      if (data.success) {
       router.push(`/roommeeting/${data.token.token}/${encodeURIComponent(data.token.url)}/${data.token.identity}`);
      } else {
        setError(data.error || "Failed to create meeting");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Error creating meeting");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (meetingId) {
      await navigator.clipboard.writeText(meetingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoin = () => {
 
      router.push(`/joinmeeting`);
  
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #4a90e2 0%, #0056b3 100%)",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: "100%" }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 5,
              borderRadius: 3,
              backgroundColor: "#ffffffee",
              backdropFilter: "blur(6px)",
            }}
          >
            <Typography
              variant="h4"
              align="center"
              fontWeight={700}
              sx={{ mb: 2, color: "#0d47a1" }}
            >
              Create a Meeting
            </Typography>

            <Typography
              variant="body2"
              align="center"
              sx={{ color: "text.secondary", mb: 3 }}
            >
              Set up a new meeting and share the generated Meeting ID
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                label="Meeting Name"
                variant="outlined"
                value={meetingName}
                onChange={(e) => setMeetingName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Host Name"
                variant="outlined"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                fullWidth
              />

              <Button
                variant="contained"
                color="primary"
                onClick={createMeeting}
                disabled={loading}
                sx={{
                  py: 1.3,
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  background: "linear-gradient(90deg, #1565c0, #1976d2)",
                  boxShadow: "0 3px 10px rgba(21,101,192,0.3)",
                  textTransform: "none",
                  "&:hover": {
                    background: "linear-gradient(90deg, #0d47a1, #1565c0)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                ) : (
                  "Create Meeting"
                )}
              </Button>

                     <Tooltip title="Go to Join Meeting">
                    <Button onClick={handleJoin}>Join Meeting</Button>
                      </Tooltip>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Alert severity="error">{error}</Alert>
                </motion.div>
              )}

              {meetingId && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Alert
                    severity="success"
                    sx={{
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <span>Meeting Created Successfully!</span>
                      <strong>ID:</strong> {meetingId}
                    </Stack>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Tooltip title={copied ? "Copied!" : "Copy Meeting ID"}>
                        <IconButton
                          color={copied ? "success" : "primary"}
                          onClick={handleCopy}
                          size="small"
                          sx={{ ml: 1 }}
                        >
                          {copied ? <CheckIcon /> : <ContentCopyIcon />}
                        </IconButton>
                      </Tooltip>

               
                    </Box>
                  </Alert>
                </motion.div>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
