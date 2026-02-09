---
description: 'StripeLog テーブルエンジンに関するドキュメント'
slug: /engines/table-engines/log-family/stripelog
toc_priority: 32
toc_title: 'StripeLog'
title: 'StripeLog テーブルエンジン'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# StripeLog テーブルエンジン \{#stripelog-table-engine\}

<CloudNotSupportedBadge/>

このエンジンは Log エンジンファミリーに属します。Log エンジンの共通の特性と相違点については、[Log Engine Family](../../../engines/table-engines/log-family/index.md) の記事を参照してください。

このエンジンは、少量のデータ（100 万行未満）を持つ多数のテーブルに書き込む必要があるシナリオで使用します。たとえば、このテーブルは、変換のために取り込まれるデータバッチを、各バッチをアトミックに処理する必要がある場合の保存先として使用できます。このテーブルタイプのインスタンスを最大 10 万個まで ClickHouse サーバー上で運用できます。多数のテーブルが必要な場合、このテーブルエンジンは [Log](./log.md) よりも優先して使用すべきです。ただし、その分読み取り効率は低下します。

## テーブルの作成 \{#table_engines-stripelog-creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = StripeLog
```

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細な説明をご覧ください。

## データの書き込み \{#table_engines-stripelog-writing-the-data\}

`StripeLog` エンジンは、すべてのカラムを 1 つのファイルに保存します。各 `INSERT` クエリのたびに、ClickHouse はデータブロックをテーブルファイルの末尾に追記し、カラムを 1 つずつ書き込みます。

各テーブルについて、ClickHouse は次のファイルを書き込みます：

- `data.bin` — データファイル。
- `index.mrk` — マークを格納するファイル。マークには、挿入された各データブロックにおける各カラムのオフセットが含まれます。

`StripeLog` エンジンは `ALTER UPDATE` および `ALTER DELETE` 操作をサポートしません。

## データの読み取り \{#table_engines-stripelog-reading-the-data\}

マーク付きファイルにより、ClickHouse はデータの読み取りを並列化できます。これにより、`SELECT` クエリは行を不定の順序で返します。行をソートするには、`ORDER BY` 句を使用してください。

## 使用例 \{#table_engines-stripelog-example-of-use\}

テーブルを作成：

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

2つの `INSERT` クエリを使用して、`data.bin` ファイル内に2つのデータブロックを作成しました。

ClickHouse はデータを選択する際に複数スレッドを使用します。各スレッドは別々のデータブロックを読み取り、処理が完了し次第、それぞれ独立して結果行を返します。その結果、出力される行ブロックの順序は、ほとんどの場合、入力時の同じブロックの順序と一致しません。例えば次のようになります。

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

結果の並べ替え（デフォルトは昇順）：

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
