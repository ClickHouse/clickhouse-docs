---
description: 'OPTIMIZE のドキュメント'
sidebar_label: 'OPTIMIZE'
sidebar_position: 47
slug: /sql-reference/statements/optimize
title: 'OPTIMIZE ステートメント'
doc_type: 'reference'
---

このクエリは、テーブルのデータパーツに対するスケジュールされていないマージを開始しようとします。なお、一般的には `OPTIMIZE TABLE ... FINAL` の使用は推奨していません（その利用ケースは日常運用ではなく管理作業向けであるため、[こちらのドキュメント](/optimize/avoidoptimizefinal) を参照してください）。

:::note
`OPTIMIZE` では `Too many parts` エラーは解消できません。
:::

**構文**

```sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

`OPTIMIZE` クエリは、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) ファミリー（[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view) を含む）および [Buffer](../../engines/table-engines/special/buffer.md) エンジンでサポートされています。他のテーブルエンジンはサポートされていません。

`OPTIMIZE` を [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md) ファミリーのテーブルエンジンで使用すると、ClickHouse はマージのタスクを作成し、すべてのレプリカでの実行（[alter&#95;sync](/operations/settings/settings#alter_sync) 設定が `2` に設定されている場合）、または現在のレプリカでの実行（[alter&#95;sync](/operations/settings/settings#alter_sync) 設定が `1` に設定されている場合）が完了するまで待機します。

* 何らかの理由で `OPTIMIZE` がマージを実行しない場合でも、クライアントに通知されません。通知を有効にするには、[optimize&#95;throw&#95;if&#95;noop](/operations/settings/settings#optimize_throw_if_noop) 設定を使用します。
* `PARTITION` を指定した場合、そのパーティションのみが最適化されます。[パーティション式の設定方法](alter/partition.md#how-to-set-partition-expression)。
* `FINAL` または `FORCE` を指定した場合、すべてのデータがすでに 1 つのパーツにまとまっている場合でも最適化が実行されます。この動作は [optimize&#95;skip&#95;merged&#95;partitions](/operations/settings/settings#optimize_skip_merged_partitions) によって制御できます。また、同時にマージが実行されている場合でもマージが強制されます。
* `DEDUPLICATE` を指定した場合、（by 句が指定されていない限り）完全に同一の行が重複排除されます（すべての列が比較されます）。これは MergeTree エンジンに対してのみ有効です。

[replication&#95;wait&#95;for&#95;inactive&#95;replica&#95;timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 設定により、非アクティブなレプリカが `OPTIMIZE` クエリを実行するまで何秒間待機するかを指定できます。

:::note\
`alter_sync` が `2` に設定されていて、いくつかのレプリカが `replication_wait_for_inactive_replica_timeout` 設定で指定された時間より長く非アクティブな場合、`UNFINISHED` という例外がスローされます。
:::


## BY式 {#by-expression}

すべての列ではなく、カスタムの列セットで重複排除を実行する場合は、列のリストを明示的に指定するか、[`*`](../../sql-reference/statements/select/index.md#asterisk)、[`COLUMNS`](/sql-reference/statements/select#select-clause)、または[`EXCEPT`](/sql-reference/statements/select/except-modifier)式の任意の組み合わせを使用できます。明示的に記述された、または暗黙的に展開された列のリストには、行順序式（プライマリキーとソートキーの両方）およびパーティション式（パーティションキー）で指定されたすべての列を含める必要があります。

:::note  
`*`は`SELECT`と同様に動作することに注意してください：[MATERIALIZED](/sql-reference/statements/create/view#materialized-view)列と[ALIAS](../../sql-reference/statements/create/table.md#alias)列は展開に使用されません。

また、空の列リストを指定したり、空の列リストになる式を記述したり、`ALIAS`列で重複排除を行うことはエラーになります。
:::

**構文**

```sql
OPTIMIZE TABLE table DEDUPLICATE; -- すべての列
OPTIMIZE TABLE table DEDUPLICATE BY *; -- MATERIALIZEDおよびALIAS列を除外
OPTIMIZE TABLE table DEDUPLICATE BY colX,colY,colZ;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT (colX, colY);
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex');
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT (colX, colY);
```

**例**

次のテーブルを考えます：

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

結果：

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

以下のすべての例は、5行を持つこの状態に対して実行されます。

#### `DEDUPLICATE` {#deduplicate}

重複排除の対象列が指定されていない場合、すべての列が考慮されます。行は、すべての列のすべての値が前の行の対応する値と等しい場合にのみ削除されます：

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

カラムが暗黙的に指定された場合、`ALIAS`または`MATERIALIZED`ではないすべてのカラムによってテーブルの重複排除が行われます。上記のテーブルの場合、これらは`primary_key`、`secondary_key`、`value`、および`partition_key`カラムです:

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

`ALIAS`または`MATERIALIZED`ではなく、かつ明示的に`value`を除外したすべてのカラム(`primary_key`、`secondary_key`、および`partition_key`カラム)によって重複排除を行います。

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

#### `DEDUPLICATE BY <list of columns>` {#deduplicate-by-list-of-columns}

`primary_key`、`secondary_key`、および`partition_key`カラムを明示的に指定して重複排除を行います:

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

正規表現に一致するすべてのカラムで重複排除します：`primary_key`、`secondary_key`、`partition_key` カラム：

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
