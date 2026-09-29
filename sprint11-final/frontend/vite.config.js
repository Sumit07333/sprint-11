import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite'; // IMPORT loadEnv here
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy Gemini API Client Helper
let geminiClient = null;
// UPDATE: Accept apiKey as a parameter
function getGeminiClient(apiKey) {
  if (!geminiClient) {
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY is not configured in the server environment.');
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

// UPDATE: Destructure { mode } from the config arguments
export default defineConfig(({ mode }) => {
  // UPDATE: Load environment variables from the .env file
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'gemini-mood-api-server',
        configureServer(server) {
          server.middlewares.use('/api/mood', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
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
                  return res.end(JSON.stringify({ error: 'Mood query cannot be empty.' }));
                }

                // UPDATE: Pass the API key from the loaded env file
                const ai = getGeminiClient(env.GEMINI_API_KEY);
                
                const prompt = `Suggest ONE mainstream, non-explicit movie based on this mood: "${userMood}".

Do not suggest pornography, sexually explicit content, adult-only movies, or movies primarily intended for explicit sexual content.

Return ONLY the movie title as plain text. Do not include markdown, bullet points, years in parentheses, quotes, or explanations.`;

                const response = await ai.models.generateContent({
                  model: 'gemini-3.6-flash', // Make sure this model string matches the @google/genai SDK requirements (often 'gemini-2.5-flash')
                  contents: prompt,
                });

                const rawTitle = (response.text || '').trim();

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ title: rawTitle }));
              } catch (err) {
                console.error('Server error handling /api/mood:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: err.message || 'Failed to process AI mood recommendation.',
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
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});