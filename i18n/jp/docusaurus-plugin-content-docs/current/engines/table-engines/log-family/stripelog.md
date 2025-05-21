---
description: 'StripeLogのドキュメント'
slug: /engines/table-engines/log-family/stripelog
toc_priority: 32
toc_title: 'StripeLog'
title: 'StripeLog'
---


# StripeLog

このエンジンはログエンジンのファミリーに属しています。ログエンジンの共通プロパティとその違いについては、[Log Engine Family](../../../engines/table-engines/log-family/index.md)の記事を参照してください。

このエンジンは、少量のデータ（1百万行未満）を持つ多数のテーブルを作成する必要があるシナリオで使用します。例えば、このテーブルは、原子的な処理が必要な変換のための入力データバッチを格納するために使用できます。このテーブルタイプのインスタンスを10万個作成することが可能です。このテーブルエンジンは、大量のテーブルが必要な場合に[Log](./log.md)よりも優先されるべきですが、その分読み取り効率は犠牲になります。

## テーブルの作成 {#table_engines-stripelog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = StripeLog
```

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細な説明を参照してください。

## データの書き込み {#table_engines-stripelog-writing-the-data}

`StripeLog`エンジンは、すべてのカラムを1つのファイルに格納します。各`INSERT`クエリについて、ClickHouseはテーブルファイルの末尾にデータブロックを追加し、カラムを1つずつ書き込みます。

ClickHouseは各テーブルに対して以下のファイルを書き込みます：

- `data.bin` — データファイル。
- `index.mrk` — マークファイル。マークには、挿入された各データブロックの各カラムのオフセットが含まれています。

`StripeLog`エンジンは、`ALTER UPDATE`および`ALTER DELETE`操作をサポートしていません。

## データの読み込み {#table_engines-stripelog-reading-the-data}

マークファイルにより、ClickHouseはデータの並列読取を可能にします。これは、`SELECT`クエリが行を予測不可能な順序で返すことを意味します。行をソートするには、`ORDER BY`句を使用してください。

## 使用例 {#table_engines-stripelog-example-of-use}

テーブルの作成：

```sql
CREATE TABLE stripe_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = StripeLog
```

データの挿入：

```sql
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','最初の通常メッセージ')
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','2つ目の通常メッセージ'),(now(),'WARNING','最初の警告メッセージ')
```

私たちは2つの`INSERT`クエリを使用して、`data.bin`ファイルの中に2つのデータブロックを作成しました。

ClickHouseはデータを選択する際に複数のスレッドを使用します。各スレッドは別々のデータブロックを読み込み、終了次第独立して結果の行を返します。結果として、出力中の行のブロックの順序は、大抵の場合、入力中の同じブロックの順序と一致しません。例えば：

```sql
SELECT * FROM stripe_log_table
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:27:32 │ REGULAR      │ 2つ目の通常メッセージ     │
│ 2019-01-18 14:34:53 │ WARNING      │ 最初の警告メッセージ      │
└─────────────────────┴──────────────┴────────────────────────────┘
┌───────────timestamp─┬─message_type─┬─message───────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ 最初の通常メッセージ      │
└─────────────────────┴──────────────┴───────────────────────────┘
```

結果をソートする（デフォルトで昇順）：

```sql
SELECT * FROM stripe_log_table ORDER BY timestamp
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ 最初の通常メッセージ      │
│ 2019-01-18 14:27:32 │ REGULAR      │ 2つ目の通常メッセージ     │
│ 2019-01-18 14:34:53 │ WARNING      │ 最初の警告メッセージ      │
└─────────────────────┴──────────────┴────────────────────────────┘
```
