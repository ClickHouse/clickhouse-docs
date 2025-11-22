---
description: 'StripeLog テーブルエンジンに関するドキュメント'
slug: /engines/table-engines/log-family/stripelog
toc_priority: 32
toc_title: 'StripeLog'
title: 'StripeLog テーブルエンジン'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# StripeLog テーブルエンジン

<CloudNotSupportedBadge/>

このエンジンは Log エンジンファミリーに属します。Log エンジンの共通の特性とそれぞれの違いについては、[Log Engine Family](../../../engines/table-engines/log-family/index.md) の記事を参照してください。

このエンジンは、少量のデータ（1,000,000 行未満）を持つ多数のテーブルに書き込む必要がある場合に使用します。たとえば、このテーブルは、各バッチをアトミックに処理する必要がある変換前の受信データバッチを保存するために使用できます。このテーブル型のインスタンスを最大 10 万個まで ClickHouse サーバー上で運用可能です。多数のテーブルが必要な場合、このテーブルエンジンは [Log](./log.md) よりも優先して使用すべきです。ただし、その代わりに読み取り効率は低下します。



## テーブルの作成 {#table_engines-stripelog-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = StripeLog
```

[CREATE TABLE](/sql-reference/statements/create/table)クエリの詳細については、こちらを参照してください。


## データの書き込み {#table_engines-stripelog-writing-the-data}

`StripeLog`エンジンは、すべてのカラムを1つのファイルに格納します。各`INSERT`クエリごとに、ClickHouseはデータブロックをテーブルファイルの末尾に追加し、カラムを順番に書き込みます。

各テーブルに対して、ClickHouseは以下のファイルを書き込みます:

- `data.bin` — データファイル。
- `index.mrk` — マークファイル。マークには、挿入された各データブロックの各カラムに対するオフセットが含まれます。

`StripeLog`エンジンは、`ALTER UPDATE`および`ALTER DELETE`操作をサポートしていません。


## データの読み取り {#table_engines-stripelog-reading-the-data}

マークファイルにより、ClickHouseはデータの読み取りを並列化できます。そのため、`SELECT`クエリは予測不可能な順序で行を返します。行をソートするには`ORDER BY`句を使用してください。


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

ClickHouseはデータを選択する際に複数のスレッドを使用します。各スレッドは個別のデータブロックを読み取り、完了すると独立して結果行を返します。その結果、ほとんどの場合、出力における行ブロックの順序は入力における同じブロックの順序と一致しません。例:

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

結果のソート(デフォルトでは昇順):

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
