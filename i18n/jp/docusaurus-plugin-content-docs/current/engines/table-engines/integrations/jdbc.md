---
description: 'Allows ClickHouse to connect to external databases via JDBC.'
sidebar_label: 'JDBC'
sidebar_position: 100
slug: '/engines/table-engines/integrations/jdbc'
title: 'JDBC'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# JDBC

<CloudNotSupportedBadge/>

:::note
clickhouse-jdbc-bridge には実験的なコードが含まれており、もはやサポートされていません。信頼性の問題やセキュリティの脆弱性が含まれている可能性があります。自己の責任で使用してください。  
ClickHouseは、アドホッククエリシナリオに対してより良い代替手段を提供する、ClickHouse内の組み込みテーブル関数の使用を推奨しています（Postgres、MySQL、MongoDBなど）。
:::

ClickHouseが外部データベースに[ JDBC](https://en.wikipedia.org/wiki/Java_Database_Connectivity)を介して接続できるようにします。

JDBC接続を実装するために、ClickHouseはデーモンとして実行する必要がある別のプログラム[clickhouse-jdbc-bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge)を使用します。

このエンジンは[Nullable](../../../sql-reference/data-types/nullable.md)データ型をサポートしています。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    columns list...
)
ENGINE = JDBC(datasource_uri, external_database, external_table)
```

**エンジンパラメータ**


- `datasource_uri` — 外部DBMSのURIまたは名前。

    URI形式: `jdbc:<driver_name>://<host_name>:<port>/?user=<username>&password=<password>`。  
    MySQLの例: `jdbc:mysql://localhost:3306/?user=root&password=root`。

- `external_database` — 外部DBMS内のデータベース。

- `external_table` — `external_database`内のテーブル名、または`select * from table1 where column1=1`のような選択クエリ。

## 使用例 {#usage-example}

MySQLサーバーにおいて、コンソールクライアントを介して直接テーブルを作成します:

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

ClickHouseサーバーにテーブルを作成し、そこからデータを選択します:

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

## 参照 {#see-also}

- [JDBCテーブル関数](../../../sql-reference/table-functions/jdbc.md)。
