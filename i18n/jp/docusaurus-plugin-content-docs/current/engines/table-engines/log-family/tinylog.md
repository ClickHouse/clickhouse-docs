---
slug: /engines/table-engines/log-family/tinylog
toc_priority: 34
toc_title: TinyLog
---


# TinyLog

このエンジンはログエンジンファミリーに属します。ログエンジンの一般的な特性やその違いについては、[Log Engine Family](../../../engines/table-engines/log-family/index.md) を参照してください。

このテーブルエンジンは通常、書き込み一回の方法で使用されます：データを一度書き込み、その後は必要に応じて何度でも読み取ります。例えば、`TinyLog`タイプのテーブルは、小さなバッチで処理される中間データに使用できます。ただし、多くの小さなテーブルにデータを格納することは非効率です。

クエリは単一ストリームで実行されます。言い換えれば、このエンジンは比較的小さなテーブル（約1,000,000行まで）を対象としています。多くの小さなテーブルがある場合、このテーブルエンジンを使用することが意味を持ちます。これは、[Log](../../../engines/table-engines/log-family/log.md) エンジンよりもシンプルであり、開く必要があるファイルが少ないためです。

## 特性 {#characteristics}

- **構造がシンプル**: Logエンジンとは異なり、TinyLogはマークファイルを使用しません。これにより複雑さは減少しますが、大規模なデータセットに対するパフォーマンス最適化が制限されます。
- **単一ストリームクエリ**: TinyLogテーブルのクエリは単一のストリームで実行されるため、通常は1,000,000行までの比較的小さなテーブルに適しています。
- **小さなテーブルに効率的**: TinyLogエンジンのシンプルさは、多くの小さなテーブルの管理において利点となり、Logエンジンに比べてファイル操作が少なくて済みます。

Logエンジンとは異なり、TinyLogはマークファイルを使用しません。これにより複雑さは減少しますが、大規模なデータセットに対するパフォーマンス最適化が制限されます。

## テーブルの作成 {#table_engines-tinylog-creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = TinyLog
```

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細な説明を参照してください。

## データの書き込み {#table_engines-tinylog-writing-the-data}

`TinyLog`エンジンは、すべてのカラムを1つのファイルに格納します。各`INSERT`クエリのたびに、ClickHouseはテーブルファイルの末尾にデータブロックを追加し、カラムを1つずつ書き込みます。

各テーブルに対してClickHouseが書き込むファイルは次の通りです：

- `<column>.bin`: 各カラムのデータファイルで、シリアライズされ圧縮されたデータを含みます。

`TinyLog`エンジンは、`ALTER UPDATE`および `ALTER DELETE`操作をサポートしていません。

## 使用例 {#table_engines-tinylog-example-of-use}

テーブルを作成します：

``` sql
CREATE TABLE tiny_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = TinyLog
```

データを挿入します：

``` sql
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

私たちは二つの`INSERT`クエリを使用して、`<column>.bin`ファイル内に二つのデータブロックを作成しました。

ClickHouseはデータを選択するために単一ストリームを使用します。その結果、出力の行のブロックの順序は、入力の同じブロックの順序と一致します。例えば：

``` sql
SELECT * FROM tiny_log_table
```

``` text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2024-12-10 13:11:58 │ REGULAR      │ The first regular message  │
│ 2024-12-10 13:12:12 │ REGULAR      │ The second regular message │
│ 2024-12-10 13:12:12 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
