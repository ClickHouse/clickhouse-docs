---
description: 'ClickHouse の HTTP インターフェイスのドキュメントです。これを利用すると、任意のプラットフォームやプログラミング言語から REST API を通じて ClickHouse にアクセスできます'
sidebar_label: 'HTTP インターフェイス'
sidebar_position: 15
slug: /interfaces/http
title: 'HTTP インターフェイス'
doc_type: 'reference'
---

import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';


# HTTP インターフェース \{#http-interface\}

## 前提条件 \{#prerequisites\}

この記事の例を試すには、次のものが必要です：

- 稼働中の ClickHouse サーバーインスタンス
- `curl` がインストールされていること。Ubuntu または Debian の場合は `sudo apt install curl` を実行するか、インストール手順についてはこの[ドキュメント](https://curl.se/download.html)を参照してください。

## 概要 \{#overview\}

HTTP インターフェイスを使用すると、任意のプラットフォームやプログラミング言語から、REST API 形式で ClickHouse を利用できます。HTTP インターフェイスはネイティブ インターフェイスよりも機能は制限されますが、言語サポートが優れています。

デフォルトでは、`clickhouse-server` は次のポートで待ち受けます:

* HTTP 用にポート 8123
* HTTPS 用にポート 8443（有効化可能）

パラメータを指定せずに `GET /` リクエストを送信すると、文字列「Ok.」とともにステータスコード 200 が返されます。

```bash
$ curl 'http://localhost:8123/'
Ok.
```

&quot;Ok.&quot; は [`http_server_default_response`](../../operations/server-configuration-parameters/settings.md#http_server_default_response) で定義されている既定値であり、必要に応じて変更できます。

あわせて [HTTP response codes caveats](#http_response_codes_caveats) も参照してください。


## Webユーザーインターフェイス \{#web-ui\}

ClickHouse には Webユーザーインターフェイスが用意されており、以下のアドレスからアクセスできます。

```text
http://localhost:8123/play
```

Web UI では、クエリ実行中の進行状況表示、クエリのキャンセル、および結果のストリーミングに対応しています。
クエリパイプライン用のチャートやグラフを表示するための隠し機能も備えています。

クエリが正常に実行されると、ダウンロードボタンが表示され、CSV、TSV、JSON、JSONLines、Parquet、Markdown、または ClickHouse がサポートする任意のカスタム形式など、さまざまな形式でクエリ結果をダウンロードできます。ダウンロード機能はクエリキャッシュを利用して、クエリを再実行することなく効率的に結果を取得します。UI では多数あるページのうち 1 ページだけが表示されている場合でも、ダウンロードされるのは常に完全な結果セットです。

Web UI は、あなたのようなプロフェッショナル向けに設計されています。

<Image img={PlayUI} size="md" alt="ClickHouse Web UI screenshot" />

ヘルスチェック用のスクリプトでは `GET /ping` リクエストを使用してください。このハンドラーは常に「Ok.」（末尾に改行付き）という応答を返します。バージョン 18.12.13 から利用可能です。レプリカの遅延を確認するには `/replicas_status` も参照してください。

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```


## HTTP/HTTPS 経由でのクエリ実行 \{#querying\}

HTTP/HTTPS 経由でクエリを実行するには、次の 3 つの方法があります。

* リクエストを URL の &#39;query&#39; パラメータとして送信する
* POST メソッドを使用する
* クエリの先頭部分を &#39;query&#39; パラメータで送り、残りを POST で送信する

:::note
URL の長さはデフォルトで 1 MiB に制限されています。これは `http_max_uri_size` 設定で変更できます。
:::

成功した場合、ステータスコード 200 と、レスポンスボディに結果が返されます。
エラーが発生した場合、ステータスコード 500 と、レスポンスボディにエラー内容のテキストが返されます。

GET メソッドを使ったリクエストは「readonly」です。つまり、データを変更するクエリには POST メソッドのみを使用できます。
クエリ自体は、POST ボディ内、または URL パラメータで送信できます。いくつか例を見ていきます。

以下の例では、curl を使ってクエリ `SELECT 1` を送信しています。スペースを URL エンコードして `%20` にしている点に注意してください。

```bash title="command"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="Response"
1
```

この例では、`-nv`（非詳細）と `-O-` のパラメーターを付けて wget を実行し、結果をターミナルに出力します。
この場合、スペースを URL エンコードする必要はありません。

```bash title="command"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
```

```response
1
```

この例では、生の HTTP リクエストを netcat にパイプで渡します。

```bash title="command"
echo -ne 'GET /?query=SELECT%201 HTTP/1.0\r\n\r\n' | nc localhost 8123
```

```response title="response"
HTTP/1.0 200 OK
X-ClickHouse-Summary: {"read_rows":"1","read_bytes":"1","written_rows":"0","written_bytes":"0","total_rows_to_read":"1","result_rows":"0","result_bytes":"0","elapsed_ns":"4505959","memory_usage":"1111711"}
Date: Tue, 11 Nov 2025 18:16:01 GMT
Connection: Close
Content-Type: text/tab-separated-values; charset=UTF-8
Access-Control-Expose-Headers: X-ClickHouse-Query-Id,X-ClickHouse-Summary,X-ClickHouse-Server-Display-Name,X-ClickHouse-Format,X-ClickHouse-Timezone,X-ClickHouse-Exception-Code,X-ClickHouse-Exception-Tag
X-ClickHouse-Server-Display-Name: MacBook-Pro.local
X-ClickHouse-Query-Id: ec0d8ec6-efc4-4e1d-a14f-b748e01f5294
X-ClickHouse-Format: TabSeparated
X-ClickHouse-Timezone: Europe/London
X-ClickHouse-Exception-Tag: dngjzjnxkvlwkeua

1
```

見てのとおり、`curl` コマンドはスペースを URL エンコードしなければならない点でやや不便です。
`wget` は URL エンコードをすべて自動で行いますが、keep-alive と Transfer-Encoding: chunked を使用する HTTP/1.1 では動作が安定しないため、使用は推奨しません。

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

クエリの一部をパラメータで、残りを POST で送信すると、これら 2 つのデータパーツの間に改行が挿入されます。
例えば、次のようなものは動作しません：

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

デフォルトでは、データは [`TabSeparated`](/interfaces/formats/TabSeparated) 形式で返されます。

`FORMAT` 句をクエリで使用すると、他の形式を要求できます。例えば次のように指定します。

```bash title="command"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1, 2, 3 FORMAT JSON'
```


```response title="Response"
{
    "meta":
    [
        {
            "name": "1",
            "type": "UInt8"
        },
        {
            "name": "2",
            "type": "UInt8"
        },
        {
            "name": "3",
            "type": "UInt8"
        }
    ],

    "data":
    [
        {
            "1": 1,
            "2": 2,
            "3": 3
        }
    ],

    "rows": 1,

    "statistics":
    {
        "elapsed": 0.000515,
        "rows_read": 1,
        "bytes_read": 1
    }
}
```

`TabSeparated` 以外をデフォルトフォーマットとして指定するには、`default_format` URL パラメータまたは `X-ClickHouse-Format` ヘッダーを使用できます。

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

パラメータ化されたクエリでは POST メソッドを使用できます。パラメータは `{name:Type}` のように、波かっこ内にパラメータ名と型を指定します。パラメータ値は `param_name` という名前のクエリパラメータで渡します。

```bash
$ curl -X POST -F 'query=select {p1:UInt8} + {p2:UInt8}' -F "param_p1=3" -F "param_p2=4" 'http://localhost:8123/'

7
```


## HTTP/HTTPS 経由での INSERT クエリ \{#insert-queries\}

`INSERT` クエリでデータを送信する場合は、`POST` メソッドを使用する必要があります。この場合、クエリの先頭部分を URL パラメータで指定し、POST を使って挿入するデータを渡すことができます。挿入するデータとしては、例えば MySQL からのタブ区切りのダンプなどが考えられます。この方法では、`INSERT` クエリによって MySQL の `LOAD DATA LOCAL INFILE` と同等の処理を行えます。

### 例 \{#examples\}

テーブルを作成するには、次のようにします：

```bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

おなじみの `INSERT` クエリを使用してデータを挿入するには、次のようにします。

```bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

クエリとは別にデータを送信するには、次のようにします:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

任意のデータ形式を指定できます。たとえば、`INSERT INTO t VALUES` を記述する際に使用されるものと同じ形式である &#39;Values&#39; 形式を指定できます。

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

タブ区切りダンプからデータを挿入するには、対応する形式を指定してください。

```bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

テーブルの内容を読み取るには、次のようにします：

```bash
$ curl 'http://localhost:8123/?query=SELECT%20a%20FROM%20t'
7
8
9
10
11
12
1
2
3
4
5
6
```

:::note
並列クエリ処理により、データは順不同で出力されます。
:::

テーブルを削除するには：

```bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

データテーブルを返さない成功したリクエストでは、空のレスポンスボディが返されます。


## 圧縮 \{#compression\}

大量のデータを送信する際のネットワークトラフィック削減や、即座に圧縮されたダンプを作成する目的で圧縮を使用できます。

データ送信時には、ClickHouse 内部の圧縮フォーマットを使用できます。圧縮されたデータは独自形式であり、取り扱うには `clickhouse-compressor` プログラムが必要です。これはデフォルトで `clickhouse-client` パッケージと一緒にインストールされます。 

データ挿入の効率を高めるには、[`http_native_compression_disable_checksumming_on_decompress`](../../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress) SETTING を使用して、サーバー側のチェックサム検証を無効にします。

URL に `compress=1` を指定すると、サーバーは送信するデータを圧縮します。URL に `decompress=1` を指定すると、サーバーは `POST` メソッドで渡したデータを解凍します。

[HTTP compression](https://en.wikipedia.org/wiki/HTTP_compression) を使用することもできます。ClickHouse は次の [compression methods](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens) をサポートしています:

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

圧縮した `POST` リクエストを送信するには、リクエストヘッダーに `Content-Encoding: compression_method` を追加します。

ClickHouse にレスポンスを圧縮させるには、リクエストに `Accept-Encoding: compression_method` ヘッダーを追加します。 

すべての圧縮方式に対して、[`http_zlib_compression_level`](../../operations/settings/settings.md#http_zlib_compression_level) SETTING を使用してデータ圧縮レベルを設定できます。

:::info
一部の HTTP クライアントは、デフォルトでサーバーからのデータを解凍する場合があります（`gzip` や `deflate` など）。このため、圧縮に関する設定を正しく使用していても、解凍済みデータを受信する可能性があります。
:::

## 例 \{#examples-compression\}

圧縮データをサーバーに送信するには、次のようにします。

```bash
echo "SELECT 1" | gzip -c | \
curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

サーバーから圧縮データアーカイブを受信するには、次のようにします。

```bash
curl -vsS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'

zcat result.gz
0
1
2
```

サーバーから圧縮データを受信し、gunzip で解凍されたデータを受け取るには、次のようにします：

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```


## デフォルトデータベース \{#default-database\}

デフォルトデータベースを指定するには、`database` URL パラメータまたは `X-ClickHouse-Database` ヘッダーを使用できます。

```bash
echo 'SELECT number FROM numbers LIMIT 10' | curl 'http://localhost:8123/?database=system' --data-binary @-
0
1
2
3
4
5
6
7
8
9
```

デフォルトでは、サーバー設定で指定されているデータベースがデフォルトデータベースとして使用されます。初期状態では、これは `default` という名前のデータベースです。あるいは、テーブル名の前にドットを付けてデータベースを常に指定することもできます。


## 認証 \{#authentication\}

ユーザー名とパスワードは、次の 3 つのいずれかの方法で指定できます。

1. HTTP Basic 認証を使用する。

例：

```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. URL パラメータの `user` および `password` を使用する方法

:::warning
この方法は、パラメータが Web プロキシによってログに記録されたり、ブラウザにキャッシュされたりする可能性があるため推奨しません。
:::

例:

```bash
echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3. &#39;X-ClickHouse-User&#39; および &#39;X-ClickHouse-Key&#39; ヘッダーを使用する

例：

```bash
echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

ユーザー名が指定されていない場合は、`default` という名前が使用されます。パスワードが指定されていない場合は、空のパスワードが使用されます。
URL パラメータを使用して、単一のクエリの処理や、設定プロファイル全体に対する任意の設定を指定することもできます。

例:

```text
http://localhost:8123/?profile=web&max_rows_to_read=1000000000&query=SELECT+1
```

```bash
$ echo 'SELECT number FROM system.numbers LIMIT 10' | curl 'http://localhost:8123/?' --data-binary @-
0
1
2
3
4
5
6
7
8
9
```

詳細については、以下を参照してください。

* [Settings](/operations/settings/settings)
* [SET](/sql-reference/statements/set)


## HTTP プロトコルでの ClickHouse セッションの使用 \{#using-clickhouse-sessions-in-the-http-protocol\}

HTTP プロトコルでも ClickHouse セッションを使用できます。そのためには、リクエストに `session_id` の `GET` パラメータを追加する必要があります。セッション ID には任意の文字列を使用できます。

既定では、セッションは 60 秒間操作が行われないと終了します。このタイムアウト時間（秒）を変更するには、サーバー設定で `default_session_timeout` を変更するか、リクエストに `session_timeout` の `GET` パラメータを追加します。

セッションの状態を確認するには、`session_check=1` パラメータを指定します。1 つのセッション内で同時に実行できるクエリは 1 つだけです。

`X-ClickHouse-Progress` レスポンスヘッダーでクエリの進行状況に関する情報を受け取ることができます。そのためには、[`send_progress_in_http_headers`](../../operations/settings/settings.md#send_progress_in_http_headers) を有効にします。

以下はヘッダーのシーケンス例です。

```text
X-ClickHouse-Progress: {"read_rows":"261636","read_bytes":"2093088","total_rows_to_read":"1000000","elapsed_ns":"14050417","memory_usage":"22205975"}
X-ClickHouse-Progress: {"read_rows":"654090","read_bytes":"5232720","total_rows_to_read":"1000000","elapsed_ns":"27948667","memory_usage":"83400279"}
X-ClickHouse-Progress: {"read_rows":"1000000","read_bytes":"8000000","total_rows_to_read":"1000000","elapsed_ns":"38002417","memory_usage":"80715679"}
```

使用可能なヘッダーフィールドは次のとおりです。

| Header field         | Description                               |
| -------------------- | ----------------------------------------- |
| `read_rows`          | 読み取られた行数。                                 |
| `read_bytes`         | 読み取られたデータ量（バイト単位）。                        |
| `total_rows_to_read` | 読み取られる予定の行の合計数。                           |
| `written_rows`       | 書き込まれた行数。                                 |
| `written_bytes`      | 書き込まれたデータ量（バイト単位）。                        |
| `elapsed_ns`         | クエリの実行時間（ナノ秒）。                            |
| `memory_usage`       | クエリで使用されたメモリ量（バイト単位）。(**v25.11 以降で利用可能**) |

HTTP 接続が失われても、実行中のリクエストは自動的には停止しません。パースおよびデータのフォーマット処理はサーバー側で実行されるため、ネットワークの利用が非効率になる場合があります。

次のオプションパラメータを指定できます。

| Parameters             | Description                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| `query_id` (optional)  | クエリ ID（任意の文字列）として渡すことができます。[`replace_running_query`](/operations/settings/settings#replace_running_query) |
| `quota_key` (optional) | QUOTA キー（任意の文字列）として渡すことができます。 [&quot;Quotas&quot;](/operations/quotas)                                    |

HTTP インターフェイスでは、クエリで使用する外部データ（外部一時テーブル）を渡すことができます。詳細については、[&quot;External data for query processing&quot;](/engines/table-engines/special/external-data) を参照してください。


## レスポンスのバッファリング \{#response-buffering\}

レスポンスのバッファリングはサーバー側で有効化できます。このために、以下の URL パラメータが用意されています。

* `buffer_size`
* `wait_end_of_query`

次の設定を使用できます。

* [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
* [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

`buffer_size` は、サーバーのメモリ内でバッファリングする結果のバイト数を決定します。レスポンスボディがこの閾値より大きい場合、バッファの内容が HTTP チャネルに書き出され、残りのデータは直接 HTTP チャネルに送信されます。

レスポンス全体をバッファリングするには、`wait_end_of_query=1` を設定します。この場合、メモリに格納されていないデータは一時的なサーバーファイルにバッファリングされます。

例:

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
バッファリングを使用して、レスポンスコードと HTTP ヘッダーがクライアントに送信された後にクエリ処理エラーが発生する状況を回避してください。このような場合、エラーメッセージはレスポンスボディの末尾に書き込まれ、クライアント側ではレスポンスをパースする段階になって初めてエラーを検出できます。
:::


## クエリパラメータでロールを設定する \{#setting-role-with-query-parameters\}

この機能は ClickHouse 24.4 で追加されました。

特定のシナリオでは、文自体を実行する前に、まず付与済みのロールを設定する必要がある場合があります。
しかし、マルチステートメントは許可されていないため、`SET ROLE` とその文を同時に送信することはできません。

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

上記のコマンドを実行すると、エラーが発生します。

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

この制限を回避するには、代わりに `role` クエリパラメータを使用してください。

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

これは、その文の前に `SET ROLE my_role` を実行した場合と同等です。

また、複数の `role` クエリパラメータを指定することもできます。

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

この場合、`?role=my_role&role=my_other_role` は、ステートメントの前に `SET ROLE my_role, my_other_role` を実行するのと同様の効果があります。


## HTTP レスポンスコードに関する注意事項 \{#http_response_codes_caveats\}

HTTP プロトコルの制約により、HTTP 200 レスポンスコードが返ってきても、そのクエリが正常に完了したとは限りません。

以下はその例です。

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

この動作の理由は、HTTP プロトコルの性質によるものです。HTTP ヘッダーはまず HTTP ステータスコード 200 とともに送信され、その後に HTTP ボディが続き、エラーはプレーンテキストとしてボディ内に挿入されます。

この動作は使用されるフォーマット、つまり `Native`、`TSV`、`JSON` のいずれであっても変わらず、エラーメッセージは常にレスポンスストリームの途中に現れます。

`wait_end_of_query=1`（[レスポンスのバッファリング](#response-buffering)）を有効にすることで、この問題を軽減できます。この場合、HTTP ヘッダーの送信はクエリ全体の実行が完了するまで遅延されます。ただし、結果は依然として [`http_response_buffer_size`](../../operations/settings/settings.md#http_response_buffer_size) の範囲内に収まる必要があり、さらに [`send_progress_in_http_headers`](../../operations/settings/settings.md#send_progress_in_http_headers) などの他の設定によってヘッダー送信の遅延が妨げられる可能性があるため、問題を完全に解決するわけではありません。

:::tip
すべてのエラーを捕捉する唯一の方法は、必要なフォーマットでパースする前に HTTP ボディを解析することです。
:::

ClickHouse におけるこの種の例外は、`http_write_exception_in_output_format=0`（デフォルト）の場合、どのフォーマット（`Native`、`TSV`、`JSON` など）が使用されていても、一貫した例外のフォーマットを持ちます。これにより、クライアント側でエラーメッセージをパースして抽出しやすくなります。

```text
\r\n
__exception__\r\n
<TAG>\r\n
<error message>\r\n
<message_length> <TAG>\r\n
__exception__\r\n

```

ここで、`<TAG>` は 16 バイトのランダムなタグであり、`X-ClickHouse-Exception-Tag` レスポンスヘッダーで送信されるタグと同一です。
`<error message>` は実際の例外メッセージであり、その正確な長さは `<message_length>` から取得できます。上で説明したこの例外ブロック全体のサイズは最大で 16 KiB です。

次に、`JSON` 形式の例を示します

```bash
$ curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)+FORMAT+JSON"
...
{
    "meta":
    [
        {
            "name": "sleepEachRow(0.001)",
            "type": "UInt8"
        },
        {
            "name": "throwIf(equals(number, 2))",
            "type": "UInt8"
        }
    ],

    "data":
    [
        {
            "sleepEachRow(0.001)": 0,
            "throwIf(equals(number, 2))": 0
        },
        {
            "sleepEachRow(0.001)": 0,
            "throwIf(equals(number, 2))": 0
        }
__exception__
dmrdfnujjqvszhav
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(__table1.number, 2_UInt8) :: 1) -> throwIf(equals(__table1.number, 2_UInt8)) UInt8 : 0'. (FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 25.11.1.1)
262 dmrdfnujjqvszhav
__exception__
```

こちらは同様の例ですが、`CSV` 形式での例です


```bash
$ curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)+FORMAT+CSV"
...
<
0,0
0,0

__exception__
rumfyutuqkncbgau
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(__table1.number, 2_UInt8) :: 1) -> throwIf(equals(__table1.number, 2_UInt8)) UInt8 : 0'. (FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 25.11.1.1)
262 rumfyutuqkncbgau
__exception__
```


## パラメータ付きクエリ \{#cli-queries-with-parameters\}

パラメータ付きのクエリを作成し、対応する HTTP リクエストのパラメータから値を渡すことができます。詳細については、[CLI でのパラメータ付きクエリ](../../interfaces/cli.md#cli-queries-with-parameters)を参照してください。

### 例 \{#example-3\}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```


### URL パラメータ内のタブ \{#tabs-in-url-parameters\}

クエリパラメータは「エスケープされた」形式としてパースされます。これには、`\N` として NULL 値を明確にパースできるといった利点があります。これは、タブ文字を `\t`（または `\` とタブ）としてエンコードする必要があることを意味します。たとえば、次の入力には `abc` と `123` の間に実際のタブ文字が含まれており、その結果、入力文字列は 2 つの値に分割されます。

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

しかし、URL パラメータで実際のタブ文字を `%09` としてエンコードしようとしても、正しく解釈されません。

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Value abc    123 cannot be parsed as String for query parameter 'arg1' because it isn't parsed completely: only 3 of 7 bytes was parsed: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

URL パラメータを使用する場合、`\t` を `%5C%09` としてエンコードする必要があります。例えば、次のように指定します。

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```


## 事前定義済み HTTP インターフェイス \{#predefined_http_interface\}

ClickHouse は、HTTP インターフェイスを介して特定のクエリをサポートしています。たとえば、次のようにテーブルにデータを書き込むことができます。

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouse は、[Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter) のようなサードパーティーツールとの連携を容易にするための Predefined HTTP Interface にも対応しています。例を見てみましょう。

まずはじめに、このセクションをサーバーの設定ファイルに追加してください。

`http_handlers` セクションでは複数の `rule` を定義します。ClickHouse は受信した HTTP リクエストを `rule` 内で定義された種別と照合し、最初にマッチしたルールのハンドラーを実行します。そして、マッチが成功すると、ClickHouse は対応する事前定義されたクエリを実行します。

```yaml title="config.xml"
<http_handlers>
    <rule>
        <url>/predefined_query</url>
        <methods>POST,GET</methods>
        <handler>
            <type>predefined_query_handler</type>
            <query>SELECT * FROM system.metrics LIMIT 5 FORMAT Template SETTINGS format_template_resultset = 'prometheus_template_output_format_resultset', format_template_row = 'prometheus_template_output_format_row', format_template_rows_between_delimiter = '\n'</query>
        </handler>
    </rule>
    <rule>...</rule>
    <rule>...</rule>
</http_handlers>
```

Prometheus フォーマットのデータは、次の URL に直接リクエストできます：

```bash
$ curl -v 'http://localhost:8123/predefined_query'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /predefined_query HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
>
< HTTP/1.1 200 OK
< Date: Tue, 28 Apr 2020 08:52:56 GMT
< Connection: Keep-Alive
< Content-Type: text/plain; charset=UTF-8
< X-ClickHouse-Server-Display-Name: i-mloy5trc
< Transfer-Encoding: chunked
< X-ClickHouse-Query-Id: 96fe0052-01e6-43ce-b12a-6b7370de6e8a
< X-ClickHouse-Format: Template
< X-ClickHouse-Timezone: Asia/Shanghai
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
# HELP "Query" "Number of executing queries"
# TYPE "Query" counter
"Query" 1

# HELP "Merge" "Number of executing background merges"
# TYPE "Merge" counter
"Merge" 0

# HELP "PartMutation" "Number of mutations (ALTER DELETE/UPDATE)"
# TYPE "PartMutation" counter
"PartMutation" 0

# HELP "ReplicatedFetch" "Number of data parts being fetched from replica"
# TYPE "ReplicatedFetch" counter
"ReplicatedFetch" 0

# HELP "ReplicatedSend" "Number of data parts being sent to replicas"
# TYPE "ReplicatedSend" counter
"ReplicatedSend" 0

* Connection #0 to host localhost left intact

* Connection #0 to host localhost left intact
```

`http_handlers` の設定オプションは、次のように機能します。

`rule` では、次のパラメータを設定できます:

* `method`
* `headers`
* `url`
* `full_url`
* `handler`

これらの各パラメータについては、以下で説明します。


- `method` は HTTP リクエストのメソッド部分のマッチングを担当します。`method` は HTTP プロトコルにおける [`method`]    
  (https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) の定義に完全に準拠します。これは省略可能な設定項目です。設定ファイルで定義されていない場合、HTTP リクエストのメソッド部分にはマッチしません。

- `url` は HTTP リクエストの URL 部分（パスおよびクエリ文字列）のマッチングを担当します。
  `url` が `regex:` で始まる場合は、[RE2](https://github.com/google/re2) の正規表現を使用することを意味します。
  これも省略可能な設定項目です。設定ファイルで定義されていない場合、HTTP リクエストの URL 部分にはマッチしません。

- `full_url` は `url` と同様ですが、完全な URL、すなわち `schema://host:port/path?query_string` を対象とします。
  ClickHouse は「バーチャルホスト」をサポートしない点に注意してください。このため、`host` は IP アドレスであり（`Host` ヘッダーの値ではありません）、IP アドレスとして扱われます。

- `empty_query_string` - リクエスト内にクエリ文字列（`?query_string`）が存在しないことを保証します。

- `headers` は HTTP リクエストのヘッダー部分のマッチングを担当します。RE2 の正規表現と互換性があります。これも省略可能な
  設定項目です。設定ファイルで定義されていない場合、HTTP リクエストのヘッダー部分にはマッチしません。

- `handler` には主な処理ロジックが含まれます。

  `type` として以下を指定できます:
  - [`predefined_query_handler`](#predefined_query_handler)
  - [`dynamic_query_handler`](#dynamic_query_handler)
  - [`static`](#static)
  - [`redirect`](#redirect)

  また、以下のパラメータを指定できます:
  - `query` — `predefined_query_handler` タイプで使用し、handler が呼び出されたときにクエリを実行します。
  - `query_param_name` — `dynamic_query_handler` タイプで使用し、HTTP リクエストパラメータ内の `query_param_name` に対応する値を抽出して実行します。
  - `status` — `static` タイプで使用し、レスポンスのステータスコードを指定します。
  - `content_type` — 任意のタイプで使用し、レスポンスの [content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) を指定します。
  - `http_response_headers` — 任意のタイプで使用し、レスポンスヘッダーのマップを指定します。content type の設定にも使用できます。
  - `response_content` — `static` タイプで使用し、クライアントに送信されるレスポンスコンテンツを指定します。プレフィックスとして 'file://' または 'config://' を使用する場合、ファイルまたは設定からコンテンツを取得してクライアントに送信します。
  - `user` - クエリを実行するユーザー（デフォルトのユーザーは `default`）を指定します。
    **注意**: このユーザーのパスワードを指定する必要はありません。

次に、`type` ごとの設定方法について説明します。

### predefined_query_handler \{#predefined_query_handler\}

`predefined_query_handler` は、`Settings` と `query_params` の値の設定をサポートします。`predefined_query_handler` タイプ内で `query` を構成できます。

`query` の値は `predefined_query_handler` のあらかじめ定義されたクエリであり、HTTP リクエストがマッチしたときに ClickHouse によって実行され、そのクエリ結果が返されます。これは必須の設定項目です。

次の例では、[`max_threads`](../../operations/settings/settings.md#max_threads) および [`max_final_threads`](../../operations/settings/settings.md#max_final_threads) の各設定の値を定義し、その後 system テーブルをクエリして、これらの設定が正常に適用されたかどうかを確認します。

:::note
`query`、`play`、`ping` などのデフォルトの `handlers` を保持するには、`<defaults/>` ルールを追加します。
:::

例：

```yaml
<http_handlers>
    <rule>
        <url><![CDATA[regex:/query_param_with_url/(?P<name_1>[^/]+)]]></url>
        <methods>GET</methods>
        <headers>
            <XXX>TEST_HEADER_VALUE</XXX>
            <PARAMS_XXX><![CDATA[regex:(?P<name_2>[^/]+)]]></PARAMS_XXX>
        </headers>
        <handler>
            <type>predefined_query_handler</type>
            <query>
                SELECT name, value FROM system.settings
                WHERE name IN ({name_1:String}, {name_2:String})
            </query>
        </handler>
    </rule>
    <defaults/>
</http_handlers>
```

```bash
curl -H 'XXX:TEST_HEADER_VALUE' -H 'PARAMS_XXX:max_final_threads' 'http://localhost:8123/query_param_with_url/max_threads?max_threads=1&max_final_threads=2'
max_final_threads    2
max_threads    1
```


#### 仮想パラメータ `_request_body` \{#virtual-param-request-body\}

URL パラメータ、ヘッダー、およびクエリパラメータに加えて、`predefined_query_handler` は特殊な仮想パラメータ `_request_body` をサポートします。
これは HTTP リクエストボディの生データを文字列として保持します。
これにより、任意のデータ形式を受け付けてクエリ内で処理できる柔軟な REST API を作成できます。

たとえば、`_request_body` を使用して、POST リクエストで JSON データを受け取り、それをテーブルに挿入する REST エンドポイントを実装できます。

```yaml
<http_handlers>
    <rule>
        <methods>POST</methods>
        <url>/api/events</url>
        <handler>
            <type>predefined_query_handler</type>
            <query>
                INSERT INTO events (id, data)
                SELECT {id:UInt32}, {_request_body:String}
            </query>
        </handler>
    </rule>
    <defaults/>
</http_handlers>
```

次に、このエンドポイントにデータを送信できます：

```bash
curl -X POST 'http://localhost:8123/api/events?id=123' \
  -H 'Content-Type: application/json' \
  -d '{"user": "john", "action": "login", "timestamp": "2024-01-01T10:00:00Z"}'
```

:::note
1つの `predefined_query_handler` では、サポートされる `query` は1つだけです。
:::


### dynamic_query_handler \{#dynamic_query_handler\}

`dynamic_query_handler` では、クエリは HTTP リクエストのパラメータとして指定します。`predefined_query_handler` ではクエリが設定ファイル内に記述される点が異なります。`query_param_name` は `dynamic_query_handler` 内で設定できます。

ClickHouse は、HTTP リクエストの URL に含まれる `query_param_name` の値に対応する値を抽出して実行します。`query_param_name` のデフォルト値は `/query` です。これは任意の設定です。設定ファイルに定義がない場合、パラメータは渡されません。

この機能を試すために、次の例では [`max_threads`](../../operations/settings/settings.md#max_threads) と `max_final_threads` の値を定義し、設定が正しく適用されたかどうかを確認するクエリを実行します。

Example:

```yaml
<http_handlers>
    <rule>
    <headers>
        <XXX>TEST_HEADER_VALUE_DYNAMIC</XXX>    </headers>
    <handler>
        <type>dynamic_query_handler</type>
        <query_param_name>query_param</query_param_name>
    </handler>
    </rule>
    <defaults/>
</http_handlers>
```

```bash
curl  -H 'XXX:TEST_HEADER_VALUE_DYNAMIC'  'http://localhost:8123/own?max_threads=1&max_final_threads=2&param_name_1=max_threads&param_name_2=max_final_threads&query_param=SELECT%20name,value%20FROM%20system.settings%20where%20name%20=%20%7Bname_1:String%7D%20OR%20name%20=%20%7Bname_2:String%7D'
max_threads 1
max_final_threads   2
```


### static \{#static\}

`static` は、[`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)、[status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)、および `response_content` を返すことができます。`response_content` には返却するコンテンツを指定できます。

例えば、「Say Hi!」というメッセージを返すには:

```yaml
<http_handlers>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/hi</url>
            <handler>
                <type>static</type>
                <status>402</status>
                <content_type>text/html; charset=UTF-8</content_type>
                <http_response_headers>
                    <Content-Language>en</Content-Language>
                    <X-My-Custom-Header>43</X-My-Custom-Header>
                </http_response_headers>
                #highlight-next-line
                <response_content>Say Hi!</response_content>
            </handler>
        </rule>
        <defaults/>
</http_handlers>
```

`http_response_headers` を使用して、`content_type` の代わりにコンテンツタイプを設定できます。

```yaml
<http_handlers>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/hi</url>
            <handler>
                <type>static</type>
                <status>402</status>
                #begin-highlight
                <http_response_headers>
                    <Content-Type>text/html; charset=UTF-8</Content-Type>
                    <Content-Language>en</Content-Language>
                    <X-My-Custom-Header>43</X-My-Custom-Header>
                </http_response_headers>
                #end-highlight
                <response_content>Say Hi!</response_content>
            </handler>
        </rule>
        <defaults/>
</http_handlers>
```

```bash
curl -vv  -H 'XXX:xxx' 'http://localhost:8123/hi'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /hi HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
> XXX:xxx
>
< HTTP/1.1 402 Payment Required
< Date: Wed, 29 Apr 2020 03:51:26 GMT
< Connection: Keep-Alive
< Content-Type: text/html; charset=UTF-8
< Transfer-Encoding: chunked
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
* Connection #0 to host localhost left intact
Say Hi!%
```

クライアントへ送信するように設定されたコンテンツを取得します。

```yaml
<get_config_static_handler><![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]></get_config_static_handler>

<http_handlers>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/get_config_static_handler</url>
            <handler>
                <type>static</type>
                <response_content>config://get_config_static_handler</response_content>
            </handler>
        </rule>
</http_handlers>
```


```bash
$ curl -v  -H 'XXX:xxx' 'http://localhost:8123/get_config_static_handler'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /get_config_static_handler HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
> XXX:xxx
>
< HTTP/1.1 200 OK
< Date: Wed, 29 Apr 2020 04:01:24 GMT
< Connection: Keep-Alive
< Content-Type: text/plain; charset=UTF-8
< Transfer-Encoding: chunked
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
* Connection #0 to host localhost left intact
<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>%
```

クライアントに送信されたファイルの内容を確認するには、次のようにします。

```yaml
<http_handlers>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/get_absolute_path_static_handler</url>
            <handler>
                <type>static</type>
                <content_type>text/html; charset=UTF-8</content_type>
                <http_response_headers>
                    <ETag>737060cd8c284d8af7ad3082f209582d</ETag>
                </http_response_headers>
                <response_content>file:///absolute_path_file.html</response_content>
            </handler>
        </rule>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/get_relative_path_static_handler</url>
            <handler>
                <type>static</type>
                <content_type>text/html; charset=UTF-8</content_type>
                <http_response_headers>
                    <ETag>737060cd8c284d8af7ad3082f209582d</ETag>
                </http_response_headers>
                <response_content>file://./relative_path_file.html</response_content>
            </handler>
        </rule>
</http_handlers>
```


```bash
$ user_files_path='/var/lib/clickhouse/user_files'
$ sudo echo "<html><body>Relative Path File</body></html>" > $user_files_path/relative_path_file.html
$ sudo echo "<html><body>Absolute Path File</body></html>" > $user_files_path/absolute_path_file.html
$ curl -vv -H 'XXX:xxx' 'http://localhost:8123/get_absolute_path_static_handler'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /get_absolute_path_static_handler HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
> XXX:xxx
>
< HTTP/1.1 200 OK
< Date: Wed, 29 Apr 2020 04:18:16 GMT
< Connection: Keep-Alive
< Content-Type: text/html; charset=UTF-8
< Transfer-Encoding: chunked
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
<html><body>Absolute Path File</body></html>
* Connection #0 to host localhost left intact
$ curl -vv -H 'XXX:xxx' 'http://localhost:8123/get_relative_path_static_handler'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /get_relative_path_static_handler HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
> XXX:xxx
>
< HTTP/1.1 200 OK
< Date: Wed, 29 Apr 2020 04:18:31 GMT
< Connection: Keep-Alive
< Content-Type: text/html; charset=UTF-8
< Transfer-Encoding: chunked
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
<html><body>Relative Path File</body></html>
* Connection #0 to host localhost left intact
```


### redirect \{#redirect\}

`redirect` は `location` へ `302` リダイレクトを行います。

例えば、次のようにして ClickHouse Play 用に `play` に対して自動的に `set user` を追加できます:

```xml
<clickhouse>
    <http_handlers>
        <rule>
            <methods>GET</methods>
            <url>/play</url>
            <handler>
                <type>redirect</type>
                <location>/play?user=play</location>
            </handler>
        </rule>
    </http_handlers>
</clickhouse>
```


## HTTP レスポンスヘッダー \{#http-response-headers\}

ClickHouse では、設定可能な任意の種類のハンドラーに適用できるカスタム HTTP レスポンスヘッダーを設定できます。これらのヘッダーは、ヘッダー名とその値を表すキーと値のペアを受け取る `http_response_headers` 設定項目を使用して指定します。この機能は、カスタムセキュリティヘッダー、CORS ポリシー、その他の HTTP ヘッダー要件を ClickHouse の HTTP インターフェイス全体で実装する場合に特に有用です。

例えば、次のような対象に対してヘッダーを設定できます。

* 通常のクエリエンドポイント
* Web UI
* ヘルスチェック

また、`common_http_response_headers` を指定することも可能です。これらは、設定内で定義されたすべての HTTP ハンドラーに適用されます。

ヘッダーは、設定されたすべてのハンドラーに対する HTTP レスポンスに含まれるようになります。

以下の例では、すべてのサーバーレスポンスに 2 つのカスタムヘッダー `X-My-Common-Header` と `X-My-Custom-Header` が含まれます。

```xml
<clickhouse>
    <http_handlers>
        <common_http_response_headers>
            <X-My-Common-Header>Common header</X-My-Common-Header>
        </common_http_response_headers>
        <rule>
            <methods>GET</methods>
            <url>/ping</url>
            <handler>
                <type>ping</type>
                <http_response_headers>
                    <X-My-Custom-Header>Custom indeed</X-My-Custom-Header>
                </http_response_headers>
            </handler>
        </rule>
    </http_handlers>
</clickhouse>
```


## HTTP ストリーミング中の例外発生時における有効な JSON/XML レスポンス \{#valid-output-on-exception-http-streaming\}

HTTP 経由でクエリを実行している間に、一部のデータがすでに送信された後で例外が発生することがあります。通常、例外はプレーンテキストでクライアントに送信されます。
データを出力する際に特定のデータ形式が使用されている場合、指定されたデータ形式としては不正な出力になってしまう可能性があります。
これを防ぐために、ClickHouse に例外を指定されたフォーマットで書き出すよう指示する [`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format) という設定（デフォルトでは無効）を使用できます（現在は XML および JSON* フォーマットでサポートされています）。

例:

```bash
$ curl 'http://localhost:8123/?query=SELECT+number,+throwIf(number>3)+from+system.numbers+format+JSON+settings+max_block_size=1&http_write_exception_in_output_format=1'
{
    "meta":
    [
        {
            "name": "number",
            "type": "UInt64"
        },
        {
            "name": "throwIf(greater(number, 2))",
            "type": "UInt8"
        }
    ],

    "data":
    [
        {
            "number": "0",
            "throwIf(greater(number, 2))": 0
        },
        {
            "number": "1",
            "throwIf(greater(number, 2))": 0
        },
        {
            "number": "2",
            "throwIf(greater(number, 2))": 0
        }
    ],

    "rows": 3,

    "exception": "Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(greater(number, 2) :: 2) -> throwIf(greater(number, 2)) UInt8 : 1'. (FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 23.8.1.1)"
}
```

```bash
$ curl 'http://localhost:8123/?query=SELECT+number,+throwIf(number>2)+from+system.numbers+format+XML+settings+max_block_size=1&http_write_exception_in_output_format=1'
<?xml version='1.0' encoding='UTF-8' ?>
<result>
    <meta>
        <columns>
            <column>
                <name>number</name>
                <type>UInt64</type>
            </column>
            <column>
                <name>throwIf(greater(number, 2))</name>
                <type>UInt8</type>
            </column>
        </columns>
    </meta>
    <data>
        <row>
            <number>0</number>
            <field>0</field>
        </row>
        <row>
            <number>1</number>
            <field>0</field>
        </row>
        <row>
            <number>2</number>
            <field>0</field>
        </row>
    </data>
    <rows>3</rows>
    <exception>Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(greater(number, 2) :: 2) -> throwIf(greater(number, 2)) UInt8 : 1'. (FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 23.8.1.1)</exception>
</result>
```
