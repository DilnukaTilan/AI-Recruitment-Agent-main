import { FEEDBACK_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const TYPE_TO_CATEGORY = {
  Technical: "TechnicalSkills",
  Behavioral: "Behavioral",
  Experience: "Experience",
  "Problem-Solving": "ProblemSolving",
  Leadership: "Leadership",
};

const ALWAYS_INCLUDED_CATEGORIES = ["Communication"];

function buildRatingConfig(interviewTypes) {
  const types = Array.isArray(interviewTypes)
    ? interviewTypes.map((t) => t.trim())
    : typeof interviewTypes === "string"
      ? interviewTypes.split(",").map((t) => t.trim())
      : [];

  const mappedCategories = types.map(
    (t) => TYPE_TO_CATEGORY[t] ?? t.replace(/\s+/g, ""),
  );
  const allCategories = [
    ...new Set([...mappedCategories, ...ALWAYS_INCLUDED_CATEGORIES]),
  ];

  const ratingSchema = Object.fromEntries(allCategories.map((c) => [c, 0]));

  return { allCategories, ratingSchema };
}

export async function POST(req) {
  const { conversation, interviewTypes } = await req.json();

  if (!conversation) {
    return NextResponse.json(
      { error: "Missing required field: conversation" },
      { status: 400 },
    );
  }

  if (!process.env.GOOGLE_API_KEY) {
    return NextResponse.json(
      { error: "Server misconfiguration: GOOGLE_API_KEY is not set" },
      { status: 500 },
    );
  }

  const { allCategories, ratingSchema } = buildRatingConfig(interviewTypes);

  const FINAL_PROMPT = FEEDBACK_PROMPT.replace("{{conversation}}", conversation)
    .replace("{{categories}}", allCategories.join(", "))
    .replace("{{ratingSchema}}", JSON.stringify(ratingSchema, null, 6));

  console.log("FEEDBACK categories:", allCategories);

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    const completion = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: FINAL_PROMPT,
      config: {
        responseMimeType: "application/json",
      },
    });

    return NextResponse.json({ content: completion.text });
  } catch (e) {
    console.error("Feedback generation error:", e);
    return NextResponse.json(
      { error: e.message || "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
