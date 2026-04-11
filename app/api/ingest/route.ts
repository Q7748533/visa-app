import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import OpenAI from 'openai';
import { z } from 'zod';

// 延迟初始化 OpenAI 客户端，避免构建时出错
let ai: OpenAI | null = null;
function getAI() {
  if (!ai) {
    ai = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: "https://api.vectorengine.ai/v1"
    });
  }
  return ai;
}

const ingestSchema = z.object({
  iata: z.string().length(3).toUpperCase(),
  rawText: z.string().min(10).max(50000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { iata, rawText } = ingestSchema.parse(body);

    const completion = await getAI().chat.completions.create({
      model: "gemini-3.1-pro-preview",
      messages: [{
        role: "system",
        content: `Extract airport service data for ${iata} into JSON.
        Keys: "luggage" (location, price, hours), "showers" (location, isFree), "sleep" (pods, quietZones), "transit" (train, bus, lastBus).
        ONLY return valid JSON.`
      }, { role: "user", content: rawText }],
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0].message.content || '{}');

    await prisma.airport.upsert({
      where: { iata },
      update: {},
      create: {
        iata,
        name: `${iata} International Airport`,
        city: "TBD",
        country: "TBD",
        slug: `${iata.toLowerCase()}-airport`,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Ingest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
