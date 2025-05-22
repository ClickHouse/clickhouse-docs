---
'description': 'StripeLog のドキュメント'
'slug': '/engines/table-engines/log-family/stripelog'
'toc_priority': 32
'toc_title': 'StripeLog'
'title': 'StripeLog'
---




# StripeLog

このエンジンはログエンジンのファミリーに属します。ログエンジンの一般的な特性とその違いについては、[Log Engine Family](../../../engines/table-engines/log-family/index.md)の記事を参照してください。

このエンジンは、少量のデータ（1百万行未満）で多くのテーブルを書き込む必要があるシナリオで使用します。たとえば、このテーブルは原子的な処理が必要な変換のために、着信データバッチを保存するのに使用できます。ClickHouseサーバーには100kインスタンスのこのテーブルタイプが適しており、高数のテーブルが必要な場合には[Log](./log.md)よりもこのテーブルエンジンを選択するべきです。これは読み込み効率を犠牲にします。

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

`StripeLog`エンジンは、すべてのカラムを1つのファイルに格納します。各`INSERT`クエリに対して、ClickHouseはテーブルファイルの末尾にデータブロックを追加し、カラムを1つずつ書き込みます。

各テーブルに対してClickHouseは次のファイルを作成します：

- `data.bin` — データファイル。
- `index.mrk` — マークファイル。マークには、挿入された各データブロックの各カラムのオフセットが含まれています。

`StripeLog`エンジンは`ALTER UPDATE`および`ALTER DELETE`操作をサポートしていません。

## データの読み込み {#table_engines-stripelog-reading-the-data}

マークファイルにより、ClickHouseはデータの読み込みを並列化できます。これにより、`SELECT`クエリは予測不可能な順序で行を返します。行をソートするには、`ORDER BY`句を使用します。

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
INSERT INTO stripe_log_table VALUES (now(),'REGULAR','2番目の通常メッセージ'),(now(),'WARNING','最初の警告メッセージ')
```

私たちは2つの`INSERT`クエリを使用して、`data.bin`ファイル内に2つのデータブロックを作成しました。

ClickHouseはデータ選択時に複数のスレッドを使用します。各スレッドは別々のデータブロックを読み込み、終了するたびに結果の行を独立して返します。そのため、出力の行のブロックの順序は、通常、入力の同じブロックの順序と一致しません。たとえば：

```sql
SELECT * FROM stripe_log_table
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:27:32 │ REGULAR      │ 2番目の通常メッセージ    │
│ 2019-01-18 14:34:53 │ WARNING      │ 最初の警告メッセージ      │
└─────────────────────┴──────────────┴────────────────────────────┘
┌───────────timestamp─┬─message_type─┬─message───────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ 最初の通常メッセージ      │
└─────────────────────┴──────────────┴───────────────────────────┘
```

結果のソート（デフォルトでは昇順）：

```sql
SELECT * FROM stripe_log_table ORDER BY timestamp
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ 最初の通常メッセージ      │
│ 2019-01-18 14:27:32 │ REGULAR      │ 2番目の通常メッセージ    │
│ 2019-01-18 14:34:53 │ WARNING      │ 最初の警告メッセージ      │
└─────────────────────┴──────────────┴────────────────────────────┘
```
