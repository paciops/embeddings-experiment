from docarray import BaseDoc
from docarray.typing import NdArray
from docarray import DocList
import numpy as np
from vectordb import InMemoryExactNNVectorDB, HNSWVectorDB

class SentenceDoc(BaseDoc):
  sentence: str
  embedding: NdArray[768]

db = InMemoryExactNNVectorDB[SentenceDoc](workspace='./workspace')

with db.serve(protocol='http', port=12345, replicas=1, shards=1) as service:
   service.block()