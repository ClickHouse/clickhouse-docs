---
description: 'Column に関するドキュメント'
sidebar_label: 'COLUMN'
sidebar_position: 37
slug: /sql-reference/statements/alter/column
title: 'カラム操作'
doc_type: 'reference'
---

テーブルの構造を変更するためのクエリの集合。

構文:

```sql
ALTER [TEMPORARY] TABLE [db].name [ON CLUSTER cluster] ADD|DROP|RENAME|CLEAR|COMMENT|{MODIFY|ALTER}|MATERIALIZE COLUMN ...
```

クエリでは、1つ以上のアクションをカンマ区切りのリストとして指定します。
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
* [MATERIALIZE COLUMN](#materialize-column) — 列が存在しないパーツでその列をマテリアライズします。

これらのアクションについては、以下で詳しく説明します。

## ADD COLUMN（列を追加） {#add-column}

```sql
ADD COLUMN [IF NOT EXISTS] name [type] [default_expr] [codec] [AFTER name_after | FIRST]
```

指定された `name`、`type`、[`codec`](../create/table.md/#column_compression_codec)、および `default_expr`（[デフォルト式](/sql-reference/statements/create/table#default_values) セクションを参照）を持つ新しい列をテーブルに追加します。

`IF NOT EXISTS` 句を含めると、列がすでに存在している場合でもクエリはエラーを返しません。`AFTER name_after`（別の列の名前）を指定すると、その列の直後に列がテーブル列リスト内で追加されます。テーブルの先頭に列を追加したい場合は `FIRST` 句を使用します。そうでない場合、列はテーブルの末尾に追加されます。一連の操作として複数のアクションを実行する場合、`name_after` には、前のアクションのいずれかで追加された列名を指定できます。

列を追加しても、テーブル構造だけが変更され、データに対してはいかなる操作も行われません。`ALTER` の直後にはデータはディスク上に保存されません。テーブルから読み取る際に列のデータが存在しない場合、それはデフォルト値で補完されます（デフォルト式があればそれを評価し、なければゼロまたは空文字列を使用します）。列は、データパーツがマージされた後にディスク上に現れます（[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) を参照）。

このアプローチにより、既存データの容量を増やすことなく、`ALTER` クエリを即座に完了できます。

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

`name` という名前の列を削除します。`IF EXISTS` 句が指定されている場合、その列が存在しなくてもクエリはエラーを返しません。

ファイルシステムからデータを削除します。これはファイル全体を削除するため、クエリはほぼ瞬時に完了します。

:::tip
[マテリアライズドビュー](/sql-reference/statements/create/view) で参照されている列は削除できません。削除しようとするとエラーが返されます。
:::

例:

```sql
ALTER TABLE visits DROP COLUMN browser
```

## 列名を変更する {#rename-column}

```sql
RENAME COLUMN [IF EXISTS] name to new_name
```

カラム `name` を `new_name` にリネームします。`IF EXISTS` 句が指定されている場合、そのカラムが存在しなくてもクエリはエラーになりません。リネームは実データを変更しないため、クエリはほぼ即時に完了します。

**注意**: テーブルのキー式（`ORDER BY` または `PRIMARY KEY`）で指定されているカラムはリネームできません。これらのカラムを変更しようとすると、`SQL Error [524]` が発生します。

例:

```sql
ALTER TABLE visits RENAME COLUMN webBrowser TO browser
```

## CLEAR COLUMN {#clear-column}

```sql
CLEAR COLUMN [IF EXISTS] name IN PARTITION partition_name
```

指定したパーティションのその列にあるすべてのデータをリセットします。パーティション名の設定方法については、[パーティション式の設定方法](../alter/partition.md/#how-to-set-partition-expression) セクションを参照してください。

`IF EXISTS` 句が指定されている場合、その列が存在しなくてもクエリはエラーを返しません。

例：

```sql
ALTER TABLE visits CLEAR COLUMN browser IN PARTITION tuple()
```

## COMMENT 列 {#comment-column}

```sql
COMMENT COLUMN [IF EXISTS] name 'テキストコメント'
```

カラムにコメントを追加します。`IF EXISTS` 句が指定されている場合、カラムが存在しない場合でもクエリはエラーを返しません。

各カラムには 1 つだけコメントを設定できます。すでにコメントが存在する場合は、新しいコメントが既存のコメントを上書きします。

コメントは、[DESCRIBE TABLE](/sql-reference/statements/describe-table.md) クエリで返される `comment_expression` カラムに保存されます。

例:

```sql
ALTER TABLE visits COMMENT COLUMN browser 'この列はサイトへのアクセスに使用されたブラウザを表示します。'
```

## MODIFY COLUMN {#modify-column}

```sql
MODIFY COLUMN [IF EXISTS] name [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
ALTER COLUMN [IF EXISTS] name TYPE [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
```

このクエリは `name` 列のプロパティを変更します：

* 型

* デフォルト式

* 圧縮コーデック

* TTL

* 列レベルの設定

列の圧縮コーデックの変更例については、[Column Compression Codecs](../create/table.md/#column_compression_codec) を参照してください。

列の TTL の変更例については、[Column TTL](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-column-ttl) を参照してください。

列レベルの設定の変更例については、[Column-level Settings](/engines/table-engines/mergetree-family/mergetree.md/#column-level-settings) を参照してください。

`IF EXISTS` 句が指定されている場合、列が存在しなくてもクエリはエラーになりません。

型を変更する際、値はそれらに [toType](/sql-reference/functions/type-conversion-functions.md) 関数が適用されたかのように変換されます。デフォルト式だけを変更する場合、このクエリは複雑な処理を行わず、ほぼ即時に完了します。

例：

```sql
ALTER TABLE visits MODIFY COLUMN browser Array(String)
```

カラム型の変更のみが複雑な操作になります。これはデータを含むファイルの内容を変更します。大きなテーブルでは、この処理に長い時間がかかる場合があります。

このクエリは、`FIRST | AFTER` 句を使用してカラムの順序を変更することもできます。詳細は [ADD COLUMN](#add-column) の説明を参照してください。ただし、この場合はカラム型の指定が必須です。

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

`ALTER` クエリはアトミックです。MergeTree テーブルの場合はロックフリーでもあります。

カラムを変更するための `ALTER` クエリはレプリケートされます。命令は ZooKeeper に保存され、その後各レプリカがそれを適用します。すべての `ALTER` クエリは同じ順序で実行されます。クエリは、他のレプリカ上で対応する処理が完了するのを待機します。ただし、レプリケートされたテーブルのカラムを変更するクエリは中断される可能性があり、その場合はすべての処理が非同期に実行されます。

:::note
`Nullable` カラムを `Non-Nullable` に変更する際は注意してください。カラム内に `NULL` 値が含まれていないことを必ず確認してください。そうでない場合、そのカラムから読み込む際に問題が発生します。その場合の回避策としては、`KILL MUTATION` を実行して mutation を停止し、カラムを `Nullable` 型に戻してください。
:::

## MODIFY COLUMN REMOVE {#modify-column-remove}

次の列プロパティのいずれかを削除します: `DEFAULT`, `ALIAS`, `MATERIALIZED`, `CODEC`, `COMMENT`, `TTL`, `SETTINGS`。

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

* [REMOVE TTL](ttl.md)

## MODIFY COLUMN MODIFY SETTING — 列設定の変更 {#modify-column-modify-setting}

列の設定を変更します。

構文:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING name=value,...;
```

**例**

列の `max_compress_block_size` を `1MB` に変更します。

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING max_compress_block_size = 1048576;
```

## MODIFY COLUMN RESET SETTING {#modify-column-reset-setting}

列の設定をリセットします。また、テーブルの CREATE クエリ内の列式から、その設定の宣言も削除します。

構文:

```sql
ALTER TABLE テーブル名 MODIFY COLUMN カラム名 RESET SETTING 設定名,...;
```

**例**

カラム設定 `max_compress_block_size` をデフォルト値にリセットする:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING max_compress_block_size;
```

## MATERIALIZE COLUMN {#materialize-column}

`DEFAULT` または `MATERIALIZED` の値式を持つカラムをマテリアライズします。`ALTER TABLE table_name ADD COLUMN column_name MATERIALIZED` を使用してマテリアライズされたカラムを追加する場合、マテリアライズされた値を持たない既存の行は自動的には埋められません。`MATERIALIZE COLUMN` 文は、`DEFAULT` または `MATERIALIZED` の式が追加または更新された後（この操作はメタデータのみを更新し、既存データは変更しない）、既存のカラムデータを書き換えるために使用できます。ソートキー内のカラムをマテリアライズすることは、ソート順を破壊しうるため無効な操作である点に注意してください。
[mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

新規または更新された `MATERIALIZED` 値式を持つカラムについては、すべての既存の行が書き換えられます。

新規または更新された `DEFAULT` 値式を持つカラムについては、その動作は ClickHouse のバージョンに依存します。

* ClickHouse &lt; v24.2 では、すべての既存の行が書き換えられます。
* ClickHouse &gt;= v24.2 では、`DEFAULT` 値式を持つカラムの行の値が挿入時に明示的に指定されたか、`DEFAULT` 値式から計算されたかを区別します。値が明示的に指定されていた場合、ClickHouse はそのまま保持します。値が計算されていた場合、ClickHouse はそれを新規または更新された `MATERIALIZED` 値式に基づく値に変更します。

構文:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE COLUMN col [IN PARTITION partition | IN PARTITION ID 'partition_id'];
```

* PARTITION を指定した場合、列は指定したパーティションに対してのみマテリアライズされます。

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

* [MATERIALIZED](/sql-reference/statements/create/view#materialized-view)

## 制限事項 {#limitations}

`ALTER` クエリでは、ネストされたデータ構造内の個々の要素（カラム）の作成および削除はできますが、ネストされたデータ構造全体の作成や削除はできません。ネストされたデータ構造を追加するには、`name.nested_name` のような名前と型 `Array(T)` を持つカラムを追加します。ネストされたデータ構造は、「ドットの前のプレフィックスが同じ名前」を持つ複数の配列カラムと同等です。

プライマリキーまたはサンプリングキー（`ENGINE` 式で使用されるカラム）に含まれるカラムの削除はサポートされていません。プライマリキーに含まれているカラムの型変更は、その変更によってデータが変更されない場合にのみ可能です（たとえば、Enum に値を追加する、または型を `DateTime` から `UInt32` に変更することは許可されています）。

必要なテーブル変更を `ALTER` クエリだけで実現できない場合は、新しいテーブルを作成し、[INSERT SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select) クエリを使用してデータをコピーし、その後 [RENAME](/sql-reference/statements/rename.md/#rename-table) クエリを使用してテーブルを切り替え、古いテーブルを削除できます。

`ALTER` クエリは、そのテーブルに対するすべての読み書きをブロックします。言い換えると、`ALTER` クエリの実行時に長時間実行される `SELECT` がある場合、`ALTER` クエリはそれが完了するまで待機します。同時に、同じテーブルに対する新しいクエリも、この `ALTER` が実行中の間は待機します。

自分自身ではデータを保持しないテーブル（[Merge](/sql-reference/statements/alter/index.md) や [Distributed](/sql-reference/statements/alter/index.md) など）の場合、`ALTER` はテーブル構造のみを変更し、従属テーブルの構造は変更しません。たとえば、`Distributed` テーブルに対して `ALTER` を実行する場合、すべてのリモートサーバー上のテーブルに対しても `ALTER` を実行する必要があります。
