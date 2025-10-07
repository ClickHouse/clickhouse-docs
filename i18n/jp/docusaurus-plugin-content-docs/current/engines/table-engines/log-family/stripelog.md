---
'description': 'StripeLog に関するドキュメント'
'slug': '/engines/table-engines/log-family/stripelog'
'toc_priority': 32
'toc_title': 'StripeLog'
'title': 'StripeLog'
'doc_type': 'reference'
---


# StripeLog

このエンジンはログエンジンのファミリーに属しています。ログエンジンの一般的な特性とその違いについては、[Log Engine Family](../../../engines/table-engines/log-family/index.md)の記事を参照してください。

このエンジンは、少量のデータ（1百万行未満）を持つ多数のテーブルを書き込む必要があるシナリオで使用します。例えば、これは変換のために必要な原子的処理のために受信データバッチを格納するテーブルとして使用できます。このテーブルタイプの100kインスタンスは、ClickHouseサーバーにとって妥当です。このテーブルエンジンは、高数のテーブルが必要な場合に[Log](./log.md)よりも優先されるべきです。これは読み取り効率が犠牲になることを意味します。

## テーブルの作成 {#table_engines-stripelog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = StripeLog
```

[CREATE TABLE](/sql-reference/statements/create/table)クエリの詳細な説明を参照してください。

## データの書き込み {#table_engines-stripelog-writing-the-data}

`StripeLog`エンジンはすべてのカラムを1つのファイルに格納します。各`INSERT`クエリに対して、ClickHouseはデータブロックをテーブルファイルの末尾に追加し、カラムを1つずつ書き込みます。

各テーブルに対して、ClickHouseは次のファイルを書き込みます。

- `data.bin` — データファイル。
- `index.mrk` — マーク付きファイル。マークは挿入された各データブロックの各カラムのオフセットを含みます。

`StripeLog`エンジンは`ALTER UPDATE`および`ALTER DELETE`操作をサポートしていません。

## データの読み取り {#table_engines-stripelog-reading-the-data}

マーク付きファイルにより、ClickHouseはデータの読み取りを並列化できます。これは、`SELECT`クエリが行を予測不可能な順序で返すことを意味します。行をソートするには、`ORDER BY`句を使用してください。

## 使用例 {#table_engines-stripelog-example-of-use}

テーブルの作成:

```sql
CREATE TABLE stripe_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = StripeLog
```

データの挿入:

```sql
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

2つの`INSERT`クエリを使用して、`data.bin`ファイル内に2つのデータブロックを作成しました。

ClickHouseはデータを選択する際に複数のスレッドを使用します。各スレッドは別々のデータブロックを読み込み、結果の行を独立して返します。そのため、出力における行ブロックの順序は、ほとんどの場合、入力における同じブロックの順序とは一致しません。例えば:

```sql
SELECT * FROM stripe_log_table
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
┌───────────timestamp─┬─message_type─┬─message───────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message │
└─────────────────────┴──────────────┴───────────────────────────┘
```

結果をソートする（デフォルトは昇順）:

```sql
SELECT * FROM stripe_log_table ORDER BY timestamp
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message  │
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
