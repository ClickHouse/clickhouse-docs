---
description: 'ログのドキュメント'
slug: /engines/table-engines/log-family/log
toc_priority: 33
toc_title: 'ログ'
title: 'ログ'
---


# ログ

このエンジンは `Log` エンジンファミリーに属しています。`Log` エンジンの一般的なプロパティとそれらの違いについては、[Log Engine Family](../../../engines/table-engines/log-family/index.md) の記事をご覧ください。

`Log` は [TinyLog](../../../engines/table-engines/log-family/tinylog.md) と異なり、カラムファイルと共に小さな「マーク」ファイルが存在します。これらのマークは、データブロックごとに書き込まれ、指定された行数をスキップするためにファイルのどこから読み始めるかを示すオフセットを含んでいます。これにより、テーブルデータを複数のスレッドで読み取ることが可能になります。
同時データアクセスのために、読み取り操作は同時に実行できますが、書き込み操作は読み取りとお互いをブロックします。
`Log` エンジンはインデックスをサポートしていません。同様に、テーブルへの書き込みが失敗した場合、テーブルは壊れ、そこからの読み取りはエラーを返します。`Log` エンジンは、一時データ、書き込み専用テーブル、テストやデモンストレーション目的に適しています。

## テーブルの作成 {#table_engines-log-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Log
```

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細な説明を参照してください。

## データの書き込み {#table_engines-log-writing-the-data}

`Log` エンジンは、各カラムをそれぞれのファイルに書き込むことでデータを効率的に保存します。各テーブルについて、Log エンジンは指定されたストレージパスに以下のファイルを書き込みます：

- `<column>.bin`: 各カラムのデータファイルで、シリアライズされ圧縮されたデータを含みます。
- `__marks.mrk`: マークファイルで、挿入された各データブロックのオフセットと行数を記録します。マークは、エンジンが読み取り中に無関係なデータブロックをスキップすることで効率的なクエリ実行を促進します。

### 書き込みプロセス {#writing-process}

`Log` テーブルにデータが書き込まれると：

1. データはブロックにシリアライズおよび圧縮されます。
2. 各カラムについて、圧縮されたデータがそれぞれの `<column>.bin` ファイルに追加されます。
3. 新たに挿入されたデータのオフセットと行数を記録するために、`__marks.mrk` ファイルに対応するエントリが追加されます。

## データの読み取り {#table_engines-log-reading-the-data}

マークファイルにより、ClickHouseはデータの読み取りを並列化できます。つまり、`SELECT` クエリは予測不可能な順序で行を返します。行をソートするには `ORDER BY` 句を使用してください。

## 使用例 {#table_engines-log-example-of-use}

テーブルの作成：

```sql
CREATE TABLE log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = Log
```

データの挿入：

```sql
INSERT INTO log_table VALUES (now(),'REGULAR','最初の通常メッセージ')
INSERT INTO log_table VALUES (now(),'REGULAR','2番目の通常メッセージ'),(now(),'WARNING','最初の警告メッセージ')
```

私たちは、2つの `INSERT` クエリを使用して、`<column>.bin` ファイル内に2つのデータブロックを作成しました。

ClickHouseはデータを選択する際に複数のスレッドを使用します。各スレッドは別々のデータブロックを読み取り、完了次第独立して結果の行を返します。その結果、出力の行ブロックの順序は、入力の同じブロックの順序と一致しないことがあります。例えば：

```sql
SELECT * FROM log_table
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
SELECT * FROM log_table ORDER BY timestamp
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ 最初の通常メッセージ      │
│ 2019-01-18 14:27:32 │ REGULAR      │ 2番目の通常メッセージ    │
│ 2019-01-18 14:34:53 │ WARNING      │ 最初の警告メッセージ      │
└─────────────────────┴──────────────┴────────────────────────────┘
```
