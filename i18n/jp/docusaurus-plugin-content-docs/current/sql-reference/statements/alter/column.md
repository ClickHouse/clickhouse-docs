---
'description': 'Documentation for Column'
'sidebar_label': 'COLUMN'
'sidebar_position': 37
'slug': '/sql-reference/statements/alter/column'
'title': 'Column Manipulations'
---



A set of queries that allow changing the table structure.

Syntax:

```sql
ALTER [TEMPORARY] TABLE [db].name [ON CLUSTER cluster] ADD|DROP|RENAME|CLEAR|COMMENT|{MODIFY|ALTER}|MATERIALIZE COLUMN ...
```

In the query, specify a list of one or more comma-separated actions.
Each action is an operation on a column.

The following actions are supported:

- [ADD COLUMN](#add-column) — テーブルに新しいカラムを追加します。
- [DROP COLUMN](#drop-column) — カラムを削除します。
- [RENAME COLUMN](#rename-column) — 既存のカラムの名前を変更します。
- [CLEAR COLUMN](#clear-column) — カラムの値をリセットします。
- [COMMENT COLUMN](#comment-column) — カラムにテキストコメントを追加します。
- [MODIFY COLUMN](#modify-column) — カラムの型、デフォルト式、TTL、およびカラム設定を変更します。
- [MODIFY COLUMN REMOVE](#modify-column-remove) — カラムのプロパティの1つを削除します。
- [MODIFY COLUMN MODIFY SETTING](#modify-column-modify-setting) - カラム設定を変更します。
- [MODIFY COLUMN RESET SETTING](#modify-column-reset-setting) - カラム設定をリセットします。
- [MATERIALIZE COLUMN](#materialize-column) — カラムが欠落しているパーツでカラムをマテリアライズします。

これらのアクションについては、以下で詳細に説明します。

## ADD COLUMN {#add-column}

```sql
ADD COLUMN [IF NOT EXISTS] name [type] [default_expr] [codec] [AFTER name_after | FIRST]
```

指定された `name`、`type`、[`codec`](../create/table.md/#column_compression_codec) および `default_expr`（[デフォルト式](/sql-reference/statements/create/table#default_values)のセクションを参照）を使用して、テーブルに新しいカラムを追加します。

`IF NOT EXISTS` 句が含まれている場合、そのカラムがすでに存在する場合はエラーが返されません。`AFTER name_after`（他のカラムの名前）を指定した場合、指定したカラムの後にカラムが追加されます。テーブルの最初にカラムを追加したい場合は `FIRST` 句を使用します。そうでなければ、カラムはテーブルの終わりに追加されます。アクションのチェーンでは、`name_after` は前のアクションで追加されるカラムの名前であることができます。

カラムを追加することはテーブル構造を変更するだけで、データに対しては何も操作を行いません。`ALTER` の後、データはディスク上に表示されません。テーブルから読み取る際にカラムのデータが欠落している場合、それはデフォルト値で埋められます（もしデフォルト式があればそれを実行し、なければゼロまたは空文字列を使用します）。カラムはデータパーツのマージ後にディスク上に現れます（[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)を参照）。

このアプローチにより、古いデータの容量を増やすことなく `ALTER` クエリを瞬時に完了させることができます。

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

名前 `name` のカラムを削除します。`IF EXISTS` 句が指定されている場合、カラムが存在しない場合はエラーが返されません。

ファイルシステムからデータを削除します。これは全ファイルを削除するため、クエリはほぼ瞬時に完了します。

:::tip
[物化ビュー](/sql-reference/statements/create/view)によって参照されているカラムは削除できません。それ以外の場合、エラーが返されます。
:::

例:

```sql
ALTER TABLE visits DROP COLUMN browser
```

## RENAME COLUMN {#rename-column}

```sql
RENAME COLUMN [IF EXISTS] name to new_name
```

カラム `name` の名前を `new_name` に変更します。`IF EXISTS` 句が指定されている場合、カラムが存在しない場合はエラーが返されません。名前変更は基になるデータを伴わないため、クエリはほぼ瞬時に完了します。

**注意**: テーブルのキー式（`ORDER BY` または `PRIMARY KEY` として指定されたもの）で指定されたカラムはリネームできません。これらのカラムを変更しようとすると `SQL Error [524]` が発生します。

例:

```sql
ALTER TABLE visits RENAME COLUMN webBrowser TO browser
```

## CLEAR COLUMN {#clear-column}

```sql
CLEAR COLUMN [IF EXISTS] name IN PARTITION partition_name
```

指定されたパーティションのカラム内のすべてのデータをリセットします。パーティション名の設定については、[パーティション式の設定方法](../alter/partition.md/#how-to-set-partition-expression)のセクションを参照してください。

`IF EXISTS` 句が指定されている場合、カラムが存在しない場合はエラーが返されません。

例:

```sql
ALTER TABLE visits CLEAR COLUMN browser IN PARTITION tuple()
```

## COMMENT COLUMN {#comment-column}

```sql
COMMENT COLUMN [IF EXISTS] name 'Text comment'
```

カラムにコメントを追加します。`IF EXISTS` 句が指定されている場合、カラムが存在しない場合はエラーが返されません。

各カラムには1つのコメントを持つことができます。カラムにコメントが既に存在する場合、新しいコメントは前のコメントを上書きします。

コメントは [DESCRIBE TABLE](/sql-reference/statements/describe-table.md) クエリによって返される `comment_expression` カラムに保存されます。

例:

```sql
ALTER TABLE visits COMMENT COLUMN browser 'このカラムはウェブサイトにアクセスした際に使用されたブラウザを表示します。'
```

## MODIFY COLUMN {#modify-column}

```sql
MODIFY COLUMN [IF EXISTS] name [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
ALTER COLUMN [IF EXISTS] name TYPE [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
```

このクエリは `name` カラムのプロパティを変更します：

- 型

- デフォルト式

- 圧縮コーデック

- TTL

- カラムレベルの設定

カラムの圧縮 CODECS を変更する例については、[カラム圧縮コーデックス](../create/table.md/#column_compression_codec)を参照してください。

カラム TTL を変更する例については、[カラム TTL](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-column-ttl)を参照してください。

カラムレベルの設定を変更する例については、[カラムレベルの設定](/engines/table-engines/mergetree-family/mergetree.md/#column-level-settings)を参照してください。

`IF EXISTS` 句が指定されている場合、カラムが存在しない場合はエラーが返されません。

型を変更する際、値は [toType](/sql-reference/functions/type-conversion-functions.md) 関数が適用されたかのように変換されます。デフォルト式だけが変更された場合、クエリは複雑な操作を行わず、ほぼ瞬時に完了します。

例:

```sql
ALTER TABLE visits MODIFY COLUMN browser Array(String)
```

カラムの型の変更は唯一の複雑なアクションです - データを含むファイルの内容を変更します。大きなテーブルの場合、これには長い時間がかかる可能性があります。

クエリは `FIRST | AFTER` 句を使用してカラムの順序を変更することもできますが、その場合はカラム型が必須です（[ADD COLUMN](#add-column) の説明を参照）。

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

`ALTER` クエリは原子的です。MergeTree テーブルの場合、ロックフリーでもあります。

カラムの変更のための `ALTER` クエリはレプリケートされます。手順は ZooKeeper に保存され、その後各レプリカがそれを適用します。すべての `ALTER` クエリは同じ順序で実行されます。クエリは、他のレプリカで適切なアクションが完了するのを待ちます。ただし、レプリケートされたテーブルのカラムを変更するクエリは中断されることがあり、すべてのアクションは非同期で実行されます。

## MODIFY COLUMN REMOVE {#modify-column-remove}

カラムプロパティの1つを削除します： `DEFAULT`、`ALIAS`、`MATERIALIZED`、`CODEC`、`COMMENT`、`TTL`、`SETTINGS`。

構文:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name REMOVE property;
```

**例**

TTL を削除する:

```sql
ALTER TABLE table_with_ttl MODIFY COLUMN column_ttl REMOVE TTL;
```

**関連項目**

- [REMOVE TTL](ttl.md).

## MODIFY COLUMN MODIFY SETTING {#modify-column-modify-setting}

カラム設定を変更します。

構文:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING name=value,...;
```

**例**

カラムの `max_compress_block_size` を `1MB` に変更します:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING max_compress_block_size = 1048576;
```

## MODIFY COLUMN RESET SETTING {#modify-column-reset-setting}

カラム設定をリセットし、テーブルの CREATE クエリのカラム式における設定宣言も削除します。

構文:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING name,...;
```

**例**

カラム設定 `max_compress_block_size` をデフォルト値にリセットします:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING max_compress_block_size;
```

## MATERIALIZE COLUMN {#materialize-column}

`DEFAULT` または `MATERIALIZED` 値式でカラムをマテリアライズします。`ALTER TABLE table_name ADD COLUMN column_name MATERIALIZED` を使用してマテリアライズカラムを追加する際、既存の行にマテリアライズされた値がない場合は自動的には埋められません。`MATERIALIZE COLUMN` ステートメントは、`DEFAULT` または `MATERIALIZED` 式が追加または更新された後に既存のカラムデータを上書きするために使用されます（これはメタデータのみを更新し、既存のデータは変更しません）。ソートキー内でカラムをマテリアライズすることは無効な操作であるため、ソート順序が壊れる可能性があります。
[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

新しいまたは更新された `MATERIALIZED` 値式を持つカラムについては、すべての既存の行が上書きされます。

新しいまたは更新された `DEFAULT` 値式を持つカラムについては、動作は ClickHouse のバージョンによって異なります：
- ClickHouse < v24.2 では、すべての既存の行が上書きされます。
- ClickHouse >= v24.2 では、`DEFAULT` 値式を持つカラムに挿入された行の値が明示的に指定されたかどうかを区別します。もし値が明示的に指定された場合、ClickHouse はそのまま保持します。もし値が計算された場合、ClickHouse はそれを新しいまたは更新された `MATERIALIZED` 値式に変更します。

構文:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE COLUMN col [IN PARTITION partition | IN PARTITION ID 'partition_id'];
```
- PARTITION を指定した場合、カラムは指定されたパーティションのみでマテリアライズされます。

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

**関連項目**

- [MATERIALIZED](/sql-reference/statements/create/view#materialized-view).

## Limitations {#limitations}

`ALTER` クエリを使用すると、ネストされたデータ構造内の別々の要素（カラム）を作成および削除できますが、全体のネストされたデータ構造を管理することはできません。ネストされたデータ構造を追加するには、 `name.nested_name` のような名前と `Array(T)` の型を持つカラムを追加できます。ネストされたデータ構造は、ドットの前に同じプレフィックスを持つ複数の配列カラムに相当します。

プライマリキーやサンプリングキー（`ENGINE` 式で使用されるカラム）内のカラムを削除することはサポートされていません。プライマリキーに含まれるカラムの型を変更することは、データが変更されない場合にのみ可能です（たとえば、Enumに値を追加したり、型を `DateTime` から `UInt32` に変更したりすることが許可されています）。

`ALTER` クエリが必要なテーブルの変更を行うには不十分な場合、新しいテーブルを作成し、[INSERT SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select) クエリを使用してデータをコピーし、[RENAME](/sql-reference/statements/rename.md/#rename-table) クエリを使用してテーブルを切り替え、古いテーブルを削除できます。

`ALTER` クエリはテーブルのすべての読み取りと書き込みをブロックします。言い換えれば、`ALTER` クエリの実行中に長い `SELECT` が実行されている場合、`ALTER` クエリはそれが完了するのを待ちます。同時に、同じテーブルへのすべての新しいクエリは、この `ALTER` が実行されている間待機します。

データを直接保存しないテーブル（[Merge](/sql-reference/statements/alter/index.md) と [Distributed](/sql-reference/statements/alter/index.md) のような）については、`ALTER` はテーブル構造を変更するだけで、従属テーブルの構造は変更しません。たとえば、`Distributed` テーブルの `ALTER` を実行すると、すべてのリモートサーバー上のテーブルに対しても `ALTER` を実行する必要があります。
