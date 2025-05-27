---
'description': 'ClickHouse の HTTP インターフェースに関するドキュメントで、任意のプラットフォームやプログラミング言語から ClickHouse
  への REST API アクセスを提供します'
'sidebar_label': 'HTTP インターフェース'
'sidebar_position': 15
'slug': '/interfaces/http'
'title': 'HTTP Interface'
---

import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';



# HTTPインターフェース
## 前提条件 {#prerequisites}

この記事の例では、次のものが必要です：
- 稼働中のClickHouseサーバーインスタンス
- `curl`がインストールされていること。UbuntuやDebianの場合、`sudo apt install curl`を実行するか、この[ドキュメント](https://curl.se/download.html)を参照してインストール手順を確認してください。
## 概要 {#overview}

HTTPインターフェースを使用すると、REST APIの形式で任意のプラットフォームから任意のプログラミング言語でClickHouseを利用できます。HTTPインターフェースはネイティブインターフェースよりも機能が制限されていますが、より良い言語サポートがあります。

デフォルトでは、`clickhouse-server`は次のポートでリッスンしています：
- HTTP用のポート8123
- HTTPS用のポート8443が有効にできます

パラメータなしで`GET /`リクエストを行うと、ステータスコード200が返され、文字列 "Ok." が付随します。

```bash
$ curl 'http://localhost:8123/'
Ok.
```

"Ok."は[`http_server_default_response`](../operations/server-configuration-parameters/settings.md#http_server_default_response)で定義されたデフォルト値であり、変更することができます。

また、[HTTPレスポンスコードの注意事項](#http_response_codes_caveats)も参照してください。
## Webユーザーインターフェース {#web-ui}

ClickHouseにはウェブユーザーインターフェースが含まれており、次のアドレスからアクセスできます：

```text
http://localhost:8123/play
```

ウェブUIは、クエリの実行時の進捗表示、クエリのキャンセル、および結果のストリーミングをサポートしています。
クエリパイプラインのグラフやチャートを表示する秘密の機能があります。

ウェブUIは、あなたのような専門家のために設計されています。

<Image img={PlayUI} size="md" alt="ClickHouse Web UIのスクリーンショット" />

ヘルスチェックスクリプトでは、`GET /ping`リクエストを使用します。このハンドラーは常に "Ok."（最後に改行あり）を返します。バージョン18.12.13以降で利用可能です。レプリカの遅延を確認するために、`/replicas_status`も参照してください。

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```
## HTTP/HTTPS経由でのクエリ実行 {#querying}

HTTP/HTTPS経由でクエリを実行するには、次の3つのオプションがあります：
- リクエストをURLの 'query' パラメータとして送信
- POSTメソッドを使用
- クエリの最初の部分を 'query' パラメータに、残りをPOSTで送信

:::note
デフォルトで、URLのサイズは1 MiBに制限されています。これは`http_max_uri_size`設定で変更できます。
:::

成功した場合、ステータスコード200とレスポンスボディに結果が返されます。
エラーが発生した場合、ステータスコード500とレスポンスボディにエラーの説明テキストが返されます。

GETメソッドを使用したリクエストは「読み取り専用」です。これは、データを変更するクエリにはPOSTメソッドのみを使用できることを意味します。
クエリ自体をPOSTボディに送信することも、URLパラメータで送信することもできます。以下にいくつかの例を示します。

以下の例では、`SELECT 1`クエリを送信するためにcurlが使用されています。スペースはURLエンコードされた形式であることに注意してください：`%20`。

```bash title="command"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="Response"
1
```

この例では、wgetが`-nv`（非冗長）および`-O-`パラメータを使用して結果をターミナルに出力しています。
この場合、スペースをURLエンコードする必要はありません：

```bash title="command"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
```

```response
1
```

この例では、生のHTTPリクエストをnetcatにパイプしています：

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

ご覧の通り、`curl`コマンドは、スペースをURLでエスケープする必要があるため、やや不便です。
`wget`はすべてを自動的にエスケープしますが、HTTP 1.1においてkeep-aliveやTransfer-Encoding: chunkedを使用する場合にうまく機能しないため、使用は推奨しません。

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

クエリの一部がパラメータで送信され、一部がPOSTで送信される場合、これら二つのデータ部分の間に改行が挿入されます。
例えば、これは機能しません：

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

デフォルトでは、データは[`TabSeparated`](formats.md#tabseparated)形式で返されます。

`FORMAT`句をクエリに使用して、他のフォーマットを要求できます。例えば：

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

`default_format` URLパラメータまたは`X-ClickHouse-Format`ヘッダーを使用して、`TabSeparated`以外のデフォルトフォーマットを指定できます。

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```
## HTTP/HTTPS経由での挿入クエリ {#insert-queries}

データを転送するのに`POST`メソッドが必要です。この場合、クエリの最初の部分をURLパラメータに記述し、データを送信するのにPOSTを使用します。挿入するデータは、例えばMySQLのタブ区切りダンプであることがあります。このようにして、`INSERT`クエリはMySQLの`LOAD DATA LOCAL INFILE`を置き換えます。
### 例 {#examples}

テーブルを作成するには：

```bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

データ挿入のために馴染みのある`INSERT`クエリを使用するには：

```bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

クエリとは別にデータを送信するには：

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

任意のデータフォーマットを指定できます。例えば、`INSERT INTO t VALUES`を書くときと同じフォーマットである'Values'フォーマットを指定できます：

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

タブ区切りダンプからデータを挿入するには、対応するフォーマットを指定します：

```bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

テーブルの内容を読み取るには：

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
並行クエリ処理のため、データはランダムな順序で出力されます
:::

テーブルを削除するには：

```bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

データテーブルを返さない成功リクエストの場合、空のレスポンスボディが返されます。
## 圧縮 {#compression}

圧縮は、大量のデータを転送する際にネットワークトラフィックを削減するためや、一時的に圧縮されたダンプを作成するために使用できます。

データを転送する際に内部ClickHouse圧縮フォーマットを使用できます。圧縮されたデータは非標準フォーマットであり、`clickhouse-compressor`プログラムを使用して取り扱う必要があります。これはデフォルトで`clickhouse-client`パッケージにインストールされています。

データ挿入の効率を高めるために、[`http_native_compression_disable_checksumming_on_decompress`](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress)設定を使用して、サーバー側のチェックサム検証を無効にします。

URLに `compress=1` を指定すると、サーバーは送信するデータを圧縮します。URLに `decompress=1` を指定すると、サーバーは`POST`メソッドで渡されたデータを解凍します。

[HTTP圧縮](https://en.wikipedia.org/wiki/HTTP_compression)を使用することもできます。ClickHouseは次の[圧縮方式](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens)をサポートしています：

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

圧縮された`POST`リクエストを送信するには、リクエストヘッダー`Content-Encoding: compression_method`を追加します。

ClickHouseがレスポンスを圧縮するためには、[`enable_http_compression`](../operations/settings/settings.md#enable_http_compression)設定を有効にし、リクエストに`Accept-Encoding: compression_method`ヘッダーを追加します。

データ圧縮レベルは、[`http_zlib_compression_level`](../operations/settings/settings.md#http_zlib_compression_level)設定を使用してすべての圧縮方法に対して設定できます。

:::info
一部のHTTPクライアントは、デフォルトでサーバーからのデータを解凍する可能性があり（`gzip`と`deflate`で）、圧縮設定を正しく使用している場合でも解凍されたデータが返されることがあります。
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

サーバーから圧縮データを受信し、gunzipを使用して解凍データを受信するには：

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```
## デフォルトデータベース {#default-database}

`database` URLパラメータまたは `X-ClickHouse-Database` ヘッダーを使用して、デフォルトデータベースを指定できます。

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

デフォルトでは、サーバー設定に登録されているデータベースがデフォルトデータベースとして使用されます。初期状態では、これは`default`という名前のデータベースです。あるいは、常にテーブル名の前にドットを付けてデータベースを指定できます。
## 認証 {#authentication}

ユーザー名とパスワードは、次の3つの方法のいずれかで指定できます：

1. HTTP基本認証を使用。

例えば：

```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. `user`および`password` URLパラメータに指定

:::warning
この方法は、パラメータがWebプロキシによってログに記録され、ブラウザにキャッシュされる可能性があるため、推奨しません。
:::

例えば：

```bash
echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3. 'X-ClickHouse-User'および'X-ClickHouse-Key'ヘッダーを使用

例えば：

```bash
echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

ユーザー名が指定されていない場合は、`default`名が使用されます。パスワードが指定されていない場合は、空のパスワードが使用されます。
クエリの処理に対して、任意の設定を指定するためにURLパラメータを使用することもできます。

例えば：

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

詳細については、次を参照してください：
- [設定](/operations/settings/settings)
- [SET](/sql-reference/statements/set)
## HTTPプロトコルでのClickHouseセッションの利用 {#using-clickhouse-sessions-in-the-http-protocol}

HTTPプロトコルでClickHouseセッションを使用することもできます。そのためには、リクエストに`session_id` `GET`パラメータを追加する必要があります。セッションIDには任意の文字列を使用できます。

デフォルトでは、セッションは60秒の非アクティブ状態で終了します。このタイムアウト（秒単位）を変更するには、サーバー設定で`default_session_timeout`の設定を変更するか、リクエストに`session_timeout` `GET`パラメータを追加します。

セッションの状態を確認するには、`session_check=1`パラメータを使用します。1つのセッション内で同時に実行できるクエリは1つだけです。

クエリの進捗に関する情報は、`X-ClickHouse-Progress`レスポンスヘッダーで受け取ることができます。これを行うには、[`send_progress_in_http_headers`](../operations/settings/settings.md#send_progress_in_http_headers)を有効にします。

以下は、ヘッダーのシーケンスの例です：

```text
X-ClickHouse-Progress: {"read_rows":"2752512","read_bytes":"240570816","total_rows_to_read":"8880128","elapsed_ns":"662334"}
X-ClickHouse-Progress: {"read_rows":"5439488","read_bytes":"482285394","total_rows_to_read":"8880128","elapsed_ns":"992334"}
X-ClickHouse-Progress: {"read_rows":"8783786","read_bytes":"819092887","total_rows_to_read":"8880128","elapsed_ns":"1232334"}
```

可能なヘッダーフィールドは次の通りです：

| ヘッダーフィールド        | 説明                       |
|---------------------------|---------------------------|
| `read_rows`              | 読まれた行の数。          |
| `read_bytes`             | 読まれたデータのサイズ（バイト）。   |
| `total_rows_to_read`     | 読み取る必要のある行の合計数。|
| `written_rows`           | 書き込まれた行の数。      |
| `written_bytes`          | 書き込まれたデータのサイズ（バイト）。 |

HTTP接続が失われても、リクエストは自動的に停止しません。パースとデータフォーマットはサーバー側で行われ、ネットワークを利用することが非効率的な場合があります。

以下のオプションパラメータがあります：

| パラメータ                | 説明                                               |
|---------------------------|---------------------------------------------------|
| `query_id`（オプション） | クエリIDとして渡すことができます（任意の文字列）。[`replace_running_query`](/operations/settings/settings#replace_running_query)|
| `quota_key`（オプション）| クオータキーとして渡すことができます（任意の文字列）。["クオータ"](/operations/quotas)   |

HTTPインターフェースを介して、クエリのための外部データ（外部一時テーブル）を渡すことができます。詳細は、["クエリ処理のための外部データ"](/engines/table-engines/special/external-data)を参照してください。
## レスポンスバッファリング {#response-buffering}

レスポンスバッファリングはサーバー側で有効にできます。次のURLパラメータが提供されています：
- `buffer_size`
- `wait_end_of_query`

次の設定が使用できます：
- [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
- [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

`buffer_size`は、サーバーメモリにバッファとして保存する結果のバイト数を決定します。結果ボディがこの閾値を超える場合、バッファはHTTPチャネルに書き込まれ、残りのデータがHTTPチャネルに直接送信されます。

全体のレスポンスがバッファリングされるようにするには、`wait_end_of_query=1`を設定します。この場合、メモリに保存されないデータは、一時的なサーバーファイルにバッファリングされます。

例えば：

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
バッファリングを使用して、レスポンスコードとHTTPヘッダーがクライアントに送信された後にクエリ処理エラーが発生した状況を回避します。この場合、エラーメッセージはレスポンスボディの最後に書き込まれ、クライアント側ではパースの段階でのみエラーを検出できます。
:::
## クエリパラメータでの役割の設定 {#setting-role-with-query-parameters}

この機能はClickHouse 24.4で追加されました。

特定のシナリオでは、ステートメント自体を実行する前に付与された役割を設定する必要があります。
ただし、`SET ROLE`とステートメントを同時に送信することはできません。複数のステートメントは許可されていないためです：

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

上記のコマンドはエラーになります：

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

この制限を克服するために、`role`クエリパラメータを使用します：

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

これは、ステートメントの前に`SET ROLE my_role`を実行するのと同じです。

また、複数の`role`クエリパラメータを指定することも可能です：

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

この場合、`?role=my_role&role=my_other_role`は、ステートメントの前に`SET ROLE my_role, my_other_role`を実行するのと同様に機能します。
## HTTPレスポンスコードの注意事項 {#http_response_codes_caveats}

HTTPプロトコルの制限により、HTTP 200レスポンスコードはクエリが成功した保証にはなりません。

以下に例を示します：

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

この動作の理由はHTTPプロトコルの性質です。HTTPヘッダーが最初にHTTPコード200と共に送信され、次にHTTPボディが送信され、その後エラーがプレーンテキストとしてボディに注入されます。

この動作は、フォーマットが`Native`、`TSV`、`JSON`などであっても独立しており、エラーメッセージは常にレスポンスストリームの中間にあります。

この問題を緩和するために、`wait_end_of_query=1`を有効にします（[レスポンスバッファリング](#response-buffering)）。この場合、HTTPヘッダーの送信は、クエリが解決されるまで遅延されます。ただし、これは完全に問題を解決するわけではなく、結果はまだ[`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)内に収めなければならず、[`send_progress_in_http_headers`](/operations/settings/settings#send_progress_in_http_headers)などの他の設定がヘッダーの遅延に影響を与える可能性があります。

:::tip
すべてのエラーをキャッチする唯一の方法は、必要なフォーマットを使用する前にHTTPボディを解析することです。
:::
## パラメータ付きクエリ {#cli-queries-with-parameters}

パラメータのあるクエリを作成し、対応するHTTPリクエストパラメータからそれらの値を渡すことができます。詳細については、[CLI用のパラメータ付きクエリ](../interfaces/cli.md#cli-queries-with-parameters)を参照してください。
### 例 {#example-3}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```
### URLパラメータ内のタブ {#tabs-in-url-parameters}

クエリパラメータは「エスケープ」形式から解析されます。これは、nullを明示的に解析できるという利点があります。つまり、タブ文字は`\\t`（または`\`とタブ）としてエンコードする必要があります。例えば、次のように`abc`と`123`の間に実際のタブが含まれていて、入力文字列が2つの値に分割されます：

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

ただし、URLパラメータで実際のタブを`%09`を使ってエンコードしようとすると、正しく解析されません：

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Value abc    123 cannot be parsed as String for query parameter 'arg1' because it isn't parsed completely: only 3 of 7 bytes was parsed: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

URLパラメータを使用している場合、`\t`を`%5C%09`のようにエンコードする必要があります。例えば：

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```
## 予め定義されたHTTPインターフェース {#predefined_http_interface}

ClickHouseは特定のクエリをHTTPインターフェースを介してサポートしています。例えば、テーブルにデータを書き込むには次のようにします：

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouseは、[Prometheusエクスポータ](https://github.com/ClickHouse/clickhouse_exporter)などのサードパーティツールとの統合を容易にするための予め定義されたHTTPインターフェースもサポートしています。例を見てみましょう。

まず、サーバー設定ファイルにこのセクションを追加します。

`http_handlers`は複数の`rule`を含むように設定されます。ClickHouseは受信したHTTPリクエストを`rule`内の予め定義されたタイプにマッチさせ、最初にマッチしたルールがハンドラーを実行します。次に、ClickHouseはマッチが成功した場合に対応する予め定義されたクエリを実行します。

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

これで、Prometheusフォーマットのデータを取得するためにURLに直接リクエストできます：

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

# HELP "Query" "実行中のクエリの数"

# TYPE "Query" counter
"Query" 1


# HELP "Merge" "実行中のバックグラウンドマージの数"

# TYPE "Merge" counter
"Merge" 0


# HELP "PartMutation" "ミューテーションの数 (ALTER DELETE/UPDATE)"

# TYPE "PartMutation" counter
"PartMutation" 0


# HELP "ReplicatedFetch" "レプリカからフェッチされているデータパーツの数"

# TYPE "ReplicatedFetch" counter
"ReplicatedFetch" 0


# HELP "ReplicatedSend" "レプリカに送信されているデータパーツの数"

# TYPE "ReplicatedSend" counter
"ReplicatedSend" 0

* Connection #0 to host localhost left intact

* Connection #0 to host localhost left intact
```

`http_handlers`の構成オプションは、次のように機能します。

`rule`は次のパラメータを設定できます：
- `method`
- `headers`
- `url`
- `handler`

これらは以下で説明されます：

  - `method`はHTTPリクエストのメソッド部分と一致します。`method`はHTTPプロトコル内の[`method`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)の定義に完全に準拠しています。オプションの構成です。構成ファイルに定義されていない場合、HTTPリクエストのメソッド部分と一致しません。

  - `url`はHTTPリクエストのURL部分と一致します。 [RE2](https://github.com/google/re2)の正規表現と互換性があります。オプションの構成です。構成ファイルに定義されていない場合、HTTPリクエストのURL部分とは一致しません。

  - `headers`はHTTPリクエストのヘッダー部分と一致します。RE2の正規表現と互換性があります。オプションの構成です。構成ファイルに定義されていない場合、HTTPリクエストのヘッダー部分とは一致しません。

  - `handler`は主な処理部分を含みます。現在、`handler`は`type`、`status`、`content_type`、`http_response_headers`、`response_content`、`query`、`query_param_name`を設定できます。`type`は現在、[`predefined_query_handler`](#predefined_query_handler)、[`dynamic_query_handler`](#dynamic_query_handler)、[`static`](#static)の3つのタイプをサポートしています。

    - `query` — `predefined_query_handler`タイプで使用し、ハンドラー呼び出し時にクエリを実行します。
    - `query_param_name` — `dynamic_query_handler`タイプで使用し、HTTPリクエストパラメータ内の`query_param_name`値に対応する値を抽出して実行します。
    - `status` — `static`タイプで使用し、レスポンスのステータスコードです。
    - `content_type` — いずれのタイプでも使用可能で、レスポンスの[content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)です。
    - `http_response_headers` — いずれのタイプでも使用可能で、レスポンスヘッダーのマップです。コンテンツタイプを設定するためにも使用できます。
    - `response_content` — `static`タイプで使用し、ファイルまたは構成からクライアントに送信されるレスポンスコンテンツです。

さまざまな`type`の設定方法については、次で説明します。
### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler`は`Settings`と`query_params`の値を設定することをサポートしています。設定は、`predefined_query_handler`タイプの`query`として指定できます。

`query`の値は`predefined_query_handler`の予め定義されたクエリであり、HTTPリクエストが一致したときにClickHouseが実行し、クエリの結果が返されます。これは必須の構成です。

以下の例では、[`max_threads`](../operations/settings/settings.md#max_threads)および[`max_final_threads`](/operations/settings/settings#max_final_threads)設定の値を定義し、その後、これらの設定が成功裏に設定されたかどうかを確認するためにシステムテーブルをクエリしています。

:::note
`query`、`play`、`ping`のようなデフォルトの`handlers`を維持するためには、`<defaults/>`ルールを追加してください。
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
1つの`predefined_query_handler`では、1つの`query`のみがサポートされています。
:::
### dynamic_query_handler {#dynamic_query_handler}

`dynamic_query_handler`では、クエリがHTTPリクエストのパラメータとして記述されます。`predefined_query_handler`ではクエリが設定ファイルに記述されるのとは異なります。`query_param_name`は`dynamic_query_handler`に設定できます。

ClickHouseは、HTTPリクエストのURL内の`query_param_name`値に対応する値を抽出して実行します。`query_param_name`のデフォルト値は`/query`です。これはオプションの構成です。構成ファイルに定義がない場合、そのパラメータは渡されません。

この機能を試すために、次の例では`max_threads`と`max_final_threads`の値を定義し、設定が成功裏に設定されたかどうかを確認します。

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

`static` は [`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)、[status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) および `response_content` を返すことができます。`response_content` は指定されたコンテンツを返します。

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

`http_response_headers` は `content_type` の代わりにコンテンツタイプを設定するために使用できます。

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

クライアントに送信される設定からコンテンツを見つけます。

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

クライアントに送信されるファイルからコンテンツを見つけるには：

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

クエリの実行中にHTTPを介して例外が発生することがあります。この場合、データの一部がすでに送信されている場合があります。通常、例外はプレーンテキストでクライアントに送信されます。
特定のデータ形式を使用してデータを出力していた場合、出力が指定されたデータ形式にとって無効になる可能性があります。
これを防ぐために、設定 [`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format) を使用できます（デフォルトで有効）。これにより、ClickHouseは指定された形式で例外を書き込むことができます（現在XMLおよびJSON形式でサポートされています）。

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
```
