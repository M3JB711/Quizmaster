import { QuizConfig, QuizQuestion, FileData } from "../types";

export const generateQuiz = async (
  files: FileData[],
  config: QuizConfig
): Promise<QuizQuestion[]> => {
  
  try {
    // Call the serverless function
    const response = await fetch("/.netlify/functions/generate-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files,
        config
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as QuizQuestion[];

  } catch (error: any) {
    console.error("Quiz Generation Error:", error);
    throw new Error(error.message || "Failed to generate quiz. Please try again.");
  }
};