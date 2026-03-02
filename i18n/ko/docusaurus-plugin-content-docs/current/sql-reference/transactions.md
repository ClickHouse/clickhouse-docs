---
description: 'ClickHouse의 트랜잭션(ACID) 지원에 대한 페이지'
slug: /guides/developer/transactional
title: '트랜잭션(ACID) 지원'
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 트랜잭션(ACID) 지원 \{#transactional-acid-support\}



## 사례 1: MergeTree* 패밀리의 한 테이블, 하나의 파티션에 대한 INSERT \{#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family\}

삽입되는 행이 하나의 블록으로 패킹되어 삽입되는 경우(아래 참고 사항 참조), 트랜잭션(ACID)으로 동작합니다:
- 원자성(Atomic): INSERT는 전체가 성공하거나 전체가 거부됩니다. 클라이언트에 성공 확인이 전송되면 모든 행이 삽입된 것이고, 클라이언트에 오류가 전송되면 어떤 행도 삽입되지 않은 것입니다.
- 일관성(Consistent): 테이블 제약 조건이 위반되지 않으면 INSERT에 포함된 모든 행이 삽입되어 INSERT가 성공합니다. 제약 조건이 위반되는 경우에는 어떤 행도 삽입되지 않습니다.
- 고립성(Isolated): 동시에 동작하는 클라이언트는 테이블의 일관된 스냅샷을 관측합니다. 즉, INSERT 시도 이전의 상태이거나 성공적인 INSERT 이후의 상태이며, 중간 상태는 관측되지 않습니다. 다른 트랜잭션 내부의 클라이언트는 [스냅샷 격리(snapshot isolation)](https://en.wikipedia.org/wiki/Snapshot_isolation)를 가지며, 트랜잭션 외부의 클라이언트는 [read uncommitted](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted) 격리 수준을 가집니다.
- 내구성(Durable): 성공한 INSERT는 클라이언트에 응답하기 전에 파일 시스템에 기록되며, 단일 레플리카 또는 여러 레플리카(`insert_quorum` 설정으로 제어)에 기록됩니다. 또한 ClickHouse는 스토리지 미디어에 파일 시스템 데이터를 동기화하도록 OS에 요청할 수 있습니다(`fsync_after_insert` 설정으로 제어).
- 하나의 문장으로 여러 테이블에 INSERT하는 것도 가능합니다. 이는 materialized view가 연관된 경우로, 클라이언트에서 INSERT하는 대상 테이블에 연관된 materialized view가 있는 경우입니다.



## 사례 2: MergeTree* 계열의 하나의 테이블에 여러 파티션으로의 INSERT \{#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family\}

위의 사례 1과 동일하나, 다음과 같은 차이가 있습니다:
- 테이블에 파티션이 많고 INSERT가 여러 파티션을 포함하는 경우, 각 파티션에 대한 삽입은 해당 파티션별로 각각 트랜잭션으로 처리됩니다



## 사례 3: MergeTree* 계열의 하나의 분산 테이블에 INSERT \{#case-3-insert-into-one-distributed-table-of-the-mergetree-family\}

위의 사례 1과 동일하지만, 다음과 같은 차이점이 있습니다.
- 분산 테이블(Distributed table)에 대한 INSERT는 전체적으로 트랜잭션으로 보장되지 않지만, 각 세그먼트에 대한 삽입은 트랜잭션으로 보장됩니다.



## Case 4: Buffer 테이블 사용 \{#case-4-using-a-buffer-table\}

- Buffer 테이블에 대한 insert 작업은 원자성, 고립성, 일관성, 내구성이 보장되지 않습니다.



## Case 5: async_insert 사용 \{#case-5-using-async_insert\}

위의 Case 1과 동일하지만, 다음과 같은 사항이 있습니다:
- `async_insert`가 활성화되어 있고 `wait_for_async_insert`가 1(기본값)로 설정된 경우에는 원자성이 보장되지만, `wait_for_async_insert`가 0으로 설정되면 원자성이 보장되지 않습니다.



## Notes \{#notes\}
- 클라이언트에서 어떤 데이터 포맷으로 삽입된 행은 다음과 같은 경우 하나의 블록으로 패킹됩니다.
  - 삽입 포맷이 행 기반(row-based) 포맷(CSV, TSV, Values, JSONEachRow 등)이고, 병렬 파싱이 사용되는 경우(기본값으로 활성화됨) 데이터에 포함된 행 수가 `max_insert_block_size` 행(기본적으로 약 1 000 000)보다 적거나, 바이트 수가 `min_chunk_bytes_for_parallel_parsing` 바이트(기본적으로 10 MB)보다 적을 때
  - 삽입 포맷이 컬럼 기반(column-based) 포맷(Native, Parquet, ORC 등)이고, 데이터에 블록이 하나만 포함되어 있을 때
- 일반적으로 삽입된 블록의 크기는 여러 설정값에 따라 달라질 수 있습니다(예: `max_block_size`, `max_insert_block_size`, `min_insert_block_size_rows`, `min_insert_block_size_bytes`, `preferred_block_size_bytes` 등).
- 클라이언트가 서버로부터 응답을 받지 못한 경우, 클라이언트는 트랜잭션이 성공했는지 알 수 없으며, exactly-once 삽입 특성을 사용하여 트랜잭션을 다시 수행할 수 있습니다.
- ClickHouse는 동시에 수행되는 트랜잭션을 위해 내부적으로 [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control)와 [snapshot isolation](https://en.wikipedia.org/wiki/Snapshot_isolation)을 사용합니다.
- 서버가 강제 종료되거나 크래시되는 경우에도 모든 ACID 속성은 유효합니다.
- 일반적인 설정에서 내구성 있는 삽입을 보장하려면 서로 다른 AZ에 대한 insert_quorum 또는 fsync를 활성화해야 합니다.
- ACID 용어에서의 「일관성(consistency)」은 분산 시스템의 의미까지 포함하지 않으며, https://jepsen.io/consistency 를 참고하십시오. 분산 시스템의 일관성은 다른 설정값(select_sequential_consistency)에 의해 제어됩니다.
- 이 설명은 여러 테이블, materialized views, 다수의 SELECT 등에 대해 완전한 기능을 갖춘 트랜잭션을 사용할 수 있게 하는 새로운 트랜잭션 기능은 다루지 않습니다(다음 섹션 「Transactions, Commit, and Rollback」을 참고하십시오).



## 트랜잭션, 커밋, 롤백 \{#transactions-commit-and-rollback\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

이 문서 앞부분에서 설명한 기능에 더해, ClickHouse는 트랜잭션, 커밋, 롤백 기능에 대한 실험적 지원을 제공합니다.

### 요구사항 \{#requirements\}

* 트랜잭션을 추적하기 위해 ClickHouse Keeper 또는 ZooKeeper를 배포합니다.
* Atomic DB 전용입니다(기본값).
* 복제되지 않은 MergeTree 테이블 엔진에서만 동작합니다.
* `config.d/transactions.xml`에 다음 SETTING을 추가하여 실험적 트랜잭션 지원을 활성화합니다:
  ```xml
  <clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
  </clickhouse>
  ```

### 참고 사항 \{#notes-1\}

* 이는 실험적 기능이며, 변경될 수 있습니다.
* 트랜잭션 중 예외가 발생하면 트랜잭션을 커밋할 수 없습니다. 여기에는 오타로 인해 발생하는 `UNKNOWN_FUNCTION` 예외를 포함한 모든 예외가 포함됩니다.
* 중첩 트랜잭션은 지원되지 않습니다. 현재 트랜잭션을 종료한 후 새 트랜잭션을 시작하십시오.

### 설정 \{#configuration\}

아래 예제는 ClickHouse Keeper가 활성화된 단일 노드 ClickHouse 서버 환경을 가정합니다.

#### 실험적 트랜잭션 지원 활성화 \{#enable-experimental-transaction-support\}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### ClickHouse Keeper가 활성화된 단일 ClickHouse 서버 노드에 대한 기본 구성 \{#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled\}

:::note
ClickHouse 서버와 적절한 ClickHouse Keeper 노드의 정족수(quorum)를 배포하는 방법에 대한 자세한 내용은 [배포](/deployment-guides/terminology.md) 문서를 참고하십시오. 여기에서 제시하는 구성은 실험용입니다.
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

### 예제 \{#example\}

#### 실험적 트랜잭션이 활성화되어 있는지 확인 \{#verify-that-experimental-transactions-are-enabled\}

`BEGIN TRANSACTION` 또는 `START TRANSACTION`을 실행한 다음 `ROLLBACK`을 실행하여 실험적 트랜잭션이 활성화되어 있고, 트랜잭션을 추적하는 데 사용되는 ClickHouse Keeper도 활성화되어 있는지 확인합니다.

```sql
BEGIN TRANSACTION
```

```response
Ok.
```

:::tip
아래와 같은 오류가 발생하면 설정 파일에서 `allow_experimental_transactions` 값이 `1`(또는 `0`이나 `false`가 아닌 값)로 설정되어 있는지 확인하십시오.

```response
Code: 48. DB::Exception: Received from localhost:9000.
DB::Exception: Transactions are not supported.
(NOT_IMPLEMENTED)
```

다음 명령을 실행하여 ClickHouse Keeper를 확인할 수도 있습니다.

```bash
echo ruok | nc localhost 9181
```

ClickHouse Keeper는 `imok`이라고 응답해야 합니다.
:::

```sql
ROLLBACK
```

```response
Ok.
```

#### 테스트용 테이블 생성 \{#create-a-table-for-testing\}

:::tip
테이블 생성은 트랜잭션에 포함되지 않습니다. 이 DDL 쿼리는 트랜잭션 밖에서 실행하십시오.
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

#### 트랜잭션 시작 및 행 삽입 \{#begin-a-transaction-and-insert-a-row\}

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
트랜잭션 안에서 테이블을 쿼리하면, 아직 커밋되지 않았더라도 행이 삽입된 것을 확인할 수 있습니다.
:::

#### 트랜잭션을 롤백하고 테이블을 다시 쿼리하십시오 \{#rollback-the-transaction-and-query-the-table-again\}

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

#### 트랜잭션을 완료한 후 테이블을 다시 쿼리하기 \{#complete-a-transaction-and-query-the-table-again\}

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

### 트랜잭션 내부 조회 \{#transactions-introspection\}

`system.transactions` 테이블에 쿼리를 실행하여 트랜잭션을 검사할 수 있습니다. 하지만 트랜잭션이 진행 중인 세션에서는 해당 테이블에 쿼리를 실행할 수 없습니다. 해당 테이블을 조회하려면 `clickhouse client` 세션을 하나 더 여십시오.

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


## 자세한 내용 \{#more-details\}

더욱 광범위한 테스트와 최신 진행 상황은 이 [메타 이슈](https://github.com/ClickHouse/ClickHouse/issues/48794)를 통해 확인할 수 있습니다.
