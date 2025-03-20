---
slug: '/sql-reference/statements/system'
sidebar_position: 36
sidebar_label: 'SYSTEM'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SYSTEM ステートメント

## RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

すべての [内部辞書](../../sql-reference/dictionaries/index.md) を再読み込みします。デフォルトでは、内部辞書は無効になっています。内部辞書の更新の結果に関係なく、常に `Ok.` を返します。

## RELOAD DICTIONARIES {#reload-dictionaries}

以前に正常に読み込まれたすべての辞書を再読み込みします。デフォルトでは、辞書は遅延読み込みされます（[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)を参照）。そのため、自動的に起動時に読み込まれるのではなく、最初のアクセスを通じて `dictGet` 関数または ENGINE = Dictionary のテーブルから SELECT を実行することで初期化されます。`SYSTEM RELOAD DICTIONARIES` クエリは、これらの辞書を再読み込みします（LOADED）。辞書の更新の結果に関係なく、常に `Ok.` を返します。

**構文**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## RELOAD DICTIONARY {#reload-dictionary}

辞書 `dictionary_name` を完全に再読み込みします。辞書の状態（LOADED / NOT_LOADED / FAILED）に関係なく、常に `Ok.` を返します。

``` sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

辞書の状態は、`system.dictionaries` テーブルをクエリすることで確認できます。

``` sql
SELECT name, status FROM system.dictionaries;
```

## RELOAD MODELS {#reload-models}

:::note
このステートメントおよび `SYSTEM RELOAD MODEL` は、単に clickhouse-library-bridge から catboost モデルをアンロードします。関数 `catboostEvaluate()` は、モデルがまだ読み込まれていない場合、最初のアクセス時にモデルを読み込みます。
:::

すべての CatBoost モデルをアンロードします。

**構文**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```

## RELOAD MODEL {#reload-model}

`model_path` の CatBoost モデルをアンロードします。

**構文**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```

## RELOAD FUNCTIONS {#reload-functions}

すべての登録された [実行可能なユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions) または構成ファイルからそのうちの一つを再読み込みします。

**構文**

```sql
RELOAD FUNCTIONS [ON CLUSTER cluster_name]
RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

すべての [非同期メトリクス](../../operations/system-tables/asynchronous_metrics.md) を再計算します。非同期メトリクスは、設定 [asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md) に基づいて定期的に更新されるため、このステートメントを使用して手動で更新する必要は通常ありません。

```sql
RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## DROP DNS CACHE {#drop-dns-cache}

ClickHouseの内部DNSキャッシュをクリアします。時々（古いClickHouseバージョンでは）、インフラストラクチャを変更する際にはこのコマンドを使用する必要があります（別のClickHouseサーバーのIPアドレスを変更する場合や辞書で使用されるサーバーの変更）。

より便利な（自動的な）キャッシュ管理については、disable_internal_dns_cache、dns_cache_max_entries、dns_cache_update_period パラメータを参照してください。

## DROP MARK CACHE {#drop-mark-cache}

マークキャッシュをクリアします。

## DROP REPLICA {#drop-replica}

`ReplicatedMergeTree` テーブルの死んだレプリカを以下の構文を使用して削除できます。

``` sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

クエリは、ZooKeeper内の `ReplicatedMergeTree` レプリカパスを削除します。レプリカが死んでおり、そのメタデータを `DROP TABLE` から削除できない場合に役立ちます。これは、非アクティブまたは古いレプリカだけを削除し、ローカルレプリカを削除することはできませんので、その場合は `DROP TABLE` を使用してください。`DROP REPLICA` は、テーブルを削除せず、ディスクからデータやメタデータを削除することもありません。

最初のものは、`database.table` テーブルの `'replica_name'` レプリカのメタデータを削除します。2番目のものは、データベース内のすべてのレプリケートされたテーブルについて同じことを行います。3番目のものは、ローカルサーバー上のすべてのレプリケートされたテーブルについて同じことを行います。4番目は、テーブルの他のすべてのレプリカが削除されたときに死んだレプリカのメタデータを削除するのに便利です。テーブルパスを明示的に指定する必要があります。これは、テーブル作成時に `ReplicatedMergeTree` エンジンの最初の引数に渡されたのと同じパスでなければなりません。

## DROP DATABASE REPLICA {#drop-database-replica}

死んだ `Replicated` データベースのレプリカは、以下の構文を使用して削除できます。

``` sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

`SYSTEM DROP REPLICA` と似ていますが、`DROP DATABASE` を実行できるデータベースがない場合に、ZooKeeper から `Replicated` データベースレプリカパスを削除します。`ReplicatedMergeTree` レプリカは削除されないため（そのため、`SYSTEM DROP REPLICA` が必要な場合があります）、注意が必要です。シャード名とレプリカ名は、データベース作成時に `Replicated` エンジン引数として指定された名前です。また、これらの名前は `system.clusters` の `database_shard_name` および `database_replica_name` カラムから取得できます。`FROM SHARD` 句がない場合、`replica_name` は `shard_name|replica_name` 形式の完全なレプリカ名である必要があります。

## DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

非圧縮データキャッシュをクリアします。非圧縮データキャッシュは、クエリ/ユーザー/プロファイルレベルの設定 [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache) で有効/無効にできます。そのサイズは、サーバーレベルの設定 [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size) で構成できます。

## DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

コンパイルされた式キャッシュをクリアします。コンパイルされた式キャッシュは、クエリ/ユーザー/プロファイルレベルの設定 [`compile_expressions`](../../operations/settings/settings.md#compile_expressions) で有効/無効にできます。

## DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
```

[クエリキャッシュ](../../operations/query-cache.md)をクリアします。タグが指定されている場合、指定されたタグを持つクエリキャッシュエントリのみが削除されます。

## DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

[`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path) からロードされたスキーマのキャッシュをクリアします。

サポートされているフォーマット：

- Protobuf

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]
```

## FLUSH LOGS {#flush-logs}

バッファリングされたログメッセージをシステムテーブル（例えば system.query_log）にフラッシュします。主にデバッグに便利で、ほとんどのシステムテーブルにはデフォルトのフラッシュ間隔が7.5秒設定されています。メッセージキューが空でもシステムテーブルが作成されます。

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

すべてをフラッシュしたくない場合は、それらの名前または対象テーブルを指定することで、一つまたは複数の個別のログをフラッシュできます。

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## RELOAD CONFIG {#reload-config}

ClickHouse の構成を再読み込みします。これは、構成が ZooKeeper に格納されている場合に使用されます。`SYSTEM RELOAD CONFIG` は、ZooKeeper に格納された `USER` 構成を再読み込みせず、`users.xml` に格納された `USER` 構成のみを再読み込みします。すべての `USER` 構成を再読み込みするには、`SYSTEM RELOAD USERS` を使用します。

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## RELOAD USERS {#reload-users}

すべてのアクセスストレージを再読み込みします。これには、users.xml、ローカルディスクアクセスストレージ、レプリケートされた（ZooKeeper内）アクセスストレージが含まれます。

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

通常、ClickHouseをシャットダウンします（`service clickhouse-server stop` / `kill {$pid_clickhouse-server}` に似ています）。

## KILL {#kill}

ClickHouseプロセスを中止します（`kill -9 {$ pid_clickhouse-server}` に似ています）。

## 分散テーブルの管理 {#managing-distributed-tables}

ClickHouseは [分散](../../engines/table-engines/special/distributed.md) テーブルを管理できます。ユーザーがこれらのテーブルにデータを挿入すると、ClickHouseは最初にクラスターノードに送信されるべきデータのキューを作成し、その後非同期的に送信します。[`STOP DISTRIBUTED SENDS`](#stop-distributed-sends)、[FLUSH DISTRIBUTED](#flush-distributed)、および[`START DISTRIBUTED SENDS`](#start-distributed-sends) クエリを使用して、キュー処理を管理できます。また、[`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert) 設定を使用して、分散データを同期的に挿入することもできます。

### STOP DISTRIBUTED SENDS {#stop-distributed-sends}

分散テーブルにデータを挿入する際のバックグラウンドデータ配信を無効にします。

``` sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
[`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica) が有効な場合（デフォルト）、ローカルシャードにデータが挿入されます。
:::

### FLUSH DISTRIBUTED {#flush-distributed}

ClickHouseがデータをクラスターノードに同期的に送信するよう強制します。任意のノードが利用できない場合、ClickHouseは例外をスローし、クエリの実行を停止します。クエリが成功するまで再試行することができ、すべてのノードがオンラインになったときに成功します。

`SETTINGS` 句を介して一部の設定をオーバーライドすることもでき、一時的な制限（例えば `max_concurrent_queries_for_all_users` や `max_memory_usage`）を回避するのに役立つことがあります。

``` sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
各保留ブロックは、初期INSERTクエリの設定でディスクに保存されているため、時には設定をオーバーライドすることを望むことがあります。
:::

### START DISTRIBUTED SENDS {#start-distributed-sends}

分散テーブルにデータを挿入する際のバックグラウンドデータ配信を有効にします。

``` sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### STOP LISTEN {#stop-listen}

指定されたポートと指定されたプロトコルでサーバーへの既存の接続を優雅に終了し、ソケットを閉じます。

ただし、clickhouse-server構成で対応するプロトコルの設定が指定されていない場合、このコマンドは効果がありません。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- `CUSTOM 'protocol'` 修飾子が指定されている場合、サーバー構成のプロトコルセクションで指定された名前を持つカスタムプロトコルが停止されます。
- `QUERIES ALL [EXCEPT .. [,..]]` 修飾子が指定されている場合、指定された `EXCEPT` 句がない限り、すべてのプロトコルが停止されます。
- `QUERIES DEFAULT [EXCEPT .. [,..]]` 修飾子が指定されている場合、指定された `EXCEPT` 句がない限り、すべてのデフォルトプロトコルが停止されます。
- `QUERIES CUSTOM [EXCEPT .. [,..]]` 修飾子が指定されている場合、指定された `EXCEPT` 句がない限り、すべてのカスタムプロトコルが停止されます。

### START LISTEN {#start-listen}

指定されたプロトコルで新しい接続を確立できるようにします。

ただし、SYSTEM STOP LISTEN コマンドを使用して指定されたポートとプロトコルのサーバーが停止されていない場合、このコマンドは効果がありません。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

## MergeTree テーブルの管理 {#managing-mergetree-tables}

ClickHouseは [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブル内のバックグラウンドプロセスを管理できます。

### STOP MERGES {#stop-merges}

<CloudNotSupportedBadge/>

MergeTree ファミリーのテーブルに対してバックグラウンドマージを停止する機能を提供します。

``` sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
`DETACH / ATTACH` テーブルは、すべての MergeTree テーブルのマージが停止されている場合でも、そのテーブルのバックグラウンドマージを開始します。
:::

### START MERGES {#start-merges}

<CloudNotSupportedBadge/>

MergeTree ファミリーのテーブルに対してバックグラウンドマージを開始する機能を提供します。

``` sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### STOP TTL MERGES {#stop-ttl-merges}

MergeTree ファミリーのテーブルに対して [TTL式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) に従って古いデータのバックグラウンド削除を停止する機能を提供します。テーブルが存在しない場合や、テーブルにMergeTreeエンジンがない場合でも `Ok.`を返します。データベースが存在しないときにはエラーが返されます。

``` sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START TTL MERGES {#start-ttl-merges}

MergeTree ファミリーのテーブルに対して [TTL式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) に従って古いデータのバックグラウンド削除を開始する機能を提供します。テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しないときにはエラーが返されます。

``` sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### STOP MOVES {#stop-moves}

MergeTree ファミリーのテーブルに対して [TTLテーブル式に従う](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) データのバックグラウンド移動を停止する機能を提供します。テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しないときにはエラーが返されます。

``` sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START MOVES {#start-moves}

MergeTree ファミリーのテーブルに対して [TTLテーブル式に従う](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) データのバックグラウンド移動を開始する機能を提供します。テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しないときにはエラーが返されます。

``` sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM UNFREEZE {#query_language-system-unfreeze}

指定された名前のフリーズされたバックアップをすべてのディスクからクリアします。 [ALTER TABLE table_name UNFREEZE WITH NAME](/sql-reference/statements/alter/partition#unfreeze-partition) の詳細については、個別のパーツをアンフリーズすることを参照してください。

``` sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### WAIT LOADING PARTS {#wait-loading-parts}

テーブルの非同期で読み込まれているすべてのデータパーツ（古いデータパーツ）が読み込み完了するまで待機します。

``` sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## ReplicatedMergeTree テーブルの管理 {#managing-replicatedmergetree-tables}

ClickHouseは [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) テーブル内のバックグラウンドレプリケーションに関連するプロセスを管理できます。

### STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge/>

`ReplicatedMergeTree` ファミリーのテーブルに対して挿入されたパーツのバックグラウンドフェッチを停止する機能を提供します。テーブルエンジンに関係なく、そしてテーブルやデータベースが存在しない場合でも、常に `Ok.` を返します。

``` sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START FETCHES {#start-fetches}

<CloudNotSupportedBadge/>

`ReplicatedMergeTree` ファミリーのテーブルに対して挿入されたパーツのバックグラウンドフェッチを開始する機能を提供します。テーブルエンジンに関係なく、そしてテーブルやデータベースが存在しない場合でも、常に `Ok.` を返します。

``` sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATED SENDS {#stop-replicated-sends}

`ReplicatedMergeTree` ファミリーのテーブルに対して新しく挿入されたパーツをクラスタ内の他のレプリカに送信するバックグラウンドプロセスを停止する機能を提供します。

``` sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATED SENDS {#start-replicated-sends}

`ReplicatedMergeTree` ファミリーのテーブルに対して新しく挿入されたパーツをクラスタ内の他のレプリカに送信するバックグラウンドプロセスを開始する機能を提供します。

``` sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATION QUEUES {#stop-replication-queues}

ZooKeeper に保存されたレプリケーションキューからバックグラウンドフェッチタスクを停止する機能を提供します。可能なバックグラウンドタスクタイプ - マージ、フェッチ、変異、DDL ステートメントと ON CLUSTER 句。

``` sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATION QUEUES {#start-replication-queues}

ZooKeeper に保存されたレプリケーションキューからバックグラウンドフェッチタスクを開始する機能を提供します。可能なバックグラウンドタスクタイプ - マージ、フェッチ、変異、DDL ステートメントと ON CLUSTER 句。

``` sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

`ReplicatedMergeTree` テーブルでレプリケーションログから新しいエントリをレプリケーションキューに読み込むのを停止します。

``` sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START PULLING REPLICATION LOG {#start-pulling-replication-log}

`SYSTEM STOP PULLING REPLICATION LOG` をキャンセルします。

``` sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYNC REPLICA {#sync-replica}

`ReplicatedMergeTree` テーブルがクラスタ内の他のレプリカと同期するまで待機します。ただし、`receive_timeout` 秒を超えることはありません。

``` sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

このステートメントを実行すると、`[db.]replicated_merge_tree_family_table_name` が共通のレプリケーションログからコマンドを取得し、その後、クエリはレプリカがすべての取得されたコマンドを処理するまで待機します。以下の修飾子がサポートされています：

 - `STRICT` 修飾子が指定された場合、クエリはレプリケーションキューが空になるまで待機します。`STRICT` バージョンは、新しいエントリが常にレプリケーションキューに現れ続けている場合、成功しない可能性があります。
 - `LIGHTWEIGHT` 修飾子が指定された場合、クエリは `GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE` および `DROP_PART` エントリが処理されるのを待機します。さらに、LIGHTWEIGHT 修飾子は、指定したソースレプリカから発生するレプリケーションタスクのみに焦点を当てることができるオプションの FROM 'srcReplicas' 句をサポートしています。
 - `PULL` 修飾子が指定された場合、クエリは ZooKeeper から新しいレプリケーションキューエントリを取得しますが、何かが処理されるのを待たずに実行されます。

### SYNC DATABASE REPLICA {#sync-database-replica}

指定された [レプリケートデータベース](/engines/database-engines/replicated) が、そのデータベースのDDLキューからすべてのスキーマ変更を適用するまで待機します。

**構文**
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### RESTART REPLICA {#restart-replica}

`ReplicatedMergeTree` テーブルの ZooKeeper セッションの状態を再初期化し、現在の状態を真実のソースとして ZooKeeper と比較し、必要に応じて ZooKeeper キューにタスクを追加する機能を提供します。ZooKeeper データに基づくレプリケーションキューの初期化は、`ATTACH TABLE` ステートメントと同じ方法で行われます。短時間、テーブルは操作に対して利用できなくなります。

``` sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### RESTORE REPLICA {#restore-replica}

データが [存在する可能性] があるが ZooKeeper メタデータが失われた場合、レプリカを復元します。

readonly `ReplicatedMergeTree` テーブルのみに機能します。

次のような場合にクエリを実行できます：

  - ZooKeeper ルート `/` の損失。
  - レプリカパス `/replicas` の損失。
  - 個々のレプリカパス `/replicas/replica_name/` の損失。

レプリカは、ローカルに見つかったパーツを接続し、それについての情報を ZooKeeper に送信します。メタデータが失われる前にレプリカに存在したパーツは、他のパーツから再取得されません（古くない限り）。したがって、レプリカの復元は、すべてのデータをネットワーク経由で再ダウンロードすることを意味しません。

:::note
すべての状態のパーツは `detached/` フォルダに移動され、データ損失前にアクティブなパーツ（コミットされたパーツ）は接続されます。
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

複数のサーバーでテーブルを作成します。レプリカのメタデータが ZooKeeper で失われた後、テーブルはメタデータが欠落しているため、読み取り専用として接続されます。最後のクエリは、すべてのレプリカで実行する必要があります。

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

すべての `ReplicatedMergeTree` テーブルの ZooKeeper セッション状態を再初期化する機能を提供し、現在の状態を真実のソースとして ZooKeeper と比較し、必要に応じて ZooKeeper キューにタスクを追加します。

### DROP FILESYSTEM CACHE {#drop-filesystem-cache}

ファイルシステムキャッシュを削除することができます。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYNC FILE CACHE {#sync-file-cache}

:::note
これは非常に重く、悪用の可能性があります。
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

## リフレッシュ可能なマテリアライズドビューの管理 {#refreshable-materialized-views}

[リフレッシュ可能なマテリアライズドビュー](../../sql-reference/statements/create/view.md#refreshable-materialized-view) によって実行されるバックグラウンドタスクを制御するコマンドです。

使用中は [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md) に留意してください。

### REFRESH VIEW {#refresh-view}

指定されたビューの即時のスケジュール外リフレッシュをトリガーします。

```sql
SYSTEM REFRESH VIEW [db.]name
```

### REFRESH VIEW {#refresh-view-1}

現在実行中のリフレッシュが完了するまで待機します。リフレッシュが失敗した場合、例外をスローします。リフレッシュが実行中でない場合、すぐに完了し、以前のリフレッシュが失敗している場合は例外がスローされます。

### STOP VIEW, STOP VIEWS {#stop-view-stop-views}

指定されたビューまたはすべてのリフレッシュ可能なビューの定期的リフレッシュを無効にします。リフレッシュが進行中の場合、それもキャンセルします。

```sql
SYSTEM STOP VIEW [db.]name
```
```sql
SYSTEM STOP VIEWS
```

### START VIEW, START VIEWS {#start-view-start-views}

指定されたビューまたはすべてのリフレッシュ可能なビューの定期的リフレッシュを有効にします。即時のリフレッシュはトリガーされません。

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

実行中のリフレッシュが完了するまで待機します。リフレッシュが実行中でない場合、即座に戻ります。最新のリフレッシュ試行が失敗した場合、エラーを報告します。

新しいリフレッシュ可能なマテリアライズドビューを作成した直後（EMPTYキーワードなし）に、初期リフレッシュの完了を待つために使用できます。

```sql
SYSTEM WAIT VIEW [db.]name
```
