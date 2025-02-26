---
slug: /engines/database-engines/replicated
sidebar_position: 30
sidebar_label: レプリケーション
title: "レプリケーション"
description: "このエンジンはAtomicエンジンに基づいています。メタデータのレプリケーションをサポートし、DDLログがZooKeeperに書き込まれ、指定されたデータベースのすべてのレプリカで実行されます。"
---

# レプリケーション

このエンジンは[Atomic](../../engines/database-engines/atomic.md)エンジンに基づいています。メタデータのレプリケーションをサポートし、DDLログがZooKeeperに書き込まれ、指定されたデータベースのすべてのレプリカで実行されます。

1つのClickHouseサーバーは、複数のレプリケーションされたデータベースを同時に実行および更新できます。ただし、同じレプリケーションされたデータベースの複数のレプリカを作成することはできません。

## データベースの作成 {#creating-a-database}
``` sql
CREATE DATABASE testdb ENGINE = Replicated('zoo_path', 'shard_name', 'replica_name') [SETTINGS ...]
```

**エンジンパラメータ**

- `zoo_path` — ZooKeeperのパス。同じZooKeeperのパスは同じデータベースに対応します。
- `shard_name` — シャード名。データベースレプリカは`shard_name`によってシャードにグループ化されます。
- `replica_name` — レプリカ名。レプリカ名は、同じシャードのすべてのレプリカで異なる必要があります。

[ReplicatedMergeTree](../table-engines/mergetree-family/replication.md#table_engines-replication)テーブルの場合、引数が提供されない場合、デフォルトの引数が使用されます：`/clickhouse/tables/{uuid}/{shard}`および`{replica}`。これらはサーバー設定で変更できます[default_replica_path](../../operations/server-configuration-parameters/settings.md#default_replica_path)と[default_replica_name](../../operations/server-configuration-parameters/settings.md#default_replica_name)。マクロ`{uuid}`はテーブルのUUIDに展開され、`{shard}`および`{replica}`はサーバー設定からの値に展開され、データベースエンジン引数からではありません。ただし、将来的には、レプリケーターデータベースの`shard_name`および`replica_name`を使用できるようになります。

## 特徴と推奨事項 {#specifics-and-recommendations}

`Replicated`データベースのDDLクエリは、[ON CLUSTER](../../sql-reference/distributed-ddl.md)クエリと似たような方法で動作しますが、わずかな違いがあります。

最初に、DDLリクエストはイニシエーター（元々ユーザーからリクエストを受け取ったホスト）で実行されようとします。リクエストが満たされない場合、ユーザーはすぐにエラーを受け取り、他のホストはそれを実行しようとはしません。リクエストがイニシエーターで正常に完了した場合、他のすべてのホストは自動的に再試行し、完了するまで繰り返します。イニシエーターは他のホストでクエリが完了するのを待つことができ、最大[distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout)の時間内に完了し、各ホストでのクエリの実行状況を記録したテーブルを返します。

エラーが発生した場合の動作は、[distributed_ddl_output_mode](../../operations/settings/settings.md#distributed_ddl_output_mode)設定によって規制されており、`Replicated`データベースでは`null_status_on_timeout`に設定するのが適切です。つまり、一部のホストが[distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout)のリクエストを実行する時間がなかった場合、例外を投げずに、そのホストのテーブルで`NULL`ステータスを表示します。

[system.clusters](../../operations/system-tables/clusters.md)システムテーブルには、レプリケーションされたデータベースと同じ名前のクラスターが含まれており、このクラスターはデータベースのすべてのレプリカで構成されています。このクラスターは、レプリカの作成/削除時に自動的に更新され、[Distributed](../../engines/table-engines/special/distributed.md#distributed)テーブルに使用することができます。

新しいデータベースのレプリカを作成すると、このレプリカは自分自身でテーブルを作成します。レプリカが長時間利用できなかった場合、レプリケーションログに遅れが生じた場合、そのレプリカはローカルメタデータとZooKeeper内の現在のメタデータをチェックし、データのある余分なテーブルを別の非レプリケートデータベースに移動します（誤って余分なものを削除しないため）。欠落しているテーブルを作成し、名前が変更されている場合はテーブル名を更新します。データは`ReplicatedMergeTree`レベルでレプリケーションされます。つまり、テーブルがレプリケーションされていない場合、データはレプリケーションされず（データベースはメタデータのみを担当します）、

[`ALTER TABLE FREEZE|ATTACH|FETCH|DROP|DROP DETACHED|DETACH PARTITION|PART`](../../sql-reference/statements/alter/partition.md)クエリは許可されますが、レプリケーションはされません。データベースエンジンは現在のレプリカに対してパーティション/パーツを追加/取得/削除するだけです。ただし、テーブル自体がReplicatedテーブルエンジンを使用している場合、`ATTACH`を使用した後にデータがレプリケーションされます。

クラスターを構成するだけでテーブルのレプリケーションを維持する必要がない場合は、[Cluster Discovery](../../operations/cluster-discovery.md)機能を参照してください。

## 使用例 {#usage-example}

3つのホストでクラスターを作成:

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

分散テーブルを作成し、データを挿入する：

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

1つのホストにレプリカを追加：

``` sql
node4 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','r2');
```

クラスター構成は次のようになります：

``` text
┌─cluster─┬─shard_num─┬─replica_num─┬─host_name─┬─host_address─┬─port─┬─is_local─┐
│ r       │     1     │      1      │   node3   │  127.0.0.1   │ 9002 │     0    │
│ r       │     1     │      2      │   node4   │  127.0.0.1   │ 9003 │     0    │
│ r       │     2     │      1      │   node2   │  127.0.0.1   │ 9001 │     0    │
│ r       │     2     │      2      │   node1   │  127.0.0.1   │ 9000 │     1    │
└─────────┴───────────┴─────────────┴───────────┴──────────────┴──────┴──────────┘
```

分散テーブルは新しいホストからデータを取得します：

```sql
node2 :) SELECT materialize(hostName()) AS host, groupArray(n) FROM r.d GROUP BY host;
```

```text
┌─hosts─┬─groupArray(n)─┐
│ node2 │  [1,3,5,7,9]  │
│ node4 │  [0,2,4,6,8]  │
└───────┴───────────────┘
```
