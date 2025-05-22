---
'description': 'Documentation for SYSTEM Statements'
'sidebar_label': 'SYSTEM'
'sidebar_position': 36
'slug': '/sql-reference/statements/system'
'title': 'SYSTEM Statements'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';



# SYSTEM ステートメント

## RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

すべての [Internal dictionaries](../../sql-reference/dictionaries/index.md) を再読み込みします。
デフォルトでは、内部辞書は無効になっています。
内部辞書の更新結果に関わらず、常に `Ok.` を返します。

## RELOAD DICTIONARIES {#reload-dictionaries}

成功裏に読み込まれたすべての辞書を再読み込みします。
デフォルトでは、辞書は遅延読み込みされます ([dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load) を参照)。そのため、起動時に自動的に読み込まれるのではなく、最初のアクセス時に `dictGet` 関数を通じてまたは `ENGINE = Dictionary` を持つテーブルから SELECT して初期化されます。`SYSTEM RELOAD DICTIONARIES` クエリはそのような辞書を再読み込みします (LOADED)。
辞書の更新結果に関わらず、常に `Ok.` を返します。

**構文**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## RELOAD DICTIONARY {#reload-dictionary}

辞書 `dictionary_name` を完全に再読み込みします。辞書の状態 (LOADED / NOT_LOADED / FAILED) に関わらず、常に再読み込みします。
常に `Ok.` を返します。

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

辞書の状態は、`system.dictionaries` テーブルをクエリすることで確認できます。

```sql
SELECT name, status FROM system.dictionaries;
```

## RELOAD MODELS {#reload-models}

:::note
このステートメントおよび `SYSTEM RELOAD MODEL` は、単に catboost モデルを clickhouse-library-bridge からアンロードします。`catboostEvaluate()` 関数は、最初のアクセス時にまだ読み込まれていない場合、モデルを読み込みます。
:::

すべての CatBoost モデルをアンロードします。

**構文**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```

## RELOAD MODEL {#reload-model}

`model_path` にある CatBoost モデルをアンロードします。

**構文**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```

## RELOAD FUNCTIONS {#reload-functions}

すべての登録された [実行可能なユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions) またはそのうちの一つを構成ファイルから再読み込みします。

**構文**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

すべての [非同期メトリクス](../../operations/system-tables/asynchronous_metrics.md) を再計算します。非同期メトリクスは設定 [asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md) に基づいて定期的に更新されるため、このステートメントを使用して手動で更新する必要は通常ありません。

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## DROP DNS CACHE {#drop-dns-cache}

ClickHouse の内部 DNS キャッシュをクリアします。時々 (古い ClickHouse バージョンの場合) インフラストラクチャを変更する際に (別の ClickHouse サーバーの IP アドレスを変更したり、辞書で使用されるサーバーを変更したりする場合) このコマンドを使用する必要があります。

より便利な (自動的な) キャッシュ管理については、disable_internal_dns_cache、dns_cache_max_entries、dns_cache_update_period パラメータを参照してください。

## DROP MARK CACHE {#drop-mark-cache}

マークキャッシュをクリアします。

## DROP ICEBERG METADATA CACHE {#drop-iceberg-metadata-cache}

アイスバーグメタデータキャッシュをクリアします。

## DROP REPLICA {#drop-replica}

`ReplicatedMergeTree` テーブルのデッドレプリカを次の構文を使用して削除できます。

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

クエリは ZooKeeper から `ReplicatedMergeTree` レプリカパスを削除します。レプリカがデッドで、そのメタデータが `DROP TABLE` よりも ZooKeeper から削除できない場合に便利です。無効な/古いレプリカのみを削除し、ローカルレプリカは削除できません。これには `DROP TABLE` を使用してください。`DROP REPLICA` はテーブルを削除せず、ディスクからデータやメタデータを削除しません。

最初のものは、`database.table` テーブルの `'replica_name'` レプリカのメタデータを削除します。
2つ目は、データベース内のすべてのレプリケートされたテーブルに対して同じことを行います。
3つ目は、ローカルサーバー上のすべてのレプリケートされたテーブルに対して同じことを行います。
4つ目は、テーブルのすべての他のレプリカが削除されたときにデッドレプリカのメタデータを削除するのに便利です。テーブルパスを明示的に指定する必要があります。それは、テーブル作成時の `ReplicatedMergeTree` エンジンの最初の引数として渡されたパスと同じでなければなりません。

## DROP DATABASE REPLICA {#drop-database-replica}

デッドレプリカの `Replicated` データベースは次の構文を使用して削除できます。

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

`SYSTEM DROP REPLICA` と似ていますが、`DROP DATABASE` を実行するデータベースがない場合に ZooKeeper から `Replicated` データベースレプリカパスを削除します。`ReplicatedMergeTree` のレプリカは削除されないため、必要に応じて `SYSTEM DROP REPLICA` が必要です。シャードおよびレプリカ名は、データベースを作成する際に `Replicated` エンジンの引数として指定された名前です。また、これらの名前は `system.clusters` の `database_shard_name` および `database_replica_name` カラムから取得できます。`FROM SHARD` 句が欠けている場合、`replica_name` は `shard_name|replica_name` 形式の完全なレプリカ名でなければなりません。

## DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

解凍されたデータキャッシュをクリアします。
解凍されたデータキャッシュは、クエリ/ユーザー/プロファイルレベルの設定 [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache) によって有効化/無効化されます。
そのサイズは、サーバーレベルの設定 [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size) で構成できます。

## DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

コンパイル済み式キャッシュをクリアします。
コンパイル済み式キャッシュは、クエリ/ユーザー/プロファイルレベルの設定 [`compile_expressions`](../../operations/settings/settings.md#compile_expressions) によって有効化/無効化されます。

## DROP QUERY CONDITION CACHE {#drop-query-condition-cache}

クエリ条件キャッシュをクリアします。

## DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
```

[クエリキャッシュ](../../operations/query-cache.md)をクリアします。
タグが指定された場合、指定されたタグを持つクエリキャッシュエントリのみが削除されます。

## DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

[`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path) から読み込まれたスキーマのキャッシュをクリアします。

サポートされる形式:

- Protobuf

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]
```

## FLUSH LOGS {#flush-logs}

バッファリングされたログメッセージをシステムテーブル（例えば、system.query_log）にフラッシュします。主にデバッグに便利です。ほとんどのシステムテーブルはデフォルトのフラッシュ間隔が 7.5 秒です。
これにより、メッセージキューが空であってもシステムテーブルが作成されます。

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

すべてをフラッシュしたくない場合は、名前またはターゲットテーブルを指定して、一つ以上の個別ログをフラッシュできます。

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## RELOAD CONFIG {#reload-config}

ClickHouse の設定を再読み込みします。設定が ZooKeeper に保存されている場合に使用します。`SYSTEM RELOAD CONFIG` は ZooKeeper に保存されている `USER` 設定を再読み込みせず、`users.xml` に保存されている `USER` 設定のみを再読み込みします。すべての `USER` 設定を再読み込みするには `SYSTEM RELOAD USERS` を使用します。

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## RELOAD USERS {#reload-users}

すべてのアクセスストレージを再読み込みします。これには、users.xml、ローカルディスクアクセスストレージ、ZooKeeper 内のレプリケートされたアクセスストレージが含まれます。

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

通常、ClickHouse をシャットダウンします（`service clickhouse-server stop` / `kill {$pid_clickhouse-server}` のように）。

## KILL {#kill}

ClickHouse プロセスを中断します（`kill -9 {$ pid_clickhouse-server}` のように）。

## 分散テーブルの管理 {#managing-distributed-tables}

ClickHouse は [分散](../../engines/table-engines/special/distributed.md) テーブルを管理できます。ユーザーがこれらのテーブルにデータを挿入すると、ClickHouse は最初にクラスター ノードに送信する必要があるデータのキューを作成し、その後非同期で送信します。キュー処理は [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends)、[FLUSH DISTRIBUTED](#flush-distributed)、および [`START DISTRIBUTED SENDS`](#start-distributed-sends) クエリを使用して管理できます。また、[`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert) 設定を使用して、分散データを同期的に挿入することもできます。

### STOP DISTRIBUTED SENDS {#stop-distributed-sends}

分散テーブルへのデータ挿入時のバックグラウンドデータ配信を無効にします。

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
[`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica) が有効な場合（デフォルト）、データはローカルシャードに挿入されます。
:::

### FLUSH DISTRIBUTED {#flush-distributed}

ClickHouse にデータをクラスター ノードに同期的に送信させます。ノードが利用できない場合、ClickHouse は例外をスローし、クエリ実行を停止します。クエリを成功するまで再試行できます。これは、すべてのノードが再オンラインになると発生します。

特定の設定をオーバーライドするために `SETTINGS` 句を使用することもでき、一時的な制限を回避するのに役立つ場合があります (たとえば、`max_concurrent_queries_for_all_users` や `max_memory_usage`)。

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
各保留中のブロックは、最初の INSERT クエリからの設定でディスクに保存されるため、時には設定をオーバーライドしたいことがあります。
:::

### START DISTRIBUTED SENDS {#start-distributed-sends}

分散テーブルへのデータ挿入時のバックグラウンドデータ配信を有効にします。

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### STOP LISTEN {#stop-listen}

ソケットを閉じて、指定されたポートと指定されたプロトコルのサーバーへの既存の接続を優雅に終了します。

ただし、対応するプロトコル設定が clickhouse-server 構成に指定されていない場合、このコマンドは効果がありません。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- `CUSTOM 'protocol'` 修飾子が指定された場合、サーバー構成のプロトコルセクションで定義された指定された名前のカスタムプロトコルが停止します。
- `QUERIES ALL [EXCEPT .. [,..]]` 修飾子が指定された場合、すべてのプロトコルが停止されますが、`EXCEPT` 句で指定されたものは除きます。
- `QUERIES DEFAULT [EXCEPT .. [,..]]` 修飾子が指定された場合、すべてのデフォルトプロトコルが停止されますが、`EXCEPT` 句で指定されたものは除きます。
- `QUERIES CUSTOM [EXCEPT .. [,..]]` 修飾子が指定された場合、すべてのカスタムプロトコルが停止されますが、`EXCEPT` 句で指定されたものは除きます。

### START LISTEN {#start-listen}

指定されたプロトコルで新しい接続の確立を許可します。

ただし、SYSTEM STOP LISTEN コマンドを使用して指定されたポートとプロトコルでサーバーが停止されていない場合、このコマンドは効果がありません。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

## MergeTree テーブルの管理 {#managing-mergetree-tables}

ClickHouse は [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブル内のバックグラウンド プロセスを管理できます。

### STOP MERGES {#stop-merges}

<CloudNotSupportedBadge/>

MergeTree ファミリー内のテーブルのバックグラウンド マージを停止する機能を提供します。

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
`DETACH / ATTACH` テーブルは、すべての MergeTree テーブルのマージが停止している場合でも、テーブルのバックグラウンド マージを開始します。
:::

### START MERGES {#start-merges}

<CloudNotSupportedBadge/>

MergeTree ファミリー内のテーブルのバックグラウンド マージを開始する機能を提供します。

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### STOP TTL MERGES {#stop-ttl-merges}

MergeTree ファミリー内のテーブルに対して、[TTL 式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) に基づいて古いデータをバックグラウンドで削除する機能を提供します。
テーブルが存在しない場合やテーブルが MergeTree エンジンを持っていない場合でも、`Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START TTL MERGES {#start-ttl-merges}

MergeTree ファミリー内のテーブルについて、[TTL 式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) に基づいて古いデータをバックグラウンドで削除する機能を提供します。
テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### STOP MOVES {#stop-moves}

[TTL テーブル式での TO VOLUME または TO DISK 句](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) に基づいて MergeTree ファミリー内のテーブルに対して、バックグラウンドでデータを移動する機能を提供します。
テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START MOVES {#start-moves}

[TTL テーブル式での TO VOLUME および TO DISK 句](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) に基づいて MergeTree ファミリー内のテーブルに対して、バックグラウンドでデータを移動する機能を提供します。
テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM UNFREEZE {#query_language-system-unfreeze}

指定された名前のフローズンバックアップをすべてのディスクからクリアします。部分的に[ALTER TABLE table_name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition) でのフリーペアについては、詳細を参照してください。

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### WAIT LOADING PARTS {#wait-loading-parts}

テーブルのすべての非同期ロードデータ部分 (古いデータ部分) が読み込まれるまで待ちます。

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## ReplicatedMergeTree テーブルの管理 {#managing-replicatedmergetree-tables}

ClickHouse は [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) テーブルにおけるバックグラウンドのレプリケーション関連プロセスを管理できます。

### STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge/>

`ReplicatedMergeTree` ファミリー内のテーブルのために挿入された部分のバックグラウンドフェッチを停止する機能を提供します。
テーブルエンジンに関わらず常に `Ok.` を返します。テーブルやデータベースが存在しない場合でも。

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START FETCHES {#start-fetches}

<CloudNotSupportedBadge/>

`ReplicatedMergeTree` ファミリー内のテーブルのために挿入された部分のバックグラウンドフェッチを開始する機能を提供します。
テーブルエンジンに関わらず常に `Ok.` を返します。テーブルやデータベースが存在しない場合でも。

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATED SENDS {#stop-replicated-sends}

`ReplicatedMergeTree` ファミリー内のテーブルのために新しく挿入された部分のバックグラウンド送信をクラスター内の他のレプリカに停止する機能を提供します。

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATED SENDS {#start-replicated-sends}

`ReplicatedMergeTree` ファミリー内のテーブルのために新しく挿入された部分のバックグラウンド送信をクラスター内の他のレプリカに開始する機能を提供します。

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATION QUEUES {#stop-replication-queues}

ZooKeeper に保存されているレプリケーションキューからのバックグラウンド フェッチタスクを停止する機能を提供します。可能なバックグラウンドタスクの種類 - マージ、フェッチ、ミューテーション、ON CLUSTER 句付きの DDL ステートメント:

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATION QUEUES {#start-replication-queues}

ZooKeeper に保存されているレプリケーションキューからのバックグラウンド フェッチタスクを開始する機能を提供します。可能なバックグラウンドタスクの種類 - マージ、フェッチ、ミューテーション、ON CLUSTER 句付きの DDL ステートメント:

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

`ReplicatedMergeTree` テーブルのレプリケーションログからの新しいエントリをレプリケーションキューに読み込むのを停止します。

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START PULLING REPLICATION LOG {#start-pulling-replication-log}

`SYSTEM STOP PULLING REPLICATION LOG` をキャンセルします。

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYNC REPLICA {#sync-replica}

`ReplicatedMergeTree` テーブルがクラスター内の他のレプリカと同期するまで待ちますが、`receive_timeout` 秒を超えません。

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

このステートメントを実行した後、`[db.]replicated_merge_tree_family_table_name` はコマンドを共通のレプリケートされたログから自分のレプリケーションキューにフェッチし、その後クエリはレプリカがフェッチしたコマンドを処理するのを待ちます。以下の修飾子がサポートされています。

 - `STRICT` 修飾子が指定された場合、クエリはレプリケーションキューが空になるのを待ちます。`STRICT` バージョンは、レプリケーションキューで新しいエントリが常に現れる場合、成功しない場合があります。
 - `LIGHTWEIGHT` 修飾子が指定された場合、クエリは `GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE` および `DROP_PART` エントリが処理されるのを待ちます。
   さらに、LIGHTWEIGHT 修飾子はオプションの FROM 'srcReplicas' 句をサポートしており、`srcReplicas` はソースレプリカ名のカンマ区切りのリストです。この拡張により、特定のソースレプリカからのレプリケーションタスクのみに焦点を当てることで、よりターゲットを絞った同期が可能になります。
 - `PULL` 修飾子が指定された場合、クエリはZooKeeper から新しいレプリケーションキューエントリをプルしますが、何も処理されるのを待ちません。

### SYNC DATABASE REPLICA {#sync-database-replica}

指定された [replicated database](/engines/database-engines/replicated) がそのデータベースの DDL キューからすべてのスキーマ変更を適用するまで待ちます。

**構文**
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### RESTART REPLICA {#restart-replica}

`ReplicatedMergeTree` テーブルの Zookeeper セッションの状態を再初期化する機能を提供します。現在の状態をソースとして Zookeeper と比較し、必要に応じて Zookeeper キューにタスクを追加します。
Zookeeper データに基づいてレプリケーションキューの初期化は、`ATTACH TABLE` ステートメントと同じ方法で行われます。一時的に、テーブルは操作を受け付けません。

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### RESTORE REPLICA {#restore-replica}

データが [可能性がある] が Zookeeper メタデータが失われた場合はレプリカを復元します。

読み取り専用の `ReplicatedMergeTree` テーブルでのみ動作します。

次の後にクエリを実行できます。

  - ZooKeeper ルート `/` の損失。
  - レプリカパス `/replicas` の損失。
  - 個々のレプリカパス `/replicas/replica_name/` の損失。

レプリカはローカルで見つかったパーツをアタッチし、それらについての情報を Zookeeper に送信します。メタデータが失われる前にレプリカに存在するパーツは、他のものから再取得されません (したがって、レプリカの復元はネットワーク経由でのすべてのデータを再ダウンロードすることを意味しません)。

:::note
すべての状態のパーツは `detached/` フォルダに移動されます。データ損失の前にアクティブだったパーツ (コミットされた) はアタッチされます。
:::

**構文**

```sql
SYSTEM RESTORE REPLICA [db.]replicated_merge_tree_family_table_name [ON CLUSTER cluster_name]
```

代替構文:

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**例**

複数のサーバーでテーブルを作成します。レプリカのメタデータが ZooKeeper で失われた後、メタデータが不足しているため、テーブルは読み取り専用としてアタッチされます。この最後のクエリは、すべてのレプリカで実行する必要があります。

```sql
CREATE TABLE test(n UInt32)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/test/', '{replica}')
ORDER BY n PARTITION BY n % 10;

INSERT INTO test SELECT * FROM numbers(1000);

-- zookeeper_delete_path("/clickhouse/tables/test", recursive=True) <- root loss.

SYSTEM RESTART REPLICA test;
SYSTEM RESTORE REPLICA test;
```

別の方法は:

```sql
SYSTEM RESTORE REPLICA test ON CLUSTER cluster;
```

### RESTART REPLICAS {#restart-replicas}

すべての `ReplicatedMergeTree` テーブルについて、Zookeeper セッションの状態を再初期化する機能を提供します。現在の状態を Zookeeper と比較し、必要に応じて Zookeeper キューにタスクを追加します。

### DROP FILESYSTEM CACHE {#drop-filesystem-cache}

ファイルシステムキャッシュを削除することを許可します。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYNC FILE CACHE {#sync-file-cache}

:::note
これは非常に重く、誤用の可能性があります。
:::

同期のシステムコールを行います。

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

[Refreshable Materialized Views](../../sql-reference/statements/create/view.md#refreshable-materialized-view) によって実行されるバックグラウンドタスクを制御するコマンド

使用中は [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md) に注意してください。

### REFRESH VIEW {#refresh-view}

指定されたビューの即時スケジュール外リフレッシュをトリガーします。

```sql
SYSTEM REFRESH VIEW [db.]name
```

### REFRESH VIEW {#refresh-view-1}

現在実行中のリフレッシュが完了するのを待ちます。リフレッシュが失敗した場合は例外をスローします。リフレッシュが実行中でない場合、すぐに完了し、前回のリフレッシュが失敗した場合は例外をスローします。

### STOP [REPLICATED] VIEW, STOP VIEWS {#stop-view-stop-views}

指定されたビューまたはすべてのリフレッシュ可能なビューの定期的なリフレッシュを無効にします。リフレッシュが進行中の場合は、それもキャンセルします。

ビューがレプリケートされたまたは共有データベースに存在する場合、`STOP VIEW` は現在のレプリカにのみ影響し、`STOP REPLICATED VIEW` はすべてのレプリカに影響します。

```sql
SYSTEM STOP VIEW [db.]name
```
```sql
SYSTEM STOP VIEWS
```

### START [REPLICATED] VIEW, START VIEWS {#start-view-start-views}

指定されたビューまたはすべてのリフレッシュ可能なビューの定期的なリフレッシュを有効にします。即時リフレッシュはトリガーされません。

ビューがレプリケートされたまたは共有データベースに存在する場合、`START VIEW` は `STOP VIEW` の効果を元に戻し、`START REPLICATED VIEW` は `STOP REPLICATED VIEW` の効果を元に戻します。

```sql
SYSTEM START VIEW [db.]name
```
```sql
SYSTEM START VIEWS
```

### CANCEL VIEW {#cancel-view}

指定されたビューに対して現在リフレッシュが進行中の場合、これを中断してキャンセルします。それ以外の場合は何もしません。

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

実行中のリフレッシュが完了するのを待ちます。リフレッシュが実行中でない場合、即座に戻ります。最新のリフレッシュ試行が失敗した場合は、エラーを報告します。

新しいリフレッシュ可能なマテリアライズドビューを作成した直後に使用し（EMPTY キーワードなしで）、初期リフレッシュが完了するのを待つことができます。

ビューがレプリケートされたまたは共有データベースに存在し、他のレプリカでリフレッシュが実行中である場合、他のレプリカでそのリフレッシュが完了するのを待ちます。

```sql
SYSTEM WAIT VIEW [db.]name
```
