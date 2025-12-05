---
slug: '/examples/aggregate-function-combinators/sumMap'
title: 'sumMap'
description: 'sumMap コンビネーターの使用例'
keywords: ['sum', 'map', 'コンビネーター', '例', 'sumMap']
sidebar_label: 'sumMap'
doc_type: 'reference'
---



# sumMap {#summap}



## 説明 {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) コンビネータは、集約コンビネータ関数 `sumMap` を使用して [`sum`](/sql-reference/aggregate-functions/reference/sum)
関数に適用でき、Map の各キーごとの値の合計を計算します。



## 使用例 {#example-usage}

この例では、異なるタイムスロットごとにステータスコードとそのカウントを保存するテーブルを作成します。
各行には、ステータスコードから対応するカウントへの Map が含まれます。
`sumMap` を使用して、各タイムスロット内でステータスコードごとの合計カウントを計算します。

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
    sumMap(status),
FROM metrics
GROUP BY timeslot;
```

`sumMap` 関数は、各タイムスロット内の各ステータスコードに対する合計カウントを計算します。例えば次のとおりです:

* タイムスロット &#39;2000-01-01 00:00:00&#39; の場合:
  * ステータス &#39;a&#39;: 15
  * ステータス &#39;b&#39;: 25
  * ステータス &#39;c&#39;: 35 + 45 = 80
  * ステータス &#39;d&#39;: 55
  * ステータス &#39;e&#39;: 65
* タイムスロット &#39;2000-01-01 00:01:00&#39; の場合:
  * ステータス &#39;d&#39;: 75
  * ステータス &#39;e&#39;: 85
  * ステータス &#39;f&#39;: 95 + 105 = 200
  * ステータス &#39;g&#39;: 115 + 125 = 240

```response title="Response"
   ┌────────────timeslot─┬─sumMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':200,'g':240}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':80,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```


## 関連項目 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
