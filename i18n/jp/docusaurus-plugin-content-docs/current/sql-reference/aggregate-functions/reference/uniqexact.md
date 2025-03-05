---
slug: /sql-reference/aggregate-functions/reference/uniqexact
sidebar_position: 207
title: "uniqExact"
description: "異なる引数値の正確な数を計算します。"
---


# uniqExact

異なる引数値の正確な数を計算します。

``` sql
uniqExact(x[, ...])
```

正確な結果が絶対に必要な場合は、`uniqExact` 関数を使用してください。そうでない場合は、[uniq](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq) 関数を使用してください。

`uniqExact` 関数は、異なる値の数が増加すると状態のサイズが無制限に成長するため、`uniq` よりも多くのメモリを使用します。

**引数**

この関数は可変数のパラメータを受け取ります。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型であることができます。

**例**

この例では、`uniqExact` 関数を使用して [opensky データセット](https://sql.clickhouse.com?query=U0VMRUNUIHVuaXFFeGFjdCh0eXBlY29kZSkgRlJPTSBvcGVuc2t5Lm9wZW5za3k&) のユニークなタイプコード（航空機のタイプの短い識別子）の数をカウントします。

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
