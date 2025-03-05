---
slug: /sql-reference/statements/optimize
sidebar_position: 47
sidebar_label: OPTIMIZE
title: "OPTIMIZE ステートメント"
---

このクエリは、テーブルのデータパーツの未スケジュールのマージを初期化しようとします。一般に、`OPTIMIZE TABLE ... FINAL` の使用は推奨していないことに注意してください（管理用の使用ケースを意味しており、日常的な操作用ではありません、詳細はこれらの [docs](/optimize/avoidoptimizefinal) を参照してください）。

:::note
`OPTIMIZE` は `Too many parts` エラーを修正できません。
:::

**構文**

``` sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

`OPTIMIZE` クエリは、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) ファミリー（[マテリアライズドビュー](../../sql-reference/statements/create/view.md#materialized-view)を含む）および [Buffer](../../engines/table-engines/special/buffer.md) エンジンでサポートされています。他のテーブルエンジンはサポートされていません。

`OPTIMIZE` を [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md) ファミリーのテーブルエンジンで使用すると、ClickHouse はマージのタスクを作成し、すべてのレプリカでの実行を待機します（[alter_sync](/operations/settings/settings#alter_sync) 設定が `2` に設定されている場合）または現在のレプリカでの実行を待機します（[alter_sync](/operations/settings/settings#alter_sync) 設定が `1` に設定されている場合）。

- もし `OPTIMIZE` が何らかの理由でマージを実行しない場合、クライアントには通知しません。通知を有効にするには、[optimize_throw_if_noop](../../operations/settings/settings.md#setting-optimize_throw_if_noop) 設定を使用してください。
- `PARTITION` を指定すると、指定されたパーティションのみが最適化されます。[パーティション式の設定方法](alter/partition.md#how-to-set-partition-expression)を参照してください。
- `FINAL` または `FORCE` を指定すると、すべてのデータがすでに一つのパーツにある場合でも最適化が行われます。この動作は [optimize_skip_merged_partitions](../../operations/settings/settings.md#optimize-skip-merged-partitions) で制御できます。また、同時にマージが行われている場合でも、マージは強制されます。
- `DEDUPLICATE` を指定すると、完全に同一の行（by-clause が指定されていない場合）がデデュプリケートされます（すべてのカラムが比較されます）。これは MergeTree エンジンにのみ意味があります。

非活性なレプリカが `OPTIMIZE` クエリを実行するまで待機する時間（秒数）を [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 設定で指定できます。

:::note    
`alter_sync` が `2` に設定されていて、いくつかのレプリカが `replication_wait_for_inactive_replica_timeout` 設定で指定された時間以上非活性である場合、例外 `UNFINISHED` がスローされます。
:::

## BY 式 {#by-expression}

デデュプリケーションを全てのカラムではなくカスタムセットのカラムに対して実行したい場合は、カラムのリストを明示的に指定するか、[`*`](../../sql-reference/statements/select/index.md#asterisk)、[`COLUMNS`](../../sql-reference/statements/select/index.md#columns-expression)、または [`EXCEPT`](../../sql-reference/statements/select/index.md#except-modifier) 式の任意の組み合わせを使用できます。明示的に書かれたリストまたは暗黙的に拡張されたカラムのリストは、行の順序付け式（主キーおよびソートキーの両方）とパーティション式（パーティションキー）のすべてのカラムを含む必要があります。

:::note    
`*` は `SELECT` と同じように機能します： [MATERIALIZED](../../sql-reference/statements/create/table.md#materialized) および [ALIAS](../../sql-reference/statements/create/table.md#alias) カラムは展開に使用されません。

また、空のカラムのリストを指定したり、空のカラムのリストを生成する式を書いたり、`ALIAS` カラムでデデュプリケートすることはエラーです。
:::

**構文**

``` sql
OPTIMIZE TABLE table DEDUPLICATE; -- 全カラム
OPTIMIZE TABLE table DEDUPLICATE BY *; -- MATERIALIZED および ALIAS カラムを除外
OPTIMIZE TABLE table DEDUPLICATE BY colX,colY,colZ;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY * EXCEPT (colX, colY);
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex');
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT colX;
OPTIMIZE TABLE table DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT (colX, colY);
```

**例**

テーブルを考えてみましょう：

``` sql
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

``` sql
INSERT INTO example (primary_key, secondary_key, value, partition_key)
VALUES (0, 0, 0, 0), (0, 0, 0, 0), (1, 1, 2, 2), (1, 1, 2, 3), (1, 1, 3, 3);
```

``` sql
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

すべての以下の例は、この状態に対して5行で実行されます。

#### `DEDUPLICATE` {#deduplicate}
デデュプリケーションのためにカラムが指定されていない場合、全てが考慮されます。行は、すべてのカラムの値が前の行の対応する値と同じである場合のみ削除されます：

``` sql
OPTIMIZE TABLE example FINAL DEDUPLICATE;
```

``` sql
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

カラムが暗黙的に指定された場合、テーブルは `ALIAS` または `MATERIALIZED` でないすべてのカラムでデデュプリケートされます。上記のテーブルを考慮すると、これらは `primary_key`、`secondary_key`、`value`、および `partition_key` カラムです：

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY *;
```

``` sql
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

#### `DEDUPLICATE BY * EXCEPT` {#deduplicate-by--except}
デデュプリケートは、`ALIAS` または `MATERIALIZED` でなく、明示的に `value` を除外したすべてのカラムに対して行います：`primary_key`、`secondary_key`、および `partition_key` カラム。

``` sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY * EXCEPT value;
```

``` sql
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

`primary_key`、`secondary_key`、および `partition_key` カラムで明示的にデデュプリケートします：

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY primary_key, secondary_key, partition_key;
```

``` sql
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

正規表現に一致するすべてのカラムでデデュプリケートします：`primary_key`、`secondary_key`、および `partition_key` カラム：

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY COLUMNS('.*_key');
```

``` sql
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
