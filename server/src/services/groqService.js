import Groq from "groq-sdk";

class GroqService {
    constructor() {
        if (!process.env.GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is not defined in environment variables");
        }
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        // Using llama-3.3-70b-versatile as the default model (free tier)
        this.defaultModel = "llama-3.3-70b-versatile";
    }

    async callPlanner(userQuery, previousIssues = []) {
        try {
            const prompt = this.buildPlannerPrompt(userQuery, previousIssues);
            const chatCompletion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                model: this.defaultModel,
                temperature: 0.7,
                max_tokens: 2048,
            });

            const text = chatCompletion.choices[0]?.message?.content || "";

            return {
                response: text,
                tokens: chatCompletion.usage?.total_tokens || this.estimateTokens(text)
            };
        } catch (error) {
            console.error("Planner API Error:", error);
            throw new Error(`Planner call failed: ${error.message}`);
        }
    }

    async callResearcher(userQuery, plannerResponse) {
        try {
            const prompt = this.buildResearcherPrompt(userQuery, plannerResponse);
            const chatCompletion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                model: this.defaultModel,
                temperature: 0.5,
                max_tokens: 1024,
                response_format: { type: "json_object" },
            });

            const text = chatCompletion.choices[0]?.message?.content || "";

            // Parse JSON response
            const parsed = this.parseResearcherResponse(text);
            return {
                ...parsed,
                tokens: chatCompletion.usage?.total_tokens || this.estimateTokens(text)
            };
        } catch (error) {
            console.error("Researcher API Error:", error);
            throw new Error(`Researcher call failed: ${error.message}`);
        }
    }

    buildPlannerPrompt(userQuery, previousIssues) {
        return `You are the Planner AI. Improve your response based on the researcher's feedback.

User Query: "${userQuery}"

${previousIssues.length > 0
                ? `Previous Issues to Address:\n${previousIssues
                    .map((issue, i) => `${i + 1}. ${issue}`)
                    .join("\n")}`
                : "No previous issues. Provide your best initial response."
            }

Provide a comprehensive, accurate, and helpful response to the user query.`;
    }

    buildResearcherPrompt(userQuery, plannerResponse) {
        return `You are the Researcher AI. Evaluate the Planner's response.

User Query: "${userQuery}"

Planner's Response: "${plannerResponse}"

Evaluate for: correctness, clarity, completeness, safety, and relevance.
Return ONLY JSON with this exact format:
{
  "planner_response_summary": "short summary",
  "issues": ["issue1", "issue2"],
  "is_satisfied": false
}

If no issues, return empty issues array and is_satisfied: true.`;
    }

    parseResearcherResponse(text) {
        try {
            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("No valid JSON found in researcher response");
        } catch (error) {
            console.error("Failed to parse researcher response:", error);
            return {
                planner_response_summary: "Parser error",
                issues: ["Failed to parse researcher evaluation"],
                is_satisfied: false
            };
        }
    }

    async ragGenerate(userQuery, context) {
        try {
            const prompt = `You are a helpful AI assistant for an e-commerce dashboard.
Use the following context to answer the user's question.
If the answer is not in the context, say you don't know, but try to be helpful based on the data provided.

Context:
${context}

User Question: ${userQuery}

Answer:`;

            let retries = 0;
            const maxRetries = 3;

            while (retries < maxRetries) {
                try {
                    const chatCompletion = await this.groq.chat.completions.create({
                        messages: [
                            {
                                role: "user",
                                content: prompt,
                            },
                        ],
                        model: this.defaultModel,
                        temperature: 0.7,
                        max_tokens: 1024,
                    });

                    return chatCompletion.choices[0]?.message?.content || "No response generated.";
                } catch (error) {
                    if (error.status === 429 || error.message.includes('429') || error.message.includes('Too Many Requests')) {
                        retries++;
                        const delay = retries * 5000; // 5s, 10s, 15s
                        console.warn(`⚠️ Groq Rate Limit (429). Retrying attempt ${retries}/${maxRetries} in ${delay / 1000}s...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    throw error;
                }
            }
            throw new Error(`RAG generation failed after ${maxRetries} retries due to rate limits.`);
        } catch (error) {
            console.error("RAG Generation Error:", error);
            throw new Error(`RAG generation failed: ${error.message}`);
        }
    }

    estimateTokens(text) {
        // Rough estimation: 1 token ≈ 4 characters for English text
        return Math.ceil(text.length / 4);
    }
}

export default new GroqService();
