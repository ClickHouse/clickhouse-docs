---
slug: '/sql-reference/statements/alter/partition'
sidebar_position: 38
sidebar_label: 'パーティション'
title: 'パーティションとパーツの操作'
---

以下の操作が [パーティション](/engines/table-engines/mergetree-family/custom-partitioning-key.md) に対して可能です:

- [DETACH PARTITION\|PART](#detach-partitionpart) — 指定されたパーティションまたはパーツを `detached` ディレクトリに移動し、記憶から消去します。
- [DROP PARTITION\|PART](#drop-partitionpart) — パーティションまたはパーツを削除します。
- [DROP DETACHED PARTITION\|PART](#drop-detached-partitionpart) - `detached` からパーツまたはパーティションの全パーツを削除します。
- [FORGET PARTITION](#forget-partition) — 空であれば、zookeeperからパーティションメタデータを削除します。
- [ATTACH PARTITION\|PART](#attach-partitionpart) — `detached` ディレクトリからパーティションまたはパーツをテーブルに追加します。
- [ATTACH PARTITION FROM](#attach-partition-from) — 一つのテーブルから別のテーブルへデータパーティションをコピーして追加します。
- [REPLACE PARTITION](#replace-partition) — 一つのテーブルから別のテーブルへデータパーティションをコピーして置き換えます。
- [MOVE PARTITION TO TABLE](#move-partition-to-table) — 一つのテーブルから別のテーブルへデータパーティションを移動します。
- [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — 指定されたカラムの値をパーティション内でリセットします。
- [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — パーティション内で指定された二次インデックスをリセットします。
- [FREEZE PARTITION](#freeze-partition) — パーティションのバックアップを作成します。
- [UNFREEZE PARTITION](#unfreeze-partition) — パーティションのバックアップを削除します。
- [FETCH PARTITION\|PART](#fetch-partitionpart) — 別のサーバーからパーツまたはパーティションをダウンロードします。
- [MOVE PARTITION\|PART](#move-partitionpart) — パーティション/データパーツを別のディスクまたはボリュームに移動します。
- [UPDATE IN PARTITION](#update-in-partition) — 条件に従ってパーティション内のデータを更新します。
- [DELETE IN PARTITION](#delete-in-partition) — 条件に従ってパーティション内のデータを削除します。

<!-- -->

## DETACH PARTITION\|PART {#detach-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

指定されたパーティションのすべてのデータを `detached` ディレクトリに移動します。サーバーは、デタッチされたデータパーティションを存在しないかのように忘れます。このデータは、[ATTACH](#attach-partitionpart) クエリを実行するまでサーバーには認識されません。

例:

``` sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

パーティション式の設定については、[パーティション式の設定方法](#how-to-set-partition-expression)セクションをお読みください。

クエリが実行された後、`detached` ディレクトリ内のデータに対して任意の操作を行えます — ファイルシステムから削除することも、そのままにしておくことも可能です。

このクエリはレプリケートされます – すべてのレプリカの `detached` ディレクトリにデータを移動します。リーダーレプリカでのみこのクエリを実行できることに注意してください。レプリカがリーダーかどうかを確認するには、[system.replicas](/operations/system-tables/replicas) テーブルに対して `SELECT` クエリを実行してください。または、すべてのレプリカで `DETACH` クエリを実行する方が簡単です - リーダーレプリカ以外はすべて例外を投げます（複数のリーダーが許可されています）。

## DROP PARTITION\|PART {#drop-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

指定されたパーティションをテーブルから削除します。このクエリはパーティションを非アクティブとしてタグ付けし、データを完全に削除します。おおよそ10分かかります。

パーティション式の設定については、[パーティション式の設定方法](#how-to-set-partition-expression)セクションをお読みください。

このクエリはレプリケートされます - すべてのレプリカに対してデータを削除します。

例:

``` sql
ALTER TABLE mt DROP PARTITION '2020-11-21';
ALTER TABLE mt DROP PART 'all_4_4_0';
```

## DROP DETACHED PARTITION\|PART {#drop-detached-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP DETACHED PARTITION|PART ALL|partition_expr
```

指定されたパーツまたは指定されたパーティションのすべてのパーツを `detached` から削除します。
パーティション式の設定については、[パーティション式の設定方法](#how-to-set-partition-expression)セクションをお読みください。

## FORGET PARTITION {#forget-partition}

``` sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

空のパーティションに関するすべてのメタデータをZooKeeperから削除します。パーティションが空でない場合や不明な場合、クエリは失敗します。二度と使用されないパーティションのみに対して実行されることを確認してください。

パーティション式の設定については、[パーティション式の設定方法](#how-to-set-partition-expression)セクションをお読みください。

例:

``` sql
ALTER TABLE mt FORGET PARTITION '20201121';
```

## ATTACH PARTITION\|PART {#attach-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] ATTACH PARTITION|PART partition_expr
```

`detached` ディレクトリからテーブルにデータを追加します。全体のパーティションまたは個別のパーツのデータを追加することができます。例:

``` sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

パーティション式の設定については、[パーティション式の設定方法](#how-to-set-partition-expression)セクションをお読みください。

このクエリはレプリケートされます。レプリカの起動者は `detached` ディレクトリにデータが存在するか確認します。
データが存在する場合、クエリはその整合性をチェックします。すべてが正しい場合、クエリはデータをテーブルに追加します。

非起動者レプリカがアタッチコマンドを受信し、自身の `detached` フォルダーに正しいチェックサムを持つパーツを見つけた場合、他のレプリカからデータを取得することなくデータをアタッチします。
正しいチェックサムを持つパーツが存在しない場合、パーツを持つ任意のレプリカからデータがダウンロードされます。

一つのレプリカの `detached` ディレクトリにデータを置き、すべてのレプリカでテーブルに追加するために `ALTER ... ATTACH` クエリを使用できます。

## ATTACH PARTITION FROM {#attach-partition-from}

``` sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

このクエリは `table1` から `table2` にデータパーティションをコピーします。

注意点:

- データは `table1` からも `table2` からも削除されません。
- `table1` は一時テーブルである可能性があります。

クエリが正常に実行されるためには、以下の条件が満たされている必要があります。

- 両方のテーブルが同じ構造でなければなりません。
- 両方のテーブルが同じパーティションキー、同じオーダーバイキー、および同じ主キーを持っている必要があります。
- 両方のテーブルが同じストレージポリシーを持っている必要があります。
- 目的のテーブルは、ソーステーブルからすべてのインデックスとプロジェクションを含める必要があります。もし `enforce_index_structure_match_on_partition_manipulation` 設定が目的のテーブルに有効になっている場合、インデックスとプロジェクションは同一でなければなりません。そうでない場合、目的のテーブルはソーステーブルのインデックスとプロジェクションのスーパーセットを持つことができます。

## REPLACE PARTITION {#replace-partition}

``` sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

このクエリは `table1` から `table2` にデータパーティションをコピーし、`table2` の既存のパーティションを置き換えます。この操作はアトミックです。

注意点:

- データは `table1` から削除されません。
- `table1` は一時テーブルである可能性があります。

クエリが正常に実行されるためには、以下の条件が満たされている必要があります。

- 両方のテーブルが同じ構造でなければなりません。
- 両方のテーブルが同じパーティションキー、同じオーダーバイキー、および同じ主キーを持っている必要があります。
- 両方のテーブルが同じストレージポリシーを持っている必要があります。
- 目的のテーブルは、ソーステーブルからすべてのインデックスとプロジェクションを含める必要があります。もし `enforce_index_structure_match_on_partition_manipulation` 設定が目的のテーブルに有効になっている場合、インデックスとプロジェクションは同一でなければなりません。そうでない場合、目的のテーブルはソーステーブルのインデックスとプロジェクションのスーパーセットを持つことができます。

## MOVE PARTITION TO TABLE {#move-partition-to-table}

``` sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

このクエリは、`table_source` から `table_dest` へデータパーティションを移動し、`table_source` のデータを削除します。

クエリが正常に実行されるためには、以下の条件が満たされている必要があります。

- 両方のテーブルが同じ構造でなければなりません。
- 両方のテーブルが同じパーティションキー、同じオーダーバイキー、および同じ主キーを持っている必要があります。
- 両方のテーブルが同じストレージポリシーを持っている必要があります。
- 両方のテーブルが同じエンジンファミリー（レプリケートまたは非レプリケート）でなければなりません。
- 目的のテーブルは、ソーステーブルからすべてのインデックスとプロジェクションを含める必要があります。もし `enforce_index_structure_match_on_partition_manipulation` 設定が目的のテーブルに有効になっている場合、インデックスとプロジェクションは同一でなければなりません。そうでない場合、目的のテーブルはソーステーブルのインデックスとプロジェクションのスーパーセットを持つことができます。

## CLEAR COLUMN IN PARTITION {#clear-column-in-partition}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

指定されたカラムのすべての値をパーティション内でリセットします。テーブル作成時に `DEFAULT` 句が指定されている場合、このクエリはカラム値を指定されたデフォルト値に設定します。

例:

``` sql
ALTER TABLE visits CLEAR COLUMN hour in PARTITION 201902
```

## FREEZE PARTITION {#freeze-partition}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

このクエリは指定されたパーティションのローカルバックアップを作成します。`PARTITION` 句を省略した場合、クエリはすべてのパーティションのバックアップを一度に作成します。

:::note
バックアッププロセス全体は、サーバーを停止せずに実行されます。
:::

注意点として、古いスタイルのテーブルではパーティション名のプレフィックス（例えば、`2019`）を指定できます。すると、クエリはすべての対応するパーティションのバックアップを作成します。パーティション式の設定については、[パーティション式の設定方法](#how-to-set-partition-expression)セクションをお読みください。

実行時に、データスナップショットのために、クエリはテーブルデータへのハードリンクを作成します。ハードリンクは、次のディレクトリに配置されます：`/var/lib/clickhouse/shadow/N/...`、ここで：

- `/var/lib/clickhouse/` は、設定で指定された動作中のClickHouseディレクトリです。
- `N` はバックアップの増分番号です。
- `WITH NAME` パラメータが指定された場合、`'backup_name'` パラメータの値が増分番号の代わりに使用されます。

:::note
テーブルのデータストレージに [一連のディスクを使用する](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes)場合、`shadow/N` ディレクトリは各ディスクに表示され、`PARTITION` 式によって一致するデータパーツが保存されます。
:::

バックアップ内には、`/var/lib/clickhouse/` 内のような同じ構造のディレクトリが作成されます。クエリは、すべてのファイルに対して `chmod` を実施し、それらへの書き込みを禁止します。

バックアップを作成した後、`/var/lib/clickhouse/shadow/` からリモートサーバーにデータをコピーし、その後ローカルサーバーから削除できます。 `ALTER t FREEZE PARTITION` クエリはレプリケートされません。ローカルサーバーのみでローカルバックアップを作成します。

クエリはほぼ瞬時にバックアップを作成します（ただし、最初に対応するテーブルへの現在のクエリが完了するのを待ちます）。

`ALTER TABLE t FREEZE PARTITION` は、テーブルメタデータではなくデータのみをコピーします。テーブルメタデータのバックアップを作成するには、`/var/lib/clickhouse/metadata/database/table.sql` ファイルをコピーしてください。

バックアップからデータを復元するには、次の手順を実行します：

1. テーブルが存在しない場合は作成します。クエリを表示するには、.sqlファイルを使用し（`ATTACH` を `CREATE` に置き換えます）。
2. バックアップ内の `data/database/table/` ディレクトリから `/var/lib/clickhouse/data/database/table/detached/` ディレクトリにデータをコピーします。
3. データをテーブルに追加するために `ALTER TABLE t ATTACH PARTITION` クエリを実行します。

バックアップからの復元にはサーバーを停止する必要はありません。

バックアップとデータ復元に関する詳細は、[データバックアップ](/operations/backup.md)セクションを参照してください。

## UNFREEZE PARTITION {#unfreeze-partition}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

指定された名前の `freezed` パーティションをディスクから削除します。`PARTITION` 句を省略した場合、クエリはすべてのパーティションのバックアップを一度に削除します。

## CLEAR INDEX IN PARTITION {#clear-index-in-partition}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR INDEX index_name IN PARTITION partition_expr
```

このクエリは `CLEAR COLUMN` と同様に機能しますが、カラムデータの代わりにインデックスをリセットします。

## FETCH PARTITION\|PART {#fetch-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] FETCH PARTITION|PART partition_expr FROM 'path-in-zookeeper'
```

別のサーバーからパーティションをダウンロードします。このクエリは、レプリケートされたテーブルでのみ機能します。

クエリは次のように実行されます：

1. 指定されたシャードからパーティション|パーツをダウンロードします。`path-in-zookeeper` では、ZooKeeper内のシャードへのパスを指定する必要があります。
2. 次に、クエリはダウンロードしたデータを `table_name` テーブルの `detached` ディレクトリに配置します。データをテーブルに追加するために [ATTACH PARTITION\|PART](#attach-partitionpart) クエリを使用します。

例：

1. PARTITION のフェッチ
``` sql
ALTER TABLE users FETCH PARTITION 201902 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PARTITION 201902;
```
2. PART のフェッチ
``` sql
ALTER TABLE users FETCH PART 201901_2_2_0 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PART 201901_2_2_0;
```

注意点：

- `ALTER ... FETCH PARTITION|PART` クエリはレプリケートされません。パーツまたはパーティションをローカルサーバーの `detached` ディレクトリにのみ配置します。
- `ALTER TABLE ... ATTACH` クエリはレプリケートされます。データはすべてのレプリカに追加されます。データは `detached` ディレクトリからの一つのレプリカに追加され、他のレプリカには隣接するレプリカから追加されます。

ダウンロード前に、システムはパーティションが存在するかどうか、テーブル構造が一致するかどうかを確認します。最も適切なレプリカは、健全なレプリカから自動的に選択されます。

クエリは `ALTER TABLE` と呼ばれていますが、テーブル構造を変更せず、テーブル内のデータの可用性を即座に変更することはありません。

## MOVE PARTITION\|PART {#move-partitionpart}

`MergeTree` エンジンテーブルのパーティションまたはデータパーツを別のボリュームまたはディスクに移動します。詳細は [データストレージに複数のブロックデバイスを使用]( /engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes) を参照してください。

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

`ALTER TABLE t MOVE` クエリは：

- レプリケートされません。なぜなら、異なるレプリカが異なるストレージポリシーを持つ可能性があるためです。
- 指定されたディスクまたはボリュームが構成されていない場合はエラーを返します。また、ストレージポリシーに指定されたデータ移動の条件が適用できない場合にもエラーを返します。
- データがバックグラウンドプロセス、同時 `ALTER TABLE t MOVE` クエリ、またはバックグラウンドデータマージの結果としてすでに移動されている場合、エラーが返されることもあります。この場合、ユーザーは追加の操作を行うべきではありません。

例：

``` sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow'
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd'
```

## UPDATE IN PARTITION {#update-in-partition}

指定されたフィルタリング式に一致する指定されたパーティション内のデータを操作します。[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

構文：

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

### 関連項目 {#see-also}

- [UPDATE](/sql-reference/statements/alter/partition#update-in-partition)

## DELETE IN PARTITION {#delete-in-partition}

指定されたフィルタリング式に一致する指定されたパーティション内のデータを削除します。[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

構文：

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

### 関連項目 {#see-also-1}

- [DELETE](/sql-reference/statements/alter/delete)

## How to Set Partition Expression {#how-to-set-partition-expression}

`ALTER ... PARTITION` クエリでは、さまざまな方法でパーティション式を指定できます。

- `system.parts` テーブルの `partition` カラムの値として。例えば、`ALTER TABLE visits DETACH PARTITION 201901`。
- キーワード `ALL` を使用します。これは DROP/DETACH/ATTACH/ATTACH FROM のみで使用できます。例えば、`ALTER TABLE visits ATTACH PARTITION ALL`。
- テーブルパーティショニングキーのタプルに一致する式または定数のタプルとして。単一要素パーティショニングキーの場合、式は `tuple (...)` 関数でラップする必要があります。例えば、`ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25')))`.
- パーティションIDを使用します。パーティションIDは、パーティションの文字列識別子で、ファイルシステムやZooKeeperでのパーティション名として使用されます。パーティションIDは、`PARTITION ID` 句で指定する必要があります。例えば、`ALTER TABLE visits DETACH PARTITION ID '201901'`。
- [ALTER ATTACH PART](#attach-partitionpart) と [DROP DETACHED PART](#drop-detached-partitionpart) クエリでは、パーツの名前を指定するために、[system.detached_parts](/operations/system-tables/detached_parts) テーブルの `name` カラムの値を持つ文字列リテラルを使用します。例えば、`ALTER TABLE visits ATTACH PART '201901_1_1_0'`。

パーティションを指定する際に引用符を使用するかどうかは、パーティション式のタイプに依存します。例えば、`String` 型の場合、名前を引用符 (`'`) で指定する必要があります。`Date` および `Int*` 型の場合、引用符は必要ありません。

上記のすべてのルールは、[OPTIMIZE](/sql-reference/statements/optimize.md) クエリにも当てはまります。非パーティショニングテーブルを最適化する際には、唯一のパーティションを指定する場合、式 `PARTITION tuple()` を設定します。例えば：

``` sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION` は、[UPDATE](/sql-reference/statements/alter/update) または [DELETE](/sql-reference/statements/alter/delete) 式が `ALTER TABLE` クエリの結果として適用されるパーティションを指定します。新しいパーツは指定されたパーティションからのみ作成されます。この方法で、`IN PARTITION` はテーブルが多くのパーティションに分割されているときに負荷を軽減するのに役立ち、データのアップデートをポイントごとに行うことができます。

`ALTER ... PARTITION` クエリの例は、テスト [`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql) と [`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql) で示されています。
