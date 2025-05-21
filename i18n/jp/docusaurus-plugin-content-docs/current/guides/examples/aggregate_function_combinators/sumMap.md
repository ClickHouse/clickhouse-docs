---
slug: '/examples/aggregate-function-combinators/sumMap'
title: 'sumMap'
description: 'sumMap結合子を使用した例'
keywords: ['sum', 'map', 'combinator', 'examples', 'sumMap']
sidebar_label: 'sumMap'
---


# sumMap {#summap}

## 説明 {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) 結合子は、[`sum`](/sql-reference/aggregate-functions/reference/sum) 関数に適用され、各キーに基づいてマップ内の値の合計を計算するために、`sumMap` 集計結合子関数を使用します。

## 使用例 {#example-usage}

この例では、異なる時間帯のステータスコードとそのカウントを格納するテーブルを作成します。各行にはステータスコードとその対応するカウントのマップが含まれます。`sumMap` を使用して、各時間帯内の各ステータスコードの合計カウントを計算します。

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
    sumMap(status),
FROM metrics
GROUP BY timeslot;
```

`sumMap` 関数は、各時間帯内の各ステータスコードの合計カウントを計算します。例えば：
- 時間帯 '2000-01-01 00:00:00' において：
  - ステータス 'a': 15
  - ステータス 'b': 25
  - ステータス 'c': 35 + 45 = 80
  - ステータス 'd': 55
  - ステータス 'e': 65
- 時間帯 '2000-01-01 00:01:00' において：
  - ステータス 'd': 75
  - ステータス 'e': 85
  - ステータス 'f': 95 + 105 = 200
  - ステータス 'g': 115 + 125 = 240

```response title="レスポンス"
   ┌────────────timeslot─┬─sumMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':200,'g':240}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':80,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## 参照 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`Map 結合子`](/sql-reference/aggregate-functions/combinators#-map)
