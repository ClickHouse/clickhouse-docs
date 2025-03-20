---
slug: /engines/table-engines/log-family/log
toc_priority: 33
toc_title: Log
---


# Log

このエンジンは `Log`エンジンのファミリーに属します。 `Log`エンジンの一般的なプロパティや、[Log Engine Family](../../../engines/table-engines/log-family/index.md)の記事での違いについて確認してください。

`Log`は、[TinyLog](../../../engines/table-engines/log-family/tinylog.md)とは異なり、カラムファイルとともに小さな「マーク」ファイルを持ちます。これらのマークは各データブロックに書き込まれ、スキップする行数を指定するためにファイルのどこから読み始めるかを示すオフセットが含まれています。これにより、複数のスレッドでテーブルデータを読み取ることが可能になります。
同時データアクセスのために、読み取り操作は同時に実行されることができますが、書き込み操作は読み取りと互いにブロックします。
`Log`エンジンはインデックスをサポートしていません。同様に、テーブルへの書き込みが失敗した場合、テーブルは破損し、そこからの読み取りはエラーを返します。`Log`エンジンは、一時的なデータ、書き込み専用テーブル、テストやデモ目的に適しています。

## テーブルの作成 {#table_engines-log-creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    column1_name [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    column2_name [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Log
```

[CREATE TABLE](/sql-reference/statements/create/table)クエリの詳細な説明を参照してください。

## データの書き込み {#table_engines-log-writing-the-data}

`Log`エンジンは、各カラムをそれぞれのファイルに書き込むことによってデータを効率的に保存します。各テーブルに対して、Logエンジンは指定されたストレージパスに以下のファイルを作成します。

- `<column>.bin`: 各カラムのデータファイルで、シリアライズされ圧縮されたデータを含みます。
- `__marks.mrk`: マークファイルで、挿入された各データブロックのオフセットと行数を記録します。マークは、エンジンが読み取り中に無関係なデータブロックをスキップできるようにして、効率的なクエリ実行を促進します。

### 書き込みプロセス {#writing-process}

`Log`テーブルにデータが書き込まれると:

1. データがシリアライズされ圧縮され、ブロックにまとめられます。
2. 各カラムについて、圧縮されたデータがその対応する`<column>.bin`ファイルに追加されます。
3. 新しく挿入されたデータのオフセットと行数を記録するために、`__marks.mrk`ファイルに対応するエントリが追加されます。

## データの読み取り {#table_engines-log-reading-the-data}

マークのあるファイルにより、ClickHouseはデータの読み取りを並列化できます。これにより、`SELECT`クエリは行を予測不可能な順序で返します。行をソートするには、`ORDER BY`句を使用してください。

## 使用例 {#table_engines-log-example-of-use}

テーブルの作成:

``` sql
CREATE TABLE log_table
(
    timestamp DateTime,
    message_type String,
    message String
)
ENGINE = Log
```

データの挿入:

``` sql
INSERT INTO log_table VALUES (now(),'REGULAR','The first regular message')
INSERT INTO log_table VALUES (now(),'REGULAR','The second regular message'),(now(),'WARNING','The first warning message')
```

私たちは2つの`INSERT`クエリを使用して、`<column>.bin`ファイル内に2つのデータブロックを作成しました。

ClickHouseはデータを選択するときに複数のスレッドを使用します。各スレッドは別々のデータブロックを読み取り、終了するごとに独立して結果の行を返します。その結果、出力内の行ブロックの順序は、入力内の同じブロックの順序と一致しない場合があります。例えば:

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

結果をソートする（デフォルトでは昇順）:

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
