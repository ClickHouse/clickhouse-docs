---
description: 'lagInFrame ウィンドウ関数に関するドキュメント'
sidebar_label: 'lagInFrame'
sidebar_position: 9
slug: /sql-reference/window-functions/lagInFrame
title: 'lagInFrame'
---


# lagInFrame

指定された物理的オフセット行で評価された値を、現在の行の前の順序付けられたフレーム内の行として返します。

:::warning
`lagInFrame` の動作は標準SQLの `lag` ウィンドウ関数とは異なります。
ClickHouseのウィンドウ関数 `lagInFrame` はウィンドウフレームを尊重します。
`lag` と同じ動作を得るには、`ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` を使用してください。
:::

**構文**

```sql
lagInFrame(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

ウィンドウ関数の構文に関する詳細は、[ウィンドウ関数 - 構文](./index.md/#syntax)を参照してください。

**パラメータ**
- `x` — カラム名。
- `offset` — 適用するオフセット。[(U)Int*](../data-types/int-uint.md)。 (オプション - デフォルトは `1`)。
- `default` — 計算された行がウィンドウフレームの境界を超えた場合に返される値。 (オプション - 省略した場合はカラムタイプのデフォルト値)。

**返される値**

- 順序付けられたフレーム内で現在の行の前にある指定された物理的オフセットでの行において評価された値。

**例**

この例では、特定の株式の過去データを見て、`lagInFrame` 関数を使用して株価の終値の前日との変化量と割合の変化を計算します。

クエリ:

```sql
CREATE TABLE stock_prices
(
    `date`   Date,
    `open`   Float32, -- 始値
    `high`   Float32, -- 日中高値
    `low`    Float32, -- 日中安値
    `close`  Float32, -- 終値
    `volume` UInt32   -- 取引量
)
Engine = Memory;

INSERT INTO stock_prices FORMAT Values
    ('2024-06-03', 113.62, 115.00, 112.00, 115.00, 438392000),
    ('2024-06-04', 115.72, 116.60, 114.04, 116.44, 403324000),
    ('2024-06-05', 118.37, 122.45, 117.47, 122.44, 528402000),
    ('2024-06-06', 124.05, 125.59, 118.32, 121.00, 664696000),
    ('2024-06-07', 119.77, 121.69, 118.02, 120.89, 412386000);
```

```sql
SELECT
    date,
    close,
    lagInFrame(close, 1, close) OVER (ORDER BY date ASC
       ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
     ) AS previous_day_close,
    COALESCE(ROUND(close - previous_day_close, 2)) AS delta,
    COALESCE(ROUND((delta / previous_day_close) * 100, 2)) AS percent_change
FROM stock_prices
ORDER BY date DESC
```

結果:

```response
   ┌───────date─┬──close─┬─previous_day_close─┬─delta─┬─percent_change─┐
1. │ 2024-06-07 │ 120.89 │                121 │ -0.11 │          -0.09 │
2. │ 2024-06-06 │    121 │             122.44 │ -1.44 │          -1.18 │
3. │ 2024-06-05 │ 122.44 │             116.44 │     6 │           5.15 │
4. │ 2024-06-04 │ 116.44 │                115 │  1.44 │           1.25 │
5. │ 2024-06-03 │    115 │                115 │     0 │              0 │
   └────────────┴────────┴────────────────────┴───────┴────────────────┘
```
