---
description: "パーティションに関するドキュメント"
sidebar_label: "PARTITION"
sidebar_position: 38
slug: /sql-reference/statements/alter/partition
title: "パーティションとパートの操作"
doc_type: "reference"
---

[パーティション](/engines/table-engines/mergetree-family/custom-partitioning-key.md)に対して以下の操作が利用可能です:

- [DETACH PARTITION\|PART](#detach-partitionpart) — パーティションまたはパートを`detached`ディレクトリに移動し、忘却します。
- [DROP PARTITION\|PART](#drop-partitionpart) — パーティションまたはパートを削除します。
- [DROP DETACHED PARTITION\|PART](#drop-detached-partitionpart) — `detached`からパートまたはパーティションの全パートを削除します。
- [FORGET PARTITION](#forget-partition) — パーティションが空の場合、ZooKeeperからパーティションメタデータを削除します。
- [ATTACH PARTITION\|PART](#attach-partitionpart) — `detached`ディレクトリからパーティションまたはパートをテーブルに追加します。
- [ATTACH PARTITION FROM](#attach-partition-from) — あるテーブルから別のテーブルへデータパーティションをコピーして追加します。
- [REPLACE PARTITION](#replace-partition) — あるテーブルから別のテーブルへデータパーティションをコピーして置換します。
- [MOVE PARTITION TO TABLE](#move-partition-to-table) — あるテーブルから別のテーブルへデータパーティションを移動します。
- [CLEAR COLUMN IN PARTITION](#clear-column-in-partition) — パーティション内の指定されたカラムの値をリセットします。
- [CLEAR INDEX IN PARTITION](#clear-index-in-partition) — パーティション内の指定されたセカンダリインデックスをリセットします。
- [FREEZE PARTITION](#freeze-partition) — パーティションのバックアップを作成します。
- [UNFREEZE PARTITION](#unfreeze-partition) — パーティションのバックアップを削除します。
- [FETCH PARTITION\|PART](#fetch-partitionpart) — 別のサーバーからパートまたはパーティションをダウンロードします。
- [MOVE PARTITION\|PART](#move-partitionpart) — パーティション/データパートを別のディスクまたはボリュームに移動します。
- [UPDATE IN PARTITION](#update-in-partition) — 条件に基づいてパーティション内のデータを更新します。
- [DELETE IN PARTITION](#delete-in-partition) — 条件に基づいてパーティション内のデータを削除します。
- [REWRITE PARTS](#rewrite-parts) — テーブル(または特定のパーティション)内のパートを完全に書き換えます。

<!-- -->


## DETACH PARTITION\|PART {#detach-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DETACH PARTITION|PART partition_expr
```

指定されたパーティションのすべてのデータを`detached`ディレクトリに移動します。サーバーは、切り離されたデータパーティションを存在しないものとして扱います。[ATTACH](#attach-partitionpart)クエリを実行するまで、サーバーはこのデータを認識しません。

例:

```sql
ALTER TABLE mt DETACH PARTITION '2020-11-21';
ALTER TABLE mt DETACH PART 'all_2_2_0';
```

パーティション式の設定については、[パーティション式の設定方法](#how-to-set-partition-expression)のセクションを参照してください。

クエリ実行後、`detached`ディレクトリ内のデータに対して任意の操作を行うことができます。ファイルシステムから削除することも、そのまま残しておくこともできます。

このクエリはレプリケートされます。すべてのレプリカの`detached`ディレクトリにデータを移動します。このクエリはリーダーレプリカでのみ実行できることに注意してください。レプリカがリーダーであるかどうかを確認するには、[system.replicas](/operations/system-tables/replicas)テーブルに対して`SELECT`クエリを実行してください。または、すべてのレプリカで`DETACH`クエリを実行する方が簡単です。リーダーレプリカを除くすべてのレプリカが例外をスローします(複数のリーダーが許可されているため)。


## DROP PARTITION\|PART {#drop-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

テーブルから指定されたパーティションを削除します。このクエリはパーティションを非アクティブとしてマークし、約10分でデータを完全に削除します。

パーティション式の設定については、[パーティション式の設定方法](#how-to-set-partition-expression)のセクションを参照してください。

このクエリはレプリケートされ、すべてのレプリカ上のデータが削除されます。

例:

```sql
ALTER TABLE mt DROP PARTITION '2020-11-21';
ALTER TABLE mt DROP PART 'all_4_4_0';
```


## DROP DETACHED PARTITION\|PART {#drop-detached-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP DETACHED PARTITION|PART ALL|partition_expr
```

指定されたパーティションの指定されたパート、または指定されたパーティションのすべてのパートを`detached`から削除します。
パーティション式の設定方法の詳細については、[パーティション式の設定方法](#how-to-set-partition-expression)のセクションを参照してください。


## FORGET PARTITION {#forget-partition}

```sql
ALTER TABLE table_name FORGET PARTITION partition_expr
```

ZooKeeperから空のパーティションに関するすべてのメタデータを削除します。パーティションが空でない場合、または存在しない場合、クエリは失敗します。今後使用する予定のないパーティションに対してのみ実行してください。

パーティション式の設定については、[パーティション式の設定方法](#how-to-set-partition-expression)のセクションを参照してください。

例:

```sql
ALTER TABLE mt FORGET PARTITION '20201121';
```


## ATTACH PARTITION\|PART {#attach-partitionpart}

```sql
ALTER TABLE table_name ATTACH PARTITION|PART partition_expr
```

`detached`ディレクトリからテーブルにデータを追加します。パーティション全体または個別のパートに対してデータを追加できます。例:

```sql
ALTER TABLE visits ATTACH PARTITION 201901;
ALTER TABLE visits ATTACH PART 201901_2_2_0;
```

パーティション式の設定の詳細については、[パーティション式の設定方法](#how-to-set-partition-expression)のセクションを参照してください。

このクエリはレプリケートされます。レプリカ開始側は`detached`ディレクトリにデータが存在するかを確認します。
データが存在する場合、クエリはその整合性を検証します。すべてが正しければ、クエリはテーブルにデータを追加します。

非開始側のレプリカがアタッチコマンドを受信した際、自身の`detached`フォルダ内に正しいチェックサムを持つパートが見つかった場合、他のレプリカから取得することなくデータをアタッチします。
正しいチェックサムを持つパートが存在しない場合、そのパートを保有する任意のレプリカからデータがダウンロードされます。

1つのレプリカの`detached`ディレクトリにデータを配置し、`ALTER ... ATTACH`クエリを使用してすべてのレプリカのテーブルに追加できます。


## ATTACH PARTITION FROM {#attach-partition-from}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] ATTACH PARTITION partition_expr FROM table1
```

このクエリは、`table1`から`table2`へデータパーティションをコピーします。

注意点:

- `table1`と`table2`のどちらからもデータは削除されません。
- `table1`は一時テーブルでも構いません。

クエリを正常に実行するには、以下の条件を満たす必要があります:

- 両テーブルが同じ構造を持つこと。
- 両テーブルが同じパーティションキー、同じORDER BYキー、同じプライマリキーを持つこと。
- 両テーブルが同じストレージポリシーを持つこと。
- 宛先テーブルがソーステーブルのすべてのインデックスとプロジェクションを含むこと。宛先テーブルで`enforce_index_structure_match_on_partition_manipulation`設定が有効になっている場合、インデックスとプロジェクションは完全に一致する必要があります。それ以外の場合、宛先テーブルはソーステーブルのインデックスとプロジェクションのスーパーセットを持つことができます。


## REPLACE PARTITION {#replace-partition}

```sql
ALTER TABLE table2 [ON CLUSTER cluster] REPLACE PARTITION partition_expr FROM table1
```

このクエリは`table1`のデータパーティションを`table2`にコピーし、`table2`の既存のパーティションを置き換えます。この操作はアトミックです。

注意:

- `table1`のデータは削除されません。
- `table1`は一時テーブルでも構いません。

クエリを正常に実行するには、以下の条件を満たす必要があります:

- 両方のテーブルが同じ構造を持つ必要があります。
- 両方のテーブルが同じパーティションキー、同じORDER BYキー、同じプライマリキーを持つ必要があります。
- 両方のテーブルが同じストレージポリシーを持つ必要があります。
- 宛先テーブルはソーステーブルのすべてのインデックスとプロジェクションを含む必要があります。宛先テーブルで`enforce_index_structure_match_on_partition_manipulation`設定が有効になっている場合、インデックスとプロジェクションは完全に一致する必要があります。それ以外の場合、宛先テーブルはソーステーブルのインデックスとプロジェクションのスーパーセットを持つことができます。


## MOVE PARTITION TO TABLE {#move-partition-to-table}

```sql
ALTER TABLE table_source [ON CLUSTER cluster] MOVE PARTITION partition_expr TO TABLE table_dest
```

このクエリは、`table_source` のデータパーティションを `table_dest` に移動し、`table_source` からデータを削除します。

クエリを正常に実行するには、以下の条件を満たす必要があります:

- 両方のテーブルが同じ構造を持つ必要があります。
- 両方のテーブルが同じパーティションキー、同じORDER BYキー、同じプライマリキーを持つ必要があります。
- 両方のテーブルが同じストレージポリシーを持つ必要があります。
- 両方のテーブルが同じエンジンファミリー(レプリケートまたは非レプリケート)である必要があります。
- 移動先テーブルは、移動元テーブルのすべてのインデックスとプロジェクションを含む必要があります。移動先テーブルで `enforce_index_structure_match_on_partition_manipulation` 設定が有効になっている場合、インデックスとプロジェクションは完全に一致する必要があります。それ以外の場合、移動先テーブルは移動元テーブルのインデックスとプロジェクションのスーパーセットを持つことができます。


## CLEAR COLUMN IN PARTITION {#clear-column-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR COLUMN column_name IN PARTITION partition_expr
```

パーティション内の指定されたカラムのすべての値をリセットします。テーブル作成時に`DEFAULT`句が定義されている場合、このクエリはカラムの値を指定されたデフォルト値に設定します。

例:

```sql
ALTER TABLE visits CLEAR COLUMN hour in PARTITION 201902
```


## FREEZE PARTITION {#freeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FREEZE [PARTITION partition_expr] [WITH NAME 'backup_name']
```

このクエリは、指定されたパーティションのローカルバックアップを作成します。`PARTITION`句を省略した場合、すべてのパーティションのバックアップが一度に作成されます。

:::note
バックアッププロセス全体は、サーバーを停止せずに実行されます。
:::

旧形式のテーブルでは、パーティション名のプレフィックス(例:`2019`)を指定できます。この場合、対応するすべてのパーティションのバックアップが作成されます。パーティション式の設定については、[パーティション式の設定方法](#how-to-set-partition-expression)のセクションを参照してください。

実行時、データスナップショットのために、クエリはテーブルデータへのハードリンクを作成します。ハードリンクは`/var/lib/clickhouse/shadow/N/...`ディレクトリに配置されます。ここで:

- `/var/lib/clickhouse/`は、設定ファイルで指定されたClickHouseの作業ディレクトリです。
- `N`は、バックアップの連番です。
- `WITH NAME`パラメータが指定されている場合、連番の代わりに`'backup_name'`パラメータの値が使用されます。

:::note
テーブルのデータ保存に[複数のディスクセット](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes)を使用している場合、`shadow/N`ディレクトリは各ディスクに作成され、`PARTITION`式に一致するデータパーツが保存されます。
:::

バックアップ内には、`/var/lib/clickhouse/`内と同じディレクトリ構造が作成されます。クエリはすべてのファイルに対して`chmod`を実行し、書き込みを禁止します。

バックアップ作成後、`/var/lib/clickhouse/shadow/`からリモートサーバーにデータをコピーし、ローカルサーバーから削除できます。`ALTER t FREEZE PARTITION`クエリはレプリケーションされないことに注意してください。ローカルサーバー上でのみローカルバックアップを作成します。

クエリはほぼ瞬時にバックアップを作成します(ただし、対応するテーブルへの実行中のクエリが完了するまで待機します)。

`ALTER TABLE t FREEZE PARTITION`はデータのみをコピーし、テーブルメタデータはコピーしません。テーブルメタデータのバックアップを作成するには、`/var/lib/clickhouse/metadata/database/table.sql`ファイルをコピーしてください。

バックアップからデータを復元するには、以下の手順を実行してください:

1.  テーブルが存在しない場合は作成します。クエリを確認するには、.sqlファイルを使用してください(その中の`ATTACH`を`CREATE`に置き換えます)。
2.  バックアップ内の`data/database/table/`ディレクトリから`/var/lib/clickhouse/data/database/table/detached/`ディレクトリにデータをコピーします。
3.  `ALTER TABLE t ATTACH PARTITION`クエリを実行して、テーブルにデータを追加します。

バックアップからの復元では、サーバーを停止する必要はありません。

クエリはパーツを並列処理し、スレッド数は`max_threads`設定によって制御されます。

バックアップとデータ復元の詳細については、[データバックアップ](/operations/backup.md)セクションを参照してください。


## UNFREEZE PARTITION {#unfreeze-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] UNFREEZE [PARTITION 'part_expr'] WITH NAME 'backup_name'
```

指定された名前の`frozen`パーティションをディスクから削除します。`PARTITION`句を省略した場合、クエリはすべてのパーティションのバックアップを一括で削除します。


## CLEAR INDEX IN PARTITION {#clear-index-in-partition}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] CLEAR INDEX index_name IN PARTITION partition_expr
```

このクエリは`CLEAR COLUMN`と同様に動作しますが、カラムデータではなくインデックスをリセットします。


## FETCH PARTITION|PART {#fetch-partitionpart}

```sql
ALTER TABLE table_name [ON CLUSTER cluster] FETCH PARTITION|PART partition_expr FROM 'path-in-zookeeper'
```

別のサーバーからパーティションをダウンロードします。このクエリはレプリケーションテーブルでのみ動作します。

このクエリは以下の処理を実行します:

1.  指定されたシャードからパーティション|パートをダウンロードします。'path-in-zookeeper'には、ZooKeeper内のシャードへのパスを指定する必要があります。
2.  次に、ダウンロードしたデータを`table_name`テーブルの`detached`ディレクトリに配置します。データをテーブルに追加するには、[ATTACH PARTITION\|PART](#attach-partitionpart)クエリを使用します。

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

注意事項:

- `ALTER ... FETCH PARTITION|PART`クエリはレプリケートされません。パートまたはパーティションをローカルサーバーの`detached`ディレクトリにのみ配置します。
- `ALTER TABLE ... ATTACH`クエリはレプリケートされます。すべてのレプリカにデータを追加します。データは、1つのレプリカには`detached`ディレクトリから追加され、他のレプリカには隣接するレプリカから追加されます。

ダウンロード前に、システムはパーティションの存在とテーブル構造の一致を確認します。正常なレプリカの中から最も適切なレプリカが自動的に選択されます。

このクエリは`ALTER TABLE`という名前ですが、テーブル構造を変更せず、テーブルで利用可能なデータを即座に変更することもありません。


## MOVE PARTITION\|PART {#move-partitionpart}

`MergeTree`エンジンテーブルのパーティションまたはデータパートを別のボリュームまたはディスクに移動します。詳細は[データストレージに複数のブロックデバイスを使用する](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-multiple-volumes)を参照してください。

```sql
ALTER TABLE table_name [ON CLUSTER cluster] MOVE PARTITION|PART partition_expr TO DISK|VOLUME 'disk_name'
```

`ALTER TABLE t MOVE`クエリの特性:

- レプリケートされません。異なるレプリカが異なるストレージポリシーを持つ可能性があるためです。
- 指定されたディスクまたはボリュームが設定されていない場合、エラーを返します。また、ストレージポリシーで指定されたデータ移動の条件を適用できない場合もエラーを返します。
- 移動対象のデータがバックグラウンドプロセス、同時実行される`ALTER TABLE t MOVE`クエリ、またはバックグラウンドデータマージによって既に移動されている場合、エラーを返すことがあります。この場合、ユーザーは追加の操作を行う必要はありません。

例:

```sql
ALTER TABLE hits MOVE PART '20190301_14343_16206_438' TO VOLUME 'slow'
ALTER TABLE hits MOVE PARTITION '2019-09-01' TO DISK 'fast_ssd'
```


## UPDATE IN PARTITION {#update-in-partition}

指定されたフィルタリング式に一致する指定パーティション内のデータを操作します。[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

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

### 関連項目 {#see-also}

- [UPDATE](/sql-reference/statements/alter/partition#update-in-partition)


## DELETE IN PARTITION {#delete-in-partition}

指定されたフィルタリング式に一致する、指定されたパーティション内のデータを削除します。[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

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


## REWRITE PARTS {#rewrite-parts}

すべての新しい設定を使用して、パーツをゼロから書き直します。`use_const_adaptive_granularity`などのテーブルレベルの設定は、デフォルトでは新しく書き込まれるパーツにのみ適用されるため、この操作が有効です。

### 例 {#example-rewrite-parts}

```sql
ALTER TABLE mt REWRITE PARTS;
ALTER TABLE mt REWRITE PARTS IN PARTITION 2;
```

### 関連項目 {#see-also-1}

- [DELETE](/sql-reference/statements/alter/delete)


## パーティション式の設定方法 {#how-to-set-partition-expression}

`ALTER ... PARTITION`クエリでパーティション式を指定する方法は複数あります:

- `system.parts`テーブルの`partition`カラムの値として指定する。例: `ALTER TABLE visits DETACH PARTITION 201901`
- キーワード`ALL`を使用する。これはDROP/DETACH/ATTACH/ATTACH FROMでのみ使用できます。例: `ALTER TABLE visits ATTACH PARTITION ALL`
- テーブルのパーティショニングキーのタプルと型が一致する式または定数のタプルとして指定する。単一要素のパーティショニングキーの場合、式は`tuple (...)`関数でラップする必要があります。例: `ALTER TABLE visits DETACH PARTITION tuple(toYYYYMM(toDate('2019-01-25')))`
- パーティションIDを使用する。パーティションIDは、ファイルシステムおよびZooKeeper内でパーティション名として使用される、パーティションの文字列識別子です(可能な限り人間が読める形式)。パーティションIDは`PARTITION ID`句内でシングルクォートで囲んで指定する必要があります。例: `ALTER TABLE visits DETACH PARTITION ID '201901'`
- [ALTER ATTACH PART](#attach-partitionpart)および[DROP DETACHED PART](#drop-detached-partitionpart)クエリでパート名を指定する場合は、[system.detached_parts](/operations/system-tables/detached_parts)テーブルの`name`カラムの値を持つ文字列リテラルを使用します。例: `ALTER TABLE visits ATTACH PART '201901_1_1_0'`

パーティションを指定する際のクォートの使用は、パーティション式の型に依存します。例えば、`String`型の場合は名前をクォート(`'`)で囲む必要があります。`Date`型および`Int*`型の場合はクォートは不要です。

上記のすべてのルールは[OPTIMIZE](/sql-reference/statements/optimize.md)クエリにも適用されます。パーティション化されていないテーブルを最適化する際に単一のパーティションを指定する必要がある場合は、式`PARTITION tuple()`を設定します。例:

```sql
OPTIMIZE TABLE table_not_partitioned PARTITION tuple() FINAL;
```

`IN PARTITION`は、`ALTER TABLE`クエリの結果として[UPDATE](/sql-reference/statements/alter/update)または[DELETE](/sql-reference/statements/alter/delete)式が適用されるパーティションを指定します。新しいパートは指定されたパーティションからのみ作成されます。このように、`IN PARTITION`はテーブルが多数のパーティションに分割されている場合に、データをポイント単位で更新するだけで済むため、負荷を軽減するのに役立ちます。

`ALTER ... PARTITION`クエリの例は、テスト[`00502_custom_partitioning_local`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_local.sql)および[`00502_custom_partitioning_replicated_zookeeper`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00502_custom_partitioning_replicated_zookeeper.sql)で示されています。
