---
description: 'テーブル関数 `remote` は、分散テーブルを作成せずに、リモートサーバーにオンザフライでアクセスできます。テーブル関数 `remoteSecure` は `remote` と同じですが、安全な接続を介して機能します。'
sidebar_label: 'remote'
sidebar_position: 175
slug: /sql-reference/table-functions/remote
title: 'remote, remoteSecure'
---


# remote, remoteSecure テーブル関数

テーブル関数 `remote` は、[分散テーブル](../../engines/table-engines/special/distributed.md)を作成せずに、リモートサーバーにオンザフライでアクセスできるようにします。テーブル関数 `remoteSecure` は `remote` と同じですが、安全な接続を介して機能します。

両方の関数は、`SELECT` と `INSERT` クエリで使用できます。

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

- `addresses_expr` — リモートサーバーのアドレスまたは複数のリモートサーバーのアドレスを生成する式。形式: `host` または `host:port`。

    `host` はサーバー名、または IPv4 または IPv6 アドレスとして指定できます。IPv6 アドレスは角括弧で囲む必要があります。

    `port` はリモートサーバー上の TCP ポートです。ポートが省略された場合、テーブル関数 `remote` にはサーバー構成ファイルから [tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port) を使用し（デフォルトは9000）、テーブル関数 `remoteSecure` には [tcp_port_secure](../../operations/server-configuration-parameters/settings.md#tcp_port_secure) を使用します（デフォルトは9440）。

    IPv6 アドレスの場合、ポートは必須です。

    パラメータ `addresses_expr` のみが指定された場合、`db` と `table` はデフォルトで `system.one` を使用します。

    型: [文字列](../../sql-reference/data-types/string.md)。

- `db` — データベース名。型: [文字列](../../sql-reference/data-types/string.md)。
- `table` — テーブル名。型: [文字列](../../sql-reference/data-types/string.md)。
- `user` — ユーザー名。指定しない場合は `default` が使用されます。型: [文字列](../../sql-reference/data-types/string.md)。
- `password` — ユーザーパスワード。指定しない場合は空のパスワードが使用されます。型: [文字列](../../sql-reference/data-types/string.md)。
- `sharding_key` — ノード間でデータを分散するためのシャーディングキー。例: `insert into remote('127.0.0.1:9000,127.0.0.2', db, table, 'default', rand())`。型: [UInt32](../../sql-reference/data-types/int-uint.md)。

引数は [名前付きコレクション](operations/named-collections.md) を使用して渡すこともできます。

## 戻り値 {#returned-value}

リモートサーバーにあるテーブル。

## 使用法 {#usage}

テーブル関数 `remote` と `remoteSecure` は各リクエストのために接続を再確立するため、代わりに `分散テーブル` を使用することを推奨します。また、ホスト名が設定されている場合は、名前が解決され、様々なレプリカで作業する際にエラーがカウントされません。大量のクエリを処理する際には、常に事前に `分散テーブル` を作成し、`remote` テーブル関数を使用しないでください。

`remote` テーブル関数は以下のような場面で有用です：

- 1 回限りのデータ移行
- 特定のサーバーへのデータ比較、デバッグ、テストにおけるアクセス、つまりアドホック接続。
- 研究目的のための様々な ClickHouse クラスター間のクエリ。
- 手動で行われる頻度の低い分散リクエスト。
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

複数のアドレスはカンマで区切ることができます。この場合、ClickHouse は分散処理を使用し、指定されたすべてのアドレスにクエリを送信します（異なるデータを持つシャードのように）。例：

```text
example01-01-1,example01-02-1
```

## 例 {#examples}

### リモートサーバーからデータを選択する: {#selecting-data-from-a-remote-server}

```sql
SELECT * FROM remote('127.0.0.1', db.remote_engine_table) LIMIT 3;
```

または [名前付きコレクション](operations/named-collections.md) を使用して：

```sql
CREATE NAMED COLLECTION creds AS
        host = '127.0.0.1',
        database = 'db';
SELECT * FROM remote(creds, table='remote_engine_table') LIMIT 3;
```

### リモートサーバーのテーブルにデータを挿入する: {#inserting-data-into-a-table-on-a-remote-server}

```sql
CREATE TABLE remote_table (name String, value UInt32) ENGINE=Memory;
INSERT INTO FUNCTION remote('127.0.0.1', currentDatabase(), 'remote_table') VALUES ('test', 42);
SELECT * FROM remote_table;
```

### 1つのシステムから別のシステムへのテーブルの移行: {#migration-of-tables-from-one-system-to-another}

この例では、サンプルデータセットの1つのテーブルを使用します。データベースは `imdb` で、テーブルは `actors` です。

#### ソース ClickHouse システム上で (データを現在ホストしているシステム) {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- ソースデータベースとテーブル名 (`imdb.actors`) を確認します。

  ```sql
  show databases
  ```

  ```sql
  show tables in imdb
  ```

- ソースから CREATE TABLE ステートメントを取得します：

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

#### デスティネーション ClickHouse システム上で {#on-the-destination-clickhouse-system}

- デスティネーションデータベースを作成します：

  ```sql
  CREATE DATABASE imdb
  ```

- ソースの CREATE TABLE ステートメントを使用して、デスティネーションを作成します：

  ```sql
  CREATE TABLE imdb.actors (`id` UInt32,
                            `first_name` String,
                            `last_name` String,
                            `gender` FixedString(1))
                  ENGINE = MergeTree
                  ORDER BY (id, first_name, last_name, gender);
  ```

#### ソースのデプロイメントに戻る {#back-on-the-source-deployment}

リモートシステム上に作成された新しいデータベースとテーブルに挿入します。ホスト、ポート、ユーザー名、パスワード、デスティネーションデータベース、デスティネーションテーブルが必要です。

```sql
INSERT INTO FUNCTION
remoteSecure('remote.clickhouse.cloud:9440', 'imdb.actors', 'USER', 'PASSWORD')
SELECT * from imdb.actors
```

## グロビング {#globs-in-addresses}

波括弧 `{ }` 内のパターンは、一連のシャードを生成し、レプリカを指定するために使用されます。複数の波括弧のペアがある場合は、対応する集合の直積が生成されます。

以下のパターンタイプがサポートされています。

- `{a,b,c}` - 任意の代替文字列 `a`、`b`、または `c` を表します。このパターンは、最初のシャードアドレスでは `a` に置き換えられ、2 番目のシャードアドレスでは `b` に置き換えられます。例えば、`example0{1,2}-1` はアドレス `example01-1` と `example02-1` を生成します。
- `{N..M}` - 数の範囲。このパターンは、`N` から `M` まで（Mを含む）増分インデックスを持つシャードアドレスを生成します。例えば、`example0{1..2}-1` は `example01-1` と `example02-1` を生成します。
- `{0n..0m}` - 先頭にゼロが付いた数の範囲。このパターンは、インデックスに先頭ゼロを保持します。例えば、`example{01..03}-1` は `example01-1`、`example02-1`、`example03-1` を生成します。
- `{a|b}` - `|` で区切られた任意の数のバリアント。このパターンはレプリカを指定します。例えば、`example01-{1|2}` はレプリカ `example01-1` と `example01-2` を生成します。

クエリは最初の正常なレプリカに送信されます。ただし、`remote` に対しては、レプリカは現在設定されている [load_balancing](../../operations/settings/settings.md#load_balancing) 設定の順に反復されます。
生成されるアドレスの数は、[table_function_remote_max_addresses](../../operations/settings.md#table_function_remote_max_addresses) 設定によって制限されます。
