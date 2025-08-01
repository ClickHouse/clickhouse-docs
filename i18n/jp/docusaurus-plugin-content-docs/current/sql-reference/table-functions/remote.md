---
description: 'Table function `remote` allows to access remote servers on-the-fly,
  i.e. without creating a distributed table. Table function `remoteSecure` is same
  as `remote` but over a secure connection.'
sidebar_label: 'remote'
sidebar_position: 175
slug: '/sql-reference/table-functions/remote'
title: 'remote, remoteSecure'
---




# remote, remoteSecure テーブル関数

テーブル関数 `remote` は、リモートサーバーに即座にアクセスすることを可能にします。つまり、[Distributed](../../engines/table-engines/special/distributed.md) テーブルを作成することなくリモートサーバーに接続できます。テーブル関数 `remoteSecure` は `remote` と同じですが、安全な接続を介して動作します。

両方の関数は `SELECT` および `INSERT` クエリで使用できます。

## 構文 {#syntax}

```sql
remote(addresses_expr, [db, table, user [, password], sharding_key])
remote(addresses_expr, [db.table, user [, password], sharding_key])
remote(named_collection[, option=value [,..]])
remoteSecure(addresses_expr, [db, table, user [, password], sharding_key])
remoteSecure(addresses_expr, [db.table, user [, password], sharding_key])
remoteSecure(named_collection[, option=value [,..]])
```

## パラメータ {#parameters}

| 引数             | 説明                                                                                                                                                                                                                                                                                                                                                                     |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `addresses_expr` | リモートサーバーのアドレスまたは複数のリモートサーバーのアドレスを生成する式。形式: `host` または `host:port`。<br/><br/>    `host` はサーバー名、または IPv4 または IPv6 アドレスとして指定できます。IPv6 アドレスは角括弧で囲む必要があります。<br/><br/>    `port` はリモートサーバー上の TCP ポートです。ポートが省略された場合、テーブル関数 `remote` ではサーバー設定ファイルの [tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port)（デフォルトは9000）を使用し、テーブル関数 `remoteSecure` では [tcp_port_secure](../../operations/server-configuration-parameters/settings.md#tcp_port_secure)（デフォルトは9440）を使用します。<br/><br/>    IPv6 アドレスの場合はポートが必須です。<br/><br/>    パラメータ `addresses_expr` のみが指定された場合、`db` と `table` はデフォルトで `system.one` を使用します。<br/><br/>    種類: [String](../../sql-reference/data-types/string.md)。 |
| `db`             | データベース名。種類: [String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                                                                            |
| `table`          | テーブル名。種類: [String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                                                                                  |
| `user`           | ユーザー名。指定しない場合は `default` が使用されます。種類: [String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                                   |
| `password`       | ユーザーパスワード。指定しない場合は空のパスワードが使用されます。種類: [String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                            |
| `sharding_key`   | ノード間でデータを分散するためのシャーディングキー。例えば: `insert into remote('127.0.0.1:9000,127.0.0.2', db, table, 'default', rand())`。種類: [UInt32](../../sql-reference/data-types/int-uint.md)。                                                                                                                                                    |

引数は [named collections](operations/named-collections.md) を使用しても渡せます。

## 返される値 {#returned-value}

リモートサーバーに位置するテーブル。

## 使用法 {#usage}

テーブル関数 `remote` と `remoteSecure` は各リクエストごとに接続を再確立するため、代わりに `Distributed` テーブルを使用することを推奨します。また、ホスト名が設定されている場合、名前が解決され、さまざまなレプリカと作業するときにエラーがカウントされません。多くのクエリを処理する場合は、常に事前に `Distributed` テーブルを作成し、テーブル関数 `remote` を使用しないでください。

`remote` テーブル関数は次のような場合に便利です。

- 1回限りのデータマイグレーション
- データの比較、デバッグ、テストのための特定のサーバーへのアクセス、つまり、アドホック接続。
- さまざまな ClickHouse クラスター間のクエリ（研究目的）。
- 手動で行われる稀な分散リクエスト。
- サーバーのセットが毎回再定義される分散リクエスト。

### アドレス {#addresses}

```text
example01-01-1
example01-01-1:9440
example01-01-1:9000
localhost
127.0.0.1
[::]:9440
[::]:9000
[2a02:6b8:0:1111::11]:9000
```

複数のアドレスはカンマで区切ることができます。この場合、ClickHouse は分散処理を使用し、すべての指定されたアドレスにクエリを送信します（異なるデータを持つシャードのように）。例:

```text
example01-01-1,example01-02-1
```

## 例 {#examples}

### リモートサーバーからデータを選択 {#selecting-data-from-a-remote-server}

```sql
SELECT * FROM remote('127.0.0.1', db.remote_engine_table) LIMIT 3;
```

または [named collections](operations/named-collections.md) を使用して:

```sql
CREATE NAMED COLLECTION creds AS
        host = '127.0.0.1',
        database = 'db';
SELECT * FROM remote(creds, table='remote_engine_table') LIMIT 3;
```

### リモートサーバーのテーブルにデータを挿入 {#inserting-data-into-a-table-on-a-remote-server}

```sql
CREATE TABLE remote_table (name String, value UInt32) ENGINE=Memory;
INSERT INTO FUNCTION remote('127.0.0.1', currentDatabase(), 'remote_table') VALUES ('test', 42);
SELECT * FROM remote_table;
```

### テーブルのシステム間マイグレーション {#migration-of-tables-from-one-system-to-another}

この例では、サンプルデータセットから1つのテーブルを使用します。データベースは `imdb` で、テーブルは `actors` です。

#### 元の ClickHouse システムで {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- ソースデータベースおよびテーブル名（`imdb.actors`）を確認します。

  ```sql
  show databases
  ```

  ```sql
  show tables in imdb
  ```

- ソースから CREATE TABLE ステートメントを取得します:

```sql
  select create_table_query
  from system.tables
  where database = 'imdb' and table = 'actors'
  ```

  応答

  ```sql
  CREATE TABLE imdb.actors (`id` UInt32,
                            `first_name` String,
                            `last_name` String,
                            `gender` FixedString(1))
                  ENGINE = MergeTree
                  ORDER BY (id, first_name, last_name, gender);
  ```

#### 目的地の ClickHouse システムで {#on-the-destination-clickhouse-system}

- 目的地のデータベースを作成します:

  ```sql
  CREATE DATABASE imdb
  ```

- ソースから取得した CREATE TABLE ステートメントを使用して目的地を作成します:

  ```sql
  CREATE TABLE imdb.actors (`id` UInt32,
                            `first_name` String,
                            `last_name` String,
                            `gender` FixedString(1))
                  ENGINE = MergeTree
                  ORDER BY (id, first_name, last_name, gender);
  ```

#### ソース展開に戻る {#back-on-the-source-deployment}

リモートシステムで作成した新しいデータベースとテーブルに挿入します。ホスト、ポート、ユーザー名、パスワード、目的地のデータベース、および目的地のテーブルが必要です。

```sql
INSERT INTO FUNCTION
remoteSecure('remote.clickhouse.cloud:9440', 'imdb.actors', 'USER', 'PASSWORD')
SELECT * from imdb.actors
```

## グロビング {#globs-in-addresses}

波括弧 `{ }` 内のパターンは、シャードのセットを生成し、レプリカを指定するために使用されます。複数の対の波括弧がある場合、対応するセットの直積が生成されます。

以下のパターンタイプがサポートされています。

- `{a,b,c}` - 代替文字列 `a`、`b` または `c` のいずれかを表します。このパターンは、最初のシャードアドレスでは `a` に置き換えられ、2番目のシャードアドレスでは `b` に置き換えられ、以下同様です。例えば、`example0{1,2}-1` は `example01-1` と `example02-1` のアドレスを生成します。
- `{N..M}` - 数値の範囲。このパターンは、`N` から (含む) `M` までのインデックスが増加するシャードアドレスを生成します。例えば、`example0{1..2}-1` は `example01-1` および `example02-1` を生成します。
- `{0n..0m}` - 先頭ゼロを持つ数値の範囲。このパターンはインデックスの先頭ゼロを保持します。例えば、`example{01..03}-1` は `example01-1`、`example02-1` および `example03-1` を生成します。
- `{a|b}` - `|` で区切られた任意の数の変種。このパターンはレプリカを指定します。例えば、`example01-{1|2}` はレプリカ `example01-1` と `example01-2` を生成します。

クエリは最初の正常なレプリカに送信されます。ただし、`remote` の場合、レプリカは現在設定されている [load_balancing](../../operations/settings/settings.md#load_balancing) 設定の順序で繰り返されます。
生成されるアドレスの数は [table_function_remote_max_addresses](../../operations/settings/settings.md#table_function_remote_max_addresses) 設定によって制限されています。
