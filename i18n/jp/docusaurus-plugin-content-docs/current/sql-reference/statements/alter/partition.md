---
slug: /sql-reference/statements/alter/partition
sidebar_position: 38
sidebar_label: PARTITION
title: "パーティションとパーツの操作"
---

以下の[パーティション](/engines/table-engines/mergetree-family/custom-partitioning-key.md)に関する操作が可能です:

- [DETACH PARTITION\|PART](#detach-partitionpart) — 指定されたパーティションまたはパーツを `detached` ディレクトリに移動し、忘却します。
- [DROP PARTITION\|PART](#drop-partitionpart) — 指定されたパーティションまたはパーツを削除します。
- [DROP DETACHED PARTITION\|PART](#drop-detached-partitionpart) - `detached` からパーツまたはパーティションのすべてのパーツを削除します。
- [FORGET PARTITION](#forget-partition) — 空のパーティションがある場合、そのメタデータをZooKeeperから削除します。
- [ATTACH PARTITION\|PART](#attach-partitionpart) — `detached` ディレクトリからパーティションまたはパーツをテーブルに追加します。
- [ATTACH PARTITION FROM](#attach-partition-from) — 1つのテーブルから別のテーブルにデータパーティションをコピーして追加します。
- [REPLACE PARTITION](#replace-partition) — 1つのテーブルから別のテーブルにデータパーティションをコピーして置き換えます。
- [MOVE PARTITION TO TABLE](#move-partition-to-table) — 1つのテーブルから別のテーブルにデータパーティションを移動します。
- [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — 指定したカラムの値をパーティション内でリセットします。
- [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — パーティション内の指定されたセカンダリインデックスをリセットします。
- [FREEZE PARTITION](#freeze-partition) — パーティションのバックアップを作成します。
- [UNFREEZE PARTITION](#unfreeze-partition) — パーティションのバックアップを削除します。
- [FETCH PARTITION\|PART](#fetch-partitionpart) — 別のサーバーからパーツまたはパーティションをダウンロードします。
- [MOVE PARTITION\|PART](#move-partitionpart) — パーティション/データパーツを別のディスクまたはボリュームに移動します。
- [UPDATE IN PARTITION](#update-in-partition) — 条件に基づいてパーティション内のデータを更新します。
- [DELETE IN PARTITION](#delete-in-partition) — 条件に基づいてパーティション内のデータを削除します。

<!-- -->

## DETACH PARTITION\|PART {#detach-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

指定されたパーティションのすべてのデータを `detached` ディレクトリに移動します。サーバーは、削除されたデータパーティションのことを忘れます。サーバーは、このデータを、[ATTACH](#attach-partitionpart) クエリを実行するまで知りません。

例:

``` sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

パーティション式を設定する方法については、[How to set the partition expression](#how-to-set-partition-expression)のセクションをお読みください。

クエリが実行された後は、`detached` ディレクトリ内のデータに対して好きなことができます — ファイルシステムから削除することもできますし、そのまま残しておくこともできます。

このクエリはレプリケートされており、すべてのレプリカの `detached` ディレクトリにデータを移動します。リーダーレプリカでのみこのクエリを実行できることに注意してください。レプリカがリーダーかどうかを確認するには、[system.replicas](/operations/system-tables/replicas.md/#system_tables-replicas) テーブルに対して `SELECT` クエリを実行します。または、すべてのレプリカで `DETACH` クエリを実行する方が簡単です - リーダーレプリカを除くすべてのレプリカは例外をスローします（複数のリーダーが許可されるため）。

## DROP PARTITION\|PART {#drop-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

指定されたパーティションをテーブルから削除します。このクエリはパーティションを非アクティブとしてマークし、約10分でデータを完全に削除します。

パーティション式を設定する方法については、[How to set the partition expression](#how-to-set-partition-expression)のセクションをお読みください。

このクエリはレプリケートされており、すべてのレプリカでデータを削除します。

例:

``` sql
ALTER TABLE mt DROP PARTITION '2020-11-21';
ALTER TABLE mt DROP PART 'all_4_4_0';
```

## DROP DETACHED PARTITION\|PART {#drop-detached-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP DETACHED PARTITION|PART ALL|partition_expr
```

指定されたパーツまたは指定されたパーティションのすべてのパーツを `detached` から削除します。パーティション式を設定する方法については、[How to set the partition expression](#how-to-set-partition-expression)のセクションをお読みください。

## FORGET PARTITION {#forget-partition}

``` sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

空のパーティションに関するすべてのメタデータをZooKeeperから削除します。パーティションが空でないか、未知である場合、クエリは失敗します。再度使用されないパーティションにのみ実行することを確認してください。

パーティション式を設定する方法については、[How to set the partition expression](#how-to-set-partition-expression)のセクションをお読みください。

例:

``` sql
ALTER TABLE mt FORGET PARTITION '20201121';
```

## ATTACH PARTITION\|PART {#attach-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] ATTACH PARTITION|PART partition_expr
```

`detached` ディレクトリからテーブルにデータを追加します。パーティション全体または個別のパーツのデータを追加することが可能です。例:

``` sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

パーティション式を設定する方法については、[How to set the partition expression](#how-to-set-partition-expression)のセクションをお読みください。

このクエリはレプリケートされます。レプリカのイニシエータは `detached` ディレクトリにデータがあるかどうかを確認します。
データが存在すれば、クエリはその整合性をチェックします。すべてが正しければ、クエリはデータをテーブルに追加します。

イニシエータでないレプリカが、正しいチェックサムを持つパーツを自分の `detached` フォルダで見つけた場合、他のレプリカからフェッチすることなくデータを接続します。
正しいチェックサムを持つパーツが存在しない場合、パーツがあるどのレプリカからでもデータをダウンロードします。

1つのレプリカの `detached` ディレクトリにデータを置き、`ALTER ... ATTACH` クエリを使用して、それをすべてのレプリカのテーブルに追加することができます。

## ATTACH PARTITION FROM {#attach-partition-from}

``` sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

このクエリは、`table1` から `table2` にデータパーティションをコピーします。

注意点:

- データは `table1` からも `table2` からも削除されません。
- `table1` は一時テーブルであることができます。

クエリが正常に実行されるためには、以下の条件を満たす必要があります:

- 両方のテーブルは同じ構造を持っている必要があります。
- 両方のテーブルは同じパーティションキー、同じオーダーキー、および同じ主キーを持っている必要があります。
- 両方のテーブルは同じストレージポリシーを持っている必要があります。
- 目的のテーブルは元のテーブルからのすべてのインデックスとプロジェクションを含む必要があります。目的のテーブルで `enforce_index_structure_match_on_partition_manipulation` 設定が有効になっている場合、インデックスとプロジェクションは同一である必要があります。そうでない場合、目的のテーブルは元のテーブルのインデックスとプロジェクションのスーパーセットを持つことができます。

## REPLACE PARTITION {#replace-partition}

``` sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

このクエリは、`table1` から `table2` にデータパーティションをコピーし、`table2` 内の既存のパーティションを置き換えます。この操作はアトミックです。

注意点:

- データは `table1` から削除されません。
- `table1` は一時テーブルであることができます。

クエリが正常に実行されるためには、以下の条件を満たす必要があります:

- 両方のテーブルは同じ構造を持っている必要があります。
- 両方のテーブルは同じパーティションキー、同じオーダーキー、および同じ主キーを持っている必要があります。
- 両方のテーブルは同じストレージポリシーを持っている必要があります。
- 目的のテーブルは元のテーブルからのすべてのインデックスとプロジェクションを含む必要があります。目的のテーブルで `enforce_index_structure_match_on_partition_manipulation` 設定が有効になっている場合、インデックスとプロジェクションは同一である必要があります。そうでない場合、目的のテーブルは元のテーブルのインデックスとプロジェクションのスーパーセットを持つことができます。

## MOVE PARTITION TO TABLE {#move-partition-to-table}

``` sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

このクエリは、`table_source` から `table_dest` へデータパーティションを移動し、`table_source` からはデータを削除します。

クエリが正常に実行されるためには、以下の条件を満たす必要があります:

- 両方のテーブルは同じ構造を持っている必要があります。
- 両方のテーブルは同じパーティションキー、同じオーダーキー、および同じ主キーを持っている必要があります。
- 両方のテーブルは同じストレージポリシーを持っている必要があります。
- 両方のテーブルは同じエンジンファミリー（レプリケートまたは非レプリケート）である必要があります。
- 目的のテーブルは元のテーブルからのすべてのインデックスとプロジェクションを含む必要があります。目的のテーブルで `enforce_index_structure_match_on_partition_manipulation` 設定が有効になっている場合、インデックスとプロジェクションは同一である必要があります。そうでない場合、目的のテーブルは元のテーブルのインデックスとプロジェクションのスーパーセットを持つことができます。

## CLEAR COLUMN IN PARTITION {#clear-column-in-partition}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

指定されたカラムのすべての値をパーティション内でリセットします。テーブル作成時に `DEFAULT` 句が決められていた場合、このクエリはカラムの値を指定されたデフォルト値に設定します。

例:

``` sql
ALTER TABLE visits CLEAR COLUMN hour IN PARTITION 201902
```

## FREEZE PARTITION {#freeze-partition}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

このクエリは指定されたパーティションのローカルバックアップを作成します。`PARTITION` 句を省略すると、すべてのパーティションのバックアップを一度に作成します。

:::note
バックアッププロセス全体はサーバーを停止することなく実行されます。
:::

古いスタイルのテーブル用に、パーティション名のプレフィックスを指定できます（例: `2019`） - この場合、クエリはすべての対応するパーティションのバックアップを作成します。パーティション式を設定する方法については、[How to set the partition expression](#how-to-set-partition-expression)のセクションをお読みください。

実行時に、データスナップショットのためにクエリはテーブルデータへのハードリンクを作成します。ハードリンクは `/var/lib/clickhouse/shadow/N/...` ディレクトリに配置されます。ここで:

- `/var/lib/clickhouse/` は、設定で指定された動作中のClickHouseディレクトリです。
- `N` はバックアップの増分番号です。
- `WITH NAME` パラメーターが指定されている場合、`'backup_name'` パラメーターの値が増分番号の代わりに使用されます。

:::note
データストレージのために[ディスクのセットを使用する](#table_engine-mergetree-multiple-volumes)場合、`shadow/N` ディレクトリはすべてのディスクに現れ、`PARTITION` 式に一致したデータパーツを保存します。
:::

バックアップの内部には `/var/lib/clickhouse/` 内と同じディレクトリ構造が作成され、すべてのファイルに対して `chmod` を実行し、書き込みを禁止します。

バックアップを作成した後は、`/var/lib/clickhouse/shadow/` からデータをリモートサーバーにコピーし、その後ローカルサーバーから削除できます。なお、`ALTER t FREEZE PARTITION` クエリはレプリケートされません。ローカルサーバーでのみローカルバックアップを作成します。

クエリはほぼ瞬時にバックアップを作成します（ただし、最初に該当テーブルへの現在のクエリが終わるのを待ちます）。

`ALTER TABLE t FREEZE PARTITION` はデータのみをコピーし、テーブルのメタデータはコピーしません。テーブルのメタデータのバックアップを作成するには、ファイル `/var/lib/clickhouse/metadata/database/table.sql` をコピーしてください。

バックアップからデータを復元するには、以下を行います:

1. テーブルが存在しない場合は作成します。クエリを表示するには、.sql ファイルを使用します（`ATTACH` を `CREATE` に置き換えます）。
2. バックアップ内の `data/database/table/` ディレクトリから `/var/lib/clickhouse/data/database/table/detached/` ディレクトリにデータをコピーします。
3. データをテーブルに追加するために `ALTER TABLE t ATTACH PARTITION` クエリを実行します。

バックアップからの復元にはサーバーを停止する必要はありません。

バックアップとデータ復元に関する詳細は、[データバックアップ](/operations/backup.md) セクションを参照してください。

## UNFREEZE PARTITION {#unfreeze-partition}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

指定された名前の `freezed` パーティションをディスクから削除します。`PARTITION` 句を省略すると、クエリはすべてのパーティションのバックアップを一度に削除します。

## CLEAR INDEX IN PARTITION {#clear-index-in-partition}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR INDEX index_name IN PARTITION partition_expr
```

クエリは `CLEAR COLUMN` と似た動作をしますが、カラムデータの代わりにインデックスをリセットします。

## FETCH PARTITION|PART {#fetch-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] FETCH PARTITION|PART partition_expr FROM 'path-in-zookeeper'
```

別のサーバーからパーティションをダウンロードします。このクエリはレプリケートテーブルにのみ適用されます。

クエリは以下の作業を行います:

1. 指定されたシャードからパーティション|パーツをダウンロードします。`path-in-zookeeper` にはZooKeeper内のシャードへのパスを指定する必要があります。
2. その後、ダウンロードしたデータを `table_name` テーブルの `detached` ディレクトリに配置します。データをテーブルに追加するには、[ATTACH PARTITION\|PART](#attach-partitionpart) クエリを使用します。

例:

1. FETCH PARTITION
``` sql
ALTER TABLE users FETCH PARTITION 201902 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PARTITION 201902;
```
2. FETCH PART
``` sql
ALTER TABLE users FETCH PART 201901_2_2_0 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PART 201901_2_2_0;
```

注意点:

- `ALTER ... FETCH PARTITION|PART` クエリはレプリケートされません。パートまたはパーティションをローカルサーバーの `detached` ディレクトリに配置するだけです。
- `ALTER TABLE ... ATTACH` クエリはレプリケートされます。データはすべてのレプリカに追加されます。データが1つのレプリカから `detached` ディレクトリに追加され、他のレプリカには隣接するレプリカから追加されます。

ダウンロードを行う前に、システムはパーティションが存在し、テーブルの構造が一致しているかどうかを確認します。最も適切なレプリカが健康なレプリカから自動的に選択されます。

クエリは `ALTER TABLE` と呼ばれますが、テーブルの構造を変更せず、テーブル内のデータを即座に変更することはありません。

## MOVE PARTITION\|PART {#move-partitionpart}

`MergeTree`エンジンテーブル用に、パーティションまたはデータパーツを別のボリュームまたはディスクに移動します。データストレージ用の[複数のブロックデバイスの使用](#table_engine-mergetree-multiple-volumes)を参照してください。

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

`ALTER TABLE t MOVE` クエリは:

- レプリケートされません。異なるレプリカは異なるストレージポリシーを持っている可能性があるためです。
- 指定されたディスクまたはボリュームが設定されていない場合、エラーを返します。データ移動の条件がストレージポリシーで指定されている場合にもエラーが返されます。
- バックグラウンドプロセス、同時に実行されている `ALTER TABLE t MOVE` クエリ、またはバックグラウンドデータマージの結果として、移動するデータがすでに移動されている場合にはエラーが返される可能性があります。この場合、ユーザーは追加のアクションを実行しないでください。

例:

``` sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow'
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd'
```

## UPDATE IN PARTITION {#update-in-partition}

指定されたフィルタリング式に一致する指定されたパーティション内のデータを操作します。[ミューテーション](#mutations)として実装されています。

構文:

``` sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr
```

### 例 {#example}

``` sql
-- パーティション名を使用
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION 2 WHERE p = 2;

-- パーティションIDを使用
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION ID '2' WHERE p = 2;
```

### 関連情報 {#see-also}

- [UPDATE](/sql-reference/statements/alter/update.md/#alter-table-update-statements)

## DELETE IN PARTITION {#delete-in-partition}

指定されたフィルタリング式に一致する指定されたパーティション内のデータを削除します。[ミューテーション](#mutations)として実装されています。

構文:

``` sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE [IN PARTITION partition_expr] WHERE filter_expr
```

### 例 {#example-1}

``` sql
-- パーティション名を使用
ALTER TABLE mt DELETE IN PARTITION 2 WHERE p = 2;

-- パーティションIDを使用
ALTER TABLE mt DELETE IN PARTITION ID '2' WHERE p = 2;
```

### 関連情報 {#see-also-1}

- [DELETE](/sql-reference/statements/alter/delete.md/#alter-mutations)

## How to Set Partition Expression {#how-to-set-partition-expression}

`ALTER ... PARTITION` クエリでパーティションの式を指定できます:

- `system.parts` テーブルの `partition` カラムからの値として。例えば、`ALTER TABLE visits DETACH PARTITION 201901`。
- キーワード `ALL` を使用して。これはDROP/DETACH/ATTACH/ATTACH FROMでのみ使用できます。例えば、`ALTER TABLE visits ATTACH PARTITION ALL`。
- テーブルのパーティショニングキーのタプルに一致する式または定数のタプルとして。単一要素のパーティショニングキーの場合、式は `tuple (...)` 関数でラップする必要があります。例えば、`ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25'))) `。
- パーティションIDを使用します。パーティションIDは、ファイルシステムとZooKeeper内のパーティション名として使用される文字列識別子です。パーティションIDは`PARTITION ID` 句で指定され、単一引用符で囲む必要があります。例えば、`ALTER TABLE visits DETACH PARTITION ID '201901' `。
- [ALTER ATTACH PART](#attach-partitionpart) および [DROP DETACHED PART](#drop-detached-partitionpart) クエリでパーツの名前を指定する際には、[system.detached_parts](/operations/system-tables/detached_parts.md/#system_tables-detached_parts) テーブルの `name` カラムからの値を含む文字列リテラルを使用します。例えば、`ALTER TABLE visits ATTACH PART '201901_1_1_0' `。

パーティションを指定する際の引用符の使用は、パーティション式の型によって異なります。例えば、`String` 型の場合、名前を引用符（`'`）で指定する必要があります。`Date` および `Int*` 型の場合は、引用符は不要です。

上記のすべてのルールは、[OPTIMIZE](/sql-reference/statements/optimize.md) クエリにも当てはまります。非パーティションテーブルの最適化時に唯一のパーティションを指定する必要がある場合は、式 `PARTITION tuple()` を設定します。例えば:

``` sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION` は、`ALTER TABLE` クエリの結果として[UPDATE](/sql-reference/statements/alter/update.md/#alter-table-update-statements)または[DELETE](/sql-reference/statements/alter/delete.md/#alter-mutations)の式が適用されるパーティションを指定します。新しいパーツは、指定されたパーティションからのみ作成されます。このように、`IN PARTITION` はテーブルが多くのパーティションに分割され、データをポイントごとに更新する必要があるときに負荷を軽減するのに役立ちます。

`ALTER ... PARTITION` クエリの例は、テスト [`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql) および [`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql) に示されています。
