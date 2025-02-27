---
slug: /sql-reference/statements/system
sidebar_position: 36
sidebar_label: SYSTEM
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# SYSTEM ステートメント

## RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

すべての[内部辞書](../../sql-reference/dictionaries/index.md)を再読み込みします。デフォルトでは、内部辞書は無効になっています。内部辞書の更新結果に関わらず、常に`Ok.`を返します。

## RELOAD DICTIONARIES {#reload-dictionaries}

以前に正常に読み込まれたすべての辞書を再読み込みします。デフォルトでは、辞書は遅延読み込みされます（[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)を参照）。そのため、起動時に自動的に読み込まれるのではなく、dictGet関数を通じて最初にアクセスするか、ENGINE = DictionaryのテーブルからSELECTすると初めて初期化されます。`SYSTEM RELOAD DICTIONARIES`クエリはそのような辞書を再度読み込みます（LOADED）。辞書の更新結果に関わらず、常に`Ok.`を返します。

**構文**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## RELOAD DICTIONARY {#reload-dictionary}

辞書`dictionary_name`を完全に再読み込みします。辞書の状態（LOADED / NOT_LOADED / FAILED）に関わらず再読み込みが行われます。辞書の更新結果に関わらず、常に`Ok.`を返します。

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

辞書の状態は、`system.dictionaries`テーブルをクエリすることで確認できます。

```sql
SELECT name, status FROM system.dictionaries;
```

## RELOAD MODELS {#reload-models}

:::note
このステートメントと`SYSTEM RELOAD MODEL`は、clickhouse-library-bridgeからcatboostモデルをアンロードするだけです。`catboostEvaluate()`関数は、モデルがまだ読み込まれていない場合に、最初のアクセス時にモデルを読み込みます。
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

すべての登録された[実行可能ユーザー定義関数](../functions/overview#executable-user-defined-functions)またはそれらの一部を構成ファイルから再読み込みします。

**構文**

```sql
RELOAD FUNCTIONS [ON CLUSTER cluster_name]
RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

すべての[非同期メトリックス](../../operations/system-tables/asynchronous_metrics.md)を再計算します。非同期メトリックスは、設定された[asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md)に基づいて定期的に更新されるため、このステートメントを使って手動で更新する必要は通常ありません。

```sql
RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## DROP DNS CACHE {#drop-dns-cache}

ClickHouseの内部DNSキャッシュをクリアします。時には（古いClickHouseバージョンの場合）、インフラストラクチャ（他のClickHouseサーバーのIPアドレスや辞書で使用されるサーバーのIPアドレスを変更する）を変更する際に、このコマンドを使用する必要があります。

より便利な（自動的な）キャッシュ管理については、disable_internal_dns_cache、dns_cache_max_entries、dns_cache_update_periodパラメータを参照してください。

## DROP MARK CACHE {#drop-mark-cache}

マークキャッシュをクリアします。

## DROP REPLICA {#drop-replica}

`ReplicatedMergeTree`テーブルの死んだレプリカは、次の構文を使用して削除できます。

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

これらのクエリは、ZooKeeper内の`ReplicatedMergeTree`レプリカパスを削除します。これは、レプリカが死んでおり、そのメタデータを`DROP TABLE`によってZooKeeperから削除できない場合に便利です。非アクティブ/古いレプリカのみを削除し、ローカルレプリカを削除することはできませんので、それには`DROP TABLE`を使用してください。`DROP REPLICA`は、テーブルを削除せず、ディスクからデータやメタデータを削除することはありません。

最初のものは、`database.table`テーブルの`'replica_name'`レプリカのメタデータを削除します。
2番目は、データベース内のすべてのレプリケートされたテーブルに対して同じことを行います。
3番目は、ローカルサーバー上のすべてのレプリケートされたテーブルに対して同じことを行います。
4番目は、テーブルの他のすべてのレプリカが削除された場合に、死んだレプリカのメタデータを削除するのに役立ちます。これには、テーブルパスを明示的に指定する必要があります。このパスは、テーブル作成時に`ReplicatedMergeTree`エンジンの最初の引数に渡されたのと同じものにする必要があります。

## DROP DATABASE REPLICA {#drop-database-replica}

死んだレプリカの`Replicated`データベースは、次の構文を使用して削除できます。

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

`SYSTEM DROP REPLICA`と似ていますが、`DROP DATABASE`を実行するデータベースがない場合にZooKeeperから`Replicated`データベースレプリカパスを削除します。`ReplicatedMergeTree`レプリカは削除されないので注意してください（そのため、`SYSTEM DROP REPLICA`も必要です）。シャードおよびレプリカ名は、データベース作成時に`Replicated`エンジン引数で指定された名前です。また、これらの名前は`system.clusters`の`database_shard_name`および`database_replica_name`カラムから取得できます。`FROM SHARD`句が欠如している場合、`replica_name`は`shard_name|replica_name`形式の完全なレプリカ名でなければなりません。

## DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

非圧縮データキャッシュをクリアします。非圧縮データキャッシュは、クエリ/ユーザー/プロファイルレベルの設定[`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache)を使って有効化/無効化されます。そのサイズは、サーバーレベルの設定[`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size)を使って構成できます。

## DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

コンパイルされた式のキャッシュをクリアします。コンパイルされた式のキャッシュは、クエリ/ユーザー/プロファイルレベルの設定[`compile_expressions`](../../operations/settings/settings.md#compile_expressions)を使って有効化/無効化されます。

## DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
```

[クエリキャッシュ](../../operations/query-cache.md)をクリアします。タグが指定された場合、指定されたタグを持つクエリキャッシュエントリのみが削除されます。

## DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

[`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path)から読み込まれたスキーマのキャッシュをクリアします。

サポートされている形式：

- Protobuf

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]
```

## FLUSH LOGS {#flush-logs}

バッファされたログメッセージをシステムテーブル、たとえばsystem.query_logにフラッシュします。これは主にデバッグに役立ちます。ほとんどのシステムテーブルはデフォルトのフラッシュインターバルが7.5秒です。このコマンドは、メッセージキューが空であってもシステムテーブルを作成します。

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

すべてをフラッシュしたくない場合は、ログ名またはターゲットテーブルを指定することで、一つまたは複数の個々のログをフラッシュできます。

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## RELOAD CONFIG {#reload-config}

ClickHouse設定を再読み込みします。設定がZooKeeperに保存されているときに使用します。注意点として、`SYSTEM RELOAD CONFIG`はZooKeeperに保存された`USER`設定を再読み込みせず、`users.xml`に保存された`USER`設定のみを再読み込みします。すべての`USER`設定を再読み込みするには、`SYSTEM RELOAD USERS`を使用します。

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## RELOAD USERS {#reload-users}

すべてのアクセスストレージ（users.xml、ローカルディスクアクセスストレージ、ZooKeeper内のレプリケートされたアクセスストレージ）を再読み込みします。

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

通常、ClickHouseをシャットダウンします（`service clickhouse-server stop` / `kill {$pid_clickhouse-server}`のように）。

## KILL {#kill}

ClickHouseプロセスを中断します（`kill -9 {$ pid_clickhouse-server}`のように）。

## 分散テーブルの管理 {#managing-distributed-tables}

ClickHouseは[分散](../../engines/table-engines/special/distributed.md)テーブルを管理できます。ユーザーがこれらのテーブルにデータを挿入すると、ClickHouseはまずクラスターノードに送信すべきデータのキューを作成し、それを非同期で送信します。`STOP DISTRIBUTED SENDS`（#stop-distributed-sends）、`FLUSH DISTRIBUTED`（#flush-distributed）、`START DISTRIBUTED SENDS`（#start-distributed-sends）クエリを使用してキュー処理を管理できます。また、[`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert)設定を使用して、分散データを同期的に挿入することもできます。

### STOP DISTRIBUTED SENDS {#stop-distributed-sends}

分散テーブルにデータを挿入する際のバックグラウンドデータ配信を無効にします。

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
[`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica)が有効になっている場合（デフォルト設定）、ローカルシャードにデータが挿入されることになります。
:::

### FLUSH DISTRIBUTED {#flush-distributed}

ClickHouseがクラスターノードにデータを同期的に送信するように強制します。ノードが利用できない場合、ClickHouseは例外を投げ、クエリの実行を停止します。すべてのノードがオンラインに戻ると、クエリを再試行できます。

`SETTINGS`句を使っていくつかの設定を上書きすることもでき、これは`max_concurrent_queries_for_all_users`や`max_memory_usage`のような一時的な制限を避けるのに役立つ場合があります。

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
各保留中のブロックは、最初のINSERTクエリの設定でディスクに保存されるため、時には設定を上書きしたくなることがあります。
:::

### START DISTRIBUTED SENDS {#start-distributed-sends}

分散テーブルにデータを挿入する際のバックグラウンドデータ配信を有効にします。

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### STOP LISTEN {#stop-listen}

ソケットを閉じ、指定されたポートと指定されたプロトコルでのサーバーへの既存の接続を優雅に終了します。

ただし、clickhouse-server構成において対応するプロトコル設定が指定されていない場合、このコマンドは効果がありません。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- `CUSTOM 'protocol'`修飾子が指定された場合、サーバー構成のプロトコルセクションで定義された名前のカスタムプロトコルを停止します。
- `QUERIES ALL [EXCEPT .. [,..]]`修飾子が指定された場合、`EXCEPT`句で指定されていない限り、すべてのプロトコルが停止します。
- `QUERIES DEFAULT [EXCEPT .. [,..]]`修飾子が指定された場合、`EXCEPT`句で指定されていない限り、すべてのデフォルトプロトコルが停止します。
- `QUERIES CUSTOM [EXCEPT .. [,..]]`修飾子が指定された場合、`EXCEPT`句で指定されていない限り、すべてのカスタムプロトコルが停止します。

### START LISTEN {#start-listen}

指定されたプロトコルで新しい接続を確立できるようにします。

ただし、指定されたポートとプロトコルでのサーバーが`SYSTEM STOP LISTEN`コマンドを使用して停止されていない場合、このコマンドは効果がありません。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

## MergeTree テーブルの管理 {#managing-mergetree-tables}

ClickHouseは[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルのバックグラウンドプロセスを管理できます。

### STOP MERGES {#stop-merges}

<CloudNotSupportedBadge/>

MergeTreeファミリーのテーブルでバックグラウンドマージを停止する機能を提供します。

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
`DETACH / ATTACH`テーブルは、すべてのMergeTreeテーブルのマージが停止している場合でも、テーブルのバックグラウンドマージを開始します。
:::

### START MERGES {#start-merges}

<CloudNotSupportedBadge/>

MergeTreeファミリーのテーブルでバックグラウンドマージを開始する機能を提供します。

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### STOP TTL MERGES {#stop-ttl-merges}

MergeTreeファミリーのテーブルで[TTL式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)に基づいて古いデータを削除するためのバックグラウンドプロセスを停止する機能を提供します。テーブルが存在しない場合やMergeTreeエンジンがない場合でも、`Ok.`を返します。データベースが存在しない場合にはエラーを返します。

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START TTL MERGES {#start-ttl-merges}

MergeTreeファミリーのテーブルで[TTL式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)に基づいて古いデータを削除するためのバックグラウンドデータ削除を開始する機能を提供します。テーブルが存在しない場合には`Ok.`を返します。データベースが存在しない場合にはエラーを返します。

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### STOP MOVES {#stop-moves}

MergeTreeファミリーのテーブルで[TTLテーブル式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)に基づいてデータを移動するためのプロセスを停止する機能を提供します。テーブルが存在しない場合には`Ok.`を返します。データベースが存在しない場合にはエラーを返します。

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START MOVES {#start-moves}

MergeTreeファミリーのテーブルで[TTLテーブル式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)に基づいてデータを移動するプロセスを開始する機能を提供します。テーブルが存在しない場合には`Ok.`を返します。データベースが存在しない場合にはエラーを返します。

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM UNFREEZE {#query_language-system-unfreeze}

指定された名前のフリーズされたバックアップをすべてのディスクからクリアします。個別のパーツをフリーズ解除する方法については、[ALTER TABLE table_name UNFREEZE WITH NAME ](alter/partition.md#alter_unfreeze-partition)を参照してください。

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### WAIT LOADING PARTS {#wait-loading-parts}

テーブルのすべての非同期読み込みデータパーツ（古いデータパーツ）が読み込まれるまで待機します。

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## ReplicatedMergeTree テーブルの管理 {#managing-replicatedmergetree-tables}

ClickHouseは[ReplicatedMergeTree](../../engines/table-engines/mergetree-family/replication.md#table_engines-replication)テーブルのバックグラウンドレプリケーション関連プロセスを管理できます。

### STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge/>

`ReplicatedMergeTree`ファミリーのテーブルに挿入されたパーツのためのバックグラウンドフェッチを停止する機能を提供します。テーブルエンジンやテーブルまたはデータベースの存在に関わらず、常に`Ok.`を返します。

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START FETCHES {#start-fetches}

<CloudNotSupportedBadge/>

`ReplicatedMergeTree`ファミリーのテーブルに挿入されたパーツのためのバックグラウンドフェッチを開始する機能を提供します。テーブルエンジンやテーブルまたはデータベースの存在に関わらず、常に`Ok.`を返します。

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATED SENDS {#stop-replicated-sends}

`ReplicatedMergeTree`ファミリーのテーブルに対してクラスタ内の他のレプリカに新しい挿入されたパーツを送信するためのバックグラウンドプロセスを停止する機能を提供します。

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATED SENDS {#start-replicated-sends}

`ReplicatedMergeTree`ファミリーのテーブルに対してクラスタ内の他のレプリカに新しい挿入されたパーツを送信するためのバックグラウンドプロセスを開始する機能を提供します。

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATION QUEUES {#stop-replication-queues}

ZooKeeperに保存されている`ReplicatedMergeTree`ファミリーのテーブルに対するレプリケーションキューからのバックグラウンドフェッチタスクを停止する機能を提供します。可能なバックグラウンドタスクのタイプは、マージ、フェッチ、ミューテーション、およびON CLUSTER句を持つDDLステートメントです。

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATION QUEUES {#start-replication-queues}

ZooKeeperに保存されている`ReplicatedMergeTree`ファミリーのテーブルに対するレプリケーションキューからのバックグラウンドフェッチタスクを開始する機能を提供します。可能なバックグラウンドタスクのタイプは、マージ、フェッチ、ミューテーション、およびON CLUSTER句を持つDDLステートメントです。

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

`ReplicatedMergeTree`テーブルにレプリケーションログからの新しいエントリをレプリケーションキューに読み込むことを停止します。

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START PULLING REPLICATION LOG {#start-pulling-replication-log}

`SYSTEM STOP PULLING REPLICATION LOG`をキャンセルします。

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYNC REPLICA {#sync-replica}

`ReplicatedMergeTree`テーブルがクラスタ内の他のレプリカと同期するまで待機しますが、`receive_timeout`秒を超えません。

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

このステートメントを実行した後、`[db.]replicated_merge_tree_family_table_name`は共通のレプリケーションログからコマンドをフェッチし、その後クエリはレプリカがすべてのフェッチされたコマンドを処理するまで待機します。以下の修飾子がサポートされています：

- `STRICT`修飾子が指定された場合、クエリはレプリケーションキューが空になるまで待機します。`STRICT`バージョンは、レプリケーションキューに常に新しいエントリが発生している場合、成功しないことがあります。
- `LIGHTWEIGHT`修飾子が指定された場合、クエリは`GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE`、`DROP_PART`のエントリが処理されるまでのみ待機します。さらに、LIGHTWEIGHT修飾子はオプションのFROM 'srcReplicas'句をサポートしており、ここで'srcReplicas'はソースレプリカの名前のカンマ区切りリストです。この拡張により、指定されたソースレプリカから発生するレプリケーションタスクのみに集中して同期できます。
- `PULL`修飾子が指定された場合、クエリはZooKeeperから新しいレプリケーションキューエントリをプルしますが、処理が行われるまで待機しません。

### SYNC DATABASE REPLICA {#sync-database-replica}

指定された[レプリケートデータベース](/engines/database-engines/replicated)がそのデータベースのDDLキューからすべてのスキーマ変更を適用するまで待機します。

**構文**
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### RESTART REPLICA {#restart-replica}

`ReplicatedMergeTree`テーブルのZooKeeperセッションの状態を再初期化する機能を提供します。現在の状態がZooKeeperと真実のソースとして比較され、必要に応じてZooKeeperキューにタスクが追加されます。ZooKeeperのデータに基づくレプリケーションキューの初期化は、`ATTACH TABLE`ステートメントの際に行われます。短時間、テーブルはすべての操作に対して利用できなくなります。

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### RESTORE REPLICA {#restore-replica}

データが[可能性として]存在するが、ZooKeeperメタデータが失われた場合にレプリカを復元します。

これは、読み取り専用の`ReplicatedMergeTree`テーブルでのみ動作します。

次の場合にクエリを実行できます：

- ZooKeeperルート`/`の損失
- レプリカパス`/replicas`の損失
- 個々のレプリカパス`/replicas/replica_name/`の損失

レプリカは、ローカルで見つかったパーツをアタッチし、それらについての情報をZooKeeperに送信します。メタデータの損失前にレプリカに存在していたパーツは、古くなっていない限り他のものから再取得されません（そのため、レプリカの復元はすべてのデータをネットワーク経由で再ダウンロードすることを意味しません）。

:::note
すべての状態のパーツは`detached/`フォルダに移動されます。データ損失前にアクティブだったパーツ（コミットされたもの）はアタッチされます。
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

複数のサーバーでテーブルを作成します。レプリカのメタデータがZooKeeperで失われた後、メタデータがないため、テーブルは読み取り専用としてアタッチされます。最後のクエリは、すべてのレプリカで実行される必要があります。

```sql
CREATE TABLE test(n UInt32)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/test/', '{replica}')
ORDER BY n PARTITION BY n % 10;

INSERT INTO test SELECT * FROM numbers(1000);

-- zookeeper_delete_path("/clickhouse/tables/test", recursive=True) <- root loss.

SYSTEM RESTART REPLICA test;
SYSTEM RESTORE REPLICA test;
```

別の方法：

```sql
SYSTEM RESTORE REPLICA test ON CLUSTER cluster;
```

### RESTART REPLICAS {#restart-replicas}

すべての`ReplicatedMergeTree`テーブルのZooKeeperセッションの状態を再初期化する機能を提供します。現在の状態がZooKeeperと真実のソースとして比較され、必要に応じてZooKeeperキューにタスクが追加されます。

### DROP FILESYSTEM CACHE {#drop-filesystem-cache}

ファイルシステムキャッシュを削除することを許可します。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYNC FILE CACHE {#sync-file-cache}

:::note
これは非常に重く、悪用の可能性があります。
:::

同期システムコールを実行します。

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

## リフレッシュ可能なマテリアライズドビューの管理 {#refreshable-materialized-views}

[リフレッシュ可能なマテリアライズドビュー](../../sql-reference/statements/create/view.md#refreshable-materialized-view)で実行されるバックグラウンドタスクを制御するためのコマンドです。

使用中は[`system.view_refreshes`](../../operations/system-tables/view_refreshes.md)に注目してください。

### REFRESH VIEW {#refresh-view}

指定されたビューの即時スケジュール外のリフレッシュをトリガーします。

```sql
SYSTEM REFRESH VIEW [db.]name
```

### REFRESH VIEW {#refresh-view-1}

現在実行中のリフレッシュが完了するまで待機します。リフレッシュが失敗した場合、例外を投げます。リフレッシュが実行されていない場合、即座に完了し、前回のリフレッシュが失敗している場合は例外を投げます。

### STOP VIEW, STOP VIEWS {#stop-view-stop-views}

指定されたビューまたはすべてのリフレッシュ可能なビューの定期的なリフレッシュを無効にします。リフレッシュが進行中の場合、それもキャンセルします。

```sql
SYSTEM STOP VIEW [db.]name
```
```sql
SYSTEM STOP VIEWS
```

### START VIEW, START VIEWS {#start-view-start-views}

指定されたビューまたはすべてのリフレッシュ可能なビューの定期的なリフレッシュを有効にします。即時のリフレッシュはトリガーされません。

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

実行中のリフレッシュが完了するまで待機します。リフレッシュが実行されていない場合、すぐに戻ります。最新のリフレッシュ試行が失敗した場合、エラーを報告します。

新しいリフレッシュ可能なマテリアライズドビューを作成した直後（EMPTYキーワードなし）に、初期リフレッシュが完了するまで待機するために使用できます。

```sql
SYSTEM WAIT VIEW [db.]name
```
