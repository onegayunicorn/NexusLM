import express, { Request } from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import mammoth from "mammoth";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json({ limit: '50mb' }));

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Helper to extract text from various file types
async function extractText(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === "application/pdf") {
    const data = await pdf(buffer);
    return data.text;
  } else if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const data = await mammoth.extractRawText({ buffer });
    return data.value;
  } else if (mimetype.startsWith("text/")) {
    return buffer.toString("utf-8");
  }
  return "";
}

// API Routes
app.post("/api/analyze", upload.single("file"), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const text = await extractText(req.file.buffer, req.file.mimetype);
    if (!text) {
      return res.status(400).json({ error: "Could not extract text from file" });
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
    const { text, speaker } = req.body;
    
    // Map speakers to Gemini TTS voices
    // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    const voiceMap: Record<string, string> = {
      "Gregor Mendel": "Charon",
      "George Washington Carver": "Fenrir",
      "Stephanie Kwolek": "Kore",
      "Alexander von Humboldt": "Zephyr",
    };

    const voiceName = voiceMap[speaker] || "Puck";

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
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
