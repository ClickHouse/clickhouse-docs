---
description: 'MySQL テーブルエンジンのドキュメント'
sidebar_label: 'MySQL'
sidebar_position: 138
slug: /engines/table-engines/integrations/mysql
title: 'MySQL テーブルエンジン'
doc_type: 'reference'
---



# MySQL テーブルエンジン

MySQL エンジンを使用すると、リモートの MySQL サーバー上に保存されているデータに対して `SELECT` および `INSERT` クエリを実行できます。



## テーブルを作成する

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

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細な説明については、参照してください。

テーブル構造は、元の MySQL テーブル構造と異なっていてもかまいません。

* カラム名は元の MySQL テーブルと同じである必要がありますが、そのうち一部のカラムだけを任意の順序で使用できます。
* カラム型は元の MySQL テーブルと異なっていてもかまいません。ClickHouse は値を ClickHouse のデータ型に[キャスト](../../../engines/database-engines/mysql.md#data_types-support)しようとします。
* [external&#95;table&#95;functions&#95;use&#95;nulls](/operations/settings/settings#external_table_functions_use_nulls) 設定は、Nullable カラムをどのように扱うかを定義します。デフォルト値: 1。0 の場合、テーブル関数は Nullable カラムを作成せず、null の代わりにデフォルト値を挿入します。これは配列内の NULL 値にも適用されます。

**エンジンパラメータ**

* `host:port` — MySQL サーバーアドレス。
* `database` — リモートデータベース名。
* `table` — リモートテーブル名。
* `user` — MySQL ユーザー。
* `password` — ユーザーパスワード。
* `replace_query` — `INSERT INTO` クエリを `REPLACE INTO` に変換するフラグ。`replace_query=1` の場合、クエリは置き換えられます。
* `on_duplicate_clause` — `INSERT` クエリに追加される `ON DUPLICATE KEY on_duplicate_clause` 式。
  例: `INSERT INTO t (c1,c2) VALUES ('a', 2) ON DUPLICATE KEY UPDATE c2 = c2 + 1` の場合、`on_duplicate_clause` は `UPDATE c2 = c2 + 1` です。`ON DUPLICATE KEY` 句と併用できる `on_duplicate_clause` については、[MySQL のドキュメント](https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html) を参照してください。
  `on_duplicate_clause` を指定するには、`replace_query` パラメータに `0` を渡す必要があります。`replace_query = 1` と `on_duplicate_clause` を同時に指定した場合、ClickHouse は例外をスローします。

引数は [named collections](/operations/named-collections.md) を使って渡すこともできます。この場合、`host` と `port` は個別に指定する必要があります。この方法は本番環境での利用を推奨します。

`=, !=, >, >=, <, <=` のような単純な `WHERE` 句は、MySQL サーバー上で実行されます。

それ以外の条件および `LIMIT` のサンプリング制約は、MySQL へのクエリが終了した後に、ClickHouse 側でのみ実行されます。

複数のレプリカをサポートしており、`|` で区切って列挙します。例:

```sql
CREATE TABLE test_replicas (id UInt32, name String, age UInt32, money UInt32) ENGINE = MySQL(`mysql{2|3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```


## 使用例

MySQL でテーブルを作成します:

```text
mysql> CREATE TABLE `test`.`test` (
    ->   `int_id` INT NOT NULL AUTO_INCREMENT,
    ->   `int_nullable` INT NULL DEFAULT NULL,
    ->   `float` FLOAT NOT NULL,
    ->   `float_nullable` FLOAT NULL DEFAULT NULL,
    ->   PRIMARY KEY (`int_id`));
クエリ OK, 0 行が影響しました (0.09 秒)

mysql> insert into test (`int_id`, `float`) VALUES (1,2);
クエリ OK, 1 行が影響しました (0.00 秒)

mysql> select * from test;
+------+----------+-----+----------+
| int_id | int_nullable | float | float_nullable |
+------+----------+-----+----------+
|      1 |         NULL |     2 |           NULL |
+------+----------+-----+----------+
1 行取得 (0.00 秒)
```

通常の引数を使って ClickHouse にテーブルを作成する：

```sql
CREATE TABLE mysql_table
(
    `float_nullable` Nullable(Float32),
    `int_id` Int32
)
ENGINE = MySQL('localhost:3306', 'test', 'test', 'bayonet', '123')
```

または [named collections](/operations/named-collections.md) を使用する場合:

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

MySQL テーブルからのデータ取得：

```sql
SELECT * FROM mysql_table
```

```text
┌─float_nullable─┬─int_id─┐
│           ᴺᵁᴸᴸ │      1 │
└────────────────┴────────┘
```


## 設定 {#mysql-settings}

デフォルト設定は接続の再利用も行わないため、効率的とは言えません。以下の設定により、サーバーが 1 秒あたりに処理できるクエリ数を増やすことができます。

### `connection_auto_close` {#connection-auto-close}

クエリ実行後に接続を自動的にクローズするかどうか、つまり接続の再利用を無効にするかどうかを制御します。

設定可能な値:

- 1 — 自動クローズを許可し、接続の再利用を無効にする
- 0 — 自動クローズを許可せず、接続の再利用を有効にする

デフォルト値: `1`。

### `connection_max_tries` {#connection-max-tries}

フェイルオーバー対応プールにおけるリトライ回数を設定します。

設定可能な値:

- 正の整数。
- 0 — フェイルオーバー対応プールでリトライを行わない。

デフォルト値: `3`。

### `connection_pool_size` {#connection-pool-size}

接続プールのサイズです（すべての接続が使用中の場合、いずれかの接続が解放されるまでクエリは待機します）。

設定可能な値:

- 正の整数。

デフォルト値: `16`。

### `connection_wait_timeout` {#connection-wait-timeout}

空き接続を待機するタイムアウト時間（秒）です（すでに `connection_pool_size` 個の接続がアクティブな場合に適用されます）。0 の場合は待機しません。

設定可能な値:

- 正の整数。

デフォルト値: `5`。

### `connect_timeout` {#connect-timeout}

接続のタイムアウト時間（秒）です。

設定可能な値:

- 正の整数。

デフォルト値: `10`。

### `read_write_timeout` {#read-write-timeout}

読み取り／書き込みのタイムアウト時間（秒）です。

設定可能な値:

- 正の整数。

デフォルト値: `300`。



## 関連項目 {#see-also}

- [MySQL テーブル関数](../../../sql-reference/table-functions/mysql.md)
- [MySQL を辞書のソースとして使用する](/sql-reference/dictionaries#mysql)
