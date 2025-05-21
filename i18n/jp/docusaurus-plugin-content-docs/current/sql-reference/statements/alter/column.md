description: 'カラムに関するドキュメント'
sidebar_label: 'カラム'
sidebar_position: 37
slug: /sql-reference/statements/alter/column
title: 'カラムの操作'
```

カラムの構造を変更するためのクエリのセットです。

構文:

```sql
ALTER [TEMPORARY] TABLE [db].name [ON CLUSTER cluster] ADD|DROP|RENAME|CLEAR|COMMENT|{MODIFY|ALTER}|MATERIALIZE COLUMN ...
```

クエリでは、カンマ区切りの1つ以上のアクションのリストを指定します。各アクションはカラムに対する操作です。

サポートされているアクションは次のとおりです：

- [ADD COLUMN](#add-column) — テーブルに新しいカラムを追加します。
- [DROP COLUMN](#drop-column) — カラムを削除します。
- [RENAME COLUMN](#rename-column) — 既存のカラムの名前を変更します。
- [CLEAR COLUMN](#clear-column) — カラムの値をリセットします。
- [COMMENT COLUMN](#comment-column) — カラムにテキストコメントを追加します。
- [MODIFY COLUMN](#modify-column) — カラムの型、デフォルト式、TTL、カラムの設定を変更します。
- [MODIFY COLUMN REMOVE](#modify-column-remove) — カラムのプロパティの1つを削除します。
- [MODIFY COLUMN MODIFY SETTING](#modify-column-modify-setting) - カラムの設定を変更します。
- [MODIFY COLUMN RESET SETTING](#modify-column-reset-setting) - カラムの設定をリセットします。
- [MATERIALIZE COLUMN](#materialize-column) — 欠落しているカラムのデータをパーツで具現化します。
これらのアクションについては、以下で詳細に説明します。

## ADD COLUMN {#add-column}

```sql
ADD COLUMN [IF NOT EXISTS] name [type] [default_expr] [codec] [AFTER name_after | FIRST]
```

指定された `name`、`type`、[`codec`](../create/table.md/#column_compression_codec) および `default_expr` を持つ新しいカラムをテーブルに追加します（[デフォルト式](/sql-reference/statements/create/table#default_values)のセクションを参照）。

`IF NOT EXISTS` 句が含まれれば、カラムが既に存在する場合でもエラーは返されません。 `AFTER name_after` （他のカラムの名前）を指定すれば、そのカラムのリストの後にカラムが追加されます。テーブルの最初にカラムを追加したい場合は、 `FIRST` 句を使用します。さもなければ、カラムはテーブルの最後に追加されます。アクションのチェーンの場合、 `name_after` は以前のアクションで追加されたカラムの名前である可能性があります。

カラムを追加することは、テーブルの構造を変更するだけであり、データに対しては何も実行しません。 `ALTER` の後、データはディスクには表示されません。テーブルから読み取る際にカラムのデータが不足している場合、デフォルト値で埋められます（デフォルト式がある場合はそれを実行し、そうでなければゼロや空の文字列を使用）。

このアプローチにより、古いデータのボリュームを増加させることなく、 `ALTER` クエリを即座に完了させることができます。

例:

```sql
ALTER TABLE alter_test ADD COLUMN Added1 UInt32 FIRST;
ALTER TABLE alter_test ADD COLUMN Added2 UInt32 AFTER NestedColumn;
ALTER TABLE alter_test ADD COLUMN Added3 UInt32 AFTER ToDrop;
DESC alter_test FORMAT TSV;
```

```text
Added1  UInt32
CounterID       UInt32
StartDate       Date
UserID  UInt32
VisitID UInt32
NestedColumn.A  Array(UInt8)
NestedColumn.S  Array(String)
Added2  UInt32
ToDrop  UInt32
Added3  UInt32
```

## DROP COLUMN {#drop-column}

```sql
DROP COLUMN [IF EXISTS] name
```

`name` のカラムを削除します。 `IF EXISTS` 句が指定されていれば、カラムが存在しない場合でもエラーは返されません。

ファイルシステムからデータを削除します。これは全ファイルを削除するため、このクエリはほぼ即座に完了します。

:::tip
[マテリアライズドビュー](/sql-reference/statements/create/view)によって参照されているカラムは削除できません。それ以外の場合は、エラーが返されます。
:::

例:

```sql
ALTER TABLE visits DROP COLUMN browser
```

## RENAME COLUMN {#rename-column}

```sql
RENAME COLUMN [IF EXISTS] name to new_name
```

`name` のカラムを `new_name` にリネームします。 `IF EXISTS` 句が指定された場合、カラムが存在しない場合はエラーを返しません。リネームは基になるデータを含まないため、クエリはほぼ即座に完了します。

**注意**: テーブルのキー式で指定されたカラム（ `ORDER BY` または `PRIMARY KEY` で指定されている）をリネームすることはできません。これらのカラムを変更しようとすると `SQL Error [524]` が発生します。

例:

```sql
ALTER TABLE visits RENAME COLUMN webBrowser TO browser
```

## CLEAR COLUMN {#clear-column}

```sql
CLEAR COLUMN [IF EXISTS] name IN PARTITION partition_name
```

指定されたパーティションのカラムのすべてのデータをリセットします。パーティション名の設定方法については、[パーティション式の設定方法](../alter/partition.md/#how-to-set-partition-expression)のセクションを参照してください。

`IF EXISTS` 句が指定された場合、カラムが存在しない場合でもエラーは返されません。

例:

```sql
ALTER TABLE visits CLEAR COLUMN browser IN PARTITION tuple()
```

## COMMENT COLUMN {#comment-column}

```sql
COMMENT COLUMN [IF EXISTS] name 'テキストコメント'
```

カラムにコメントを追加します。 `IF EXISTS` 句が指定された場合、カラムが存在しない場合でもエラーは返されません。

各カラムには1つのコメントを持つことができます。カラムのコメントが既に存在する場合、新しいコメントは以前のコメントを上書きします。

コメントは、[DESCRIBE TABLE](/sql-reference/statements/describe-table.md) クエリで返される `comment_expression` カラムに保存されます。

例:

```sql
ALTER TABLE visits COMMENT COLUMN browser 'このカラムはサイトにアクセスするために使用されたブラウザを示します。'
```

## MODIFY COLUMN {#modify-column}

```sql
MODIFY COLUMN [IF EXISTS] name [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
ALTER COLUMN [IF EXISTS] name TYPE [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
```

このクエリは、 `name` カラムのプロパティを変更します：

- タイプ

- デフォルト式

- 圧縮コーデック

- TTL

- カラムレベルの設定

カラムの圧縮CODECS変更の例については、[カラム圧縮コーデックス](../create/table.md/#column_compression_codec)を参照してください。

カラムのTTL変更の例については、[カラムTTL](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-column-ttl)を参照してください。

カラムレベルの設定の変更の例については、[カラムレベルの設定](/engines/table-engines/mergetree-family/mergetree.md/#column-level-settings)を参照してください。

`IF EXISTS` 句が指定された場合、カラムが存在しない場合でもエラーは返されません。

型を変更する場合、値は [toType](/sql-reference/functions/type-conversion-functions.md) 関数が適用されたかのように変換されます。デフォルト式のみが変更されている場合、クエリは複雑な処理を行うことなく、ほぼ即座に完了します。

例:

```sql
ALTER TABLE visits MODIFY COLUMN browser Array(String)
```

カラム型の変更は唯一の複雑なアクションであり、データファイルの内容を変更します。大きなテーブルの場合、時間がかかることがあります。

クエリは、 `FIRST | AFTER` 句を使用してカラムの順序を変更することもできます。これは [ADD COLUMN](#add-column) の説明を参照してください。この場合、カラム型は必須です。

例:

```sql
CREATE TABLE users (
    c1 Int16,
    c2 String
) ENGINE = MergeTree
ORDER BY c1;

DESCRIBE users;
┌─name─┬─type───┬
│ c1   │ Int16  │
│ c2   │ String │
└──────┴────────┴

ALTER TABLE users MODIFY COLUMN c2 String FIRST;

DESCRIBE users;
┌─name─┬─type───┬
│ c2   │ String │
│ c1   │ Int16  │
└──────┴────────┴

ALTER TABLE users ALTER COLUMN c2 TYPE String AFTER c1;

DESCRIBE users;
┌─name─┬─type───┬
│ c1   │ Int16  │
│ c2   │ String │
└──────┴────────┴
```

`ALTER` クエリは原子的です。MergeTree テーブルの場合、ロックが不要です。

カラムを変更するための `ALTER` クエリはレプリケートされます。指示は ZooKeeper に保存され、その後各レプリカがそれらを適用します。すべての `ALTER` クエリは同じ順序で実行されます。クエリは他のレプリカでの適切なアクションの完了を待ちます。ただし、レプリケートされたテーブルでカラムを変更するクエリは中断される可能性があり、すべてのアクションは非同期に実行されます。

## MODIFY COLUMN REMOVE {#modify-column-remove}

カラムのプロパティの1つを削除します： `DEFAULT`、`ALIAS`、`MATERIALIZED`、`CODEC`、`COMMENT`、`TTL`、`SETTINGS`。

構文:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name REMOVE property;
```

**例**

TTLを削除します：

```sql
ALTER TABLE table_with_ttl MODIFY COLUMN column_ttl REMOVE TTL;
```

**参照**

- [REMOVE TTL](ttl.md)。

## MODIFY COLUMN MODIFY SETTING {#modify-column-modify-setting}

カラムの設定を変更します。

構文:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING name=value,...;
```

**例**

カラムの `max_compress_block_size` を `1MB` に変更します：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING max_compress_block_size = 1048576;
```

## MODIFY COLUMN RESET SETTING {#modify-column-reset-setting}

カラムの設定をリセットし、テーブルの CREATE クエリのカラム式から設定宣言を削除します。

構文:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING name,...;
```

**例**

カラム設定の `max_compress_block_size` をデフォルト値にリセットします：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING max_compress_block_size;
```

## MATERIALIZE COLUMN {#materialize-column}

`DEFAULT` または `MATERIALIZED` 値式のカラムを具現化します。 `ALTER TABLE table_name ADD COLUMN column_name MATERIALIZED` を使用してマテリアライズドカラムを追加する際、既存の行には自動的にマテリアライズされた値が入力されません。 `MATERIALIZE COLUMN` ステートメントは、 `DEFAULT` または `MATERIALIZED` 式が追加または更新された後に、既存のカラムデータを再書き込みするために使用できます（これはメタデータを更新するだけで、既存のデータを変更しません）。ソートキーにカラムを具現化することは無効な操作であることに注意してください。これは [ミューテーション](/sql-reference/statements/alter/index.md#mutations) として実装されています。

新しいまたは更新された `MATERIALIZED` 値式を持つカラムでは、すべての既存の行が再書き込まれます。

新しいまたは更新された `DEFAULT` 値式を持つカラムでは、挙動は ClickHouse のバージョンによって異なります：
- ClickHouse < v24.2 では、すべての既存の行が再書き込まれます。
- ClickHouse >= v24.2 では、 `DEFAULT` 値式を持つカラムの行値が挿入時に明示的に指定されたかどうかによって、クリックハウスがそれを保持するかどうかを判断します。値が明示的に指定された場合、ClickHouse はそれをそのまま保持し、値が計算されている場合、ClickHouse は新しいまたは更新された `MATERIALIZED` 値式に変更します。

構文:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE COLUMN col [IN PARTITION partition | IN PARTITION ID 'partition_id'];
```
- PARTITION を指定した場合、そのカラムは指定されたパーティションのみで具現化されます。

**例**

```sql
DROP TABLE IF EXISTS tmp;
SET mutations_sync = 2;
CREATE TABLE tmp (x Int64) ENGINE = MergeTree() ORDER BY tuple() PARTITION BY tuple();
INSERT INTO tmp SELECT * FROM system.numbers LIMIT 5;
ALTER TABLE tmp ADD COLUMN s String MATERIALIZED toString(x);

ALTER TABLE tmp MATERIALIZE COLUMN s;

SELECT groupArray(x), groupArray(s) FROM (select x,s from tmp order by x);

┌─groupArray(x)─┬─groupArray(s)─────────┐
│ [0,1,2,3,4]   │ ['0','1','2','3','4'] │
└───────────────┴───────────────────────┘

ALTER TABLE tmp MODIFY COLUMN s String MATERIALIZED toString(round(100/x));

INSERT INTO tmp SELECT * FROM system.numbers LIMIT 5,5;

SELECT groupArray(x), groupArray(s) FROM tmp;

┌─groupArray(x)─────────┬─groupArray(s)──────────────────────────────────┐
│ [0,1,2,3,4,5,6,7,8,9] │ ['0','1','2','3','4','20','17','14','12','11'] │
└───────────────────────┴────────────────────────────────────────────────┘

ALTER TABLE tmp MATERIALIZE COLUMN s;

SELECT groupArray(x), groupArray(s) FROM tmp;

┌─groupArray(x)─────────┬─groupArray(s)─────────────────────────────────────────┐
│ [0,1,2,3,4,5,6,7,8,9] │ ['inf','100','50','33','25','20','17','14','12','11'] │
└───────────────────────┴───────────────────────────────────────────────────────┘
```

**参照**

- [MATERIALIZED](/sql-reference/statements/create/view#materialized-view)。

## 制限事項 {#limitations}

`ALTER` クエリはネストされたデータ構造内の個別要素（カラム）を作成および削除できますが、全体のネストされたデータ構造を削除することはできません。ネストされたデータ構造を追加するには、`name.nested_name` のような名前のカラムを追加し、型を `Array(T)` にすることができます。ネストされたデータ構造は、ドットの前に同じ接頭辞を持つ複数の配列カラムに相当します。

プライマリーキーやサンプリングキーに含まれるカラムの削除はサポートされていません（ `ENGINE` 式で使用されるカラム）。プライマリーキーに含まれるカラムの型を変更することは、この変更によってデータが変更されない場合に限り可能です（たとえば、Enum に値を追加したり、`DateTime` から `UInt32` に型を変更したりすることが許可されています）。

`ALTER` クエリが必要なテーブル変更を行うには不十分な場合は、新しいテーブルを作成し、[INSERT SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select) クエリを使ってデータをコピーし、その後 [RENAME](/sql-reference/statements/rename.md/#rename-table) クエリを使用してテーブルを切り替え、古いテーブルを削除できます。

`ALTER` クエリはテーブルに対するすべての読み取りおよび書き込みをブロックします。言い換えれば、長い `SELECT` が `ALTER` クエリの実行中に実行されている場合、 `ALTER` クエリはその完了を待ちます。同時に、同じテーブルへの新しいクエリは、この `ALTER` が実行されている間待機します。

データを自身で保持しないテーブル（たとえば [Merge](/sql-reference/statements/alter/index.md) および [Distributed](/sql-reference/statements/alter/index.md)）では、 `ALTER` はテーブルの構造を変更するだけで、下位テーブルの構造を変更しません。たとえば、 `Distributed` テーブルに対して ALTER を実行する場合、すべてのリモートサーバーのテーブルに対しても `ALTER` を実行する必要があります。
