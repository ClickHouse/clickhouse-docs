---
description: 'ClickHouse가 JDBC를 통해 외부 데이터베이스에 연결할 수 있게 합니다.'
sidebar_label: 'JDBC'
sidebar_position: 100
slug: /engines/table-engines/integrations/jdbc
title: 'JDBC 테이블 엔진'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# JDBC 테이블 엔진 \{#jdbc-table-engine\}

<CloudNotSupportedBadge/>

:::note
clickhouse-jdbc-bridge에는 실험적인 코드가 포함되어 있으며 더 이상 지원되지 않습니다. 신뢰성 문제와 보안 취약성이 존재할 수 있습니다. 사용으로 인해 발생하는 모든 책임은 사용자에게 있습니다.  
ClickHouse는 임시(ad-hoc) 쿼리 시나리오(Postgres, MySQL, MongoDB 등)에 대해 더 나은 대안을 제공하는 ClickHouse의 내장 테이블 함수 사용을 권장합니다.
:::

ClickHouse가 [JDBC](https://en.wikipedia.org/wiki/Java_Database_Connectivity)를 통해 외부 데이터베이스에 연결할 수 있도록 합니다.

JDBC 연결을 구현하기 위해 ClickHouse는 데몬으로 실행해야 하는 별도의 프로그램인 [clickhouse-jdbc-bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge)를 사용합니다.

이 엔진은 [널 허용](../../../sql-reference/data-types/nullable.md) 데이터형을 지원합니다.



## 테이블 생성 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    columns list...
)
ENGINE = JDBC(datasource, external_database, external_table)
```

**엔진 매개변수**

* `datasource` — 외부 DBMS의 URI 또는 이름입니다.

  URI 형식: `jdbc:<driver_name>://<host_name>:<port>/?user=<username>&password=<password>`.
  MySQL 예시: `jdbc:mysql://localhost:3306/?user=root&password=root`.

* `external_database` — 외부 DBMS의 데이터베이스 이름이거나, 명시적으로 정의된 테이블 스키마입니다(예시 참조).

* `external_table` — 외부 데이터베이스의 테이블 이름이거나 `select * from table1 where column1=1`과 같은 SELECT 쿼리입니다.

* 이러한 매개변수는 [named collections](operations/named-collections.md)을 사용하여 설정할 수도 있습니다.


## 사용 예시 \{#usage-example\}

MySQL 서버 콘솔 클라이언트에 직접 연결하여 테이블을 생성합니다:

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

ClickHouse 서버에서 테이블을 생성하고 해당 테이블에서 데이터를 조회합니다.

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


## 같이 보기 \{#see-also\}

- [JDBC 테이블 함수](../../../sql-reference/table-functions/jdbc.md).
