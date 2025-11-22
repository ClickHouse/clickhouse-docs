---
description: 'ClickHouse が ODBC を介して外部データベースに接続できるようにします。'
sidebar_label: 'ODBC'
sidebar_position: 150
slug: /engines/table-engines/integrations/odbc
title: 'ODBC テーブルエンジン'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# ODBC テーブルエンジン

<CloudNotSupportedBadge/>

ClickHouse が [ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity) を介して外部データベースに接続できるようにします。

ODBC 接続を安全に実装するために、ClickHouse は別のプログラム `clickhouse-odbc-bridge` を使用します。ODBC ドライバが `clickhouse-server` から直接ロードされる場合、ドライバの問題によって ClickHouse サーバーがクラッシュする可能性があります。ClickHouse は必要に応じて自動的に `clickhouse-odbc-bridge` を起動します。ODBC ブリッジプログラムは、`clickhouse-server` と同じパッケージからインストールされます。

このエンジンは [Nullable](../../../sql-reference/data-types/nullable.md) データ型をサポートします。



## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1],
    name2 [type2],
    ...
)
ENGINE = ODBC(datasource, external_database, external_table)
```

[CREATE TABLE](/sql-reference/statements/create/table)クエリの詳細については、こちらを参照してください。

テーブル構造はソーステーブルの構造と異なっていても構いません:

- カラム名はソーステーブルと同じである必要がありますが、一部のカラムのみを任意の順序で使用できます。
- カラム型はソーステーブルと異なっていても構いません。ClickHouseは値をClickHouseデータ型に[キャスト](/sql-reference/functions/type-conversion-functions#cast)しようとします。
- [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls)設定は、Nullableカラムの処理方法を定義します。デフォルト値: 1。0の場合、テーブル関数はNullableカラムを作成せず、nullの代わりにデフォルト値を挿入します。これは配列内のNULL値にも適用されます。

**エンジンパラメータ**

- `datasource` — `odbc.ini`ファイル内の接続設定セクションの名前。
- `external_database` — 外部DBMS内のデータベース名。
- `external_table` — `external_database`内のテーブル名。

これらのパラメータは[名前付きコレクション](operations/named-collections.md)を使用して渡すこともできます。


## 使用例 {#usage-example}

**ODBC経由でローカルのMySQLインストールからデータを取得する**

この例はUbuntu Linux 18.04およびMySQLサーバー5.7で検証されています。

unixODBCとMySQL Connectorがインストールされていることを確認してください。

デフォルトでは(パッケージからインストールした場合)、ClickHouseはユーザー`clickhouse`として起動します。したがって、MySQLサーバーでこのユーザーを作成および設定する必要があります。

```bash
$ sudo mysql
```

```sql
mysql> CREATE USER 'clickhouse'@'localhost' IDENTIFIED BY 'clickhouse';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'clickhouse'@'localhost' WITH GRANT OPTION;
```

次に、`/etc/odbc.ini`で接続を設定します。

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

unixODBCインストールの`isql`ユーティリティを使用して接続を確認できます。

```bash
$ isql -v mysqlconn
+-------------------------+
| Connected!                            |
|                                       |
...
```

MySQLのテーブル:

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

ClickHouseのテーブル、MySQLテーブルからデータを取得:

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


## 関連項目 {#see-also}

- [ODBC ディクショナリ](/sql-reference/dictionaries#mysql)
- [ODBC テーブル関数](../../../sql-reference/table-functions/odbc.md)
