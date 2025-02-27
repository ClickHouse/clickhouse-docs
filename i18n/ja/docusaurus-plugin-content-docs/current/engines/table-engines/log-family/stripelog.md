---
slug: /engines/table-engines/log-family/stripelog
toc_priority: 32
toc_title: StripeLog
---

# StripeLog

このエンジンはログエンジンのファミリーに属します。ログエンジンの共通特性とその違いについては、[ログエンジンファミリー](../../../engines/table-engines/log-family/index.md)の記事を参照してください。

このエンジンは、データの量が少ない（1百万行未満）多くのテーブルを書き込む必要があるシナリオで使用します。たとえば、このテーブルは、アトミックな処理が必要な変換のためにインポートされるデータバッチを保存するために使用できます。このタイプのテーブルは、ClickHouseサーバー上で100kインスタンスまで実行可能です。多数のテーブルが必要な場合は、[Log](./log.md)よりもこのテーブルエンジンを選択すべきです。これは、読み取り効率を犠牲にします。

## テーブルの作成 {#table_engines-stripelog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = StripeLog
```

[CREATE TABLE](../../../sql-reference/statements/create/table.md#create-table-query)クエリの詳細な説明を参照してください。

## データの書き込み {#table_engines-stripelog-writing-the-data}

`StripeLog`エンジンは、すべてのカラムを1つのファイルに保存します。各`INSERT`クエリに対して、ClickHouseはテーブルファイルの末尾にデータブロックを追加し、カラムを1つずつ書き込みます。

Each table for ClickHouse writes the files:

- `data.bin` — データファイル。
- `index.mrk` — マーク付きファイル。マークには、挿入された各データブロックの各カラムのオフセットが含まれます。

`StripeLog`エンジンは、`ALTER UPDATE`および`ALTER DELETE`操作をサポートしていません。

## データの読み込み {#table_engines-stripelog-reading-the-data}

マーク付きファイルは、ClickHouseがデータの読み取りを並列化できるようにします。これは、`SELECT`クエリが行を予測不可能な順序で返すことを意味します。行をソートするには、`ORDER BY`句を使用してください。

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

`data.bin`ファイル内に2つのデータブロックを作成するために、2つの`INSERT`クエリを使用しました。

ClickHouseはデータ選択時に複数のスレッドを使用します。各スレッドは別々のデータブロックを読み込み、結果行を独立して返します。その結果、出力の行ブロックの順序はほとんどの場合、入力の同じブロックの順序と一致しません。たとえば:

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

結果をソートする（デフォルトでは昇順）:

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
