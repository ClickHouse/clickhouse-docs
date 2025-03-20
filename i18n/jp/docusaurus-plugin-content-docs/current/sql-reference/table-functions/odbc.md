---
slug: /sql-reference/table-functions/odbc
sidebar_position: 150
sidebar_label: odbc
title: "odbc"
description: "ODBCを介して接続されたテーブルを返します。"
---


# odbc テーブル関数

[ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity)を介して接続されたテーブルを返します。

``` sql
odbc(connection_settings, external_database, external_table)
```

パラメータ：

- `connection_settings` — `odbc.ini`ファイル内の接続設定セクションの名前。
- `external_database` — 外部DBMS内のデータベースの名前。
- `external_table` — `external_database`内のテーブルの名前。

ODBC接続を安全に実装するために、ClickHouseは別のプログラム `clickhouse-odbc-bridge` を使用します。ODBCドライバが直接 `clickhouse-server` から読み込まれると、ドライバの問題によりClickHouseサーバがクラッシュすることがあります。ClickHouseは必要に応じて自動的に `clickhouse-odbc-bridge` を起動します。ODBCブリッジプログラムは `clickhouse-server` と同じパッケージからインストールされます。

外部テーブルからの `NULL` 値を持つフィールドは、基本データ型のデフォルト値に変換されます。たとえば、リモートMySQLテーブルのフィールドが `INT NULL` 型の場合、ClickHouseの `Int32` データ型のデフォルト値である0に変換されます。

## 使用例 {#usage-example}

**ODBCを介してローカルMySQLインストールからデータを取得する**

この例は、Ubuntu Linux 18.04およびMySQLサーバ5.7で確認されています。

unixODBCおよびMySQL Connectorがインストールされていることを確認してください。

デフォルトでは（パッケージからインストールされた場合）、ClickHouseはユーザー `clickhouse` として起動します。したがって、このユーザーをMySQLサーバで作成し、構成する必要があります。

``` bash
$ sudo mysql
```

``` sql
mysql> CREATE USER 'clickhouse'@'localhost' IDENTIFIED BY 'clickhouse';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'clickhouse'@'clickhouse' WITH GRANT OPTION;
```

次に、`/etc/odbc.ini` で接続を構成します。

``` bash
$ cat /etc/odbc.ini
[mysqlconn]
DRIVER = /usr/local/lib/libmyodbc5w.so
SERVER = 127.0.0.1
PORT = 3306
DATABASE = test
USERNAME = clickhouse
PASSWORD = clickhouse
```

unixODBCインストールから `isql` ユーティリティを使用して接続を確認できます。

``` bash
$ isql -v mysqlconn
+-------------------------+
| Connected!                            |
|                                       |
...
```

MySQLのテーブル：

``` text
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

ClickHouseでMySQLテーブルからデータを取得する：

``` sql
SELECT * FROM odbc('DSN=mysqlconn', 'test', 'test')
```

``` text
┌─int_id─┬─int_nullable─┬─float─┬─float_nullable─┐
│      1 │            0 │     2 │              0 │
└────────┴──────────────┴───────┴────────────────┘
```

## 参照 {#see-also}

- [ODBC辞書](/sql-reference/dictionaries#dbms)
- [ODBCテーブルエンジン](/engines/table-engines/integrations/odbc).
