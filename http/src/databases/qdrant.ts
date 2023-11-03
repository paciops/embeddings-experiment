import { SimilarVectors, VectorDatabase } from "../types";
import { QdrantClient } from "@qdrant/js-client-rest";
import { randomUUID } from "node:crypto";

export async function qdrant(
  size: number,
  url: string
): Promise<VectorDatabase> {
  const client = new QdrantClient({ url }),
    collectionName = "sentences";
  try {
    await client.getCollection(collectionName);
  } catch (error) {
    const collectionCreationResponse = await client.createCollection(
      collectionName,
      {
        vectors: {
          distance: "Cosine",
          size,
        },
      }
    );
    if (!collectionCreationResponse)
      throw new Error(`Cannot create collection ${collectionName}`);
  }

  return {
    async add(id, vector) {
      const { status } = await client.upsert(collectionName, {
        wait: true,
        points: [{ id: randomUUID(), vector, payload: { sentence: id } }],
      });
      return status === "completed";
    },
    async search(id, vector, options) {
      const vectors = await client.search(collectionName, {
          vector,
          with_vector: true,
          with_payload: true,
        }),
        result: SimilarVectors = {};
      return vectors.reduce((acc, { vector, payload }) => {
        if (
          Array.isArray(vector) &&
          payload?.sentence &&
          typeof payload.sentence === "string"
        )
          acc[payload.sentence] = vector;
        return acc;
      }, result);
    },
  };
}
