---
description: 'The function plots a frequency histogram for values `x` and the repetition
  rate `y` of these values over the interval `[min_x, max_x]`.'
sidebar_label: 'sparkbar'
sidebar_position: 187
slug: '/sql-reference/aggregate-functions/reference/sparkbar'
title: 'sparkbar'
---




# sparkbar

この関数は、値 `x` に対する頻度ヒストグラムと、これらの値の繰り返し率 `y` を、区間 `[min_x, max_x]` でプロットします。同じバケットに該当するすべての `x` の繰り返しは平均化されるため、データは事前に集約されている必要があります。負の繰り返しは無視されます。

区間が指定されていない場合、最小の `x` が区間の開始として使用され、最大の `x` が区間の終了として使用されます。それ以外の場合、区間外の値は無視されます。

**構文**

```sql
sparkbar(buckets[, min_x, max_x])(x, y)
```

**パラメータ**

- `buckets` — セグメントの数。タイプ: [Integer](../../../sql-reference/data-types/int-uint.md)。
- `min_x` — 区間の開始。オプションのパラメータ。
- `max_x` — 区間の終了。オプションのパラメータ。

**引数**

- `x` — 値を持つフィールド。
- `y` — 値の頻度を持つフィールド。

**返される値**

- 頻度ヒストグラム。

**例**

クエリ:

```sql
CREATE TABLE spark_bar_data (`value` Int64, `event_date` Date) ENGINE = MergeTree ORDER BY event_date;

INSERT INTO spark_bar_data VALUES (1,'2020-01-01'), (3,'2020-01-02'), (4,'2020-01-02'), (-3,'2020-01-02'), (5,'2020-01-03'), (2,'2020-01-04'), (3,'2020-01-05'), (7,'2020-01-06'), (6,'2020-01-07'), (8,'2020-01-08'), (2,'2020-01-11');

SELECT sparkbar(9)(event_date,cnt) FROM (SELECT sum(value) as cnt, event_date FROM spark_bar_data GROUP BY event_date);

SELECT sparkbar(9, toDate('2020-01-01'), toDate('2020-01-10'))(event_date,cnt) FROM (SELECT sum(value) as cnt, event_date FROM spark_bar_data GROUP BY event_date);
```

結果:

```text
┌─sparkbar(9)(event_date, cnt)─┐
│ ▂▅▂▃▆█  ▂                    │
└──────────────────────────────┘

┌─sparkbar(9, toDate('2020-01-01'), toDate('2020-01-10'))(event_date, cnt)─┐
│ ▂▅▂▃▇▆█                                                                  │
└──────────────────────────────────────────────────────────────────────────┘
```

この関数のエイリアスは sparkBar です。
