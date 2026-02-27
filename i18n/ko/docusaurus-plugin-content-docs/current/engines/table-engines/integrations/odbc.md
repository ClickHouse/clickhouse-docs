---
description: 'ClickHouse가 ODBC를 통해 외부 데이터베이스에 연결할 수 있도록 합니다.'
sidebar_label: 'ODBC'
sidebar_position: 150
slug: /engines/table-engines/integrations/odbc
title: 'ODBC 테이블 엔진'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# ODBC 테이블 엔진 \{#odbc-table-engine\}

<CloudNotSupportedBadge/>

ClickHouse가 [ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity)를 통해 외부 데이터베이스에 연결할 수 있도록 합니다.

ODBC 연결을 안전하게 구현하기 위해 ClickHouse는 별도의 프로그램인 `clickhouse-odbc-bridge`를 사용합니다. ODBC 드라이버가 `clickhouse-server`에서 직접 로드되면 드라이버 문제로 인해 ClickHouse 서버가 중단될 수 있습니다. ClickHouse는 필요할 때 `clickhouse-odbc-bridge`를 자동으로 시작합니다. ODBC 브리지 프로그램은 `clickhouse-server`와 동일한 패키지에서 함께 설치됩니다.

이 엔진은 [널 허용(Nullable)](../../../sql-reference/data-types/nullable.md) 데이터 타입을 지원합니다.

## 테이블 생성 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1],
    name2 [type2],
    ...
)
ENGINE = ODBC(datasource, external_database, external_table)
```

[CREATE TABLE](/sql-reference/statements/create/table) 쿼리에 대한 자세한 설명은 해당 문서를 참조하십시오.

테이블 구조는 소스 테이블 구조와 다를 수 있습니다:

* 컬럼 이름은 소스 테이블과 동일해야 하지만, 일부 컬럼만 사용해도 되며 순서는 자유롭게 지정할 수 있습니다.
* 컬럼 타입은 소스 테이블과 다를 수 있습니다. ClickHouse는 값을 ClickHouse 데이터 타입으로 [cast](/sql-reference/functions/type-conversion-functions#CAST)하려고 시도합니다.
* [external&#95;table&#95;functions&#95;use&#95;nulls](/operations/settings/settings#external_table_functions_use_nulls) 설정은 널 허용(Nullable) 컬럼을 어떻게 처리할지 정의합니다. 기본값: 1. 값이 0이면 테이블 함수는 널 허용 컬럼을 만들지 않고, null 대신 기본값을 삽입합니다. 이는 배열 내부의 NULL 값에도 적용됩니다.

**Engine 매개변수**

* `datasource` — `odbc.ini` 파일에서 연결 설정을 포함하는 섹션 이름입니다.
* `external_database` — 외부 DBMS에 있는 데이터베이스 이름입니다.
* `external_table` — `external_database` 내의 테이블 이름입니다.

이러한 매개변수는 [named collections](operations/named-collections.md)을 사용하여 전달할 수도 있습니다.


## 사용 예시 \{#usage-example\}

**ODBC를 통해 로컬 MySQL 설치에서 데이터 가져오기**

이 예제는 Ubuntu Linux 18.04와 MySQL 서버 5.7 환경에서 검증되었습니다.

unixODBC와 MySQL Connector가 설치되어 있는지 확인하십시오.

기본적으로 (패키지로 설치한 경우) ClickHouse는 `clickhouse` 사용자 계정으로 실행됩니다. 따라서 MySQL 서버에서 이 사용자 계정을 생성하고 설정해야 합니다.

```bash
$ sudo mysql
```

```sql
mysql> CREATE USER 'clickhouse'@'localhost' IDENTIFIED BY 'clickhouse';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'clickhouse'@'localhost' WITH GRANT OPTION;
```

그런 다음 `/etc/odbc.ini` 파일에서 연결을 설정합니다.

```bash
$ cat /etc/odbc.ini
[mysqlconn]
DRIVER = /usr/local/lib/libmyodbc5w.so
SERVER = 127.0.0.1
PORT = 3306
DATABASE = test
USER = clickhouse
PASSWORD = clickhouse
```

unixODBC 설치에 포함된 `isql` 유틸리티를 사용하여 연결을 테스트할 수 있습니다.

```bash
$ isql -v mysqlconn
+-------------------------+
| Connected!                            |
|                                       |
...
```

MySQL 테이블:

```text
mysql> CREATE DATABASE test;
Query OK, 1 row affected (0,01 sec)

mysql> CREATE TABLE `test`.`test` (
    ->   `int_id` INT NOT NULL AUTO_INCREMENT,
    ->   `int_nullable` INT NULL DEFAULT NULL,
    ->   `float` FLOAT NOT NULL,
    ->   `float_nullable` FLOAT NULL DEFAULT NULL,
    ->   PRIMARY KEY (`int_id`));
Query OK, 0 rows affected (0,09 sec)

mysql> insert into test.test (`int_id`, `float`) VALUES (1,2);
Query OK, 1 row affected (0,00 sec)

mysql> select * from test.test;
+------+----------+-----+----------+
| int_id | int_nullable | float | float_nullable |
+------+----------+-----+----------+
|      1 |         NULL |     2 |           NULL |
+------+----------+-----+----------+
1 row in set (0,00 sec)
```

MySQL 테이블에서 데이터를 가져오는 ClickHouse 테이블:

```sql
CREATE TABLE odbc_t
(
    `int_id` Int32,
    `float_nullable` Nullable(Float32)
)
ENGINE = ODBC('DSN=mysqlconn', 'test', 'test')
```

```sql
SELECT * FROM odbc_t
```

```text
┌─int_id─┬─float_nullable─┐
│      1 │           ᴺᵁᴸᴸ │
└────────┴────────────────┘
```


## 함께 보기 \{#see-also\}

- [ODBC 딕셔너리](/sql-reference/statements/create/dictionary/sources/odbc)
- [ODBC 테이블 함수](../../../sql-reference/table-functions/odbc.md)