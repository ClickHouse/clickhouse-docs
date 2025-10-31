---
'description': 'lagウィンドウ関数のDocumentation'
'sidebar_label': 'lag'
'sidebar_position': 9
'slug': '/sql-reference/window-functions/lag'
'title': 'lag'
'doc_type': 'reference'
---


# lag

指定された物理オフセットで現在の行の前にある行で評価された値を返します。この関数は[`lagInFrame`](./lagInFrame.md)に似ていますが、常に `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` フレームを使用します。

**構文**

```sql
lag(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

ウィンドウ関数の構文の詳細については、[ウィンドウ関数 - 構文](./index.md/#syntax)を参照してください。

**パラメータ**

- `x` — カラム名。
- `offset` — 適用するオフセット。[(U)Int*](../data-types/int-uint.md)。 (省略可 - デフォルトは `1`)。
- `default` — 計算された行がウィンドウフレームの境界を超えた場合に返す値。(省略可 - 省略した場合のカラムタイプのデフォルト値)。

**返される値**

- 注文されたフレーム内で現在の行の前にある指定された物理オフセットで評価された行の値。

**例**

この例では、特定の株の歴史的データを見て、`lag` 関数を使用して株価の終値の前日比とパーセンテージ変化を計算します。

```sql title="Query"
CREATE TABLE stock_prices
(
    `date`   Date,
    `open`   Float32, -- opening price
    `high`   Float32, -- daily high
    `low`    Float32, -- daily low
    `close`  Float32, -- closing price
    `volume` UInt32   -- trade volume
)
Engine = Memory;

INSERT INTO stock_prices FORMAT Values
    ('2024-06-03', 113.62, 115.00, 112.00, 115.00, 438392000),
    ('2024-06-04', 115.72, 116.60, 114.04, 116.44, 403324000),
    ('2024-06-05', 118.37, 122.45, 117.47, 122.44, 528402000),
    ('2024-06-06', 124.05, 125.59, 118.32, 121.00, 664696000),
    ('2024-06-07', 119.77, 121.69, 118.02, 120.89, 412386000);
```

```sql title="Query"
SELECT
    date,
    close,
    lag(close, 1, close) OVER (ORDER BY date ASC) AS previous_day_close,
    COALESCE(ROUND(close - previous_day_close, 2)) AS delta,
    COALESCE(ROUND((delta / previous_day_close) * 100, 2)) AS percent_change
FROM stock_prices
ORDER BY date DESC
```

```response title="Response"
   ┌───────date─┬──close─┬─previous_day_close─┬─delta─┬─percent_change─┐
1. │ 2024-06-07 │ 120.89 │                121 │ -0.11 │          -0.09 │
2. │ 2024-06-06 │    121 │             122.44 │ -1.44 │          -1.18 │
3. │ 2024-06-05 │ 122.44 │             116.44 │     6 │           5.15 │
4. │ 2024-06-04 │ 116.44 │                115 │  1.44 │           1.25 │
5. │ 2024-06-03 │    115 │                115 │     0 │              0 │
   └────────────┴────────┴────────────────────┴───────┴────────────────┘
```
