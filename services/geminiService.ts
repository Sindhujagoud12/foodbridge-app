import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, Donation, MatchResult, RecipientNeed } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to reliably parse JSON even if the model wraps it in Markdown
const parseResponse = (text: string) => {
  try {
    // Attempt clean parse
    return JSON.parse(text);
  } catch (e) {
    // Attempt to strip markdown code blocks
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }
};

export const analyzeFoodImage = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = getClient();
  
  // Remove data URL prefix if present for the raw data
  const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `You are an expert food safety AI. Analyze this image.
            Return a VALID JSON object with this exact structure:
            {
              "food_items": [
                {
                  "item": "Name",
                  "quantity": "Estimate",
                  "expiry_estimate": "Time",
                  "category": "Type (Produce, Canned, Prepared Meal, Bakery, Other)",
                  "safety_check": "Pass/Fail"
                }
              ]
            }
            Do NOT include markdown formatting.`
          },
          {
            inlineData: {
              mimeType: 'image/jpeg', 
              data: base64Data
            }
          }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (response.text) {
      return parseResponse(response.text) as AnalysisResult;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return {
      food_items: [],
      error: (error as Error).message
    };
  }
};

export const matchDonations = async (donations: Donation[], needs: RecipientNeed[]): Promise<MatchResult> => {
  const ai = getClient();

  // CRITICAL: Strip the base64 imageUrl to avoid sending massive payloads to the text model
  // The logic model only needs metadata (item, category, expiry), not the pixel data.
  const sanitizedDonations = donations.map(({ imageUrl, ...rest }) => rest);

  const prompt = `
    Act as a smart logistics coordinator.
    
    Available Donations:
    ${JSON.stringify(sanitizedDonations, null, 2)}
    
    Recipient Needs:
    ${JSON.stringify(needs, null, 2)}
    
    Task:
    Match donations to needs. Prioritize expiry and category match.
    
    Output a JSON with keys: 'matches' (list) and 'summary' (string).
    Example match object: { "donation_id": 1, "recipient_id": "Name of Recipient", "score": 90, "reasoning": "..." }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (response.text) {
      return parseResponse(response.text) as MatchResult;
    }
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("Gemini Logic Error:", error);
    return {
      matches: [],
      summary: "Error during optimization.",
      error: (error as Error).message
    };
  }
};