---
slug: /sql-reference/table-functions/mysql
sidebar_position: 137
sidebar_label: mysql
title: "mysql"
description: "リモートMySQLサーバーに保存されたデータに対して`SELECT`および`INSERT`クエリを実行することを許可します。"
---


# mysql テーブル関数

リモートMySQLサーバーに保存されたデータに対して`SELECT`および`INSERT`クエリを実行することを許可します。

**構文**

``` sql
mysql({host:port, database, table, user, password[, replace_query, on_duplicate_clause] | named_collection[, option=value [,..]]})
```

**パラメータ**

- `host:port` — MySQLサーバーアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — MySQLユーザー。
- `password` — ユーザーパスワード。
- `replace_query` — `INSERT INTO`クエリを`REPLACE INTO`に変換するフラグ。可能な値:
    - `0` - クエリは`INSERT INTO`として実行される。
    - `1` - クエリは`REPLACE INTO`として実行される。
- `on_duplicate_clause` — `INSERT`クエリに追加される`ON DUPLICATE KEY on_duplicate_clause`式。`replace_query = 0`の時のみ指定可能です（同時に`replace_query = 1`と`on_duplicate_clause`を渡すと、ClickHouseは例外を生成します）。
    例: `INSERT INTO t (c1,c2) VALUES ('a', 2) ON DUPLICATE KEY UPDATE c2 = c2 + 1;`
    ここで`on_duplicate_clause`は`UPDATE c2 = c2 + 1`です。どの`on_duplicate_clause`が`ON DUPLICATE KEY`句で使用できるかはMySQLのドキュメントを参照してください。

引数は、[named collections](operations/named-collections.md)を使用しても渡すことができます。この場合、`host`と`port`は別々に指定する必要があります。このアプローチはプロダクション環境で推奨されます。

`=, !=, >, >=, <, <=`などのシンプルな`WHERE`句は現在MySQLサーバー上で実行されます。

残りの条件や`LIMIT`サンプリング制約は、クエリがMySQLに終わった後にClickHouseでのみ実行されます。

複数のレプリカをサポートしており、`|`でリストする必要があります。例:

```sql
SELECT name FROM mysql(`mysql{1|2|3}:3306`, 'mysql_database', 'mysql_table', 'user', 'password');
```

または

```sql
SELECT name FROM mysql(`mysql1:3306|mysql2:3306|mysql3:3306`, 'mysql_database', 'mysql_table', 'user', 'password');
```

**返される値**

元のMySQLテーブルと同じカラムを持つテーブルオブジェクト。

:::note
MySQLの一部のデータ型は異なるClickHouseのデータ型にマッピングできる - これはクエリレベル設定[mysql_datatypes_support_level](operations/settings/settings.md#mysql_datatypes_support_level)で対応されます。
:::

:::note
`INSERT`クエリにおいて、テーブル関数`mysql(...)`とカラム名のリストを持つテーブル名を区別するために、`FUNCTION`または`TABLE FUNCTION`のキーワードを使用しなければなりません。以下の例を参照してください。
:::

**例**

MySQLでのテーブル:

``` text
mysql> CREATE TABLE `test`.`test` (
    ->   `int_id` INT NOT NULL AUTO_INCREMENT,
    ->   `float` FLOAT NOT NULL,
    ->   PRIMARY KEY (`int_id`));

mysql> INSERT INTO test (`int_id`, `float`) VALUES (1,2);

mysql> SELECT * FROM test;
+--------+-------+
| int_id | float |
+--------+-------+
|      1 |     2 |
+--------+-------+
```

ClickHouseからデータを選択:

``` sql
SELECT * FROM mysql('localhost:3306', 'test', 'test', 'bayonet', '123');
```

または[named collections](operations/named-collections.md)を使用:

```sql
CREATE NAMED COLLECTION creds AS
        host = 'localhost',
        port = 3306,
        database = 'test',
        user = 'bayonet',
        password = '123';
SELECT * FROM mysql(creds, table='test');
```

``` text
┌─int_id─┬─float─┐
│      1 │     2 │
└────────┴───────┘
```

置き換えと挿入:

```sql
INSERT INTO FUNCTION mysql('localhost:3306', 'test', 'test', 'bayonet', '123', 1) (int_id, float) VALUES (1, 3);
INSERT INTO TABLE FUNCTION mysql('localhost:3306', 'test', 'test', 'bayonet', '123', 0, 'UPDATE int_id = int_id + 1') (int_id, float) VALUES (1, 4);
SELECT * FROM mysql('localhost:3306', 'test', 'test', 'bayonet', '123');
```

``` text
┌─int_id─┬─float─┐
│      1 │     3 │
│      2 │     4 │
└────────┴───────┘
```

MySQLテーブルからClickHouseテーブルへデータをコピー:

```sql
CREATE TABLE mysql_copy
(
   `id` UInt64,
   `datetime` DateTime('UTC'),
   `description` String,
)
ENGINE = MergeTree
ORDER BY (id,datetime);

INSERT INTO mysql_copy
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');
```

または、現在の最大idに基づいてMySQLからインクリメンタルバッチのみをコピーする場合:

```sql
INSERT INTO mysql_copy
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password')
WHERE id > (SELECT max(id) from mysql_copy);
```

**関連情報**

- [ 'MySQL' テーブルエンジン](../../engines/table-engines/integrations/mysql.md)
- [MySQLを辞書ソースとして使用](../../sql-reference/dictionaries/index.md#dictionary-sources#dicts-external_dicts_dict_sources-mysql)
- [mysql_datatypes_support_level](operations/settings/settings.md#mysql_datatypes_support_level)
- [mysql_map_fixed_string_to_text_in_show_columns](operations/settings/settings.md#mysql_map_fixed_string_to_text_in_show_columns)
- [mysql_map_string_to_text_in_show_columns](operations/settings/settings.md#mysql_map_string_to_text_in_show_columns)
- [mysql_max_rows_to_insert](operations/settings/settings.md#mysql_max_rows_to_insert)
