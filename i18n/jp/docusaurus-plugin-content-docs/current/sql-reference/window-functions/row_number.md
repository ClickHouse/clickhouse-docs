---
'description': 'row_number ウィンドウ関数のドキュメント'
'sidebar_label': 'row_number'
'sidebar_position': 2
'slug': '/sql-reference/window-functions/row_number'
'title': 'row_number'
'doc_type': 'reference'
---


# row_number

パーティション内の現在の行に1から始まる番号を付けます。

**構文**

```sql
row_number (column_name)
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column] 
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

ウィンドウ関数の構文の詳細については、[Window Functions - Syntax](./index.md/#syntax)を参照してください。

**返される値**

- パーティション内の現在の行のための番号。[UInt64](../data-types/int-uint.md)。

**例**

次の例は、ビデオ教材[Ranking window functions in ClickHouse](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA)で提供された例に基づいています。

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
    ('Port Elizabeth Barbarians', 'Robert George', 195000, 'M');
```

```sql
SELECT player, salary, 
       row_number() OVER (ORDER BY salary DESC) AS row_number
FROM salaries;
```

結果:

```response
   ┌─player──────────┬─salary─┬─row_number─┐
1. │ Gary Chen       │ 195000 │          1 │
2. │ Robert George   │ 195000 │          2 │
3. │ Charles Juarez  │ 190000 │          3 │
4. │ Scott Harrison  │ 150000 │          4 │
5. │ Michael Stanley │ 150000 │          5 │
   └─────────────────┴────────┴────────────┘
```
