---
description: 'Logのドキュメント'
slug: '/engines/table-engines/log-family/log'
toc_priority: 33
toc_title: 'Log'
title: 'Log'
---




# Log

このエンジンは `Log` エンジンファミリーに属しています。 `Log` エンジンの一般的なプロパティと、[Log Engine Family](../../../engines/table-engines/log-family/index.md) 記事におけるその違いを参照してください。

`Log` は、[TinyLog](../../../engines/table-engines/log-family/tinylog.md) と異なり、カラムファイルと共に小さなファイルの「マーク」が存在します。これらのマークは各データブロックに書き込まれ、指定された行数をスキップするためにファイルを読み始めるオフセットを含んでいます。これにより、複数のスレッドでテーブルデータを読み取ることが可能になります。
同時データアクセスの場合、読み取り操作は同時に行うことができ、書き込み操作は読み取りや他の書き込みをブロックします。
`Log` エンジンはインデックスをサポートしていません。同様に、テーブルへの書き込みが失敗した場合、テーブルは壊れ、そこからの読み取りはエラーを返します。`Log` エンジンは、一時的データ、一度書き込みテーブル、またはテストやデモ目的に適しています。

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

`Log` エンジンは、各カラムをそれぞれのファイルに書き込むことによってデータを効率的に格納します。各テーブルについて、Log エンジンは指定されたストレージパスに次のファイルを作成します：

- `<column>.bin`: 各カラムのデータファイルで、シリアライズされた圧縮データを含んでいます。
`__marks.mrk`: 各データブロックに挿入されたオフセットと行数を格納するマークファイルです。マークは、エンジンが不必要なデータブロックをスキップして効率的にクエリを実行できるようにするために使用されます。

### 書き込みプロセス {#writing-process}

`Log` テーブルにデータが書き込まれる際は、次の手順が行われます：

1. データがブロックにシリアライズされて圧縮されます。
2. 各カラムについて、圧縮データがそれぞれの `<column>.bin` ファイルに追加されます。
3. 新しく挿入されたデータのオフセットと行数を記録するために、`__marks.mrk` ファイルに対応するエントリが追加されます。

## データの読み取り {#table_engines-log-reading-the-data}

マークのあるファイルにより、ClickHouse はデータの並行読み取りを実現します。つまり、`SELECT` クエリは予測できない順序で行を返します。`ORDER BY` 句を使用して行をソートしてください。

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
INSERT INTO log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

私たちは二つの `INSERT` クエリを使用して、`<column>.bin` ファイル内に二つのデータブロックを作成しました。

ClickHouse は、データを選択する際に複数のスレッドを使用します。各スレッドが独立して結果行を返すため、出力の行のブロックの順序は、入力の同じブロックの順序と一致しない場合があります。例：

```sql
SELECT * FROM log_table
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

結果をソートする（デフォルトでは昇順）：

```sql
SELECT * FROM log_table ORDER BY timestamp
```

```text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message  │
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
