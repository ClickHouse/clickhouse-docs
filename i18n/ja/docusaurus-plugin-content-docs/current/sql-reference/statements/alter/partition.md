---
slug: /sql-reference/statements/alter/partition
sidebar_position: 38
sidebar_label: PARTITION
title: "パーティションとパーツの操作"
---

以下の操作が [パーティション](/engines/table-engines/mergetree-family/custom-partitioning-key.md) に対して利用可能です:

- [DETACH PARTITION\|PART](#detach-partitionpart) — 指定したパーティションまたはパーツを `detached` ディレクトリに移動し、忘れさせます。
- [DROP PARTITION\|PART](#drop-partitionpart) — 指定したパーティションまたはパーツを削除します。
- [DROP DETACHED PARTITION\|PART](#drop-detached-partitionpart) - `detached` からパートまたはパーティションの全てのパーツを削除します。
- [FORGET PARTITION](#forget-partition) — 空であれば、パーティションのメタデータを ZooKeeper から削除します。
- [ATTACH PARTITION\|PART](#attach-partitionpart) — `detached` ディレクトリからテーブルにパーティションまたはパーツを追加します。
- [ATTACH PARTITION FROM](#attach-partition-from) — 一つのテーブルから別のテーブルにパーティションをコピーして追加します。
- [REPLACE PARTITION](#replace-partition) — 一つのテーブルから別のテーブルにパーティションをコピーして置き換えます。
- [MOVE PARTITION TO TABLE](#move-partition-to-table) — 一つのテーブルから別のテーブルにパーティションのデータを移動します。
- [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — パーティション内の指定したカラムの値をリセットします。
- [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — パーティション内の指定したセカンダリ インデックスをリセットします。
- [FREEZE PARTITION](#freeze-partition) — パーティションのバックアップを作成します。
- [UNFREEZE PARTITION](#unfreeze-partition) — パーティションのバックアップを削除します。
- [FETCH PARTITION\|PART](#fetch-partitionpart) — 別のサーバーからパートまたはパーティションをダウンロードします。
- [MOVE PARTITION\|PART](#move-partitionpart) — パーティション/データパーツを別のディスクまたはボリュームに移動します。
- [UPDATE IN PARTITION](#update-in-partition) — 条件に基づいてパーティション内のデータを更新します。
- [DELETE IN PARTITION](#delete-in-partition) — 条件に基づいてパーティション内のデータを削除します。

<!-- -->

## DETACH PARTITION\|PART {#detach-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

指定されたパーティションの全データを `detached` ディレクトリに移動します。サーバーはそのデタッチされたデータパーティションを存在しないかのように忘れます。このデータに関する情報は、[ATTACH](#attach-partitionpart) クエリを実行するまでサーバーでは認識されません。

例:

``` sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

パーティション式を設定する方法については、[パーティション式の設定方法](#how-to-set-partition-expression) セクションをお読みください。

クエリが実行された後は、`detached` ディレクトリ内のデータで好きなことができます — ファイルシステムから削除したり、そのまま残しておいたりできます。

このクエリはレプリケーションされます — データは全てのレプリカの `detached` ディレクトリに移動されます。このクエリはリーダーレプリカでのみ実行できます。レプリカがリーダーかどうかを確認するには、[system.replicas](/operations/system-tables/replicas.md/#system_tables-replicas) テーブルに対して `SELECT` クエリを行ってください。あるいは、全てのレプリカで `DETACH` クエリを実行する方が簡単です — リーダーレプリカ以外すべてのレプリカが例外を投げます（複数のリーダーが許可されています）。

## DROP PARTITION\|PART {#drop-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

指定したパーティションをテーブルから削除します。このクエリはパーティションを非アクティブとしてタグ付けし、データを完全に約10分以内に削除します。

パーティション式を設定する方法については、[パーティション式の設定方法](#how-to-set-partition-expression) セクションをお読みください。

このクエリはレプリケーションされます — 全てのレプリカのデータが削除されます。

例:

``` sql
ALTER TABLE mt DROP PARTITION '2020-11-21';
ALTER TABLE mt DROP PART 'all_4_4_0';
```

## DROP DETACHED PARTITION\|PART {#drop-detached-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP DETACHED PARTITION|PART ALL|partition_expr
```

指定されたパーツまたは指定されたパーティションの全てのパーツを `detached` から削除します。
パーティション式を設定する方法については、[パーティション式の設定方法](#how-to-set-partition-expression) セクションをお読みください。

## FORGET PARTITION {#forget-partition}

``` sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

空のパーティションについてのすべてのメタデータを ZooKeeper から削除します。パーティションが空でないか不明な場合は、クエリは失敗します。再度使用されることのないパーティションに対してのみ実行するよう確認してください。

パーティション式を設定する方法については、[パーティション式の設定方法](#how-to-set-partition-expression) セクションをお読みください。

例:

``` sql
ALTER TABLE mt FORGET PARTITION '20201121';
```

## ATTACH PARTITION\|PART {#attach-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] ATTACH PARTITION|PART partition_expr
```

`detached` ディレクトリからテーブルにデータを追加します。全体のパーティションまたは別々のパーツのデータを追加することができます。例:

``` sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

パーティション式を設定する方法については、[パーティション式の設定方法](#how-to-set-partition-expression) セクションをお読みください。

このクエリはレプリケーションされます。レプリカの発信元は、`detached` ディレクトリにデータがあるかどうかを確認します。
データが存在する場合、クエリはその整合性を確認します。すべてが正しい場合、クエリはデータをテーブルに追加します。

発信元でないレプリカが、適切なチェックサムのパートを自分の `detached` フォルダで見つけた場合、それは他のレプリカからデータを取得せずにデータを追加します。
正しいチェックサムを持つパートがない場合、データはそのパートを持つ任意のレプリカからダウンロードされます。

あるレプリカの `detached` ディレクトリにデータを置き、全てのレプリカのテーブルに追加するために `ALTER ... ATTACH` クエリを使用できます。

## ATTACH PARTITION FROM {#attach-partition-from}

``` sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

このクエリは `table1` から `table2` にデータパーティションをコピーします。

注意点:

- データは `table1` または `table2` から削除されません。
- `table1` は一時テーブルである可能性があります。

クエリを成功させるために、次の条件を満たす必要があります：

- 両方のテーブルが同じ構造を持つ必要があります。
- 両方のテーブルが同じパーティションキー、同じORDER BYキー、および同じ主キーを持つ必要があります。
- 両方のテーブルが同じストレージポリシーを持つ必要があります。
- 目的のテーブルはソーステーブルからすべてのインデックスおよびプロジェクションを含める必要があります。先に `enforce_index_structure_match_on_partition_manipulation` 設定が有効の場合、インデックスおよびプロジェクションは同一でなければならず、そうでなければ目的のテーブルにはソーステーブルのインデックスおよびプロジェクションのスーパーセットが含まれていることができます。

## REPLACE PARTITION {#replace-partition}

``` sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

このクエリは `table1` から `table2` にデータパーティションをコピーし、`table2` に存在するパーティションを置き換えます。この操作はアトミックです。

注意点:

- データは `table1` から削除されません。
- `table1` は一時テーブルである可能性があります。

クエリを成功させるために、次の条件を満たす必要があります：

- 両方のテーブルが同じ構造を持つ必要があります。
- 両方のテーブルが同じパーティションキー、同じORDER BYキー、および同じ主キーを持つ必要があります。
- 両方のテーブルが同じストレージポリシーを持つ必要があります。
- 目的のテーブルはソーステーブルからすべてのインデックスおよびプロジェクションを含める必要があります。先に `enforce_index_structure_match_on_partition_manipulation` 設定が有効の場合、インデックスおよびプロジェクションは同一でなければならず、そうでなければ目的のテーブルにはソーステーブルのインデックスおよびプロジェクションのスーパーセットが含まれていることができます。

## MOVE PARTITION TO TABLE {#move-partition-to-table}

``` sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

このクエリは `table_source` から `table_dest` にパーティションのデータを移動し、`table_source` からデータを削除します。

クエリを成功させるために、次の条件を満たす必要があります：

- 両方のテーブルが同じ構造を持つ必要があります。
- 両方のテーブルが同じパーティションキー、同じORDER BYキー、および同じ主キーを持つ必要があります。
- 両方のテーブルが同じストレージポリシーを持つ必要があります。
- 両方のテーブルが同じエンジンファミリーでなければなりません（レプリケートまたは非レプリケート）。
- 目的のテーブルはソーステーブルからすべてのインデックスおよびプロジェクションを含める必要があります。先に `enforce_index_structure_match_on_partition_manipulation` 設定が有効の場合、インデックスおよびプロジェクションは同一でなければならず、そうでなければ目的のテーブルにはソーステーブルのインデックスおよびプロジェクションのスーパーセットが含まれていることができます。

## CLEAR COLUMN IN PARTITION {#clear-column-in-partition}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

指定したカラムのすべての値をパーティション内でリセットします。テーブル作成時に `DEFAULT` 句が決定されていた場合、このクエリはカラムの値を指定されたデフォルト値に設定します。

例:

``` sql
ALTER TABLE visits CLEAR COLUMN hour IN PARTITION 201902
```

## FREEZE PARTITION {#freeze-partition}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

このクエリは指定されたパーティションのローカルバックアップを作成します。`PARTITION` 句が省略された場合は、一度にすべてのパーティションのバックアップが作成されます。

:::note
バックアッププロセス全体は、サーバーを停止することなく実行されます。
:::

古いスタイルのテーブルの場合、パーティション名のプレフィックスを指定することができます（例えば、`2019`） - これにより、対応するすべてのパーティションのバックアップが作成されます。パーティション式の設定方法については、[パーティション式の設定方法](#how-to-set-partition-expression) セクションをお読みください。

実行時に、データスナップショット用として、クエリはテーブルデータへのハードリンクを作成します。ハードリンクは `/var/lib/clickhouse/shadow/N/...` ディレクトリに配置されます。ここで:

- `/var/lib/clickhouse/` は設定ファイルに指定された作業用 ClickHouse ディレクトリです。
- `N` はバックアップのインクリメンタル番号です。
- `WITH NAME` パラメータが指定されている場合、`'backup_name'` の値がインクリメンタル番号の代わりに使用されます。

:::note
データの保存にテーブル用に [ディスクのセット](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes) を使用している場合、`shadow/N` ディレクトリはすべてのディスクに存在し、`PARTITION` 式で一致するデータパーツを格納します。
:::

バックアップ内では、`/var/lib/clickhouse/` 内の同じディレクトリ構造が作成されます。クエリはすべてのファイルに `chmod` を実行し、書き込みを禁止します。

バックアップを作成した後は、`/var/lib/clickhouse/shadow/` からデータをリモートサーバーにコピーし、その後ローカルサーバーから削除できます。 `ALTER t FREEZE PARTITION` クエリはレプリケーションされません。ローカルサーバーのみでローカルバックアップを作成します。

クエリはほぼ瞬時にバックアップを作成します（ただし、最初に対応するテーブルへの現在のクエリが終了するのを待ちます）。

`ALTER TABLE t FREEZE PARTITION` はデータのみをコピーし、テーブルのメタデータはコピーしません。テーブルメタデータのバックアップを作成するには、`/var/lib/clickhouse/metadata/database/table.sql` ファイルをコピーします。

バックアップからデータを復元するには、次の手順を行います：

1. テーブルが存在しない場合は作成します。クエリを表示するには、.sql ファイルを使用します（その中の `ATTACH` を `CREATE` に置き換えます）。
2. バックアップ内の `data/database/table/` ディレクトリから `/var/lib/clickhouse/data/database/table/detached/` ディレクトリにデータをコピーします。
3. データをテーブルに追加するために `ALTER TABLE t ATTACH PARTITION` クエリを実行します。

バックアップからの復元にはサーバーを停止する必要はありません。

バックアップとデータ復元に関する詳細は、[データバックアップ](/operations/backup.md) セクションを参照してください。

## UNFREEZE PARTITION {#unfreeze-partition}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

指定された名前の `freezed` パーティションをディスクから削除します。`PARTITION` 句が省略された場合、クエリは一度に全てのパーティションのバックアップを削除します。

## CLEAR INDEX IN PARTITION {#clear-index-in-partition}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR INDEX index_name IN PARTITION partition_expr
```

このクエリは `CLEAR COLUMN` と似たように機能しますが、カラムデータの代わりにインデックスをリセットします。

## FETCH PARTITION\|PART {#fetch-partitionpart}

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] FETCH PARTITION|PART partition_expr FROM 'path-in-zookeeper'
```

別のサーバーからパーティションをダウンロードします。このクエリはレプリケートテーブルのみに適用されます。

クエリは以下の操作を行います：

1. 指定されたシャードからパーティション|パートをダウンロードします。`path-in-zookeeper` には ZooKeeper 内のシャードへのパスを指定する必要があります。
2. ダウンロードしたデータを `table_name` テーブルの `detached` ディレクトリに置きます。データをテーブルに追加するには [ATTACH PARTITION\|PART](#attach-partitionpart) クエリを使用します。

例:

1. PARTITION の取得
``` sql
ALTER TABLE users FETCH PARTITION 201902 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PARTITION 201902;
```
2. PART の取得
``` sql
ALTER TABLE users FETCH PART 201901_2_2_0 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PART 201901_2_2_0;
```

注意点：

- `ALTER ... FETCH PARTITION|PART` クエリはレプリケートされません。このクエリは `detached` ディレクトリにパートまたはパーティションをローカルサーバーにのみ配置します。
- `ALTER TABLE ... ATTACH` クエリはレプリケートされます。このクエリはすべてのレプリカにデータを追加します。データは `detached` ディレクトリからの一つのレプリカに追加され、他のレプリカには隣接するレプリカから追加されます。

ダウンロード前に、システムはパーティションが存在するか、テーブル構造が一致しているかを確認します。最も適切なレプリカが健全なレプリカから自動的に選択されます。

クエリは `ALTER TABLE` と呼ばれていますが、テーブルの構造を変更せず、テーブル内の利用可能なデータを直ちに変えることはありません。

## MOVE PARTITION\|PART {#move-partitionpart}

パーティションまたはデータパーツを別のボリュームまたはディスクに移動します。対象となるテーブルは `MergeTree` エンジンを使っています。詳細は [データストレージに複数のブロックデバイスを使用する](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes) を参照してください。

``` sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

`ALTER TABLE t MOVE` クエリは：

- レプリケーションされません。なぜなら、異なるレプリカが異なるストレージポリシーを持つ可能性があるからです。
- 指定されたディスクまたはボリュームが設定されていない場合、エラーを返します。また、ストレージポリシーで指定されたデータ移動の条件が適用できない場合もエラーを返します。
- データを移動する必要がある時、バックグラウンドプロセス、並行する `ALTER TABLE t MOVE` クエリ、またはバックグラウンドデータのマージが既にそのデータを移動している場合にはエラーが返されることがあります。この場合、ユーザーは追加のアクションを実行しないでください。

例:

``` sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow'
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd'
```

## UPDATE IN PARTITION {#update-in-partition}

指定されたフィルタリング式に一致するパーティション内のデータを操作します。[ミューテーション](/sql-reference/statements/alter/index.md#mutations) として実装されています。

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

- [UPDATE](/sql-reference/statements/alter/update.md/#alter-table-update-statements)

## DELETE IN PARTITION {#delete-in-partition}

指定されたフィルタリング式に一致するパーティション内のデータを削除します。[ミューテーション](/sql-reference/statements/alter/index.md#mutations) として実装されています。

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

- [DELETE](/sql-reference/statements/alter/delete.md/#alter-mutations)

## How to Set Partition Expression {#how-to-set-partition-expression}

`ALTER ... PARTITION` クエリでパーティション式を指定する方法はいくつかあります：

- `system.parts` テーブルの `partition` カラムの値として。例えば、`ALTER TABLE visits DETACH PARTITION 201901`。
- キーワード `ALL` を使用。これは DROP/DETACH/ATTACH/ATTACH FROM と一緒にのみ使えます。例えば、`ALTER TABLE visits ATTACH PARTITION ALL`。
- テーブルのパーティショニングキーのタプルに一致する (型が一致する) 式または定数のタプルとして。単一要素のパーティションキーの場合、式は `tuple (...)` 関数でラップする必要があります。例えば、`ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25')))`.
- パーティションIDを使用。パーティションIDは、パーティションの文字列識別子です（可能な場合は人間が読みやすい）で、ファイルシステムと ZooKeeper でのパーティションの名前として使用されます。パーティションIDは `PARTITION ID` 句で指定する必要があります。単一引用符で囲む必要があります。例えば、`ALTER TABLE visits DETACH PARTITION ID '201901'`。
- [ATTACH PART](#attach-partitionpart) および [DROP DETACHED PART](#drop-detached-partitionpart) クエリで、パートの名前を指定するときは、[system.detached_parts](/operations/system-tables/detached_parts.md/#system_tables-detached_parts) テーブルの `name` カラムからの値を持つ文字列リテラルを使用します。例えば、`ALTER TABLE visits ATTACH PART '201901_1_1_0'`。

パーティションを指定する際に引用符を使用するかどうかは、パーティション式の型によります。例えば、`String` 型の場合は、名前を引用符 (`'`) で指定する必要があります。`Date` や `Int*` 型では、引用符は必要ありません。

上記のルールは、[OPTIMIZE](/sql-reference/statements/optimize.md) クエリにも当てはまります。非パーティションテーブルを最適化する際に唯一のパーティションを指定する必要がある場合、式 `PARTITION tuple()` を設定します。例えば：

``` sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION` は、[UPDATE](/sql-reference/statements/alter/update.md/#alter-table-update-statements) または [DELETE](/sql-reference/statements/alter/delete.md/#alter-mutations) 式が `ALTER TABLE` クエリの結果として適用されるパーティションを指定します。新しいパーツは指定されたパーティションからのみ作成されます。この方法で、テーブルが多くのパーティションに分かれている場合でも、ポイントごとにデータを更新する必要がある場合の負荷を軽減できます。

`ALTER ... PARTITION` クエリの例は、テスト [`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql) および [`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql) で示されています。
