---
'description': 'ClickHouseがODBCを介して外部データベースに接続することを許可します。'
'sidebar_label': 'ODBC'
'sidebar_position': 150
'slug': '/engines/table-engines/integrations/odbc'
'title': 'ODBC'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# ODBC

<CloudNotSupportedBadge/>

ClickHouseは、[ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity)を介して外部データベースに接続することができます。

ODBC接続を安全に実装するために、ClickHouseは別のプログラム`clickhouse-odbc-bridge`を使用します。 ODBCドライバーが`clickhouse-server`から直接読み込まれる場合、ドライバーの問題がClickHouseサーバをクラッシュさせる可能性があります。 ClickHouseは、必要に応じて自動的に`clickhouse-odbc-bridge`を起動します。 ODBCブリッジプログラムは、`clickhouse-server`と同じパッケージからインストールされます。

このエンジンは、[Nullable](../../../sql-reference/data-types/nullable.md)データ型をサポートしています。

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

[CREATE TABLE](/sql-reference/statements/create/table)クエリの詳細な説明を参照してください。

テーブル構造は、ソーステーブルの構造と異なる場合があります：

- カラム名はソーステーブルと同じである必要がありますが、これらのカラムの一部のみを使用し、任意の順序で配置することができます。
- カラムの型は、ソーステーブルの型と異なる場合があります。 ClickHouseは、値をClickHouseデータ型に[キャスト](/sql-reference/functions/type-conversion-functions#cast)しようとします。
- [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls)設定は、Nullableカラムの扱いを定義します。 デフォルト値：1。 0の場合、テーブル関数はNullableカラムを作成せず、nullの代わりにデフォルト値を挿入します。 これは、配列内のNULL値にも適用されます。

**エンジンパラメータ**

- `datasource` — `odbc.ini`ファイル内の接続設定セクションの名前。
- `external_database` — 外部DBMS内のデータベースの名前。
- `external_table` — `external_database`内のテーブルの名前。

これらのパラメータは、[名前付きコレクション](operations/named-collections.md)を使用して渡すこともできます。

## 使用例 {#usage-example}

**ODBCを介してローカルのMySQLインストールからデータを取得する**

この例は、Ubuntu Linux 18.04およびMySQLサーバ5.7で確認されています。

unixODBCとMySQL Connectorがインストールされていることを確認してください。

デフォルトでは（パッケージからインストールされた場合）、ClickHouseはユーザー`clickhouse`として起動します。 そのため、このユーザーをMySQLサーバで作成し、構成する必要があります。

```bash
$ sudo mysql
```

```sql
mysql> CREATE USER 'clickhouse'@'localhost' IDENTIFIED BY 'clickhouse';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'clickhouse'@'localhost' WITH GRANT OPTION;
```

次に、`/etc/odbc.ini`で接続を構成します。

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

unixODBCインストールからの`isql`ユーティリティを使用して接続を確認できます。

```bash
$ isql -v mysqlconn
+-------------------------+
| Connected!                            |
|                                       |
...
```

MySQLのテーブル：

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

ClickHouseのテーブル、MySQLテーブルからデータを取得：

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

## 参照 {#see-also}

- [ODBC辞書](/sql-reference/dictionaries#mysql)
- [ODBCテーブル関数](../../../sql-reference/table-functions/odbc.md)
