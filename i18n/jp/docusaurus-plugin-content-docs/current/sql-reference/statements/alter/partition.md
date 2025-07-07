---
'description': 'Documentation for Partition'
'sidebar_label': 'PARTITION'
'sidebar_position': 38
'slug': '/sql-reference/statements/alter/partition'
'title': 'Manipulating Partitions and Parts'
---



以下の操作が[パーティション](/engines/table-engines/mergetree-family/custom-partitioning-key.md)に対して利用可能です：

- [DETACH PARTITION\|PART](#detach-partitionpart) — 指定したパーティションまたはパートを`detached`ディレクトリに移動し、忘れます。
- [DROP PARTITION\|PART](#drop-partitionpart) — 指定したパーティションまたはパートを削除します。
- [DROP DETACHED PARTITION\|PART](#drop-detached-partitionpart) — `detached`からパートまたはパーティションのすべてのパーツを削除します。
- [FORGET PARTITION](#forget-partition) — 空のパーティションのメタデータをZooKeeperから削除します。
- [ATTACH PARTITION\|PART](#attach-partitionpart) — `detached`ディレクトリからテーブルにパーティションまたはパートを追加します。
- [ATTACH PARTITION FROM](#attach-partition-from) — 一つのテーブルからデータパーティションを別のテーブルにコピーして追加します。
- [REPLACE PARTITION](#replace-partition) — 一つのテーブルからデータパーティションを別のテーブルにコピーして置き換えます。
- [MOVE PARTITION TO TABLE](#move-partition-to-table) — 一つのテーブルから別のテーブルにデータパーティションを移動します。
- [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — パーティション内の指定したカラムの値をリセットします。
- [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — パーティション内の指定した二次インデックスをリセットします。
- [FREEZE PARTITION](#freeze-partition) — パーティションのバックアップを作成します。
- [UNFREEZE PARTITION](#unfreeze-partition) — パーティションのバックアップを削除します。
- [FETCH PARTITION\|PART](#fetch-partitionpart) — 別のサーバーからパートまたはパーティションをダウンロードします。
- [MOVE PARTITION\|PART](#move-partitionpart) — パーティション/データパートを別のディスクまたはボリュームに移動します。
- [UPDATE IN PARTITION](#update-in-partition) — 条件によってパーティション内のデータを更新します。
- [DELETE IN PARTITION](#delete-in-partition) — 条件によってパーティション内のデータを削除します。

<!-- -->

## DETACH PARTITION\|PART {#detach-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

指定したパーティションのすべてのデータを`detached`ディレクトリに移動します。サーバーは、まるでそのデータパーティションが存在しないかのように、`detached`データを忘れます。このデータについてサーバーが認識するのは、[ATTACH](#attach-partitionpart)クエリを実行するまではありません。

例：

```sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

パーティション式の設定については、[How to set the partition expression](#how-to-set-partition-expression)のセクションを参照してください。

クエリが実行されると、`detached`ディレクトリ内のデータに対して何をしても構いません — ファイルシステムから削除することも、そのまま残すこともできます。

このクエリはレプリケートされ、すべてのレプリカの`detached`ディレクトリにデータを移動します。このクエリはリーダーレプリカでのみ実行可能です。レプリカがリーダーかどうかを知るには、[system.replicas](/operations/system-tables/replicas)テーブルへの`SELECT`クエリを実行します。あるいは、すべてのレプリカで`DETACH`クエリを実行する方が簡単です — リーダーレプリカを除くすべてのレプリカが例外を投げます（複数のリーダーが許可されているため）。

## DROP PARTITION\|PART {#drop-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

指定されたパーティションをテーブルから削除します。このクエリは、パーティションを非アクティブとしてタグ付けし、データを完全に削除します。約10分かかります。

パーティション式の設定については、[How to set the partition expression](#how-to-set-partition-expression)のセクションを参照してください。

このクエリはレプリケートされ、すべてのレプリカでデータが削除されます。

例：

```sql
ALTER TABLE mt DROP PARTITION '2020-11-21';
ALTER TABLE mt DROP PART 'all_4_4_0';
```

## DROP DETACHED PARTITION\|PART {#drop-detached-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP DETACHED PARTITION|PART ALL|partition_expr
```

指定されたパートまたは指定されたパーティションのすべてのパーツを`detached`から削除します。
パーティション式の設定については、[How to set the partition expression](#how-to-set-partition-expression)のセクションを参照してください。

## FORGET PARTITION {#forget-partition}

```sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

空のパーティションに関するすべてのメタデータをZooKeeperから削除します。パーティションが空でないか不明な場合、クエリは失敗します。再利用されないパーティションに対してのみ実行するようにしてください。

パーティション式の設定については、[How to set the partition expression](#how-to-set-partition-expression)のセクションを参照してください。

例：

```sql
ALTER TABLE mt FORGET PARTITION '20201121';
```

## ATTACH PARTITION\|PART {#attach-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] ATTACH PARTITION|PART partition_expr
```

`detached`ディレクトリからテーブルにデータを追加します。全体のパーティションまたは個別のパートにデータを追加することが可能です。例：

```sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

パーティション式の設定については、[How to set the partition expression](#how-to-set-partition-expression)のセクションを参照してください。

このクエリはレプリケートされます。レプリカのイニシエーターは、`detached`ディレクトリ内にデータが存在するかどうかを確認します。
データが存在すれば、クエリはその整合性をチェックします。すべてが正しければ、クエリはデータをテーブルに追加します。

イニシエーターでないレプリカは、ATTACHコマンドを受け取ると、自身の`detached`フォルダに正しいチェックサムのパートが見つかれば、他のレプリカからの取得なしにデータを追加します。
正しいチェックサムのパートが見つからなければ、どのレプリカからでもパートがダウンロードされます。

一つのレプリカの`detached`ディレクトリにデータを配置し、すべてのレプリカのテーブルに追加するために`ALTER ... ATTACH`クエリを使用できます。

## ATTACH PARTITION FROM {#attach-partition-from}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

このクエリは、データパーティションを`table1`から`table2`にコピーします。

注意点：

- データは`table1`または`table2`から削除されません。
- `table1`は一時テーブルであってもかまいません。

クエリが正常に実行されるためには、以下の条件を満たす必要があります：

- 両方のテーブルは同じ構造を持っている必要があります。
- 両方のテーブルは同じパーティションキー、同じORDER BYキーおよび同じ主キーを持っている必要があります。
- 両方のテーブルは同じストレージポリシーを持っている必要があります。
- 目的のテーブルは源のテーブルに含まれるすべてのインデックスとプロジェクションを含む必要があります。もし`enforce_index_structure_match_on_partition_manipulation`設定が目的のテーブルで有効になっている場合、インデックスとプロジェクションは同一でなければなりません。それ以外の場合、目的のテーブルは源のテーブルのインデックスとプロジェクションのスーパーセットを持つことができます。

## REPLACE PARTITION {#replace-partition}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

このクエリは、データパーティションを`table1`から`table2`にコピーし、`table2`内の既存のパーティションを置き換えます。操作は原子的です。

注意点：

- `table1`からデータは削除されません。
- `table1`は一時テーブルであってもかまいません。

クエリが正常に実行されるためには、以下の条件を満たす必要があります：

- 両方のテーブルは同じ構造を持っている必要があります。
- 両方のテーブルは同じパーティションキー、同じORDER BYキーおよび同じ主キーを持っている必要があります。
- 両方のテーブルは同じストレージポリシーを持っている必要があります。
- 目的のテーブルは源のテーブルに含まれるすべてのインデックスとプロジェクションを含む必要があります。もし`enforce_index_structure_match_on_partition_manipulation`設定が目的のテーブルで有効になっている場合、インデックスとプロジェクションは同一でなければなりません。それ以外の場合、目的のテーブルは源のテーブルのインデックスとプロジェクションのスーパーセットを持つことができます。

## MOVE PARTITION TO TABLE {#move-partition-to-table}

```sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

このクエリは、`table_source`から`table_dest`にデータパーティションを移動します。`table_source`からデータを削除します。

クエリが正常に実行されるためには、以下の条件を満たす必要があります：

- 両方のテーブルは同じ構造を持っている必要があります。
- 両方のテーブルは同じパーティションキー、同じORDER BYキーおよび同じ主キーを持っている必要があります。
- 両方のテーブルは同じストレージポリシーを持っている必要があります。
- 両方のテーブルは同じエンジンファミリー（レプリケートまたは非レプリケート）である必要があります。
- 目的のテーブルは源のテーブルに含まれるすべてのインデックスとプロジェクションを含む必要があります。もし`enforce_index_structure_match_on_partition_manipulation`設定が目的のテーブルで有効になっている場合、インデックスとプロジェクションは同一でなければなりません。それ以外の場合、目的のテーブルは源のテーブルのインデックスとプロジェクションのスーパーセットを持つことができます。

## CLEAR COLUMN IN PARTITION {#clear-column-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

指定されたパーティション内の指定したカラムのすべての値をリセットします。テーブル作成時に`DEFAULT`句が設定されている場合、このクエリはカラムの値を指定したデフォルト値に設定します。

例：

```sql
ALTER TABLE visits CLEAR COLUMN hour in PARTITION 201902
```

## FREEZE PARTITION {#freeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

このクエリは、指定されたパーティションのローカルバックアップを作成します。`PARTITION`句が省略された場合、クエリはすべてのパーティションのバックアップを一度に作成します。

:::note
バックアッププロセス全体はサーバーを停止することなく実行されます。
:::

古いスタイルのテーブルに対しては、パーティション名のプレフィックス（例えば`2019`）を指定することができます。この場合、クエリは対応するすべてのパーティションのバックアップを作成します。パーティション式の設定については、[How to set the partition expression](#how-to-set-partition-expression)のセクションを参照してください。

実行時に、データスナップショットのために、クエリはテーブルデータへのハードリンクを作成します。ハードリンクは、`/var/lib/clickhouse/shadow/N/...`ディレクトリに配置されます。ここで：

- `/var/lib/clickhouse/`は、コンフィグで指定された作業ClickHouseディレクトリです。
- `N`はバックアップのインクリメンタル番号です。
- `WITH NAME`パラメータが指定されている場合、`'backup_name'`パラメータの値が使用され、インクリメンタル番号の代わりになります。

:::note
テーブル内のデータストレージのために[一連のディスクを使用する場合](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes)、`shadow/N`ディレクトリはすべてのディスクに存在し、`PARTITION`式によって一致するデータパーツが格納されます。
:::

バックアップ内の同じディレクトリ構造は、`/var/lib/clickhouse/`内と同様に作成されます。クエリは、すべてのファイルに対して`chmod`を実行し、それらへの書き込みを禁止します。

バックアップを作成した後は、`/var/lib/clickhouse/shadow/`からリモートサーバーにデータをコピーし、その後ローカルサーバーから削除できます。なお、`ALTER t FREEZE PARTITION`クエリはレプリケーションされないため、ローカルサーバーでのバックアップのみを作成します。

クエリはほぼ瞬時にバックアップを作成します（ただし、最初に、関連するテーブルに対する現在のクエリが完了するのを待ちます）。

`ALTER TABLE t FREEZE PARTITION`は、テーブルメタデータではなくデータのみをコピーします。テーブルメタデータのバックアップを作成するには、`/var/lib/clickhouse/metadata/database/table.sql`ファイルをコピーします。

バックアップからデータを復元するには、次の手順を行います：

1. テーブルが存在しない場合は作成します。クエリを見るには、.sqlファイルを使用し（`ATTACH`を`CREATE`に置き換えます）、テーブルを作成します。
2. バックアップ内の`data/database/table/`ディレクトリから`/var/lib/clickhouse/data/database/table/detached/`ディレクトリにデータをコピーします。
3. `ALTER TABLE t ATTACH PARTITION`クエリを実行して、データをテーブルに追加します。

バックアップからの復元にはサーバーを停止する必要はありません。

バックアップおよびデータ復元に関する詳細については、[データバックアップ](/operations/backup.md)セクションを参照してください。

## UNFREEZE PARTITION {#unfreeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

指定した名前の`frozen`パーティションをディスクから削除します。`PARTITION`句が省略された場合、クエリはすべてのパーティションのバックアップを一度に削除します。

## CLEAR INDEX IN PARTITION {#clear-index-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR INDEX index_name IN PARTITION partition_expr
```

このクエリは、`CLEAR COLUMN`と同様に動作しますが、カラムデータの代わりにインデックスをリセットします。

## FETCH PARTITION\|PART {#fetch-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FETCH PARTITION|PART partition_expr FROM 'path-in-zookeeper'
```

別のサーバーからパーティションをダウンロードします。このクエリはレプリケートテーブルでのみ動作します。

このクエリは次のことを行います：

1. 指定されたシャードからパーティション|パートをダウンロードします。`path-in-zookeeper`では、ZooKeeper内のシャードのパスを指定する必要があります。
2. 次に、クエリはダウンロードしたデータを`table_name`テーブルの`detached`ディレクトリに配置します。データをテーブルに追加するには、[ATTACH PARTITION\|PART](#attach-partitionpart)クエリを使用します。

例：

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

注意点：

- `ALTER ... FETCH PARTITION|PART`クエリはレプリケートされません。パートまたはパーティションは、ローカルサーバーの`detached`ディレクトリにのみ配置されます。
- `ALTER TABLE ... ATTACH`クエリはレプリケートされます。データはすべてのレプリカに追加されます。データは`detached`ディレクトリから一つのレプリカに追加され、他のレプリカには隣接するレプリカから追加されます。

ダウンロード前に、システムはパーティションの存在とテーブル構造の一致を確認します。最も適切なレプリカが自動的に健全なレプリカの中から選択されます。

クエリは`ALTER TABLE`と呼ばれますが、テーブル構造は変更せず、テーブル内のデータも即座には変更しません。

## MOVE PARTITION\|PART {#move-partitionpart}

`MergeTree`エンジンテーブル用の別のボリュームまたはディスクにパーティションまたはデータパーツを移動します。データストレージのために[複数のブロックデバイスを使用する](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes)を参照してください。

```sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

`ALTER TABLE t MOVE`クエリは：

- レプリケートされず、異なるレプリカが異なるストレージポリシーを持つ可能性があるためです。
- 指定されたディスクまたはボリュームが設定されていない場合、エラーを返します。また、ストレージポリシーで指定されたデータ移動の条件が適用できない場合もエラーを返します。
- データがすでにバックグラウンドプロセス、同時`ALTER TABLE t MOVE`クエリ、またはバックグラウンドデータマージの結果によって移動されている場合、エラーを返す可能性があります。この場合、ユーザーは追加の操作を行うことを避けるべきです。

例：

```sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow'
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd'
```

## UPDATE IN PARTITION {#update-in-partition}

指定されたフィルタリング式と一致する指定のパーティション内のデータを操作します。これは[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

文法：

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

指定されたフィルタリング式と一致する指定のパーティション内のデータを削除します。これは[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

文法：

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

`ALTER ... PARTITION`クエリでパーティション式を指定する方法はいくつかあります：

- `system.parts`テーブルの`partition`カラムからの値として。例えば、`ALTER TABLE visits DETACH PARTITION 201901`。
- `ALL`キーワードを使用して。このキーワードはDROP/DETACH/ATTACH/ATTACH FROMでのみ使用できます。例えば、`ALTER TABLE visits ATTACH PARTITION ALL`。
- （タイプが一致する）タプル式や定数のタプルとして。単一要素のパーティションキーの場合、式は`tuple (...)`関数でラップする必要があります。例えば、`ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25')))`.
- パーティションIDとして。パーティションIDは、パーティションの文字列識別子（可能であれば人間が読めるもの）であり、ファイルシステムおよびZooKeeperでパーティションの名前として使用されます。パーティションIDは、`PARTITION ID`句に指定する必要があり、単一引用符で囲まれます。例えば、`ALTER TABLE visits DETACH PARTITION ID '201901'`。
- [ATTACH PARTITION](#attach-partitionpart)および[DROP DETACHED PART](#drop-detached-partitionpart)クエリでは、`system.detached_parts`テーブルの`name`カラムからの値を持つ文字列リテラルを使用してパートの名前を指定します。例えば、`ALTER TABLE visits ATTACH PART '201901_1_1_0'`。

パーティションを指定したときの引用符の使用は、パーティション式のタイプによって異なります。例えば、`String`型の場合は、その名前を引用符（`'`）で指定する必要があります。`Date`および`Int*`型の場合は、引用符を使用する必要はありません。

上記のすべての規則は、[OPTIMIZE](/sql-reference/statements/optimize.md)クエリにも当てはまります。非パーティションテーブルを最適化する際に唯一のパーティションを指定する必要がある場合、式を`PARTITION tuple()`に設定します。例えば：

```sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION`は、[UPDATE](/sql-reference/statements/alter/update)または[DELETE](/sql-reference/statements/alter/delete)式が`ALTER TABLE`クエリの結果として適用されるパーティションを指定します。新しいパーツは指定されたパーティションからのみ作成されます。このようにして、`IN PARTITION`は、テーブルが多くのパーティションに分割されているときに負担を軽減し、データを一点ずつ更新する必要があるときに役立ちます。

`ALTER ... PARTITION`クエリの例は、テスト[`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql)および[`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql)で示されています。
