---
'description': 'QBit データ型に関する Documentation in ClickHouse、これは近似ベクトル検索のための細かい量子化を可能にします'
'keywords':
- 'qbit'
- 'data type'
'sidebar_label': 'QBit'
'sidebar_position': 64
'slug': '/sql-reference/data-types/qbit'
'title': 'QBit データ型'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge/>

`QBit` データ型は、ベクトルストレージを再編成して、より高速な近似検索を可能にします。各ベクトルの要素を一緒に保存する代わりに、すべてのベクトルにわたって同じバイナリ桁位置をグループ化します。
これにより、ベクトルは完全な精度で保存され、検索時に詳細な量子化レベルを選択できます: より少ないビットを読み込むことで I/O を減らし、計算を高速化するか、より高い精度のためにより多くのビットを読み取ることができます。量子化から得られるデータ転送と計算の速度向上の利点を享受しつつ、必要なときに元のデータはすべて利用可能です。

:::note
`QBit` データ型およびそれに関連する距離関数は、現在実験的です。
これらを有効にするには、最初に `SET allow_experimental_qbit_type = 1` を実行してください。
問題が発生した場合は、[ClickHouse リポジトリ](https://github.com/clickhouse/clickhouse/issues)に問題をオープンしてください。
:::

`QBit` 型のカラムを宣言するには、以下の構文を使用します:

```sql
column_name QBit(element_type, dimension)
```

* `element_type` – 各ベクトル要素の型。許可される型は `BFloat16`、`Float32` および `Float64` です
* `dimension` – 各ベクトルの要素数

## QBit の作成 {#creating-qbit}

テーブルカラム定義で `QBit` 型を使用する:

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

`QBit` は、格納されたベクトルの個々のビットプレーンにアクセスできるサブカラムアクセスパターンを実装しています。各ビット位置は、`.N` 構文を使用してアクセスでき、ここで `N` はビット位置です:

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

アクセス可能なサブカラムの数は、要素型によって異なります:

* `BFloat16`: 16 サブカラム (1-16)
* `Float32`: 32 サブカラム (1-32)
* `Float64`: 64 サブカラム (1-64)

## ベクトル検索関数 {#vector-search-functions}

これは、`QBit` データ型を使用したベクトル類似検索のための距離関数です:

* [`L2DistanceTransposed`](../functions/distance-functions.md#L2DistanceTransposed)
