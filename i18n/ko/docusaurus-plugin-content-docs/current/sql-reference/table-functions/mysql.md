---
description: '원격 MySQL 서버에 저장된 데이터에 대해 `SELECT` 및 `INSERT` 쿼리를 실행할 수 있도록 합니다.'
sidebar_label: 'mysql'
sidebar_position: 137
slug: /sql-reference/table-functions/mysql
title: 'mysql'
doc_type: 'reference'
---

# mysql Table Function \{#mysql-table-function\}

원격 MySQL 서버에 저장된 데이터에 대해 `SELECT` 및 `INSERT` 쿼리를 실행할 수 있습니다.

## 구문 \{#syntax\}

```sql
mysql({host:port, database, table, user, password[, replace_query, on_duplicate_clause] | named_collection[, option=value [,..]]})
```


## Arguments \{#arguments\}

| Argument              | Description                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host:port`           | MySQL 서버 주소입니다.                                                                                                                                                                                                                                                                                                                                                                                                        |
| `database`            | 원격 데이터베이스 이름입니다.                                                                                                                                                                                                                                                                                                                                                                                                       |
| `table`               | 원격 테이블 이름입니다.                                                                                                                                                                                                                                                                                                                                                                                                          |
| `user`                | MySQL 사용자입니다.                                                                                                                                                                                                                                                                                                                                                                                                          |
| `password`            | 사용자 비밀번호입니다.                                                                                                                                                                                                                                                                                                                                                                                                           |
| `replace_query`       | `INSERT INTO` 쿼리를 `REPLACE INTO`로 변환하는 플래그입니다. 가능한 값:<br />    - `0` - 쿼리가 `INSERT INTO`로 실행됩니다.<br />    - `1` - 쿼리가 `REPLACE INTO`로 실행됩니다.                                                                                                                                                                                                                                                                           |
| `on_duplicate_clause` | `INSERT` 쿼리에 추가되는 `ON DUPLICATE KEY on_duplicate_clause` 표현식입니다. `replace_query = 0`인 경우에만 지정할 수 있습니다 (`replace_query = 1`과 `on_duplicate_clause`를 동시에 전달하면 ClickHouse는 예외를 발생시킵니다).<br />    예: `INSERT INTO t (c1,c2) VALUES ('a', 2) ON DUPLICATE KEY UPDATE c2 = c2 + 1;`<br />    여기에서 `on_duplicate_clause`는 `UPDATE c2 = c2 + 1`입니다. `ON DUPLICATE KEY` 절과 함께 사용할 수 있는 `on_duplicate_clause`는 MySQL 문서를 참조하십시오. |

인수는 [named collections](operations/named-collections.md)을 사용하여 전달할 수도 있습니다. 이 경우 `host`와 `port`를 별도로 지정해야 합니다. 이 방식은 프로덕션 환경에서의 사용을 권장합니다.

`=, !=, >, >=, <, <=`와 같은 단순한 `WHERE` 절은 현재 MySQL 서버에서 실행됩니다.

나머지 조건과 `LIMIT` 샘플링 제약은 MySQL에 대한 쿼리가 완료된 후에만 ClickHouse에서 실행됩니다.

여러 레플리카를 지원하며, `|`로 나열해야 합니다. 예를 들면 다음과 같습니다:

```sql
SELECT name FROM mysql(`mysql{1|2|3}:3306`, 'mysql_database', 'mysql_table', 'user', 'password');
```

또는

```sql
SELECT name FROM mysql(`mysql1:3306|mysql2:3306|mysql3:3306`, 'mysql_database', 'mysql_table', 'user', 'password');
```


## 반환 값 \{#returned_value\}

원래 MySQL 테이블과 동일한 컬럼을 가진 테이블 객체입니다.

:::note
MySQL의 일부 데이터 타입은 서로 다른 ClickHouse 타입으로 매핑될 수 있으며, 이는 쿼리 수준의 SETTING [mysql_datatypes_support_level](operations/settings/settings.md#mysql_datatypes_support_level)로 제어합니다.
:::

:::note
`INSERT` 쿼리에서 테이블 함수 `mysql(...)`와 컬럼 이름 목록이 있는 테이블 이름을 구분하려면 `FUNCTION` 또는 `TABLE FUNCTION` 키워드를 사용해야 합니다. 아래 예시를 참고하십시오.
:::

## 예제 \{#examples\}

MySQL 테이블:

```text
mysql> CREATE TABLE `test`.`test` (
    ->   `int_id` INT NOT NULL AUTO_INCREMENT,
    ->   `float` FLOAT NOT NULL,
    ->   PRIMARY KEY (`int_id`));

mysql> INSERT INTO test (`int_id`, `float`) VALUES (1,2);

mysql> SELECT * FROM test;
+--------+-------+
| int_id | float |
+--------+-------+
|      1 |     2 |
+--------+-------+
```

ClickHouse에서 데이터 조회:

```sql
SELECT * FROM mysql('localhost:3306', 'test', 'test', 'bayonet', '123');
```

또는 [named collections](operations/named-collections.md)을 사용:

```sql
CREATE NAMED COLLECTION creds AS
        host = 'localhost',
        port = 3306,
        database = 'test',
        user = 'bayonet',
        password = '123';
SELECT * FROM mysql(creds, table='test');
```

```text
┌─int_id─┬─float─┐
│      1 │     2 │
└────────┴───────┘
```

대체 및 삽입:

```sql
INSERT INTO FUNCTION mysql('localhost:3306', 'test', 'test', 'bayonet', '123', 1) (int_id, float) VALUES (1, 3);
INSERT INTO TABLE FUNCTION mysql('localhost:3306', 'test', 'test', 'bayonet', '123', 0, 'UPDATE int_id = int_id + 1') (int_id, float) VALUES (1, 4);
SELECT * FROM mysql('localhost:3306', 'test', 'test', 'bayonet', '123');
```

```text
┌─int_id─┬─float─┐
│      1 │     3 │
│      2 │     4 │
└────────┴───────┘
```

MySQL 테이블 데이터를 ClickHouse 테이블로 복사하기:

```sql
CREATE TABLE mysql_copy
(
   `id` UInt64,
   `datetime` DateTime('UTC'),
   `description` String,
)
ENGINE = MergeTree
ORDER BY (id,datetime);

INSERT INTO mysql_copy
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');
```

또는 현재 최대 id를 기준으로 MySQL에서 증분 배치만 복사하려면:

```sql
INSERT INTO mysql_copy
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password')
WHERE id > (SELECT max(id) FROM mysql_copy);
```


## 관련 항목 \{#related\}

- ['MySQL' 테이블 엔진](../../engines/table-engines/integrations/mysql.md)
- [MySQL을 딕셔너리 소스로 사용하는 방법](/sql-reference/statements/create/dictionary/sources/mysql)
- [mysql_datatypes_support_level](operations/settings/settings.md#mysql_datatypes_support_level)
- [mysql_map_fixed_string_to_text_in_show_columns](operations/settings/settings.md#mysql_map_fixed_string_to_text_in_show_columns)
- [mysql_map_string_to_text_in_show_columns](operations/settings/settings.md#mysql_map_string_to_text_in_show_columns)
- [mysql_max_rows_to_insert](operations/settings/settings.md#mysql_max_rows_to_insert)