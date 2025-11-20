---
slug: '/examples/aggregate-function-combinators/maxMap'
title: 'maxMap'
description: 'maxMap コンビネーターの使用例'
keywords: ['max', 'map', 'combinator', 'examples', 'maxMap']
sidebar_label: 'maxMap'
doc_type: 'reference'
---



# maxMap {#maxmap}


## Description {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) コンビネータを [`max`](/sql-reference/aggregate-functions/reference/max)
関数に適用することで、`maxMap`
集約コンビネータ関数を使用して、Map内の各キーごとの最大値を計算できます。


## 使用例 {#example-usage}

この例では、異なるタイムスロットのステータスコードとそのカウント数を格納するテーブルを作成します。
各行には、ステータスコードとそれに対応するカウント数のMapが含まれます。`maxMap`を使用して、
各タイムスロット内の各ステータスコードの最大カウント数を求めます。

```sql title="クエリ"
CREATE TABLE metrics(
    date Date,
    timeslot DateTime,
    status Map(String, UInt64)
) ENGINE = Log;

INSERT INTO metrics VALUES
    ('2000-01-01', '2000-01-01 00:00:00', (['a', 'b', 'c'], [15, 25, 35])),
    ('2000-01-01', '2000-01-01 00:00:00', (['c', 'd', 'e'], [45, 55, 65])),
    ('2000-01-01', '2000-01-01 00:01:00', (['d', 'e', 'f'], [75, 85, 95])),
    ('2000-01-01', '2000-01-01 00:01:00', (['f', 'g', 'g'], [105, 115, 125]));

SELECT
    timeslot,
    maxMap(status),
FROM metrics
GROUP BY timeslot;
```

`maxMap`関数は、各タイムスロット内の各ステータスコードの最大カウント数を求めます。例:

- タイムスロット '2000-01-01 00:00:00' の場合:
  - ステータス 'a': 15
  - ステータス 'b': 25
  - ステータス 'c': max(35, 45) = 45
  - ステータス 'd': 55
  - ステータス 'e': 65
- タイムスロット '2000-01-01 00:01:00' の場合:
  - ステータス 'd': 75
  - ステータス 'e': 85
  - ステータス 'f': max(95, 105) = 105
  - ステータス 'g': max(115, 125) = 125

```response title="レスポンス"
   ┌────────────timeslot─┬─maxMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':105,'g':125}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':45,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```


## 関連項目 {#see-also}

- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
