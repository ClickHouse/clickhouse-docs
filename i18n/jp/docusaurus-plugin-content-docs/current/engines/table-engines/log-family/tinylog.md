---
description: 'TinyLog テーブルエンジンのドキュメント'
slug: /engines/table-engines/log-family/tinylog
toc_priority: 34
toc_title: 'TinyLog'
title: 'TinyLog テーブルエンジン'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TinyLog テーブルエンジン

<CloudNotSupportedBadge/>

このエンジンは Log エンジンファミリーに属します。Log エンジンに共通する特性とそれぞれの違いについては、[Log Engine Family](../../../engines/table-engines/log-family/index.md) を参照してください。

このテーブルエンジンは、通常は一度だけ書き込み、その後は必要な回数だけ読み取るという運用方法で使用されます。例えば、小さなバッチで処理される中間データには `TinyLog` 型のテーブルを使用できます。ただし、多数の小さいテーブルにデータを保存するのは非効率です。

クエリは単一ストリームで実行されます。言い換えると、このエンジンは比較的小さなテーブル（約 1,000,000 行まで）を想定しています。開く必要のあるファイル数が少ないため、[Log](../../../engines/table-engines/log-family/log.md) エンジンよりもシンプルであり、多数の小さなテーブルを扱う場合にはこのテーブルエンジンを使用するのが妥当です。



## 特性 {#characteristics}

- **よりシンプルな構造**: Log エンジンとは異なり、TinyLog は mark ファイルを使用しません。これにより構造は単純になり複雑さは軽減されますが、大規模なデータセットに対するパフォーマンスの最適化は制限されます。
- **単一ストリームでのクエリ**: TinyLog テーブルに対するクエリは単一ストリームで実行されるため、比較的小規模なテーブル、通常は最大で約 1,000,000 行までのテーブルに適しています。
- **小さなテーブルに対して効率的**: TinyLog エンジンのシンプルさにより、多数の小さなテーブルを管理する際に有利であり、Log エンジンと比較して必要なファイル操作が少なくて済みます。

Log エンジンとは異なり、TinyLog は mark ファイルを使用しません。これにより複雑さは軽減されますが、大規模なデータセットに対するパフォーマンスの最適化は制限されます。



## テーブルの作成

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = TinyLog
```

[CREATE TABLE](/sql-reference/statements/create/table) クエリについては、詳細な説明を参照してください。


## データの書き込み {#table_engines-tinylog-writing-the-data}

`TinyLog` エンジンは、すべてのカラムを 1 つのファイルに保存します。各 `INSERT` クエリのたびに、ClickHouse はデータブロックをテーブルファイルの末尾に追記し、カラムを 1 つずつ書き込みます。

ClickHouse は各テーブルに対して次のファイルを作成します。

- `<column>.bin`: 各カラム用のデータファイルで、シリアル化および圧縮されたデータが含まれます。

`TinyLog` エンジンは、`ALTER UPDATE` および `ALTER DELETE` 操作をサポートしません。



## 使用例

テーブルの作成：

```sql
CREATE TABLE tiny_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = TinyLog
```

データの挿入:

```sql
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','最初の通常メッセージ')
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','2番目の通常メッセージ'),(now(),'WARNING','最初の警告メッセージ')
```

2 つの `INSERT` クエリを使用して、`<column>.bin` ファイル内に 2 つのデータブロックを作成しました。

ClickHouse は単一のストリームでデータを読み出します。その結果、出力における行ブロックの順序は、入力における同じブロックの順序と一致します。例えば次のとおりです。

```sql
SELECT * FROM tiny_log_table
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2024-12-10 13:11:58 │ REGULAR      │ 1件目の通常メッセージ      │
│ 2024-12-10 13:12:12 │ REGULAR      │ 2件目の通常メッセージ      │
│ 2024-12-10 13:12:12 │ WARNING      │ 1件目の警告メッセージ      │
└─────────────────────┴──────────────┴────────────────────────────┘
```
