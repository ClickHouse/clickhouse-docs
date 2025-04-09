---
slug: /engines/database-engines/replicated
sidebar_position: 30
sidebar_label: レプリケーション
title: "レプリケーション"
description: "このエンジンはAtomicエンジンに基づいています。メタデータのレプリケーションは、DDLログがZooKeeperに書き込まれ、指定されたデータベースのすべてのレプリカで実行されることをサポートしています。"
---


# レプリケーション

このエンジンは[Atomic](../../engines/database-engines/atomic.md)エンジンに基づいています。メタデータのレプリケーションは、DDLログがZooKeeperに書き込まれ、指定されたデータベースのすべてのレプリカで実行されることをサポートしています。

1つのClickHouseサーバーは、同時に複数のレプリケートされたデータベースを実行および更新できます。ただし、同じレプリケートされたデータベースの複数のレプリカを持つことはできません。

## データベースの作成 {#creating-a-database}
``` sql
CREATE DATABASE testdb ENGINE = Replicated('zoo_path', 'shard_name', 'replica_name') [SETTINGS ...]
```

**エンジンパラメータ**

- `zoo_path` — ZooKeeperパス。同じZooKeeperパスは、同じデータベースに対応します。
- `shard_name` — シャード名。データベースのレプリカは`shard_name`によってシャードにグループ化されます。
- `replica_name` — レプリカ名。レプリカ名は、同じシャードのすべてのレプリカで異ならなければなりません。

[ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) テーブルの場合、引数が提供されていない場合は、デフォルトの引数が使用されます：`/clickhouse/tables/{uuid}/{shard}`および`{replica}`。これらはサーバー設定の[default_replica_path](../../operations/server-configuration-parameters/settings.md#default_replica_path)および[default_replica_name](../../operations/server-configuration-parameters/settings.md#default_replica_name)で変更できます。マクロ`{uuid}`はテーブルのuuidに展開され、`{shard}`および`{replica}`はデータベースエンジンの引数からではなく、サーバー構成の値に展開されます。ただし、将来的にはReplicatedデータベースの`shard_name`と`replica_name`を使用できるようになります。

## 特徴と推奨事項 {#specifics-and-recommendations}

DDLクエリは、`Replicated`データベースで[ON CLUSTER](../../sql-reference/distributed-ddl.md)クエリと似たように動作しますが、いくつかの違いがあります。

まず、DDLリクエストは、イニシエーター（元々リクエストを受け取ったホスト）で実行しようとします。リクエストが満たされない場合、ユーザーは直ちにエラーを受け取り、他のホストはそれを満たそうとはしません。リクエストがイニシエーターで正常に完了した場合、すべての他のホストは自動的に再試行を行い、完了するまで待機します。イニシエーターは、他のホストでのクエリの完了を待つことを試みます（[distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout)を超えない範囲で）し、各ホストでのクエリ実行ステータスのテーブルを返します。

エラーが発生した場合の動作は、[distributed_ddl_output_mode](../../operations/settings/settings.md#distributed_ddl_output_mode)設定で制御されており、`Replicated`データベースには、`null_status_on_timeout`に設定するのが良いです — つまり、いくつかのホストが[distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout)のリクエストを実行する時間がなかった場合、例外をスローするのではなく、そのホストに対して`NULL`ステータスをテーブルに表示します。

[system.clusters](../../operations/system-tables/clusters.md)システムテーブルには、レプリケートされたデータベースと同名のクラスタが含まれており、データベースのすべてのレプリカで構成されます。このクラスタはレプリカの作成/削除時に自動的に更新され、[Distributed](/engines/table-engines/special/distributed)テーブルに使用できます。

データベースの新しいレプリカを作成する際、このレプリカは自らテーブルを作成します。レプリカが長い間利用できなかったり、レプリケーションログから遅れると、ローカルメタデータとZooKeeper内の現在のメタデータをチェックし、データを持つ余分なテーブルを、誤って何か余計なものを削除しないように別の非レプリケートデータベースに移動し、欠落しているテーブルを作成し、別名に変更された場合にはテーブル名を更新します。データは`ReplicatedMergeTree`レベルでレプリケートされます。つまり、テーブルがレプリケートされていない場合、データはレプリケートされない（データベースはメタデータのみを担当します）。

[`ALTER TABLE FREEZE|ATTACH|FETCH|DROP|DROP DETACHED|DETACH PARTITION|PART`](../../sql-reference/statements/alter/partition.md)クエリは許可されていますが、レプリケートされません。データベースエンジンは、現在のレプリカにパーティション/パーツを追加/取得/削除するだけです。ただし、テーブル自体がレプリケートテーブルエンジンを使用している場合、`ATTACH`を使用した後にデータがレプリケートされます。

クラスタの設定を構成する必要があるだけで、テーブルのレプリケーションを維持する必要がない場合は、[Cluster Discovery](../../operations/cluster-discovery.md)機能を参照してください。

## 使用例 {#usage-example}

3つのホストを持つクラスタを作成：

``` sql
node1 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','replica1');
node2 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','other_replica');
node3 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','{replica}');
```

DDLクエリを実行：

``` sql
CREATE TABLE r.rmt (n UInt64) ENGINE=ReplicatedMergeTree ORDER BY n;
```

``` text
┌─────hosts────────────┬──status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ shard1|replica1      │    0    │       │          2          │        0         │
│ shard1|other_replica │    0    │       │          1          │        0         │
│ other_shard|r1       │    0    │       │          0          │        0         │
└──────────────────────┴─────────┴───────┴─────────────────────┴──────────────────┘
```

システムテーブルを表示：

``` sql
SELECT cluster, shard_num, replica_num, host_name, host_address, port, is_local
FROM system.clusters WHERE cluster='r';
```

``` text
┌─cluster─┬─shard_num─┬─replica_num─┬─host_name─┬─host_address─┬─port─┬─is_local─┐
│ r       │     1     │      1      │   node3   │  127.0.0.1   │ 9002 │     0    │
│ r       │     2     │      1      │   node2   │  127.0.0.1   │ 9001 │     0    │
│ r       │     2     │      2      │   node1   │  127.0.0.1   │ 9000 │     1    │
└─────────┴───────────┴─────────────┴───────────┴──────────────┴──────┴──────────┘
```

分散テーブルを作成し、データを挿入：

``` sql
node2 :) CREATE TABLE r.d (n UInt64) ENGINE=Distributed('r','r','rmt', n % 2);
node3 :) INSERT INTO r.d SELECT * FROM numbers(10);
node1 :) SELECT materialize(hostName()) AS host, groupArray(n) FROM r.d GROUP BY host;
```

``` text
┌─hosts─┬─groupArray(n)─┐
│ node3 │  [1,3,5,7,9]  │
│ node2 │  [0,2,4,6,8]  │
└───────┴───────────────┘
```

もう1つのホストにレプリカを追加：

``` sql
node4 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','r2');
```

クラスタ構成は次のようになります：

``` text
┌─cluster─┬─shard_num─┬─replica_num─┬─host_name─┬─host_address─┬─port─┬─is_local─┐
│ r       │     1     │      1      │   node3   │  127.0.0.1   │ 9002 │     0    │
│ r       │     1     │      2      │   node4   │  127.0.0.1   │ 9003 │     0    │
│ r       │     2     │      1      │   node2   │  127.0.0.1   │ 9001 │     0    │
│ r       │     2     │      2      │   node1   │  127.0.0.1   │ 9000 │     1    │
└─────────┴───────────┴─────────────┴───────────┴──────────────┴──────┴──────────┘
```

分散テーブルも新しいホストからデータを取得します：

```sql
node2 :) SELECT materialize(hostName()) AS host, groupArray(n) FROM r.d GROUP BY host;
```

```text
┌─hosts─┬─groupArray(n)─┐
│ node2 │  [1,3,5,7,9]  │
│ node4 │  [0,2,4,6,8]  │
└───────┴───────────────┘
```
