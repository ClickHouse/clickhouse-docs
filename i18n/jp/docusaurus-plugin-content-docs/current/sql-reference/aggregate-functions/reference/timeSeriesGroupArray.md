---
description: 'タイムスタンプの昇順で時系列データを並べ替えます。'
sidebar_position: 146
slug: /sql-reference/aggregate-functions/reference/timeSeriesGroupArray
title: 'timeSeriesGroupArray'
doc_type: 'reference'
---

# timeSeriesGroupArray

タイムスタンプの昇順で時系列データをソートします。

**構文**

```sql
timeSeriesGroupArray(timestamp, value)
```

**引数**

* `timestamp` - サンプルのタイムスタンプ
* `value` - 対応する `timestamp` における時系列の値

**戻り値**

この関数は、`timestamp` の昇順でソートされたタプル (`timestamp`, `value`) の配列を返します。
同じ `timestamp` に複数の値がある場合、この関数はそれらの値のうち最大のものを選択します。

**例**

```sql
WITH
    [110, 120, 130, 140, 140, 100]::Array(UInt32) AS timestamps,
    [1, 6, 8, 17, 19, 5]::Array(Float32) AS values -- 上記のタイムスタンプに対応する値の配列
SELECT timeSeriesGroupArray(timestamp, value)
FROM
(
    -- このサブクエリは、タイムスタンプと値の配列を `timestamp`、`value` の行に変換します
    SELECT
        arrayJoin(arrayZip(timestamps, values)) AS ts_and_val,
        ts_and_val.1 AS timestamp,
        ts_and_val.2 AS value
);
```

レスポンス:

```response
   ┌─timeSeriesGroupArray(timestamp, value)───────┐
1. │ [(100,5),(110,1),(120,6),(130,8),(140,19)]   │
   └──────────────────────────────────────────────┘
```

また、同じサイズの配列として複数のタイムスタンプと値のサンプルを渡すこともできます。配列引数を用いた同じクエリは次のとおりです。

```sql
WITH
    [110, 120, 130, 140, 140, 100]::Array(UInt32) AS timestamps,
    [1, 6, 8, 17, 19, 5]::Array(Float32) AS values -- 上記のタイムスタンプに対応する値の配列
SELECT timeSeriesGroupArray(timestamps, values);
```

:::note
この関数は実験的機能です。有効化するには、`allow_experimental_ts_to_grid_aggregate_function=true` を設定してください。
:::
