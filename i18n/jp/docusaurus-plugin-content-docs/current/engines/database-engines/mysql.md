description: 'リモートMySQLサーバー上のデータベースに接続し、ClickHouseとMySQL間でデータを交換するために `INSERT` および `SELECT` クエリを実行できるようにします。'
sidebar_label: 'MySQL'
sidebar_position: 50
slug: /engines/database-engines/mysql
title: 'MySQL'
```

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MySQL データベースエンジン

<CloudNotSupportedBadge />

リモートMySQLサーバー上のデータベースに接続し、ClickHouseとMySQL間でデータを交換するために `INSERT` および `SELECT` クエリを実行できるようにします。

`MySQL` データベースエンジンは、クエリをMySQLサーバーに変換するため、`SHOW TABLES` や `SHOW CREATE TABLE` などの操作を実行できます。

以下のクエリは実行できません：

- `RENAME`
- `CREATE TABLE`
- `ALTER`

## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster]
ENGINE = MySQL('host:port', ['database' | database], 'user', 'password')
```

**エンジンパラメーター**

- `host:port` — MySQLサーバーのアドレス。
- `database` — リモートデータベース名。
- `user` — MySQLユーザー。
- `password` — ユーザーパスワード。

## データ型サポート {#data_types-support}

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

他のすべてのMySQLデータ型は、[String](../../sql-reference/data-types/string.md) に変換されます。

[Nullable](../../sql-reference/data-types/nullable.md) がサポートされています。

## グローバル変数サポート {#global-variables-support}

互換性を高めるために、MySQLスタイルでグローバル変数を `@@identifier` のように参照できます。

これらの変数がサポートされています：
- `version`
- `max_allowed_packet`

:::note
現在、これらの変数はスタブであり、実際のものと一致していません。
:::

例：

```sql
SELECT @@version;
```

## 使用例 {#examples-of-use}

MySQLのテーブル：

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

ClickHouseでのデータベース、MySQLサーバーとのデータ交換：

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
