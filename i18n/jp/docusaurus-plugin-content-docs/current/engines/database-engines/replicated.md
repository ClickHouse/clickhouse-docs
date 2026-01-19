---
description: "このエンジンは Atomic エンジンに基づいています。ZooKeeper に書き込まれる DDL ログを介してメタデータのレプリケーションを行い、あるデータベースに属するすべてのレプリカで実行されます。"
sidebar_label: "Replicated"
sidebar_position: 30
slug: /engines/database-engines/replicated
title: "Replicated"
doc_type: "reference"
---

# Replicated \{#replicated\}

このエンジンは [Atomic](../../engines/database-engines/atomic.md) エンジンをベースとしています。ZooKeeper に書き込まれる DDL ログを介したメタデータのレプリケーションをサポートしており、特定のデータベースに対するすべてのレプリカで実行されます。

1 つの ClickHouse サーバー上で、複数のレプリケートされたデータベースを同時に稼働させて更新することができます。ただし、同じレプリケートされたデータベースのレプリカを、1 つの ClickHouse サーバー上に複数置くことはできません。

## データベースの作成 \{#creating-a-database\}

```sql
CREATE DATABASE testdb [UUID '...'] ENGINE = Replicated('zoo_path', 'shard_name', 'replica_name') [SETTINGS ...]
```

**エンジンパラメータ**

* `zoo_path` — ZooKeeper のパス。同じ ZooKeeper パスは同じデータベースに対応します。
* `shard_name` — シャード名。データベースレプリカは `shard_name` によってシャードにグループ化されます。
* `replica_name` — レプリカ名。同一シャード内のすべてのレプリカで `replica_name` は異なる必要があります。

パラメータは省略可能です。省略した場合、指定されなかったパラメータにはデフォルト値が使用されます。

`zoo_path` にマクロ `{uuid}` が含まれている場合は、明示的な UUID を指定するか、すべてのレプリカがこのデータベースに対して同じ UUID を使用することを保証するために、CREATE 文に [ON CLUSTER](../../sql-reference/distributed-ddl.md) を追加する必要があります。

[ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) テーブルでは、引数が指定されていない場合、デフォルトの引数 `/clickhouse/tables/{uuid}/{shard}` および `{replica}` が使用されます。これらはサーバー設定 [default&#95;replica&#95;path](../../operations/server-configuration-parameters/settings.md#default_replica_path) および [default&#95;replica&#95;name](../../operations/server-configuration-parameters/settings.md#default_replica_name) で変更できます。マクロ `{uuid}` はテーブルの UUID に展開され、`{shard}` と `{replica}` はデータベースエンジンの引数ではなくサーバー設定の値に展開されます。ただし将来的には、Replicated データベースの `shard_name` および `replica_name` も使用できるようになる予定です。

## 詳細と推奨事項 \{#specifics-and-recommendations\}

`Replicated` データベースでの DDL クエリは、[ON CLUSTER](../../sql-reference/distributed-ddl.md) クエリと同様の方法で動作しますが、いくつかの細かな違いがあります。

まず、DDL リクエストはイニシエーター（ユーザーから最初にリクエストを受け取ったホスト）での実行を試みます。リクエストの実行に失敗した場合、ユーザーには直ちにエラーが返され、他のホストは実行を試みません。リクエストがイニシエーターで正常に完了した場合、他のすべてのホストは完了するまで自動的に再試行します。イニシエーターは、他のホスト上でクエリが完了するのを（[distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout) を超えない範囲で）待機し、その後、各ホストでのクエリ実行ステータスを含むテーブルを返します。

エラー発生時の挙動は、[distributed_ddl_output_mode](../../operations/settings/settings.md#distributed_ddl_output_mode) 設定によって制御されます。`Replicated` データベースに対しては、これを `null_status_on_timeout` に設定することを推奨します。つまり、いくつかのホストが [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout) 以内にリクエストを実行できなかった場合でも、例外をスローせず、それらのホストについてはテーブル内で `NULL` ステータスを表示します。

[system.clusters](../../operations/system-tables/clusters.md) システムテーブルには、レプリケートされたデータベースと同名のクラスターが含まれており、そのクラスターはデータベースのすべてのレプリカで構成されています。このクラスターはレプリカの作成・削除時に自動的に更新され、[Distributed](/engines/table-engines/special/distributed) テーブルとして利用できます。

新しいデータベースレプリカを作成する際、このレプリカは自身でテーブルを作成します。レプリカが長時間利用不能でレプリケーションログから大きく遅延している場合には、自身のローカルメタデータを ZooKeeper の現在のメタデータと照合し、余分なテーブルとそのデータを（不要なものを誤って削除しないように）別の非レプリケートデータベースに移動し、欠けているテーブルを作成し、テーブル名が変更されている場合はテーブル名を更新します。データは `ReplicatedMergeTree` レベルでレプリケートされます。つまり、テーブルが Replicated 系のテーブルエンジンを使用していない場合、そのデータはレプリケートされません（データベースはメタデータのみを担当します）。

[`ALTER TABLE FREEZE|ATTACH|FETCH|DROP|DROP DETACHED|DETACH PARTITION|PART`](../../sql-reference/statements/alter/partition.md) クエリは許可されていますが、レプリケートはされません。データベースエンジンは現在のレプリカに対してのみパーティション／パートの追加・取得・削除を行います。ただし、テーブル自体が Replicated 系のテーブルエンジンを使用している場合は、`ATTACH` を使用した後にデータがレプリケートされます。

テーブルレプリケーションを維持せずにクラスターのみを構成する必要がある場合は、[Cluster Discovery](../../operations/cluster-discovery.md) 機能を参照してください。

## 使用例 \{#usage-example\}

3 つのホストを持つクラスターの作成:

```sql
node1 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','replica1');
node2 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','other_replica');
node3 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','{replica}');
```

暗黙的パラメータを使用してクラスタ上にデータベースを作成する：

```sql
CREATE DATABASE r ON CLUSTER default ENGINE=Replicated;
```

DDL クエリを実行する:

```sql
CREATE TABLE r.rmt (n UInt64) ENGINE=ReplicatedMergeTree ORDER BY n;
```

```text
┌─────hosts────────────┬──status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ shard1|replica1      │    0    │       │          2          │        0         │
│ shard1|other_replica │    0    │       │          1          │        0         │
│ other_shard|r1       │    0    │       │          0          │        0         │
└──────────────────────┴─────────┴───────┴─────────────────────┴──────────────────┘
```

システムテーブルを表示する:

```sql
SELECT cluster, shard_num, replica_num, host_name, host_address, port, is_local
FROM system.clusters WHERE cluster='r';
```

```text
┌─cluster─┬─shard_num─┬─replica_num─┬─host_name─┬─host_address─┬─port─┬─is_local─┐
│ r       │     1     │      1      │   node3   │  127.0.0.1   │ 9002 │     0    │
│ r       │     2     │      1      │   node2   │  127.0.0.1   │ 9001 │     0    │
│ r       │     2     │      2      │   node1   │  127.0.0.1   │ 9000 │     1    │
└─────────┴───────────┴─────────────┴───────────┴──────────────┴──────┴──────────┘
```

分散テーブルの作成とデータの挿入：

```sql
node2 :) CREATE TABLE r.d (n UInt64) ENGINE=Distributed('r','r','rmt', n % 2);
node3 :) INSERT INTO r.d SELECT * FROM numbers(10);
node1 :) SELECT materialize(hostName()) AS host, groupArray(n) FROM r.d GROUP BY host;
```

```text
┌─hosts─┬─groupArray(n)─┐
│ node3 │  [1,3,5,7,9]  │
│ node2 │  [0,2,4,6,8]  │
└───────┴───────────────┘
```

別のホストにレプリカを追加する:

```sql
node4 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','r2');
```

`zoo_path` でマクロ `{uuid}` を使用している場合に、さらに 1 台のホストにレプリカを追加するには:

```sql
node1 :) SELECT uuid FROM system.databases WHERE database='r';
node4 :) CREATE DATABASE r UUID '<uuid from previous query>' ENGINE=Replicated('some/path/{uuid}','other_shard','r2');
```

クラスター構成は次のようになります。

```text
┌─cluster─┬─shard_num─┬─replica_num─┬─host_name─┬─host_address─┬─port─┬─is_local─┐
│ r       │     1     │      1      │   node3   │  127.0.0.1   │ 9002 │     0    │
│ r       │     1     │      2      │   node4   │  127.0.0.1   │ 9003 │     0    │
│ r       │     2     │      1      │   node2   │  127.0.0.1   │ 9001 │     0    │
│ r       │     2     │      2      │   node1   │  127.0.0.1   │ 9000 │     1    │
└─────────┴───────────┴─────────────┴───────────┴──────────────┴──────┴──────────┘
```

分散テーブルにも新しいホストからデータが取り込まれます。

```sql
node2 :) SELECT materialize(hostName()) AS host, groupArray(n) FROM r.d GROUP BY host;
```

```text
┌─hosts─┬─groupArray(n)─┐
│ node2 │  [1,3,5,7,9]  │
│ node4 │  [0,2,4,6,8]  │
└───────┴───────────────┘
```

## 設定 \{#settings\}

サポートされている設定は次のとおりです:

| Setting                                                                      | Default                        | Description                                                                               |
| ---------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| `max_broken_tables_ratio`                                                    | 1                              | 停止状態（stale）のテーブル数と全テーブル数の比率がこの値より大きい場合、レプリカを自動復旧しない                                       |
| `max_replication_lag_to_enqueue`                                             | 50                             | レプリケーション遅延がこの値より大きい場合、レプリカはクエリを実行しようとすると例外をスローする                                          |
| `wait_entry_commited_timeout_sec`                                            | 3600                           | タイムアウトを超過した場合、イニシエータホストがまだそのクエリを実行していなければ、レプリカはそのクエリのキャンセルを試みる                            |
| `collection_name`                                                            |                                | クラスタ認証に関するすべての情報が定義されている、サーバー設定内のコレクションの名前                                                |
| `check_consistency`                                                          | true                           | ローカルメタデータと Keeper 内のメタデータの整合性をチェックし、不整合がある場合はレプリカの復旧を行う                                   |
| `max_retries_before_automatic_recovery`                                      | 10                             | レプリカを失われたものとしてマークしスナップショットから復旧する前に、キューエントリの実行を試行する最大回数（0 は無制限を意味する）                       |
| `allow_skipping_old_temporary_tables_ddls_of_refreshable_materialized_views` | false                          | 有効にすると、Replicated データベースで DDL を処理する際、可能な場合はリフレッシュ可能なマテリアライズドビューの一時テーブルの DDL の作成と交換をスキップする |
| `logs_to_keep`                                                               | 1000                           | Replicated データベースに対して ZooKeeper に保持するログのデフォルト件数。                                          |
| `default_replica_path`                                                       | `/clickhouse/databases/{uuid}` | ZooKeeper におけるデータベースへのパス。データベース作成時に引数が省略された場合に使用される。                                      |
| `default_replica_shard_name`                                                 | `{shard}`                      | データベース内のレプリカのシャード名。データベース作成時に引数が省略された場合に使用される。                                            |
| `default_replica_name`                                                       | `{replica}`                    | データベース内のレプリカ名。データベース作成時に引数が省略された場合に使用される。                                                 |

デフォルト値は設定ファイルで上書きできます。

```xml
<clickhouse>
    <database_replicated>
        <max_broken_tables_ratio>0.75</max_broken_tables_ratio>
        <max_replication_lag_to_enqueue>100</max_replication_lag_to_enqueue>
        <wait_entry_commited_timeout_sec>1800</wait_entry_commited_timeout_sec>
        <collection_name>postgres1</collection_name>
        <check_consistency>false</check_consistency>
        <max_retries_before_automatic_recovery>5</max_retries_before_automatic_recovery>
        <default_replica_path>/clickhouse/databases/{uuid}</default_replica_path>
        <default_replica_shard_name>{shard}</default_replica_shard_name>
        <default_replica_name>{replica}</default_replica_name>
    </database_replicated>
</clickhouse>
```
