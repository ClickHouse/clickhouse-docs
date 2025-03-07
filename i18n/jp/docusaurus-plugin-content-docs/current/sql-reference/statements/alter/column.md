---
slug: /sql-reference/statements/alter/column
sidebar_position: 37
sidebar_label: 'カラム'
title: 'カラム操作'
---

テーブル構造を変更するためのクエリセット。

構文：

``` sql
ALTER [TEMPORARY] TABLE [db].name [ON CLUSTER cluster] ADD|DROP|RENAME|CLEAR|COMMENT|{MODIFY|ALTER}|MATERIALIZE COLUMN ...
```

クエリ内で、1つ以上のカンマ区切りのアクションのリストを指定します。各アクションはカラムに対する操作です。

次のアクションがサポートされています：

- [ADD COLUMN](#add-column) — テーブルに新しいカラムを追加します。
- [DROP COLUMN](#drop-column) — カラムを削除します。
- [RENAME COLUMN](#rename-column) — 既存のカラムの名前を変更します。
- [CLEAR COLUMN](#clear-column) — カラムの値をリセットします。
- [COMMENT COLUMN](#comment-column) — カラムにテキストコメントを追加します。
- [MODIFY COLUMN](#modify-column) — カラムの型、デフォルト式、TTL、およびカラム設定を変更します。
- [MODIFY COLUMN REMOVE](#modify-column-remove) — カラムプロパティの1つを削除します。
- [MODIFY COLUMN MODIFY SETTING](#modify-column-modify-setting) - カラム設定を変更します。
- [MODIFY COLUMN RESET SETTING](#modify-column-reset-setting) - カラム設定をリセットします。
- [MATERIALIZE COLUMN](#materialize-column) — カラムが欠落しているパーツにカラムをマテリアライズします。
これらのアクションは、以下で詳しく説明します。

## ADD COLUMN {#add-column}

``` sql
ADD COLUMN [IF NOT EXISTS] name [type] [default_expr] [codec] [AFTER name_after | FIRST]
```

指定された `name`, `type`, [`codec`](../create/table.md/#column_compression_codec) および `default_expr` を持つ新しいカラムをテーブルに追加します（デフォルト式のセクションを参照してください [Default expressions](/sql-reference/statements/create/table#default_values)）。

`IF NOT EXISTS` 句が含まれている場合、カラムが既に存在する場合はエラーは返されません。`AFTER name_after` （別のカラムの名前）を指定すると、そのカラムの後に追加されます。テーブルの最初にカラムを追加したい場合は `FIRST` 句を使用します。そうでない場合、カラムはテーブルの最後に追加されます。アクションのチェーンの場合、`name_after` は以前のアクションで追加されたカラムの名前であることができます。

カラムを追加することはテーブルの構造を変更するだけで、データには何の操作も行いません。`ALTER` の後、データはディスクには表示されません。テーブルからの読み取り時にカラムのデータが欠落している場合、デフォルト値で埋められます（デフォルト式があればそれを実行し、なければゼロまたは空文字列を使用します）。カラムはデータパーツがマージされた後にディスクに表示されます（[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)を参照）。

このアプローチにより、古いデータのボリュームを増やすことなく、`ALTER` クエリを瞬時に完了できます。

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

`name` という名前のカラムを削除します。`IF EXISTS` 句が指定されている場合、カラムが存在しない場合はエラーは返されません。

ファイルシステムからデータを削除します。この操作は、ファイル全体を削除するため、クエリはほとんど瞬時に完了します。

:::tip
[Materialized view](/sql-reference/statements/create/view)によって参照されているカラムは削除できません。それ以外の場合はエラーが返されます。
:::

例：

``` sql
ALTER TABLE visits DROP COLUMN browser
```

## RENAME COLUMN {#rename-column}

``` sql
RENAME COLUMN [IF EXISTS] name to new_name
```

カラム `name` の名前を `new_name` に変更します。`IF EXISTS` 句が指定されている場合、カラムが存在しない場合はエラーは返されません。名前変更には基になるデータが含まれないため、クエリはほとんど瞬時に完了します。

**注意**: テーブルのキー式（`ORDER BY` または `PRIMARY KEY` で指定）のカラムは名前変更できません。これらのカラムを変更しようとすると `SQL Error [524]` が発生します。

例：

``` sql
ALTER TABLE visits RENAME COLUMN webBrowser TO browser
```

## CLEAR COLUMN {#clear-column}

``` sql
CLEAR COLUMN [IF EXISTS] name IN PARTITION partition_name
```

指定されたパーティションのカラム内の全データをリセットします。パーティション名の設定方法については、[How to set the partition expression](../alter/partition.md/#how-to-set-partition-expression) セクションを参照してください。

`IF EXISTS` 句が指定されている場合、カラムが存在しない場合はエラーは返されません。

例：

``` sql
ALTER TABLE visits CLEAR COLUMN browser IN PARTITION tuple()
```

## COMMENT COLUMN {#comment-column}

``` sql
COMMENT COLUMN [IF EXISTS] name 'Text comment'
```

カラムにコメントを追加します。`IF EXISTS` 句が指定されている場合、カラムが存在しない場合はエラーは返されません。

各カラムには1つのコメントを持つことができます。カラムに既にコメントが存在する場合、新しいコメントは前のコメントを上書きします。

コメントは、[DESCRIBE TABLE](/sql-reference/statements/describe-table.md) クエリによって返される `comment_expression` カラムに保存されます。

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

- 型
- デフォルト式
- 圧縮コーデック
- TTL
- カラム設定

カラム圧縮 CODECS の例については、[Column Compression Codecs](../create/table.md/#column_compression_codec) を参照してください。

カラムの TTL の変更例については、[Column TTL](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-column-ttl)を参照してください。

カラム設定の変更例については、[Column-level Settings](/engines/table-engines/mergetree-family/mergetree.md/#column-level-settings)を参照してください。

`IF EXISTS` 句が指定されている場合、カラムが存在しない場合はエラーは返されません。

型を変更すると、値はあたかも [toType](/sql-reference/functions/type-conversion-functions.md) 関数が適用されたかのように変換されます。デフォルト式のみが変更された場合、クエリは複雑な処理を行わず、ほとんど瞬時に完了します。

例：

``` sql
ALTER TABLE visits MODIFY COLUMN browser Array(String)
```

カラムの型を変更することは唯一の複雑なアクションです – これはデータのファイルの内容を変更します。大規模なテーブルでは、これには長い時間がかかる場合があります。

クエリはまた、`FIRST | AFTER` 句を使用してカラムの順序を変更できます。[ADD COLUMN](#add-column) の説明を参照してください。ただし、カラムの型はこの場合必須です。

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

`ALTER` クエリは原子的です。MergeTree テーブルの場合、ロックなしで実行されます。

カラムを変更するための `ALTER` クエリはレプリケートされます。指示は ZooKeeper に保存され、各レプリカがそれを適用します。すべての `ALTER` クエリは同じ順序で実行されます。クエリは、他のレプリカで適切なアクションが完了するのを待ちます。ただし、レプリケートテーブルのカラムを変更するクエリは中断でき、すべてのアクションは非同期に実行されます。

## MODIFY COLUMN REMOVE {#modify-column-remove}

カラムプロパティの1つを削除します：`DEFAULT`, `ALIAS`, `MATERIALIZED`, `CODEC`, `COMMENT`, `TTL`, `SETTINGS`。

構文：

```sql
ALTER TABLE table_name MODIFY COLUMN column_name REMOVE property;
```

**例**

TTLを削除：

```sql
ALTER TABLE table_with_ttl MODIFY COLUMN column_ttl REMOVE TTL;
```

**関連項目**

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

カラム設定をリセットし、テーブルの CREATE クエリのカラム式における設定宣言も削除します。

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

`DEFAULT` または `MATERIALIZED` 値式を持つカラムをマテリアライズします。`ALTER TABLE table_name ADD COLUMN column_name MATERIALIZED` を使用してマテリアライズされたカラムを追加する際、既存の行のマテリアライズされた値は自動的には充填されません。`MATERIALIZE COLUMN` ステートメントは、`DEFAULT` または `MATERIALIZED` 式が追加または更新された後に既存のカラムデータを再書き込みするために使用できます（これはメタデータの更新のみを行い、既存のデータは変更しません）。ソートキーにカラムをマテリアライズすることは無効な操作であることに注意してください。これはソート順序を壊す可能性があります。
[Mutation](/sql-reference/statements/alter/index.md#mutations)として実装されています。

新しいまたは更新された `MATERIALIZED` 値式を持つカラムの場合、すべての既存の行が再書き換えされます。

新しいまたは更新された `DEFAULT` 値式を持つカラムの場合、動作は ClickHouse バージョンによって異なります：
- ClickHouse < v24.2では、すべての既存の行が再書き換えされます。
- ClickHouse >= v24.2では、`DEFAULT` 値式を持つカラムの行値が挿入時に明示的に指定されたかどうかを区別します。値が明示的に指定されていた場合、ClickHouse はそのまま保持します。値が計算された場合、ClickHouse はそれを新しいまたは更新された `MATERIALIZED` 値式に変更します。

構文：

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE COLUMN col [IN PARTITION partition | IN PARTITION ID 'partition_id'];
```
- PARTITION を指定すると、指定されたパーティションのみでカラムがマテリアライズされます。

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

## 制限事項 {#limitations}

`ALTER` クエリは、ネストされたデータ構造内の別々の要素（カラム）を作成および削除できますが、全体のネストされたデータ構造を削除することはできません。ネストされたデータ構造を追加するには、`name.nested_name` のような名前のカラムを追加し、`Array(T)` の型を指定します。ネストされたデータ構造は、ドットの前に同じプレフィックスを持つ複数の配列カラムに相当します。

プライマリキーやサンプリングキーに含まれるカラムの削除はサポートされていません（`ENGINE` 式で使用されるカラム）。プライマリキーに含まれるカラムの型を変更することは、データが変更される原因とならない場合のみ可能です（たとえば、Enum に値を追加することや、`DateTime` から `UInt32` へ型を変更することは許可されています）。

`ALTER` クエリだけでは必要なテーブル変更が不十分な場合、新しいテーブルを作成し、[INSERT SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select) クエリを使用してデータをコピーし、その後 [RENAME](/sql-reference/statements/rename.md/#rename-table) クエリを使用してテーブルを切り替え、古いテーブルを削除することができます。

`ALTER` クエリは、テーブルのすべての読み取りおよび書き込みをブロックします。言い換えれば、長時間の `SELECT` が `ALTER` クエリの実行中に実行されている場合、`ALTER` クエリはそれが完了するのを待ちます。同時に、同じテーブルへの新しいすべてのクエリは、この `ALTER` が実行されている間待機します。

データを自分自身で保存しないテーブル（[Merge](/sql-reference/statements/alter/index.md) や [Distributed](/sql-reference/statements/alter/index.md) など）の場合、`ALTER` はテーブル構造を変更するだけで、従属テーブルの構造は変更しません。たとえば、`Distributed` テーブルに対して `ALTER` を実行すると、すべてのリモートサーバー上のテーブルに対しても `ALTER` を実行する必要があります。
