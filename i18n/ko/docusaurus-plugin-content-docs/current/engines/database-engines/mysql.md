---
'description': '원격 MySQL 서버에 데이터베이스에 연결하고 ClickHouse와 MySQL 간에 데이터를 교환하기 위해 `INSERT`
  및 `SELECT` 쿼리를 수행할 수 있습니다.'
'sidebar_label': 'MySQL'
'sidebar_position': 50
'slug': '/engines/database-engines/mysql'
'title': 'MySQL'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MySQL 데이터베이스 엔진

<CloudNotSupportedBadge />

원격 MySQL 서버의 데이터베이스에 연결하고 ClickHouse와 MySQL 간 데이터 교환을 위해 `INSERT` 및 `SELECT` 쿼리를 수행할 수 있게 합니다.

`MySQL` 데이터베이스 엔진은 쿼리를 MySQL 서버로 변환하여 `SHOW TABLES` 또는 `SHOW CREATE TABLE`과 같은 작업을 수행할 수 있도록 합니다.

다음 쿼리는 수행할 수 없습니다:

- `RENAME`
- `CREATE TABLE`
- `ALTER`

## 데이터베이스 생성 {#creating-a-database}

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster]
ENGINE = MySQL('host:port', ['database' | database], 'user', 'password')
```

**엔진 매개변수**

- `host:port` — MySQL 서버 주소.
- `database` — 원격 데이터베이스 이름.
- `user` — MySQL 사용자.
- `password` — 사용자 비밀번호.

## 데이터 유형 지원 {#data_types-support}

| MySQL                            | ClickHouse                                                   |
|----------------------------------|--------------------------------------------------------------|
| UNSIGNED TINYINT                 | [UInt8](../../sql-reference/data-types/int-uint.md)          |
| TINYINT                          | [Int8](../../sql-reference/data-types/int-uint.md)           |
| UNSIGNED SMALLINT                | [UInt16](../../sql-reference/data-types/int-uint.md)         |
| SMALLINT                         | [Int16](../../sql-reference/data-types/int-uint.md)          |
| UNSIGNED INT, UNSIGNED MEDIUMINT | [UInt32](../../sql-reference/data-types/int-uint.md)         |
| INT, MEDIUMINT                   | [Int32](../../sql-reference/data-types/int-uint.md)          |
| UNSIGNED BIGINT                  | [UInt64](../../sql-reference/data-types/int-uint.md)         |
| BIGINT                           | [Int64](../../sql-reference/data-types/int-uint.md)          |
| FLOAT                            | [Float32](../../sql-reference/data-types/float.md)           |
| DOUBLE                           | [Float64](../../sql-reference/data-types/float.md)           |
| DATE                             | [Date](../../sql-reference/data-types/date.md)               |
| DATETIME, TIMESTAMP              | [DateTime](../../sql-reference/data-types/datetime.md)       |
| BINARY                           | [FixedString](../../sql-reference/data-types/fixedstring.md) |

다른 모든 MySQL 데이터 유형은 [String](../../sql-reference/data-types/string.md)으로 변환됩니다.

[Nullable](../../sql-reference/data-types/nullable.md)가 지원됩니다.

## 전역 변수 지원 {#global-variables-support}

더 나은 호환성을 위해 MySQL 스타일로 전역 변수를 `@@identifier` 형식으로 참조할 수 있습니다.

지원되는 변수는 다음과 같습니다:
- `version`
- `max_allowed_packet`

:::note
현재 이러한 변수는 스텁이며 어떤 것과도 대응되지 않습니다.
:::

예제:

```sql
SELECT @@version;
```

## 사용 예제 {#examples-of-use}

MySQL의 테이블:

```text
mysql> USE test;
Database changed

mysql> CREATE TABLE `mysql_table` (
    ->   `int_id` INT NOT NULL AUTO_INCREMENT,
    ->   `float` FLOAT NOT NULL,
    ->   PRIMARY KEY (`int_id`));
Query OK, 0 rows affected (0,09 sec)

mysql> insert into mysql_table (`int_id`, `float`) VALUES (1,2);
Query OK, 1 row affected (0,00 sec)

mysql> select * from mysql_table;
+------+-----+
| int_id | value |
+------+-----+
|      1 |     2 |
+------+-----+
1 row in set (0,00 sec)
```

MySQL 서버와 데이터 교환을 위한 ClickHouse의 데이터베이스:

```sql
CREATE DATABASE mysql_db ENGINE = MySQL('localhost:3306', 'test', 'my_user', 'user_password') SETTINGS read_write_timeout=10000, connect_timeout=100;
```

```sql
SHOW DATABASES
```

```text
┌─name─────┐
│ default  │
│ mysql_db │
│ system   │
└──────────┘
```

```sql
SHOW TABLES FROM mysql_db
```

```text
┌─name─────────┐
│  mysql_table │
└──────────────┘
```

```sql
SELECT * FROM mysql_db.mysql_table
```

```text
┌─int_id─┬─value─┐
│      1 │     2 │
└────────┴───────┘
```

```sql
INSERT INTO mysql_db.mysql_table VALUES (3,4)
```

```sql
SELECT * FROM mysql_db.mysql_table
```

```text
┌─int_id─┬─value─┐
│      1 │     2 │
│      3 │     4 │
└────────┴───────┘
```
