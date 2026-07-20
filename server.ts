import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini client lazily
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment variables");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // API endpoints
  app.post("/api/storyboard/generate", async (req, res) => {
    try {
      const { topic, genre, mood } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const ai = getGeminiClient();

      const userPrompt = `Generate a vertical 9:16 music video storyboard for:
Topic: "${topic}"
Genre/Style (optional): "${genre || "auto"}"
Mood/Vibe (optional): "${mood || "auto"}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: `You are an expert AI music video storyboard creator and Veo prompt engineer for YouTube Shorts and TikTok (9:16 vertical videos).
You must generate:
1. A Song Title and high-level concept.
2. Full lyrics breakdown/concept.
3. An 8-scene Storyboard. Each scene must last exactly 5 seconds (total 40 seconds) to fit a vertical short.

For each of the 8 scenes, provide:
- sceneNumber: 1 to 8.
- lyricLine: A compelling line of song lyrics sung in this scene in Thai language.
- visualDescription: A description of what is happening visually in Thai language.
- veoPrompt: A highly optimized video generation prompt for Veo in English. It should include camera movement, lighting, visual style, atmosphere, and subjects. e.g. "A cinematic 9:16 shot, camera panning right, low light glowing neon reflections in puddles on a rainy Bangkok street, hyperrealistic, 4k, vaporwave mood".
- cameraMovement: Choose one of these EXACT strings: "pan_right", "tilt_up", "zoom_in", "zoom_out", "orbit", "static", "drone_flyover".
- duration: number (always 5).
- primaryColor: A beautiful Hex color representing the mood of this scene (e.g. "#FF5E62").
- secondaryColor: A beautiful secondary Hex color for highlights (e.g. "#FF9966").
- particleType: Choose one of these EXACT strings: "sparkles", "snow", "waves", "bokeh", "dust", "starfield".

Output strictly valid JSON matching the requested schema.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              genre: { type: Type.STRING },
              mood: { type: Type.STRING },
              lyricConcept: { type: Type.STRING },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sceneNumber: { type: Type.INTEGER },
                    lyricLine: { type: Type.STRING },
                    visualDescription: { type: Type.STRING },
                    veoPrompt: { type: Type.STRING },
                    cameraMovement: { type: Type.STRING },
                    duration: { type: Type.INTEGER },
                    primaryColor: { type: Type.STRING },
                    secondaryColor: { type: Type.STRING },
                    particleType: { type: Type.STRING },
                  },
                  required: [
                    "sceneNumber", "lyricLine", "visualDescription", "veoPrompt",
                    "cameraMovement", "duration", "primaryColor", "secondaryColor", "particleType"
                  ],
                },
              },
            },
            required: ["title", "genre", "mood", "lyricConcept", "scenes"],
          },
        },
      });

      if (!response.text) {
        throw new Error("No response from Gemini");
      }

      const data = JSON.parse(response.text.trim());
      res.json(data);
    } catch (error: any) {
      console.error("Storyboard generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate storyboard" });
    }
  });

  // Serve Vite in dev mode, Static in prod mode
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
