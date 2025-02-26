---
slug: /sql-reference/statements/optimize
sidebar_position: 47
sidebar_label: OPTIMIZE
title: "OPTIMIZEステートメント"
---

このクエリは、テーブルのデータパーツの未スケジュールマージを初期化しようとします。一般的に、`OPTIMIZE TABLE ... FINAL`の使用は推奨されていないことに注意してください（詳細は[こちらのドキュメント](/optimize/avoidoptimizefinal)を参照）。その使用ケースは管理のためのものであり、日常の操作には適していません。

:::note
`OPTIMIZE`は`Too many parts`エラーを解決することはできません。
:::

**構文**

``` sql
OPTIMIZE TABLE [db.]name [ON CLUSTER cluster] [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]]
```

`OPTIMIZE`クエリは[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)ファミリー（[マテリアライズドビュー](../../sql-reference/statements/create/view.md#materialized-view)を含む）および[Buffer](../../engines/table-engines/special/buffer.md)エンジンでサポートされています。他のテーブルエンジンはサポートされていません。

`OPTIMIZE`が[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md)ファミリーのテーブルエンジンと共に使用されると、ClickHouseはマージのタスクを作成し、すべてのレプリカ（[alter_sync](../../operations/settings/settings.md#alter-sync)設定が`2`に設定されている場合）または現在のレプリカ（[alter_sync](../../operations/settings/settings.md#alter-sync)設定が`1`に設定されている場合）での実行を待機します。

- `OPTIMIZE`が何らかの理由でマージを行わない場合、クライアントに通知されません。通知を有効にするには、[optimize_throw_if_noop](../../operations/settings/settings.md#setting-optimize_throw_if_noop)設定を使用します。
- `PARTITION`を指定した場合、指定したパーティションのみが最適化されます。[パーティション式の設定方法](alter/partition.md#how-to-set-partition-expression)を参照してください。
- `FINAL`または`FORCE`を指定した場合、すべてのデータがすでに1つのパートに存在していても最適化が行われます。この動作は、[optimize_skip_merged_partitions](../../operations/settings/settings.md#optimize-skip-merged-partitions)で制御できます。また、同時にマージが実行されている場合でもマージが強制されます。
- `DEDUPLICATE`を指定した場合、完全に同一の行（by句が指定されていない場合）は重複が排除されます（すべてのカラムが比較されます）。これはMergeTreeエンジンのみに意味があります。

非アクティブなレプリカが`OPTIMIZE`クエリを実行するのを待つ秒数を[replication_wait_for_inactive_replica_timeout](../../operations/settings/settings.md#replication-wait-for-inactive-replica-timeout)設定で指定できます。

:::note    
`alter_sync`が`2`に設定されており、指定された`replication_wait_for_inactive_replica_timeout`設定で定義された時間以上にアクティブでないレプリカがある場合、`UNFINISHED`の例外がスローされます。
:::

## BY式 {#by-expression}

すべての列ではなくカスタムの列セットに対して重複排除を行いたい場合は、列のリストを明示的に指定するか、[`*`](../../sql-reference/statements/select/index.md#asterisk)、[`COLUMNS`](../../sql-reference/statements/select/index.md#columns-expression)、または[`EXCEPT`](../../sql-reference/statements/select/index.md#except-modifier)式の任意の組み合わせを使用できます。明示的に書かれたまたは暗黙的に展開された列のリストには、行の順序式（主キーおよびソートキーの両方）およびパーティション分割式（パーティションキー）で指定されたすべての列が含まれている必要があります。

:::note    
`*`は`SELECT`と同様に動作します：[MATERIALIZED](../../sql-reference/statements/create/table.md#materialized)および[ALIAS](../../sql-reference/statements/create/table.md#alias)列は展開に使用されません。

また、空の列リストを指定する、または空の列リストを生成する式を書くこと、または`ALIAS`列によって重複排除を行うことはエラーです。
:::

**構文**

``` sql
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

以下のすべての例は、この状態で5行に対して実行されます。

#### `DEDUPLICATE` {#deduplicate}
重複排除を行うための列が指定されていない場合、すべての列が考慮されます。行は、すべての列の値が前の行の対応する値と等しい場合にのみ削除されます：

``` sql
OPTIMIZE TABLE example FINAL DEDUPLICATE;
```

``` sql
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

列が暗黙的に指定される場合、テーブルは`ALIAS`または`MATERIALIZED`でないすべての列に対して重複排除が行われます。上記のテーブルを考えると、これらは`primary_key`、`secondary_key`、`value`、および`partition_key`列です：

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY *;
```

``` sql
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
`ALIAS`または`MATERIALIZED`でないすべての列に対して重複排除を行い、明示的に`value`列を除外します：`primary_key`、`secondary_key`、および`partition_key`列。

``` sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY * EXCEPT value;
```

``` sql
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

#### `DEDUPLICATE BY <列のリスト>` {#deduplicate-by-list-of-columns}

`primary_key`、`secondary_key`、および`partition_key`列によって明示的に重複排除を行います：

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY primary_key, secondary_key, partition_key;
```

``` sql
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

正規表現にマッチするすべての列によって重複排除を行います：`primary_key`、`secondary_key`、および`partition_key`列：

```sql
OPTIMIZE TABLE example FINAL DEDUPLICATE BY COLUMNS('.*_key');
```

``` sql
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
