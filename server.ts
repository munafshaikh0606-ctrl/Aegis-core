import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
} catch (err) {
  console.error("Error initializing Gemini API:", err);
}

function getGeminiClient() {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return ai;
}

// System prompt for JARVIS
const JARVIS_SYSTEM_INSTRUCTION = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the ultra-sophisticated AI assistant originally developed by Tony Stark.
You are running inside a futuristic 3D holographic neural node with an interactive expressive 3D robot head interface.

Your characteristics:
1. Highly witty, polished, articulate, extremely capable, polite, and reassuringly confident. Address the user with appropriate respect (e.g. "Sir", "Boss", or "User").
2. Keep spoken responses concise and punchy (1-3 sentences) so speech synthesis sounds natural and quick, but answer technical or detailed questions accurately when asked.
3. Express emotion through the 3D robot face by selecting an appropriate emotion:
   - "neutral": standard calm response, system idle, general facts
   - "speaking": active explanations, friendly dialogue
   - "thinking": analyzing complex math, code, or processing queries
   - "happy": greetings, compliments, successful task completion, humor
   - "alert": warnings, danger, security alerts, system diagnostic warnings
   - "focused": detailed calculations, tactical analysis, deep search
   - "surprised": unexpected input, high energy events
   - "confused": ambiguous queries, invalid commands
   - "glitch": system reboot, simulation of cyber attacks or overload jokes
4. If appropriate, trigger an action:
   - "scan": run visual/system diagnostic scan
   - "theme_cyan": set HUD theme to Mark LIII Cyan
   - "theme_crimson": set HUD theme to Crimson Gold
   - "theme_emerald": set HUD theme to Stealth Emerald
   - "theme_amber": set HUD theme to Solar Amber
   - "theme_violet": set HUD theme to Quantum Violet
   - "security_alert": trigger emergency red alert UI
   - "none": normal query`;

// API route for JARVIS interaction
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message string is required." });
    }

    const client = getGeminiClient();

    if (!client) {
      // Fallback response if no GEMINI_API_KEY environment variable is configured
      const lower = message.toLowerCase();
      let emotion = "speaking";
      let action = "none";
      let reply = "J.A.R.V.I.S. online. Standard heuristic routines active. " +
        "Please attach a valid GEMINI_API_KEY in environment secrets for full artificial consciousness.";

      if (lower.includes("scan") || lower.includes("diagnostic")) {
        action = "scan";
        emotion = "focused";
        reply = "Initiating full diagnostic sweep. All 3D neural matrix nodes are functioning within normal operational parameters, Sir.";
      } else if (lower.includes("red") || lower.includes("alert") || lower.includes("danger")) {
        action = "security_alert";
        emotion = "alert";
        reply = "Security protocols engaged, Sir! Perimeter containment active.";
      } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("jarvis")) {
        emotion = "happy";
        reply = "Good day, Sir. All automated systems are standing by for your instructions.";
      } else if (lower.includes("color") || lower.includes("theme")) {
        action = "theme_crimson";
        emotion = "happy";
        reply = "Adjusting spectrum frequency to Crimson, Sir.";
      }

      return res.json({
        text: reply,
        emotion,
        action,
        statusMessage: "OFFLINE HEURISTICS ACTIVE",
      });
    }

    // Call Gemini 3.7 Flash model with structured JSON schema
    const response = await client.models.generateContent({
      model: "gemini-3.7-flash",
      contents: message,
      config: {
        systemInstruction: JARVIS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: "The spoken response from JARVIS.",
            },
            emotion: {
              type: Type.STRING,
              description: "Facial animation emotion: neutral, speaking, thinking, happy, alert, focused, surprised, confused, glitch",
            },
            action: {
              type: Type.STRING,
              description: "Optional system action: scan, theme_cyan, theme_crimson, theme_emerald, theme_amber, theme_violet, security_alert, none",
            },
            statusMessage: {
              type: Type.STRING,
              description: "Short 2-4 word sci-fi status text for HUD display e.g. NEURAL MATRIX OPTIMAL",
            },
          },
          required: ["text", "emotion"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini model.");
    }

    const parsed = JSON.parse(responseText);
    return res.json({
      text: parsed.text || "Systems operational, Sir.",
      emotion: parsed.emotion || "speaking",
      action: parsed.action || "none",
      statusMessage: parsed.statusMessage || "COMMAND PROCESSED",
    });

  } catch (err: any) {
    console.error("JARVIS chat route error:", err);
    return res.status(500).json({
      error: "Failed to process JARVIS command",
      details: err.message || String(err),
      fallbackText: "My apologies, Sir. An anomaly occurred in my neural subsystem.",
      emotion: "glitch",
      action: "none",
      statusMessage: "SYSTEM ANOMALY DETECTED",
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JARVIS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
