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
ls -1 *.json | xargs -P$(($(nproc) / 4)) -I{} bash -c \
'clickhouse-client --host HOSTNAME.clickhouse.cloud --secure --port 9440 --password PASSWORD --query "INSERT INTO hackernews FORMAT JSONEachRow" < {}'
```

```
ls -1 *.json | xargs -P$(($(nproc) / 4)) -I{} bash -c 'clickhouse-client --query "INSERT INTO hackernews FORMAT JSONEachRow" < {}'
```

```response
24 seconds, 1 202 257 rows/sec.
```

If you are inserting this data on a local machine the insert will be very quick, in the above example the data was inserted at more than 1 million rows per second.  If you are inserting this data across a slow network you may want to check the progress like this:
```sql
select formatReadableQuantity(count()) as progress from hackernews
```
```response
29.91 million
```

## 5. Query the data

Top stories about ClickHouse
```sql
SELECT
    time,
    score,
    descendants,
    title,
    url,
    concat('https://news.ycombinator.com/item?id=', toString(id)) AS hn_url
FROM hackernews
WHERE (type = 'story') AND (title ILIKE '%ClickHouse%')
ORDER BY score DESC
```
```response

Query id: 0ddcc2d0-c141-4824-91ea-0772d7f6110f

┌────────────────time─┬─score─┬─descendants─┬─title──────────────────────────────────────────────────────────────────────┬─url────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─hn_url────────────────────────────────────────┐
│ 2021-09-20 16:13:48 │   519 │         159 │ ClickHouse, Inc.                                                           │ https://github.com/ClickHouse/ClickHouse/blob/master/website/blog/en/2021/clickhouse-inc.md                                                        │ https://news.ycombinator.com/item?id=28595419 │
│ 2021-03-02 15:40:32 │   383 │         134 │ ClickHouse as an alternative to Elasticsearch for log storage and analysis │ https://pixeljets.com/blog/clickhouse-vs-elasticsearch/                                                                                            │ https://news.ycombinator.com/item?id=26316401 │
│ 2021-11-03 16:04:48 │   263 │          73 │ TimescaleDB vs ClickHouse                                                  │ https://pradeepchhetri.xyz/clickhousevstimescaledb/                                                                                                │ https://news.ycombinator.com/item?id=29096541 │
│ 2021-10-21 15:31:11 │   251 │         176 │ Comparing ClickHouse to PostgreSQL and TimescaleDB for time-series data    │ https://blog.timescale.com/blog/what-is-clickhouse-how-does-it-compare-to-postgresql-and-timescaledb-and-how-does-it-perform-for-time-series-data/ │ https://news.ycombinator.com/item?id=28945903 │
│ 2016-06-15 10:06:17 │   243 │          70 │ ClickHouse – high-performance open-source distributed column-oriented DBMS │ https://clickhouse.yandex/reference_en.html                                                                                                        │ https://news.ycombinator.com/item?id=11908254 │
│ 2020-01-06 17:23:30 │   216 │          86 │ ClickHouse cost-efficiency in action: analyzing 500B rows on an Intel NUC  │ https://www.altinity.com/blog/2020/1/1/clickhouse-cost-efficiency-in-action-analyzing-500-billion-rows-on-an-intel-nuc                             │ https://news.ycombinator.com/item?id=21970952 │
│ 2021-05-28 00:12:48 │   198 │          55 │ ClickHouse: An open-source column-oriented database management system      │ https://github.com/ClickHouse/ClickHouse                                                                                                           │ https://news.ycombinator.com/item?id=27310247 │
│ 2021-12-16 13:17:02 │   133 │          55 │ What's New in ClickHouse 21.12                                             │ https://clickhouse.com/blog/en/2021/clickhouse-v21.12-released/                                                                                    │ https://news.ycombinator.com/item?id=29577794 │
│ 2021-02-18 16:40:29 │   128 │          52 │ How ClickHouse saved our data (2020)                                       │ https://mux.com/blog/from-russia-with-love-how-clickhouse-saved-our-data/                                                                          │ https://news.ycombinator.com/item?id=26182015 │
│ 2020-03-01 17:05:28 │   124 │          75 │ Clickhouse Local                                                           │ https://clickhouse.tech/docs/en/operations/utils/clickhouse-local/                                                                                 │ https://news.ycombinator.com/item?id=22457767 │
.
.
.
```

Top stories about MongoDB
```sql
SELECT
    time,
    score,
    descendants,
    title,
    url,
    concat('https://news.ycombinator.com/item?id=', toString(id)) AS hn_url
FROM hackernews
WHERE (type = 'story') AND (title ILIKE '%Mongo%')
ORDER BY score DESC
```
```response
Query id: a3605b6b-2aaa-4b66-9d5e-6197946a3e89

┌────────────────time─┬─score─┬─descendants─┬─title─────────────────────────────────────────────────────────────────┬─url─────────────────────────────────────────────────────────────────────────────────┬─hn_url────────────────────────────────────────┐
│ 2018-12-19 17:08:53 │  1562 │         417 │ Bye Bye Mongo, Hello Postgres                                         │ https://www.theguardian.com/info/2018/nov/30/bye-bye-mongo-hello-postgres           │ https://news.ycombinator.com/item?id=18717168 │
│ 2015-03-10 16:51:05 │   802 │         374 │ Goodbye MongoDB, Hello PostgreSQL                                     │ http://developer.olery.com/blog/goodbye-mongodb-hello-postgresql/                   │ https://news.ycombinator.com/item?id=9178773  │
│ 2020-05-23 18:33:05 │   791 │         399 │ Jepsen Disputes MongoDB's Data Consistency Claims                     │ https://www.infoq.com/news/2020/05/Jepsen-MongoDB-4-2-6/                            │ https://news.ycombinator.com/item?id=23285249 │
│ 2011-11-06 07:05:13 │   706 │         293 │ Don't use MongoDB                                                     │ http://pastebin.com/raw.php?i=FD3xe6Jt                                              │ https://news.ycombinator.com/item?id=3202081  │
│ 2015-04-21 23:08:12 │   605 │         144 │ Call Me Maybe: MongoDB Stale Reads                                    │ https://aphyr.com/posts/322-call-me-maybe-mongodb-stale-reads                       │ https://news.ycombinator.com/item?id=9417773  │
│ 2020-05-24 11:42:01 │   604 │         254 │ Jepsen: MongoDB 4.2.6                                                 │ http://jepsen.io/analyses/mongodb-4.2.6                                             │ https://news.ycombinator.com/item?id=23290844 │
│ 2013-11-11 17:26:07 │   568 │         337 │ Why You Should Never Use MongoDB                                      │ http://www.sarahmei.com/blog/2013/11/11/why-you-should-never-use-mongodb/           │ https://news.ycombinator.com/item?id=6712703  │
│ 2021-06-29 00:20:37 │   554 │         264 │ A Docker footgun led to a vandal deleting NewsBlur's MongoDB database │ https://blog.newsblur.com/2021/06/28/story-of-a-hacking/                            │ https://news.ycombinator.com/item?id=27670058 │
│ 2019-01-09 22:41:27 │   519 │         306 │ Amazon DocumentDB, with MongoDB compatibility                         │ https://aws.amazon.com/documentdb/                                                  │ https://news.ycombinator.com/item?id=18869755 │
│ 2019-01-14 12:51:56 │   502 │         248 │ AWS, MongoDB, and the Economic Realities of Open Source               │ https://stratechery.com/2019/aws-mongodb-and-the-economic-realities-of-open-source/ │ https://news.ycombinator.com/item?id=18902578 │
.
.
.
```

Top stories about ClickHouse: https://gh-api.clickhouse.tech/play?user=play#U0VMRUNUIHRpbWUsIHNjb3JlLCBkZXNjZW5kYW50cywgdGl0bGUsIHVybCwgJ2h0dHBzOi8vbmV3cy55Y29tYmluYXRvci5jb20vaXRlbT9pZD0nIHx8IHRvU3RyaW5nKGlkKSBBUyBobl91cmwKRlJPTSBoYWNrZXJuZXdzIFdIRVJFIHR5cGUgPSAnc3RvcnknIEFORCB0aXRsZSBJTElLRSAnJUNsaWNrSG91c2UlJyBPUkRFUiBCWSBzY29yZSBERVND

## Optimizations
Lesson: better compression with `ZSTD`.

Look at the table size:
```sql
SELECT *
FROM system.tables
WHERE name = 'hackernews'
FORMAT Vertical
```
```response
Query id: 7b343c03-9a3e-4fe1-8e89-9a907768544e

Row 1:
──────
database:                      default
name:                          hackernews
uuid:                          0cf144c1-e9ff-46ce-afe1-d6f1fa9774d5
engine:                        ReplicatedMergeTree
is_temporary:                  0
data_paths:                    ['/var/lib/clickhouse/disks/s3disk/store/0cf/0cf144c1-e9ff-46ce-afe1-d6f1fa9774d5/']
metadata_path:                 /var/lib/clickhouse/store/a07/a07efb59-1e20-4b51-950d-fa5a5244021d/hackernews.sql
metadata_modification_time:    2022-07-27 12:15:24
dependencies_database:         []
dependencies_table:            []
create_table_query:            CREATE TABLE default.hackernews (`id` UInt32, `deleted` UInt8, `type` Enum8('story' = 1, 'comment' = 2, 'poll' = 3, 'pollopt' = 4, 'job' = 5), `by` LowCardinality(String), `time` DateTime, `text` String, `dead` UInt8, `parent` UInt32, `poll` UInt32, `kids` Array(UInt32), `url` String, `score` Int32, `title` String, `parts` Array(UInt32), `descendants` Int32) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}') ORDER BY id SETTINGS index_granularity = 8192
engine_full:                   ReplicatedMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}') ORDER BY id SETTINGS index_granularity = 8192
as_select:                     
partition_key:                 
sorting_key:                   id
primary_key:                   id
sampling_key:                  
storage_policy:                s3
total_rows:                    29909998
# highlight-next-line
total_bytes:                   4970794399
lifetime_rows:                 ᴺᵁᴸᴸ
lifetime_bytes:                ᴺᵁᴸᴸ
comment:                       
has_own_data:                  1
loading_dependencies_database: []
loading_dependencies_table:    []
loading_dependent_database:    []
loading_dependent_table:       []

1 row in set. Elapsed: 0.089 sec. 
```

Look at the columns size:
```sql
SELECT
    name,
    data_compressed_bytes,
    data_uncompressed_bytes
FROM system.columns
WHERE table = 'hackernews'
ORDER BY data_compressed_bytes DESC
```
```response
┌─name────────┬─data_compressed_bytes─┬─data_uncompressed_bytes─┐
│ text        │            4264959668 │              9960758230 │
│ url         │             138335322 │               313756622 │
│ title       │             120153534 │               232426220 │
│ by          │             119518709 │               158301631 │
│ time        │              83993018 │               119639992 │
│ kids        │              79855129 │               341319868 │
│ id          │              79729869 │               119639992 │
│ parent      │              62454155 │               119639992 │
│ score       │               8281032 │               119639992 │
│ type        │               4559393 │                29909998 │
│ descendants │               3291333 │               119639992 │
│ dead        │               2129201 │                29909998 │
│ deleted     │               1608138 │                29909998 │
│ parts       │                202267 │               239326300 │
│ poll        │                 99933 │               119639992 │
└─────────────┴───────────────────────┴─────────────────────────┘
```


Set up new compression for columns:
```
ALTER TABLE hackernews MODIFY COLUMN text CODEC(ZSTD), MODIFY COLUMN title CODEC(ZSTD), MODIFY COLUMN url CODEC(ZSTD)
```

Rewrite columns to apply new compression:

```
ALTER TABLE hackernews UPDATE text = text, title = title, url = url WHERE 1
```

Show asynchronous mutation operations:

```
SELECT * FROM system.mutations FORMAT Vertical
```

Show the progress of data mutation:

```
SELECT * FROM system.merges FORMAT Vertical
```

Show how it makes the difference:

```
SELECT name, data_compressed_bytes, data_uncompressed_bytes FROM system.columns WHERE table = 'hackernews' ORDER BY data_compressed_bytes DESC
```
```sql
clickhouse-cloud :) SELECT name, data_compressed_bytes, data_uncompressed_bytes FROM system.columns WHERE table = 'hackernews' ORDER BY data_compressed_bytes DESC

SELECT
    name,
    data_compressed_bytes,
    data_uncompressed_bytes
FROM system.columns
WHERE table = 'hackernews'
ORDER BY data_compressed_bytes DESC

Query id: 81e952cf-f922-4b91-8fb4-65bb6e6b81eb

┌─name────────┬─data_compressed_bytes─┬─data_uncompressed_bytes─┐
│ text        │            4264959668 │              9960758230 │
│ url         │             138335322 │               313756622 │
│ title       │             120153534 │               232426220 │
│ by          │             119518709 │               158301631 │
│ time        │              83993018 │               119639992 │
│ kids        │              79855129 │               341319868 │
│ id          │              79729869 │               119639992 │
│ parent      │              62454155 │               119639992 │
│ score       │               8281032 │               119639992 │
│ type        │               4559393 │                29909998 │
│ descendants │               3291333 │               119639992 │
│ dead        │               2129201 │                29909998 │
│ deleted     │               1608138 │                29909998 │
│ parts       │                202267 │               239326300 │
│ poll        │                 99933 │               119639992 │
└─────────────┴───────────────────────┴─────────────────────────┘

15 rows in set. Elapsed: 0.084 sec. 

clickhouse-cloud :) ALTER TABLE hackernews MODIFY COLUMN text CODEC(ZSTD), MODIFY COLUMN title CODEC(ZSTD), MODIFY COLUMN url CODEC(ZSTD)

ALTER TABLE hackernews
    MODIFY COLUMN `text` CODEC(ZSTD),
    MODIFY COLUMN `title` CODEC(ZSTD),
    MODIFY COLUMN `url` CODEC(ZSTD)

Query id: 5e0d588e-4597-4f8d-8434-d3b717e771c4

┌─host─────────────────────────────┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ default|c-crimson-ey-30-server-1 │      0 │       │                   1 │                1 │
└──────────────────────────────────┴────────┴───────┴─────────────────────┴──────────────────┘
┌─host─────────────────────────────┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ default|c-crimson-ey-30-server-0 │      0 │       │                   0 │                0 │
└──────────────────────────────────┴────────┴───────┴─────────────────────┴──────────────────┘

2 rows in set. Elapsed: 0.237 sec. 

clickhouse-cloud :) ALTER TABLE hackernews UPDATE text = text, title = title, url = url WHERE 1

ALTER TABLE hackernews
    UPDATE text = text, title = title, url = url WHERE 1

Query id: bf3f97ad-2a1e-4979-80a9-3d9293ab73ea

┌─host─────────────────────────────┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ default|c-crimson-ey-30-server-1 │      0 │       │                   1 │                1 │
└──────────────────────────────────┴────────┴───────┴─────────────────────┴──────────────────┘
┌─host─────────────────────────────┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ default|c-crimson-ey-30-server-0 │      0 │       │                   0 │                0 │
└──────────────────────────────────┴────────┴───────┴─────────────────────┴──────────────────┘

2 rows in set. Elapsed: 0.278 sec. 

clickhouse-cloud :) SELECT * FROM system.mutations FORMAT Vertical

SELECT *
FROM system.mutations
FORMAT Vertical

Query id: 59652133-b21f-454a-bb12-f4d4c465f7f1

Row 1:
──────
database:                   default
table:                      hackernews
mutation_id:                0000000000
command:                    UPDATE text = text, title = title, url = url WHERE 1
create_time:                2022-07-27 15:04:28
block_numbers.partition_id: ['all']
block_numbers.number:       [2991]
parts_to_do_names:          ['all_0_2700_5']
parts_to_do:                1
is_done:                    0
latest_failed_part:         
latest_fail_time:           1970-01-01 00:00:00
latest_fail_reason:         

1 row in set. Elapsed: 0.085 sec. 

clickhouse-cloud :) SELECT * FROM system.merges FORMAT Vertical

SELECT *
FROM system.merges
FORMAT Vertical

Query id: 21c10ecc-6ab1-4266-8a8a-6c9e633f1c9e

Row 1:
──────
database:                    default
table:                       hackernews
elapsed:                     30.385368962
progress:                    0.5061707150070873
num_parts:                   1
source_part_names:           ['all_0_2700_5']
result_part_name:            all_0_2700_5_2991
source_part_paths:           ['/var/lib/clickhouse/disks/s3disk/store/0cf/0cf144c1-e9ff-46ce-afe1-d6f1fa9774d5/all_0_2700_5/']
result_part_path:            /var/lib/clickhouse/disks/s3disk/store/0cf/0cf144c1-e9ff-46ce-afe1-d6f1fa9774d5/all_0_2700_5_2991/
partition_id:                all
is_mutation:                 1
total_size_bytes_compressed: 4487923523
total_size_marks:            3354
bytes_read_uncompressed:     4983851115
rows_read:                   13671670
bytes_written_uncompressed:  4980764531
rows_written:                13663479
columns_written:             12
memory_usage:                78102352
thread_id:                   58
merge_type:                  
merge_algorithm:             

1 row in set. Elapsed: 0.084 sec. 

clickhouse-cloud :) SELECT * FROM system.mutations FORMAT Vertical

SELECT *
FROM system.mutations
FORMAT Vertical

Query id: 8461013f-b534-4ec3-bbe2-07f7527b96f0

Row 1:
──────
database:                   default
table:                      hackernews
mutation_id:                0000000000
command:                    UPDATE text = text, title = title, url = url WHERE 1
create_time:                2022-07-27 15:04:28
block_numbers.partition_id: ['all']
block_numbers.number:       [2991]
parts_to_do_names:          ['all_0_2700_5']
parts_to_do:                1
is_done:                    0
latest_failed_part:         
latest_fail_time:           1970-01-01 00:00:00
latest_fail_reason:         

1 row in set. Elapsed: 0.089 sec. 

clickhouse-cloud :) SELECT * FROM system.merges FORMAT Vertical

SELECT *
FROM system.merges
FORMAT Vertical

Query id: f4012a4f-b204-45bb-92e8-8e1f8d5a4690

Row 1:
──────
database:                    default
table:                       hackernews
elapsed:                     54.191258513
progress:                    0.8825604133698937
num_parts:                   1
source_part_names:           ['all_0_2700_5']
result_part_name:            all_0_2700_5_2991
source_part_paths:           ['/var/lib/clickhouse/disks/s3disk/store/0cf/0cf144c1-e9ff-46ce-afe1-d6f1fa9774d5/all_0_2700_5/']
result_part_path:            /var/lib/clickhouse/disks/s3disk/store/0cf/0cf144c1-e9ff-46ce-afe1-d6f1fa9774d5/all_0_2700_5_2991/
partition_id:                all
is_mutation:                 1
total_size_bytes_compressed: 4487923523
total_size_marks:            3354
bytes_read_uncompressed:     8876352008
rows_read:                   23837955
bytes_written_uncompressed:  8873206554
rows_written:                23829763
columns_written:             12
memory_usage:                77987072
thread_id:                   58
merge_type:                  
merge_algorithm:             

1 row in set. Elapsed: 0.089 sec. 

clickhouse-cloud :) SELECT * FROM system.merges FORMAT Vertical

SELECT *
FROM system.merges
FORMAT Vertical

Query id: 7b071f14-757c-4ae1-9560-d835a1bea03e

Ok.

0 rows in set. Elapsed: 0.087 sec. 

clickhouse-cloud :) SELECT name, data_compressed_bytes, data_uncompressed_bytes FROM system.columns WHERE table = 'hackernews' ORDER BY data_compressed_bytes DESC

SELECT
    name,
    data_compressed_bytes,
    data_uncompressed_bytes
FROM system.columns
WHERE table = 'hackernews'
ORDER BY data_compressed_bytes DESC

Query id: 7bd99fc8-5b21-4848-9711-18f9979b9da5

┌─name────────┬─data_compressed_bytes─┬─data_uncompressed_bytes─┐
│ text        │            4264959668 │              9960758230 │
│ url         │             138335322 │               313756622 │
│ title       │             120153534 │               232426220 │
│ by          │             119518709 │               158301631 │
│ time        │              83993018 │               119639992 │
│ kids        │              79855129 │               341319868 │
│ id          │              79729869 │               119639992 │
│ parent      │              62454155 │               119639992 │
│ score       │               8281032 │               119639992 │
│ type        │               4559393 │                29909998 │
│ descendants │               3291333 │               119639992 │
│ dead        │               2129201 │                29909998 │
│ deleted     │               1608138 │                29909998 │
│ parts       │                202267 │               239326300 │
│ poll        │                 99933 │               119639992 │
└─────────────┴───────────────────────┴─────────────────────────┘

15 rows in set. Elapsed: 0.094 sec. 

clickhouse-cloud :) SELECT * FROM system.mutations FORMAT Vertical

SELECT *
FROM system.mutations
FORMAT Vertical

Query id: a16369ce-f83d-4265-bb7a-b6adc4b63996

Row 1:
──────
database:                   default
table:                      hackernews
mutation_id:                0000000000
command:                    UPDATE text = text, title = title, url = url WHERE 1
create_time:                2022-07-27 15:04:28
block_numbers.partition_id: ['all']
block_numbers.number:       [2991]
parts_to_do_names:          []
parts_to_do:                0
is_done:                    1
latest_failed_part:         
latest_fail_time:           1970-01-01 00:00:00
latest_fail_reason:         

1 row in set. Elapsed: 0.085 sec. 

clickhouse-cloud :) SELECT * FROM system.mutations FORMAT Vertical

SELECT *
FROM system.mutations
FORMAT Vertical

Query id: bd3102f9-a57f-44c3-9f76-585411f68df9

Row 1:
──────
database:                   default
table:                      hackernews
mutation_id:                0000000000
command:                    UPDATE text = text, title = title, url = url WHERE 1
create_time:                2022-07-27 15:04:28
block_numbers.partition_id: ['all']
block_numbers.number:       [2991]
parts_to_do_names:          []
parts_to_do:                0
is_done:                    1
latest_failed_part:         
latest_fail_time:           1970-01-01 00:00:00
latest_fail_reason:         

1 row in set. Elapsed: 0.088 sec. 
```

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
