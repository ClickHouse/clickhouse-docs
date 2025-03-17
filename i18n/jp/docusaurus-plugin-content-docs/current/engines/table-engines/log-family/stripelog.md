---
slug: /engines/table-engines/log-family/stripelog
toc_priority: 32
toc_title: StripeLog
---


# StripeLog

このエンジンはログエンジンのファミリーに属します。ログエンジンの一般的な特性およびその違いについては、[Log Engine Family](../../../engines/table-engines/log-family/index.md)の記事を参照してください。

このエンジンは、少量のデータ（100万行未満）を持つ多くのテーブルを書き込む必要があるシナリオで使用してください。たとえば、このテーブルは、原子的な処理が必要な変換のための受信データバッチを保存するために使用できます。このテーブルタイプの100kインスタンスは、ClickHouseサーバーで使用可能です。多数のテーブルが必要な場合は、[Log](./log.md)よりもこのテーブルエンジンを選択するべきです。これは読み取り効率の低下を伴います。

## テーブルの作成 {#table_engines-stripelog-creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = StripeLog
```

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細な説明を参照してください。

## データの書き込み {#table_engines-stripelog-writing-the-data}

`StripeLog`エンジンはすべてのカラムを1つのファイルに保存します。各`INSERT`クエリに対して、ClickHouseはデータブロックをテーブルファイルの末尾に追加し、カラムを1つずつ書き込みます。

ClickHouseは各テーブルについてファイルを次のように書き込みます：

- `data.bin` — データファイル。
- `index.mrk` — マーク付きファイル。マークには、挿入された各データブロックの各カラムのオフセットが含まれます。

`StripeLog`エンジンは `ALTER UPDATE` および `ALTER DELETE` 操作をサポートしていません。

## データの読み取り {#table_engines-stripelog-reading-the-data}

マーク付きファイルにより、ClickHouseはデータの読み取りを並行化することができます。これは、`SELECT`クエリが予測不可能な順序で行を返すことを意味します。行をソートするには、`ORDER BY`句を使用してください。

## 使用例 {#table_engines-stripelog-example-of-use}

テーブルの作成：

``` sql
CREATE TABLE stripe_log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = StripeLog
```

データの挿入：

``` sql
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

2つの`INSERT`クエリを使用して、`data.bin`ファイル内に2つのデータブロックを作成しました。

ClickHouseはデータを選択する際に複数のスレッドを使用します。各スレッドは別々のデータブロックを読み取り、完了次第結果の行を独立して返します。その結果、出力の行のブロックの順序は、ほとんどの場合、入力の同じブロックの順序とは一致しません。たとえば：

``` sql
SELECT * FROM stripe_log_table
```

``` text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
┌───────────timestamp─┬─message_type─┬─message───────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message │
└─────────────────────┴──────────────┴───────────────────────────┘
```

結果をソートする（デフォルトで昇順）：

``` sql
SELECT * FROM stripe_log_table ORDER BY timestamp
```

``` text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message  │
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
