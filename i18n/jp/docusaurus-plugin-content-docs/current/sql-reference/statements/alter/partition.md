---
description: 'パーティションに関するドキュメント'
sidebar_label: 'PARTITION'
sidebar_position: 38
slug: /sql-reference/statements/alter/partition
title: 'パーティションおよびパーツの操作'
doc_type: 'reference'
---

[パーティション](/engines/table-engines/mergetree-family/custom-partitioning-key.md)に対して、次の操作を実行できます。

* [DETACH PARTITION|PART](#detach-partitionpart) — パーティションまたはパーツを `detached` ディレクトリに移動し、テーブルから切り離します。
* [DROP PARTITION|PART](#drop-partitionpart) — パーティションまたはパーツを削除します。
* [DROP DETACHED PARTITION|PART](#drop-detached-partitionpart) - `detached` ディレクトリからパーツ、またはパーティションに属するすべてのパーツを削除します。
* [FORGET PARTITION](#forget-partition) — パーティションが空の場合、そのメタデータを ZooKeeper から削除します。
* [ATTACH PARTITION|PART](#attach-partitionpart) — `detached` ディレクトリからパーティションまたはパーツをテーブルに追加します。
* [ATTACH PARTITION FROM](#attach-partition-from) — データパーティションをあるテーブルから別のテーブルへコピーして追加します。
* [REPLACE PARTITION](#replace-partition) — データパーティションをあるテーブルから別のテーブルへコピーして置き換えます。
* [MOVE PARTITION TO TABLE](#move-partition-to-table) — データパーティションをあるテーブルから別のテーブルへ移動します。
* [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — パーティション内の指定したカラムの値をリセットします。
* [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — パーティション内の指定したセカンダリインデックスをリセットします。
* [FREEZE PARTITION](#freeze-partition) — パーティションのバックアップを作成します。
* [UNFREEZE PARTITION](#unfreeze-partition) — パーティションのバックアップを削除します。
* [FETCH PARTITION|PART](#fetch-partitionpart) — 他のサーバーからパーツまたはパーティションをダウンロードします。
* [MOVE PARTITION|PART](#move-partitionpart) — パーティション／データパーツを別のディスクまたはボリュームに移動します。
* [UPDATE IN PARTITION](#update-in-partition) — 条件に基づいてパーティション内のデータを更新します。
* [DELETE IN PARTITION](#delete-in-partition) — 条件に基づいてパーティション内のデータを削除します。
* [REWRITE PARTS](#rewrite-parts) — テーブル内（または特定パーティション内）のパーツを完全に書き換えます。

{/* */ }


## DETACH PARTITION|PART {#detach-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

指定したパーティションのすべてのデータを `detached` ディレクトリに移動します。サーバーは、そのデータパーティションが存在しないものとして扱います。[ATTACH](#attach-partitionpart) クエリを実行するまで、サーバーはこのデータを認識しません。

例：

```sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

パーティション式の設定については、[パーティション式の設定方法](#how-to-set-partition-expression)のセクションを参照してください。

クエリが実行された後は、`detached` ディレクトリ内のデータに対して自由に操作できます。ファイルシステムから削除しても、そのまま残しておいてもかまいません。

このクエリはレプリケートされるクエリであり、すべてのレプリカ上でデータを `detached` ディレクトリに移動します。なお、このクエリはリーダーレプリカでのみ実行できます。特定のレプリカがリーダーかどうかを確認するには、[system.replicas](/operations/system-tables/replicas) テーブルに対して `SELECT` クエリを実行します。別の方法としては、すべてのレプリカで `DETACH` クエリを実行する方が簡単です。リーダーレプリカ（複数のリーダーが存在し得ます）以外のすべてのレプリカは例外をスローします。


## DROP PARTITION|PART {#drop-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

指定されたパーティションをテーブルから削除します。このクエリはパーティションを非アクティブとしてマークし、およそ10分後にデータを完全に削除します。

パーティション式の設定については、[パーティション式の設定方法](#how-to-set-partition-expression) セクションを参照してください。

このクエリはレプリケーションされ、すべてのレプリカからデータを削除します。

例:

```sql
ALTER TABLE mt DROP PARTITION '2020-11-21';
ALTER TABLE mt DROP PART 'all_4_4_0';
```


## DROP DETACHED PARTITION|PART {#drop-detached-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP DETACHED PARTITION|PART ALL|partition_expr
```

指定したパーティション内の指定したパーツ、またはすべてのパーツを `detached` から削除します。
パーティション式の設定については、[パーティション式の設定方法](#how-to-set-partition-expression) セクションを参照してください。


## FORGET PARTITION（パーティション情報の破棄） {#forget-partition}

```sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

空のパーティションに関するすべてのメタデータを ZooKeeper から削除します。パーティションが空でない場合や、存在しない（不明な）パーティションを指定した場合、クエリは失敗します。今後二度と使用しないパーティションに対してのみ実行するようにしてください。

パーティション式の設定については、[パーティション式の設定方法](#how-to-set-partition-expression) のセクションを参照してください。

例：

```sql
ALTER TABLE mt FORGET PARTITION '20201121';
```


## ATTACH PARTITION|PART {#attach-partitionpart}

```sql
ALTER TABLE table_name ATTACH PARTITION|PART partition_expr
```

`detached` ディレクトリからテーブルにデータを追加します。パーティション全体または単一のパーツ単位でデータを追加できます。例：

```sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

パーティション式の設定については、[パーティション式の設定方法](#how-to-set-partition-expression) セクションを参照してください。

このクエリはレプリケートされます。レプリカのイニシエーターは、`detached` ディレクトリにデータがあるかどうかを確認します。
データが存在する場合、クエリはその完全性をチェックします。問題がなければ、クエリはそのデータをテーブルに追加します。

アタッチコマンドを受信した非イニシエーターレプリカが、自身の `detached` ディレクトリ内に正しいチェックサムを持つパーツを見つけた場合、そのデータは他のレプリカから取得することなくアタッチされます。
正しいチェックサムを持つパーツが存在しない場合、そのデータはそのパーツを保持している任意のレプリカからダウンロードされます。

1 つのレプリカ上の `detached` ディレクトリにデータを配置し、`ALTER ... ATTACH` クエリを使用して、すべてのレプリカ上のテーブルにそのデータを追加できます。


## ATTACH PARTITION FROM {#attach-partition-from}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

このクエリは、`table1` から `table2` へデータパーティションをコピーします。

次の点に注意してください。

* データは `table1` からも `table2` からも削除されません。
* `table1` は一時テーブルであってもかまいません。

クエリを正常に実行するには、次の条件を満たす必要があります。

* 両方のテーブルは同じ構造でなければなりません。
* 両方のテーブルは同じパーティションキー、同じ ORDER BY キー、および同じプライマリキーを持っていなければなりません。
* 両方のテーブルは同じストレージポリシーを持っていなければなりません。
* 宛先テーブルには、ソーステーブルのすべてのインデックスとプロジェクションが含まれていなければなりません。宛先テーブルで `enforce_index_structure_match_on_partition_manipulation` 設定が有効になっている場合、インデックスとプロジェクションは完全に一致している必要があります。そうでない場合、宛先テーブルはソーステーブルのインデックスおよびプロジェクションのスーパーセットであってもかまいません。


## パーティションの置換 {#replace-partition}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

このクエリは `table1` から `table2` へデータパーティションをコピーし、`table2` 内の既存パーティションを置き換えます。この操作はアトミックに行われます。

次の点に注意してください:

* データは `table1` から削除されません。
* `table1` は一時テーブルである場合があります。

クエリを正常に実行するには、次の条件を満たしている必要があります。

* 両方のテーブルは同じ構造でなければなりません。
* 両方のテーブルは同じパーティションキー、同じ ORDER BY キー、および同じプライマリキーを持つ必要があります。
* 両方のテーブルは同じストレージポリシーを持つ必要があります。
* 宛先テーブルには、ソーステーブルのすべてのインデックスとプロジェクションが含まれている必要があります。宛先テーブルで `enforce_index_structure_match_on_partition_manipulation` 設定が有効になっている場合、インデックスとプロジェクションは完全に一致していなければなりません。そうでない場合、宛先テーブルはソーステーブルのインデックスとプロジェクションのスーパーセットであってもかまいません。


## パーティションを別のテーブルへ移動 {#move-partition-to-table}

```sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

このクエリは、`table_source` から `table_dest` にデータパーティションを移動し、`table_source` からはデータを削除します。

クエリが正常に実行されるためには、次の条件を満たす必要があります。

* 両方のテーブルは同じ構造である必要があります。
* 両方のテーブルは同じパーティションキー、同じ ORDER BY キー、同じプライマリキーを持つ必要があります。
* 両方のテーブルは同じストレージポリシーを使用している必要があります。
* 両方のテーブルは同じエンジンファミリー（レプリケートあり／なし）である必要があります。
* 宛先テーブルには、ソーステーブルに存在するすべてのインデックスとプロジェクションが含まれている必要があります。宛先テーブルで `enforce_index_structure_match_on_partition_manipulation` 設定が有効になっている場合、インデックスとプロジェクションは完全に一致していなければなりません。それ以外の場合、宛先テーブルはソーステーブルのインデックスおよびプロジェクションのスーパーセットであってもかまいません。


## パーティション内の列のクリア {#clear-column-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

指定したパーティション内の指定した列のすべての値をリセットします。テーブル作成時に `DEFAULT` 句が設定されている場合、このクエリはその列の値を指定されたデフォルト値に設定します。

例：

```sql
ALTER TABLE visits CLEAR COLUMN hour in PARTITION 201902
```


## FREEZE PARTITION（パーティションのフリーズ） {#freeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

このクエリは、指定したパーティションのローカルバックアップを作成します。`PARTITION` 句を省略した場合、クエリはすべてのパーティションのバックアップを一度に作成します。

:::note
バックアップ処理全体は、サーバーを停止せずに実行されます。
:::

旧スタイルのテーブルでは、パーティション名のプレフィックス（例: `2019`）を指定できます。この場合、クエリは該当するすべてのパーティションのバックアップを作成します。パーティション式の設定については、[パーティション式の設定方法](#how-to-set-partition-expression) セクションを参照してください。

クエリの実行時点で、データスナップショットのためにテーブルデータへのハードリンクが作成されます。ハードリンクは `/var/lib/clickhouse/shadow/N/...` ディレクトリに配置されます。ここで:

* `/var/lib/clickhouse/` は、設定ファイルで指定された ClickHouse の作業ディレクトリです。
* `N` はバックアップの連番です。
* `WITH NAME` パラメータが指定されている場合は、連番の代わりに `'backup_name'` パラメータの値が使用されます。

:::note
テーブルのデータ保存に [複数ディスクを使用する構成](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes) の場合、`shadow/N` ディレクトリは各ディスク上に作成され、`PARTITION` 式に一致したデータパーツを保存します。
:::

バックアップ内には、`/var/lib/clickhouse/` と同じディレクトリ構造が作成されます。クエリはすべてのファイルに対して `chmod` を実行し、書き込みを禁止します。

バックアップを作成した後、`/var/lib/clickhouse/shadow/` からリモートサーバーへデータをコピーし、その後ローカルサーバーから削除できます。`ALTER t FREEZE PARTITION` クエリはレプリケートされない点に注意してください。これはローカルサーバー上にのみローカルバックアップを作成します。

このクエリは、バックアップをほぼ瞬時に作成します（ただし、対象テーブルへの現在のクエリの実行が完了するまで待機します）。

`ALTER TABLE t FREEZE PARTITION` はデータのみをコピーし、テーブルメタデータはコピーしません。テーブルメタデータのバックアップを作成するには、`/var/lib/clickhouse/metadata/database/table.sql` ファイルをコピーしてください。

バックアップからデータを復元するには、次の手順を実行します。

1. テーブルが存在しない場合は作成します。クエリを確認するには、その .sql ファイルを参照します（ファイル内の `ATTACH` を `CREATE` に置き換えてください）。
2. バックアップ内の `data/database/table/` ディレクトリから、`/var/lib/clickhouse/data/database/table/detached/` ディレクトリへデータをコピーします。
3. `ALTER TABLE t ATTACH PARTITION` クエリを実行して、テーブルにデータを追加します。

バックアップからの復元には、サーバーの停止は不要です。

クエリはパーツを並列に処理し、スレッド数は `max_threads` 設定で制御されます。

バックアップとデータの復元の詳細については、[&quot;Backup and Restore in ClickHouse&quot;](/operations/backup/overview) セクションを参照してください。


## UNFREEZE PARTITION {#unfreeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

指定された名前の `frozen` パーティションをディスクから削除します。`PARTITION` 句を省略すると、すべてのパーティションのバックアップが一度に削除されます。


## パーティション内のインデックスのクリア {#clear-index-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR INDEX index_name IN PARTITION partition_expr
```

このクエリは `CLEAR COLUMN` と同様に動作しますが、カラムのデータではなくインデックスをリセットします。


## FETCH PARTITION|PART {#fetch-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FETCH PARTITION|PART partition_expr FROM 'path-in-zookeeper'
```

別のサーバーからパーティションをダウンロードします。このクエリはレプリケーテッドテーブルでのみ動作します。

このクエリは次の処理を行います。

1. 指定されたシャードから partition|part をダウンロードします。`path-in-zookeeper` には、ZooKeeper 内の当該シャードを指すパスを指定する必要があります。
2. その後、ダウンロードしたデータを `table_name` テーブルの `detached` ディレクトリに配置します。テーブルにデータを追加するには [ATTACH PARTITION|PART](#attach-partitionpart) クエリを使用します。

例:

1. FETCH PARTITION

```sql
ALTER TABLE users FETCH PARTITION 201902 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PARTITION 201902;
```

2. FETCH PART

```sql
ALTER TABLE users FETCH PART 201901_2_2_0 FROM '/clickhouse/tables/01-01/visits';
ALTER TABLE users ATTACH PART 201901_2_2_0;
```

次の点に注意してください:

* `ALTER ... FETCH PARTITION|PART` クエリはレプリケートされません。このクエリは、パーツまたはパーティションをローカルサーバー上の `detached` ディレクトリにのみ配置します。
* `ALTER TABLE ... ATTACH` クエリはレプリケートされます。このクエリは、すべてのレプリカにデータを追加します。ある 1 つのレプリカには `detached` ディレクトリからデータを追加し、その他のレプリカには他のレプリカからデータを追加します。

データをダウンロードする前に、システムはパーティションが存在するかどうかとテーブル構造が一致しているかどうかを確認します。最適なレプリカは、正常なレプリカの中から自動的に選択されます。

このクエリは `ALTER TABLE` と呼ばれていますが、テーブル構造を変更せず、テーブルで利用可能なデータも即座には変更しません。


## MOVE PARTITION|PART {#move-partitionpart}

`MergeTree` エンジンのテーブルに対して、パーティションまたはデータパーツを別のボリュームまたはディスクに移動します。詳細は [Using Multiple Block Devices for Data Storage](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes) を参照してください。

```sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

`ALTER TABLE t MOVE` クエリは次のとおりです。

* レプリケーションされません。レプリカごとに異なるストレージポリシーを使用している可能性があるためです。
* 指定したディスクまたはボリュームが構成されていない場合はエラーを返します。ストレージポリシーで指定されているデータ移動条件を適用できない場合にもエラーを返します。
* 移動対象のデータが、バックグラウンド処理、同時に実行された `ALTER TABLE t MOVE` クエリ、またはバックグラウンドでのデータマージの結果としてすでに移動済みである場合には、エラーを返すことがあります。この場合、ユーザーが追加の操作を行う必要はありません。

例:

```sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow'
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd'
```


## UPDATE IN PARTITION {#update-in-partition}

指定したフィルタリング式に一致するパーティション内のデータを変更します。[mutation](/sql-reference/statements/alter/index.md#mutations)として実装されています。

構文:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr
```


### 例 {#example}

```sql
-- using partition name
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION 2 WHERE p = 2;

-- using partition id
ALTER TABLE mt UPDATE x = x + 1 IN PARTITION ID '2' WHERE p = 2;
```


### 関連項目 {#see-also}

* [UPDATE](/sql-reference/statements/alter/partition#update-in-partition)

## DELETE IN PARTITION {#delete-in-partition}

指定したパーティション内で、指定したフィルタリング式に一致するデータを削除します。これは [mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

構文:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE [IN PARTITION partition_expr] WHERE filter_expr
```


### 例 {#example-1}

```sql
-- using partition name
ALTER TABLE mt DELETE IN PARTITION 2 WHERE p = 2;

-- using partition id
ALTER TABLE mt DELETE IN PARTITION ID '2' WHERE p = 2;
```


## パーツの再書き込み {#rewrite-parts}

これは、新しい設定をすべて反映して、パーツをゼロから書き直します。テーブルレベルの設定である `use_const_adaptive_granularity` などは、デフォルトでは新たに書き込まれたパーツにのみ適用されるため、この動作は妥当です。

### 例 {#example-rewrite-parts}

```sql
ALTER TABLE mt REWRITE PARTS;
ALTER TABLE mt REWRITE PARTS IN PARTITION 2;
```


### 関連項目 {#see-also-1}

- [DELETE](/sql-reference/statements/alter/delete)

## パーティション式の設定方法 {#how-to-set-partition-expression}

`ALTER ... PARTITION` クエリでは、パーティション式を次のように指定できます。

* `system.parts` テーブルの `partition` カラムの値として指定する方法。たとえば、`ALTER TABLE visits DETACH PARTITION 201901`。
* キーワード `ALL` を使用する方法。これは DROP/DETACH/ATTACH/ATTACH FROM でのみ使用できます。たとえば、`ALTER TABLE visits ATTACH PARTITION ALL`。
* テーブルのパーティションキーのタプルと（型が）一致する式または定数のタプルとして指定する方法。パーティションキーが単一要素の場合は、その式を `tuple (...)` 関数でラップする必要があります。たとえば、`ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25')))`。
* パーティション ID を使用する方法。パーティション ID はパーティションの文字列識別子（可能であれば人間が読める形）であり、ファイルシステムおよび ZooKeeper でのパーティション名として使用されます。パーティション ID は `PARTITION ID` 句で、単一引用符で囲んで指定する必要があります。たとえば、`ALTER TABLE visits DETACH PARTITION ID '201901'`。
* [ALTER ATTACH PART](#attach-partitionpart) クエリおよび [DROP DETACHED PART](#drop-detached-partitionpart) クエリでは、パーツ名を指定するために、[system.detached&#95;parts](/operations/system-tables/detached_parts) テーブルの `name` カラムの値を文字列リテラルとして指定します。たとえば、`ALTER TABLE visits ATTACH PART '201901_1_1_0'`。

パーティションを指定するときの引用符の使用方法は、パーティション式の型に依存します。たとえば、`String` 型では、その名前を引用符（`'`）で囲む必要があります。`Date` および `Int*` 型では引用符は不要です。

上記のすべてのルールは、[OPTIMIZE](/sql-reference/statements/optimize.md) クエリにも適用されます。非パーティションテーブルを最適化する際に単一のパーティションのみを指定する必要がある場合は、`PARTITION tuple()` という式を指定します。たとえば、次のようになります。

```sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION` は、`ALTER TABLE` クエリの結果として [UPDATE](/sql-reference/statements/alter/update) または [DELETE](/sql-reference/statements/alter/delete) 式が適用されるパーティションを指定します。新しいパーツは、指定したパーティションからのみ作成されます。このようにして、`IN PARTITION` はテーブルが多数のパーティションに分割されている場合に、必要なデータだけを個別に更新したいときの負荷軽減に役立ちます。

`ALTER ... PARTITION` クエリの例は、テスト [`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql) および [`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql) で示されています。
