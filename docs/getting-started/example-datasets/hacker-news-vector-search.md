---
description: 'Dataset containing 28+ million Hacker News postings & their vector embeddings'
sidebar_label: 'Hacker News vector search dataset'
slug: /getting-started/example-datasets/hackernews-vector-search-dataset
title: 'Hacker News vector search dataset'
keywords: ['semantic search', 'vector similarity', 'approximate nearest neighbours', 'embeddings']
doc_type: 'guide'
---

## Introduction {#introduction}

The [Hacker News dataset](https://news.ycombinator.com/) contains 28.74 million
postings and their vector embeddings. The embeddings were generated using [SentenceTransformers](https://sbert.net/) model [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2). The dimension of each embedding vector is `384`.

This dataset can be used to walk through the design, sizing and performance aspects for a large scale,
real world vector search application built on top of user generated, textual data.

## Dataset details {#dataset-details}

The complete dataset with vector embeddings is made available by ClickHouse as a single `Parquet` file in a [S3 bucket](https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet)

We recommend users first run a sizing exercise to estimate the storage and memory requirements for this dataset by referring to the [documentation](../../engines/table-engines/mergetree-family/annindexes.md).

## Steps {#steps}

<VerticalStepper headerLevel="h3">

### Create table {#create-table}

Create the `hackernews` table to store the postings & their embeddings and associated attributes:

```sql
CREATE TABLE hackernews
(
    `id` Int32,
    `doc_id` Int32,
    `text` String,
    `vector` Array(Float32),
    `node_info` Tuple(
        start Nullable(UInt64),
        end Nullable(UInt64)),
    `metadata` String,
    `type` Enum8('story' = 1, 'comment' = 2, 'poll' = 3, 'pollopt' = 4, 'job' = 5),
    `by` LowCardinality(String),
    `time` DateTime,
    `title` String,
    `post_score` Int32,
    `dead` UInt8,
    `deleted` UInt8,
    `length` UInt32
)
ENGINE = MergeTree
ORDER BY id;
```

The `id` is just an incrementing integer. The additional attributes can be used in predicates to understand
vector similarity search combined with post-filtering/pre-filtering as explained in the [documentation](../../engines/table-engines/mergetree-family/annindexes.md)

### Load data {#load-table}

To load the dataset from the `Parquet` file, run the following SQL statement:

```sql
INSERT INTO hackernews SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/hackernews-miniLM/hackernews_part_1_of_1.parquet');
```

Inserting 28.74 million rows into the table will take a few minutes.

### Build a vector similarity index {#build-vector-similarity-index}

Run the following SQL to define and build a vector similarity index on the `vector` column of the `hackernews` table:

```sql
ALTER TABLE hackernews ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 384, 'bf16', 64, 512);

ALTER TABLE hackernews MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

The parameters and performance considerations for index creation and search are described in the [documentation](../../engines/table-engines/mergetree-family/annindexes.md).
The statement above uses values of 64 and 512 respectively for the HNSW hyperparameters `M` and `ef_construction`.
Users need to carefully select optimal values for these parameters by evaluating index build time and search results quality
corresponding to selected values.

Building and saving the index could even take a few minutes/hour for the full 28.74 million dataset, depending on the number of CPU cores available and the storage bandwidth. 

### Perform ANN search {#perform-ann-search}

Once the vector similarity index has been built, vector search queries will automatically use the index:

```sql title="Query"
SELECT id, title, text
FROM hackernews
ORDER BY cosineDistance( vector, <search vector>)
LIMIT 10

```

The first time load of the vector index into memory could take a few seconds/minutes.

### Generate embeddings for search query {#generating-embeddings-for-search-query}

[Sentence Transformers](https://www.sbert.net/) provide local, easy to use embedding
models for capturing the semantic meaning of sentences and paragraphs.

The dataset in this HackerNews dataset contains vector emebeddings generated from the 
[all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) model.

An example Python script is provided below to demonstrate how to programmatically generate
embedding vectors using `sentence_transformers1 Python package. The search embedding vector
is then passed as an argument to the [`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance) function in the `SELECT` query.

```python
from sentence_transformers import SentenceTransformer
import sys

import clickhouse_connect

print("Initializing...")

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

chclient = clickhouse_connect.get_client() # ClickHouse credentials here

while True:
    # Take the search query from user
    print("Enter a search query :")
    input_query = sys.stdin.readline();
    texts = [input_query]

    # Run the model and obtain search vector
    print("Generating the embedding for ", input_query);
    embeddings = model.encode(texts)

    print("Querying ClickHouse...")
    params = {'v1':list(embeddings[0]), 'v2':20}
    result = chclient.query("SELECT id, title, text FROM hackernews ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)
    print("Results :")
    for row in result.result_rows:
        print(row[0], row[2][:100])
        print("---------")

```

An example of running the above Python script and similarity search results are shown below
(only 100 characters from each of the top 20 posts are printed):

```text
Initializing...

Enter a search query :
Are OLAP cubes useful

Generating the embedding for  "Are OLAP cubes useful"

Querying ClickHouse...

Results :

27742647 smartmic:
slt2021: OLAP Cube is not dead, as long as you use some form of:<p>1. GROUP BY multiple fi
---------
27744260 georgewfraser:A data mart is a logical organization of data to help humans understand the schema. Wh
---------
27761434 mwexler:&quot;We model data according to rigorous frameworks like Kimball or Inmon because we must r
---------
28401230 chotmat:
erosenbe0: OLAP database is just a copy, replica, or archive of data with a schema designe
---------
22198879 Merick:+1 for Apache Kylin, it&#x27;s a great project and awesome open source community. If anyone i
---------
27741776 crazydoggers:I always felt the value of an OLAP cube was uncovering questions you may not know to as
---------
22189480 shadowsun7:
_Codemonkeyism: After maintaining an OLAP cube system for some years, I&#x27;m not that
---------
27742029 smartmic:
gengstrand: My first exposure to OLAP was on a team developing a front end to Essbase that
---------
22364133 irfansharif:
simo7: I&#x27;m wondering how this technology could work for OLAP cubes.<p>An OLAP cube
---------
23292746 scoresmoke:When I was developing my pet project for Web analytics (<a href="https:&#x2F;&#x2F;github
---------
22198891 js8:It seems that the article makes a categorical error, arguing that OLAP cubes were replaced by co
---------
28421602 chotmat:
7thaccount: Is there any advantage to OLAP cube over plain SQL (large historical database r
---------
22195444 shadowsun7:
lkcubing: Thanks for sharing. Interesting write up.<p>While this article accurately capt
---------
22198040 lkcubing:Thanks for sharing. Interesting write up.<p>While this article accurately captures the issu
---------
3973185 stefanu:
sgt: Interesting idea. Ofcourse, OLAP isn't just about the underlying cubes and dimensions,
---------
22190903 shadowsun7:
js8: It seems that the article makes a categorical error, arguing that OLAP cubes were r
---------
28422241 sradman:OLAP Cubes have been disrupted by Column Stores. Unless you are interested in the history of
---------
28421480 chotmat:
sradman: OLAP Cubes have been disrupted by Column Stores. Unless you are interested in the
---------
27742515 BadInformatics:
quantified: OP posts with inverted condition: “OLAP != OLAP Cube” is the actual titl
---------
28422935 chotmat:
rstuart4133: I remember hearing about OLAP cubes donkey&#x27;s years ago (probably not far
---------
```

## Summarization demo application {#summarization-demo-application}

The example above demonstrated semantic search and document retrieval using ClickHouse.

A very simple but high potential generative AI example application is presented next.

The application performs the following steps:

1. Accepts a _topic_ as input from the user
2. Generates an embedding vector for the _topic_ by using the `SentenceTransformers` with model `all-MiniLM-L6-v2`
3. Retrieves highly relevant posts/comments using vector similarity search on the `hackernews` table
4. Uses `LangChain` and OpenAI `gpt-3.5-turbo` Chat API to **summarize** the content retrieved in step #3.
   The posts/comments retrieved in step #3 are passed as _context_ to the Chat API and are the key link in Generative AI.

An example from running the summarization application is first listed below, followed by the code
for the summarization application. Running the application requires an OpenAI API key to be set in the environment
variable `OPENAI_API_KEY`. The OpenAI API key can be obtained after registering at https://platform.openai.com.

This application demonstrates a Generative AI use-case that is applicable to multiple enterprise domains like :
customer sentiment analysis, technical support automation, mining user conversations, legal documents, medical records,
meeting transcripts, financial statements, etc

```shell
$ python3 summarize.py

Enter a search topic :
ClickHouse performance experiences

Generating the embedding for ---->  ClickHouse performance experiences

Querying ClickHouse to retrieve relevant articles...

Initializing chatgpt-3.5-turbo model...

Summarizing search results retrieved from ClickHouse...

Summary from chatgpt-3.5:
The discussion focuses on comparing ClickHouse with various databases like TimescaleDB, Apache Spark,
AWS Redshift, and QuestDB, highlighting ClickHouse's cost-efficient high performance and suitability
for analytical applications. Users praise ClickHouse for its simplicity, speed, and resource efficiency
in handling large-scale analytics workloads, although some challenges like DMLs and difficulty in backups
are mentioned. ClickHouse is recognized for its real-time aggregate computation capabilities and solid
engineering, with comparisons made to other databases like Druid and MemSQL. Overall, ClickHouse is seen
as a powerful tool for real-time data processing, analytics, and handling large volumes of data
efficiently, gaining popularity for its impressive performance and cost-effectiveness.
```

Code for the above application :

```python
print("Initializing...")

import sys
import json
import time
from sentence_transformers import SentenceTransformer

import clickhouse_connect

from langchain.docstore.document import Document
from langchain.text_splitter import CharacterTextSplitter
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains.summarize import load_summarize_chain
import textwrap
import tiktoken

def num_tokens_from_string(string: str, encoding_name: str) -> int:
    encoding = tiktoken.encoding_for_model(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

chclient = clickhouse_connect.get_client(compress=False) # ClickHouse credentials here

while True:
    # Take the search query from user
    print("Enter a search topic :")
    input_query = sys.stdin.readline();
    texts = [input_query]

    # Run the model and obtain search or reference vector
    print("Generating the embedding for ----> ", input_query);
    embeddings = model.encode(texts)

    print("Querying ClickHouse...")
    params = {'v1':list(embeddings[0]), 'v2':100}
    result = chclient.query("SELECT id,title,text FROM hackernews ORDER BY cosineDistance(vector, %(v1)s) LIMIT %(v2)s", parameters=params)

    # Just join all the search results
    doc_results = ""
    for row in result.result_rows:
        doc_results = doc_results + "\n" + row[2]

    print("Initializing chatgpt-3.5-turbo model")
    model_name = "gpt-3.5-turbo"

    text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
        model_name=model_name
    )

    texts = text_splitter.split_text(doc_results)

    docs = [Document(page_content=t) for t in texts]

    llm = ChatOpenAI(temperature=0, model_name=model_name)

    prompt_template = """
Write a concise summary of the following in not more than 10 sentences:


{text}


CONSCISE SUMMARY :
"""

    prompt = PromptTemplate(template=prompt_template, input_variables=["text"])

    num_tokens = num_tokens_from_string(doc_results, model_name)

    gpt_35_turbo_max_tokens = 4096
    verbose = False

    print("Summarizing search results retrieved from ClickHouse...")

    if num_tokens <= gpt_35_turbo_max_tokens:
        chain = load_summarize_chain(llm, chain_type="stuff", prompt=prompt, verbose=verbose)
    else:
        chain = load_summarize_chain(llm, chain_type="map_reduce", map_prompt=prompt, combine_prompt=prompt, verbose=verbose)

    summary = chain.run(docs)

    print(f"Summary from chatgpt-3.5: {summary}")
```
</VerticalStepper>
