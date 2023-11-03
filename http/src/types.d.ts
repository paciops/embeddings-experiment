export type Vector = number[];
export type ID = string;
export type Maybe<T> = T | undefined;
export type SimilarVectors = Record<ID, Vector>;
export interface VectorDatabase {
  add(id: ID, vector: Vector): Promise<boolean>;
  search(
    id: ID,
    vector: Vector,
    options?: Record<string, Maybe<string | number>>
  ): Promise<SimilarVectors>;
}
