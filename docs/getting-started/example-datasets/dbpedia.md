---
description: 'Dataset containing 1 million articles from Wikipedia and their vector embeddings"
sidebar_label: 'dbpedia dataset'
slug: /getting-started/example-datasets/dbpedia-dataset
title: 'dbpedia dataset'
---

The [dbpedia dataset](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M) contains 1 million articles from Wikipedia and their vector embeddings generated using `text-embedding-3-large` model from OpenAI.

The dataset is an excellent starter dataset to understand vector embeddings, vector similarity search and Generative AI. We use this dataset to demonstrate [approximate nearest neighbor search](../../engines/table-engines/mergetree-family/annindexes.md) in ClickHouse and a simple but powerful Q & A application.

## Dataset details {#dataset-details}

The dataset consists of 26 `Parquet` files located under https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/. The files are named `0.parquet`, `1.parquet`, ..., `25.parquet`. To view some example rows of the dataset, please visit https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M.

## Create table {#create-table}

Create the `dbpedia` table to store the article id, title, text and embedding vector :

```sql
CREATE TABLE dbpedia
(
  id      String,
  title   String,
  text    String,
  vector  Array(Float32) CODEC(NONE)
) ENGINE = MergeTree ORDER BY (id);

```

## Load table {#load-table}

To load the dataset from the Parquet files, run the following shell command :

```shell
```

Alternatively, individual SQL statements can be run as shown below for each of the 25 Parquet files :

```sql
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/0.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/1.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;
...
INSERT INTO dbpedia SELECT _id, title, text, "text-embedding-3-large-1536-embedding" FROM url('https://huggingface.co/api/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M/parquet/default/train/25.parquet') SETTINGS max_http_get_redirects=5,enable_url_encoding=0;

```

## Semantic Search
Recommended reading : https://platform.openai.com/docs/guides/embeddings

Semantic search (or referred to as _similarity search_) using vector embeddings involes
the following steps :

- Accept a search query from user in natural language e.g ‘Tell me some scenic rail journeys”, “Suspense novels set in Europe” etc
- Generate embedding vector for the search query using the LLM model
- Find nearest neighbours to the search embedding vector in the dataset

The _nearest neighbours_ are documents, images or content that are results relevant to the user query.
The results are the key input to Retrieval Augmented Generation (RAG) in Generative AI applications.

## Experiment with KNN Search
KNN (k - Nearest Neighbours) search or brute force search involves calculating distance of each vector in the dataset
to the search embedding vector and then ordering the distances to get the nearest neighbours.  With the `dbpediai` dataset,
a quick technique to visually observe semantic search is to use embedding vectors from the dataset itself as search
vectors. Example :

```sql
SELECT id, title
FROM dbpedia
ORDER BY cosineDistance(vector, ( SELECT vector FROM dbpedia WHERE id = '<dbpedia:The_Remains_of_the_Day>') ) ASC
LIMIT 20

    ┌─id────────────────────────────────────────┬─title───────────────────────────┐
 1. │ <dbpedia:The_Remains_of_the_Day>          │ The Remains of the Day          │
 2. │ <dbpedia:The_Remains_of_the_Day_(film)>   │ The Remains of the Day (film)   │
 3. │ <dbpedia:Never_Let_Me_Go_(novel)>         │ Never Let Me Go (novel)         │
 4. │ <dbpedia:Last_Orders>                     │ Last Orders                     │
 5. │ <dbpedia:The_Unconsoled>                  │ The Unconsoled                  │
 6. │ <dbpedia:The_Hours_(novel)>               │ The Hours (novel)               │
 7. │ <dbpedia:An_Artist_of_the_Floating_World> │ An Artist of the Floating World │
 8. │ <dbpedia:Heat_and_Dust>                   │ Heat and Dust                   │
 9. │ <dbpedia:A_Pale_View_of_Hills>            │ A Pale View of Hills            │
10. │ <dbpedia:Howards_End_(film)>              │ Howards End (film)              │
11. │ <dbpedia:When_We_Were_Orphans>            │ When We Were Orphans            │
12. │ <dbpedia:A_Passage_to_India_(film)>       │ A Passage to India (film)       │
13. │ <dbpedia:Memoirs_of_a_Survivor>           │ Memoirs of a Survivor           │
14. │ <dbpedia:The_Child_in_Time>               │ The Child in Time               │
15. │ <dbpedia:The_Sea,_the_Sea>                │ The Sea, the Sea                │
16. │ <dbpedia:The_Master_(novel)>              │ The Master (novel)              │
17. │ <dbpedia:The_Memorial>                    │ The Memorial                    │
18. │ <dbpedia:The_Hours_(film)>                │ The Hours (film)                │
19. │ <dbpedia:Human_Remains_(film)>            │ Human Remains (film)            │
20. │ <dbpedia:Kazuo_Ishiguro>                  │ Kazuo Ishiguro                  │
    └───────────────────────────────────────────┴─────────────────────────────────┘
```

Note down the query latency so that we can compare it with the query latency of ANN (using vector index).
Also record the query latency with cold OS file cache and with `max_theads=1` to recognize the real compute
usage and storage bandwidth usage (extrapolate it to a production dataset with millions of vectors!)




## Q & A Demo Application {#q-and-a-demo-application}

Above examples demonstrated semantic search and document retrieval using ClickHouse. A very simple but high potential Generative AI example application is presented now.

The application performs the following steps :

1. Accepts a _topic_ as input from the user
2. Generates an embedding vector for the _topic_ by invoking OpenAI API with model `text-embedding-3-large`
3. Retrieves highly relevant Wikipedia articles/documents using vector similarity search on the `dbpedia` table
4. Accepts a free-form question in natural language from the user relating to the _topic_
5. Uses the OpenAI `gpt-3.5-turbo` Chat API to answer the question based on the knowledge in the documents retrieved in step #3.
   The documents retrieved in step #3 are passed as _context_ to the Chat API and are the key link in Generative AI.

A couple of conversation examples by running the Q & A application are first listed below, followed by the code
for the Q & A application. Running the application requires an OpenAI API key to be set in the environment
variable `OPENAI_API_KEY`. The OpenAI API key can be obtained after registering at https://platform.openapi.com.

```shell
$ python3 QandA.py

Enter a topic : FIFA world cup 1990
Generating the embedding for 'FIFA world cup 1990' and collecting 100 articles related to it from ClickHouse...

Enter your question : Who won the golden boot
Salvatore Schillaci of Italy won the Golden Boot at the 1990 FIFA World Cup.


Enter a topic : Cricket world cup
Generating the embedding for 'Cricket world cup' and collecting 100 articles related to it from ClickHouse...

Enter your question : Which country has hosted the world cup most times
England and Wales have hosted the Cricket World Cup the most times, with the tournament being held in these countries five times - in 1975, 1979, 1983, 1999, and 2019.

$
```

Code :

```Python
import sys
import time
from openai import OpenAI
import clickhouse_connect

ch_client = clickhouse_connect.get_client(compress=False) # Pass ClickHouse credentials here
openai_client = OpenAI() # Set the OPENAI_API_KEY environment variable

def get_embedding(text, model):
  text = text.replace("\n", " ")
  return openai_client.embeddings.create(input = [text], model=model, dimensions=1536).data[0].embedding

while True:
    # Take the topic of interest from user
    print("Enter a topic : ", end="", flush=True)
    input_query = sys.stdin.readline()
    input_query = input_query.rstrip()

    # Generate an embedding vector for the search topic and query ClickHouse
    print("Generating the embedding for '" + input_query + "' and collecting 100 articles related to it from ClickHouse...");
    embedding = get_embedding(input_query,
                              model='text-embedding-3-large')

    params = {'v1':embedding, 'v2':100}
    result = ch_client.query("SELECT id,title,text FROM dbpedia ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    # Collect all the matching articles/documents
    results = ""
    for row in result.result_rows:
        results = results + row[2]

    print("\nEnter your question : ", end="", flush=True)
    question = sys.stdin.readline();

    # Prompt for the OpenAI Chat API
    query = f"""Use the below content to answer the subsequent question. If the answer cannot be found, write "I don't know."

Content:
\"\"\"
{results}
\"\"\"

Question: {question}"""

    GPT_MODEL = "gpt-3.5-turbo"
    response = openai_client.chat.completions.create(
        messages=[
        {'role': 'system', 'content': "You answer questions about {input_query}."},
        {'role': 'user', 'content': query},
       ],
       model=GPT_MODEL,
       temperature=0,
    )

    # Print the answer to the question!
    print(response.choices[0].message.content)
    print("\n")
```

