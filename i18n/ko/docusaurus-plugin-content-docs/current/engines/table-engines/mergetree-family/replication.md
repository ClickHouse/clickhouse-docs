---
'description': 'ClickHouse에서 Replicated* 테이블 엔진 패밀리를 사용한 데이터 복제 개요'
'sidebar_label': '복제된*'
'sidebar_position': 20
'slug': '/engines/table-engines/mergetree-family/replication'
'title': '복제된* 테이블 엔진'
'doc_type': 'reference'
---


# Replicated* 테이블 엔진

:::note
ClickHouse Cloud에서는 복제가 자동으로 관리됩니다. 인수를 추가하지 않고 테이블을 생성해 주세요. 예를 들어, 아래 텍스트에서 다음을 교체합니다:

```sql
ENGINE = ReplicatedMergeTree(
    '/clickhouse/tables/{shard}/table_name',
    '{replica}'
)
```

을 다음으로:

```sql
ENGINE = ReplicatedMergeTree
```
:::

복제는 MergeTree 계열의 테이블에 대해서만 지원됩니다:

- ReplicatedMergeTree
- ReplicatedSummingMergeTree
- ReplicatedReplacingMergeTree
- ReplicatedAggregatingMergeTree
- ReplicatedCollapsingMergeTree
- ReplicatedVersionedCollapsingMergeTree
- ReplicatedGraphiteMergeTree

복제는 개별 테이블 수준에서 작동하며, 전체 서버 수준이 아닙니다. 하나의 서버는 복제된 테이블과 비복제 테이블을 동시에 저장할 수 있습니다.

`INSERT` 및 `ALTER` 쿼리의 압축된 데이터는 복제됩니다 (자세한 내용은 [ALTER](/sql-reference/statements/alter) 문서를 참조하세요).

`CREATE`, `DROP`, `ATTACH`, `DETACH`, `RENAME` 쿼리는 단일 서버에서 실행되며 복제되지 않습니다:

- `CREATE TABLE` 쿼리는 쿼리가 실행되는 서버에 새로운 복제 가능한 테이블을 생성합니다. 이 테이블이 다른 서버에 이미 존재하는 경우, 새로운 복제본을 추가합니다.
- `DROP TABLE` 쿼리는 쿼리가 실행되는 서버에 있는 복제본을 삭제합니다.
- `RENAME` 쿼리는 복제본 중 하나에서 테이블의 이름을 변경합니다. 즉, 복제된 테이블은 서로 다른 복제본에서 서로 다른 이름을 가질 수 있습니다.

ClickHouse는 [ClickHouse Keeper](/guides/sre/keeper/index.md)를 사용하여 복제본의 메타 정보를 저장합니다. ZooKeeper 버전 3.4.5 이상을 사용할 수도 있지만 ClickHouse Keeper 사용을 권장합니다.

복제를 사용하려면 [zookeeper](/operations/server-configuration-parameters/settings#zookeeper) 서버 구성 섹션에서 매개변수를 설정하세요.

:::note
보안 설정을 소홀히 하지 마세요. ClickHouse는 ZooKeeper 보안 하위 시스템의 `digest` [ACL 스킴](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#sc_ZooKeeperAccessControl)을 지원합니다.
:::

ClickHouse Keeper 클러스터의 주소를 설정하는 예시:

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

ClickHouse는 또한 보조 ZooKeeper 클러스터에 복제본의 메타 정보를 저장하는 것을 지원합니다. 이를 위해 엔진 인수로 ZooKeeper 클러스터 이름과 경로를 제공해야 합니다. 즉, 서로 다른 테이블의 메타데이터를 서로 다른 ZooKeeper 클러스터에 저장하는 것을 지원합니다.

보조 ZooKeeper 클러스터의 주소를 설정하는 예시:

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

기본 ZooKeeper 클러스터 대신 보조 ZooKeeper 클러스터에 테이블 메타데이터를 저장하려면 다음과 같이 ReplicatedMergeTree 엔진으로 SQL을 사용하여 테이블을 생성할 수 있습니다:

```sql
CREATE TABLE table_name ( ... ) ENGINE = ReplicatedMergeTree('zookeeper_name_configured_in_auxiliary_zookeepers:path', 'replica_name') ...
```
기존 ZooKeeper 클러스터를 지정할 수 있으며, 시스템은 복제 가능한 테이블 생성 시 해당 클러스터의 디렉토리를 데이터 저장용으로 사용합니다.

구성 파일에 ZooKeeper가 설정되어 있지 않으면, 복제된 테이블을 생성할 수 없으며, 기존 복제된 테이블은 읽기 전용이 됩니다.

ZooKeeper는 `SELECT` 쿼리에서 사용되지 않으며, 복제가 `SELECT` 성능에 영향을 미치지 않기 때문에 쿼리는 비복제 테이블과 동일한 속도로 실행됩니다. 분산 복제 테이블을 쿼리할 때 ClickHouse의 동작은 [max_replica_delay_for_distributed_queries](/operations/settings/settings.md/#max_replica_delay_for_distributed_queries) 및 [fallback_to_stale_replicas_for_distributed_queries](/operations/settings/settings.md/#fallback_to_stale_replicas_for_distributed_queries) 설정에 의해 제어됩니다.

각 `INSERT` 쿼리에 대해 약 10개의 항목이 여러 트랜잭션을 통해 ZooKeeper에 추가됩니다. (정확히 말하면, 이는 삽입된 데이터 블록마다 해당되며, `INSERT` 쿼리는 하나의 블록 또는 `max_insert_block_size = 1048576` 행당 하나의 블록을 포함합니다.) 이로 인해 비복제 테이블에 비해 `INSERT`의 대기 시간이 약간 길어질 수 있습니다. 하지만 데이터를 초당 한 번의 `INSERT`로 배치로 삽입하는 권장 사항을 따르면 문제를 만들지 않습니다. 하나의 ZooKeeper 클러스터 조정을 위한 전체 ClickHouse 클러스터는 초당 수백 개의 `INSERT`를 수행합니다. 데이터 삽입 처리량(초당 행 수)은 비복제 데이터와 동일하게 높습니다.

매우 큰 클러스터의 경우, 서로 다른 샤드에 대해 서로 다른 ZooKeeper 클러스터를 사용할 수 있습니다. 그러나 우리의 경험상, 약 300대의 서버로 구성된 프로덕션 클러스터에서는 이것이 필요하지 않다는 것이 입증되었습니다.

복제는 비동기 및 다중 마스터 방식입니다. `INSERT` 쿼리(및 `ALTER`)는 사용 가능한 서버에 보낼 수 있습니다. 데이터는 쿼리가 실행되는 서버에 삽입된 후 다른 서버에 복사됩니다. 비동기 방식이기 때문에 최근에 삽입된 데이터는 다른 복제본에 약간의 지연과 함께 나타납니다. 일부 복제본이 사용 불가능하면 데이터는 해당 복제본이 사용 가능해질 때 기록됩니다. 복제본이 사용 가능하다면, 지연 시간은 네트워크를 통해 압축된 데이터 블록을 전송하는 데 걸리는 시간입니다. 복제된 테이블의 백그라운드 작업을 수행하는 스레드 수는 [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size) 설정으로 설정할 수 있습니다.

`ReplicatedMergeTree` 엔진은 복제된 페치를 위한 별도의 스레드 풀을 사용합니다. 풀의 크기는 [background_fetches_pool_size](/operations/server-configuration-parameters/settings#background_fetches_pool_size) 설정으로 제한되며, 서버 재시작 시 조정할 수 있습니다.

기본적으로, `INSERT` 쿼리는 단일 복제본에서 데이터 쓰기 확인을 기다립니다. 데이터가 단일 복제본에 성공적으로 기록되었고, 이 복제본이 있는 서버가 존재하지 않게 되면, 저장된 데이터는 손실됩니다. 여러 복제본에서 데이터 쓰기 확인을 받으려면 `insert_quorum` 옵션을 사용하세요.

데이터 블록은 원자적으로 작성됩니다. `INSERT` 쿼리는 최대 `max_insert_block_size = 1048576` 행까지 블록으로 나뉩니다. 즉, `INSERT` 쿼리가 1048576행보다 적으면 원자적으로 수행됩니다.

데이터 블록은 중복되지 않습니다. 동일한 데이터 블록(동일한 크기의 데이터 블록이 동일한 행을 동일한 순서로 포함) 여러 번 기록할 경우, 해당 블록은 한 번만 기록됩니다. 이는 네트워크 장애가 발생했을 때 클라이언트 애플리케이션이 데이터가 DB에 기록되었는지 확인할 수 없으므로 `INSERT` 쿼리를 단순히 반복할 수 있는 이유입니다. 동일한 데이터를 가진 `INSERTs`가 어떤 복제본에 전송되었는지는 중요하지 않습니다. `INSERTs`는 항등적입니다. 중복 제거 매개변수는 [merge_tree](/operations/server-configuration-parameters/settings.md/#merge_tree) 서버 설정으로 제어됩니다.

복제 중에는 삽입할 원본 데이터만 네트워크를 통해 전달됩니다. 이후 데이터 변환(병합)은 모든 복제본에서 동일한 방식으로 조정되고 수행됩니다. 이는 네트워크 사용을 최소화하여 복제가 서로 다른 데이터 센터에 있는 복제본이 잘 작동하게 만듭니다. (다른 데이터 센터에 데이터를 복제하는 것이 복제의 주요 목표라는 점에 유의하세요.)

동일한 데이터의 복제본을 얼마나 많이 만들 수 있습니다. 우리의 경험에 비추어 볼 때, 각 서버가 RAID-5 또는 RAID-6(일부 경우 RAID-10)을 사용하는 이중 복제를 생산 시스템에서 사용하는 것이 비교적 안정적이고 편리한 솔루션이 될 수 있습니다.

시스템은 복제본에서 데이터 동기화를 모니터링하며 고장 후 복구할 수 있습니다. 장애 조치는 자동(데이터 차이가 적은 경우) 또는 반자동(데이터 차이가 너무 커서 구성 오류를 나타낼 수 있는 경우)입니다.

## 복제 테이블 생성하기 {#creating-replicated-tables}

:::note
ClickHouse Cloud에서는 복제가 자동으로 처리됩니다.

복제 인수 없이 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree)를 사용하여 테이블을 생성하세요. 시스템은 내부적으로 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree)를 복제 및 데이터 분산을 위해 [`SharedMergeTree`](/cloud/reference/shared-merge-tree)로 재작성합니다.

복제 매개변수를 지정하거나 `ReplicatedMergeTree`를 사용하지 마세요. 복제는 플랫폼에 의해 관리됩니다.

:::

### Replicated*MergeTree 매개변수 {#replicatedmergetree-parameters}

| 매개변수       | 설명                                                                    |
|-----------------|-------------------------------------------------------------------------|
| `zoo_path`      | ClickHouse Keeper 내 테이블의 경로입니다.                                     |
| `replica_name`  | ClickHouse Keeper 내 복제본 이름입니다.                                      |
| `other_parameters` | 복제된 버전을 생성하는 데 사용되는 엔진의 매개변수, 예를 들어, `ReplacingMergeTree`의 버전입니다. |

예시:

```sql
CREATE TABLE table_name
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32,
    ver UInt16
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{layer}-{shard}/table_name', '{replica}', ver)
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate, intHash32(UserID))
SAMPLE BY intHash32(UserID);
```

<details markdown="1">

<summary>구식 구문 예시</summary>

```sql
CREATE TABLE table_name
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID), EventTime), 8192);
```

</details>

예시에서 볼 수 있듯이, 이러한 매개변수는 중괄호 안에 대체 내용을 포함할 수 있습니다. 대체된 값은 구성 파일의 [macros](/operations/server-configuration-parameters/settings.md/#macros) 섹션에서 가져옵니다.

예시:

```xml
<macros>
    <shard>02</shard>
    <replica>example05-02-1</replica>
</macros>
```

ClickHouse Keeper 내 테이블의 경로는 각 복제 테이블에 대해 고유해야 합니다. 서로 다른 샤드에 있는 테이블들은 서로 다른 경로를 가져야 합니다.
이 경우 경로는 다음 부분으로 구성됩니다:

`/clickhouse/tables/`는 공통 접두사입니다. 우리는 정확히 이 접두사를 사용하는 것을 권장합니다.

`{shard}`는 샤드 식별자로 확장됩니다.

`table_name`은 ClickHouse Keeper 내 테이블의 노드 이름입니다. 이 이름을 테이블 이름과 동일하게 만드는 것이 좋습니다. 명시적으로 정의되어 있기 때문에, 테이블 이름과는 달리 RENAME 쿼리 후에 변경되지 않습니다.
*힌트*: `table_name` 앞에 데이터베이스 이름을 추가할 수도 있습니다. 예: `db_name.table_name`

내장된 두 가지 대체 `{database}` 및 `{table}`를 사용할 수 있으며, 각각 테이블 이름 및 데이터베이스 이름으로 확장됩니다(이 매크로가 `macros` 섹션에 정의되지 않은 경우). 따라서 zookeeper 경로는 `'/clickhouse/tables/{shard}/{database}/{table}'`로 지정할 수 있습니다.
이러한 내장된 대체를 사용할 때 테이블 이름 변경에 주의하세요. ClickHouse Keeper 내 경로는 변경할 수 없으며, 테이블의 이름이 변경될 때 매크로는 다른 경로로 확장되어 테이블이 ClickHouse Keeper에 존재하지 않는 경로를 참조하게 하며 읽기 전용 모드로 전환됩니다.

복제본 이름은 동일한 테이블의 서로 다른 복제본을 식별합니다. 예시와 같이 서버 이름을 사용하여 이를 수행할 수 있습니다. 이름은 각 샤드 내에서만 고유할 필요가 있습니다.

매개변수를 대체 대신 명시적으로 정의할 수 있습니다. 이는 소규모 클러스터를 테스트하고 구성할 때 편리할 수 있습니다. 그러나 이 경우 분산 DDL 쿼리(`ON CLUSTER`)를 사용할 수 없습니다.

대규모 클러스터 작업시 오류 확률을 줄이는 데 대체 사용을 권장합니다.

서버 구성 파일에 `Replicated` 테이블 엔진의 기본 인수를 지정할 수 있습니다. 예를 들어:

```xml
<default_replica_path>/clickhouse/tables/{shard}/{database}/{table}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

이 경우, 테이블을 생성할 때 인수를 생략할 수 있습니다:

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree
ORDER BY x;
```

이는 다음과 동일합니다:

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/{database}/table_name', '{replica}')
ORDER BY x;
```

각 복제본에서 `CREATE TABLE` 쿼리를 실행합니다. 이 쿼리는 새로운 복제 테이블을 생성하거나 기존 테이블에 새로운 복제본을 추가합니다.

서버에 있는 다른 복제본에 테이블에 이미 데이터가 있는 경우 새 복제본을 추가하면, 쿼리를 실행한 후 다른 복제본에서 데이터를 복사합니다. 즉, 새 복제본은 다른 복제본과 동기화됩니다.

복제본을 삭제하려면 `DROP TABLE`을 실행합니다. 그러나 하나의 복제본만 삭제됩니다 – 쿼리를 실행하는 서버에 있는 복제본입니다.

## 장애 후 복구 {#recovery-after-failures}

서버가 시작할 때 ClickHouse Keeper를 사용할 수 없는 경우, 복제된 테이블은 읽기 전용 모드로 전환됩니다. 시스템은 정기적으로 ClickHouse Keeper에 연결을 시도합니다.

`INSERT` 중 ClickHouse Keeper가 사용할 수 없거나 ClickHouse Keeper와의 상호작용 중 오류가 발생하면 예외가 발생합니다.

ClickHouse Keeper에 연결되면 시스템은 로컬 파일 시스템의 데이터 집합이 예상 데이터 집합과 일치하는지 확인합니다 (ClickHouse Keeper가 이 정보를 저장합니다). 작은 불일치가 있는 경우, 시스템은 복제본과 데이터를 동기화하여 해결합니다.

시스템이 손상된 데이터 부분(잘못된 파일 크기) 또는 인식되지 않는 부분(파일 시스템에 기록되었지만 ClickHouse Keeper에는 기록되지 않은 부분)을 감지하면, 이를 `detached` 하위 디렉토리로 이동합니다 (삭제되지 않습니다). 누락된 모든 부분은 복제본에서 복사됩니다.

ClickHouse는 대량의 데이터를 자동으로 삭제하는 등의 파괴적인 작업을 수행하지 않는다는 점에 유의하세요.

서버가 시작되거나 ClickHouse Keeper와의 새 세션을 설정할 때, 시스템은 모든 파일의 수량과 크기만 확인합니다. 파일 크기가 일치하지만 중간의 바이트가 변경된 경우, 이는 즉시 감지되지 않고 `SELECT` 쿼리에서 데이터를 읽으려고 할 때 까지 감지되지 않습니다. 쿼리는 일치하지 않는 체크섬이나 압축 블록 크기에 대한 예외를 발생시킵니다. 이 경우 데이터 파트가 검증 대기열에 추가되고 필요할 경우 복제본에서 복사됩니다.

로컬 데이터 집합이 예상 데이터 집합과 다르다면, 안전 메커니즘이 작동합니다. 이 경우 서버는 이를 로그에 기록하고 시작을 거부합니다. 이는 이 경우 구성 오류를 나타낼 수 있다는 이유에서입니다. 예를 들어 샤드의 복제본이 다른 샤드의 복제본과 똑같이 구성된 경우입니다. 그러나 이 메커니즘의 임계값은 매우 낮게 설정되어 있으며, 정상적인 장애 복구 동안 이러한 상황이 발생할 수 있습니다. 이 경우 데이터는 반자동으로 복구됩니다 - "버튼을 눌러서".

복구를 시작하려면 ClickHouse Keeper에 `/path_to_table/replica_name/flags/force_restore_data` 노드를 생성하고 아무 내용으로 작성하거나 모든 복제 테이블을 복구하는 명령어를 실행합니다:

```bash
sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data
```

그런 다음 서버를 재시작하세요. 시작 시 서버는 이러한 플래그를 삭제하고 복구를 시작합니다.

## 전체 데이터 손실 후 복구 {#recovery-after-complete-data-loss}

서버 중 하나에서 모든 데이터와 메타데이터가 사라졌다면 다음 단계를 따라 복구합니다:

1.  서버에 ClickHouse를 설치합니다. 사용 중인 경우 샤드 식별자 및 복제본의 대체를 올바르게 정의합니다.
2.  수동으로 서버에 복제해야 할 비복제 테이블이 있었다면, 복제본에서 해당 데이터를 복사합니다 (디렉토리 `/var/lib/clickhouse/data/db_name/table_name/`).
3.  복제본에서 `/var/lib/clickhouse/metadata/`에 있는 테이블 정의를 복사합니다. 만약 테이블 정의에 샤드나 복제본 식별자가 명시적으로 정의되어 있다면, 이 복제본에 맞게 수정합니다. (대안으로, 서버를 시작하고 `/var/lib/clickhouse/metadata/`에 있는 .sql 파일에 있어야 할 모든 `ATTACH TABLE` 쿼리를 실행합니다.)
4.  복구를 시작하려면 ClickHouse Keeper에 `/path_to_table/replica_name/flags/force_restore_data` 노드를 생성하고 아무 내용으로 작성하거나 모든 복제 테이블을 복구하는 명령어를 실행합니다: `sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data`

그런 다음 서버를 시작하세요 (이미 실행 중인 경우 재시작). 데이터는 복제본에서 다운로드됩니다.

손실된 복제본에 대한 정보를 ClickHouse Keeper에서 삭제한 다음, "[복제 테이블 생성하기](#creating-replicated-tables)"에서 설명한 대로 복제본을 다시 생성하는 것도 대체 복구 옵션입니다.

복구 중에는 네트워크 대역폭에 대한 제한이 없습니다. 많은 복제본을 한 번에 복구하는 경우 이 점을 염두에 두세요.

## MergeTree에서 ReplicatedMergeTree로 변환하기 {#converting-from-mergetree-to-replicatedmergetree}

`MergeTree`라는 용어는 `ReplicatedMergeTree`와 마찬가지로 `MergeTree 계열`의 모든 테이블 엔진을 지칭합니다.

수동으로 복제된 `MergeTree` 테이블이 있었다면 이를 복제 테이블로 변환할 수 있습니다. 이미 `MergeTree` 테이블에 대량의 데이터를 수집한 상태에서 복제를 활성화하려는 경우 이 작업이 필요할 수 있습니다.

[ATTACH TABLE ... AS REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 문을 사용하여 분리된 `MergeTree` 테이블을 `ReplicatedMergeTree`로 첨부할 수 있습니다.

`MergeTree` 테이블은 서버가 재시작될 때 `convert_to_replicated` 플래그가 테이블의 데이터 디렉토리에 설정되어 있으면 자동으로 변환될 수 있습니다 (`Atomic` 데이터베이스의 경우 `/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/`).
빈 `convert_to_replicated` 파일을 생성하면 다음 서버 재시작 시 테이블이 복제로 로드됩니다.

다음 쿼리를 사용하여 테이블의 데이터 경로를 얻을 수 있습니다. 테이블에 여러 데이터 경로가 있는 경우, 첫 번째 경로를 사용해야 합니다.

```sql
SELECT data_paths FROM system.tables WHERE table = 'table_name' AND database = 'database_name';
```

ReplicatedMergeTree 테이블은 `default_replica_path` 및 `default_replica_name` 설정 값을 사용하여 생성됩니다.
다른 복제본에 변환된 테이블을 생성하려면, `ReplicatedMergeTree` 엔진의 첫 번째 인수로 해당 경로를 명시적으로 지정해야 합니다. 다음 쿼리를 사용하여 경로를 얻을 수 있습니다.

```sql
SELECT zookeeper_path FROM system.replicas WHERE table = 'table_name';
```

이것을 수행하는 수동 방법도 있습니다.

다양한 복제본에서 데이터가 다르면 먼저 데이터를 동기화하거나 한 개를 제외한 모든 복제본에서 이 데이터를 삭제하세요.

기존의 MergeTree 테이블 이름을 변경한 후, 새 이름으로 `ReplicatedMergeTree` 테이블을 생성합니다.
이전 테이블의 데이터를 새로운 테이블 데이터 디렉토리 내의 `detached` 하위 디렉토리로 이동합니다 (`/var/lib/clickhouse/data/db_name/table_name/`).
그런 다음 복제본 중 하나에서 `ALTER TABLE ATTACH PARTITION`을 실행하여 이러한 데이터 파트를 작업 세트에 추가합니다.

## ReplicatedMergeTree에서 MergeTree로 변환하기 {#converting-from-replicatedmergetree-to-mergetree}

[ATTACH TABLE ... AS NOT REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 문을 사용하여 단일 서버에서 분리된 `ReplicatedMergeTree` 테이블을 `MergeTree`로 첨부합니다.

또 다른 방법은 서버 재시작입니다. 다른 이름으로 MergeTree 테이블을 생성합니다. `ReplicatedMergeTree` 테이블 데이터가 있는 디렉토리에서 모든 데이터를 새로운 테이블의 데이터 디렉토리로 이동합니다. 그런 다음 `ReplicatedMergeTree` 테이블을 삭제하고 서버를 재시작합니다.

서버를 실행하지 않고 `ReplicatedMergeTree` 테이블을 제거하려면:

- 메타데이터 디렉토리(`/var/lib/clickhouse/metadata/`)에서 해당 `.sql` 파일을 삭제합니다.
- ClickHouse Keeper의 해당 경로(`/path_to_table/replica_name`)를 삭제합니다.

이후 서버를 실행하고 `MergeTree` 테이블을 생성하고 데이터를 해당 디렉토리로 이동한 후 서버를 재시작할 수 있습니다.

## ClickHouse Keeper 클러스터에서 메타데이터가 손실되거나 손상된 경우 복구 {#recovery-when-metadata-in-the-zookeeper-cluster-is-lost-or-damaged}

ClickHouse Keeper의 데이터가 손실되거나 손상된 경우, 위에 설명한 대로 비복제 테이블로 데이터를 이동하여 데이터를 저장할 수 있습니다.

**참고 문헌**

- [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)
- [background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)
- [execute_merges_on_single_replica_time_threshold](/operations/settings/merge-tree-settings#execute_merges_on_single_replica_time_threshold)
- [max_replicated_fetches_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_fetches_network_bandwidth)
- [max_replicated_sends_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_sends_network_bandwidth)
