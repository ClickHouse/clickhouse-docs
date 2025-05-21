---
description: 'SYSTEM 文のドキュメント'
sidebar_label: 'SYSTEM'
sidebar_position: 36
slug: /sql-reference/statements/system
title: 'SYSTEM 文'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# SYSTEM 文

## RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

すべての [内部辞書](../../sql-reference/dictionaries/index.md) を再読み込みします。
デフォルトでは、内部辞書は無効になっています。
内部辞書の更新結果にかかわらず、常に `Ok.` を返します。

## RELOAD DICTIONARIES {#reload-dictionaries}

以前に正常に読み込まれたすべての辞書を再読み込みします。
デフォルトでは、辞書は遅延でロードされます（[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)を参照）。そのため、自動的に起動時にロードされるのではなく、dictGet 関数または ENGINE = Dictionary のテーブルからの最初のアクセス時に初期化されます。`SYSTEM RELOAD DICTIONARIES` クエリは、そのような辞書（LOADED）を再読み込みします。
辞書の更新結果にかかわらず、常に `Ok.` を返します。

**構文**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## RELOAD DICTIONARY {#reload-dictionary}

辞書 `dictionary_name` を完全に再読み込みします。辞書の状態（LOADED / NOT_LOADED / FAILED）にかかわらず再読み込みが行われます。
辞書の更新結果にかかわらず、常に `Ok.` を返します。

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

辞書の状態は `system.dictionaries` テーブルをクエリすることで確認できます。

```sql
SELECT name, status FROM system.dictionaries;
```

## RELOAD MODELS {#reload-models}

:::note
このステートメントおよび `SYSTEM RELOAD MODEL` は、clickhouse-library-bridge から catboost モデルをアンロードするだけです。`catboostEvaluate()` 関数は、モデルがまだロードされていない場合、最初のアクセス時にモデルをロードします。
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

すべての登録された [ユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions) を再読み込みします。

**構文**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

すべての [非同期メトリクス](../../operations/system-tables/asynchronous_metrics.md) を再計算します。非同期メトリクスは、設定 [asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md) に基づいて定期的に更新されるため、このステートメントを使って手動で更新する必要は通常ありません。

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## DROP DNS CACHE {#drop-dns-cache}

ClickHouse の内部 DNS キャッシュをクリアします。時々（古い ClickHouse バージョンでは）、インフラストラクチャを変更するときにこのコマンドを使用する必要があります（他の ClickHouse サーバーの IP アドレスを変更する場合など）。

より便利な（自動的な）キャッシュ管理については、disable_internal_dns_cache、dns_cache_max_entries、dns_cache_update_period パラメーターを参照してください。

## DROP MARK CACHE {#drop-mark-cache}

マークキャッシュをクリアします。

## DROP ICEBERG METADATA CACHE {#drop-iceberg-metadata-cache}

アイスバーグメタデータキャッシュをクリアします。

## DROP REPLICA {#drop-replica}

`ReplicatedMergeTree` テーブルの死んだレプリカは、以下の構文で削除できます：

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

クエリは、ZooKeeper の `ReplicatedMergeTree` レプリカパスを削除します。これは、レプリカが死んでいて、そのメタデータを `DROP TABLE` によって ZooKeeper から削除できない場合に便利です。それは、非アクティブ/過去のレプリカだけを削除し、ローカルレプリカは削除できませんので、`DROP TABLE` を使用してください。`DROP REPLICA` は、テーブルを削除せず、ディスクからデータやメタデータを削除しません。

最初のクエリは、`database.table` テーブルの `'replica_name'` レプリカのメタデータを削除します。
2番目は、データベース内のすべてのレプリケーションテーブルに対して同様の操作を行います。
3番目は、ローカルサーバー上のすべてのレプリケーションテーブルに対して同様の操作を行います。
4番目は、すべての他のレプリカがテーブルから削除されたときに死んだレプリカのメタデータを削除するのに便利です。それはテーブルの作成時に `ReplicatedMergeTree` エンジンの最初の引数に渡されたのと同じパスで指定する必要があります。

## DROP DATABASE REPLICA {#drop-database-replica}

死んだ `Replicated` データベースのレプリカは、以下の構文で削除できます：

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

`SYSTEM DROP REPLICA` と似ていますが、`DROP DATABASE` を実行するデータベースがないときに ZooKeeper から `Replicated` データベースレプリカパスを削除します。`ReplicatedMergeTree` のレプリカを削除しないことに注意してください（そのため、`SYSTEM DROP REPLICA` が必要です）。シャードとレプリカの名前は、データベースを作成する際に `Replicated` エンジン引数で指定された名前です。また、これらの名前は `system.clusters` の `database_shard_name` と `database_replica_name` 列から取得できます。`FROM SHARD` 句が欠けている場合、`replica_name` は `shard_name|replica_name` 形式の完全なレプリカ名である必要があります。

## DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

解凍されたデータキャッシュをクリアします。
解凍されたデータキャッシュは、クエリ/ユーザー/プロファイルレベルの設定 [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache) で有効/無効にされます。
そのサイズはサーバーレベルの設定 [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size) で構成できます。

## DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

コンパイルされた式キャッシュをクリアします。
コンパイルされた式キャッシュは、クエリ/ユーザー/プロファイルレベルの設定 [`compile_expressions`](../../operations/settings/settings.md#compile_expressions) で有効/無効にされます。

## DROP QUERY CONDITION CACHE {#drop-query-condition-cache}

クエリ条件キャッシュをクリアします。

## DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
```

[クエリキャッシュ](../../operations/query-cache.md)をクリアします。
タグが指定されている場合、指定されたタグを持つクエリキャッシュエントリのみが削除されます。

## DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

[`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path) から読み込まれたスキーマのキャッシュをクリアします。

サポートされているフォーマット：
- Protobuf

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]
```

## FLUSH LOGS {#flush-logs}

バッファされたログメッセージをシステムテーブル（例：system.query_log）にフラッシュします。主にデバッグに役立ちます。ほとんどのシステムテーブルは、デフォルトのフラッシュ間隔が 7.5 秒です。
これにより、メッセージキューが空であってもシステムテーブルが作成されます。

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

すべてをフラッシュしたくない場合は、それぞれの名前またはターゲットテーブルを渡すことで、1 つまたは複数の個々のログをフラッシュできます：

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## RELOAD CONFIG {#reload-config}

ClickHouse 設定を再読み込みします。設定が ZooKeeper に保存されているときに使用されます。`SYSTEM RELOAD CONFIG` は、ZooKeeper に保存された `USER`設定を再読み込みしません。`users.xml` に保存されている `USER` 設定のみを再読み込みします。すべての `USER` 設定を再読み込みするには、`SYSTEM RELOAD USERS` を使用します。

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## RELOAD USERS {#reload-users}

すべてのアクセスストレージ（users.xml、ローカルディスクアクセスストレージ、レプリケート（ZooKeeper 内）アクセスストレージ）を再読み込みします。

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

通常、ClickHouse をシャットダウンします（`service clickhouse-server stop` / `kill {$pid_clickhouse-server}` のように）。

## KILL {#kill}

ClickHouse プロセスを中止します（`kill -9 {$ pid_clickhouse-server}` のように）。

## Distributed Tables の管理 {#managing-distributed-tables}

ClickHouse は [分散](../../engines/table-engines/special/distributed.md) テーブルを管理できます。ユーザーがこれらのテーブルにデータを挿入すると、ClickHouse はまずクラスタノードに送信するデータのキューを作成し、その後非同期に送信します。`STOP DISTRIBUTED SENDS` （#stop-distributed-sends）、`FLUSH DISTRIBUTED` （#flush-distributed）および `START DISTRIBUTED SENDS` （#start-distributed-sends）クエリを使用して、キュー処理を管理できます。また、[`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert) 設定を使用して、分散データを同期的に挿入することもできます。

### STOP DISTRIBUTED SENDS {#stop-distributed-sends}

分散テーブルへのデータ挿入時にバックグラウンド データ配信を無効にします。

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
[`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica) が有効な場合（デフォルト）、データはローカルシャードに挿入されます。
:::

### FLUSH DISTRIBUTED {#flush-distributed}

ClickHouse に対してクラスタノードにデータを同期的に送信するよう強制します。ノードが利用できない場合、ClickHouse は例外をスローし、クエリの実行を停止します。クエリが成功するまで再試行でき、その成功はすべてのノードがオンラインに戻ったときに発生します。

`SETTINGS` 句を通じて一部の設定をオーバーライドすることもできます。これは `max_concurrent_queries_for_all_users` や `max_memory_usage` のような一時的な制限を回避するために便利です。

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
保留中の各ブロックは、最初の INSERT クエリの設定とともにディスクに保存されますので、場合によっては設定のオーバーライドが必要になります。
:::

### START DISTRIBUTED SENDS {#start-distributed-sends}

分散テーブルへのデータ挿入時にバックグラウンドデータ配信を有効にします。

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### STOP LISTEN {#stop-listen}

ソケットを閉じ、指定されたポートおよび指定されたプロトコルの既存の接続を正常に終了します。

ただし、対応するプロトコルの設定が clickhouse-server 設定に指定されていない場合、このコマンドは効果を持ちません。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- `CUSTOM 'protocol'` 修飾子が指定されている場合、サーバー設定のプロトコルセクションで定義された指定された名前のカスタムプロトコルが停止します。
- `QUERIES ALL [EXCEPT .. [,..]]` 修飾子が指定されている場合、指定された `EXCEPT` 句を除いて、すべてのプロトコルが停止します。
- `QUERIES DEFAULT [EXCEPT .. [,..]]` 修飾子が指定されている場合、指定された `EXCEPT` 句を除いて、すべてのデフォルトプロトコルが停止します。
- `QUERIES CUSTOM [EXCEPT .. [,..]]` 修飾子が指定されている場合、指定された `EXCEPT` 句を除いて、すべてのカスタムプロトコルが停止します。

### START LISTEN {#start-listen}

指定されたプロトコルで新しい接続が確立されることを許可します。

ただし、指定されたポートとプロトコルで SYSTEM STOP LISTEN コマンドを使用してサーバーが停止していない場合、このコマンドは効果を持ちません。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

## MergeTree テーブルの管理 {#managing-mergetree-tables}

ClickHouse は [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのバックグラウンドプロセスを管理できます。

### STOP MERGES {#stop-merges}

<CloudNotSupportedBadge/>

MergeTree ファミリーのテーブルのバックグラウンドマージを停止する機能を提供します：

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
`DETACH / ATTACH` テーブルは、前にすべての MergeTree テーブルでマージが停止されている場合でも、テーブルのバックグラウンドマージを開始します。
:::

### START MERGES {#start-merges}

<CloudNotSupportedBadge/>

MergeTree ファミリーのテーブルのバックグラウンドマージを開始する機能を提供します：

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### STOP TTL MERGES {#stop-ttl-merges}

MergeTree ファミリーのテーブルに対して、[TTL式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) に従って古いデータをバックグラウンドで削除するのを停止する機能を提供します：
テーブルが存在しない場合や MergeTree エンジンがない場合でも、`Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START TTL MERGES {#start-ttl-merges}

MergeTree ファミリーのテーブルに対して、[TTL式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) に従って古いデータをバックグラウンドで削除するのを開始する機能を提供します：
テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### STOP MOVES {#stop-moves}

MergeTree ファミリーのテーブルに対して、[TTLテーブル式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) に従ってデータをバックグラウンドで移動するのを停止する機能を提供します：
テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START MOVES {#start-moves}

MergeTree ファミリーのテーブルに対して、[TTLテーブル式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) に従ってデータをバックグラウンドで移動するのを開始する機能を提供します：
テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM UNFREEZE {#query_language-system-unfreeze}

指定された名前の凍結されたバックアップをすべてのディスクからクリアします。特定のパーツの凍結解除については、[ALTER TABLE table_name UNFREEZE WITH NAME](/sql-reference/statements/alter/partition#unfreeze-partition) を参照してください。

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### WAIT LOADING PARTS {#wait-loading-parts}

テーブルの非同期で読み込まれているデータパーツ（古いデータパーツ）がすべてロードされるまで待ちます。

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## ReplicatedMergeTree テーブルの管理 {#managing-replicatedmergetree-tables}

ClickHouse は [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) テーブルのバックグラウンドレプリケーション関連プロセスを管理できます。

### STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge/>

`ReplicatedMergeTree` ファミリーのテーブルに挿入されたパーツのバックグラウンドフェッチを停止する機能を提供します：
テーブルのエンジンにかかわらず、テーブルやデータベースが存在しなくても常に `Ok.` を返します。

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START FETCHES {#start-fetches}

<CloudNotSupportedBadge/>

`ReplicatedMergeTree` ファミリーのテーブルに挿入されたパーツのバックグラウンドフェッチを開始する機能を提供します：
テーブルのエンジンにかかわらず、テーブルやデータベースが存在しなくても常に `Ok.` を返します。

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATED SENDS {#stop-replicated-sends}

`ReplicatedMergeTree` ファミリーのテーブルにおける新たに挿入されたパーツを他のレプリカにクラスタに送信するバックグラウンドの送信を停止する機能を提供します：

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATED SENDS {#start-replicated-sends}

`ReplicatedMergeTree` ファミリーのテーブルにおける新たに挿入されたパーツを他のレプリカにクラスタに送信するバックグラウンドの送信を開始する機能を提供します：

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATION QUEUES {#stop-replication-queues}

ZooKeeper に保存されたレプリケーションキューからのバックグラウンドフェッチタスクを停止する機能を提供します。可能なバックグラウンドタスクのタイプには、マージ、フェッチ、変更、`ON CLUSTER` 句を持つ DDL ステートメントが含まれます。

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATION QUEUES {#start-replication-queues}

ZooKeeper に保存されたレプリケーションキューからのバックグラウンドフェッチタスクを開始する機能を提供します。可能なバックグラウンドタスクのタイプには、マージ、フェッチ、変更、`ON CLUSTER` 句を持つ DDL ステートメントが含まれます。

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

`ReplicatedMergeTree` テーブルに対してレプリケーションログから新しいエントリをレプリケーションキューに読み込むのを停止します。

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START PULLING REPLICATION LOG {#start-pulling-replication-log}

`SYSTEM STOP PULLING REPLICATION LOG` をキャンセルします。

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYNC REPLICA {#sync-replica}

`ReplicatedMergeTree` テーブルがクラスタ内の他のレプリカと同期されるまで待ちますが、`receive_timeout` 秒を超えないようにします。

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

このステートメントを実行した後、`[db.]replicated_merge_tree_family_table_name` は一般的なレプリケーションログからコマンドを取得し、その後クエリはレプリカがすべての取得したコマンドを処理するまで待機します。以下の修飾子がサポートされています：

- `STRICT` 修飾子が指定された場合、クエリはレプリケーションクエの排出が空になるのを待ちます。`STRICT` バージョンは、レプリケーションクエに新しいエントリが常に現れる場合は成功しないかもしれません。
- `LIGHTWEIGHT` 修飾子が指定された場合、クエリは `GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE` および `DROP_PART` エントリの処理を待ちます。
  さらに、LIGHTWEIGHT 修飾子は、`FROM 'srcReplicas'` 句をサポートしています。ここで 'srcReplicas' は、コンマ区切りのソースレプリカ名のリストです。この拡張により、指定されたソースレプリカからのレプリケーショタスクに焦点をあてて、よりターゲットを絞った同期が可能になります。
- `PULL` 修飾子が指定された場合、クエリは ZooKeeper から新しいレプリケーションクエエントリを取得しますが、処理されるのを待つことはありません。

### SYNC DATABASE REPLICA {#sync-database-replica}

指定された [レプリケート データベース](/engines/database-engines/replicated) が、そのデータベースの DDL キューからすべてのスキーマ変更を適用するのを待ちます。

**構文**
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### RESTART REPLICA {#restart-replica}

`ReplicatedMergeTree` テーブルのZooKeeperセッションの状態を再初期化する機能を提供し、現在の状態を信頼のソースとしてZooKeeperと比較し、必要な場合はZooKeeperキューにタスクを追加します。
ZooKeeper のデータに基づいてレプリケーションクエが初期化されるのは、`ATTACH TABLE` ステートメントと同じ方法で行われます。短時間のうちに、テーブルはあらゆる操作に対して使用できません。

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### RESTORE REPLICA {#restore-replica}

メタデータが失われた場合でもデータが [存在する可能性のある] レプリカを復元します。

読み取り専用の `ReplicatedMergeTree` テーブルに対してのみ動作します。

次の状況の後にクエリを実行することができます：

  - ZooKeeper ルート `/` の喪失。
  - レプリカパス `/replicas` の喪失。
  - 個別レプリカパス `/replicas/replica_name/` の喪失。

レプリカはローカルで見つかったパーツをアタッチし、それらに関する情報を ZooKeeper に送信します。
メタデータの損失の前にレプリカに存在していたパーツは、古くない限り他から再取得されません（そのため、レプリカの復元は、すべてのデータをネットワーク経由で再ダウンロードすることを意味しません）。

:::note
すべての状態のパーツは `detached/` フォルダーに移動されます。データ喪失の前にアクティブだったパーツ（コミットされたもの）はアタッチされます。
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

複数のサーバーにテーブルを作成する場合。レプリカのメタデータが ZooKeeper で失われた後、メタデータが欠けているため、テーブルは読み取り専用としてアタッチします。最後のクエリは各レプリカで実行する必要があります。

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

すべての `ReplicatedMergeTree` テーブルの ZooKeeper セッション状態を再初期化する機能を提供し、現在の状態を信頼のソースとして ZooKeeper と比較し、必要に応じて ZooKeeper キューにタスクを追加します。

### DROP FILESYSTEM CACHE {#drop-filesystem-cache}

ファイルシステムキャッシュを削除することを許可します。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYNC FILE CACHE {#sync-file-cache}

:::note
これは非常に重く、誤用の可能性があります。
:::

同期システムコールを行います。

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```

### LOAD PRIMARY KEY {#load-primary-key}

指定されたテーブルまたはすべてのテーブルの主キーをロードします。

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

## Refreshable Materialized Views の管理 {#refreshable-materialized-views}

[Refreshable Materialized Views](../../sql-reference/statements/create/view.md#refreshable-materialized-view) によって実行されるバックグラウンドタスクを制御するためのコマンド。

使用中は [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md) に注目してください。

### REFRESH VIEW {#refresh-view}

指定されたビューの即時のスケジュール外での更新をトリガーします。

```sql
SYSTEM REFRESH VIEW [db.]name
```

### REFRESH VIEW {#refresh-view-1}

現在実行中のリフレッシュが完了するのを待ちます。リフレッシュが失敗した場合、例外をスローします。リフレッシュが実行されていない場合、即座に完了し、前回のリフレッシュが失敗していると例外がスローされます。

### STOP [REPLICATED] VIEW, STOP VIEWS {#stop-view-stop-views}

指定されたビューまたはすべてのリフレッシュ可能なビューの定期的なリフレッシュを無効にします。リフレッシュが進行中の場合、それもキャンセルします。

ビューがリプリケートまたは共有データベースにある場合、`STOP VIEW` は現在のレプリカにのみ影響し、`STOP REPLICATED VIEW` はすべてのレプリカに影響します。

```sql
SYSTEM STOP VIEW [db.]name
```
```sql
SYSTEM STOP VIEWS
```

### START [REPLICATED] VIEW, START VIEWS {#start-view-start-views}

指定されたビューまたはすべてのリフレッシュ可能なビューの定期的なリフレッシュを有効にします。即時のリフレッシュはトリガーされません。

ビューがリプリケートまたは共有データベースにある場合、`START VIEW` は `STOP VIEW` の効果を打ち消し、`START REPLICATED VIEW` は `STOP REPLICATED VIEW` の効果を打ち消します。

```sql
SYSTEM START VIEW [db.]name
```
```sql
SYSTEM START VIEWS
```

### CANCEL VIEW {#cancel-view}

現在のレプリカで指定されたビューのリフレッシュが進行中であれば、割り込んでキャンセルします。そうでなければ何もしません。

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

実行中のリフレッシュが完了するのを待ちます。リフレッシュが実行されていない場合、即座に戻ります。最新のリフレッシュの試行が失敗した場合は、エラーを報告します。

新しいリフレッシュ可能なマテリアライズドビューを作成した直後（EMPTY キーワードなし）に、初期リフレッシュの完了を待つために使用できます。

ビューがリプリケートまたは共有データベースにあり、別のレプリカでリフレッシュが実行されている場合、そのリフレッシュが完了するのを待ちます。

```sql
SYSTEM WAIT VIEW [db.]name
```