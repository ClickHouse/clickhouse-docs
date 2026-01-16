---
slug: '/examples/aggregate-function-combinators/minMap'
title: 'minMap'
description: 'minMap コンビネータを使用する例'
keywords: ['min', 'map', 'combinator', '例', 'minMap']
sidebar_label: 'minMap'
doc_type: 'reference'
---

# minMap \\{#minmap\\}

## 説明 \\{#description\\}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) コンビネータを [`min`](/sql-reference/aggregate-functions/reference/min)
関数に適用することで、`minMap` 集約コンビネータ関数を使用して、Map 内の各キーごとの最小値を計算できます。

## 使用例 \\{#example-usage\\}

この例では、さまざまな時間帯ごとにステータスコードとそのカウントを保存するテーブルを作成します。
このテーブルでは、各行にステータスコードから対応するカウントへの `Map` を格納します。
各時間帯ごとにステータスコード別の最小カウントを求めるために `minMap` を使用します。

```sql title="Query"
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

`minMap` 関数は、各タイムスロットごとに各ステータスコードの最小カウントを求めます。例えば次のとおりです:

* タイムスロット &#39;2000-01-01 00:00:00&#39; の場合:
  * ステータス &#39;a&#39;: 15
  * ステータス &#39;b&#39;: 25
  * ステータス &#39;c&#39;: min(35, 45) = 35
  * ステータス &#39;d&#39;: 55
  * ステータス &#39;e&#39;: 65
* タイムスロット &#39;2000-01-01 00:01:00&#39; の場合:
  * ステータス &#39;d&#39;: 75
  * ステータス &#39;e&#39;: 85
  * ステータス &#39;f&#39;: min(95, 105) = 95
  * ステータス &#39;g&#39;: min(115, 125) = 115

```response title="Response"
   ┌────────────timeslot─┬─minMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':95,'g':115}       │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':35,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## 関連項目 \\{#see-also\\}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
