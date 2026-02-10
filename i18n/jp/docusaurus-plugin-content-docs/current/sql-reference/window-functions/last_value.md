---
description: 'last_value ウィンドウ関数に関するドキュメント'
sidebar_label: 'last_value'
sidebar_position: 4
slug: /sql-reference/window-functions/last_value
title: 'last_value'
doc_type: 'reference'
---

# last&#95;value \{#last&#95;value\}

順序付けされたフレーム内で評価された最後の値を返します。デフォルトでは NULL 引数はスキップされますが、`RESPECT NULLS` 修飾子を使用すると、この動作を変更できます。

**構文**

```sql
last_value (column_name) [[RESPECT NULLS] | [IGNORE NULLS]]
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column] 
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

別名: `anyLast`.

:::note
`first_value(column_name)` の後にオプションの修飾子 `RESPECT NULLS` を付けると、`NULL` 引数がスキップされなくなります。
詳細は [NULL processing](../aggregate-functions/index.md/#null-processing) を参照してください。

別名: `lastValueRespectNulls`
:::

ウィンドウ関数の構文の詳細については、[Window Functions - Syntax](./index.md/#syntax) を参照してください。

**戻り値**

* 並べ替えられたフレーム内で評価される最後の値。

**例**

この例では、架空のプレミアリーグのサッカー選手の給与データセットから、最も給与の低い選手を見つけるために `last_value` 関数を使用します。

クエリ:

```sql
DROP TABLE IF EXISTS salaries;
CREATE TABLE salaries
(
    `team` String,
    `player` String,
    `salary` UInt32,
    `position` String
)
Engine = Memory;

INSERT INTO salaries FORMAT VALUES
    ('Port Elizabeth Barbarians', 'Gary Chen', 196000, 'F'),
    ('New Coreystad Archdukes', 'Charles Juarez', 190000, 'F'),
    ('Port Elizabeth Barbarians', 'Michael Stanley', 100000, 'D'),
    ('New Coreystad Archdukes', 'Scott Harrison', 180000, 'D'),
    ('Port Elizabeth Barbarians', 'Robert George', 195000, 'M'),
    ('South Hampton Seagulls', 'Douglas Benson', 150000, 'M'),
    ('South Hampton Seagulls', 'James Henderson', 140000, 'M');
```

```sql
SELECT player, salary,
       last_value(player) OVER (ORDER BY salary DESC RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lowest_paid_player
FROM salaries;
```

結果:

```response
   ┌─player──────────┬─salary─┬─lowest_paid_player─┐
1. │ Gary Chen       │ 196000 │ Michael Stanley    │
2. │ Robert George   │ 195000 │ Michael Stanley    │
3. │ Charles Juarez  │ 190000 │ Michael Stanley    │
4. │ Scott Harrison  │ 180000 │ Michael Stanley    │
5. │ Douglas Benson  │ 150000 │ Michael Stanley    │
6. │ James Henderson │ 140000 │ Michael Stanley    │
7. │ Michael Stanley │ 100000 │ Michael Stanley    │
   └─────────────────┴────────┴────────────────────┘
```
