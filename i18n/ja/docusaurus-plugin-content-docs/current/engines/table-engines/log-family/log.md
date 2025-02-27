---
slug: /engines/table-engines/log-family/log
toc_priority: 33
toc_title: Log
---

# Log

このエンジンは `Log` エンジンのファミリーに属します。`Log` エンジンの共通の特性とその違いについては、[Log Engine Family](../../../engines/table-engines/log-family/index.md)の記事を参照してください。

`Log`は、[TinyLog](../../../engines/table-engines/log-family/tinylog.md)とは異なり、カラムファイルと共に小さい「マーク」のファイルが存在します。これらのマークは、各データブロックごとに書き込まれ、指定された行数をスキップするためにファイルを読み始める位置を示すオフセットを含んでいます。これにより、テーブルデータを複数のスレッドで読み取ることが可能になります。
同時データアクセスの場合、読み取り操作は同時に実行でき、書き込み操作は読み取りや他の書き込みをブロックします。
`Log` エンジンはインデックスをサポートしていません。同様に、テーブルへの書き込みが失敗した場合、そのテーブルは壊れ、読み取り時にエラーが返されます。`Log`エンジンは、一時的なデータ、書き込み専用テーブル、そしてテストやデモ目的に適しています。

## テーブルの作成 {#table_engines-log-creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Log
```

[CREATE TABLE](../../../sql-reference/statements/create/table.md#create-table-query)クエリの詳細な説明を参照してください。

## データの書き込み {#table_engines-log-writing-the-data}

`Log`エンジンは、各カラムをそれぞれのファイルに書き込むことでデータを効率的に保存します。Logエンジンは、各テーブルについて、指定されたストレージパスに以下のファイルを書き込みます：

- `<column>.bin`: 各カラムのデータファイルで、シリアライズされ圧縮されたデータが含まれています。
`__marks.mrk`: マークファイルで、挿入された各データブロックのオフセットと行数を記録しています。マークは、読み取り時にエンジンが無関係なデータブロックをスキップできるようにすることで、効率的なクエリ実行を促進します。

### 書き込みプロセス {#writing-process}

`Log`テーブルにデータが書き込まれるとき：

1. データがブロックにシリアライズされ、圧縮されます。
2. 各カラムについて、圧縮されたデータが各々の `<column>.bin` ファイルに追加されます。
3. 新しく挿入されたデータのオフセットと行数を記録するために、`__marks.mrk`ファイルに対応するエントリが追加されます。

## データの読み取り {#table_engines-log-reading-the-data}

マークのあるファイルにより、ClickHouseはデータの読み取りを並列化できます。これにより、`SELECT`クエリは不規則な順序で行を返します。行を並べ替えるには、`ORDER BY`句を使用してください。

## 使用例 {#table_engines-log-example-of-use}

テーブルの作成：

``` sql
CREATE TABLE log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = Log
```

データの挿入：

``` sql
INSERT INTO log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

二つの `INSERT` クエリを使用して、二つのデータブロックを `<column>.bin` ファイル内に作成しました。

ClickHouseはデータを選択する際に複数のスレッドを使用します。各スレッドは別々のデータブロックを読み取り、完了次第独立して結果を返します。その結果、出力内の行のブロックの順序は、入力内の同じブロックの順序と一致しない場合があります。例えば：

``` sql
SELECT * FROM log_table
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

結果のソート（デフォルトは昇順）：

``` sql
SELECT * FROM log_table ORDER BY timestamp
```

``` text
┌───────────timestamp─┬─message_type─┬─message────────────────────┐
│ 2019-01-18 14:23:43 │ REGULAR      │ The first regular message  │
│ 2019-01-18 14:27:32 │ REGULAR      │ The second regular message │
│ 2019-01-18 14:34:53 │ WARNING      │ The first warning message  │
└─────────────────────┴──────────────┴────────────────────────────┘
```
