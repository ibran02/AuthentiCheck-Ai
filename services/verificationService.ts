import { GoogleGenAI, Type } from "@google/genai";
import type { VerificationResult } from '../types';
import { ProductStatus } from '../types';

// Helper function to convert File to a base64 string and get MIME type
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // The result includes the data URL prefix, so we need to remove it.
      resolve((reader.result as string).split(',')[1]);
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const verificationSchema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      enum: [ProductStatus.AUTHENTIC, ProductStatus.COUNTERFEIT],
      description: 'The verification status of the product.'
    },
    confidence: {
      type: Type.NUMBER,
      description: 'The confidence score of the verification, from 0 to 100.'
    },
    brand: {
      type: Type.STRING,
      description: 'The brand name of the product identified from the image.'
    },
    model: {
      type: Type.STRING,
      description: 'The model name or identifier of the product.'
    },
    reasons: {
      type: Type.ARRAY,
      description: 'A list of reasons supporting the verification status.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'A short title for the analysis point (e.g., "Logo Authenticity").'
          },
          details: {
            type: Type.STRING,
            description: 'A detailed explanation of the finding for this point.'
          },
          passed: {
            type: Type.BOOLEAN,
            description: 'Whether this specific check passed (true) or failed (false).'
          }
        },
        required: ['title', 'details', 'passed']
      }
    }
  },
  required: ['status', 'confidence', 'brand', 'model', 'reasons']
};

export const verifyProduct = async (imageFile: File): Promise<Omit<VerificationResult, 'imageUrl'>> => {
  const imagePart = await fileToGenerativePart(imageFile);
  
  const prompt = `
    You are an expert in authenticating products. Analyze the provided image to determine if the product is authentic or counterfeit. Your analysis must be thorough and follow these steps:

    1.  **Product Identification:** First, identify the product's brand and model from the image.
    2.  **Visual Authenticity Check:** Carefully examine key physical markers. This includes the quality and placement of the logo, stitching patterns, material texture and color, and overall build quality.
    3.  **In-depth OCR Analysis:** Perform Optical Character Recognition (OCR) on all visible text on the product, its label, and packaging.
        - Extract every piece of text, including brand name, model, serial numbers, country of origin, and any descriptive text.
        - Critically compare the extracted text against a database of known authentic product details. Pay close attention to:
            - **Typography:** Does the font match the brand's official font? Are the letter shapes, weight, and kerning correct?
            - **Spelling and Grammar:** Are there any spelling mistakes or grammatical errors? Counterfeits often have typos.
            - **Consistency:** Is the information consistent across the product?
    4.  **Final Verdict:** Based on the combined visual and OCR analysis, provide a final verification status ('Authentic' or 'Counterfeit') and a confidence score (0-100).
    5.  **Detailed Reasoning:** Formulate your response as a JSON object. The 'reasons' array must include specific, distinct points from your analysis. At least one of these reasons must be dedicated to the "OCR & Text Analysis," detailing your findings regarding the text, and whether this check passed or failed. Other reasons should cover visual aspects like "Logo & Branding" or "Material Quality".

    Return ONLY the JSON object that conforms to the provided schema. Do not include any other text or markdown formatting.
  `;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // Using a more advanced model for visual analysis
      contents: {
        parts: [
          { text: prompt },
          imagePart,
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: verificationSchema,
      },
    });

    const jsonString = result.text;
    const verificationData = JSON.parse(jsonString);

    return verificationData;
  } catch (error) {
    console.error("Error verifying product:", error);
    // Throw a more specific error to be handled by the UI
    throw new Error("Failed to get a valid response from the AI. Please try again.");
  }
};

export const verifyProductByBarcode = async (barcode: string): Promise<Omit<VerificationResult, 'imageUrl'>> => {
  const prompt = `
    You are an expert product authenticator. A user has provided a barcode number: "${barcode}". Analyze this barcode to identify the product and assess its likely authenticity. Your analysis must be thorough and follow these steps:

    1.  **Product Identification:** First, identify the product's brand and model associated with this barcode number. Use your knowledge base to determine what product this barcode corresponds to. If the barcode is invalid or doesn't correspond to a known product, state that clearly in your reasoning.
    2.  **Authenticity Assessment:** Based on the identified product, provide an assessment. Since you don't have an image, your reasoning should be based on what a user should look for on the real product.
    3.  **Final Verdict:** Provide a final verification status ('Authentic' or 'Counterfeit') and a confidence score (0-100). This score should be conservative, reflecting the lack of visual data. If you cannot identify the product, lean towards 'Counterfeit' or a low-confidence 'Authentic' status.
    4.  **Detailed Reasoning:** Formulate your response as a JSON object. The 'reasons' array must include specific points. One reason must be "Barcode Lookup," detailing the product you identified (or failed to identify). Another reason should be "Authenticity Pointers," giving the user tips on what to check for visually on the physical product (e.g., "Check for high-quality stitching on the logo").

    Return ONLY the JSON object that conforms to the provided schema. Do not include any other text or markdown formatting.
  `;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: {
        parts: [
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: verificationSchema,
      },
    });

    const jsonString = result.text;
    const verificationData = JSON.parse(jsonString);

    return verificationData;
  } catch (error) {
    console.error("Error verifying product by barcode:", error);
    throw new Error("Failed to get a valid response from the AI for the barcode. Please try again.");
  }
};
