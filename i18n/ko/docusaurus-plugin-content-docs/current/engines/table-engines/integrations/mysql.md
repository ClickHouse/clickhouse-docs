---
description: 'MySQL 테이블 엔진 문서'
sidebar_label: 'MySQL'
sidebar_position: 138
slug: /engines/table-engines/integrations/mysql
title: 'MySQL 테이블 엔진'
doc_type: 'reference'
---

# MySQL 테이블 엔진 \{#mysql-table-engine\}

MySQL 엔진을 사용하면 원격 MySQL 서버에 저장된 데이터에 대해 `SELECT` 및 `INSERT` 쿼리를 실행할 수 있습니다.

## 테이블 생성 \{#creating-a-table\}

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

[CREATE TABLE](/sql-reference/statements/create/table) 쿼리에 대한 자세한 설명을 참고하십시오.

테이블 구조는 원래 MySQL 테이블 구조와 다를 수 있습니다:

* 컬럼 이름은 원래 MySQL 테이블과 같아야 하지만, 이 중 일부 컬럼만 사용해도 되고 순서는 임의로 지정할 수 있습니다.
* 컬럼 타입은 원래 MySQL 테이블의 타입과 다를 수 있습니다. ClickHouse는 값을 ClickHouse 데이터 타입으로 [캐스팅](../../../engines/database-engines/mysql.md#data_types-support)하려고 시도합니다.
* [external&#95;table&#95;functions&#95;use&#95;nulls](/operations/settings/settings#external_table_functions_use_nulls) 설정은 널 허용 컬럼을 어떻게 처리할지 정의합니다. 기본값: 1. 0이면, 테이블 함수는 널 허용 컬럼을 만들지 않고 null 대신 기본값을 삽입합니다. 이는 배열 내부의 NULL 값에도 동일하게 적용됩니다.

**Engine Parameters**

* `host:port` — MySQL 서버 주소.
* `database` — 원격 데이터베이스 이름.
* `table` — 원격 테이블 이름.
* `user` — MySQL 사용자.
* `password` — 사용자 비밀번호.
* `replace_query` — `INSERT INTO` 쿼리를 `REPLACE INTO`로 변환하는 플래그입니다. `replace_query=1`이면 쿼리가 대체됩니다.
* `on_duplicate_clause` — `INSERT` 쿼리에 추가되는 `ON DUPLICATE KEY on_duplicate_clause` 표현식입니다.
  예: `INSERT INTO t (c1,c2) VALUES ('a', 2) ON DUPLICATE KEY UPDATE c2 = c2 + 1`에서 `on_duplicate_clause`는 `UPDATE c2 = c2 + 1`입니다. `ON DUPLICATE KEY` 절과 함께 사용할 수 있는 `on_duplicate_clause`에 대해서는 [MySQL documentation](https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html)을 참고하십시오.
  `on_duplicate_clause`를 지정하려면 `replace_query` 파라미터에 `0`을 전달해야 합니다. `replace_query = 1`과 `on_duplicate_clause`를 동시에 전달하면 ClickHouse는 예외를 발생시킵니다.

인수는 [named collections](/operations/named-collections.md)를 사용하여 전달할 수도 있습니다. 이 경우 `host`와 `port`는 별도로 지정해야 합니다. 이 접근 방식은 프로덕션 환경에서 사용하는 것을 권장합니다.

`=, !=, >, >=, <, <=`와 같은 단순 `WHERE` 절은 MySQL 서버에서 실행됩니다.

나머지 조건과 `LIMIT` 샘플링 제약 조건은 MySQL에 대한 쿼리가 완료된 후에만 ClickHouse에서 실행됩니다.

`|`로 나열해야 하는 여러 레플리카를 지원합니다. 예를 들면 다음과 같습니다:

```sql
CREATE TABLE test_replicas (id UInt32, name String, age UInt32, money UInt32) ENGINE = MySQL(`mysql{2|3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```


## 사용 예제 \{#usage-example\}

MySQL에서 테이블을 생성합니다:

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

인수를 직접 지정하여 ClickHouse에서 테이블을 생성합니다:

```sql
CREATE TABLE mysql_table
(
    `float_nullable` Nullable(Float32),
    `int_id` Int32
)
ENGINE = MySQL('localhost:3306', 'test', 'test', 'bayonet', '123')
```

또는 [named collections](/operations/named-collections.md)을 사용할 수 있습니다:

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

MySQL 테이블에서 데이터 조회:

```sql
SELECT * FROM mysql_table
```

```text
┌─float_nullable─┬─int_id─┐
│           ᴺᵁᴸᴸ │      1 │
└────────────────┴────────┘
```


## Settings \{#mysql-settings\}

기본 설정은 연결을 재사용하지 않아 효율적이지 않습니다. 이 설정들을 사용하면 서버가 초당 처리할 수 있는 쿼리 수를 늘릴 수 있습니다.

### `connection_auto_close` \{#connection-auto-close\}

쿼리 실행 후 연결을 자동으로 닫아, 연결 재사용을 비활성화합니다.

가능한 값:

- 1 — 연결 자동 닫기가 허용되며, 연결 재사용이 비활성화됩니다.
- 0 — 연결 자동 닫기가 허용되지 않으며, 연결 재사용이 활성화됩니다.

기본값: `1`.

### `connection_max_tries` \{#connection-max-tries\}

장애 조치(failover)가 있는 풀에 대한 재시도 횟수를 설정합니다.

가능한 값:

- 양의 정수.
- 0 — 장애 조치가 있는 풀에 대해 재시도를 수행하지 않습니다.

기본값: `3`.

### `connection_pool_size` \{#connection-pool-size\}

연결 풀의 크기입니다. 모든 연결이 사용 중인 경우, 일부 연결이 해제될 때까지 쿼리가 대기합니다.

가능한 값:

- 양의 정수.

기본값: `16`.

### `connection_wait_timeout` \{#connection-wait-timeout\}

사용 가능한 연결을 기다리는 시간 초과(초 단위)입니다. 이미 `connection_pool_size`만큼의 활성 연결이 있는 경우에 적용되며, 0이면 대기하지 않습니다.

가능한 값:

- 양의 정수.

기본값: `5`.

### `connect_timeout` \{#connect-timeout\}

연결 시 발생하는 시간 초과(초 단위)입니다.

가능한 값:

- 양의 정수.

기본값: `10`.

### `read_write_timeout` \{#read-write-timeout\}

읽기/쓰기 작업에 대한 시간 초과(초 단위)입니다.

가능한 값:

- 양의 정수.

기본값: `300`.

## 함께 보기 \{#see-also\}

- [MySQL 테이블 함수](../../../sql-reference/table-functions/mysql.md)
- [MySQL을 딕셔너리 소스로 사용하기](/sql-reference/statements/create/dictionary/sources/mysql)