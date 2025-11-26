---
description: 'ODBC を介して接続されたテーブルを返します。'
sidebar_label: 'odbc'
sidebar_position: 150
slug: /sql-reference/table-functions/odbc
title: 'odbc'
doc_type: 'reference'
---



# odbc テーブル関数

[ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity) 経由で接続されたテーブルを返します。



## 構文

```sql
odbc(データソース, 外部データベース, 外部テーブル)
odbc(データソース, 外部テーブル)
odbc(名前付きコレクション)
```


## 引数 {#arguments}

| Argument            | Description                                                            |
|---------------------|------------------------------------------------------------------------|
| `datasource` | `odbc.ini` ファイル内の接続設定セクション名。 |
| `external_database` | 外部 DBMS 内のデータベース名。                                |
| `external_table`    | `external_database` 内のテーブル名。                            |

これらのパラメータは、[named collections](operations/named-collections.md) を使用して渡すこともできます。

ODBC 接続を安全に実装するために、ClickHouse は別プログラムである `clickhouse-odbc-bridge` を使用します。ODBC ドライバを `clickhouse-server` から直接ロードすると、ドライバの問題によって ClickHouse サーバーがクラッシュする可能性があります。ClickHouse は必要に応じて自動的に `clickhouse-odbc-bridge` を起動します。ODBC ブリッジプログラムは、`clickhouse-server` と同じパッケージからインストールされます。

外部テーブルのうち値が `NULL` のフィールドは、基になるデータ型のデフォルト値に変換されます。たとえば、リモートの MySQL テーブルフィールドが `INT NULL` 型の場合、0（ClickHouse の `Int32` データ型におけるデフォルト値）に変換されます。



## 使用例

**ODBC を介してローカルの MySQL インストールからデータを取得する**

この例は Ubuntu Linux 18.04 および MySQL サーバー 5.7 で動作確認されています。

`unixODBC` と MySQL Connector がインストールされていることを確認します。

デフォルトでは (パッケージからインストールした場合)、ClickHouse はユーザー `clickhouse` として起動します。したがって、MySQL サーバー側でこのユーザーを作成し、構成する必要があります。

```bash
$ sudo mysql
```

```sql
mysql> CREATE USER 'clickhouse'@'localhost' IDENTIFIED BY 'clickhouse';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'clickhouse'@'clickhouse' WITH GRANT OPTION;
```

次に、`/etc/odbc.ini` で接続設定を行います。

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

unixODBC のインストールに含まれる `isql` ユーティリティを使用して接続を確認できます。

```bash
$ isql -v mysqlconn
+-------------------------+
| 接続しました!                            |
|                                       |
...
```

MySQL のテーブル：

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

ClickHouse で MySQL テーブルからデータを取得する:

```sql
SELECT * FROM odbc('DSN=mysqlconn', 'test', 'test')
```

```text
┌─int_id─┬─int_nullable─┬─float─┬─float_nullable─┐
│      1 │            0 │     2 │              0 │
└────────┴──────────────┴───────┴────────────────┘
```


## 関連項目 {#see-also}

- [ODBC 辞書](/sql-reference/dictionaries#dbms)
- [ODBC テーブルエンジン](/engines/table-engines/integrations/odbc)
