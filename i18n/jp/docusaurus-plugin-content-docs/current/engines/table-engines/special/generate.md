---
description: 'GenerateRandom テーブルエンジンは、与えられたテーブルスキーマに基づいてランダムなデータを生成します。'
sidebar_label: 'GenerateRandom'
sidebar_position: 140
slug: /engines/table-engines/special/generate
title: 'GenerateRandom テーブルエンジン'
doc_type: 'reference'
---



# GenerateRandom テーブルエンジン

GenerateRandom テーブルエンジンは、指定されたテーブルスキーマに対してランダムなデータを生成します。

使用例:

- テストで再現可能な大規模テーブルにデータを投入するために使用する。
- ファジングテスト用のランダムな入力データを生成するために使用する。



## ClickHouseサーバーでの使用 {#usage-in-clickhouse-server}

```sql
ENGINE = GenerateRandom([random_seed [,max_string_length [,max_array_length]]])
```

`max_array_length`および`max_string_length`パラメータは、生成されるデータ内のすべての配列またはマップカラムと文字列の最大長をそれぞれ指定します。

GenerateRandomテーブルエンジンは`SELECT`クエリのみをサポートします。

`AggregateFunction`を除き、テーブルに格納可能なすべての[データ型](../../../sql-reference/data-types/index.md)をサポートします。


## 例 {#example}

**1.** `generate_engine_table` テーブルを設定します:

```sql
CREATE TABLE generate_engine_table (name String, value UInt32) ENGINE = GenerateRandom(1, 5, 3)
```

**2.** データをクエリします:

```sql
SELECT * FROM generate_engine_table LIMIT 3
```

```text
┌─name─┬──────value─┐
│ c4xJ │ 1412771199 │
│ r    │ 1791099446 │
│ 7#$  │  124312908 │
└──────┴────────────┘
```


## 実装の詳細 {#details-of-implementation}

- サポートされていない機能:
  - `ALTER`
  - `SELECT ... SAMPLE`
  - `INSERT`
  - インデックス
  - レプリケーション
