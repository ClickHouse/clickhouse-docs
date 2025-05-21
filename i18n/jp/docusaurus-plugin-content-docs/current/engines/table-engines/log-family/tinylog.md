---
description: 'TinyLog のドキュメント'
slug: /engines/table-engines/log-family/tinylog
toc_priority: 34
toc_title: 'TinyLog'
title: 'TinyLog'
---


# TinyLog

このエンジンは、ログエンジンファミリーに属しています。ログエンジンの共通プロパティやそれらの違いについては、[Log Engine Family](../../../engines/table-engines/log-family/index.md)を参照してください。

このテーブルエンジンは、通常、書き込み一回の方法で使用されます：データを一度書き込み、その後必要に応じて何回でも読み取ります。たとえば、`TinyLog`タイプのテーブルを使用して、小さなバッチで処理される中間データを管理できます。ただし、大量の小さなテーブルにデータを保存することは非効率です。

クエリは単一のストリームで実行されます。言い換えれば、このエンジンは比較的小さなテーブル（約1,000,000行まで）を対象としています。多くの小さなテーブルがある場合は、このテーブルエンジンを使用する方が合理的です。なぜなら、[Log](../../../engines/table-engines/log-family/log.md)エンジンよりもシンプルで（開く必要のあるファイルが少ないため）、効率的だからです。

## 特徴 {#characteristics}

- **シンプルな構造**: Logエンジンとは異なり、TinyLogはマークファイルを使用しません。これにより複雑さが軽減される一方で、大規模データセットに対するパフォーマンス最適化が制限されます。
- **単一ストリームクエリ**: TinyLogテーブルに対するクエリは単一のストリームで実行されるため、比較的小さなテーブル（通常は約1,000,000行まで）に適しています。
- **小さなテーブルに対して効率的**: TinyLogエンジンのシンプルさは、多くの小さなテーブルを管理する場合に有利であり、Logエンジンに比べてファイル操作が少なくて済みます。

Logエンジンとは異なり、TinyLogはマークファイルを使用しません。これにより複雑さが軽減される一方で、大規模データセットに対するパフォーマンス最適化が制限されます。

## テーブルの作成 {#table_engines-tinylog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = TinyLog
```

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細な説明を参照してください。

## データの書き込み {#table_engines-tinylog-writing-the-data}

`TinyLog`エンジンは、すべてのカラムを1つのファイルに格納します。各`INSERT`クエリごとに、ClickHouseはデータブロックをテーブルファイルの末尾に追加し、カラムを1つずつ書き込みます。

各テーブルに対して、ClickHouseは以下のファイルを書き込みます：

- `<column>.bin`: 各カラムのデータファイルで、シリアライズされ圧縮されたデータを含みます。

`TinyLog`エンジンは`ALTER UPDATE`および`ALTER DELETE`操作をサポートしていません。

## 使用例 {#table_engines-tinylog-example-of-use}

テーブルを作成：

```sql
CREATE TABLE tiny_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = TinyLog
```

データを挿入：

```sql
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

2つの`INSERT`クエリを使用して、`<column>.bin`ファイル内に2つのデータブロックを作成しました。

ClickHouseは、データを選択するために単一のストリームを使用します。その結果として、出力内の行ブロックの順序は、入力内の同じブロックの順序と一致します。たとえば：

```sql
SELECT * FROM tiny_log_table
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2024-12-10 13:11:58 │ REGULAR      │ The first regular message  │
│ 2024-12-10 13:12:12 │ REGULAR      │ The second regular message │
│ 2024-12-10 13:12:12 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
