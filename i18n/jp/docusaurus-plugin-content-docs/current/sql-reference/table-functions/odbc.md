---
description: 'ODBC を介して接続されているテーブルを返します。'
sidebar_label: 'odbc'
sidebar_position: 150
slug: /sql-reference/table-functions/odbc
title: 'odbc'
doc_type: 'reference'
---



# odbc テーブル関数

[ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity) 経由で接続されたテーブルを返します。



## 構文 {#syntax}

```sql
odbc(datasource, external_database, external_table)
odbc(datasource, external_table)
odbc(named_collection)
```


## 引数 {#arguments}

| 引数                | 説明                                                                  |
| ------------------- | -------------------------------------------------------------------- |
| `datasource`        | `odbc.ini`ファイル内の接続設定を含むセクションの名前。                        |
| `external_database` | 外部DBMS内のデータベース名。                                        |
| `external_table`    | `external_database`内のテーブル名。                                |

これらのパラメータは[名前付きコレクション](operations/named-collections.md)を使用して渡すこともできます。

ODBC接続を安全に実装するため、ClickHouseは独立したプログラム`clickhouse-odbc-bridge`を使用します。ODBCドライバが`clickhouse-server`から直接読み込まれると、ドライバの問題によってClickHouseサーバがクラッシュする可能性があります。ClickHouseは必要に応じて`clickhouse-odbc-bridge`を自動的に起動します。ODBCブリッジプログラムは`clickhouse-server`と同じパッケージからインストールされます。

外部テーブルの`NULL`値を持つフィールドは、基本データ型のデフォルト値に変換されます。例えば、リモートのMySQLテーブルフィールドが`INT NULL`型の場合、0(ClickHouseの`Int32`データ型のデフォルト値)に変換されます。


## 使用例 {#usage-example}

**ODBC経由でローカルのMySQLインストールからデータを取得する**

この例はUbuntu Linux 18.04およびMySQLサーバー5.7で検証されています。

unixODBCとMySQL Connectorがインストールされていることを確認してください。

デフォルトでは(パッケージからインストールした場合)、ClickHouseはユーザー`clickhouse`として起動します。そのため、MySQLサーバーでこのユーザーを作成して設定する必要があります。

```bash
$ sudo mysql
```

```sql
mysql> CREATE USER 'clickhouse'@'localhost' IDENTIFIED BY 'clickhouse';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'clickhouse'@'clickhouse' WITH GRANT OPTION;
```

次に、`/etc/odbc.ini`で接続を設定します。

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

MySQLのテーブル:

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


## 関連項目 {#see-also}

- [ODBC辞書](/sql-reference/dictionaries#dbms)
- [ODBCテーブルエンジン](/engines/table-engines/integrations/odbc)
