import { QUESTIONS_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req) {
  const { jobPosition, jobDescription, duration, type } = await req.json();

  if (!jobPosition || !jobDescription || !duration || !type) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: jobPosition, jobDescription, duration, type",
      },
      { status: 400 },
    );
  }

  const formattedType = Array.isArray(type)
    ? type.join(", ")
    : typeof type === "string"
      ? type
          .split(",")
          .map((t) => t.trim())
          .join(", ")
      : type;

  const FINAL_PROMPT = QUESTIONS_PROMPT.replaceAll(
    "{{jobPosition}}",
    jobPosition,
  )
    .replaceAll("{{jobDescription}}", jobDescription)
    .replaceAll("{{duration}}", duration)
    .replaceAll("{{type}}", formattedType);

  console.log("FINAL_PROMPT: ", FINAL_PROMPT);

  if (!process.env.GOOGLE_API_KEY) {
    return NextResponse.json(
      { error: "Server misconfiguration: GOOGLE_API_KEY is not set" },
      { status: 500 },
    );
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const completion = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: FINAL_PROMPT,
      config: {
        responseMimeType: "application/json",
      },
    });

    const content = completion.text;

    return NextResponse.json({ content });
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      { error: e.message || "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
