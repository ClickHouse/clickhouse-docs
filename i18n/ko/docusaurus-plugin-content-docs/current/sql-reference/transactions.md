---
'description': 'ClickHouse에서의 트랜잭션 (ACID) 지원에 대한 페이지'
'slug': '/guides/developer/transactional'
'title': '트랜잭션 (ACID) 지원'
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 트랜잭션(ACID) 지원

## 사례 1: MergeTree* 계열의 하나의 테이블의 하나의 파티션에 INSERT {#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family}

삽입된 행이 패킹되어 하나의 블록으로 삽입될 경우 이는 트랜잭션(ACID)입니다 (참고사항 참조):
- 원자성: INSERT가 성공하거나 전체적으로 거부됩니다: 클라이언트에 확인이 전송되면 모든 행이 삽입된 것이고, 클라이언트에 오류가 전송되면 어떤 행도 삽입되지 않은 것입니다.
- 일관성: 테이블 제약 조건이 위반되지 않으면, INSERT의 모든 행이 삽입되고 INSERT가 성공합니다; 제약 조건이 위반되면 어떤 행도 삽입되지 않습니다.
- 고립성: 동시 클라이언트는 트랜잭션 시도 전 또는 성공적인 INSERT 후의 테이블 상태에 대한 일관된 스냅샷을 관찰합니다; 부분적인 상태는 보이지 않습니다. 다른 트랜잭션 내부의 클라이언트는 [스냅샷 고립](https://en.wikipedia.org/wiki/Snapshot_isolation)을 가지며, 트랜잭션 외부의 클라이언트는 [읽기 비 커밋](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted) 고립 수준을 가집니다.
- 지속성: 성공적인 INSERT는 클라이언트에 응답하기 전에 파일 시스템에 기록됩니다. 이는 단일 복제본 또는 여러 복제본에 기록되며(이는 `insert_quorum` 설정에 의해 제어됨), ClickHouse는 OS에 저장 미디어의 파일 시스템 데이터를 동기화하도록 요청할 수 있습니다(이는 `fsync_after_insert` 설정에 의해 제어됨).
- 하나의 문으로 여러 테이블에 INSERT 하는 것은 물리화된 뷰가 관련되어 있을 경우 가능합니다(클라이언트의 INSERT가 관련 물리화된 뷰가 있는 테이블로 전송될 때).

## 사례 2: MergeTree* 계열의 하나의 테이블의 여러 파티션에 INSERT {#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family}

위 사례 1과 동일하지만, 다음 사항이 추가됩니다:
- 테이블에 파티션이 여러 개 있고 INSERT가 여러 파티션을 포함할 경우, 각 파티션에 대한 삽입은 자체적으로 트랜잭션입니다.

## 사례 3: MergeTree* 계열의 하나의 분산 테이블에 INSERT {#case-3-insert-into-one-distributed-table-of-the-mergetree-family}

위 사례 1과 동일하지만, 다음 사항이 추가됩니다:
- 분산 테이블에 대한 INSERT는 전체적으로 트랜잭션이 아니지만, 각 샤드에 대한 삽입은 트랜잭션입니다.

## 사례 4: 버퍼 테이블 사용 {#case-4-using-a-buffer-table}

- 버퍼 테이블에 대한 삽입은 원자적이지도 않고 고립적이지도 않으며 일관적이지도 않고 지속적이지도 않습니다.

## 사례 5: async_insert 사용 {#case-5-using-async_insert}

위 사례 1과 동일하지만, 다음 사항이 추가됩니다:
- `async_insert`가 활성화되고 `wait_for_async_insert`가 1(기본값)로 설정되어 있을 경우에도 원자성이 보장되지만, `wait_for_async_insert`가 0으로 설정되면 원자성이 보장되지 않습니다.

## 참고사항 {#notes}
- 클라이언트에서 특정 데이터 형식으로 삽입된 행은 다음과 같은 경우 하나의 블록으로 패킹됩니다:
  - 삽입 형식이 행 기반(CSV, TSV, Values, JSONEachRow 등)이고 데이터가 `max_insert_block_size` 행(기본값 ~1,000,000) 이하이거나 병렬 파싱을 사용하는 경우 `min_chunk_bytes_for_parallel_parsing` 바이트(기본값 10MB) 이하인 경우
  - 삽입 형식이 컬럼 기반(Native, Parquet, ORC 등)이고 데이터가 하나의 블록의 데이터만 포함된 경우
- 삽입된 블록의 크기는 일반적으로 여러 설정에 따라 달라질 수 있습니다(예: `max_block_size`, `max_insert_block_size`, `min_insert_block_size_rows`, `min_insert_block_size_bytes`, `preferred_block_size_bytes` 등).
- 클라이언트가 서버로부터 응답을 받지 못한 경우 클라이언트는 트랜잭션이 성공했는지 알 수 없으며, 동일한 트랜잭션을 반복할 수 있습니다. 이는 정확히 한 번 삽입 속성을 사용합니다.
- ClickHouse는 내부적으로 동시 트랜잭션을 위해 [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control) 및 [스냅샷 고립](https://en.wikipedia.org/wiki/Snapshot_isolation)을 사용하고 있습니다.
- 서버가 종료되거나 충돌하는 경우에도 모든 ACID 속성이 유효합니다.
- 일반적인 설정에서 지속적인 삽입을 보장하려면 다른 AZ로 `insert_quorum` 또는 `fsync`를 활성화해야 합니다.
- ACID 용어에서 "일관성"은 분산 시스템의 의미를 포함하지 않으며, 이는 다양한 설정(예: select_sequential_consistency)에 의해 제어됩니다.
- 이 설명서는 여러 테이블, 물리화된 뷰 및 여러 SELECT에 대한 전체 기능 트랜잭션을 허용하는 새로운 트랜잭션 기능을 다루지 않습니다 (다음 섹션 "트랜잭션, 커밋 및 롤백" 참조).

## 트랜잭션, 커밋 및 롤백 {#transactions-commit-and-rollback}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

이 문서 상단에 설명된 기능 외에도, ClickHouse는 트랜잭션, 커밋 및 롤백 기능에 대한 실험적 지원을 제공합니다.

### 요구사항 {#requirements}

- 트랜잭션을 추적하기 위해 ClickHouse Keeper 또는 ZooKeeper 배포
- 원자적인 DB만 (기본값)
- 비복제 MergeTree 테이블 엔진만
- `config.d/transactions.xml`에 다음 설정을 추가하여 실험적 트랜잭션 지원을 활성화:
```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

### 참고사항 {#notes-1}
- 이는 실험적 기능이며 변화가 있을 것으로 예상해야 합니다.
- 트랜잭션 중 예외가 발생하면 트랜잭션을 커밋할 수 없습니다. 여기에는 오타로 인해 발생한 `UNKNOWN_FUNCTION` 예외를 포함한 모든 예외가 포함됩니다.
- 중첩 트랜잭션은 지원되지 않으며, 현재 트랜잭션을 완료하고 새 트랜잭션을 시작해야 합니다.

### 구성 {#configuration}

다음 예는 ClickHouse Keeper가 활성화된 단일 노드 ClickHouse 서버를 기준으로 합니다.

#### 실험적 트랜잭션 지원 활성화 {#enable-experimental-transaction-support}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### ClickHouse Keeper가 활성화된 단일 ClickHouse 서버 노드의 기본 구성 {#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled}

:::note
ClickHouse 서버 배포 및 적절한 ClickHouse Keeper 노드 군집에 대한 세부정보는 [배포](/deployment-guides/terminology.md) 문서를 참조하십시오. 여기에 보여진 구성은 실험적인 목적으로 사용됩니다.
:::

```xml title=/etc/clickhouse-server/config.d/config.xml
<clickhouse replace="true">
    <logger>
        <level>debug</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <display_name>node 1</display_name>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <zookeeper>
        <node>
            <host>clickhouse-01</host>
            <port>9181</port>
        </node>
    </zookeeper>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <server_id>1</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>
        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>information</raft_logs_level>
        </coordination_settings>
        <raft_configuration>
            <server>
                <id>1</id>
                <hostname>clickhouse-keeper-01</hostname>
                <port>9234</port>
            </server>
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

### 예시 {#example}

#### 실험적 트랜잭션이 활성화되었는지 확인 {#verify-that-experimental-transactions-are-enabled}

`BEGIN TRANSACTION` 또는 `START TRANSACTION`을 발행한 후 `ROLLBACK`을 발행하여 실험적 트랜잭션이 활성화되었고 ClickHouse Keeper가 트랜잭션 추적에 사용되고 있는지 확인하십시오.

```sql
BEGIN TRANSACTION
```
```response
Ok.
```

:::tip
다음 오류가 표시되면 구성 파일을 확인하여 `allow_experimental_transactions`가 `1`(또는 `0` 또는 `false`가 아닌 모든 값)으로 설정되어 있는지 확인하십시오.

```response
Code: 48. DB::Exception: Received from localhost:9000.
DB::Exception: Transactions are not supported.
(NOT_IMPLEMENTED)
```

다음으로 ClickHouse Keeper를 확인할 수 있습니다.

```bash
echo ruok | nc localhost 9181
```

ClickHouse Keeper는 `imok`으로 응답해야 합니다.
:::

```sql
ROLLBACK
```

```response
Ok.
```

#### 테스트를 위한 테이블 생성 {#create-a-table-for-testing}

:::tip
테이블 생성은 트랜잭션이 아닙니다. 이 DDL 쿼리를 트랜잭션 외부에서 실행하십시오.
:::

```sql
CREATE TABLE mergetree_table
(
    `n` Int64
)
ENGINE = MergeTree
ORDER BY n
```

```response
Ok.
```

#### 트랜잭션 시작 및 행 삽입 {#begin-a-transaction-and-insert-a-row}

```sql
BEGIN TRANSACTION
```

```response
Ok.
```

```sql
INSERT INTO mergetree_table FORMAT Values (10)
```

```response
Ok.
```

```sql
SELECT *
FROM mergetree_table
```

```response
┌──n─┐
│ 10 │
└────┘
```

:::note
트랜잭션 내에서 테이블을 쿼리하면 행이 삽입된 것을 볼 수 있으며, 비록 아직 커밋되지 않았더라도 확인할 수 있습니다.
:::

#### 트랜잭션 롤백 및 테이블 다시 쿼리 {#rollback-the-transaction-and-query-the-table-again}

트랜잭션이 롤백되었는지 확인하십시오:

```sql
ROLLBACK
```

```response
Ok.
```

```sql
SELECT *
FROM mergetree_table
```
```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

#### 트랜잭션 완료 및 테이블 다시 쿼리 {#complete-a-transaction-and-query-the-table-again}

```sql
BEGIN TRANSACTION
```
```response
Ok.
```

```sql
INSERT INTO mergetree_table FORMAT Values (42)
```

```response
Ok.
```

```sql
COMMIT
```

```response
Ok. Elapsed: 0.002 sec.
```

```sql
SELECT *
FROM mergetree_table
```

```response
┌──n─┐
│ 42 │
└────┘
```

### 트랜잭션 통찰 {#transactions-introspection}

`system.transactions` 테이블을 쿼리하여 트랜잭션을 검사할 수 있지만, 트랜잭션이 진행 중인 세션에서 해당 테이블을 쿼리할 수 없습니다. 두 번째 `clickhouse client` 세션을 열어 해당 테이블을 쿼리하십시오.

```sql
SELECT *
FROM system.transactions
FORMAT Vertical
```

```response
Row 1:
──────
tid:         (33,61,'51e60bce-6b82-4732-9e1d-b40705ae9ab8')
tid_hash:    11240433987908122467
elapsed:     210.017820947
is_readonly: 1
state:       RUNNING
```

## 자세한 정보 {#more-details}

자세한 내용은 이 [메타 이슈](https://github.com/ClickHouse/ClickHouse/issues/48794)를 참조하여 더 광범위한 테스트를 찾아보고 진행 상황을 최신 상태로 유지하십시오.
