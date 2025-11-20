---
'description': 'ClickHouse가 ODBC를 통해 외부 데이터베이스에 연결할 수 있도록 허용합니다.'
'sidebar_label': 'ODBC'
'sidebar_position': 150
'slug': '/engines/table-engines/integrations/odbc'
'title': 'ODBC 테이블 엔진'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# ODBC 테이블 엔진

<CloudNotSupportedBadge/>

ClickHouse가 [ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity)를 통해 외부 데이터베이스에 연결할 수 있도록 합니다.

ODBC 연결을 안전하게 구현하기 위해 ClickHouse는 `clickhouse-odbc-bridge`라는 별도의 프로그램을 사용합니다. ODBC 드라이버가 `clickhouse-server`에서 직접 로드되면 드라이버 문제로 인해 ClickHouse 서버가 충돌할 수 있습니다. ClickHouse는 필요할 때 자동으로 `clickhouse-odbc-bridge`를 시작합니다. ODBC 브리징 프로그램은 `clickhouse-server`와 동일한 패키지에서 설치됩니다.

이 엔진은 [Nullable](../../../sql-reference/data-types/nullable.md) 데이터 유형을 지원합니다.

## 테이블 만들기 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1],
    name2 [type2],
    ...
)
ENGINE = ODBC(datasource, external_database, external_table)
```

[CREATE TABLE](/sql-reference/statements/create/table) 쿼리에 대한 자세한 설명을 참조하십시오.

테이블 구조는 원본 테이블 구조와 다를 수 있습니다:

- 컬럼 이름은 원본 테이블과 같아야 하지만, 이러한 컬럼 중 일부만 사용하고 어떤 순서로든 사용할 수 있습니다.
- 컬럼 유형은 원본 테이블의 것과 다를 수 있습니다. ClickHouse는 값을 ClickHouse 데이터 유형으로 [캐스팅](/sql-reference/functions/type-conversion-functions#cast)하려고 합니다.
- [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls) 설정은 Nullable 컬럼을 처리하는 방법을 정의합니다. 기본값: 1. 0일 경우, 테이블 함수는 Nullable 컬럼을 만들지 않고 null 대신 기본 값을 삽입합니다. 이것은 배열 내 NULL 값에도 적용됩니다.

**엔진 매개변수**

- `datasource` — `odbc.ini` 파일의 연결 설정이 포함된 섹션 이름입니다.
- `external_database` — 외부 DBMS의 데이터베이스 이름입니다.
- `external_table` — `external_database`의 테이블 이름입니다.

이러한 매개변수는 [이름이 지정된 컬렉션](operations/named-collections.md)을 사용하여 전달할 수도 있습니다.

## 사용 예제 {#usage-example}

**ODBC를 통해 로컬 MySQL 설치에서 데이터 검색하기**

이 예제는 Ubuntu Linux 18.04와 MySQL 서버 5.7에서 확인되었습니다.

unixODBC와 MySQL Connector가 설치되어 있어야 합니다.

기본적으로 (패키지에서 설치된 경우) ClickHouse는 사용자 `clickhouse`로 시작합니다. 따라서 MySQL 서버에서 이 사용자를 생성하고 구성해야 합니다.

```bash
$ sudo mysql
```

```sql
mysql> CREATE USER 'clickhouse'@'localhost' IDENTIFIED BY 'clickhouse';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'clickhouse'@'localhost' WITH GRANT OPTION;
```

그런 다음 `/etc/odbc.ini`에서 연결을 구성합니다.

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

unixODBC 설치의 `isql` 유틸리티를 사용하여 연결을 확인할 수 있습니다.

```bash
$ isql -v mysqlconn
+-------------------------+
| Connected!                            |
|                                       |
...
```

MySQL의 테이블:

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

ClickHouse에서 MySQL 테이블의 데이터를 검색한 테이블:

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

## 참조 {#see-also}

- [ODBC 딕셔너리](/sql-reference/dictionaries#mysql)
- [ODBC 테이블 함수](../../../sql-reference/table-functions/odbc.md)
