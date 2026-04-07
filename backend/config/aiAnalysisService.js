/**
 * config/aiAnalysisService.js - AI Resume Analysis Engine
 *
 * WHAT: Sends extracted resume text to Hugging Face and returns a structured
 *       analysis payload for scoring, strengths, weaknesses, and feedback.
 * HOW:  Prompts a Hugging Face text-generation model to return strict JSON,
 *       then validates and normalizes the response before persisting it.
 * WHY:  The application now relies on Hugging Face for the analysis itself,
 *       so missing keys or model errors fail fast instead of falling back to
 *       local heuristics.
 */

const axios = require("axios");

const HUGGINGFACE_MODEL = "mistralai/Mistral-7B-Instruct-v0.1";
const ALLOWED_EXPERIENCE_LEVELS = [
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Executive",
  "Unknown",
];
const ANALYSIS_VERSION = "2.0";

const DEFAULT_ANALYSIS = {
  overallScore: 0,
  scoreBreakdown: {
    formatting: 0,
    keywords: 0,
    experience: 0,
    education: 0,
    skills: 0,
  },
  skillsFound: [],
  missingKeywords: [],
  strengths: [],
  weaknesses: [],
  suggestions: [],
  overallFeedback: "",
  detectedJobTitle: "Not detected",
  experienceLevel: "Unknown",
  industryMatch: [],
};

const toArray = (value) => {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
};

const clampScore = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(100, Math.round(numericValue)));
};

const extractJsonPayload = (text) => {
  if (typeof text !== "string") return null;

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  return text.slice(firstBrace, lastBrace + 1);
};

const normalizeAnalysisResponse = (rawData) => {
  const analysis = {
    ...DEFAULT_ANALYSIS,
    ...rawData,
  };

  const scoreBreakdown =
    rawData && typeof rawData.scoreBreakdown === "object"
      ? rawData.scoreBreakdown
      : {};

  analysis.overallScore = clampScore(rawData?.overallScore);
  analysis.scoreBreakdown = {
    formatting: clampScore(scoreBreakdown.formatting),
    keywords: clampScore(scoreBreakdown.keywords),
    experience: clampScore(scoreBreakdown.experience),
    education: clampScore(scoreBreakdown.education),
    skills: clampScore(scoreBreakdown.skills),
  };
  analysis.skillsFound = toArray(rawData?.skillsFound);
  analysis.missingKeywords = toArray(rawData?.missingKeywords);
  analysis.strengths = toArray(rawData?.strengths);
  analysis.weaknesses = toArray(rawData?.weaknesses);
  analysis.suggestions = toArray(rawData?.suggestions).slice(0, 6);
  analysis.overallFeedback =
    typeof rawData?.overallFeedback === "string"
      ? rawData.overallFeedback.trim()
      : "";
  analysis.detectedJobTitle =
    typeof rawData?.detectedJobTitle === "string" &&
    rawData.detectedJobTitle.trim()
      ? rawData.detectedJobTitle.trim()
      : "Not detected";
  analysis.experienceLevel = ALLOWED_EXPERIENCE_LEVELS.includes(
    rawData?.experienceLevel,
  )
    ? rawData.experienceLevel
    : "Unknown";
  analysis.industryMatch = toArray(rawData?.industryMatch);

  return analysis;
};

const analyzeWithHuggingFace = async (resumeText) => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY is required for resume analysis.");
  }

  const prompt = `You are an expert resume reviewer.
Analyze the resume text and return ONLY valid JSON with this exact shape:
{
  "overallScore": 0-100 integer,
  "scoreBreakdown": { "formatting": 0-100, "keywords": 0-100, "experience": 0-100, "education": 0-100, "skills": 0-100 },
  "skillsFound": ["string"],
  "missingKeywords": ["string"],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "suggestions": ["string"],
  "overallFeedback": "3-4 concise sentences",
  "detectedJobTitle": "string",
  "experienceLevel": "Entry Level|Mid Level|Senior Level|Executive|Unknown",
  "industryMatch": ["string"]
}

Rules:
- Return JSON only. No markdown, no code fences, no explanations.
- Keep arrays short and relevant.
- Score the resume based on the supplied text only.
- If a field is not clearly supported, use an empty array or "Not detected".

Resume text:
${resumeText.substring(0, 6000)}`;

  const response = await axios.post(
    `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`,
    {
      inputs: prompt,
      parameters: {
        max_new_tokens: 700,
        temperature: 0.2,
        return_full_text: false,
      },
      options: {
        wait_for_model: true,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    },
  );

  const generatedText = Array.isArray(response.data)
    ? response.data[0]?.generated_text
    : response.data?.generated_text;

  if (!generatedText || typeof generatedText !== "string") {
    throw new Error("Hugging Face returned an unexpected response.");
  }

  const jsonPayload = extractJsonPayload(generatedText);
  if (!jsonPayload) {
    throw new Error("Hugging Face response did not contain valid JSON.");
  }

  try {
    return normalizeAnalysisResponse(JSON.parse(jsonPayload));
  } catch (parseError) {
    throw new Error(
      `Failed to parse Hugging Face analysis JSON: ${parseError.message}`,
    );
  }
};

// ── Main exported analysis function ──────────────────────────────────────────
const analyzeResume = async (resumeText) => {
  const startTime = Date.now();

  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error(
      "Resume text is too short or could not be extracted from the PDF.",
    );
  }

  const analysis = await analyzeWithHuggingFace(resumeText);

  const processingTimeMs = Date.now() - startTime;

  return {
    ...analysis,
    processingTimeMs,
    aiModel: `huggingface/${HUGGINGFACE_MODEL}`,
    analysisVersion: ANALYSIS_VERSION,
  };
};

module.exports = { analyzeResume };
