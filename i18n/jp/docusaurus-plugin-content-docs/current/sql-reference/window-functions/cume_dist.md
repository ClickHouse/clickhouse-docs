---
description: 'cume_dist ウィンドウ関数に関するドキュメント'
sidebar_label: 'cume_dist'
sidebar_position: 11
slug: /sql-reference/window-functions/cume_dist
title: 'cume_dist'
doc_type: 'reference'
---

# cume&#95;dist \{#cume&#95;dist\}

値のグループ内におけるある値の累積分布を計算します。つまり、現在の行の値以下の値を持つ行の割合を返します。パーティション内での値の相対的な位置を判断するために使用できます。

**構文**

```sql
cume_dist ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING]] | [window_name])
FROM table_name
WINDOW window_name as ([PARTITION BY grouping_column] [ORDER BY sorting_column] RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
```

デフォルトであり必須のウィンドウフレーム定義は `RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` です。

ウィンドウ関数の構文の詳細については、[Window Functions - Syntax](./index.md/#syntax) を参照してください。

**返される値**

* 現在の行の相対的な順位。戻り値の型は [Float64](../data-types/float.md) で、範囲は [0, 1] です。

**例**

次の例では、チーム内の給与の累積分布を計算します。

クエリ:

```sql
CREATE TABLE salaries
(
    `team` String,
    `player` String,
    `salary` UInt32,
    `position` String
)
Engine = Memory;

INSERT INTO salaries FORMAT Values
    ('Port Elizabeth Barbarians', 'Gary Chen', 195000, 'F'),
    ('New Coreystad Archdukes', 'Charles Juarez', 190000, 'F'),
    ('Port Elizabeth Barbarians', 'Michael Stanley', 150000, 'D'),
    ('New Coreystad Archdukes', 'Scott Harrison', 150000, 'D'),
    ('Port Elizabeth Barbarians', 'Robert George', 195000, 'M'),
    ('South Hampton Seagulls', 'Douglas Benson', 150000, 'M'),
    ('South Hampton Seagulls', 'James Henderson', 140000, 'M');
```

```sql
SELECT player, salary,
       cume_dist() OVER (ORDER BY salary DESC) AS cume_dist
FROM salaries;
```

結果：

```response
   ┌─player──────────┬─salary─┬───────────cume_dist─┐
1. │ Robert George   │ 195000 │  0.2857142857142857 │
2. │ Gary Chen       │ 195000 │  0.2857142857142857 │
3. │ Charles Juarez  │ 190000 │ 0.42857142857142855 │
4. │ Douglas Benson  │ 150000 │  0.8571428571428571 │
5. │ Michael Stanley │ 150000 │  0.8571428571428571 │
6. │ Scott Harrison  │ 150000 │  0.8571428571428571 │
7. │ James Henderson │ 140000 │                   1 │
   └─────────────────┴────────┴─────────────────────┘
```

**実装の詳細**

`cume_dist()` 関数は、次の式を使用して相対位置を計算します。

```text
cume_dist = (number of rows ≤ current row value) / (total number of rows in partition)
```

同じ値を持つ行（ピア）には同一の累積分布値が割り当てられ、その値はピアグループ内での最大の順位に対応します。
