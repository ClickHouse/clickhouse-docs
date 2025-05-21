description: 'パーティションに関するドキュメント'
sidebar_label: 'パーティション'
sidebar_position: 38
slug: /sql-reference/statements/alter/partition
title: 'パーティションとパーツの操作'
```

以下の操作が利用可能です: [partitions](/engines/table-engines/mergetree-family/custom-partitioning-key.md)

- [DETACH PARTITION\|PART](#detach-partitionpart) — パーティションまたはパーツを `detached` ディレクトリに移動し、忘れさせます。
- [DROP PARTITION\|PART](#drop-partitionpart) — パーティションまたはパーツを削除します。
- [DROP DETACHED PARTITION\|PART](#drop-detached-partitionpart) - `detached` からパートまたはパーティションの全てのパーツを削除します。
- [FORGET PARTITION](#forget-partition) — 空であれば、ZooKeeper からパーティションのメタデータを削除します。
- [ATTACH PARTITION\|PART](#attach-partitionpart) — `detached` ディレクトリからテーブルにパーティションまたはパーツを追加します。
- [ATTACH PARTITION FROM](#attach-partition-from) — 一つのテーブルから別のテーブルにデータパーティションをコピーして追加します。
- [REPLACE PARTITION](#replace-partition) — 一つのテーブルから別のテーブルにデータパーティションをコピーして置き換えます。
- [MOVE PARTITION TO TABLE](#move-partition-to-table) — 一つのテーブルから別のテーブルにデータパーティションを移動します。
- [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — パーティション内の指定したカラムの値をリセットします。
- [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — パーティション内の指定したセカンダリインデックスをリセットします。
- [FREEZE PARTITION](#freeze-partition) — パーティションのバックアップを作成します。
- [UNFREEZE PARTITION](#unfreeze-partition) — パーティションのバックアップを削除します。
- [FETCH PARTITION\|PART](#fetch-partitionpart) — 別のサーバーからパーツまたはパーティションをダウンロードします。
- [MOVE PARTITION\|PART](#move-partitionpart) — パーティション/データパーツを別のディスクまたはボリュームに移動します。
- [UPDATE IN PARTITION](#update-in-partition) — 条件に基づいてパーティション内のデータを更新します。
- [DELETE IN PARTITION](#delete-in-partition) — 条件に基づいてパーティション内のデータを削除します。

<!-- -->

## DETACH PARTITION\|PART {#detach-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

指定されたパーティション用の全データを `detached` ディレクトリに移動します。サーバーは、切り離されたデータパーティションを存在しないものとして忘れます。サーバーは、[ATTACH](#attach-partitionpart) クエリを実行するまでこのデータを知りません。

例:

```sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

パーティション表現の設定については、[パーティション表現の設定方法](#how-to-set-partition-expression)のセクションをお読みください。

クエリが実行されると、`detached` ディレクトリ内のデータに対して好きな操作を行うことができます — ファイルシステムから削除するか、そのまま残しておくか。

このクエリはレプリケーションされています — 全てのレプリカの `detached` ディレクトリにデータを移動します。リーダーレプリカでのみこのクエリを実行できることに注意してください。レプリカがリーダーであるかどうかを確認するには、[system.replicas](/operations/system-tables/replicas) テーブルに対して `SELECT` クエリを実行します。あるいは、全てのレプリカで `DETACH` クエリを実行する方が簡単です - リーダー以外の全レプリカがエラーをスローします（複数のリーダーが許可されています）。

## DROP PARTITION\|PART {#drop-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

指定されたパーティションをテーブルから削除します。このクエリはパーティションを非アクティブとしてタグ付けし、データを完全に削除します。約10分かかります。

パーティション表現の設定については、[パーティション表現の設定方法](#how-to-set-partition-expression)のセクションをお読みください。

クエリはレプリケーションされます — 全てのレプリカでデータを削除します。

例:

```sql
ALTER TABLE mt DROP PARTITION '2020-11-21';
ALTER TABLE mt DROP PART 'all_4_4_0';
```

## DROP DETACHED PARTITION\|PART {#drop-detached-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP DETACHED PARTITION|PART ALL|partition_expr
```

指定されたパーツまたは指定されたパーティションの全てのパーツを `detached` から削除します。パーティション表現の設定については、[パーティション表現の設定方法](#how-to-set-partition-expression)のセクションをお読みください。

## FORGET PARTITION {#forget-partition}

```sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

空のパーティションに関する全てのメタデータを ZooKeeper から削除します。パーティションが空でない場合や不明な場合はクエリが失敗します。再度使用することがないパーティションに対してのみ実行してください。

パーティション表現の設定については、[パーティション表現の設定方法](#how-to-set-partition-expression)のセクションをお読みください。

例:

```sql
ALTER TABLE mt FORGET PARTITION '20201121';
```

## ATTACH PARTITION\|PART {#attach-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] ATTACH PARTITION|PART partition_expr
```

`detached` ディレクトリからテーブルにデータを追加します。全体のパーティションまたは別々のパーツのデータを追加することが可能です。例:

```sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

パーティション表現の設定については、[パーティション表現の設定方法](#how-to-set-partition-expression)のセクションをお読みください。

このクエリはレプリケーションされます。レプリカの開始者は、`detached` ディレクトリ内にデータがあるかどうかを確認します。
データが存在する場合、クエリはその整合性をチェックします。すべてが正しければ、クエリはデータをテーブルに追加します。

非開始者レプリカが、正しいチェックサムを持つパートが自分の `detached` フォルダにあることを確認した場合、他のレプリカからデータを取得することなくデータを添付します。
正しいチェックサムのパートがない場合、パーツを持っている任意のレプリカからデータがダウンロードされます。

一方のレプリカの `detached` ディレクトリにデータを入れ、全てのレプリカでそれをテーブルに追加するために `ALTER ... ATTACH` クエリを使用することができます。

## ATTACH PARTITION FROM {#attach-partition-from}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

このクエリは `table1` から `table2` にデータパーティションをコピーします。

注意点:

- `table1` も `table2` もデータは削除されません。
- `table1` は一時テーブルである可能性があります。

クエリが正常に実行されるためには、以下の条件を満たす必要があります:

- 両方のテーブルは同じ構造でなければなりません。
- 両方のテーブルは同じパーティションキー、同じオーダーbyキー、同じ主キーを持っていなければなりません。
- 両方のテーブルは同じストレージポリシーを持っていなければなりません。
- 目的のテーブルは、ソーステーブルの全てのインデックスとプロジェクションを含む必要があります。もし宛先テーブルに `enforce_index_structure_match_on_partition_manipulation` 設定が有効になっている場合、インデックスとプロジェクションは同一でなければなりません。それ以外の場合、宛先テーブルはソーステーブルのインデックスとプロジェクションのスーパーセットを持つことができます。

## REPLACE PARTITION {#replace-partition}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

このクエリは `table1` から `table2`にデータパーティションをコピーし、`table2`の既存のパーティションを置き換えます。この操作は原子的です。

注意点:

- データは `table1` から削除されません。
- `table1` は一時テーブルである可能性があります。

クエリが正常に実行されるためには、以下の条件を満たす必要があります:

- 両方のテーブルは同じ構造でなければなりません。
- 両方のテーブルは同じパーティションキー、同じオーダーbyキー、同じ主キーを持っていなければなりません。
- 両方のテーブルは同じストレージポリシーを持っていなければなりません。
- 目的のテーブルは、ソーステーブルの全てのインデックスとプロジェクションを含む必要があります。もし宛先テーブルに `enforce_index_structure_match_on_partition_manipulation` 設定が有効になっている場合、インデックスとプロジェクションは同一でなければなりません。それ以外の場合、宛先テーブルはソーステーブルのインデックスとプロジェクションのスーパーセットを持つことができます。

## MOVE PARTITION TO TABLE {#move-partition-to-table}

```sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

このクエリは `table_source` から `table_dest` にデータパーティションを移動し、`table_source` からデータを削除します。

クエリが正常に実行されるためには、以下の条件を満たす必要があります:

- 両方のテーブルは同じ構造でなければなりません。
- 両方のテーブルは同じパーティションキー、同じオーダーbyキー、同じ主キーを持っていなければなりません。
- 両方のテーブルは同じストレージポリシーを持っていなければなりません。
- 両方のテーブルは同じエンジンファミリー（レプリケートまたは非レプリケート）でなければなりません。
- 目的のテーブルはソーステーブルの全てのインデックスとプロジェクションを含む必要があります。もし宛先テーブルに `enforce_index_structure_match_on_partition_manipulation` 設定が有効になっている場合、インデックスとプロジェクションは同一でなければなりません。それ以外の場合、宛先テーブルはソーステーブルのインデックスとプロジェクションのスーパーセットを持つことができます。

## CLEAR COLUMN IN PARTITION {#clear-column-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

指定されたパーティション内のカラムの全ての値をリセットします。テーブル作成時に `DEFAULT` 句が設定されている場合、このクエリはカラムの値を指定したデフォルト値に設定します。

例:

```sql
ALTER TABLE visits CLEAR COLUMN hour in PARTITION 201902
```

## FREEZE PARTITION {#freeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

このクエリは指定されたパーティションのローカルバックアップを作成します。`PARTITION` 句を省略した場合、クエリは全てのパーティションのバックアップを一度に作成します。

:::note
バックアッププロセス全体はサーバーを停止することなく実行されます。
:::

なお、古いスタイルのテーブルの場合、パーティション名のプレフィックスを指定することができます（例えば、`2019`） — そうすればクエリは全ての対応するパーティションのバックアップを作成します。パーティション表現の設定については、[パーティション表現の設定方法](#how-to-set-partition-expression)のセクションをお読みください。

実行時に、データスナップショット用にクエリはテーブルデータへのハードリンクを作成します。ハードリンクは `/var/lib/clickhouse/shadow/N/...` ディレクトリに配置されます。ここで:

- `/var/lib/clickhouse/` は設定で指定された ClickHouse の作業ディレクトリです。
- `N` はバックアップの増分番号です。
- `WITH NAME` パラメータが指定されている場合、`'backup_name'` パラメータの値が増分番号の代わりに使用されます。

:::note
テーブルにおけるデータストレージのためのディスクのセットを使用している場合](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes)、`shadow/N` ディレクトリは全てのディスクに現れ、`PARTITION` 表現によって一致するデータパーツを格納します。
:::

バックアップ内に作成されるディレクトリの構造は、`/var/lib/clickhouse/` 内の構造と同じです。クエリはすべてのファイルに対して `chmod` を実行し、書き込みを禁止します。

バックアップを作成した後、`/var/lib/clickhouse/shadow/` からリモートサーバーにデータをコピーし、その後ローカルサーバーから削除できます。`ALTER t FREEZE PARTITION` クエリはレプリケーションされないことに注意してください。ローカルサーバーのみにバックアップを作成します。

クエリはほぼ瞬時にバックアップを作成します（ただし、まず関連するテーブルに対する現在のクエリが終了するのを待ちます）。

`ALTER TABLE t FREEZE PARTITION` はデータのみをコピーし、テーブルメタデータはコピーしません。テーブルメタデータのバックアップを作成するには、`/var/lib/clickhouse/metadata/database/table.sql` ファイルをコピーします。

バックアップからデータを復元するには、以下の手順を実行します:

1. テーブルが存在しない場合は作成します。クエリを見るために .sql ファイルを使用します（`ATTACH` を `CREATE` に置き換えます）。
2. バックアップ内の `data/database/table/` ディレクトリから `/var/lib/clickhouse/data/database/table/detached/` ディレクトリにデータをコピーします。
3. `ALTER TABLE t ATTACH PARTITION` クエリを実行して、テーブルにデータを追加します。

バックアップからの復元はサーバーを停止する必要がありません。

バックアップとデータの復元に関する詳細は、[データバックアップ](/operations/backup.md) セクションを参照してください。

## UNFREEZE PARTITION {#unfreeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

指定された名前で `frozen` パーティションをディスクから削除します。`PARTITION` 句を省略した場合、クエリは全てのパーティションのバックアップを一度に削除します。

## CLEAR INDEX IN PARTITION {#clear-index-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR INDEX index_name IN PARTITION partition_expr
```

このクエリは `CLEAR COLUMN` に似た動作をしますが、カラムデータの代わりにインデックスをリセットします。

## FETCH PARTITION|PART {#fetch-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FETCH PARTITION|PART partition_expr FROM 'path-in-zookeeper'
```

別のサーバーからパーティションをダウンロードします。このクエリはレプリケーテッドテーブルのみで機能します。

クエリは以下の処理を実行します:

1. 指定されたシャードからパーティション|パートをダウンロードします。`'path-in-zookeeper'` には ZooKeeper 内のシャードへのパスを指定する必要があります。
2. 次に、クエリはダウンロードしたデータを `table_name` テーブルの `detached` ディレクトリに配置します。データをテーブルに追加するには [ATTACH PARTITION\|PART](#attach-partitionpart) クエリを使用します。

例えば:

1. PARTITION を FETCH
```sql
ALTER TABLE users FETCH PARTITION 201902 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PARTITION 201902;
```
2. PART を FETCH
```sql
ALTER TABLE users FETCH PART 201901_2_2_0 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PART 201901_2_2_0;
```

注意点:

- `ALTER ... FETCH PARTITION|PART` クエリはレプリケーションされません。パートまたはパーティションはローカルサーバーの `detached` ディレクトリにのみ配置されます。
- `ALTER TABLE ... ATTACH` クエリはレプリケーションされます。データは全てのレプリカに追加されます。データは `detached` ディレクトリから一つのレプリカに追加され、他のレプリカには隣接するレプリカから追加されます。

ダウンロード前に、システムはパーティションが存在するかどうかとテーブル構造が一致するかをチェックします。健康なレプリカの中から、最も適切なレプリカが自動的に選択されます。

クエリは `ALTER TABLE` と呼ばれますが、テーブル構造を変更することはなく、テーブル内のデータの即時変更もありません。

## MOVE PARTITION\|PART {#move-partitionpart}

`MergeTree` エンジンテーブルに対して、パーティションまたはデータ部分を別のボリュームやディスクに移動します。詳細は [データストレージのための複数のブロックデバイスの使用](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes) を参照してください。

```sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

`ALTER TABLE t MOVE` クエリは:

- レプリケーションされません; なぜなら異なるレプリカは異なるストレージポリシーを持っている可能性があるからです。
- 指定されたディスクまたはボリュームが設定されていない場合はエラーを返します。また、ストレージポリシーで指定されたデータ移動の条件が適用できない場合もエラーを返します。
- データの移動がバックグラウンドプロセス、同時の `ALTER TABLE t MOVE` クエリ、またはバックグラウンドデータマージの結果としてすでに移動されている場合、エラーを返すことがあります。この場合、ユーザーは追加のアクションを行うべきではありません。

例:

```sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow';
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd';
```

## UPDATE IN PARTITION {#update-in-partition}

指定したフィルタリング式に一致する指定のパーティション内のデータを操作します。これは [mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

構文:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr
```

### 例 {#example}

```sql
-- パーティション名を使用
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION 2 WHERE p = 2;

-- パーティションIDを使用
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION ID '2' WHERE p = 2;
```

### 参照 {#see-also}

- [UPDATE](/sql-reference/statements/alter/partition#update-in-partition)

## DELETE IN PARTITION {#delete-in-partition}

指定したフィルタリング式に一致する指定のパーティション内のデータを削除します。これは [mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

構文:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE [IN PARTITION partition_expr] WHERE filter_expr
```

### 例 {#example-1}

```sql
-- パーティション名を使用
ALTER TABLE mt DELETE IN PARTITION 2 WHERE p = 2;

-- パーティションIDを使用
ALTER TABLE mt DELETE IN PARTITION ID '2' WHERE p = 2;
```

### 参照 {#see-also-1}

- [DELETE](/sql-reference/statements/alter/delete)

## How to Set Partition Expression {#how-to-set-partition-expression}

`ALTER ... PARTITION` クエリでパーティション表現を指定する方法はいくつかあります。

- `system.parts` テーブルの `partition` カラムからの値を使用します。例えば、`ALTER TABLE visits DETACH PARTITION 201901` のようにします。
- キーワード `ALL` を使用します。このキーワードは DROP/DETACH/ATTACH/ATTACH FROM にのみ使用できます。例えば、`ALTER TABLE visits ATTACH PARTITION ALL` のようにします。
- テーブルのパーティショニングキーのタプルと一致する式または定数のタプルとして指定します。単一要素パーティショニングキーの場合、式は `tuple (...)` 関数にラップされる必要があります。例えば、`ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25')))` のようにします。
- パーティション ID を使用して指定します。パーティション ID は、そのパーティションの文字列識別子です（可能であれば人間が読める）。パーティション ID は `PARTITION ID` 句で指定する必要があります。単一引用符で囲みます。例えば、`ALTER TABLE visits DETACH PARTITION ID '201901'` のようにします。
- [ALTER ATTACH PART](#attach-partitionpart) と [DROP DETACHED PART](#drop-detached-partitionpart) クエリでパーツ名を指定するには、[system.detached_parts](/operations/system-tables/detached_parts) テーブルの `name` カラムからの値を持つ文字列リテラルを使用します。例えば、`ALTER TABLE visits ATTACH PART '201901_1_1_0'` のようにします。

パーティションを指定する際のクォートの使用は、パーティション表現の型によって異なります。たとえば、`String` 型の場合、その名前をクォート（`'`）で指定する必要があります。`Date` および `Int*` 型の場合、クォートは必要ありません。

上記のすべてのルールは、[OPTIMIZE](/sql-reference/statements/optimize.md) クエリにも当てはまります。非パーティションテーブルを最適化する場合は、唯一のパーティションを指定するために `PARTITION tuple()` 表現を設定します。例えば:

```sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION` は、[UPDATE](/sql-reference/statements/alter/update) または [DELETE](/sql-reference/statements/alter/delete) 表現が `ALTER TABLE` クエリの結果として適用されるパーティションを指定します。新しいパーツは、指定されたパーティションからのみ作成されます。このようにして、`IN PARTITION` はテーブルが多くのパーティションに分かれていて、データを一点ずつ更新する必要があるときに負荷を軽減するのに役立ちます。

`ALTER ... PARTITION` クエリの例は、テストの [`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql) および [`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql) に示されています。
