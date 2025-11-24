---
'description': 'KILL에 대한 문서'
'sidebar_label': 'KILL'
'sidebar_position': 46
'slug': '/sql-reference/statements/kill'
'title': 'KILL 문'
'doc_type': 'reference'
---

There are two kinds of kill statements: to kill a query and to kill a mutation

## KILL QUERY {#kill-query}

```sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <where expression to SELECT FROM system.processes query>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

현재 실행 중인 쿼리를 강제로 종료하려고 시도합니다.
종료할 쿼리는 `KILL` 쿼리의 `WHERE` 절에 정의된 기준을 사용하여 system.processes 테이블에서 선택됩니다.

예시:

먼저, 불완전한 쿼리 목록을 가져와야 합니다. 이 SQL 쿼리는 가장 오랫동안 실행된 쿼리를 제공합니다:

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

ClickHouse 클러스터에서의 목록:
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

쿼리 종료:
```sql
-- Forcibly terminates all queries with the specified query_id:
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- Synchronously terminates all queries run by 'username':
KILL QUERY WHERE user='username' SYNC
```

:::tip 
ClickHouse Cloud 또는 자체 관리 클러스터에서 쿼리를 종료하는 경우, 쿼리가 모든 복제본에서 종료되도록 ```ON CLUSTER [cluster-name]``` 옵션을 사용하세요.
:::

읽기 전용 사용자는 자신의 쿼리만 중지할 수 있습니다.

기본적으로 쿼리의 비동기 버전(`ASYNC`)이 사용되며, 이는 쿼리가 중지되었는지에 대한 확인을 기다리지 않습니다.

동기 버전(`SYNC`)은 모든 쿼리가 중지될 때까지 기다리고, 중지되는 각 프로세스에 대한 정보를 표시합니다.
응답에는 다음 값을 가질 수 있는 `kill_status` 열이 포함됩니다:

1.  `finished` – 쿼리가 성공적으로 종료되었습니다.
2.  `waiting` – 종료 신호를 보낸 후 쿼리가 끝나기를 기다리고 있습니다.
3.  다른 값들은 쿼리를 중지할 수 없는 이유를 설명합니다.

테스트 쿼리(`TEST`)는 사용자의 권한을 확인하기만 하고 중지할 쿼리 목록을 표시합니다.

## KILL MUTATION {#kill-mutation}

오래 실행 중이거나 불완전한 변이가 있는 경우, ClickHouse 서비스의 성능이 저하되고 있음을 나타냅니다. 변이는 비동기적으로 실행되어 시스템의 모든 자원을 소모할 수 있습니다. 다음 중 하나를 수행해야 할 수 있습니다:

- 모든 새로운 변이, `INSERT`, 및 `SELECT`를 일시 중지하고 변이의 대기열이 완료될 때까지 기다립니다.
- 또는 `KILL` 명령을 보내 일부 변이를 수동으로 종료합니다.

```sql
KILL MUTATION
  WHERE <where expression to SELECT FROM system.mutations query>
  [TEST]
  [FORMAT format]
```

현재 실행 중인 [변이](/sql-reference/statements/alter#mutations)를 취소하고 제거하려고 시도합니다. 취소할 변이는 `KILL` 쿼리의 `WHERE` 절에 지정된 필터를 사용하여 [`system.mutations`](/operations/system-tables/mutations) 테이블에서 선택됩니다.

테스트 쿼리(`TEST`)는 사용자의 권한을 확인하기만 하고 중지할 변이 목록을 표시합니다.

예시:

불완전한 변이의 수 `count()` 가져오기:

단일 ClickHouse 노드에서의 변이 수:
```sql
SELECT count(*)
FROM system.mutations
WHERE is_done = 0;
```

ClickHouse 복제본 클러스터에서의 변이 수:
```sql
SELECT count(*)
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

불완전한 변이 목록 쿼리:

단일 ClickHouse 노드에서의 변이 목록:
```sql
SELECT mutation_id, *
FROM system.mutations
WHERE is_done = 0;
```

ClickHouse 클러스터에서의 변이 목록:
```sql
SELECT mutation_id, *
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

필요에 따라 변이를 종료합니다:
```sql
-- Cancel and remove all mutations of the single table:
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- Cancel the specific mutation:
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

변이가 멈춰서 완료되지 않을 때 유용한 쿼리입니다 (예: 변이 쿼리에서 일부 함수가 테이블에 포함된 데이터에 적용될 때 예외를 발생시키는 경우).

변이에 의해 이미 적용된 변경 사항은 롤백되지 않습니다.

:::note 
`is_killed=1` 열 (ClickHouse Cloud 전용) [system.mutations](/operations/system-tables/mutations) 테이블에서 변이가 완전히 완료되었다는 것을 반드시 의미하지는 않습니다. 변이는 `is_killed=1` 및 `is_done=0` 상태에서 오랫동안 유지될 수 있습니다. 이는 다른 장기 실행 변이가 종료된 변이를 차단하는 경우 발생할 수 있습니다. 이는 정상적인 상황입니다.
:::
