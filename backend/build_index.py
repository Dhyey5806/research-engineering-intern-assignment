import pandas as pd
import faiss
from sentence_transformers import SentenceTransformer
import time

def build_vector_database():
    print(" Starting Offline Indexing Process...")
    start_time = time.time()

   
    print(" Loading cleaned_simppl_data.csv...")
    
    df = pd.read_csv('../data/cleaned_simppl_data.csv')
    
    
    df['title'] = df['title'].fillna('')
    df['selftext'] = df['selftext'].fillna('')
    
    
    
    text_to_embed = (df['title'] + ". " + df['selftext']).tolist()

    print(" Downloading/Loading HuggingFace Embedding Model (This may take a minute)...")
    model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

    print(f" Embedding {len(text_to_embed)} posts. Go grab a coffee, this takes ~2-5 minutes...")
    embeddings = model.encode(text_to_embed, show_progress_bar=True)

    
    dimension_size = embeddings.shape[1] 
    print(f" Building FAISS index with dimension size: {dimension_size}")
    
    index = faiss.IndexFlatL2(dimension_size) 
    index.add(embeddings)

    faiss.write_index(index, "vector_store.index")
    
    end_time = time.time()
    print(f" Success! Vector database saved as 'vector_store.index' in {round(end_time - start_time, 2)} seconds.")

if __name__ == "__main__":
    build_vector_database()