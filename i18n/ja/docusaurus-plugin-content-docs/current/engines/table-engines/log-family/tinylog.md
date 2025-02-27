---
slug: /engines/table-engines/log-family/tinylog
toc_priority: 34
toc_title: TinyLog
---

# TinyLog

このエンジンはログエンジンファミリーに属します。ログエンジンの一般的なプロパティとその違いについては、[Log Engine Family](../../../engines/table-engines/log-family/index.md) を参照してください。

このテーブルエンジンは通常、1回書き込みメソッドで使用されます：データを一度書き込んだ後、必要に応じて何度も読み取ります。たとえば、`TinyLog`タイプのテーブルを小さなバッチ処理で処理される中間データに使用することができます。多数の小さなテーブルにデータを格納することは非効率的であることに注意してください。

クエリは1つのストリームで実行されます。言い換えれば、このエンジンは比較的小なテーブル（約1,000,000行まで）を意図しています。多くの小さなテーブルがある場合には、このテーブルエンジンを使用するのが理にかなっています。なぜなら、[Log](../../../engines/table-engines/log-family/log.md) エンジンよりもシンプルで、開く必要のあるファイルが少ないからです。

## 特徴 {#characteristics}

- **シンプルな構造**: Logエンジンとは異なり、TinyLogはマークファイルを使用しません。これにより複雑さは軽減されますが、大規模データセットに対するパフォーマンス最適化は制限されます。
- **シングルストリームクエリ**: TinyLogテーブルのクエリは単一のストリームで実行され、通常は約1,000,000行までの比較的小なテーブルに適しています。
- **小さなテーブルに効率的**: TinyLogエンジンはシンプルさのため、多くの小さなテーブルを管理する際に有利で、Logエンジンに比べてファイル操作が少なくて済みます。

Logエンジンとは異なり、TinyLogはマークファイルを使用しません。これにより複雑さは軽減されますが、大規模データセットに対するパフォーマンス最適化は制限されます。

## テーブルの作成 {#table_engines-tinylog-creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = TinyLog
```

[CREATE TABLE](../../../sql-reference/statements/create/table.md#create-table-query) クエリの詳細な説明については、こちらを参照してください。

## データの書き込み {#table_engines-tinylog-writing-the-data}

`TinyLog`エンジンはすべてのカラムを1つのファイルに保存します。各 `INSERT` クエリに対して、ClickHouseはデータブロックをテーブルファイルの末尾に追加し、カラムを1つずつ書き込みます。

各テーブルのためにClickHouseは以下のファイルを作成します：

- `<column>.bin`: 各カラム用のデータファイルで、シリアライズされ圧縮されたデータが含まれています。

`TinyLog`エンジンは `ALTER UPDATE` および `ALTER DELETE` 操作をサポートしていません。

## 使用例 {#table_engines-tinylog-example-of-use}

テーブルの作成：

``` sql
CREATE TABLE tiny_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = TinyLog
```

データの挿入：

``` sql
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

私たちは二つの `INSERT` クエリを使用して、`<column>.bin` ファイルの中に二つのデータブロックを作成しました。

ClickHouseは単一のストリームでデータを選択します。その結果、出力の行のブロックの順序は、入力の同じブロックの順序と一致します。たとえば：

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
