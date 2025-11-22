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

このエンジンは Log エンジンファミリーに属します。Log エンジンに共通する特性およびそれらの違いについては、[Log Engine Family](../../../engines/table-engines/log-family/index.md) を参照してください。

このテーブルエンジンは、1 回だけ書き込み、その後は必要に応じて何度も読み取るという write-once 手法で一般的に使用されます。たとえば、`TinyLog` 型のテーブルを、小さなバッチで処理される中間データのために使用できます。多数の小さなテーブルにデータを保存することは非効率である点に注意してください。

クエリは単一のストリームで実行されます。言い換えると、このエンジンは比較的小さなテーブル（約 1,000,000 行まで）を対象としています。多数の小さなテーブルがある場合には、このテーブルエンジンを使用することが有効です。[Log](../../../engines/table-engines/log-family/log.md) エンジンよりも単純であり（オープンする必要のあるファイル数が少ないため）です。



## 特性 {#characteristics}

- **シンプルな構造**: Logエンジンとは異なり、TinyLogはマークファイルを使用しません。これにより複雑さが軽減されますが、大規模なデータセットに対するパフォーマンス最適化は制限されます。
- **シングルストリームクエリ**: TinyLogテーブルに対するクエリは単一のストリームで実行されるため、通常100万行までの比較的小規模なテーブルに適しています。
- **小規模テーブルに効率的**: TinyLogエンジンはシンプルな構造であるため、多数の小規模テーブルを管理する際に有利です。Logエンジンと比較してファイル操作が少なくて済むためです。

Logエンジンとは異なり、TinyLogはマークファイルを使用しません。これにより複雑さが軽減されますが、より大規模なデータセットに対するパフォーマンス最適化は制限されます。


## テーブルの作成 {#table_engines-tinylog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = TinyLog
```

詳細については、[CREATE TABLE](/sql-reference/statements/create/table)クエリの説明を参照してください。


## データの書き込み {#table_engines-tinylog-writing-the-data}

`TinyLog`エンジンは、すべてのカラムを1つのファイルに格納します。各`INSERT`クエリに対して、ClickHouseはデータブロックをテーブルファイルの末尾に追加し、カラムを1つずつ書き込みます。

各テーブルに対して、ClickHouseは次のファイルを書き込みます:

- `<column>.bin`: 各カラムのデータファイルで、シリアライズされ圧縮されたデータが含まれます。

`TinyLog`エンジンは、`ALTER UPDATE`および`ALTER DELETE`操作をサポートしていません。


## 使用例 {#table_engines-tinylog-example-of-use}

テーブルの作成:

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
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

2つの`INSERT`クエリを使用して、`<column>.bin`ファイル内に2つのデータブロックを作成しました。

ClickHouseはデータ選択時に単一のストリームを使用します。その結果、出力における行ブロックの順序は、入力における同じブロックの順序と一致します。例:

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
