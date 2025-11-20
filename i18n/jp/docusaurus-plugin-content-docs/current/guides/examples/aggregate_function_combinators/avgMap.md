---
slug: '/examples/aggregate-function-combinators/avgMap'
title: 'avgMap'
description: 'avgMap コンビネータの利用例'
keywords: ['avg', 'map', 'combinator', 'examples', 'avgMap']
sidebar_label: 'avgMap'
doc_type: 'reference'
---



# avgMap {#avgmap}


## 説明 {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map)コンビネータを[`avg`](/sql-reference/aggregate-functions/reference/avg)関数に適用することで、`avgMap`集約コンビネータ関数を使用して、Map内の各キーごとに値の算術平均を計算できます。


## 使用例 {#example-usage}

この例では、異なるタイムスロットごとにステータスコードとそのカウント数を格納するテーブルを作成します。
各行には、ステータスコードとそれに対応するカウント数のMapが含まれます。`avgMap`を使用して、
各タイムスロット内の各ステータスコードの平均カウント数を計算します。

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
    avgMap(status),
FROM metrics
GROUP BY timeslot;
```

`avgMap`関数は、各タイムスロット内の各ステータスコードの平均カウント数を計算します。例:

- タイムスロット '2000-01-01 00:00:00' の場合:
  - ステータス 'a': 15
  - ステータス 'b': 25
  - ステータス 'c': (35 + 45) / 2 = 40
  - ステータス 'd': 55
  - ステータス 'e': 65
- タイムスロット '2000-01-01 00:01:00' の場合:
  - ステータス 'd': 75
  - ステータス 'e': 85
  - ステータス 'f': (95 + 105) / 2 = 100
  - ステータス 'g': (115 + 125) / 2 = 120

```response title="レスポンス"
   ┌────────────timeslot─┬─avgMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':100,'g':120}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':40,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```


## 関連項目 {#see-also}

- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
