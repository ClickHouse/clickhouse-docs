---
description: 'Log のドキュメント'
slug: /engines/table-engines/log-family/log
toc_priority: 33
toc_title: 'Log'
title: 'Log テーブルエンジン'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Log テーブルエンジン

<CloudNotSupportedBadge/>

このエンジンは `Log` エンジンファミリーに属します。`Log` エンジンの共通の特性および相違点については、[Log エンジンファミリー](../../../engines/table-engines/log-family/index.md) の記事を参照してください。

`Log` は、列ファイルと一緒に小さな「マーク」ファイルを保持する点で [TinyLog](../../../engines/table-engines/log-family/tinylog.md) と異なります。これらのマークは各データブロックごとに書き込まれ、指定した行数をスキップするためにファイルのどこから読み始めるかを示すオフセットを含みます。これにより、テーブルデータを複数スレッドで読み取れます。
同時データアクセスにおいては、読み取り処理は並行して実行できますが、書き込み処理は読み取りおよび他の書き込み処理をブロックします。
`Log` エンジンはインデックスをサポートしません。また、テーブルへの書き込みが失敗した場合、そのテーブルは破損し、そのテーブルからの読み取りはエラーを返します。`Log` エンジンは、一時データ、一度だけ書き込むテーブル、テストやデモ目的に適しています。



## テーブルの作成 {#table_engines-log-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Log
```

詳細については、[CREATE TABLE](/sql-reference/statements/create/table)クエリの説明を参照してください。


## データの書き込み {#table_engines-log-writing-the-data}

`Log`エンジンは、各カラムを個別のファイルに書き込むことで、データを効率的に保存します。各テーブルに対して、Logエンジンは指定されたストレージパスに以下のファイルを書き込みます:

- `<column>.bin`: 各カラムのデータファイルで、シリアライズおよび圧縮されたデータが含まれます。
- `__marks.mrk`: マークファイルで、挿入された各データブロックのオフセットと行数を保存します。マークは、読み取り時に無関係なデータブロックをスキップできるようにすることで、効率的なクエリ実行を可能にします。

### 書き込みプロセス {#writing-process}

`Log`テーブルにデータが書き込まれる際:

1.  データはブロック単位でシリアライズおよび圧縮されます。
2.  各カラムについて、圧縮されたデータがそれぞれの`<column>.bin`ファイルに追加されます。
3.  新しく挿入されたデータのオフセットと行数を記録するために、対応するエントリが`__marks.mrk`ファイルに追加されます。


## データの読み取り {#table_engines-log-reading-the-data}

マークファイルにより、ClickHouseはデータの読み取りを並列化できます。そのため、`SELECT`クエリは予測不可能な順序で行を返します。行をソートするには、`ORDER BY`句を使用してください。


## 使用例 {#table_engines-log-example-of-use}

テーブルの作成:

```sql
CREATE TABLE log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = Log
```

データの挿入:

```sql
INSERT INTO log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

2つの`INSERT`クエリを使用して、`<column>.bin`ファイル内に2つのデータブロックを作成しました。

ClickHouseはデータを選択する際に複数のスレッドを使用します。各スレッドは個別のデータブロックを読み取り、完了すると独立して結果行を返します。その結果、出力における行ブロックの順序は、入力における同じブロックの順序と一致しない場合があります。例:

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

結果のソート(デフォルトでは昇順):

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
