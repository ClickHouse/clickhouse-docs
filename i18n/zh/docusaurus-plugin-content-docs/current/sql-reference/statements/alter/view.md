---
slug: /sql-reference/statements/alter/view
sidebar_position: 50
sidebar_label: VIEW
---


# ALTER TABLE ... MODIFY QUERY 语句

您可以使用 `ALTER TABLE ... MODIFY QUERY` 语句修改创建 [物化视图](/sql-reference/statements/create/view#materialized-view) 时指定的 `SELECT` 查询，而不会中断数据摄取过程。

此命令的目的是更改使用 `TO [db.]name` 子句创建的物化视图。它不会更改基础存储表的结构，也不会更改物化视图中列的定义，因此该命令的应用非常有限，因为物化视图通常是在没有 `TO [db.]name` 子句的情况下创建的。

**使用 TO 表的示例**

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
SELECT Date '2020-01-01' + interval number * 900 second,
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

-- 让我们添加新的度量 `cost`
-- 和新的维度 `browser`。

ALTER TABLE events
  ADD COLUMN browser String,
  ADD COLUMN cost Float64;

-- 在物化视图和 TO
-- （目标表）中，列不必匹配，因此下一个改变不会中断插入。

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

-- 新列 `browser` 和 `cost` 是空的，因为我们尚未更改物化视图。

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

INSERT INTO events
SELECT Date '2020-01-03' + interval number * 900 second,
       ['imp', 'click'][number%2+1],
       ['firefox', 'safary', 'chrome'][number%3+1],
       10/(number+1)%33
FROM numbers(100);

SELECT ts, event_type, browser, sum(events_cnt) events_cnt, round(sum(cost),2) cost
FROM events_by_day
GROUP BY ts, event_type, browser
ORDER BY ts, event_type;

┌──────────────────ts─┬─event_type─┬─browser─┬─events_cnt─┬──cost─┐
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

-- !!! 在 `MODIFY ORDER BY` 期间隐式引入了 主键。

SHOW CREATE TABLE events_by_day FORMAT TSVRaw

CREATE TABLE test.events_by_day
(
    `ts` DateTime,
    `event_type` String,
    `browser` String,
    `events_cnt` UInt64,
    `cost` Float64
)
ENGINE = SummingMergeTree
PRIMARY KEY (event_type, ts)
ORDER BY (event_type, ts, browser)
SETTINGS index_granularity = 8192

-- !!! 列的定义没有改变，但这并不重要，因为我们查询的不是
-- 物化视图，而是 TO（存储）表。
-- SELECT 部分已更新。

SHOW CREATE TABLE mv FORMAT TSVRaw;

CREATE MATERIALIZED VIEW test.mv TO test.events_by_day
(
    `ts` DateTime,
    `event_type` String,
    `events_cnt` UInt64
) AS
SELECT
    toStartOfDay(ts) AS ts,
    event_type,
    browser,
    count() AS events_cnt,
    sum(cost) AS cost
FROM test.events
GROUP BY
    ts,
    event_type,
    browser
```

**没有 TO 表的示例**

该应用非常有限，因为您只能更改 `SELECT` 部分，而不能添加新列。

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

## ALTER LIVE VIEW 语句 {#alter-live-view-statement}

`ALTER LIVE VIEW ... REFRESH` 语句刷新一个 [实时视图](/sql-reference/statements/create/view#live-view)。参见 [强制实时视图刷新](/sql-reference/statements/create/view#live-view)。

## ALTER TABLE ... MODIFY REFRESH 语句 {#alter-table--modify-refresh-statement}

`ALTER TABLE ... MODIFY REFRESH` 语句更改一个 [可刷新的物化视图](../create/view.md#refreshable-materialized-view) 的刷新参数。参见 [更改刷新参数](../create/view.md#changing-refresh-parameters)。
