
import { pipeline } from "@xenova/transformers";

class EmbeddingService {
    constructor() {
        this.pipe = null;
    }

    async getPipeline() {
        if (!this.pipe) {
            console.log("Loading embedding pipeline...");
            this.pipe = await pipeline('feature-extraction', 'Xenova/all-mpnet-base-v2');
            console.log("Embedding pipeline loaded.");
        }
        return this.pipe;
    }

    async getEmbedding(text) {
        const pipe = await this.getPipeline();
        // pooling: 'mean', normalize: true is standard for sentence comparisons
        const output = await pipe(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }
}

export default new EmbeddingService();
