import { GoogleGenAI, Type } from "@google/genai";
import { RepoAnalysis } from "../types";

// Helper to parse GitHub URL
function parseGithubUrl(url: string): { owner: string, repo: string } | null {
  try {
    const cleanUrl = url.replace(/\/$/, '');
    const parts = cleanUrl.split('github.com/');
    if (parts.length < 2) return null;
    const pathParts = parts[1].split('/');
    if (pathParts.length < 2) return null;
    return { owner: pathParts[0], repo: pathParts[1] };
  } catch (e) {
    return null;
  }
}

export async function analyzeRepository(repoName: string, references: string): Promise<RepoAnalysis> {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined") {
    throw new Error("API Key is missing. Please add 'API_KEY' to your environment variables.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Clean inputs
    const cleanRepoName = repoName.replace("https://github.com/", "").replace(/\/$/, "");
    const repoDetails = parseGithubUrl(repoName.startsWith('http') ? repoName : `https://github.com/${repoName}`);

    if (!repoDetails) {
      throw new Error("Invalid GitHub URL format.");
    }

    // 1. Call our Python ML Backend to get scores and file tree
    let mlData;
    try {
      // Use an environment variable for production (e.g. deployed on Vercel), fallback to relative for local Vite proxy
      // @ts-expect-error - Vite defines import.meta.env
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const endpoint = `${backendUrl}/api/analyze`;

      const mlResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner: repoDetails.owner, repo: repoDetails.repo })
      });

      if (!mlResponse.ok) {
        let errMessage = `HTTP Error ${mlResponse.status} from ML Backend`;
        const errText = await mlResponse.text();
        try {
          if (errText) {
            const errJson = JSON.parse(errText);
            if (errJson && errJson.detail) errMessage = errJson.detail;
            else errMessage = errText;
          }
        } catch {
          if (errText) errMessage = errText;
        }
        throw new Error(errMessage);
      }

      mlData = await mlResponse.json();
    } catch (e: any) {
      throw new Error(`Failed to communicate with ML Backend: ${e.message || String(e)}`);
    }

    const fileTreePaths = mlData.file_tree;
    const mlScores = mlData.scores;

    // 2. We still use Gemini for natural language generation (Overview, Recommendations)
    const fileTreeContext = `
    REPOSITORY: ${cleanRepoName}
    
    ACTUAL FILE TREE (Most relevant files):
    ${fileTreePaths.join('\n')}
    `;

    // Schema definition for the text parts
    const schema = {
      type: Type.OBJECT,
      properties: {
        overview: {
          type: Type.OBJECT,
          properties: {
            whatItDoes: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
            topDependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
            howToRun: { type: Type.ARRAY, items: { type: Type.STRING } },
            architectureOverview: { type: Type.STRING },
            architectureLayers: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        keyFolders: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              path: { type: Type.STRING },
              explanation: { type: Type.STRING }
            }
          }
        },
        recommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING },
              affectedFiles: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    };

    const prompt = `
      You are an elite Senior Software Architect. Analyze the GitHub repository "${cleanRepoName}".
      
      Use the following REAL DATA:
      ${fileTreeContext}
      
      Goal: Provide a CRITICAL technical audit overview and recommendations.
      
      1. **Overview**: Deduce purpose, audience, stack.
         - **How to Run**: Provide a specific array of shell commands to setup and start the project. 
      2. **Recommendations**: Provide actionable recommendations based on the file tree structure. For each recommendation, the "type" property MUST be exactly one of: "Issue", "Automation", or "Refactor".

      
      CRITICAL: Be concise. Return JSON only.
    `;

    const generateWithRetry = async (retries = 1) => {
      try {
        return await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: schema,
            thinkingConfig: { thinkingBudget: 0 }
          }
        });
      } catch (e) {
        if (retries > 0) {
          await new Promise(r => setTimeout(r, 1000));
          return generateWithRetry(retries - 1);
        }
        throw e;
      }
    };

    const response = await Promise.race([
      generateWithRetry(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Gemini API timeout.")), 60000))
    ]);

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini API.");

    const analysis = JSON.parse(text) as RepoAnalysis;

    // Inject ML Scores and metadata
    analysis.scores = mlScores;

    // Fetch minimal metadata independently for UI layout
    let apiMetadata: any = null;
    try {
      const metaRes = await fetch(`https://api.github.com/repos/${repoDetails.owner}/${repoDetails.repo}`);
      if (metaRes.ok) apiMetadata = await metaRes.json();
    } catch (e) { }

    analysis.repoDetails = {
      name: apiMetadata?.full_name || repoName,
      description: apiMetadata?.description || "No description",
      ownerAvatar: apiMetadata?.owner?.avatar_url || "",
      stars: apiMetadata?.stargazers_count || 0,
      forks: apiMetadata?.forks_count || 0,
      issues: apiMetadata?.open_issues_count || 0,
      url: apiMetadata?.html_url || `https://github.com/${repoName}`
    };

    analysis.fileTree = fileTreePaths.sort();

    if (!analysis.recommendations) analysis.recommendations = [];

    return analysis;

  } catch (error: any) {
    console.error("API Error:", error);
    throw new Error(error.message || "An unknown error occurred during analysis.");
  }
}