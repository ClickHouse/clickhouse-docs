---
slug: /engines/table-engines/integrations/mysql
sidebar_position: 138
sidebar_label: MySQL
title: "MySQL エンジンを使用して、リモート MySQL サーバーに保存されたデータに対して `SELECT` および `INSERT` クエリを実行できます。"
---


# MySQL テーブルエンジン

MySQL エンジンを使用して、リモート MySQL サーバーに保存されたデータに対して `SELECT` および `INSERT` クエリを実行できます。

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

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細な説明を参照してください。

テーブルの構造は、元の MySQL テーブルの構造と異なる場合があります：

- カラム名は元の MySQL テーブルと同じである必要がありますが、これらのカラムの一部だけを使用し、任意の順序で指定できます。
- カラムタイプは、元の MySQL テーブルのものとは異なる場合があります。ClickHouse は値を ClickHouse データ型に変換しようとします。[cast](../../../engines/database-engines/mysql.md#data_types-support) 参照。
- [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls) 設定は Nullable カラムの処理方法を定義します。デフォルト値：1。0の場合、テーブル関数は Nullable カラムを作成せず、null の代わりにデフォルト値を挿入します。これは、配列内の NULL 値にも適用されます。

:::note
MySQL テーブルエンジンは、現在のところ ClickHouse の MacOS ビルドで利用できません。 ([issue](https://github.com/ClickHouse/ClickHouse/issues/21191))
:::

**エンジンパラメータ**

- `host:port` — MySQL サーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — MySQL ユーザー。
- `password` — ユーザーのパスワード。
- `replace_query` — `INSERT INTO` クエリを `REPLACE INTO` に変換するフラグ。`replace_query=1` の場合、クエリが置き換えられます。
- `on_duplicate_clause` — `INSERT` クエリに追加される `ON DUPLICATE KEY on_duplicate_clause` 式。
    例：`INSERT INTO t (c1,c2) VALUES ('a', 2) ON DUPLICATE KEY UPDATE c2 = c2 + 1` の場合、`on_duplicate_clause` は `UPDATE c2 = c2 + 1` です。[MySQL ドキュメント](https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html) で、`ON DUPLICATE KEY` 句と一緒に使用できる `on_duplicate_clause` を確認してください。
    `on_duplicate_clause` を指定するには、`replace_query` パラメータに `0` を渡す必要があります。`replace_query = 1` と `on_duplicate_clause` を同時に渡すと、ClickHouse は例外を生成します。

引数は [named collections](/operations/named-collections.md) を使用しても渡すことができます。この場合、`host` および `port` を別々に指定する必要があります。このアプローチは、本番環境で推奨されます。

シンプルな `WHERE` 句（`=, !=, >, >=, <, <=` など）は、MySQL サーバーで実行されます。

その他の条件や `LIMIT` サンプリング制約は、MySQL へのクエリが完了した後に ClickHouse でのみ実行されます。

複数のレプリカをサポートしており、`|` で区切ってリストする必要があります。例えば：

```sql
CREATE TABLE test_replicas (id UInt32, name String, age UInt32, money UInt32) ENGINE = MySQL(`mysql{2|3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

## 使用例 {#usage-example}

MySQL でテーブルを作成：

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

ClickHouse でプレーン引数を使用してテーブルを作成：

``` sql
CREATE TABLE mysql_table
(
    `float_nullable` Nullable(Float32),
    `int_id` Int32
)
ENGINE = MySQL('localhost:3306', 'test', 'test', 'bayonet', '123')
```

または [named collections](/operations/named-collections.md) を使用：

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

MySQL テーブルからデータを取得：

``` sql
SELECT * FROM mysql_table
```

``` text
┌─float_nullable─┬─int_id─┐
│           ᴺᵁᴸᴸ │      1 │
└────────────────┴────────┘
```

## 設定 {#mysql-settings}

デフォルトの設定は非常に効率的ではなく、接続を再利用することさえありません。これらの設定により、サーバーが1秒あたりに実行するクエリの数を増やすことができます。

### connection_auto_close {#connection-auto-close}

クエリ実行後に接続を自動的に閉じることを許可し、接続の再利用を無効にします。

可能な値：

- 1 — 自動的に接続を閉じることが許可されているため、接続の再利用が無効
- 0 — 自動的に接続を閉じることが許可されていないため、接続の再利用が有効

デフォルト値：`1`。

### connection_max_tries {#connection-max-tries}

フェイルオーバーを伴うプールの再試行の回数を設定します。

可能な値：

- 正の整数。
- 0 — フェイルオーバーを伴うプールに再試行はありません。

デフォルト値：`3`。

### connection_pool_size {#connection-pool-size}

接続プールのサイズ（すべての接続が使用中の場合、クエリは接続が解放されるまで待機します）。

可能な値：

- 正の整数。

デフォルト値：`16`。

### connection_wait_timeout {#connection-wait-timeout}

接続が空くのを待つためのタイムアウト（秒単位）（すでに connection_pool_size のアクティブ接続がある場合）、0 - 待機しない。

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

## 関連項目 {#see-also}

- [MySQL テーブル関数](../../../sql-reference/table-functions/mysql.md)
- [辞書ソースとしての MySQL の使用](/sql-reference/dictionaries#mysql)
