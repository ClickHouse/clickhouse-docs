---
'description': 'MySQL テーブルエンジンのドキュメント'
'sidebar_label': 'MySQL'
'sidebar_position': 138
'slug': '/engines/table-engines/integrations/mysql'
'title': 'MySQLエンジンはリモートMySQLサーバーに保存されているデータに対して`SELECT`および`INSERT`クエリを実行できるようにします。'
'doc_type': 'reference'
---


# MySQL テーブルエンジン

MySQL エンジンを使用すると、リモートの MySQL サーバーに保存されたデータに対して `SELECT` および `INSERT` クエリを実行できます。

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

テーブル構造は、元の MySQL テーブル構造と異なる場合があります。

- カラム名は元の MySQL テーブルと同じである必要がありますが、これらのカラムの一部のみを使用し、任意の順序で配置できます。
- カラムの型は、元の MySQL テーブルの型と異なる場合があります。ClickHouse は、値を ClickHouse のデータ型に[キャスト](../../../engines/database-engines/mysql.md#data_types-support)しようとします。
- [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls) 設定は Nullable カラムの扱いを定義します。デフォルト値: 1。0 の場合、テーブル関数は Nullable カラムを作成せず、null の代わりにデフォルト値を挿入します。これは、配列内の NULL 値にも適用されます。

**エンジンパラメータ**

- `host:port` — MySQL サーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — MySQL ユーザー。
- `password` — ユーザーのパスワード。
- `replace_query` — `INSERT INTO` クエリを `REPLACE INTO` に変換するフラグ。`replace_query=1` の場合、クエリが置き換えられます。
- `on_duplicate_clause` — `INSERT` クエリに追加される `ON DUPLICATE KEY on_duplicate_clause` 式。
    例: `INSERT INTO t (c1,c2) VALUES ('a', 2) ON DUPLICATE KEY UPDATE c2 = c2 + 1` で、`on_duplicate_clause` は `UPDATE c2 = c2 + 1` です。`ON DUPLICATE KEY` 句で使用できる `on_duplicate_clause` を見つけるには、[MySQL のドキュメント](https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html)を参照してください。
    `on_duplicate_clause` を指定するには、`replace_query` パラメータに `0` を渡す必要があります。`replace_query = 1` と `on_duplicate_clause` を同時に渡すと、ClickHouse は例外を生成します。

引数は [named collections](/operations/named-collections.md) を使用して渡すこともできます。この場合、`host` と `port` を別々に指定する必要があります。このアプローチは、運用環境で推奨されます。

`=, !=, >, >=, <, <=` のような簡単な `WHERE` 条件は、MySQL サーバーで実行されます。

残りの条件と `LIMIT` サンプリング制約は、MySQL へのクエリが完了した後、ClickHouse でのみ実行されます。

複数のレプリカをサポートしており、`|` でリストする必要があります。例えば：

```sql
CREATE TABLE test_replicas (id UInt32, name String, age UInt32, money UInt32) ENGINE = MySQL(`mysql{2|3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

## 使用例 {#usage-example}

MySQL でテーブルを作成します。

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

プレーン引数を使用して ClickHouse でテーブルを作成します。

```sql
CREATE TABLE mysql_table
(
    `float_nullable` Nullable(Float32),
    `int_id` Int32
)
ENGINE = MySQL('localhost:3306', 'test', 'test', 'bayonet', '123')
```

または [named collections](/operations/named-collections.md) を使用します。

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

MySQL テーブルからデータを取得します。

```sql
SELECT * FROM mysql_table
```

```text
┌─float_nullable─┬─int_id─┐
│           ᴺᵁᴸᴸ │      1 │
└────────────────┴────────┘
```

## 設定 {#mysql-settings}

デフォルト設定は非常に効率的ではなく、接続の再利用すら行わないため、これらの設定を使用して、サーバーが毎秒実行するクエリの数を増やすことができます。

### `connection_auto_close` {#connection-auto-close}

クエリの実行後に接続を自動的に閉じることを許可します。つまり、接続の再利用を無効にします。

可能な値：

- 1 — 自動的に接続を閉じることが許可されているため、接続の再利用が無効です。
- 0 — 自動的に接続を閉じることは許可されず、接続の再利用が有効です。

デフォルト値: `1`。

### `connection_max_tries` {#connection-max-tries}

フェイルオーバーのプールに対するリトライ回数を設定します。

可能な値：

- 正の整数。
- 0 — フェイルオーバーのプールに対するリトライはありません。

デフォルト値: `3`。

### `connection_pool_size` {#connection-pool-size}

接続プールのサイズ（すべての接続が使用中の場合、クエリは接続が解放されるまで待ちます）。

可能な値：

- 正の整数。

デフォルト値: `16`。

### `connection_wait_timeout` {#connection-wait-timeout}

接続がフリーになるのを待つためのタイムアウト（秒単位）（既に connection_pool_size のアクティブ接続がある場合）、0 - 待たない。

可能な値：

- 正の整数。

デフォルト値: `5`。

### `connect_timeout` {#connect-timeout}

接続タイムアウト（秒単位）。

可能な値：

- 正の整数。

デフォルト値: `10`。

### `read_write_timeout` {#read-write-timeout}

読み取り/書き込みタイムアウト（秒単位）。

可能な値：

- 正の整数。

デフォルト値: `300`。

## 参照 {#see-also}

- [mysql テーブル関数](../../../sql-reference/table-functions/mysql.md)
- [MySQL を辞書ソースとして使用する](/sql-reference/dictionaries#mysql)
