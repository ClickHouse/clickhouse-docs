---
'description': 'エンジンはAtomicエンジンに基づいています。これは、メタデータのレプリケーションをサポートし、DDLログがZooKeeperに書き込まれ、特定のDATABASEのすべてのレプリカで実行されます。'
'sidebar_label': 'レプリケート'
'sidebar_position': 30
'slug': '/engines/database-engines/replicated'
'title': 'レプリケート'
'doc_type': 'reference'
---


# レプリケーション

このエンジンは[Atomic](../../engines/database-engines/atomic.md)エンジンに基づいています。メタデータのレプリケーションをサポートしており、DDLログはZooKeeperに書き込まれ、指定されたデータベースのすべてのレプリカで実行されます。

1つのClickHouseサーバーでは、複数のレプリケーションデータベースを同時に実行および更新できます。しかし、同じレプリケーションデータベースの複数のレプリカを持つことはできません。

## データベースの作成 {#creating-a-database}
```sql
CREATE DATABASE testdb ENGINE = Replicated('zoo_path', 'shard_name', 'replica_name') [SETTINGS ...]
```

**エンジンパラメータ**

- `zoo_path` — ZooKeeperのパス。同じZooKeeperパスは同じデータベースに対応します。
- `shard_name` — シャード名。データベースのレプリカは`shard_name`によってシャードにグループ化されます。
- `replica_name` — レプリカ名。同じシャードのすべてのレプリカでレプリカ名は異なる必要があります。

[ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication)テーブルの場合、引数が提供されない場合は、デフォルトの引数が使用されます：`/clickhouse/tables/{uuid}/{shard}`および`{replica}`。これらはサーバー設定の[default_replica_path](../../operations/server-configuration-parameters/settings.md#default_replica_path)および[default_replica_name](../../operations/server-configuration-parameters/settings.md#default_replica_name)で変更できます。マクロ`{uuid}`はテーブルのuuidに展開され、`{shard}`および`{replica}`はデータベースエンジンの引数ではなく、サーバー構成からの値に展開されます。しかし、将来的にはReplicatedデータベースの`shard_name`および`replica_name`を使用することができるようになります。

## 特徴と推奨事項 {#specifics-and-recommendations}

`Replicated`データベースに対するDDLクエリは、[ON CLUSTER](../../sql-reference/distributed-ddl.md)クエリと似たように動作しますが、いくつかの違いがあります。

まず、DDLリクエストはイニシエータ（ユーザーからのリクエストを最初に受け取ったホスト）で実行されようとします。もしリクエストが満たされない場合、ユーザーはすぐにエラーを受け取り、他のホストはそれを実行しようとしません。もしリクエストがイニシエータで成功裏に完了した場合、他のすべてのホストは自動的に再試行し、完了するまで続けます。イニシエータは他のホストでクエリが完了するまで待とうとし（[distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout)より長くは待ちません）、各ホストでのクエリ実行状況を含むテーブルを返します。

エラーが発生した場合の挙動は[distributed_ddl_output_mode](../../operations/settings/settings.md#distributed_ddl_output_mode)設定によって制御されており、`Replicated`データベースの場合、この設定は`null_status_on_timeout`にするのが望ましいです。すなわち、いくつかのホストが[distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout)の間にリクエストを実行する時間がなかった場合、例外を投げるのではなく、テーブル内でそのホストの`NULL`ステータスを表示します。

[system.clusters](../../operations/system-tables/clusters.md)システムテーブルには、レプリケーションデータベースと同じ名前のクラスターが含まれており、これはデータベースのすべてのレプリカで構成されています。このクラスターは、レプリカを作成または削除する際に自動的に更新され、[Distributed](/engines/table-engines/special/distributed)テーブルで利用できます。

データベースの新しいレプリカを作成する際、このレプリカは自身でテーブルを作成します。もしレプリカが長時間利用できなくなり、レプリケーションログに遅れた場合、ローカルメタデータをZooKeeperの現在のメタデータと照合し、余分なテーブルを分離された非レプリカデータベースに移動（不要なものを誤って削除しないために）し、欠けているテーブルを作成し、変更された場合はテーブル名を更新します。データは`ReplicatedMergeTree`レベルでレプリケートされます。すなわち、テーブル自体がレプリケートされていない場合、データはレプリケートされません（データベースはメタデータのみに責任を持ちます）。

[`ALTER TABLE FREEZE|ATTACH|FETCH|DROP|DROP DETACHED|DETACH PARTITION|PART`](../../sql-reference/statements/alter/partition.md)クエリは許可されていますが、レプリケートされません。データベースエンジンは、現在のレプリカに対してパーティション/パーツを追加/取得/削除するだけです。しかし、テーブル自体がReplicatedテーブルエンジンを使用している場合、`ATTACH`を使用した後にデータはレプリケートされます。

テーブルレプリケーションを維持せずにクラスターを構成する必要がある場合は、[クラスター発見](../../operations/cluster-discovery.md)機能を参照してください。

## 使用例 {#usage-example}

3つのホストでクラスターを作成：

```sql
node1 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','replica1');
node2 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','other_replica');
node3 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','{replica}');
```

DDLクエリを実行：

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

システムテーブルを表示：

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

分散テーブルを作成し、データを挿入：

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

さらに1つのホストにレプリカを追加：

```sql
node4 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','r2');
```

クラスター構成は次のようになります：

```text
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
