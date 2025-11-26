---
description: 'OPTIMIZE のドキュメント'
sidebar_label: 'OPTIMIZE'
sidebar_position: 47
slug: /sql-reference/statements/optimize
title: 'OPTIMIZE ステートメント'
doc_type: 'reference'
---

このクエリは、テーブルのデータパーツに対するスケジュールされていないマージ処理を開始しようとします。一般的に、`OPTIMIZE TABLE ... FINAL` の使用は推奨されない点に注意してください（その用途は日常運用ではなく管理作業を想定しているためです。詳細は[こちらのドキュメント](/optimize/avoidoptimizefinal)を参照してください）。

:::note
`OPTIMIZE` では `Too many parts` エラーを解消できません。
:::

**構文**

```sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

`OPTIMIZE` クエリは、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) ファミリー（[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view) を含む）および [Buffer](../../engines/table-engines/special/buffer.md) エンジンでサポートされています。他のテーブルエンジンはサポートされていません。

`OPTIMIZE` が [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md) ファミリーのテーブルエンジンで使用される場合、ClickHouse はマージ用のタスクを作成し、すべてのレプリカで実行されるのを待機します（[alter&#95;sync](/operations/settings/settings#alter_sync) 設定が `2` に設定されている場合）、または現在のレプリカのみで実行されるのを待機します（[alter&#95;sync](/operations/settings/settings#alter_sync) 設定が `1` に設定されている場合）。

* 何らかの理由で `OPTIMIZE` がマージを実行しない場合でも、クライアントには通知されません。通知を有効にするには、[optimize&#95;throw&#95;if&#95;noop](/operations/settings/settings#optimize_throw_if_noop) 設定を使用します。
* `PARTITION` を指定した場合、そのパーティションのみが最適化されます。[パーティション式の設定方法](alter/partition.md#how-to-set-partition-expression)。
* `FINAL` または `FORCE` を指定した場合、すべてのデータがすでに 1 つのパーツにまとまっている場合でも最適化が実行されます。この動作は [optimize&#95;skip&#95;merged&#95;partitions](/operations/settings/settings#optimize_skip_merged_partitions) で制御できます。また、同時にマージが実行されている場合でもマージが強制されます。
* `DEDUPLICATE` を指定した場合、（by 句が指定されていない限り）完全に同一の行が重複排除されます（すべてのカラムが比較されます）。これは MergeTree エンジンに対してのみ有効です。

[replication&#95;wait&#95;for&#95;inactive&#95;replica&#95;timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 設定によって、非アクティブなレプリカが `OPTIMIZE` クエリを実行するのをどれだけ長く（秒数で）待機するかを指定できます。

:::note\
`alter_sync` が `2` に設定されていて、一部のレプリカが `replication_wait_for_inactive_replica_timeout` 設定で指定された時間よりも長く非アクティブな場合、`UNFINISHED` という例外がスローされます。
:::


## BY 式

すべての列ではなく任意の列の集合で重複排除を行いたい場合は、列の一覧を明示的に指定するか、[`*`](../../sql-reference/statements/select/index.md#asterisk)、[`COLUMNS`](/sql-reference/statements/select#select-clause)、[`EXCEPT`](/sql-reference/statements/select/except-modifier) 式を任意に組み合わせて使用できます。明示的に記述された、または暗黙的に展開された列の一覧には、行の順序付け式（プライマリキーとソートキーの両方）およびパーティション化式（パーティションキー）で指定されたすべての列が含まれていなければなりません。

:::note\
`*` は `SELECT` における挙動と同様である点に注意してください。[MATERIALIZED](/sql-reference/statements/create/view#materialized-view) 列および [ALIAS](../../sql-reference/statements/create/table.md#alias) 列は展開に使用されません。

また、空の列リストを指定したり、結果として空の列リストになる式を記述したり、`ALIAS` 列で重複排除を行うとエラーになります。
:::

**構文**

```sql
OPTIMIZE TABLE table DEDUPLICATE; -- すべての列
OPTIMIZE TABLE table DEDUPLICATE BY *; -- MATERIALIZED列とALIAS列を除外
OPTIMIZE TABLE table DEDUPLICATE BY colX,colY,colZ;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT (colX, colY);
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex');
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT (colX, colY);
```

**例**

次のテーブルを考えます。

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

以降のすべての例は、この 5 行の状態を前提として実行されます。

#### `DEDUPLICATE`

重複排除に使用する列を指定しない場合は、すべての列が対象になります。前の行の対応する列の値とすべての列の値が等しい場合にのみ、その行は削除されます。

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

#### `DEDUPLICATE BY *`

列が暗黙的に指定された場合、テーブルは `ALIAS` および `MATERIALIZED` 以外のすべての列で重複排除されます。上記のテーブルでは、対象となる列は `primary_key`、`secondary_key`、`value`、`partition_key` です。

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY *;
```

```sql
SELECT * FROM example;
```

結果:

```response
┌─主キー─┬─補助キー─┬─値─┬─パーティションキー─┐
│       1 │        1 │   2 │                2 │
└────────┴──────────┴─────┴──────────────────┘
┌─主キー─┬─補助キー─┬─値─┬─パーティションキー─┐
│       0 │        0 │   0 │                0 │
└────────┴──────────┴─────┴──────────────────┘
┌─主キー─┬─補助キー─┬─値─┬─パーティションキー─┐
│       1 │        1 │   2 │                3 │
│       1 │        1 │   3 │                3 │
└────────┴──────────┴─────┴──────────────────┘
```

#### `DEDUPLICATE BY * EXCEPT`

`ALIAS` または `MATERIALIZED` ではなく、かつ `value` でもないすべての列、すなわち `primary_key`、`secondary_key`、`partition_key` 列を基準として重複排除を行います。

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

#### `DEDUPLICATE BY <list of columns>`

`primary_key`、`secondary_key`、`partition_key` 列で明示的に重複排除を行います：

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

#### `DEDUPLICATE BY COLUMNS(<regex>)`

正規表現にマッチするすべてのカラム、つまり `primary_key`、`secondary_key`、`partition_key` カラムで重複排除を行います。

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
