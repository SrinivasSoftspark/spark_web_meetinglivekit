"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Container,
  Typography,
  Alert,
  Box,
  Paper,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

export default function JoinMeetingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [meetingId, setMeetingId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Auto-fill from query params
  useEffect(() => {
    const mid = searchParams.get("meetingId");
    const uname = searchParams.get("username");

    console.log(mid,"dsf");
    

    if (mid) setMeetingId(mid);
    if (uname) setName(decodeURIComponent(uname));
  }, [searchParams]);

  const handleJoin = async () => {
    setError("");
    if (!meetingId || !name) {
      setError("Please enter both Meeting ID and your Name");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("https://officeapi.softspark.org/api/meeting/livekit-token", {
        roomName: meetingId,
        userName: name,
      });

      const data = res.data;
      if (data.success) {
        router.push(
          `/roommeeting/${data.token.token}/${encodeURIComponent(
            data.token.url
          )}/${data.token.identity}`
        );
      } else {
        setError(data.error || "Failed to create meeting");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    router.push(`/`);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
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
          initial={{ opacity: 0, y: 20 }}
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
              component="h1"
              align="center"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: "#0d47a1",
                letterSpacing: "0.5px",
              }}
            >
              Join a Meeting
            </Typography>

            <Typography
              variant="body2"
              align="center"
              sx={{ color: "text.secondary", mb: 3 }}
            >
              Enter your meeting ID and name to join instantly
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                label="Meeting ID"
                variant="outlined"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                fullWidth
                size="medium"
              />
              <TextField
                label="Your Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                size="medium"
              />

              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleJoin}
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1.2,
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: "none",
                  background: "linear-gradient(90deg, #1565c0, #1976d2)",
                  boxShadow: "0 3px 10px rgba(21,101,192,0.3)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #0d47a1, #1565c0)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                ) : (
                  "Join Meeting"
                )}
              </Button>

              <Tooltip title="Go to Create Meeting">
                <Button onClick={handleCreate}>Create Meeting</Button>
              </Tooltip>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Alert severity="error">{error}</Alert>
                </motion.div>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
