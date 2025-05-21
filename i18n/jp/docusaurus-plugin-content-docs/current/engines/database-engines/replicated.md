---
description: 'エンジンは Atomic エンジンに基づいています。DDLログをZooKeeperに書き込むことでメタデータのレプリケーションをサポートし、指定されたデータベースのすべてのレプリカで実行されます。'
sidebar_label: 'レプリケート'
sidebar_position: 30
slug: /engines/database-engines/replicated
title: 'レプリケート'
---


# レプリケート

エンジンは [Atomic](../../engines/database-engines/atomic.md) エンジンに基づいています。DDLログをZooKeeperに書き込むことでメタデータのレプリケーションをサポートし、指定されたデータベースのすべてのレプリカで実行されます。

1つの ClickHouse サーバーには、同時に実行および更新される複数のレプリケートデータベースを持つことができます。ただし、同じレプリケートデータベースの複数のレプリカは存在できません。

## データベースの作成 {#creating-a-database}
```sql
CREATE DATABASE testdb ENGINE = Replicated('zoo_path', 'shard_name', 'replica_name') [SETTINGS ...]
```

**エンジンパラメータ**

- `zoo_path` — ZooKeeper パス。同じ ZooKeeper パスは同じデータベースに対応します。
- `shard_name` — シャード名。データベースのレプリカは `shard_name` によってシャードにグループ化されます。
- `replica_name` — レプリカ名。レプリカ名は同じシャードのすべてのレプリカで異なる必要があります。

[ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) テーブルの場合、引数が提供されていない場合は、デフォルトの引数が使用されます: `/clickhouse/tables/{uuid}/{shard}` と `{replica}`。これらはサーバー設定の [default_replica_path](../../operations/server-configuration-parameters/settings.md#default_replica_path) および [default_replica_name](../../operations/server-configuration-parameters/settings.md#default_replica_name) で変更できます。マクロ `{uuid}` はテーブルの uuid に展開され、`{shard}` と `{replica}` はデータベースエンジン引数ではなくサーバー設定からの値に展開されます。ただし、今後はレプリケートデータベースの `shard_name` と `replica_name` を使用できるようになる予定です。

## 特徴と推奨事項 {#specifics-and-recommendations}

DDL クエリは、`Replicated` データベースで [ON CLUSTER](../../sql-reference/distributed-ddl.md) クエリと類似の方法で動作しますが、若干の違いがあります。

まず、DDL リクエストはイニシエーター（ユーザーからリクエストを元々受け取ったホスト）で実行されようとします。リクエストが満たされない場合、ユーザーは直ちにエラーを受け取り、他のホストはそれを満たすことを試みません。イニシエーターでリクエストが正常に完了した場合、すべての他のホストが自動的にリトライを試み、完了するまで続けます。イニシエーターは、他のホストでクエリが完了するのを待とうとします（[distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout) を超えない範囲で）し、各ホストにおけるクエリ実行状況のテーブルを返します。

エラーが発生した場合の動作は、[distributed_ddl_output_mode](../../operations/settings/settings.md#distributed_ddl_output_mode) 設定によって調整され、`Replicated` データベースでは `null_status_on_timeout` に設定するのが望ましいです。つまり、いくつかのホストが [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout) のリクエストを実行する時間がなかった場合、例外を投げずに、テーブル内で `NULL` ステータスを表示します。

[system.clusters](../../operations/system-tables/clusters.md) システムテーブルは、レプリケートデータベースに似た名前のクラスタを含んでおり、このクラスタはデータベースのすべてのレプリカで構成されています。このクラスタは、レプリカの作成/削除時に自動的に更新され、[Distributed](/engines/table-engines/special/distributed) テーブルに使用できます。

データベースの新しいレプリカを作成する場合、このレプリカは自分でテーブルを作成します。レプリカが長時間利用できなかった場合、レプリケーションログに遅れが生じた場合は、そのローカルメタデータとZooKeeperの現在のメタデータを照合し、不要なデータを削除しないように別の非レプリケートデータベースに追加のテーブルを移動し、欠落しているテーブルを作成し、テーブル名が変更されている場合は更新します。データは `ReplicatedMergeTree` レベルでレプリケートされます。つまり、テーブルがレプリケートされていない場合、データはレプリケートされません（データベースはメタデータのみを管理します）。

[`ALTER TABLE FREEZE|ATTACH|FETCH|DROP|DROP DETACHED|DETACH PARTITION|PART`](../../sql-reference/statements/alter/partition.md) クエリは許可されていますが、レプリケートされません。データベースエンジンは、現在のレプリカにパーティション/パーツを追加/取得/削除するだけです。ただし、テーブル自体がレプリケートテーブルエンジンを使用している場合、`ATTACH` を使用した後にデータがレプリケートされます。

テーブルのレプリケーションを維持せずにクラスタを構成するだけが必要な場合は、[クラスタディスカバリー](../../operations/cluster-discovery.md) 機能を参照してください。

## 使用例 {#usage-example}

3つのホストでクラスタを作成:

```sql
node1 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','replica1');
node2 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','other_replica');
node3 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','{replica}');
```

DDLクエリを実行:

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

システムテーブルを表示:

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

分散テーブルを作成してデータを挿入:

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

別のホストにレプリカを追加:

```sql
node4 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','r2');
```

クラスタ構成は次のようになります:

```text
┌─cluster─┬─shard_num─┬─replica_num─┬─host_name─┬─host_address─┬─port─┬─is_local─┐
│ r       │     1     │      1      │   node3   │  127.0.0.1   │ 9002 │     0    │
│ r       │     1     │      2      │   node4   │  127.0.0.1   │ 9003 │     0    │
│ r       │     2     │      1      │   node2   │  127.0.0.1   │ 9001 │     0    │
│ r       │     2     │      2      │   node1   │  127.0.0.1   │ 9000 │     1    │
└─────────┴───────────┴─────────────┴───────────┴──────────────┴──────┴──────────┘
```

分散テーブルも新しいホストからデータを取得します:

```sql
node2 :) SELECT materialize(hostName()) AS host, groupArray(n) FROM r.d GROUP BY host;
```

```text
┌─hosts─┬─groupArray(n)─┐
│ node2 │  [1,3,5,7,9]  │
│ node4 │  [0,2,4,6,8]  │
└───────┴───────────────┘
```
