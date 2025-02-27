---
slug: /sql-reference/aggregate-functions/reference/uniqexact
sidebar_position: 207
---

# uniqExact

引数の異なる値の正確な数を計算します。

``` sql
uniqExact(x[, ...])
```

正確な結果が絶対に必要な場合は、`uniqExact`関数を使用してください。それ以外の場合は、[uniq](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq)関数を使用してください。

`uniqExact`関数は、異なる値の数が増えるにつれて状態のサイズが無限に増大するため、`uniq`よりも多くのメモリを使用します。

**引数**

この関数は可変数のパラメーターを取ります。パラメーターは`Tuple`、`Array`、`Date`、`DateTime`、`String`または数値型を指定できます。

**例**

この例では、`uniqExact`関数を使用して、[opensky データセット](https://sql.clickhouse.com?query=U0VMRUNUIHVuaXFFeGFjdCh0eXBlY29kZSkgRlJPTSBvcGVuc2t5Lm9wZW5za3k&)におけるユニークなタイプコード（航空機のタイプのための短い識別子）の数をカウントします。

```sql title="クエリ"
SELECT uniqExact(typecode) FROM opensky.opensky
```

```response title="レスポンス"
1106
```

**関連情報**

- [uniq](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq)
- [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniqcombined)
- [uniqHLL12](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniqhll12)
- [uniqTheta](../../../sql-reference/aggregate-functions/reference/uniqthetasketch.md#agg_function-uniqthetasketch)
