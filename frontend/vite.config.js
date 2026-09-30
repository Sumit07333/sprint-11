import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy Gemini API Client Helper
let geminiClient = null;

function getGeminiClient(apiKey) {
  if (!geminiClient) {
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (
      !key ||
      key === 'MY_GEMINI_API_KEY' ||
      key === 'your_gemini_api_key_here'
    ) {
      throw new Error(
        'GEMINI_API_KEY is not configured in the server environment.'
      );
    }

    geminiClient = new GoogleGenAI({ apiKey: key });
  }

  return geminiClient;
}

export default defineConfig(({ mode }) => {
  // Load environment variables from .env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),

      // Gemini Mood API for local Vite development
      {
        name: 'gemini-mood-api-server',

        configureServer(server) {
          server.middlewares.use('/api/mood', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');

              return res.end(
                JSON.stringify({
                  error: 'Method Not Allowed',
                })
              );
            }

            let body = '';

            req.on('data', (chunk) => {
              body += chunk;
            });

            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const userMood = (parsed.mood || '').trim();

                if (!userMood) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');

                  return res.end(
                    JSON.stringify({
                      error: 'Mood query cannot be empty.',
                    })
                  );
                }

                const ai = getGeminiClient(
                  env.GEMINI_API_KEY || process.env.GEMINI_API_KEY
                );

                const prompt = `Suggest ONE mainstream, non-explicit movie based on this mood: "${userMood}".

Do not suggest pornography, sexually explicit content, adult-only movies, or movies primarily intended for explicit sexual content.

Return ONLY the movie title as plain text. Do not include markdown, bullet points, years in parentheses, quotes, or explanations.`;

                const response = await ai.models.generateContent({
                  model: 'gemini-3.8-flash',
                  contents: prompt,
                });

                const rawTitle = (response.text || '').trim();

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');

                return res.end(
                  JSON.stringify({
                    title: rawTitle,
                  })
                );
              } catch (err) {
                console.error(
                  'Server error handling /api/mood:',
                  err
                );

                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');

                return res.end(
                  JSON.stringify({
                    error:
                      err.message ||
                      'Failed to process AI mood recommendation.',
                  })
                );
              }
            });
          });
        },
      },
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: true,

      // Only API routes that belong to the Express backend
      // are proxied to port 5000.
      proxy: {
        '/api/posts': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
        },

        '/api/users': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
      },

      hmr: env.DISABLE_HMR !== 'true',

      watch:
        env.DISABLE_HMR === 'true'
          ? null
          : {},
    },
  };
});