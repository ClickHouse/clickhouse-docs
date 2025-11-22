---
description: 'ClickHouse の HTTP インターフェイスに関するドキュメント。任意のプラットフォームやプログラミング言語から REST API を介して ClickHouse にアクセスできます'
sidebar_label: 'HTTP インターフェイス'
sidebar_position: 15
slug: /interfaces/http
title: 'HTTP インターフェイス'
doc_type: 'reference'
---

import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';


# HTTP インターフェイス



## 前提条件 {#prerequisites}

この記事の例を実行するには、以下が必要です：

- 実行中のClickHouseサーバーインスタンス
- `curl`がインストールされていること。UbuntuまたはDebianの場合は`sudo apt install curl`を実行するか、インストール手順については[こちらのドキュメント](https://curl.se/download.html)を参照してください。


## 概要 {#overview}

HTTPインターフェースを使用すると、REST API形式で任意のプラットフォームおよび任意のプログラミング言語からClickHouseを利用できます。HTTPインターフェースはネイティブインターフェースよりも機能が制限されていますが、より幅広い言語サポートを提供します。

デフォルトでは、`clickhouse-server`は以下のポートでリッスンします:

- HTTP用のポート8123
- HTTPS用のポート8443(有効化可能)

パラメータなしで`GET /`リクエストを実行すると、文字列「Ok.」とともに200レスポンスコードが返されます:

```bash
$ curl 'http://localhost:8123/'
Ok.
```

「Ok.」は[`http_server_default_response`](../operations/server-configuration-parameters/settings.md#http_server_default_response)で定義されているデフォルト値であり、必要に応じて変更できます。

関連項目:[HTTPレスポンスコードに関する注意事項](#http_response_codes_caveats)


## Webユーザーインターフェース {#web-ui}

ClickHouseにはWebユーザーインターフェースが含まれており、以下のアドレスからアクセスできます:

```text
http://localhost:8123/play
```

WebUIは、クエリ実行中の進捗表示、クエリのキャンセル、結果のストリーミングをサポートしています。
また、クエリパイプラインのチャートやグラフを表示する隠し機能も備えています。

クエリが正常に実行されると、ダウンロードボタンが表示され、CSV、TSV、JSON、JSONLines、Parquet、Markdown、またはClickHouseがサポートするその他のカスタム形式でクエリ結果をダウンロードできます。ダウンロード機能はクエリキャッシュを使用して、クエリを再実行することなく効率的に結果を取得します。UIが複数ページのうち1ページのみを表示している場合でも、完全な結果セットがダウンロードされます。

このWebUIは、あなたのような専門家向けに設計されています。

<Image img={PlayUI} size='md' alt='ClickHouse WebUIのスクリーンショット' />

ヘルスチェックスクリプトでは`GET /ping`リクエストを使用してください。このハンドラは常に"Ok."を返します(末尾に改行が付きます)。バージョン18.12.13以降で利用可能です。レプリカの遅延を確認するには`/replicas_status`も参照してください。

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```


## HTTP/HTTPSを使用したクエリ実行 {#querying}

HTTP/HTTPSを使用してクエリを実行するには、3つの方法があります:

- リクエストをURLの'query'パラメータとして送信する
- POSTメソッドを使用する
- クエリの先頭部分を'query'パラメータで送信し、残りをPOSTで送信する

:::note
URLのサイズはデフォルトで1 MiBに制限されており、`http_max_uri_size`設定で変更できます。
:::

成功した場合、レスポンスコード200とレスポンスボディに結果が返されます。
エラーが発生した場合、レスポンスコード500とレスポンスボディにエラー説明テキストが返されます。

GETを使用したリクエストは'readonly'です。つまり、データを変更するクエリの場合は、POSTメソッドのみを使用できます。
クエリ自体はPOSTボディまたはURLパラメータのいずれかで送信できます。いくつかの例を見てみましょう。

以下の例では、curlを使用してクエリ`SELECT 1`を送信しています。スペースのURLエンコーディング`%20`の使用に注意してください。

```bash title="command"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="Response"
1
```

この例では、wgetを`-nv`(非冗長)および`-O-`パラメータとともに使用して、結果をターミナルに出力しています。
この場合、スペースのURLエンコーディングは不要です:

```bash title="command"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
```

```response
1
```

この例では、生のHTTPリクエストをnetcatにパイプしています:

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

ご覧のとおり、`curl`コマンドはスペースをURLエスケープする必要があるため、やや不便です。
`wget`はすべてを自動的にエスケープしますが、keep-aliveとTransfer-Encoding: chunkedを使用する場合、HTTP 1.1で正常に動作しないため、使用を推奨しません。

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

クエリの一部がパラメータで送信され、一部がPOSTで送信される場合、これら2つのデータ部分の間に改行が挿入されます。
例えば、以下は動作しません:

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

デフォルトでは、データは[`TabSeparated`](/interfaces/formats/TabSeparated)形式で返されます。

クエリで`FORMAT`句を使用して、他の形式をリクエストできます。例えば:

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

`TabSeparated` 以外のデフォルトのフォーマットを指定するには、URL パラメータ `default_format` または `X-ClickHouse-Format` ヘッダーを使用できます。

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

パラメータ化クエリには POST メソッドを使用できます。パラメータは、`{name:Type}` のように、パラメータ名と型を波括弧で指定します。パラメータ値は `param_name` パラメータで渡します。

```bash
$ curl -X POST -F 'query=select {p1:UInt8} + {p2:UInt8}' -F "param_p1=3" -F "param_p2=4" 'http://localhost:8123/'

7
```


## HTTP/HTTPSを介したINSERTクエリ {#insert-queries}

`INSERT`クエリには、データを送信するための`POST`メソッドが必要です。この場合、クエリの開始部分をURLパラメータに記述し、POSTを使用して挿入するデータを渡すことができます。挿入するデータは、例えばMySQLからのタブ区切りダンプなどが考えられます。この方法では、`INSERT`クエリがMySQLの`LOAD DATA LOCAL INFILE`の代わりとなります。

### 例 {#examples}

テーブルを作成する場合:

```bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

データ挿入に一般的な`INSERT`クエリを使用する場合:

```bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

クエリとは別にデータを送信する場合:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

任意のデータ形式を指定できます。例えば、`INSERT INTO t VALUES`を記述する際に使用されるのと同じ形式である'Values'形式を指定できます:

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

タブ区切りダンプからデータを挿入する場合は、対応する形式を指定します:

```bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

テーブルの内容を読み取る場合:

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
並列クエリ処理により、データはランダムな順序で出力されます
:::

テーブルを削除する場合:

```bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

データテーブルを返さない成功したリクエストに対しては、空のレスポンスボディが返されます。


## 圧縮 {#compression}

圧縮は、大量のデータを転送する際のネットワークトラフィックを削減したり、圧縮済みのダンプを作成したりする目的で使用できます。

データ転送時には、ClickHouse内部の圧縮形式を使用できます。圧縮されたデータは非標準形式であり、これを扱うには`clickhouse-compressor`プログラムが必要です。このプログラムは`clickhouse-client`パッケージとともにデフォルトでインストールされます。

データ挿入の効率を向上させるには、[`http_native_compression_disable_checksumming_on_decompress`](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress)設定を使用してサーバー側のチェックサム検証を無効にします。

URLに`compress=1`を指定すると、サーバーは送信するデータを圧縮します。URLに`decompress=1`を指定すると、サーバーは`POST`メソッドで渡されたデータを展開します。

[HTTP圧縮](https://en.wikipedia.org/wiki/HTTP_compression)を使用することもできます。ClickHouseは以下の[圧縮方式](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens)をサポートしています：

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

圧縮された`POST`リクエストを送信するには、リクエストヘッダーに`Content-Encoding: compression_method`を追加します。

ClickHouseにレスポンスを圧縮させるには、リクエストに`Accept-Encoding: compression_method`ヘッダーを追加します。

すべての圧縮方式について、[`http_zlib_compression_level`](../operations/settings/settings.md#http_zlib_compression_level)設定を使用してデータ圧縮レベルを設定できます。

:::info
一部のHTTPクライアントは、デフォルトでサーバーからのデータを展開する場合があり（`gzip`および`deflate`を使用）、圧縮設定を正しく使用していても展開されたデータを受け取る可能性があります。
:::


## 例 {#examples-compression}

圧縮データをサーバーに送信する場合:

```bash
echo "SELECT 1" | gzip -c | \
curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

サーバーから圧縮データアーカイブを受信する場合:

```bash
curl -vsS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'

zcat result.gz
0
1
2
```

サーバーから圧縮データを受信し、gunzipで解凍データを取得する場合:

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```


## デフォルトデータベース {#default-database}

デフォルトデータベースを指定するには、`database` URLパラメータまたは `X-ClickHouse-Database` ヘッダーを使用します。

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

デフォルトでは、サーバー設定に登録されているデータベースがデフォルトデータベースとして使用されます。初期状態では、`default` という名前のデータベースが使用されます。また、テーブル名の前にドット記法を使用してデータベースを明示的に指定することもできます。


## 認証 {#authentication}

ユーザー名とパスワードは、次の3つの方法のいずれかで指定できます。

1. HTTP基本認証を使用する

例：

```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. URLパラメータ`user`と`password`を使用する

:::warning
この方法は、パラメータがWebプロキシによってログに記録されたり、ブラウザにキャッシュされたりする可能性があるため推奨されません
:::

例：

```bash
echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3. ヘッダー'X-ClickHouse-User'と'X-ClickHouse-Key'を使用する

例：

```bash
echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

ユーザー名が指定されていない場合は、`default`という名前が使用されます。パスワードが指定されていない場合は、空のパスワードが使用されます。
URLパラメータを使用して、単一のクエリを処理するための任意の設定や、設定プロファイル全体を指定することもできます。

例：

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

- [設定](/operations/settings/settings)
- [SET](/sql-reference/statements/set)


## HTTPプロトコルでのClickHouseセッションの使用 {#using-clickhouse-sessions-in-the-http-protocol}

HTTPプロトコルでClickHouseセッションを使用することもできます。これを行うには、リクエストに`session_id` `GET`パラメータを追加する必要があります。セッションIDには任意の文字列を使用できます。

デフォルトでは、セッションは60秒間非アクティブ状態が続くと終了します。このタイムアウト(秒単位)を変更するには、サーバー設定の`default_session_timeout`設定を変更するか、リクエストに`session_timeout` `GET`パラメータを追加します。

セッションのステータスを確認するには、`session_check=1`パラメータを使用します。単一のセッション内では、一度に1つのクエリのみを実行できます。

クエリの進行状況に関する情報は、`X-ClickHouse-Progress`レスポンスヘッダーで受け取ることができます。これを行うには、[`send_progress_in_http_headers`](../operations/settings/settings.md#send_progress_in_http_headers)を有効にします。

以下はヘッダーシーケンスの例です:

```text
X-ClickHouse-Progress: {"read_rows":"261636","read_bytes":"2093088","total_rows_to_read":"1000000","elapsed_ns":"14050417","memory_usage":"22205975"}
X-ClickHouse-Progress: {"read_rows":"654090","read_bytes":"5232720","total_rows_to_read":"1000000","elapsed_ns":"27948667","memory_usage":"83400279"}
X-ClickHouse-Progress: {"read_rows":"1000000","read_bytes":"8000000","total_rows_to_read":"1000000","elapsed_ns":"38002417","memory_usage":"80715679"}
```

使用可能なヘッダーフィールドは次のとおりです:

| ヘッダーフィールド         | 説明                        |
| -------------------- | ---------------------------------- |
| `read_rows`          | 読み取られた行数。               |
| `read_bytes`         | 読み取られたデータ量(バイト単位)。      |
| `total_rows_to_read` | 読み取る行の総数。   |
| `written_rows`       | 書き込まれた行数。            |
| `written_bytes`      | 書き込まれたデータ量(バイト単位)。   |
| `elapsed_ns`         | クエリの実行時間(ナノ秒単位)。      |
| `memory_usage`       | クエリが使用したメモリ(バイト単位)。 |

実行中のリクエストは、HTTP接続が失われても自動的に停止しません。解析とデータのフォーマットはサーバー側で実行されるため、ネットワークの使用が非効率的になる可能性があります。

以下のオプションパラメータが存在します:

| パラメータ             | 説明                                                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `query_id` (オプション)  | クエリIDとして渡すことができます(任意の文字列)。[`replace_running_query`](/operations/settings/settings#replace_running_query) |
| `quota_key` (オプション) | クォータキーとして渡すことができます(任意の文字列)。["Quotas"](/operations/quotas)                                                |

HTTPインターフェースでは、クエリのために外部データ(外部一時テーブル)を渡すことができます。詳細については、["クエリ処理のための外部データ"](/engines/table-engines/special/external-data)を参照してください。


## レスポンスバッファリング {#response-buffering}

レスポンスバッファリングはサーバー側で有効化できます。この目的のために以下のURLパラメータが提供されています:

- `buffer_size`
- `wait_end_of_query`

以下の設定を使用できます:

- [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
- [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

`buffer_size`は、サーバーメモリにバッファリングする結果のバイト数を決定します。結果本体がこの閾値を超える場合、バッファはHTTPチャネルに書き込まれ、残りのデータはHTTPチャネルに直接送信されます。

レスポンス全体を確実にバッファリングするには、`wait_end_of_query=1`を設定します。この場合、メモリに格納されないデータは一時サーバーファイルにバッファリングされます。

例:

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
レスポンスコードとHTTPヘッダーがクライアントに送信された後にクエリ処理エラーが発生する状況を回避するために、バッファリングを使用してください。この状況では、エラーメッセージがレスポンス本体の末尾に書き込まれ、クライアント側では解析段階でのみエラーを検出できます。
:::


## クエリパラメータを使用したロールの設定 {#setting-role-with-query-parameters}

この機能はClickHouse 24.4で追加されました。

特定のシナリオでは、ステートメント自体を実行する前に、付与されたロールを先に設定する必要がある場合があります。
しかし、マルチステートメントは許可されていないため、`SET ROLE`とステートメントを一緒に送信することはできません:

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

上記のコマンドはエラーになります:

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

この制限を回避するには、代わりに`role`クエリパラメータを使用します:

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

これは、ステートメントの前に`SET ROLE my_role`を実行することと同等です。

また、複数の`role`クエリパラメータを指定することも可能です:

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

この場合、`?role=my_role&role=my_other_role`は、ステートメントの前に`SET ROLE my_role, my_other_role`を実行することと同様に機能します。


## HTTPレスポンスコードに関する注意事項 {#http_response_codes_caveats}

HTTPプロトコルの制限により、HTTP 200レスポンスコードはクエリが成功したことを保証しません。

以下に例を示します:

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

この動作の理由は、HTTPプロトコルの性質にあります。HTTPヘッダーが最初にHTTPコード200で送信され、その後HTTPボディが続き、エラーはプレーンテキストとしてボディに挿入されます。

この動作は使用されるフォーマットに依存せず、`Native`、`TSV`、`JSON`のいずれであっても、エラーメッセージは常にレスポンスストリームの途中に現れます。

この問題は`wait_end_of_query=1`を有効にすることで軽減できます([レスポンスバッファリング](#response-buffering))。この場合、HTTPヘッダーの送信はクエリ全体が解決されるまで遅延されます。ただし、結果は依然として[`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)内に収まる必要があり、[`send_progress_in_http_headers`](/operations/settings/settings#send_progress_in_http_headers)のような他の設定がヘッダーの遅延に干渉する可能性があるため、この方法では問題を完全に解決することはできません。

:::tip
すべてのエラーを捕捉する唯一の方法は、必要なフォーマットで解析する前にHTTPボディを分析することです。
:::

ClickHouseにおけるこのような例外は、`http_write_exception_in_output_format=0`(デフォルト)の場合、使用されるフォーマット(`Native`、`TSV`、`JSON`など)に関係なく、以下のような一貫した例外フォーマットを持ちます。これにより、クライアント側でエラーメッセージを解析して抽出することが容易になります。

```text
\r\n
__exception__\r\n
<TAG>\r\n
<error message>\r\n
<message_length> <TAG>\r\n
__exception__\r\n

```

ここで`<TAG>`は16バイトのランダムなタグであり、`X-ClickHouse-Exception-Tag`レスポンスヘッダーで送信されるタグと同じものです。
`<error message>`は実際の例外メッセージです(正確な長さは`<message_length>`で確認できます)。上記の例外ブロック全体は最大16 KiBです。

以下は`JSON`フォーマットの例です

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

以下は同様の例ですが、`CSV`フォーマットです

```bash
$ curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)+FORMAT+CSV"
...
<
0,0
0,0

```


**例外**
rumfyutuqkncbgau
コード: 395. DB::Exception: &#39;throwIf&#39; 関数に渡された値がゼロではありません: &#39;FUNCTION throwIf(equals(&#95;&#95;table1.number, 2&#95;UInt8) :: 1) -&gt; throwIf(equals(&#95;&#95;table1.number, 2&#95;UInt8)) UInt8 : 0&#39; を実行中に発生しました。 (FUNCTION&#95;THROW&#95;IF&#95;VALUE&#95;IS&#95;NON&#95;ZERO) (バージョン 25.11.1.1)
262 rumfyutuqkncbgau
**例外**

```
```


## パラメータ付きクエリ {#cli-queries-with-parameters}

パラメータ付きクエリを作成し、対応するHTTPリクエストパラメータから値を渡すことができます。詳細については、[CLIのパラメータ付きクエリ](../interfaces/cli.md#cli-queries-with-parameters)を参照してください。

### 例 {#example-3}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```

### URLパラメータ内のタブ文字 {#tabs-in-url-parameters}

クエリパラメータは「エスケープ」形式から解析されます。これにはいくつかの利点があり、例えばnull値を`\N`として明確に解析できることなどが挙げられます。つまり、タブ文字は`\t`(または`\`とタブ)としてエンコードする必要があります。例えば、以下は`abc`と`123`の間に実際のタブ文字を含んでおり、入力文字列は2つの値に分割されます:

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

ただし、URLパラメータで実際のタブ文字を`%09`でエンコードしようとすると、正しく解析されません:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Value abc    123 cannot be parsed as String for query parameter 'arg1' because it isn't parsed completely: only 3 of 7 bytes was parsed: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

URLパラメータを使用する場合は、`\t`を`%5C%09`としてエンコードする必要があります。例:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```


## 事前定義HTTPインターフェース {#predefined_http_interface}

ClickHouseはHTTPインターフェースを介して特定のクエリをサポートしています。例えば、以下のようにテーブルへデータを書き込むことができます:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouseは事前定義HTTPインターフェースもサポートしており、[Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter)などのサードパーティツールとの統合を容易にします。例を見てみましょう。

まず、サーバー設定ファイルに以下のセクションを追加します。

`http_handlers`は複数の`rule`を含むように設定されます。ClickHouseは受信したHTTPリクエストを`rule`内の事前定義されたタイプと照合し、最初にマッチしたルールのハンドラーを実行します。マッチが成功すると、ClickHouseは対応する事前定義クエリを実行します。

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

これで、URLに直接リクエストしてPrometheus形式のデータを取得できます:


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
```


# HELP "Merge" "バックグラウンドで実行中のマージの数"
# TYPE "Merge" counter
"Merge" 0



# HELP "PartMutation" "ミューテーションの数 (ALTER DELETE/UPDATE)"
# TYPE "PartMutation" counter
"PartMutation" 0



# HELP "ReplicatedFetch" "レプリカから取得中のデータパーツ数"
# TYPE "ReplicatedFetch" counter
"ReplicatedFetch" 0



# HELP &quot;ReplicatedSend&quot; &quot;レプリカへ送信中のデータパーツ数&quot;

# TYPE &quot;ReplicatedSend&quot; counter

&quot;ReplicatedSend&quot; 0

* ホスト localhost への接続 #0 は維持されたまま

* ホスト localhost への接続 #0 は維持されたまま

```

`http_handlers`の設定オプションは以下のように動作します。

`rule`では以下のパラメータを設定できます:
- `method`
- `headers`
- `url`
- `full_url`
- `handler`

これらについて以下で説明します:

- `method`はHTTPリクエストのメソッド部分のマッチングを担当します。`method`はHTTPプロトコルにおける[`method`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)の定義に完全に準拠しています。これはオプションの設定です。設定ファイルで定義されていない場合、HTTPリクエストのメソッド部分とはマッチしません。

- `url`はHTTPリクエストのURL部分(パスとクエリ文字列)のマッチングを担当します。
  `url`に`regex:`のプレフィックスが付いている場合、[RE2](https://github.com/google/re2)の正規表現として扱われます。
  これはオプションの設定です。設定ファイルで定義されていない場合、HTTPリクエストのURL部分とはマッチしません。

- `full_url`は`url`と同様ですが、完全なURL、すなわち`schema://host:port/path?query_string`を含みます。
  注意: ClickHouseは「仮想ホスト」をサポートしていないため、`host`はIPアドレスです(`Host`ヘッダーの値ではありません)。

- `empty_query_string` - リクエストにクエリ文字列(`?query_string`)が存在しないことを保証します

- `headers`はHTTPリクエストのヘッダー部分のマッチングを担当します。RE2の正規表現と互換性があります。これはオプションの設定です。設定ファイルで定義されていない場合、HTTPリクエストのヘッダー部分とはマッチしません。

- `handler`はメイン処理部分を含みます。

  以下の`type`を指定できます:
  - [`predefined_query_handler`](#predefined_query_handler)
  - [`dynamic_query_handler`](#dynamic_query_handler)
  - [`static`](#static)
  - [`redirect`](#redirect)

  また、以下のパラメータを指定できます:
  - `query` — `predefined_query_handler`タイプで使用し、ハンドラーが呼び出されたときにクエリを実行します。
  - `query_param_name` — `dynamic_query_handler`タイプで使用し、HTTPリクエストパラメータ内の`query_param_name`値に対応する値を抽出して実行します。
  - `status` — `static`タイプで使用し、レスポンスステータスコードを指定します。
  - `content_type` — 任意のタイプで使用し、レスポンスの[content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)を指定します。
  - `http_response_headers` — 任意のタイプで使用し、レスポンスヘッダーのマップを指定します。コンテンツタイプの設定にも使用できます。
  - `response_content` — `static`タイプで使用し、クライアントに送信されるレスポンスコンテンツを指定します。プレフィックス'file://'または'config://'を使用する場合、ファイルまたは設定からコンテンツを取得してクライアントに送信します。
  - `user` - クエリを実行するユーザー(デフォルトユーザーは`default`)。
    **注意**: このユーザーのパスワードを指定する必要はありません。

異なる`type`の設定方法について次に説明します。

### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler`は`Settings`と`query_params`の値の設定をサポートしています。`predefined_query_handler`タイプで`query`を設定できます。

`query`値は`predefined_query_handler`の事前定義されたクエリであり、HTTPリクエストがマッチしたときにClickHouseによって実行され、クエリの結果が返されます。これは必須の設定です。

以下の例では、[`max_threads`](../operations/settings/settings.md#max_threads)と[`max_final_threads`](/operations/settings/settings#max_final_threads)設定の値を定義し、その後システムテーブルをクエリしてこれらの設定が正常に設定されたかどうかを確認します。

:::note
`query`、`play`、`ping`などのデフォルトの`handlers`を保持するには、`<defaults/>`ルールを追加してください。
:::

例:
```


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
1つの`predefined_query_handler`では、1つの`query`のみがサポートされます。
:::

### dynamic_query_handler {#dynamic_query_handler}

`dynamic_query_handler`では、クエリはHTTPリクエストのパラメータとして記述されます。`predefined_query_handler`との違いは、`predefined_query_handler`ではクエリが設定ファイルに記述される点です。`dynamic_query_handler`では`query_param_name`を設定できます。

ClickHouseは、HTTPリクエストのURLにある`query_param_name`の値に対応する値を抽出して実行します。`query_param_name`のデフォルト値は`/query`です。これはオプションの設定項目です。設定ファイルに定義がない場合、パラメータは渡されません。

この機能を試すために、以下の例では[`max_threads`](../operations/settings/settings.md#max_threads)と`max_final_threads`の値を定義し、設定が正常に適用されたかどうかをクエリで確認します。

例:

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

`static`は[`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)、[status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)、および`response_content`を返すことができます。`response_content`では指定されたコンテンツを返すことができます。

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

`http_response_headers`を使用して、`content_type`の代わりにコンテンツタイプを設定することもできます。


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
                <response_content>こんにちは!</response_content>
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

クライアントに送信された設定内容を取得します。

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

クライアントに送信したファイル内のコンテンツを検索するには:


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

### redirect {#redirect}

`redirect`は`location`へ`302`リダイレクトを実行します。

例えば、ClickHouse playでユーザーを自動的に`play`に設定する方法は次のとおりです:

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


## HTTPレスポンスヘッダー {#http-response-headers}

ClickHouseでは、設定可能なあらゆる種類のハンドラーに適用できるカスタムHTTPレスポンスヘッダーを設定できます。これらのヘッダーは`http_response_headers`設定を使用して設定でき、ヘッダー名とその値を表すキーと値のペアを受け入れます。この機能は、ClickHouse HTTPインターフェース全体でカスタムセキュリティヘッダー、CORSポリシー、またはその他のHTTPヘッダー要件を実装する際に特に有用です。

例えば、以下に対してヘッダーを設定できます:

- 通常のクエリエンドポイント
- Web UI
- ヘルスチェック

`common_http_response_headers`を指定することも可能です。これらは設定で定義されたすべてのHTTPハンドラーに適用されます。

ヘッダーは、設定された各ハンドラーのHTTPレスポンスに含まれます。

以下の例では、すべてのサーバーレスポンスに2つのカスタムヘッダー`X-My-Common-Header`と`X-My-Custom-Header`が含まれます。

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


## HTTPストリーミング中の例外発生時における有効なJSON/XMLレスポンス {#valid-output-on-exception-http-streaming}

HTTP経由でクエリを実行中に、データの一部がすでに送信された後で例外が発生することがあります。通常、例外はプレーンテキストでクライアントに送信されます。
特定のデータ形式を使用してデータを出力している場合でも、指定されたデータ形式の観点から出力が無効になる可能性があります。
これを防ぐには、設定[`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format)（デフォルトでは無効）を使用します。この設定により、ClickHouseは指定された形式で例外を出力します（現在、XMLおよびJSON\*形式をサポートしています）。

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
