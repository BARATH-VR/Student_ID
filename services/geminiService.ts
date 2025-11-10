import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { DUMMY_EMAIL_TEMPLATES } from "../constants";

// Initialize the Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTagline = async (role: string, eventName: string): Promise<string> => {
  console.log(`Generating tagline for role: ${role} at event: ${eventName} with Gemini API.`);
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a short, catchy, and inspiring tagline for a person with the role "${role}" at an event called "${eventName}". The tagline should be under 10 words and should not be in quotes.`,
    });
    
    // fix: Use the .text property directly to get the string output from the response.
    const text = response.text.replace(/"/g, ''); // Remove quotes from response if any
    console.log("Generated tagline:", text);
    return text;

  } catch (error) {
    console.error("Error calling Gemini API for tagline generation:", error);
    // Fallback to a default tagline
    return "Innovate. Create. Inspire.";
  }
};

export const enhancePhoto = async (photoDataUrl: string): Promise<string> => {
    console.log("Enhancing photo with Gemini API...");

    if (!photoDataUrl.startsWith('data:image')) {
        throw new Error("Invalid image data URL");
    }

    const [header, base64Data] = photoDataUrl.split(',');
    if (!header || !base64Data) {
        throw new Error("Invalid image data URL format");
    }

    const mimeTypeMatch = header.match(/:(.*?);/);
    if (!mimeTypeMatch || !mimeTypeMatch[1]) {
        throw new Error("Could not extract MIME type from data URL");
    }
    const mimeType = mimeTypeMatch[1];
    
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: "Enhance this portrait photo for an ID card. Improve lighting, increase sharpness, and remove any minor blemishes, while keeping the person's appearance natural and professional."
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                // fix: According to the guidelines, responseModalities must be an array with a single `Modality.IMAGE` element for this model.
                responseModalities: [Modality.IMAGE],
            },
        });

        // Find the image part in the response
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const enhancedBase64 = part.inlineData.data;
                const enhancedMimeType = part.inlineData.mimeType;
                const newPhotoDataUrl = `data:${enhancedMimeType};base64,${enhancedBase64}`;
                console.log("Photo enhancement complete.");
                return newPhotoDataUrl;
            }
        }
        
        // If no image part is found in the response, throw an error.
        console.error("Enhancement failed: No image data in API response.");
        throw new Error("Photo enhancement failed: No image data returned.");

    } catch (error) {
        console.error("Error calling Gemini API for photo enhancement:", error);
        // Fallback to original image or throw error
        throw error;
    }
};

export const generateBulkEmailBody = async (recipientNames: string[]): Promise<string> => {
  const notificationTemplate = DUMMY_EMAIL_TEMPLATES.find(t => t.id === 'notification');
  if (!notificationTemplate) {
    // Fallback if template is not found
    return `Hello,\n\nYour new digital ID cards for the following participants are ready: ${recipientNames.join(', ')}.\n\nThank you,\nThe CampusID Team`;
  }
  
  const prompt = `
    Based on the following email template for a single user:
    ---
    Subject: ${notificationTemplate.subject}
    Content: ${notificationTemplate.content}
    ---
    
    Now, write a friendly and professional email body to a single recipient (e.g., an administrator or a group leader) to inform them that the digital ID cards for the following people are ready: ${recipientNames.join(', ')}.
    
    Do not include a subject line.
    The email should list the names clearly.
    Adapt the tone from the template for a bulk notification.
    Keep it concise.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for bulk email body generation:", error);
    // Fallback
    return `Hello,\n\nYour new digital ID cards for the following participants are ready:\n\n- ${recipientNames.join('\n- ')}\n\nYou can now distribute them or have the participants access them via the portal.\n\nThank you,\nThe CampusID Team`;
  }
};


export const sendBulkIdsByEmail = async (email: string, subject: string, body: string, idCount: number): Promise<{ success: boolean; message: string }> => {
  console.log(`Simulating sending ${idCount} IDs to ${email}...`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (email && email.includes('@')) {
    console.log("Bulk email sent successfully (mock).");
    return { success: true, message: `${idCount} ID card(s) sent successfully!` };
  } else {
    console.error("Failed to send bulk email: invalid address (mock).");
    return { success: false, message: "Invalid email address provided." };
  }
};