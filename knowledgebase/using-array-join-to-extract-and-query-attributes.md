---
title: How to use array join to extract and query varying attributes using map keys and values
description: “Simple example to illustrate how to use array join to extract and query varying attributes using map keys and values“
date: 2024-06-21    
---

# How to use array join to extract and query varying attributes using map keys and values

### Question

If I have varying attributes in a column using map types, how can I extract them and use them in queries?

### Answer

This is a basic example of extracting keys and values from a variable attributes field.
This method will create seemingly duplicates from each row in the source/raw table.  Due to the keys and values being extracted, however, they can be put into the Primary Key or a secondary with an index, such as a bloom filter.

In this example, we basically have a source that creates a metrics table, it has multiple attributes that can apply in an attributes field that has maps.  If there are attributes that will always be present for records, it is better to pull those out into their own columns and populate.

You should be able to just copy and paste to see what the outputs would be and what the materialized view does in this instance.

Create a sample database:
```
create database db1;
```

Create the initial table that will have the rows and attributes:
```
create table db1.table1_metric_map
(
  id UInt32,
  timestamp DateTime,
  metric_name String,
  metric_value Int32,
  attributes Map(String, String)
)
engine = MergeTree()
order by timestamp;
```

Insert sample rows into the table.  The sample size is intentionally small so that when the materialized view is created, you can see how the rows are multiplied for each attribute.
```
insert into db1.table1_metric_map
VALUES
(1, '2023-09-20 00:01:00', 'ABC', 10, {'env':'prod','app':'app1','server':'server1'}),
(2, '2023-09-20 00:01:00', 'ABC', 20,{'env':'prod','app':'app2','server':'server1','dc':'dc1'}),
(3, '2023-09-20 00:01:00', 'ABC', 30,{'env':'qa','app':'app1','server':'server1'}),
(4, '2023-09-20 00:01:00', 'ABC', 40,{'env':'qa','app':'app2','server':'server1','dc':'dc1'}),
(5, '2023-09-20 00:01:00', 'DEF', 50,{'env':'prod','app':'app1','server':'server2'}),
(6, '2023-09-20 00:01:00', 'DEF', 60, {'env':'prod','app':'app2','server':'server1'}),
(7, '2023-09-20 00:01:00', 'DEF', 70,{'env':'qa','app':'app1','server':'server1'}),
(8, '2023-09-20 00:01:00', 'DEF', 80,{'env':'qa','app':'app2','server':'server1'}),
(9, '2023-09-20 00:02:00', 'ABC', 90,{'env':'prod','app':'app1','server':'server1'}),
(10, '2023-09-20 00:02:00', 'ABC', 100,{'env':'prod','app':'app1','server':'server2'}),
(11, '2023-09-20 00:02:00', 'ABC', 110,{'env':'qa','app':'app1','server':'server1'}),
(12, '2023-09-20 00:02:00', 'ABC', 120,{'env':'qa','app':'app1','server':'server1'}),
(13, '2023-09-20 00:02:00', 'DEF', 130,{'env':'prod','app':'app1','server':'server1'}),
(14, '2023-09-20 00:02:00', 'DEF', 140,{'env':'prod','app':'app2','server':'server1','dc':'dc1'}),
(15, '2023-09-20 00:02:00', 'DEF', 150,{'env':'qa','app':'app1','server':'server2'}),
(16, '2023-09-20 00:02:00', 'DEF', 160,{'env':'qa','app':'app1','server':'server1','dc':'dc1'}),
(17, '2023-09-20 00:03:00', 'ABC', 170,{'env':'prod','app':'app1','server':'server1'}),
(18, '2023-09-20 00:03:00', 'ABC', 180,{'env':'prod','app':'app1','server':'server1'}),
(19, '2023-09-20 00:03:00', 'ABC', 190,{'env':'qa','app':'app1','server':'server1'}),
(20, '2023-09-20 00:03:00', 'ABC', 200,{'env':'qa','app':'app1','server':'server2'}),
(21, '2023-09-20 00:03:00', 'DEF', 210,{'env':'prod','app':'app1','server':'server1'}),
(22, '2023-09-20 00:03:00', 'DEF', 220,{'env':'prod','app':'app1','server':'server1'}),
(23, '2023-09-20 00:03:00', 'DEF', 230,{'env':'qa','app':'app1','server':'server1'}),
(24, '2023-09-20 00:03:00', 'DEF', 240,{'env':'qa','app':'app1','server':'server1'});
```

We can then create a materialized view with array join so that it can extract the map attributes onto keys and values columns.  For demonstration, in the example below, it uses an implicit table (with the POPULATE command, and backing table like `.inner.{uuid}...` ).  The recommended best practice, however, is to use an explicit table where you wouldd define the table first, then create a materialized view on top with the `TO` command instead.

```
CREATE MATERIALIZED VIEW db1.table1_metric_map_mv
ORDER BY id
POPULATE AS
select 
  *, 
  attributes.keys as attribute_keys, 
  attributes.values as attribute_values
from db1.table1_metric_map
array join attributes
where notEmpty(attributes.keys);
```

The new table will have more rows and will have the keys extracted, like this:
```
SELECT *
FROM db1.table1_metric_map_mv
LIMIT 5

Query id: b7384381-53af-4e3e-bc54-871f61c033a6

┌─id─┬───────────timestamp─┬─metric_name─┬─metric_value─┬─attributes───────────┬─attribute_keys─┬─attribute_values─┐
│  1 │ 2023-09-20 00:01:00 │ ABC         │           10 │ ('env','prod')       │ env            │ prod             │
│  1 │ 2023-09-20 00:01:00 │ ABC         │           10 │ ('app','app1')       │ app            │ app1             │
│  1 │ 2023-09-20 00:01:00 │ ABC         │           10 │ ('server','server1') │ server         │ server1          │
│  2 │ 2023-09-20 00:01:00 │ ABC         │           20 │ ('env','prod')       │ env            │ prod             │
│  2 │ 2023-09-20 00:01:00 │ ABC         │           20 │ ('app','app2')       │ app            │ app2             │
└────┴─────────────────────┴─────────────┴──────────────┴──────────────────────┴────────────────┴──────────────────┘
```

From here, in order to query for your rows that need certain attributes, you would do something like this:
```
SELECT
    t1_app.id AS id,
    timestamp,
    metric_name,
    metric_value
FROM
(
    SELECT *
    FROM db1.table1_metric_map_mv
    WHERE (attribute_keys = 'app') AND (attribute_values = 'app1') AND (metric_name = 'ABC')
) AS t1_app
INNER JOIN
(
    SELECT *
    FROM db1.table1_metric_map_mv
    WHERE (attribute_keys = 'server') AND (attribute_values = 'server1')
) AS t2_server ON t1_app.id = t2_server.id

Query id: 72ce7f19-b02a-4b6e-81e7-a955f257436d

┌─id─┬───────────timestamp─┬─metric_name─┬─metric_value─┐
│  1 │ 2023-09-20 00:01:00 │ ABC         │           10 │
│  3 │ 2023-09-20 00:01:00 │ ABC         │           30 │
│  9 │ 2023-09-20 00:02:00 │ ABC         │           90 │
│ 11 │ 2023-09-20 00:02:00 │ ABC         │          110 │
│ 12 │ 2023-09-20 00:02:00 │ ABC         │          120 │
│ 17 │ 2023-09-20 00:03:00 │ ABC         │          170 │
│ 18 │ 2023-09-20 00:03:00 │ ABC         │          180 │
│ 19 │ 2023-09-20 00:03:00 │ ABC         │          190 │
└────┴─────────────────────┴─────────────┴──────────────┘
```