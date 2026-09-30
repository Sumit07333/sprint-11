import { GoogleGenAI } from '@google/genai';

/**
 * Serverless API Function: /api/mood
 * Compatible with Vercel, Node, and Container deployments.
 * Isolates GEMINI_API_KEY on the server side.
 */

let geminiClient = null;
function getGeminiClient() {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY is not configured in the server environment.');
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

export default async function handler(req, res) {
  // Enforce POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const userMood = (body.mood || '').trim();

    if (!userMood) {
      return res.status(400).json({ error: 'Mood query cannot be empty.' });
    }

    const ai = getGeminiClient();
    const prompt = `Suggest ONE mainstream, non-explicit movie based on this mood: "${userMood}".

Do not suggest pornography, sexually explicit movies, movies primarily focused on nudity, or clearly adult-only movies.

Return ONLY the movie title as plain text. Do not include markdown, bullet points, years in parentheses, quotes, or explanations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const rawTitle = (response.text || '').trim();

    return res.status(200).json({ title: rawTitle });
  } catch (err) {
    console.error('Serverless error in /api/mood:', err);
    return res.status(500).json({
      error: err.message || 'Failed to process AI mood recommendation.',
    });
  }
}
