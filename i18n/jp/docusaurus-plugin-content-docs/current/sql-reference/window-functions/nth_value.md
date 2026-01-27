---
description: 'nth_value ウィンドウ関数のドキュメント'
sidebar_label: 'nth_value'
sidebar_position: 5
slug: /sql-reference/window-functions/nth_value
title: 'nth_value'
doc_type: 'reference'
---

# nth&#95;value \{#nth&#95;value\}

順序付けられたフレーム内の n 行目（オフセット）に対応して評価された、最初の非 NULL 値を返します。

**構文**

```sql
nth_value (x, offset)
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column] 
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

ウィンドウ関数の構文の詳細は、[Window Functions - Syntax](./index.md/#syntax) を参照してください。

**パラメータ**

* `x` — 列名。
* `offset` — 現在行と比較する n 番目の行。

**戻り値**

* 並び順が定義されたフレーム内で、n 番目の行（`offset`）に対して評価される最初の NULL 以外の値。

**例**

この例では、`nth-value` 関数を使用して、プレミアリーグのサッカー選手の架空の給与データセットから 3 番目に高い給与を求めます。

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

INSERT INTO salaries FORMAT Values
    ('Port Elizabeth Barbarians', 'Gary Chen', 195000, 'F'),
    ('New Coreystad Archdukes', 'Charles Juarez', 190000, 'F'),
    ('Port Elizabeth Barbarians', 'Michael Stanley', 100000, 'D'),
    ('New Coreystad Archdukes', 'Scott Harrison', 180000, 'D'),
    ('Port Elizabeth Barbarians', 'Robert George', 195000, 'M'),
    ('South Hampton Seagulls', 'Douglas Benson', 150000, 'M'),
    ('South Hampton Seagulls', 'James Henderson', 140000, 'M');
```

```sql
SELECT player, salary, nth_value(player,3) OVER(ORDER BY salary DESC) AS third_highest_salary FROM salaries;
```

結果：

```response
   ┌─player──────────┬─salary─┬─third_highest_salary─┐
1. │ Gary Chen       │ 195000 │                      │
2. │ Robert George   │ 195000 │                      │
3. │ Charles Juarez  │ 190000 │ Charles Juarez       │
4. │ Scott Harrison  │ 180000 │ Charles Juarez       │
5. │ Douglas Benson  │ 150000 │ Charles Juarez       │
6. │ James Henderson │ 140000 │ Charles Juarez       │
7. │ Michael Stanley │ 100000 │ Charles Juarez       │
   └─────────────────┴────────┴──────────────────────┘
```
