---
sidebar_label: '참조'
description: 'pg_clickhouse에 대한 전체 참조 문서'
slug: '/integrations/pg_clickhouse/reference'
title: 'pg_clickhouse 참조 문서'
doc_type: 'reference'
keywords: ['PostgreSQL', 'Postgres', 'FDW', 'foreign data wrapper', 'pg_clickhouse', 'extension']
---

# pg_clickhouse 레퍼런스 문서 \{#pg_clickhouse-reference-documentation\}

## 설명 \{#description\}

pg_clickhouse는 ClickHouse 데이터베이스에 대한 원격 쿼리 실행을 가능하게 하는 PostgreSQL 확장 기능으로,
[foreign data wrapper]를 포함합니다.
PostgreSQL 13 이상 및 ClickHouse 23 이상에서 동작합니다.

## 시작하기 \{#getting-started\}

pg&#95;clickhouse를 사용해 보는 가장 간단한 방법은 [Docker image]를 사용하는 것입니다. 이 Docker 이미지는 pg&#95;clickhouse 확장이 포함된 표준 PostgreSQL Docker 이미지를 기반으로 합니다.

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres
```

ClickHouse 테이블을 가져오고 쿼리를 푸시다운하는 작업을 시작하려면 [튜토리얼](tutorial.md)을 참고하십시오.


## 사용법 \{#usage\}

```sql
CREATE EXTENSION pg_clickhouse;
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'default');
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA taxi FROM SERVER taxi_srv INTO taxi;
```


## Versioning Policy \{#versioning-policy\}

pg_clickhouse는 공개 릴리스에 대해 [Semantic Versioning]을 준수합니다.

* 메이저 버전은 API 변경 시 증가합니다.
* 마이너 버전은 하위 호환 SQL 변경 시 증가합니다.
* 패치 버전은 바이너리 전용 변경 시 증가합니다.

설치가 완료되면 PostgreSQL은 두 가지 종류의 버전을 추적합니다.

* 라이브러리 버전(PostgreSQL 18 이상에서 `PG_MODULE_MAGIC`으로 정의됨)은 전체 시맨틱 버전을 포함하며, `pg_get_loaded_modules()` 함수의 출력에서 확인할 수 있습니다.
* 익스텐션 버전(컨트롤 파일에서 정의됨)은 메이저 및 마이너 버전만 포함하며, `pg_catalog.pg_extension` 테이블, `pg_available_extension_versions()` 함수의 출력, 그리고 `\dx
    pg_clickhouse`에서 확인할 수 있습니다.

실제로 이는 패치 버전이 증가하는 릴리스(예: `v0.1.0`에서 `v0.1.1`로)가 `v0.1`을 로드한 모든 데이터베이스에 적용되며, 업그레이드를 위해 `ALTER EXTENSION`을 실행할 필요가 없음을 의미합니다.

반면 마이너 또는 메이저 버전이 증가하는 릴리스에는 SQL 업그레이드 스크립트가 함께 제공되며, 해당 익스텐션을 포함하는 모든 기존 데이터베이스는 업그레이드를 적용하기 위해 `ALTER EXTENSION pg_clickhouse UPDATE`를 실행해야 합니다.

## DDL SQL Reference \{#ddl-sql-reference\}

다음 SQL [DDL] 구문에서는 pg_clickhouse를 사용합니다.

### CREATE EXTENSION \{#create-extension\}

[CREATE EXTENSION]을 사용하여 데이터베이스에 pg&#95;clickhouse 확장을 추가합니다.

```sql
CREATE EXTENSION pg_clickhouse;
```

`WITH SCHEMA`를 사용하여 특정 스키마에 설치합니다 (권장):

```sql
CREATE SCHEMA ch;
CREATE EXTENSION pg_clickhouse WITH SCHEMA ch;
```


### ALTER EXTENSION \{#alter-extension\}

[ALTER EXTENSION]을 사용하여 pg_clickhouse를 변경합니다. 예를 들어:

* pg_clickhouse의 새 릴리스를 설치한 후에는 `UPDATE` 절을 사용합니다:

    ```sql
    ALTER EXTENSION pg_clickhouse UPDATE;
    ```

* `SET SCHEMA`를 사용하여 확장을 새 스키마로 이동합니다:

    ```sql
    CREATE SCHEMA ch;
    ALTER EXTENSION pg_clickhouse SET SCHEMA ch;
    ```

### DROP EXTENSION \{#drop-extension\}

[DROP EXTENSION]을 사용하여 데이터베이스에서 pg&#95;clickhouse 확장을 삭제합니다:

```sql
DROP EXTENSION pg_clickhouse;
```

이 명령은 pg&#95;clickhouse에 의존하는 객체가 존재하면 실패합니다. 이러한 객체도 함께 삭제하려면 `CASCADE` 절을 사용하십시오:

```sql
DROP EXTENSION pg_clickhouse CASCADE;
```


### CREATE SERVER \{#create-server\}

[CREATE SERVER]를 사용하여 ClickHouse 서버에 연결되는 외부 서버(foreign server)를 생성합니다. 예:

```sql
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
```

지원되는 옵션은 다음과 같습니다.

* `driver`: 사용할 ClickHouse 연결 드라이버로, &quot;binary&quot; 또는
  &quot;http&quot; 중 하나입니다. **필수입니다.**
* `dbname`: 연결 시 사용할 ClickHouse 데이터베이스입니다. 기본값은
  &quot;default&quot;입니다.
* `host`: ClickHouse 서버의 호스트 이름입니다. 기본값은 &quot;localhost&quot;입니다.
* `port`: ClickHouse 서버에 연결할 포트입니다. 기본값은
  다음과 같습니다.
  * `driver`가 &quot;binary&quot;이고 `host`가 ClickHouse Cloud 호스트인 경우 9440
  * `driver`가 &quot;binary&quot;이고 `host`가 ClickHouse Cloud 호스트가 아닌 경우 9004
  * `driver`가 &quot;http&quot;이고 `host`가 ClickHouse Cloud 호스트인 경우 8443
  * `driver`가 &quot;http&quot;이고 `host`가 ClickHouse Cloud 호스트가 아닌 경우 8123


### ALTER SERVER \{#alter-server\}

[ALTER SERVER]를 사용하여 외부 서버를 수정합니다. 예를 들면 다음과 같습니다.

```sql
ALTER SERVER taxi_srv OPTIONS (SET driver 'http');
```

옵션은 [CREATE SERVER](#create-server)와 동일합니다.


### DROP SERVER \{#drop-server\}

[DROP SERVER]를 사용하여 외부 서버를 제거합니다:

```sql
DROP SERVER taxi_srv;
```

다른 객체가 해당 서버에 의존하고 있으면 이 명령은 실패합니다. 이러한 의존성도 함께 삭제하려면 `CASCADE`를 사용하십시오:

```sql
DROP SERVER taxi_srv CASCADE;
```


### CREATE USER MAPPING \{#create-user-mapping\}

[CREATE USER MAPPING]을(를) 사용하여 PostgreSQL 사용자를 ClickHouse USER에 매핑합니다. 예를 들어 `taxi_srv` 외부 서버에 연결할 때 현재 PostgreSQL 사용자를 원격 ClickHouse USER에 매핑하려면 다음과 같이 합니다:

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'demo');
```

지원되는 옵션은 다음과 같습니다:

* `user`: ClickHouse 사용자 이름입니다. 기본값은 &quot;default&quot;입니다.
* `password`: ClickHouse 사용자의 비밀번호입니다.


### ALTER USER MAPPING \{#alter-user-mapping\}

[ALTER USER MAPPING]을 사용하여 사용자 매핑 정의를 변경합니다.

```sql
ALTER USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (SET user 'default');
```

옵션은 [CREATE USER MAPPING](#create-user-mapping)과 같습니다.


### DROP USER MAPPING \{#drop-user-mapping\}

[DROP USER MAPPING]을 사용하여 사용자 매핑을 삭제합니다.

```sql
DROP USER MAPPING FOR CURRENT_USER SERVER taxi_srv;
```


### IMPORT FOREIGN SCHEMA \{#import-foreign-schema\}

[IMPORT FOREIGN SCHEMA]를 사용하여 ClickHouse
데이터베이스에 정의된 모든 테이블을 PostgreSQL 스키마의 외부 테이블로 가져옵니다:

```sql
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA demo FROM SERVER taxi_srv INTO taxi;
```

가져오기를 특정 테이블로 제한하려면 `LIMIT TO`를 사용하십시오:

```sql
IMPORT FOREIGN SCHEMA demo LIMIT TO (trips) FROM SERVER taxi_srv INTO taxi;
```

테이블을 제외할 때는 `EXCEPT`를 사용하십시오:

```sql
IMPORT FOREIGN SCHEMA demo EXCEPT (users) FROM SERVER taxi_srv INTO taxi;
```

pg&#95;clickhouse는 지정된 ClickHouse 데이터베이스(위 예시의 「demo」)에 있는
모든 테이블 목록을 가져오고, 각 테이블의 컬럼 정의를 가져온 다음,
외부 테이블을 생성하기 위해 [CREATE FOREIGN TABLE](#create-foreign-table)
명령을 실행합니다. 컬럼은 [지원되는 데이터 타입](#data-types)과,
감지 가능한 경우 [CREATE FOREIGN TABLE](#create-foreign-table)에서
지원하는 옵션을 사용하여 정의됩니다.

:::tip 가져온 식별자 대소문자 보존

`IMPORT FOREIGN SCHEMA`는 가져오는 테이블 및 컬럼 이름에 대해
`quote_identifier()`를 실행하며, 이 함수는 대문자나 공백 문자가 있는
식별자를 이중 인용부호로 감쌉니다. 따라서 이와 같은 테이블 및 컬럼 이름은
PostgreSQL 쿼리에서 반드시 이중 인용부호로 감싸야 합니다. 모두 소문자이고
공백 문자가 없는 이름은 인용부호로 감쌀 필요가 없습니다.

예를 들어, 다음과 같은 ClickHouse 테이블이 있다고 가정합니다:

```sql
 CREATE OR REPLACE TABLE test
 (
     id UInt64,
     Name TEXT,
     updatedAt DateTime DEFAULT now()
 )
 ENGINE = MergeTree
 ORDER BY id;
```

`IMPORT FOREIGN SCHEMA`로 다음 foreign table이 생성됩니다:

```sql
 CREATE TABLE test
 (
     id          BIGINT      NOT NULL,
     "Name"      TEXT        NOT NULL,
     "updatedAt" TIMESTAMPTZ NOT NULL
 );
```

따라서 쿼리에서는 예를 들어 다음과 같이 적절하게 따옴표를 사용해야 합니다.

```sql
 SELECT id, "Name", "updatedAt" FROM test;
```

서로 다른 이름을 사용하거나 이름을 모두 소문자로 하여(대소문자를 구분하지 않는 이름으로) 객체를 생성하려면 [CREATE FOREIGN TABLE](#create-foreign-table)을 사용합니다.
:::


### CREATE FOREIGN TABLE \{#create-foreign-table\}

[CREATE FOREIGN TABLE]을 사용하여 ClickHouse 데이터베이스의 데이터를 쿼리하는 외부 테이블을 생성합니다.

```sql
CREATE FOREIGN TABLE uact (
    user_id    bigint NOT NULL,
    page_views int,
    duration   smallint,
    sign       smallint
) SERVER taxi_srv OPTIONS(
    table_name 'uact'
    engine 'CollapsingMergeTree'
);
```

지원되는 테이블 옵션은 다음과 같습니다.

* `database`: 원격 데이터베이스의 이름입니다. 기본값은 외부 서버에 대해
  정의된 데이터베이스입니다.
* `table_name`: 원격 테이블의 이름입니다. 기본값은 외부 테이블에 대해 지정된
  이름입니다.
* `engine`: ClickHouse 테이블에서 사용하는 [table engine]입니다.
  `CollapsingMergeTree()` 및 `AggregatingMergeTree()`의 경우 pg&#95;clickhouse는
  테이블에서 실행되는 함수 표현식에 매개변수를 자동으로 적용합니다.

각 컬럼의 원격 ClickHouse 데이터 타입에 알맞은 [data type](#data-types)을
사용합니다. [AggregateFunction Type] 및 [SimpleAggregateFunction
Type] 컬럼의 경우, 데이터 타입을 함수에 전달되는 ClickHouse 타입에 매핑하고,
적절한 컬럼 옵션을 통해 집계 함수의 이름을 지정합니다.

* `AggregateFunction`: [AggregateFunction Type] 컬럼에 적용되는 집계 함수의
  이름입니다.
* `SimpleAggregateFunction`: [SimpleAggregateFunction Type] 컬럼에 적용되는
  집계 함수의 이름입니다.

예:

(aggregatefunction &#39;sum&#39;)

```sql
CREATE FOREIGN TABLE test (
    column1 bigint  OPTIONS(AggregateFunction 'uniq'),
    column2 integer OPTIONS(AggregateFunction 'anyIf'),
    column3 bigint  OPTIONS(AggregateFunction 'quantiles(0.5, 0.9)')
) SERVER clickhouse_srv;
```

`AggregateFunction` FUNCTION이 사용된 컬럼의 경우, pg&#95;clickhouse는
해당 컬럼에 적용되는 집계 함수에 `Merge`를 자동으로 덧붙입니다.


### ALTER FOREIGN TABLE \{#alter-foreign-table\}

[ALTER FOREIGN TABLE]을(를) 사용하여 외부 테이블의 정의를 변경합니다.

```sql
ALTER TABLE table ALTER COLUMN b OPTIONS (SET AggregateFunction 'count');
```

지원되는 테이블 및 컬럼 옵션은 [CREATE FOREIGN
TABLE]의 옵션과 동일합니다.


### DROP FOREIGN TABLE \{#drop-foreign-table\}

[DROP FOREIGN TABLE]을(를) 사용하여 foreign table을 삭제합니다:

```sql
DROP FOREIGN TABLE uact;
```

외부 테이블에 의존하는 객체가 하나라도 있으면 이 명령은 실패합니다.
해당 객체들도 함께 삭제하려면 `CASCADE` 절을 사용하십시오:

```sql
DROP FOREIGN TABLE uact CASCADE;
```


## DML SQL Reference \{#dml-sql-reference\}

아래 SQL [DML] 구문에서는 pg&#95;clickhouse를 사용합니다. 예제는 다음 ClickHouse 테이블을 기반으로 합니다.

```sql
CREATE TABLE logs (
    req_id    Int64 NOT NULL,
    start_at   DateTime64(6, 'UTC') NOT NULL,
    duration  Int32 NOT NULL,
    resource  Text  NOT NULL,
    method    Enum8('GET' = 1, 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH', 'QUERY') NOT NULL,
    node_id   Int64 NOT NULL,
    response  Int32 NOT NULL
) ENGINE = MergeTree
  ORDER BY start_at;

CREATE TABLE nodes (
    node_id Int64 NOT NULL,
    name    Text  NOT NULL,
    region  Text  NOT NULL,
    arch    Text  NOT NULL,
    os      Text  NOT NULL
) ENGINE = MergeTree
  PRIMARY KEY node_id;
```


### EXPLAIN \{#explain\}

[EXPLAIN] 명령은 정상적으로 동작하지만, `VERBOSE` 옵션을 사용하면
ClickHouse의 「Remote SQL」 쿼리가 출력됩니다:

```pgsql
try=# EXPLAIN (VERBOSE)
       SELECT resource, avg(duration) AS average_duration
         FROM logs
        GROUP BY resource;
                                     QUERY PLAN
------------------------------------------------------------------------------------
 Foreign Scan  (cost=1.00..5.10 rows=1000 width=64)
   Output: resource, (avg(duration))
   Relations: Aggregate on (logs)
   Remote SQL: SELECT resource, avg(duration) FROM "default".logs GROUP BY resource
(4 rows)
```

이 쿼리는 「Foreign Scan」 플랜 노드를 통해 원격 SQL을 ClickHouse로 푸시다운합니다.


### SELECT \{#select\}

[SELECT] 구문을 사용하여 다른 테이블과 마찬가지로 pg&#95;clickhouse 테이블에 쿼리를 실행합니다:

```pgsql
try=# SELECT start_at, duration, resource FROM logs WHERE req_id = 4117909262;
          start_at          | duration |    resource
----------------------------+----------+----------------
 2025-12-05 15:07:32.944188 |      175 | /widgets/totam
(1 row)
```

pg&#95;clickhouse는 집계 함수를 포함한 쿼리 실행을 가능한 한 많이 ClickHouse로 푸시다운하도록 동작합니다. 푸시다운 정도를 확인하려면 [EXPLAIN](#explain)을 사용하십시오. 예를 들어 위의 쿼리의 경우 모든 실행이 ClickHouse로 푸시다운됩니다.

```pgsql
try=# EXPLAIN (VERBOSE, COSTS OFF)
       SELECT start_at, duration, resource FROM logs WHERE req_id = 4117909262;
                                             QUERY PLAN
-----------------------------------------------------------------------------------------------------
 Foreign Scan on public.logs
   Output: start_at, duration, resource
   Remote SQL: SELECT start_at, duration, resource FROM "default".logs WHERE ((req_id = 4117909262))
(3 rows)
```

pg&#95;clickhouse는 동일한 원격 서버에 있는 테이블 간 JOIN 연산도 푸시다운합니다:

```pgsql
try=# EXPLAIN (ANALYZE, VERBOSE)
       SELECT name, count(*), round(avg(duration))
         FROM logs
         LEFT JOIN nodes on logs.node_id = nodes.node_id
        GROUP BY name;
                                                                                  QUERY PLAN
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Foreign Scan  (cost=1.00..5.10 rows=1000 width=72) (actual time=3.201..3.221 rows=8.00 loops=1)
   Output: nodes.name, (count(*)), (round(avg(logs.duration), 0))
   Relations: Aggregate on ((logs) LEFT JOIN (nodes))
   Remote SQL: SELECT r2.name, count(*), round(avg(r1.duration), 0) FROM  "default".logs r1 ALL LEFT JOIN "default".nodes r2 ON (((r1.node_id = r2.node_id))) GROUP BY r2.name
   FDW Time: 0.086 ms
 Planning Time: 0.335 ms
 Execution Time: 3.261 ms
(7 rows)
```

세심하게 튜닝하지 않으면 로컬 테이블과 조인할 때 쿼리 효율이 떨어집니다. 이 예시에서는 원격 테이블 대신
`nodes` 테이블의 로컬 복제본을 생성하고, 해당 로컬 테이블과 조인합니다:


```pgsql
try=# CREATE TABLE local_nodes AS SELECT * FROM nodes;
SELECT 8

try=# EXPLAIN (ANALYZE, VERBOSE)
       SELECT name, count(*), round(avg(duration))
         FROM logs
         LEFT JOIN local_nodes on logs.node_id = local_nodes.node_id
        GROUP BY name;
                                                             QUERY PLAN
-------------------------------------------------------------------------------------------------------------------------------------
 HashAggregate  (cost=147.65..150.65 rows=200 width=72) (actual time=6.215..6.235 rows=8.00 loops=1)
   Output: local_nodes.name, count(*), round(avg(logs.duration), 0)
   Group Key: local_nodes.name
   Batches: 1  Memory Usage: 32kB
   Buffers: shared hit=1
   ->  Hash Left Join  (cost=31.02..129.28 rows=2450 width=36) (actual time=2.202..5.125 rows=1000.00 loops=1)
         Output: local_nodes.name, logs.duration
         Hash Cond: (logs.node_id = local_nodes.node_id)
         Buffers: shared hit=1
         ->  Foreign Scan on public.logs  (cost=10.00..20.00 rows=1000 width=12) (actual time=2.089..3.779 rows=1000.00 loops=1)
               Output: logs.req_id, logs.start_at, logs.duration, logs.resource, logs.method, logs.node_id, logs.response
               Remote SQL: SELECT duration, node_id FROM "default".logs
               FDW Time: 1.447 ms
         ->  Hash  (cost=14.90..14.90 rows=490 width=40) (actual time=0.090..0.091 rows=8.00 loops=1)
               Output: local_nodes.name, local_nodes.node_id
               Buckets: 1024  Batches: 1  Memory Usage: 9kB
               Buffers: shared hit=1
               ->  Seq Scan on public.local_nodes  (cost=0.00..14.90 rows=490 width=40) (actual time=0.069..0.073 rows=8.00 loops=1)
                     Output: local_nodes.name, local_nodes.node_id
                     Buffers: shared hit=1
 Planning:
   Buffers: shared hit=14
 Planning Time: 0.551 ms
 Execution Time: 6.589 ms
```

이 경우 로컬 컬럼 대신 `node_id`로 그룹화하여 집계 작업의 더 많은 부분을 ClickHouse로 위임한 다음, 나중에 조회 테이블과 조인할 수 있습니다:


```sql
try=# EXPLAIN (ANALYZE, VERBOSE)
       WITH remote AS (
           SELECT node_id, count(*), round(avg(duration))
             FROM logs
            GROUP BY node_id
       )
       SELECT name, remote.count, remote.round
         FROM remote
         JOIN local_nodes
           ON remote.node_id = local_nodes.node_id
        ORDER BY name;
                                                          QUERY PLAN
-------------------------------------------------------------------------------------------------------------------------------
 Sort  (cost=65.68..66.91 rows=490 width=72) (actual time=4.480..4.484 rows=8.00 loops=1)
   Output: local_nodes.name, remote.count, remote.round
   Sort Key: local_nodes.name
   Sort Method: quicksort  Memory: 25kB
   Buffers: shared hit=4
   ->  Hash Join  (cost=27.60..43.79 rows=490 width=72) (actual time=4.406..4.422 rows=8.00 loops=1)
         Output: local_nodes.name, remote.count, remote.round
         Inner Unique: true
         Hash Cond: (local_nodes.node_id = remote.node_id)
         Buffers: shared hit=1
         ->  Seq Scan on public.local_nodes  (cost=0.00..14.90 rows=490 width=40) (actual time=0.010..0.016 rows=8.00 loops=1)
               Output: local_nodes.node_id, local_nodes.name, local_nodes.region, local_nodes.arch, local_nodes.os
               Buffers: shared hit=1
         ->  Hash  (cost=15.10..15.10 rows=1000 width=48) (actual time=4.379..4.381 rows=8.00 loops=1)
               Output: remote.count, remote.round, remote.node_id
               Buckets: 1024  Batches: 1  Memory Usage: 9kB
               ->  Subquery Scan on remote  (cost=1.00..15.10 rows=1000 width=48) (actual time=4.337..4.360 rows=8.00 loops=1)
                     Output: remote.count, remote.round, remote.node_id
                     ->  Foreign Scan  (cost=1.00..5.10 rows=1000 width=48) (actual time=4.330..4.349 rows=8.00 loops=1)
                           Output: logs.node_id, (count(*)), (round(avg(logs.duration), 0))
                           Relations: Aggregate on (logs)
                           Remote SQL: SELECT node_id, count(*), round(avg(duration), 0) FROM "default".logs GROUP BY node_id
                           FDW Time: 0.055 ms
 Planning:
   Buffers: shared hit=5
 Planning Time: 0.319 ms
 Execution Time: 4.562 ms
```

이제 「Foreign Scan」 노드는 `node_id`별 집계를 푸시다운하여 Postgres로 다시 가져와야 하는 행(row)의 수를 1000개(전체)에서 각 노드당 1개씩 총 8개로 줄입니다.


### PREPARE, EXECUTE, DEALLOCATE \{#prepare-execute-deallocate\}

v0.1.2부터 pg&#95;clickhouse에서는 주로 [PREPARE] 명령으로 생성되는
매개변수화된 쿼리를 지원합니다.

```pgsql
try=# PREPARE avg_durations_between_dates(date, date) AS
       SELECT date(start_at), round(avg(duration)) AS average_duration
         FROM logs
        WHERE date(start_at) BETWEEN $1 AND $2
        GROUP BY date(start_at)
        ORDER BY date(start_at);
PREPARE
```

준비된 문을 실행할 때는 평소와 같이 [EXECUTE]를 사용합니다:

```pgsql
try=# EXECUTE avg_durations_between_dates('2025-12-09', '2025-12-13');
    date    | average_duration
------------+------------------
 2025-12-09 |              190
 2025-12-10 |              194
 2025-12-11 |              197
 2025-12-12 |              190
 2025-12-13 |              195
(5 rows)
```

:::warning
매개변수화된 실행은 [근본적인 버그]가 [수정됨]으로 표시된 25.8 버전보다 이전 ClickHouse에서는
[http 드라이버](#create-server)가 DateTime 시간대를 올바르게 변환하지 못하게 합니다.
PostgreSQL이 `PREPARE`를 사용하지 않더라도 매개변수화된 쿼리 플랜을 사용할 때가 있다는 점에
유의해야 합니다. 시간대 변환의 정확성이 필요한 쿼리에서 25.8 이상으로 업그레이드할 수 없는
경우에는 대신 [binary 드라이버](#create-server)를 사용하십시오.
:::

pg&#95;clickhouse는 집계 연산을 평소와 같이 push down 하며, 이는 [EXPLAIN](#explain) verbose 출력에서 확인할 수 있습니다:

```pgsql
try=# EXPLAIN (VERBOSE) EXECUTE avg_durations_between_dates('2025-12-09', '2025-12-13');
                                                                                                            QUERY PLAN
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Foreign Scan  (cost=1.00..5.10 rows=1000 width=36)
   Output: (date(start_at)), (round(avg(duration), 0))
   Relations: Aggregate on (logs)
   Remote SQL: SELECT date(start_at), round(avg(duration), 0) FROM "default".logs WHERE ((date(start_at) >= '2025-12-09')) AND ((date(start_at) <= '2025-12-13')) GROUP BY (date(start_at)) ORDER BY date(start_at) ASC NULLS LAST
(4 rows)
```

전체 날짜 값이 전송되고, 파라미터 플레이스홀더는 전송되지 않았다는 점에 유의하십시오.
이는 PostgreSQL [PREPARE notes]에서 설명하는 것처럼 처음 다섯 번의 요청에 적용됩니다.
여섯 번째 실행에서는 ClickHouse의 `{param:type}` 스타일 [쿼리 매개변수]를 전송합니다:
매개변수:

```pgsql
                                                                                                         QUERY PLAN
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Foreign Scan  (cost=1.00..5.10 rows=1000 width=36)
   Output: (date(start_at)), (round(avg(duration), 0))
   Relations: Aggregate on (logs)
   Remote SQL: SELECT date(start_at), round(avg(duration), 0) FROM "default".logs WHERE ((date(start_at) >= {p1:Date})) AND ((date(start_at) <= {p2:Date})) GROUP BY (date(start_at)) ORDER BY date(start_at) ASC NULLS LAST
(4 rows)
```

준비된 구문(prepared statement)을 해제하려면 [DEALLOCATE]를 사용하십시오:

```pgsql
try=# DEALLOCATE avg_durations_between_dates;
DEALLOCATE
```


### INSERT \{#insert\}

[INSERT] 명령어를 사용하여 원격 ClickHouse 테이블에 값을 삽입합니다.

```pgsql
try=# INSERT INTO nodes(node_id, name, region, arch, os)
VALUES (9,  'Augustin Gamarra', 'us-west-2', 'amd64', 'Linux')
     , (10, 'Cerisier', 'us-east-2', 'amd64', 'Linux')
     , (11, 'Dewalt', 'use-central-1', 'arm64', 'macOS')
;
INSERT 0 3
```


### COPY \{#copy\}

원격 ClickHouse 테이블에 여러 행을 일괄 삽입하려면 [COPY] 명령을 사용합니다.

```pgsql
try=# COPY logs FROM stdin CSV;
4285871863,2025-12-05 11:13:58.360760,206,/widgets,POST,8,401
4020882978,2025-12-05 11:33:48.248450,199,/users/1321945,HEAD,3,200
3231273177,2025-12-05 12:20:42.158575,220,/search,GET,2,201
\.
>> COPY 3
```

> **⚠️ Batch API 제한 사항**
>
> pg&#95;clickhouse에서는 PostgreSQL FDW batch insert API를 아직 지원하지 않습니다.
> 따라서 [COPY]는 현재 레코드를 삽입할 때 [INSERT](#insert) SQL 문을 사용합니다.
> 이는 향후 릴리스에서 개선될 예정입니다.


### LOAD \{#load\}

[LOAD]를 사용하여 공유 라이브러리인 pg&#95;clickhouse를 로드합니다:

```pgsql
try=# LOAD 'pg_clickhouse';
LOAD
```

일반적으로 [LOAD]를 사용할 필요는 없습니다. Postgres는 pg&#95;clickhouse의 기능(함수, 외부 테이블 등)이 처음 사용될 때 pg&#95;clickhouse를 자동으로 로드합니다.

[LOAD]를 사용해 pg&#95;clickhouse를 로드하는 것이 유용한 유일한 경우는, 해당 매개변수에 의존하는 쿼리를 실행하기 전에 [SET](#set)을 통해 pg&#95;clickhouse 매개변수를 설정하려는 경우입니다.


### SET \{#set\}

[SET]을 사용하여 `pg_clickhouse.session_settings` 런타임 매개변수를 설정합니다.
이 매개변수는 이후 쿼리에 적용될 [ClickHouse settings]를 구성합니다.
예시:

```sql
SET pg_clickhouse.session_settings = 'join_use_nulls 1, final 1';
```

기본값은 `join_use_nulls 1`입니다. 빈 문자열로 설정하면 ClickHouse 서버의 설정으로 되돌아갑니다.

```sql
SET pg_clickhouse.session_settings = '';
```

이 구문은 각 항목이 쉼표로 구분되고, 각 키와 값이 한 칸 이상의 공백으로 구분되는 키/값 쌍 목록입니다. 키는 [ClickHouse settings]와 일치해야 합니다. 값에 포함된 공백,
쉼표, 백슬래시는 역슬래시로 이스케이프합니다:

```sql
SET pg_clickhouse.session_settings = 'join_algorithm grace_hash\,hash';
```

또는 공백과 쉼표를 이스케이프하지 않아도 되도록 값을 작은따옴표로 감싸서 사용하거나,
큰따옴표를 두 번 사용할 필요가 없도록 [dollar quoting]을 사용하는 것을 고려하십시오:

```sql
SET pg_clickhouse.session_settings = $$join_algorithm 'grace_hash,hash'$$;
```

가독성을 중요시하고 많은 설정을 지정해야 한다면, 다음과 같이 여러 줄로 나누어 작성하십시오:

```sql
SET pg_clickhouse.session_settings TO $$
    connect_timeout 2,
    count_distinct_implementation uniq,
    final 1,
    group_by_use_nulls 1,
    join_algorithm 'prefer_partial_merge',
    join_use_nulls 1,
    log_queries_min_type QUERY_FINISH,
    max_block_size 32768,
    max_execution_time 45,
    max_result_rows 1024,
    metrics_perf_events_list 'this,that',
    network_compression_method ZSTD,
    poll_interval 5,
    totals_mode after_having_auto
$$;
```

일부 설정은 pg&#95;clickhouse 자체의 동작을 방해하는 경우 무시됩니다. 이에 해당하는 설정은 다음과 같습니다:

* `date_time_output_format`: http 드라이버에서는 이 값이 &quot;iso&quot;로 설정되어야 합니다
* `format_tsv_null_representation`: http 드라이버에서는 기본값이어야 합니다
* `output_format_tsv_crlf_end_of_line`: http 드라이버에서는 기본값이어야 합니다

Otherwise, pg&#95;clickhouse는 설정을 검증하지 않고, 모든 쿼리에 대해 설정을 그대로 ClickHouse에 전달합니다. 따라서 각 ClickHouse 버전에 존재하는 모든 설정을 지원합니다.

pg&#95;clickhouse는 `pg_clickhouse.session_settings`를 설정하기 전에 로드되어야 합니다. 이를 위해 [shared library preloading]을 사용하거나, 확장에 포함된 객체 중 하나를 사용하여 로드되도록 하면 됩니다.


### ALTER ROLE \{#alter-role\}

[ALTER ROLE]의 `SET` 명령을 사용하여 특정 역할에 대해 pg&#95;clickhouse를 [미리 로드(preload)](#preloading)하거나(및/또는) 해당 파라미터를 [SET](#set) 하십시오.

```pgsql
try=# ALTER ROLE CURRENT_USER SET session_preload_libraries = pg_clickhouse;
ALTER ROLE

try=# ALTER ROLE CURRENT_USER SET pg_clickhouse.session_settings = 'final 1';
ALTER ROLE
```

[ALTER ROLE]의 `RESET` 명령을 사용하여 pg&#95;clickhouse 프리로딩 및/또는 매개변수를 초기화합니다:

```pgsql
try=# ALTER ROLE CURRENT_USER RESET session_preload_libraries;
ALTER ROLE

try=# ALTER ROLE CURRENT_USER RESET pg_clickhouse.session_settings;
ALTER ROLE
```


## Preloading \{#preloading\}

모든 또는 거의 모든 Postgres 연결에서 pg_clickhouse를 사용해야 하는 경우,
[shared library preloading]을 사용하여 자동으로 로드되도록 설정하는 것을 고려하십시오:

### `session_preload_libraries` \{#session_preload_libraries\}

PostgreSQL의 모든 새 연결마다 공유 라이브러리를 로드합니다:

```ini
session_preload_libraries = pg_clickhouse
```

서버를 재시작하지 않고 업데이트를 적용하는 데 유용합니다. 연결만 다시
수립하면 됩니다. [ALTER ROLE](#alter-role)을 통해 특정 사용자나 역할에 대해서도 설정할 수 있습니다.


### `shared_preload_libraries` \{#shared_preload_libraries\}

PostgreSQL 부모 프로세스가 시작될 때 공유 라이브러리를 로드합니다:

```ini
shared_preload_libraries = pg_clickhouse
```

메모리를 절약하고 세션마다 발생하는 로드 오버헤드를 줄이는 데 유용하지만, 라이브러리를 업데이트할 때는 클러스터를 재시작해야 합니다.


## 데이터 타입 \{#data-types\}

pg_clickhouse는 다음 ClickHouse 데이터 타입을 PostgreSQL 데이터 타입으로 매핑합니다. [IMPORT FOREIGN SCHEMA](#import-foreign-schema)는 컬럼을 가져올 때 PostgreSQL 컬럼의 첫 번째 타입을 사용하며, 추가 타입은 [CREATE FOREIGN TABLE](#create-foreign-table) SQL 문에서 사용할 수 있습니다:

| ClickHouse |    PostgreSQL    |             비고             |
|------------|------------------|-------------------------------|
| Bool       | boolean          |                               |
| Date       | date             |                               |
| Date32     | date             |                               |
| DateTime   | timestamptz      |                               |
| Decimal    | numeric          |                               |
| Float32    | real             |                               |
| Float64    | double precision |                               |
| IPv4       | inet             |                               |
| IPv6       | inet             |                               |
| Int16      | smallint         |                               |
| Int32      | integer          |                               |
| Int64      | bigint           |                               |
| Int8       | smallint         |                               |
| JSON       | jsonb            | HTTP 엔진에서만 사용         |
| String     | text, bytea      |                               |
| UInt16     | integer          |                               |
| UInt32     | bigint           |                               |
| UInt64     | bigint           | BIGINT 최대값을 초과하는 값에서 오류 발생 |
| UInt8      | smallint         |                               |
| UUID       | uuid             |                               |

추가 비고와 세부 사항은 아래를 참조하십시오.

### BYTEA \{#bytea\}

ClickHouse는 PostgreSQL의 [BYTEA] 타입에 해당하는 타입을 제공하지 않지만,
[String] 타입에 임의의 바이트를 저장할 수 있습니다. 일반적으로 ClickHouse 문자열은
PostgreSQL의 [TEXT]에 매핑되어야 하지만, 바이너리 데이터를 사용하는 경우 [BYTEA]에
매핑하십시오. 예시:

```sql
-- Create clickHouse table with String columns.
SELECT clickhouse_raw_query($$
    CREATE TABLE bytes (
        c1 Int8, c2 String, c3 String
    ) ENGINE = MergeTree ORDER BY (c1);
$$);

-- Create foreign table with BYTEA columns.
CREATE FOREIGN TABLE bytes (
    c1 int,
    c2 BYTEA,
    c3 BYTEA
) SERVER ch_srv OPTIONS( table_name 'bytes' );

-- Insert binary data into the foreign table.
INSERT INTO bytes
SELECT n, sha224(bytea('val'||n)), decode(md5('int'||n), 'hex')
  FROM generate_series(1, 4) n;

-- View the results.
SELECT * FROM bytes;
```

마지막 `SELECT` 쿼리의 출력 결과는 다음과 같습니다:

```pgsql
 c1 |                             c2                             |                 c3
----+------------------------------------------------------------+------------------------------------
  1 | \x1bf7f0cc821d31178616a55a8e0c52677735397cdde6f4153a9fd3d7 | \xae3b28cde02542f81acce8783245430d
  2 | \x5f6e9e12cd8592712e638016f4b1a2e73230ee40db498c0f0b1dc841 | \x23e7c6cacb8383f878ad093b0027d72b
  3 | \x53ac2c1fa83c8f64603fe9568d883331007d6281de330a4b5e728f9e | \x7e969132fc656148b97b6a2ee8bc83c1
  4 | \x4e3c2e4cb7542a45173a8dac939ddc4bc75202e342ebc769b0f5da2f | \x8ef30f44c65480d12b650ab6b2b04245
(4 rows)
```

ClickHouse 컬럼에 nul 바이트가 포함된 경우, [TEXT] 컬럼을 사용하는 외부 테이블은 올바른 값을 출력하지 않으니 주의하십시오:

```sql
-- Create foreign table with TEXT columns.
CREATE FOREIGN TABLE texts (
    c1 int,
    c2 TEXT,
    c3 TEXT
) SERVER ch_srv OPTIONS( table_name 'bytes' );

-- Encode binary data as hex.
SELECT c1, encode(c2::bytea, 'hex'), encode(c3::bytea, 'hex') FROM texts ORDER BY c1;
```

출력 결과:

```pgsql
 c1 |                          encode                          |              encode
----+----------------------------------------------------------+----------------------------------
  1 | 1bf7f0cc821d31178616a55a8e0c52677735397cdde6f4153a9fd3d7 | ae3b28cde02542f81acce8783245430d
  2 | 5f6e9e12cd8592712e638016f4b1a2e73230ee40db498c0f0b1dc841 | 23e7c6cacb8383f878ad093b
  3 | 53ac2c1fa83c8f64603fe9568d883331                         | 7e969132fc656148b97b6a2ee8bc83c1
  4 | 4e3c2e4cb7542a45173a8dac939ddc4bc75202e342ebc769b0f5da2f | 8ef30f44c65480d12b650ab6b2b04245
(4 rows)
```

2번째와 3번째 행에는 잘린 값이 포함되어 있습니다. 이는 PostgreSQL이 nul 종료 문자열(nul-terminated string)을 사용하며, 문자열 내에 nul을 지원하지 않기 때문입니다.

[TEXT] 컬럼에 이진 값을 삽입하면 성공적으로 처리되며 예상대로 작동합니다:

```sql
-- Insert via text columns:
TRUNCATE texts;
INSERT INTO texts
SELECT n, sha224(bytea('val'||n)), decode(md5('int'||n), 'hex')
  FROM generate_series(1, 4) n;

-- View the data.
SELECT c1, encode(c2::bytea, 'hex'), encode(c3::bytea, 'hex') FROM texts ORDER BY c1;
```

텍스트 컬럼은 올바르게 표시됩니다:

```pgdsql

 c1 |                          encode                          |              encode
----+----------------------------------------------------------+----------------------------------
  1 | 1bf7f0cc821d31178616a55a8e0c52677735397cdde6f4153a9fd3d7 | ae3b28cde02542f81acce8783245430d
  2 | 5f6e9e12cd8592712e638016f4b1a2e73230ee40db498c0f0b1dc841 | 23e7c6cacb8383f878ad093b0027d72b
  3 | 53ac2c1fa83c8f64603fe9568d883331007d6281de330a4b5e728f9e | 7e969132fc656148b97b6a2ee8bc83c1
  4 | 4e3c2e4cb7542a45173a8dac939ddc4bc75202e342ebc769b0f5da2f | 8ef30f44c65480d12b650ab6b2b04245
(4 rows)
```

하지만 이를 [BYTEA]로 읽을 때는 그렇지 않습니다:

```pgsql
# SELECT * FROM bytes;
 c1 |                                                           c2                                                           |                                   c3
----+------------------------------------------------------------------------------------------------------------------------+------------------------------------------------------------------------
  1 | \x5c783162663766306363383231643331313738363136613535613865306335323637373733353339376364646536663431353361396664336437 | \x5c786165336232386364653032353432663831616363653837383332343534333064
  2 | \x5c783566366539653132636438353932373132653633383031366634623161326537333233306565343064623439386330663062316463383431 | \x5c783233653763366361636238333833663837386164303933623030323764373262
  3 | \x5c783533616332633166613833633866363436303366653935363864383833333331303037643632383164653333306134623565373238663965 | \x5c783765393639313332666336353631343862393762366132656538626338336331
  4 | \x5c783465336332653463623735343261343531373361386461633933396464633462633735323032653334326562633736396230663564613266 | \x5c783865663330663434633635343830643132623635306162366232623034323435
(4 rows)
```

:::tip
원칙적으로 인코딩된 문자열에는 [TEXT] 컬럼만 사용하고, 이진 데이터에는 [BYTEA] 컬럼만 사용하며, 두 유형을 절대 서로 바꿔 사용하지 않습니다.
:::


## FUNCTION 및 연산자 참조 \{#function-and-operator-reference\}

### 함수 \{#functions\}

이 함수들은 ClickHouse 데이터베이스에 대한 쿼리 인터페이스를 제공합니다.

#### `clickhouse_raw_query` \{#clickhouse_raw_query\}

```sql
SELECT clickhouse_raw_query(
    'CREATE TABLE t1 (x String) ENGINE = Memory',
    'host=localhost port=8123'
);
```

HTTP 인터페이스를 통해 ClickHouse 서비스에 연결하여 단일
쿼리를 실행한 뒤 연결을 종료합니다. 선택적인 두 번째 인수로
연결 문자열을 지정할 수 있으며, 기본값은 `host=localhost port=8123`입니다. 지원되는 연결
매개변수는 다음과 같습니다:

* `host`: 연결할 호스트입니다. 필수입니다.
* `port`: 연결할 HTTP 포트입니다. 기본값은 `8123`이며, `host`가
  ClickHouse Cloud 호스트인 경우 기본값은 `8443`입니다.
* `dbname`: 연결할 데이터베이스 이름입니다.
* `username`: 연결할 사용자 이름입니다. 기본값은 `default`입니다.
* `password`: 인증에 사용할 비밀번호입니다. 기본값은 비밀번호 없음입니다.

레코드를 반환하지 않는 쿼리에 유용하며, 값을 반환하는
쿼리의 결과는 단일 텍스트 값으로 반환됩니다:

```sql
SELECT clickhouse_raw_query(
    'SELECT schema_name, schema_owner from information_schema.schemata',
    'host=localhost port=8123'
);
```

```sql
      clickhouse_raw_query
---------------------------------
 INFORMATION_SCHEMA      default+
 default default                +
 git     default                +
 information_schema      default+
 system  default                +

(1 row)
```


### 푸시다운 함수 \{#pushdown-functions\}

ClickHouse 외부 테이블을 쿼리하기 위해 조건절(`HAVING`, `WHERE`)에서 사용되는 모든 PostgreSQL 내장 함수는 동일한 이름과 함수 시그니처로 자동으로 ClickHouse로 푸시다운됩니다. 그러나 일부 함수는 이름이나 시그니처가 달라서 해당하는 함수로 매핑해야 합니다. `pg_clickhouse`는 다음 함수를 매핑합니다:

* `date_part`:
  * `date_part('day')`: [toDayOfMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfMonth)
  * `date_part('doy')`: [toDayOfYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfYear)
  * `date_part('dow')`: [toDayOfWeek](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfWeek)
  * `date_part('year')`: [toYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toYear)
  * `date_part('month')`: [toMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMonth)
  * `date_part('hour')`: [toHour](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toHour)
  * `date_part('minute')`: [toMinute](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMinute)
  * `date_part('second')`: [toSecond](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toSecond)
  * `date_part('quarter')`: [toQuarter](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toQuarter)
  * `date_part('isoyear')`: [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toISOYear)
  * `date_part('week')`: [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toISOWeek)
  * `date_part('epoch')`: [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toUnixTimestamp)
* `date_trunc`:
  * `date_trunc('week')`: [toMonday](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMonday)
  * `date_trunc('second')`: [toStartOfSecond](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfSecond)
  * `date_trunc('minute')`: [toStartOfMinute](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfMinute)
  * `date_trunc('hour')`: [toStartOfHour](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfHour)
  * `date_trunc('day')`: [toStartOfDay](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfDay)
  * `date_trunc('month')`: [toStartOfMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfMonth)
  * `date_trunc('quarter')`: [toStartOfQuarter](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfQuarter)
  * `date_trunc('year')`: [toStartOfYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfYear)
* `array_position`: [indexOf](https://clickhouse.com/docs/sql-reference/functions/array-functions#indexOf)
* `btrim`: [trimBoth](https://clickhouse.com/docs/sql-reference/functions/string-functions#trimboth)
* `strpos`: [position](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#position)
* `regexp_like`: [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
*   `md5`: [MD5](https://clickhouse.com/docs/sql-reference/functions/hash-functions#MD5)

### 사용자 정의 함수 \{#custom-functions\}

`pg_clickhouse`에서 생성한 이 사용자 정의 함수들은 PostgreSQL에 대응하는 함수가 없는 일부 ClickHouse 함수에 대해 foreign query pushdown(쿼리 푸시다운)을 제공합니다. 이러한 함수들 중 어떤 것이든 푸시다운할 수 없으면 예외를 발생시킵니다.

* [dictGet](https://clickhouse.com/docs/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)

### 푸시다운 캐스트 \{#pushdown-casts\}

pg_clickhouse는 호환되는 데이터 타입에 대해서 `CAST(x AS bigint)`와 같은 캐스트를
푸시다운합니다. 호환되지 않는 타입에는 푸시다운이 실패합니다. 이 예제에서 `x`가
ClickHouse `UInt64`라면, ClickHouse는 해당 값의 캐스트를 거부합니다.

호환되지 않는 데이터 타입으로의 캐스트를 푸시다운하기 위해, pg_clickhouse는 다음
FUNCTION을 제공합니다. 이 FUNCTION들이 푸시다운되지 않으면 PostgreSQL에서 예외를
발생시킵니다.

* [toUInt8](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint8)
* [toUInt16](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint16)
* [toUInt32](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint32)
* [toUInt64](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint64)
* [toUInt128](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint128)

### 푸시다운 집계 \{#pushdown-aggregates\}

다음 PostgreSQL 집계 함수는 ClickHouse로 푸시다운됩니다.

* [array_agg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/grouparray)
* [avg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/avg)
* [count](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/count)
* [min](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/min)
* [max](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/max)

### 사용자 정의 집계 함수 \{#custom-aggregates\}

`pg_clickhouse`에서 생성한 이러한 사용자 정의 집계 함수는 PostgreSQL에
동등한 기능이 없는 일부 ClickHouse 집계 함수에 대해 foreign
query pushdown(원격 쿼리 푸시다운)을 제공합니다. 이 함수들 중 어느 하나라도
pushdown 대상이 될 수 없으면 예외를 발생시킵니다.

* [argMax](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/argmax)
* [argMin](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/argmin)
* [uniq](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqCombined64](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqHLL12](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqTheta](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqthetasketch)
* [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* [quantileExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantileexact)

### 푸시다운 Ordered Set 집계 \{#pushdown-ordered-set-aggregates\}

이러한 [ordered-set aggregate functions]는 *direct argument*를 매개변수로, `ORDER BY` 표현식을 인수로 전달하여 ClickHouse의 [Parametric
aggregate functions]에 매핑됩니다. 예를 들어, 다음 PostgreSQL 쿼리는 다음과 같습니다:

```sql
SELECT percentile_cont(0.25) WITHIN GROUP (ORDER BY a) FROM t1;
```

다음 ClickHouse 쿼리에 해당합니다:

```sql
SELECT quantile(0.25)(a) FROM t1;
```

기본값이 아닌 `ORDER BY` 접미사인 `DESC` 및 `NULLS FIRST`는
지원되지 않으며 오류가 발생합니다.

* `percentile_cont(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantile(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantileExact(double)`: [quantileExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantileexact)


## 저자 \{#authors\}

[David E. Wheeler](https://justatheory.com/)

## 저작권 \{#copyright\}

Copyright (c) 2025-2026, ClickHouse

[foreign data wrapper]: https://www.postgresql.org/docs/current/fdwhandler.html "PostgreSQL 문서: Foreign Data Wrapper 작성"

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse "Docker Hub 최신 버전"

[ClickHouse]: https://clickhouse.com/clickhouse

[Semantic Versioning]: https://semver.org/spec/v2.0.0.html "Semantic Versioning 2.0.0"

[DDL]: https://en.wikipedia.org/wiki/Data_definition_language "Wikipedia: 데이터 정의 언어(Data Definition Language)"

[CREATE EXTENSION]: https://www.postgresql.org/docs/current/sql-createextension.html "PostgreSQL 문서: CREATE EXTENSION"

[ALTER EXTENSION]: https://www.postgresql.org/docs/current/sql-alterextension.html "PostgreSQL 문서: ALTER EXTENSION"

[DROP EXTENSION]: https://www.postgresql.org/docs/current/sql-dropextension.html "PostgreSQL 문서: DROP EXTENSION"

[CREATE SERVER]: https://www.postgresql.org/docs/current/sql-createserver.html "PostgreSQL 문서: CREATE SERVER"

[ALTER SERVER]: https://www.postgresql.org/docs/current/sql-alterserver.html "PostgreSQL 문서: ALTER SERVER"

[DROP SERVER]: https://www.postgresql.org/docs/current/sql-dropserver.html "PostgreSQL 문서: DROP SERVER"

[CREATE USER MAPPING]: https://www.postgresql.org/docs/current/sql-createusermapping.html "PostgreSQL 문서: CREATE USER MAPPING"

[ALTER USER MAPPING]: https://www.postgresql.org/docs/current/sql-alterusermapping.html "PostgreSQL 문서: ALTER USER MAPPING"

[DROP USER MAPPING]: https://www.postgresql.org/docs/current/sql-dropusermapping.html "PostgreSQL 문서: DROP USER MAPPING"

[IMPORT FOREIGN SCHEMA]: https://www.postgresql.org/docs/current/sql-importforeignschema.html "PostgreSQL 문서: IMPORT FOREIGN SCHEMA"

[CREATE FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-createforeigntable.html "PostgreSQL 문서: CREATE FOREIGN TABLE"

[table engine]: https://clickhouse.com/docs/engines/table-engines "ClickHouse 문서: 테이블 엔진"

[AggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/aggregatefunction "ClickHouse 문서: AggregateFunction 유형"

[SimpleAggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/simpleaggregatefunction "ClickHouse 문서: SimpleAggregateFunction 유형"

[ALTER FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-alterforeigntable.html "PostgreSQL 문서: ALTER FOREIGN TABLE"

[DROP FOREIGN TABLE]: https://www.postgresql.org/docs/current/sql-dropforeigntable.html "PostgreSQL 문서: DROP FOREIGN TABLE"

[DML]: https://en.wikipedia.org/wiki/Data_manipulation_language "Wikipedia: 데이터 조작 언어(Data Manipulation Language)"

[make-logs.sql]: https://github.com/ClickHouse/pg_clickhouse/blob/main/doc/make-logs.sql

[EXPLAIN]: https://www.postgresql.org/docs/current/sql-explain.html "PostgreSQL 문서: EXPLAIN"

[SELECT]: https://www.postgresql.org/docs/current/sql-select.html "PostgreSQL 문서: SELECT"

[PREPARE]: https://www.postgresql.org/docs/current/sql-prepare.html "PostgreSQL 문서: PREPARE"

[EXECUTE]: https://www.postgresql.org/docs/current/sql-execute.html "PostgreSQL 문서: EXECUTE"

[DEALLOCATE]: https://www.postgresql.org/docs/current/sql-deallocate.html "PostgreSQL 문서: DEALLOCATE"

[PREPARE]: https://www.postgresql.org/docs/current/sql-prepare.html "PostgreSQL 문서: PREPARE"

[INSERT]: https://www.postgresql.org/docs/current/sql-insert.html "PostgreSQL 문서: INSERT"

[COPY]: https://www.postgresql.org/docs/current/sql-copy.html "PostgreSQL 문서: COPY"

[LOAD]: https://www.postgresql.org/docs/current/sql-load.html "PostgreSQL 문서: LOAD"

[SET]: https://www.postgresql.org/docs/current/sql-set.html "PostgreSQL 문서: SET"

[ALTER ROLE]: https://www.postgresql.org/docs/current/sql-alterrole.html "PostgreSQL 문서: ALTER ROLE"

[ordered-set aggregate functions]: https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE

[매개변수화된 집계 함수(Parametric Aggregate Functions)]: https://clickhouse.com/docs/sql-reference/aggregate-functions/parametric-functions

[ClickHouse settings]: https://clickhouse.com/docs/operations/settings/settings
    "ClickHouse 문서: 세션 설정"

[dollar quoting]: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
    "PostgreSQL 문서: 달러 인용 문자열 상수"

[library preloading]: https://www.postgresql.org/docs/18/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-PRELOAD
    "PostgreSQL 문서: 공유 라이브러리 사전 로드"

[PREPARE notes]: https://www.postgresql.org/docs/current/sql-prepare.html#SQL-PREPARE-NOTES
    "PostgreSQL 문서: PREPARE 관련 참고 사항"

[query parameters]: https://clickhouse.com/docs/guides/developer/stored-procedures-and-prepared-statements#alternatives-to-prepared-statements-in-clickhouse
    "ClickHouse 문서: ClickHouse에서 prepared statement의 대안"

[underlying bug]: https://github.com/ClickHouse/ClickHouse/issues/85847
    "ClickHouse/ClickHouse#85847 multipart form의 일부 쿼리에서 settings를 읽지 않는 문제"

[fixed]: https://github.com/ClickHouse/ClickHouse/pull/85570
    "ClickHouse/ClickHouse#85570 multipart를 사용하는 HTTP 수정"

[BYTEA]: https://www.postgresql.org/docs/current/datatype-binary.html
    "PostgreSQL 문서: 이진 데이터 타입"

[String]: https://clickhouse.com/docs/sql-reference/data-types/string
    "ClickHouse 문서: String"

[TEXT]: https://www.postgresql.org/docs/current/datatype-character.html
    "PostgreSQL 문서: 문자 데이터 타입"