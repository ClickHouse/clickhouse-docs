---
description: 'ALTER TABLE ... MODIFY QUERY 语句文档'
sidebar_label: 'VIEW'
sidebar_position: 50
slug: /sql-reference/statements/alter/view
title: 'ALTER TABLE ... MODIFY QUERY 语句'
doc_type: 'reference'
---



# ALTER TABLE ... MODIFY QUERY 语句

你可以使用 `ALTER TABLE ... MODIFY QUERY` 语句修改在创建[物化视图](/sql-reference/statements/create/view#materialized-view)时指定的 `SELECT` 查询，而不会中断数据写入过程。

该命令用于修改通过 `TO [db.]name` 子句创建的物化视图。它不会改变底层存储表的结构，也不会改变物化视图的列定义。正因为如此，对于那些在创建时未使用 `TO [db.]name` 子句的物化视图来说，该命令的适用范围非常有限。

**使用 TO 目标表的示例**

```sql
CREATE TABLE events (ts DateTime, event_type String)
ENGINE = MergeTree ORDER BY (event_type, ts);

CREATE TABLE events_by_day (ts DateTime, event_type String, events_cnt UInt64)
ENGINE = SummingMergeTree ORDER BY (event_type, ts);

CREATE MATERIALIZED VIEW mv TO events_by_day AS
SELECT toStartOfDay(ts) ts, event_type, count() events_cnt
FROM events
GROUP BY ts, event_type;

INSERT INTO events
SELECT DATE '2020-01-01' + interval number * 900 second,
       ['imp', 'click'][number%2+1]
FROM numbers(100);

SELECT ts, event_type, sum(events_cnt)
FROM events_by_day
GROUP BY ts, event_type
ORDER BY ts, event_type;

┌──────────────────ts─┬─event_type─┬─sum(events_cnt)─┐
│ 2020-01-01 00:00:00 │ click      │              48 │
│ 2020-01-01 00:00:00 │ imp        │              48 │
│ 2020-01-02 00:00:00 │ click      │               2 │
│ 2020-01-02 00:00:00 │ imp        │               2 │
└─────────────────────┴────────────┴─────────────────┘

-- 添加新的度量值 `cost`
-- 和新的维度 `browser`。

ALTER TABLE events
  ADD COLUMN browser String,
  ADD COLUMN cost Float64;

-- 物化视图和 TO(目标表)中的列不必完全匹配,
-- 因此下一个 alter 操作不会中断数据插入。

ALTER TABLE events_by_day
    ADD COLUMN cost Float64,
    ADD COLUMN browser String after event_type,
    MODIFY ORDER BY (event_type, ts, browser);

INSERT INTO events
SELECT Date '2020-01-02' + interval number * 900 second,
       ['imp', 'click'][number%2+1],
       ['firefox', 'safary', 'chrome'][number%3+1],
       10/(number+1)%33
FROM numbers(100);

-- 新列 `browser` 和 `cost` 为空,因为我们尚未修改物化视图。

SELECT ts, event_type, browser, sum(events_cnt) events_cnt, round(sum(cost),2) cost
FROM events_by_day
GROUP BY ts, event_type, browser
ORDER BY ts, event_type;

┌──────────────────ts─┬─event_type─┬─browser─┬─events_cnt─┬─cost─┐
│ 2020-01-01 00:00:00 │ click      │         │         48 │    0 │
│ 2020-01-01 00:00:00 │ imp        │         │         48 │    0 │
│ 2020-01-02 00:00:00 │ click      │         │         50 │    0 │
│ 2020-01-02 00:00:00 │ imp        │         │         50 │    0 │
│ 2020-01-03 00:00:00 │ click      │         │          2 │    0 │
│ 2020-01-03 00:00:00 │ imp        │         │          2 │    0 │
└─────────────────────┴────────────┴─────────┴────────────┴──────┘

ALTER TABLE mv MODIFY QUERY
  SELECT toStartOfDay(ts) ts, event_type, browser,
  count() events_cnt,
  sum(cost) cost
  FROM events
  GROUP BY ts, event_type, browser;
```


INSERT INTO events
SELECT Date &#39;2020-01-03&#39; + interval number * 900 second,
[&#39;imp&#39;, &#39;click&#39;][number%2+1],
[&#39;firefox&#39;, &#39;safary&#39;, &#39;chrome&#39;][number%3+1],
10/(number+1)%33
FROM numbers(100);

SELECT ts, event&#95;type, browser, sum(events&#95;cnt) events&#95;cnt, round(sum(cost),2) cost
FROM events&#95;by&#95;day
GROUP BY ts, event&#95;type, browser
ORDER BY ts, event&#95;type;

┌──────────────────ts─┬─event&#95;type─┬─browser─┬─events&#95;cnt─┬──cost─┐
│ 2020-01-01 00:00:00 │ click      │         │         48 │     0 │
│ 2020-01-01 00:00:00 │ imp        │         │         48 │     0 │
│ 2020-01-02 00:00:00 │ click      │         │         50 │     0 │
│ 2020-01-02 00:00:00 │ imp        │         │         50 │     0 │
│ 2020-01-03 00:00:00 │ click      │ firefox │         16 │  6.84 │
│ 2020-01-03 00:00:00 │ click      │         │          2 │     0 │
│ 2020-01-03 00:00:00 │ click      │ safary  │         16 │  9.82 │
│ 2020-01-03 00:00:00 │ click      │ chrome  │         16 │  5.63 │
│ 2020-01-03 00:00:00 │ imp        │         │          2 │     0 │
│ 2020-01-03 00:00:00 │ imp        │ firefox │         16 │ 15.14 │
│ 2020-01-03 00:00:00 │ imp        │ safary  │         16 │  6.14 │
│ 2020-01-03 00:00:00 │ imp        │ chrome  │         16 │  7.89 │
│ 2020-01-04 00:00:00 │ click      │ safary  │          1 │   0.1 │
│ 2020-01-04 00:00:00 │ click      │ firefox │          1 │   0.1 │
│ 2020-01-04 00:00:00 │ imp        │ firefox │          1 │   0.1 │
│ 2020-01-04 00:00:00 │ imp        │ chrome  │          1 │   0.1 │
└─────────────────────┴────────────┴─────────┴────────────┴───────┘

-- !!! 在执行 `MODIFY ORDER BY` 时会隐式引入 PRIMARY KEY。

SHOW CREATE TABLE events&#95;by&#95;day FORMAT TSVRaw

CREATE TABLE test.events&#95;by&#95;day
(
`ts` DateTime,
`event_type` String,
`browser` String,
`events_cnt` UInt64,
`cost` Float64
)
ENGINE = SummingMergeTree
PRIMARY KEY (event&#95;type, ts)
ORDER BY (event&#95;type, ts, browser)
SETTINGS index&#95;granularity = 8192

-- !!! 列定义保持不变，但这无关紧要，我们查询的不是
-- MATERIALIZED VIEW，而是其 TO（存储）表。
-- SELECT 子句已经更新。

SHOW CREATE TABLE mv FORMAT TSVRaw;

CREATE MATERIALIZED VIEW test.mv TO test.events&#95;by&#95;day
(
`ts` DateTime,
`event_type` String,
`events_cnt` UInt64
) AS
SELECT
toStartOfDay(ts) AS ts,
event&#95;type,
browser,
count() AS events&#95;cnt,
sum(cost) AS cost
FROM test.events
GROUP BY
ts,
event&#95;type,
browser

```

**不使用 TO 表的示例**

这种应用场景非常受限,因为您只能修改 `SELECT` 部分,无法添加新列。
```


```sql
CREATE TABLE src_table (`a` UInt32) ENGINE = MergeTree ORDER BY a;
CREATE MATERIALIZED VIEW mv (`a` UInt32) ENGINE = MergeTree ORDER BY a AS SELECT a FROM src_table;
INSERT INTO src_table (a) VALUES (1), (2);
SELECT * FROM mv;
```

```text
┌─a─┐
│ 1 │
│ 2 │
└───┘
```

```sql
ALTER TABLE mv MODIFY QUERY SELECT a * 2 as a FROM src_table;
INSERT INTO src_table (a) VALUES (3), (4);
SELECT * FROM mv;
```

```text
┌─a─┐
│ 6 │
│ 8 │
└───┘
┌─a─┐
│ 1 │
│ 2 │
└───┘
```


## ALTER TABLE ... MODIFY REFRESH 语句 {#alter-table--modify-refresh-statement}

`ALTER TABLE ... MODIFY REFRESH` 语句用于修改[可刷新物化视图](../create/view.md#refreshable-materialized-view)的刷新参数。详见[修改刷新参数](../create/view.md#changing-refresh-parameters)。
