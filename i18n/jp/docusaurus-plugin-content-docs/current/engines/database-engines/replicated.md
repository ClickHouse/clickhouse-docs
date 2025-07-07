---
'description': 'エンジンはAtomicエンジンに基づいています。特定のデータベースのすべてのレプリカで書き込まれたDDLログをZooKeeperにレプリゼンテーションすることにより、メタデータのレプリケーションをサポートします。'
'sidebar_label': 'レプリカ'
'sidebar_position': 30
'slug': '/engines/database-engines/replicated'
'title': 'レプリカ'
---




# レプリケーション

このエンジンは [Atomic](../../engines/database-engines/atomic.md) エンジンに基づいています。メタデータのレプリケーションをサポートしており、DDLログがZooKeeperに書き込まれ、特定のデータベースのすべてのレプリカで実行されます。

1つのClickHouseサーバーでは、複数のレプリケートされたデータベースを同時に実行および更新できます。ただし、同じレプリケートされたデータベースのレプリカを複数作成することはできません。

## データベースの作成 {#creating-a-database}
```sql
CREATE DATABASE testdb ENGINE = Replicated('zoo_path', 'shard_name', 'replica_name') [SETTINGS ...]
```

**エンジンパラメーター**

- `zoo_path` — ZooKeeperのパス。同じZooKeeperのパスは同じデータベースに対応します。
- `shard_name` — シャード名。データベースのレプリカは `shard_name` によってシャードにグループ化されます。
- `replica_name` — レプリカ名。レプリカ名は同じシャードのすべてのレプリカで異なる必要があります。

[ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) テーブルでは、引数が提供されていない場合、デフォルトの引数が使用されます：`/clickhouse/tables/{uuid}/{shard}` と `{replica}`。これらはサーバー設定の [default_replica_path](../../operations/server-configuration-parameters/settings.md#default_replica_path) および [default_replica_name](../../operations/server-configuration-parameters/settings.md#default_replica_name) で変更できます。マクロ `{uuid}` はテーブルのuuidに展開され、`{shard}` と `{replica}` はデータベースエンジンの引数ではなくサーバーconfigからの値に展開されます。しかし、今後はReplicatedデータベースの `shard_name` および `replica_name` を使用できるようになる予定です。

## 特徴と推奨事項 {#specifics-and-recommendations}

`Replicated` データベースを用いたDDLクエリは [ON CLUSTER](../../sql-reference/distributed-ddl.md) クエリと似たように機能しますが、いくつかの違いがあります。

まず、DDLリクエストはイニシエーター（ユーザーからリクエストを最初に受信したホスト）で実行しようとします。リクエストが完了しない場合、ユーザーはすぐにエラーを受け取り、他のホストはリクエストを完了しようとしません。リクエストがイニシエーターで正常に完了した場合、他のすべてのホストは、それを完了するまで自動的に再試行します。イニシエーターは、他のホストでクエリが完了するのを待つようにし、[distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout)を超えない範囲で実行します。また、各ホストでのクエリ実行の状態を示すテーブルを返します。

エラーが発生した場合の挙動は [distributed_ddl_output_mode](../../operations/settings/settings.md#distributed_ddl_output_mode) 設定によって規定されますが、`Replicated` データベースには `null_status_on_timeout` に設定するのが良いでしょう。つまり、いくつかのホストが [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout) のリクエストを実行する時間がなかった場合、例外をスローせずに、テーブル内のそれらのホストには `NULL` ステータスを表示します。

[system.clusters](../../operations/system-tables/clusters.md) システムテーブルは、レプリケートされたデータベースに名前が付けられたクラスタを含んでおり、データベースのすべてのレプリカで構成されています。このクラスタは、レプリカの作成/削除時に自動的に更新され、[Distributed](/engines/table-engines/special/distributed) テーブルに利用できます。

データベースの新しいレプリカを作成する際には、このレプリカが自動的にテーブルを作成します。もしそのレプリカが長い間利用できなくなっており、レプリケーションログから遅れている場合は、ローカルメタデータがZooKeeperの現在のメタデータと一致するかを確認し、追加のテーブルを別の非レプリケートされたデータベースに移動します（不要なものを誤って削除しないため）。不足しているテーブルを作成し、名前が変更されている場合はそのテーブル名を更新します。データは `ReplicatedMergeTree` レベルでレプリケートされます。つまり、テーブルがレプリケートされていない場合、データはレプリケートされません（データベースはメタデータのみに責任があります）。

[`ALTER TABLE FREEZE|ATTACH|FETCH|DROP|DROP DETACHED|DETACH PARTITION|PART`](../../sql-reference/statements/alter/partition.md) クエリは許可されていますが、レプリケートされません。データベースエンジンは、現在のレプリカに対してのみパーティション/パートを追加/取得/削除します。ただし、テーブル自体がレプリケートされたテーブルエンジンを使用している場合、`ATTACH` を使用した後にデータがレプリケートされます。

テーブルのレプリケーションを維持せずにクラスタを設定したい場合は、[Cluster Discovery](../../operations/cluster-discovery.md) 機能を参照してください。

## 使用例 {#usage-example}

3つのホストを持つクラスタを作成します：

```sql
node1 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','replica1');
node2 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','other_replica');
node3 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','{replica}');
```

DDLクエリを実行します：

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

システムテーブルを表示します：

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

分散テーブルを作成し、データを挿入します：

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

もうひとつのホストにレプリカを追加します：

```sql
node4 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','r2');
```

クラスタの設定は以下のようになります：

```text
┌─cluster─┬─shard_num─┬─replica_num─┬─host_name─┬─host_address─┬─port─┬─is_local─┐
│ r       │     1     │      1      │   node3   │  127.0.0.1   │ 9002 │     0    │
│ r       │     1     │      2      │   node4   │  127.0.0.1   │ 9003 │     0    │
│ r       │     2     │      1      │   node2   │  127.0.0.1   │ 9001 │     0    │
│ r       │     2     │      2      │   node1   │  127.0.0.1   │ 9000 │     1    │
└─────────┴───────────┴─────────────┴───────────┴──────────────┴──────┴──────────┘
```

分散テーブルは新しいホストからもデータを取得します：

```sql
node2 :) SELECT materialize(hostName()) AS host, groupArray(n) FROM r.d GROUP BY host;
```

```text
┌─hosts─┬─groupArray(n)─┐
│ node2 │  [1,3,5,7,9]  │
│ node4 │  [0,2,4,6,8]  │
└───────┴───────────────┘
```
