---
description: 'ClickHouse における QBit データ型のドキュメントです。近似ベクトル検索のためのきめ細かな量子化を可能にします'
keywords: ['qbit', 'データ型']
sidebar_label: 'QBit'
sidebar_position: 64
slug: /sql-reference/data-types/qbit
title: 'QBit データ型'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

`QBit` データ型は、近似検索を高速化するためにベクトルの格納方法を再構成します。各ベクトルの要素をまとめて格納する代わりに、すべてのベクトルにわたって同じビット位置同士をグループ化して格納します。
これにより、ベクトルはフル精度のまま保持されつつ、検索時に細かな量子化レベルを選択できます。I/O を減らして計算を高速化したい場合はより少ないビットを読み取り、精度を高めたい場合はより多くのビットを読み取ります。量子化によるデータ転送量と計算量削減の高速化メリットを得つつ、必要に応じて元の全データにいつでもアクセスできます。

:::note
`QBit` データ型とそれに関連する距離関数はベータ機能です。
これらを有効化するには、まず `SET enable_qbit_type = 1` を実行してください。
問題が発生した場合は、[ClickHouse repository](https://github.com/clickhouse/clickhouse/issues) に issue を作成してください。
:::

`QBit` 型のカラムを宣言するには、次の構文を使用します。

```sql
column_name QBit(element_type, dimension)
```

* `element_type` – 各ベクトル要素の型。使用できる型は `BFloat16`、`Float32`、`Float64` です。
* `dimension` – 各ベクトル内の要素数。


## QBit の作成 {#creating-qbit}

テーブルのカラム定義で `QBit` 型を使用する場合:

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


## QBit サブカラム {#qbit-subcolumns}

`QBit` では、保存されているベクトルの各ビットプレーンに個別にアクセスできるサブカラムアクセスパターンを実装しています。各ビット位置には `.N` という構文でアクセスでき、`N` はビット位置を表します。

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

アクセス可能なサブカラムの数は、要素型によって異なります。

* `BFloat16`: サブカラムは 16 個 (1-16)
* `Float32`: サブカラムは 32 個 (1-32)
* `Float64`: サブカラムは 64 個 (1-64)


## ベクトル検索関数 {#vector-search-functions}

次のベクトル類似検索用距離関数は `QBit` データ型を使用します。

* [`L2DistanceTransposed`](../functions/distance-functions.md#L2DistanceTransposed)
* [`cosineDistanceTransposed`](../functions/distance-functions.md#cosineDistanceTransposed)