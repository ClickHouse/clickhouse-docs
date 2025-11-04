---
'description': 'GenerateRandom テーブルエンジンは、指定されたテーブルスキーマのためにランダムデータを生成します。'
'sidebar_label': 'GenerateRandom'
'sidebar_position': 140
'slug': '/engines/table-engines/special/generate'
'title': 'GenerateRandom テーブルエンジン'
'doc_type': 'reference'
---

GenerateRandom テーブルエンジンは、指定されたテーブルスキーマに対してランダムなデータを生成します。

使用例:

- 再現性のある大規模テーブルを.populateするためのテストで使用。
- ファジングテストのためのランダム入力を生成。

## ClickHouse サーバーでの使用 {#usage-in-clickhouse-server}

```sql
ENGINE = GenerateRandom([random_seed [,max_string_length [,max_array_length]]])
```

`max_array_length` および `max_string_length` パラメータは、生成データにおけるすべての配列またはマップカラムおよび文字列の最大長を指定します。

GenerateRandom テーブルエンジンは、`SELECT` クエリのみをサポートしています。

`AggregateFunction` を除く、テーブルに保存できるすべての [DataTypes](../../../sql-reference/data-types/index.md) をサポートしています。

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

- サポートされていないもの:
  - `ALTER`
  - `SELECT ... SAMPLE`
  - `INSERT`
  - インデックス
  - レプリケーション
