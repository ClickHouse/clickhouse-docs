---
date: 2023-10-26
title: Can you use ClickHouse for vector search?
---

# Can ClickHouse do vector search?

Yes, ClickHouse can perform vector search. The main advantage of using ClickHouse for vector search compared to using more specialized vector databases are:
- You can use ClickHouse’s filtering and full-text search capabilities to refine your dataset before performing vector search
- You can perform analytics on your datasets
- You can JOIN against your existing data
- You don’t need to manage yet another database and complicate your infrastructure

As a quick tutorial, here's how to use ClickHouse for vector search:

## 1. Create embeddings

Your data, whether it be documents, images, or structured data, need to be converted to embeddings. We recommend creating embeddings using the [OpenAI Embeddings API](https://platform.openai.com/docs/api-reference/embeddings) or using the open-source Python library [SentenceTransformers](https://www.sbert.net/).

You can think of an embedding as a large array of floating point numbers that represents your data. To learn more about embeddings, read [this guide from OpenAI](https://platform.openai.com/docs/guides/embeddings/what-are-embeddings).

## 2. Store the embeddings in ClickHouse

Once you’ve generated embeddings, simply store them in ClickHouse. Each embedding should be stored in a separate row and can include metadata to use for filtering, aggregations, or analytics. Here’s an example of a table that can store images with captions:

```sql
CREATE TABLE images
(
	`_file` LowCardinality(String),
	`caption` String,
	`image_embedding` Array(Float32)
)
ENGINE = MergeTree;
```

## 3. Use a distance function to search for related embeddings

Let’s say you want to search for pictures of dogs in your dataset. You can use a distance function like `cosineDistance` to take an embedding of a dog image and search for related images:

```sql
SELECT
    _file,
	caption,
	cosineDistance(
        -- An embedding of your "input" dog picture
        [0.5736801028251648, 0.2516217529773712, ...,  -0.6825592517852783],
        image_embedding
    ) AS score
FROM images
ORDER BY score ASC
LIMIT 10
```

This query returns the `_file` names and `caption` of the top 10 images most likely to be related to your provided dog image.

## Further Reading

To follow a more in-depth tutorial on vector search using ClickHouse, please see:
- [Vector Search with ClickHouse - Part 1
](https://clickhouse.com/blog/vector-search-clickhouse-p1)
- [Vector Search with ClickHouse - Part 2
](https://clickhouse.com/blog/vector-search-clickhouse-p2)
