---
description: 'PostgreSQL 테이블 엔진은 원격 PostgreSQL 서버에 저장된 데이터에 대해 `SELECT` 및 `INSERT` 쿼리를 허용합니다.'
sidebar_label: 'PostgreSQL'
sidebar_position: 160
slug: /engines/table-engines/integrations/postgresql
title: 'PostgreSQL 테이블 엔진'
doc_type: 'guide'
---

# PostgreSQL 테이블 엔진 \{#postgresql-table-engine\}

PostgreSQL 엔진을 사용하면 원격 PostgreSQL 서버에 저장된 데이터에 대해 `SELECT` 및 `INSERT` 쿼리를 실행할 수 있습니다.

:::note
현재 테이블 엔진은 PostgreSQL 12 이상 버전만 지원합니다.
:::

:::tip
[Managed Postgres](/docs/cloud/managed-postgres) 서비스를 확인하십시오. 컴퓨트와 물리적으로 인접한 NVMe 스토리지를 기반으로 하여, EBS와 같은 네트워크 연결 스토리지를 사용하는 대안에 비해 디스크 I/O에 병목이 있는 워크로드에서 최대 10배 빠른 성능을 제공하며, Postgres CDC 커넥터가 포함된 ClickPipes를 사용해 Postgres 데이터를 ClickHouse로 복제할 수 있습니다.
:::

## 테이블 생성 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 type1 [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 type2 [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = PostgreSQL({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

[CREATE TABLE](/sql-reference/statements/create/table) 쿼리에 대한 자세한 설명을 참고하십시오.

테이블 구조는 원본 PostgreSQL 테이블 구조와 다를 수 있습니다:

* 컬럼 이름은 원본 PostgreSQL 테이블과 동일해야 하지만, 이들 컬럼 중 일부만 사용할 수도 있으며 순서는 임의로 지정할 수 있습니다.
* 컬럼 타입은 원본 PostgreSQL 테이블의 타입과 다를 수 있습니다. ClickHouse는 값을 ClickHouse 데이터 타입으로 [캐스팅](../../../engines/database-engines/postgresql.md#data_types-support)하려고 시도합니다.
* [external&#95;table&#95;functions&#95;use&#95;nulls](/operations/settings/settings#external_table_functions_use_nulls) SETTING은 널 허용(Nullable) 컬럼을 어떻게 처리할지 정의합니다. 기본값: 1. 값이 0이면, 테이블 함수는 널 허용 컬럼을 생성하지 않고 null 대신 기본값을 삽입합니다. 이는 배열 내부의 NULL 값에도 적용됩니다.

**Engine 매개변수**

* `host:port` — PostgreSQL 서버 주소.
* `database` — 원격 데이터베이스 이름.
* `table` — 원격 테이블 이름.
* `user` — PostgreSQL 사용자.
* `password` — 사용자 비밀번호.
* `schema` — 기본 스키마가 아닌 테이블 스키마. 선택 사항입니다.
* `on_conflict` — 충돌 해결 전략. 예: `ON CONFLICT DO NOTHING`. 선택 사항입니다. 참고: 이 옵션을 추가하면 쓰기(삽입) 효율이 떨어집니다.

[Named collections](/operations/named-collections.md) (버전 21.11부터 사용 가능)은 운영 환경에서 사용하는 것을 권장합니다. 예시는 다음과 같습니다:

```xml
<named_collections>
    <postgres_creds>
        <host>localhost</host>
        <port>5432</port>
        <user>postgres</user>
        <password>****</password>
        <schema>schema1</schema>
    </postgres_creds>
</named_collections>
```

일부 매개변수는 키-값 형식의 인자로 재정의할 수 있습니다:

```sql
SELECT * FROM postgresql(postgres_creds, table='table1');
```


## 구현 세부 사항 \{#implementation-details\}

PostgreSQL 측의 `SELECT` 쿼리는 읽기 전용 PostgreSQL 트랜잭션 내부에서 `COPY (SELECT ...) TO STDOUT` 형태로 실행되며, 각 `SELECT` 쿼리 이후에 커밋이 수행됩니다.

`=`, `!=`, `>`, `>=`, `<`, `<=`, `IN` 과 같은 단순한 `WHERE` 절은 PostgreSQL 서버에서 실행됩니다.

모든 조인, 집계, 정렬, `IN [ array ]` 조건 및 `LIMIT` 샘플링 제한은 PostgreSQL에 대한 쿼리가 완료된 이후에만 ClickHouse에서 실행됩니다.

PostgreSQL 측의 `INSERT` 쿼리는 PostgreSQL 트랜잭션 내부에서 `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` 형태로 실행되며, 각 `INSERT` 구문 이후에 자동 커밋됩니다.

PostgreSQL `Array` 타입은 ClickHouse 배열로 변환됩니다.

:::note
주의가 필요합니다. PostgreSQL에서는 `type_name[]` 형태로 생성된 배열 데이터가 동일한 컬럼의 서로 다른 행에서 서로 다른 차원의 다차원 배열을 포함할 수 있습니다. 그러나 ClickHouse에서는 동일한 컬럼의 모든 행에서 차원 수가 같은 다차원 배열만 허용됩니다.
:::

`|` 로 구분하여 여러 레플리카를 지정하는 것을 지원합니다. 예를 들어:

```sql
CREATE TABLE test_replicas (id UInt32, name String) ENGINE = PostgreSQL(`postgres{2|3|4}:5432`, 'clickhouse', 'test_replicas', 'postgres', 'mysecretpassword');
```

PostgreSQL 딕셔너리 소스에 대해 레플리카 우선순위가 지원됩니다. 맵에서 숫자가 클수록 우선순위가 낮아집니다. 가장 높은 우선순위는 `0`입니다.

아래 예시에서 레플리카 `example01-1`이 가장 높은 우선순위를 가집니다.

```xml
<postgresql>
    <port>5432</port>
    <user>clickhouse</user>
    <password>qwerty</password>
    <replica>
        <host>example01-1</host>
        <priority>1</priority>
    </replica>
    <replica>
        <host>example01-2</host>
        <priority>2</priority>
    </replica>
    <db>db_name</db>
    <table>table_name</table>
    <where>id=10</where>
    <invalidate_query>SQL_QUERY</invalidate_query>
</postgresql>
</source>
```


## 사용 예제 \{#usage-example\}

### PostgreSQL 테이블 \{#table-in-postgresql\}

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


### ClickHouse에서 테이블을 생성하고, 위에서 생성한 PostgreSQL 테이블에 연결하기 \{#creating-table-in-clickhouse-and-connecting-to--postgresql-table-created-above\}

이 예제에서는 [PostgreSQL table engine](/engines/table-engines/integrations/postgresql.md)을 사용하여 ClickHouse 테이블을 PostgreSQL 테이블에 연결하고, PostgreSQL 데이터베이스에 대해 `SELECT` 및 `INSERT` SQL 문을 모두 사용합니다.

```sql
CREATE TABLE default.postgresql_table
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = PostgreSQL('localhost:5432', 'public', 'test', 'postgres_user', 'postgres_password');
```


### SELECT 쿼리를 사용하여 PostgreSQL 테이블의 초기 데이터를 ClickHouse 테이블에 삽입하기 \{#inserting-initial-data-from-postgresql-table-into-clickhouse-table-using-a-select-query\}

[postgresql table function](/sql-reference/table-functions/postgresql.md)은 PostgreSQL의 데이터를 ClickHouse로 복사합니다. 이 함수는 데이터를 PostgreSQL이 아니라 ClickHouse에서 조회하거나 분석을 수행함으로써 쿼리 성능을 향상하기 위해 주로 사용되며, PostgreSQL에서 ClickHouse로 데이터를 마이그레이션하는 데에도 사용할 수 있습니다. 이번 예제에서는 PostgreSQL에서 ClickHouse로 데이터를 복사하므로, ClickHouse에서는 MergeTree 테이블 엔진을 사용하고 테이블 이름을 postgresql&#95;copy로 지정합니다:

```sql
CREATE TABLE default.postgresql_copy
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = MergeTree
ORDER BY (int_id);
```

```sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postgres_user', 'postgres_password');
```


### PostgreSQL 테이블에서 ClickHouse 테이블로 증분 데이터 삽입 \{#inserting-incremental-data-from-postgresql-table-into-clickhouse-table\}

초기 삽입 이후 PostgreSQL 테이블과 ClickHouse 테이블 간에 지속적으로 동기화를 수행하는 경우, ClickHouse에서 `WHERE` 절을 사용하여 타임스탬프나 고유 시퀀스 ID를 기준으로 PostgreSQL에 새로 추가된 데이터만 삽입할 수 있습니다.

이를 위해 이전까지 삽입된 최대 ID 또는 타임스탬프를 다음과 같이 추적해야 합니다.

```sql
SELECT max(`int_id`) AS maxIntID FROM default.postgresql_copy;
```

그런 다음 PostgreSQL 테이블에서 최대값보다 큰 값을 삽입합니다

```sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
WHERE int_id > maxIntID;
```


### 결과로 생성된 ClickHouse 테이블에서 데이터 조회하기 \{#selecting-data-from-the-resulting-clickhouse-table\}

```sql
SELECT * FROM postgresql_copy WHERE str IN ('test');
```

```text
┌─float_nullable─┬─str──┬─int_id─┐
│           ᴺᵁᴸᴸ │ test │      1 │
└────────────────┴──────┴────────┘
```


### 기본이 아닌 스키마 사용 \{#using-non-default-schema\}

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```

**함께 보기**

* [`postgresql` 테이블 함수](../../../sql-reference/table-functions/postgresql.md)
* [PostgreSQL을 딕셔너리 소스로 사용하기](/sql-reference/statements/create/dictionary/sources/postgresql)


## 관련 콘텐츠 \{#related-content\}

- 블로그: [ClickHouse and PostgreSQL - a match made in data heaven - part 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- 블로그: [ClickHouse and PostgreSQL - a Match Made in Data Heaven - part 2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)