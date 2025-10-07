---
'description': 'rank ウィンドウ関数のドキュメント'
'sidebar_label': 'ランク'
'sidebar_position': 6
'slug': '/sql-reference/window-functions/rank'
'title': 'ランク'
'doc_type': 'reference'
---


# rank

現在の行をそのパーティション内でランク付けします（ギャップを含む）。言い換えれば、遭遇する行の値が以前の行の値と等しい場合、それはその前の行と同じランクを受け取ります。次の行のランクは、その前の行のランクに、前のランクが与えられた回数と等しいギャップを加えたものになります。

[dense_rank](./dense_rank.md) 関数は、ギャップのないランク付けを提供しますが、同じ動作をします。

**構文**

```sql
rank ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

ウィンドウ関数の構文の詳細については、こちらをご覧ください: [ウィンドウ関数 - 構文](./index.md/#syntax)。

**返される値**

- ギャップを含む、パーティション内の現在の行のための数値。[UInt64](../data-types/int-uint.md)。

**例**

以下の例は、ビデオ教材 [ClickHouse におけるランク付けウィンドウ関数](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA) で提供された例を基にしています。

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

結果:

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
