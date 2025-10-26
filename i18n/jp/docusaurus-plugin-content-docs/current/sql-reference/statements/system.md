---
'description': 'SYSTEM ステートメントに関するドキュメント'
'sidebar_label': 'SYSTEM'
'sidebar_position': 36
'slug': '/sql-reference/statements/system'
'title': 'SYSTEM ステートメント'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SYSTEMステートメント

## SYSTEM RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

すべての [内部辞書](../../sql-reference/dictionaries/index.md) を再読み込みします。  
デフォルトでは、内部辞書は無効になっています。  
内部辞書の更新結果に関係なく、常に `Ok.` を返します。

## SYSTEM RELOAD DICTIONARIES {#reload-dictionaries}

以前に正常に読み込まれたすべての辞書を再読み込みします。  
デフォルトでは、辞書は遅延的に読み込まれます（[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load) を参照）。そのため、起動時に自動的に読み込まれるのではなく、dictGet関数を介して最初のアクセス時またはENGINE = Dictionaryを持つテーブルからのSELECTによって初期化されます。  
`SYSTEM RELOAD DICTIONARIES` クエリは、そのような辞書を再読み込みします（LOADED）。  
辞書の更新結果に関係なく、常に `Ok.` を返します。

**構文**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## SYSTEM RELOAD DICTIONARY {#reload-dictionary}

辞書 `dictionary_name` を完全に再読み込みします。辞書の状態（LOADED / NOT_LOADED / FAILED）に関係なく再読み込みされます。  
辞書の更新結果に関係なく、常に `Ok.` を返します。

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

辞書の状態は、 `system.dictionaries` テーブルをクエリすることによってチェックできます。

```sql
SELECT name, status FROM system.dictionaries;
```

## SYSTEM RELOAD MODELS {#reload-models}

:::note  
このステートメントと `SYSTEM RELOAD MODEL` は、clickhouse-library-bridgeからcatboostモデルをアンロードするだけです。  
`catboostEvaluate()` 関数は、モデルがまだ読み込まれていない場合に最初のアクセス時にモデルを読み込みます。  
:::

すべてのCatBoostモデルをアンロードします。

**構文**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```

## SYSTEM RELOAD MODEL {#reload-model}

`model_path` にあるCatBoostモデルをアンロードします。

**構文**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```

## SYSTEM RELOAD FUNCTIONS {#reload-functions}

すべての登録済みの [実行可能ユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions) またはそれのいずれかを設定ファイルから再読み込みします。

**構文**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## SYSTEM RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

すべての [非同期メトリクス](../../operations/system-tables/asynchronous_metrics.md) を再計算します。  
非同期メトリクスは、設定 [asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md) に基づいて定期的に更新されるため、このステートメントを使用して手動で更新する必要は通常ありません。

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## SYSTEM DROP DNS CACHE {#drop-dns-cache}

ClickHouseの内部DNSキャッシュをクリアします。  
インフラを変更する際（別のClickHouseサーバのIPアドレスを変更するなど、または辞書が使用しているサーバ）に、このコマンドを使用する必要がある場合があります（古いClickHouseバージョンでは特に）。

便利な（自動的な）キャッシュ管理については、`disable_internal_dns_cache`、`dns_cache_max_entries`、`dns_cache_update_period` パラメータを参照してください。

## SYSTEM DROP MARK CACHE {#drop-mark-cache}

マークキャッシュをクリアします。

## SYSTEM DROP ICEBERG METADATA CACHE {#drop-iceberg-metadata-cache}

アイスバーグメタデータキャッシュをクリアします。

## SYSTEM DROP REPLICA {#drop-replica}

失敗した `ReplicatedMergeTree` テーブルのレプリカは、次の構文を使用して削除できます：

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

クエリは、ZooKeeper内の `ReplicatedMergeTree` レプリカパスを削除します。  
レプリカが死んでいる場合や、そのメタデータが `DROP TABLE` によってZooKeeperから削除できない場合に便利です。この場合、`DROP REPLICA` はアクティブでない/古くなったレプリカのみを削除し、ローカルレプリカは削除できません。そのためには、`DROP TABLE` を使用してください。`DROP REPLICA` はテーブルを削除せず、ディスクからデータやメタデータを削除することはありません。

最初のクエリは、`database.table` テーブルの `'replica_name'` レプリカのメタデータを削除します。  
2つ目は、データベース内のすべてのレプリケートテーブルに対して同じことを行います。  
3つ目は、ローカルサーバ上のすべてのレプリカテーブルに対して同じことを行います。  
4つ目は、テーブルのすべての他のレプリカが削除されたときに死んだレプリカのメタデータを削除するために便利です。この場合、テーブルのパスを明示的に指定する必要があります。これは、テーブル作成時に `ReplicatedMergeTree` エンジンの最初の引数として渡されたのと同じパスでなければなりません。

## SYSTEM DROP DATABASE REPLICA {#drop-database-replica}

失敗した `Replicated` データベースのレプリカは、次の構文を使用して削除できます：

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

`SYSTEM DROP REPLICA` と似ていますが、`DROP DATABASE` を実行するデータベースがない場合、ZooKeeperから `Replicated` データベースレプリカパスを削除します。  
`ReplicatedMergeTree` レプリカは削除しないため（したがって、`SYSTEM DROP REPLICA` が必要になることがあります）、作成時に指定されたレプリカ名やシャード名は `Replicated` エンジン引数で使用されます。  
また、これらの名前は `system.clusters` の `database_shard_name` および `database_replica_name` カラムから取得できます。  
`FROM SHARD` 句がない場合、`replica_name` は `shard_name|replica_name` フォーマットのフルレプリカ名でなければなりません。

## SYSTEM DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

非圧縮データキャッシュをクリアします。  
非圧縮データキャッシュは、クエリ/ユーザー/プロファイルレベルの設定 [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache) で有効/無効になります。  
そのサイズは、サーバーレベル設定 [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size) を使用して構成できます。

## SYSTEM DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

コンパイル済み式キャッシュをクリアします。  
コンパイル済み式キャッシュは、クエリ/ユーザー/プロファイルレベル設定 [`compile_expressions`](../../operations/settings/settings.md#compile_expressions) で有効/無効になります。

## SYSTEM DROP QUERY CONDITION CACHE {#drop-query-condition-cache}

クエリ条件キャッシュをクリアします。

## SYSTEM DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
````

Clears the [query cache](../../operations/query-cache.md).
If a tag is specified, only query cache entries with the specified tag are deleted.

## SYSTEM DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

Clears cache for schemas loaded from [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path).

Supported targets:
- Protobuf: Removes imported Protobuf message definitions from memory.
- Files: Deletes cached schema files stored locally in the [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path), generated when `format_schema_source` is set to `query`.
Note: If no target is specified, both caches are cleared.

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf/Files]
```

## SYSTEM FLUSH LOGS {#flush-logs}

バッファされたログメッセージをシステムテーブルにフラッシュします。例：system.query_log。  
主にデバッグ作業に役立ちます。ほとんどのシステムテーブルのデフォルトのフラッシュ間隔は7.5秒です。  
メッセージキューが空であっても、システムテーブルが作成されます。

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

すべてをフラッシュしたくない場合は、名前またはターゲットテーブルのいずれかを渡すことによって、1つまたは複数の個別のログをフラッシュできます：

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## SYSTEM RELOAD CONFIG {#reload-config}

ClickHouseの設定を再読み込みします。ZooKeeperに設定が保存されている場合に使用されます。  
`SYSTEM RELOAD CONFIG` は、ZooKeeperに保存されている `USER` 設定を再読み込みしないことに注意してください。`users.xml` に保存されている `USER` 設定のみを再読み込みします。  
すべての `USER` 設定を再読み込みするには、`SYSTEM RELOAD USERS` を使用します。

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## SYSTEM RELOAD USERS {#reload-users}

すべてのアクセスストレージを再読み込みします。これには：users.xml、ローカルディスクアクセスストレージ、レプリケート（ZooKeeperに保存）されたアクセスストレージが含まれます。

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## SYSTEM SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

通常、ClickHouseをシャットダウンします（`service clickhouse-server stop` / `kill {$pid_clickhouse-server}` のように）

## SYSTEM KILL {#kill}

ClickHouseプロセスを中断します（`kill -9 {$ pid_clickhouse-server}` のように）

## 分散テーブルの管理 {#managing-distributed-tables}

ClickHouseは [分散](../../engines/table-engines/special/distributed.md) テーブルを管理可能です。  
ユーザーがこれらのテーブルにデータを挿入すると、ClickHouseはまずクラスターノードに送信すべきデータのキューを作成し、その後非同期的に送信します。  
キュー処理は [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends)、[FLUSH DISTRIBUTED](#flush-distributed)、および [`START DISTRIBUTED SENDS`](#start-distributed-sends) クエリで管理できます。  
また、[`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert) 設定を使用して分散データを同期的に挿入することもできます。

### SYSTEM STOP DISTRIBUTED SENDS {#stop-distributed-sends}

分散テーブルにデータを挿入する際のバックグラウンドデータ配信を無効にします。

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note  
[`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica) が有効（デフォルト）である場合、ローカルシャードにデータが挿入されます。  
:::

### SYSTEM FLUSH DISTRIBUTED {#flush-distributed}

ClickHouseにクラスターノードにデータを同期的に送信させます。  
ノードが利用できない場合、ClickHouseは例外をスローし、クエリの実行を停止します。  
すべてのノードがオンラインに戻るまでクエリを再試行できます。

`SETTINGS` 句を介していくつかの設定を上書きすることも可能です。これは、`max_concurrent_queries_for_all_users` や `max_memory_usage` のような一時的な制限を回避するのに役立ちます。

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note  
各保留中のブロックは、初期INSERTクエリの設定でディスクに保存されているため、そのため時々設定を上書きしたくなることがあります。  
:::

### SYSTEM START DISTRIBUTED SENDS {#start-distributed-sends}

分散テーブルにデータを挿入する際のバックグラウンドデータ配信を有効にします。

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### SYSTEM STOP LISTEN {#stop-listen}

指定されたポートと指定されたプロトコルでのサーバへの既存の接続を優雅に終了し、ソケットを閉じます。

ただし、clickhouse-server設定で対応するプロトコル設定が指定されていない場合、このコマンドは効果がありません。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- `CUSTOM 'protocol'` 修飾子が指定された場合、サーバ設定のプロトコルセクションで指定された名前のカスタムプロトコルが停止します。  
- `QUERIES ALL [EXCEPT .. [,..]]` 修飾子が指定された場合、`EXCEPT` 句で指定されていない限り、すべてのプロトコルが停止します。  
- `QUERIES DEFAULT [EXCEPT .. [,..]]` 修飾子が指定された場合、`EXCEPT` 句で指定されていない限り、すべてのデフォルトプロトコルが停止します。  
- `QUERIES CUSTOM [EXCEPT .. [,..]]` 修飾子が指定された場合、`EXCEPT` 句で指定されていない限り、すべてのカスタムプロトコルが停止します。

### SYSTEM START LISTEN {#start-listen}

指定されたプロトコルで新しい接続を確立できるようにします。

ただし、指定されたポートおよびプロトコルのサーバが `SYSTEM STOP LISTEN` コマンドを使用して停止されていない場合、このコマンドは効果がありません。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

## MergeTreeテーブルの管理 {#managing-mergetree-tables}

ClickHouseは [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルのバックグラウンドプロセスを管理できます。

### SYSTEM STOP MERGES {#stop-merges}

<CloudNotSupportedBadge/>

MergeTreeファミリーのテーブルに対するバックグラウンドマージを停止する機能を提供します：

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note  
`DETACH / ATTACH` テーブルは、すべてのMergeTreeテーブルのマージが停止されている場合でもマージを開始します。  
:::

### SYSTEM START MERGES {#start-merges}

<CloudNotSupportedBadge/>

MergeTreeファミリーのテーブルに対するバックグラウンドマージを開始する機能を提供します：

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### SYSTEM STOP TTL MERGES {#stop-ttl-merges}

[TTL式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) に従って古いデータを削除するためのバックグラウンドプロセスを停止する機能を提供します。  
テーブルが存在しない場合や、MergeTreeエンジンがない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM START TTL MERGES {#start-ttl-merges}

[TTL式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) に従って古いデータを削除するためのバックグラウンドプロセスを開始する機能を提供します。  
テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM STOP MOVES {#stop-moves}

[TTLテーブル式のTO VOLUMEまたはTO DISK句](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) に従ってデータを移動するためのバックグラウンドプロセスを停止する機能を提供します。  
テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM START MOVES {#start-moves}

[TTLテーブル式のTO VOLUMEおよびTO DISK句](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) に従ってデータを移動するためのバックグラウンドプロセスを開始する機能を提供します。  
テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM SYSTEM UNFREEZE {#query_language-system-unfreeze}

指定された名前の凍結されたバックアップをすべてのディスクからクリアします。  
[ALTER TABLE table_name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition) での個別パーツの凍結解除については、詳細を参照してください。

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### SYSTEM WAIT LOADING PARTS {#wait-loading-parts}

テーブルの非同期で読み込まれているデータパーツ（古いデータパーツ）がすべて読み込まれるまで待機します。

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## ReplicatedMergeTreeテーブルの管理 {#managing-replicatedmergetree-tables}

ClickHouseは [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) テーブルにおけるバックグラウンドレプリケーション関連プロセスを管理できます。

### SYSTEM STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge/>

`ReplicatedMergeTree` ファミリーのテーブルに対して挿入されたパーツのバックグラウンド取得を停止する機能を提供します。  
テーブルエンジンに関係なく、テーブルまたはデータベースが存在しない場合でも常に `Ok.` を返します。

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START FETCHES {#start-fetches}

<CloudNotSupportedBadge/>

`ReplicatedMergeTree` ファミリーのテーブルに対して挿入されたパーツのバックグラウンド取得を開始する機能を提供します。  
テーブルエンジンに関係なく、テーブルまたはデータベースが存在しない場合でも常に `Ok.` を返します。

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP REPLICATED SENDS {#stop-replicated-sends}

クラスタ内の他のレプリカへの新しく挿入されたパーツのバックグラウンド送信を停止する機能を提供します（`ReplicatedMergeTree` ファミリーのテーブル用）：

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START REPLICATED SENDS {#start-replicated-sends}

クラスタ内の他のレプリカへの新しく挿入されたパーツのバックグラウンド送信を開始する機能を提供します（`ReplicatedMergeTree` ファミリーのテーブル用）：

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP REPLICATION QUEUES {#stop-replication-queues}

ZooKeeperに保存されているレプリケーションキューからバックグラウンドでフェッチタスクを停止する機能を提供します。  
可能なバックグラウンドタスクタイプ：マージ、フェッチ、ミューテーション、AS CLUSTER句付きDDL文。

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START REPLICATION QUEUES {#start-replication-queues}

ZooKeeperに保存されているレプリケーションキューからバックグラウンドでフェッチタスクを開始する機能を提供します。  
可能なバックグラウンドタスクタイプ：マージ、フェッチ、ミューテーション、AS CLUSTER句付きDDL文。

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

`ReplicatedMergeTree` テーブルへのレプリケーションログから新しいエントリの読み込みを停止します。

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START PULLING REPLICATION LOG {#start-pulling-replication-log}

`SYSTEM STOP PULLING REPLICATION LOG` をキャンセルします。

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM SYNC REPLICA {#sync-replica}

`ReplicatedMergeTree` テーブルがクラスタ内の他のレプリカと同期されるまで待機しますが、`receive_timeout` 秒を超えてはなりません。

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [IF EXISTS] [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

このステートメントを実行した後、`[db.]replicated_merge_tree_family_table_name` は共通のレプリケーションログからコマンドをフェッチし、その後クエリはレプリカがフェッチしたすべてのコマンドを処理するまで待機します。  
次の修飾子がサポートされています。

- `IF EXISTS`（25.6以降利用可能）を指定した場合、テーブルが存在しない場合にエラーをスローしません。これは、クラスタに新しいレプリカを追加する場合に便利です。このレプリカはすでにクラスタ設定の一部ですが、テーブルの作成と同期のプロセスがまだ進行中です。  
- `STRICT` 修飾子を指定した場合、レプリケーションキューが空になるまで待機します。`STRICT` バージョンは、レプリケーションキューに新しいエントリが常に表示されている場合には成功しない可能性があります。  
- `LIGHTWEIGHT` 修飾子を指定した場合、レプリケーションキューが `GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE`、`DROP_PART` のエントリを処理されるのを待つだけです。  
  さらに、LIGHTWEIGHT修飾子は、オプションの FROM 'srcReplicas' 句をサポートします。ここで 'srcReplicas' は、カンマで区切ったソースレプリカ名のリストです。この拡張機能は、指定されたソースレプリカからのレプリケーションタスクのみに焦点を当てたよりターゲットを絞った同期を可能にします。  
- `PULL` 修飾子を指定した場合、新しいレプリケーションキューエントリをZooKeeperから引き出しますが、何が処理されるのを待ちません。

### SYNC DATABASE REPLICA {#sync-database-replica}

指定された [レプリケートデータベース](/engines/database-engines/replicated) が、そのデータベースのDDLキューからすべてのスキーマ変更を適用するまで待機します。

**構文**  
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### SYSTEM RESTART REPLICA {#restart-replica}

`ReplicatedMergeTree` テーブルのZooKeeperセッションの状態を再初期化する機能を提供します。必要に応じて現在の状態をZooKeeperに照らして比較し、ZooKeeperキューにタスクを追加します。  
ZooKeeperのデータに基づいてレプリケーションキューの初期化は、`ATTACH TABLE` ステートメントと同様の方法で行われます。  
短時間ですが、テーブルは操作を行うことができません。

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### SYSTEM RESTORE REPLICA {#restore-replica}

データが[存在する可能性]あるがZooKeeperメタデータが失われた場合にレプリカを復元します。  
読み取り専用の`ReplicatedMergeTree` テーブルでのみ動作します。

以下の何れかが発生した後にクエリを実行できます：

- ZooKeeperルート `/` の損失。  
- レプリカパス `/replicas` の損失。  
- 個々のレプリカパス `/replicas/replica_name/` の損失。  

レプリカは、ローカルで見つかったパーツを添付し、それについての情報をZooKeeperに送信します。  
メタデータ喪失前にレプリカで存在したパーツは、古くなっていない場合に限り他のものから再取得されません（したがって、レプリカの復元はネットワークを介してすべてのデータを再ダウンロードすることを意味しません）。

:::note  
すべての状態のパーツは `detached/` フォルダに移動されます。データ損失前にアクティブだったパーツは添付されます。  
:::

### SYSTEM RESTORE DATABASE REPLICA {#restore-database-replica}

データが[存在する可能性]あるがZooKeeperメタデータが失われた場合にレプリカを復元します。

**構文**

```sql
SYSTEM RESTORE DATABASE REPLICA repl_db [ON CLUSTER cluster]
```

**例**

```sql
CREATE DATABASE repl_db 
ENGINE=Replicated("/clickhouse/repl_db", shard1, replica1);

CREATE TABLE repl_db.test_table (n UInt32)
ENGINE = ReplicatedMergeTree
ORDER BY n PARTITION BY n % 10;

-- zookeeper_delete_path("/clickhouse/repl_db", recursive=True) <- root loss.

SYSTEM RESTORE DATABASE REPLICA repl_db;
```

**構文**

```sql
SYSTEM RESTORE REPLICA [db.]replicated_merge_tree_family_table_name [ON CLUSTER cluster_name]
```

代替構文：

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**例**

複数のサーバーでテーブルを作成します。ZooKeeperにおけるレプリカのメタデータが失われた後、テーブルはメタデータが欠如しているため、読み取り専用として添付されます。最後のクエリはすべてのレプリカで実行する必要があります。

```sql
CREATE TABLE test(n UInt32)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/test/', '{replica}')
ORDER BY n PARTITION BY n % 10;

INSERT INTO test SELECT * FROM numbers(1000);

-- zookeeper_delete_path("/clickhouse/tables/test", recursive=True) <- root loss.

SYSTEM RESTART REPLICA test;
SYSTEM RESTORE REPLICA test;
```

もう一つの方法：

```sql
SYSTEM RESTORE REPLICA test ON CLUSTER cluster;
```

### SYSTEM RESTART REPLICAS {#restart-replicas}

すべての `ReplicatedMergeTree` テーブルのZooKeeperセッションの状態を再初期化する機能を提供します。現在の状態をZooKeeperに照らして比較し、必要に応じてZooKeeperキューにタスクを追加します。

### SYSTEM DROP FILESYSTEM CACHE {#drop-filesystem-cache}

ファイルシステムキャッシュを削除することを許可します。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYSTEM SYNC FILE CACHE {#sync-file-cache}

:::note  
非常に重く、誤用の可能性があります。  
:::

sync syscallを実行します。

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```

### SYSTEM LOAD PRIMARY KEY {#load-primary-key}

指定されたテーブルまたはすべてのテーブルの主キーを読み込みます。

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```

### SYSTEM UNLOAD PRIMARY KEY {#unload-primary-key}

指定されたテーブルまたはすべてのテーブルの主キーをアンロードします。

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```

## リフレッシュ可能なマテリアライズドビューの管理 {#refreshable-materialized-views}

[リフレッシュ可能なマテリアライズドビュー](../../sql-reference/statements/create/view.md#refreshable-materialized-view) によって実行されるバックグラウンドタスクを制御するためのコマンドです。

使用中は [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md) に注意してください。

### SYSTEM REFRESH VIEW {#refresh-view}

指定されたビューの即時リフレッシュをトリガーします。

```sql
SYSTEM REFRESH VIEW [db.]name
```

### SYSTEM WAIT VIEW {#wait-view}

現在実行中のリフレッシュが完了するまで待機します。リフレッシュが失敗した場合、例外をスローします。  
リフレッシュが実行されていない場合、即座に完了し、前回のリフレッシュが失敗した場合には例外をスローします。

### SYSTEM STOP [REPLICATED] VIEW, STOP VIEWS {#stop-view-stop-views}

指定されたビューまたはすべてのリフレッシュ可能なビューの周期的なリフレッシュを無効にします。  
リフレッシュが進行中の場合、それもキャンセルします。

ビューがレプリケートまたは共有データベースにある場合、`STOP VIEW` は現在のレプリカにのみ影響し、`STOP REPLICATED VIEW` はすべてのレプリカに影響します。

```sql
SYSTEM STOP VIEW [db.]name
```
```sql
SYSTEM STOP VIEWS
```

### SYSTEM START [REPLICATED] VIEW, START VIEWS {#start-view-start-views}

指定されたビューまたはすべてのリフレッシュ可能なビューの周期的なリフレッシュを有効にします。  
即時リフレッシュはトリガーされません。

ビューがレプリケートまたは共有データベースにある場合、`START VIEW` は `STOP VIEW` の効果を取り消し、`START REPLICATED VIEW` は `STOP REPLICATED VIEW` の効果を取り消します。

```sql
SYSTEM START VIEW [db.]name
```
```sql
SYSTEM START VIEWS
```

### SYSTEM CANCEL VIEW {#cancel-view}

指定されたビューのリフレッシュが現在のレプリカで進行中の場合、それを中断してキャンセルします。  
そうでなければ何もしません。

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

実行中のリフレッシュが完了するまで待機します。リフレッシュが実行されていない場合、すぐに戻ります。最新のリフレッシュ試行が失敗した場合、エラーを報告します。

新しいリフレッシュ可能なマテリアライズドビューを作成した後（EMPTYキーワードなしで）初期リフレッシュが完了するまで待機するために使用できます。

ビューがレプリケートまたは共有データベースにあり、リフレッシュが他のレプリカで実行中の場合、そのリフレッシュが完了するまで待機します。

```sql
SYSTEM WAIT VIEW [db.]name
```
