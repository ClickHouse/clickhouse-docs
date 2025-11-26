---
description: '引数の異なる値の個数を正確に計算します。'
sidebar_position: 207
slug: /sql-reference/aggregate-functions/reference/uniqexact
title: 'uniqExact'
doc_type: 'reference'
---

# uniqExact

引数の異なる値の数を正確に計算します。

```sql
uniqExact(x[, ...])
```

厳密な結果がどうしても必要な場合は `uniqExact` 関数を使用してください。それ以外の場合は [uniq](/sql-reference/aggregate-functions/reference/uniq) 関数を使用します。

`uniqExact` 関数は `uniq` よりも多くのメモリを使用します。これは、異なる値の数が増えるにつれて状態のサイズが際限なく増加するためです。

**引数**

この関数は任意個のパラメータを受け取ります。パラメータには `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型を指定できます。

**例**

この例では、`uniqExact` 関数を使用して、[OpenSky データセット](https://sql.clickhouse.com?query=U0VMRUNUIHVuaXFFeGFjdCh0eXBlY29kZSkgRlJPTSBvcGVuc2t5Lm9wZW5za3k&) 内の一意なタイプコード（航空機の型式を表す短い識別子）の数を数えます。

```sql title="Query"
SELECT uniqExact(typecode) FROM opensky.opensky
```

```response title="Response"
1106
```

**関連項目**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
