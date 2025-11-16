---
'description': 'PostgreSQL 엔진은 원격 PostgreSQL 서버에 저장된 데이터에 대해 `SELECT` 및 `INSERT` 쿼리를
  허용합니다.'
'sidebar_label': 'PostgreSQL'
'sidebar_position': 160
'slug': '/engines/table-engines/integrations/postgresql'
'title': 'PostgreSQL 테이블 엔진'
'doc_type': 'guide'
---


# PostgreSQL 테이블 엔진

PostgreSQL 엔진은 원격 PostgreSQL 서버에 저장된 데이터에 대해 `SELECT` 및 `INSERT` 쿼리를 허용합니다.

:::note
현재 지원되는 PostgreSQL 버전은 12 이상입니다.
:::

:::tip
ClickHouse Cloud 사용자는 [ClickPipes](/integrations/clickpipes)를 사용하여 Postgres 데이터를 ClickHouse로 스트리밍하는 것이 좋습니다. 이는 높은 성능의 삽입을 본래 지원하며, 독립적으로 섭취 및 클러스터 리소스를 확장할 수 있는 능력을 통해 관심사의 분리를 보장합니다.
:::

## 테이블 생성하기 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 type1 [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 type2 [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = PostgreSQL({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

[CREATE TABLE](/sql-reference/statements/create/table) 쿼리에 대한 자세한 설명을 참조하십시오.

테이블 구조는 원래 PostgreSQL 테이블 구조와 다를 수 있습니다:

- 컬럼 이름은 원래 PostgreSQL 테이블과 동일해야 하지만, 이 컬럼 중 일부만 사용하고 임의의 순서로 사용할 수 있습니다.
- 컬럼 타입은 원래 PostgreSQL 테이블의 것과 다를 수 있습니다. ClickHouse는 값이 ClickHouse 데이터 타입으로 [캐스팅](../../../engines/database-engines/postgresql.md#data_types-support)되도록 시도합니다.
- [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls) 설정은 Nullable 컬럼을 처리하는 방법을 정의합니다. 기본값: 1. 만약 0이면, 테이블 함수는 Nullable 컬럼을 만들지 않고 null 대신 기본값을 삽입합니다. 이는 배열 내 NULL 값에도 적용됩니다.

**엔진 매개변수**

- `host:port` — PostgreSQL 서버 주소.
- `database` — 원격 데이터베이스 이름.
- `table` — 원격 테이블 이름.
- `user` — PostgreSQL 사용자.
- `password` — 사용자 비밀번호.
- `schema` — 기본 설정이 아닌 테이블 스키마. 선택 사항.
- `on_conflict` — 충돌 해결 전략. 예: `ON CONFLICT DO NOTHING`. 선택 사항. 참고: 이 옵션을 추가하면 삽입 효율성이 떨어집니다.

[명명된 컬렉션](/operations/named-collections.md) (버전 21.11부터 사용 가능)는 프로덕션 환경에서 권장됩니다. 여기에 대한 예는 다음과 같습니다:

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

일부 매개변수는 키 값 인수를 통해 재정의될 수 있습니다:
```sql
SELECT * FROM postgresql(postgres_creds, table='table1');
```

## 구현 세부사항 {#implementation-details}

PostgreSQL 쪽에서의 `SELECT` 쿼리는 `COPY (SELECT ...) TO STDOUT` 형식으로 실행되며, 각 `SELECT` 쿼리 이후에 커밋되는 읽기 전용 PostgreSQL 트랜잭션 내에서 수행됩니다.

`=`, `!=`, `>`, `>=`, `<`, `<=`, 및 `IN`과 같은 간단한 `WHERE` 절은 PostgreSQL 서버에서 실행됩니다.

모든 조인, 집계, 정렬, `IN [ array ]` 조건 및 `LIMIT` 샘플링 제약은 쿼리가 PostgreSQL에서 완료된 후에만 ClickHouse에서 실행됩니다.

PostgreSQL 쪽에서의 `INSERT` 쿼리는 `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` 형식으로 실행되며, 각 `INSERT` 문 이후에 자동 커밋되는 PostgreSQL 트랜잭션 내에서 수행됩니다.

PostgreSQL `Array` 타입은 ClickHouse 배열로 변환됩니다.

:::note
주의하세요 - PostgreSQL에서 `type_name[]` 형식으로 생성된 배열 데이터는 동일한 컬럼의 서로 다른 테이블 행에서 서로 다른 차원의 다차원 배열을 포함할 수 있습니다. 그러나 ClickHouse에서는 동일한 컬럼의 모든 테이블 행에서 동일한 차원의 다차원 배열만 허용됩니다.
:::

여러 복제본을 지원하며 `|`로 나열해야 합니다. 예를 들어:

```sql
CREATE TABLE test_replicas (id UInt32, name String) ENGINE = PostgreSQL(`postgres{2|3|4}:5432`, 'clickhouse', 'test_replicas', 'postgres', 'mysecretpassword');
```

PostgreSQL 딕셔너리 소스의 복제본 우선순위가 지원됩니다. 맵에서 숫자가 클수록 우선순위가 낮아집니다. 가장 높은 우선순위는 `0`입니다.

다음 예제에서 복제본 `example01-1`은 가장 높은 우선순위를 갖습니다:

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

## 사용 예제 {#usage-example}

### PostgreSQL의 테이블 {#table-in-postgresql}

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

### ClickHouse에서 테이블 생성 및 위에서 생성한 PostgreSQL 테이블과 연결하기 {#creating-table-in-clickhouse-and-connecting-to--postgresql-table-created-above}

이 예제는 [PostgreSQL 테이블 엔진](/engines/table-engines/integrations/postgresql.md)을 사용하여 ClickHouse 테이블을 PostgreSQL 테이블에 연결하고 PostgreSQL 데이터베이스에 대한 SELECT 및 INSERT 문을 모두 사용합니다:

```sql
CREATE TABLE default.postgresql_table
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = PostgreSQL('localhost:5432', 'public', 'test', 'postgres_user', 'postgres_password');
```

### SELECT 쿼리를 사용하여 PostgreSQL 테이블에서 ClickHouse 테이블로 초기 데이터 삽입하기 {#inserting-initial-data-from-postgresql-table-into-clickhouse-table-using-a-select-query}

[postgresql 테이블 함수](/sql-reference/table-functions/postgresql.md)는 PostgreSQL에서 ClickHouse로 데이터를 복사하며, 이는 PostgreSQL이 아닌 ClickHouse에서 데이터를 쿼리하거나 분석하여 쿼리 성능을 향상시키는 데 자주 사용되며, PostgreSQL에서 ClickHouse로 데이터를 마이그레이션하는 데에도 사용될 수 있습니다. PostgreSQL에서 ClickHouse로 데이터를 복사할 것이므로, ClickHouse에서 MergeTree 테이블 엔진을 사용하고 이를 postgresql_copy라고 부릅시다:

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

### PostgreSQL 테이블에서 ClickHouse 테이블로 점진적 데이터 삽입하기 {#inserting-incremental-data-from-postgresql-table-into-clickhouse-table}

그런 다음 초기 삽입 후 PostgreSQL 테이블과 ClickHouse 테이블 간의 지속적인 동기화를 수행하려면, ClickHouse에서 `WHERE` 절을 사용하여 타임스탬프 또는 고유 시퀀스 ID를 기준으로 PostgreSQL에 추가된 데이터만 삽입할 수 있습니다.

이를 위해서는 이전에 추가된 최대 ID 또는 타임스탬프를 추적해야 합니다, 예를 들어:

```sql
SELECT max(`int_id`) AS maxIntID FROM default.postgresql_copy;
```

그런 다음 최대값보다 큰 PostgreSQL 테이블의 값을 삽입합니다.

```sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
WHERE int_id > maxIntID;
```

### 결과 ClickHouse 테이블에서 데이터 선택하기 {#selecting-data-from-the-resulting-clickhouse-table}

```sql
SELECT * FROM postgresql_copy WHERE str IN ('test');
```

```text
┌─float_nullable─┬─str──┬─int_id─┐
│           ᴺᵁᴸᴸ │ test │      1 │
└────────────────┴──────┴────────┘
```

### 기본 설정이 아닌 스키마 사용하기 {#using-non-default-schema}

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```

**참조**

- [postgresql 테이블 함수](../../../sql-reference/table-functions/postgresql.md)
- [PostgreSQL를 딕셔너리 소스로 사용하기](/sql-reference/dictionaries#mysql)

## 관련 콘텐츠 {#related-content}

- 블로그: [ClickHouse와 PostgreSQL - 데이터 천국에서의 매칭 - 1부](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- 블로그: [ClickHouse와 PostgreSQL - 데이터 천국에서의 매칭 - 2부](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
