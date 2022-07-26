---
sidebar_label: Ingest from an API
---
import CodeBlock from '@theme/CodeBlock';

# Ingest and query Hacker News data in 5 steps
Tab separated value, or TSV, files are common and may include field headings as the first line of the file. ClickHouse can ingest TSVs, and also can query TSVs without ingesting the files.  This guide covers both of these cases. If you need to query or ingest CSV files, the same techniques work, simply substitute `TSV` with `CSV` in your format arguments.

While working through this guide you will:
- **Investigate**: Query the structure and content of the TSV file.
- **Determine the target ClickHouse schema**: Choose proper data types and map the existing data to those types.
- **Create a ClickHouse table**.
- **Preprocess and stream** the data to ClickHouse.
- **Run some queries** against ClickHouse.

## Prerequisites

The script used to query the Hacker News API uses these commands; you may need to provide similar functionality if you are not using Linux or macOS.
- [`bash`](https://www.gnu.org/software/bash/)
- [`curl`](https://curl.se/)
- [Pipe Viewer](https://ivarch.com/programs/pv.shtml) (`pv`)

## 0. Preview the data without downloading the dataset
The dataset is about 12GB, before downloading it (or while it downloads) get an idea of the content.  Use `clickhouse-local` to run the query:
```sql
SELECT * FROM url('https://hacker-news.firebaseio.com/v0/item/{1..100}.json', JSONEachRow,
                  $$
                  id UInt32,
                  deleted UInt8,
                  type Enum('story' = 1, 'comment' = 2, 'poll' = 3, 'pollopt' = 4, 'job' = 5),
                  by LowCardinality(String),
                  time DateTime,
                  text String,
                  dead UInt8,
                  parent UInt32,
                  poll UInt32,
                  kids Array(UInt32),
                  url String,
                  score Int32,
                  title String,
                  parts Array(UInt32),
                  descendants Int32
                  $$) FORMAT Vertical
```

## 1. Download data from the official API

The API is documented at [github.com/HackerNews/API](https://github.com/HackerNews/API).  This `bash` loop will query the API and write JSON to disk.
:::note
This will take about a day, and the size of the download will be about 12GB.
:::
```
seq 0 2990 | xargs -P100 -I{} bash -c '
    BEGIN=$(({} * 10000));
    END=$((({} + 1) * 10000 - 1));
    echo $BEGIN $END;
    curl -sS --retry 100 "https://hacker-news.firebaseio.com/v0/item/[${BEGIN}-${END}].json" | pv > "hn{}.json"'
```


As an alternative, you can download prepared files from http://files.pushshift.io/hackernews/
But this source is abandoned and does not update.

## 2. Cleanup the download:

```
sed 's/{/\n{/g' hn0.json | grep -v -P '^null$' > hn0.json.tmp && mv hn0.json.tmp hn0.json
find . -size 40000c | xargs rm
grep -l -o -F '}null' *.json | xargs sed -i -r 's/}(null)+/}/g'
```

## 3. Create table:

```
CREATE TABLE hackernews
(
id UInt32,
deleted UInt8,
type Enum('story' = 1, 'comment' = 2, 'poll' = 3, 'pollopt' = 4, 'job' = 5),
by LowCardinality(String),
time DateTime,
text String,
dead UInt8,
parent UInt32,
poll UInt32,
kids Array(UInt32),
url String,
score Int32,
title String,
parts Array(UInt32),
descendants Int32
)
ENGINE = MergeTree ORDER BY id
```

## 4. Insert data:

```
ls -1 *.json | xargs -P$(($(nproc) / 4)) -I{} bash -c 'clickhouse-client --query "INSERT INTO hackernews FORMAT JSONEachRow" < {}'
```

24 seconds, 1 202 257 rows/sec.

## 5. Query the data

Top stories about ClickHouse
```
SELECT time, score, descendants, title, url, 'https://news.ycombinator.com/item?id=' || toString(id) AS hn_url
FROM hackernews WHERE type = 'story' AND title ILIKE '%ClickHouse%' ORDER BY score DESC
```

Top stories about MongoDB
```
SELECT time, score, descendants, title, url, 'https://news.ycombinator.com/item?id=' || toString(id) AS hn_url
FROM hackernews WHERE type = 'story' AND title ILIKE '%Mongo%' ORDER BY score DESC
```

Top stories about ClickHouse: https://gh-api.clickhouse.tech/play?user=play#U0VMRUNUIHRpbWUsIHNjb3JlLCBkZXNjZW5kYW50cywgdGl0bGUsIHVybCwgJ2h0dHBzOi8vbmV3cy55Y29tYmluYXRvci5jb20vaXRlbT9pZD0nIHx8IHRvU3RyaW5nKGlkKSBBUyBobl91cmwKRlJPTSBoYWNrZXJuZXdzIFdIRVJFIHR5cGUgPSAnc3RvcnknIEFORCB0aXRsZSBJTElLRSAnJUNsaWNrSG91c2UlJyBPUkRFUiBCWSBzY29yZSBERVND

## Optimizations
Lesson: better compression with `ZSTD`.

Look at the table size:
`SELECT * FROM system.tables WHERE name = 'hackernews' FORMAT Vertical`

Look at the columns size:
`SELECT name, data_compressed_bytes, data_uncompressed_bytes FROM system.columns WHERE table = 'hackernews' ORDER BY data_compressed_bytes DESC`

Set up new compression for columns:
`ALTER TABLE hackernews MODIFY COLUMN text CODEC(ZSTD), MODIFY COLUMN title CODEC(ZSTD), MODIFY COLUMN url CODEC(ZSTD)`

Rewrite columns to apply new compression:
`ALTER TABLE hackernews UPDATE text = text, title = title, url = url WHERE 1`

Show asynchronous mutation operations:
`SELECT * FROM system.mutations FORMAT Vertical`

Show the progress of data mutation:
`SELECT * FROM system.merges FORMAT Vertical`

Show how it makes the difference:
`SELECT name, data_compressed_bytes, data_uncompressed_bytes FROM system.columns WHERE table = 'hackernews' ORDER BY data_compressed_bytes DESC`

Lesson: create full text data skipping index.

```
ALTER TABLE hackernews ADD INDEX text_trigram (text) TYPE ngrambf_v1(3, 65536, 3, 1) GRANULARITY 1;
ALTER TABLE hackernews MATERIALIZE INDEX text_trigram;
SELECT * FROM system.merges FORMAT Vertical;
```

Compare query performance:
```
SELECT time, length(kids) AS kids, text, url, 'https://news.ycombinator.com/item?id=' || toString(id) AS hn_url FROM hackernews WHERE type = 'comment' AND text LIKE '%ClickHouse%' ORDER BY kids DESC LIMIT 10
```

Was: 0.832. Now: 0.395.

But for most popular terms like 'Redis' or 'mongo', the index don't help at all.

## Using text tokenization

Lesson: create another index by text tokenization.

```
ALTER TABLE hackernews
    ADD COLUMN words Array(String)
    DEFAULT arraySort(
              arrayDistinct(
                extractAll(
                  lower(
                    decodeXMLComponent(
                      extractTextFromHTML(text))),
                  '\w+')));

ALTER TABLE hackernews MATERIALIZE COLUMN words;

ALTER TABLE hackernews ADD INDEX words_bf (words) TYPE bloom_filter(0.01) GRANULARITY 1;

ALTER TABLE hackernews MATERIALIZE INDEX words_bf;

SELECT * FROM system.merges \G;
...
```

Use it in queries:
```
SELECT count() FROM hackernews WHERE has(words, 'clickhouse');
SELECT decodeXMLComponent(text) FROM hackernews WHERE has(words, 'clickhouse');
```

Enable/disable index for queries:
```
SET use_skipping_indexes = 0;
SET use_skipping_indexes = 1;
```

Was: 0.939. Now: 0.263.

## Domain rating
Something like domain rating: 

https://gh-api.clickhouse.tech/play?user=play#U0VMRUNUIGRvbWFpbldpdGhvdXRXV1codXJsKSBBUyBkLCBjb3VudCgpIEFTIGMsIHN1bShzY29yZSksIHJvdW5kKHN1bShzY29yZSkgKiAoMSAtIDEgLyBzcXJ0KGMpKSBBUyB3ZWlnaHQpIEFTIHdfcm91bmQsIHN1bShkZXNjZW5kYW50cyksIHJvdW5kKGF2ZyhzY29yZSksIDIpIEFTIGF2Z19zY29yZSwgcm91bmQoYXZnSWYoc2NvcmUsIHNjb3JlID49IDUpLCAyKSBBUyBzY29yZV9wYXNzZWQsIHJvdW5kKGF2ZyhzY29yZSA+PSA1KSwgMikgQVMgcmF0aW9fcGFzc2VkCkZST00gaGFja2VybmV3cyBXSEVSRSB0eXBlID0gJ3N0b3J5JwpHUk9VUCBCWSBkIE9SREVSIEJZIHdlaWdodCBERVNDIExJTUlUIDEwMDA=

## User rating
Something like user rating:

https://gh-api.clickhouse.tech/play?user=play#U0VMRUNUIGJ5LCBjb3VudCgpIEFTIGMsIHN1bShzY29yZSksIHJvdW5kKHN1bShzY29yZSkgKiAoMSAtIDEgLyBzcXJ0KGMpKSBBUyB3ZWlnaHQpIEFTIHdfcm91bmQsIHN1bShkZXNjZW5kYW50cyksIHJvdW5kKGF2ZyhzY29yZSksIDIpIEFTIGF2Z19zY29yZSwgcm91bmQoYXZnSWYoc2NvcmUsIHNjb3JlID49IDUpLCAyKSBBUyBzY29yZV9wYXNzZWQsIHJvdW5kKGF2ZyhzY29yZSA+PSA1KSwgMikgQVMgcmF0aW9fcGFzc2VkCkZST00gaGFja2VybmV3cyBXSEVSRSB0eXBlID0gJ3N0b3J5JwpHUk9VUCBCWSBieSBPUkRFUiBCWSB3ZWlnaHQgREVTQyBMSU1JVCAxMDAw

## How to update
How to update:

```
FROM=$(clickhouse-client --query "SELECT max(id) + 1 FROM hackernews"); TO=$(curl -sS https://hacker-news.firebaseio.com/v0/maxitem.json); echo "Downloading $((1 + TO - FROM)) items."; seq $FROM $TO | xargs -P100 -I{} curl -sSO --retry 100 https://hacker-news.firebaseio.com/v0/item/{}.json

grep -l -P '^null$' *.json | xargs rm

cat *.json | clickhouse-client --query "INSERT INTO hackernews FORMAT JSONEachRow" && rm *.json
```

Notes:
- story rating will be inaccurate;
- old comments are not updated;

## Community KPI
Community KPI:

https://gh-api.clickhouse.tech/play?user=play#U0VMRUNUIHRvU3RhcnRPZk1vbnRoKHRpbWUpIEFTIGRhdGUsIGNvdW50KCkKRlJPTSBoYWNrZXJuZXdzIFdIRVJFIHRleHQgSUxJS0UgJyVDbGlja0hvdXNlJScgT1IgdGl0bGUgSUxJS0UgJyVDbGlja0hvdXNlJScKR1JPVVAgQlkgZGF0ZSBPUkRFUiBCWSBkYXRl

## Normalized Community KPI
Normalized community KPI:

https://gh-api.clickhouse.tech/play?user=play#U0VMRUNUIHRvU3RhcnRPZk1vbnRoKHRpbWUpIEFTIGRhdGUsIHJvdW5kKGF2Zyh0ZXh0IElMSUtFICclQ2xpY2tIb3VzZSUnIE9SIHRpdGxlIElMSUtFICclQ2xpY2tIb3VzZSUnKSAqIDEwMDAwMDApIEFTIHJhdGluZwpGUk9NIGhhY2tlcm5ld3MKV0hFUkUgZGF0ZSA+PSAnMjAxNi0wNi0wMScKR1JPVVAgQlkgZGF0ZSBPUkRFUiBCWSBkYXRl

## Demo
Some small demo with build from #23932.

First 2 steps are the same.
3.

```sql
CREATE TABLE hackernews_raw
(
    `data` JSON
)
ENGINE = MergeTree
ORDER BY tuple()
```

4. 
```bash
ls -1 *.json | xargs -P$(($(nproc) / 8)) -I{} bash -c 'clickhouse client --query "INSERT INTO hackernews_raw FORMAT JSONAsObject" --input_format_parallel_parsing 0 < {}'
```

Disable parallel parsing, because it doesn't work with `JSONAsObject` for now.

5. Show deduced structure of table.
```sql
DESCRIBE TABLE hackernews_raw
FORMAT Vertical
SETTINGS describe_extend_object_types = 1
```

```
Row 1:
──────
name:               data
type:               Tuple(by String, dead UInt8, deleted UInt8, descendants Int16, id Int32, kids Array(Int32), parent Int32, parts Array(Int32), poll Int32, score Int16, text String, time Int32, title String, type String, url String)
default_type:       
default_expression: 
comment:            
codec_expression:   
ttl_expression:
```

6. Now you can write the same queries as with structured table.

```sql
SELECT
    data.time,
    data.score,
    data.descendants,
    length(data.kids),
    data.title,
    data.url,
    concat('https://news.ycombinator.com/item?id=', toString(data.id)) AS hn_url
FROM hackernews_raw
WHERE (data.type = 'story') AND (data.title ILIKE '%ClickHouse%')
ORDER BY data.score DESC
LIMIT 10
```

```
┌──data.time─┬─data.score─┬─data.descendants─┬─length(data.kids)─┬─data.title─────────────────────────────────────────────────────────────────────┬─data.url───────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─hn_url────────────────────────────────────────┐
│ 1632154428 │        519 │              159 │                29 │ ClickHouse, Inc.                                                               │ https://github.com/ClickHouse/ClickHouse/blob/master/website/blog/en/2021/clickhouse-inc.md                            │ https://news.ycombinator.com/item?id=28595419 │
│ 1614699632 │        383 │              134 │                27 │ ClickHouse as an alternative to Elasticsearch for log storage and analysis     │ https://pixeljets.com/blog/clickhouse-vs-elasticsearch/                                                                │ https://news.ycombinator.com/item?id=26316401 │
│ 1465985177 │        243 │               70 │                16 │ ClickHouse – high-performance open-source distributed column-oriented DBMS     │ https://clickhouse.yandex/reference_en.html                                                                            │ https://news.ycombinator.com/item?id=11908254 │
│ 1578331410 │        216 │               86 │                17 │ ClickHouse cost-efficiency in action: analyzing 500B rows on an Intel NUC      │ https://www.altinity.com/blog/2020/1/1/clickhouse-cost-efficiency-in-action-analyzing-500-billion-rows-on-an-intel-nuc │ https://news.ycombinator.com/item?id=21970952 │
│ 1622160768 │        198 │               55 │                12 │ ClickHouse: An open-source column-oriented database management system          │ https://github.com/ClickHouse/ClickHouse                                                                               │ https://news.ycombinator.com/item?id=27310247 │
│ 1613666429 │        128 │               52 │                 8 │ How ClickHouse saved our data (2020)                                           │ https://mux.com/blog/from-russia-with-love-how-clickhouse-saved-our-data/                                              │ https://news.ycombinator.com/item?id=26182015 │
│ 1583082328 │        124 │               75 │                 7 │ Clickhouse Local                                                               │ https://clickhouse.tech/docs/en/operations/utils/clickhouse-local/                                                     │ https://news.ycombinator.com/item?id=22457767 │
│ 1621231029 │        122 │               62 │                10 │ The ClickHouse Community                                                       │ https://clickhouse.tech/blog/en/2020/the-clickhouse-community/                                                         │ https://news.ycombinator.com/item?id=27180452 │
│ 1605816581 │        114 │               26 │                 5 │ Writing a Postgres Foreign Data Wrapper for Clickhouse in Go                   │ https://arunsori.me/posts/postgres-clickhouse-fdw-in-go/                                                               │ https://news.ycombinator.com/item?id=25153782 │
│ 1538219912 │        104 │               32 │                 7 │ ClickHouse, a column-oriented DBMS to generate analytical reports in real time │ https://github.com/yandex/ClickHouse                                                                                   │ https://news.ycombinator.com/item?id=18099796 │
└────────────┴────────────┴──────────────────┴───────────────────┴────────────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────────────┘


## foo
:::tip
The data is also available in Playground: https://gh-api.clickhouse.com/play?user=play#U0VMRUNUIHRvWWVhcih0aW1lKSBBUyBkLCBjb3VudCgpIEFTIGMsIGJhcihjLCAwLCAxMDAwMDAwMCwgMTAwKSBGUk9NIGhhY2tlcm5ld3MgR1JPVVAgQlkgZCBPUkRFUiBCWSBk
:::
