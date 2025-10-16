---
'description': 'タイムシリーズをタイムスタンプで昇順にソートします。'
'sidebar_position': 146
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesGroupArray'
'title': 'timeSeriesGroupArray'
'doc_type': 'reference'
---


# timeSeriesGroupArray

時系列データをタイムスタンプの昇順でソートします。

**構文**

```sql
timeSeriesGroupArray(timestamp, value)
```

**引数**

- `timestamp` - サンプルのタイムスタンプ
- `value` - タイムスタンプに対応する時系列の値

**戻り値**

この関数は、`timestamp` によって昇順にソートされたタプルの配列（`timestamp`, `value`）を返します。
同じ `timestamp` に複数の値がある場合、関数はこれらの中で最大の値を選択します。

**例**

```sql
WITH
    [110, 120, 130, 140, 140, 100]::Array(UInt32) AS timestamps,
    [1, 6, 8, 17, 19, 5]::Array(Float32) AS values -- array of values corresponding to timestamps above
SELECT timeSeriesGroupArray(timestamp, value)
FROM
(
    -- This subquery converts arrays of timestamps and values into rows of `timestamp`, `value`
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

また、タイムスタンプと値の複数のサンプルを、等しいサイズの配列として渡すこともできます。配列引数を使用した同じクエリ:

```sql
WITH
    [110, 120, 130, 140, 140, 100]::Array(UInt32) AS timestamps,
    [1, 6, 8, 17, 19, 5]::Array(Float32) AS values -- array of values corresponding to timestamps above
SELECT timeSeriesGroupArray(timestamps, values);
```

:::note
この関数は実験的です。 `allow_experimental_ts_to_grid_aggregate_function=true` を設定して有効にしてください。
:::
