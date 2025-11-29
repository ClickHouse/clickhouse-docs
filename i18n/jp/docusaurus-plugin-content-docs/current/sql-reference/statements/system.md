---
description: '「SYSTEM」ステートメントに関するドキュメント'
sidebar_label: 'SYSTEM'
sidebar_position: 36
slug: /sql-reference/statements/system
title: 'SYSTEM ステートメント'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# SYSTEM ステートメント {#system-statements}

## SYSTEM RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

すべての[内部辞書](../../sql-reference/dictionaries/index.md)を再読み込みします。
デフォルトでは、内部辞書は無効化されています。
内部辞書の更新結果に関わらず、常に`Ok.`を返します。

## SYSTEM RELOAD DICTIONARIES {#reload-dictionaries}

以前に正常にロードされたすべてのディクショナリを再ロードします。
デフォルトでは、ディクショナリは遅延ロードされます（[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)を参照）。そのため、起動時に自動的にロードされるのではなく、dictGet関数またはENGINE = DictionaryのテーブルからのSELECTを通じて最初にアクセスされた際に初期化されます。`SYSTEM RELOAD DICTIONARIES`クエリは、このようなディクショナリ（LOADED）を再ロードします。
ディクショナリの更新結果に関わらず、常に`Ok.`を返します。

**構文**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## SYSTEM RELOAD DICTIONARY {#reload-dictionary}

辞書の状態(LOADED / NOT_LOADED / FAILED)に関わらず、辞書`dictionary_name`を完全に再読み込みします。
辞書の更新結果に関わらず、常に`Ok.`を返します。

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

辞書のステータスは、`system.dictionaries`テーブルをクエリすることで確認できます。

```sql
SELECT name, status FROM system.dictionaries;
```

## SYSTEM RELOAD MODELS {#reload-models}

:::note
このステートメントと`SYSTEM RELOAD MODEL`は、clickhouse-library-bridgeからCatBoostモデルをアンロードするのみです。`catboostEvaluate()`関数は、モデルがまだロードされていない場合、初回アクセス時にロードします。
:::

すべてのCatBoostモデルをアンロードします。

**構文**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```

## SYSTEM RELOAD MODEL {#reload-model}

`model_path`で指定されたCatBoostモデルを再読み込みします。

**構文**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```

## SYSTEM RELOAD FUNCTIONS {#reload-functions}

設定ファイルから、登録されているすべての[実行可能ユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions)、またはそのいずれかを再読み込みします。

**構文**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## SYSTEM RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

すべての[非同期メトリクス](../../operations/system-tables/asynchronous_metrics.md)を再計算します。非同期メトリクスは[asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md)設定に基づいて定期的に更新されるため、通常このステートメントを使用して手動で更新する必要はありません。

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## SYSTEM DROP DNS CACHE {#drop-dns-cache}

ClickHouseの内部DNSキャッシュをクリアします。インフラストラクチャを変更する際（別のClickHouseサーバーや辞書で使用されるサーバーのIPアドレスを変更する場合など）、このコマンドの使用が必要になることがあります（古いClickHouseバージョンの場合）。

より便利な（自動的な）キャッシュ管理については、`disable_internal_dns_cache`、`dns_cache_max_entries`、`dns_cache_update_period`の各パラメータを参照してください。

## SYSTEM DROP MARK CACHE {#drop-mark-cache}

マークキャッシュをクリアします。

## SYSTEM DROP ICEBERG METADATA CACHE {#drop-iceberg-metadata-cache}

Icebergメタデータキャッシュをクリアします。

## SYSTEM DROP TEXT INDEX DICTIONARY CACHE {#drop-text-index-dictionary-cache}

テキストインデックスディクショナリキャッシュをクリアします。

## SYSTEM DROP TEXT INDEX HEADER CACHE {#drop-text-index-header-cache}

テキストインデックスヘッダーキャッシュをクリアします。

## SYSTEM DROP TEXT INDEX POSTINGS CACHE {#drop-text-index-postings-cache}

テキストインデックスのポスティングキャッシュをクリアします。


## SYSTEM DROP TEXT INDEX CACHES {#drop-text-index-caches}

テキストインデックスのヘッダーキャッシュ、ディクショナリキャッシュ、およびポスティングキャッシュをクリアします。


## SYSTEM DROP REPLICA {#drop-replica}

`ReplicatedMergeTree`テーブルの無効なレプリカは、以下の構文を使用して削除できます:

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

これらのクエリは、ZooKeeper内の`ReplicatedMergeTree`レプリカパスを削除します。レプリカが無効になっており、テーブルが既に存在しないために`DROP TABLE`でZooKeeperからメタデータを削除できない場合に有用です。非アクティブまたは古いレプリカのみを削除し、ローカルレプリカは削除できません。ローカルレプリカの削除には`DROP TABLE`を使用してください。`DROP REPLICA`はテーブルを削除せず、ディスクからデータやメタデータを削除しません。

1つ目は、`database.table`テーブルの`'replica_name'`レプリカのメタデータを削除します。
2つ目は、データベース内のすべてのレプリケートされたテーブルに対して同じ操作を実行します。
3つ目は、ローカルサーバー上のすべてのレプリケートされたテーブルに対して同じ操作を実行します。
4つ目は、テーブルの他のすべてのレプリカが削除された場合に、無効なレプリカのメタデータを削除するのに有用です。テーブルパスを明示的に指定する必要があります。これは、テーブル作成時に`ReplicatedMergeTree`エンジンの第1引数として渡されたパスと同じである必要があります。

## SYSTEM DROP DATABASE REPLICA {#drop-database-replica}

`Replicated`データベースの無効なレプリカは、以下の構文を使用して削除できます:

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

`SYSTEM DROP REPLICA`と同様ですが、`DROP DATABASE`を実行するデータベースが存在しない場合に、ZooKeeperから`Replicated`データベースのレプリカパスを削除します。なお、`ReplicatedMergeTree`レプリカは削除されないため、`SYSTEM DROP REPLICA`も併せて実行する必要がある場合があります。シャード名とレプリカ名は、データベース作成時に`Replicated`エンジンの引数として指定された名前です。また、これらの名前は`system.clusters`の`database_shard_name`列および`database_replica_name`列から取得できます。`FROM SHARD`句が省略されている場合、`replica_name`は`shard_name|replica_name`形式の完全なレプリカ名を指定する必要があります。

## SYSTEM DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

非圧縮データキャッシュをクリアします。
非圧縮データキャッシュの有効化/無効化は、クエリ/ユーザー/プロファイルレベルの設定[`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache)で行います。
キャッシュサイズは、サーバーレベルの設定[`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size)で設定できます。

## SYSTEM DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

コンパイル済み式キャッシュをクリアします。
コンパイル済み式キャッシュは、クエリ/ユーザー/プロファイルレベルの設定 [`compile_expressions`](../../operations/settings/settings.md#compile_expressions) によって有効化/無効化されます。

## SYSTEM DROP QUERY CONDITION CACHE {#drop-query-condition-cache}

クエリ条件キャッシュをクリアします。


## SYSTEM DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
```

[クエリキャッシュ](../../operations/query-cache.md)をクリアします。
タグを指定した場合、指定されたタグを持つクエリキャッシュエントリのみが削除されます。

## SYSTEM DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

[`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path)から読み込まれたスキーマのキャッシュをクリアします。

サポートされる対象:

- Protobuf: インポートされたProtobufメッセージ定義をメモリから削除します。
- Files: `format_schema_source`が`query`に設定されている場合に生成される、[`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path)にローカル保存されたキャッシュスキーマファイルを削除します。
  注: 対象が指定されていない場合、両方のキャッシュがクリアされます。

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf/Files]
```

## SYSTEM FLUSH LOGS {#flush-logs}

バッファされたログメッセージをシステムテーブル(例: system.query_log)にフラッシュします。ほとんどのシステムテーブルはデフォルトで7.5秒のフラッシュ間隔が設定されているため、主にデバッグ用途で有用です。
メッセージキューが空の場合でも、システムテーブルが作成されます。

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

すべてをフラッシュする必要がない場合は、ログ名またはターゲットテーブルを指定することで、1つ以上の個別のログをフラッシュできます:

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## SYSTEM RELOAD CONFIG {#reload-config}

ClickHouseの設定を再読み込みします。設定がZooKeeperに保存されている場合に使用します。なお、`SYSTEM RELOAD CONFIG`はZooKeeperに保存されている`USER`設定は再読み込みせず、`users.xml`に保存されている`USER`設定のみを再読み込みします。すべての`USER`設定を再読み込みするには、`SYSTEM RELOAD USERS`を使用してください。

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## SYSTEM RELOAD USERS {#reload-users}

users.xml、ローカルディスクアクセスストレージ、レプリケートされた（ZooKeeper内の）アクセスストレージを含む、すべてのアクセスストレージを再読み込みします。

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## SYSTEM SHUTDOWN {#shutdown}

<CloudNotSupportedBadge />

ClickHouseを正常にシャットダウンします（`service clickhouse-server stop` / `kill {$pid_clickhouse-server}` と同様の動作）

## SYSTEM KILL {#kill}

ClickHouseプロセスを強制終了します（`kill -9 {$ pid_clickhouse-server}`と同様）

## 分散テーブルの管理 {#managing-distributed-tables}

ClickHouseは[分散](../../engines/table-engines/special/distributed.md)テーブルを管理できます。ユーザーがこれらのテーブルにデータを挿入すると、ClickHouseはまずクラスタノードに送信すべきデータのキューを作成し、その後非同期で送信します。キュー処理は[`STOP DISTRIBUTED SENDS`](#stop-distributed-sends)、[FLUSH DISTRIBUTED](#flush-distributed)、および[`START DISTRIBUTED SENDS`](#start-distributed-sends)クエリで管理できます。また、[`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert)設定を使用して、分散データを同期的に挿入することもできます。

### SYSTEM STOP DISTRIBUTED SENDS {#stop-distributed-sends}

分散テーブルへのデータ挿入時にバックグラウンドでのデータ配信を無効にします。

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
[`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica)が有効な場合(デフォルト)、ローカルシャードへのデータは挿入されます。
:::

### SYSTEM FLUSH DISTRIBUTED {#flush-distributed}

ClickHouseにクラスタノードへのデータ送信を同期的に実行させます。いずれかのノードが利用できない場合、ClickHouseは例外をスローしてクエリの実行を停止します。すべてのノードがオンラインに戻ると成功するため、成功するまでクエリを再試行できます。

`SETTINGS`句を使用して一部の設定を上書きすることもできます。これは`max_concurrent_queries_for_all_users`や`max_memory_usage`などの一時的な制限を回避するのに役立ちます。

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
各保留中のブロックは、最初のINSERTクエリの設定でディスクに保存されるため、設定を上書きしたい場合があります。
:::

### SYSTEM START DISTRIBUTED SENDS {#start-distributed-sends}

分散テーブルへのデータ挿入時にバックグラウンドでのデータ配信を有効にします。

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### SYSTEM STOP LISTEN {#stop-listen}

ソケットを閉じ、指定されたポートと指定されたプロトコルでサーバーへの既存の接続を正常に終了します。

ただし、対応するプロトコル設定がclickhouse-server設定で指定されていない場合、このコマンドは効果がありません。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- `CUSTOM 'protocol'`修飾子が指定された場合、サーバー設定のプロトコルセクションで定義された指定名のカスタムプロトコルが停止されます。
- `QUERIES ALL [EXCEPT .. [,..]]`修飾子が指定された場合、`EXCEPT`句で指定されない限り、すべてのプロトコルが停止されます。
- `QUERIES DEFAULT [EXCEPT .. [,..]]`修飾子が指定された場合、`EXCEPT`句で指定されない限り、すべてのデフォルトプロトコルが停止されます。
- `QUERIES CUSTOM [EXCEPT .. [,..]]`修飾子が指定された場合、`EXCEPT`句で指定されない限り、すべてのカスタムプロトコルが停止されます。

### SYSTEM START LISTEN {#start-listen}

指定されたプロトコルで新しい接続の確立を許可します。

ただし、指定されたポートとプロトコルのサーバーがSYSTEM STOP LISTENコマンドを使用して停止されていない場合、このコマンドは効果がありません。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

## MergeTreeテーブルの管理 {#managing-mergetree-tables}

ClickHouseは[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルのバックグラウンドプロセスを管理できます。

### SYSTEM STOP MERGES {#stop-merges}

<CloudNotSupportedBadge />

MergeTreeファミリーのテーブルに対してバックグラウンドマージを停止する機能を提供します:

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
`DETACH / ATTACH`テーブルは、すべてのMergeTreeテーブルに対してマージが停止されていた場合でも、そのテーブルのバックグラウンドマージを開始します。
:::

### SYSTEM START MERGES {#start-merges}

<CloudNotSupportedBadge />

MergeTreeファミリーのテーブルに対してバックグラウンドマージを開始する機能を提供します:

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### SYSTEM STOP TTL MERGES {#stop-ttl-merges}

MergeTreeファミリーのテーブルに対して、[TTL式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)に従った古いデータのバックグラウンド削除を停止する機能を提供します:
テーブルが存在しない場合やテーブルがMergeTreeエンジンでない場合でも`Ok.`を返します。データベースが存在しない場合はエラーを返します:

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM START TTL MERGES {#start-ttl-merges}

MergeTreeファミリーのテーブルに対して、[TTL式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)に従った古いデータのバックグラウンド削除を開始する機能を提供します:
テーブルが存在しない場合でも`Ok.`を返します。データベースが存在しない場合はエラーを返します:

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM STOP MOVES {#stop-moves}

MergeTreeファミリーのテーブルに対して、[TO VOLUMEまたはTO DISK句を含むTTLテーブル式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)に従ったデータのバックグラウンド移動を停止する機能を提供します:
テーブルが存在しない場合でも`Ok.`を返します。データベースが存在しない場合はエラーを返します:

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM START MOVES {#start-moves}

MergeTreeファミリーのテーブルに対して、[TO VOLUMEおよびTO DISK句を含むTTLテーブル式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)に従ったデータのバックグラウンド移動を開始する機能を提供します:
テーブルが存在しない場合でも`Ok.`を返します。データベースが存在しない場合はエラーを返します:

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM SYSTEM UNFREEZE {#query_language-system-unfreeze}

すべてのディスクから指定された名前の凍結されたバックアップをクリアします。個別のパーツの凍結解除の詳細については、[ALTER TABLE table_name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition)を参照してください

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### SYSTEM WAIT LOADING PARTS {#wait-loading-parts}

テーブルの非同期でロード中のすべてのデータパーツ(古いデータパーツ)がロードされるまで待機します。

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## ReplicatedMergeTreeテーブルの管理 {#managing-replicatedmergetree-tables}

ClickHouseは[ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication)テーブルにおけるバックグラウンドレプリケーション関連プロセスを管理できます。

### SYSTEM STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge />

`ReplicatedMergeTree`ファミリーのテーブルにおいて、挿入されたパーツのバックグラウンドフェッチを停止します。
テーブルエンジンに関係なく、またテーブルやデータベースが存在しない場合でも、常に`Ok.`を返します。

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START FETCHES {#start-fetches}

<CloudNotSupportedBadge />

`ReplicatedMergeTree`ファミリーのテーブルにおいて、挿入されたパーツのバックグラウンドフェッチを開始します。
テーブルエンジンに関係なく、またテーブルやデータベースが存在しない場合でも、常に`Ok.`を返します。

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP REPLICATED SENDS {#stop-replicated-sends}

`ReplicatedMergeTree`ファミリーのテーブルにおいて、新しく挿入されたパーツをクラスタ内の他のレプリカへバックグラウンド送信することを停止します。

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START REPLICATED SENDS {#start-replicated-sends}

`ReplicatedMergeTree`ファミリーのテーブルにおいて、新しく挿入されたパーツをクラスタ内の他のレプリカへバックグラウンド送信することを開始します。

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP REPLICATION QUEUES {#stop-replication-queues}

`ReplicatedMergeTree`ファミリーのテーブルにおいて、Zookeeperに保存されているレプリケーションキューからのバックグラウンドフェッチタスクを停止します。可能なバックグラウンドタスクの種類は、マージ、フェッチ、ミューテーション、ON CLUSTER句を含むDDL文です。

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START REPLICATION QUEUES {#start-replication-queues}

`ReplicatedMergeTree`ファミリーのテーブルにおいて、Zookeeperに保存されているレプリケーションキューからのバックグラウンドフェッチタスクを開始します。可能なバックグラウンドタスクの種類は、マージ、フェッチ、ミューテーション、ON CLUSTER句を含むDDL文です。

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

`ReplicatedMergeTree`テーブルにおいて、レプリケーションログからレプリケーションキューへの新しいエントリの読み込みを停止します。

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START PULLING REPLICATION LOG {#start-pulling-replication-log}

`SYSTEM STOP PULLING REPLICATION LOG`をキャンセルします。

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM SYNC REPLICA {#sync-replica}

`ReplicatedMergeTree`テーブルがクラスタ内の他のレプリカと同期されるまで待機しますが、最大で`receive_timeout`秒までです。

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [IF EXISTS] [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

このステートメントを実行すると、`[db.]replicated_merge_tree_family_table_name`は共通のレプリケーションログからコマンドを自身のレプリケーションキューにフェッチし、その後クエリはレプリカがフェッチされたすべてのコマンドを処理するまで待機します。以下の修飾子がサポートされています。


- `IF EXISTS`を使用すると(25.6以降で利用可能)、テーブルが存在しない場合でもクエリはエラーをスローしません。これは、クラスタ設定の一部として既に含まれているが、まだテーブルの作成と同期の処理中である新しいレプリカをクラスタに追加する際に便利です。
- `STRICT`修飾子が指定された場合、クエリはレプリケーションキューが空になるまで待機します。レプリケーションキューに新しいエントリが絶えず追加される場合、`STRICT`バージョンは成功しない可能性があります。
- `LIGHTWEIGHT`修飾子が指定された場合、クエリは`GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE`、`DROP_PART`エントリの処理のみを待機します。
  さらに、LIGHTWEIGHT修飾子はオプションのFROM 'srcReplicas'句をサポートしており、'srcReplicas'はソースレプリカ名のカンマ区切りリストです。この拡張機能により、指定されたソースレプリカから発生するレプリケーションタスクのみに焦点を当てることで、より対象を絞った同期が可能になります。
- `PULL`修飾子が指定された場合、クエリはZooKeeperから新しいレプリケーションキューエントリを取得しますが、処理の完了を待機しません。

### SYNC DATABASE REPLICA {#sync-database-replica}

指定された[レプリケートデータベース](/engines/database-engines/replicated)が、そのデータベースのDDLキューからすべてのスキーマ変更を適用するまで待機します。

**構文**

```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### SYSTEM RESTART REPLICA {#restart-replica}

`ReplicatedMergeTree`テーブルのZooKeeperセッション状態を再初期化する機能を提供します。現在の状態を信頼できる情報源としてZooKeeperと比較し、必要に応じてZooKeeperキューにタスクを追加します。
ZooKeeperデータに基づくレプリケーションキューの初期化は、`ATTACH TABLE`ステートメントと同じ方法で行われます。短時間、テーブルはすべての操作に対して利用できなくなります。

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### SYSTEM RESTORE REPLICA {#restore-replica}

データが[おそらく]存在するがZooKeeperメタデータが失われた場合に、レプリカを復元します。

読み取り専用の`ReplicatedMergeTree`テーブルでのみ動作します。

次の場合にクエリを実行できます:

- ZooKeeperルート`/`の喪失。
- レプリカパス`/replicas`の喪失。
- 個別のレプリカパス`/replicas/replica_name/`の喪失。

レプリカはローカルで見つかったパートをアタッチし、それらに関する情報をZooKeeperに送信します。
メタデータ喪失前にレプリカに存在していたパートは、古くなっていない限り他のレプリカから再取得されません(したがって、レプリカの復元はネットワーク経由ですべてのデータを再ダウンロードすることを意味しません)。

:::note
すべての状態のパートは`detached/`フォルダに移動されます。データ喪失前にアクティブだった(コミット済みの)パートはアタッチされます。
:::

### SYSTEM RESTORE DATABASE REPLICA {#restore-database-replica}

データが[おそらく]存在するがZooKeeperメタデータが失われた場合に、レプリカを復元します。

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

-- zookeeper_delete_path("/clickhouse/repl_db", recursive=True) <- ルートの喪失。

SYSTEM RESTORE DATABASE REPLICA repl_db;
```

**構文**

```sql
SYSTEM RESTORE REPLICA [db.]replicated_merge_tree_family_table_name [ON CLUSTER cluster_name]
```

代替構文:

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**例**

複数のサーバーでテーブルを作成します。ZooKeeperのレプリカメタデータが失われた後、メタデータが欠落しているためテーブルは読み取り専用としてアタッチされます。最後のクエリはすべてのレプリカで実行する必要があります。

```sql
CREATE TABLE test(n UInt32)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/test/', '{replica}')
ORDER BY n PARTITION BY n % 10;

INSERT INTO test SELECT * FROM numbers(1000);

-- zookeeper_delete_path("/clickhouse/tables/test", recursive=True) <- ルートの喪失。

SYSTEM RESTART REPLICA test;
SYSTEM RESTORE REPLICA test;
```

別の方法:

```sql
SYSTEM RESTORE REPLICA test ON CLUSTER cluster;
```

### SYSTEM RESTART REPLICAS {#restart-replicas}

すべての`ReplicatedMergeTree`テーブルのZooKeeperセッション状態を再初期化する機能を提供します。現在の状態を信頼できる情報源としてZooKeeperと比較し、必要に応じてZooKeeperキューにタスクを追加します

### SYSTEM DROP FILESYSTEM CACHE {#drop-filesystem-cache}

ファイルシステムキャッシュを削除できます。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYSTEM SYNC FILE CACHE {#sync-file-cache}

:::note
この操作は負荷が高く、誤用される可能性があります。
:::

syncシステムコールを実行します。

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```

### SYSTEM LOAD PRIMARY KEY {#load-primary-key}

指定されたテーブルまたはすべてのテーブルのプライマリキーをロードします。

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```

### SYSTEM UNLOAD PRIMARY KEY {#unload-primary-key}

指定されたテーブルまたはすべてのテーブルのプライマリキーをアンロードします。

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```

## リフレッシュ可能なマテリアライズドビューの管理 {#refreshable-materialized-views}

[リフレッシュ可能なマテリアライズドビュー](../../sql-reference/statements/create/view.md#refreshable-materialized-view)によって実行されるバックグラウンドタスクを制御するコマンド

これらを使用する際は、[`system.view_refreshes`](../../operations/system-tables/view_refreshes.md)を監視してください。

### SYSTEM REFRESH VIEW {#refresh-view}

指定されたビューのスケジュール外の即時リフレッシュをトリガーします。

```sql
SYSTEM REFRESH VIEW [db.]name
```

### SYSTEM WAIT VIEW {#wait-view}

現在実行中のリフレッシュが完了するまで待機します。リフレッシュが失敗した場合は例外をスローします。リフレッシュが実行されていない場合は即座に完了し、前回のリフレッシュが失敗していた場合は例外をスローします。

### SYSTEM STOP [REPLICATED] VIEW, STOP VIEWS {#stop-view-stop-views}

指定されたビューまたはすべてのリフレッシュ可能なビューの定期的なリフレッシュを無効にします。リフレッシュが進行中の場合は、それもキャンセルします。

ビューがReplicatedまたはSharedデータベースにある場合、`STOP VIEW`は現在のレプリカのみに影響し、`STOP REPLICATED VIEW`はすべてのレプリカに影響します。

```sql
SYSTEM STOP VIEW [db.]name
```

```sql
SYSTEM STOP VIEWS
```

### SYSTEM START [REPLICATED] VIEW, START VIEWS {#start-view-start-views}

指定されたビューまたはすべてのリフレッシュ可能なビューの定期的なリフレッシュを有効にします。即時リフレッシュはトリガーされません。

ビューがReplicatedまたはSharedデータベースにある場合、`START VIEW`は`STOP VIEW`の効果を取り消し、`START REPLICATED VIEW`は`STOP REPLICATED VIEW`の効果を取り消します。

```sql
SYSTEM START VIEW [db.]name
```

```sql
SYSTEM START VIEWS
```

### SYSTEM CANCEL VIEW {#cancel-view}

現在のレプリカで指定されたビューのリフレッシュが進行中の場合、それを中断してキャンセルします。それ以外の場合は何もしません。

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

実行中のリフレッシュが完了するまで待機します。リフレッシュが実行されていない場合は即座に戻ります。最新のリフレッシュ試行が失敗した場合は、エラーを報告します。

新しいリフレッシュ可能なマテリアライズドビューを作成した直後(EMPTYキーワードなし)に使用して、初期リフレッシュが完了するまで待機できます。

ビューがReplicatedまたはSharedデータベースにあり、別のレプリカでリフレッシュが実行されている場合、そのリフレッシュが完了するまで待機します。

```sql
SYSTEM WAIT VIEW [db.]name
```
