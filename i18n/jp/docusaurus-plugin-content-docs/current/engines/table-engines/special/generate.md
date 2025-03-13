---
slug: /engines/table-engines/special/generate
sidebar_position: 140
sidebar_label:  GenerateRandom
title: "GenerateRandom テーブルエンジン"
description: "GenerateRandom テーブルエンジンは、指定されたテーブルスキーマに対してランダムデータを生成します。"
---

GenerateRandom テーブルエンジンは、指定されたテーブルスキーマに対してランダムデータを生成します。

使用例:

- 再現可能な大規模テーブルをポピュレートするためにテストで使用。
- フェズテスト用のランダム入力を生成。

## ClickHouse サーバーでの使用 {#usage-in-clickhouse-server}

``` sql
ENGINE = GenerateRandom([random_seed [,max_string_length [,max_array_length]]])
```

`max_array_length` および `max_string_length` パラメータは、生成されたデータ内のすべての配列またはマップカラムおよび文字列の最大長さを指定します。

GenerateRandom テーブルエンジンは、`SELECT` クエリのみをサポートします。

それは、`AggregateFunction` を除いたテーブルに格納できるすべての [DataTypes](../../../sql-reference/data-types/index.md) をサポートしています。

## 例 {#example}

**1.** `generate_engine_table` テーブルを設定:

``` sql
CREATE TABLE generate_engine_table (name String, value UInt32) ENGINE = GenerateRandom(1, 5, 3)
```

**2.** データをクエリ:

``` sql
SELECT * FROM generate_engine_table LIMIT 3
```

``` text
┌─name─┬──────value─┐
│ c4xJ │ 1412771199 │
│ r    │ 1791099446 │
│ 7#$  │  124312908 │
└──────┴────────────┘
```

## 実装の詳細 {#details-of-implementation}

- サポートされていないもの:
    - `ALTER`
    - `SELECT ... SAMPLE`
    - `INSERT`
    - インデックス
    - レプリケーション
