---
description: 'OPTIMIZE のドキュメント'
sidebar_label: 'OPTIMIZE'
sidebar_position: 47
slug: /sql-reference/statements/optimize
title: 'OPTIMIZE 文'
doc_type: 'reference'
---

このクエリは、テーブルのデータパーツに対して、スケジュールされていないマージ処理を開始しようとします。一般的に、`OPTIMIZE TABLE ... FINAL` は日常的なオペレーションではなく管理用途を想定した機能であるため、その使用は推奨していない点に注意してください（詳しくは[こちらのドキュメント](/optimize/avoidoptimizefinal)を参照してください）。

:::note
`OPTIMIZE` では `Too many parts` エラーを解消できません。
:::

**構文**

```sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

`OPTIMIZE` クエリは [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) ファミリー（[materialized views](/sql-reference/statements/create/view#materialized-view) を含む）および [Buffer](../../engines/table-engines/special/buffer.md) エンジンでサポートされています。他のテーブルエンジンはサポートされていません。

`OPTIMIZE` を [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md) ファミリーのテーブルエンジンで使用する場合、ClickHouse はマージ用のタスクを作成し、すべてのレプリカでの実行が完了するまで（[alter&#95;sync](/operations/settings/settings#alter_sync) 設定が `2` に設定されている場合）、または現在のレプリカでの実行が完了するまで（[alter&#95;sync](/operations/settings/settings#alter_sync) 設定が `1` に設定されている場合）待機します。

* 何らかの理由で `OPTIMIZE` がマージを実行しない場合、クライアントには通知されません。通知を有効にするには、[optimize&#95;throw&#95;if&#95;noop](/operations/settings/settings#optimize_throw_if_noop) 設定を使用します。
* `PARTITION` を指定した場合、指定したパーティションのみが最適化されます。[パーティション式の設定方法](alter/partition.md#how-to-set-partition-expression)。
* `FINAL` または `FORCE` を指定した場合、すべてのデータがすでに 1 つのパートにある場合でも最適化が実行されます。この動作は [optimize&#95;skip&#95;merged&#95;partitions](/operations/settings/settings#optimize_skip_merged_partitions) で制御できます。また、同時に他のマージが行われている場合でもマージが強制されます。
* `DEDUPLICATE` を指定した場合、完全に同一の行（by 句が指定されていない場合）は重複排除されます（すべてのカラムが比較されます）。これは MergeTree エンジンでのみ有効です。

[replication&#95;wait&#95;for&#95;inactive&#95;replica&#95;timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 設定で、非アクティブなレプリカが `OPTIMIZE` クエリを実行するのを待機する時間（秒）を指定できます。

:::note
`alter_sync` が `2` に設定されていて、`replication_wait_for_inactive_replica_timeout` 設定で指定された時間を超えても一部のレプリカがアクティブにならない場合、`UNFINISHED` という例外がスローされます。
:::

## BY 式 {#by-expression}

すべてのカラムではなく任意のカラム集合に対して重複排除を行いたい場合、カラムの一覧を明示的に指定するか、[`*`](../../sql-reference/statements/select/index.md#asterisk)、[`COLUMNS`](/sql-reference/statements/select#select-clause)、[`EXCEPT`](/sql-reference/statements/select/except-modifier) 式を任意に組み合わせて使用できます。明示的に記述した、または暗黙的に展開されたカラム一覧には、行の並び順を決める式（主キーとソートキーの両方）およびパーティション指定の式（パーティションキー）で指定されているすべてのカラムが含まれている必要があります。

:::note
`*` は `SELECT` とまったく同じように動作することに注意してください。[MATERIALIZED](/sql-reference/statements/create/view#materialized-view) および [ALIAS](../../sql-reference/statements/create/table.md#alias) カラムは展開には使用されません。

また、カラムの一覧として空のリストを指定したり、結果として空のカラム一覧になる式を書いたり、`ALIAS` カラムで重複排除を行うことはエラーとなります。
:::

**構文**

```sql
OPTIMIZE TABLE table DEDUPLICATE; -- all columns
OPTIMIZE TABLE table DEDUPLICATE BY *; -- excludes MATERIALIZED and ALIAS columns
OPTIMIZE TABLE table DEDUPLICATE BY colX,colY,colZ;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT (colX, colY);
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex');
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT (colX, colY);
```

**例**

次のテーブルを考えてみます。

```sql
CREATE TABLE example (
    primary_key Int32,
    secondary_key Int32,
    value UInt32,
    partition_key UInt32,
    materialized_value UInt32 MATERIALIZED 12345,
    aliased_value UInt32 ALIAS 2,
    PRIMARY KEY primary_key
) ENGINE=MergeTree
PARTITION BY partition_key
ORDER BY (primary_key, secondary_key);
```

```sql
INSERT INTO example (primary_key, secondary_key, value, partition_key)
VALUES (0, 0, 0, 0), (0, 0, 0, 0), (1, 1, 2, 2), (1, 1, 2, 3), (1, 1, 3, 3);
```

```sql
SELECT * FROM example;
```

結果:

```sql

┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
│           1 │             1 │     3 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

以下のすべての例は、5 行を持つこの状態に対して実行されます。

#### `DEDUPLICATE` {#deduplicate}

重複排除に使用するカラムが指定されていない場合、すべてのカラムが考慮されます。前の行の対応する値と、すべてのカラムにおいて値がすべて等しい場合にのみ、その行は削除されます。

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE;
```

```sql
SELECT * FROM example;
```

結果：

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
│           1 │             1 │     3 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY *` {#deduplicate-by-}

カラムが暗黙的に指定される場合、テーブルは `ALIAS` または `MATERIALIZED` ではないすべてのカラムで重複排除が行われます。上記のテーブルの場合、該当するのは `primary_key`、`secondary_key`、`value`、`partition_key` カラムです。

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY *;
```

```sql
SELECT * FROM example;
```

結果:

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
│           1 │             1 │     3 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY * EXCEPT` {#deduplicate-by--except}

`ALIAS` または `MATERIALIZED` ではなく、かつ明示的に `value` でもないすべてのカラム、すなわち `primary_key`、`secondary_key`、`partition_key` カラムを基準に重複排除を行います。

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY * EXCEPT value;
```

```sql
SELECT * FROM example;
```

結果：

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY <list of columns>` {#deduplicate-by-list-of-columns}

`primary_key`、`secondary_key`、`partition_key` カラムを指定して明示的に重複排除します：

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY primary_key, secondary_key, partition_key;
```

```sql
SELECT * FROM example;
```

結果：

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY COLUMNS(<regex>)` {#deduplicate-by-columnsregex}

`primary_key`、`secondary_key`、`partition_key` カラムなど、正規表現にマッチするすべてのカラムを対象に重複排除します。

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY COLUMNS('.*_key');
```

```sql
SELECT * FROM example;
```

結果：

```response
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           0 │             0 │     0 │             0 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             2 │
└─────────────┴───────────────┴───────┴───────────────┘
┌─primary_key─┬─secondary_key─┬─value─┬─partition_key─┐
│           1 │             1 │     2 │             3 │
└─────────────┴───────────────┴───────┴───────────────┘
```
