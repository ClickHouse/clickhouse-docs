---
description: 'KILL에 대한 문서'
sidebar_label: 'KILL'
sidebar_position: 46
slug: /sql-reference/statements/kill
title: 'KILL SQL 문'
doc_type: 'reference'
---

KILL SQL 문에는 두 가지 유형이 있습니다. 하나는 쿼리를 종료하는 문이고, 다른 하나는 mutation을 종료하는 문입니다.

## KILL QUERY \{#kill-query\}

```sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <where expression to SELECT FROM system.processes query>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

현재 실행 중인 쿼리를 강제로 종료하는 시도를 수행합니다.
종료할 쿼리는 `KILL` 쿼리의 `WHERE` 절에 정의된 기준을 사용하여 system.processes 테이블에서 선택합니다.

예:

먼저, 아직 완료되지 않은 쿼리 목록을 가져와야 합니다. 아래 SQL 쿼리는 가장 오래 실행 중인 순으로 해당 쿼리들을 제공합니다:

단일 ClickHouse 노드에서의 목록:

```sql
SELECT
  initial_query_id,
  query_id,
  formatReadableTimeDelta(elapsed) AS time_delta,
  query,
  *
  FROM system.processes
  WHERE query ILIKE 'SELECT%'
  ORDER BY time_delta DESC;
```

ClickHouse 클러스터에서 가져온 목록:

```sql
SELECT
  initial_query_id,
  query_id,
  formatReadableTimeDelta(elapsed) AS time_delta,
  query,
  *
  FROM clusterAllReplicas(default, system.processes)
  WHERE query ILIKE 'SELECT%'
  ORDER BY time_delta DESC;
```

쿼리를 종료합니다:

```sql
-- Forcibly terminates all queries with the specified query_id:
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- Synchronously terminates all queries run by 'username':
KILL QUERY WHERE user='username' SYNC
```

:::tip
ClickHouse Cloud 또는 자가 관리형 클러스터에서 쿼리를 종료하는 경우에는, 모든 레플리카에서 해당 쿼리가 종료되도록 `ON CLUSTER [cluster-name]` 옵션을 반드시 사용하십시오.
:::

읽기 전용 사용자는 자신의 쿼리만 중지할 수 있습니다.

기본적으로 쿼리의 비동기 버전(`ASYNC`)이 사용되며, 이는 쿼리가 중지되었다는 확인을 기다리지 않습니다.

동기 버전(`SYNC`)은 모든 쿼리가 중지될 때까지 기다리며, 중지되는 각 프로세스에 대한 정보를 표시합니다.
응답에는 `kill_status` 컬럼이 포함되며, 다음과 같은 값을 가질 수 있습니다:

1. `finished` – 쿼리가 성공적으로 종료되었습니다.
2. `waiting` – 쿼리를 종료하라는 신호를 보낸 후, 쿼리가 종료되기를 기다리는 중입니다.
3. 그 외 값들은 쿼리를 중지할 수 없는 이유를 설명합니다.

테스트 쿼리(`TEST`)는 사용자 권한만 검사하고, 중지할 쿼리 목록을 표시합니다.

## KILL MUTATION \{#kill-mutation\}

오래 실행 중이거나 완료되지 않은 뮤테이션이 존재한다는 것은 ClickHouse 서비스가 원활하게 동작하지 않고 있음을 나타내는 경우가 많습니다. 뮤테이션은 비동기적으로 수행되므로 시스템의 사용 가능한 모든 리소스를 소모할 수 있습니다. 다음 중 하나의 조치가 필요할 수 있습니다.

* 새로운 뮤테이션, `INSERT`, `SELECT` 실행을 모두 일시 중지하고, 대기 중인 뮤테이션 큐가 완료될 때까지 둡니다.
* 또는 `KILL` 명령을 전송하여 이러한 뮤테이션 중 일부를 수동으로 중지합니다.

```sql
KILL MUTATION
  WHERE <where expression to SELECT FROM system.mutations query>
  [TEST]
  [FORMAT format]
```

현재 실행 중인 [뮤테이션](/sql-reference/statements/alter#mutations)을 취소하고 제거하려고 시도합니다. 취소할 뮤테이션은 `KILL` 쿼리의 `WHERE` 절에 지정된 필터를 사용하여 [`system.mutations`](/operations/system-tables/mutations) 테이블에서 선택합니다.

테스트 쿼리(`TEST`)는 사용자의 권한만 확인하고, 중지할 뮤테이션 목록을 표시합니다.

예시:

미완료된 뮤테이션 개수를 `count()`로 조회합니다:

단일 ClickHouse 노드에서 발생한 뮤테이션 개수입니다:

```sql
SELECT count(*)
FROM system.mutations
WHERE is_done = 0;
```

ClickHouse 레플리카 클러스터의 뮤테이션 수:

```sql
SELECT count(*)
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

완료되지 않은 뮤테이션 목록을 조회합니다:

단일 ClickHouse 노드의 뮤테이션 목록:

```sql
SELECT mutation_id, *
FROM system.mutations
WHERE is_done = 0;
```

ClickHouse 클러스터의 뮤테이션 목록:

```sql
SELECT mutation_id, *
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

필요에 따라 뮤테이션을 종료합니다:

```sql
-- Cancel and remove all mutations of the single table:
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- Cancel the specific mutation:
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

이 쿼리는 뮤테이션이 멈춰서 더 이상 진행되지 못할 때 유용합니다(예: 뮤테이션 쿼리 안의 어떤 함수가 테이블에 포함된 데이터에 적용될 때 예외를 발생시키는 경우).

뮤테이션에 의해 이미 수행된 변경 사항은 롤백되지 않습니다.

:::note
[system.mutations](/operations/system-tables/mutations) 테이블의 `is_killed=1` 컬럼(ClickHouse Cloud 전용)은 뮤테이션이 완전히 완료되었음을 반드시 의미하지는 않습니다. `is_killed=1` 및 `is_done=0` 상태가 장기간 유지될 수 있습니다. 이는 다른 장시간 실행 중인 뮤테이션이 중지된 뮤테이션을 막고 있을 때 발생할 수 있습니다. 이는 정상적인 상황입니다.
:::
