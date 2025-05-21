---
description: 'MySQLテーブルエンジンのドキュメント'
sidebar_label: 'MySQL'
sidebar_position: 138
slug: /engines/table-engines/integrations/mysql
title: 'MySQLエンジンを使用すると、リモートMySQLサーバーに保存されたデータに対して `SELECT` および `INSERT` クエリを実行できます。'
---


# MySQL テーブルエンジン

MySQLエンジンを使用すると、リモートMySQLサーバーに保存されたデータに対して `SELECT` および `INSERT` クエリを実行できます。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = MySQL({host:port, database, table, user, password[, replace_query, on_duplicate_clause] | named_collection[, option=value [,..]]})
SETTINGS
    [ connection_pool_size=16, ]
    [ connection_max_tries=3, ]
    [ connection_wait_timeout=5, ]
    [ connection_auto_close=true, ]
    [ connect_timeout=10, ]
    [ read_write_timeout=300 ]
;
```

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細な説明を参照してください。

テーブル構造は元のMySQLテーブル構造と異なる場合があります：

- カラム名は元のMySQLテーブルと同じである必要がありますが、これらのカラムの一部だけを使用し、任意の順序で使用できます。
- カラムタイプは元のMySQLテーブルのものと異なる場合があります。ClickHouseは値をClickHouseデータ型に[キャスト](../../../engines/database-engines/mysql.md#data_types-support)しようとします。
- [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls) 設定はNullableカラムをどのように処理するかを定義します。デフォルト値：1。0の場合、テーブル関数はNullableカラムを作成せず、nullの代わりにデフォルト値を挿入します。これは配列内のNULL値にも適用されます。

**エンジンパラメータ**

- `host:port` — MySQLサーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — MySQLユーザー。
- `password` — ユーザーパスワード。
- `replace_query` — `INSERT INTO` クエリを `REPLACE INTO` に変換するフラグ。`replace_query=1` の場合、クエリが置き換えられます。
- `on_duplicate_clause` — `INSERT` クエリに追加される `ON DUPLICATE KEY on_duplicate_clause` 式。
    例：`INSERT INTO t (c1,c2) VALUES ('a', 2) ON DUPLICATE KEY UPDATE c2 = c2 + 1` の場合、`on_duplicate_clause` は `UPDATE c2 = c2 + 1` です。`ON DUPLICATE KEY` 句で使用できる `on_duplicate_clause` を見つけるには、[MySQLドキュメント](https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html) を参照してください。
    `on_duplicate_clause` を指定するには、`replace_query` パラメータに `0` を渡す必要があります。`replace_query = 1` と `on_duplicate_clause` を同時に渡すと、ClickHouseは例外を生成します。

引数は[named collections](/operations/named-collections.md)を使用して渡すこともできます。この場合、`host` および `port` は別々に指定する必要があります。このアプローチは本番環境で推奨されます。

`=, !=, >, >=, <, <=`のような単純な `WHERE` 条件はMySQLサーバーで実行されます。

残りの条件と `LIMIT` サンプリング制約は、MySQLへのクエリが完了した後にのみClickHouseで実行されます。

複数のレプリカを指定することもできます。これらは `|` で区切ります。例えば：

```sql
CREATE TABLE test_replicas (id UInt32, name String, age UInt32, money UInt32) ENGINE = MySQL(`mysql{2|3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

## 使用例 {#usage-example}

MySQLにテーブルを作成します：

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

ClickHouseで平易な引数を使用してテーブルを作成します：

```sql
CREATE TABLE mysql_table
(
    `float_nullable` Nullable(Float32),
    `int_id` Int32
)
ENGINE = MySQL('localhost:3306', 'test', 'test', 'bayonet', '123')
```

または[named collections](/operations/named-collections.md)を使用します：

```sql
CREATE NAMED COLLECTION creds AS
        host = 'localhost',
        port = 3306,
        database = 'test',
        user = 'bayonet',
        password = '123';
CREATE TABLE mysql_table
(
    `float_nullable` Nullable(Float32),
    `int_id` Int32
)
ENGINE = MySQL(creds, table='test')
```

MySQLテーブルからデータを取得します：

```sql
SELECT * FROM mysql_table
```

```text
┌─float_nullable─┬─int_id─┐
│           ᴺᵁᴸᴸ │      1 │
└────────────────┴────────┘
```

## 設定 {#mysql-settings}

デフォルトの設定はあまり効率的ではなく、接続を再利用すらしません。これらの設定を使用することで、サーバーが1秒あたりに実行するクエリの数を増やすことができます。

### connection_auto_close {#connection-auto-close}

クエリ実行後に接続を自動的に閉じることを可能にし、接続再利用を無効にします。

可能な値：

- 1 — 自動接続閉鎖が許可されているため、接続再利用は無効です。
- 0 — 自動接続閉鎖は許可されていないため、接続再利用は有効です。

デフォルト値: `1`.

### connection_max_tries {#connection-max-tries}

フェイルオーバー用プールの再試行回数を設定します。

可能な値：

- 正の整数。
- 0 — フェイルオーバー用プールに対する再試行はありません。

デフォルト値: `3`.

### connection_pool_size {#connection-pool-size}

接続プールのサイズ（すべての接続が使用中の場合、クエリはどの接続かが解放されるまで待機します）。

可能な値：

- 正の整数。

デフォルト値: `16`.

### connection_wait_timeout {#connection-wait-timeout}

無料の接続を待機するためのタイムアウト（秒単位）（activeな connection_pool_size の接続がすでに存在する場合）、0 - 待機しない。

可能な値：

- 正の整数。

デフォルト値: `5`.

### connect_timeout {#connect-timeout}

接続タイムアウト（秒単位）。

可能な値：

- 正の整数。

デフォルト値: `10`.

### read_write_timeout {#read-write-timeout}

読み取り/書き込みタイムアウト（秒単位）。

可能な値：

- 正の整数。

デフォルト値: `300`.

## 参照 {#see-also}

- [MySQLテーブル機能](../../../sql-reference/table-functions/mysql.md)
- [辞書ソースとしてMySQLを使用する](/sql-reference/dictionaries#mysql)
