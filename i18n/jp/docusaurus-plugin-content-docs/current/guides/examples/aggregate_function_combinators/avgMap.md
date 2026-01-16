---
slug: '/examples/aggregate-function-combinators/avgMap'
title: 'avgMap'
description: 'avgMap コンビネータの使用例'
keywords: ['avg', 'map', 'combinator', 'examples', 'avgMap']
sidebar_label: 'avgMap'
doc_type: 'reference'
---

# avgMap \{#avgmap\}

## 説明 \{#description\}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) コンビネータは、`avgMap` 集約コンビネータ関数を使用して、各キーごとに Map 内の値の算術平均を計算するために、[`avg`](/sql-reference/aggregate-functions/reference/avg) 関数に適用できます。

## 使用例 \{#example-usage\}

この例では、さまざまなタイムスロットにおけるステータスコードとそのカウントを格納するテーブルを作成します。
各行には、ステータスコードとそれに対応するカウントを表す `Map` が含まれます。
`avgMap` を使用して、各タイムスロット内で各ステータスコードのカウントの平均値を計算します。

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
    avgMap(status),
FROM metrics
GROUP BY timeslot;
```

`avgMap` 関数は、各タイムスロット内の各ステータスコードの平均カウントを計算します。例えば次のとおりです。

* タイムスロット &#39;2000-01-01 00:00:00&#39; の場合:
  * ステータス &#39;a&#39;: 15
  * ステータス &#39;b&#39;: 25
  * ステータス &#39;c&#39;: (35 + 45) / 2 = 40
  * ステータス &#39;d&#39;: 55
  * ステータス &#39;e&#39;: 65
* タイムスロット &#39;2000-01-01 00:01:00&#39; の場合:
  * ステータス &#39;d&#39;: 75
  * ステータス &#39;e&#39;: 85
  * ステータス &#39;f&#39;: (95 + 105) / 2 = 100
  * ステータス &#39;g&#39;: (115 + 125) / 2 = 120

```response title="Response"
   ┌────────────timeslot─┬─avgMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':100,'g':120}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':40,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## 関連項目 \{#see-also\}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
