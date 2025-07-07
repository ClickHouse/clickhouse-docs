---
'description': 'Documentation for Optimize'
'sidebar_label': 'OPTIMIZE'
'sidebar_position': 47
'slug': '/sql-reference/statements/optimize'
'title': 'OPTIMIZE Statement'
---



このクエリは、テーブルのデータパーツのスケジュールされていないマージを初期化しようとします。一般的には、`OPTIMIZE TABLE ... FINAL` の使用はお勧めしません（詳細は[こちらのドキュメント](/optimize/avoidoptimizefinal)を参照）; このコマンドの使用ケースは管理のためのものであり、日常の操作向けではありません。

:::note
`OPTIMIZE` は `Too many parts` エラーを修正できません。
:::

**構文**

```sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

`OPTIMIZE` クエリは [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) ファミリー（[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)を含む）および [Buffer](../../engines/table-engines/special/buffer.md) エンジンでサポートされています。他のテーブルエンジンはサポートされていません。

`OPTIMIZE` が [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md) ファミリーのテーブルエンジンとともに使用される場合、ClickHouseはマージのタスクを作成し、すべてのレプリカでの実行を待機します（[alter_sync](/operations/settings/settings#alter_sync) の設定が `2` に設定されている場合）または現在のレプリカで（[alter_sync](/operations/settings/settings#alter_sync) の設定が `1` に設定されている場合）。

- `OPTIMIZE` が何らかの理由でマージを実行しない場合、クライアントには通知されません。通知を有効にするには、[optimize_throw_if_noop](/operations/settings/settings#optimize_throw_if_noop) 設定を使用します。
- `PARTITION` を指定した場合、指定したパーティションのみが最適化されます。[パーティション式の設定方法](alter/partition.md#how-to-set-partition-expression)を参照してください。
- `FINAL` または `FORCE` を指定すると、すべてのデータがすでに1つのパーツに存在する場合でも最適化が実行されます。この動作は、[optimize_skip_merged_partitions](/operations/settings/settings#optimize_skip_merged_partitions) で制御できます。また、同時にマージが実行されている場合でも強制的にマージされます。
- `DEDUPLICATE` を指定すると、完全に同一の行（by-clause が指定されていない限り）が重複削除されます（すべてのカラムが比較されます）。これは、MergeTreeエンジンに対してのみ意味があります。

非アクティブなレプリカが `OPTIMIZE` クエリを実行するのを待つ秒数を、[replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 設定で指定できます。

:::note    
`alter_sync` が `2` に設定されている場合で、いくつかのレプリカが `replication_wait_for_inactive_replica_timeout` 設定で指定された時間よりも長く非アクティブのままだと、例外 `UNFINISHED` がスローされます。
:::

## BY expression {#by-expression}

すべてのカラムではなく、カスタムで指定したカラムに対して重複削除を行いたい場合、カラムのリストを明示的に指定するか、[`*`](../../sql-reference/statements/select/index.md#asterisk)、[`COLUMNS`](/sql-reference/statements/select#select-clause)、または [`EXCEPT`](/sql-reference/statements/select#except) 式の任意の組み合わせを使用できます。明示的に記述されたリストまたは暗黙的に拡張されたカラムのリストは、行の順序付け式（主キーおよびソートキーの両方）とパーティション式（パーティションキー）で指定されたすべてのカラムを含む必要があります。

:::note    
`*` は `SELECT` と同じように動作することに注意してください: [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) および [ALIAS](../../sql-reference/statements/create/table.md#alias) カラムは展開に使用されません。

また、空のカラムリストを指定したり、空のカラムリストを生成する式を書いたり、`ALIAS` カラムによって重複削除を行うことはエラーです。
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

次のテーブルを考慮してください:

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

以下のすべての例は、5行のこの状態に対して実行されます。

#### `DEDUPLICATE` {#deduplicate}
重複削除するカラムが指定されていない場合は、すべてのカラムが考慮されます。行が削除されるのは、すべてのカラムの値が前の行の対応する値と等しい場合のみです:

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

カラムが暗黙的に指定された場合、テーブルは `ALIAS` または `MATERIALIZED` でないすべてのカラムで重複削除されます。上記のテーブルを考えると、これに該当するのは `primary_key`、`secondary_key`、`value`、および `partition_key` カラムです:

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
`ALIAS` または `MATERIALIZED` でないすべてのカラムを重複削除し、明示的に `value` を除外します: `primary_key`、`secondary_key`、および `partition_key` カラムです。

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

明示的に `primary_key`、`secondary_key`、および `partition_key` カラムで重複削除を行います:

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

正規表現に一致するすべてのカラムで重複削除を行います: `primary_key`、`secondary_key`、および `partition_key` カラムです:

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
