---
slug: /sql-reference/table-functions/mysql
sidebar_position: 137
sidebar_label: mysql
---

# mysql

リモートのMySQLサーバーに保存されているデータに対して`SELECT`および`INSERT`クエリを実行することができます。

**構文**

``` sql
mysql({host:port, database, table, user, password[, replace_query, on_duplicate_clause] | named_collection[, option=value [,..]]})
```

**パラメータ**

- `host:port` — MySQLサーバーのアドレス。
- `database` — リモートのデータベース名。
- `table` — リモートのテーブル名。
- `user` — MySQLユーザー。
- `password` — ユーザーパスワード。
- `replace_query` — `INSERT INTO`クエリを`REPLACE INTO`に変換するフラグ。可能な値：
    - `0` - クエリは`INSERT INTO`として実行されます。
    - `1` - クエリは`REPLACE INTO`として実行されます。
- `on_duplicate_clause` — `INSERT`クエリに追加される`ON DUPLICATE KEY on_duplicate_clause`式。`replace_query = 0`の場合にのみ指定できます（`replace_query = 1`と`on_duplicate_clause`を同時に渡すと、ClickHouseが例外を生成します）。
    例： `INSERT INTO t (c1,c2) VALUES ('a', 2) ON DUPLICATE KEY UPDATE c2 = c2 + 1;`
    ここでの`on_duplicate_clause`は`UPDATE c2 = c2 + 1`です。`ON DUPLICATE KEY`句にどの`on_duplicate_clause`を使用できるかについては、MySQLのドキュメントを参照してください。

引数は、[名前付きコレクション](/operations/named-collections.md)を使って渡すこともできます。この場合、`host`と`port`は別々に指定する必要があります。このアプローチは本番環境で推奨されます。

`WHERE`句の単純な条件（`=, !=, >, >=, <, <=`など）は現在MySQLサーバーで実行されます。

その他の条件や`LIMIT`サンプリング制約は、MySQLへのクエリが完了した後にClickHouseでのみ実行されます。

複数のレプリカをサポートしており、`|`で区切って列挙する必要があります。例えば：

```sql
SELECT name FROM mysql(`mysql{1|2|3}:3306`, 'mysql_database', 'mysql_table', 'user', 'password');
```

または

```sql
SELECT name FROM mysql(`mysql1:3306|mysql2:3306|mysql3:3306`, 'mysql_database', 'mysql_table', 'user', 'password');
```

**返される値**

オリジナルのMySQLテーブルと同じカラムを持つテーブルオブジェクトです。

:::note
MySQLのいくつかのデータ型は異なるClickHouseのデータ型にマッピングできるため、これはクエリレベルの設定[mysql_datatypes_support_level](/operations/settings/settings.md#mysql_datatypes_support_level)によって対処されます。
:::

:::note
`INSERT`クエリにおいてテーブル関数`mysql(...)`とカラム名のリストを持つテーブル名を区別するために、`FUNCTION`または`TABLE FUNCTION`のキーワードを使用する必要があります。以下の例を参照してください。
:::

**例**

MySQLのテーブル：

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

ClickHouseからデータを選択：

``` sql
SELECT * FROM mysql('localhost:3306', 'test', 'test', 'bayonet', '123');
```

または、[名前付きコレクション](/operations/named-collections.md)を使用：

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

置換と挿入：

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

MySQLテーブルからClickHouseテーブルにデータをコピー：

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

または、現在の最大IDに基づいてMySQLから追加のバッチのみをコピーする場合：

```sql
INSERT INTO mysql_copy
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password')
WHERE id > (SELECT max(id) from mysql_copy);
```

**参照**

- [MySQLテーブルエンジン](../../engines/table-engines/integrations/mysql.md)
- [MySQLを辞書ソースとして使用](../../sql-reference/dictionaries/index.md#dictionary-sources#dicts-external_dicts_dict_sources-mysql)
- [mysql_datatypes_support_level](/operations/settings/settings.md#mysql_datatypes_support_level)
- [mysql_map_fixed_string_to_text_in_show_columns](/operations/settings/settings.md#mysql_map_fixed_string_to_text_in_show_columns)
- [mysql_map_string_to_text_in_show_columns](/operations/settings/settings.md#mysql_map_string_to_text_in_show_columns)
- [mysql_max_rows_to_insert](/operations/settings/settings.md#mysql_max_rows_to_insert)
