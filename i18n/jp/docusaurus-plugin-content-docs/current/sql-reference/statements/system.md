---
slug: /sql-reference/statements/system
sidebar_position: 36
sidebar_label: SYSTEM
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SYSTEM ステートメント

## RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

すべての[内部辞書](../../sql-reference/dictionaries/index.md)を再読み込みします。デフォルトでは、内部辞書は無効になっています。内部辞書の更新の結果にかかわらず、常に `Ok.` を返します。

## RELOAD DICTIONARIES {#reload-dictionaries}

以前に正常に読み込まれたすべての辞書を再読み込みします。デフォルトでは、辞書は遅延読み込みされます（[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)を参照）。そのため、起動時に自動的に読み込まれるのではなく、`dictGet` 関数を通じて最初にアクセスされるか、ENGINE = DictionaryのテーブルからSELECTされたときに初期化されます。`SYSTEM RELOAD DICTIONARIES` クエリは、これらの辞書 (LOADED) を再読み込みします。辞書の更新結果に関係なく、常に `Ok.` を返します。

**構文**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## RELOAD DICTIONARY {#reload-dictionary}

辞書 `dictionary_name` を完全に再読み込みします。辞書の状態 (LOADED / NOT_LOADED / FAILED) にかかわらず、常に `Ok.` を返します。

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

辞書の状態は、`system.dictionaries` テーブルをクエリすることで確認できます。

```sql
SELECT name, status FROM system.dictionaries;
```

## RELOAD MODELS {#reload-models}

:::note
このステートメントと `SYSTEM RELOAD MODEL` は、単に clickhouse-library-bridge から CatBoost モデルをアンロードするものです。関数 `catboostEvaluate()` は、モデルがまだ読み込まれていない場合、最初のアクセス時にモデルを読み込みます。
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

すべての登録済み[実行可能ユーザ定義関数](/sql-reference/functions/udf#executable-user-defined-functions)を、設定ファイルから再読み込みします。

**構文**

```sql
RELOAD FUNCTIONS [ON CLUSTER cluster_name]
RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

すべての[非同期メトリクス](../../operations/system-tables/asynchronous_metrics.md)を再計算します。非同期メトリクスは、設定[asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md)に基づいて定期的に更新されるため、このステートメントを使用して手動で更新する必要は通常ありません。

```sql
RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## DROP DNS CACHE {#drop-dns-cache}

ClickHouseの内部DNSキャッシュをクリアします。時々（古いClickHouseのバージョンでは）、インフラストラクチャを変更する際（他のClickHouseサーバのIPアドレスや辞書で使用されるサーバの変更）にこのコマンドを使用する必要があります。

より便利な（自動的な）キャッシュ管理については、disable_internal_dns_cache、dns_cache_max_entries、dns_cache_update_period パラメータを参照してください。

## DROP MARK CACHE {#drop-mark-cache}

マークキャッシュをクリアします。

## DROP REPLICA {#drop-replica}

`ReplicatedMergeTree` テーブルの死んだレプリカは、以下の構文を使用して削除できます：

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

クエリは、ZooKeeper内の`ReplicatedMergeTree`レプリカパスを削除します。レプリカが死んでいて、`DROP TABLE`によってZooKeeperからそのメタデータを削除できない場合に便利です。これは非アクティブ/古いレプリカのみを削除し、ローカルレプリカを削除することはできないため、これを削除したい場合は`DROP TABLE`を使用してください。`DROP REPLICA`は、テーブルを削除せず、ディスクからデータやメタデータを削除しません。

最初のものは、`database.table`テーブルの`'replica_name'`レプリカのメタデータを削除します。第二のものは、データベース内のすべてのレプリケートテーブルに対して同様のことを行います。第三のものは、ローカルサーバ上のすべてのレプリケートテーブルに対して同様のことを行います。第四のものは、テーブルのすべての他のレプリカが削除された場合に、死んだレプリカのメタデータを削除するのに便利です。テーブルのパスは明示的に指定する必要があります。これは、テーブル作成時に`ReplicatedMergeTree`エンジンに渡したのと同じパスである必要があります。

## DROP DATABASE REPLICA {#drop-database-replica}

死んだ`Replicated`データベースのレプリカは、以下の構文を使用して削除できます：

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

`SYSTEM DROP REPLICA`と似ていますが、`DROP DATABASE`を実行するデータベースがない場合は、ZooKeeperから`Replicated`データベースのレプリカパスを削除します。`ReplicatedMergeTree`レプリカを削除するわけではないので、`SYSTEM DROP REPLICA`も必要です。シャードとレプリカの名前は、データベースを作成する際に`Replicated`エンジンの引数で指定された名前です。また、これらの名前は、`system.clusters`の`database_shard_name`および`database_replica_name`カラムから取得できます。`FROM SHARD`句が欠落している場合、`replica_name`は`shard_name|replica_name`形式の完全なレプリカ名である必要があります。

## DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

解凍データキャッシュをクリアします。解凍データキャッシュの有効/無効は、クエリ/ユーザー/プロファイルレベルの設定[`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache)で制御されます。そのサイズは、サーバーレベルの設定[`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size)で構成できます。

## DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

コンパイルされた式キャッシュをクリアします。コンパイルされた式キャッシュの有効/無効は、クエリ/ユーザー/プロファイルレベルの設定[`compile_expressions`](../../operations/settings/settings.md#compile_expressions)で制御されます。

## DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
````

[クエリキャッシュ](../../operations/query-cache.md)をクリアします。タグが指定された場合、指定されたタグを持つクエリキャッシュエントリのみが削除されます。

## DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

[`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path)から読み込まれたスキーマのキャッシュをクリアします。

サポートされている形式：

- Protobuf

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]
```

## FLUSH LOGS {#flush-logs}

バッファされたログメッセージをシステムテーブル（例：system.query_log）にフラッシュします。主にデバッグに便利で、ほとんどのシステムテーブルにはデフォルトのフラッシュ間隔が7.5秒に設定されています。また、メッセージキューが空でもシステムテーブルが作成されます。

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

すべてをフラッシュしたくない場合は、その名前またはターゲットテーブルを指定して、1つまたは複数の個別ログをフラッシュできます：

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## RELOAD CONFIG {#reload-config}

ClickHouseの設定を再読み込みします。設定がZooKeeperに保存されている場合に使用します。`SYSTEM RELOAD CONFIG`は、ZooKeeperに保存されている`USER`設定を再読み込みせず、`users.xml`に保存されている`USER`設定のみを再読み込みします。すべての`USER`設定を再読み込みするには、`SYSTEM RELOAD USERS`を使用します。

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## RELOAD USERS {#reload-users}

すべてのアクセスストレージ（users.xml、ローカルディスクアクセスストレージ、レプリケート（ZooKeeper内）アクセスストレージ）を再読み込みします。

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

通常、ClickHouseをシャットダウンします（`service clickhouse-server stop` / `kill {$pid_clickhouse-server}` のように）

## KILL {#kill}

ClickHouseプロセスを中止します（`kill -9 {$ pid_clickhouse-server}`のように）

## 分散テーブルの管理 {#managing-distributed-tables}

ClickHouseは[分散](../../engines/table-engines/special/distributed.md)テーブルを管理できます。ユーザーがこれらのテーブルにデータを挿入すると、ClickHouseはまずクラスターノードに送信すべきデータのキューを作成し、次にそれを非同期的に送信します。キュー処理は、[`STOP DISTRIBUTED SENDS`](#stop-distributed-sends)、[FLUSH DISTRIBUTED](#flush-distributed)、および[`START DISTRIBUTED SENDS`](#start-distributed-sends)クエリで管理できます。また、[`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert)設定を使用して、分散データを同期的に挿入することもできます。

### STOP DISTRIBUTED SENDS {#stop-distributed-sends}

分散テーブルにデータを挿入する際、バックグラウンドデータ配信を無効にします。

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
[`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica)が有効な場合（デフォルト）、ローカルシャードへのデータは必ず挿入されます。
:::

### FLUSH DISTRIBUTED {#flush-distributed}

ClickHouseがクラスターノードにデータを同期的に送信することを強制します。ノードが利用できない場合、ClickHouseは例外をスローし、クエリの実行を停止します。すべてのノードがオンラインに戻るまで、クエリを再試行できます。

一部の設定を`SETTINGS`句を通じて上書きすることもでき、これは`max_concurrent_queries_for_all_users`や`max_memory_usage`のような一時的な制限を回避するのに便利です。

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
各保留ブロックは、初期INSERTクエリの設定を使用してディスクに保存されるため、設定を上書きする必要がある場合があります。
:::

### START DISTRIBUTED SENDS {#start-distributed-sends}

分散テーブルにデータを挿入する際、バックグラウンドデータ配信を有効にします。

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### STOP LISTEN {#stop-listen}

ソケットを閉じ、指定されたポートで指定されたプロトコルへの既存の接続を優雅に終了します。

ただし、clickhouse-serverの設定に対して対応するプロトコルの設定が指定されていない場合、このコマンドは効果がありません。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- `CUSTOM 'protocol'` 修飾子が指定された場合、サーバ設定のプロトコルセクションで指定された名前のカスタムプロトコルが停止します。
- `QUERIES ALL [EXCEPT .. [,..]]` 修飾子が指定された場合、すべてのプロトコルが停止されますが、`EXCEPT`節で指定されたものは除外されます。
- `QUERIES DEFAULT [EXCEPT .. [,..]]` 修飾子が指定された場合、すべてのデフォルトプロトコルが停止されますが、`EXCEPT`節で指定されたものは除外されます。
- `QUERIES CUSTOM [EXCEPT .. [,..]]` 修飾子が指定された場合、すべてのカスタムプロトコルが停止されますが、`EXCEPT`節で指定されたものは除外されます。

### START LISTEN {#start-listen}

指定されたプロトコルでの新しい接続を許可します。

ただし、指定されたポートとプロトコルでのサーバが`SYSTEM STOP LISTEN`コマンドを使用して停止されていない場合、このコマンドは効果がありません。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

## MergeTree テーブルの管理 {#managing-mergetree-tables}

ClickHouseは[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブル内のバックグラウンドプロセスを管理できます。

### STOP MERGES {#stop-merges}

<CloudNotSupportedBadge/>

MergeTreeファミリーのテーブルでバックグラウンドマージを停止する可能性を提供します：

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
`DETACH / ATTACH`テーブルは、すべてのMergeTreeテーブルでマージが停止された後でも、テーブルのバックグラウンドマージを開始します。
:::

### START MERGES {#start-merges}

<CloudNotSupportedBadge/>

MergeTreeファミリーのテーブルでバックグラウンドマージを開始する可能性を提供します：

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### STOP TTL MERGES {#stop-ttl-merges}

MergeTreeファミリーのテーブルに対して、[TTL式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)に従って古いデータのバックグラウンド削除を停止する可能性を提供します。
テーブルが存在しない場合やMergeTreeエンジンがない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します：

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START TTL MERGES {#start-ttl-merges}

MergeTreeファミリーのテーブルに対して、[TTL式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)に従って古いデータのバックグラウンド削除を開始する可能性を提供します：
テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します：

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### STOP MOVES {#stop-moves}

MergeTreeファミリーのテーブルに対して、[TTLテーブル式に基づく](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)データのバックグラウンド移動を停止する可能性を提供します：
テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します：

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START MOVES {#start-moves}

MergeTreeファミリーのテーブルに対して、[TTLテーブル式に基づく](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)データのバックグラウンド移動を開始する可能性を提供します：
テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します：

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM UNFREEZE {#query_language-system-unfreeze}

指定された名前のフリーズされたバックアップをすべてのディスクからクリアします。特定のパーツを解除することの詳細は、[ALTER TABLE table_name UNFREEZE WITH NAME](alter/partition.md#alter_unfreeze-partition)を参照してください。

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### WAIT LOADING PARTS {#wait-loading-parts}

テーブルのすべての非同期ローディングデータパーツ（古いデータパーツ）が読み込まれるまで待ちます。

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## ReplicatedMergeTree テーブルの管理 {#managing-replicatedmergetree-tables}

ClickHouseは[ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication)テーブルでのバックグラウンドレプリケーション関連プロセスを管理できます。

### STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge/>

`ReplicatedMergeTree`ファミリーのテーブルで挿入されたパーツのバックグラウンドフェッチを停止する可能性を提供します：
テーブルエンジンに関わらず、常に `Ok.` を返します。テーブルやデータベースが存在しない場合でも同様です。

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START FETCHES {#start-fetches}

<CloudNotSupportedBadge/>

`ReplicatedMergeTree`ファミリーのテーブルで挿入されたパーツのバックグラウンドフェッチを開始する可能性を提供します：
テーブルエンジンに関わらず、常に `Ok.` を返します。テーブルやデータベースが存在しない場合でも同様です。

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATED SENDS {#stop-replicated-sends}

`ReplicatedMergeTree`ファミリーのテーブルで新しく挿入されたパーツに対して、クラスタ内の他のレプリカへのバックグラウンド送信を停止する可能性を提供します：

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATED SENDS {#start-replicated-sends}

`ReplicatedMergeTree`ファミリーのテーブルで新しく挿入されたパーツに対して、クラスタ内の他のレプリカへのバックグラウンド送信を開始する可能性を提供します：

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATION QUEUES {#stop-replication-queues}

`ReplicatedMergeTree`ファミリーのテーブルに対して、ZooKeeperに保存されているレプリケーションキューからのバックグラウンドフェッチタスクを停止する可能性を提供します。可能なバックグラウンドタスクのタイプ - マージ、フェッチ、ミューテーション、`ON CLUSTER`句を含むDDLステートメント：

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATION QUEUES {#start-replication-queues}

`ReplicatedMergeTree`ファミリーのテーブルに対して、ZooKeeperに保存されているレプリケーションキューからのバックグラウンドフェッチタスクを開始する可能性を提供します。可能なバックグラウンドタスクのタイプ - マージ、フェッチ、ミューテーション、`ON CLUSTER`句を含むDDLステートメント：

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

`ReplicatedMergeTree`テーブルに新しいエントリをレプリケーションログからレプリケーションキューにロードするのを停止します。

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START PULLING REPLICATION LOG {#start-pulling-replication-log}

`SYSTEM STOP PULLING REPLICATION LOG`をキャンセルします。

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYNC REPLICA {#sync-replica}

`ReplicatedMergeTree`テーブルがクラスタ内の他のレプリカと同期するまで待機しますが、`receive_timeout`秒を超えることはありません。

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

このステートメントを実行した後、`[db.]replicated_merge_tree_family_table_name`は共通のレプリケートログからコマンドを取得し、そしてクエリはレプリカが取得したすべてのコマンドを処理するまで待機します。次の修飾子がサポートされています：

 - `STRICT`修飾子が指定されている場合、クエリはレプリケーションキューが空になるまで待機します。`STRICT`バージョンは、レプリケーションキューに新しいエントリが常に出現する場合は成功しない可能性があります。
 - `LIGHTWEIGHT`修飾子が指定されている場合、クエリは`GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE`、`DROP_PART`エントリが処理されるまでのみ待機します。さらに、LIGHTWEIGHT修飾子はオプションで`FROM 'srcReplicas'`句をサポートしており、`srcReplicas`はソースレプリカ名のカンマ区切りリストです。この拡張により、指定されたソースレプリカから発信するレプリケーションタスクにのみフォーカスを当てた、よりターゲットを絞った同期が可能になります。
 - `PULL`修飾子が指定されている場合、クエリはZooKeeperから新しいレプリケーションキューエントリを取得しますが、処理されるまで待機しません。

### SYNC DATABASE REPLICA {#sync-database-replica}

指定された[レプリケートデータベース](/engines/database-engines/replicated)がそのデータベースのDDLキューからすべてのスキーマ変更を適用するまで待機します。

**構文**
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### RESTART REPLICA {#restart-replica}

`ReplicatedMergeTree`テーブルのZooKeeperセッションの状態を再初期化する可能性を提供します。現在の状態とZooKeeperを真実のソースとして比較し、必要に応じてZooKeeperキューにタスクを追加します。
ZooKeeperデータに基づくレプリケーションキューの初期化は、`ATTACH TABLE`ステートメントと同じように行われます。短時間の間に、そのテーブルは操作を受け付けなくなります。

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### RESTORE REPLICA {#restore-replica}

レプリカが[おそらく]存在するがZooKeeperメタデータが失われている場合、レプリカを復元します。

読み取り専用の`ReplicatedMergeTree`テーブルでのみ機能します。

以下の場合にクエリを実行できます：

  - ZooKeeperルート`/`の喪失。
  - レプリカパス`/replicas`の喪失。
  - 個々のレプリカパス`/replicas/replica_name/`の喪失。

レプリカはローカルに見つかったパーツを付加し、それらについての情報をZooKeeperに送信します。メタデータが失われる前にレプリカに存在していたパーツは、古くない限り他から再取得されません（したがって、レプリカの復元はネットワーク経由での全データの再ダウンロードを意味しません）。

:::note
すべての状態のパーツは`detached/`フォルダーに移動されます。データ損失前にアクティブなパーツ（コミットされたもの）はアタッチされます。
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

複数のサーバーでのテーブル作成。レプリカのメタデータがZooKeeperで失われた後、メタデータが欠損しているため、テーブルは読み取り専用でアタッチされます。最後のクエリは、すべてのレプリカで実行する必要があります。

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

### RESTART REPLICAS {#restart-replicas}

すべての`ReplicatedMergeTree`テーブルのZooKeeperセッション状態を再初期化する可能性を提供し、現在の状態をZooKeeperと真実のソースとして比較し、ZooKeeperキューに必要なタスクを追加します。

### DROP FILESYSTEM CACHE {#drop-filesystem-cache}

ファイルシステムキャッシュを削除できるようにします。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYNC FILE CACHE {#sync-file-cache}

:::note
重すぎて悪用の可能性があります。
:::

sync syscallを行います。

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

## リフレッシュ可能なマテリアライズドビューの管理 {#refreshable-materialized-views}

[リフレッシュ可能なマテリアライズドビュー](../../sql-reference/statements/create/view.md#refreshable-materialized-view)によって実行されるバックグラウンドタスクを制御するコマンドです。

これらを使用している間、[`system.view_refreshes`](../../operations/system-tables/view_refreshes.md)にも注意してください。

### REFRESH VIEW {#refresh-view}

特定のビューの即時スケジュール外のリフレッシュをトリガーします。

```sql
SYSTEM REFRESH VIEW [db.]name
```

### REFRESH VIEW {#refresh-view-1}

現在実行中のリフレッシュが完了するのを待ちます。リフレッシュが失敗した場合、例外をスローします。リフレッシュが実行中でない場合は、すぐに完了しますが、前のリフレッシュが失敗した場合は例外をスローします。

### STOP VIEW, STOP VIEWS {#stop-view-stop-views}

指定されたビューまたはすべてのリフレッシュ可能なビューの定期的なリフレッシュを無効にします。リフレッシュが進行中の場合は、それもキャンセルします。

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

指定されたビューのリフレッシュが進行中の場合、それを中断してキャンセルします。そうでない場合は何もしません。

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

実行中のリフレッシュが完了するのを待機します。リフレッシュが実行中でない場合、すぐに返します。最新のリフレッシュ試行が失敗した場合、エラーを報告します。

新しいリフレッシュ可能なマテリアライズドビューを作成した直後（`EMPTY`キーワードなしで）に初期リフレッシュが完了するのを待機するために使用できます。

```sql
SYSTEM WAIT VIEW [db.]name
```
