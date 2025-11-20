---
'description': '원격 PostgreSQL 서버에 저장된 데이터에 대해 `SELECT` 및 `INSERT` 쿼리를 수행할 수 있습니다.'
'sidebar_label': 'postgresql'
'sidebar_position': 160
'slug': '/sql-reference/table-functions/postgresql'
'title': 'postgresql'
'doc_type': 'reference'
---


# postgresql 테이블 함수

원격 PostgreSQL 서버에 저장된 데이터에 대해 `SELECT` 및 `INSERT` 쿼리를 수행할 수 있도록 합니다.

## 구문 {#syntax}

```sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

## 인수 {#arguments}

| 인수          | 설명                                                                   |
|---------------|------------------------------------------------------------------------|
| `host:port`   | PostgreSQL 서버 주소.                                                  |
| `database`    | 원격 데이터베이스 이름.                                             |
| `table`       | 원격 테이블 이름.                                                    |
| `user`        | PostgreSQL 사용자.                                                   |
| `password`    | 사용자 비밀번호.                                                    |
| `schema`      | 기본이 아닌 테이블 스키마. 선택사항.                                 |
| `on_conflict` | 충돌 해결 전략. 예: `ON CONFLICT DO NOTHING`. 선택사항.               |

인수는 [명명된 컬렉션](operations/named-collections.md)을 사용하여 전달할 수도 있습니다. 이 경우 `host`와 `port`는 별도로 지정해야 합니다. 이 접근 방식은 프로덕션 환경에서 권장됩니다.

## 반환 값 {#returned_value}

원본 PostgreSQL 테이블과 동일한 컬럼을 가진 테이블 객체입니다.

:::note
`INSERT` 쿼리에서 테이블 함수 `postgresql(...)`를 컬럼 이름 목록을 가진 테이블 이름과 구별하려면 `FUNCTION` 또는 `TABLE FUNCTION` 키워드를 사용해야 합니다. 아래의 예시를 참조하세요.
:::

## 구현 세부사항 {#implementation-details}

PostgreSQL 측의 `SELECT` 쿼리는 읽기 전용 PostgreSQL 트랜잭션 내에서 `COPY (SELECT ...) TO STDOUT`로 실행되며 각 `SELECT` 쿼리 뒤에 커밋이 이루어집니다.

`=`, `!=`, `>`, `>=`, `<`, `<=`, `IN`과 같은 간단한 `WHERE` 절은 PostgreSQL 서버에서 실행됩니다.

모든 조인, 집계, 정렬, `IN [ array ]` 조건 및 `LIMIT` 샘플링 제약은 쿼리가 PostgreSQL에서 완료된 후에만 ClickHouse에서 실행됩니다.

PostgreSQL 측의 `INSERT` 쿼리는 PostgreSQL 트랜잭션 내에서 `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN`로 실행되며 각 `INSERT` 문 뒤에 자동 커밋이 이루어집니다.

PostgreSQL 배열 유형은 ClickHouse 배열로 변환됩니다.

:::note
주의: PostgreSQL에서 Integer[]와 같은 배열 데이터 유형의 컬럼은 서로 다른 행에서 서로 다른 차원의 배열을 포함할 수 있지만, ClickHouse에서는 모든 행에서 동일한 차원의 다차원 배열만 허용됩니다.
:::

`|`로 나열해야 하는 여러 복제본을 지원합니다. 예를 들어:

```sql
SELECT name FROM postgresql(`postgres{1|2|3}:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

또는

```sql
SELECT name FROM postgresql(`postgres1:5431|postgres2:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

PostgreSQL 딕셔너리 소스에 대한 복제본 우선 순위를 지원합니다. 맵에서 숫자가 클수록 우선 순위가 낮아집니다. 가장 높은 우선 순위는 `0`입니다.

## 예제 {#examples}

PostgreSQL의 테이블:

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

일반 인수를 사용하여 ClickHouse에서 데이터 선택하기:

```sql
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password') WHERE str IN ('test');
```

또는 [명명된 컬렉션](operations/named-collections.md)을 사용하기:

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

기본이 아닌 스키마 사용하기:

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```

## 관련 {#related}

- [PostgreSQL 테이블 엔진](../../engines/table-engines/integrations/postgresql.md)
- [PostgreSQL을 딕셔너리 소스로 사용하기](/sql-reference/dictionaries#postgresql)

### PostgreSQL 데이터를 PeerDB로 복제하거나 마이그레이션하기 {#replicating-or-migrating-postgres-data-with-with-peerdb}

> 테이블 함수 외에도 ClickHouse의 [PeerDB](https://docs.peerdb.io/introduction)를 사용하여 Postgres에서 ClickHouse로의 지속적인 데이터 파이프라인을 설정할 수 있습니다. PeerDB는 변경 데이터 캡처(CDC)를 사용하여 Postgres에서 ClickHouse로 데이터를 복제하기 위해 특별히 설계된 도구입니다.
