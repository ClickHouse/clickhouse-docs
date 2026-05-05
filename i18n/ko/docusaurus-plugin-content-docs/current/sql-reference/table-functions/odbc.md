---
description: 'ODBC로 연결된 테이블을 반환합니다.'
sidebar_label: 'odbc'
sidebar_position: 150
slug: /sql-reference/table-functions/odbc
title: 'odbc'
doc_type: 'reference'
---

# odbc Table Function \{#odbc-table-function\}

[ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity)를 통해 연결된 테이블을 반환합니다.

## 구문 \{#syntax\}

```sql
odbc(datasource, external_database, external_table)
odbc(datasource, external_table)
odbc(named_collection)
```


## Arguments \{#arguments\}

| Argument            | Description                                                            |
|---------------------|------------------------------------------------------------------------|
| `datasource` | `odbc.ini` 파일에서 연결 설정이 정의된 섹션 이름입니다. |
| `external_database` | 외부 DBMS의 데이터베이스 이름입니다.                                |
| `external_table`    | `external_database` 내 테이블 이름입니다.                            |

이 인수들은 [named collections](operations/named-collections.md)을 사용하여 전달할 수도 있습니다.

ODBC 연결을 안전하게 구현하기 위해 ClickHouse는 별도의 프로그램인 `clickhouse-odbc-bridge`를 사용합니다. ODBC 드라이버를 `clickhouse-server`에서 직접 로드하면 드라이버 문제로 인해 ClickHouse 서버가 중단될 수 있습니다. ClickHouse는 필요할 때 `clickhouse-odbc-bridge`를 자동으로 시작합니다. ODBC 브리지 프로그램은 `clickhouse-server`와 동일한 패키지에 포함되어 설치됩니다.

외부 테이블에서 `NULL` 값을 가진 필드는 기본 데이터 타입의 기본값으로 변환됩니다. 예를 들어, 원격 MySQL 테이블 필드의 형이 `INT NULL`인 경우, 이는 ClickHouse `Int32` 데이터 타입의 기본값인 0으로 변환됩니다.

## 사용 예시 \{#usage-example\}

**ODBC를 통해 로컬 MySQL 설치 환경에서 데이터 가져오기**

이 예시는 Ubuntu Linux 18.04 및 MySQL server 5.7에서 검증되었습니다.

unixODBC와 MySQL Connector가 설치되어 있는지 확인하십시오.

기본적으로(패키지에서 설치한 경우) ClickHouse는 `clickhouse` 사용자로 실행됩니다. 따라서 MySQL server에서 이 사용자를 생성하고 설정해야 합니다.

```bash
$ sudo mysql
```

```sql
mysql> CREATE USER 'clickhouse'@'localhost' IDENTIFIED BY 'clickhouse';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'clickhouse'@'clickhouse' WITH GRANT OPTION;
```

그런 다음 `/etc/odbc.ini` 파일에서 연결을 설정합니다.

```bash
$ cat /etc/odbc.ini
[mysqlconn]
DRIVER = /usr/local/lib/libmyodbc5w.so
SERVER = 127.0.0.1
PORT = 3306
DATABASE = test
USERNAME = clickhouse
PASSWORD = clickhouse
```

unixODBC 설치에 포함된 `isql` 유틸리티를 사용하여 연결을 확인할 수 있습니다.

```bash
$ isql -v mysqlconn
+-------------------------+
| Connected!                            |
|                                       |
...
```

MySQL에 있는 테이블:

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

ClickHouse에서 MySQL 테이블 데이터 조회:

```sql
SELECT * FROM odbc('DSN=mysqlconn', 'test', 'test')
```

```text
┌─int_id─┬─int_nullable─┬─float─┬─float_nullable─┐
│      1 │            0 │     2 │              0 │
└────────┴──────────────┴───────┴────────────────┘
```


## 관련 항목 \{#see-also\}

- [ODBC 사전](/sql-reference/statements/create/dictionary/sources/odbc)
- [ODBC 테이블 엔진](/engines/table-engines/integrations/odbc).