---
description: 'ClickHouse における QBit データ型についてのドキュメント。近似ベクトル検索向けにきめ細かな量子化を可能にします'
keywords: ['qbit', 'データ型']
sidebar_label: 'QBit'
sidebar_position: 64
slug: /sql-reference/data-types/qbit
title: 'QBit データ型'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge />

`QBit` データ型は、近似検索を高速化するためにベクトルの格納レイアウトを再編成します。各ベクトルの要素をまとめて格納する代わりに、すべてのベクトルにおける同じビット位置をまとめて格納します。
これにより、ベクトルは元の精度のまま保持しつつ、検索時に細かな量子化レベルを選択できます。I/O を減らして計算を高速化したい場合はより少ないビットを読み取り、高い精度が必要な場合はより多くのビットを読み取ります。量子化によるデータ転送量と計算量削減のメリットを享受しつつ、必要に応じて元のデータ全体にもアクセスできます。

:::note
`QBit` データ型とそれに関連する距離関数は現在実験的な機能です。
これらを有効にするには、まず `SET allow_experimental_qbit_type = 1` を実行してください。
問題が発生した場合は、[ClickHouse リポジトリ](https://github.com/clickhouse/clickhouse/issues) に issue を作成してください。
:::

`QBit` 型のカラムを宣言するには、次の構文を使用します。

```sql
カラム名 QBit(要素型, 次元)
```

* `element_type` – 各ベクトル要素の型です。使用可能な型は `BFloat16`、`Float32`、`Float64` です。
* `dimension` – 各ベクトルの要素数です。


## QBitの作成 {#creating-qbit}

テーブルのカラム定義で`QBit`型を使用する:

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


## QBitサブカラム {#qbit-subcolumns}

`QBit`は、格納されたベクトルの個々のビットプレーンにアクセスできるサブカラムアクセスパターンを実装しています。各ビット位置には`.N`構文を使用してアクセスでき、`N`はビット位置を表します:

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

アクセス可能なサブカラムの数は要素型によって異なります:

- `BFloat16`: 16個のサブカラム（1-16）
- `Float32`: 32個のサブカラム（1-32）
- `Float64`: 64個のサブカラム（1-64）


## ベクトル検索関数 {#vector-search-functions}

以下は、`QBit`データ型を使用したベクトル類似性検索のための距離関数です:

- [`L2DistanceTransposed`](../functions/distance-functions.md#L2DistanceTransposed)
