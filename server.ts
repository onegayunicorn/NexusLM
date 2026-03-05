import express, { Request } from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import mammoth from "mammoth";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";
import { COUNCIL_MEMBERS } from "./src/constants";

dotenv.config();

const app = express();
const PORT = 3000;
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Helper to extract text from various file types
async function extractText(buffer: Buffer, mimetype: string): Promise<string> {
  try {
    if (mimetype === "application/pdf") {
      // Handle potential variations in how pdf-parse is exported
      const parse = typeof pdf === 'function' ? pdf : pdf.default;
      if (typeof parse !== 'function') {
        throw new Error("PDF parser initialization failed: pdf-parse is not a function");
      }
      const data = await parse(buffer);
      return data.text || "";
    } else if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const data = await mammoth.extractRawText({ buffer });
      return data.value || "";
    } else if (mimetype.startsWith("text/") || mimetype === "application/octet-stream") {
      return buffer.toString("utf-8");
    }
    return "";
  } catch (error: any) {
    console.error("Extraction error:", error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

// API Routes
app.post("/api/analyze", upload.single("file"), async (req: any, res: any) => {
  console.log("Received analysis request for file:", req.file?.originalname);
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const text = await extractText(req.file.buffer, req.file.mimetype);
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Could not extract any text from the provided file. Please ensure it's not empty or password protected." });
    }

    const { host1, host2 } = req.body;

    const model = "gemini-3.1-pro-preview";
    
    const prompt = `
      You are the NexusLM Dialogue Generator. 
      Analyze the following document text and generate a podcast script between two historical figures: ${host1} and ${host2}.
      
      Council Members Profiles:
      - Gregor Mendel: Skeptical Analyst, focused on data, ratios, and evidence.
      - George Washington Carver: Practical Visionary, focused on sustainability, innovation, and the "soul" of nature.
      - Stephanie Kwolek: Precision Engineer, focused on structural integrity, materials, and mechanics.
      - Alexander von Humboldt: The Connector, focused on ecology, global systems, and interdisciplinary links.
      - Homer Simpson: The Everyman Philosopher, finds wisdom in donuts, simplicity in chaos, and often uses "D'oh!" or "Mmm... [topic]".
      - Rick Sanchez: The Nihilistic Genius, cynical, burping occasionally, brilliant but dismissive of "normal" logic, often uses "Wubba Lubba Dub Dub" or "Listen, Morty...".

      The script should be a deep, intellectual debate/discussion about the core themes of the document.
      Format the output as a JSON array of objects: [{ "speaker": "Name", "text": "...", "emotion": "..." }].
      
      Document Text:
      ${text.substring(0, 15000)} // Limit text for prompt size
    `;

    const result = await genAI.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const script = JSON.parse(result.text || "[]");
    res.json({ script, text: text.substring(0, 5000) });
  } catch (error: any) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/synthesize", async (req, res) => {
  try {
    const { text, speaker, settings } = req.body;
    
    const member = COUNCIL_MEMBERS.find(m => m.name === speaker);
    const voiceName = member?.defaultVoice || "Puck";

    // Since prebuiltVoiceConfig doesn't support pitch/rate directly,
    // we use the prompt to influence the character's voice style.
    const pitchDesc = settings.pitch > 1.2 ? "high-pitched" : settings.pitch < 0.8 ? "deep, low-pitched" : "natural pitch";
    const rateDesc = settings.rate > 1.2 ? "fast-paced" : settings.rate < 0.8 ? "slow and deliberate" : "normal speed";
    const formantDesc = settings.formant > 1.1 ? "bright and sharp" : settings.formant < 0.9 ? "warm and resonant" : "";

    const prompt = `
      Speak the following text as ${speaker}. 
      Voice Style: ${pitchDesc}, ${rateDesc}, ${formantDesc}.
      Text: ${text}
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    res.json({ audio: base64Audio });
  } catch (error: any) {
    console.error("Synthesis error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
