---
slug: /sql-reference/window-functions/first_value
sidebar_label: first_value
sidebar_position: 3
---


# first_value

オーダーフレーム内で評価された最初の値を返します。デフォルトでは、NULL引数はスキップされますが、`RESPECT NULLS`修飾子を使用することでこの動作をオーバーライドできます。

**構文**

```sql
first_value (column_name) [[RESPECT NULLS] | [IGNORE NULLS]]
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column] 
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([PARTITION BY grouping_column] [ORDER BY sorting_column])
```

エイリアス: `any`.

:::note
`first_value(column_name)`の後にオプションの修飾子`RESPECT NULLS`を使用すると、`NULL`引数がスキップされないことが保証されます。
詳細については、[NULL処理](../aggregate-functions/index.md/#null-processing)を参照してください。

エイリアス: `firstValueRespectNulls`
:::

ウィンドウ関数の構文に関する詳細は、[ウィンドウ関数 - 構文](./index.md/#syntax)を参照してください。

**返される値**

- オーダーフレーム内で評価された最初の値。

**例**

この例では、`first_value`関数を使用してフィクションのプレミアリーグサッカー選手の給与データセットから最高給のサッカー選手を見つけます。

クエリ：

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
       first_value(player) OVER (ORDER BY salary DESC) AS highest_paid_player
FROM salaries;
```

結果：

```response
   ┌─player──────────┬─salary─┬─highest_paid_player─┐
1. │ Gary Chen       │ 196000 │ Gary Chen           │
2. │ Robert George   │ 195000 │ Gary Chen           │
3. │ Charles Juarez  │ 190000 │ Gary Chen           │
4. │ Scott Harrison  │ 180000 │ Gary Chen           │
5. │ Douglas Benson  │ 150000 │ Gary Chen           │
6. │ James Henderson │ 140000 │ Gary Chen           │
7. │ Michael Stanley │ 100000 │ Gary Chen           │
   └─────────────────┴────────┴─────────────────────┘
```
