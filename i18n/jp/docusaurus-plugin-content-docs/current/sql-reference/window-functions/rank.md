---
description: 'rank ウィンドウ関数のリファレンス'
sidebar_label: 'rank'
sidebar_position: 6
slug: /sql-reference/window-functions/rank
title: 'rank'
doc_type: 'reference'
---

# rank \\{#rank\\}

現在の行を、そのパーティション内で「飛び飛びの順位」としてランク付けします。言い換えると、処理中の行の値が、以前に現れた行の値と等しい場合、その行はその前の行と同じ順位になります。
次の行の順位は、直前の行の順位に、その直前の順位が付与された回数と同じ値のギャップを加えたものになります。

[dense&#95;rank](./dense_rank.md) 関数は、同様の動作をしますが、順位にギャップがない点が異なります。

**構文**

```sql
rank ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

ウィンドウ関数の構文の詳細は、[Window Functions - Syntax](./index.md/#syntax) を参照してください。

**返される値**

* パーティション内での現在の行番号（欠番を含む）を表す数値。[UInt64](../data-types/int-uint.md)。

**例**

次の例は、動画チュートリアル [Ranking window functions in ClickHouse](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA) で示されている例に基づいています。

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
       rank() OVER (ORDER BY salary DESC) AS rank
FROM salaries;
```

結果：

```response
   ┌─player──────────┬─salary─┬─rank─┐
1. │ Gary Chen       │ 195000 │    1 │
2. │ Robert George   │ 195000 │    1 │
3. │ Charles Juarez  │ 190000 │    3 │
4. │ Douglas Benson  │ 150000 │    4 │
5. │ Michael Stanley │ 150000 │    4 │
6. │ Scott Harrison  │ 150000 │    4 │
7. │ James Henderson │ 140000 │    7 │
   └─────────────────┴────────┴──────┘
```
