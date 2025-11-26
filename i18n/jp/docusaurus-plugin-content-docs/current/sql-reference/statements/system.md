---
description: 'SYSTEM ステートメントに関するドキュメント'
sidebar_label: 'SYSTEM'
sidebar_position: 36
slug: /sql-reference/statements/system
title: 'SYSTEM ステートメント'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SYSTEM 文

## SYSTEM RELOAD EMBEDDED DICTIONARIES \{#reload-embedded-dictionaries\}

すべての[内部辞書](../../sql-reference/dictionaries/index.md)を再読み込みします。
デフォルトでは、内部辞書は無効になっています。
内部辞書の更新結果に関係なく、常に `Ok.` を返します。

## SYSTEM RELOAD DICTIONARIES

`SYSTEM RELOAD DICTIONARIES` クエリは、ステータスが `LOADED` の辞書（[`system.dictionaries`](/operations/system-tables/dictionaries) の `status` 列を参照）をリロードします。つまり、これまでに正常にロードされた辞書が対象となります。
デフォルトでは、辞書は遅延ロードされます（[dictionaries&#95;lazy&#95;load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load) を参照）。そのため、起動時に自動的にロードされるのではなく、[`dictGet`](/sql-reference/functions/ext-dict-functions#dictGet) 関数の初回呼び出し時、または `ENGINE = Dictionary` を持つテーブルに対する `SELECT` の初回実行時に初期化されます。

**構文**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD DICTIONARY

辞書 `dictionary_name` を、その状態（LOADED / NOT&#95;LOADED / FAILED）に関係なく完全に再読み込みします。
辞書の更新結果にかかわらず、常に `Ok.` を返します。

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

辞書のステータスは、`system.dictionaries` テーブルをクエリして確認できます。

```sql
SELECT name, status FROM system.dictionaries;
```


## SYSTEM RELOAD MODELS

:::note
このステートメントおよび `SYSTEM RELOAD MODEL` は、catboost モデルを単に clickhouse-library-bridge からアンロードするだけです。関数 `catboostEvaluate()` は、まだロードされていない場合、初回アクセス時にモデルをロードします。
:::

すべての CatBoost モデルをアンロードします。

**構文**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD MODEL

`model_path` で指定された CatBoost モデルをアンロードします。

**構文**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```


## SYSTEM RELOAD FUNCTIONS

登録されている[実行可能ユーザー定義関数](/sql-reference/functions/udf#executable-user-defined-functions)を、設定ファイルからすべて、または特定の1つを再読み込みします。

**構文**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```


## SYSTEM RELOAD ASYNCHRONOUS METRICS

すべての[非同期メトリクス](../../operations/system-tables/asynchronous_metrics.md)を再計算します。非同期メトリクスは設定項目 [asynchronous&#95;metrics&#95;update&#95;period&#95;s](../../operations/server-configuration-parameters/settings.md) に基づいて定期的に更新されるため、このステートメントを使用して手動で更新する必要が生じることは通常ありません。

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```


## SYSTEM DROP DNS CACHE \{#drop-dns-cache\}

ClickHouse の内部 DNS キャッシュをクリアします。インフラストラクチャの変更時（別の ClickHouse サーバーやディクショナリで使用されるサーバーの IP アドレスを変更する場合など）には、このコマンドを使用する必要が生じることがあります（特に古い ClickHouse バージョンで発生することがあります）。

より便利な（自動的な）キャッシュ管理については、`disable_internal_dns_cache`、`dns_cache_max_entries`、`dns_cache_update_period` パラメータを参照してください。

## SYSTEM DROP MARK CACHE \{#drop-mark-cache\}

マークキャッシュを削除します。

## SYSTEM DROP ICEBERG METADATA CACHE \{#drop-iceberg-metadata-cache\}

Iceberg メタデータキャッシュを消去します。

## SYSTEM DROP TEXT INDEX DICTIONARY CACHE \{#drop-text-index-dictionary-cache\}

テキストインデックス辞書キャッシュをクリアします。

## SYSTEM DROP TEXT INDEX HEADER CACHE \{#drop-text-index-header-cache\}

テキストインデックスのヘッダーキャッシュをクリアします。

## SYSTEM DROP TEXT INDEX POSTINGS CACHE \{#drop-text-index-postings-cache\}

テキストインデックスのポスティングキャッシュを消去します。

## SYSTEM DROP TEXT INDEX CACHES \{#drop-text-index-caches\}

テキストインデックスのヘッダーキャッシュ、辞書キャッシュ、およびポスティングキャッシュを消去します。

## SYSTEM DROP REPLICA

`ReplicatedMergeTree` テーブルのデッドレプリカは、次の構文を使って削除できます。

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

クエリは、ZooKeeper 内の `ReplicatedMergeTree` のレプリカパスを削除します。これは、レプリカがダウンしていて、もはやそのテーブルが存在しないために `DROP TABLE` では ZooKeeper からメタデータを削除できない場合に有用です。このクエリで削除されるのは非アクティブ／古いレプリカのみであり、ローカルレプリカは削除できません。その場合は `DROP TABLE` を使用してください。`DROP REPLICA` はテーブル自体をいっさい削除せず、ディスク上のデータやメタデータも削除しません。

1つ目のクエリは、`database.table` テーブルの `'replica_name'` レプリカのメタデータを削除します。
2つ目は、データベース内のすべてのレプリケートされたテーブルに対して同じ操作を行います。
3つ目は、ローカルサーバー上のすべてのレプリケートされたテーブルに対して同じ操作を行います。
4つ目は、テーブルの他のすべてのレプリカが削除された後に、ダウンしたレプリカのメタデータを削除するのに有用です。この場合、テーブルパスを明示的に指定する必要があります。これは、テーブル作成時に `ReplicatedMergeTree` エンジンの第1引数として渡されたパスと同一でなければなりません。


## SYSTEM DROP DATABASE REPLICA

`Replicated` データベースの無効になったレプリカは、次の構文を使用して削除できます。

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

`SYSTEM DROP REPLICA` に似ていますが、`DROP DATABASE` を実行対象とするデータベースが存在しない場合に ZooKeeper から `Replicated` データベースレプリカのパスを削除します。なお、これは `ReplicatedMergeTree` のレプリカは削除しない点に注意してください（そのため、`SYSTEM DROP REPLICA` も併せて必要になる場合があります）。シャード名およびレプリカ名は、データベース作成時に `Replicated` エンジンの引数で指定された名前です。また、これらの名前は `system.clusters` の `database_shard_name` 列および `database_replica_name` 列から取得することもできます。`FROM SHARD` 句が省略されている場合、`replica_name` は `shard_name|replica_name` 形式の完全なレプリカ名でなければなりません。


## SYSTEM DROP UNCOMPRESSED CACHE \{#drop-uncompressed-cache\}

非圧縮データキャッシュをクリアします。
非圧縮データキャッシュは、クエリ / ユーザー / プロファイルレベルの設定 [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache) で有効 / 無効を切り替えられます。
そのサイズは、サーバーレベルの設定 [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size) で設定できます。

## SYSTEM DROP COMPILED EXPRESSION CACHE \{#drop-compiled-expression-cache\}

コンパイル済み式キャッシュをクリアします。
コンパイル済み式キャッシュは、クエリ／ユーザー／プロファイルレベルの設定 [`compile_expressions`](../../operations/settings/settings.md#compile_expressions) によって有効または無効にできます。

## SYSTEM DROP QUERY CONDITION CACHE \{#drop-query-condition-cache\}

クエリ条件キャッシュを消去します。

## SYSTEM DROP QUERY CACHE

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
```

[クエリキャッシュ](../../operations/query-cache.md)をクリアします。
タグが指定された場合、指定したタグを持つクエリキャッシュエントリのみが削除されます。


## SYSTEM DROP FORMAT SCHEMA CACHE

[`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path) から読み込まれたスキーマのキャッシュをクリアします。

サポートされる対象:

* Protobuf: インポートされた Protobuf メッセージ定義をメモリから削除します。
* Files: `format_schema_source` が `query` に設定されている場合に生成され、ローカルの [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path) に保存されているスキーマファイルのキャッシュを削除します。\
  注記: 対象を指定しない場合、両方のキャッシュがクリアされます。

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf/Files]
```


## SYSTEM FLUSH LOGS

バッファリングされたログメッセージを `system.query_log` などのシステムテーブルにフラッシュします。ほとんどのシステムテーブルにはデフォルトで 7.5 秒のフラッシュ間隔が設定されているため、主にデバッグ目的で有用です。
メッセージキューが空であっても、この操作を実行するとシステムテーブルが作成されます。

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

すべてのログをフラッシュしたくない場合は、名前または対象テーブルを指定して、1 つまたは複数の個別のログだけをフラッシュできます。

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```


## SYSTEM RELOAD CONFIG

ClickHouse の設定を再読み込みします。設定が ZooKeeper に保存されている場合に使用します。`SYSTEM RELOAD CONFIG` は ZooKeeper に保存されている `USER` 設定は再読み込みせず、`users.xml` に保存されている `USER` 設定のみを再読み込みします。すべての `USER` 設定を再読み込むには `SYSTEM RELOAD USERS` を使用します。

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD USERS

すべてのアクセスストレージを再読み込みします。対象には `users.xml`、ローカルディスクのアクセスストレージ、ZooKeeper 上でレプリケートされるアクセスストレージが含まれます。

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```


## SYSTEM SHUTDOWN \{#shutdown\}

<CloudNotSupportedBadge/>

通常どおり ClickHouse をシャットダウンします（`service clickhouse-server stop` や `kill {$pid_clickhouse-server}` コマンドの実行と同様です）。

## SYSTEM KILL \{#kill\}

ClickHouse プロセスを強制終了します（`kill -9 {$ pid_clickhouse-server}` と同様です）

## 分散テーブルの管理 \{#managing-distributed-tables\}

ClickHouse は [distributed](../../engines/table-engines/special/distributed.md) テーブルを管理できます。ユーザーがこれらのテーブルにデータを挿入すると、ClickHouse はまずクラスタノードに送信するデータのキューを作成し、その後非同期的に送信します。キュー処理は、[`STOP DISTRIBUTED SENDS`](#stop-distributed-sends)、[FLUSH DISTRIBUTED](#flush-distributed)、[`START DISTRIBUTED SENDS`](#start-distributed-sends) クエリで制御できます。[`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert) 設定を使用すると、分散データを同期的に挿入することもできます。

### SYSTEM STOP DISTRIBUTED SENDS

分散テーブルへのデータ挿入時に行われるバックグラウンドでのデータ分散送信を無効化します。

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
[`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica) が有効になっている場合（デフォルトの設定）、データは必ずローカルシャードに挿入されます。
:::


### SYSTEM FLUSH DISTRIBUTED

ClickHouse にクラスタ内のノードへ同期的にデータを送信させます。いずれかのノードが利用できない場合、ClickHouse は例外をスローしてクエリの実行を停止します。すべてのノードがオンラインに戻ればクエリは成功するため、それまでクエリを再試行できます。

`SETTINGS` 句を使用して一部の設定を上書きすることもできます。これは、一時的な制限（`max_concurrent_queries_for_all_users` や `max_memory_usage` など）を回避するのに役立ちます。

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<分散テーブル名> [ON CLUSTER クラスター名] [SETTINGS ...]
```

:::note
各保留中のブロックは、最初の INSERT クエリの設定でディスク上に保存されます。そのため、状況によっては設定を上書きしたいケースが生じることがあります。
:::


### SYSTEM START DISTRIBUTED SENDS

分散テーブルにデータを挿入する際に、バックグラウンドでのデータ送信を有効にします。

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```


### SYSTEM STOP LISTEN

ソケットをクローズし、指定されたプロトコルおよびポートでサーバーへの既存の接続をグレースフルに終了します。

ただし、対応するプロトコル設定が `clickhouse-server` の設定内で指定されていない場合、このコマンドは何の効果もありません。

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

* `CUSTOM 'protocol'` 修飾子が指定された場合、サーバー設定の `protocols` セクションで定義された、指定された名前のカスタムプロトコルが停止されます。
* `QUERIES ALL [EXCEPT .. [,..]]` 修飾子が指定された場合、`EXCEPT` 句で指定されたものを除き、すべてのプロトコルが停止されます。
* `QUERIES DEFAULT [EXCEPT .. [,..]]` 修飾子が指定された場合、`EXCEPT` 句で指定されたものを除き、すべてのデフォルトプロトコルが停止されます。
* `QUERIES CUSTOM [EXCEPT .. [,..]]` 修飾子が指定された場合、`EXCEPT` 句で指定されたものを除き、すべてのカスタムプロトコルが停止されます。


### SYSTEM START LISTEN

指定されたプロトコルで新しい接続の確立を許可します。

ただし、指定されたポートおよびプロトコルで動作しているサーバーが SYSTEM STOP LISTEN コマンドで停止されていない場合、このコマンドは何の効果もありません。

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```


## MergeTree テーブルの管理 \{#managing-mergetree-tables\}

ClickHouse は、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのバックグラウンドプロセスを管理できます。

### SYSTEM STOP MERGES

<CloudNotSupportedBadge />

MergeTree ファミリーのテーブルに対して、バックグラウンドでのマージ処理を停止することができます。

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
テーブルに対して `DETACH / ATTACH` 操作を行うと、すべての MergeTree テーブルでマージが停止されている場合でも、そのテーブルのバックグラウンドマージが開始されます。
:::


### SYSTEM START MERGES

<CloudNotSupportedBadge />

MergeTree ファミリーのテーブルでバックグラウンドマージを開始できます。

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```


### SYSTEM STOP TTL MERGES

MergeTree ファミリーのテーブルに対して、[TTL 式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) に従って古いデータをバックグラウンドで削除する処理を停止します。
テーブルが存在しない場合、またはテーブルが MergeTree エンジンを使用していない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM START TTL MERGES

MergeTree ファミリーのテーブルに対して、[TTL 式](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) に従って古いデータをバックグラウンドで削除する処理を開始します。
テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM STOP MOVES

MergeTree ファミリーに属するテーブルに対して、[TO VOLUME または TO DISK 句を持つ TTL テーブル式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) に基づくバックグラウンドでのデータ移動を停止できます。
テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM START MOVES

MergeTree ファミリーのテーブルに対して、[TO VOLUME および TO DISK 句を含む TTL テーブル式](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) に従ったバックグラウンドでのデータ移動を開始します。
テーブルが存在しない場合でも `Ok.` を返します。データベースが存在しない場合はエラーを返します。

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM SYSTEM UNFREEZE

指定した名前の凍結バックアップを、すべてのディスクから削除します。個々のパーツの凍結解除については、[ALTER TABLE table&#95;name UNFREEZE WITH NAME](/sql-reference/statements/alter/partition#unfreeze-partition) を参照してください。

```sql
SYSTEM UNFREEZE WITH NAME <バックアップ名>
```


### SYSTEM WAIT LOADING PARTS

テーブル内の非同期で読み込み中のすべてのデータパーツ（古いデータパーツ）の読み込みが完了するまで待機します。

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```


## ReplicatedMergeTree テーブルの管理 \{#managing-replicatedmergetree-tables\}

ClickHouse は、[ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) テーブルにおけるバックグラウンドでのレプリケーション関連プロセスを管理できます。

### SYSTEM STOP FETCHES

<CloudNotSupportedBadge />

`ReplicatedMergeTree` ファミリーのテーブルに対して、挿入されたパーツのバックグラウンドでのフェッチ処理を停止するためのコマンドです。
テーブルエンジンに関係なく、またテーブルやデータベースが存在しない場合でも、常に `Ok.` を返します。

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START FETCHES

<CloudNotSupportedBadge />

`ReplicatedMergeTree` ファミリーに属するテーブルに対して、挿入済みパーツのバックグラウンドでのフェッチを開始できます。
テーブルエンジンの種類に関係なく、テーブルやデータベースが存在しない場合でも、常に `Ok.` を返します。

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM STOP REPLICATED SENDS

`ReplicatedMergeTree` ファミリーのテーブルに対して、新規に挿入されたパーツをクラスタ内の他のレプリカへバックグラウンドで送信する処理を停止できるようにします。

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START REPLICATED SENDS

`ReplicatedMergeTree` ファミリーのテーブルに対して、新しく挿入されたパーツをクラスタ内の他のレプリカへバックグラウンドで送信し始めることを可能にします。

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM STOP REPLICATION QUEUES

`ReplicatedMergeTree` ファミリーのテーブルについて、ZooKeeper に保存されているレプリケーションキューにあるバックグラウンドのフェッチタスクを停止することができます。バックグラウンドタスクの種類には、マージ、フェッチ、ミューテーション、ON CLUSTER 句を伴う DDL ステートメントがあります。

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START REPLICATION QUEUES

`ReplicatedMergeTree` ファミリーに属するテーブルについて、ZooKeeper に保存されているレプリケーションキューからバックグラウンドのフェッチタスクを開始できるようにします。バックグラウンドで実行されるタスクの種類には、マージ、フェッチ、ミューテーション、ON CLUSTER 句付きの DDL ステートメントがあります。

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM STOP PULLING REPLICATION LOG

`ReplicatedMergeTree` テーブルにおいて、レプリケーションログからレプリケーションキューへの新しいエントリの読み込み処理を停止します。

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START PULLING REPLICATION LOG

`SYSTEM STOP PULLING REPLICATION LOG` コマンドを取り消します。

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM SYNC REPLICA

`ReplicatedMergeTree` テーブルがクラスター内の他のレプリカと同期し終えるまで待機しますが、`receive_timeout` 秒以上は待機しません。

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [IF EXISTS] [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

このステートメントを実行すると、`[db.]replicated_merge_tree_family_table_name` は共通のレプリケーションログからコマンドを取得して自身のレプリケーションキューに取り込み、その後、取得したすべてのコマンドをレプリカが処理し終えるまでクエリは待機します。次の修飾子がサポートされています：

* `IF EXISTS`（25.6 以降で利用可能）を指定すると、テーブルが存在しない場合でもクエリはエラーを返しません。これは、新しいレプリカをクラスタに追加する際、すでにクラスタ設定には含まれているものの、テーブルの作成と同期処理がまだ進行中である場合に有用です。
* `STRICT` 修飾子が指定されている場合、クエリはレプリケーションキューが空になるまで待機します。レプリケーションキューに新しいエントリが継続的に追加される状況では、`STRICT` 指定時のクエリは完了しない可能性があります。
* `LIGHTWEIGHT` 修飾子が指定されている場合、クエリは `GET_PART`、`ATTACH_PART`、`DROP_RANGE`、`REPLACE_RANGE`、`DROP_PART` エントリが処理されるのを待つだけです。
  さらに、`LIGHTWEIGHT` 修飾子はオプションの `FROM 'srcReplicas'` 句をサポートしており、`'srcReplicas'` はソースレプリカ名のカンマ区切りリストです。この拡張により、指定されたソースレプリカから発生したレプリケーションタスクのみに対象を絞って同期を行うことができます。
* `PULL` 修飾子が指定されている場合、クエリは ZooKeeper から新しいレプリケーションキューエントリを取得しますが、それらが処理されるのを待機しません。


### SYNC DATABASE REPLICA

指定された[レプリケーテッドデータベース](/engines/database-engines/replicated)が、そのデータベースの DDL キューからのすべてのスキーマ変更の適用を完了するまで待機します。

**構文**

```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```


### SYSTEM RESTART REPLICA

`ReplicatedMergeTree` テーブルに対して ZooKeeper セッションの状態を再初期化できるようにします。現在の状態を「ソース・オブ・トゥルース」である ZooKeeper と比較し、必要に応じてタスクを ZooKeeper のキューに追加します。
ZooKeeper 上のデータに基づくレプリケーションキューの初期化は、`ATTACH TABLE` ステートメントの場合と同じ方法で行われます。短時間の間、そのテーブルはすべての操作に対して利用できなくなります。

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```


### SYSTEM RESTORE REPLICA \{#restore-replica\}

データは[存在している可能性があるが]、ZooKeeper のメタデータが失われた場合にレプリカを復元します。

読み取り専用の `ReplicatedMergeTree` テーブルに対してのみ動作します。

次のような状況の後にクエリを実行できます：

- ZooKeeper ルート `/` の消失。
- レプリカパス `/replicas` の消失。
- 個々のレプリカパス `/replicas/replica_name/` の消失。

レプリカはローカルで見つかったパーツをアタッチし、それらに関する情報を ZooKeeper に送信します。
メタデータ消失前にレプリカ上に存在していたパーツは、古くなっていない限り他のレプリカから再取得されません（つまり、レプリカの復元はネットワーク越しにすべてのデータを再ダウンロードすることを意味しません）。

:::note
状態にかかわらずすべてのパーツは `detached/` ディレクトリに移動されます。データ消失前にアクティブだった（コミット済みの）パーツがアタッチされます。
:::

### SYSTEM RESTORE DATABASE REPLICA

データは存在している可能性があるが ZooKeeper メタデータが失われているレプリカを復元します。

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

-- zookeeper_delete_path("/clickhouse/repl_db", recursive=True) <- ルート喪失

SYSTEM RESTORE DATABASE REPLICA repl_db;
```

**構文**

```sql
SYSTEM RESTORE REPLICA [db.]replicated_merge_tree_family_table_name [ON CLUSTER cluster_name]
```

別の書き方：

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**例**

複数のサーバー上にテーブルを作成します。ZooKeeper 上のレプリカのメタデータが失われた場合、メタデータが欠落しているため、そのテーブルは読み取り専用としてアタッチされます。最後のクエリはすべてのレプリカで実行する必要があります。

```sql
CREATE TABLE test(n UInt32)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/test/', '{replica}')
ORDER BY n PARTITION BY n % 10;

INSERT INTO test SELECT * FROM numbers(1000);

-- zookeeper_delete_path("/clickhouse/tables/test", recursive=True) <- ルートの損失

SYSTEM RESTART REPLICA test;
SYSTEM RESTORE REPLICA test;
```

別の方法:

```sql
SYSTEM RESTORE REPLICA test ON CLUSTER cluster;
```


### SYSTEM RESTART REPLICAS \{#restart-replicas\}

すべての `ReplicatedMergeTree` テーブルに対して Zookeeper セッションの状態を再初期化できるようにします。現在の状態を信頼できる唯一の情報源である Zookeeper 上の状態と比較し、必要に応じて Zookeeper キューにタスクを追加します。

### SYSTEM DROP FILESYSTEM CACHE

ファイルシステムキャッシュを破棄します。

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```


### SYSTEM SYNC FILE CACHE

:::note
負荷が高く、悪用されるおそれがあります。
:::

`sync` システムコールを呼び出します。

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```


### SYSTEM LOAD PRIMARY KEY

指定したテーブル、またはすべてのテーブルの主キーを読み込みます。

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```


### SYSTEM UNLOAD PRIMARY KEY

指定したテーブルまたはすべてのテーブルのプライマリキーをアンロードします。

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```


## リフレッシュ可能なマテリアライズドビューの管理 \{#refreshable-materialized-views\}

[リフレッシュ可能なマテリアライズドビュー](../../sql-reference/statements/create/view.md#refreshable-materialized-view) によってバックグラウンドで実行されるタスクを制御するコマンド。

利用時は [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md) を監視してください。

### SYSTEM REFRESH VIEW

指定したビューのスケジュール外即時リフレッシュをトリガーします。

```sql
SYSTEM REFRESH VIEW [db.]name
```


### SYSTEM WAIT VIEW \{#wait-view\}

現在実行中のリフレッシュが完了するまで待機します。リフレッシュが失敗した場合は例外をスローします。リフレッシュが実行されていない場合は直ちに完了し、直前のリフレッシュが失敗している場合は例外をスローします。

### SYSTEM STOP [REPLICATED] VIEW, STOP VIEWS

指定したビュー、またはすべてのリフレッシュ可能なビューの定期的なリフレッシュを停止します。リフレッシュが実行中の場合は、その処理も停止します。

ビューが Replicated または Shared データベース内にある場合、`STOP VIEW` は現在のレプリカにのみ影響し、`STOP REPLICATED VIEW` はすべてのレプリカに影響します。

```sql
SYSTEM STOP VIEW [db.]name
```

```sql
システム停止ビュー
```


### SYSTEM START [REPLICATED] VIEW, START VIEWS

指定したビュー、またはすべてのリフレッシュ可能なビューに対して、定期的なリフレッシュを有効化します。即時のリフレッシュは実行されません。

ビューが Replicated または Shared データベース内にある場合、`START VIEW` は `STOP VIEW` の効果を取り消し、`START REPLICATED VIEW` は `STOP REPLICATED VIEW` の効果を取り消します。

```sql
SYSTEM START VIEW [db.]name
```

```sql
システム起動ビュー
```


### SYSTEM CANCEL VIEW

指定されたビューについて、現在のレプリカ上でリフレッシュが実行中の場合は、それを中断してキャンセルします。実行中でない場合は何もしません。

```sql
SYSTEM CANCEL VIEW [db.]name
```


### SYSTEM WAIT VIEW

実行中のリフレッシュが完了するまで待機します。リフレッシュが実行されていない場合は、直ちに戻ります。直近のリフレッシュ試行が失敗している場合は、エラーを返します。

新しいリフレッシュ可能なマテリアライズドビュー（`EMPTY` キーワードなし）を作成した直後に、初回リフレッシュの完了を待つ目的で使用できます。

ビューが Replicated または Shared データベース内にあり、別のレプリカ上でリフレッシュが実行されている場合は、そのリフレッシュが完了するまで待機します。

```sql
SYSTEM WAIT VIEW [db.]name
```
