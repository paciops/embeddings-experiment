import { credentials } from "@grpc/grpc-js";
import { qdrant, vectorDB } from "./databases";
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

const createDB = async (type?: string) => {
  switch (type) {
    case "vectorDB":
      return await vectorDB(768, "http://127.0.0.1:12345");
    case "qdrant":
      return await qdrant(768, "http://127.0.0.1:6333");
    default:
      return await orama(768);
  }
};

(async () => {
  const db = await createDB(process.env.DB),
    client = createRPC(address);

  for (const sentence of ["ciao mondo", "ciaoo bella"]) {
    const response = await client.getEmbeddings(sentence);
    const result = await db.add(sentence, response.embedding);
    console.log("added " + sentence + " ", result);
  }
  const sentence = "ciao cari",
    { embedding } = await client.getEmbeddings(sentence);
  console.log(await db.search(sentence, embedding));
})();
