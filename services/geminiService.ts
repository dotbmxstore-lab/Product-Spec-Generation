import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ProductSpecificationsOutput } from "../types";

interface GenerateSpecsOptions {
  productDescription: string;
}

/**
 * Generates product specifications in bullet points for both English and Arabic using the Gemini API.
 * The output is expected in a JSON format.
 * @param {GenerateSpecsOptions} options - The options for generating specifications.
 * @param {string} options.productDescription - The free-form text description of the product.
 * @returns {Promise<ProductSpecificationsOutput>} A promise that resolves with the generated specifications as a structured object.
 */
export const generateProductSpecifications = async ({
  productDescription,
}: GenerateSpecsOptions): Promise<ProductSpecificationsOutput> => {
  // CRITICAL: A new GoogleGenAI instance must be created right before an API call
  // to ensure it always uses the most up-to-date API key from the dialog.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Convert the following product description into a clear, concise, and comprehensive list of product specifications.
  
  The output should be a JSON object with two properties: 'englishSpecs' and 'arabicSpecs'.
  
  Both 'englishSpecs' and 'arabicSpecs' should contain the specifications in bullet points, using the '▪️' character for each bullet.
  
  Focus on key features, functionalities, technical details, and benefits.

Product Description:
${productDescription}

Example format for output (for a simplified example):
{
  "englishSpecs": "▪️ Feature 1: Description in English.\\n▪️ Feature 2: Description in English.",
  "arabicSpecs": "▪️ الميزة 1: الوصف باللغة العربية.\\n▪️ الميزة 2: الوصف باللغة العربية."
}
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // Using a pro model for detailed and complex text tasks.
      contents: prompt,
      config: {
        temperature: 0.7, // Adjust for creativity vs. factual accuracy
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 2048, // Generous token limit for detailed specs
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            englishSpecs: {
              type: Type.STRING,
              description: 'Product specifications in English, formatted with bullet points.',
            },
            arabicSpecs: {
              type: Type.STRING,
              description: 'Product specifications in Arabic, formatted with bullet points.',
            },
          },
          required: ["englishSpecs", "arabicSpecs"],
        },
      }
    });

    const jsonStr = response.text.trim();
    if (!jsonStr) {
      throw new Error("No JSON content received from Gemini API.");
    }
    
    const parsedResponse: ProductSpecificationsOutput = JSON.parse(jsonStr);
    
    // Basic validation to ensure the expected fields are present
    if (typeof parsedResponse.englishSpecs !== 'string' || typeof parsedResponse.arabicSpecs !== 'string') {
        throw new Error("Invalid JSON structure received from Gemini API. Expected 'englishSpecs' and 'arabicSpecs' strings.");
    }

    return parsedResponse;

  } catch (error) {
    console.error("Error generating product specifications:", error);
    throw new Error(`Failed to generate specifications: ${error instanceof Error ? error.message : String(error)}`);
  }
};