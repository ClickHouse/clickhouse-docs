---
'description': 'JDBC를 통해 ClickHouse가 외부 데이터베이스에 연결할 수 있도록 합니다.'
'sidebar_label': 'JDBC'
'sidebar_position': 100
'slug': '/engines/table-engines/integrations/jdbc'
'title': 'JDBC 테이블 엔진'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# JDBC 테이블 엔진

<CloudNotSupportedBadge/>

:::note
clickhouse-jdbc-bridge는 실험적인 코드를 포함하고 있으며 더 이상 지원되지 않습니다. 신뢰성 문제와 보안 취약점이 있을 수 있으니 본인의 위험 부담 아래에서 사용하시기 바랍니다. 
ClickHouse는 ClickHouse에서 제공하는 내장 테이블 함수를 사용하는 것을 권장하며, 이는 임시 쿼리 시나리오(예: Postgres, MySQL, MongoDB 등)에 대해 더 나은 대안을 제공합니다.
:::

ClickHouse가 [JDBC](https://en.wikipedia.org/wiki/Java_Database_Connectivity)를 통해 외부 데이터베이스에 연결할 수 있도록 합니다.

JDBC 연결을 구현하기 위해 ClickHouse는 별도의 프로그램인 [clickhouse-jdbc-bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge)를 사용하며, 이 프로그램은 데몬으로 실행되어야 합니다.

이 엔진은 [Nullable](../../../sql-reference/data-types/nullable.md) 데이터 유형을 지원합니다.

## 테이블 생성 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    columns list...
)
ENGINE = JDBC(datasource, external_database, external_table)
```

**엔진 매개변수**

- `datasource` — 외부 DBMS의 URI 또는 이름.

    URI 형식: `jdbc:<driver_name>://<host_name>:<port>/?user=<username>&password=<password>`.
    MySQL의 예: `jdbc:mysql://localhost:3306/?user=root&password=root`.

- `external_database` — 외부 DBMS에 있는 데이터베이스의 이름 또는, 대신에 명시적으로 정의된 테이블 스키마(예제 참조).

- `external_table` — 외부 데이터베이스의 테이블 이름 또는 `select * from table1 where column1=1`과 같은 선택 쿼리.

- 이러한 매개변수는 [명명된 컬렉션](operations/named-collections.md)을 사용하여 전달할 수도 있습니다.

## 사용 예제 {#usage-example}

MySQL 서버에서 콘솔 클라이언트를 통해 직접 연결하여 테이블 생성:

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

ClickHouse 서버에서 테이블을 생성하고 그로부터 데이터 선택:

```sql
CREATE TABLE jdbc_table
(
    `int_id` Int32,
    `int_nullable` Nullable(Int32),
    `float` Float32,
    `float_nullable` Nullable(Float32)
)
ENGINE JDBC('jdbc:mysql://localhost:3306/?user=root&password=root', 'test', 'test')
```

```sql
SELECT *
FROM jdbc_table
```

```text
┌─int_id─┬─int_nullable─┬─float─┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴────────────────┘
```

```sql
INSERT INTO jdbc_table(`int_id`, `float`)
SELECT toInt32(number), toFloat32(number * 1.0)
FROM system.numbers
```

## 참조 {#see-also}

- [JDBC 테이블 함수](../../../sql-reference/table-functions/jdbc.md).
