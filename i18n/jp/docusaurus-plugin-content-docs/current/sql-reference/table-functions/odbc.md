---
description: 'ODBC経由で接続されているテーブルを返します。'
sidebar_label: 'odbc'
sidebar_position: 150
slug: /sql-reference/table-functions/odbc
title: 'odbc'
---


# odbc テーブル関数

[ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity) 経由で接続されているテーブルを返します。

```sql
odbc(connection_settings, external_database, external_table)
```

パラメータ:

- `connection_settings` — `odbc.ini` ファイル内の接続設定を含むセクションの名前。
- `external_database` — 外部DBMS内のデータベースの名前。
- `external_table` — `external_database`内のテーブルの名前。

ODBC接続を安全に実装するために、ClickHouseは`clickhouse-odbc-bridge`という別のプログラムを使用します。 ODBCドライバが`clickhouse-server`から直接読み込まれると、ドライバの問題がClickHouseサーバーをクラッシュさせる可能性があります。 ClickHouseは必要に応じて自動的に`clickhouse-odbc-bridge`を起動します。 ODBCブリッジプログラムは`clickhouse-server`と同じパッケージからインストールされます。

外部テーブルからの`NULL`値を持つフィールドは、基本データ型のデフォルト値に変換されます。 たとえば、リモートMySQLテーブルフィールドが`INT NULL`タイプの場合、これはClickHouseの`Int32`データ型のデフォルト値である0に変換されます。

## 使用例 {#usage-example}

**ODBC経由でローカルMySQLインストールからデータを取得する**

この例は、Ubuntu Linux 18.04およびMySQLサーバー5.7で確認されています。

unixODBCとMySQLコネクタがインストールされていることを確認してください。

デフォルトでは（パッケージからインストールした場合）、ClickHouseはユーザー`clickhouse`として起動します。 したがって、このユーザーをMySQLサーバーで作成および構成する必要があります。

```bash
$ sudo mysql
```

```sql
mysql> CREATE USER 'clickhouse'@'localhost' IDENTIFIED BY 'clickhouse';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'clickhouse'@'clickhouse' WITH GRANT OPTION;
```

次に、`/etc/odbc.ini`で接続を構成します。

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

unixODBCインストールの`isql`ユーティリティを使用して接続を確認できます。

```bash
$ isql -v mysqlconn
+-------------------------+
| Connected!                            |
|                                       |
...
```

MySQL内のテーブル:

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

ClickHouseでMySQLテーブルからデータを取得する:

```sql
SELECT * FROM odbc('DSN=mysqlconn', 'test', 'test')
```

```text
┌─int_id─┬─int_nullable─┬─float─┬─float_nullable─┐
│      1 │            0 │     2 │              0 │
└────────┴──────────────┴───────┴────────────────┘
```

## 参照 {#see-also}

- [ODBC辞書](/sql-reference/dictionaries#dbms)
- [ODBCテーブルエンジン](/engines/table-engines/integrations/odbc)。
