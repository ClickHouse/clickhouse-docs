---
description: 'このエンジンは Atomic エンジンを基盤としています。ZooKeeper に書き込まれる DDL ログを通じたメタデータのレプリケーションをサポートし、特定のデータベースに属するすべてのレプリカ上で実行されます。'
sidebar_label: 'Replicated'
sidebar_position: 30
slug: /engines/database-engines/replicated
title: 'Replicated'
doc_type: 'reference'
---



# Replicated

このエンジンは [Atomic](../../engines/database-engines/atomic.md) エンジンを基盤としています。ZooKeeper に書き込まれる DDL ログを通じてメタデータのレプリケーションを行い、その DDL は対象データベースに属するすべてのレプリカ上で実行されます。

1 つの ClickHouse サーバー上で、複数のレプリケーテッドデータベースを同時に稼働・更新できます。ただし、同じレプリケーテッドデータベースのレプリカを、1 台のサーバー上に複数作成することはできません。



## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE testdb [UUID '...'] ENGINE = Replicated('zoo_path', 'shard_name', 'replica_name') [SETTINGS ...]
```

**エンジンパラメータ**

- `zoo_path` — ZooKeeperパス。同じZooKeeperパスは同じデータベースに対応します。
- `shard_name` — シャード名。データベースレプリカは`shard_name`によってシャードにグループ化されます。
- `replica_name` — レプリカ名。同じシャードのすべてのレプリカでレプリカ名は異なる必要があります。

パラメータは省略可能で、省略された場合はデフォルト値で置き換えられます。

`zoo_path`にマクロ`{uuid}`が含まれている場合、明示的なUUIDを指定するか、CREATE文に[ON CLUSTER](../../sql-reference/distributed-ddl.md)を追加して、すべてのレプリカがこのデータベースに対して同じUUIDを使用するようにする必要があります。

[ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication)テーブルの場合、引数が指定されていない場合はデフォルトの引数が使用されます:`/clickhouse/tables/{uuid}/{shard}`と`{replica}`。これらはサーバー設定の[default_replica_path](../../operations/server-configuration-parameters/settings.md#default_replica_path)と[default_replica_name](../../operations/server-configuration-parameters/settings.md#default_replica_name)で変更できます。マクロ`{uuid}`はテーブルのuuidに展開され、`{shard}`と`{replica}`はデータベースエンジンの引数からではなく、サーバー設定の値に展開されます。ただし、将来的にはReplicatedデータベースの`shard_name`と`replica_name`を使用できるようになる予定です。


## 仕様と推奨事項 {#specifics-and-recommendations}

`Replicated`データベースを使用したDDLクエリは、[ON CLUSTER](../../sql-reference/distributed-ddl.md)クエリと同様に動作しますが、若干の違いがあります。

まず、DDLリクエストはイニシエーター(ユーザーから最初にリクエストを受信したホスト)での実行を試みます。リクエストが実行されない場合、ユーザーは即座にエラーを受け取り、他のホストは実行を試みません。イニシエーターでリクエストが正常に完了した場合、他のすべてのホストは完了するまで自動的に再試行します。イニシエーターは他のホストでクエリが完了するのを待機し([distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout)以内)、各ホストのクエリ実行ステータスを含むテーブルを返します。

エラー発生時の動作は[distributed_ddl_output_mode](../../operations/settings/settings.md#distributed_ddl_output_mode)設定によって制御されます。`Replicated`データベースの場合は`null_status_on_timeout`に設定することを推奨します。つまり、一部のホストが[distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout)内にリクエストを実行できなかった場合、例外をスローせず、テーブル内でそれらのホストに対して`NULL`ステータスを表示します。

[system.clusters](../../operations/system-tables/clusters.md)システムテーブルには、レプリケートされたデータベースと同じ名前のクラスターが含まれており、データベースのすべてのレプリカで構成されています。このクラスターはレプリカの作成/削除時に自動的に更新され、[Distributed](/engines/table-engines/special/distributed)テーブルに使用できます。

データベースの新しいレプリカを作成する際、このレプリカは自身でテーブルを作成します。レプリカが長期間利用できず、レプリケーションログから遅れている場合、ローカルメタデータとZooKeeper内の現在のメタデータを照合し、余分なテーブルとデータを別の非レプリケートデータベースに移動し(誤って不要なものを削除しないため)、不足しているテーブルを作成し、名前が変更されている場合はテーブル名を更新します。データは`ReplicatedMergeTree`レベルでレプリケートされます。つまり、テーブルがレプリケートされていない場合、データはレプリケートされません(データベースはメタデータのみを管理します)。

[`ALTER TABLE FREEZE|ATTACH|FETCH|DROP|DROP DETACHED|DETACH PARTITION|PART`](../../sql-reference/statements/alter/partition.md)クエリは許可されていますが、レプリケートされません。データベースエンジンは現在のレプリカに対してのみパーティション/パートの追加/取得/削除を行います。ただし、テーブル自体がレプリケートされたテーブルエンジンを使用している場合、`ATTACH`使用後にデータがレプリケートされます。

テーブルのレプリケーションを維持せずにクラスターの設定のみが必要な場合は、[Cluster Discovery](../../operations/cluster-discovery.md)機能を参照してください。


## 使用例 {#usage-example}

3つのホストでクラスタを作成：

```sql
node1 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','replica1');
node2 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','other_replica');
node3 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','{replica}');
```

暗黙的なパラメータでクラスタ上にデータベースを作成：

```sql
CREATE DATABASE r ON CLUSTER default ENGINE=Replicated;
```

DDLクエリの実行：

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

システムテーブルの表示：

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

別のホストへのレプリカの追加：

```sql
node4 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','r2');
```

`zoo_path`でマクロ`{uuid}`を使用している場合の別のホストへのレプリカの追加：

```sql
node1 :) SELECT uuid FROM system.databases WHERE database='r';
node4 :) CREATE DATABASE r UUID '<uuid from previous query>' ENGINE=Replicated('some/path/{uuid}','other_shard','r2');
```

クラスタ構成は次のようになります：


```text
┌─cluster─┬─shard_num─┬─replica_num─┬─host_name─┬─host_address─┬─port─┬─is_local─┐
│ r       │     1     │      1      │   node3   │  127.0.0.1   │ 9002 │     0    │
│ r       │     1     │      2      │   node4   │  127.0.0.1   │ 9003 │     0    │
│ r       │     2     │      1      │   node2   │  127.0.0.1   │ 9001 │     0    │
│ r       │     2     │      2      │   node1   │  127.0.0.1   │ 9000 │     1    │
└─────────┴───────────┴─────────────┴───────────┴──────────────┴──────┴──────────┘
```

分散テーブルも新しいホストからデータを受け取るようになります。

```sql
node2 :) SELECT materialize(hostName()) AS host, groupArray(n) FROM r.d GROUP BY host;
```

```text
┌─hosts─┬─groupArray(n)─┐
│ node2 │  [1,3,5,7,9]  │
│ node4 │  [0,2,4,6,8]  │
└───────┴───────────────┘
```


## 設定 {#settings}

以下の設定がサポートされています:

| 設定                                                                      | デフォルト                        | 説明                                                                                                                                                           |
| ---------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `max_broken_tables_ratio`                                                    | 1                              | 古くなったテーブルと全テーブルの比率がこの値を超える場合、レプリカを自動的に復旧しない                                                                           |
| `max_replication_lag_to_enqueue`                                             | 50                             | レプリケーションラグがこの値を超える場合、レプリカはクエリ実行の試行時に例外をスローする                                                                               |
| `wait_entry_commited_timeout_sec`                                            | 3600                           | タイムアウトを超過したが開始ホストがまだ実行していない場合、レプリカはクエリのキャンセルを試みる                                                                       |
| `collection_name`                                                            |                                | クラスタ認証のすべての情報が定義されているサーバー設定内のコレクション名                                                                |
| `check_consistency`                                                          | true                           | ローカルメタデータとKeeper内のメタデータの整合性をチェックし、不整合がある場合はレプリカの復旧を実行する                                                                      |
| `max_retries_before_automatic_recovery`                                      | 10                             | レプリカを喪失としてマークしスナップショットから復旧する前に、キューエントリの実行を試行する最大回数(0は無限を意味する)                                         |
| `allow_skipping_old_temporary_tables_ddls_of_refreshable_materialized_views` | false                          | 有効にすると、Replicatedデータベース内のDDL処理時に、可能であればリフレッシュ可能なマテリアライズドビューの一時テーブルのDDL作成と交換をスキップする |
| `logs_to_keep`                                                               | 1000                           | Replicatedデータベース用にZooKeeperに保持するログのデフォルト数                                                                                                  |
| `default_replica_path`                                                       | `/clickhouse/databases/{uuid}` | ZooKeeper内のデータベースへのパス。引数が省略された場合、データベース作成時に使用される                                                                        |
| `default_replica_shard_name`                                                 | `{shard}`                      | データベース内のレプリカのシャード名。引数が省略された場合、データベース作成時に使用される                                                                |
| `default_replica_name`                                                       | `{replica}`                    | データベース内のレプリカの名前。引数が省略された場合、データベース作成時に使用される                                                                      |

デフォルト値は設定ファイルで上書きできます

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
