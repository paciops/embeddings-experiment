export type Vector = number[];
export type ID = string;

export interface VectorDatabase {
  add(id: ID, vector: Vector): Promise<boolean>;
  search(vector: Vector): Promise<Map<ID, Vector>>;
}
