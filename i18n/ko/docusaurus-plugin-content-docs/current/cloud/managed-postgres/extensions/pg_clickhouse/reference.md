---
sidebar_label: '참고'
description: 'pg_clickhouse의 전체 참고 문서'
slug: '/cloud/managed-postgres/extensions/pg_clickhouse/reference'
title: 'pg_clickhouse 참고 문서'
doc_type: 'reference'
keywords: ['PostgreSQL', 'Postgres', 'FDW', '외부 데이터 래퍼', 'pg_clickhouse', '확장 기능']
---

## 설명 \{#description\}

pg&#95;clickhouse는 ClickHouse 데이터베이스에서 원격 쿼리를 실행할 수 있게 해주는 PostgreSQL 확장 기능으로,
[외부 데이터 래퍼]도 제공합니다. PostgreSQL 13 이상과 ClickHouse 23 이상을 지원합니다.

## 시작하기 \{#getting-started\}

pg&#95;clickhouse를 가장 간단하게 사용해 보는 방법은 [Docker image]를 사용하는 것입니다. 여기에는
pg&#95;clickhouse와 [re2][re2
extension] 확장 기능이 포함된 표준 PostgreSQL Docker image가 들어 있습니다:

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres
```

ClickHouse 테이블을 가져오고
쿼리 푸시다운을 시작하려면 [튜토리얼](tutorial.md)을 확인하십시오.

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

## 버전 정책 \{#versioning-policy\}

pg&#95;clickhouse는 공식 릴리스에 [Semantic Versioning]을 적용합니다.

* API가 변경되면 주 버전이 증가합니다
* 하위 호환되는 SQL 변경이 있으면 부 버전이 증가합니다
* 바이너리 전용 변경이 있으면 패치 버전이 증가합니다

설치 후 PostgreSQL은 두 가지 형태의 버전을 추적합니다.

* 라이브러리 버전(PostgreSQL 18 이상에서는 `PG_MODULE_MAGIC`으로 정의됨)에는 전체 시맨틱 버전이 포함되며, `pgch_version()` 함수의 출력 또는 Postgres [`pg_get_loaded_modules()`] 함수에서 확인할 수 있습니다.
* 확장 기능 버전(control 파일에 정의됨)에는 주 버전과 부 버전만 포함되며, `pg_catalog.pg_extension` 테이블(table), `pg_available_extension_versions()` 함수의 출력, 그리고 `\dx
  pg_clickhouse`에서 확인할 수 있습니다.

실제로 이는 예를 들어 패치 버전이 증가하는 릴리스, 즉
`v0.1.0`에서 `v0.1.1`로 변경되는 경우, `v0.1`을 로드한 모든 데이터베이스가
업그레이드의 이점을 누릴 수 있으며 `ALTER EXTENSION`을 실행하지 않아도 된다는 의미입니다.

반면 부 버전이나 주 버전이 증가하는 릴리스에는
SQL 업그레이드 스크립트가 함께 제공되며, 확장 기능이 포함된 기존의 모든 데이터베이스는
업그레이드의 이점을 누리기 위해 `ALTER EXTENSION pg_clickhouse UPDATE`를 실행해야 합니다.

## DDL SQL 참고 \{#ddl-sql-reference\}

다음 SQL [DDL] 표현식에서는 pg&#95;clickhouse를 사용합니다.

### CREATE EXTENSION \{#create-extension\}

데이터베이스에 pg&#95;clickhouse 확장 기능을 추가하려면 [CREATE EXTENSION]을 사용하십시오:

```sql
CREATE EXTENSION pg_clickhouse;
```

특정 스키마에 설치하려면 `WITH SCHEMA`를 사용하십시오(권장):

```sql
CREATE SCHEMA ch;
CREATE EXTENSION pg_clickhouse WITH SCHEMA ch;
```

### ALTER EXTENSION \{#alter-extension\}

[ALTER EXTENSION]을 사용하여 pg&#95;clickhouse를 변경할 수 있습니다. 예시:

* pg&#95;clickhouse의 새 버전을 설치한 후에는 `UPDATE` 절을 사용하십시오:

  ```sql
  ALTER EXTENSION pg_clickhouse UPDATE;
  ```

* `SET SCHEMA`를 사용하여 확장 기능을 새 스키마로 이동하십시오:

  ```sql
  CREATE SCHEMA ch;
  ALTER EXTENSION pg_clickhouse SET SCHEMA ch;
  ```

### DROP EXTENSION \{#drop-extension\}

데이터베이스에서 pg&#95;clickhouse 확장 기능을 제거하려면 [DROP EXTENSION]을 사용하십시오:

```sql
DROP EXTENSION pg_clickhouse;
```

pg&#95;clickhouse에 종속된 객체가 하나라도 있으면 이 명령은 실패합니다. 해당 객체도 함께 삭제하려면
`CASCADE` 절을 사용하십시오:

```sql
DROP EXTENSION pg_clickhouse CASCADE;
```

### CREATE SERVER \{#create-server\}

ClickHouse 서버에 연결할 외부 서버를 생성하려면 [CREATE SERVER]를 사용합니다. 예시:

```sql
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
```

지원되는 옵션은 다음과 같습니다.

* `driver`: 사용할 ClickHouse 연결 드라이버로, &quot;binary&quot; 또는
  &quot;http&quot;입니다. **필수입니다.**
* `dbname`: 연결 시 사용할 ClickHouse DB입니다. 기본값은
  &quot;default&quot;입니다.
* `fetch_size`: HTTP 스트리밍에 사용할 대략적인 바이트 단위 배치 크기입니다. 배치는
  행 경계에서 분할됩니다. 기본값은 `50000000`(50 MB)입니다. `0`으로 설정하면
  스트리밍이 비활성화되고 전체 응답이 버퍼링됩니다. 외부 테이블은 이
  값을 재정의할 수 있습니다.
* `host`: ClickHouse 서버의 호스트 이름입니다. 기본값은 &quot;localhost&quot;입니다;
* `port`: ClickHouse 서버에 연결할 때 사용할 포트입니다. 기본값은
  다음과 같습니다.
  * `driver`가 &quot;binary&quot;이고 `host`가 ClickHouse Cloud 호스트이면 9440
  * `driver`가 &quot;binary&quot;이고 `host`가 ClickHouse Cloud 호스트가 아니면 9004
  * `driver`가 &quot;http&quot;이고 `host`가 ClickHouse Cloud 호스트이면 8443
  * `driver`가 &quot;http&quot;이고 `host`가 ClickHouse Cloud 호스트가 아니면 8123

### ALTER SERVER \{#alter-server\}

[ALTER SERVER]를 사용하여 외부 서버를 변경합니다. 예시:

```sql
ALTER SERVER taxi_srv OPTIONS (SET driver 'http');
```

옵션은 [CREATE SERVER](#create-server)와 동일합니다.

### DROP SERVER \{#drop-server\}

외부 서버를 삭제하려면 [DROP SERVER]를 사용하십시오:

```sql
DROP SERVER taxi_srv;
```

다른 객체가 서버를 참조하고 있으면 이 명령은 실패합니다. 해당 종속성도 함께 삭제하려면 `CASCADE`를
사용하십시오:

```sql
DROP SERVER taxi_srv CASCADE;
```

### CREATE USER MAPPING \{#create-user-mapping\}

[CREATE USER MAPPING]을 사용하면 PostgreSQL 사용자를 ClickHouse 사용자에 매핑할 수 있습니다. 예를 들어,
`taxi_srv` 외부 서버로 연결할 때 현재 PostgreSQL 사용자를 원격 ClickHouse 사용자에 매핑하려면
다음을 사용하십시오:

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'demo');
```

지원되는 옵션은 다음과 같습니다:

* `user`: ClickHouse 사용자 이름입니다. 기본값은 &quot;default&quot;입니다.
* `password`: ClickHouse 사용자 비밀번호입니다.

### ALTER USER MAPPING \{#alter-user-mapping\}

사용자 매핑 정의를 변경하려면 [ALTER USER MAPPING]을 사용하십시오:

```sql
ALTER USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (SET user 'default');
```

옵션은 [CREATE USER MAPPING](#create-user-mapping)의 옵션과 동일합니다.

### DROP USER MAPPING \{#drop-user-mapping\}

사용자 매핑을 삭제하려면 [DROP USER MAPPING]을 사용하십시오:

```sql
DROP USER MAPPING FOR CURRENT_USER SERVER taxi_srv;
```

### IMPORT FOREIGN SCHEMA \{#import-foreign-schema\}

[IMPORT FOREIGN SCHEMA]를 사용하여 ClickHouse 데이터베이스에 정의된 모든 테이블을 PostgreSQL 스키마에 외부 테이블로 가져올 수 있습니다:

```sql
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA demo FROM SERVER taxi_srv INTO taxi;
```

`LIMIT TO`를 사용하여 가져오기를 특정 테이블로 제한합니다:

```sql
IMPORT FOREIGN SCHEMA demo LIMIT TO (trips) FROM SERVER taxi_srv INTO taxi;
```

테이블을 제외하려면 `EXCEPT`를 사용합니다:

```sql
IMPORT FOREIGN SCHEMA demo EXCEPT (users) FROM SERVER taxi_srv INTO taxi;
```

pg&#95;clickhouse는 지정된 ClickHouse 데이터베이스(위 예시에서는 &quot;demo&quot;)의 모든 테이블 목록을 가져오고, 각 테이블의 컬럼 정의를 조회한 다음, [CREATE FOREIGN TABLE](#create-foreign-table) 명령을 실행하여 외부 테이블을 생성합니다. 컬럼은 [지원되는 데이터 타입](#data-types)과, 감지 가능한 경우 [CREATE FOREIGN TABLE](#create-foreign-table)에서 지원하는 옵션을 사용해 정의됩니다.

:::tip 가져온 식별자의 대소문자 보존

`IMPORT FOREIGN SCHEMA`는 가져오는 테이블 및 컬럼 이름에 `quote_identifier()`를 적용하며, 이 함수는 대문자나 공백이 포함된 식별자를 큰따옴표로 묶습니다. 따라서 이러한 테이블 및 컬럼 이름은 PostgreSQL 쿼리에서 반드시 큰따옴표로 묶어야 합니다. 모두 소문자이고 공백 문자가 없는 이름은 따옴표로 묶지 않아도 됩니다.

예를 들어, 다음과 같은 ClickHouse 테이블이 있다고 가정하겠습니다:

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

`IMPORT FOREIGN SCHEMA`는 다음 외부 테이블을 생성합니다:

```sql
 CREATE TABLE test
 (
     id          BIGINT      NOT NULL,
     "Name"      TEXT        NOT NULL,
     "updatedAt" TIMESTAMPTZ NOT NULL
 );
```

따라서 쿼리에서는 적절히 인용 부호를 사용해야 합니다. 예를 들면 다음과 같습니다.

```sql
 SELECT id, "Name", "updatedAt" FROM test;
```

서로 다른 이름이나 모두 소문자(즉,
대소문자를 구분하지 않는) 이름의 객체를 만들려면 [CREATE FOREIGN TABLE](#create-foreign-table)을 사용하십시오.
:::

### CREATE FOREIGN TABLE \{#create-foreign-table\}

ClickHouse 데이터베이스의 데이터를 쿼리할 수 있는 외부 테이블을 생성하려면 [CREATE FOREIGN TABLE]을 사용하십시오:

```sql
CREATE FOREIGN TABLE acts (
    user_id    bigint NOT NULL,
    page_views int,
    duration   smallint,
    sign       smallint
) SERVER taxi_srv OPTIONS(
    table_name 'acts'
    engine 'CollapsingMergeTree'
);
```

지원되는 테이블 옵션은 다음과 같습니다.

* `database`: 원격 데이터베이스의 이름입니다. 기본값은 외부 서버에
  정의된 데이터베이스입니다.
* `fetch_size`: HTTP 스트리밍을 위한 대략적인 바이트 단위 배치 크기입니다. 서버 수준의
  `fetch_size`를 재정의합니다. 기본값은 `50000000`(50 MB)입니다. `0`으로 설정하면
  스트리밍이 비활성화되고 전체 응답이 버퍼링됩니다.
* `table_name`: 원격 테이블의 이름입니다. 기본값은 외부 테이블에
  지정된 이름입니다.
* `engine`: ClickHouse 테이블에서 사용하는 [테이블 엔진]입니다.
  `CollapsingMergeTree()` 및 `AggregatingMergeTree()`의 경우, pg&#95;clickhouse는
  테이블에서 실행되는 함수 표현식에 매개변수를 자동으로 적용합니다.

각 컬럼의 원격 ClickHouse 데이터
타입에 맞는 [데이터 타입](#data-types)을 사용하십시오. 지원되는 컬럼 옵션은 다음과 같습니다.

* `column_name`: ClickHouse 측 컬럼의 이름입니다. 쿼리와
  삽입을 디파싱할 때 PostgreSQL 속성 이름보다 우선해서 사용됩니다.
  따옴표 없이 사용하는 소문자 PostgreSQL 컬럼 이름을 대소문자를 구분하는 ClickHouse 컬럼에
  매핑할 때 유용합니다. 예를 들면 다음과 같습니다.

  ```sql
  CREATE FOREIGN TABLE hits (
      watchid    bigint   OPTIONS(column_name 'WatchID'),
      javaenable smallint OPTIONS(column_name 'JavaEnable'),
      title      text     OPTIONS(column_name 'Title')
  ) SERVER taxi_srv OPTIONS(table_name 'hits');
  ```

* `AggregateFunction`: [AggregateFunction Type] 컬럼에 적용되는
  집계 함수의 이름입니다. 데이터 타입을 함수에 전달되는 ClickHouse 타입에 맞게 매핑하고,
  적절한 컬럼 옵션으로 집계 함수 이름을 지정하면
  pg&#95;clickhouse가 해당 컬럼을 평가하는 집계 함수에 `Merge`를 자동으로
  추가합니다.

  ```sql
  CREATE FOREIGN TABLE test (
      column1 bigint  OPTIONS(AggregateFunction 'uniq'),
      column2 integer OPTIONS(AggregateFunction 'anyIf'),
      column3 bigint  OPTIONS(AggregateFunction 'quantiles(0.5, 0.9)')
  ) SERVER clickhouse_srv;
  ```

* `SimpleAggregateFunction`: [SimpleAggregateFunction Type] 컬럼에 적용되는
  집계 함수의 이름입니다. 데이터 타입을 함수에 전달되는
  ClickHouse 타입에 맞게 매핑하고, 적절한 컬럼 옵션으로
  집계 함수 이름을 지정하십시오.

### ALTER FOREIGN TABLE \{#alter-foreign-table\}

[ALTER FOREIGN TABLE]을 사용해 외부 테이블의 정의를 변경합니다:

```sql
ALTER TABLE table ALTER COLUMN b OPTIONS (SET AggregateFunction 'count');
```

지원되는 테이블 및 컬럼 옵션은 [CREATE FOREIGN
TABLE]와 동일합니다.

### DROP FOREIGN TABLE \{#drop-foreign-table\}

외부 테이블을 삭제하려면 [DROP FOREIGN TABLE] 문을 사용합니다:

```sql
DROP FOREIGN TABLE acts;
```

외부 테이블에 종속된 객체가 하나라도 있으면 이 명령은 실패합니다.
해당 객체도 함께 삭제하려면 `CASCADE` 절을 사용하십시오:

```sql
DROP FOREIGN TABLE acts CASCADE;
```

## DML SQL 참고 \{#dml-sql-reference\}

아래 SQL [DML] 표현식에서는 pg&#95;clickhouse를 사용할 수 있습니다. 예시는
다음 ClickHouse 테이블(table)을 기준으로 합니다:

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

[EXPLAIN] 명령은 예상대로 작동하지만, `VERBOSE` 옵션을 사용하면
ClickHouse의 &quot;Remote SQL&quot; 쿼리가 출력됩니다:

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

이 쿼리는 &quot;Foreign Scan&quot; 계획 노드를 통해 ClickHouse로 푸시다운되며,
원격 SQL로 실행됩니다.

### SELECT \{#select\}

pg&#95;clickhouse 테이블에서도 다른 테이블과 마찬가지로 쿼리를 실행하려면 [SELECT] 문을 사용하십시오:

```pgsql
try=# SELECT start_at, duration, resource FROM logs WHERE req_id = 4117909262;
          start_at          | duration |    resource
----------------------------+----------+----------------
 2025-12-05 15:07:32.944188 |      175 | /widgets/totem
(1 row)
```

pg&#95;clickhouse는 집계 함수(aggregate functions)를 포함한 쿼리 실행을 가능한 한
많이 ClickHouse로 푸시다운합니다. [EXPLAIN](#explain)을 사용하여
푸시다운 범위를 확인하십시오. 예를 들어 위 쿼리의 경우 모든 실행이
ClickHouse로 푸시다운됩니다

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

pg&#95;clickhouse는 동일한 원격 서버에 있는 테이블 간 조인도 푸시다운합니다:

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

로컬 테이블과 조인할 경우, 신중하게 튜닝하지 않으면 비효율적인 쿼리가
생성될 수 있습니다. 이 예시에서는 원격 테이블 대신
`nodes` 테이블의 로컬 복사본을 만들고 이를 조인합니다:

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

이 경우 로컬 컬럼 대신 `node_id`를 기준으로 그룹화하면 집계 작업을 더 많이 ClickHouse에서 수행할 수 있으며, 이후 조회 테이블과 조인할 수 있습니다:

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

이제 &quot;Foreign Scan&quot; 노드는 `node_id` 기준 집계를 푸시다운하여,
Postgres로 다시 가져와야 하는 행 수를 1000개(전체
행)에서 노드별 1개씩, 총 8개로 줄입니다.

### PREPARE, EXECUTE, DEALLOCATE \{#prepare-execute-deallocate\}

v0.1.2부터 pg&#95;clickhouse는 주로 [PREPARE] 명령으로 만드는
매개변수화된 쿼리를 지원합니다:

```pgsql
try=# PREPARE avg_durations_between_dates(date, date) AS
       SELECT date(start_at), round(avg(duration)) AS average_duration
         FROM logs
        WHERE date(start_at) BETWEEN $1 AND $2
        GROUP BY date(start_at)
        ORDER BY date(start_at);
PREPARE
```

prepared statement을 실행할 때는 평소와 같이 [EXECUTE]를 사용합니다:

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
매개변수화된 실행을 사용하면 [해당 버그]가 [수정된] 25.8 이전 ClickHouse 버전에서는 [http driver](#create-server)가
DateTime 시간대를 제대로 변환하지 못합니다.
경우에 따라 PostgreSQL은 `PREPARE`를 사용하지 않아도
매개변수화된 쿼리 계획을 사용할 수 있다는 점에 유의하십시오. 정확한 시간대 변환이 필요한
쿼리에서 25.8 이상으로 업그레이드할 수 없는 경우에는 대신 [binary driver](#create-server)를 사용하십시오.
:::

pg&#95;clickhouse는 평소와 같이 집계를 푸시다운하며, 이는
[EXPLAIN](#explain) 상세 출력에서 확인할 수 있습니다:

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

전체 날짜 값이 전송되었으며 매개변수 플레이스홀더는 전송되지 않았다는 점에 유의하십시오.
이는 PostgreSQL
[PREPARE notes]에 설명된 대로 처음 5개의 요청에 적용됩니다. 여섯 번째 실행에서는 ClickHouse
`{param:type}` 스타일의 [쿼리 매개변수]를 전송합니다:
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

prepared statement을 해제하려면 [DEALLOCATE]를 사용하십시오:

```pgsql
try=# DEALLOCATE avg_durations_between_dates;
DEALLOCATE
```

### INSERT \{#insert\}

원격 ClickHouse 테이블에 값을 삽입할 때는 [INSERT] 명령을 사용합니다:

```pgsql
try=# INSERT INTO nodes(node_id, name, region, arch, os)
VALUES (9,  'Augustin Gamarra', 'us-west-2', 'amd64', 'Linux')
     , (10, 'Cerisier', 'us-east-2', 'amd64', 'Linux')
     , (11, 'Dewalt', 'use-central-1', 'arm64', 'macOS')
;
INSERT 0 3
```

### COPY \{#copy\}

원격 ClickHouse
테이블에 행 배치를 삽입하려면 [COPY] 명령을 사용하십시오:

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
> pg&#95;clickhouse는 아직 PostgreSQL FDW의 배치
> 삽입 API를 지원하지 않습니다. 따라서 현재 [COPY]는 레코드를
> 삽입할 때 [INSERT](#insert) SQL 문을 사용합니다. 이 부분은 향후 릴리스에서 개선될 예정입니다.

### LOAD \{#load\}

pg&#95;clickhouse 공유 라이브러리(shared library)를 로드하려면 [LOAD]를 사용합니다:

```pgsql
try=# LOAD 'pg_clickhouse';
LOAD
```

일반적으로 [LOAD]를 사용할 필요는 없습니다. Postgres는 해당 기능(functions, foreign
tables 등) 중 하나를 처음 사용할 때 pg&#95;clickhouse를 자동으로 로드하기 때문입니다.

[LOAD] pg&#95;clickhouse가 유용할 수 있는 경우는 한 가지뿐입니다. [SET](#set)으로
이에 의존하는 쿼리를 실행하기 전에 pg&#95;clickhouse 매개변수를 설정할 때입니다.

### SET \{#set\}

[SET]을 사용하여 pg&#95;clickhouse의 사용자 지정 구성 매개변수를 지정합니다.

#### `pg_clickhouse.session_settings` \{#pg_clickhousesession_settings\}

`pg_clickhouse.session_settings` 매개변수는 이후 쿼리에 적용할 [ClickHouse
설정]을 구성합니다. 예시:

```sql
SET pg_clickhouse.session_settings = 'join_use_nulls 1, final 1';
```

기본값은 `join_use_nulls 1, group_by_use_nulls 1, final 1`입니다. ClickHouse 서버의 설정을 따르도록 하려면 이를
빈 문자열로 설정하십시오.

```sql
SET pg_clickhouse.session_settings = '';
```

구문은 하나 이상의 공백으로 구분되는 키/값 쌍을 쉼표로 나열한 형식입니다.
키는 [ClickHouse 설정]에 해당해야 합니다. 값에 포함된 공백,
쉼표 및 백슬래시는 백슬래시로 이스케이프하십시오:

```sql
SET pg_clickhouse.session_settings = 'join_algorithm grace_hash\,hash';
```

또는 공백과 쉼표를 이스케이프할 필요가 없도록 값을 작은따옴표로 묶어 사용할 수 있습니다. 이중따옴표를 사용할 필요가 없도록 [dollar quoting] 사용도 고려하십시오:

```sql
SET pg_clickhouse.session_settings = $$join_algorithm 'grace_hash,hash'$$;
```

가독성을 중시하고 여러 설정을 지정해야 한다면 여러
줄을 사용하십시오. 예시는 다음과 같습니다:

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

일부 설정은 pg&#95;clickhouse 자체의 동작에 방해가 되는 경우 무시됩니다. 여기에는 다음이 포함됩니다:

* `date_time_output_format`: http 드라이버는 이 값을 &quot;iso&quot;로 요구합니다
* `format_tsv_null_representation`: http 드라이버는 기본값을 요구합니다
* `output_format_tsv_crlf_end_of_line` http 드라이버는 기본값을 요구합니다

그 외에는 pg&#95;clickhouse가 설정을 검증하지 않고, 모든 쿼리마다 이를
ClickHouse에 전달합니다. 따라서 각 ClickHouse 버전에서 제공하는 모든 설정을 지원합니다.

`pg_clickhouse.session_settings`를 설정하기 전에 pg&#95;clickhouse를 먼저 로드해야 한다는
점에 유의하십시오. [공유 라이브러리 preloading]을 사용하거나, 확장 기능의
객체 중 하나를 사용해 로드되도록 하면 됩니다.

#### `pg_clickhouse.pushdown_regex` \{#pg_clickhousepushdown_regex\}

`pg_clickhouse.pushdown_regex` 매개변수는 pg&#95;clickhouse가
정규 표현식 함수와 연산자를 pushdown할지 여부를 제어합니다. 기본적으로 pushdown되며,
이를 방지하려면 이 매개변수를 false로 설정하십시오:

```sql
SET pg_clickhouse.pushdown_regex = 'false';
```

[정규 표현식](#regular-expressions)을 참조하십시오.

### ALTER ROLE \{#alter-role\}

[ALTER ROLE]&#39;s `SET` 명령을 사용하여 pg&#95;clickhouse를 [사전 로드](#preloading)하거나
특정 역할에 대해 해당 매개변수를 [SET](#set)할 수 있습니다:

```pgsql
try=# ALTER ROLE CURRENT_USER SET session_preload_libraries = pg_clickhouse;
ALTER ROLE

try=# ALTER ROLE CURRENT_USER SET pg_clickhouse.session_settings = 'final 1';
ALTER ROLE
```

pg&#95;clickhouse의 사전 로드 설정
및/또는 매개변수를 재설정하려면 [ALTER ROLE]의 `RESET` 명령을 사용하십시오:

```pgsql
try=# ALTER ROLE CURRENT_USER RESET session_preload_libraries;
ALTER ROLE

try=# ALTER ROLE CURRENT_USER RESET pg_clickhouse.session_settings;
ALTER ROLE
```

## 사전 로드 \{#preloading\}

모든 Postgres 연결 또는 거의 모든 연결에서 pg&#95;clickhouse를 사용해야 한다면,
자동으로 로드되도록 [공유 라이브러리 사전 로드]를 사용하는 것을 고려하십시오:

### `session_preload_libraries` \{#session_preload_libraries\}

PostgreSQL의 새 connection마다 shared library를 로드합니다:

```ini
session_preload_libraries = pg_clickhouse
```

서버를 다시 시작하지 않고도 업데이트 사항을 반영하는 데 유용합니다. 다시
연결만 하면 됩니다. [ALTER
ROLE](#alter-role)을 통해 특정 사용자 또는 역할에 대해서도 설정할 수
있습니다.

### `shared_preload_libraries` \{#shared_preload_libraries\}

시작할 때 공유 라이브러리(shared library)를 PostgreSQL 상위 프로세스에 로드합니다:

```ini
shared_preload_libraries = pg_clickhouse
```

각 세션마다 메모리 및 로드 오버헤드를 줄이는 데 유용하지만, 라이브러리가 업데이트되면
클러스터를 다시 시작해야 합니다.

## 데이터 타입 \{#data-types\}

pg&#95;clickhouse는 다음 ClickHouse 데이터 타입을 PostgreSQL 데이터
타입에 매핑합니다. [IMPORT FOREIGN SCHEMA](#import-foreign-schema)는 컬럼을 가져올 때
PostgreSQL 컬럼의 첫 번째 타입을 사용하며, 추가 타입은
[CREATE FOREIGN TABLE](#create-foreign-table) SQL 문에서 사용할 수 있습니다:

| ClickHouse | PostgreSQL       | 비고                       |
| ---------- | ---------------- | ------------------------ |
| Bool       | boolean          |                          |
| Date       | date             |                          |
| Date32     | date             |                          |
| DateTime   | timestamptz      |                          |
| Decimal    | numeric          |                          |
| Float32    | real             |                          |
| Float64    | double precision |                          |
| IPv4       | inet             |                          |
| IPv6       | inet             |                          |
| Int16      | smallint         |                          |
| Int32      | integer          |                          |
| Int64      | bigint           |                          |
| Int8       | smallint         |                          |
| JSON       | jsonb, json      |                          |
| String     | text, bytea      |                          |
| UInt16     | integer          |                          |
| UInt32     | bigint           |                          |
| UInt64     | bigint           | 값이 BIGINT 최댓값보다 크면 오류 발생 |
| UInt8      | smallint         |                          |
| UUID       | uuid             |                          |

추가 참고 사항과 세부 내용은 아래에서 설명합니다.

### BYTEA \{#bytea\}

ClickHouse는 PostgreSQL의 [BYTEA] 유형에 해당하는 타입을 제공하지 않지만,
[String] 유형에 임의의 바이트를 저장할 수 있습니다. 일반적으로 ClickHouse 문자열은
PostgreSQL의 [TEXT]에 매핑하는 것이 적합하지만, 바이너리 데이터를 사용하는 경우에는
[BYTEA]에 매핑하십시오. 예시:

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

2번째와 3번째 행에는 잘린 값이 포함되어 있습니다. 이는 PostgreSQL이 nul 종료 문자열 방식을 사용하며 문자열 내에 nul 문자를 지원하지 않기 때문입니다.

[TEXT] 컬럼에 이진 값을 삽입하면 예상대로 성공적으로 작동합니다:

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

```pgsql

 c1 |                          encode                          |              encode
----+----------------------------------------------------------+----------------------------------
  1 | 1bf7f0cc821d31178616a55a8e0c52677735397cdde6f4153a9fd3d7 | ae3b28cde02542f81acce8783245430d
  2 | 5f6e9e12cd8592712e638016f4b1a2e73230ee40db498c0f0b1dc841 | 23e7c6cacb8383f878ad093b0027d72b
  3 | 53ac2c1fa83c8f64603fe9568d883331007d6281de330a4b5e728f9e | 7e969132fc656148b97b6a2ee8bc83c1
  4 | 4e3c2e4cb7542a45173a8dac939ddc4bc75202e342ebc769b0f5da2f | 8ef30f44c65480d12b650ab6b2b04245
(4 rows)
```

하지만 [BYTEA]로 읽으면 그렇지 않습니다:

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
일반적으로 인코딩된 문자열에는 [TEXT] 컬럼만 사용하고, [BYTEA] 컬럼은
바이너리 데이터에만 사용하며, 두 타입을 서로 바꿔 사용하지 마십시오.
:::

## 함수 및 연산자 참고 \{#function-and-operator-reference\}

### 함수 \{#functions\}

이 함수들은 ClickHouse 데이터베이스를 쿼리할 수 있는 인터페이스를 제공합니다.

#### `clickhouse_raw_query` \{#clickhouse_raw_query\}

```sql
SELECT clickhouse_raw_query(
    'CREATE TABLE t1 (x String) ENGINE = Memory',
    'host=localhost port=8123'
);
```

ClickHouse 서비스의 HTTP 인터페이스를 통해 연결하고, 단일
쿼리를 실행한 다음 연결을 종료합니다. 선택적 두 번째 인수는 기본값이
`host=localhost port=8123`인 연결 문자열을 지정합니다. 지원되는 연결
매개변수는 다음과 같습니다.

* `host`: 연결할 호스트입니다. 필수입니다.
* `port`: 연결할 HTTP 포트입니다. `host`가
  ClickHouse Cloud 호스트가 아닌 경우 기본값은 `8123`입니다. ClickHouse Cloud 호스트인 경우 기본값은 `8443`입니다.
* `dbname`: 연결할 DB의 이름입니다.
* `username`: 연결에 사용할 사용자 이름입니다. 기본값은 `default`입니다.
* `password`: 인증에 사용할 비밀번호입니다. 기본값은 비밀번호 없음입니다.

기본적으로 어떤 역할에도 이 함수에 대한 `EXECUTE` 권한이 없습니다. 따라서
즉석(ad-hoc) ClickHouse 쿼리를 정당하게 실행해야 하는 역할에만 [GRANT]로
접근 권한을 부여하는 것이 좋습니다. 예를 들어 전용 ClickHouse 관리자 역할이 있습니다.

레코드를 반환하지 않는 쿼리에 유용하지만, 값을 반환하는 쿼리의 결과는
단일 텍스트 값으로 반환됩니다:

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

`pg_clickhouse`는 조건식(`HAVING` 및 `WHERE` 절)에서 사용되는 PostgreSQL 내장 함수 중 일부를 푸시다운합니다. 해당 함수들은 다음과 같이 ClickHouse의 대응 함수에 매핑됩니다.

* `abs`: [abs](https://clickhouse.com/docs/sql-reference/functions/arithmetic-functions#abs)
* `factorial`: [factorial](https://clickhouse.com/docs/sql-reference/functions/math-functions#factorial)
* `mod` (int2/int4/int8/numeric): [모듈로](https://clickhouse.com/docs/sql-reference/functions/arithmetic-functions#modulo)
* `pow` &amp; `power` (float8/numeric): [pow](https://clickhouse.com/docs/sql-reference/functions/math-functions#pow)
* `round`: [round](https://clickhouse.com/docs/sql-reference/functions/rounding-functions#round)
* `sin`, `cos`, `tan`, `atan`, `atan2`, `sinh`, `cosh`, `tanh`, `asinh`, `degrees`, `radians`, `pi`: 이름이 같은 [ClickHouse 수학 함수](https://clickhouse.com/docs/sql-reference/functions/math-functions)입니다.
  `asin`, `acos`, `atanh`, `acosh`는 푸시다운되지 않습니다. PG는 입력값이 범위를 벗어나면 오류를 발생시키지만, CH는 `NaN`을 반환합니다.
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
* `extract(field FROM source)`: `date_part`와 동일하게 매핑됩니다
* `date(timestamp)` &amp; `date(timestamptz)`: [toDate](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toDate)
  (CH 별칭 `date`로 표시됨)
* `array_position`: [indexOf](https://clickhouse.com/docs/sql-reference/functions/array-functions#indexOf)
* `array_cat`: [arrayConcat](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayConcat)
* `array_append`: [arrayPushBack](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayPushBack)
* `array_prepend`: [arrayPushFront](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayPushFront)
* `array_remove`: [arrayRemove](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayRemove)
* `array_length` &amp; `cardinality`: [length](https://clickhouse.com/docs/sql-reference/functions/array-functions#length)
* `array_to_string`: [arrayStringConcat](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayStringConcat)
* `string_to_array`: [splitByString](https://clickhouse.com/docs/sql-reference/functions/splitting-merging-functions#splitByString)
* `split_part`: [splitByString](https://clickhouse.com/docs/sql-reference/functions/splitting-merging-functions#splitByString) + 배열 인덱스
* `trim_array`: [arrayResize](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayResize)
* `array_fill`: [arrayWithConstant](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayWithConstant)
* `array_reverse`: [arrayReverse](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayReverse)
* `array_shuffle`: [arrayShuffle](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayShuffle)
* `array_sample`: [arrayRandomSample](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayRandomSample)
* `array_sort`: [arraySort](https://clickhouse.com/docs/sql-reference/functions/array-functions#arraySort) / [arrayReverseSort](https://clickhouse.com/docs/sql-reference/functions/array-functions#arrayReverseSort)
* `btrim`: [trimBoth](https://clickhouse.com/docs/sql-reference/functions/string-functions#trimboth)
* `ltrim`: [ltrim](https://clickhouse.com/docs/sql-reference/functions/string-functions#ltrim)
* `rtrim`: [rtrim](https://clickhouse.com/docs/sql-reference/functions/string-functions#rtrim)
* `concat_ws`: [concatWithSeparator](https://clickhouse.com/docs/sql-reference/functions/string-functions#concatwithseparator)
* `lower(text)`: [lowerUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#lowerutf8)
* `upper(text)`: [upperUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#upperutf8)
* `substring(text, ...)` &amp; `substr(text, ...)`: [substringUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#substringutf8)
* `substring(bytea, ...)` &amp; `substr(bytea, ...)`: [substring](https://clickhouse.com/docs/sql-reference/functions/string-functions#substring)
* `length(text)`: [lengthUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#lengthutf8)
* `length(bytea)` &amp; `octet_length`: [length](https://clickhouse.com/docs/sql-reference/functions/array-functions#length)
* `reverse(text)`: [reverseUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#reverseutf8)
* `reverse(bytea)`: [reverse](https://clickhouse.com/docs/sql-reference/functions/string-functions#reverse)
* `strpos`: [positionUTF8](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#positionutf8)
* `regexp_like`: [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `regexp_replace`: [replaceRegexpOne](https://clickhouse.com/docs/sql-reference/functions/string-replace-functions#replaceRegexpOne) 또는 `g` 플래그가 있으면 [replaceRegexpOne](https://clickhouse.com/docs/sql-reference/functions/string-replace-functions#replaceRegexpAll)
* `regexp_split_to_array`: [splitByRegexp](https://clickhouse.com/docs/sql-reference/functions/splitting-merging-functions#splitByRegexp)
* `md5`: [MD5](https://clickhouse.com/docs/sql-reference/functions/hash-functions#MD5)
* `json_extract_path_text`: [서브컬럼 구문](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `json_extract_path`: [toJSONString](https://clickhouse.com/docs/sql-reference/functions/json-functions#toJSONString) + [서브컬럼 구문](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `jsonb_extract_path_text`: [서브컬럼 구문](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `jsonb_extract_path`: [toJSONString](https://clickhouse.com/docs/sql-reference/functions/json-functions#toJSONString) + [서브컬럼 구문](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `bit_count(bytea)`: [bitCount](https://clickhouse.com/docs/sql-reference/functions/bit-functions#bitcount)
* `to_timestamp(float8)`: [fromUnixTimestamp](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#fromUnixTimestamp)
* `to_char(timestamp[tz], fmt)`: [formatDateTime](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#formatDateTime)
  `fmt`가 모든 키워드에 대해 ClickHouse에서 정확히 대응되는 값을 갖는 문자열 상수인 경우입니다.
  지원되는 키워드는 호환성 [참고 사항](#to_char)의 [to&#95;char()](#to_char)에서 확인하십시오. 그렇지 않으면 이 함수는
  PostgreSQL에서 로컬로 실행됩니다.
* `statement_timestamp`, `transaction_timestamp`, &amp; `clock_timestamp`:
  [nowInBlock64](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#nowInBlock64)
  (`nowInBlock64(9, $session_timezone)`)
* `CURRENT_DATE`:
  [now](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#now)와
  [toDate](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toDate)
  (`toDate(now($session_timezone))`)
* `now`, `CURRENT_TIMESTAMP`, &amp; `LOCALTIMESTAMP`:
  [now64](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#now64)
  (`now64(9, $session_timezone)`)
* `CURRENT_TIMESTAMP(n)` &amp; `LOCALTIMESTAMP(n)`:
  [now64](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#now64)
  (`now64(n, $session_timezone)`)
* `CURRENT_DATABASE`: PostgreSQL 함수의 값으로 전달됩니다.
* `CURRENT_SCHEMA`: PostgreSQL 함수의 값으로 전달됩니다.
* `CURRENT_CATALOG`: PostgreSQL 함수에서 값으로 전달됩니다.
* `CURRENT_USER`: PostgreSQL 함수의 값으로 전달됩니다.
* `USER`: PostgreSQL 함수에서 값으로 전달됩니다.
* `CURRENT_ROLE`: PostgreSQL 함수에서 값으로 전달됩니다.
* `SESSION_USER`: PostgreSQL 함수에서 값으로 전달됩니다.

### 푸시다운 연산자 \{#pushdown-operators\}

* 배열 슬라이스 (`arr[L:U]`): [arraySlice](https://clickhouse.com/docs/sql-reference/functions/array-functions#arraySlice)
* `@>` (배열 포함): [hasAll](https://clickhouse.com/docs/sql-reference/functions/array-functions#hasAll)
* `<@` (배열에 포함됨): [hasAll](https://clickhouse.com/docs/sql-reference/functions/array-functions#hasAll)
* `&&` (배열 겹침): [hasAny](https://clickhouse.com/docs/sql-reference/functions/array-functions#hasAny)
* `~` (정규식 일치): [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `!~` (정규식 불일치): [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `~*` (대소문자를 구분하지 않는 정규식 일치): [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `!~*` (대소문자를 구분하지 않는 정규식 불일치): [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `->>` (JSON/JSONB 요소를 텍스트로 추출): [서브컬럼 구문](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)
* `->` (JSON/JSONB 추출): [toJSONString](https://clickhouse.com/docs/sql-reference/functions/json-functions#toJSONString) + [서브컬럼 구문](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns)

### 사용자 정의 함수 \{#custom-functions\}

`pg_clickhouse`에서 만든 이러한 사용자 정의 함수는 PostgreSQL에 대응되는 기능이 없는 일부 ClickHouse 함수에 대해 외부 쿼리 푸시다운을 제공합니다. 이러한 함수 중 하나라도 푸시다운되지 않으면 예외를 발생시킵니다.

* [dictGet](https://clickhouse.com/docs/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)

### 확장 기능 푸시다운 \{#extension-pushdown\}

pg&#95;clickhouse는 일부 핵심 확장 기능과 타사 확장 기능에서 제공하는 함수를 인식하여, 이에 대응하는 ClickHouse 함수로 푸시다운합니다.

#### re2 \{#re2\}

모든 [re2 확장 기능] 함수는 ClickHouse에 1:1로 푸시다운됩니다:

* `re2match` → [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)
* `re2extract` → [extract](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#extract)
* `re2extractall` → [extractAll](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#extractAll)
* `re2regexpextract` → [regexpExtract](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#regexpExtract)
* `re2extractgroups` → [extractGroups](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#extractGroups)
* `re2replaceregexpone` → [replaceRegexpOne](https://clickhouse.com/docs/sql-reference/functions/string-replace-functions#replaceRegexpOne)
* `re2replaceregexpall` → [replaceRegexpAll](https://clickhouse.com/docs/sql-reference/functions/string-replace-functions#replaceRegexpAll)
* `re2countmatches` → [countMatches](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#countMatches)
* `re2countmatchescaseinsensitive` → [countMatchesCaseInsensitive](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#countMatchesCaseInsensitive)
* `re2multimatchany` → [multiMatchAny](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#multiMatchAny)
* `re2multimatchanyindex` → [multiMatchAnyIndex](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#multiMatchAnyIndex)
* `re2multimatchallindices` → [multiMatchAllIndices](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#multiMatchAllIndices)

#### intarray \{#intarray\}

[intarray] 함수 중 ClickHouse로 푸시다운되는 것은 다음 1개입니다:

* `idx` → [indexOf](https://clickhouse.com/docs/sql-reference/functions/array-functions#indexOf)

#### fuzzystrmatch \{#fuzzystrmatch\}

다음 2개의 [fuzzystrmatch] 함수는 ClickHouse로 푸시다운됩니다:

* `soundex`: [soundex](https://clickhouse.com/docs/sql-reference/functions/string-functions#soundex)
* `levenshtein` (2-arg): [editDistanceUTF8](https://clickhouse.com/docs/sql-reference/functions/string-functions#editDistanceUTF8)

### 푸시다운 캐스트 \{#pushdown-casts\}

pg&#95;clickhouse는 호환되는 데이터 타입(data type)에 대해 `CAST(x AS bigint)`와 같은 캐스트를 푸시다운합니다. 호환되지 않는 타입에서는 푸시다운이 실패합니다. 이 예시에서 `x`가 ClickHouse `UInt64`이면 ClickHouse는 해당 값의 캐스트를 거부합니다.

호환되지 않는 데이터 타입으로의 캐스트를 푸시다운할 수 있도록 pg&#95;clickhouse는 다음 함수를 제공합니다. 이 함수가 푸시다운되지 않으면 PostgreSQL에서 예외를 발생시킵니다.

* [toUInt8](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint8)
* [toUInt16](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint16)
* [toUInt32](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint32)
* [toUInt64](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint64)
* [toUInt128](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint128)

### 푸시다운 집계 함수 \{#pushdown-aggregates\}

다음 PostgreSQL 집계 함수는 ClickHouse로 푸시다운됩니다.

* [array&#95;agg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/grouparray)
* [avg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/avg)
* [bit&#95;and](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupbitand)
* [bit&#95;or](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupbitor)
* [bit&#95;xor](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupbitxor)
* [bool&#95;and / every](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupbitand)
* [bool&#95;or](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupbitor)
* [count](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/count)
* [min](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/min)
* [max](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/max)
* [string&#95;agg](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/groupconcat)
* [sum](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/sum)

### 사용자 정의 집계 함수 \{#custom-aggregates\}

`pg_clickhouse`에서 생성된 이러한 사용자 정의 집계 함수는 PostgreSQL에
대응하는 기능이 없는 일부 ClickHouse 집계 함수에 대해 외부 쿼리
푸시다운을 제공합니다. 이들 함수 중 하나라도 푸시다운할 수 없으면
예외를 발생시킵니다.

* [argMax](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/argmax)
* [argMin](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/argmin)
* [uniq](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqCombined64](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqHLL12](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqTheta](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqthetasketch)
* [분위수](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* [분위수Exact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantileexact)

### 푸시다운 정렬된 집합 집계 함수 \{#pushdown-ordered-set-aggregates\}

이러한 [정렬된 집합 집계 함수]는 *direct argument*를 매개변수로, `ORDER BY`
표현식을 인수로 전달하여 ClickHouse [매개변수화된 집계 함수]에 매핑됩니다.
예시로, 다음 PostgreSQL 쿼리를 보겠습니다:

```sql
SELECT percentile_cont(0.25) WITHIN GROUP (ORDER BY a) FROM t1;
```

다음 ClickHouse 쿼리에 해당합니다:

```sql
SELECT quantile(0.25)(a) FROM t1;
```

기본값이 아닌 `ORDER BY` 접미사 `DESC` 및 `NULLS FIRST`는
지원되지 않으며 오류가 발생합니다.

* `percentile_cont(double)`: [분위수](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantile(double)`: [분위수](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantileExact(double)`: [quantileExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantileexact)

### 푸시다운 윈도우 함수 \{#pushdown-window-functions\}

다음 PostgreSQL [윈도우 함수]는 해당하는 경우 프레임 지정(frame specification)을 포함한 `OVER
(PARTITION BY ... ORDER BY ...)` 절과 함께 ClickHouse로 푸시다운됩니다.

* [row&#95;number](https://clickhouse.com/docs/sql-reference/window-functions#row_number)
* [rank](https://clickhouse.com/docs/sql-reference/window-functions#rank)
* [dense&#95;rank](https://clickhouse.com/docs/sql-reference/window-functions#dense_rank)
* [ntile](https://clickhouse.com/docs/sql-reference/window-functions#ntile)
* [cume&#95;dist](https://clickhouse.com/docs/sql-reference/window-functions#cume_dist)
* [percent&#95;rank](https://clickhouse.com/docs/sql-reference/window-functions#percent_rank)
* [lead](https://clickhouse.com/docs/sql-reference/window-functions#lead)
* [lag](https://clickhouse.com/docs/sql-reference/window-functions#lag)
* [first&#95;value](https://clickhouse.com/docs/sql-reference/window-functions#first_value)
* [last&#95;value](https://clickhouse.com/docs/sql-reference/window-functions#last_value)
* [nth&#95;value](https://clickhouse.com/docs/sql-reference/window-functions#nth_value)
* `min` / `max` (`OVER` 절 포함)

순위 함수(`row_number`, `rank`, `dense_rank`, `ntile`, `cume_dist`,
`percent_rank`)는 ClickHouse에서 이러한 함수에 프레임 절을 허용하지 않으므로 푸시다운 시 프레임 절을 생략합니다.

## 호환성 참고사항 \{#compatibility-notes\}

### 정규 표현식 \{#regular-expressions\}

pg&#95;clickhouse는 [pg&#95;clickhouse.pushdown&#95;regex](#pg_clickhousepushdown_regex)가 true일 때(기본값) 정규 표현식을 ClickHouse의 동등한 표현식으로 푸시다운하며, 기본적인 수준의 호환성을 보장하기 위해 노력합니다. 다만 두 시스템의 차이점과 이를 pg&#95;clickhouse가 어떻게 처리하는지에 유의해야 합니다.

* PostgreSQL은 [POSIX Regular Expressions]를 지원하고 ClickHouse는
  [RE2 Regular Expressions][RE2]를 지원합니다. 동작 차이에 유의하십시오. 정규 표현식이 ClickHouse에서 평가되는 경우(예: `WHERE` 절)에는 RE2로 작성하고, Postgres에서 평가되는 경우(예: `SELECT` 절)에는 POSIX로 작성하십시오.

* pg&#95;clickhouse는 Postgres의 [Regex flags]를 ClickHouse 정규 표현식 앞의 `(?)` 안에 추가하는 방식으로 푸시다운합니다. 예시는 다음과 같습니다.

  ```sql
  regexp_like(val, '^VAL\d', 'i')
  ```

  다음과 같이 변환됩니다.

  ```sql
  match(val, concat('(?i-s)', '^VAL\\d'))
  ```

  `-s`가 포함된 점에 유의하십시오. 이는 ClickHouse에서 기본적으로 활성화되어 있는 `s`를 비활성화해 Postgres 정규 표현식의 동작과 맞추기 위한 것입니다.
  Postgres 함수 호출의 플래그에 `s`가 포함되어 있으면 pg&#95;clickhouse는 `-s`를 추가하지 않습니다. 안타깝게도 이 동작은 Postgres 24 이하의 일부 정규 표현식 호환성을 깨뜨립니다.

* 두 시스템 모두에서 지원되므로 ClickHouse에서 평가될 때 사용할 수 있는 플래그는 다음뿐입니다.

  * `i`: 대소문자를 구분하지 않음
  * `m`: 멀티라인 모드:
  * `s`: `.`이 `\n`과 일치하도록 함
  * `p`: 부분적인 줄바꿈 민감 매칭 (`s`와 동일하게 처리됨)
  * `t`: 엄격한 구문(기본값이며, pg&#95;clickhouse가 제거함)

  RE2는 이 플래그들만 지원합니다. 다른 [Postgres flags]는 사용하지 마십시오.

* 정규 표현식 함수에 그 밖의 플래그가 전달되면 해당 함수는 푸시다운되지 않습니다.

* 예외는 `regexp_replace()`이며, 이 함수는 `g` 플래그도 지원합니다. `g`가
  설정되면 pg&#95;clickhouse는 `replaceRegexpOne()` 대신
  `replaceRegexpAll()`을 사용하고, 다른 플래그를 앞에 추가하기 전에 `g` 플래그를 제거합니다.

* Postgres의 `regexp_replace()`에서 replacement 인수는 전체 일치를 가리키기 위해 `\&`를 지원하지만, ClickHouse에서는 전체 일치에 `\0`를 사용합니다. 함수가 ClickHouse로 푸시다운될 때는 반드시 `\0`를 사용하십시오.

모호함을 완전히 피하려면
[pg&#95;clickhouse.pushdown&#95;regex](#pg_clickhousepushdown_regex)를 설정하여
Postgres 정규 표현식이 ClickHouse로 푸시다운되지 않도록 하고,
pg&#95;clickhouse가 ClickHouse 호환 [RE2] 정규 표현식을 [직접 푸시다운](#re2)할 수 있도록 지원하는
[re2 확장 기능]을 사용하는 방안을 고려하십시오.

### `to_char()` \{#to_char\}

`timestamp` 및 `timestamp with time zone`에 대한 PostgreSQL [`to_char()`]는 포맷 인수가
non-NULL 문자열 상수이고, 그 안의 모든 PostgreSQL 키워드에
바이트 단위까지 완전히 동일한 ClickHouse 대응 항목이 있을 때에만 ClickHouse [formatDateTime]으로
푸시다운됩니다. 포맷이 동적이거나
(`Const`가 아님), 지원되지 않는 키워드나 수정자를 하나라도 포함하면
이 호출은 PostgreSQL에서 로컬로 평가됩니다 — 부분 번역으로는
푸시다운을 전혀 시도하지 않으므로 출력은 PG 호환성을 유지합니다.

`numeric`, `interval` 및 기타
timestamp가 아닌 타입에 대한 2개 인수 `to_char()` 형식은 푸시다운되지 않습니다. ClickHouse [formatDateTime]은
날짜-시간 값만 포맷합니다.

#### 번역된 키워드 \{#translated-keywords\}

| PostgreSQL                 | ClickHouse | 의미                    |
| -------------------------- | ---------- | --------------------- |
| `YYYY`, `yyyy`             | `%Y`       | 4자리 연도                |
| `YY`, `yy`                 | `%y`       | 2자리 연도                |
| `MM`, `mm`                 | `%m`       | 0으로 채운 월(01–12)       |
| `DD`, `dd`                 | `%d`       | 0으로 채운 일(01–31)       |
| `DDD`, `ddd`               | `%j`       | 0으로 채운 연중 날짜(001–366) |
| `HH24`, `hh24`             | `%H`       | 0으로 채운 24시간제 시(00–23) |
| `HH`, `hh`, `HH12`, `hh12` | `%I`       | 0으로 채운 12시간제 시(01–12) |
| `MI`, `mi`                 | `%i`       | 0으로 채운 분(00–59)       |
| `SS`, `ss`                 | `%S`       | 0으로 채운 초(00–59)       |
| `Q`, `q`                   | `%Q`       | 분기(1–4)               |
| `Mon`                      | `%b`       | 축약된 월 이름(예: `Oct`)    |
| `Dy`                       | `%a`       | 축약된 요일 이름(예: `Mon`)   |
| `AM`, `PM`                 | `%p`       | 오전/오후 표시, 항상 대문자      |

#### 인용된 텍스트와 리터럴 \{#quoted-text-and-literals\}

`"..."`로 감싼 텍스트는 있는 그대로 전달되며, 리터럴 `%`는 ClickHouse의 지정자 prefix를 이스케이프하기 위해 `%%`로 두 번 써야 합니다.
따옴표 바깥의 `\"`도 리터럴 `"`로 그대로 전달됩니다. `"..."` 내부에서는 백슬래시가 `"`만 이스케이프하고, 다른 백슬래시 시퀀스는 리터럴 텍스트로 처리됩니다.

## 저자 \{#authors\}

[David E. Wheeler](https://justatheory.com/)

## 저작권 \{#copyright\}

저작권 (c) 2025-2026, ClickHouse

[foreign data wrapper]: https://www.postgresql.org/docs/current/fdwhandler.html "PostgreSQL 문서: Foreign Data Wrapper 작성"

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse "Docker Hub의 최신 버전"

[ClickHouse]: https://clickhouse.com/clickhouse

[Semantic Versioning]: https://semver.org/spec/v2.0.0.html "시맨틱 버전 관리 2.0.0"

[`pg_get_loaded_modules()`]: https://pgpedia.info/g/pg_get_loaded_modules.html "pgPedia: pg_get_loaded_modules()"

[DDL]: https://en.wikipedia.org/wiki/Data_definition_language "Wikipedia: 데이터 정의 언어"

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

[DML]: https://en.wikipedia.org/wiki/Data_manipulation_language "Wikipedia: 데이터 조작 언어"

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

[shared library preloading]: https://www.postgresql.org/docs/current/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-PRELOAD "PostgreSQL 문서: 공유 라이브러리 사전 로드"

[정렬된 집합 집계 함수]: https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE

[매개변수화된 집계 함수]: https://clickhouse.com/docs/sql-reference/aggregate-functions/parametric-functions

[ClickHouse settings]: https://clickhouse.com/docs/operations/settings/settings "ClickHouse Docs: 세션 설정"

[dollar quoting]: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING "PostgreSQL Docs: 달러로 묶은 문자열 상수"

[PREPARE notes]: https://www.postgresql.org/docs/current/sql-prepare.html#SQL-PREPARE-NOTES "PostgreSQL Docs: PREPARE 참고 사항"

[query parameters]: https://clickhouse.com/docs/guides/developer/stored-procedures-and-prepared-statements#alternatives-to-prepared-statements-in-clickhouse "ClickHouse Docs: ClickHouse에서 prepared statement의 대안"

[underlying bug]: https://github.com/ClickHouse/ClickHouse/issues/85847 "ClickHouse/ClickHouse#85847 multipart form의 일부 쿼리에서 설정을 읽지 못하는 문제"

[fixed]: https://github.com/ClickHouse/ClickHouse/pull/85570 "ClickHouse/ClickHouse#85570 HTTP multipart 수정"

[BYTEA]: https://www.postgresql.org/docs/current/datatype-binary.html "PostgreSQL Docs: 바이너리 데이터 타입"

[GRANT]: https://www.postgresql.org/docs/current/sql-grant.html "PostgreSQL Docs: GRANT"

[String]: https://clickhouse.com/docs/sql-reference/data-types/string "ClickHouse Docs: String"

[TEXT]: https://www.postgresql.org/docs/current/datatype-character.html "PostgreSQL Docs: 문자 타입"

[window functions]: https://www.postgresql.org/docs/current/functions-window.html "PostgreSQL Docs: 윈도우 함수"

[POSIX Regular Expressions]: https://www.postgresql.org/docs/18/functions-matching.html#FUNCTIONS-POSIX-REGEXP "PostgreSQL Docs: POSIX 정규 표현식"

[Postgres flags]: https://www.postgresql.org/docs/18/functions-matching.html#POSIX-EMBEDDED-OPTIONS-TABLE "PostgreSQL Docs: ARE 내장 옵션 문자"

[RE2]: https://github.com/google/re2/wiki/Syntax "RE2 구문"

[re2 확장 기능]: https://github.com/ClickHouse/pg_re2 "pg_re2: RE2를 사용하는 ClickHouse 호환 정규식 함수"

[intarray]: https://www.postgresql.org/docs/current/intarray.html "PostgreSQL Docs: intarray"

[fuzzystrmatch]: https://www.postgresql.org/docs/current/fuzzystrmatch.html "PostgreSQL Docs: fuzzystrmatch"

[`to_char()`]: https://www.postgresql.org/docs/current/functions-formatting.html "PostgreSQL Docs: 데이터 타입 서식 함수"

[formatDateTime]: https://clickhouse.com/docs/sql-reference/functions/date-time-functions#formatDateTime "ClickHouse Docs: formatDateTime"