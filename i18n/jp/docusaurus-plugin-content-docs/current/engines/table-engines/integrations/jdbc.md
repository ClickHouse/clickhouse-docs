---
description: 'ClickHouseがJDBCを介して外部データベースに接続できるようにします。'
sidebar_label: 'JDBC'
sidebar_position: 100
slug: /engines/table-engines/integrations/jdbc
title: 'JDBCテーブルエンジン'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# JDBC テーブルエンジン

<CloudNotSupportedBadge/>

:::note
clickhouse-jdbc-bridge には実験的なコードが含まれており、既にサポートされていません。信頼性の問題やセキュリティ上の脆弱性を含んでいる可能性があります。自己責任で使用してください。 
ClickHouse では、アドホッククエリのユースケース（Postgres、MySQL、MongoDB など）に対してより優れた代替手段を提供する、ClickHouse に組み込まれているテーブル関数を使用することを推奨します。
:::

ClickHouse が [JDBC](https://en.wikipedia.org/wiki/Java_Database_Connectivity) を介して外部データベースに接続できるようにするエンジンです。

JDBC 接続を実装するために、ClickHouse はデーモンとして実行される必要がある別のプログラム [clickhouse-jdbc-bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) を使用します。

このエンジンは [Nullable](../../../sql-reference/data-types/nullable.md) データ型をサポートします。



## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    columns list...
)
ENGINE = JDBC(datasource, external_database, external_table)
```

**エンジンパラメータ**

- `datasource` — 外部DBMSのURIまたは名前。

  URI形式: `jdbc:<driver_name>://<host_name>:<port>/?user=<username>&password=<password>`。
  MySQLの例: `jdbc:mysql://localhost:3306/?user=root&password=root`。

- `external_database` — 外部DBMS内のデータベース名、または明示的に定義されたテーブルスキーマ(例を参照)。

- `external_table` — 外部データベース内のテーブル名、または`select * from table1 where column1=1`のようなselectクエリ。

- これらのパラメータは[名前付きコレクション](operations/named-collections.md)を使用して渡すこともできます。


## 使用例 {#usage-example}

MySQLサーバーのコンソールクライアントに直接接続してテーブルを作成する：

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

ClickHouseサーバーでテーブルを作成し、データを選択する：

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


## 関連項目 {#see-also}

- [JDBCテーブル関数](../../../sql-reference/table-functions/jdbc.md)
