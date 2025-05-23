---
'description': '该函数绘制值 `x` 的频率直方图，以及这些值在区间 `[min_x, max_x]` 上的重复率 `y`。'
'sidebar_label': 'sparkbar'
'sidebar_position': 187
'slug': '/sql-reference/aggregate-functions/reference/sparkbar'
'title': 'sparkbar'
---


# sparkbar

该函数为值 `x` 绘制频率直方图，以及这些值在区间 `[min_x, max_x]` 内的重复率 `y`。所有落在同一桶中的 `x` 的重复次数会被平均，因此数据应该预先进行聚合。负重复次数会被忽略。

如果没有指定区间，则使用最小 `x` 作为区间开始，最大 `x` 作为区间结束。否则，区间外的值会被忽略。

**语法**

```sql
sparkbar(buckets[, min_x, max_x])(x, y)
```

**参数**

- `buckets` — 段数。类型: [Integer](../../../sql-reference/data-types/int-uint.md)。
- `min_x` — 区间开始。可选参数。
- `max_x` — 区间结束。可选参数。

**参数说明**

- `x` — 值的字段。
- `y` — 值的频率字段。

**返回值**

- 频率直方图。

**示例**

查询：

```sql
CREATE TABLE spark_bar_data (`value` Int64, `event_date` Date) ENGINE = MergeTree ORDER BY event_date;

INSERT INTO spark_bar_data VALUES (1,'2020-01-01'), (3,'2020-01-02'), (4,'2020-01-02'), (-3,'2020-01-02'), (5,'2020-01-03'), (2,'2020-01-04'), (3,'2020-01-05'), (7,'2020-01-06'), (6,'2020-01-07'), (8,'2020-01-08'), (2,'2020-01-11');

SELECT sparkbar(9)(event_date,cnt) FROM (SELECT sum(value) as cnt, event_date FROM spark_bar_data GROUP BY event_date);

SELECT sparkbar(9, toDate('2020-01-01'), toDate('2020-01-10'))(event_date,cnt) FROM (SELECT sum(value) as cnt, event_date FROM spark_bar_data GROUP BY event_date);
```

结果：

```text
┌─sparkbar(9)(event_date, cnt)─┐
│ ▂▅▂▃▆█  ▂                    │
└──────────────────────────────┘

┌─sparkbar(9, toDate('2020-01-01'), toDate('2020-01-10'))(event_date, cnt)─┐
│ ▂▅▂▃▇▆█                                                                  │
└──────────────────────────────────────────────────────────────────────────┘
```

该函数的别名是 sparkBar。
