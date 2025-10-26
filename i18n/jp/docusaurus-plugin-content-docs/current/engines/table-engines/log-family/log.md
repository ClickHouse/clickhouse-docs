---
'description': 'Logに関するDocumentation'
'slug': '/engines/table-engines/log-family/log'
'toc_priority': 33
'toc_title': 'Log'
'title': 'ログ'
'doc_type': 'reference'
---


# Log

エンジンは `Log` エンジンのファミリーに属します。`Log` エンジンの一般的なプロパティとその違いについては、[Log Engine Family](../../../engines/table-engines/log-family/index.md)の記事を参照してください。

`Log` は、[TinyLog](../../../engines/table-engines/log-family/tinylog.md) とは異なり、カラムファイルとともに小さな「マーク」ファイルが存在します。これらのマークは、各データブロックに書き込まれ、指定された行数をスキップするためにファイルを読み始めるオフセットを含んでいます。これにより、テーブルデータを複数のスレッドで読み取ることが可能になります。
同時データアクセスのため、読み取り操作は同時に実行できますが、書き込み操作は読み取りと互いをブロックします。
`Log` エンジンはインデックスをサポートしていません。同様に、テーブルへの書き込みが失敗した場合、そのテーブルは壊れ、読み取り時にエラーが返されます。`Log` エンジンは、一時的なデータや一度書き込み専用のテーブル、テストやデモ目的に適しています。

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

`Log` エンジンは、各カラムをそれぞれのファイルに書き込むことで効率的にデータを保存します。各テーブルについて、Log エンジンは指定されたストレージパスに以下のファイルを書き込みます：

- `<column>.bin`: 各カラムのデータファイルで、シリアライズおよび圧縮されたデータが含まれています。
`__marks.mrk`: マークファイルで、挿入された各データブロックのオフセットと行数を保存しています。マークは、エンジンが読み取り時に無関係なデータブロックをスキップできるようにすることで、効率的なクエリ実行を促進します。

### 書き込みプロセス {#writing-process}

`Log` テーブルにデータが書き込まれるとき：

1.    データはブロックにシリアライズされ、圧縮されます。
2.    各カラムについて、圧縮されたデータがそれぞれの `<column>.bin` ファイルに追加されます。
3.    新しく挿入されたデータのオフセットと行数を記録するために、`__marks.mrk` ファイルに対応するエントリが追加されます。

## データの読み取り {#table_engines-log-reading-the-data}

マークファイルにより、ClickHouseはデータの読み取りを並行処理できます。これは、`SELECT` クエリが行を予測不可能な順序で返すことを意味します。行をソートするには、`ORDER BY` 句を使用してください。

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

私たちは、`<column>.bin` ファイル内に2つのデータブロックを作成するために、2つの `INSERT` クエリを使用しました。

ClickHouseは、データを選択する際に複数のスレッドを使用します。各スレッドが別々のデータブロックを読み取り、完了次第に結果行を独立して返します。その結果、出力の行ブロックの順序は、入力の同じブロックの順序と一致しない可能性があります。例えば：

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

結果をソートする（デフォルトで昇順）：

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
