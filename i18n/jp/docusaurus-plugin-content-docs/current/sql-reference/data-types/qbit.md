---
description: 'ClickHouse における QBit データ型のドキュメントです。QBit データ型は、近似ベクトル検索のための細粒度な量子化を可能にします'
keywords: ['qbit', 'data type']
sidebar_label: 'QBit'
sidebar_position: 64
slug: /sql-reference/data-types/qbit
title: 'QBit データ型'
doc_type: 'reference'
---

import BetaBadge from &#39;@theme/badges/BetaBadge&#39;;

<BetaBadge/>

`QBit` データ型は、近似検索を高速化するためにベクトルの格納方式を再構成します。各ベクトルの要素をまとめて保存する代わりに、すべてのベクトルにわたって同じビット位置をグループ化して格納します。
これにより、ベクトルはフル精度のまま保持しつつ、検索時にきめ細かな量子化レベルを選択できます。読み込むビット数を少なくすれば I/O が減って計算が高速になり、多く読めば精度が向上します。量子化によるデータ転送量および計算量削減の高速化メリットを得ながら、必要に応じて元のデータをすべて参照できます。

:::note
`QBit` データ型とそれに関連する距離関数は、現在ベータ機能です。
これらを有効にするには、まず `SET enable_qbit_type = 1` を実行してください。
問題が発生した場合は、[ClickHouse repository](https://github.com/clickhouse/clickhouse/issues) に issue を作成してください。
:::

`QBit` 型のカラムを宣言するには、次の構文を使用します。

```sql
column_name QBit(element_type, dimension)
```

* `element_type` – 各ベクトル要素の型。利用可能な型は `BFloat16`、`Float32`、`Float64` です
* `dimension` – 各ベクトル内の要素数。


## QBit の作成 {#creating-qbit}

テーブルのカラム定義で `QBit` 型を使用する:

```sql
CREATE TABLE test (id UInt32, vec QBit(Float32, 8)) ENGINE = Memory;
INSERT INTO test VALUES (1, [1, 2, 3, 4, 5, 6, 7, 8]), (2, [9, 10, 11, 12, 13, 14, 15, 16]);
SELECT vec FROM test ORDER BY id;
```

```text
┌─vec──────────────────────┐
│ [1,2,3,4,5,6,7,8]        │
│ [9,10,11,12,13,14,15,16] │
└──────────────────────────┘
```


## QBit のサブカラム {#qbit-subcolumns}

`QBit` は、保存されたベクトルの各ビットプレーンに個別にアクセスできるサブカラムへのアクセスパターンを実装しています。各ビット位置には、`.N` という構文を使用してアクセスでき、ここで `N` はビット位置を表します。

```sql
CREATE TABLE test (id UInt32, vec QBit(Float32, 8)) ENGINE = Memory;
INSERT INTO test VALUES (1, [0, 0, 0, 0, 0, 0, 0, 0]);
INSERT INTO test VALUES (1, [-0, -0, -0, -0, -0, -0, -0, -0]);
SELECT bin(vec.1) FROM test;
```

```text
┌─bin(tupleElement(vec, 1))─┐
│ 00000000                  │
│ 11111111                  │
└───────────────────────────┘
```

利用可能なサブカラム数は要素の型によって異なります：

* `BFloat16`: サブカラム 16 個 (1-16)
* `Float32`: サブカラム 32 個 (1-32)
* `Float64`: サブカラム 64 個 (1-64)


## ベクトル検索関数 {#vector-search-functions}

これらは、`QBit` データ型を使用するベクトル類似検索用の距離関数です：

* [`L2DistanceTransposed`](../functions/distance-functions.md#L2DistanceTransposed)
* [`cosineDistanceTransposed`](../functions/distance-functions.md#cosineDistanceTransposed)