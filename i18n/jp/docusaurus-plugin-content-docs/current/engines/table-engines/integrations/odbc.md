---
description: 'ClickHouse が ODBC を介して外部データベースに接続できるようにします。'
sidebar_label: 'ODBC'
sidebar_position: 150
slug: /engines/table-engines/integrations/odbc
title: 'ODBC テーブルエンジン'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# ODBC テーブルエンジン {#odbc-table-engine}

<CloudNotSupportedBadge/>

ClickHouse が [ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity) を介して外部データベースに接続できるようにするエンジンです。

ODBC 接続を安全に実装するために、ClickHouse は別のプログラム `clickhouse-odbc-bridge` を使用します。ODBC ドライバを `clickhouse-server` から直接ロードすると、ドライバ側の問題によって ClickHouse サーバーがクラッシュする可能性があります。ClickHouse は必要に応じて自動的に `clickhouse-odbc-bridge` を起動します。ODBC ブリッジプログラムは `clickhouse-server` と同じパッケージからインストールされます。

このエンジンは [Nullable](../../../sql-reference/data-types/nullable.md) データ型をサポートします。

## テーブルを作成する {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1],
    name2 [type2],
    ...
)
ENGINE = ODBC(datasource, external_database, external_table)
```

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細な説明については、該当ページを参照してください。

テーブル構造は、ソーステーブルの構造と異なっていてもかまいません。

* 列名はソーステーブルと同じである必要がありますが、その一部の列だけを任意の順序で使用できます。
* 列の型は、ソーステーブルとは異なっていてもかまいません。ClickHouse は値を ClickHouse のデータ型に[キャスト](/sql-reference/functions/type-conversion-functions#CAST)しようとします。
* [external&#95;table&#95;functions&#95;use&#95;nulls](/operations/settings/settings#external_table_functions_use_nulls) 設定は、Nullable 列をどのように扱うかを定義します。デフォルト値は 1 です。0 の場合、テーブル関数は Nullable 列を作成せず、null の代わりにデフォルト値を挿入します。これは配列内の NULL 値にも適用されます。

**エンジンパラメータ**

* `datasource` — `odbc.ini` ファイル内の、接続設定が記述されたセクション名。
* `external_database` — 外部 DBMS 内のデータベース名。
* `external_table` — `external_database` 内のテーブル名。

これらのパラメータは、[named collections](operations/named-collections.md) を使用して指定することもできます。


## 使用例 {#usage-example}

**ODBC を介してローカルの MySQL インストールからデータを取得する**

この例は Ubuntu Linux 18.04 と MySQL サーバー 5.7 で動作確認されています。

unixODBC と MySQL Connector がインストールされていることを確認してください。

デフォルトでは（パッケージからインストールした場合）、ClickHouse はユーザー `clickhouse` として起動します。そのため、MySQL サーバーでこのユーザーを作成し、適切に設定する必要があります。

```bash
$ sudo mysql
```

```sql
mysql> CREATE USER 'clickhouse'@'localhost' IDENTIFIED BY 'clickhouse';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'clickhouse'@'localhost' WITH GRANT OPTION;
```

その後、`/etc/odbc.ini` で接続を設定します。

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

unixODBC のインストールに含まれる `isql` ユーティリティを使用して、接続をテストできます。

```bash
$ isql -v mysqlconn
+-------------------------+
| Connected!                            |
|                                       |
...
```

MySQL のテーブル:

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

MySQL テーブルからデータを取得する ClickHouse テーブル:

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

- [ODBC 辞書](/sql-reference/dictionaries#mysql)
- [ODBC テーブル関数](../../../sql-reference/table-functions/odbc.md)