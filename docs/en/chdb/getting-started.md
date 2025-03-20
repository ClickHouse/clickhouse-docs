---
title: Getting started with chDB
sidebar_label: Getting started
slug: /en/chdb/getting-started
description: chDB is an in-process SQL OLAP Engine powered by ClickHouse
keywords: [chdb, embedded, clickhouse-lite, in-process, in process]
---

# Getting started with chDB

In this guide, we're going to get up and running with the Python variant of chDB.
We'll start by querying a JSON file on S3, before creating a table in chDB based on the JSON file, and doing some queries on the data.
We'll also see how to have queries return data in different formats, including Apache Arrow and Panda, and finally we'll learn how to query Pandas DataFrames. 

## Setup

Let's first create a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

And now we'll install chDB.
Make sure you have version 2.0.3 or higher:

```bash
pip install "chdb>=2.0.2"
```

And now we're going to install [ipython](https://ipython.org/):

```bash
pip install ipython
```

We're going to use `ipython` to run the commands in the rest of the guide, which you can launch by running:

```bash
ipython
```

We'll also be using Pandas and Apache Arrow in this guide, so let's install those libraries too:

```bash
pip install pandas pyarrow
```

## Querying a JSON file in S3

Let's now have a look at how to query a JSON file that's stored in an S3 bucket. 
The [YouTube dislikes dataset](/docs/en/getting-started/example-datasets/youtube-dislikes) contains more than 4 billion rows of dislikes on YouTube videos up to 2021.
We're going to work with one of the JSON files from that dataset.

Import chdb:

```python
import chdb
```

We can write the following query to describe the structure of one of the JSON files:

```python
chdb.query(
  """
  DESCRIBE s3(
    's3://clickhouse-public-datasets/youtube/original/files/' ||
    'youtubedislikes_20211127161229_18654868.1637897329_vid.json.zst',
    'JSONLines'
  )
  SETTINGS describe_compact_output=1
  """
)
```

```text
"id","Nullable(String)"
"fetch_date","Nullable(String)"
"upload_date","Nullable(String)"
"title","Nullable(String)"
"uploader_id","Nullable(String)"
"uploader","Nullable(String)"
"uploader_sub_count","Nullable(Int64)"
"is_age_limit","Nullable(Bool)"
"view_count","Nullable(Int64)"
"like_count","Nullable(Int64)"
"dislike_count","Nullable(Int64)"
"is_crawlable","Nullable(Bool)"
"is_live_content","Nullable(Bool)"
"has_subtitles","Nullable(Bool)"
"is_ads_enabled","Nullable(Bool)"
"is_comments_enabled","Nullable(Bool)"
"description","Nullable(String)"
"rich_metadata","Array(Tuple(
    call Nullable(String),
    content Nullable(String),
    subtitle Nullable(String),
    title Nullable(String),
    url Nullable(String)))"
"super_titles","Array(Tuple(
    text Nullable(String),
    url Nullable(String)))"
"uploader_badges","Nullable(String)"
"video_badges","Nullable(String)"
```

We can also count the number of rows in that file:


```python
chdb.query(
  """
  SELECT count()
  FROM s3(
    's3://clickhouse-public-datasets/youtube/original/files/' ||
    'youtubedislikes_20211127161229_18654868.1637897329_vid.json.zst',
    'JSONLines'
  )"""
)
```

```text
336432
```

This file contains just over 300,000 records.

chdb doesn't yet support passing in query parameters, but we can pull out the path and pass it in via an f-String.

```python
path = 's3://clickhouse-public-datasets/youtube/original/files/youtubedislikes_20211127161229_18654868.1637897329_vid.json.zst'
```

```python
chdb.query(
  f"""
  SELECT count()
  FROM s3('{path}','JSONLines')
  """
)
```

:::warning
This is fine to do with variables defined in your program, but don't do it with user-provided input, otherwise your query is open to SQL injection.
:::

## Configuring the output format

The default output format is `CSV`, but we can change that via the `output_format` parameter. 
chDB supports the ClickHouse data formats, as well as [some of its own](/docs/en/chdb/reference/data-formats.md), including `DataFrame`, which returns a Pandas DataFrame:

```python
result = chdb.query(
  f"""
  SELECT is_ads_enabled, count()
  FROM s3('{path}','JSONLines')
  GROUP BY ALL
  """,
  output_format="DataFrame"
)

print(type(result))
print(result)
```

```text
<class 'pandas.core.frame.DataFrame'>
   is_ads_enabled  count()
0           False   301125
1            True    35307
```

Or if we want to get back an Apache Arrow table:

```python
result = chdb.query(
  f"""
  SELECT is_live_content, count()
  FROM s3('{path}','JSONLines')
  GROUP BY ALL
  """,
  output_format="ArrowTable"
)

print(type(result))
print(result)
```

```text
<class 'pyarrow.lib.Table'>
pyarrow.Table
is_live_content: bool
count(): uint64 not null
----
is_live_content: [[false,true]]
count(): [[315746,20686]]
```

## Creating a table from JSON file

Next, let's have a look at how to create a table in chDB. 
We need to use a different API to do that, so let's first import that:

```python
from chdb import session as chs
```

Next, we'll initialize a session.
If we want the session to be persisted to disk, we need to provide a directory name.
If we leave it blank, the database will be in-memory and lost as soon as we kill the Python process.

```python
sess = chs.Session("gettingStarted.chdb")
```

Next, we'll create a database:

```python
sess.query("CREATE DATABASE IF NOT EXISTS youtube")
```

Now we can create a `dislikes` table based on the schema from the JSON file, using the `CREATE...EMPTY AS` technique.
We'll use the [`schema_inference_make_columns_nullable`](/docs/en/operations/settings/formats/#schema_inference_make_columns_nullable) setting so that column types aren't all made `Nullable`.

```python
sess.query(f"""
  CREATE TABLE youtube.dislikes
  ORDER BY fetch_date 
  EMPTY AS 
  SELECT * 
  FROM s3('{path}','JSONLines')
  SETTINGS schema_inference_make_columns_nullable=0
  """
)
```

We can then use the `DESCRIBE` clause to inspect the schema:


```python
sess.query(f"""
   DESCRIBE youtube.dislikes
   SETTINGS describe_compact_output=1
   """
)
```

```text
"id","String"
"fetch_date","String"
"upload_date","String"
"title","String"
"uploader_id","String"
"uploader","String"
"uploader_sub_count","Int64"
"is_age_limit","Bool"
"view_count","Int64"
"like_count","Int64"
"dislike_count","Int64"
"is_crawlable","Bool"
"is_live_content","Bool"
"has_subtitles","Bool"
"is_ads_enabled","Bool"
"is_comments_enabled","Bool"
"description","String"
"rich_metadata","Array(Tuple(
    call String,
    content String,
    subtitle String,
    title String,
    url String))"
"super_titles","Array(Tuple(
    text String,
    url String))"
"uploader_badges","String"
"video_badges","String"
```


Next, let's populate that table:

```python
sess.query(f"""
  INSERT INTO youtube.dislikes
  SELECT * 
  FROM s3('{path}','JSONLines')
  SETTINGS schema_inference_make_columns_nullable=0
  """
)
```

We could also do both these steps in one go, using the `CREATE...AS` technique.
Let's create a different table using that technique:

```python
sess.query(f"""
  CREATE TABLE youtube.dislikes2
  ORDER BY fetch_date 
  AS 
  SELECT * 
  FROM s3('{path}','JSONLines')
  SETTINGS schema_inference_make_columns_nullable=0
  """
)
```

## Querying a table

Finally, let's query the table:

```sql
df = sess.query("""
  SELECT uploader, sum(view_count) AS viewCount, sum(like_count) AS likeCount, sum(dislike_count) AS dislikeCount
  FROM youtube.dislikes
  GROUP BY ALL
  ORDER BY viewCount DESC
  LIMIT 10
  """,
  "DataFrame"
)
df
```

```text
                             uploader  viewCount  likeCount  dislikeCount
0                             Jeremih  139066569     812602         37842
1                     TheKillersMusic  109313116     529361         11931
2  LetsGoMartin- Canciones Infantiles  104747788     236615        141467
3                    Xiaoying Cuisine   54458335    1031525         37049
4                                Adri   47404537     279033         36583
5                  Diana and Roma IND   43829341     182334        148740
6                      ChuChuTV Tamil   39244854     244614        213772
7                            Cheez-It   35342270        108            27
8                            Anime Uz   33375618    1270673         60013
9                    RC Cars OFF Road   31952962     101503         49489
```

Let's say we then add an extra column to the DataFrame to compute the ratio of likes to dislikes.
We could write the following code:

```python
df["likeDislikeRatio"] = df["likeCount"] / df["dislikeCount"]
```

## Querying a Pandas DataFrame

We can then query that DataFrame from chDB:

```python
chdb.query(
  """
  SELECT uploader, likeDislikeRatio
  FROM Python(df)
  """,
  output_format="DataFrame"
)
```

```text
                             uploader  likeDislikeRatio
0                             Jeremih         21.473548
1                     TheKillersMusic         44.368536
2  LetsGoMartin- Canciones Infantiles          1.672581
3                    Xiaoying Cuisine         27.842182
4                                Adri          7.627395
5                  Diana and Roma IND          1.225857
6                      ChuChuTV Tamil          1.144275
7                            Cheez-It          4.000000
8                            Anime Uz         21.173296
9                    RC Cars OFF Road          2.051021
```

You can also read more about querying Pandas DataFrames in the [Querying Pandas developer guide](guides/querying-pandas.md).

## Next steps

Hopefully, this guide has given you a good overview of chDB. 
To learn more about how to use it, see the following developer guides:

* [Querying Pandas DataFrames](guides/querying-pandas.md)
* [Querying Apache Arrow](guides/querying-apache-arrow.md)
* [Using chDB in JupySQL](guides/jupysql.md)
* [Using chDB with an existing clickhouse-local database](guides/clickhouse-local.md)
