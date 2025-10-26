---
description: 'Dataset containing 100 million vectors from the LAION 5B dataset'
sidebar_label: 'LAION 5B dataset'
slug: /getting-started/example-datasets/laion-5b-dataset
title: 'LAION 5B dataset'
keywords: ['semantic search', 'vector similarity', 'approximate nearest neighbours', 'embeddings']
doc_type: 'guide'
---

import search_results_image from '@site/static/images/getting-started/example-datasets/laion5b_visualization_1.png'
import Image from '@theme/IdealImage';

## Introduction {#introduction}

The [LAION 5b dataset](https://laion.ai/blog/laion-5b/) contains 5.85 billion image-text embeddings and
associated image metadata. The embeddings were generated using `Open AI CLIP` model [ViT-L/14](https://huggingface.co/sentence-transformers/clip-ViT-L-14). The
dimension of each embedding vector is `768`.

This dataset can be used to model design, sizing and performance aspects for a large scale,
real world vector search application. The dataset can be used for both text to image search and
image to image search.

## Dataset details {#dataset-details}

The complete dataset is available as a mixture of `npy` and `Parquet` files at [the-eye.eu](https://the-eye.eu/public/AI/cah/laion5b/)

ClickHouse has made available a subset of 100 million vectors in a `S3` bucket.
The `S3` bucket contains 10 `Parquet` files, each `Parquet` file is filled with 10 million rows.

We recommend users first run a sizing exercise to estimate the storage and memory requirements for this dataset by referring to the [documentation](../../engines/table-engines/mergetree-family/annindexes.md).

## Steps {#steps}

<VerticalStepper headerLevel="h3">

### Create table {#create-table}

Create the `laion_5b_100m` table to store the embeddings and their associated attributes:

```sql
CREATE TABLE laion_5b_100m
(
    id UInt32,
    image_path String,
    caption String,
    NSFW Nullable(String) default 'unknown',
    similarity Float32,
    LICENSE Nullable(String),
    url String,
    key String,
    status LowCardinality(String),
    width Int32,
    height Int32,
    original_width Int32,
    original_height Int32,
    exif Nullable(String),
    md5 String,
    vector Array(Float32) CODEC(NONE)
) ENGINE = MergeTree ORDER BY (id)
```

The `id` is just an incrementing integer. The additional attributes can be used in predicates to understand
vector similarity search combined with post-filtering/pre-filtering as explained in the [documentation](../../engines/table-engines/mergetree-family/annindexes.md)

### Load data {#load-table}

To load the dataset from all `Parquet` files, run the following SQL statement:

```sql
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_*.parquet');
```

The loading of 100 million rows into the table will take a few minutes.

Alternatively, individual SQL statements can be run to load a specific number of files / rows.

```sql
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_part_1_of_10.parquet');
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_part_2_of_10.parquet');
⋮
```

### Run a brute-force vector similarity search {#run-a-brute-force-vector-similarity-search}

KNN (k - Nearest Neighbours) search or brute force search involves calculating the distance of each vector in the dataset
to the search embedding vector and then ordering the distances to get the nearest neighbours. We can use one of the vectors
from the dataset itself as the search vector. For example:

```sql title="Query"
SELECT id, url 
FROM laion_5b_100m
ORDER BY cosineDistance( vector, (SELECT vector FROM laion_5b_100m WHERE id = 9999) ) ASC
LIMIT 20

The vector in the row with id = 9999 is the embedding for an image of a Deli restaurant.
```

```response title="Response"
    ┌───────id─┬─url───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │     9999 │ https://certapro.com/belleville/wp-content/uploads/sites/1369/2017/01/McAlistersFairviewHgts.jpg                                                                                                                                  │
 2. │ 60180509 │ https://certapro.com/belleville/wp-content/uploads/sites/1369/2017/01/McAlistersFairviewHgts-686x353.jpg                                                                                                                          │
 3. │  1986089 │ https://www.gannett-cdn.com/-mm-/ceefab710d945bb3432c840e61dce6c3712a7c0a/c=30-0-4392-3280/local/-/media/2017/02/14/FortMyers/FortMyers/636226855169587730-McAlister-s-Exterior-Signage.jpg?width=534&amp;height=401&amp;fit=crop │
 4. │ 51559839 │ https://img1.mashed.com/img/gallery/how-rich-is-the-mcalisters-deli-ceo-and-whats-the-average-pay-of-its-employees/intro-1619793841.jpg                                                                                           │
 5. │ 22104014 │ https://www.restaurantmagazine.com/wp-content/uploads/2016/04/Largest-McAlisters-Deli-Franchisee-to-Expand-into-Nebraska.jpg                                                                                                      │
 6. │ 54337236 │ http://www.restaurantnews.com/wp-content/uploads/2015/11/McAlisters-Deli-Giving-Away-Gift-Cards-With-Win-One-Gift-One-Holiday-Promotion.jpg                                                                                       │
 7. │ 20770867 │ http://www.restaurantnews.com/wp-content/uploads/2016/04/McAlisters-Deli-Aims-to-Attract-New-Franchisees-in-Florida-as-Chain-Enters-New-Markets.jpg                                                                               │
 8. │ 22493966 │ https://www.restaurantmagazine.com/wp-content/uploads/2016/06/McAlisters-Deli-Aims-to-Attract-New-Franchisees-in-Columbus-Ohio-as-Chain-Expands-feature.jpg                                                                       │
 9. │  2224351 │ https://holttribe.com/wp-content/uploads/2019/10/60880046-879A-49E4-8E13-1EE75FB24980-900x675.jpeg                                                                                                                                │
10. │ 30779663 │ https://www.gannett-cdn.com/presto/2018/10/29/PMUR/685f3e50-cce5-46fb-9a66-acb93f6ea5e5-IMG_6587.jpg?crop=2166,2166,x663,y0&amp;width=80&amp;height=80&amp;fit=bounds                                                             │
11. │ 54939148 │ https://www.priceedwards.com/sites/default/files/styles/staff_property_listing_block/public/for-lease/images/IMG_9674%20%28Custom%29_1.jpg?itok=sa8hrVBT                                                                          │
12. │ 95371605 │ http://www.restaurantmagazine.com/wp-content/uploads/2015/08/McAlisters-Deli-Signs-Development-Agreement-with-Kingdom-Foods-to-Grow-in-Southern-Mississippi.jpg                                                                   │
13. │ 79564563 │ https://www.restaurantmagazine.com/wp-content/uploads/2016/05/McAlisters-Deli-Aims-to-Attract-New-Franchisees-in-Denver-as-Chain-Expands.jpg                                                                                      │
14. │ 76429939 │ http://www.restaurantnews.com/wp-content/uploads/2016/08/McAlisters-Deli-Aims-to-Attract-New-Franchisees-in-Pennsylvania-as-Chain-Expands.jpg                                                                                     │
15. │ 96680635 │ https://img.claz.org/tc/400x320/9w3hll-UQNHGB9WFlhSGAVCWhheBQkeWh5SBAkUWh9SBgsJFxRcBUMNSR4cAQENXhJARwgNTRYcBAtDWh5WRQEJXR5SR1xcFkYKR1tYFkYGR1pVFiVyP0ImaTA                                                                        │
16. │ 48716846 │ http://tse2.mm.bing.net/th?id=OIP.nN2qJqGUJs_fVNdTiFyGnQHaEc                                                                                                                                                                      │
17. │  4472333 │ https://sgi.offerscdn.net/i/zdcs-merchants/05lG0FpXPIvsfiHnT3N8FQE.h200.w220.flpad.v22.bffffff.png                                                                                                                                │
18. │ 82667887 │ https://irs2.4sqi.net/img/general/200x200/11154479_OEGbrkgWB5fEGrrTkktYvCj1gcdyhZn7TSQSAqN2Yqw.jpg                                                                                                                                │
19. │ 57525607 │ https://knoji.com/images/logo/mcalistersdelicom.jpg                                                                                                                                                                               │
20. │ 15785896 │ https://www.groupnimb.com/mimg/merimg/mcalister-s-deli_1446088739.jpg                                                                                                                                                             │
    └──────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

#highlight-next-line
20 rows in set. Elapsed: 3.968 sec. Processed 100.38 million rows, 320.81 GB (25.30 million rows/s., 80.84 GB/s.)
```

Note down the query latency so that we can compare it with the query latency of ANN (using vector index).
With 100 million rows, the above query without a vector index could take a few seconds/minutes to complete.

### Build a vector similarity index {#build-vector-similarity-index}

Run the following SQL to define and build a vector similarity index on the `vector` column of the `laion_5b_100m` table :

```sql
ALTER TABLE laion_5b_100m ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 768, 'bf16', 64, 512);

ALTER TABLE laion_5b_100m MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

The parameters and performance considerations for index creation and search are described in the [documentation](../../engines/table-engines/mergetree-family/annindexes.md).
The statement above uses values of 64 and 512 respectively for the HNSW hyperparameters `M` and `ef_construction`.
Users need to carefully select optimal values for these parameters by evaluating index build time and search results quality
corresponding to selected values.

Building and saving the index could even take a few hours for the full l00 million dataset, depending on the number of CPU cores available and the storage bandwidth. 

### Perform ANN search {#perform-ann-search}

Once the vector similarity index has been built, vector search queries will automatically use the index:

```sql title="Query"
SELECT id, url 
FROM laion_5b_100m
ORDER BY cosineDistance( vector, (SELECT vector FROM laion_5b_100m WHERE id = 9999) ) ASC
LIMIT 20

```

The first time load of the vector index into memory could take a few seconds/minutes.

### Generate embeddings for search query {#generating-embeddings-for-search-query}

The `LAION 5b` dataset embedding vectors were generated using `OpenAI CLIP` model `ViT-L/14`.

An example Python script is provided below to demonstrate how to programmatically generate
embedding vectors using the `CLIP` APIs. The search embedding vector
is then passed as an argument to the [`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance) function in the `SELECT` query.

To install the `clip` package, please refer to the [OpenAI GitHub repository](https://github.com/openai/clip).

```python
import torch
import clip
import numpy as np
import sys
import clickhouse_connect

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-L/14", device=device)

# Search for images that contain both a dog and a cat
text = clip.tokenize(["a dog and a cat"]).to(device)

with torch.no_grad():
    text_features = model.encode_text(text)
    np_arr = text_features.detach().cpu().numpy()

    # Pass ClickHouse credentials here
    chclient = clickhouse_connect.get_client()

    params = {'v1': list(np_arr[0])}
    result = chclient.query("SELECT id, url FROM laion_5b_100m ORDER BY cosineDistance(vector, %(v1)s) LIMIT 100",
                            parameters=params)

    # Write the results to a simple HTML page that can be opened in the browser. Some URLs may have become obsolete.
    print("<html>")
    for r in result.result_rows:
        print("<img src = ", r[1], 'width="200" height="200">')
    print("</html>")
```

The result of the above search is shown below: 

<Image img={search_results_image} alt="Vector Similarity Search Results" size="md"/>

</VerticalStepper>
