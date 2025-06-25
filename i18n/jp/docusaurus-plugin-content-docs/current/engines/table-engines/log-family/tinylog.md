---
'description': 'TinyLogのドキュメント'
'slug': '/engines/table-engines/log-family/tinylog'
'toc_priority': 34
'toc_title': 'TinyLog'
'title': 'TinyLog'
---




# TinyLog

このエンジンは、ログエンジンファミリーに属します。ログエンジンの共通の特性や違いについては、[Log Engine Family](../../../engines/table-engines/log-family/index.md) を参照してください。

このテーブルエンジンは、一般的に書き込み一回のメソッドで使用されます：データを書き込んだら、必要に応じて何度でも読み取ります。例えば、`TinyLog`タイプのテーブルを、少量バッチで処理される中間データに使用できます。小さなテーブルを多数保持することは非効率であることに注意してください。

クエリは単一のストリームで実行されます。言い換えれば、このエンジンは比較的に小さなテーブル（約1,000,000行まで）を想定しています。多くの小さなテーブルを持っている場合には、このテーブルエンジンを使用するのが理にかなっています。なぜなら、[Log](../../../engines/table-engines/log-family/log.md)エンジンよりも簡単で（開く必要のあるファイルが少ないため）、管理が容易だからです。

## Characteristics {#characteristics}

- **シンプルな構造**: Logエンジンとは異なり、TinyLogはマークファイルを使用しません。これにより複雑さが軽減されますが、大規模データセットのパフォーマンス最適化が制限されます。
- **単一ストリームクエリ**: TinyLogテーブルに対するクエリは単一のストリームで実行され、通常は1,000,000行までの比較的小さなテーブルに適しています。
- **小規模テーブルに対する効率性**: TinyLogエンジンのシンプルさは、多くの小さなテーブルを管理する際に有利であり、Logエンジンと比べてファイル操作が少なくて済みます。

Logエンジンとは異なり、TinyLogはマークファイルを使用しません。これにより複雑さが軽減されますが、大規模データセットのパフォーマンス最適化が制限されます。

## Creating a Table {#table_engines-tinylog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = TinyLog
```

[CREATE TABLE](/sql-reference/statements/create/table)クエリの詳細な説明を参照してください。

## Writing the Data {#table_engines-tinylog-writing-the-data}

`TinyLog`エンジンは、すべてのカラムを1つのファイルに保存します。各`INSERT`クエリに対して、ClickHouseはデータブロックをテーブルファイルの末尾に追加し、カラムを1つずつ書き込みます。

ClickHouseは各テーブルに対して次のファイルを書きます：

- `<column>.bin`: シリアライズされ圧縮されたデータを含む各カラム用のデータファイル。

`TinyLog`エンジンは、`ALTER UPDATE`および`ALTER DELETE`操作をサポートしていません。

## Example of Use {#table_engines-tinylog-example-of-use}

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

データの挿入：

```sql
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO tiny_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

私たちは、`INSERT`クエリを2つ使用して、`<column>.bin`ファイル内に2つのデータブロックを作成しました。

ClickHouseはデータを選択する際に単一のストリームを使用します。その結果、出力内の行ブロックの順序は、入力内の同じブロックの順序と一致します。例えば：

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
