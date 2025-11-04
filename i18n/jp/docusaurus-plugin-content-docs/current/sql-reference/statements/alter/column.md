---
'description': 'カラムのDocumentation'
'sidebar_label': 'COLUMN'
'sidebar_position': 37
'slug': '/sql-reference/statements/alter/column'
'title': 'カラム操作'
'doc_type': 'reference'
---

クエリのセットはテーブル構造を変更することを可能にします。

構文:

```sql
ALTER [TEMPORARY] TABLE [db].name [ON CLUSTER cluster] ADD|DROP|RENAME|CLEAR|COMMENT|{MODIFY|ALTER}|MATERIALIZE COLUMN ...
```

クエリでは、1つ以上のカンマ区切りのアクションのリストを指定します。各アクションはカラムに対する操作です。

以下のアクションがサポートされています：

- [ADD COLUMN](#add-column) — テーブルに新しいカラムを追加します。
- [DROP COLUMN](#drop-column) — カラムを削除します。
- [RENAME COLUMN](#rename-column) — 既存のカラムの名前を変更します。
- [CLEAR COLUMN](#clear-column) — カラムの値をリセットします。
- [COMMENT COLUMN](#comment-column) — カラムにテキストコメントを追加します。
- [MODIFY COLUMN](#modify-column) — カラムの型、デフォルト式、TTL、およびカラム設定を変更します。
- [MODIFY COLUMN REMOVE](#modify-column-remove) — カラムのプロパティの1つを削除します。
- [MODIFY COLUMN MODIFY SETTING](#modify-column-modify-setting) - カラム設定を変更します。
- [MODIFY COLUMN RESET SETTING](#modify-column-reset-setting) - カラム設定をリセットします。
- [MATERIALIZE COLUMN](#materialize-column) — カラムが不足しているパーツにカラムをマテリアライズします。
これらのアクションの詳細は以下に記述されています。

## ADD COLUMN {#add-column}

```sql
ADD COLUMN [IF NOT EXISTS] name [type] [default_expr] [codec] [AFTER name_after | FIRST]
```

指定された `name`、`type`、[`codec`](../create/table.md/#column_compression_codec) および `default_expr` を使って、テーブルに新しいカラムを追加します（[デフォルト式](/sql-reference/statements/create/table#default_values)のセクションを参照）。

`IF NOT EXISTS` 句が含まれている場合、カラムが既に存在してもクエリはエラーを返しません。`AFTER name_after`（別のカラムの名前）を指定すると、指定されたカラムの後にカラムが追加されます。テーブルの先頭にカラムを追加したい場合は、`FIRST` 句を使用します。そうでない場合、カラムはテーブルの末尾に追加されます。アクションのチェーンの場合、`name_after` は前のアクションの1つで追加されたカラムの名前であることができます。

カラムを追加することは、データに対するアクションを実行することなく、テーブル構造のみを変更します。`ALTER` 後、データはディスク上に表示されません。テーブルから読み取る際にカラムのデータが不足している場合、デフォルト値で埋められます（デフォルト式がある場合はそれを実行するか、ゼロまたは空の文字列を使用します）。カラムは、データパーツをマージした後にディスクに表示されます（[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)を参照）。

このアプローチにより、古いデータのボリュームを増やすことなく、`ALTER` クエリを瞬時に完了させることができます。

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

名前 `name` のカラムを削除します。`IF EXISTS` 句が指定されている場合、カラムが存在しない場合でもクエリはエラーを返しません。

ファイルシステムからデータを削除します。これは全ファイルを削除するため、クエリはほぼ瞬時に完了します。

:::tip
[Materialized View](/sql-reference/statements/create/view) で参照されているカラムは削除できません。それ以外の場合はエラーが返されます。
:::

例:

```sql
ALTER TABLE visits DROP COLUMN browser
```

## RENAME COLUMN {#rename-column}

```sql
RENAME COLUMN [IF EXISTS] name to new_name
```

カラム `name` の名前を `new_name` に変更します。`IF EXISTS` 句が指定されている場合、カラムが存在しない場合でもクエリはエラーを返しません。名前を変更する際には、基盤となるデータを含まないため、クエリはほぼ瞬時に完了します。

**注意**: テーブルのキー式に指定されたカラム（`ORDER BY` または `PRIMARY KEY` で）は名前を変更することができません。これらのカラムを変更しようとすると `SQL Error [524]` が発生します。

例:

```sql
ALTER TABLE visits RENAME COLUMN webBrowser TO browser
```

## CLEAR COLUMN {#clear-column}

```sql
CLEAR COLUMN [IF EXISTS] name IN PARTITION partition_name
```

指定されたパーティションのカラムのすべてのデータをリセットします。パーティション名の設定方法については、[パーティション式の設定方法](../alter/partition.md/#how-to-set-partition-expression)のセクションを参照してください。

`IF EXISTS` 句が指定されている場合、カラムが存在しない場合でもクエリはエラーを返しません。

例:

```sql
ALTER TABLE visits CLEAR COLUMN browser IN PARTITION tuple()
```

## COMMENT COLUMN {#comment-column}

```sql
COMMENT COLUMN [IF EXISTS] name 'Text comment'
```

カラムにコメントを追加します。`IF EXISTS` 句が指定されている場合、カラムが存在しない場合でもクエリはエラーを返しません。

各カラムには1つのコメントを持つことができます。カラムにすでにコメントが存在する場合、新しいコメントは前のコメントを上書きします。

コメントは、[DESCRIBE TABLE](/sql-reference/statements/describe-table.md) クエリで返される `comment_expression` カラムに格納されます。

例:

```sql
ALTER TABLE visits COMMENT COLUMN browser 'This column shows the browser used for accessing the site.'
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

- カラムレベル設定

カラム圧縮CODECSの変更例については、[カラム圧縮コーデックス](../create/table.md/#column_compression_codec)を参照してください。

カラムTTLの変更例については、[カラムTTL](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-column-ttl)を参照してください。

カラムレベル設定の変更例については、[カラムレベル設定](/engines/table-engines/mergetree-family/mergetree.md/#column-level-settings)を参照してください。

`IF EXISTS` 句が指定されている場合、カラムが存在しない場合でもクエリはエラーを返しません。

型を変更する場合、値は [toType](/sql-reference/functions/type-conversion-functions.md) 関数が適用されたかのように変換されます。デフォルト式のみが変更される場合、クエリは特に複雑なことをしないため、ほぼ瞬時に完了します。

例:

```sql
ALTER TABLE visits MODIFY COLUMN browser Array(String)
```

カラムの型を変更するのは唯一の複雑なアクションです - これはデータを含むファイルの内容を変更します。大きなテーブルの場合、これには時間がかかる場合があります。

クエリはまた、`FIRST | AFTER` 句を使用してカラムの順序を変更できます。これについては [ADD COLUMN](#add-column) の説明を参照してくださいが、この場合カラム型は必須です。

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

`ALTER` クエリは原子的です。MergeTreeテーブルの場合、ロックフリーでもあります。

カラムを変更するための `ALTER` クエリはレプリケートされます。指示はZooKeeperに保存され、その後各レプリカがそれを適用します。すべての `ALTER` クエリは同じ順序で実行されます。クエリは他のレプリカで適切なアクションが完了するのを待ちます。ただし、レプリケートテーブルでカラムを変更するためのクエリは、中断される可能性があり、すべてのアクションは非同期で実行されます。

:::note
Nullable カラムを Non-Nullable に変更する際は注意してください。NULL 値が含まれていないことを確認してください。そうでない場合、読み込み時に問題が発生します。その場合の回避策は、変異を終了させてカラムを Nullable 型に戻すことです。
:::

## MODIFY COLUMN REMOVE {#modify-column-remove}

カラムプロパティの1つを削除します：`DEFAULT`、`ALIAS`、`MATERIALIZED`、`CODEC`、`COMMENT`、`TTL`、`SETTINGS`。

構文:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name REMOVE property;
```

**例**

TTLを削除します：

```sql
ALTER TABLE table_with_ttl MODIFY COLUMN column_ttl REMOVE TTL;
```

**参照してください**

- [REMOVE TTL](ttl.md)。

## MODIFY COLUMN MODIFY SETTING {#modify-column-modify-setting}

カラム設定を変更します。

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

カラム設定をリセットし、テーブルのCREATEクエリのカラム式から設定宣言を削除します。

構文:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING name,...;
```

**例**

カラム設定 `max_compress_block_size` をデフォルト値にリセットします：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING max_compress_block_size;
```

## MATERIALIZE COLUMN {#materialize-column}

`DEFAULT` または `MATERIALIZED` 値式を持つカラムをマテリアライズします。`ALTER TABLE table_name ADD COLUMN column_name MATERIALIZED` を使用してマテリアライズされたカラムを追加する場合、既存の行にはマテリアライズされた値が自動的には充填されません。`MATERIALIZE COLUMN` ステートメントは、`DEFAULT` または `MATERIALIZED` 式が追加または更新された後に既存のカラムデータを書き換えるのに使用できます（これはメタデータのみを更新し、既存のデータは変更しません）。ソートキーにカラムをマテリアライズすることは無効な操作であり、ソート順序を壊す可能性があることに注意してください。
[Mutation](/sql-reference/statements/alter/index.md#mutations)として実装されています。

新しいまたは更新された `MATERIALIZED` 値式を持つカラムに対して、すべての既存の行が書き換えられます。

新しいまたは更新された `DEFAULT` 値式を持つカラムに対して、その動作はClickHouseのバージョンによって異なります：
- ClickHouse < v24.2 では、すべての既存の行が書き換えられます。
- ClickHouse >= v24.2 は、`DEFAULT` 値式を持つカラムに行値が挿入されたときに明示的に指定されたかどうかを区別します。値が明示的に指定された場合、ClickHouseはそれをそのまま保持します。値が計算された場合、ClickHouseはそれを新しいまたは更新された `MATERIALIZED` 値式に変更します。

構文:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE COLUMN col [IN PARTITION partition | IN PARTITION ID 'partition_id'];
```
- PARTITIONを指定すると、指定されたパーティションでのみカラムがマテリアライズされます。

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

**参照してください**

- [MATERIALIZED](/sql-reference/statements/create/view#materialized-view)。

## 制限事項 {#limitations}

`ALTER` クエリを使用すると、ネストされたデータ構造で別々の要素（カラム）を作成および削除できますが、全体のネストされたデータ構造を削除することはできません。ネストされたデータ構造を追加するには、`name.nested_name` のような名前のカラムを追加し、型を `Array(T)` とします。ネストされたデータ構造は、ドットの前に同じプレフィックスを持つ複数の配列カラムに相当します。

主キーまたはサンプリングキー（`ENGINE` 式で使用されるカラム）でのカラム削除はサポートされていません。主キーに含まれるカラムの型変更は、データが変更されない場合にのみ可能です（たとえば、Enum に値を追加したり、型を `DateTime` から `UInt32` に変更したりすることが許可されています）。

`ALTER` クエリだけではテーブル変更が不十分な場合は、新しいテーブルを作成し、[INSERT SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select) クエリを使用してデータをコピーし、その後、[RENAME](/sql-reference/statements/rename.md/#rename-table) クエリを使用してテーブルを切り替え、古いテーブルを削除できます。

`ALTER` クエリはテーブルに対するすべての読み取りと書き込みをブロックします。言い換えれば、長い `SELECT` が `ALTER` クエリの実行時に実行されている場合、`ALTER` クエリはそれが完了するのを待ちます。同時に、同じテーブルに対するすべての新しいクエリは、`ALTER` が実行されている間待機します。

データを自身で保存しないテーブル（[Merge](/sql-reference/statements/alter/index.md) や [Distributed](/sql-reference/statements/alter/index.md) など）の場合、`ALTER` はテーブルの構造を変更するだけで、下位テーブルの構造は変更されません。たとえば、`Distributed` テーブルの `ALTER` を実行する場合、すべてのリモートサーバー上のテーブルでも `ALTER` を実行する必要があります。
