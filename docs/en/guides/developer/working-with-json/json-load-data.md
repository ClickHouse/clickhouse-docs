---
slug: /en/guides/developer/working-with-json/json-load-data
sidebar_label: Loading JSON
sidebar_position: 1
description: Loading JSON into ClickHouse
---

# Loading JSON in 5 steps

This guide walks through the process to load logging data that is 
in a JSON formatted file in S3.  In order to do this:
- Examine the file format by selecting one row using the S3 function
- Create a table to store the data in ClickHouse
- Insert one record to see the default JSON handling
- Configure the importing of nested JSON and repeat the single record insert
- Verify the correct storage of the nested JSON
- Import the dataset from S3

## Examine the structure of the JSON file
Examine one record from the log file in S3.  The `s3` function
retrieves and decompresses the file and allows querying the file
in S3 without loading it.
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
efficient for the users of the log data is that JSON is also extracted
into separate fields. The next two steps will be performed with this
optimization in mind.

## Create a ClickHouse table
To maximize the usefulness of the data we
need to extract the nested `method`, `path`, and `version` fields under `request`.  To prepare for this, create a table including those nested fields:
```sql
CREATE table http
(
   `@timestamp` Int32 EPHEMERAL 0,
   clientip     IPv4,
# highlight-next-line
   request Nested(method LowCardinality(String), path String, version LowCardinality(String)),
   status       UInt16,
   size         UInt32,
   timestamp    DateTime DEFAULT toDateTime(`@timestamp`)
) ENGINE = MergeTree() ORDER BY (status, timestamp);
```

## Insert one row
```sql
INSERT INTO http (`@timestamp`, clientip, request.method, request.path, request.version, status, size) SELECT
    `@timestamp`,
    clientip,
    [request['method']],
    [request['path']],
    [request['version']],
    status,
    size
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONEachRow')
LIMIT 1
```
## Verify that the nested JSON is extracted

The `request.method`, `request.path`, and `request.version` should be
extracted into the proper columns.
```sql
select * from http
```
```response
┌─clientip───┬─request.method─┬─request.path──────────┬─request.version─┬─status─┬──size─┬───────────timestamp─┐
│ 40.135.0.0 │ ['GET']        │ ['/images/hm_bg.jpg'] │ ['HTTP/1.0']    │    200 │ 24736 │ 1998-04-30 19:30:17 │
└────────────┴────────────────┴───────────────────────┴─────────────────┴────────┴───────┴─────────────────────┘
```

## Insert the dataset

:::tip
The full dataset is 10 million rows, you can use `LIMIT` to reduce
the number of rows inserted.  The query shown inserts 1 million rows.
:::

```sql
INSERT INTO http (`@timestamp`, clientip, request.method, request.path, request.version, status, size) SELECT
    `@timestamp`,
    clientip,
    [request['method']],
    [request['path']],
    [request['version']],
    status,
    size
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz', 'JSONEachRow')
LIMIT 1000000;
```

## Query the data
Note that the fields nested under request are of type `Array`, for
example, `request.method` is of type `Array(LowCardinality(String))`
and is therefore queried as `request.method[1]` in the query below.

```sql
SELECT
    status,
# highlight-next-line
    request.method[1] AS method,
    count() AS c
FROM http
WHERE (status >= 400) AND ((timestamp >= '1998-01-01 00:00:00') AND (timestamp <= '1998-06-01 00:00:00'))
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

