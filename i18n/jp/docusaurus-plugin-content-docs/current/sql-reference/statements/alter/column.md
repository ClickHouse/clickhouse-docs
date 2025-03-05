---
slug: /sql-reference/statements/alter/column
sidebar_position: 37
sidebar_label: COLUMN
title: "カラム操作"
---

テーブル構造を変更するための一連のクエリ。

構文:

``` sql
ALTER [TEMPORARY] TABLE [db].name [ON CLUSTER cluster] ADD|DROP|RENAME|CLEAR|COMMENT|{MODIFY|ALTER}|MATERIALIZE COLUMN ...
```

クエリには、1つ以上のカンマ区切りのアクションのリストを指定します。
各アクションはカラムに対する操作です。

以下のアクションがサポートされています：

- [ADD COLUMN](#add-column) — テーブルに新しいカラムを追加します。
- [DROP COLUMN](#drop-column) — カラムを削除します。
- [RENAME COLUMN](#rename-column) — 既存のカラムの名前を変更します。
- [CLEAR COLUMN](#clear-column) — カラムの値をリセットします。
- [COMMENT COLUMN](#comment-column) — カラムにテキストコメントを追加します。
- [MODIFY COLUMN](#modify-column) — カラムのタイプ、デフォルト式、TTL、およびカラム設定を変更します。
- [MODIFY COLUMN REMOVE](#modify-column-remove) — カラムプロパティの1つを削除します。
- [MODIFY COLUMN MODIFY SETTING](#modify-column-modify-setting) - カラムの設定を変更します。
- [MODIFY COLUMN RESET SETTING](#modify-column-reset-setting) - カラムの設定をリセットします。
- [MATERIALIZE COLUMN](#materialize-column) — カラムが欠けているパーツにカラムをマテリアライズします。
これらのアクションについては、以下で詳細に説明します。

## ADD COLUMN {#add-column}

``` sql
ADD COLUMN [IF NOT EXISTS] name [type] [default_expr] [codec] [AFTER name_after | FIRST]
```

指定された `name`、`type`、[`codec`](../create/table.md/#column_compression_codec) および `default_expr` (セクション [デフォルト式](/sql-reference/statements/create/table.md/#create-default-values)を参照) を使用して、テーブルに新しいカラムを追加します。

`IF NOT EXISTS`句が含まれる場合、カラムが既に存在する場合はクエリがエラーを返しません。`AFTER name_after` (他のカラムの名前) を指定すると、カラムは指定されたカラムの後に追加されます。テーブルの先頭にカラムを追加したい場合は、`FIRST`句を使用します。それ以外の場合、カラムはテーブルの末尾に追加されます。一連の操作の中で、`name_after`は以前の操作で追加されたカラムの名前であることができます。

カラムを追加することは、データに対していかなる操作も行わずにテーブル構造を変更するだけです。`ALTER`の後、ディスク上にデータは表れません。テーブルから読み取る際にカラムのデータが欠けている場合は、デフォルト値で埋められます（デフォルト式がある場合はそれを実行し、なければ0や空の文字列を使用します）。カラムはデータパーツをマージした後(詳細は [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)) にディスク上に現れます。

このアプローチにより、古いデータの量を増やすことなく、`ALTER`クエリを瞬時に完了することができます。

例:

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

名前 `name` のカラムを削除します。`IF EXISTS`句が指定されている場合、カラムが存在しない場合はクエリがエラーを返しません。

ファイルシステムからデータを削除します。これは全ファイルを削除するため、クエリはほぼ瞬時に完了します。

:::tip
[マテリアライズドビュー](/sql-reference/statements/create/view)によって参照されているカラムは削除できません。それ以外の場合はエラーが返されます。
:::

例:

``` sql
ALTER TABLE visits DROP COLUMN browser
```

## RENAME COLUMN {#rename-column}

``` sql
RENAME COLUMN [IF EXISTS] name to new_name
```

カラム `name` の名前を `new_name` に変更します。`IF EXISTS`句が指定されている場合、カラムが存在しない場合はクエリがエラーを返しません。名前変更は基盤となるデータを含まないため、クエリはほぼ瞬時に完了します。

**注**: テーブルのキー式で指定されているカラム ( `ORDER BY` または `PRIMARY KEY` で) は名前を変更できません。これらのカラムを変更しようとすると、`SQL Error [524]` が発生します。

例:

``` sql
ALTER TABLE visits RENAME COLUMN webBrowser TO browser
```

## CLEAR COLUMN {#clear-column}

``` sql
CLEAR COLUMN [IF EXISTS] name IN PARTITION partition_name
```

指定されたパーティションのカラム内のすべてのデータをリセットします。パーティション名の設定については、[パーティション式の設定方法](../alter/partition.md/#how-to-set-partition-expression)のセクションを参照してください。

`IF EXISTS`句が指定されている場合、カラムが存在しない場合はクエリがエラーを返しません。

例:

``` sql
ALTER TABLE visits CLEAR COLUMN browser IN PARTITION tuple()
```

## COMMENT COLUMN {#comment-column}

``` sql
COMMENT COLUMN [IF EXISTS] name 'テキストコメント'
```

カラムにコメントを追加します。`IF EXISTS`句が指定されている場合、カラムが存在しない場合はクエリがエラーを返しません。

各カラムには1つのコメントのみ持つことができます。カラムに既にコメントが存在する場合、新しいコメントが前のコメントを上書きします。

コメントは、[DESCRIBE TABLE](/sql-reference/statements/describe-table.md)クエリで返される `comment_expression` カラムに保存されます。

例:

``` sql
ALTER TABLE visits COMMENT COLUMN browser 'このカラムは、サイトにアクセスするために使用されたブラウザを示します。'
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

カラムの圧縮 CODECS 修正の例については、[カラム圧縮コーデックス](../create/table.md/#column_compression_codec)を参照してください。

カラムの TTL 修正の例については、[カラム TTL](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-column-ttl)を参照してください。

カラムレベルの設定修正の例については、[カラムレベルの設定](/engines/table-engines/mergetree-family/mergetree.md/#column-level-settings)を参照してください。

`IF EXISTS`句が指定されている場合、カラムが存在しない場合はクエリがエラーを返しません。

タイプを変更する際、値は[toType](/sql-reference/functions/type-conversion-functions.md)関数が適用されるかのように変換されます。デフォルト式のみが変更された場合、クエリは複雑な操作を行わず、ほぼ瞬時に完了します。

例:

``` sql
ALTER TABLE visits MODIFY COLUMN browser Array(String)
```

カラムタイプの変更は唯一の複雑な操作であり、ファイル内のデータの内容を変更します。大規模なテーブルの場合、これには長い時間がかかることがあります。

クエリはまた、`FIRST | AFTER`句を使用してカラムの順序を変更できます。これは[ADD COLUMN](#add-column)の説明を参照してくださいが、この場合はカラムタイプが必須です。

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

カラムを変更するための `ALTER` クエリはレプリケーションされます。命令はZooKeeperに保存され、各レプリカはそれを適用します。すべての `ALTER` クエリは同じ順序で実行されます。クエリは他のレプリカで適切なアクションが完了するのを待ちます。ただし、レプリケーショントテーブルのカラムを変更するためのクエリは中断される可能性があり、すべてのアクションは非同期で実行されます。

## MODIFY COLUMN REMOVE {#modify-column-remove}

カラムプロパティの1つを削除します：`DEFAULT`、`ALIAS`、`MATERIALIZED`、`CODEC`、`COMMENT`、`TTL`、`SETTINGS`。

構文:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name REMOVE property;
```

**例**

TTLを削除:

```sql
ALTER TABLE table_with_ttl MODIFY COLUMN column_ttl REMOVE TTL;
```

**関連情報**

- [REMOVE TTL](ttl.md)。

## MODIFY COLUMN MODIFY SETTING {#modify-column-modify-setting}

カラム設定を変更します。

構文:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING name=value,...;
```

**例**

カラムの `max_compress_block_size` を `1MB` に変更:

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

カラム設定 `max_compress_block_size` をデフォルト値にリセット:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING max_compress_block_size;
```

## MATERIALIZE COLUMN {#materialize-column}

`DEFAULT`または`MATERIALIZED`値式を持つカラムをマテリアライズします。 `ALTER TABLE table_name ADD COLUMN column_name MATERIALIZED`を使用してマテリアライズドカラムを追加する際、マテリアライズされた値を持たない既存の行は自動的には埋められません。`MATERIALIZE COLUMN` ステートメントは、`DEFAULT` または `MATERIALIZED` 式が追加または更新された後に既存のカラムデータを書き換えるために使用できます（これによりメタデータのみが更新され、既存のデータは変更されません）。ソートキーにカラムをマテリアライズすることは無効な操作であるため、ソート順序が破損する可能性があります。
これは[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

新しいまたは更新された `MATERIALIZED` 値式を持つカラムについては、すべての既存の行が書き換えられます。

新しいまたは更新された `DEFAULT` 値式を持つカラムについては、動作は ClickHouse バージョンによって異なります：
- ClickHouse < v24.2 の場合、すべての既存の行が書き換えられます。
- ClickHouse >= v24.2 では、`DEFAULT` 値式を持つカラムの行値が挿入時に明示的に指定されたかどうかを区別します。値が明示的に指定された場合、ClickHouse はそのまま保持します。値が計算された場合、ClickHouse はそれを新しいまたは更新された `MATERIALIZED` 値式に変更します。

構文:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE COLUMN col [IN PARTITION partition | IN PARTITION ID 'partition_id'];
```
- PARTITIONを指定した場合、カラムは指定されたパーティションのみでマテリアライズされます。

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

## 制限事項 {#limitations}

`ALTER`クエリは、ネストされたデータ構造における個別の要素（カラム）の作成と削除を可能にしますが、全体のネストされたデータ構造は削除できません。ネストされたデータ構造を追加するには、名前 `name.nested_name` とタイプ `Array(T)` を持つカラムを追加することができます。ネストされたデータ構造は、ドットの前に同じプレフィックスを持つ複数の配列カラムに相当します。

プライマリキーやサンプリングキーに含まれるカラムの削除はサポートされていません（`ENGINE`式に使用されているカラム）。プライマリキーに含まれるカラムのタイプ変更は、データが変更されない場合に限りのみ可能です（例えば、Enum に値を追加することや、タイプを `DateTime` から `UInt32` に変更することは許可されています）。

必要なテーブルの変更を行うために `ALTER` クエリが不十分な場合は、新しいテーブルを作成し、[INSERT SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select)クエリを使用してデータをコピーし、その後、[RENAME](/sql-reference/statements/rename.md/#rename-table)クエリを使用してテーブルを切り替え、古いテーブルを削除することができます。

`ALTER` クエリは、テーブルに対するすべての読み取りおよび書き込みをブロックします。言い換えれば、`ALTER` クエリの実行中に長い `SELECT` が実行されている場合、その `ALTER` クエリは完了するまで待ちます。同時に、同じテーブルへのすべての新しいクエリは、この `ALTER` が実行されている間、待つことになります。

データを自ら保存しないテーブル（[Merge](/sql-reference/statements/alter/index.md) や [Distributed](/sql-reference/statements/alter/index.md) など）に対しては、`ALTER` はテーブルの構造を変更するだけであり、下位テーブルの構造は変更されません。例えば、`Distributed` テーブルのために `ALTER` を実行する場合、すべてのリモートサーバーのテーブルに対しても `ALTER` を実行する必要があります。
