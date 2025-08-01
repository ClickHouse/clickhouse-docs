---
description: 'Documentation for the dense_rank window function'
sidebar_label: 'dense_rank'
sidebar_position: 7
slug: '/sql-reference/window-functions/dense_rank'
title: 'dense_rank'
---




# dense_rank

現在の行をそのパーティション内でギャップなくランク付けします。言い換えれば、もし新しく出現した行の値が以前の行の値のいずれかと等しい場合、それはギャップなく次の連続したランクを受け取ります。

[rank](./rank.md) 関数は同様の動作を提供しますが、ランクにギャップがあります。

**構文**

エイリアス: `denseRank` (大文字小文字を区別)

```sql
dense_rank ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

ウィンドウ関数の構文の詳細については、[ウィンドウ関数 - 構文](./index.md/#syntax)を参照してください。

**戻り値**

- パーティション内の現在の行の番号で、ランクにギャップがありません。[UInt64](../data-types/int-uint.md)。

**例**

次の例は、動画教材[ClickHouseにおけるランキングウィンドウ関数](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA)で提供された例に基づいています。

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
       dense_rank() OVER (ORDER BY salary DESC) AS dense_rank
FROM salaries;
```

結果:

```response
   ┌─player──────────┬─salary─┬─dense_rank─┐
1. │ Gary Chen       │ 195000 │          1 │
2. │ Robert George   │ 195000 │          1 │
3. │ Charles Juarez  │ 190000 │          2 │
4. │ Michael Stanley │ 150000 │          3 │
5. │ Douglas Benson  │ 150000 │          3 │
6. │ Scott Harrison  │ 150000 │          3 │
7. │ James Henderson │ 140000 │          4 │
   └─────────────────┴────────┴────────────┘
```
