import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { processIncomingMessages } from './utils';

export const dynamic = 'force-dynamic';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY ?? '',
});

/** Short id only; @ai-sdk/google prepends `models/` for the API. */
const GEMINI_CHAT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export async function POST(req) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: 'Server misconfiguration: GEMINI_API_KEY is not set.' },
        { status: 500 },
      );
    }

    const messages = await processIncomingMessages(req);

    const result = await streamText({
      model: google(GEMINI_CHAT_MODEL),
      maxTokens: 512,
      messages: [
        {
          role: 'system',
          content:
            "I'm happy to assist you in any way I can. How can I be of service today?",
        },
        ...messages,
      ],
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        console.error('[chat-multimedia] stream error:', error);
        return error instanceof Error ? error.message : 'Stream failed';
      },
    });
  } catch (error) {
    console.error('[chat-multimedia] request error:', error);
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}