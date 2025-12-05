---
slug: '/examples/aggregate-function-combinators/maxMap'
title: 'maxMap'
description: 'maxMap コンビネータの使用例'
keywords: ['max', 'map', 'combinator', 'examples', 'maxMap']
sidebar_label: 'maxMap'
doc_type: 'reference'
---



# maxMap {#maxmap}



## 説明 {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) コンビネータを [`max`](/sql-reference/aggregate-functions/reference/max) 関数に適用すると、`maxMap` 集約コンビネータ関数を使用して、各キーごとの `Map` 内の最大値を計算できます。



## 使用例 {#example-usage}

この例では、さまざまなタイムスロットに対するステータスコードとそのカウントを格納するテーブルを作成します。
各行には、ステータスコードとそれに対応するカウントを保持する `Map` が含まれています。
`maxMap` を使用して、各タイムスロット内でステータスコードごとの最大カウントを求めます。

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
    maxMap(status),
FROM metrics
GROUP BY timeslot;
```

`maxMap` 関数は、各タイムスロットごとに各ステータスコードの件数の最大値を求めます。例えば:

* タイムスロット &#39;2000-01-01 00:00:00&#39; の場合:
  * ステータス &#39;a&#39;: 15
  * ステータス &#39;b&#39;: 25
  * ステータス &#39;c&#39;: max(35, 45) = 45
  * ステータス &#39;d&#39;: 55
  * ステータス &#39;e&#39;: 65
* タイムスロット &#39;2000-01-01 00:01:00&#39; の場合:
  * ステータス &#39;d&#39;: 75
  * ステータス &#39;e&#39;: 85
  * ステータス &#39;f&#39;: max(95, 105) = 105
  * ステータス &#39;g&#39;: max(115, 125) = 125

```response title="Response"
   ┌────────────timeslot─┬─maxMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':105,'g':125}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':45,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```


## 関連項目 {#see-also}
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
