---
title: Simple example flow for extracting JSON data using a landing table with a Materialized View
description: "Simple example flow for extracting JSON data using a landing table with a Materialized View"
date: 2024-05-20
---

# A simple example flow for extracting JSON data using a landing table with a Materialized View

### Question

How do I work with JSON message using a source or landing table to extract with a Materialized View?  
How do I work with JSON without the experimental JSON Object?

### Answer

A common pattern to work with JSON data is to send the data to a landing table and use JSONExtract functions to pull the data onto a new table using a Materialized View trigger.
This is normally done in the following flow and pattern:
```
source data --> MergeTree table --> Materialized View (with base table) --> application/client
```

The landing table should have a `raw` string field where you would store the raw json.  It should also have one to two other fields that can be used for management of that table so that it could be partitioned and trimmed as the data ages.  

*some integrations can add fields to the original data for example if using the ClickHouse Kafka Connector Sink.

Simplified example below:
- create the example database
```
create database db1;
```

- create a landing table where your raw json will be inserted:
```
create table db1.table2_json_raw
(
    id Int32,
    timestamp DateTime,
    raw String
)
engine = MergeTree()
order by timestamp;
```

- create the base table for the materialized view
```
create table db1.table2_json_mv_base
(
 id Int32,
 timestamp DateTime,
 raw_string String,
 custId Int8,
 custName String
)
engine = MergeTree()
order by timestamp;
```

- create the materialized view to the base table
```
create materialized view db1.table2_json_mv to db1.table2_json_mv_base
AS SELECT
 id,
 timestamp,
 raw as raw_string,
 simpleJSONExtractRaw(raw, 'customerId') as custId,
 simpleJSONExtractRaw(raw, 'customerName') as custName
 FROM
db1.table2_json_raw;
```

- insert some sample rows
```
 insert into db1.table2_json_raw
 values
 (1, '2024-05-16 00:00:00', '{"customerId":1, "customerName":"ABC"}'),
 (2, '2024-05-16 00:00:01', '{"customerId":2, "customerName":"XYZ"}');
```

- view the results from the extraction and the materialized view that would be used in the queries
```
clickhouse-cloud :) select * from db1.table2_json_mv;

SELECT *
FROM db1.table2_json_mv

Query id: 12655fd3-567a-4dfb-9ef7-abc4b11ad044

┌─id─┬───────────timestamp─┬─raw_string─────────────────────────────┬─custId─┬─custName─┐
│  1 │ 2024-05-16 00:00:00 │ {"customerId":1, "customerName":"ABC"} │ 1      │ "ABC"    │
│  2 │ 2024-05-16 00:00:01 │ {"customerId":2, "customerName":"XYZ"} │ 2      │ "XYZ"    │
└────┴─────────────────────┴────────────────────────────────────────┴────────┴──────────┘
```

Additional Reference links:  
Materialized Views: https://clickhouse.com/docs/en/guides/developer/cascading-materialized-views  
Working with JSON: https://clickhouse.com/docs/en/integrations/data-formats/json#other-approaches  
JSON functions: https://clickhouse.com/docs/en/sql-reference/functions/json-functions  
