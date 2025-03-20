---
slug: '/sql-reference/statements/optimize'
sidebar_position: 47
sidebar_label: 'OPTIMIZE'
title: 'OPTIMIZE ステートメント'
---

このクエリは、テーブルのデータパーツのスケジュールされていないマージを初期化しようとします。一般的に `OPTIMIZE TABLE ... FINAL` の使用はおすすめしません（管理目的での使用が想定されているため、日常的な操作には向いていません。詳しくはこれらの [ドキュメント](/optimize/avoidoptimizefinal) を参照してください）。

:::note
`OPTIMIZE` は `Too many parts` エラーを修正することはできません。
:::

**構文**

``` sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

`OPTIMIZE` クエリは、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) ファミリー（[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)を含む）および [Buffer](../../engines/table-engines/special/buffer.md) エンジンでサポートされています。他のテーブルエンジンはサポートされていません。

`OPTIMIZE` が [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md) ファミリーのテーブルエンジンと共に使用されると、ClickHouse はマージのタスクを作成し、すべてのレプリカで実行を待機します（[alter_sync](/operations/settings/settings#alter_sync) 設定が `2` に設定されている場合）または現在のレプリカで実行を待機します（[alter_sync](/operations/settings/settings#alter_sync) 設定が `1` に設定されている場合）。

- 理由により `OPTIMIZE` がマージを実行しない場合、クライアントに通知されません。通知を有効にするには、[optimize_throw_if_noop](/operations/settings/settings#optimize_throw_if_noop) 設定を使用してください。
- `PARTITION` を指定すると、指定されたパーティションのみが最適化されます。[パーティション式の設定方法](alter/partition.md#how-to-set-partition-expression)を参照してください。
- `FINAL` または `FORCE` を指定すると、すべてのデータがすでに1つのパーツにある場合でも最適化が実行されます。この動作は [optimize_skip_merged_partitions](/operations/settings/settings#optimize_skip_merged_partitions) によって制御できます。また、同時にマージが実行されていても強制的にマージされます。
- `DEDUPLICATE` を指定すると、完全に同一の行（by句が指定されていない場合）は重複が排除されます（すべてのカラムが比較されます）。これは MergeTree エンジンに対してのみ意味があります。

非アクティブなレプリカが `OPTIMIZE` クエリを実行するのを待つ時間（秒）を指定するには、[replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 設定を使用してください。

:::note    
`alter_sync` が `2` に設定されていて、いくつかのレプリカが `replication_wait_for_inactive_replica_timeout` 設定によって指定された時間を超えてアクティブでない場合、例外 `UNFINISHED` がスローされます。
:::

## BY 式 {#by-expression}

重複排除をすべてのカラムではなく、カスタムのカラムセットに対して実行したい場合は、カラムのリストを明示的に指定するか、[`*`](../../sql-reference/statements/select/index.md#asterisk)、[`COLUMNS`](/sql-reference/statements/select#select-clause) または [`EXCEPT`](/sql-reference/statements/select#except) 式の組み合わせを使用できます。明示的に書かれたカラムのリストまたは暗黙の拡張リストは、行順序式（主キーおよびソートキーの両方）とパーティション式（パーティションキー）で指定されたすべてのカラムを含める必要があります。

:::note    
`*` は `SELECT` と同様に動作します： [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) と [ALIAS](../../sql-reference/statements/create/table.md#alias) のカラムは展開に使用されません。

また、空のカラムリストを指定したり、空のカラムリストを生成する式を書いたり、`ALIAS` カラムで重複排除をすることはエラーです。
:::

**構文**

``` sql
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

以下の例はすべて5行の状態に対して実行されます。

#### `DEDUPLICATE` {#deduplicate}
重複排除のカラムが指定されていない場合は、すべてのカラムが考慮されます。行は、すべてのカラムの値が前の行の対応する値と等しい場合にのみ削除されます：

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

カラムが暗黙的に指定された場合、テーブルは `ALIAS` または `MATERIALIZED` ではないすべてのカラムで重複排除されます。上記のテーブルを考慮すると、これらは `primary_key`、`secondary_key`、`value`、および `partition_key` カラムです：

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
重複排除は、`ALIAS` または `MATERIALIZED` ではなく、明示的に `value` を除外したすべてのカラム（`primary_key`、`secondary_key`、`partition_key` カラム）で行われます。

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

`primary_key`、`secondary_key`、および `partition_key` カラムで明示的に重複排除します：

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

正規表現に一致するすべてのカラムで重複排除を実行します：`primary_key`、`secondary_key`、および `partition_key` カラム：

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
