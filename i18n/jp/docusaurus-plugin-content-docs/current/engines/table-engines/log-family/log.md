---
description: 'Log テーブルエンジンのドキュメント'
slug: /engines/table-engines/log-family/log
toc_priority: 33
toc_title: 'Log'
title: 'Log テーブルエンジン'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Log テーブルエンジン {#log-table-engine}

<CloudNotSupportedBadge/>

このエンジンは `Log` エンジンファミリーに属します。`Log` エンジンの共通の特性や相違点については、[Log エンジンファミリー](../../../engines/table-engines/log-family/index.md) の記事を参照してください。

`Log` は [TinyLog](../../../engines/table-engines/log-family/tinylog.md) と異なり、カラムファイルに付随して小さな「マーク」ファイルを持ちます。これらのマークは各データブロックごとに書き込まれ、指定された行数をスキップするためにファイルのどこから読み始めるべきかを示すオフセットを含みます。これにより、テーブルデータを複数スレッドで読み取ることが可能になります。
同時データアクセスを可能にするために、読み取り操作は同時に実行できますが、書き込み操作は読み取りおよび他の書き込みをブロックします。
`Log` エンジンはインデックスをサポートしません。また、テーブルへの書き込みが失敗した場合、そのテーブルは破損し、それ以降の読み取りはエラーを返します。`Log` エンジンは、一時データ、書き込み一度きりのテーブル、およびテストやデモ目的に適しています。

## テーブルを作成する {#table_engines-log-creating-a-table}

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

`Log` エンジンは、各列を個別のファイルに書き込むことで効率的にデータを保存します。各テーブルに対して、Log エンジンは指定されたストレージパスに次のファイルを書き出します。

- `<column>.bin`: 各列用のデータファイルで、シリアル化および圧縮されたデータを格納します。
- `__marks.mrk`: 各挿入データブロックのオフセットと行数を保持するマークファイルです。マークは、読み取り時に不要なデータブロックをスキップできるようにすることで、クエリ実行を効率化するために使用されます。

### 書き込みプロセス {#writing-process}

データが `Log` テーブルに書き込まれるとき:

1. データはブロック単位でシリアル化および圧縮されます。
2. 各列について、圧縮されたデータが対応する `<column>.bin` ファイルに追記されます。
3. 新しく挿入されたデータのオフセットと行数を記録するために、対応するエントリが `__marks.mrk` ファイルに追加されます。

## データの読み取り {#table_engines-log-reading-the-data}

マークファイルにより、ClickHouse はデータの読み取りを並列化できます。つまり、`SELECT` クエリが行を返す順序は保証されません。行を並べ替えるには、`ORDER BY` 句を使用します。

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

`<column>.bin` ファイル内に 2 つのデータブロックを作成するために、2 つの `INSERT` クエリを使用しました。

ClickHouse はデータを読み出す際に複数スレッドを使用します。各スレッドは別々のデータブロックを読み取り、処理が完了したものからそれぞれ独立して行を返します。その結果、出力における行ブロックの順序が、入力の同じブロックの順序と一致しない場合があります。たとえば、次のようになります。

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

結果の並べ替え（デフォルトは昇順）:

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
