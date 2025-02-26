---
slug: /sql-reference/table-functions/remote
sidebar_position: 175
sidebar_label: remote
---

# remote, remoteSecure

テーブル関数 `remote` は、リモートサーバーに即時アクセスを可能にします。つまり、[分散](../../engines/table-engines/special/distributed.md)テーブルを作成することなく利用できます。テーブル関数 `remoteSecure` は、`remote` と同じですが、セキュアな接続を介して利用されます。

両方の関数は `SELECT` および `INSERT` クエリで使用できます。

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

- `addresses_expr` — リモートサーバーのアドレスまたは複数のリモートサーバーのアドレスを生成する式。形式: `host` または `host:port`。

    `host` は、サーバー名またはIPv4またはIPv6アドレスとして指定できます。IPv6アドレスは、角括弧で囲む必要があります。

    `port` はリモートサーバー上のTCPポートです。ポートが省略された場合、テーブル関数 `remote` に対してはサーバーの設定ファイルからの[tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port)（デフォルトは9000）、テーブル関数 `remoteSecure` に対しては[tcp_port_secure](../../operations/server-configuration-parameters/settings.md#tcp_port_secure)（デフォルトは9440）が使用されます。

    IPv6アドレスの場合、ポートが必要です。

    `addresses_expr` のみが指定されている場合、`db` および `table` はデフォルトで `system.one` を使用します。

    型: [String](../../sql-reference/data-types/string.md)。

- `db` — データベース名。型: [String](../../sql-reference/data-types/string.md)。
- `table` — テーブル名。型: [String](../../sql-reference/data-types/string.md)。
- `user` — ユーザー名。指定されていない場合、`default` が使用されます。型: [String](../../sql-reference/data-types/string.md)。
- `password` — ユーザーパスワード。指定されていない場合、空のパスワードが使用されます。型: [String](../../sql-reference/data-types/string.md)。
- `sharding_key` — ノード間でデータを分散するためのシャーディングキー。例: `insert into remote('127.0.0.1:9000,127.0.0.2', db, table, 'default', rand())`。型: [UInt32](../../sql-reference/data-types/int-uint.md)。

引数は[named collections](/operations/named-collections.md)を使用しても渡すことができます。

## 戻り値 {#returned-value}

リモートサーバー上にあるテーブル。

## 使用法 {#usage}

テーブル関数 `remote` および `remoteSecure` は各リクエストのたびに接続を再確立するため、代わりに `Distributed` テーブルを使用することを推奨します。また、ホスト名が設定されている場合、名前は解決され、さまざまなレプリカと作業する際にエラーはカウントされません。多数のクエリを処理する際には、必ず事前に `Distributed` テーブルを作成し、`remote` テーブル関数を使用しないでください。

`remote` テーブル関数は以下のような場合に便利です。

- あるシステムから別のシステムへの一度限りのデータ移行
- 特定のサーバーへのアクセスによるデータ比較、デバッグ、テスト、つまりアドホック接続。
- 研究目的のためにさまざまなClickHouseクラスタ間でのクエリ。
- 手動で行われる稀な分散リクエスト。
- サーバーのセットが毎回再定義される分散リクエスト。

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

複数のアドレスはカンマで区切って指定できます。この場合、ClickHouseは分散処理を使用し、すべての指定されたアドレスにクエリを送信します（異なるデータを持つシャードのように）。例:

``` text
example01-01-1,example01-02-1
```

## 例 {#examples}

### リモートサーバーからのデータ選択: {#selecting-data-from-a-remote-server}

``` sql
SELECT * FROM remote('127.0.0.1', db.remote_engine_table) LIMIT 3;
```

または[named collections](/operations/named-collections.md)を使用して:

```sql
CREATE NAMED COLLECTION creds AS
        host = '127.0.0.1',
        database = 'db';
SELECT * FROM remote(creds, table='remote_engine_table') LIMIT 3;
```

### リモートサーバーのテーブルへのデータ挿入: {#inserting-data-into-a-table-on-a-remote-server}

``` sql
CREATE TABLE remote_table (name String, value UInt32) ENGINE=Memory;
INSERT INTO FUNCTION remote('127.0.0.1', currentDatabase(), 'remote_table') VALUES ('test', 42);
SELECT * FROM remote_table;
```

### あるシステムから別のシステムへのテーブルの移行: {#migration-of-tables-from-one-system-to-another}

この例では、サンプルデータセットの1つのテーブルを使用します。データベースは `imdb` で、テーブルは `actors` です。

#### ソースClickHouseシステム上で（現在データをホストしているシステム） {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- ソースデータベースおよびテーブル名（`imdb.actors`）の確認

  ```sql
  show databases
  ```

  ```sql
  show tables in imdb
  ```

- ソースからCREATE TABLEステートメントを取得:

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

#### 宛先ClickHouseシステム上で {#on-the-destination-clickhouse-system}

- 宛先データベースの作成:

  ```sql
  CREATE DATABASE imdb
  ```

- ソースからのCREATE TABLEステートメントを使用して、宛先を作成:

  ```sql
  CREATE TABLE imdb.actors (`id` UInt32,
                            `first_name` String,
                            `last_name` String,
                            `gender` FixedString(1))
                  ENGINE = MergeTree
                  ORDER BY (id, first_name, last_name, gender);
  ```

#### ソースデプロイメントに戻る {#back-on-the-source-deployment}

リモートシステムで作成した新しいデータベースとテーブルに挿入します。ホスト、ポート、ユーザー名、パスワード、宛先データベース、宛先テーブルが必要です。

```sql
INSERT INTO FUNCTION 
remoteSecure('remote.clickhouse.cloud:9440', 'imdb.actors', 'USER', 'PASSWORD')
SELECT * from imdb.actors
```

## グロビング {#globs-in-addresses}

波括弧 `{ }` 内のパターンは、シャードのセットを生成し、レプリカを指定するために使用されます。複数の波括弧ペアがある場合、対応するセットの直積が生成されます。

以下のパターンタイプがサポートされています。

- `{a,b,c}` - 代替文字列 `a`、`b` または `c` のいずれかを表します。パターンは、最初のシャードアドレスで `a` に置き換えられ、2番目のシャードアドレスで `b` に置き換えられます。例えば、`example0{1,2}-1` はアドレス `example01-1` と `example02-1` を生成します。
- `{N..M}` - 数字の範囲。このパターンは、`N` から `M` まで（`M` を含む）増加するインデックスを持つシャードアドレスを生成します。例えば、`example0{1..2}-1` は `example01-1` と `example02-1` を生成します。
- `{0n..0m}` - 先頭ゼロを持つ数字の範囲。このパターンは、インデックスの先頭ゼロを保持します。例えば、`example{01..03}-1` は `example01-1`、`example02-1` と `example03-1` を生成します。
- `{a|b}` - `|` で区切られた任意の数のバリアント。このパターンはレプリカを指定します。例えば、`example01-{1|2}` はレプリカ `example01-1` と `example01-2` を生成します。

クエリは最初の正常なレプリカに送信されます。しかし、`remote` の場合、レプリカは現在設定されている[load_balancing](../../operations/settings/settings.md#load_balancing)設定の順序で反復されます。
生成されるアドレスの数は、[table_function_remote_max_addresses](../../operations/settings/settings.md#table_function_remote_max_addresses)設定によって制限されています。
