import asyncio
import logging
from transformers import AutoModel
import os
import sys

import grpc

proto_path = os.path.join(os.path.dirname(__file__), 'proto')
sys.path.append(proto_path)

import embeddings_pb2
import embeddings_pb2_grpc

model = AutoModel.from_pretrained('jinaai/jina-embeddings-v2-base-en', trust_remote_code=True)

class EmbeddingsServicer(embeddings_pb2_grpc.EmbeddingsServicer):
    def GetEmbedding(self, request, context):
        embeddings = model.encode([request.sentence])
        return embeddings_pb2.EmbeddingResponse(embedding=embeddings[0])

async def serve() -> None:
    port = 50051
    server = grpc.aio.server()
    embeddings_pb2_grpc.add_EmbeddingsServicer_to_server(
        EmbeddingsServicer(), server
    )
    server.add_insecure_port(f"[::]:{port}")
    logging.info(f"Started on {port}")
    await server.start()
    await server.wait_for_termination()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.get_event_loop().run_until_complete(serve())