import { SimilarVectors, VectorDatabase } from "../types";
import { request } from "undici";

export async function vectorDB(
  size: number,
  url: string
): Promise<VectorDatabase> {
  let requestId: 0;
  return {
    async add(id, vector) {
      const { statusCode } = await request(`${url}/index`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [
            {
              id,
              sentence: id,
              embedding: vector,
            },
          ],
          parameters: {},
          header: {
            requestId: `${requestId++}`,
          },
        }),
      });
      return statusCode === 200;
    },
    async search(id, vector, options) {
      const { statusCode, body } = await request(`${url}/search`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [
            {
              id,
              sentence: id,
              embedding: vector,
            },
          ],
          parameters: {},
          header: {
            requestId: `${requestId++}`,
          },
        }),
      });

      if (statusCode !== 200) {
        console.error({ response: await body.text() });
        throw new Error(
          `Cannot handle status code ${statusCode} when searching`
        );
      }
      const json = await body.json();
      if (
        json !== null &&
        typeof json === "object" &&
        "data" in json &&
        Array.isArray(json.data)
      ) {
        const result: SimilarVectors = {};
        return (json.data[0].matches as []).reduce((acc, curr) => {
          acc[curr["id"]] = curr["embedding"];
          return acc;
        }, result);
      } else return {};
    },
  };
}
