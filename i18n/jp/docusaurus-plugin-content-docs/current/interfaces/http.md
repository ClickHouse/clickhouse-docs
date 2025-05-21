---
description: 'Documentation for the HTTP interface in ClickHouse, which provides REST
  API access to ClickHouse from any platform and programming language'
sidebar_label: 'HTTP Interface'
sidebar_position: 15
slug: /interfaces/http
title: 'HTTP Interface'
---

import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';

# HTTPインターフェース
## 前提条件 {#prerequisites}

この記事の例を実行するには、以下が必要です：
- 実行中の ClickHouse サーバーインスタンス
- `curl` がインストールされていること。Ubuntu や Debian では `sudo apt install curl` を実行するか、この [ドキュメント](https://curl.se/download.html) を参照してインストール手順を確認してください。
## 概要 {#overview}

HTTPインターフェースを利用することで、任意のプラットフォームから任意のプログラミング言語で ClickHouse を REST API の形で使用できます。HTTPインターフェースはネイティブインターフェースより制限がありますが、言語のサポートは優れています。

デフォルトでは、`clickhouse-server` は以下のポートでリッスンしています：
- HTTP 用のポート 8123
- HTTPS 用のポート 8443（有効化可能）

パラメーターなしで `GET /` リクエストを送信すると、200 のレスポンスコードと文字列 "Ok." が返されます：

```bash
$ curl 'http://localhost:8123/'
Ok.
```

"Ok." は [`http_server_default_response`](../operations/server-configuration-parameters/settings.md#http_server_default_response) で定義されたデフォルト値であり、必要に応じて変更できます。

なお、[HTTPレスポンスコードの注意点](#http_response_codes_caveats) もご覧ください。
## ウェブユーザーインターフェース {#web-ui}

ClickHouse では、以下のアドレスからアクセスできるウェブユーザーインターフェースが含まれています：

```text
http://localhost:8123/play
```

ウェブUIは、クエリ実行中の進行状況の表示、クエリのキャンセル、および結果のストリーミングの表示をサポートしています。
また、クエリパイプラインのチャートやグラフを表示するための秘密の機能もあります。

このウェブUIは、あなたのような専門家のために設計されています。

<Image img={PlayUI} size="md" alt="ClickHouse Web UI スクリーンショット" />

ヘルスチェックスクリプトでは `GET /ping` リクエストを使用します。このハンドラーは常に "Ok."（末尾に改行あり）を返します。バージョン 18.12.13 から利用可能です。レプリカの遅延を確認するには `/replicas_status` も参照してください。

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```
## HTTP/HTTPS 経由のクエリ {#querying}

HTTP/HTTPS 経由でクエリを送信するには、3つのオプションがあります：
- リクエストを URL の 'query' パラメータとして送信する
- POST メソッドを使用する。
- クエリの冒頭を 'query' パラメータに送り、残りを POST で送信する

:::note
URL のサイズはデフォルトで 1 MiB に制限されています。これは `http_max_uri_size` 設定で変更可能です。
:::

成功すると、200 のレスポンスコードが返され、レスポンスボディに結果が含まれます。
エラーが発生した場合は、500 のレスポンスコードが返され、レスポンスボディにエラーの説明がテキストとして含まれます。

GET を使用したリクエストは「読み取り専用」です。これは、データを変更するクエリには POST メソッドのみを使用できることを意味します。
クエリ自体は POST ボディか URL パラメータのいずれかに送信できます。いくつかの例を見てみましょう。

以下の例では、`curl` を使用してクエリ `SELECT 1` を送信しています。スペースの URL エンコーディングに %20 を使用することに注意してください。

```bash title="command"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="Response"
1
```

この例では `wget` を使用し、`-nv`（非冗長）および `-O-` パラメータを用いて結果をターミナルに出力しています。
この場合、スペースに対して URL エンコーディングを使用する必要はありません：

```bash title="command"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
```

```response
1
```

この例では生の HTTP リクエストを `netcat` にパイプしています：

```bash title="command"
echo -ne 'GET /?query=SELECT%201 HTTP/1.0\r\n\r\n' | nc localhost 8123
```

```response title="response"
HTTP/1.0 200 OK
Date: Wed, 27 Nov 2019 10:30:18 GMT
Connection: Close
Content-Type: text/tab-separated-values; charset=UTF-8
X-ClickHouse-Server-Display-Name: clickhouse.ru-central1.internal
X-ClickHouse-Query-Id: 5abe861c-239c-467f-b955-8a201abb8b7f
X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}

1
```

ご覧のように、`curl` コマンドはスペースを URL エスケープする必要があるため、少し不便です。
`wget` はすべてを自動的にエスケープしますが、HTTP 1.1 ではキープアライブと Transfer-Encoding: chunked を使用すると正しく動作しないため、使用することはお勧めしません。

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

クエリの一部がパラメータで送信され、他の部分が POST の場合、これらの2つのデータ部分の間に改行が挿入されます。
たとえば、以下は動作しません：

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

デフォルトでは、データは [`TabSeparated`](formats.md#tabseparated) フォーマットで返されます。

`FORMAT` 句をクエリに使用して、他のフォーマットを要求することもできます。たとえば：

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

`default_format` URL パラメータや `X-ClickHouse-Format` ヘッダーを使用して、`TabSeparated` 以外のデフォルトフォーマットを指定することもできます。

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```
## HTTP/HTTPS 経由の挿入クエリ {#insert-queries}

`INSERT` クエリにデータを送信するには `POST` メソッドが必要です。この場合、クエリの冒頭を URL パラメータに記述し、挿入するデータを POST で渡します。挿入するデータは、たとえば MySQL からのタブ区切りダンプになります。こうすることで、`INSERT` クエリは MySQL の `LOAD DATA LOCAL INFILE` を置き換えます。
### 例 {#examples}

テーブルを作成するには：

```bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

データ挿入に通常の `INSERT` クエリを使用するには：

```bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

クエリからデータを別々に送信するには：

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

任意のデータフォーマットを指定できます。たとえば、`INSERT INTO t VALUES` の書き方と同じ 'Values' フォーマットを指定できます：

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

タブ区切りダンプからデータを挿入するには、対応するフォーマットを指定します：

```bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

テーブルの内容を読むには：

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
データは並列クエリ処理のためにランダムな順序で出力されます
:::

テーブルを削除するには：

```bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

データテーブルを返さない成功したリクエストには、空のレスポンスボディが返されます。
## 圧縮 {#compression}

圧縮は、大量のデータを転送する際のネットワークトラフィックを削減するため、または即座に圧縮されたダンプを作成するために使用できます。

データを送信する際には、内部 ClickHouse 圧縮フォーマットを使用できます。圧縮データは非標準フォーマットであり、`clickhouse-compressor` プログラムが必要です。これはデフォルトで `clickhouse-client` パッケージと共にインストールされます。

データ挿入の効率を高めるために、[`http_native_compression_disable_checksumming_on_decompress`](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress) 設定を使用して、サーバー側のチェックサム確認を無効にします。

URLに `compress=1` を指定すると、サーバーは送信するデータを圧縮します。URLに `decompress=1` を指定すると、サーバーは POST メソッドで渡されたデータを解凍します。

また、[HTTP圧縮](https://en.wikipedia.org/wiki/HTTP_compression)を使用することもできます。ClickHouse は以下の [圧縮方法](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens) をサポートしています：

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

圧縮された `POST` リクエストを送信するには、リクエストヘッダー `Content-Encoding: compression_method` を追加します。

ClickHouse がレスポンスを圧縮するためには、[`enable_http_compression`](../operations/settings/settings.md#enable_http_compression) 設定で圧縮を有効にし、リクエストに `Accept-Encoding: compression_method` ヘッダーを追加します。

すべての圧縮メソッドの圧縮レベルは、[`http_zlib_compression_level`](../operations/settings/settings.md#http_zlib_compression_level) 設定を使用して設定できます。

:::info
一部の HTTP クライアントは、デフォルトでサーバーからのデータを解凍する場合があります（`gzip` および `deflate` を使用した場合）、そのため圧縮設定を正しく使用しても解凍されたデータを受け取ることがあります。
:::
## 例 {#examples-compression}

サーバーに圧縮データを送信するには：

```bash
echo "SELECT 1" | gzip -c | \
curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

サーバーから圧縮データアーカイブを受信するには：

```bash
curl -vsS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'

zcat result.gz
0
1
2
```

サーバーから受信した圧縮データを解凍するには、以下のように gunzip を使用します：

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```
## デフォルトデータベース {#default-database}

`database` URL パラメータまたは `X-ClickHouse-Database` ヘッダーを使用して、デフォルトデータベースを指定できます。

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

デフォルトでは、サーバー設定に登録されたデータベースがデフォルトデータベースとして使用されます。デフォルトでは、これは `default` という名前のデータベースです。代わりに、テーブル名の前にドットを付けてデータベースを常に指定することもできます。
## 認証 {#authentication}

ユーザー名とパスワードは次の3つの方法のいずれかで指定できます：

1. HTTP ベーシック認証を使用します。

たとえば：

```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. `user` および `password` URL パラメータを使用します。

:::warning
この方法の使用は推奨されません。なぜなら、パラメータがウェブプロキシによって記録され、ブラウザにキャッシュされる可能性があるからです。
:::

たとえば：

```bash
echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3. 'X-ClickHouse-User' および 'X-ClickHouse-Key' ヘッダーを使用します。

たとえば：

```bash
echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

ユーザー名が指定されていない場合、`default` が使用されます。パスワードが指定されていない場合、空のパスワードが使用されます。
また、URL パラメータを使用して、単一のクエリまたは全体の設定プロファイルを処理するための任意の設定を指定することもできます。

たとえば：

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

詳細については、以下を参照してください：
- [設定](/operations/settings/settings)
- [SET](/sql-reference/statements/set)
## HTTP プロトコルにおける ClickHouse セッションの使用 {#using-clickhouse-sessions-in-the-http-protocol}

HTTP プロトコルにおいて ClickHouse セッションを使用することもできます。このためには、リクエストに `session_id` `GET` パラメータを追加する必要があります。セッション ID として任意の文字列を使用できます。

デフォルトでは、60 秒間の非アクティブ状態の後にセッションは終了します。このタイムアウト（秒単位）を変更するには、サーバー設定で `default_session_timeout` 設定を変更するか、リクエストに `session_timeout` `GET` パラメータを追加してください。

セッションの状態を確認するには、`session_check=1` パラメータを使用します。一度のセッション内で一度に実行できるクエリは 1 つだけです。

クエリの進捗に関する情報は、`X-ClickHouse-Progress` レスポンスヘッダーで受け取ることができます。これを実現するには、[`send_progress_in_http_headers`](../operations/settings/settings.md#send_progress_in_http_headers) を有効にします。

以下は、ヘッダーのシーケンスの例です：

```text
X-ClickHouse-Progress: {"read_rows":"2752512","read_bytes":"240570816","total_rows_to_read":"8880128","elapsed_ns":"662334"}
X-ClickHouse-Progress: {"read_rows":"5439488","read_bytes":"482285394","total_rows_to_read":"8880128","elapsed_ns":"992334"}
X-ClickHouse-Progress: {"read_rows":"8783786","read_bytes":"819092887","total_rows_to_read":"8880128","elapsed_ns":"1232334"}
```

可能なヘッダーフィールドは次の通りです：

| ヘッダーフィールド         | 説明                     |
|----------------------|---------------------------------|
| `read_rows`          | 読まれた行数。            |
| `read_bytes`         | バイト単位の読み取られたデータ量。   |
| `total_rows_to_read` | 読み取る総行数。|
| `written_rows`       | 書き込まれた行数。         |
| `written_bytes`      | バイト単位の書き込まれたデータ量。|

実行中のリクエストは、HTTP 接続が失われても自動的に停止しません。パースとデータフォーマットはサーバー側で行われるため、ネットワーク使用は効果的ではない場合があります。

以下のオプションのパラメータがあります：

| パラメータ            | 説明                               |
|-----------------------|-------------------------------------------|
| `query_id` (オプション) | クエリ ID として任意の文字列を渡すことができます。 [`replace_running_query`](/operations/settings/settings#replace_running_query) |
| `quota_key` (オプション)| クォータキーとして任意の文字列を渡すことができます。["クォータ"](/operations/quotas)   |

HTTPインターフェースを使用すると、クエリのために外部データ（外部一時テーブル）を渡すことができます。詳細については ["クエリ処理のための外部データ"](/engines/table-engines/special/external-data) をご覧ください。
## レスポンスバッファリング {#response-buffering}

レスポンスバッファリングはサーバー側で有効化できます。この目的のために以下の URL パラメータが提供されています：
- `buffer_size`
- `wait_end_of_query`

以下の設定を使用できます：
- [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
- [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

`buffer_size` は、サーバーメモリにバッファリングする結果のバイト数を決定します。結果ボディがこの閾値を超える場合、バッファが HTTP チャンネルに書き込まれ、残りのデータは直接 HTTP チャンネルに送信されます。

全体のレスポンスがバッファリングされることを保証するために、`wait_end_of_query=1` を設定します。この場合、メモリに保存されていないデータは、サーバーの一時ファイルにバッファリングされます。

たとえば：

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
バッファリングを使用することで、レスポンスコードと HTTP ヘッダーがクライアントに送信された後にクエリ処理エラーが発生する状況を回避できます。この場合、エラーメッセージはレスポンスボディの末尾に書き込まれ、クライアント側では解析段階でのみエラーを検出できます。
:::
## クエリパラメータでのロールの設定 {#setting-role-with-query-parameters}

この機能は ClickHouse 24.4 で追加されました。

特定のシナリオでは、ステートメントを実行する前に付与されるロールを最初に設定する必要があるかもしれません。
しかし、`SET ROLE` とそのステートメントを同時に送信することはできません。マルチステートメントは許可されていません：

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

上記のコマンドはエラーになります：

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

この制限を克服するには、代わりに `role` クエリパラメータを使用してください：

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

これは、ステートメントの前に `SET ROLE my_role` を実行するのと同等です。

さらに、複数の `role` クエリパラメータを指定することも可能です：

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

この場合、`?role=my_role&role=my_other_role` は、ステートメントの前に `SET ROLE my_role, my_other_role` を実行するのと同様に機能します。
## HTTPレスポンスコードの注意点 {#http_response_codes_caveats}

HTTPプロトコルの制限により、HTTP 200 レスポンスコードはクエリが成功したことを保証しません。

以下はその例です：

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

この動作の理由は、HTTPプロトコルの性質にあります。最初に HTTP ヘッダーが送信され、301 コードが付加された後に HTTP 本体が続き、エラーが通常のテキストとして本体に挿入されます。

この動作は、`Native`、`TSV`、`JSON` などのいずれのフォーマットを使用しても変わりません。エラーメッセージは常にレスポンスストリームの途中にあります。

この問題を軽減するために、`wait_end_of_query=1` を有効にすることができます（[レスポンスバッファリング](#response-buffering)）。この場合、HTTP ヘッダーの送信は、全クエリが解決されるまで遅延されます。しかし、この問題を完全に解決することはできません。なぜなら、結果は [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size) 内に収まらなければならず、[`send_progress_in_http_headers`](/operations/settings/settings#send_progress_in_http_headers) などの他の設定がヘッダーの遅延に干渉する可能性があるからです。

:::tip
すべてのエラーをキャッチする唯一の方法は、必要なフォーマットを使用して解析する前に HTTP 本体を発分析することです。
:::
## パラメータを持つクエリ {#cli-queries-with-parameters}

パラメータを持つクエリを作成し、対応する HTTP リクエストパラメータから値を渡すことができます。詳細については、[CLI のパラメータを持つクエリ](../interfaces/cli.md#cli-queries-with-parameters) を参照してください。
### 例 {#example-3}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```
### URL パラメータ内のタブ {#tabs-in-url-parameters}

クエリパラメータは「エスケープ」形式から解析されます。これには、`\N` として明示的に解析されたヌルを可能にするなどの利点があります。これは、タブ文字を `\t`（または `\` とタブ）としてエンコードする必要があることを意味します。たとえば、以下の例には、 `abc` と `123` の間に実際のタブが含まれ、入力文字列は 2 つの値に分割されます：

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

しかし、URL パラメータ内で実際のタブを `%09` を使ってエンコードしようとすると、正しく解析されません：

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Value abc    123 cannot be parsed as String for query parameter 'arg1' because it isn't parsed completely: only 3 of 7 bytes was parsed: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

URL パラメータを使用する場合、`\t` を `%5C%09` としてエンコードする必要があります。例えば：

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```
## 予め定義された HTTP インターフェース {#predefined_http_interface}

ClickHouse では、HTTP インターフェースを通して特定のクエリをサポートしています。たとえば、次のようにテーブルにデータを書き込むことができます：

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouse はまた、サードパーティツール（例： [Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter)）とより簡単に統合できるように、予め定義された HTTP インターフェースをサポートしています。例を見てみましょう。

まず最初に、このセクションをサーバー設定ファイルに追加します。

`http_handlers` が複数の `rule` を含むように設定されます。ClickHouse は受信した HTTP リクエストを、`rule` 内の定義されたタイプにマッチさせ、最初にマッチしたルールがハンドラーを実行します。その後、ClickHouse はマッチが成功した場合、対応する事前定義のクエリを実行します。

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

これで、Prometheus フォーマットでデータを直接取得するために URL をリクエストできます：

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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}
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

`http_handlers` の設定オプションは以下のように機能します。

`rule` は次のパラメータを設定できます：
- `method`
- `headers`
- `url`
- `handler`

これらの詳細は以下に記載します：

  - `method` は HTTP リクエストのメソッド部分と一致する役割を果たします。`method` は、HTTP プロトコルの定義に完全に準拠しています [`method`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)です。これはオプションの設定です。設定ファイルに定義されていない場合は、HTTP リクエストのメソッド部分にはマッチしません。

  - `url` は HTTP リクエストの URL 部分と一致する役割を果たします。これは [RE2](https://github.com/google/re2) の正規表現と互換性があります。これはオプションの設定です。設定ファイルに定義がない場合、HTTP リクエストの URL 部分には一致しません。

  - `headers` は HTTP リクエストのヘッダー部分と一致する役割を果たします。これも RE2 の正規表現と互換性があります。これはオプションの設定です。設定ファイルに定義されていない場合、HTTP リクエストのヘッダー部分には一致しません。

  - `handler` には主な処理部分が含まれます。現在 `handler` では `type`、`status`、`content_type`、`http_response_headers`、`response_content`、`query`、`query_param_name` を設定できます。`type` では現在、[`predefined_query_handler`](#predefined_query_handler)、[`dynamic_query_handler`](#dynamic_query_handler)、[`static`](#static) の3つのタイプがサポートされています。

    - `query` — `predefined_query_handler` タイプで使用し、ハンドラーが呼び出された時に実行されるクエリです。
    - `query_param_name` — `dynamic_query_handler` タイプで使用し、HTTP リクエストパラメータの `query_param_name` に対応する値を抽出して実行します。
    - `status` — `static` タイプと共に使用し、レスポンスのステータスコードです。
    - `content_type` — 任意のタイプで使用し、レスポンスの [content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) です。
    - `http_response_headers` — 任意のタイプで使用し、レスポンスヘッダーのマップです。コンテンツタイプを設定するためにも使用できます。
    - `response_content` — `static` タイプで使用し、クライアントに送信されるレスポンスコンテンツです。`file://` または `config://` プレフィックスを使用する場合は、ファイルまたは設定からコンテンツを見つけてクライアントに送信します。

異なる `type` の設定方法については次に説明します。
### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler` は `Settings` および `query_params` の値を設定することがサポートされています。`predefined_query_handler` タイプで `query` を設定できます。

`query` 値は、HTTP リクエストがマッチした際に ClickHouse によって実行される `predefined_query_handler` の定義済みクエリです。これは必須の設定です。

以下の例では、[`max_threads`](../operations/settings/settings.md#max_threads) および [`max_final_threads`](/operations/settings/settings#max_final_threads) 設定を定義し、これらの設定が正しく設定されたか確認するためにシステムテーブルをクエリします。

:::note
`query`、`play`、`ping` などのデフォルトの `handlers` を維持するには、 `<defaults/>` ルールを追加してください。
:::

例えば：

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

:::note
1 つの `predefined_query_handler` では、1 つの `query` のみがサポートされています。
:::
### dynamic_query_handler {#dynamic_query_handler}

`dynamic_query_handler` では、クエリを HTTP リクエストのパラメータとして記述します。`predefined_query_handler` との違いは、クエリを設定ファイルに書くことができる点です。`query_param_name` が `dynamic_query_handler` で設定できることです。

ClickHouse は、HTTP リクエストの URL 内に対応する `query_param_name` の値を抽出し、実行します。`query_param_name` のデフォルト値は `/query` であり、任意の設定です。設定ファイルに定義がなければ、そのパラメータは渡されません。

この機能を試すために、以下の例では [`max_threads`](../operations/settings/settings.md#max_threads) および `max_final_threads` 設定の値を定義し、それらが正しく設定されたかどうかを確認します。

例：

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
### static {#static}

`static` は [`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)、[status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) および `response_content` を返すことができます。`response_content` は指定されたコンテンツを返すことができます。

例えば、メッセージ "Say Hi!" を返すには：

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

`http_response_headers` は `content_type` の代わりにコンテンツタイプを設定するために使用することができます。

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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}
<
* Connection #0 to host localhost left intact
Say Hi!%
```

設定からクライアントに送信されるコンテンツを見つけるには：

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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}
<
* Connection #0 to host localhost left intact
<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>%
```

ファイルからクライアントに送信されるコンテンツを見つけるには：

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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}
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
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}
<
<html><body>Relative Path File</body></html>
* Connection #0 to host localhost left intact
```
## Valid JSON/XML response on exception during HTTP streaming {#valid-output-on-exception-http-streaming}

クエリの実行中に例外が発生することがありますが、そのデータの一部は既に送信されています。通常、例外はプレーンテキストでクライアントに送信されます。
特定のデータ形式を使用して出力データを出力した場合、出力は指定されたデータ形式に関して無効になる可能性があります。
これを防ぐために、設定 [`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format) を使用して、例外を指定された形式で書き込むよう ClickHouse に指示することができます（デフォルトで有効）。

例：

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
