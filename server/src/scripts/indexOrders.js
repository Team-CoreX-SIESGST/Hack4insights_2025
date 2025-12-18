
import * as fs from "fs";
import * as path from "path";
import { Pinecone } from "@pinecone-database/pinecone";
import { fileURLToPath } from "url";
import { pipeline } from "@xenova/transformers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === CONFIGURATION ===
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = "quickstart";
const NAMESPACE = "orders-ns";
const BATCH_SIZE = 250; // Larger batches since we are local
const DATA_PATH = path.join(__dirname, "../../../client/public/data/order_items.json");

async function run() {
    try {
        console.log("🚀 Starting RAG indexing for order_items.json (Local Embeddings)...");

        // 1. Load JSON data
        if (!fs.existsSync(DATA_PATH)) {
            throw new Error(`File not found: ${DATA_PATH}`);
        }

        const rawData = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
        console.log(`📦 Loaded ${rawData.length} orders.`);

        if (rawData.length === 0) {
            console.log("⚠️  No data to index. Exiting.");
            return;
        }

        // 2. Initialize clients
        console.log("🔧 Initializing local embedding model (Xenova/all-mpnet-base-v2)...");
        // Create the feature extraction pipeline
        const embedder = await pipeline('feature-extraction', 'Xenova/all-mpnet-base-v2');
        console.log("✅ Local model loaded!");

        const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
        const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);

        // 3. Verify index is ready
        // 3. Verify index is ready (with retries)
        let description;
        let connRetries = 0;
        while (connRetries < 5) {
            try {
                description = await pinecone.describeIndex(PINECONE_INDEX_NAME);
                break;
            } catch (err) {
                connRetries++;
                console.warn(`⚠️ Pinecone connection attempt ${connRetries} failed: ${err.message}. Retrying in 2s...`);
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        if (!description || !description.status?.ready) {
            throw new Error("Pinecone index is not ready or reachable after 5 attempts.");
        }
        console.log(`✅ Connected to Pinecone index: ${PINECONE_INDEX_NAME} (768 dim)`);

        // 4. Batch processing (Pipelined)
        const total = rawData.length;
        let activeUpsertPromise = Promise.resolve(); // Track the previous upsert

        for (let i = 0; i < total; i += BATCH_SIZE) {
            const batch = rawData.slice(i, i + BATCH_SIZE);

            try {
                // A. Generate embeddings (CPU bound - Local Model)
                // We do this *before* waiting for the previous upsert to finish, 
                // but since Node is single-threaded for CPU, this actually blocks.
                // However, the `upsert` is network/background, so it proceeds in parallel 
                // with this CPU work if we don't await it yet.
                // But to prevent memory explosion, we *should* await the previous one *before* 
                // pushing too much.

                // Strategy: 
                // 1. Wait for previous upsert (so we don't flood memory/network).
                // 2. Generate current embeddings.
                // 3. Fire new upsert (without awaiting).

                // Wait for the *previous* batch to finish upserting before starting CPU work for the new one?
                // No, we want CPU (Embed) and Network (Upsert) to overlap.
                // 1. Generate Embeddings (CPU)
                // 2. Await Previous Upsert
                // 3. Start Current Upsert

                const vectors = [];
                for (const item of batch) {
                    const text = JSON.stringify(item);
                    const output = await embedder(text, { pooling: 'mean', normalize: true });
                    vectors.push(Array.from(output.data));
                }

                // Prepare records
                const records = batch.map((item, idx) => ({
                    id: (item.order_id || `order-${i + idx}`).toString(),
                    values: vectors[idx],
                    metadata: {
                        source: "orders.json",
                        order_index: i + idx,
                        ...item
                    },
                }));

                // B. Ensure previous upsert is done before starting new one (flow control)
                await activeUpsertPromise;

                // C. Start new upsert (Fire and forget from the loop's perspective, catch errors in the promise)
                activeUpsertPromise = pineconeIndex.namespace(NAMESPACE).upsert(records)
                    .then(() => {
                        console.log(
                            `✅ Indexed ${Math.min(i + BATCH_SIZE, total)}/${total} orders`
                        );
                    })
                    .catch(err => {
                        console.error(`❌ Upsert failed for batch ${i}:`, err.message);
                    });

            } catch (error) {
                console.error(
                    `❌ Error processing batch ${i}:`,
                    error.message || error
                );
            }
        }

        // Wait for the final batch
        await activeUpsertPromise;

        console.log("🎉 Indexing complete! Your orders are now searchable.");
        console.log(`🔗 Go to Pinecone dashboard to see record count grow.`);

    } catch (error) {
        console.error("💥 Fatal error:", error);
        process.exit(1);
    }
}

run();