---
'slug': '/examples/aggregate-function-combinators/minMap'
'title': 'minMap'
'description': 'minMap combinatorの使用例'
'keywords':
- 'min'
- 'map'
- 'combinator'
- 'examples'
- 'minMap'
'sidebar_label': 'minMap'
---




# minMap {#minmap}

## 説明 {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) コンビネータは、`minMap` 集約コンビネータ関数を使用して、各キーに基づいて Map の最小値を計算するために、[`min`](/sql-reference/aggregate-functions/reference/min) 関数に適用できます。

## 例の使用法 {#example-usage}

この例では、ステータスコードとそれぞれの時間帯におけるカウントを格納するテーブルを作成します。各行には、ステータスコードとその対応するカウントの Map が含まれます。`minMap` を使用して、各時間帯内の各ステータスコードの最小カウントを見つけます。

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

`minMap` 関数は、各時間帯内の各ステータスコードの最小カウントを見つけます。例えば：
- 時間帯 '2000-01-01 00:00:00':
  - ステータス 'a': 15
  - ステータス 'b': 25
  - ステータス 'c': min(35, 45) = 35
  - ステータス 'd': 55
  - ステータス 'e': 65
- 時間帯 '2000-01-01 00:01:00':
  - ステータス 'd': 75
  - ステータス 'e': 85
  - ステータス 'f': min(95, 105) = 95
  - ステータス 'g': min(115, 125) = 115

```response title="応答"
   ┌────────────timeslot─┬─minMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':95,'g':115}       │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':35,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## 関連項目 {#see-also}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
