---
slug: /sql-reference/table-functions/remote
sidebar_position: 175
sidebar_label: remote
title: "remote, remoteSecure"
description: "テーブル関数 `remote` は、分散テーブルを作成することなく、リモートサーバーにオンザフライでアクセスすることを可能にします。テーブル関数 `remoteSecure` は、`remote` と同様ですが、安全な接続を介して動作します。"
---


# remote, remoteSecure テーブル関数

テーブル関数 `remote` は、分散テーブルを作成することなく、リモートサーバーにオンザフライでアクセスすることを可能にします。テーブル関数 `remoteSecure` は、`remote` と同様ですが、安全な接続を介して動作します。

これらの関数は、`SELECT` および `INSERT` クエリで使用できます。

## 構文 {#syntax}

``` sql
remote(addresses_expr, [db, table, user [, password], sharding_key])
remote(addresses_expr, [db.table, user [, password], sharding_key])
remote(named_collection[, option=value [,..]])
remoteSecure(addresses_expr, [db, table, user [, password], sharding_key])
remoteSecure(addresses_expr, [db.table, user [, password], sharding_key])
remoteSecure(named_collection[, option=value [,..]])
```

## パラメータ {#parameters}

- `addresses_expr` — リモートサーバーのアドレスまたは、複数のリモートサーバーのアドレスを生成する式。形式: `host` または `host:port`。

    `host` は、サーバー名または IPv4 または IPv6 アドレスとして指定できます。IPv6 アドレスは角括弧で囲む必要があります。

    `port` は、リモートサーバー上の TCP ポートです。ポートが省略された場合、テーブル関数 `remote` のデフォルト（9000）ではサーバー設定ファイルの [tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port) を使用し、テーブル関数 `remoteSecure` のデフォルト（9440）では [tcp_port_secure](../../operations/server-configuration-parameters/settings.md#tcp_port_secure) を使用します。

    IPv6 アドレスの場合、ポートは必須です。

    パラメータ `addresses_expr` のみが指定された場合、`db` と `table` はデフォルトで `system.one` を使用します。

    タイプ: [String](../../sql-reference/data-types/string.md)。

- `db` — データベース名。タイプ: [String](../../sql-reference/data-types/string.md)。
- `table` — テーブル名。タイプ: [String](../../sql-reference/data-types/string.md)。
- `user` — ユーザー名。指定しない場合は `default` が使用されます。タイプ: [String](../../sql-reference/data-types/string.md)。
- `password` — ユーザーのパスワード。指定しない場合は空のパスワードが使用されます。タイプ: [String](../../sql-reference/data-types/string.md)。
- `sharding_key` — ノード間でのデータ分散をサポートするシャーディングキー。例えば: `insert into remote('127.0.0.1:9000,127.0.0.2', db, table, 'default', rand())`。タイプ: [UInt32](../../sql-reference/data-types/int-uint.md)。

引数は [named collections](operations/named-collections.md) を使用して渡すこともできます。

## 戻り値 {#returned-value}

リモートサーバーにあるテーブル。

## 使用法 {#usage}

テーブル関数 `remote` と `remoteSecure` は、各リクエストごとに接続を再確立するため、代わりに `Distributed` テーブルを使用することをお勧めします。また、ホスト名が設定されている場合、名前が解決され、さまざまなレプリカで作業する際にエラーはカウントされません。多くのクエリを処理する場合は、常に前もって `Distributed` テーブルを作成し、`remote` テーブル関数を使用しないでください。

`remote` テーブル関数は、以下のケースで便利です：

- 一度きりのデータ移行
- データ比較、デバッグ、テストのために特定のサーバーにアクセスする場合、つまりアドホック接続。
- 調査目的でのさまざまな ClickHouse クラスター間のクエリ。
- 手動で行われる不定期の分散リクエスト。
- 毎回サーバーのセットが再定義される分散リクエスト。

### アドレス {#addresses}

``` text
example01-01-1
example01-01-1:9440
example01-01-1:9000
localhost
127.0.0.1
[::]:9440
[::]:9000
[2a02:6b8:0:1111::11]:9000
```

複数のアドレスはカンマで区切ることができます。この場合、ClickHouse は分散処理を使用し、すべての指定されたアドレス（異なるデータを持つシャードのように）にクエリを送信します。例：

``` text
example01-01-1,example01-02-1
```

## 例 {#examples}

### リモートサーバーからのデータ選択: {#selecting-data-from-a-remote-server}

``` sql
SELECT * FROM remote('127.0.0.1', db.remote_engine_table) LIMIT 3;
```

または [named collections](operations/named-collections.md) を使用して：

```sql
CREATE NAMED COLLECTION creds AS
        host = '127.0.0.1',
        database = 'db';
SELECT * FROM remote(creds, table='remote_engine_table') LIMIT 3;
```

### リモートサーバー上のテーブルへのデータ挿入: {#inserting-data-into-a-table-on-a-remote-server}

``` sql
CREATE TABLE remote_table (name String, value UInt32) ENGINE=Memory;
INSERT INTO FUNCTION remote('127.0.0.1', currentDatabase(), 'remote_table') VALUES ('test', 42);
SELECT * FROM remote_table;
```

### 1つのシステムから別のシステムへのテーブルの移行: {#migration-of-tables-from-one-system-to-another}

この例では、サンプルデータセットから1つのテーブルを使用します。データベースは `imdb` で、テーブルは `actors` です。

#### ソース ClickHouse システム上で （現在データをホストしているシステム） {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- ソースのデータベースとテーブル名を確認します（`imdb.actors`）

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

  レスポンス

  ```sql
  CREATE TABLE imdb.actors (`id` UInt32,
                            `first_name` String,
                            `last_name` String,
                            `gender` FixedString(1))
                  ENGINE = MergeTree
                  ORDER BY (id, first_name, last_name, gender);
  ```

#### 先の ClickHouse システムで {#on-the-destination-clickhouse-system}

- 先のデータベースを作成します：

  ```sql
  CREATE DATABASE imdb
  ```

- ソースからの CREATE TABLE ステートメントを使用して、デスティネーションを作成します：

  ```sql
  CREATE TABLE imdb.actors (`id` UInt32,
                            `first_name` String,
                            `last_name` String,
                            `gender` FixedString(1))
                  ENGINE = MergeTree
                  ORDER BY (id, first_name, last_name, gender);
  ```

#### ソースデプロイメントに戻る {#back-on-the-source-deployment}

リモートシステム上に作成した新しいデータベースとテーブルに挿入します。ホスト、ポート、ユーザー名、パスワード、宛先データベース、宛先テーブルが必要です。

```sql
INSERT INTO FUNCTION
remoteSecure('remote.clickhouse.cloud:9440', 'imdb.actors', 'USER', 'PASSWORD')
SELECT * from imdb.actors
```

## グロビング {#globs-in-addresses}

波括弧 `{ }` 内のパターンは、シャードのセットを生成し、レプリカを指定するために使用されます。波括弧のペアが複数ある場合、対応するセットの直積が生成されます。

以下のパターンタイプがサポートされています。

- `{a,b,c}` - 代替文字列 `a`, `b`, または `c` のいずれかを表します。このパターンは、最初のシャードアドレスでは `a` に置き換えられ、2番目のシャードアドレスでは `b` に置き換えられ、以下同様です。例えば、`example0{1,2}-1` はアドレス `example01-1` と `example02-1` を生成します。
- `{N..M}` - 数値の範囲。このパターンは、インデックスを増加させながら `N` から `M` まで（Mを含む）のシャードアドレスを生成します。例えば、`example0{1..2}-1` は `example01-1` と `example02-1` を生成します。
- `{0n..0m}` - 前ゼロ付きの数値範囲。このパターンは、インデックス内の前ゼロを保持します。例えば、`example{01..03}-1` は `example01-1`, `example02-1`, および `example03-1` を生成します。
- `{a|b}` - `|` で区切られた任意の数のバリアント。このパターンは、レプリカを指定します。例えば、`example01-{1|2}` はレプリカ `example01-1` と `example01-2` を生成します。

クエリは、最初の正常なレプリカに送信されます。ただし、`remote` の場合、レプリカは [load_balancing](../../operations/settings/settings.md#load_balancing) 設定で現在設定されている順序で反復処理されます。

生成されるアドレスの数は、[table_function_remote_max_addresses](../../operations/settings/settings.md#table_function_remote_max_addresses) 設定によって制限されます。
