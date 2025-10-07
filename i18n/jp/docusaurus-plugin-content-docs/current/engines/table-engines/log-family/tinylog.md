---
'description': 'TinyLogのドキュメント'
'slug': '/engines/table-engines/log-family/tinylog'
'toc_priority': 34
'toc_title': 'TinyLog'
'title': 'TinyLog'
'doc_type': 'reference'
---


# TinyLog

このエンジンはログエンジンファミリーに属します。ログエンジンやその違いの共通プロパティについては、[Log Engine Family](../../../engines/table-engines/log-family/index.md)を参照してください。

このテーブルエンジンは通常、書き込み一回の方法で使用されます：データを一度書き込んだ後、必要なだけ何度も読み取ります。たとえば、`TinyLog`タイプのテーブルを中間データのために使用し、小さなバッチで処理することができます。ただし、多数の小さなテーブルにデータを保存することは非効率です。

クエリは単一のストリームで実行されます。言い換えれば、このエンジンは比較的小さなテーブル（約1,000,000行まで）を対象としています。多くの小さなテーブルがある場合、このテーブルエンジンを使用することは理にかなっています。なぜなら、[Log](../../../engines/table-engines/log-family/log.md)エンジンよりも単純であり（オープンする必要のあるファイルが少ないため）、効率的だからです。

## Characteristics {#characteristics}

- **単純な構造**: Logエンジンとは異なり、TinyLogはマークファイルを使用しません。これにより複雑さは減少しますが、大規模データセットに対するパフォーマンスの最適化が制限されます。
- **単一ストリームクエリ**: TinyLogテーブル上のクエリは単一ストリームで実行されるため、通常1,000,000行までの比較的小さなテーブルに適しています。
- **小さなテーブルに対して効率的**: TinyLogエンジンのシンプルさは、多くの小さなテーブルを管理する際に有利であり、Logエンジンと比較して必要なファイル操作が少なくて済みます。

Logエンジンとは異なり、TinyLogはマークファイルを使用しません。これにより複雑さは減少しますが、大規模データセットに対するパフォーマンスの最適化が制限されます。

## テーブルの作成 {#table_engines-tinylog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = TinyLog
```

[CREATE TABLE](/sql-reference/statements/create/table)クエリの詳細な説明を参照してください。

## データの書き込み {#table_engines-tinylog-writing-the-data}

`TinyLog`エンジンはすべてのカラムを1つのファイルに保存します。各`INSERT`クエリについて、ClickHouseはテーブルファイルの最後にデータブロックを追加し、カラムを1つずつ書き込みます。

各テーブルに対してClickHouseは以下のファイルを記述します：

- `<column>.bin`: 各カラムのデータファイル。シリアライズされ圧縮されたデータが含まれます。

`TinyLog`エンジンは`ALTER UPDATE`および`ALTER DELETE`操作をサポートしていません。

## 使用例 {#table_engines-tinylog-example-of-use}

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

私たちは二つの`INSERT`クエリを使用して、`<column>.bin`ファイル内に二つのデータブロックを作成しました。

ClickHouseは単一のストリームを使用してデータを選択します。その結果、出力内の行ブロックの順序は、入力内の同じブロックの順序と一致します。たとえば：

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
