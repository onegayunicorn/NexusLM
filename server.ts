import express, { Request } from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse/lib/pdf-parse.js");
import mammoth from "mammoth";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";
import { COUNCIL_MEMBERS } from "./src/constants";
import { StoicFilter } from "./src/services/stoicFilter";

console.log("SERVER SCRIPT STARTING...");

dotenv.config();

const app = express();
const PORT = 3000;
console.log("PORT SET TO:", PORT);
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Strategy Pattern for Document Ingestion
interface IngestionStrategy {
  extract(buffer: Buffer): Promise<string>;
}

class PDFStrategy implements IngestionStrategy {
  async extract(buffer: Buffer): Promise<string> {
    let parseFunc;
    try {
      parseFunc = pdf;
      if (typeof parseFunc !== 'function' && pdf && typeof pdf.default === 'function') {
        parseFunc = pdf.default;
      }
    } catch (e) {
      console.error("PDF parse function resolution failed:", e);
    }
    
    if (typeof parseFunc !== 'function') {
      throw new Error("PDF parser initialization failed");
    }
    
    const data = await parseFunc(buffer);
    return data.text || "";
  }
}

class DocxStrategy implements IngestionStrategy {
  async extract(buffer: Buffer): Promise<string> {
    const data = await mammoth.extractRawText({ buffer });
    return data.value || "";
  }
}

class TextStrategy implements IngestionStrategy {
  async extract(buffer: Buffer): Promise<string> {
    return buffer.toString("utf-8");
  }
}

class DocumentIngestorFactory {
  static getStrategy(mimetype: string): IngestionStrategy {
    if (mimetype === "application/pdf") return new PDFStrategy();
    if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return new DocxStrategy();
    if (mimetype.startsWith("text/") || mimetype === "application/octet-stream") return new TextStrategy();
    throw new Error(`Unsupported mimetype: ${mimetype}`);
  }
}

// API Routes
app.post("/api/analyze", upload.single("file"), async (req: any, res: any) => {
  console.log("Received analysis request. Mock Mode:", req.body?.isMockMode);
  try {
    const isMockMode = req.body?.isMockMode === 'true';

    if (isMockMode) {
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return res.json({
        script: [
          { speaker: req.body.host1, text: "Welcome to the NexusLM Mock Session. We are testing the pipeline.", emotion: "neutral" },
          { speaker: req.body.host2, text: "Indeed. This allows us to verify the UI transitions without hitting the real AI models.", emotion: "intellectual" },
          { speaker: req.body.host1, text: "The document ingestion seems to be working perfectly in this simulation.", emotion: "excited" }
        ],
        text: "This is mock document text for testing purposes."
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const strategy = DocumentIngestorFactory.getStrategy(req.file.mimetype);
    const text = await strategy.extract(req.file.buffer);
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Could not extract any text from the provided file." });
    }

    const { host1, host2 } = req.body;
    if (!host1 || !host2) {
      return res.status(400).json({ error: "Missing host parameters" });
    }

    const model = "gemini-3.1-pro-preview";
    
    const prompt = `
      You are the NexusLM Dialogue Generator. 
      Analyze the following document text and generate a podcast script between two members of the Analytical Triad: ${host1} and ${host2}.
      
      Council Members Profiles:
      - Ada Lovelace (The Poetical Scientist): Focuses on the "poetical science" of code, ensuring beauty and rigor.
      - Stephanie Kwolek (The Precision Engineer): Focuses on structural integrity, materials, and mechanics.
      - Leonardo da Vinci (The Systemic Observer): Looks for fluid dynamics and systemic connections.
      - Gregor Mendel (The Skeptical Analyst): Ensures platform evolution and connects disparate data points.
      - Marcus Aurelius (The Stoic Filter): Removes speculative noise, focusing on objective truth and INTERNAL_CONTROL vs EXTERNAL_NOISE.
      - Rick Sanchez (The Nihilistic Reality Check): Cynical genius, flags over-engineered abstractions that add zero value.

      ${StoicFilter.getPromptInstructions()}
      
      The script should be a deep, intellectual debate/discussion about the core themes of the document, filtered for actionable wisdom.
      Format the output as a JSON array of objects: [{ "speaker": "Name", "text": "...", "emotion": "..." }].
      
      Document Text:
      ${text.substring(0, 15000)}
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
    res.status(500).json({ error: error.message || "Internal Server Error during analysis" });
  }
});

app.post("/api/synthesize", async (req, res) => {
  console.log("Received synthesis request for speaker:", req.body?.speaker);
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
    res.status(500).json({ error: error.message || "Internal Server Error during synthesis" });
  }
});

// Global error handler for multer and other middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global Server Error:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: err.message || "Internal Server Error" });
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

startServer().catch(err => {
  console.error("FAILED TO START SERVER:", err);
  process.exit(1);
});
