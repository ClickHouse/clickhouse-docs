---
slug: '/sql-reference/aggregate-functions/reference/uniqexact'
sidebar_position: 207
title: 'uniqExact'
description: '異なる引数値の正確な数を計算します。'
---


# uniqExact

異なる引数値の正確な数を計算します。

``` sql
uniqExact(x[, ...])
```

正確な結果が絶対に必要な場合は `uniqExact` 関数を使用してください。そうでなければ、[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数を使用してください。

`uniqExact` 関数は `uniq` に比べてより多くのメモリを使用します。なぜなら、異なる値の数が増えるにつれて状態のサイズが無限に成長するからです。

**引数**

この関数は可変数のパラメータを取ります。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型である必要があります。

**例**

この例では、`uniqExact` 関数を使用して、[opensky データセット](https://sql.clickhouse.com?query=U0VMRUNUIHVuaXFFeGFjdCh0eXBlY29kZSkgRlJPTSBvcGVuc2t5Lm9wZW5za3k&)におけるユニークなタイプコード（航空機のタイプを示す短い識別子）の数を数えます。

```sql title="クエリ"
SELECT uniqExact(typecode) FROM opensky.opensky
```

```response title="レスポンス"
1106
```

**関連項目**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
