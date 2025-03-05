---
slug: /interfaces/http
sidebar_position: 19
sidebar_label: HTTPインターフェース
---

import PlayUI from '@site/static/images/play.png';

# HTTPインターフェース

HTTPインターフェースを使用すると、あらゆるプラットフォームであらゆるプログラミング言語からClickHouseをREST APIの形式で利用できます。HTTPインターフェースはネイティブインターフェースよりも機能が制限されていますが、より優れた言語サポートを提供します。

デフォルトでは、`clickhouse-server`はポート8123でHTTPをリッスンします（これは設定ファイルで変更できます）。
HTTPSもデフォルトでポート8443で有効にできます。

パラメーターなしで `GET /` リクエストを作成すると、200のレスポンスコードと、[http_server_default_response](../operations/server-configuration-parameters/settings.md#http_server_default_response)で定義されているデフォルト値の文字列 "Ok."（行末に改行あり）が返されます。

``` bash
$ curl 'http://localhost:8123/'
Ok.
```

また、次を参照してください: [HTTPレスポンスコードの注意事項](#http_response_codes_caveats)。

時々、`curl` コマンドはユーザーのオペレーティングシステム上で利用可能ではありません。UbuntuまたはDebianでは、`sudo apt install curl`を実行してください。実行する前に、[このドキュメント](https://curl.se/download.html)を参照してインストールしてください。

Web UIにはここからアクセスできます: `http://localhost:8123/play`。

Web UIは、クエリ実行中の進行状況の表示、クエリのキャンセル、ストリーミング結果の表示をサポートしています。
クエリパイプラインのためのチャートとグラフの表示のための秘密の機能もあります。

Web UIは、あなたのような専門家のために設計されています。

<img src={PlayUI} alt="ClickHouse Web UIのスクリーンショット" />

ヘルスチェックスクリプトでは `GET /ping` リクエストを使用してください。このハンドラーは常に "Ok."（行末に改行あり）を返します。バージョン18.12.13から利用可能です。また、レプリカの遅延を確認するために `/replicas_status` も参照してください。

``` bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```

リクエストをURLの 'query' パラメーターとして送信するか、POSTとしてください。または、クエリの最初の部分を 'query' パラメーターで送信し、残りをPOSTで送信できます（これは後で必要な理由を説明します）。URLのサイズはデフォルトで1 MiBに制限されており、これは`http_max_uri_size`設定で変更できます。

成功すると、200のレスポンスコードとともにレスポンスボディ内に結果が返されます。
エラーが発生すると、500のレスポンスコードとともにレスポンスボディ内にエラーの説明が返されます。

GETメソッドを使用する場合、'readonly'が設定されています。言い換えれば、データを変更するクエリにはPOSTメソッドのみを使用できます。クエリ自体は、POSTボディまたはURLパラメーターのいずれかで送信できます。

例:

``` bash
$ curl 'http://localhost:8123/?query=SELECT%201'
1

$ wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
1

$ echo -ne 'GET /?query=SELECT%201 HTTP/1.0\r\n\r\n' | nc localhost 8123
HTTP/1.0 200 OK
Date: Wed, 27 Nov 2019 10:30:18 GMT
Connection: Close
Content-Type: text/tab-separated-values; charset=UTF-8
X-ClickHouse-Server-Display-Name: clickhouse.ru-central1.internal
X-ClickHouse-Query-Id: 5abe861c-239c-467f-b955-8a201abb8b7f
X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334"}

1
```

ご覧のとおり、`curl`はスペースがURLエスケープされなければならないため、若干不便です。
`wget`はすべてを自動的にエスケープしますが、HTTP 1.1上でキープアライブやTransfer-Encoding: chunkedを使用する際にうまく動作しないため、使用を推奨しません。

``` bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

クエリの一部がパラメーターで送信され、残りがPOSTで送信される場合、これら二つのデータ部分の間には改行が挿入されます。
例（これは機能しないでしょう）:

``` bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

デフォルトでは、データは[タブ区切り形式](formats.md#tabseparated)で返されます。

クエリのFORMAT句を使用して、他の任意の形式を要求できます。

また、'default_format' URLパラメーターまたは'X-ClickHouse-Format'ヘッダーを使用して、タブ区切り以外のデフォルト形式を指定することもできます。

``` bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

データを送信するPOSTメソッドは、`INSERT`クエリに必要です。この場合、URLパラメーターにクエリの最初の部分を書き、POSTを使用して挿入するデータを渡します。挿入データは、例えばMySQLからのタブ区切りダンプなどです。この方法で、`INSERT`クエリはMySQLの`LOAD DATA LOCAL INFILE`を置き換えます。

**例**

テーブルを作成する:

``` bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

データ挿入のための馴染みのあるINSERTクエリを使用する:

``` bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

データはクエリから独立して送信できます:

``` bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

任意のデータ形式を指定できます。'Values'形式は、`INSERT INTO t VALUES`書き込み時に使用されるものと同等です:

``` bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

タブ区切りダンプからデータを挿入するには、対応する形式を指定します:

``` bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

テーブルの内容を読み取る。データはランダムな順序で出力されます。これは並列クエリ処理によるものです:

``` bash
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

テーブルを削除します。

``` bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

データテーブルを返さない成功したリクエストでは、空のレスポンスボディが返されます。
## 圧縮 {#compression}

大量のデータを送信する際や、直ちに圧縮されたダンプを作成する際に、ネットワークトラフィックを減らすために圧縮を使用できます。

データを送信する際には、内部のClickHouse圧縮形式を使用できます。圧縮データは非標準形式を持ち、操作するためには `clickhouse-compressor` プログラムが必要です。これは `clickhouse-client` パッケージと共にインストールされます。データ挿入の効率を高めるために、[http_native_compression_disable_checksumming_on_decompress](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress)設定を使用してサーバー側のチェックサム検証を無効にすることができます。

URLに `compress=1` を指定すると、サーバーは送信するデータを圧縮します。URLに `decompress=1` を指定すると、サーバーは、`POST`メソッドで渡されたデータを解凍します。

また、[HTTP圧縮](https://en.wikipedia.org/wiki/HTTP_compression)を使用することもできます。ClickHouseは以下の[圧縮方式](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens)をサポートしています：

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

圧縮された`POST`リクエストを送信するには、リクエストヘッダーに `Content-Encoding: compression_method` を追加します。ClickHouseがレスポンスを圧縮するようにするには、[enable_http_compression](../operations/settings/settings.md#enable_http_compression)設定を有効にし、リクエストに `Accept-Encoding: compression_method` ヘッダーを追加します。すべての圧縮メソッドのデータ圧縮レベルは、[http_zlib_compression_level](../operations/settings/settings.md#http_zlib_compression_level)設定で構成できます。

:::info
一部のHTTPクライアントは、デフォルトでサーバーから受信したデータを解凍する場合があります（`gzip` や `deflate`を使用して）ので、圧縮設定を正しく使用しても解凍されたデータが得られるかもしれません。
:::

**例**

``` bash

# サーバーに圧縮データを送信
$ echo "SELECT 1" | gzip -c | \
  curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

``` bash

# サーバーから圧縮データアーカイブを受信
$ curl -vsS "http://localhost:8123/?enable_http_compression=1" \
    -H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'
$ zcat result.gz
0
1
2
```

```bash

# サーバーから圧縮データを受信し、gunzipを使用して解凍されたデータを受信
$ curl -sS "http://localhost:8123/?enable_http_compression=1" \
    -H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```
## デフォルトデータベース {#default-database}

デフォルトデータベースを指定するには、'database' URLパラメーターまたは 'X-ClickHouse-Database' ヘッダーを使用できます。

``` bash
$ echo 'SELECT number FROM numbers LIMIT 10' | curl 'http://localhost:8123/?database=system' --data-binary @-
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

デフォルトでは、サーバー設定に登録されているデータベースがデフォルトデータベースとして使用されます。デフォルトでは、これは 'default'という名前のデータベースです。あるいは、テーブル名の前にドットを付けて常にデータベースを指定することもできます。

ユーザー名とパスワードは、次の3つの方法のいずれかで指定できます:

1.  HTTPベーシック認証を使用。例:

<!-- -->

``` bash
$ echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2.  'user'および'password' URLパラメーターで （*この方法は推奨しません。プロキシでログに記録されたりブラウザにキャッシュされたりする可能性があります*）。例:

<!-- -->

``` bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3.  'X-ClickHouse-User'および'X-ClickHouse-Key'ヘッダーを使用。例:

<!-- -->

``` bash
$ echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

ユーザー名が指定されていない場合、`default`名が使用されます。パスワードが指定されていない場合、空のパスワードが使用されます。
クエリ処理のために単一のクエリまたは設定全体のプロファイルに対して、URLパラメーターを使用して任意の設定を指定することもできます。例:http://localhost:8123/?profile=web&max_rows_to_read=1000000000&query=SELECT+1

詳細については、[設定](/docs/operations/settings/settings)セクションを参照してください。

``` bash
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

その他のパラメーターについては、「SET」セクションを参照してください。
## HTTPプロトコルでのClickHouseセッションの使用 {#using-clickhouse-sessions-in-the-http-protocol}

HTTPプロトコルでClickHouseセッションを使用することもできます。これを行うには、リクエストに `session_id` GETパラメーターを追加する必要があります。セッションIDとして任意の文字列を使用できます。デフォルトでは、60秒間非活動の後にセッションは終了します。このタイムアウト（秒単位）を変更するには、サーバー構成の `default_session_timeout` 設定を変更するか、リクエストに `session_timeout` GETパラメーターを追加します。セッションの状態を確認するには、`session_check=1` パラメーターを使用します。一度に実行できるクエリは、単一のセッション内で1つだけです。

クエリの進行状況に関する情報は、`X-ClickHouse-Progress` レスポンスヘッダーで受け取ることができます。これを行うには、[send_progress_in_http_headers](../operations/settings/settings.md#send_progress_in_http_headers)を有効にします。ヘッダーのシーケンスの例:

``` text
X-ClickHouse-Progress: {"read_rows":"2752512","read_bytes":"240570816","total_rows_to_read":"8880128","elapsed_ns":"662334"}
X-ClickHouse-Progress: {"read_rows":"5439488","read_bytes":"482285394","total_rows_to_read":"8880128","elapsed_ns":"992334"}
X-ClickHouse-Progress: {"read_rows":"8783786","read_bytes":"819092887","total_rows_to_read":"8880128","elapsed_ns":"1232334"}
```

可能なヘッダーフィールド:

- `read_rows` — 読み取った行数。
- `read_bytes` — 読み取ったデータのバイト数。
- `total_rows_to_read` — 読み取る必要のある行の総数。
- `written_rows` — 書き込まれた行数。
- `written_bytes` — 書き込まれたデータのバイト数。

リクエストが実行中にHTTP接続が失われても、自動的に停止しません。パースとデータ形式設定はサーバー側で行われ、ネットワークの使用は非効率的になり得ます。
任意の文字列としてクエリID（オプションの'query_id'パラメータ）を渡すことができます。詳細については「設定、running_queryの置換」セクションを参照してください。

任意の文字列としてクォータキー（オプションの'quota_key'パラメータ）を渡すことができます。詳細については「クォータ」セクションを参照してください。

HTTPインターフェースでは、クエリ用の外部データ（外部一時テーブル）を渡すことができます。詳細については、「クエリ処理のための外部データ」セクションを参照してください。
## レスポンスバッファリング {#response-buffering}

サーバー側でレスポンスバッファリングを有効にできます。これを目的とした `buffer_size` および `wait_end_of_query` URLパラメーターが提供されています。
また、設定 `http_response_buffer_size` および `http_wait_end_of_query` も使用できます。

`buffer_size` は、サーバーメモリ内でバッファリングする結果のバイト数を決定します。結果ボディがこの閾値を超える場合、バッファはHTTPチャネルに書き込まれ、残りのデータはHTTPチャネルに直接送信されます。

レスポンス全体がバッファリングされるようにするには、`wait_end_of_query=1` に設定します。この場合、メモリに格納されていないデータは一時サーバーファイルにバッファリングされます。

例:

``` bash
$ curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

バッファリングを使用して、レスポンスコードとHTTPヘッダーがクライアントに送信された後にクエリ処理エラーが発生する状況を回避します。この状況では、エラーメッセージがレスポンスボディの末尾に書き込まれ、クライアント側では解析段階でのみエラーを検出できる可能性があります。
## クエリパラメータを使用した役割の設定 {#setting-role-with-query-parameters}

これはClickHouse 24.4で追加された新機能です。

特定のシナリオでは、ステートメントを実行する前に、最初に付与された役割を設定する必要があるかもしれません。
ただし、 `SET ROLE` とステートメントを一度に送信することはできません。これは、複数ステートメントは許可されていないためです:

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

これにより、以下のエラーが発生します:

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

この制限を克服するために、`role`クエリパラメータを代わりに使用できます:

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

これは、ステートメントの前に `SET ROLE my_role` を実行するのと同等です。

さらに、複数の `role` クエリパラメータを指定することも可能です:

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

この場合、 `?role=my_role&role=my_other_role` は、ステートメントの前に `SET ROLE my_role, my_other_role` を実行するのと似たように機能します。
## HTTPレスポンスコードの注意事項 {#http_response_codes_caveats}

HTTPプロトコルの制限のため、HTTP 200レスポンスコードはクエリが成功したことを保証しません。

以下はその例です:

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

この動作の理由は、HTTPプロトコルの性質にあります。HTTPヘッダは最初にHTTPコード200で送信され、その後HTTPボディが続き、エラーがそのボディにプレーンテキストとして注入されます。
この動作は、使用される形式、`Native`、`TSV`、または `JSON` に関係なく、エラーメッセージは常にレスポンスストリームの中間に存在します。
この問題を軽減するには、`wait_end_of_query=1` を有効にすることができます（[レスポンスバッファリング](#response-buffering)）。この場合、HTTPヘッダーの送信は、クエリがすべて解決されるまで遅延されます。
ただし、これだけでは問題は完全に解決されません。結果はまだ `http_response_buffer_size` に収まる必要があり、`send_progress_in_http_headers` のような他の設定がヘッダーの遅延に干渉する可能性があります。
すべてのエラーをキャッチする唯一の方法は、必須の形式を使用してパースする前にHTTPボディを分析することです。
## パラメータ付きクエリ {#cli-queries-with-parameters}

パラメータ付きのクエリを作成して、対応するHTTPリクエストパラメータからその値を渡すことができます。詳細については、[CLI用のパラメータ付きクエリ](../interfaces/cli.md#cli-queries-with-parameters)を参照してください。
### 例 {#example}

``` bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```
### URLパラメータ内のタブ {#tabs-in-url-parameters}

クエリパラメータは "エスケープされた" 形式から解析されます。これにはいくつかの利点があり、ヌル値を明確に解析できる可能性があります（`\N`として）。これは、タブ文字が `\t`（または`\`とタブ）としてエンコードされる必要があることを意味します。例えば、以下には `abc` と `123` の間に実際のタブが含まれ、入力文字列は二つの値に分かれています:

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

ただし、URLパラメータで実際のタブを `%09` を使用してエンコードしようとすると、正しく解析されません:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Value abc	123 cannot be parsed as String for query parameter 'arg1' because it isn't parsed completely: only 3 of 7 bytes was parsed: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

URLパラメータを使用する場合、 `\t` を `%5C%09` としてエンコードする必要があります。例えば:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```
## 事前定義されたHTTPインターフェース {#predefined_http_interface}

ClickHouseはHTTPインターフェースを介して特定のクエリをサポートしています。例えば、次のようにデータをテーブルに書き込むことができます:

``` bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouseはまた、[Prometheusエクスポーター](https://github.com/ClickHouse/clickhouse_exporter)のようなサードパーティツールとの統合を容易にするための事前定義されたHTTPインターフェースをサポートしています。

例:

- まず最初に、サーバー構成ファイルにこのセクションを追加します:

<!-- -->

``` xml
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

- これで、Prometheus形式でデータを取得するためにURLに直接リクエストを送信できます:

<!-- -->

``` bash
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

例からわかるように、`http_handlers`がconfig.xmlファイルに設定されており、`http_handlers`には多くの `rules` を含めることができます。ClickHouseは受信したHTTPリクエストを事前定義されたタイプにマッチさせ、最初に一致したルールがハンドラーを実行します。次に、マッチが成功した場合、ClickHouseは対応する事前定義されたクエリを実行します。

現在、`rule`は`method`、`headers`、`url`、`handler`を構成できます：
- `method`はHTTPリクエストのメソッド部分をマッチさせるためのものです。`method`はHTTPプロトコルの[メソッド](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)の定義に完全に従います。これはオプションの設定です。設定ファイルで定義されていない場合、HTTPリクエストのメソッド部分にマッチしません。

- `url`はHTTPリクエストのURL部分をマッチさせるためのものです。これは[RE2](https://github.com/google/re2)の正規表現に互換性があります。これはオプションの設定です。設定ファイルで定義されていない場合、HTTPリクエストのURL部分にマッチしません。

- `headers`はHTTPリクエストのヘッダー部分をマッチさせるためのものです。これはRE2の正規表現に互換性があります。これはオプションの設定です。設定ファイルで定義されていない場合、HTTPリクエストのヘッダー部分にマッチしません。

- `handler`は主要な処理部分を含みます。現在、`handler`は`type`、`status`、`content_type`、`http_response_headers`、`response_content`、`query`、`query_param_name`を構成できます。
    `type`は現在、[predefined_query_handler](#predefined_query_handler)、[dynamic_query_handler](#dynamic_query_handler)、[static](#static)の3つのタイプをサポートします。

    - `query` — `predefined_query_handler`タイプで使用し、ハンドラーが呼び出されたときにクエリを実行します。

    - `query_param_name` — `dynamic_query_handler`タイプで使用し、HTTPリクエストパラメーターの`query_param_name`の値に対応する値を抽出して実行します。

    - `status` — `static`タイプで使用し、レスポンスステータスコードを制御します。

    - `content_type` — 任意のタイプで使用し、レスポンスの[content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)を設定します。

    - `http_response_headers` — 任意のタイプで使用し、レスポンスヘッダーマップ。コンテンツタイプを設定するためにも使用できます。

    - `response_content` — `static`タイプで使用し、クライアントに送信されるレスポンスコンテンツ。接頭辞が 'file://' または 'config://' の場合、ファイルまたは設定からコンテンツを見つけてクライアントに送信します。

次に、異なる `type` のための設定メソッドが続きます。
### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler`は、`Settings` および `query_params` の値を設定することをサポートしています。`predefined_query_handler`のタイプで`query`を設定できます。

`query`の値は、HTTPリクエストがマッチしたときにClickHouseによって実行される事前定義されたクエリです。これは必須の設定です。

以下の例では、[max_threads](../operations/settings/settings.md#max_threads)と `max_final_threads` 設定の値を定義し、システムテーブルをクエリします。これにより、これらの設定が正常に設定されているかを確認できます。

:::note
`query`、`play`、`ping`などのデフォルト`handlers`を維持するために、`<defaults/>` ルールを追加します。
:::

例:

``` xml
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

``` bash
$ curl -H 'XXX:TEST_HEADER_VALUE' -H 'PARAMS_XXX:max_final_threads' 'http://localhost:8123/query_param_with_url/max_threads?max_threads=1&max_final_threads=2'
max_final_threads	2
max_threads	1
```

:::note
1つの `predefined_query_handler` では、1つの `query` のみがサポートされています。
:::
### dynamic_query_handler {#dynamic_query_handler}

`dynamic_query_handler`では、クエリがHTTPリクエストのパラメータとして書かれています。異なる点は、`predefined_query_handler`ではクエリが構成ファイルに書かれています。`dynamic_query_handler`で`query_param_name`を設定できます。

ClickHouseはHTTPリクエストのURL内の`query_param_name`の値に対応する値を抽出して実行します。`query_param_name`のデフォルト値は`/query`です。これはオプションの設定です。構成ファイルに定義がない場合、そのパラメータは渡されません。

この機能を試してみるために、以下の例では、[max_threads](../operations/settings/settings.md#max_threads)および `max_final_threads`の値を定義し、これらの設定が正常に設定されているかどうかを確認します。

例:

``` xml
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

``` bash
$ curl  -H 'XXX:TEST_HEADER_VALUE_DYNAMIC'  'http://localhost:8123/own?max_threads=1&max_final_threads=2&param_name_1=max_threads&param_name_2=max_final_threads&query_param=SELECT%20name,value%20FROM%20system.settings%20where%20name%20=%20%7Bname_1:String%7D%20OR%20name%20=%20%7Bname_2:String%7D'
max_threads 1
max_final_threads   2
```
### static {#static}

`static` は [content_type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)、[status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) および `response_content` を返すことができます。 `response_content` は指定されたコンテンツを返すことができます。

例:

メッセージを返します。

``` xml
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
                <response_content>Say Hi!</response_content>
            </handler>
        </rule>
        <defaults/>
</http_handlers>
```

`http_response_headers` を使用して `content_type` の代わりにコンテンツタイプを設定することもできます。

``` xml
<http_handlers>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/hi</url>
            <handler>
                <type>static</type>
                <status>402</status>
                <http_response_headers>
                    <Content-Type>text/html; charset=UTF-8</Content-Type>
                    <Content-Language>en</Content-Language>
                    <X-My-Custom-Header>43</X-My-Custom-Header>
                </http_response_headers>
                <response_content>Say Hi!</response_content>
            </handler>
        </rule>
        <defaults/>
</http_handlers>
```

``` bash
$ curl -vv  -H 'XXX:xxx' 'http://localhost:8123/hi'
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

``` xml
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

``` bash
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

クライアントに送信されるファイルからコンテンツを見つけます。

``` xml
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

``` bash
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
## HTTP ストリーミング中の例外発生時の有効な JSON/XML レスポンス {#valid-output-on-exception-http-streaming}

HTTP を介してクエリを実行中に、一部のデータがすでに送信されている場合、例外が発生することがあります。通常、特定のデータ形式を使用してデータを出力していても、例外はプレーンテキストでクライアントに送信され、出力は指定されたデータ形式の観点で無効になる可能性があります。これを防ぐために、設定 `http_write_exception_in_output_format` (デフォルトで有効) を使用して、指定されたフォーマット (現在サポートされているのは XML および JSON* フォーマット) で例外を書き込むよう ClickHouse に指示できます。

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
