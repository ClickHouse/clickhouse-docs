---
'description': 'パーティションに関するドキュメント'
'sidebar_label': 'PARTITION'
'sidebar_position': 38
'slug': '/sql-reference/statements/alter/partition'
'title': 'パーティションとパーツの操作'
'doc_type': 'reference'
---

以下の操作が [partitions](/engines/table-engines/mergetree-family/custom-partitioning-key.md) で利用可能です:

- [DETACH PARTITION\|PART](#detach-partitionpart) — 指定したパーティションまたはパーツを `detached` ディレクトリに移動し、忘却します。
- [DROP PARTITION\|PART](#drop-partitionpart) — 指定したパーティションまたはパーツを削除します。
- [DROP DETACHED PARTITION\|PART](#drop-detached-partitionpart) — `detached` からパートまたはパーティションのすべてのパーツを削除します。
- [FORGET PARTITION](#forget-partition) — 空のパーティションのメタデータを ZooKeeper から削除します。
- [ATTACH PARTITION\|PART](#attach-partitionpart) — `detached` ディレクトリからテーブルにパーティションまたはパーツを追加します。
- [ATTACH PARTITION FROM](#attach-partition-from) — 一つのテーブルから別のテーブルにデータパーティションをコピーして追加します。
- [REPLACE PARTITION](#replace-partition) — 一つのテーブルから別のテーブルにデータパーティションをコピーして置き換えます。
- [MOVE PARTITION TO TABLE](#move-partition-to-table) — 一つのテーブルから別のテーブルにデータパーティションを移動します。
- [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — パーティション内の指定されたカラムの値をリセットします。
- [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — パーティション内の指定された二次インデックスをリセットします。
- [FREEZE PARTITION](#freeze-partition) — パーティションのバックアップを作成します。
- [UNFREEZE PARTITION](#unfreeze-partition) — パーティションのバックアップを削除します。
- [FETCH PARTITION\|PART](#fetch-partitionpart) — 別のサーバーからパートまたはパーティションをダウンロードします。
- [MOVE PARTITION\|PART](#move-partitionpart) — パーティション/データパーツを別のディスクまたはボリュームに移動します。
- [UPDATE IN PARTITION](#update-in-partition) — 条件に基づいてパーティション内のデータを更新します。
- [DELETE IN PARTITION](#delete-in-partition) — 条件に基づいてパーティション内のデータを削除します。
- [REWRITE PARTS](#rewrite-parts) — テーブル（または特定のパーティション）内のパーツを完全に書き換えます。

<!-- -->

## DETACH PARTITION\|PART {#detach-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

指定されたパーティションのすべてのデータを `detached` ディレクトリに移動します。サーバーは、切り離されたデータパーティションを存在しないかのように忘却します。サーバーは、[ATTACH](#attach-partitionpart) クエリを実行するまでこのデータを認識しません。

例:

```sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

パーティション式の設定に関するセクション [How to set the partition expression](#how-to-set-partition-expression) を参照してください。

クエリが実行された後、`detached` ディレクトリ内のデータに対して何をしても構いません — ファイルシステムから削除することもできますし、そのままにすることもできます。

このクエリはレプリケートされます — すべてのレプリカの `detached` ディレクトリにデータを移動します。このクエリはリーダーレプリカでのみ実行できます。レプリカがリーダーかどうかを確認するには、[system.replicas](/operations/system-tables/replicas) テーブルへの `SELECT` クエリを実行してください。代わりに、すべてのレプリカで `DETACH` クエリを実行する方が簡単です — 複数のリーダーが許可されているため、リーダーレプリカ以外のすべてのレプリカが例外をスローします。

## DROP PARTITION\|PART {#drop-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

指定されたパーティションをテーブルから削除します。このクエリはパーティションを非アクティブとしてタグ付けし、データを完全に削除します。おおよそ 10 分かかります。

パーティション式の設定に関するセクション [How to set the partition expression](#how-to-set-partition-expression) を参照してください。

このクエリはレプリケートされます — すべてのレプリカのデータが削除されます。

例:

```sql
ALTER TABLE mt DROP PARTITION '2020-11-21';
ALTER TABLE mt DROP PART 'all_4_4_0';
```

## DROP DETACHED PARTITION\|PART {#drop-detached-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP DETACHED PARTITION|PART ALL|partition_expr
```

指定されたパートまたは指定されたパーティションのすべてのパーツを `detached` から削除します。
パーティション式の設定に関するセクション [How to set the partition expression](#how-to-set-partition-expression) を参照してください。

## FORGET PARTITION {#forget-partition}

```sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

空のパーティションに関するすべてのメタデータを ZooKeeper から削除します。パーティションが空でない場合や不明である場合、クエリは失敗します。再利用されることのないパーティションに対してのみ実行してください。

パーティション式の設定に関するセクション [How to set the partition expression](#how-to-set-partition-expression) を参照してください。

例:

```sql
ALTER TABLE mt FORGET PARTITION '20201121';
```

## ATTACH PARTITION\|PART {#attach-partitionpart}

```sql
ALTER TABLE table_name ATTACH PARTITION|PART partition_expr
```

`detached` ディレクトリからテーブルにデータを追加します。全体のパーティションまたは個別のパーツのデータを追加することが可能です。例:

```sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

パーティション式の設定に関するセクション [How to set the partition expression](#how-to-set-partition-expression) を参照してください。

このクエリはレプリケートされます。レプリカのイニシエータは、`detached` ディレクトリにデータが存在するかどうかを確認します。
データが存在する場合、クエリはその整合性をチェックします。すべてが正しければ、クエリはデータをテーブルに追加します。

非イニシエータレプリカが、アタッチコマンドを受信し、自分の `detached` フォルダに正しいチェックサムのパーツを見つけると、他のレプリカからダウンロードすることなくデータを添付します。
正しいチェックサムのパーツが存在しない場合は、パーツを持つ任意のレプリカからデータがダウンロードされます。

一つのレプリカにデータを `detached` ディレクトリに放置し、すべてのレプリカのテーブルに追加するために `ALTER ... ATTACH` クエリを使用できます。

## ATTACH PARTITION FROM {#attach-partition-from}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

このクエリは `table1` から `table2` にデータパーティションをコピーします。

注意してください:

- データは `table1` からも `table2` からも削除されません。
- `table1` は一時テーブルである可能性があります。

クエリが成功するためには、以下の条件を満たす必要があります:

- 両方のテーブルが同じ構造を持たなければなりません。
- 両方のテーブルが同じパーティションキー、同じオーダーバイキー、および同じ主キーを持たなければなりません。
- 両方のテーブルが同じストレージポリシーを持たなければなりません。
- 目的のテーブルは、ソーステーブルのすべてのインデックスとプロジェクションを含む必要があります。もし目的のテーブルで `enforce_index_structure_match_on_partition_manipulation` 設定が有効になっている場合、インデックスとプロジェクションは同一でなければなりません。それ以外の場合、目的のテーブルにはソーステーブルのインデックスとプロジェクションのスーパーセットが含まれていてもかまいません。

## REPLACE PARTITION {#replace-partition}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

このクエリは `table1` から `table2` にデータパーティションをコピーし、`table2` の既存のパーティションを置き換えます。操作は原子的です。

注意してください:

- データは `table1` から削除されません。
- `table1` は一時テーブルである可能性があります。

クエリが成功するためには、以下の条件を満たす必要があります:

- 両方のテーブルが同じ構造を持たなければなりません。
- 両方のテーブルが同じパーティションキー、同じオーダーバイキー、および同じ主キーを持たなければなりません。
- 両方のテーブルが同じストレージポリシーを持たなければなりません。
- 目的のテーブルは、ソーステーブルのすべてのインデックスとプロジェクションを含む必要があります。もし目的のテーブルで `enforce_index_structure_match_on_partition_manipulation` 設定が有効になっている場合、インデックスとプロジェクションは同一でなければなりません。それ以外の場合、目的のテーブルにはソーステーブルのインデックスとプロジェクションのスーパーセットが含まれていてもかまいません。

## MOVE PARTITION TO TABLE {#move-partition-to-table}

```sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

このクエリは、データパーティションを `table_source` から `table_dest` に移動し、`table_source` からデータを削除します。

クエリが成功するためには、以下の条件を満たす必要があります:

- 両方のテーブルが同じ構造を持たなければなりません。
- 両方のテーブルが同じパーティションキー、同じオーダーバイキー、および同じ主キーを持たなければなりません。
- 両方のテーブルが同じストレージポリシーを持たなければなりません。
- 両方のテーブルは同じエンジンファミリー（レプリケートされたものか非レプリケートされたもの）でなければなりません。
- 目的のテーブルは、ソーステーブルのすべてのインデックスとプロジェクションを含む必要があります。もし目的のテーブルで `enforce_index_structure_match_on_partition_manipulation` 設定が有効になっている場合、インデックスとプロジェクションは同一でなければなりません。それ以外の場合、目的のテーブルにはソーステーブルのインデックスとプロジェクションのスーパーセットが含まれていてもかまいません。

## CLEAR COLUMN IN PARTITION {#clear-column-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

指定されたカラムのすべての値をパーティション内でリセットします。テーブル作成時に `DEFAULT` 句が設定されている場合、このクエリはカラムの値を指定されたデフォルト値に設定します。

例:

```sql
ALTER TABLE visits CLEAR COLUMN hour in PARTITION 201902
```

## FREEZE PARTITION {#freeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

このクエリは、指定されたパーティションのローカルバックアップを作成します。`PARTITION` 句が省略された場合、このクエリはすべてのパーティションのバックアップを一度に作成します。

:::note
バックアッププロセス全体はサーバーを停止することなく実行されます。
:::

古いスタイルのテーブルでは、パーティション名のプレフィックスを指定できます（例えば、`2019`） — その場合、このクエリは対応するすべてのパーティションのバックアップを作成します。パーティション式の設定に関するセクション [How to set the partition expression](#how-to-set-partition-expression) を参照してください。

実行時には、データスナップショットのために、クエリはテーブルデータへのハードリンクを作成します。ハードリンクは `/var/lib/clickhouse/shadow/N/...` ディレクトリに配置され、ここで：

- `/var/lib/clickhouse/` は、設定で指定された作業 ClickHouse ディレクトリです。
- `N` はバックアップの増分数字です。
- もし `WITH NAME` パラメータが指定されている場合、その場合 `'backup_name'` パラメータの値が増分数字の代わりに使用されます。

:::note
テーブル内のデータストレージ用に [複数のディスクのセットを使用する](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes) 場合、`shadow/N` ディレクトリはすべてのディスク上に表示され、`PARTITION` 式に一致するデータパーツを保存します。
:::

バックアップ内に、`/var/lib/clickhouse/` 内と同じディレクトリ構造が作成されます。このクエリは、すべてのファイルに対して書き込みを禁止するために `chmod` を実行します。

バックアップの作成後、データを `/var/lib/clickhouse/shadow/` からリモートサーバーにコピーし、その後ローカルサーバーから削除できます。この `ALTER t FREEZE PARTITION` クエリはレプリケートされず、ローカルサーバーにのみローカルバックアップを作成します。

このクエリはほぼ瞬時にバックアップを作成します（ただし、最初に対応するテーブルへの現在のクエリがすべて終了するのを待ちます）。

`ALTER TABLE t FREEZE PARTITION` はデータのみをコピーし、テーブルメタデータはコピーしません。テーブルメタデータのバックアップを作成するには、ファイル `/var/lib/clickhouse/metadata/database/table.sql` をコピーします。

バックアップからデータを復元するには、次の手順を実行します。

1. テーブルが存在しない場合は作成します。クエリを表示するには、.sql ファイルを使用し、その中の `ATTACH` を `CREATE` に置き換えます。
2. バックアップ内の `data/database/table/` ディレクトリから `/var/lib/clickhouse/data/database/table/detached/` ディレクトリにデータをコピーします。
3. データをテーブルに追加するために `ALTER TABLE t ATTACH PARTITION` クエリを実行します。

バックアップからの復元はサーバーを停止する必要はありません。

バックアップとデータの復元に関する詳細は、[Data Backup](/operations/backup.md) セクションを参照してください。

## UNFREEZE PARTITION {#unfreeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

指定された名前の `frozen` パーティションをディスクから削除します。`PARTITION` 句が省略された場合、このクエリはすべてのパーティションのバックアップを一度に削除します。

## CLEAR INDEX IN PARTITION {#clear-index-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR INDEX index_name IN PARTITION partition_expr
```

このクエリは `CLEAR COLUMN` と似た動作をしますが、カラムデータの代わりにインデックスをリセットします。

## FETCH PARTITION|PART {#fetch-partitionpart}

別のサーバーからパーティションをダウンロードします。このクエリはレプリケートされたテーブル用にのみ動作します。

クエリは次のことを行います：

1. 指定されたシャードからパーティション|パーツをダウンロードします。 'path-in-zookeeper' には、ZooKeeper内のシャードへのパスを指定する必要があります。
2. 次に、ダウンロードしたデータを `table_name` テーブルの `detached` ディレクトリに置きます。データをテーブルに追加するには、[ATTACH PARTITION\|PART](#attach-partitionpart) クエリを使用します。

例えば：

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

注意してください:

- `ALTER ... FETCH PARTITION|PART` クエリはレプリケートされません。それはパートまたはパーティションをローカルサーバーの `detached` ディレクトリにのみ配置します。
- `ALTER TABLE ... ATTACH` クエリはレプリケートされます。それはすべてのレプリカにデータを追加します。データは `detached` ディレクトリ内の一つのレプリカに追加され、他のレプリカには隣接レプリカから追加されます。

ダウンロード前に、システムはパーティションが存在するかどうか、またテーブル構造が一致するかどうかを確認します。最も適切なレプリカが健康なレプリカから自動的に選択されます。

クエリは `ALTER TABLE` と呼ばれますが、テーブル構造を変更することはなく、テーブル内のデータに即座に変化を与えることはありません。

## MOVE PARTITION\|PART {#move-partitionpart}

`MergeTree` エンジンテーブルのパーティションまたはデータパーツを別のボリュームまたはディスクに移動します。データストレージ用に [複数のブロックデバイスを使用する](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes) を参照してください。

```sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

`ALTER TABLE t MOVE` クエリ：

- レプリケートされません。なぜなら、異なるレプリカが異なるストレージポリシーを持っている可能性があるからです。
- 指定されたディスクまたはボリュームが設定されていない場合、エラーを返します。また、ストレージポリシーで指定されたデータ移動の条件が適用できない場合も、エラーが返されます。
- 後ろで行われるプロセスによって移動されるデータがすでに移動されている場合、同時に `ALTER TABLE t MOVE` クエリを実行した場合、またはバックグラウンドデータのマージの結果としてエラーが返される場合があります。この場合、ユーザーは追加の操作を行うべきではありません。

例:

```sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow'
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd'
```

## UPDATE IN PARTITION {#update-in-partition}

指定されたフィルタリング式に一致する指定されたパーティションのデータを操作します。[mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

構文：

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

### 関連 {#see-also}

- [UPDATE](/sql-reference/statements/alter/partition#update-in-partition)

## DELETE IN PARTITION {#delete-in-partition}

指定されたフィルタリング式に一致する指定されたパーティション内のデータを削除します。[mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

構文：

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

## REWRITE PARTS {#rewrite-parts}

これは、すべての新しい設定を使用してパーツを最初から書き換えます。これは、テーブルレベルの設定（例えば `use_const_adaptive_granularity`）がデフォルトで新しく書き込まれたパーツにのみ適用されるため、意味を持ちます。

### 例 {#example-rewrite-parts}

```sql
ALTER TABLE mt REWRITE PARTS;
ALTER TABLE mt REWRITE PARTS IN PARTITION 2;
```

### 関連 {#see-also-1}

- [DELETE](/sql-reference/statements/alter/delete)

## How to Set Partition Expression {#how-to-set-partition-expression}

`ALTER ... PARTITION` クエリでパーティション式をさまざまな方法で指定できます：

- `system.parts` テーブルの `partition` カラムからの値として。例えば、`ALTER TABLE visits DETACH PARTITION 201901` など。
- キーワード `ALL` を使って。これは DROP/DETACH/ATTACH/ATTACH FROM と共にのみ使用できます。例えば、`ALTER TABLE visits ATTACH PARTITION ALL` など。
- テーブルのパーティショニングキータプルと一致する（型が一致する）式または定数のタプルとして。単一要素のパーティションキーの場合、式は `tuple (...)` 関数にラップする必要があります。例えば、`ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25')))` など。
- パーティションIDとして。パーティションIDは、パーティションの文字列識別子（可能であれば人間が読める）であり、ファイルシステムやZooKeeperにおけるパーティションの名前として使用されます。パーティションIDは `PARTITION ID` 句で指定する必要があり、単一引用符で囲む必要があります。例えば、`ALTER TABLE visits DETACH PARTITION ID '201901'` など。
- [ALTER ATTACH PART](#attach-partitionpart) および [DROP DETACHED PART](#drop-detached-partitionpart) クエリにおいて、パーツの名前を指定するには、[system.detached_parts](/operations/system-tables/detached_parts) テーブルの `name` カラムからの値を持つ文字列リテラルを使用します。例えば、`ALTER TABLE visits ATTACH PART '201901_1_1_0'` など。

パーティション指定時の引用符の使用は、パーティション式の型に依存します。例えば、`String` 型の場合、その名前を引用符（`'`）で指定する必要があります。`Date` および `Int*` 型の場合、引用符は不要です。

これらのすべてのルールは、[OPTIMIZE](/sql-reference/statements/optimize.md) クエリにも当てはまります。非パーティションテーブルを最適化する際に唯一のパーティションを指定する必要がある場合は、式 `PARTITION tuple()` を設定します。例えば：

```sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION` は、[UPDATE](/sql-reference/statements/alter/update) または [DELETE](/sql-reference/statements/alter/delete) 式が `ALTER TABLE` クエリの結果として適用されるパーティションを指定します。新しいパーツは指定されたパーティションからのみ作成されます。これにより、テーブルが多数のパーティションに分かれている場合、リソースの負荷を軽減し、データを一点一点のみ更新することができます。

`ALTER ... PARTITION` クエリの例は、テスト [`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql) および [`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql) で示されています。
