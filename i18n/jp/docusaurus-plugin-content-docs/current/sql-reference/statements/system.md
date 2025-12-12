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

すべての [内部Dictionary](../../sql-reference/dictionaries/index.md) を再読み込みします。
デフォルトでは、内部Dictionaryは無効化されています。
内部Dictionaryの更新結果に関係なく、常に `Ok.` を返します。

## SYSTEM RELOAD DICTIONARIES {#reload-dictionaries}

以前に正常にロードされたすべてのディクショナリを再ロードします。
デフォルトでは、ディクショナリは遅延ロードされます（[dictionaries&#95;lazy&#95;load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load) を参照）。そのため、起動時に自動的にロードされるのではなく、[`dictGet`](/sql-reference/functions/ext-dict-functions#dictGet) 関数または `SELECT` を使って `ENGINE = Dictionary` のテーブルにアクセスしたときに初めて初期化されます。`SYSTEM RELOAD DICTIONARIES` クエリは、このようなディクショナリ（`LOADED`、[`system.dictionaries`](/operations/system-tables/dictionaries) の `status` 列を参照）を再ロードします。
ディクショナリの更新結果に関わらず、常に `Ok.` を返します。

**構文**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD DICTIONARY {#reload-dictionary}

Dictionary `dictionary_name` を、辞書の状態（LOADED / NOT&#95;LOADED / FAILED）に関係なく完全に再読み込みします。
Dictionary の更新結果に関係なく、常に `Ok.` を返します。

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

Dictionary の状態は `system.dictionaries` テーブルをクエリすることで確認できます。

```sql
SELECT name, status FROM system.dictionaries;
```


## SYSTEM RELOAD MODELS {#reload-models}

:::note
このステートメントと `SYSTEM RELOAD MODEL` は、単に clickhouse-library-bridge から CatBoost モデルをアンロードするだけです。`catboostEvaluate()` 関数は、まだロードされていない場合、初回アクセス時にモデルをロードします。
:::

すべてのCatBoostモデルをアンロードします。

**構文**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD MODEL {#reload-model}

`model_path` で指定されたCatBoostモデルを再読み込みします。

**構文**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```


## SYSTEM RELOAD FUNCTIONS {#reload-functions}

設定ファイルから、登録済みの[実行可能なユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions)をすべて、またはいずれか1つを再読み込みします。

**構文**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```


## SYSTEM RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

すべての[非同期メトリクス](../../operations/system-tables/asynchronous_metrics.md)を再計算します。非同期メトリクスは、[asynchronous&#95;metrics&#95;update&#95;period&#95;s](../../operations/server-configuration-parameters/settings.md)設定に基づいて定期的に更新されるため、このステートメントを手動で実行して更新する必要は通常ありません。

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```


## SYSTEM DROP DNS CACHE {#drop-dns-cache}

ClickHouseの内部DNSキャッシュをクリアします。インフラストラクチャを変更する際（別のClickHouseサーバーやディクショナリで使用されるサーバーのIPアドレスを変更する場合など）、古いバージョンのClickHouseではこのコマンドの使用が必要になることがあります。

より便利（自動的）なキャッシュ管理を行うには、`disable_internal_dns_cache`、`dns_cache_max_entries`、`dns_cache_update_period` パラメータを参照してください。

## SYSTEM DROP MARK CACHE {#drop-mark-cache}

マークキャッシュをクリアします。

## SYSTEM DROP ICEBERG METADATA CACHE {#drop-iceberg-metadata-cache}

Icebergメタデータキャッシュをクリアします。

## SYSTEM DROP TEXT INDEX DICTIONARY CACHE {#drop-text-index-dictionary-cache}

テキストインデックスのDictionaryキャッシュをクリアします。

## SYSTEM DROP TEXT INDEX HEADER CACHE {#drop-text-index-header-cache}

テキストインデックスヘッダーキャッシュをクリアします。

## SYSTEM DROP TEXT INDEX POSTINGS CACHE {#drop-text-index-postings-cache}

テキスト索引のポスティングキャッシュを消去します。

## SYSTEM DROP TEXT INDEX POSTINGS CACHE {#drop-text-index-caches}

テキスト索引ヘッダーキャッシュ、Dictionaryキャッシュおよびポスティングキャッシュをクリアします。

## SYSTEM DROP REPLICA {#drop-replica}

`ReplicatedMergeTree`テーブルの停止したレプリカは、次の構文で削除できます。

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

これらのクエリは、ZooKeeper内の `ReplicatedMergeTree` レプリカパスを削除します。これは、レプリカがダウンしており、もはやそのテーブルが存在しないために `DROP TABLE` では ZooKeeper からメタデータを削除できない場合に有用です。非アクティブまたは古いレプリカのみを削除し、ローカルレプリカを削除することはできません。その場合は `DROP TABLE` を使用してください。`DROP REPLICA` はテーブルを一切削除せず、ディスク上のデータやメタデータも削除しません。

1つ目は、`database.table` テーブルの `'replica_name'` レプリカのメタデータを削除します。
2つ目は、データベース内のすべてのレプリケートテーブルに対して同じ操作を行います。
3つ目は、ローカルサーバー上のすべてのレプリケートテーブルに対して同じ操作を行います。
4つ目は、テーブルの他のすべてのレプリカが削除されたあとに、ダウンしたレプリカのメタデータを削除する場合に有用です。テーブルパスを明示的に指定する必要があります。このパスは、テーブル作成時に `ReplicatedMergeTree` エンジンの第1引数として渡されたパスと同一でなければなりません。


## SYSTEM DROP DATABASE REPLICA {#drop-database-replica}

`Replicated` データベースの不要なレプリカは、以下の構文で削除できます。

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

`SYSTEM DROP REPLICA` と同様ですが、`DROP DATABASE` を実行する対象のデータベースが存在しない場合に、ZooKeeper から `Replicated` データベースのレプリカパスを削除します。なお、このステートメントは `ReplicatedMergeTree` のレプリカは削除しないため、必要に応じて `SYSTEM DROP REPLICA` も実行する必要があります。シャード名とレプリカ名は、データベース作成時に `Replicated` エンジンの引数として指定した名前です。また、これらの名前は `system.clusters` の `database_shard_name` および `database_replica_name` カラムから取得できます。`FROM SHARD` 句が省略された場合、`replica_name` は `shard_name|replica_name` 形式の完全なレプリカ名である必要があります。


## SYSTEM DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

非圧縮データキャッシュをクリアします。
非圧縮データキャッシュは、クエリ/ユーザー/プロファイルレベルの設定 [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache) によって有効化/無効化されます。
そのサイズは、サーバーレベルの設定 [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size) で設定できます。

## SYSTEM DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

コンパイル済み式キャッシュをクリアします。
コンパイル済み式キャッシュは、クエリ/ユーザー/プロファイルレベルの設定 [`compile_expressions`](../../operations/settings/settings.md#compile_expressions) によって有効化/無効化されます。

## SYSTEM DROP QUERY CONDITION CACHE {#drop-query-condition-cache}

クエリ条件キャッシュを消去します。

クエリ条件キャッシュをクリアします。

## SYSTEM DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
```

[query cache](../../operations/query-cache.md) をクリアします。
タグを指定した場合は、指定されたタグを持つクエリキャッシュエントリのみが削除されます。


## SYSTEM DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

[`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path)から読み込まれたスキーマのキャッシュをクリアします。

サポートされている対象:

* Protobuf: インポートされたProtobufメッセージ定義をメモリから削除します。
* Files: `format_schema_source` が `query` に設定されている場合に生成され、ローカルの [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path) に保存されているスキーマファイルのキャッシュを削除します。
  注意: 対象を指定しない場合、両方のキャッシュがクリアされます。

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf/Files]
```


## SYSTEM FLUSH LOGS {#flush-logs}

バッファされているログメッセージを `system.query_log` などの system テーブルにフラッシュします。多くの system テーブルはデフォルトのフラッシュ間隔が 7.5 秒に設定されているため、主にデバッグ時に役立ちます。
これにより、メッセージキューが空であっても system テーブルが作成されます。

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

すべてをフラッシュしたくない場合は、名前または対象テーブルを渡すことで、特定のログ（1つまたは複数）だけをフラッシュできます。

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```


## SYSTEM RELOAD CONFIG {#reload-config}

ClickHouseの設定を再読み込みします。設定がZooKeeperに保存されている場合に使用します。`SYSTEM RELOAD CONFIG` はZooKeeperに保存されている `USER` の設定は再読み込みせず、`users.xml` に保存されている `USER` の設定のみを再読み込みします。すべての `USER` 設定を再読み込むには `SYSTEM RELOAD USERS` を使用します。

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD USERS {#reload-users}

users.xml、ローカルディスクのアクセスストレージ、ZooKeeper上でレプリケートされているアクセスストレージなど、すべてのアクセスストレージを再読み込みします。

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```


## SYSTEM SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

ClickHouse を通常の方法でシャットダウンします（`service clickhouse-server stop` / `kill {$pid_clickhouse-server}` と同様に動作します）

## SYSTEM KILL {#kill}

ClickHouseプロセスを強制終了します（`kill -9 {$ pid_clickhouse-server}` のように動作します）。

## SYSTEM INSTRUMENT {#instrument}

ClickHouse を `ENABLE_XRAY=1` を指定してビルドした場合に利用可能な LLVM の XRay 機能を用いて、インストルメンテーションポイントを管理します。
これにより、ソースコードを変更することなく、かつ最小限のオーバーヘッドで、本番環境におけるデバッグとプロファイリングを行うことができます。
インストルメンテーションポイントが追加されていない場合、性能への影響はごくわずかです。これは、200 命令を超える長さの関数のプロローグとエピローグに対して、近傍のアドレスへの余分なジャンプが 1 回追加されるだけだからです。

### SYSTEM INSTRUMENT ADD {#instrument-add}

新しいインストルメンテーションポイントを追加します。インストルメント対象となった関数は、[`system.instrumentation`](../../operations/system-tables/instrumentation.md) システムテーブルで確認できます。同じ関数に対して複数のハンドラーを追加でき、インストルメンテーションが追加された順に実行されます。
インストルメント対象の関数は、[`system.symbols`](../../operations/system-tables/symbols.md) システムテーブルから収集できます。

関数に追加できるハンドラーの種類は 3 つあります。

**構文**

```sql
SYSTEM INSTRUMENT ADD FUNCTION HANDLER [PARAMETERS]
```

ここで、`FUNCTION` は `QueryMetricLog::startQuery` のような関数、または関数名の一部（サブストリング）を表し、handler には次のいずれかを指定します


#### LOG {#instrument-add-log}

関数の`ENTRY`または`EXIT`のタイミングで、引数として指定されたテキストとスタックトレースを出力します。

```sql
SYSTEM INSTRUMENT ADD `QueryMetricLog::startQuery` LOG ENTRY 'this is a log printed at entry'
SYSTEM INSTRUMENT ADD `QueryMetricLog::startQuery` LOG EXIT 'this is a log printed at exit'
```


#### SLEEP {#instrument-add-sleep}

`ENTRY` または `EXIT` のいずれかで、指定した秒数だけスリープします。

```sql
SYSTEM INSTRUMENT ADD `QueryMetricLog::startQuery` SLEEP ENTRY 0.5
```

または、最小値と最大値を空白で区切って指定することで、一様分布に従うランダムな秒数を与えることができます：

```sql
SYSTEM INSTRUMENT ADD `QueryMetricLog::startQuery` SLEEP ENTRY 0 1
```


#### PROFILE {#instrument-add-profile}

関数の`ENTRY`から`EXIT`までの処理に要した時間を計測します。
プロファイリング結果は [`system.trace_log`](../../operations/system-tables/trace_log.md) に保存され、
[Chrome Event Trace Format](../../operations/system-tables/trace_log.md#chrome-event-trace-format) に変換できます。

```sql
SYSTEM INSTRUMENT ADD `QueryMetricLog::startQuery` PROFILE
```


### SYSTEM INSTRUMENT REMOVE {#instrument-remove}

以下のいずれかの方法で、単一の計測ポイントを削除します。

```sql
SYSTEM INSTRUMENT REMOVE ID
```

いずれも `ALL` パラメータを使用します。

```sql
SYSTEM INSTRUMENT REMOVE ALL
```

または、サブクエリから得られる ID の集合：

```sql
SYSTEM INSTRUMENT REMOVE (SELECT id FROM system.instrumentation WHERE handler = 'log')
```

インストゥルメンテーションポイントのIDは、[`system.instrumentation`](../../operations/system-tables/instrumentation.md) システムテーブルから取得できます。


## 分散テーブルの管理 {#managing-distributed-tables}

ClickHouseは[分散](../../engines/table-engines/special/distributed.md)テーブルを管理できます。ユーザーがこれらのテーブルにデータを挿入すると、ClickHouseは最初にクラスターノードに送信すべきデータのキューを作成し、その後非同期に送信します。キュー処理は、[`STOP DISTRIBUTED SENDS`](#stop-distributed-sends)、[FLUSH DISTRIBUTED](#flush-distributed)、[`START DISTRIBUTED SENDS`](#start-distributed-sends) クエリで管理できます。また、[`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert) 設定を使用して、分散データを同期的に挿入することもできます。

### SYSTEM STOP DISTRIBUTED SENDS {#stop-distributed-sends}

分散テーブルへのデータ挿入時に、バックグラウンドでのデータ配信を無効化します。

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
[`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica)が有効な場合(デフォルト)、ローカル分片へのデータは挿入されます。
:::


### SYSTEM FLUSH DISTRIBUTED {#flush-distributed}

ClickHouseにクラスタノードへのデータ送信を同期的に実行させます。いずれかのノードが利用できない場合、ClickHouseは例外をスローし、クエリの実行を停止します。すべてのノードがオンラインに復旧すると成功するため、それまでクエリを再試行できます。

一部の設定は `SETTINGS` 句で上書きすることもできます。これは、一時的な制限（`max_concurrent_queries_for_all_users` や `max_memory_usage` など）を回避するのに有用です。

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
保留中の各ブロックは、最初の INSERT クエリの設定でディスクに保存されます。そのため、場合によっては設定を上書きする必要が生じることがあります。
:::


### SYSTEM START DISTRIBUTED SENDS {#start-distributed-sends}

分散テーブルへのデータ挿入時に、バックグラウンドでのデータ配信を有効化します。

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```


### SYSTEM STOP LISTEN {#stop-listen}

指定されたポートおよびプロトコルでソケットをクローズし、既存のサーバーへの接続を正常に終了します。

ただし、対応するプロトコル設定が clickhouse-server設定で指定されていない場合、このコマンドは何の効果もありません。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

* `CUSTOM 'protocol'` 修飾子が指定されている場合、サーバー設定のプロトコルセクションで定義された指定名のカスタムプロトコルが停止されます。
* `QUERIES ALL [EXCEPT .. [,..]]` 修飾子が指定されている場合、`EXCEPT` 句で指定されたものを除き、すべてのプロトコルが停止されます。
* `QUERIES DEFAULT [EXCEPT .. [,..]]` 修飾子が指定されている場合、`EXCEPT` 句で指定されたものを除き、すべてのデフォルトプロトコルが停止されます。
* `QUERIES CUSTOM [EXCEPT .. [,..]]` 修飾子が指定されている場合、`EXCEPT` 句で指定されたものを除き、すべてのカスタムプロトコルが停止されます。


### SYSTEM START LISTEN {#start-listen}

指定されたプロトコルで新しい接続を受け付けられるようにします。

ただし、指定したポートとプロトコルのサーバーが SYSTEM STOP LISTEN コマンドで停止されていない場合、このコマンドは何の効果もありません。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```


## MergeTreeテーブルの管理 {#managing-mergetree-tables}

ClickHouseは[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルにおけるバックグラウンドプロセスを管理できます。

### SYSTEM STOP MERGES {#stop-merges}

<CloudNotSupportedBadge />

MergeTree ファミリーのテーブルに対するバックグラウンドマージ処理を停止するためのコマンドです。

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
テーブルに対して `DETACH/ATTACH` を実行すると、すべての MergeTreeテーブルのマージが停止されている場合でも、そのテーブルのバックグラウンドでのマージ処理が開始されます。
:::


### SYSTEM START MERGES {#start-merges}

<CloudNotSupportedBadge />

MergeTree ファミリーのテーブルに対してバックグラウンドマージを開始するためのコマンドです。

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```


### SYSTEM STOP TTL MERGES {#stop-ttl-merges}

MergeTreeファミリーのテーブルに対して、[TTL expression](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) に従って古いデータをバックグラウンドで削除する処理を停止します。
テーブルが存在しない場合や、テーブルがMergeTreeエンジンではない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM START TTL MERGES {#start-ttl-merges}

MergeTreeファミリーに属するテーブルに対して、[TTL expression](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) に従って古いデータのバックグラウンド削除を開始します。
テーブルが存在しない場合でも `Ok.` を返し、データベースが存在しない場合はエラーを返します。

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM STOP MOVES {#stop-moves}

MergeTreeファミリーのテーブルに対して、[TO VOLUME または TO DISK 句を含む有効期限 (TTL) テーブル式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) に基づくバックグラウンドでのデータ移動を停止するためのコマンドです。
テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM START MOVES {#start-moves}

MergeTree ファミリーのテーブルに対して、[TO VOLUME および TO DISK 句を含む TTL テーブル式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) に従い、バックグラウンドでデータ移動を開始します。
テーブルが存在しない場合でも `Ok.` を返しますが、データベースが存在しない場合はエラーを返します。

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM SYSTEM UNFREEZE {#query_language-system-unfreeze}

指定された名前の凍結されたバックアップを、すべてのディスクから削除します。個別のパーツを凍結解除する方法については、[ALTER TABLE table&#95;name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition) を参照してください。

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```


### SYSTEM WAIT LOADING PARTS {#wait-loading-parts}

テーブル内で非同期に読み込み中のすべてのデータパーツ（古いデータパーツ）の読み込みが完了するまで待機します。

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```


## ReplicatedMergeTreeテーブルの管理 {#managing-replicatedmergetree-tables}

ClickHouseは、[ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication)テーブルに関連するバックグラウンドのレプリケーション処理を管理できます。

### SYSTEM STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge />

`ReplicatedMergeTree` ファミリーのテーブルにおいて、挿入されたパーツのバックグラウンドフェッチを停止します。
テーブルエンジンの種類や、テーブルやデータベースの存在有無にかかわらず、常に `Ok.` を返します。

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START FETCHES {#start-fetches}

<CloudNotSupportedBadge />

`ReplicatedMergeTree`ファミリーのテーブルにおいて、挿入されたパーツのバックグラウンドフェッチを開始します。
テーブルエンジンの種類や、テーブルやデータベースの存在有無にかかわらず、常に `Ok.` を返します。

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM STOP REPLICATED SENDS {#stop-replicated-sends}

`ReplicatedMergeTree` ファミリーのテーブルで、新しく挿入されたパーツをクラスタ内の他のレプリカへバックグラウンド送信する処理を停止します。

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START REPLICATED SENDS {#start-replicated-sends}

`ReplicatedMergeTree` ファミリーのテーブルに対して、新しく挿入されたパーツをクラスタ内の他のレプリカへ送信するバックグラウンド処理を開始します。

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM STOP REPLICATION QUEUES {#stop-replication-queues}

`ReplicatedMergeTree` ファミリーのテーブルについて、ZooKeeper に保存されているレプリケーションキュー内のバックグラウンドフェッチタスクを停止できます。対象となるバックグラウンドタスクの種類は、マージ、フェッチ、ミューテーション、ON CLUSTER 句付きの DDL ステートメントです。

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START REPLICATION QUEUES {#start-replication-queues}

`ReplicatedMergeTree` ファミリーのテーブルについて、ZooKeeper に保存されているレプリケーションキューからバックグラウンドでのフェッチタスクを開始する機能を提供します。可能なバックグラウンドタスクの種類は、マージ、フェッチ、ミューテーション、ON CLUSTER 句付きの DDL ステートメントです。

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

`ReplicatedMergeTree`テーブルで、レプリケーションログからレプリケーションキューへの新規エントリの取り込みを停止します。

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START PULLING REPLICATION LOG {#start-pulling-replication-log}

`SYSTEM STOP PULLING REPLICATION LOG` を解除します。

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM SYNC REPLICA {#sync-replica}

`ReplicatedMergeTree`テーブルがクラスタ内の他のレプリカと同期されるまで待機しますが、`receive_timeout` 秒を上限とします。

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [IF EXISTS] [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

このステートメントを実行すると、`[db.]replicated_merge_tree_family_table_name` は共通のレプリケーションログからコマンドを自身のレプリケーションキューにフェッチし、その後クエリはレプリカがフェッチされたすべてのコマンドを処理するまで待機します。以下の修飾子がサポートされています。

* `IF EXISTS`（25.6 以降で利用可能）を指定すると、テーブルが存在しない場合でもクエリはエラーを発生させません。これは、新しいレプリカをクラスターに追加する際、すでにクラスター設定の一部になっているものの、まだテーブルの作成と同期の途中である場合に有用です。
* `STRICT` 修飾子が指定された場合、クエリはレプリケーションキューが空になるまで待機します。レプリケーションキューに新しいエントリが継続的に追加される場合、`STRICT` バージョンは完了しない可能性があります。
* `LIGHTWEIGHT` 修飾子が指定された場合、クエリは `GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE`、`DROP_PART` エントリが処理されるまでのみ待機します。
  加えて、`LIGHTWEIGHT` 修飾子はオプションの FROM &#39;srcReplicas&#39; 句をサポートします。ここで &#39;srcReplicas&#39; は、ソースレプリカ名のカンマ区切りリストです。この拡張により、指定されたソースレプリカから発生したレプリケーションタスクのみに対象を絞ることで、より的を絞った同期が可能になります。
* `PULL` 修飾子が指定された場合、クエリは ZooKeeper から新しいレプリケーションキューエントリをフェッチしますが、いずれのエントリの処理完了も待機しません。


### SYNC DATABASE REPLICA {#sync-database-replica}

指定された[レプリケートデータベース](/engines/database-engines/replicated)が、そのデータベースの DDL キューにあるすべてのスキーマ変更の適用を完了するまで待機します。

**構文**

```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```


### SYSTEM RESTART REPLICA {#restart-replica}

`ReplicatedMergeTree` テーブルに対して ZooKeeper セッションの状態を再初期化します。現在の状態を信頼できる唯一の情報源である ZooKeeper と比較し、必要に応じて ZooKeeper キューにタスクを追加します。
ZooKeeper のデータに基づくレプリケーションキューの初期化は、`ATTACH TABLE` ステートメントの場合と同じ方法で行われます。短時間のあいだ、そのテーブルはあらゆる操作に対して利用できなくなります。

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```


### SYSTEM RESTORE REPLICA {#restore-replica}

データは存在している可能性があるが、ZooKeeper のメタデータが失われたレプリカを復元します。

`ReplicatedMergeTree` の読み取り専用テーブルでのみ動作します。

次のような状況が発生した後に、このクエリを実行できます:

- ZooKeeper ルート `/` の消失。
- レプリカパス `/replicas` の消失。
- 個々のレプリカパス `/replicas/replica_name/` の消失。

レプリカはローカルで見つかったパーツをアタッチして、それらに関する情報を ZooKeeper に送信します。
メタデータの消失前にレプリカ上に存在していたパーツは、古くなっていない限り他のレプリカから再取得されません（そのため、レプリカの復元は、すべてのデータをネットワーク越しに再ダウンロードすることを意味しません）。

:::note
あらゆる状態のパーツは `detached/` ディレクトリに移動されます。データ消失前にアクティブ（コミット済み）だったパーツがアタッチされます。
:::

### SYSTEM RESTORE DATABASE REPLICA {#restore-database-replica}

データは存在している可能性があるが、Zookeeperのメタデータが失われた場合にレプリカを復元します。

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

別の構文:

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**例**

複数のサーバーでテーブルを作成します。ZooKeeper 内のレプリカのメタデータが失われると、そのテーブルはメタデータがない状態のため読み取り専用としてアタッチされます。最後のクエリはすべてのレプリカで実行する必要があります。

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


### SYSTEM RESTART REPLICAS {#restart-replicas}

すべての `ReplicatedMergeTree`テーブルに対してZooKeeperセッションの状態を再初期化します。現在の状態を、正とみなすZooKeeper上の状態と比較し、必要に応じてタスクをZooKeeperキューに追加します。

### SYSTEM DROP FILESYSTEM CACHE {#drop-filesystem-cache}

このコマンドにより、ファイルシステムキャッシュを削除できます。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```


### SYSTEM SYNC FILE CACHE {#sync-file-cache}

:::note
負荷が大きく、悪用されるおそれがあります。
:::

`sync` システムコールを実行します。

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```


### SYSTEM LOAD PRIMARY KEY {#load-primary-key}

指定したテーブル、またはすべてのテーブルのプライマリキーをロードします。

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```


### SYSTEM UNLOAD PRIMARY KEY {#unload-primary-key}

指定したテーブル、またはすべてのテーブルについてプライマリキーをアンロードします。

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```


## リフレッシャブルmaterialized viewの管理 {#refreshable-materialized-views}

[リフレッシャブルmaterialized view](../../sql-reference/statements/create/view.md#refreshable-materialized-view)によって実行されるバックグラウンドタスクを制御するためのコマンドです。

これらを使用する際は、[`system.view_refreshes`](../../operations/system-tables/view_refreshes.md) を監視してください。

### SYSTEM REFRESH VIEW {#refresh-view}

指定した VIEW のスケジュール外リフレッシュを即時に実行します。

```sql
SYSTEM REFRESH VIEW [db.]name
```


### SYSTEM WAIT VIEW {#wait-view}

現在実行中のリフレッシュが完了するまで待機します。リフレッシュが失敗した場合は例外をスローします。リフレッシュが実行されていない場合は即座に終了し、前回のリフレッシュが失敗している場合は例外をスローします。

### SYSTEM STOP [REPLICATED] VIEW, STOP VIEWS {#stop-view-stop-views}

指定したVIEW、またはすべての更新可能なVIEWの定期的な更新を無効化します。更新処理が進行中の場合は、その処理も中断します。

VIEWがReplicatedまたはSharedデータベース内にある場合、`STOP VIEW`は現在のレプリカにのみ影響し、`STOP REPLICATED VIEW`はすべてのレプリカに影響します。

```sql
SYSTEM STOP VIEW [db.]name
```

```sql
SYSTEM STOP VIEWS
```


### SYSTEM START [REPLICATED] VIEW, START VIEWS {#start-view-start-views}

指定された VIEW、またはすべてのリフレッシュ可能な VIEW に対して、定期的なリフレッシュを有効にします。即時のリフレッシュは実行されません。

VIEW が Replicated または Shared データベース内にある場合、`START VIEW` は `STOP VIEW` の効果を元に戻し、`START REPLICATED VIEW` は `STOP REPLICATED VIEW` の効果を元に戻します。

```sql
SYSTEM START VIEW [db.]name
```

```sql
SYSTEM START VIEWS
```


### SYSTEM CANCEL VIEW {#cancel-view}

現在のレプリカ上で指定されたビューのリフレッシュ処理が進行中であれば、それを中断してキャンセルします。進行中でなければ、何も行いません。

```sql
SYSTEM CANCEL VIEW [db.]name
```


### SYSTEM WAIT VIEW {#system-wait-view}

実行中のリフレッシュが完了するまで待機します。リフレッシュが実行されていない場合は、即座に戻ります。直近のリフレッシュ試行が失敗している場合は、エラーを返します。

新しいリフレッシャブルmaterialized viewをEMPTYキーワードなしで作成した直後に、初回リフレッシュの完了を待つために使用できます。

VIEWがReplicatedまたはSharedデータベースにあり、別のレプリカでリフレッシュが実行されている場合、そのリフレッシュが完了するまで待機します。

```sql
SYSTEM WAIT VIEW [db.]name
```
