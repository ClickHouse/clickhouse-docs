---
'description': 'MySQL 테이블 엔진에 대한 Documentation'
'sidebar_label': 'MySQL'
'sidebar_position': 138
'slug': '/engines/table-engines/integrations/mysql'
'title': 'MySQL 테이블 엔진'
'doc_type': 'reference'
---


# MySQL 테이블 엔진

MySQL 엔진을 사용하면 원격 MySQL 서버에 저장된 데이터에 대해 `SELECT` 및 `INSERT` 쿼리를 수행할 수 있습니다.

## 테이블 만들기 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = MySQL({host:port, database, table, user, password[, replace_query, on_duplicate_clause] | named_collection[, option=value [,..]]})
SETTINGS
    [ connection_pool_size=16, ]
    [ connection_max_tries=3, ]
    [ connection_wait_timeout=5, ]
    [ connection_auto_close=true, ]
    [ connect_timeout=10, ]
    [ read_write_timeout=300 ]
;
```

[CREATE TABLE](/sql-reference/statements/create/table) 쿼리에 대한 자세한 설명을 참조하십시오.

테이블 구조는 원래 MySQL 테이블 구조와 다를 수 있습니다:

- 컬럼 이름은 원래 MySQL 테이블과 동일해야 하지만 이러한 컬럼 중 일부만 사용할 수 있으며 순서도 상관 없습니다.
- 컬럼 타입은 원래 MySQL 테이블의 타입과 다를 수 있습니다. ClickHouse는 [캐스팅](../../../engines/database-engines/mysql.md#data_types-support)하여 ClickHouse 데이터 타입으로 값을 변환하려고 시도합니다.
- [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls) 설정은 Nullable 컬럼을 처리하는 방법을 정의합니다. 기본값: 1. 0인 경우, 테이블 함수는 Nullable 컬럼을 만들지 않으며 null 대신 기본값을 삽입합니다. 이는 배열 내부의 NULL 값에도 적용됩니다.

**엔진 매개변수**

- `host:port` — MySQL 서버 주소.
- `database` — 원격 데이터베이스 이름.
- `table` — 원격 테이블 이름.
- `user` — MySQL 사용자.
- `password` — 사용자 비밀번호.
- `replace_query` — `INSERT INTO` 쿼리를 `REPLACE INTO`로 변환하는 플래그입니다. `replace_query=1`인 경우 쿼리가 대체됩니다.
- `on_duplicate_clause` — `INSERT` 쿼리에 추가되는 `ON DUPLICATE KEY on_duplicate_clause` 표현식입니다.
    예: `INSERT INTO t (c1,c2) VALUES ('a', 2) ON DUPLICATE KEY UPDATE c2 = c2 + 1`, 여기서 `on_duplicate_clause`는 `UPDATE c2 = c2 + 1`입니다. `ON DUPLICATE KEY` 절과 함께 사용할 수 있는 `on_duplicate_clause`를 찾으려면 [MySQL 문서](https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html)를 참조하십시오.
    `on_duplicate_clause`를 지정하려면 `replace_query` 매개변수에 `0`을 전달해야 합니다. `replace_query = 1`과 `on_duplicate_clause`를 동시에 전달하면 ClickHouse는 예외를 발생시킵니다.

인자는 [named collections](/operations/named-collections.md)을 사용하여 전달할 수도 있습니다. 이 경우 `host`와 `port`는 별도로 지정해야 합니다. 이 접근 방식은 프로덕션 환경에 권장됩니다.

`=, !=, >, >=, <, <=` 같은 간단한 `WHERE` 절은 MySQL 서버에서 실행됩니다.

나머지 조건과 `LIMIT` 샘플링 제약 조건은 MySQL 쿼리가 끝난 후 ClickHouse에서만 실행됩니다.

복제본이 여러 개 있는 경우 `|`로 나열해야 합니다. 예를 들어:

```sql
CREATE TABLE test_replicas (id UInt32, name String, age UInt32, money UInt32) ENGINE = MySQL(`mysql{2|3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

## 사용 예시 {#usage-example}

MySQL에서 테이블 만들기:

```text
mysql> CREATE TABLE `test`.`test` (
    ->   `int_id` INT NOT NULL AUTO_INCREMENT,
    ->   `int_nullable` INT NULL DEFAULT NULL,
    ->   `float` FLOAT NOT NULL,
    ->   `float_nullable` FLOAT NULL DEFAULT NULL,
    ->   PRIMARY KEY (`int_id`));
Query OK, 0 rows affected (0,09 sec)

mysql> insert into test (`int_id`, `float`) VALUES (1,2);
Query OK, 1 row affected (0,00 sec)

mysql> select * from test;
+------+----------+-----+----------+
| int_id | int_nullable | float | float_nullable |
+------+----------+-----+----------+
|      1 |         NULL |     2 |           NULL |
+------+----------+-----+----------+
1 row in set (0,00 sec)
```

순수 인수를 사용하여 ClickHouse에서 테이블 생성:

```sql
CREATE TABLE mysql_table
(
    `float_nullable` Nullable(Float32),
    `int_id` Int32
)
ENGINE = MySQL('localhost:3306', 'test', 'test', 'bayonet', '123')
```

또는 [named collections](/operations/named-collections.md)을 사용하여:

```sql
CREATE NAMED COLLECTION creds AS
        host = 'localhost',
        port = 3306,
        database = 'test',
        user = 'bayonet',
        password = '123';
CREATE TABLE mysql_table
(
    `float_nullable` Nullable(Float32),
    `int_id` Int32
)
ENGINE = MySQL(creds, table='test')
```

MySQL 테이블에서 데이터 검색:

```sql
SELECT * FROM mysql_table
```

```text
┌─float_nullable─┬─int_id─┐
│           ᴺᵁᴸᴸ │      1 │
└────────────────┴────────┘
```

## 설정 {#mysql-settings}

기본 설정은 효율적이지 않으며, 심지어 연결을 재사용하지도 않습니다. 이러한 설정은 서버에서 초당 실행되는 쿼리 수를 늘릴 수 있게 해줍니다.

### `connection_auto_close` {#connection-auto-close}

쿼리 실행 후에 자동으로 연결을 닫도록 허용합니다. 즉, 연결 재사용을 비활성화합니다.

가능한 값:

- 1 — 자동 종료 연결이 허용되어 연결 재사용이 비활성화됩니다.
- 0 — 자동 종료 연결이 허용되지 않으므로 연결 재사용이 활성화됩니다.

기본값: `1`.

### `connection_max_tries` {#connection-max-tries}

장애 조치를 위한 풀의 재시도 횟수를 설정합니다.

가능한 값:

- 양의 정수.
- 0 — 장애 조치가 있는 풀에 대해 재시도가 없습니다.

기본값: `3`.

### `connection_pool_size` {#connection-pool-size}

연결 풀의 크기(모든 연결이 사용 중인 경우 쿼리는 일부 연결이 해제될 때까지 기다립니다).

가능한 값:

- 양의 정수.

기본값: `16`.

### `connection_wait_timeout` {#connection-wait-timeout}

여유 연결을 기다리는 시간 초과(초 단위)(connection_pool_size의 활성 연결이 이미 있는 경우), 0 - 기다리지 않음.

가능한 값:

- 양의 정수.

기본값: `5`.

### `connect_timeout` {#connect-timeout}

연결 시간 초과(초 단위).

가능한 값:

- 양의 정수.

기본값: `10`.

### `read_write_timeout` {#read-write-timeout}

읽기/쓰기 시간 초과(초 단위).

가능한 값:

- 양의 정수.

기본값: `300`.

## 참조 {#see-also}

- [MySQL 테이블 함수](../../../sql-reference/table-functions/mysql.md)
- [MySQL을 딕셔너리 소스로 사용하기](/sql-reference/dictionaries#mysql)
