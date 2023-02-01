---
slug: /en/guides/developer/working-with-json/json-load-data
sidebar_label: "Tutorial: Loading JSON"
sidebar_position: 1
description: Loading JSON into ClickHouse
toc_max_heading_level: 2
---

# Loading JSON in 5 steps

This guide walks through the process to load logging data that is 
in a JSON formatted file in S3.  In order to do this:
- Examine the file format by selecting one row using the S3 function
- Create a table to store the data in ClickHouse
- Load a single row of nested JSON
- Verify the correct storage of the nested JSON
- Import the dataset from S3

:::note
This tutorial requires ClickHouse version 22.11 or higher.
:::

## Examine the structure of the JSON file
Examine the structure and one record from the log file in S3.  The `s3` function
retrieves and decompresses the file and allows querying the file
in S3 without loading it.

This is what a row of the file contains:
```json
{"@timestamp":893964617,"clientip":"40.135.0.0","request":{"method":"GET","path":"/images/hm_bg.jpg","version":"HTTP/1.0"},"status":200,"size":24736}
```
It is also very useful to look at the description of the file returned by the DESCRIBE command and a SELECT.

#### DESCRIBE
```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 
'JSONEachRow');
```
```response
┌─name───────┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ @timestamp │ Nullable(Int64)               │              │                    │         │                  │                │
│ clientip   │ Nullable(String)              │              │                    │         │                  │                │
│ request    │ Map(String, Nullable(String)) │              │                    │         │                  │                │
│ status     │ Nullable(Int64)               │              │                    │         │                  │                │
│ size       │ Nullable(Int64)               │              │                    │         │                  │                │
└────────────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

#### SELECT
```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 
'JSONEachRow') LIMIT 1;
```
```response
┌─@timestamp─┬─clientip───┬─request──────────────────────────────────────────────────────────┬─status─┬──size─┐
│  893964617 │ 40.135.0.0 │ {'method':'GET','path':'/images/hm_bg.jpg','version':'HTTP/1.0'} │    200 │ 24736 │
└────────────┴────────────┴──────────────────────────────────────────────────────────────────┴────────┴───────┘
```
Note that the `response` field contains nested JSON, it is more
efficient for the users of the log data if that JSON is also extracted
into separate fields. The next two steps will be performed with this
optimization in mind.

## Create a ClickHouse table
To maximize the usefulness of the data we
need to extract the nested `method`, `path`, and `version` fields under `request`.  To prepare for this, create a table including those nested fields:
```sql
CREATE TABLE http
(
    `@timestamp` DateTime,
    `clientip` IPv4,
# highlight-next-line
    `request` Tuple(method LowCardinality(String), path String, version LowCardinality(String)),
    `status` UInt16,
    `size` UInt32
)
ENGINE = MergeTree
ORDER BY (status, `@timestamp`)
```
### Describe the table and note the `request` column

The `request` field from the JSON file will be stored as a tuple.
```sql
DESCRIBE TABLE http
```
```response
┌─name───────┬─type──────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ @timestamp │ DateTime                                                                          │              │                    │         │                  │                │
│ clientip   │ IPv4                                                                              │              │                    │         │                  │                │
# highlight-next-line
│ request    │ Tuple(method LowCardinality(String), path String, version LowCardinality(String)) │              │                    │         │                  │                │
│ status     │ UInt16                                                                            │              │                    │         │                  │                │
│ size       │ UInt32                                                                            │              │                    │         │                  │                │
└────────────┴───────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

## Insert one row

When the response is inserted, all three components of the request are inserted.
```sql
INSERT INTO http SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONEachRow')
LIMIT 1
```
## Verify

The `method`, `path`, and `version` should be available to query individually.
```sql
SELECT
    request.method,
    request.path,
    request.version
FROM http
```
```response
┌─request.method─┬─request.path──────┬─request.version─┐
│ GET            │ /images/hm_bg.jpg │ HTTP/1.0        │
└────────────────┴───────────────────┴─────────────────┘
```

## Insert the dataset

:::tip
The full dataset is 10 million rows, you can use `LIMIT` to reduce
the number of rows inserted.  The query shown inserts 1 million rows.
:::

```sql
INSERT INTO http SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONEachRow')
LIMIT 1000000;
```

## Query the data

This query gives a count of the queries between January 1st and June 1st grouped by the method and status.
```sql
SELECT
    status,
# highlight-next-line
    request.method AS method,
    count() AS c
FROM http
WHERE (status >= 400) AND ((`@timestamp` >= '1998-01-01 00:00:00') AND (`@timestamp` <= '1998-06-01 00:00:00'))
GROUP BY
    method,
    status
ORDER BY c DESC
LIMIT 5
```
```response
┌─status─┬─method──┬────c─┐
│    404 │ GET     │ 1161 │
│    500 │ POST    │   14 │
│    400 │ GET     │   13 │
│    404 │ OPTIONS │   12 │
│    500 │ GET     │    6 │
└────────┴─────────┴──────┘
```
## More information
### Limitations and other approaches
If any of the fields in the tuple (`request.`: `method`, `path`, and `version`) need to be included in the ORDER BY or PRIMARY KEY of the table, then the entire tuple must be added to the ORDER BY or PRIMARY Key.  For more information on the pros and cons of this method and other methods of loading JSON see [JSON other approaches](/docs/en/guides/developer/working-with-json/json-other-approaches.md).
### JSON input and output formats
  The format `JSONEachRow` is used in this guide, but there are other options, see the [input and output format docs](/docs/en/interfaces/formats.md/#json).
