---
description: 'カラムに関するドキュメント'
sidebar_label: 'COLUMN'
sidebar_position: 37
slug: /sql-reference/statements/alter/column
title: 'カラム操作'
doc_type: 'reference'
---

テーブル構造を変更するためのクエリセット。

構文:

```sql
ALTER [TEMPORARY] TABLE [db].name [ON CLUSTER cluster] ADD|DROP|RENAME|CLEAR|COMMENT|{MODIFY|ALTER}|MATERIALIZE COLUMN ...
```

クエリ内で、1 つ以上のアクションをカンマ区切りのリストとして指定します。
各アクションは列に対する操作です。

サポートされているアクションは次のとおりです。

* [ADD COLUMN](#add-column) — テーブルに新しい列を追加します。
* [DROP COLUMN](#drop-column) — 列を削除します。
* [RENAME COLUMN](#rename-column) — 既存の列名を変更します。
* [CLEAR COLUMN](#clear-column) — 列の値をリセットします。
* [COMMENT COLUMN](#comment-column) — 列にテキストコメントを追加します。
* [MODIFY COLUMN](#modify-column) — 列の型、デフォルト式、TTL、および列設定を変更します。
* [MODIFY COLUMN REMOVE](#modify-column-remove) — 列プロパティのいずれかを削除します。
* [MODIFY COLUMN MODIFY SETTING](#modify-column-modify-setting) — 列設定を変更します。
* [MODIFY COLUMN RESET SETTING](#modify-column-reset-setting) — 列設定をリセットします。
* [MATERIALIZE COLUMN](#materialize-column) — 列が存在しないパーツに列をマテリアライズします。
  これらのアクションについては、以下で詳しく説明します。


## ADD COLUMN {#add-column}

```sql
ADD COLUMN [IF NOT EXISTS] name [type] [default_expr] [codec] [AFTER name_after | FIRST]
```

指定された`name`、`type`、[`codec`](../create/table.md/#column_compression_codec)、および`default_expr`を持つ新しいカラムをテーブルに追加します（[デフォルト式](/sql-reference/statements/create/table#default_values)のセクションを参照）。

`IF NOT EXISTS`句を含めると、カラムが既に存在する場合でもクエリはエラーを返しません。`AFTER name_after`（別のカラムの名前）を指定すると、テーブルカラムのリスト内で指定されたカラムの後にカラムが追加されます。テーブルの先頭にカラムを追加する場合は、`FIRST`句を使用します。それ以外の場合、カラムはテーブルの末尾に追加されます。一連のアクションでは、`name_after`は前のアクションで追加されたカラムの名前を指定することもできます。

カラムの追加はテーブル構造のみを変更し、データに対する操作は実行されません。`ALTER`実行後、データはディスクに書き込まれません。テーブルから読み取る際にカラムのデータが存在しない場合、デフォルト値で埋められます（デフォルト式がある場合はそれを実行し、ない場合はゼロまたは空文字列を使用します）。カラムはデータパーツのマージ後にディスクに書き込まれます（[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)を参照）。

このアプローチにより、古いデータの容量を増やすことなく、`ALTER`クエリを即座に完了できます。

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

`name`という名前のカラムを削除します。`IF EXISTS`句を指定した場合、カラムが存在しなくてもクエリはエラーを返しません。

ファイルシステムからデータを削除します。ファイル全体が削除されるため、クエリはほぼ瞬時に完了します。

:::tip
[マテリアライズドビュー](/sql-reference/statements/create/view)から参照されているカラムは削除できません。削除しようとするとエラーが返されます。
:::

例:

```sql
ALTER TABLE visits DROP COLUMN browser
```


## RENAME COLUMN {#rename-column}

```sql
RENAME COLUMN [IF EXISTS] name to new_name
```

カラム `name` を `new_name` に名前変更します。`IF EXISTS` 句が指定されている場合、カラムが存在しなくてもクエリはエラーを返しません。名前変更は基盤データに影響を与えないため、クエリはほぼ瞬時に完了します。

**注意**: テーブルのキー式で指定されたカラム（`ORDER BY` または `PRIMARY KEY`）は名前変更できません。これらのカラムを変更しようとすると `SQL Error [524]` が発生します。

例:

```sql
ALTER TABLE visits RENAME COLUMN webBrowser TO browser
```


## CLEAR COLUMN {#clear-column}

```sql
CLEAR COLUMN [IF EXISTS] name IN PARTITION partition_name
```

指定されたパーティション内のカラムのすべてのデータをリセットします。パーティション名の設定については、[パーティション式の設定方法](../alter/partition.md/#how-to-set-partition-expression)のセクションを参照してください。

`IF EXISTS`句を指定した場合、カラムが存在しなくてもクエリはエラーを返しません。

例:

```sql
ALTER TABLE visits CLEAR COLUMN browser IN PARTITION tuple()
```


## COMMENT COLUMN {#comment-column}

```sql
COMMENT COLUMN [IF EXISTS] name 'Text comment'
```

カラムにコメントを追加します。`IF EXISTS`句を指定した場合、カラムが存在しなくてもクエリはエラーを返しません。

各カラムには1つのコメントを持たせることができます。カラムに既にコメントが存在する場合、新しいコメントが既存のコメントを上書きします。

コメントは、[DESCRIBE TABLE](/sql-reference/statements/describe-table.md)クエリで返される`comment_expression`カラムに格納されます。

例:

```sql
ALTER TABLE visits COMMENT COLUMN browser 'This column shows the browser used for accessing the site.'
```


## MODIFY COLUMN {#modify-column}

```sql
MODIFY COLUMN [IF EXISTS] name [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
ALTER COLUMN [IF EXISTS] name TYPE [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
```

このクエリは`name`カラムの以下のプロパティを変更します:

- 型

- デフォルト式

- 圧縮コーデック

- TTL

- カラムレベル設定

カラム圧縮コーデックの変更例については、[カラム圧縮コーデック](../create/table.md/#column_compression_codec)を参照してください。

カラムTTLの変更例については、[カラムTTL](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-column-ttl)を参照してください。

カラムレベル設定の変更例については、[カラムレベル設定](/engines/table-engines/mergetree-family/mergetree.md/#column-level-settings)を参照してください。

`IF EXISTS`句を指定した場合、カラムが存在しなくてもクエリはエラーを返しません。

型を変更する際、値は[toType](/sql-reference/functions/type-conversion-functions.md)関数が適用されたかのように変換されます。デフォルト式のみを変更する場合、クエリは複雑な処理を行わず、ほぼ瞬時に完了します。

例:

```sql
ALTER TABLE visits MODIFY COLUMN browser Array(String)
```

カラム型の変更は唯一の複雑な操作であり、データファイルの内容を変更します。大規模なテーブルの場合、長時間かかる可能性があります。

このクエリは`FIRST | AFTER`句を使用してカラムの順序を変更することもできます。詳細は[ADD COLUMN](#add-column)の説明を参照してください。ただし、この場合カラム型の指定は必須です。

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

`ALTER`クエリはアトミックです。MergeTreeテーブルの場合、ロックフリーでもあります。

カラムを変更する`ALTER`クエリはレプリケートされます。命令はZooKeeperに保存され、各レプリカがそれらを適用します。すべての`ALTER`クエリは同じ順序で実行されます。クエリは他のレプリカで適切なアクションが完了するまで待機します。ただし、レプリケートされたテーブルのカラムを変更するクエリは中断される可能性があり、すべてのアクションは非同期で実行されます。

:::note
NullableカラムをNon-Nullableに変更する際は注意してください。NULL値が含まれていないことを確認してください。NULL値が含まれている場合、読み取り時に問題が発生します。その場合の回避策は、ミューテーションをキルしてカラムをNullable型に戻すことです。
:::


## MODIFY COLUMN REMOVE {#modify-column-remove}

カラムプロパティ（`DEFAULT`、`ALIAS`、`MATERIALIZED`、`CODEC`、`COMMENT`、`TTL`、`SETTINGS`）のいずれかを削除します。

構文:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name REMOVE property;
```

**例**

TTLを削除:

```sql
ALTER TABLE table_with_ttl MODIFY COLUMN column_ttl REMOVE TTL;
```

**関連項目**

- [REMOVE TTL](ttl.md)


## MODIFY COLUMN MODIFY SETTING {#modify-column-modify-setting}

カラムの設定を変更します。

構文:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING name=value,...;
```

**例**

カラムの`max_compress_block_size`を`1MB`に変更します:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING max_compress_block_size = 1048576;
```


## MODIFY COLUMN RESET SETTING {#modify-column-reset-setting}

カラム設定をリセットし、テーブルのCREATEクエリ内のカラム式から設定宣言を削除します。

構文:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING name,...;
```

**例**

カラム設定`max_compress_block_size`をデフォルト値にリセットします:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING max_compress_block_size;
```


## MATERIALIZE COLUMN {#materialize-column}

`DEFAULT`または`MATERIALIZED`値式を持つカラムを実体化します。`ALTER TABLE table_name ADD COLUMN column_name MATERIALIZED`を使用してマテリアライズドカラムを追加する場合、実体化された値を持たない既存の行は自動的には埋められません。`MATERIALIZE COLUMN`文は、`DEFAULT`または`MATERIALIZED`式が追加または更新された後に既存のカラムデータを書き換えるために使用できます(これはメタデータのみを更新し、既存のデータは変更しません)。ソートキー内のカラムを実体化することは、ソート順を破壊する可能性があるため無効な操作であることに注意してください。
[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

新規または更新された`MATERIALIZED`値式を持つカラムの場合、すべての既存の行が書き換えられます。

新規または更新された`DEFAULT`値式を持つカラムの場合、動作はClickHouseのバージョンに依存します:

- ClickHouse < v24.2では、すべての既存の行が書き換えられます。
- ClickHouse >= v24.2では、`DEFAULT`値式を持つカラムの行値が挿入時に明示的に指定されたか、または`DEFAULT`値式から計算されたかを区別します。値が明示的に指定された場合、ClickHouseはそのまま保持します。値が計算された場合、ClickHouseは新規または更新された`MATERIALIZED`値式に変更します。

構文:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE COLUMN col [IN PARTITION partition | IN PARTITION ID 'partition_id'];
```

- PARTITIONを指定した場合、指定されたパーティションのみでカラムが実体化されます。

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

- [MATERIALIZED](/sql-reference/statements/create/view#materialized-view)


## 制限事項 {#limitations}

`ALTER`クエリでは、ネストされたデータ構造内の個別の要素(カラム)を作成および削除できますが、ネストされたデータ構造全体を操作することはできません。ネストされたデータ構造を追加するには、`name.nested_name`のような名前と`Array(T)`型のカラムを追加します。ネストされたデータ構造は、ドットの前に同じプレフィックスを持つ名前の複数の配列カラムと等価です。

プライマリキーまたはサンプリングキー(`ENGINE`式で使用されるカラム)内のカラムの削除はサポートされていません。プライマリキーに含まれるカラムの型変更は、この変更がデータの変更を引き起こさない場合にのみ可能です(例えば、Enumに値を追加する、または`DateTime`から`UInt32`への型変更は許可されます)。

`ALTER`クエリが必要なテーブル変更を行うのに十分でない場合は、新しいテーブルを作成し、[INSERT SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select)クエリを使用してデータをコピーし、[RENAME](/sql-reference/statements/rename.md/#rename-table)クエリを使用してテーブルを切り替え、古いテーブルを削除することができます。

`ALTER`クエリは、テーブルに対するすべての読み取りと書き込みをブロックします。つまり、`ALTER`クエリの実行時に長時間実行される`SELECT`が実行中の場合、`ALTER`クエリはその完了を待機します。同時に、この`ALTER`の実行中は、同じテーブルへのすべての新しいクエリが待機します。

データ自体を保存しないテーブル([Merge](/sql-reference/statements/alter/index.md)や[Distributed](/sql-reference/statements/alter/index.md)など)の場合、`ALTER`はテーブル構造のみを変更し、下位テーブルの構造は変更しません。例えば、`Distributed`テーブルに対してALTERを実行する場合、すべてのリモートサーバー上のテーブルに対してもALTERを実行する必要があります。
