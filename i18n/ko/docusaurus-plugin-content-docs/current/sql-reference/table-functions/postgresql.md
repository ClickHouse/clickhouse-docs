---
description: '원격 PostgreSQL 서버에 저장된 데이터에 대해 `SELECT` 및 `INSERT` 쿼리를 수행할 수 있게 합니다.'
sidebar_label: 'postgresql'
sidebar_position: 160
slug: /sql-reference/table-functions/postgresql
title: 'postgresql'
doc_type: 'reference'
---

# postgresql Table Function \{#postgresql-table-function\}

원격 PostgreSQL 서버에 저장된 데이터에 대해 `SELECT` 및 `INSERT` 쿼리를 수행할 수 있습니다.

## 구문 \{#syntax\}

```sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```


## Arguments \{#arguments\}

| Argument      | Description                                                                |
|---------------|----------------------------------------------------------------------------|
| `host:port`   | PostgreSQL 서버 주소.                                                      |
| `database`    | 원격 데이터베이스 이름.                                                    |
| `table`       | 원격 테이블 이름.                                                          |
| `user`        | PostgreSQL 사용자.                                                         |
| `password`    | 사용자 비밀번호.                                                           |
| `schema`      | 기본 스키마가 아닌 테이블 스키마. 선택 사항입니다.                        |
| `on_conflict` | 충돌 해결 전략. 예: `ON CONFLICT DO NOTHING`. 선택 사항입니다.            |

인수는 [named collections](operations/named-collections.md)을 사용하여 전달할 수도 있습니다. 이 경우 `host`와 `port`는 개별적으로 지정해야 합니다. 이 방식은 프로덕션 환경에서 사용하는 것을 권장합니다.

## 반환 값 \{#returned_value\}

원본 PostgreSQL 테이블과 동일한 컬럼을 가진 테이블 객체입니다.

:::note
`INSERT` 쿼리에서 테이블 함수 `postgresql(...)`와 컬럼 이름 목록이 포함된 테이블 이름을 구분하려면 `FUNCTION` 또는 `TABLE FUNCTION` 키워드를 사용해야 합니다. 아래 예제를 참고하십시오.
:::

## 구현 세부사항 \{#implementation-details\}

PostgreSQL 측의 `SELECT` 쿼리는 읽기 전용 PostgreSQL 트랜잭션 내부에서 `COPY (SELECT ...) TO STDOUT` 형태로 실행되며, 각 `SELECT` 쿼리 후에 커밋이 수행됩니다.

`=`, `!=`, `>`, `>=`, `<`, `<=`, `IN`과 같은 단순 `WHERE` 절은 PostgreSQL 서버에서 실행됩니다.

모든 조인, 집계, 정렬, `IN [ array ]` 조건과 `LIMIT` 기반 샘플링 제약은 PostgreSQL에 대한 쿼리가 완료된 이후에만 ClickHouse에서 실행됩니다.

PostgreSQL 측의 `INSERT` 쿼리는 PostgreSQL 트랜잭션 내부에서 `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` 형태로 실행되며, 각 `INSERT` 구문 후에 자동 커밋이 이루어집니다.

PostgreSQL Array 타입은 ClickHouse 배열로 변환됩니다.

:::note
주의하십시오. PostgreSQL에서는 `Integer[]`와 같은 배열 데이터 타입 컬럼에 행마다 서로 다른 차원의 배열이 포함될 수 있지만, ClickHouse에서는 모든 행에서 동일한 차원의 다차원 배열만 허용됩니다.
:::

`|`로 나열해야 하는 여러 레플리카를 지원합니다. 예를 들어:

```sql
SELECT name FROM postgresql(`postgres{1|2|3}:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

또는

```sql
SELECT name FROM postgresql(`postgres1:5431|postgres2:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

PostgreSQL 딕셔너리 소스에서 레플리카 우선순위를 지원합니다. 맵에서 숫자가 클수록 레플리카의 우선순위가 낮아집니다. 가장 높은 우선순위는 `0`입니다.


## 예시 \{#examples\}

PostgreSQL의 테이블 예:

```text
postgres=# CREATE TABLE "public"."test" (
"int_id" SERIAL,
"int_nullable" INT NULL DEFAULT NULL,
"float" FLOAT NOT NULL,
"str" VARCHAR(100) NOT NULL DEFAULT '',
"float_nullable" FLOAT NULL DEFAULT NULL,
PRIMARY KEY (int_id));

CREATE TABLE

postgres=# INSERT INTO test (int_id, str, "float") VALUES (1,'test',2);
INSERT 0 1

postgresql> SELECT * FROM test;
  int_id | int_nullable | float | str  | float_nullable
 --------+--------------+-------+------+----------------
       1 |              |     2 | test |
(1 row)
```

일반 인수를 사용하여 ClickHouse에서 데이터 조회:

```sql
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password') WHERE str IN ('test');
```

또는 [named collections](operations/named-collections.md)을 사용할 수 있습니다:

```sql
CREATE NAMED COLLECTION mypg AS
        host = 'localhost',
        port = 5432,
        database = 'test',
        user = 'postgresql_user',
        password = 'password';
SELECT * FROM postgresql(mypg, table='test') WHERE str IN ('test');
```

```text
┌─int_id─┬─int_nullable─┬─float─┬─str──┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │ test │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴──────┴────────────────┘
```

데이터 삽입:

```sql
INSERT INTO TABLE FUNCTION postgresql('localhost:5432', 'test', 'test', 'postgrsql_user', 'password') (int_id, float) VALUES (2, 3);
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password');
```

```text
┌─int_id─┬─int_nullable─┬─float─┬─str──┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │ test │           ᴺᵁᴸᴸ │
│      2 │         ᴺᵁᴸᴸ │     3 │      │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴──────┴────────────────┘
```

기본 스키마가 아닌 스키마 사용:

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```


## 관련 항목 \{#related\}

- [The PostgreSQL table engine](../../engines/table-engines/integrations/postgresql.md)
- [Using PostgreSQL as a dictionary source](/sql-reference/statements/create/dictionary/sources#postgresql)

### PeerDB를 사용한 Postgres 데이터 복제 또는 마이그레이션 \{#replicating-or-migrating-postgres-data-with-with-peerdb\}

> 테이블 함수 외에도 ClickHouse의 [PeerDB](https://docs.peerdb.io/introduction)를 사용하여 Postgres에서 ClickHouse로 데이터를 지속적으로 전송하는 파이프라인을 구성할 수 있습니다. PeerDB는 변경 데이터 캡처(Change Data Capture, CDC)를 사용해 Postgres 데이터를 ClickHouse로 복제하는 데 특화된 도구입니다.