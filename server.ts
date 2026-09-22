import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for Gemini AI client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({ apiKey });
}

// Health route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

/**
 * /api/chat - RouteSense Transit Assistant powered by Google Gemini
 * Supports:
 * - gemini-3.5-flash (general tasks & maps/search grounding)
 * - gemini-3.1-pro-preview (complex analytical, scheduling, fleet optimization)
 * - gemini-3.1-flash-lite (fast lightweight queries)
 * - Google Search grounding via googleSearch tool
 * - Google Maps grounding via googleMaps tool
 */
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages = [],
      role = 'passenger',
      preferredModel,
      grounding = 'none', // 'none' | 'search' | 'maps'
      contextData = {},
    } = req.body;

    const ai = getGeminiClient();

    // Select model according to system instructions
    let modelName = 'gemini-3.5-flash';
    if (preferredModel === 'gemini-3.1-pro-preview') {
      modelName = 'gemini-3.1-pro-preview';
    } else if (preferredModel === 'gemini-3.1-flash-lite') {
      modelName = 'gemini-3.1-flash-lite';
    } else if (preferredModel === 'gemini-3.5-flash') {
      modelName = 'gemini-3.5-flash';
    } else {
      // Default: if grounding is requested or general, use gemini-3.5-flash
      modelName = 'gemini-3.5-flash';
    }

    // Role-specific System Instructions
    let roleDescription = '';
    switch (role) {
      case 'conductor':
        roleDescription = `You are RouteSense Conductor Copilot. You assist bus conductors with on-board rapid ticketing, fare calculations, cash reconciliation, passenger count audits, and passenger guidance. Be concise, direct, helpful, and support Indian rupee (₹) fare calculations.`;
        break;
      case 'driver':
        roleDescription = `You are RouteSense Driver Navigator & Safety Assistant. You assist public transit bus drivers with turn-by-turn awareness, upcoming stop ETAs, speed safety guidelines, mechanical breakdown guidance, and incident reporting procedures. Keep replies concise and safe for in-cab operation.`;
        break;
      case 'operations_manager':
        roleDescription = `You are RouteSense Fleet Operations Director AI. You assist transit operations managers in monitoring network on-time performance, resolving vehicle breakdowns and corridor bottlenecks, analyzing digital vs cash ridership revenues, evaluating 7-day recurring issues, and scheduling optimal headways. Provide structured, analytical, data-driven answers.`;
        break;
      case 'passenger':
      default:
        roleDescription = `You are RouteSense Passenger Transit Assistant. You assist city commuters in finding bus routes, scheduled stops, fare pricing, live vehicle ETAs, nearby transit landmarks, bus stations, and directions across the city transit grid. Provide friendly, clear, easy-to-read commuting advice.`;
        break;
    }

    const systemInstruction = `${roleDescription}
Current Context:
Active Transit System: RouteSense Transit Network (Routes 101, 102, 103, 104, 105).
Current Date/Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.
${contextData?.activeRoute ? `User Active Route: ${JSON.stringify(contextData.activeRoute)}` : ''}
${contextData?.nearbyStops ? `Nearby Stops: ${JSON.stringify(contextData.nearbyStops)}` : ''}
${contextData?.activeTrip ? `Active Trip Telemetry: ${JSON.stringify(contextData.activeTrip)}` : ''}

Always maintain persona, format lists and tables cleanly with Markdown, highlight stop names and fares in bold, and cite grounded sources accurately.`;

    // Configure tools for Search and Maps grounding
    // Per Gemini API skill:
    // googleSearch: {}
    // googleMaps: {} (only supported with gemini-3.5-flash or gemini-2.5)
    const tools: any[] = [];

    if (grounding === 'search') {
      tools.push({ googleSearch: {} });
      // Search works best on gemini-3.5-flash
      if (modelName !== 'gemini-3.5-flash') {
        modelName = 'gemini-3.5-flash';
      }
    } else if (grounding === 'maps') {
      tools.push({ googleMaps: {} });
      // Maps grounding requires gemini-3.5-flash or gemini-2.5
      modelName = 'gemini-3.5-flash';
    }

    // Convert multi-turn history to Gemini contents structure
    // Valid roles: 'user' | 'model'
    const contents: any[] = [];

    for (const msg of messages) {
      const msgRole = msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user';
      contents.push({
        role: msgRole,
        parts: [{ text: msg.content }],
      });
    }

    // If contents is empty, add a default query
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Hello, can you help me with the transit system?' }],
      });
    }

    const config: any = {
      systemInstruction,
    };

    if (tools.length > 0) {
      config.tools = tools;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config,
    });

    const candidate = response.candidates?.[0];
    const replyText = response.text || candidate?.content?.parts?.[0]?.text || 'No response generated.';

    // Extract grounding metadata if present (Google Search or Google Maps citations)
    const groundingMetadata = candidate?.groundingMetadata;
    const searchChunks = groundingMetadata?.groundingChunks || [];
    const webSearchQueries = groundingMetadata?.webSearchQueries || [];

    const citations: any[] = [];
    if (Array.isArray(searchChunks)) {
      for (const chunk of searchChunks) {
        if (chunk.web?.uri) {
          citations.push({
            title: chunk.web.title || 'Web Reference',
            url: chunk.web.uri,
            source: 'Google Search',
          });
        }
        if (chunk.maps?.uri || chunk.maps?.title) {
          citations.push({
            title: chunk.maps.title || 'Location / Map Pin',
            url: chunk.maps.uri,
            source: 'Google Maps',
          });
        }
      }
    }

    res.json({
      role: 'model',
      content: replyText,
      modelUsed: modelName,
      groundingType: grounding,
      citations,
      groundingMetadata,
      webSearchQueries,
    });
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process chat with Gemini.',
      details: error.toString(),
    });
  }
});

/**
 * Web static serving & Vite integration
 * Automatically serves the Flutter Web application from build/web if present,
 * or falls back to Vite middleware for development preview.
 */
async function startServer() {
  const flutterWebPath = path.join(process.cwd(), 'build', 'web');
  const hasFlutterWeb = fs.existsSync(flutterWebPath) && fs.existsSync(path.join(flutterWebPath, 'index.html'));

  if (hasFlutterWeb) {
    console.log(`Serving RouteSense Flutter Web application from: ${flutterWebPath}`);
    app.use(express.static(flutterWebPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(flutterWebPath, 'index.html'));
    });
  } else if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RouteSense Transit Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
