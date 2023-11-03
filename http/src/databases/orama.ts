import { SimilarVectors, VectorDatabase } from "../types";
import { create, insert, searchVector } from "@orama/orama";

export async function orama(size: number): Promise<VectorDatabase> {
  const schema = {
      id: "string",
      vector: `vector[${size}]`,
    } as const,
    db = await create({
      schema,
    });
  return {
    async add(id, vector) {
      try {
        await insert(db, { id, vector });
        return true;
      } catch (error) {
        console.error(`While inserting ${id} was thrown error: `, error);
        return false;
      }
    },
    async search(id, vector, options) {
      const result: SimilarVectors = {},
        similarity = options ? options["similarity"] : undefined;
      if (typeof similarity !== "number" && typeof similarity !== "undefined")
        throw new Error("Similarity must be a number");
      const response = await searchVector(db, {
        vector,
        property: "vector",
        includeVectors: true,
        similarity,
      });

      for (const { document } of response.hits) {
        result[document.id] = document.vector;
      }

      return result;
    },
  };
}
