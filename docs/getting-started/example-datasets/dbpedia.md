---
description: 'Dataset containing 1 million articles from Wikipedia and their vector embeddings"
sidebar_label: 'dbpedia dataset'
slug: /getting-started/example-datasets/dbpedia-dataset
title: 'dbpedia dataset'
---

The [dbpedia dataset](https://huggingface.co/datasets/Qdrant/dbpedia-entities-openai3-text-embedding-3-large-1536-1M) contains 1 million articles from Wikipedia and their vector embeddings generated using `text-embedding-3-large` model from OpenAI.

The dataset is an excellent starter dataset to understand semantic search, vector embeddings and Generative AI. We use this dataset to demonstrate [approximate nearest neighbor search](../../engines/table-engines/mergetree-family/annindexes.md) in ClickHouse and a simple Q & A application.

## Data preparation {#data-preparation}

The dataset consists of 26 `Parquet` files located at 
converts them to CSV and imports them into ClickHouse. You can use the following `download.sh` script for that:


```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
```

The dataset is split into 410 files, each file contains ca. 1 million rows. If you like to work with a smaller subset of the data, simply adjust the limits, e.g. `seq 0 9 | ...`.

(The python script above is very slow (~2-10 minutes per file), takes a lot of memory (41 GB per file), and the resulting csv files are big (10 GB each), so be careful. If you have enough RAM, increase the `-P1` number for more parallelism. If this is still too slow, consider coming up with a better ingestion procedure - maybe converting the .npy files to parquet, then doing all the other processing with clickhouse.)

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

To load the dataset from the Parquet files, 

```sql
INSERT INTO laion FROM INFILE '{path_to_csv_files}/*.csv'
```

## Run a brute-force ANN search (without ANN index) {#run-a-brute-force-ann-search-without-ann-index}

To run a brute-force approximate nearest neighbor search, run:

```sql
SELECT url, caption FROM laion ORDER BY L2Distance(image_embedding, {target:Array(Float32)}) LIMIT 30
```

`target` is an array of 512 elements and a client parameter. A convenient way to obtain such arrays will be presented at the end of the article. For now, we can run the embedding of a random cat picture as `target`.

**Result**

```markdown
┌─url───────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption────────────────────────────────────────────────────────────────┐
│ https://s3.amazonaws.com/filestore.rescuegroups.org/6685/pictures/animals/13884/13884995/63318230_463x463.jpg │ Adoptable Female Domestic Short Hair                                   │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/8/b/6/239905226.jpg                                        │ Adopt A Pet :: Marzipan - New York, NY                                 │
│ http://d1n3ar4lqtlydb.cloudfront.net/9/2/4/248407625.jpg                                                      │ Adopt A Pet :: Butterscotch - New Castle, DE                           │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/e/e/c/245615237.jpg                                        │ Adopt A Pet :: Tiggy - Chicago, IL                                     │
│ http://pawsofcoronado.org/wp-content/uploads/2012/12/rsz_pumpkin.jpg                                          │ Pumpkin an orange tabby  kitten for adoption                           │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/7/8/3/188700997.jpg                                        │ Adopt A Pet :: Brian the Brad Pitt of cats - Frankfort, IL             │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/8/b/d/191533561.jpg                                        │ Domestic Shorthair Cat for adoption in Mesa, Arizona - Charlie         │
│ https://s3.amazonaws.com/pet-uploads.adoptapet.com/0/1/2/221698235.jpg                                        │ Domestic Shorthair Cat for adoption in Marietta, Ohio - Daisy (Spayed) │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────┘

8 rows in set. Elapsed: 6.432 sec. Processed 19.65 million rows, 43.96 GB (3.06 million rows/s., 6.84 GB/s.)
```

## Run a ANN with an ANN index {#run-a-ann-with-an-ann-index}

Create a new table with an ANN index and insert the data from the existing table:

```sql
CREATE TABLE laion_annoy
(
    `id` Int64,
    `url` String,
    `caption` String,
    `NSFW` String,
    `similarity` Float32,
    `image_embedding` Array(Float32),
    `text_embedding` Array(Float32),
    INDEX annoy_image image_embedding TYPE annoy(),
    INDEX annoy_text text_embedding TYPE annoy()
)
ENGINE = MergeTree
ORDER BY id
SETTINGS index_granularity = 8192;

INSERT INTO laion_annoy SELECT * FROM laion;
```

By default, Annoy indexes use the L2 distance as metric. Further tuning knobs for index creation and search are described in the Annoy index [documentation](../../engines/table-engines/mergetree-family/annindexes.md). Let's check now again with the same query:

```sql
SELECT url, caption FROM laion_annoy ORDER BY l2Distance(image_embedding, {target:Array(Float32)}) LIMIT 8
```

**Result**

```response
┌─url──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption──────────────────────────────────────────────────────────────┐
│ http://tse1.mm.bing.net/th?id=OIP.R1CUoYp_4hbeFSHBaaB5-gHaFj                                                                                                                         │ bed bugs and pets can cats carry bed bugs pets adviser               │
│ http://pet-uploads.adoptapet.com/1/9/c/1963194.jpg?336w                                                                                                                              │ Domestic Longhair Cat for adoption in Quincy, Massachusetts - Ashley │
│ https://thumbs.dreamstime.com/t/cat-bed-12591021.jpg                                                                                                                                 │ Cat on bed Stock Image                                               │
│ https://us.123rf.com/450wm/penta/penta1105/penta110500004/9658511-portrait-of-british-short-hair-kitten-lieing-at-sofa-on-sun.jpg                                                    │ Portrait of british short hair kitten lieing at sofa on sun.         │
│ https://www.easypetmd.com/sites/default/files/Wirehaired%20Vizsla%20(2).jpg                                                                                                          │ Vizsla (Wirehaired) image 3                                          │
│ https://images.ctfassets.net/yixw23k2v6vo/0000000200009b8800000000/7950f4e1c1db335ef91bb2bc34428de9/dog-cat-flickr-Impatience_1.jpg?w=600&h=400&fm=jpg&fit=thumb&q=65&fl=progressive │ dog and cat image                                                    │
│ https://i1.wallbox.ru/wallpapers/small/201523/eaa582ee76a31fd.jpg                                                                                                                    │ cats, kittens, faces, tonkinese                                      │
│ https://www.baxterboo.com/images/breeds/medium/cairn-terrier.jpg                                                                                                                     │ Cairn Terrier Photo                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────┘

8 rows in set. Elapsed: 0.641 sec. Processed 22.06 thousand rows, 49.36 MB (91.53 thousand rows/s., 204.81 MB/s.)
```

The speed increased significantly at the cost of less accurate results. This is because the ANN index only provide approximate search results. Note the example searched for similar image embeddings, yet it is also possible to search for positive image caption embeddings.

## Q & A Demo Application {#q-and-a-demo-application}

Above examples demonstrated semantic search and document retrieval using ClickHouse. A very simple but high potential Generative AI example application is presented now.

The application performs the following steps :

1. Accepts a _topic_ as input from the user
2. Generates an embedding vector for the _topic_ by invoking OpenAI API with model `text-embedding-3-large`
3. Retrieves highly relevant Wikipedia articles/documents using vector similarity search on the `dbpedia` table
4. Accepts a free-form question in natural language from the user relating to the _topic_
5. Uses the OpenAI `gpt-3.5-turbo` Chat API to answer the question based on the knowledge in the documents retrieved in step #3.
   The documents retrieved in step #3 are passed as _context_ to the Chat API and are the key link in Generative AI.

First a couple of conversation examples by running the Q & A application are listed below, followed by the code
for the Q & A application. Running the application requires an OpenAI API key to be set in the environment
variable `OPENAI_API_KEY`.

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

