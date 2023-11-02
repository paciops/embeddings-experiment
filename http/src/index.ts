import { credentials } from "@grpc/grpc-js";
import { orama } from "./databases/orama";
import {
  EmbeddingsClient,
  EmbeddingRequest,
  EmbeddingResponse,
} from "./proto/embeddings";

const HOST = process.env.HOST || "0.0.0.0",
  PORT = Number(process.env.PORT) || 50051,
  address = `${HOST}:${PORT}`;

const createRPC = (address: string) => {
  const client = new EmbeddingsClient(address, credentials.createInsecure());
  return {
    getEmbeddings(sentence: string) {
      const request = EmbeddingRequest.create({ sentence });
      return new Promise<EmbeddingResponse>((resolve, reject) =>
        client.getEmbedding(request, (err, response) => {
          if (err) reject(err);
          else resolve(response);
        })
      );
    },
  };
};

(async () => {
  const db = await orama(768),
    client = createRPC(address);

  for (const sentence of ["ciao mondo", "ciaoo bella"]) {
    const response = await client.getEmbeddings(sentence);
    const result = await db.add(sentence, response.embedding);
    console.log("added " + sentence + " ", result);
  }
  const { embedding } = await client.getEmbeddings("ciao mondo");
  console.table(await db.search(embedding));
})();
