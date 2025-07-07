---
'description': 'ODBC で接続されたテーブルを返します。'
'sidebar_label': 'ODBC'
'sidebar_position': 150
'slug': '/sql-reference/table-functions/odbc'
'title': 'odbc'
---




# odbc テーブル関数

[ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity)を介して接続されたテーブルを返します。

## 構文 {#syntax}

```sql
odbc(connection_settings, external_database, external_table)
```

## 引数 {#arguments}

| 引数                  | 説明                                                              |
|-----------------------|-------------------------------------------------------------------|
| `connection_settings` | `odbc.ini`ファイル内の接続設定のセクション名。                        |
| `external_database`   | 外部DBMS内のデータベース名。                                        |
| `external_table`      | `external_database`内のテーブル名。                                |

ODBC接続を安全に実装するために、ClickHouseは別のプログラム `clickhouse-odbc-bridge`を使用します。ODBCドライバが `clickhouse-server`から直接ロードされた場合、ドライバの問題がClickHouseサーバーをクラッシュさせる可能性があります。ClickHouseは必要なときに自動的に `clickhouse-odbc-bridge`を起動します。ODBCブリッジプログラムは、`clickhouse-server`と同じパッケージからインストールされます。

外部テーブルからの `NULL`値を持つフィールドは、基本データ型のデフォルト値に変換されます。たとえば、リモートMySQLテーブルのフィールドが `INT NULL`型の場合、ClickHouseの `Int32`データ型のデフォルト値である0に変換されます。

## 使用例 {#usage-example}

**ODBCを介してローカルMySQLインストールからデータを取得する**

この例はUbuntu Linux 18.04およびMySQLサーバー5.7で確認されています。

unixODBCおよびMySQL Connectorがインストールされていることを確認してください。

デフォルトでは（パッケージからインストールされた場合）、ClickHouseはユーザー `clickhouse`として起動します。したがって、MySQLサーバーでこのユーザーを作成して設定する必要があります。

```bash
$ sudo mysql
```

```sql
mysql> CREATE USER 'clickhouse'@'localhost' IDENTIFIED BY 'clickhouse';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'clickhouse'@'clickhouse' WITH GRANT OPTION;
```

次に、`/etc/odbc.ini` に接続を設定します。

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

unixODBCインストールの `isql`ユーティリティを使用して接続を確認できます。

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

ClickHouseでのMySQLテーブルからのデータ取得:

```sql
SELECT * FROM odbc('DSN=mysqlconn', 'test', 'test')
```

```text
┌─int_id─┬─int_nullable─┬─float─┬─float_nullable─┐
│      1 │            0 │     2 │              0 │
└────────┴──────────────┴───────┴────────────────┘
```

## 関連 {#see-also}

- [ODBC 辞書](/sql-reference/dictionaries#dbms)
- [ODBC テーブルエンジン](/engines/table-engines/integrations/odbc).
