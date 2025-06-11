// frontend/src/app/api/analyze-call/route.ts

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Configuration ---
// IMPORTANT: Make sure GEMINI_API_KEY is accessible here.
// In Next.js, process.env variables are available on the server-side.
const API_KEY = process.env.GEMINI_API_KEY; 
const MODEL_NAME = "gemini-1.5-flash"; // Or gemini-1.5-flash for potentially faster/cheaper transcription

// --- Helper Function: Converts Buffer to a Generative AI Part ---
// This is the same helper function we used in the Node.js backend.
// It's essential for Gemini's inlineData format.
function fileToGenerativePart(buffer: Buffer, mimeType: string) {
    return {
        inlineData: {
            data: buffer.toString('base64'),
            mimeType,
        },
    };
}

// --- API Route: POST handler ---
export async function POST(request: Request) {
    // 1. Validate API Key
    if (!API_KEY) {
        console.error("Server Error: GEMINI_API_KEY is not set.");
        return NextResponse.json({ error: "Server configuration error: API Key missing." }, { status: 500 });
    }

    // 2. Initialize Gemini Model
    const genAI = new GoogleGenerativeAI(API_KEY);
    const multimodalModel = genAI.getGenerativeModel({ model: MODEL_NAME });

    // 3. Process incoming form data (for file upload)
    let audioFile: File | undefined;
    let audioBuffer: Buffer | undefined;
    let mimeType: string | undefined;

    try {
        const formData = await request.formData();
        audioFile = formData.get('audio_file') as File; // 'audio_file' must match the name in your frontend FormData.append()

        if (!audioFile) {
            return NextResponse.json({ error: "No audio file provided in the request." }, { status: 400 });
        }

        // Validate file type
        if (!['audio/mpeg', 'audio/wav'].includes(audioFile.type)) {
            return NextResponse.json({ error: "Invalid file type. Only MP3, WAV are allowed." }, { status: 400 });
        }

        mimeType = audioFile.type;
        audioBuffer = Buffer.from(await audioFile.arrayBuffer()); // Convert File to Buffer

    } catch (error: unknown) {
        console.error("Error processing form data:", error);

        let message = "Unknown error occurred";
        if (error instanceof Error) {
            message = error.message;
        }
        return NextResponse.json({ error: `Failed to process audio file: ${message}` }, { status: 400 });

    }

    // 4. Perform Transcription with Gemini (Step 1)
    console.log(`[Next.js API] Transcribing audio with Gemini: ${audioFile.name}`);
    try {
        const audioPart = fileToGenerativePart(audioBuffer, mimeType as string); // Cast mimeType to string as it's now guaranteed

        const transcriptionPrompt = `
            Transcribe this audio accurately in Hindi.
            Identify and label each speaker as 'Agent' and 'Customer'.
            Format the transcription clearly, indicating who is speaking.
            Example:
            Agent: नमस्ते, मैं आपकी क्या मदद कर सकता हूँ?
            Customer: मुझे अपने बिल के बारे में जानना है।
        `;

        const transcriptionResult = await multimodalModel.generateContent([
            audioPart,
            transcriptionPrompt,
        ]);

        const transcription = transcriptionResult.response.text();
        console.log("[Next.js API] Transcription complete:\n", transcription);

        if (!transcription || transcription.trim() === '') {
            return NextResponse.json({ error: 'Could not transcribe audio. Transcription is empty.' }, { status: 400 });
        }

        // 5. Perform Analysis with Gemini (Step 2)
        console.log("[Next.js API] Analyzing transcription with Gemini...");

        // Define your analysis parameters (make sure this matches your requirements)
        const analysisParameters = [
            { key: "greeting", name: "Greeting", weight: 5, desc: "Call opening within 5 seconds", inputType: "PASS_FAIL" },
            { key: "collectionUrgency", name: "Collection Urgency", weight: 15, desc: "Create urgency, cross-questioning", inputType: "SCORE" },
            { key: "rebuttalCustomerHandling", name: "Rebuttal Handling", weight: 15, desc: "Address penalties, objections", inputType: "SCORE" },
            { key: "callEtiquette", name: "Call Etiquette", weight: 15, desc: "Tone, empathy, clear speech", inputType: "SCORE" },
            { key: "callDisclaimer", name: "Call Disclaimer", weight: 5, desc: "Take permission before ending", inputType: "PASS_FAIL" },
            { key: "correctDisposition", name: "Correct Disposition", weight: 10, desc: "Use correct category with remark", inputType: "PASS_FAIL" },
            { key: "callClosing", name: "Call Closing", weight: 5, desc: "Thank the customer properly", inputType: "PASS_FAIL" },
            { key: "fatalIdentification", name: "Identification", weight: 5, desc: "Missing agent/customer info", inputType: "PASS_FAIL" },
            { key: "fatalTapeDiscloser", name: "Tape Disclosure", weight: 10, desc: "Inform customer about recording", inputType: "PASS_FAIL" },
            { key: "fatalToneLanguage", name: "Tone & Language", weight: 15, desc: "No abusive or threatening speech", inputType: "PASS_FAIL" }
            ];

        const parameterDescriptions = analysisParameters.map(p =>
            `- ${p.key} (Weight: ${p.weight}, Type: ${p.inputType}, Name: ${p.name}): ${p.desc}`
        ).join('\n');

        const analysisPrompt = `
            You are an AI assistant tasked with analyzing a call transcript from a debt collection agent and providing structured feedback.
            The transcript involves two speakers, 'Agent' and 'Customer'.
            Analyze the call based on the provided parameters, scoring rules, and return the structured JSON output.

            Here is the call transcript:
            \`\`\`
            ${transcription}
            \`\`\`

            **Parameters for Scoring:**
            ${parameterDescriptions}

            **Scoring Rules:**
            - For parameters with Type that is PASS_FAIL: Score should be either 0 (Fail) or equal to the weight (Pass).
            - For parameters with Type that is SCORE: Score can be any integer between 0 and the weight.
            - Ensure all scores are integers.

            **Output Format (Strict JSON):**
            \`\`\`json
            {
              "scores": {
                // Generate scores for all parameters defined in analysisParameters array with their keys
                "greeting": 0, // Example: Actual score goes here
                "collectionUrgency": 0, // Example: Actual score goes here
                // ... ensure all other parameters from analysisParameters are included with their scores
              },
              "overallFeedback": "Overall assessment of the agent's performance, focusing on key strengths and weaknesses relevant to debt collection.",
              "observation": "Specific critical observations or points of note from the call. Include any customer objections, agent's handling, adherence to script, and missed disclosures/opportunities."
            }
            \`\`\`
            Ensure the JSON is well-formed and strictly adheres to the schema. Do not include any other text outside the JSON block.
        `;

        const analysisResult = await multimodalModel.generateContent({
            contents: [{ 
                role: "user", // <-- ADD THIS LINE
                parts: [{ text: analysisPrompt }] 
            }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1,
            }
        });

        const rawJsonResponse = analysisResult.response.text();
        console.log("[Next.js API] Raw JSON response from Gemini for analysis:\n", rawJsonResponse);

        let parsedAnalysis;
        try {
            parsedAnalysis = JSON.parse(rawJsonResponse);
            // Basic validation for the presence of keys and expected structure
            if (!parsedAnalysis.scores || typeof parsedAnalysis.overallFeedback === 'undefined' || typeof parsedAnalysis.observation === 'undefined') {
                throw new Error("Parsed JSON is missing required fields (scores, overallFeedback, observation).");
            }
        } catch (jsonError: unknown) {
            console.error("[Next.js API] Failed to parse Gemini's JSON response:", jsonError);
            console.error("[Next.js API] Gemini's raw output was:", rawJsonResponse);

            const errorMessage = jsonError instanceof Error
                ? jsonError.message
                : 'Unknown error during JSON parsing';

            return NextResponse.json(
                {
                error: 'Failed to parse AI analysis response. Check server logs.',
                raw_ai_output: rawJsonResponse,
                details: errorMessage
                },
                { status: 500 }
            );
            }


        console.log("[Next.js API] Analysis complete. Sending structured feedback.");
        return NextResponse.json(parsedAnalysis, { status: 200 }); // Return the parsed JSON directly

    } catch (error: any) {
        console.error("[Next.js API] Error during Gemini API calls:", error);
        // Provide more detailed error response for debugging
        if (error.response && error.response.text) {
            console.error("[Next.js API] Gemini raw error text:", error.response.text());
        }
        return NextResponse.json({ error: `Internal server error during analysis: ${error.message || 'Unknown error'}` }, { status: 500 });
    }
}