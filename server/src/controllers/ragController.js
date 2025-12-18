
import { Pinecone } from "@pinecone-database/pinecone";
import embeddingService from "../services/embeddingService.js";
import groqService from "../services/groqService.js";
import { asyncHandler, sendResponse, statusType } from "../utils/index.js";

// Configuration (Should be in env)
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
const NAMESPACE = "orders-ns";

// Initialize Pinecone
const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const index = pinecone.Index(PINECONE_INDEX_NAME);

export const askAI = asyncHandler(async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return sendResponse(res, false, null, "Query is required", statusType.BAD_REQUEST);
    }

    try {
        console.log(`🔍 Processing RAG query: "${query}"`);

        // 1. Generate Embedding
        const embedding = await embeddingService.getEmbedding(query);

        // 2. Query Pinecone
        const queryResponse = await index.namespace(NAMESPACE).query({
            vector: embedding,
            topK: 5,
            includeMetadata: true
        });

        const matches = queryResponse.matches || [];
        console.log(`✅ Found ${matches.length} matches in Pinecone`);

        // 3. Construct Context
        const context = matches.map(match => {
            const data = match.metadata;
            // Format context nicely
            return `Order ID: ${data.order_id}, Product ID: ${data.product_id}, Price: $${data.price_usd}, Created: ${data.created_at}`;
        }).join("\n");

        if (!context) {
            return sendResponse(res, true, { answer: "I couldn't find any relevant data to answer your question." }, "No context found", statusType.OK);
        }

        // 4. Generate Answer with Groq
        const answer = await groqService.ragGenerate(query, context);

        return sendResponse(res, true, { answer, context: matches }, "Answer generated successfully", statusType.OK);

    } catch (error) {
        console.error("Ask AI Error:", error);
        return sendResponse(res, false, null, "Failed to generate answer", statusType.INTERNAL_SERVER_ERROR);
    }
});
