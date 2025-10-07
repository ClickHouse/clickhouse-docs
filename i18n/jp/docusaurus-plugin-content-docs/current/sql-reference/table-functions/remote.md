---
'description': 'テーブル関数 `remote` は、分散テーブルを作成せずに、リモートサーバーにオンザフライでアクセスすることを可能にします。テーブル関数
  `remoteSecure` は、セキュアな接続を介して `remote` と同じです。'
'sidebar_label': 'remote'
'sidebar_position': 175
'slug': '/sql-reference/table-functions/remote'
'title': 'remote, remoteSecure'
'doc_type': 'reference'
---


# remote, remoteSecure テーブル関数

テーブル関数 `remote` は、リモートサーバーにオンザフライでアクセスすることを可能にします。つまり、[分散テーブル](../../engines/table-engines/special/distributed.md)を作成することなく利用できます。テーブル関数 `remoteSecure` は、`remote` と同様ですが、安全な接続を介して動作します。

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

| 引数            | 説明                                                                                                                                                                                                                                                                                                                                                          |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `addresses_expr` | リモートサーバーのアドレス、または複数のリモートサーバーのアドレスを生成する式。形式: `host` または `host:port`。<br/><br/>    `host` はサーバー名、またはIPv4またはIPv6アドレスとして指定できます。IPv6アドレスは角括弧で指定する必要があります。<br/><br/>    `port` はリモートサーバー上のTCPポートです。ポートが省略された場合、テーブル関数 `remote` に対してはサーバーの設定ファイルから [tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port) が使用され（デフォルトは9000）、テーブル関数 `remoteSecure` に対しては [tcp_port_secure](../../operations/server-configuration-parameters/settings.md#tcp_port_secure) が使用されます（デフォルトは9440）。<br/><br/>    IPv6アドレスの場合、ポートは必須です。<br/><br/>    `addresses_expr` のみが指定された場合、`db` と `table` はデフォルトで `system.one` を使用します。<br/><br/>    タイプ: [String](../../sql-reference/data-types/string.md)。 |
| `db`            | データベース名。タイプ: [String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                                                                     |
| `table`         | テーブル名。タイプ: [String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                                                                         |
| `user`          | ユーザー名。指定しない場合は、`default` が使用されます。タイプ: [String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                           |
| `password`      | ユーザーパスワード。指定しない場合は、空のパスワードが使用されます。タイプ: [String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                   |
| `sharding_key`  | ノード間でデータを分散するためのシャーディングキー。例: `insert into remote('127.0.0.1:9000,127.0.0.2', db, table, 'default', rand())`。タイプ: [UInt32](../../sql-reference/data-types/int-uint.md)。                                                                                                                                                    |

引数は [named collections](operations/named-collections.md) を使用して渡すこともできます。

## 戻り値 {#returned-value}

リモートサーバー上にあるテーブル。

## 使用法 {#usage}

テーブル関数 `remote` と `remoteSecure` は各リクエストごとに接続を再確立するため、`分散テーブル` を使用することが推奨されます。また、ホスト名が設定されている場合、名前が解決され、さまざまなレプリカで作業する際のエラーはカウントされません。多数のクエリを処理する際は、常に事前に `分散テーブル` を作成し、`remote` テーブル関数を使用しないでください。

`remote` テーブル関数は以下の場合に役立ちます：

- あるシステムから別のシステムへの一次的なデータ移行
- データ比較、デバッグ、テストのための特定のサーバーへのアクセス、つまりアドホック接続。
- 研究目的のためのさまざまなClickHouseクラスター間のクエリ。
- 手動で行われる稀な分散リクエスト。
- 毎回サーバーのセットが再定義される分散リクエスト。

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

複数のアドレスはカンマ区切りで指定できます。この場合、ClickHouseは分散処理を使用し、指定されたすべてのアドレスにクエリを送信します（異なるデータを持つシャードのように）。例：

```text
example01-01-1,example01-02-1
```

## 例 {#examples}

### リモートサーバーからのデータの選択: {#selecting-data-from-a-remote-server}

```sql
SELECT * FROM remote('127.0.0.1', db.remote_engine_table) LIMIT 3;
```

または [named collections](operations/named-collections.md) を使用：

```sql
CREATE NAMED COLLECTION creds AS
        host = '127.0.0.1',
        database = 'db';
SELECT * FROM remote(creds, table='remote_engine_table') LIMIT 3;
```

### リモートサーバー上のテーブルへのデータの挿入: {#inserting-data-into-a-table-on-a-remote-server}

```sql
CREATE TABLE remote_table (name String, value UInt32) ENGINE=Memory;
INSERT INTO FUNCTION remote('127.0.0.1', currentDatabase(), 'remote_table') VALUES ('test', 42);
SELECT * FROM remote_table;
```

### あるシステムから別のシステムへのテーブルの移行: {#migration-of-tables-from-one-system-to-another}

この例では、サンプルデータセットからの1つのテーブルを使用します。データベースは `imdb` で、テーブルは `actors` です。

#### ソース ClickHouse システム上で（現在データをホストしているシステム） {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- ソースデータベースとテーブル名を確認します（`imdb.actors`）

```sql
show databases
```

```sql
show tables in imdb
```

- ソースから CREATE TABLE ステートメントを取得します：

```sql
SELECT create_table_query
FROM system.tables
WHERE database = 'imdb' AND table = 'actors'
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

#### 目的地 ClickHouse システム上で {#on-the-destination-clickhouse-system}

- 目的地データベースを作成します：

```sql
CREATE DATABASE imdb
```

- ソースからの CREATE TABLE ステートメントを使用して、目的地を作成します：

```sql
CREATE TABLE imdb.actors (`id` UInt32,
                          `first_name` String,
                          `last_name` String,
                          `gender` FixedString(1))
                ENGINE = MergeTree
                ORDER BY (id, first_name, last_name, gender);
```

#### ソースのデプロイメントに戻る {#back-on-the-source-deployment}

リモートシステムで作成された新しいデータベースとテーブルに挿入します。ホスト、ポート、ユーザー名、パスワード、目的地データベース、および目的地テーブルが必要です。

```sql
INSERT INTO FUNCTION
remoteSecure('remote.clickhouse.cloud:9440', 'imdb.actors', 'USER', 'PASSWORD')
SELECT * from imdb.actors
```

## グロビング {#globs-in-addresses}

波括弧 `{ }` のパターンは、シャードのセットを生成し、レプリカを指定するために使用されます。波括弧のペアが複数ある場合、対応するセットの直積が生成されます。

以下のパターンタイプがサポートされています。

- `{a,b,c}` - 代替文字列 `a`、`b`、または `c` のいずれかを表します。このパターンは、最初のシャードアドレスで `a` に置き換えられ、2番目のシャードアドレスで `b` に置き換えられ、と続きます。例えば、`example0{1,2}-1` はアドレス `example01-1` と `example02-1` を生成します。
- `{N..M}` - 数字の範囲。このパターンは、`N` から (そして `M` を含む) 増加するインデックスを持つシャードアドレスを生成します。例えば、`example0{1..2}-1` は `example01-1` と `example02-1` を生成します。
- `{0n..0m}` - 先頭ゼロのある数字の範囲。このパターンは、インデックス内の先頭ゼロを保持します。例えば、`example{01..03}-1` は `example01-1`、`example02-1` および `example03-1` を生成します。
- `{a|b}` - `|` で区切られた任意の数のバリアント。このパターンはレプリカを指定します。例えば、`example01-{1|2}` はレプリカ `example01-1` と `example01-2` を生成します。

クエリは最初の健全なレプリカに送信されます。ただし、`remote` の場合、レプリカは現在 [load_balancing](../../operations/settings/settings.md#load_balancing) 設定に設定された順序で反復されます。
生成されるアドレスの数は、[table_function_remote_max_addresses](../../operations/settings/settings.md#table_function_remote_max_addresses) 設定によって制限されています。
