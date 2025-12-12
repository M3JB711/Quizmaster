import { GoogleGenAI, Schema, Type } from "@google/genai";

// This runs on the server, so process.env is secure.
// Ensure GEMINI_API_KEY is set in Netlify Environment Variables.
const apiKey = process.env.GEMINI_API_KEY;

const generateQuizSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: "The text of the quiz question."
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A list of 4 possible answers.",
        minItems: 4,
        maxItems: 4
      },
      correctAnswerIndex: {
        type: Type.INTEGER,
        description: "The index (0-3) of the correct answer in the options array."
      },
      explanation: {
        type: Type.STRING,
        description: "A detailed explanation of why the correct answer is correct."
      }
    },
    required: ["question", "options", "correctAnswerIndex", "explanation"]
  }
};

export default async (req: Request) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY");
    return new Response(
      JSON.stringify({ error: "Server misconfigured: Missing API Key" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { files, config } = await req.json();
    
    // Initialize Gemini Client
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const assessmentTitle = config.assessmentType === 'exam' ? 'Comprehensive Final Exam' : 'Quick Quiz';
    const depthInstruction = config.assessmentType === 'exam' 
        ? 'Deeply analyze all provided documents. Create high-level questions that test critical thinking, synthesis of concepts across files, and detailed understanding.' 
        : 'Create questions that test key concepts and basic understanding of the material.';

    // Construct the prompt
    const prompt = `
      You are an expert university professor and exam creator.
      Create a ${assessmentTitle} based strictly on the attached document(s) content.
      
      Context: 
      - The user has provided ${files.length} source file(s).
      - You MUST extract and synthesize information from ALL provided files.
      - Ensure the questions cover topics distributed across all provided materials, not just the first one.
      
      Configuration:
      - Assessment Type: ${config.assessmentType}
      - Number of Questions: ${config.questionCount}
      - Language: ${config.language} (Ensure both questions, options, and explanations are in this language).
      - Difficulty: University level.
      
      Instruction:
      ${depthInstruction}
      
      Format: Return a raw JSON array.
      
      Rules:
      - Ensure exactly 4 options per question.
      - Ensure the correctAnswerIndex matches the correct option.
      - Provide a helpful explanation for learning purposes.
    `;

    // Prepare content parts
    const parts: any[] = [{ text: prompt }];

    // Attach files
    // Note: 'files' comes from the frontend payload
    files.forEach((file: any) => {
      if (file.extractedText) {
        // For PPTX (passed as text from frontend)
        parts.push({
          text: `[Source: ${file.name}] Content:\n${file.extractedText}`
        });
      } else if (file.base64) {
        // For PDF (passed as base64 from frontend)
        const base64Data = file.base64.split(',')[1];
        parts.push({
          inlineData: {
            mimeType: file.type,
            data: base64Data
          }
        });
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Enforce 2.5 Flash for cost/performance
      contents: {
        role: "user",
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: generateQuizSchema,
        temperature: 0.4,
      }
    });

    if (response.text) {
      return new Response(response.text, {
        headers: { "Content-Type": "application/json" }
      });
    } else {
      throw new Error("No response text received from Gemini.");
    }

  } catch (error: any) {
    console.error("Function Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};