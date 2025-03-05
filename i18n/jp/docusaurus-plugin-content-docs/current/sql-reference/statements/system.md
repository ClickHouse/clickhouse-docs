---
slug: /sql-reference/statements/system
sidebar_position: 36
sidebar_label: SYSTEM
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SYSTEM ステートメント

## RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

すべての[内部辞書](../../sql-reference/dictionaries/index.md)をリロードします。デフォルトでは、内部辞書は無効になっています。内部辞書の更新結果に関わらず、常に`Ok.`を返します。

## RELOAD DICTIONARIES {#reload-dictionaries}

成功裏に読み込まれたすべての辞書をリロードします。デフォルトでは、辞書は遅延ロードされています（[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)参照）。そのため、起動時に自動的に読み込まれるのではなく、最初のアクセス時に`dictGet`関数や`ENGINE = Dictionary`を持つテーブルからのSELECTを通じて初期化されます。`SYSTEM RELOAD DICTIONARIES`クエリは、そのような辞書をリロードします（LOADED）。辞書の更新結果に関わらず、常に`Ok.`を返します。

**構文**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## RELOAD DICTIONARY {#reload-dictionary}

辞書`dictionary_name`を完全にリロードします。辞書の状態（LOADED / NOT_LOADED / FAILED）に関わらず、常に`Ok.`を返します。

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

辞書の状態は`system.dictionaries`テーブルをクエリして確認できます。

```sql
SELECT name, status FROM system.dictionaries;
```

## RELOAD MODELS {#reload-models}

:::note
このステートメントおよび`SYSTEM RELOAD MODEL`は、clickhouse-library-bridgeからcatboostモデルを単にアンロードします。関数`catboostEvaluate()`は、最初のアクセス時にモデルがまだロードされていない場合にロードします。
:::

すべてのCatBoostモデルをアンロードします。

**構文**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```

## RELOAD MODEL {#reload-model}

`model_path`にあるCatBoostモデルをアンロードします。

**構文**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```

## RELOAD FUNCTIONS {#reload-functions}

すべての登録済み[実行可能ユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions)または設定ファイルからそのうちの1つをリロードします。

**構文**

```sql
RELOAD FUNCTIONS [ON CLUSTER cluster_name]
RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

すべての[非同期メトリクス](../../operations/system-tables/asynchronous_metrics.md)を再計算します。非同期メトリクスは、設定[dictionary_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md)に基づいて定期的に更新されるため、このステートメントを使用して手動で更新する必要は通常ありません。

```sql
RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## DROP DNS CACHE {#drop-dns-cache}

ClickHouseの内部DNSキャッシュをクリアします。時には（古いClickHouseバージョンのために）、インフラストラクチャを変更するとき（別のClickHouseサーバーのIPアドレスを変更する場合や、辞書が使用するサーバーの場合）にこのコマンドを使用する必要があります。

より便利な（自動的な）キャッシュ管理については、disable_internal_dns_cache、dns_cache_max_entries、dns_cache_update_periodパラメータを参照してください。

## DROP MARK CACHE {#drop-mark-cache}

マークキャッシュをクリアします。

## DROP REPLICA {#drop-replica}

`ReplicatedMergeTree`テーブルの死んだレプリカは、以下の構文を使用して削除できます。

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

これらのクエリは、ZooKeeper内の`ReplicatedMergeTree`レプリカパスを削除します。レプリカが死んでいて、そのメタデータを`DROP TABLE`でZooKeeperから削除できない場合に便利です。これは非アクティブ/古いレプリカのみを削除し、ローカルレプリカを削除することはできません。その場合は`DROP TABLE`を使用してください。`DROP REPLICA`はテーブルを削除せず、ディスクからデータやメタデータを削除しません。

最初のクエリは、`database.table`テーブルの`'replica_name'`レプリカのメタデータを削除します。二番目のクエリは、データベース内のすべてのレプリケートされたテーブルに対して同じ処理を行います。三番目のクエリは、ローカルサーバー上のすべてのレプリケートされたテーブルに対して同じ処理を行います。四番目のクエリは、すべての他のテーブルのレプリカが削除された場合に、死んだレプリカのメタデータを削除するために便利です。テーブルパスを明示的に指定する必要があります。これは、テーブル作成時に`ReplicatedMergeTree`エンジンの最初の引数に渡されたものと同じパスでなければなりません。

## DROP DATABASE REPLICA {#drop-database-replica}

死んだ`Replicated`データベースのレプリカは、以下の構文を使用して削除できます。

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

`SYSTEM DROP REPLICA`と同様ですが、データベースを実行して`DROP DATABASE`を実行することができないときにZooKeeperから`Replicated`データベースのレプリカパスを削除します。このコマンドは`ReplicatedMergeTree`レプリカを削除しないため、必要に応じて`SYSTEM DROP REPLICA`も使用する必要があります。シャードとレプリカの名前は、データベースを作成する際に`Replicated`エンジンの引数で指定された名前です。これらの名前は、`system.clusters`の`database_shard_name`および`database_replica_name`カラムからも取得できます。`FROM SHARD`句がない場合、`replica_name`は`shard_name|replica_name`形式の完全なレプリカ名でなければなりません。

## DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

圧縮されていないデータキャッシュをクリアします。圧縮されていないデータキャッシュは、クエリ/ユーザー/プロファイルレベルの設定[`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache)で有効化/無効化されます。サイズは、サーバーレベルの設定[`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size)を使用して設定できます。

## DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

コンパイルされた式キャッシュをクリアします。コンパイルされた式キャッシュは、クエリ/ユーザー/プロファイルレベルの設定[`compile_expressions`](../../operations/settings/settings.md#compile_expressions)で有効化/無効化されます。

## DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
```

[クエリキャッシュ](../../operations/query-cache.md)を清掃します。タグが指定された場合、指定したタグを持つクエリキャッシュエントリのみが削除されます。

## DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

[`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path)から読み込まれたスキーマのキャッシュをクリアします。

サポートされているフォーマット：

- Protobuf

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]
```

## FLUSH LOGS {#flush-logs}

バッファされたログメッセージをシステムテーブル（例：system.query_log）にフラッシュします。主にデバッグに便利です。多くのシステムテーブルはデフォルトのフラッシュ間隔が7.5秒です。これはメッセージキューが空であってもシステムテーブルを作成します。

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

すべてをフラッシュしたくない場合は、名前またはターゲットテーブルを指定して、1つまたは複数の個別のログをフラッシュできます。

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## RELOAD CONFIG {#reload-config}

ClickHouseの設定をリロードします。設定がZooKeeperに保存されている場合に使用されます。`SYSTEM RELOAD CONFIG`は、ZooKeeperに保存された`USER`設定をリロードせず、`users.xml`に保存された`USER`設定のみをリロードします。すべての`USER`コンフィグをリロードするには`SYSTEM RELOAD USERS`を使用してください。

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## RELOAD USERS {#reload-users}

すべてのアクセスストレージをリロードします。これには、users.xml、ローカルディスクアクセスストレージ、レプリケート（ZooKeeper内）のアクセスストレージが含まれます。

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

通常、ClickHouseをシャットダウンします（`service clickhouse-server stop` / `kill {$pid_clickhouse-server}`のように）。

## KILL {#kill}

ClickHouseプロセスを中断します（`kill -9 {$ pid_clickhouse-server}`のように）。

## 分散テーブルの管理 {#managing-distributed-tables}

ClickHouseは、[分散](../../engines/table-engines/special/distributed.md)テーブルを管理できます。ユーザーがこれらのテーブルにデータを挿入すると、ClickHouseは最初にクラスタノードに送るべきデータのキューを作成し、その後非同期に送信します。キュー処理は[`STOP DISTRIBUTED SENDS`](#stop-distributed-sends)、[FLUSH DISTRIBUTED](#flush-distributed)、および[`START DISTRIBUTED SENDS`](#start-distributed-sends)クエリで管理できます。また、[`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert)設定を使用して分散データを同期的に挿入することもできます。

### STOP DISTRIBUTED SENDS {#stop-distributed-sends}

分散テーブルにデータを挿入する際のバックグラウンドデータ分配を無効にします。

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
[`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica)が有効な場合（デフォルト）、ローカルシャードへのデータは挿入されます。
:::

### FLUSH DISTRIBUTED {#flush-distributed}

ClickHouseにクラスタノードへのデータ送信を同期的に強制します。ノードが利用できない場合、ClickHouseは例外をスローし、クエリの実行を停止します。クエリが成功するまで再試行できます。これはすべてのノードがオンラインに戻るときに発生します。

`SETTINGS`句を介して一部の設定をオーバーライドすることもでき、`max_concurrent_queries_for_all_users`や`max_memory_usage`のような一時的制限を回避するのに便利です。

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
各保留中のブロックは、初期INSERTクエリからの設定でディスクに保存されるため、時には設定をオーバーライドしたい場合があります。
:::

### START DISTRIBUTED SENDS {#start-distributed-sends}

分散テーブルにデータを挿入する際のバックグラウンドデータ分配を有効にします。

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### STOP LISTEN {#stop-listen}

ソケットを閉じ、指定されたポートで指定されたプロトコルへの既存の接続を優雅に終了します。

ただし、clickhouse-server設定で対応するプロトコル設定が指定されていない場合、このコマンドは効果がありません。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- `CUSTOM 'protocol'`修飾子が指定された場合、サーバー設定のプロトコルセクションに定義された指定された名前のカスタムプロトコルが停止します。
- `QUERIES ALL [EXCEPT .. [,..]]`修飾子が指定された場合、`EXCEPT`句で指定されない限り、すべてのプロトコルが停止します。
- `QUERIES DEFAULT [EXCEPT .. [,..]]`修飾子が指定された場合、`EXCEPT`句で指定されない限り、すべてのデフォルトプロトコルが停止します。
- `QUERIES CUSTOM [EXCEPT .. [,..]]`修飾子が指定された場合、`EXCEPT`句で指定されない限り、すべてのカスタムプロトコルが停止します。

### START LISTEN {#start-listen}

指定されたプロトコルで新しい接続を確立できるようにします。

ただし、指定されたポートとプロトコルでサーバーがSYSTEM STOP LISTENコマンドを使用して停止していない場合、このコマンドは効果がありません。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

## MergeTreeテーブルの管理 {#managing-mergetree-tables}

ClickHouseは、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルのバックグラウンドプロセスを管理することができます。

### STOP MERGES {#stop-merges}

<CloudNotSupportedBadge/>

MergeTreeファミリーのテーブルのバックグラウンドマージを停止する機能を提供します。

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
`DETACH / ATTACH`テーブルは、すべてのMergeTreeテーブルに対してマージが停止されている場合でも、テーブルの背景マージを開始します。
:::

### START MERGES {#start-merges}

<CloudNotSupportedBadge/>

MergeTreeファミリーのテーブルのバックグラウンドマージを開始する機能を提供します。

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### STOP TTL MERGES {#stop-ttl-merges}

MergeTreeファミリーのテーブルにおいて、[TTL式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)に基づいて古いデータを削除するためのバックグラウンドプロセスを停止する機能を提供します。テーブルが存在しない場合でも`Ok.`を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START TTL MERGES {#start-ttl-merges}

MergeTreeファミリーのテーブルにおいて、[TTL式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)に基づいて古いデータを削除するためのバックグラウンドプロセスを開始する機能を提供します。テーブルが存在しない場合でも`Ok.`を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### STOP MOVES {#stop-moves}

MergeTreeファミリーのテーブルにおいて、[TTLテーブル式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)のTO VOLUMEまたはTO DISK句に基づいてデータを移動するためのバックグラウンドプロセスを停止する機能を提供します。テーブルが存在しない場合でも`Ok.`を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START MOVES {#start-moves}

MergeTreeファミリーのテーブルにおいて、[TTLテーブル式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)のTO VOLUMEおよびTO DISK句に基づいてデータを移動するためのバックグラウンドプロセスを開始する機能を提供します。テーブルが存在しない場合でも`Ok.`を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM UNFREEZE {#query_language-system-unfreeze}

指定された名前のフリーズされたバックアップをすべてのディスクからクリアします。個別パーツのアンフリーズについては、[ALTER TABLE table_name UNFREEZE WITH NAME ](alter/partition.md#alter_unfreeze-partition)の詳細を参照してください。

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### WAIT LOADING PARTS {#wait-loading-parts}

テーブルのすべての非同期読み込みデータパーツ（古いデータパーツ）が読み込まれるのを待ちます。

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## ReplicatedMergeTreeテーブルの管理 {#managing-replicatedmergetree-tables}

ClickHouseは、[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md#table_engines-replication)テーブルのバックグラウンドレプリケーション関連プロセスを管理できます。

### STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge/>

`ReplicatedMergeTree`ファミリーのテーブルに対して挿入されたパーツのバックグラウンドフェッチを停止する機能を提供します。テーブルエンジンに関わらず、テーブルやデータベースが存在しなくても常に`Ok.`を返します。

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START FETCHES {#start-fetches}

<CloudNotSupportedBadge/>

`ReplicatedMergeTree`ファミリーのテーブルに対して挿入されたパーツのバックグラウンドフェッチを開始する機能を提供します。テーブルエンジンに関わらず、テーブルやデータベースが存在しなくても常に`Ok.`を返します。

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATED SENDS {#stop-replicated-sends}

`ReplicatedMergeTree`ファミリーのテーブルに対して、新たに挿入されたパーツを他のレプリカに送信する際のバックグラウンドプロセスを停止する機能を提供します。

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATED SENDS {#start-replicated-sends}

`ReplicatedMergeTree`ファミリーのテーブルに対して、新たに挿入されたパーツを他のレプリカに送信する際のバックグラウンドプロセスを開始する機能を提供します。

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATION QUEUES {#stop-replication-queues}

ZooKeeperに保存されたレプリケーションキューからのバックグラウンドフェッチタスクを停止する機能を提供します。可能なバックグラウンドタスクの種類は、マージ、フェッチ、ミューテーション、ON CLUSTER句を持つDDLステートメントです。

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATION QUEUES {#start-replication-queues}

ZooKeeperに保存されたレプリケーションキューからのバックグラウンドフェッチタスクを開始する機能を提供します。可能なバックグラウンドタスクの種類は、マージ、フェッチ、ミューテーション、ON CLUSTER句を持つDDLステートメントです。

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

`ReplicatedMergeTree`テーブルに対して、レプリケーションログから新たなエントリをレプリケーションキューに読み込むのを停止します。

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START PULLING REPLICATION LOG {#start-pulling-replication-log}

`SYSTEM STOP PULLING REPLICATION LOG`をキャンセルします。

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYNC REPLICA {#sync-replica}

`ReplicatedMergeTree`テーブルがクラスタ内の他のレプリカと同期するまで待ちます。ただし、`receive_timeout`秒を超えることはありません。

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

このステートメントを実行した後、`[db.]replicated_merge_tree_family_table_name`は共通レプリケートログから命令を自身のレプリケーションキューにフェッチし、クエリはレプリカがすべてのフェッチされたコマンドを処理するまで待機します。以下の修飾子がサポートされています：

- `STRICT`修飾子が指定された場合、クエリはレプリケーションキューが空になるまで待ちます。STRICTバージョンは、レプリケーションキューに新しいエントリが常に現れる場合に成功しない可能性があります。
- `LIGHTWEIGHT`修飾子が指定された場合、クエリは`GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE`、および`DROP_PART`エントリが処理されるのを待つだけです。さらに、LIGHTWEIGHT修飾子は、指定されたソースレプリカから発生するレプリケーションタスクのみに焦点を当てるためのオプションの`FROM 'srcReplicas'`句をサポートします。
- `PULL`修飾子が指定された場合、クエリはZooKeeperから新しいレプリケーションキューエントリを引き出しますが、何かが処理されるのを待ちません。

### SYNC DATABASE REPLICA {#sync-database-replica}

指定された[レプリケートデータベース](/engines/database-engines/replicated)がそのデータベースのDDLキューからすべてのスキーマ変更を適用するまで待ちます。

**構文**
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### RESTART REPLICA {#restart-replica}

`ReplicatedMergeTree`テーブルのZooKeeperセッションの状態を再初期化する機能を提供します。現在の状態をZooKeeperと比較し、必要に応じてZooKeeperキューにタスクを追加します。ZooKeeperデータに基づくレプリケーションキューの初期化は、`ATTACH TABLE`ステートメントと同様に行われます。短期間、テーブルは操作に対して利用できなくなります。

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### RESTORE REPLICA {#restore-replica}

データが[存在する可能性があるが]、ZooKeeperのメタデータが失われた場合にレプリカを復元します。

これは読み取り専用の`ReplicatedMergeTree`テーブルでのみ機能します。

次のいずれかの後にクエリを実行することができます：

- ZooKeeperのルート`/`の喪失。
- レプリカのパス`/replicas`の喪失。
- 個別のレプリカパス`/replicas/replica_name/`の喪失。

レプリカは、ローカルで見つかったパーツを接続し、それに関する情報をZooKeeperに送信します。メタデータの喪失前にレプリカに存在したパーツは、古くなっていない限り他から再取得されません（つまり、レプリカの復元はすべてのデータをネットワーク経由で再ダウンロードすることを意味しません）。

:::note
すべての状態のパーツは`detached/`フォルダに移動されます。データ喪失前にアクティブだったパーツ（コミットされたもの）は接続されます。
:::

**構文**

```sql
SYSTEM RESTORE REPLICA [db.]replicated_merge_tree_family_table_name [ON CLUSTER cluster_name]
```

代替構文：

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**例**

複数のサーバーでテーブルを作成します。レプリカのメタデータがZooKeeperで失われた後、テーブルはメタデータが欠けているため読み取り専用としてアタッチします。最後のクエリはすべてのレプリカで実行する必要があります。

```sql
CREATE TABLE test(n UInt32)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/test/', '{replica}')
ORDER BY n PARTITION BY n % 10;

INSERT INTO test SELECT * FROM numbers(1000);

-- zookeeper_delete_path("/clickhouse/tables/test", recursive=True) <- ルート消失。

SYSTEM RESTART REPLICA test;
SYSTEM RESTORE REPLICA test;
```

もう一つの方法：

```sql
SYSTEM RESTORE REPLICA test ON CLUSTER cluster;
```

### RESTART REPLICAS {#restart-replicas}

すべての`ReplicatedMergeTree`テーブルのZooKeeperセッション状態を再初期化する機能を提供します。現在の状態をZooKeeperと比較し、必要に応じてZooKeeperキューにタスクを追加します。

### DROP FILESYSTEM CACHE {#drop-filesystem-cache}

ファイルシステムキャッシュを削除することを許可します。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYNC FILE CACHE {#sync-file-cache}

:::note
これは非常に重く、悪用の可能性があります。
:::

syncシステムコールを実行します。

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```

### LOAD PRIMARY KEY {#load-primary-key}

指定されたテーブルまたはすべてのテーブルの主キーを読み込みます。

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```

### UNLOAD PRIMARY KEY {#unload-primary-key}

指定されたテーブルまたはすべてのテーブルの主キーをアンロードします。

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```

## 更新可能なマテリアライズドビューの管理 {#refreshable-materialized-views}

[更新可能マテリアライズドビュー](../../sql-reference/statements/create/view.md#refreshable-materialized-view)によって実行されるバックグラウンドタスクを制御するコマンド。使用中は[`system.view_refreshes`](../../operations/system-tables/view_refreshes.md)に注目してください。

### REFRESH VIEW {#refresh-view}

指定されたビューの即時のスケジュール外リフレッシュをトリガーします。

```sql
SYSTEM REFRESH VIEW [db.]name
```

### REFRESH VIEW {#refresh-view-1}

現在実行中のリフレッシュが完了するのを待ちます。リフレッシュが失敗した場合、例外がスローされます。リフレッシュが実行中でない場合は即時に完了し、前回のリフレッシュが失敗した場合は例外がスローされます。

### STOP VIEW, STOP VIEWS {#stop-view-stop-views}

指定されたビューまたはすべての更新可能なビューの定期的なリフレッシュを無効にします。リフレッシュが進行中の場合は、それもキャンセルします。

```sql
SYSTEM STOP VIEW [db.]name
```
```sql
SYSTEM STOP VIEWS
```

### START VIEW, START VIEWS {#start-view-start-views}

指定されたビューまたはすべての更新可能なビューの定期的なリフレッシュを有効にします。即時のリフレッシュはトリガーされません。

```sql
SYSTEM START VIEW [db.]name
```
```sql
SYSTEM START VIEWS
```

### CANCEL VIEW {#cancel-view}

指定されたビューのリフレッシュが進行中の場合、それを中断してキャンセルします。それ以外は何もしません。

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

進行中のリフレッシュが完了するまで待ちます。リフレッシュが実行されていない場合は即時に戻ります。最新のリフレッシュ試行が失敗した場合はエラーを報告します。

新しい更新可能マテリアライズドビューを作成した直後（EMPTYキーワードなし）に、初期リフレッシュが完了するまで待つために使用できます。

```sql
SYSTEM WAIT VIEW [db.]name
```
