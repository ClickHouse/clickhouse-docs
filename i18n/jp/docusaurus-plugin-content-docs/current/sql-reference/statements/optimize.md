---
description: 'ドキュメントの最適化'
sidebar_label: 'OPTIMIZE'
sidebar_position: 47
slug: /sql-reference/statements/optimize
title: 'OPTIMIZEステートメント'
---

このクエリは、テーブルのデータパーツのスケジュールされていないマージを初期化しようとします。一般的に、`OPTIMIZE TABLE ... FINAL` の使用は推奨されておらず（詳細はこれらの [ドキュメント](/optimize/avoidoptimizefinal) を参照）、その用途は日常の操作ではなく管理目的に向けられています。

:::note
`OPTIMIZE` は `Too many parts` エラーを修正することはできません。
:::

**構文**

```sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

`OPTIMIZE` クエリは、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) ファミリー（[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)を含む）および [Buffer](../../engines/table-engines/special/buffer.md) エンジンでサポートされています。他のテーブルエンジンはサポートされません。

`OPTIMIZE` が [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md) ファミリーのテーブルエンジンと共に使用されると、ClickHouse はマージのためのタスクを作成し、すべてのレプリカでの実行を待機します（[alter_sync](/operations/settings/settings#alter_sync) 設定が `2` に設定されている場合）または現在のレプリカでのみ実行を待機します（[alter_sync](/operations/settings/settings#alter_sync) 設定が `1` に設定されている場合）。

- `OPTIMIZE` が何らかの理由でマージを実行しない場合、クライアントに通知はされません。通知を有効にするには、[optimize_throw_if_noop](/operations/settings/settings#optimize_throw_if_noop) 設定を使用します。
- `PARTITION` を指定した場合、指定したパーティションのみが最適化されます。[パーティション式の設定方法](alter/partition.md#how-to-set-partition-expression)を参照してください。
- `FINAL` または `FORCE` を指定した場合、すべてのデータがすでに1つのパートにある場合でも最適化が実行されます。この動作は [optimize_skip_merged_partitions](/operations/settings/settings#optimize_skip_merged_partitions) で制御できます。また、同時にマージが実行されている場合でもマージが強制されます。
- `DEDUPLICATE` を指定した場合、完全に同一の行（by句が指定されていない場合）は重複が排除されます（すべてのカラムが比較されます）。これは主に MergeTree エンジンに対して意味があります。

非アクティブなレプリカが `OPTIMIZE` クエリを実行するまでの待機時間（秒）を指定するには、[replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 設定を使用します。

:::note    
`alter_sync` が `2` に設定されている場合、いくつかのレプリカが `replication_wait_for_inactive_replica_timeout` 設定で指定された時間を超えてアクティブでない場合は、例外 `UNFINISHED` がスローされます。
:::

## BY 式 {#by-expression}

すべてのカラムではなくカスタムのカラムセットで重複排除を実行したい場合は、カラムのリストを明示的に指定するか、[`*`](../../sql-reference/statements/select/index.md#asterisk)、[`COLUMNS`](/sql-reference/statements/select#select-clause) または [`EXCEPT`](/sql-reference/statements/select#except) 式の任意の組み合わせを使用できます。明示的に記述されたまたは暗黙的に展開されたカラムのリストには、行の順序付け式（主キーおよびソートキー）およびパーティション式（パーティションキー）で指定されたすべてのカラムが含まれていなければなりません。

:::note    
`*` は `SELECT` のように動作することに注意してください: [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) および [ALIAS](../../sql-reference/statements/create/table.md#alias) カラムは展開に使用されません。

また、カラムの空のリストを指定したり、空のリストのカラムを生成する式を書くことはエラーです。また、`ALIAS` カラムで重複を排除することもできません。
:::

**構文**

```sql
OPTIMIZE TABLE table DEDUPLICATE; -- すべてのカラム
OPTIMIZE TABLE table DEDUPLICATE BY *; -- MATERIALIZED および ALIAS カラムを除外
OPTIMIZE TABLE table DEDUPLICATE BY colX,colY,colZ;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT (colX, colY);
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex');
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT (colX, colY);
```

**例**

テーブルを考えてみましょう:

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

以下のすべての例は、5行の状態に対して実行されます。

#### `DEDUPLICATE` {#deduplicate}
重複排除の対象カラムが指定されていない場合、すべてのカラムが考慮されます。行は、すべてのカラムの値が前の行の対応する値と等しい場合にのみ削除されます:

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE;
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

#### `DEDUPLICATE BY *` {#deduplicate-by-}

カラムが暗黙的に指定されると、テーブルは `ALIAS` または `MATERIALIZED` でないすべてのカラムで重複排除されます。上記のテーブルを考えると、これらは `primary_key`、`secondary_key`、`value`、および `partition_key` カラムです:

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
`ALIAS` または `MATERIALIZED` でないすべてのカラムから重複を排除し、明示的に `value` を除外します: `primary_key`、`secondary_key`、および `partition_key` カラム。

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY * EXCEPT value;
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
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY <カラムのリスト>` {#deduplicate-by-list-of-columns}

`primary_key`、`secondary_key`、および `partition_key` カラムで明示的に重複を排除します:

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY primary_key, secondary_key, partition_key;
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
└─────────────┴───────────────┴───────┴───────────────┘
```

#### `DEDUPLICATE BY COLUMNS(<regex>)` {#deduplicate-by-columnsregex}

正規表現に一致するすべてのカラムで重複を排除します: `primary_key`、`secondary_key`、および `partition_key` カラム:

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY COLUMNS('.*_key');
```

```sql
SELECT * FROM example;
```

結果:

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
