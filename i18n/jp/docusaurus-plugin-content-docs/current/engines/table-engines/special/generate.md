---
description: 'GenerateRandomテーブルエンジンは、指定されたテーブルスキーマに対してランダムデータを生成します。'
sidebar_label: 'GenerateRandom'
sidebar_position: 140
slug: /engines/table-engines/special/generate
title: 'GenerateRandomテーブルエンジン'
---

GenerateRandomテーブルエンジンは、指定されたテーブルスキーマに対してランダムデータを生成します。

使用例:

- 再現可能な大規模テーブルを埋めるためのテストで使用。
- ファジングテスト用のランダム入力を生成。

## ClickHouseサーバーでの使用 {#usage-in-clickhouse-server}

```sql
ENGINE = GenerateRandom([random_seed [,max_string_length [,max_array_length]]])
```

`max_array_length`と`max_string_length`パラメータは、生成されたデータ内のすべての配列またはマップカラムおよび文字列の最大長を指定します。

Generateテーブルエンジンは`SELECT`クエリのみをサポートします。

`AggregateFunction`を除くすべての[データ型](../../../sql-reference/data-types/index.md)をテーブルに保存することができます。

## 例 {#example}

**1.** `generate_engine_table`テーブルをセットアップ:

```sql
CREATE TABLE generate_engine_table (name String, value UInt32) ENGINE = GenerateRandom(1, 5, 3)
```

**2.** データをクエリ:

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
