---
slug: /engines/table-engines/integrations/mysql
sidebar_position: 138
sidebar_label: MySQL
title: "MySQLエンジンを使用すると、リモートMySQLサーバーに保存されているデータに対して`SELECT`および`INSERT`クエリを実行できます。"
---

# MySQLテーブルエンジン

MySQLエンジンを使用すると、リモートMySQLサーバーに保存されているデータに対して`SELECT`および`INSERT`クエリを実行できます。

## テーブルの作成 {#creating-a-table}

``` sql
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

[CREATE TABLE](../../../sql-reference/statements/create/table.md#create-table-query)クエリの詳細な説明を参照してください。

テーブル構造は元のMySQLテーブル構造と異なる場合があります：

- カラム名は元のMySQLテーブルと同じである必要がありますが、これらのカラムの一部のみを使用してもよく、順序も自由です。
- カラムタイプは元のMySQLテーブルのものと異なる場合があります。ClickHouseは、値をClickHouseデータ型に[キャスト](../../../engines/database-engines/mysql.md#data_types-support)しようとします。
- [external_table_functions_use_nulls](../../../operations/settings/settings.md#external-table-functions-use-nulls)設定は、Nullableカラムの扱いを定義します。デフォルト値：1。0の場合、テーブル関数はNullableカラムを作成せず、nullの代わりにデフォルト値を挿入します。これは配列内のNULL値にも適用されます。

:::note
MySQLテーブルエンジンは現在、MacOS向けのClickHouseビルドでは使用できません（[issue](https://github.com/ClickHouse/ClickHouse/issues/21191)）。
:::

**エンジンパラメータ**

- `host:port` — MySQLサーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — MySQLユーザー。
- `password` — ユーザーパスワード。
- `replace_query` — `INSERT INTO`クエリを`REPLACE INTO`に変換するフラグ。`replace_query=1`の場合、クエリが置き換えられます。
- `on_duplicate_clause` — `INSERT`クエリに追加される`ON DUPLICATE KEY on_duplicate_clause`式。
    例：`INSERT INTO t (c1,c2) VALUES ('a', 2) ON DUPLICATE KEY UPDATE c2 = c2 + 1`、ここで`on_duplicate_clause`は`UPDATE c2 = c2 + 1`です。`ON DUPLICATE KEY`句で使用可能な`on_duplicate_clause`については、[MySQLドキュメント](https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html)を参照してください。
    `on_duplicate_clause`を指定するには、`replace_query`パラメータに`0`を渡す必要があります。同時に`replace_query = 1`と`on_duplicate_clause`を渡すと、ClickHouseは例外を生成します。

引数も[名前付きコレクション](/operations/named-collections.md)を使用して渡すことができます。この場合、`host`と`port`は別々に指定する必要があります。このアプローチは、本番環境で推奨されます。

`=, !=, >, >=, <, <=`といったシンプルな`WHERE`句は、MySQLサーバー上で実行されます。

残りの条件と`LIMIT`サンプリング制約は、MySQLへのクエリが終了した後にのみClickHouseで実行されます。

複数のレプリカをサポートしており、`|`で列挙する必要があります。例えば：

```sql
CREATE TABLE test_replicas (id UInt32, name String, age UInt32, money UInt32) ENGINE = MySQL(`mysql{2|3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

## 使用例 {#usage-example}

MySQLにテーブルを作成します：

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

ClickHouseで引数を使用してテーブルを作成します：

``` sql
CREATE TABLE mysql_table
(
    `float_nullable` Nullable(Float32),
    `int_id` Int32
)
ENGINE = MySQL('localhost:3306', 'test', 'test', 'bayonet', '123')
```

または、[名前付きコレクション](/operations/named-collections.md)を使用して：

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

``` sql
SELECT * FROM mysql_table
```

``` text
┌─float_nullable─┬─int_id─┐
│           ᴺᵁᴸᴸ │      1 │
└────────────────┴────────┘
```

## 設定 {#mysql-settings}

デフォルトの設定は非常に効率的ではなく、接続を再利用さえしません。これらの設定により、サーバーが1秒間に実行するクエリの数を増やすことができます。

### connection_auto_close {#connection-auto-close}

クエリ実行後に接続を自動的に閉じることを許可します。つまり、接続の再利用を無効にします。

可能な値：

- 1 — 自動閉鎖接続が許可されており、接続の再利用が無効です。
- 0 — 自動閉鎖接続が許可されておらず、接続の再利用が有効です。

デフォルト値：`1`。

### connection_max_tries {#connection-max-tries}

フェイルオーバー用のプールの再試行回数を設定します。

可能な値：

- 正の整数。
- 0 — フェイルオーバープールの再試行はありません。

デフォルト値：`3`。

### connection_pool_size {#connection-pool-size}

接続プールのサイズ（すべての接続が使用中の場合、クエリは接続が解放されるまで待機します）。

可能な値：

- 正の整数。

デフォルト値：`16`。

### connection_wait_timeout {#connection-wait-timeout}

空き接続を待つためのタイムアウト（秒単位）（すでにconnection_pool_sizeのアクティブ接続がある場合）、0 - 待機しない。

可能な値：

- 正の整数。

デフォルト値：`5`。

### connect_timeout {#connect-timeout}

接続タイムアウト（秒単位）。

可能な値：

- 正の整数。

デフォルト値：`10`。

### read_write_timeout {#read-write-timeout}

読み取り/書き込みタイムアウト（秒単位）。

可能な値：

- 正の整数。

デフォルト値：`300`。

## 関連情報 {#see-also}

- [MySQLテーブル関数](../../../sql-reference/table-functions/mysql.md)
- [MySQLを辞書ソースとして使用する](../../../sql-reference/dictionaries/index.md#dictionary-sources#dicts-external_dicts_dict_sources-mysql)
