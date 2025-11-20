---
'description': '엔진은 Atomic 엔진을 기반으로 하고 있습니다. 메타데이터의 복제를 지원하며, DDL 로그가 ZooKeeper에 기록되고
  주어진 DATABASE의 모든 복제본에서 실행됩니다.'
'sidebar_label': '복제본'
'sidebar_position': 30
'slug': '/engines/database-engines/replicated'
'title': '복제본'
'doc_type': 'reference'
---


# Replicated

이 엔진은 [Atomic](../../engines/database-engines/atomic.md) 엔진을 기반으로 합니다. 메타데이터의 복제를 지원하며, DDL 로그가 ZooKeeper에 기록되고 주어진 데이터베이스의 모든 복제본에서 실행됩니다.

하나의 ClickHouse 서버에서 여러 개의 복제된 데이터베이스를 동시에 실행하고 업데이트할 수 있습니다. 그러나 동일한 복제된 데이터베이스의 복제본을 여러 개 둘 수는 없습니다.

## 데이터베이스 생성하기 {#creating-a-database}
```sql
CREATE DATABASE testdb [UUID '...'] ENGINE = Replicated('zoo_path', 'shard_name', 'replica_name') [SETTINGS ...]
```

**엔진 매개변수**

- `zoo_path` — ZooKeeper 경로. 동일한 ZooKeeper 경로는 동일한 데이터베이스에 해당합니다.
- `shard_name` — 샤드 이름. 데이터베이스 복제본은 `shard_name`에 따라 샤드로 그룹화됩니다.
- `replica_name` — 복제본 이름. 복제본 이름은 동일한 샤드의 모든 복제본에 대해 다르게 되어야 합니다.

매개변수는 생략할 수 있으며, 이 경우 누락된 매개변수는 기본값으로 대체됩니다.

`zoo_path`에 매크로 `{uuid}`가 포함된 경우, 명시적인 UUID를 지정하거나 생성 문에 [ON CLUSTER](../../sql-reference/distributed-ddl.md)를 추가해야 하며, 이를 통해 모든 복제본이 이 데이터베이스에 동일한 UUID를 사용하게 할 수 있습니다.

[ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) 테이블의 경우 인자가 제공되지 않으면 기본 인자는 `/clickhouse/tables/{uuid}/{shard}` 및 `{replica}`가 사용됩니다. 이러한 값은 서버 설정의 [default_replica_path](../../operations/server-configuration-parameters/settings.md#default_replica_path) 및 [default_replica_name](../../operations/server-configuration-parameters/settings.md#default_replica_name)에서 변경할 수 있습니다. 매크로 `{uuid}`는 테이블의 UUID로 펼쳐지며, `{shard}`와 `{replica}`는 데이터베이스 엔진 매개변수가 아닌 서버 설정값으로 펼쳐집니다. 그러나 향후에는 Replicated 데이터베이스의 `shard_name` 및 `replica_name`을 사용할 수 있게 될 것입니다.

## 세부 사항 및 권장 사항 {#specifics-and-recommendations}

`Replicated` 데이터베이스와 함께 사용하는 DDL 쿼리는 [ON CLUSTER](../../sql-reference/distributed-ddl.md) 쿼리와 유사한 방식으로 작동하지만, 약간의 차이가 있습니다.

첫째, DDL 요청은 발신자(사용자로부터 요청을 처음으로 받은 호스트)에서 실행하려고 시도합니다. 요청이 충족되지 않으면 사용자는 즉시 오류를 받으며, 다른 호스트는 이를 충족하려고 하지 않습니다. 요청이 발신자에서 성공적으로 완료되면, 다른 모든 호스트는 자동으로 재시도하여 완료할 때까지 시도합니다. 발신자는 다른 호스트에서 쿼리가 완료될 때까지 기다리려고 시도하며 (최대 [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout) 기간), 각 호스트에서 쿼리 실행 상태가 포함된 테이블을 반환합니다.

오류 발생 시 동작은 [distributed_ddl_output_mode](../../operations/settings/settings.md#distributed_ddl_output_mode) 설정에 의해 조정되며, `Replicated` 데이터베이스의 경우 이는 `null_status_on_timeout`으로 설정하는 것이 좋습니다. 즉, 일부 호스트가 [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout) 동안 요청을 실행할 시간이 없었던 경우, 예외를 발생시키지 않고 해당 호스트에 대해 `NULL` 상태를 테이블에 표시합니다.

[system.clusters](../../operations/system-tables/clusters.md) 시스템 테이블에는 복제된 데이터베이스와 같은 이름의 클러스터가 포함되어 있으며, 이는 해당 데이터베이스의 모든 복제본으로 구성됩니다. 이 클러스터는 복제본을 생성/삭제할 때 자동으로 업데이트되며 [Distributed](/engines/table-engines/special/distributed) 테이블에 사용할 수 있습니다.

데이터베이스의 새로운 복제본을 만들 때, 이 복제본은 스스로 테이블을 생성합니다. 만약 복제본이 오랜 시간 동안 사용할 수 없고 복제 로그에서 뒤처진 경우 — 로컬 메타데이터를 현재 ZooKeeper의 메타데이터와 비교하고, 데이터가 포함된 추가 테이블을 별도의 비복제 데이터베이스로 이동시킵니다 (불필요한 삭제 방지를 위해), 누락된 테이블을 생성하고 이름이 변경되었다면 테이블 이름을 업데이트합니다. 데이터는 `ReplicatedMergeTree` 수준에서 복제되며, 즉 테이블이 복제되지 않는 경우 데이터는 복제되지 않습니다 (데이터베이스는 메타데이터만 책임집니다).

[`ALTER TABLE FREEZE|ATTACH|FETCH|DROP|DROP DETACHED|DETACH PARTITION|PART`](../../sql-reference/statements/alter/partition.md) 쿼리는 허용되지만 복제되지는 않습니다. 데이터베이스 엔진은 현재 복제본에 대해 파티션/파트를 추가/가져오거나 제거할 것입니다. 그러나 테이블 자체가 복제 테이블 엔진을 사용하는 경우 `ATTACH`를 사용할 때 데이터는 복제됩니다.

테이블 복제를 유지하지 않고 클러스터만 구성해야 하는 경우, [Cluster Discovery](../../operations/cluster-discovery.md) 기능을 참조하십시오.

## 사용 예 {#usage-example}

세 개의 호스트로 클러스터 생성하기:

```sql
node1 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','replica1');
node2 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','other_replica');
node3 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','{replica}');
```

암묵적인 매개변수로 클러스터에서 데이터베이스 생성하기:

```sql
CREATE DATABASE r ON CLUSTER default ENGINE=Replicated;
```

DDL 쿼리 실행하기:

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

시스템 테이블 표시하기:

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

분산 테이블 생성 및 데이터 삽입하기:

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

한 호스트에 추가 복제본 추가하기:

```sql
node4 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','r2');
```

`zoo_path`에 매크로 `{uuid}`가 사용된 경우 한 호스트에 추가 복제본 추가하기:
```sql
node1 :) SELECT uuid FROM system.databases WHERE database='r';
node4 :) CREATE DATABASE r UUID '<uuid from previous query>' ENGINE=Replicated('some/path/{uuid}','other_shard','r2');
```

클러스터 구성은 다음과 같이 보일 것입니다:

```text
┌─cluster─┬─shard_num─┬─replica_num─┬─host_name─┬─host_address─┬─port─┬─is_local─┐
│ r       │     1     │      1      │   node3   │  127.0.0.1   │ 9002 │     0    │
│ r       │     1     │      2      │   node4   │  127.0.0.1   │ 9003 │     0    │
│ r       │     2     │      1      │   node2   │  127.0.0.1   │ 9001 │     0    │
│ r       │     2     │      2      │   node1   │  127.0.0.1   │ 9000 │     1    │
└─────────┴───────────┴─────────────┴───────────┴──────────────┴──────┴──────────┘
```

분산 테이블은 새로운 호스트에서 데이터도 가져옵니다:

```sql
node2 :) SELECT materialize(hostName()) AS host, groupArray(n) FROM r.d GROUP BY host;
```

```text
┌─hosts─┬─groupArray(n)─┐
│ node2 │  [1,3,5,7,9]  │
│ node4 │  [0,2,4,6,8]  │
└───────┴───────────────┘
```

## 설정 {#settings}
다음 설정이 지원됩니다:

| 설정                                                                         | 기본값                        | 설명                                                                                                                                                               |
|------------------------------------------------------------------------------|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `max_broken_tables_ratio`                                                   | 1                              | 고장난 테이블의 비율이 모든 테이블에 대해 초과되면 복제를 자동으로 복구하지 않습니다.                                                                               |
| `max_replication_lag_to_enqueue`                                            | 50                             | 복제 지연이 초과되면 쿼리 실행 시 예외를 발생시킵니다.                                                                                                           |
| `wait_entry_commited_timeout_sec`                                           | 3600                           | 복제본은 시간 초과가 초과되면 쿼리를 취소하려고 시도하지만, 발신자 호스트가 아직 그것을 실행하지 않은 경우입니다.                                             |
| `collection_name`                                                           |                                | 모든 클러스터 인증 정보를 정의하는 서버 구성의 컬렉션 이름입니다.                                                                                                     |
| `check_consistency`                                                         | true                           | 로컬 메타데이터와 Keeper의 메타데이터의 일관성을 확인하고 불일치가 있는 경우 복구를 실행합니다.                                                                    |
| `max_retries_before_automatic_recovery`                                     | 10                             | 복구 스냅샷에서 복제본을 잃어버리기 전 최대 시도 횟수입니다 (0은 무한을 의미합니다).                                                                                     |
| `allow_skipping_old_temporary_tables_ddls_of_refreshable_materialized_views` | false                          | 활성화되면, 복제된 데이터베이스에서 DDL을 처리할 때, 가능한 경우 갱신 가능한 물리화된 뷰의 임시 테이블에 대한 DDL의 생성 및 교환을 건너뜁니다.                     |
| `logs_to_keep`                                                              | 1000                           | 복제된 데이터베이스에 대해 ZooKeeper에서 보관할 로그의 기본 개수입니다.                                                                                            |
| `default_replica_path`                                                      | `/clickhouse/databases/{uuid}` | ZooKeeper에서의 데이터베이스 경로입니다. 인자가 생략될 경우 데이터베이스 생성 시 사용됩니다.                                                                          |
| `default_replica_shard_name`                                                | `{shard}`                      | 데이터베이스에서 복제본의 샤드 이름입니다. 인자가 생략될 경우 데이터베이스 생성 시 사용됩니다.                                                                      |
| `default_replica_name`                                                      | `{replica}`                    | 데이터베이스에서 복제본의 이름입니다. 인자가 생략될 경우 데이터베이스 생성 시 사용됩니다.                                                                          |

기본값은 구성 파일에서 재정의할 수 있습니다.
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
