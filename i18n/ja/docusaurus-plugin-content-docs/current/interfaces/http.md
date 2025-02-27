---
slug: /interfaces/http
sidebar_position: 19
sidebar_label: HTTPインターフェース
---

# HTTPインターフェース

HTTPインターフェースを使用すると、REST APIの形で、あらゆるプラットフォームから任意のプログラミング言語でClickHouseを利用できます。HTTPインターフェースはネイティブインターフェースよりも制限がありますが、言語サポートは優れています。

デフォルトで、`clickhouse-server`はポート8123でHTTPリクエストをリッスンしています（これは設定で変更できます）。
HTTPSもデフォルトでポート8443で有効にできます。

パラメータなしで`GET /`リクエストを行うと、200レスポンスコードと、[http_server_default_response](../operations/server-configuration-parameters/settings.md#http_server_default_response)で定義されたデフォルト値「Ok.」（末尾に改行が含まれます）の文字列が返されます。

```bash
$ curl 'http://localhost:8123/'
Ok.
```

また、[HTTPレスポンスコードの注意点](#http_response_codes_caveats)も参照してください。

時々、`curl`コマンドはユーザーのオペレーティングシステムで利用できない場合があります。UbuntuやDebianでは、`sudo apt install curl`を実行してください。例を実行する前に、[このドキュメンテーション](https://curl.se/download.html)を参照してインストールしてください。

Web UIにはここからアクセスできます: `http://localhost:8123/play`。

Web UIには、クエリの実行中に進捗を表示したり、クエリのキャンセルやストリーミング結果を表示する機能があります。
クエリパイプラインのためのチャートやグラフを表示するための秘密の機能もあります。

Web UIは、あなたのような専門家のために設計されています。

![Web UI](../images/play.png)

ヘルスチェックスクリプトでは`GET /ping`リクエストを使用します。このハンドラは常に「Ok.」（末尾に改行が含まれます）を返します。バージョン18.12.13から使用可能です。レプリカの遅延を確認するには、`/replicas_status`も参照してください。

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```

リクエストはURLの'query'パラメータとして送信するか、POSTとして送信します。または、クエリの先頭を'query'パラメータに、残りをPOSTで送信します（これは後で必要な理由を説明します）。デフォルトでは、URLのサイズは1 MiBに制限されていますが、`http_max_uri_size`設定で変更できます。

成功すると、200レスポンスコードとレスポンスボディに結果が返されます。
エラーが発生すると、500レスポンスコードとレスポンスボディにエラー説明テキストが返されます。

GETメソッドを使用しているときは、'readonly'が設定されます。言い換えれば、データを変更するクエリにはPOSTメソッドのみを使用できます。クエリ自体をPOSTボディに送信するか、URLパラメータに含めることができます。

例：

```bash
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

ご覧のとおり、`curl`は空白がURLエスケープされていなければならないため、やや不便です。
`wget`はすべてを自動的にエスケープするため、HTTP 1.1でのkeep-aliveやTransfer-Encoding: chunkedを使用する際にうまく機能しないため、使用することをお勧めしません。

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

クエリの一部がパラメータで送信され、もう一部がPOSTで送信された場合、これらの2つのデータ部分の間に改行が挿入されます。
例（これは機能しません）：

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

デフォルトでは、データは[TabSeparated](formats.md#tabseparated)形式で返されます。

他の形式をリクエストするには、クエリのFORMAT句を使用します。

また、'default_format' URLパラメータまたは'X-ClickHouse-Format'ヘッダーを使用して、TabSeparated以外のデフォルト形式を指定できます。

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

データの送信にはPOSTメソッドが必要です。`INSERT`クエリに対して、クエリの先頭をURLパラメータに書き込み、データを挿入するためにPOSTを使用できます。挿入するデータは、たとえばMySQLからのタブ区切りダンプになることがあります。この方法で、`INSERT`クエリはMySQLの`LOAD DATA LOCAL INFILE`を置き換えます。

**例**

テーブルを作成する：

```bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

データ挿入のために馴染みのあるINSERTクエリを使用：

```bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

データはクエリとは別に送信できます：

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

任意のデータ形式を指定できます。'Values'形式は、INSERT INTO t VALUESを書き込むときに使用されるものと同じです：

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

タブ区切りのダンプからデータを挿入するには、対応する形式を指定します：

```bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

テーブルの内容を読み取ります。データは並列クエリ処理のためランダムな順序で出力されます：

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

テーブルを削除します。

```bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

データテーブルを返さない成功リクエストには、空のレスポンスボディが返されます。


## 圧縮 {#compression}

大量のデータを送信する際や、即座に圧縮されたダンプを作成するために、ネットワークトラフィックを削減するために圧縮を使用できます。

データを送信する際にClickHouseの内部圧縮形式を使用できます。圧縮データは非標準形式であり、それを扱うためには`clickhouse-compressor`プログラムが必要です。このプログラムは`clickhouse-client`パッケージとともにインストールされます。データ挿入の効率を上げるために、[http_native_compression_disable_checksumming_on_decompress](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress)設定を使用して、サーバー側のチェックサム確認を無効にできます。

URLに`compress=1`を指定すると、サーバーは送信するデータを圧縮します。URLに`decompress=1`を指定すると、POSTメソッドで送信したデータをサーバーが解凍します。

また、[HTTP圧縮](https://en.wikipedia.org/wiki/HTTP_compression)を使用することもできます。ClickHouseは次の[圧縮メソッド](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens)をサポートしています：

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

圧縮された`POST`リクエストを送信するには、リクエストヘッダーに`Content-Encoding: compression_method`を追加します。
ClickHouseがレスポンスを圧縮するには、[enable_http_compression](../operations/settings/settings.md#enable_http_compression)設定で圧縮を有効にし、リクエストに`Accept-Encoding: compression_method`ヘッダーを追加します。すべての圧縮メソッドに対して、[http_zlib_compression_level](../operations/settings/settings.md#http_zlib_compression_level)設定でデータ圧縮レベルを設定できます。

:::info
一部のHTTPクライアントは、デフォルトでサーバーからのデータを解凍するかもしれません（`gzip`および`deflate`）ので、圧縮設定を正しく使用しても、解凍されたデータが得られることがあります。
:::

**例**

```bash
# サーバーに圧縮データを送信
$ echo "SELECT 1" | gzip -c | \
  curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

```bash
# サーバーから圧縮データアーカイブを受信
$ curl -vsS "http://localhost:8123/?enable_http_compression=1" \
    -H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'
$ zcat result.gz
0
1
2
```

```bash
# サーバーから圧縮データを受信し、gunzipを使用して解凍されたデータを受け取る
$ curl -sS "http://localhost:8123/?enable_http_compression=1" \
    -H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```

## デフォルトデータベース {#default-database}

'database' URLパラメータまたは'X-ClickHouse-Database'ヘッダーを使用して、デフォルトのデータベースを指定できます。

```bash
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

デフォルトでは、サーバー設定に登録されているデータベースがデフォルトデータベースとして使用されます。デフォルトでは、これは'default'というデータベースです。あるいは、テーブル名の前にドットを付けることで常にデータベースを指定できます。

ユーザー名とパスワードは、次のいずれかの方法で指定できます：

1. HTTP Basic Authenticationを使用して。例：

<!-- -->

```bash
$ echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. 'user'および'password' URLパラメータで (*この方法は推奨しません。パラメータがWebプロキシにログされたり、ブラウザにキャッシュされたりする可能性があるため*)。例：

<!-- -->

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3. 'X-ClickHouse-User'および'X-ClickHouse-Key'ヘッダーを使用して。例：

<!-- -->

```bash
$ echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

ユーザー名が指定されていない場合、`default`が使用されます。パスワードが指定されていない場合、空のパスワードが使用されます。
また、URLパラメータを使用して、単一のクエリの処理または設定プロファイル全体の設定を指定できます。例：http://localhost:8123/?profile=web&max_rows_to_read=1000000000&query=SELECT+1

詳細については、[設定](../operations/settings/overview)セクションを参照してください。

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

他のパラメータに関する情報は、「SET」セクションを参照してください。

## ClickHouseセッションのHTTPプロトコルでの使用 {#using-clickhouse-sessions-in-the-http-protocol}

HTTPプロトコルでClickHouseセッションを使用することもできます。これを行うには、リクエストに`session_id` GETパラメータを追加する必要があります。任意の文字列をセッションIDとして使用できます。デフォルトでは、セッションは60秒の非アクティブ後に終了します。このタイムアウト（秒）を変更するには、サーバー設定の`default_session_timeout`を変更するか、リクエストに`session_timeout` GETパラメータを追加します。セッションの状態を確認するには、`session_check=1`パラメータを使用します。1つのセッション内では一度に1つのクエリのみを実行できます。

クエリの進捗情報は、`X-ClickHouse-Progress`レスポンスヘッダーで受け取ることができます。これを行うには、[send_progress_in_http_headers](../operations/settings/settings.md#send_progress_in_http_headers)を有効にします。ヘッダーのシーケンスの例：

```text
X-ClickHouse-Progress: {"read_rows":"2752512","read_bytes":"240570816","total_rows_to_read":"8880128","elapsed_ns":"662334"}
X-ClickHouse-Progress: {"read_rows":"5439488","read_bytes":"482285394","total_rows_to_read":"8880128","elapsed_ns":"992334"}
X-ClickHouse-Progress: {"read_rows":"8783786","read_bytes":"819092887","total_rows_to_read":"8880128","elapsed_ns":"1232334"}
```

可能なヘッダーフィールド：

- `read_rows` — 読み取った行の数。
- `read_bytes` — 読み取ったデータのボリューム（バイト単位）。
- `total_rows_to_read` — 読み取るべき行の総数。
- `written_rows` — 書き込まれた行の数。
- `written_bytes` — 書き込まれたデータのボリューム（バイト単位）。

HTTP接続が失われた場合でも、実行中のリクエストは自動的に停止しません。解析とデータ形式はサーバー側で行われており、ネットワークの使用が非効率的になることがあります。
オプションの'query_id'パラメータをクエリID（任意の文字列）として渡すことができます。詳細については、「設定、実行中クエリの置き換え」セクションを参照してください。

オプションの'quota_key'パラメータをクォータキー（任意の文字列）として渡すことができます。詳細については、「クォータ」セクションを参照してください。

HTTPインターフェースでは、クエリのために外部データ（外部の一時テーブル）を渡すことができます。詳細については、「クエリ処理のための外部データ」セクションを参照してください。

## レスポンスバッファリング {#response-buffering}

サーバー側でレスポンスバッファリングを有効にできます。これには、`buffer_size`と`wait_end_of_query` URLパラメータが提供されています。
また、`http_response_buffer_size`および`http_wait_end_of_query`設定を使用することもできます。

`buffer_size`は、サーバーメモリ内にバッファリングする結果のバイト数を決定します。このしきい値を超える結果本体がある場合、バッファはHTTPチャネルに書き込まれ、残りのデータは直接HTTPチャネルに送信されます。

レスポンス全体がバッファリングされることを保証するには、`wait_end_of_query=1`を設定します。この場合、メモリに保存されていないデータは、一時的なサーバーファイルにバッファリングされます。

例：

```bash
$ curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

バッファリングを使用して、レスポンスコードとHTTPヘッダーがクライアントに送信された後にクエリ処理エラーが発生する状況を回避します。この状況では、エラーメッセージがレスポンスボディの末尾に書き込まれ、クライアント側ではエラーは解析段階でのみ検出できます。

## クエリパラメータで役割を設定 {#setting-role-with-query-parameters}

これはClickHouse 24.4で追加された新機能です。

特定のシナリオでは、ステートメントを実行する前に付与された役割を設定することが必要な場合があります。
ただし、`SET ROLE`とステートメントを同時に送信することはできません。マルチステートメントは禁止されているため：

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

これはエラーになります：

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

この制限を克服するために、次のように`role`クエリパラメータを使用できます：

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

これは、ステートメントを実行する前に`SET ROLE my_role`を実行するのと同じ意味になります。

さらに、複数の`role`クエリパラメータを指定することも可能です：

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

この場合、`?role=my_role&role=my_other_role`は、ステートメントの前に`SET ROLE my_role, my_other_role`を実行するのと同様に機能します。

## HTTPレスポンスコードの注意点 {#http_response_codes_caveats}

HTTPプロトコルの制限により、HTTP 200レスポンスコードはクエリが成功したことを保証しません。

以下に例を示します：

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

この動作の理由は、HTTPプロトコルの性質によるものです。最初にHTTPコード200を持つHTTPヘッダーが送信され、その後にHTTPボディが続き、エラーはボディ内に平文として注入されます。
この動作は、使用される形式（`Native`、`TSV`、`JSON`のいずれか）に依存せず、エラーメッセージは常にレスポンスストリームの中央に存在します。
この問題を軽減するには、`wait_end_of_query=1`を有効にします（[レスポンスバッファリング](#response-buffering)）。この場合、HTTPヘッダーの送信は、クエリ全体が解決されるまで遅延されます。
しかし、これは問題を完全に解決するわけではなく、結果は依然として`http_response_buffer_size`に収まる必要があり、`send_progress_in_http_headers`のような他の設定がヘッダーの遅延に干渉する可能性があります。
すべてのエラーをキャッチする唯一の方法は、必要な形式を使用して解析する前にHTTPボディを分析することです。

## パラメータ付きクエリ {#cli-queries-with-parameters}

パラメータ付きのクエリを作成し、それに対する値を対応するHTTPリクエストパラメータから渡すことができます。詳細については、[CLIのパラメータ付きクエリ](../interfaces/cli.md#cli-queries-with-parameters)を参照してください。

### 例 {#example}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```

### URLパラメータのタブ {#tabs-in-url-parameters}

クエリパラメータは「エスケープ」形式から解析されます。これには、`\N`のように明確にnullを解析する可能性があるなど、いくつかの利点があります。これは、タブ文字が`\t`（または`\`とタブ）としてエンコードされるべきであることを意味します。たとえば、以下には`abc`と`123`の間に実際のタブが含まれ、入力文字列は2つの値に分割されます：

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

ただし、URLパラメータで実際のタブを`%09`を使用してエンコードしようとすると、適切に解析されません：

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Value abc	123 cannot be parsed as String for query parameter 'arg1' because it isn't parsed completely: only 3 of 7 bytes was parsed: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

URLパラメータを使用している場合は、`\t`を`%5C%09`としてエンコードする必要があります。たとえば：

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```

## 定義済みHTTPインターフェース {#predefined_http_interface}

ClickHouseはHTTPインターフェースを介して特定のクエリをサポートしています。たとえば、次のようにしてテーブルにデータを書き込むことができます。

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouseはまた、[Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter)のようなサードパーティツールとの統合を容易にするための定義済みHTTPインターフェースをサポートしています。

例：

- 最初に、サーバー設定ファイルにこのセクションを追加します：

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

- これでPrometheus形式のデータを直接取得するためにURLをリクエストできます：

<!-- -->

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

例からもわかるように、`http_handlers`がconfig.xmlファイルに設定されていて、`http_handlers`には多くの`rules`を含めることができます。ClickHouseは受信したHTTPリクエストを`rule`の定義済みタイプと照合し、一致した最初のものがハンドラを実行します。その後、一致が成功した場合、ClickHouseは対応する定義済みクエリを実行します。

現在、`rule`は`method`、`headers`、`url`、`handler`を設定できます：
- `method`はHTTPリクエストのメソッド部分に一致します。`method`はHTTPプロトコルの[メソッド](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)の定義に完全に準拠しています。これはオプショナルな設定です。設定ファイルに定義されていない場合、HTTPリクエストのメソッド部分に一致しません。

- `url`はHTTPリクエストのURL部分に一致します。これは[RE2](https://github.com/google/re2)の正規表現に互換性があります。これはオプショナルな設定です。設定ファイルに定義されていない場合、HTTPリクエストのURL部分には一致しません。

- `headers`はHTTPリクエストのヘッダー部分に一致します。これはRE2の正規表現に互換性があります。これはオプショナルな設定です。設定ファイルに定義されていない場合、HTTPリクエストのヘッダー部分には一致しません。

- `handler`にはメイン処理部分が含まれます。現在`handler`は`type`、`status`、`content_type`、`http_response_headers`、`response_content`、`query`、`query_param_name`を設定できます。
    `type`は現在3つのタイプをサポートしています：[predefined_query_handler](#predefined_query_handler)、[dynamic_query_handler](#dynamic_query_handler)、[static](#static)。

    - `query` — `predefined_query_handler`タイプと共に使用して、ハンドラが呼び出されるときにクエリを実行します。

    - `query_param_name` — `dynamic_query_handler`タイプと共に使用し、HTTPリクエストパラメータ内の`query_param_name`値に対応する値を抽出し実行します。

    - `status` — `static`タイプと共に使用し、レスポンスステータスコードです。

    - `content_type` — 任意のタイプと共に使用し、レスポンスの[content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)です。

    - `http_response_headers` — 任意のタイプと共に使用し、レスポンスヘッダーのマップです。コンテンツタイプを設定するために使用することもできます。

    - `response_content` — `static`タイプと共に使用し、クライアントへのレスポンスコンテンツを送信します。プレフィックス'file://'または'config://'を使用すると、ファイルまたは設定からコンテンツを検索してクライアントに送信します。

次は、異なる`type`のための設定方法です。

### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler`では`Settings`および`query_params`値を設定することがサポートされています。`predefined_query_handler`タイプで`query`を設定できます。

`query`値は`predefined_query_handler`の定義済みクエリで、HTTPリクエストが一致したときにClickHouseによって実行され、そのクエリの結果が返されます。これは必須の設定です。

次の例では、[max_threads](../operations/settings/settings.md#max_threads)および`max_final_threads`設定の値を定義し、これらの設定が正常に設定されたかどうかを確認するためにシステムテーブルを照会します。

:::note
デフォルトの`handlers`（`query`、`play`、`ping`など）を保持するには、`<defaults/>`ルールを追加します。
:::

例：

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

```bash
$ curl -H 'XXX:TEST_HEADER_VALUE' -H 'PARAMS_XXX:max_final_threads' 'http://localhost:8123/query_param_with_url/max_threads?max_threads=1&max_final_threads=2'
max_final_threads	2
max_threads	1
```

:::note
1つの`predefined_query_handler`では、1つの`query`のみがサポートされています。
:::

### dynamic_query_handler {#dynamic_query_handler}

`dynamic_query_handler`では、クエリはHTTPリクエストのパラメータの形式で記述されます。`predefined_query_handler`ではクエリが設定ファイルに記述されるのに対し、その違いがあります。`dynamic_query_handler`で`query_param_name`を設定できます。

ClickHouseはHTTPリクエストのURL内の`query_param_name`値に対応する値を抽出して実行します。`query_param_name`のデフォルト値は`/query`です。これはオプショナルな設定です。設定ファイルに定義がない場合、そのパラメータは渡されません。

この機能を試すために、次の例では[max_threads](../operations/settings/settings.md#max_threads)および`max_final_threads`の値を定義し、設定が正常に設定されているかどうかを確認します。

例：

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

```bash
$ curl  -H 'XXX:TEST_HEADER_VALUE_DYNAMIC'  'http://localhost:8123/own?max_threads=1&max_final_threads=2&param_name_1=max_threads&param_name_2=max_final_threads&query_param=SELECT%20name,value%20FROM%20system.settings%20where%20name%20=%20%7Bname_1:String%7D%20OR%20name%20=%20%7Bname_2:String%7D'
max_threads 1
max_final_threads   2
```

### static {#static}

`static`は[content_type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)、[status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)および`response_content`を返すことができます。`response_content`は指定されたコンテンツを返すことができます。

例：

メッセージを返す。

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

`http_response_headers`は`content_type`を設定するために使用することもできます。

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

```bash
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

設定からクライアントに送信されるコンテンツを見つけます。

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
```
```html
* Connection #0 to host localhost left intact
<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>%
```

ファイルからクライアントに送信された内容を探します。

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

## HTTPストリーミング中の例外に関する有効なJSON/XMLレスポンス {#valid-output-on-exception-http-streaming}

HTTP経由でのクエリ実行中に、データの一部がすでに送信されている場合に例外が発生することがあります。通常、例外はクライアントにプレーンテキストで送信されますが、特定のデータフォーマットが使用されていた場合、出力は指定されたデータフォーマットにおいて無効になる可能性があります。これを防ぐために、設定 `http_write_exception_in_output_format`（デフォルトで有効）を使用すると、ClickHouseは指定されたフォーマット（現在はXMLおよびJSON*フォーマットに対応）で例外を出力することができます。

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
