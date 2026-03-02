---
description: 'ClickHouse의 Replicated* 테이블 엔진 계열을 사용한 데이터 복제 개요'
sidebar_label: 'Replicated*'
sidebar_position: 20
slug: /engines/table-engines/mergetree-family/replication
title: 'Replicated* 테이블 엔진'
doc_type: 'reference'
---

# Replicated* 테이블 엔진 \{#replicated-table-engines\}

:::note
ClickHouse Cloud에서는 복제가 자동으로 관리됩니다. 테이블을 생성할 때 인수를 추가하지 않고 생성하십시오. 예를 들어, 아래 텍스트에서는 다음과 같이 변경하십시오:

```sql
ENGINE = ReplicatedMergeTree(
    '/clickhouse/tables/{shard}/table_name',
    '{replica}'
)
```

다음과 함께 사용합니다:

```sql
ENGINE = ReplicatedMergeTree
```

:::

복제는 MergeTree 계열에 속한 테이블에만 지원됩니다:

* ReplicatedMergeTree
* ReplicatedSummingMergeTree
* ReplicatedReplacingMergeTree
* ReplicatedAggregatingMergeTree
* ReplicatedCollapsingMergeTree
* ReplicatedVersionedCollapsingMergeTree
* ReplicatedGraphiteMergeTree

복제는 전체 서버가 아니라 개별 테이블 단위에서 동작합니다. 하나의 서버에서 복제된 테이블과 비복제 테이블을 동시에 저장할 수 있습니다.

복제는 세그먼트와는 무관하게 동작합니다. 각 세그먼트는 서로 독립적으로 복제됩니다.

`INSERT` 및 `ALTER` 쿼리에 대한 압축된 데이터는 복제됩니다(자세한 내용은 [ALTER](/sql-reference/statements/alter) 문서를 참고하십시오).

`CREATE`, `DROP`, `ATTACH`, `DETACH`, `RENAME` 쿼리는 단일 서버에서만 실행되며 복제되지 않습니다:

* `CREATE TABLE` 쿼리는 쿼리가 실행된 서버에 새로 복제 가능한 테이블을 생성합니다. 동일한 테이블이 다른 서버에 이미 존재하는 경우에는 새 레플리카를 추가합니다.
* `DROP TABLE` 쿼리는 쿼리가 실행된 서버에 있는 레플리카를 삭제합니다.
* `RENAME` 쿼리는 레플리카 중 하나에 있는 테이블의 이름을 변경합니다. 즉, 복제된 테이블은 레플리카별로 서로 다른 이름을 가질 수 있습니다.

ClickHouse는 레플리카의 메타데이터를 저장하기 위해 [ClickHouse Keeper](/guides/sre/keeper/index.md)를 사용합니다. ZooKeeper 3.4.5 이상의 버전을 사용할 수 있으나 ClickHouse Keeper 사용을 권장합니다.

복제를 사용하려면 [zookeeper](/operations/server-configuration-parameters/settings#zookeeper) 서버 설정 섹션에서 매개변수를 설정하십시오.

:::note
보안 설정을 소홀히 하지 마십시오. ClickHouse는 ZooKeeper 보안 서브시스템의 `digest` [ACL 방식](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#sc_ZooKeeperAccessControl)을 지원합니다.
:::

ClickHouse Keeper 클러스터 주소 설정 예:

```xml
<zookeeper>
    <node>
        <host>example1</host>
        <port>2181</port>
    </node>
    <node>
        <host>example2</host>
        <port>2181</port>
    </node>
    <node>
        <host>example3</host>
        <port>2181</port>
    </node>
</zookeeper>
```

ClickHouse는 레플리카의 메타데이터를 보조 ZooKeeper 클러스터에 저장하는 것도 지원합니다. 이를 위해 엔진 인수로 ZooKeeper 클러스터 이름과 경로를 지정합니다.
즉, 서로 다른 테이블의 메타데이터를 서로 다른 ZooKeeper 클러스터에 저장할 수 있습니다.

보조 ZooKeeper 클러스터 주소를 설정하는 예:

```xml
<auxiliary_zookeepers>
    <zookeeper2>
        <node>
            <host>example_2_1</host>
            <port>2181</port>
        </node>
        <node>
            <host>example_2_2</host>
            <port>2181</port>
        </node>
        <node>
            <host>example_2_3</host>
            <port>2181</port>
        </node>
    </zookeeper2>
    <zookeeper3>
        <node>
            <host>example_3_1</host>
            <port>2181</port>
        </node>
    </zookeeper3>
</auxiliary_zookeepers>
```

기본 ZooKeeper 클러스터 대신 보조 ZooKeeper 클러스터에 테이블 메타데이터를 저장하려면, 다음과 같이 SQL을 사용해 ReplicatedMergeTree 엔진을 사용하는 테이블을 생성합니다.

```sql
CREATE TABLE table_name ( ... ) ENGINE = ReplicatedMergeTree('zookeeper_name_configured_in_auxiliary_zookeepers:path', 'replica_name') ...
```

기존 ZooKeeper 클러스터를 임의로 지정하면 시스템이 해당 클러스터 내의 디렉토리 하나(복제 가능한 테이블을 생성할 때 지정하는 디렉토리)를 자체 데이터 저장 용도로 사용합니다.

구성 파일에 ZooKeeper가 설정되어 있지 않으면 복제된 테이블을 생성할 수 없으며, 기존에 존재하는 복제된 테이블은 모두 읽기 전용으로만 동작합니다.


`SELECT` 쿼리에서는 ZooKeeper를 사용하지 않습니다. 복제는 `SELECT` 성능에 영향을 주지 않으며, 비복제 테이블과 동일한 속도로 쿼리가 실행되기 때문입니다. 분산 복제 테이블에 대해 쿼리할 때 ClickHouse의 동작은 [max_replica_delay_for_distributed_queries](/operations/settings/settings.md/#max_replica_delay_for_distributed_queries) 및 [fallback_to_stale_replicas_for_distributed_queries](/operations/settings/settings.md/#fallback_to_stale_replicas_for_distributed_queries) 설정에 의해 제어됩니다.

각각의 `INSERT` 쿼리마다 여러 트랜잭션을 통해 약 10개의 엔트리가 ZooKeeper에 추가됩니다. (보다 정확히 말하면, 이는 삽입되는 각 데이터 블록마다 적용되며, 하나의 `INSERT` 쿼리는 하나의 블록 또는 `max_insert_block_size = 1048576` 행마다 하나의 블록을 포함합니다.) 이로 인해 비복제 테이블과 비교했을 때 `INSERT` 지연 시간이 약간 증가합니다. 그러나 1초에 한 번 이하의 `INSERT`로 데이터를 배치 삽입하라는 권장 사항을 따르면 문제가 발생하지 않습니다. 하나의 ZooKeeper 클러스터를 조정에 사용하는 전체 ClickHouse 클러스터가 처리하는 `INSERT`의 총량은 초당 수백 개 수준입니다. 데이터 삽입 처리량(초당 행 수)은 비복제 데이터와 동일한 수준으로 유지됩니다.

매우 큰 클러스터에서는 서로 다른 세그먼트마다 서로 다른 ZooKeeper 클러스터를 사용할 수 있습니다. 그러나 실 운영 환경에서 약 300대 서버 규모의 프로덕션 클러스터를 기준으로 보면, 이는 반드시 필요하지는 않았습니다.

복제는 비동기이며 멀티 마스터 방식입니다. `INSERT` 쿼리(및 `ALTER`)는 사용 가능한 임의의 서버로 전송할 수 있습니다. 데이터는 쿼리가 실행되는 서버에 먼저 삽입된 후 다른 서버들로 복사됩니다. 비동기 방식이므로, 새로 삽입된 데이터가 다른 레플리카에 나타나기까지는 약간의 지연이 발생합니다. 일부 레플리카를 사용할 수 없는 경우, 해당 레플리카가 다시 사용 가능해지면 데이터가 기록됩니다. 레플리카를 사용할 수 있는 경우, 지연 시간은 압축된 데이터 블록을 네트워크로 전송하는 데 걸리는 시간입니다. 복제 테이블의 백그라운드 작업을 수행하는 스레드 수는 [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size) 설정으로 지정할 수 있습니다.

`ReplicatedMergeTree` 엔진은 복제 fetch 작업을 위해 별도의 스레드 풀을 사용합니다. 풀의 크기는 [background_fetches_pool_size](/operations/server-configuration-parameters/settings#background_fetches_pool_size) 설정으로 제한되며, 서버 재시작을 통해 조정할 수 있습니다.

기본적으로, `INSERT` 쿼리는 하나의 레플리카에서만 데이터 쓰기 완료 확인을 기다립니다. 데이터가 단 하나의 레플리카에만 성공적으로 기록되고, 해당 레플리카가 있는 서버가 더 이상 존재하지 않게 되면 저장된 데이터는 손실됩니다. 여러 레플리카로부터 데이터 쓰기 확인을 받도록 하려면 `insert_quorum` 옵션을 사용합니다.

각 데이터 블록은 원자적으로 기록됩니다. `INSERT` 쿼리는 최대 `max_insert_block_size = 1048576` 행까지의 블록으로 분할됩니다. 즉, `INSERT` 쿼리가 1048576행 미만을 포함하는 경우, 해당 쿼리는 하나의 원자 단위로 처리됩니다.

데이터 블록은 중복 제거(deduplication)됩니다. 동일한 데이터 블록(크기가 같고, 동일한 행이 같은 순서로 포함된 데이터 블록)을 여러 번 쓰려고 할 경우, 해당 블록은 한 번만 기록됩니다. 이는 네트워크 장애로 인해 클라이언트 애플리케이션이 DB에 데이터가 기록되었는지 알 수 없는 상황에서 `INSERT` 쿼리를 단순히 재시도할 수 있도록 하기 위한 것입니다. 동일한 데이터에 대해 `INSERT`가 어느 레플리카로 전송되었는지는 중요하지 않습니다. `INSERT` 작업은 멱등적(idempotent)입니다. 중복 제거 파라미터는 [merge_tree](/operations/server-configuration-parameters/settings.md/#merge_tree) 서버 설정으로 제어합니다.

복제 중에는 삽입할 원본 데이터만 네트워크를 통해 전송됩니다. 이후 데이터 변환(머지)은 모든 레플리카에서 동일한 방식으로 조정 및 수행됩니다. 이를 통해 네트워크 사용량을 최소화할 수 있으며, 레플리카가 서로 다른 데이터센터에 위치할 때도 복제가 효율적으로 동작합니다. (서로 다른 데이터센터에 데이터를 중복 저장하는 것이 복제의 주요 목표임에 유의하십시오.)

동일한 데이터에 대해 원하는 만큼 레플리카를 둘 수 있습니다. 실제 경험에 따르면, 프로덕션 환경에서는 각 서버에 RAID-5 또는 RAID-6(일부 경우에는 RAID-10)을 사용하고 이중 복제를 적용하는 구성이 비교적 안정적이고 편리한 솔루션이 될 수 있습니다.

시스템은 레플리카 간 데이터 동기화 상태를 모니터링하며, 장애 발생 후 복구할 수 있습니다. 장애 조치는 (데이터 차이가 작을 때는) 자동으로, (데이터 차이가 너무 커서 구성 오류를 의미할 수 있는 경우에는) 반자동으로 수행됩니다.

## 복제 테이블 생성 \{#creating-replicated-tables\}

:::note
ClickHouse Cloud에서는 복제가 자동으로 처리됩니다.

복제 관련 인수 없이 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree)를 사용하여 테이블을 생성합니다. 시스템은 내부적으로 복제 및 데이터 분산을 위해 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree)를 [`SharedMergeTree`](/cloud/reference/shared-merge-tree)로 자동 변환합니다.

플랫폼에서 복제를 관리하므로 `ReplicatedMergeTree`를 사용하거나 복제 매개변수를 지정하지 마십시오.

:::

### Replicated*MergeTree 매개변수 \{#replicatedmergetree-parameters\}

| Parameter          | Description                                                                   |
| ------------------ | ----------------------------------------------------------------------------- |
| `zoo_path`         | ClickHouse Keeper에서 테이블 경로입니다.                                                |
| `replica_name`     | ClickHouse Keeper에서 레플리카 이름입니다.                                               |
| `other_parameters` | 레플리카 버전을 생성할 때 사용하는 엔진의 매개변수입니다. 예를 들어 `ReplacingMergeTree`의 version 등이 있습니다. |

예시:

```sql
CREATE TABLE table_name
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32,
    ver UInt16
)
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{layer}-{shard}/table_name', '{replica}', ver)
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate, intHash32(UserID))
SAMPLE BY intHash32(UserID);
```

<details markdown="1">
  <summary>사용이 중단된 구문 예시</summary>

  ```sql
  CREATE TABLE table_name
  (
      EventDate DateTime,
      CounterID UInt32,
      UserID UInt32
  ) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID), EventTime), 8192);
  ```
</details>

위 예시에서 볼 수 있듯이, 이러한 매개변수에는 중괄호로 둘러싸인 치환용 값을 포함할 수 있습니다. 치환에 사용되는 값은 설정 파일의 [macros](/operations/server-configuration-parameters/settings.md/#macros) 섹션에서 가져옵니다.

예시:

```xml
<macros>
    <shard>02</shard>
    <replica>example05-02-1</replica>
</macros>
```

ClickHouse Keeper에서의 테이블 경로는 각 복제된 테이블마다 고유해야 합니다. 서로 다른 세그먼트에 있는 테이블은 서로 다른 경로를 가져야 합니다.
이 경우 경로는 다음과 같은 파트로 구성됩니다:

`/clickhouse/tables/`는 공통 접두사입니다. 이 값을 그대로 사용할 것을 권장합니다.

`{shard}`는 세그먼트 식별자로 확장됩니다.

`table_name`은 ClickHouse Keeper에서 테이블에 해당하는 노드 이름입니다. 테이블 이름과 동일하게 설정하는 것이 좋습니다. 테이블 이름과 달리 `RENAME` 쿼리 이후에도 변경되지 않기 때문에 명시적으로 정의합니다.
*HINT*: `table_name` 앞에 데이터베이스 이름을 추가할 수도 있습니다. 예: `db_name.table_name`

두 가지 내장 치환자인 `{database}`와 `{table}`를 사용할 수 있으며, 각각 테이블 이름과 데이터베이스 이름으로 확장됩니다 (`macros` 섹션에서 이 매크로들이 정의되어 있지 않은 경우). 따라서 ZooKeeper 경로를 `'/clickhouse/tables/{shard}/{database}/{table}'`로 지정할 수 있습니다.
이러한 내장 치환을 사용할 때는 테이블 이름 변경에 주의해야 합니다. ClickHouse Keeper의 경로는 변경할 수 없으며, 테이블 이름이 변경되면 매크로가 다른 경로로 확장되고, 테이블은 ClickHouse Keeper에 존재하지 않는 경로를 참조하게 되어 읽기 전용(read-only) 모드로 전환됩니다.

레플리카 이름은 동일한 테이블의 서로 다른 레플리카를 식별합니다. 예제와 같이 서버 이름을 사용할 수 있습니다. 이 이름은 각 세그먼트 내에서만 고유하면 됩니다.

치환을 사용하는 대신 매개변수를 명시적으로 정의할 수도 있습니다. 이는 테스트나 소규모 클러스터 구성 시 편리할 수 있습니다. 그러나 이 경우에는 분산 DDL 쿼리(`ON CLUSTER`)를 사용할 수 없습니다.

대규모 클러스터를 다룰 때는 오류 가능성을 줄이기 위해 치환 사용을 권장합니다.

서버 구성 파일에서 `Replicated` 테이블 엔진에 대한 기본 인자를 지정할 수 있습니다. 예를 들면 다음과 같습니다:

```xml
<default_replica_path>/clickhouse/tables/{shard}/{database}/{table}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

이 경우 테이블을 생성할 때 인수를 생략해도 됩니다:

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree
ORDER BY x;
```

다음과 같습니다.

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/{database}/table_name', '{replica}')
ORDER BY x;
```

각 레플리카에서 `CREATE TABLE` 쿼리를 실행합니다. 이 쿼리는 새 복제된 테이블을 만들거나, 기존 테이블에 새 레플리카를 추가합니다.

다른 레플리카에 이미 데이터가 있는 상태에서 새 레플리카를 추가하면, 쿼리를 실행한 후 다른 레플리카의 데이터가 새 레플리카로 복사됩니다. 즉, 새 레플리카가 나머지 레플리카와 동기화됩니다.

레플리카를 삭제하려면 `DROP TABLE`을 실행합니다. 단, 레플리카 하나만 삭제되며, 쿼리를 실행한 서버에 있는 레플리카만 삭제됩니다.


## 장애 발생 후 복구 \{#recovery-after-failures\}

서버가 시작될 때 ClickHouse Keeper를 사용할 수 없으면, 복제된 테이블은 읽기 전용 모드로 전환됩니다. 시스템은 주기적으로 ClickHouse Keeper에 연결을 시도합니다.

`INSERT` 중에 ClickHouse Keeper를 사용할 수 없거나, ClickHouse Keeper와 상호 작용하는 동안 오류가 발생하면 예외가 발생합니다.

ClickHouse Keeper에 연결한 후 시스템은 로컬 파일 시스템의 데이터 집합이 예상되는 데이터 집합(이 정보는 ClickHouse Keeper에 저장됨)과 일치하는지 확인합니다. 사소한 불일치가 있으면 시스템은 레플리카와의 데이터 동기화를 통해 이를 해결합니다.

시스템이 손상된 데이터 파트(파일 크기가 잘못된 경우) 또는 인식할 수 없는 파트(파일 시스템에 기록되었지만 ClickHouse Keeper에는 기록되지 않은 파트)를 감지하면, 해당 파트를 `detached` 하위 디렉터리로 이동합니다(삭제되지는 않습니다). 누락된 파트는 레플리카에서 복사됩니다.

ClickHouse는 대량의 데이터를 자동으로 삭제하는 것과 같은 파괴적인 작업을 수행하지 않는다는 점에 유의하십시오.

서버가 시작될 때(또는 ClickHouse Keeper와 새 세션을 설정할 때) 모든 파일의 개수와 크기만 확인합니다. 파일 크기는 일치하지만 중간의 일부 바이트가 변경된 경우, 이 문제는 즉시 감지되지 않고 `SELECT` 쿼리로 데이터를 읽으려고 할 때만 감지됩니다. 이때 쿼리는 체크섬 또는 압축 블록 크기가 일치하지 않는다는 예외를 발생시킵니다. 이런 경우 데이터 파트는 검증 큐에 추가되며, 필요할 경우 레플리카에서 복사됩니다.

로컬 데이터 집합이 예상되는 데이터 집합과 지나치게 다르면 안전 메커니즘이 동작합니다. 서버는 이 사실을 로그에 기록하고 기동을 거부합니다. 이는 세그먼트의 레플리카를 실수로 다른 세그먼트의 레플리카처럼 구성한 경우와 같은 설정 오류를 나타낼 수 있기 때문입니다. 다만 이 메커니즘의 임계값은 상당히 낮게 설정되어 있어, 정상적인 장애 복구 중에도 이 상황이 발생할 수 있습니다. 이 경우 데이터는 「버튼을 한 번 누르는 것」과 같은 수준의 조작으로 반자동으로 복원됩니다.

복구를 시작하려면 ClickHouse Keeper에서 `/path_to_table/replica_name/flags/force_restore_data` 노드를 임의의 내용으로 생성하거나, 모든 복제된 테이블을 복원하는 명령을 실행하면 됩니다.

```bash
sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data
```

그런 다음 서버를 재시작합니다. 서버가 시작되면 이러한 플래그를 삭제하고 복구를 시작합니다.


## 전체 데이터 손실 이후 복구 \{#recovery-after-complete-data-loss\}

서버 중 하나에서 모든 데이터와 메타데이터가 사라진 경우, 다음 단계에 따라 복구합니다:

1.  해당 서버에 ClickHouse를 설치합니다. 세그먼트 식별자와 레플리카를 사용하는 경우, 이를 포함하는 설정 파일에서 치환(substitution) 값을 올바르게 정의합니다.
2.  서버에 수동으로 복제해야 하는 비복제 테이블이 있었다면, 레플리카의 데이터(디렉토리 `/var/lib/clickhouse/data/db_name/table_name/` 내)를 복사합니다.
3.  레플리카에서 `/var/lib/clickhouse/metadata/`에 위치한 테이블 정의를 복사합니다. 테이블 정의에 세그먼트 또는 레플리카 식별자가 명시적으로 정의되어 있는 경우, 이 레플리카에 해당하도록 올바르게 수정합니다. (또는 서버를 시작한 후 `/var/lib/clickhouse/metadata/` 내 .sql 파일에 있어야 할 모든 `ATTACH TABLE` 쿼리를 실행합니다.)
4.  복구를 시작하려면 임의의 내용을 담아 ClickHouse Keeper 노드 `/path_to_table/replica_name/flags/force_restore_data`를 생성하거나, 모든 복제된 테이블을 복구하기 위한 다음 명령을 실행합니다: `sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data`

그런 다음 서버를 시작합니다(이미 실행 중인 경우 재시작합니다). 데이터는 레플리카에서 다시 동기화됩니다.

다른 복구 방법으로, ClickHouse Keeper에서 손실된 레플리카에 대한 정보(`/path_to_table/replica_name`)를 삭제한 후, "[복제 테이블 생성](#creating-replicated-tables)"에 설명된 대로 레플리카를 다시 생성할 수 있습니다.

복구 중 네트워크 대역폭에 대한 제한은 없습니다. 여러 레플리카를 한 번에 복구하는 경우 이 점을 유의해야 합니다.

## MergeTree에서 ReplicatedMergeTree로 변환 \{#converting-from-mergetree-to-replicatedmergetree\}

`MergeTree`라는 용어는 `ReplicatedMergeTree`와 마찬가지로 `MergeTree 패밀리`에 속한 모든 테이블 엔진을 의미합니다.

수동으로 복제해 둔 `MergeTree` 테이블이 있다면, 이를 복제된 테이블로 변환할 수 있습니다. 이미 `MergeTree` 테이블에 대량의 데이터를 적재해 둔 상태에서 이제 복제를 활성화하려는 경우에 필요할 수 있습니다.

[ATTACH TABLE ... AS REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) SQL 문을 사용하면 분리(detached)된 `MergeTree` 테이블을 `ReplicatedMergeTree`로 ATTACH할 수 있습니다.

서버를 재시작할 때 테이블의 데이터 디렉터리(예: `Atomic` 데이터베이스의 경우 `/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/`)에 `convert_to_replicated` 플래그가 설정되어 있으면 `MergeTree` 테이블은 자동으로 변환됩니다.
비어 있는 `convert_to_replicated` 파일을 생성하면, 다음 서버 재시작 시 테이블이 복제된 테이블로 로드됩니다.

다음 쿼리를 사용하여 테이블의 데이터 경로를 확인할 수 있습니다. 테이블에 데이터 경로가 여러 개 있는 경우, 첫 번째 경로를 사용해야 합니다.

```sql
SELECT data_paths FROM system.tables WHERE table = 'table_name' AND database = 'database_name';
```

ReplicatedMergeTree 테이블은 `default_replica_path` 및 `default_replica_name` 설정 값을 사용하여 생성됩니다.
다른 레플리카에서 변환된 테이블을 생성하려면 `ReplicatedMergeTree` 엔진의 첫 번째 인수에 해당 경로를 명시적으로 지정해야 합니다. 다음 쿼리를 사용하여 해당 경로를 조회할 수 있습니다.

```sql
SELECT zookeeper_path FROM system.replicas WHERE table = 'table_name';
```

이 작업을 수동으로 수행하는 방법도 있습니다.

여러 레플리카에서 데이터가 서로 다르다면 먼저 데이터를 동기화하거나, 한 레플리카를 제외한 나머지 모든 레플리카에서 해당 데이터를 삭제합니다.

기존 MergeTree 테이블의 이름을 변경한 다음, 기존 이름을 사용하여 `ReplicatedMergeTree` 테이블을 생성합니다.
이전 테이블에서 새 테이블의 데이터 디렉터리(`/var/lib/clickhouse/data/db_name/table_name/`) 안에 있는 `detached` 하위 디렉터리로 데이터를 이동합니다.
그런 다음 레플리카 중 하나에서 `ALTER TABLE ATTACH PARTITION`을 실행하여 이 데이터 파트들을 작업 세트에 추가합니다.


## ReplicatedMergeTree에서 MergeTree로 변환 \{#converting-from-replicatedmergetree-to-mergetree\}

단일 서버에서 분리된(detached) `ReplicatedMergeTree` 테이블을 `MergeTree`로 다시 연결하려면 [`ATTACH TABLE ... AS NOT REPLICATED`](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) SQL 문을 사용합니다.

다른 방법으로는 서버를 재시작하는 방식이 있습니다. 먼저 다른 이름으로 `MergeTree` 테이블을 CREATE합니다. `ReplicatedMergeTree` 테이블 데이터가 있는 디렉터리에서 모든 데이터를 새 테이블의 데이터 디렉터리로 이동합니다. 그런 다음 `ReplicatedMergeTree` 테이블을 삭제하고 서버를 재시작합니다.

서버를 시작하지 않고 `ReplicatedMergeTree` 테이블을 제거하려면 다음을 수행합니다:

- 메타데이터 디렉터리(`/var/lib/clickhouse/metadata/`)에서 해당 `.sql` 파일을 삭제합니다.
- ClickHouse Keeper에서 해당 경로(`/path_to_table/replica_name`)를 삭제합니다.

이 작업을 완료한 후 서버를 시작하고, `MergeTree` 테이블을 CREATE한 다음, 그 디렉터리로 데이터를 이동하고, 서버를 다시 재시작합니다.

## ClickHouse Keeper 클러스터 메타데이터 손실 또는 손상 시 복구 \{#recovery-when-metadata-in-the-zookeeper-cluster-is-lost-or-damaged\}

ClickHouse Keeper의 데이터가 손실되거나 손상된 경우, 위에서 설명한 대로 데이터를 비복제 테이블로 이동해 보존할 수 있습니다.

**함께 보기**

- [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)
- [background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)
- [execute_merges_on_single_replica_time_threshold](/operations/settings/merge-tree-settings#execute_merges_on_single_replica_time_threshold)
- [max_replicated_fetches_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_fetches_network_bandwidth)
- [max_replicated_sends_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_sends_network_bandwidth)