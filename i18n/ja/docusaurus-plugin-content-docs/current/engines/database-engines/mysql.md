---
slug: /engines/database-engines/mysql
sidebar_position: 50
sidebar_label: MySQL
title: "MySQL"
description: "リモートMySQLサーバー上のデータベースに接続し、ClickHouseとMySQL間でデータを交換するために`INSERT`および`SELECT`クエリを実行できます。"
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MySQLデータベースエンジン

<CloudNotSupportedBadge />

リモートMySQLサーバー上のデータベースに接続し、ClickHouseとMySQL間でデータを交換するために、`INSERT`および`SELECT`クエリを実行できます。

`MySQL`データベースエンジンは、クエリをMySQLサーバーに変換するため、`SHOW TABLES`や`SHOW CREATE TABLE`などの操作を実行できます。

次のクエリは実行できません：

- `RENAME`
- `CREATE TABLE`
- `ALTER`

## データベースの作成 {#creating-a-database}

``` sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster]
ENGINE = MySQL('host:port', ['database' | database], 'user', 'password')
```

**エンジンパラメータ**

- `host:port` — MySQLサーバーのアドレス。
- `database` — リモートデータベースの名前。
- `user` — MySQLユーザー。
- `password` — ユーザーのパスワード。

## データ型のサポート {#data_types-support}

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

その他のすべてのMySQLデータ型は[String](../../sql-reference/data-types/string.md)に変換されます。

[Nullable](../../sql-reference/data-types/nullable.md)がサポートされています。

## グローバル変数のサポート {#global-variables-support}

互換性を向上させるために、MySQLスタイルでグローバル変数を`@@identifier`の形式で指定できます。

これらの変数がサポートされています：
- `version`
- `max_allowed_packet`

:::note
現在、これらの変数はスタブであり、何にも対応していません。
:::

例：

``` sql
SELECT @@version;
```

## 使用例 {#examples-of-use}

MySQLのテーブル：

``` text
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

ClickHouseでのデータベース、MySQLサーバーとのデータ交換：

``` sql
CREATE DATABASE mysql_db ENGINE = MySQL('localhost:3306', 'test', 'my_user', 'user_password') SETTINGS read_write_timeout=10000, connect_timeout=100;
```

``` sql
SHOW DATABASES
```

``` text
┌─name─────┐
│ default  │
│ mysql_db │
│ system   │
└──────────┘
```

``` sql
SHOW TABLES FROM mysql_db
```

``` text
┌─name─────────┐
│  mysql_table │
└──────────────┘
```

``` sql
SELECT * FROM mysql_db.mysql_table
```

``` text
┌─int_id─┬─value─┐
│      1 │     2 │
└────────┴───────┘
```

``` sql
INSERT INTO mysql_db.mysql_table VALUES (3,4)
```

``` sql
SELECT * FROM mysql_db.mysql_table
```

``` text
┌─int_id─┬─value─┐
│      1 │     2 │
│      3 │     4 │
└────────┴───────┘
```
