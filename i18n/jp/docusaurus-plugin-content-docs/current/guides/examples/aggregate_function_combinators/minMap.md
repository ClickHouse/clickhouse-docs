---
slug: '/examples/aggregate-function-combinators/minMap'
title: 'minMap'
description: 'minMapコンビネーターの使用例'
keywords: ['min', 'map', 'combinator', 'examples', 'minMap']
sidebar_label: 'minMap'
---


# minMap {#minmap}

## 説明 {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) コンビネーターは、`min` [/sql-reference/aggregate-functions/reference/min] 関数に適用され、各キーに対してMap内の最小値を計算するために `minMap` 集約コンビネーター関数を使用します。

## 使用例 {#example-usage}

この例では、異なるタイムスロットのステータスコードとそのカウントを保存するテーブルを作成します。各行には、ステータスコードと対応するカウントのMapが含まれます。`minMap` を使用して、各タイムスロット内の各ステータスコードの最小カウントを見つけます。

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
    minMap(status),
FROM metrics
GROUP BY timeslot;
```

`minMap` 関数は、各タイムスロット内の各ステータスコードの最小カウントを見つけます。例えば：
- タイムスロット '2000-01-01 00:00:00' では：
  - ステータス 'a': 15
  - ステータス 'b': 25
  - ステータス 'c': min(35, 45) = 35
  - ステータス 'd': 55
  - ステータス 'e': 65
- タイムスロット '2000-01-01 00:01:00' では：
  - ステータス 'd': 75
  - ステータス 'e': 85
  - ステータス 'f': min(95, 105) = 95
  - ステータス 'g': min(115, 125) = 115

```response title="レスポンス"
   ┌────────────timeslot─┬─minMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':95,'g':115}       │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':35,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## 参照 {#see-also}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
