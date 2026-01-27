---
description: 'テーブル関数 `remote` は、分散テーブルを作成することなく、その場でリモートサーバーへアクセスすることを可能にします。テーブル関数 `remoteSecure` は、セキュアな接続を利用する点を除き、`remote` と同じです。'
sidebar_label: 'remote'
sidebar_position: 175
slug: /sql-reference/table-functions/remote
title: 'remote, remoteSecure'
doc_type: 'reference'
---

# remote, remoteSecure テーブル関数 \{#remote-remotesecure-table-function\}

テーブル関数 `remote` は、[Distributed](../../engines/table-engines/special/distributed.md) テーブルを作成することなく、オンデマンドでリモートサーバーにアクセスできるようにします。テーブル関数 `remoteSecure` は、セキュアな接続を使用する点を除き `remote` と同じです。

どちらの関数も `SELECT` および `INSERT` クエリで使用できます。

## 構文 \{#syntax\}

```sql
remote(addresses_expr, [db, table, user [, password], sharding_key])
remote(addresses_expr, [db.table, user [, password], sharding_key])
remote(named_collection[, option=value [,..]])
remoteSecure(addresses_expr, [db, table, user [, password], sharding_key])
remoteSecure(addresses_expr, [db.table, user [, password], sharding_key])
remoteSecure(named_collection[, option=value [,..]])
```

## パラメータ \{#parameters\}

| 引数           | 説明                                                                                                                                                                                                                                                                                                                                                                  |
|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `addresses_expr` | リモートサーバーのアドレス、または複数のリモートサーバーアドレスを生成する式。形式: `host` または `host:port`。<br/><br/>    `host` はサーバー名、または IPv4/IPv6 アドレスとして指定できます。IPv6 アドレスは角括弧で囲んで指定する必要があります。<br/><br/>    `port` はリモートサーバー上の TCP ポートです。ポートが省略された場合、テーブル関数 `remote` ではサーバー設定ファイルの [tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port)（デフォルト 9000）、テーブル関数 `remoteSecure` では [tcp_port_secure](../../operations/server-configuration-parameters/settings.md#tcp_port_secure)（デフォルト 9440）が使用されます。<br/><br/>    IPv6 アドレスの場合、ポートの指定が必須です。<br/><br/>    `addresses_expr` のみが指定された場合、`db` と `table` にはデフォルトで `system.one` が使用されます。<br/><br/>    型: [String](../../sql-reference/data-types/string.md)。 |
| `db`           | データベース名。型: [String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                                                                              |
| `table`        | テーブル名。型: [String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                                                                                  |
| `user`         | ユーザー名。指定されていない場合は `default` が使用されます。型: [String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                               |
| `password`     | ユーザーのパスワード。指定されていない場合は空のパスワードが使用されます。型: [String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                   |
| `sharding_key` | ノード間でデータを分散するためのシャーディングキー。例: `insert into remote('127.0.0.1:9000,127.0.0.2', db, table, 'default', rand())`。型: [UInt32](../../sql-reference/data-types/int-uint.md)。                                                                                                                                                                |

引数は [named collections](operations/named-collections.md)（名前付きコレクション）を使用して渡すこともできます。

## 戻り値 \{#returned-value\}

リモートサーバー上にあるテーブルです。

## 使用方法 \{#usage\}

テーブル関数 `remote` および `remoteSecure` はリクエストごとに接続を再確立するため、代わりに `Distributed` テーブルを使用することを推奨します。また、ホスト名が設定されている場合には名前解決が行われ、複数のレプリカに対して処理を行う際のエラーはカウントされません。大量のクエリを処理する場合は、常に事前に `Distributed` テーブルを作成し、`remote` テーブル関数は使用しないでください。

`remote` テーブル関数は、次のような場合に有用です。

* あるシステムから別のシステムへの一度きりのデータ移行
* データ比較、デバッグ、およびテストのために特定のサーバーへアクセスする場合、すなわちアドホックな接続を行う場合
* 調査目的で、さまざまな ClickHouse クラスター間でクエリを実行する場合
* 手動で行われる頻度の低い分散リクエスト
* サーバー集合が毎回再定義される分散リクエスト

### アドレス \{#addresses\}

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

複数のアドレスをカンマ区切りで指定できます。この場合、ClickHouse は分散処理を行い、指定されたすべてのアドレス（異なるデータを保持するシャードのようなもの）にクエリを送信します。例：

```text
example01-01-1,example01-02-1
```

## 例 \{#examples\}

### リモートサーバーからデータを取得する: \{#selecting-data-from-a-remote-server\}

```sql
SELECT * FROM remote('127.0.0.1', db.remote_engine_table) LIMIT 3;
```

または、[名前付きコレクション](operations/named-collections.md)を使用します：

```sql
CREATE NAMED COLLECTION creds AS
        host = '127.0.0.1',
        database = 'db';
SELECT * FROM remote(creds, table='remote_engine_table') LIMIT 3;
```

### リモートサーバー上のテーブルにデータを挿入する: \{#inserting-data-into-a-table-on-a-remote-server\}

```sql
CREATE TABLE remote_table (name String, value UInt32) ENGINE=Memory;
INSERT INTO FUNCTION remote('127.0.0.1', currentDatabase(), 'remote_table') VALUES ('test', 42);
SELECT * FROM remote_table;
```

### あるシステムから別のシステムへのテーブル移行： \{#migration-of-tables-from-one-system-to-another\}

この例では、サンプルデータセット内の1つのテーブルを使用します。データベースは `imdb`、テーブルは `actors` です。

#### ソースとなる ClickHouse システム（現在データを保持しているシステム） \{#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data\}

* ソースデータベースおよびテーブル名（`imdb.actors`）を確認します。

  ```sql
  show databases
  ```

  ```sql
  show tables in imdb
  ```

* ソースから CREATE TABLE 文を取得します。

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

#### 宛先側 ClickHouse システム上で \{#on-the-destination-clickhouse-system\}

* 宛先データベースを作成します：

  ```sql
  CREATE DATABASE imdb
  ```

* ソース側の `CREATE TABLE` 文を利用して、宛先テーブルを作成します：

  ```sql
  CREATE TABLE imdb.actors (`id` UInt32,
                            `first_name` String,
                            `last_name` String,
                            `gender` FixedString(1))
                  ENGINE = MergeTree
                  ORDER BY (id, first_name, last_name, gender);
  ```

#### ソース側のデプロイメントに戻り \{#back-on-the-source-deployment\}

リモートシステム上で作成した新しいデータベースおよびテーブルに対して `INSERT` を実行します。ホスト、ポート、ユーザー名、パスワード、宛先データベース、および宛先テーブルが必要です。

```sql
INSERT INTO FUNCTION
remoteSecure('remote.clickhouse.cloud:9440', 'imdb.actors', 'USER', 'PASSWORD')
SELECT * from imdb.actors
```

## グロブ \{#globs-in-addresses\}

中括弧 `{ }` 内のパターンは、シャードの集合を生成し、レプリカを指定するために使用されます。複数の中括弧のペアがある場合、それぞれの集合の直積が生成されます。

次の種類のパターンがサポートされています。

- `{a,b,c}` - 候補文字列 `a`、`b`、`c` のいずれかを表します。パターンは、最初のシャードアドレスでは `a` に、2番目のシャードアドレスでは `b` に置き換えられる、というように進みます。例えば、`example0{1,2}-1` はアドレス `example01-1` と `example02-1` を生成します。
- `{N..M}` - 数値の範囲です。このパターンは、`N` から `M`（両端を含む）まで増加するインデックスを持つシャードアドレスを生成します。例えば、`example0{1..2}-1` は `example01-1` と `example02-1` を生成します。
- `{0n..0m}` - 先頭にゼロを含む数値の範囲です。このパターンは、インデックスの先頭ゼロを保持します。例えば、`example{01..03}-1` は `example01-1`、`example02-1`、`example03-1` を生成します。
- `{a|b}` - `|` で区切られた任意個数の候補です。このパターンはレプリカを指定します。例えば、`example01-{1|2}` はレプリカ `example01-1` と `example01-2` を生成します。

クエリは、最初の正常な状態のレプリカに送信されます。ただし、`remote` の場合、レプリカは現在設定されている [load_balancing](../../operations/settings/settings.md#load_balancing) 設定の順序で反復されます。
生成されるアドレスの数は、[table_function_remote_max_addresses](../../operations/settings/settings.md#table_function_remote_max_addresses) 設定によって制限されます。
