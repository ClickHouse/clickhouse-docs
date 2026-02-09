---
description: 'ClickHouse における QBit データ型のドキュメント。近似ベクトル検索のためのきめ細かな量子化を可能にします'
keywords: ['qbit', 'data type']
sidebar_label: 'QBit'
sidebar_position: 64
slug: /sql-reference/data-types/qbit
title: 'QBit データ型'
doc_type: 'reference'
---

`QBit` データ型は、近似検索を高速化するためにベクトルの格納方法を再編成します。各ベクトルの要素をひとまとまりとして格納する代わりに、すべてのベクトルにわたって同じビット桁（ビット位置）ごとにグループ化して格納します。
これにより、ベクトルは元の精度を保ったまま保存されつつ、検索時にきめ細かな量子化レベルを選択できます。I/O を少なくして計算を高速化したい場合は読むビット数を減らし、高い精度が必要な場合は読むビット数を増やします。量子化によるデータ転送量と計算量削減に伴う高速化の利点を得つつ、必要に応じて元の全データにもアクセスできます。

`QBit` 型のカラムを宣言するには、次の構文を使用します。

```sql
column_name QBit(element_type, dimension)
```

* `element_type` – 各ベクトル要素の型。使用可能な型は `BFloat16`、`Float32`、`Float64` です。
* `dimension` – 各ベクトル内の要素数


## QBit の作成 \{#creating-qbit\}

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


## QBit サブカラム \{#qbit-subcolumns\}

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


## ベクトル検索関数 \{#vector-search-functions\}

次のベクトル類似検索用距離関数は `QBit` データ型を使用します。

* [`L2DistanceTransposed`](../functions/distance-functions.md#L2DistanceTransposed)
* [`cosineDistanceTransposed`](../functions/distance-functions.md#cosineDistanceTransposed)