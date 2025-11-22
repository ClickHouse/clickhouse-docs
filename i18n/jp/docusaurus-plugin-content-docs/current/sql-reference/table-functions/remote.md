---
description: 'テーブル関数 `remote` は、分散テーブルを作成することなく、動的にリモートサーバーへアクセスすることを可能にします。テーブル関数 `remoteSecure` は、安全な接続を経由して動作する点を除き `remote` と同じです。'
sidebar_label: 'remote'
sidebar_position: 175
slug: /sql-reference/table-functions/remote
title: 'remote, remoteSecure'
doc_type: 'reference'
---



# remote, remoteSecure テーブル関数

テーブル関数 `remote` は、[Distributed](../../engines/table-engines/special/distributed.md) テーブルを作成することなく、その場でリモートサーバーへアクセスすることを可能にします。テーブル関数 `remoteSecure` は、セキュアな接続を用いる点を除き、`remote` と同じです。

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

| 引数         | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `addresses_expr` | リモートサーバーのアドレス、またはリモートサーバーの複数のアドレスを生成する式。形式: `host` または `host:port`。<br/><br/> `host` はサーバー名、IPv4アドレス、またはIPv6アドレスとして指定できます。IPv6アドレスは角括弧で囲む必要があります。<br/><br/> `port` はリモートサーバー上のTCPポートです。ポートが省略された場合、テーブル関数 `remote` ではサーバー設定ファイルの [tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port) が使用され(デフォルトは9000)、テーブル関数 `remoteSecure` では [tcp_port_secure](../../operations/server-configuration-parameters/settings.md#tcp_port_secure) が使用されます(デフォルトは9440)。<br/><br/> IPv6アドレスの場合、ポートは必須です。<br/><br/> パラメータ `addresses_expr` のみが指定された場合、`db` と `table` はデフォルトで `system.one` を使用します。<br/><br/> 型: [String](../../sql-reference/data-types/string.md)。 |
| `db`             | データベース名。型: [String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `table`          | テーブル名。型: [String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `user`           | ユーザー名。指定されない場合、`default` が使用されます。型: [String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `password`       | ユーザーパスワード。指定されない場合、空のパスワードが使用されます。型: [String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `sharding_key`   | ノード間でデータを分散するためのシャーディングキー。例: `insert into remote('127.0.0.1:9000,127.0.0.2', db, table, 'default', rand())`。型: [UInt32](../../sql-reference/data-types/int-uint.md)。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

引数は [名前付きコレクション](operations/named-collections.md) を使用して渡すこともできます。


## 戻り値 {#returned-value}

リモートサーバー上に配置されているテーブル。


## 使用方法 {#usage}

テーブル関数`remote`および`remoteSecure`はリクエストごとに接続を再確立するため、代わりに`Distributed`テーブルの使用を推奨します。また、ホスト名が設定されている場合、名前解決が行われ、複数のレプリカを操作する際にエラーはカウントされません。大量のクエリを処理する場合は、必ず事前に`Distributed`テーブルを作成し、`remote`テーブル関数は使用しないでください。

`remote`テーブル関数は以下のような場合に有用です:

- あるシステムから別のシステムへの一度限りのデータ移行
- データ比較、デバッグ、テストのための特定サーバーへのアクセス(アドホック接続)
- 調査目的での異なるClickHouseクラスター間のクエリ
- 手動で実行される低頻度の分散リクエスト
- サーバーセットが毎回再定義される分散リクエスト

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

複数のアドレスはカンマ区切りで指定できます。この場合、ClickHouseは分散処理を使用し、指定されたすべてのアドレス(異なるデータを持つシャードのように)にクエリを送信します。例:

```text
example01-01-1,example01-02-1
```


## 例 {#examples}

### リモートサーバーからのデータ選択: {#selecting-data-from-a-remote-server}

```sql
SELECT * FROM remote('127.0.0.1', db.remote_engine_table) LIMIT 3;
```

または[名前付きコレクション](operations/named-collections.md)を使用する場合:

```sql
CREATE NAMED COLLECTION creds AS
        host = '127.0.0.1',
        database = 'db';
SELECT * FROM remote(creds, table='remote_engine_table') LIMIT 3;
```

### リモートサーバー上のテーブルへのデータ挿入: {#inserting-data-into-a-table-on-a-remote-server}

```sql
CREATE TABLE remote_table (name String, value UInt32) ENGINE=Memory;
INSERT INTO FUNCTION remote('127.0.0.1', currentDatabase(), 'remote_table') VALUES ('test', 42);
SELECT * FROM remote_table;
```

### システム間でのテーブルの移行: {#migration-of-tables-from-one-system-to-another}

この例では、サンプルデータセットから1つのテーブルを使用します。データベースは`imdb`、テーブルは`actors`です。

#### ソースClickHouseシステム(現在データをホストしているシステム) {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- ソースデータベースとテーブル名を確認します(`imdb.actors`)

  ```sql
  show databases
  ```

  ```sql
  show tables in imdb
  ```

- ソースからCREATE TABLE文を取得します:

```sql
  SELECT create_table_query
  FROM system.tables
  WHERE database = 'imdb' AND table = 'actors'
```

レスポンス

```sql
CREATE TABLE imdb.actors (`id` UInt32,
                          `first_name` String,
                          `last_name` String,
                          `gender` FixedString(1))
                ENGINE = MergeTree
                ORDER BY (id, first_name, last_name, gender);
```

#### 宛先ClickHouseシステム {#on-the-destination-clickhouse-system}

- 宛先データベースを作成します:

  ```sql
  CREATE DATABASE imdb
  ```

- ソースからのCREATE TABLE文を使用して、宛先テーブルを作成します:

  ```sql
  CREATE TABLE imdb.actors (`id` UInt32,
                            `first_name` String,
                            `last_name` String,
                            `gender` FixedString(1))
                  ENGINE = MergeTree
                  ORDER BY (id, first_name, last_name, gender);
  ```

#### ソースデプロイメントに戻る {#back-on-the-source-deployment}

リモートシステム上に作成された新しいデータベースとテーブルにデータを挿入します。ホスト、ポート、ユーザー名、パスワード、宛先データベース、および宛先テーブルが必要です。

```sql
INSERT INTO FUNCTION
remoteSecure('remote.clickhouse.cloud:9440', 'imdb.actors', 'USER', 'PASSWORD')
SELECT * from imdb.actors
```


## グロビング {#globs-in-addresses}

波括弧 `{ }` 内のパターンは、シャードのセットを生成し、レプリカを指定するために使用されます。複数の波括弧のペアがある場合、対応するセットの直積が生成されます。

以下のパターンタイプがサポートされています。

- `{a,b,c}` - 代替文字列 `a`、`b`、または `c` のいずれかを表します。このパターンは、最初のシャードアドレスでは `a` に、2番目のシャードアドレスでは `b` に置き換えられます。例えば、`example0{1,2}-1` は `example01-1` と `example02-1` というアドレスを生成します。
- `{N..M}` - 数値の範囲。このパターンは、`N` から `M`(含む)までインクリメントするインデックスを持つシャードアドレスを生成します。例えば、`example0{1..2}-1` は `example01-1` と `example02-1` を生成します。
- `{0n..0m}` - 先頭ゼロを含む数値の範囲。このパターンは、インデックスの先頭ゼロを保持します。例えば、`example{01..03}-1` は `example01-1`、`example02-1`、`example03-1` を生成します。
- `{a|b}` - `|` で区切られた任意の数のバリアント。このパターンはレプリカを指定します。例えば、`example01-{1|2}` は `example01-1` と `example01-2` というレプリカを生成します。

クエリは最初の正常なレプリカに送信されます。ただし、`remote` の場合、レプリカは [load_balancing](../../operations/settings/settings.md#load_balancing) 設定で現在設定されている順序で反復処理されます。
生成されるアドレスの数は [table_function_remote_max_addresses](../../operations/settings/settings.md#table_function_remote_max_addresses) 設定によって制限されます。
