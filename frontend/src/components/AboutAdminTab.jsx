import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { notyf } from "../utils/notyf";

export default function AboutAdminTab() {
  const { userInfo } = useSelector((state) => state.userSignin);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get("/api/about").then((res) => {
      setTitle(res.data.title || "");
      setBody(res.data.body || "");
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        "/api/about",
        { title, body },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      notyf.success("About section updated.");
    } catch {
      notyf.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginBottom: "50px" }}>
      <Paper className="paper" style={{ backgroundColor: "#F4F4F4" }}>
        <Toolbar>
          <Typography style={{ width: "100%" }} className="title" variant="h6" component="div">
            <b>About</b>
          </Typography>
        </Toolbar>
        <div style={{ padding: "0 16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            fullWidth
            multiline
            minRows={8}
            size="small"
            helperText="Separate paragraphs with a blank line."
          />
          <div>
            <button className="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </Paper>
    </div>
  );
}
