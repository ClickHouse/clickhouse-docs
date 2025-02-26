---
slug: /sql-reference/statements/alter/column
sidebar_position: 37
sidebar_label: COLUMN
title: "カラム操作"
---

テーブル構造を変更するための一連のクエリです。

構文：

``` sql
ALTER [TEMPORARY] TABLE [db].name [ON CLUSTER cluster] ADD|DROP|RENAME|CLEAR|COMMENT|{MODIFY|ALTER}|MATERIALIZE COLUMN ...
```

クエリでは、カンマで区切られた1つ以上のアクションのリストを指定します。
各アクションはカラムに対する操作です。

次のアクションがサポートされています：

- [ADD COLUMN](#add-column) — テーブルに新しいカラムを追加します。
- [DROP COLUMN](#drop-column) — カラムを削除します。
- [RENAME COLUMN](#rename-column) — 既存のカラムの名前を変更します。
- [CLEAR COLUMN](#clear-column) — カラムの値をリセットします。
- [COMMENT COLUMN](#comment-column) — カラムにテキストコメントを追加します。
- [MODIFY COLUMN](#modify-column) — カラムの型、デフォルト式、TTL、カラム設定を変更します。
- [MODIFY COLUMN REMOVE](#modify-column-remove) — カラムプロパティの1つを削除します。
- [MODIFY COLUMN MODIFY SETTING](#modify-column-modify-setting) — カラム設定を変更します。
- [MODIFY COLUMN RESET SETTING](#modify-column-reset-setting) — カラム設定をリセットします。
- [MATERIALIZE COLUMN](#materialize-column) — カラムが欠けているパーツの中にカラムを具現化します。
これらのアクションについては、以下で詳しく説明します。

## ADD COLUMN {#add-column}

``` sql
ADD COLUMN [IF NOT EXISTS] name [type] [default_expr] [codec] [AFTER name_after | FIRST]
```

指定された `name`、`type`、[`codec`](../create/table.md/#column_compression_codec) および `default_expr`（セクション [デフォルト式](/sql-reference/statements/create/table.md/#create-default-values)を参照）を持つ新しいカラムをテーブルに追加します。

`IF NOT EXISTS` 句を含めると、カラムがすでに存在する場合、クエリはエラーを返しません。`AFTER name_after`（他のカラムの名前）を指定すると、指定したカラムの後にカラムが追加されます。テーブルの最初にカラムを追加したい場合は、`FIRST` 句を使用します。そうでなければ、カラムはテーブルの最後に追加されます。アクションのチェーンの場合、`name_after` は以前のアクションのうちの1つで追加されたカラムの名前にすることができます。

カラムを追加することはテーブル構造を変更するだけで、データに対しては何のアクションも行いません。`ALTER` の後、ディスク上にデータは表示されません。テーブルから読み取るときにカラムのデータが欠けている場合、それはデフォルト値で埋められます（デフォルト式がある場合はそれを実行するか、ゼロや空の文字列を使用します）。カラムはデータパーツのマージ後にディスク上に表示されます（[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)を参照）。

このアプローチにより、古いデータの量を増加させることなく、`ALTER` クエリを瞬時に完了させることができます。

例：

``` sql
ALTER TABLE alter_test ADD COLUMN Added1 UInt32 FIRST;
ALTER TABLE alter_test ADD COLUMN Added2 UInt32 AFTER NestedColumn;
ALTER TABLE alter_test ADD COLUMN Added3 UInt32 AFTER ToDrop;
DESC alter_test FORMAT TSV;
```

``` text
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

``` sql
DROP COLUMN [IF EXISTS] name
```

名前 `name` のカラムを削除します。`IF EXISTS` 句が指定されている場合、カラムが存在しない場合クエリはエラーを返しません。

ファイルシステムからデータを削除します。この操作は完全なファイルを削除するため、クエリはほぼ瞬時に完了します。

:::tip
[物化ビュー](/sql-reference/statements/create/view.md/#materialized)によって参照されているカラムは削除できません。そうでない場合は、エラーが返されます。
:::

例：

``` sql
ALTER TABLE visits DROP COLUMN browser
```

## RENAME COLUMN {#rename-column}

``` sql
RENAME COLUMN [IF EXISTS] name to new_name
```

カラム `name` の名前を `new_name` に変更します。`IF EXISTS` 句が指定されている場合、カラムが存在しない場合クエリはエラーを返しません。名前の変更は基礎データを伴わないため、クエリはほぼ瞬時に完了します。

**注意**: テーブルのキー式（`ORDER BY` または `PRIMARY KEY` を使用）で指定されたカラムは名前を変更できません。これらのカラムを変更しようとすると、`SQL Error [524]` が発生します。

例：

``` sql
ALTER TABLE visits RENAME COLUMN webBrowser TO browser
```

## CLEAR COLUMN {#clear-column}

``` sql
CLEAR COLUMN [IF EXISTS] name IN PARTITION partition_name
```

指定されたパーティション内のカラムのすべてのデータをリセットします。パーティション名を設定する方法については、[パーティション式の設定方法](../alter/partition.md/#how-to-set-partition-expression)のセクションを参照してください。

`IF EXISTS` 句が指定されている場合、カラムが存在しない場合クエリはエラーを返しません。

例：

``` sql
ALTER TABLE visits CLEAR COLUMN browser IN PARTITION tuple()
```

## COMMENT COLUMN {#comment-column}

``` sql
COMMENT COLUMN [IF EXISTS] name 'テキストコメント'
```

カラムにコメントを追加します。`IF EXISTS` 句が指定されている場合、カラムが存在しない場合クエリはエラーを返しません。

各カラムには1つのコメントを持つことができます。カラムに対するコメントがすでに存在する場合、新しいコメントは前のコメントを上書きします。

コメントは、[DESCRIBE TABLE](/sql-reference/statements/describe-table.md)クエリによって返される `comment_expression` カラムに保存されます。

例：

``` sql
ALTER TABLE visits COMMENT COLUMN browser 'このカラムはサイトへのアクセスに使用されたブラウザを示します。'
```

## MODIFY COLUMN {#modify-column}

``` sql
MODIFY COLUMN [IF EXISTS] name [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
ALTER COLUMN [IF EXISTS] name TYPE [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
```

このクエリは `name` カラムのプロパティを変更します：

- タイプ

- デフォルト式

- 圧縮コーデック

- TTL

- カラムレベルの設定

カラムの圧縮 CODECS の変更例については、[カラム圧縮コーデック](../create/table.md/#column_compression_codec)を参照してください。

カラムの TTL の変更例については、[カラム TTL](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-column-ttl)を参照してください。

カラムレベルの設定の変更例については、[カラムレベルの設定](/engines/table-engines/mergetree-family/mergetree.md/#column-level-settings)を参照してください。

`IF EXISTS` 句が指定されている場合、カラムが存在しない場合クエリはエラーを返しません。

タイプを変更するとき、値は [toType](/sql-reference/functions/type-conversion-functions.md) 関数が適用されたかのように変換されます。デフォルト式だけを変更する場合、クエリは複雑な操作を行わず、ほぼ瞬時に完了します。

例：

``` sql
ALTER TABLE visits MODIFY COLUMN browser Array(String)
```

カラムタイプの変更は唯一の複雑なアクションです – これはデータを含むファイルの内容を変更します。大きなテーブルの場合、これには時間がかかることがあります。

クエリは `FIRST | AFTER` 句を使用してカラムの順序を変更することもできますが、[ADD COLUMN](#add-column)の説明を参照してくださいが、この場合カラムタイプが必須です。

例：

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

`ALTER` クエリはアトミックです。MergeTree テーブルの場合、ロックフリーです。

カラムを変更するための `ALTER` クエリは複製されます。指示は ZooKeeper に保存され、その後各レプリカがそれを適用します。すべての `ALTER` クエリは同じ順序で実行されます。クエリは他のレプリカで適切なアクションが完了するまで待機します。ただし、複製されたテーブルでカラムを変更するためのクエリは中断することができ、すべてのアクションは非同期に実行されます。

## MODIFY COLUMN REMOVE {#modify-column-remove}

カラムプロパティの1つを削除します： `DEFAULT`、`ALIAS`、`MATERIALIZED`、`CODEC`、`COMMENT`、`TTL`、`SETTINGS`。

構文：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name REMOVE property;
```

**例**

TTLを削除：

```sql
ALTER TABLE table_with_ttl MODIFY COLUMN column_ttl REMOVE TTL;
```

**関連情報**

- [REMOVE TTL](ttl.md)。

## MODIFY COLUMN MODIFY SETTING {#modify-column-modify-setting}

カラム設定を変更します。

構文：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING name=value,...;
```

**例**

カラムの `max_compress_block_size` を `1MB` に変更：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING max_compress_block_size = 1048576;
```

## MODIFY COLUMN RESET SETTING {#modify-column-reset-setting}

カラム設定をリセットし、テーブルの CREATE クエリのカラム式から設定の宣言をも削除します。

構文：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING name,...;
```

**例**

カラム設定 `max_compress_block_size` をデフォルト値にリセット：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING max_compress_block_size;
```

## MATERIALIZE COLUMN {#materialize-column}

`DEFAULT` または `MATERIALIZED` 値式を持つカラムを具現化します。`ALTER TABLE table_name ADD COLUMN column_name MATERIALIZED` を使用して物化カラムを追加すると、物化値がない既存の行は自動的に埋められません。`MATERIALIZE COLUMN` ステートメントは、`DEFAULT` または `MATERIALIZED` 式が追加または更新された後に既存のカラムデータを上書きするために使用されます（これはメタデータのみを更新し、既存のデータは変更しません）。ソートキー内でカラムを具現化することは無効な操作であることに注意してください。これは[変更](/sql-reference/statements/alter/index.md#mutations)として実装されています。

新しいまたは更新された `MATERIALIZED` 値式を持つカラムについては、すべての既存の行が上書きされます。

新しいまたは更新された `DEFAULT` 値式を持つカラムについては、動作は ClickHouse バージョンによって異なります：
- ClickHouse < v24.2 では、すべての既存の行が上書きされます。
- ClickHouse >= v24.2 では、列に `DEFAULT` 値式が挿入されたときに明示的に指定されたかどうかを区別します i.e., デフォルト値式から計算されたかどうかに応じて。値が明示的に指定された場合、ClickHouse はそのまま保持します。値が計算された場合、ClickHouse はそれを新しいまたは更新された `MATERIALIZED` 値式に変更します。

構文：

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE COLUMN col [IN PARTITION partition | IN PARTITION ID 'partition_id'];
```
- PARTITION を指定すると、指定されたパーティションでのみカラムが具現化されます。

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

**関連情報**

- [MATERIALIZED](/sql-reference/statements/create/table.md/#materialized)。

## 制限 {#limitations}

`ALTER` クエリはネストされたデータ構造内に別々の要素（カラム）を作成および削除できますが、全体のネストされたデータ構造は削除できません。ネストされたデータ構造を追加するには、`name.nested_name` のようにカラムを追加し、型を `Array(T)` とします。ネストされたデータ構造は、ドットより前の同じプレフィックスを持つ複数の配列カラムに相当します。

プライマリキーまたはサンプリングキー（`ENGINE` 式で使用されるカラム）のカラムを削除することはサポートされていません。プライマリキーに含まれるカラムの型を変更することは、データが変更されない場合にのみ可能です（たとえば、Enumに値を追加することや、型を `DateTime` から `UInt32` に変更することが許可されています）。

`ALTER` クエリが必要なテーブル変更に対して不十分な場合、新しいテーブルを作成し、[INSERT SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select) クエリを使用してデータをコピーし、次に [RENAME](/sql-reference/statements/rename.md/#rename-table) クエリでテーブルを切り替え、古いテーブルを削除できます。

`ALTER` クエリはテーブルのすべての読み取りと書き込みをブロックします。言い換えれば、`ALTER` クエリの実行中に長い `SELECT` が実行されている場合、`ALTER` クエリは完了するまで待機します。同時に、新しいクエリはこの `ALTER` が実行されている間、待機します。

データを自身で保存しないテーブル（[Merge](/sql-reference/statements/alter/index.md) や [Distributed](/sql-reference/statements/alter/index.md)など）に対しては、`ALTER` はテーブル構造を変更するだけで、従属テーブルの構造を変更しません。たとえば、`Distributed` テーブルの ALTER を実行する際は、すべてのリモートサーバーのテーブルに対しても `ALTER` を実行する必要があります。
