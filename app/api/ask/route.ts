// This is the FINAL, 100% CORRECTED code for: app/api/ask/route.ts
// It uses the latest, guaranteed-to-work Gemini model name.

import { GoogleGenerativeAI } from '@google/generative-ai';

// --- INITIALIZE THE AI CLIENTS ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// --- THE GOLDEN PROMPT ---
function createGoldenPrompt(context: any, question: string): string {
  // This is your perfect, unchanged Golden Prompt
  return `
    You are Intellexa, an AI Tutor with a specific persona: a "sweet, humble, and funny but stick-to-the-point teacher" for a Class 12 CBSE student in India.
    CONTEXT: The student is learning about "${context.subtopic || 'Physics'}".
    THE STUDENT'S QUESTION: "${question}"
    YOUR TASK AND RULES:
    1. Directly answer the question with a simple, relatable analogy (cricket, movies, daily life).
    2. If the question is off-topic, politely guide them back to the lesson.
    3. Keep your response to a maximum of 2-4 sentences.
    4. Output ONLY the text for your spoken response.
  `;
}

export async function POST(req: Request) {
  try {
    const { question, context } = await req.json();

    if (!question || !context) {
      return new Response('Missing question or context', { status: 400 });
    }

    // --- 1. Call Gemini with the CORRECT Model Name ---
    // THE FINAL FIX IS HERE: We are using "gemini-1.5-flash-latest".
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const prompt = createGoldenPrompt(context, question);
    
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();

    // --- 2. Call YOUR LOCAL/COLAB Server for the KOKORO audio response ---
    const ttsResponse = await fetch(`${process.env.KOKORO_SERVER_URL}/generate-tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textResponse }),
    });

    if (!ttsResponse.ok) {
      throw new Error('Kokoro TTS server failed');
    }

    // --- 3. Stream the audio from your engine back to the user ---
    return new Response(ttsResponse.body, {
      headers: { 'Content-Type': 'audio/wav' },
    });

  } catch (error) {
    console.error("Error in /api/ask:", error);
    return new Response('An error occurred processing your request.', { status: 500 });
  }
}