---
description: 'Документация по оператору ALTER TABLE ... MODIFY QUERY'
sidebar_label: 'VIEW'
sidebar_position: 50
slug: /sql-reference/statements/alter/view
title: 'Оператор ALTER TABLE ... MODIFY QUERY'
doc_type: 'reference'
---



# Оператор ALTER TABLE ... MODIFY QUERY {#alter-table-modify-query-statement}

Вы можете изменить запрос `SELECT`, который был указан при создании [материализованного представления](/sql-reference/statements/create/view#materialized-view), с помощью оператора `ALTER TABLE ... MODIFY QUERY` без прерывания процесса ингестии.

Эта команда предназначена для изменения материализованного представления, созданного с использованием предложения `TO [db.]name`. Она не изменяет структуру базовой таблицы хранилища и не изменяет определение столбцов материализованного представления, поэтому область её применения в отношении материализованных представлений, созданных без предложения `TO [db.]name`, крайне ограничена.

**Пример с TO-таблицей**

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

-- Добавим новую метрику `cost`
-- и новое измерение `browser`.

ALTER TABLE events
  ADD COLUMN browser String,
  ADD COLUMN cost Float64;

-- Столбцы не обязаны совпадать в материализованном представлении и таблице,
-- указанной в TO (целевой таблице), поэтому следующий ALTER не приведёт к ошибкам при вставке данных.

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

-- Новые столбцы `browser` и `cost` пусты, потому что мы ещё не изменили материализованное представление.

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

-- !!! При выполнении `MODIFY ORDER BY` PRIMARY KEY был неявно добавлен.

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

-- !!! Определение столбцов не изменилось, но это неважно: мы выполняем запрос не к
-- MATERIALIZED VIEW, а к таблице, указанной в TO (таблица-хранилище).
-- Раздел SELECT был обновлён.

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

**Пример без таблицы TO**

Возможности приложения сильно ограничены, так как вы можете изменять только раздел `SELECT`, не добавляя новые столбцы.
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


## Оператор ALTER TABLE ... MODIFY REFRESH {#alter-table--modify-refresh-statement}

Оператор `ALTER TABLE ... MODIFY REFRESH` изменяет параметры обновления для [обновляемого материализованного представления](../create/view.md#refreshable-materialized-view). См. [Изменение параметров обновления](../create/view.md#changing-refresh-parameters).
