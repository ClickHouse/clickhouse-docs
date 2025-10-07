---
'description': 'Optimizeに関するドキュメント'
'sidebar_label': 'OPTIMIZE'
'sidebar_position': 47
'slug': '/sql-reference/statements/optimize'
'title': 'OPTIMIZE ステートメント'
'doc_type': 'reference'
---

このクエリは、テーブルのデータパーツのスケジュールされていないマージを初期化しようとします。一般的には、管理目的での使用が推奨されているため、通常の操作には `OPTIMIZE TABLE ... FINAL` の使用を避けることをお勧めします（詳細は[こちらのドキュメント](/optimize/avoidoptimizefinal)を参照してください）。

:::note
`OPTIMIZE` は `Too many parts` エラーを修正できません。
:::

**構文**

```sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

`OPTIMIZE` クエリは、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) ファミリー（[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)を含む）および [Buffer](../../engines/table-engines/special/buffer.md) エンジンでサポートされています。他のテーブルエンジンはサポートされていません。

`OPTIMIZE` が [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md) ファミリーのテーブルエンジンと共に使用される場合、ClickHouse はマージのためのタスクを作成し、すべてのレプリカ（[alter_sync](/operations/settings/settings#alter_sync) 設定が `2` に設定されている場合）または現在のレプリカ（[alter_sync](/operations/settings/settings#alter_sync) 設定が `1` に設定されている場合）の実行を待ちます。

- `OPTIMIZE` が何らかの理由でマージを行わない場合、クライアントには通知されません。通知を有効にするには、[optimize_throw_if_noop](/operations/settings/settings#optimize_throw_if_noop) 設定を使用します。
- `PARTITION` を指定した場合は、指定されたパーティションのみが最適化されます。[パーティションの式の設定方法](alter/partition.md#how-to-set-partition-expression)を参照してください。
- `FINAL` または `FORCE` を指定した場合、すべてのデータがすでに1つのパートに存在する場合でも最適化が実行されます。この動作は [optimize_skip_merged_partitions](/operations/settings/settings#optimize_skip_merged_partitions) で制御できます。また、同時に他のマージが実行されている場合でもマージが強制されます。
- `DEDUPLICATE` を指定した場合、完全に同一の行（by-clause が指定されていない場合）は重複排除されます（すべてのカラムが比較されます）。これは MergeTree エンジンにのみ意味があります。

非アクティブなレプリカが `OPTIMIZE` クエリを実行するまでの待機時間（秒単位）を [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 設定で指定できます。

:::note    
`alter_sync` が `2` に設定されている場合、いくつかのレプリカが `replication_wait_for_inactive_replica_timeout` 設定で指定された時間を超えてアクティブでない場合、例外 `UNFINISHED` がスローされます。
:::

## BY 式 {#by-expression}

重複排除をすべてのカラムではなくカスタムセットのカラムに対して実行したい場合、カラムのリストを明示的に指定するか、[`*`](../../sql-reference/statements/select/index.md#asterisk)、[`COLUMNS`](/sql-reference/statements/select#select-clause) または [`EXCEPT`](/sql-reference/statements/select/except-modifier) 式の任意の組み合わせを使用できます。明示的に書かれたか、暗黙的に展開されたカラムのリストには、行の順序付け式に指定されたすべてのカラム（主キーおよびソートキーの両方）とパーティション式（パーティションキー）が含まれている必要があります。

:::note    
`*` は `SELECT` の場合と同様に動作します： [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) および [ALIAS](../../sql-reference/statements/create/table.md#alias) カラムは展開に使用されません。

空のカラムリストを指定したり、空のカラムリストを生成する式を記述したり、`ALIAS` カラムで重複排除を行うことはエラーです。
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

テーブルを考えます：

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

すべての次の例は、5行の状態に対して実行されます。

#### `DEDUPLICATE` {#deduplicate}
重複排除のためのカラムが指定されていない場合、すべてのカラムが考慮されます。行は、すべてのカラムの値が前の行の対応する値と等しい場合にのみ削除されます：

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

カラムが暗黙に指定された場合、テーブルは `ALIAS` または `MATERIALIZED` でないすべてのカラムによって重複排除されます。上記のテーブルを考慮すると、これらは `primary_key`、`secondary_key`、`value`、および `partition_key` カラムです：

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY *;
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

#### `DEDUPLICATE BY * EXCEPT` {#deduplicate-by--except}
`ALIAS` または `MATERIALIZED` でなく、明示的に `value` でないすべてのカラムによって重複排除を行います：`primary_key`、`secondary_key`、および `partition_key` カラム。

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

明示的に `primary_key`、`secondary_key`、および `partition_key` カラムによって重複排除を行います：

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

正規表現にマッチするすべてのカラムによって重複排除を行います：`primary_key`、`secondary_key`、および `partition_key` カラム：

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
