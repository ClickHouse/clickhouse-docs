---
description: 'GenerateRandom テーブルエンジンは、指定されたテーブルスキーマに従ってランダムなデータを生成します。'
sidebar_label: 'GenerateRandom'
sidebar_position: 140
slug: /engines/table-engines/special/generate
title: 'GenerateRandom テーブルエンジン'
doc_type: 'reference'
---

# GenerateRandom テーブルエンジン \\{#generaterandom-table-engine\\}

GenerateRandom テーブルエンジンは、指定されたテーブルスキーマに基づいてランダムなデータを生成します。

使用例:

- テストで再現可能な大規模テーブルを作成するために使用します。
- ファジングテスト用のランダムな入力データを生成します。

## ClickHouse サーバーでの利用方法 \\{#usage-in-clickhouse-server\\}

```sql
ENGINE = GenerateRandom([random_seed [,max_string_length [,max_array_length]]])
```

`max_array_length` と `max_string_length` パラメータは、生成されるデータ内のすべての配列型およびマップ型カラムと文字列の最大長をそれぞれ指定します。

Generate テーブルエンジンは `SELECT` クエリのみをサポートします。

テーブルに保存可能な [DataTypes](../../../sql-reference/data-types/index.md) のうち、`AggregateFunction` を除くすべてをサポートします。

## 例 \\{#example\\}

**1.** `generate_engine_table` テーブルを作成します。

```sql
CREATE TABLE generate_engine_table (name String, value UInt32) ENGINE = GenerateRandom(1, 5, 3)
```

**2.** データをクエリします：

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

## 実装の詳細 \\{#details-of-implementation\\}

- サポート対象外:
  - `ALTER`
  - `SELECT ... SAMPLE`
  - `INSERT`
  - インデックス
  - レプリケーション
