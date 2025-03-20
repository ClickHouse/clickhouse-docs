---
slug: '/interfaces/http'
sidebar_position: 19
sidebar_label: 'HTTPインターフェース'
keywords: ['HTTP', '接続', 'ClickHouse']
description: 'ClickHouseのHTTPインターフェースに関する詳細な説明です。'
---

import PlayUI from '@site/static/images/play.png';

# HTTPインターフェース

HTTPインターフェースを使用すると、どのプラットフォームでも、どのプログラミング言語からでも、ClickHouseをREST APIの形で利用できます。HTTPインターフェースはネイティブインターフェースよりも制限がありますが、言語サポートが優れています。

デフォルトでは、`clickhouse-server`はポート8123でHTTPをリッスンします（これは設定で変更可能です）。HTTPSもデフォルトでポート8443で有効にできます。

パラメーターなしで `GET /` リクエストを送信すると、200レスポンスコードと、[http_server_default_response](../operations/server-configuration-parameters/settings.md#http_server_default_response)で定義されたデフォルト値の文字列「Ok.」（末尾に改行を含む）が返されます。

``` bash
$ curl 'http://localhost:8123/'
Ok.
```

また、[HTTPレスポンスコードの注意事項](#http_response_codes_caveats)も参照してください。

時々、`curl` コマンドがユーザーのオペレーティングシステムで利用できないことがあります。UbuntuやDebianでは、`sudo apt install curl`を実行してください。実行する前に、[このドキュメンテーション](https://curl.se/download.html)を参照してインストールしてください。

Web UIにはこちらからアクセスできます: `http://localhost:8123/play`。

Web UIはクエリ実行中の進行状況の表示、クエリのキャンセル、およびストリーミング結果をサポートしています。クエリパイプラインのチャートとグラフを表示するための隠れた機能も備えています。

Web UIは、あなたのようなプロフェッショナルのために設計されています。

<img src={PlayUI} alt="ClickHouse Web UIのスクリーンショット" />

ヘルスチェックスクリプトでは、`GET /ping` リクエストを使用します。このハンドラーは常に「Ok.」（末尾に改行）を返します。バージョン18.12.13から利用可能です。また、レプリカの遅延を確認するために`/replicas_status`も参照してください。

``` bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```

リクエストは、URLの 'query' パラメーターとして送信するか、POSTとして送信できます。また、クエリの先頭を 'query' パラメーターに、残りをPOSTで送信します（後でこれが必要な理由を説明します）。デフォルトでは、URLのサイズは1MiBに制限されており、`http_max_uri_size`設定で変更可能です。

成功した場合、200レスポンスコードとレスポンスボディ内の結果が返されます。エラーが発生した場合、500レスポンスコードとエラーメッセージがレスポンスボディに返されます。

GETメソッドを使用すると、'readonly' が設定されます。言い換えれば、データを変更するクエリには、POSTメソッドのみを使用できます。クエリ自体をPOSTボディまたはURLパラメーターのいずれかに送信できます。

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

ご覧の通り、`curl` はスペースをURLエスケープする必要があるため、やや不便です。`wget`はすべてを自動でエスケープしますが、HTTP 1.1でのkeep-aliveおよびTransfer-Encoding: chunked使用時にはあまりうまく動作しないため、使用を推奨しません。

``` bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

クエリの一部がパラメーターに送信され、別の部分がPOSTで送信される場合、これらの二つのデータ部分の間に改行が挿入されます。
例（これは機能しません）:

``` bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

デフォルトでは、データは[TabSeparated](formats.md#tabseparated)形式で返されます。

他のフォーマットを要求するには、クエリのFORMAT句を使用します。

また、'default_format' URLパラメーターまたは'X-ClickHouse-Format'ヘッダーを使用して、TabSeparated以外のデフォルト形式を指定できます。

``` bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

データを送信するためのPOSTメソッドは、`INSERT`クエリに必要です。この場合、URLパラメーターにクエリの最初の部分を記述し、POSTを使用して挿入するデータを渡します。挿入するデータは、例えばMySQLからのタブ区切りのダンプである可能性があります。この方法で、`INSERT`クエリはMySQLの`LOAD DATA LOCAL INFILE`に置き換えられます。

**例**

テーブルの作成:

``` bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

データ挿入のためにお馴染みのINSERTクエリを使用:

``` bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

クエリとは別にデータを送信できます:

``` bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

任意のデータフォーマットを指定できます。'Values'形式は、INSERT INTO t VALUESを書くときと同じです。

``` bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

タブ区切りのダンプからデータを挿入するには、対応するフォーマットを指定します:

``` bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

テーブルの内容を読み取ります。データは並行クエリ処理のために順不同で出力されます:

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

データテーブルを返さない成功したリクエストは、空のレスポンスボディが返されます。
## 圧縮 {#compression}

大量のデータを送信する際や即座に圧縮されたダンプを作成する際には、圧縮を利用できます。

データを送信する際に内部のClickHouse圧縮フォーマットを使用することができます。圧縮データは非標準フォーマットであり、これで作業するには`clickhouse-compressor`プログラムが必要です。このプログラムは`clickhouse-client`パッケージと共にインストールされます。データ挿入の効率を高めるために、[http_native_compression_disable_checksumming_on_decompress](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress)設定を使ってサーバー側のチェックサム検証を無効にすることができます。

URLに`compress=1`を指定すると、サーバーは送信するデータを圧縮します。URLに`decompress=1`を指定すると、サーバーは`POST`メソッドで渡すデータを解凍します。

[HTTP圧縮](https://en.wikipedia.org/wiki/HTTP_compression)を使用することもできます。ClickHouseは次の[圧縮メソッド](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens)をサポートしています：

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

圧縮された`POST`リクエストを送信するには、リクエストヘッダーに`Content-Encoding: compression_method`を追加します。ClickHouseにレスポンスを圧縮させるためには、[enable_http_compression](../operations/settings/settings.md#enable_http_compression)設定で圧縮を有効にし、リクエストに`Accept-Encoding: compression_method`ヘッダーを追加します。すべての圧縮メソッドに対して、[http_zlib_compression_level](../operations/settings/settings.md#http_zlib_compression_level)設定でデータの圧縮レベルを設定できます。

:::info
一部のHTTPクライアントはデフォルトでサーバーからのデータを解凍する場合があり（`gzip`および `deflate`）、圧縮設定を正しく使用しても解凍されたデータを受け取ることがあるかもしれません。
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

# 圧縮データをサーバーから受信し、gunzipを使用して解凍データを受信
$ curl -sS "http://localhost:8123/?enable_http_compression=1" \
    -H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```
## デフォルトのデータベース {#default-database}

'database' URLパラメーターまたは'X-ClickHouse-Database'ヘッダーを使用して、デフォルトのデータベースを指定できます。

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

デフォルトでは、サーバー設定に登録されているデータベースがデフォルトのデータベースとして使用されます。デフォルトでは、これは'default'という名前のデータベースです。もしくは、テーブル名の前にドットを付けてデータベースを常に指定することができます。

ユーザー名とパスワードは、以下のいずれかの3つの方法で指定できます：

1.  HTTPベーシック認証を使用します。例：

<!-- -->

``` bash
$ echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2.  'user'と'password'のURLパラメーターに設定します（*この方法は推奨しません。パラメーターがWebプロキシにログされ、ブラウザにキャッシュされる可能性があるため*）。例：

<!-- -->

``` bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3.  'X-ClickHouse-User'と'X-ClickHouse-Key'ヘッダーを使用します。例：

<!-- -->

``` bash
$ echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

ユーザー名が指定されていない場合、`default`という名前が使用されます。パスワードが指定されていない場合、空のパスワードが使用されます。
URLパラメーターを使用して、単一クエリの処理設定や、全体の設定プロファイルを指定することも可能です。例：http://localhost:8123/?profile=web&max_rows_to_read=1000000000&query=SELECT+1

詳細については、[設定](/operations/settings/settings)セクションを参照してください。

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

他のパラメーターに関する情報は、「SET」セクションを参照してください。
## HTTPプロトコルでのClickHouseセッションの使用 {#using-clickhouse-sessions-in-the-http-protocol}

HTTPプロトコルでClickHouseセッションを使用することもできます。これを行うには、リクエストに`session_id` GETパラメーターを追加する必要があります。セッションIDには任意の文字列を使用できます。デフォルトでは、60秒間の非アクティブ状態が続いた後にセッションが終了します。このタイムアウト（秒単位）を変更するには、サーバー設定で`default_session_timeout`設定を変更するか、リクエストに`session_timeout` GETパラメーターを追加します。セッションのステータスを確認するためには、`session_check=1`パラメーターを使用します。単一のセッション内で同時に実行できるクエリは1つだけです。

`X-ClickHouse-Progress`レスポンスヘッダーでクエリの進行状況に関する情報を取得できます。これを行うには、[send_progress_in_http_headers](../operations/settings/settings.md#send_progress_in_http_headers)を有効にします。ヘッダーのシーケンスの例：

``` text
X-ClickHouse-Progress: {"read_rows":"2752512","read_bytes":"240570816","total_rows_to_read":"8880128","elapsed_ns":"662334"}
X-ClickHouse-Progress: {"read_rows":"5439488","read_bytes":"482285394","total_rows_to_read":"8880128","elapsed_ns":"992334"}
X-ClickHouse-Progress: {"read_rows":"8783786","read_bytes":"819092887","total_rows_to_read":"8880128","elapsed_ns":"1232334"}
```

利用可能なヘッダーフィールド：

- `read_rows` — 読み取られた行数。
- `read_bytes` — 読み取られたデータのバイト数。
- `total_rows_to_read` — 読み取るべき行数の合計。
- `written_rows` — 書き込まれた行数。
- `written_bytes` — 書き込まれたデータのバイト数。

リクエストが実行中でHTTP接続が失われた場合、自動的に停止することはありません。解析とデータのフォーマットはサーバー側で行われ、ネットワークの使用は効果的でない場合があります。
オプショナルな'query_id'パラメーターをクエリID（任意の文字列）として渡すことができます。詳細については、「設定、実行中のクエリの置き換え」セクションを参照してください。

オプショナルな'quota_key'パラメーターをクォータキー（任意の文字列）として渡すことができます。詳細については、「クォータ」セクションを参照してください。

HTTPインターフェースでは、クエリのために外部データ（外部一時テーブル）を渡すことができます。詳細については、「クエリ処理のための外部データ」セクションを参照してください。
## レスポンスバッファリング {#response-buffering}

サーバー側でレスポンスバッファリングを有効にできます。これを目的とするために、`buffer_size`および`wait_end_of_query` URLパラメータが用意されています。`http_response_buffer_size` および `http_wait_end_of_query` 設定も使用できます。

`buffer_size`は、結果をサーバーメモリ内にバッファリングするバイト数を決定します。結果ボディがこのスレッショルドを超える場合、バッファはHTTPチャネルに書き込まれ、残りのデータはHTTPチャネルに直接送信されます。

レスポンス全体がバッファリングされることを保証するには、`wait_end_of_query=1`に設定します。この場合、メモリに保存されていないデータはサーバーの一時ファイルにバッファリングされます。

例:

``` bash
$ curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

バッファリングを使用して、クエリ処理エラーがレスポンスコードとHTTPヘッダーがクライアントに送信された後に発生する状況を避けることができます。この状況では、エラーメッセージがレスポンスボディの末尾に書き込まれ、クライアント側ではエラーが解析ステージでのみ検出されます。
## クエリパラメータでのロール設定 {#setting-role-with-query-parameters}

これはClickHouse 24.4で追加された新機能です。

特定のシナリオでは、ステートメント自体を実行する前に権限のあるロールを最初に設定する必要があります。しかし、`SET ROLE` とステートメントを同時に送信することはできません。これはマルチステートメントが許可されていないためです：

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

これによりエラーが発生します：

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

この制限を克服するために、代わりに`role`クエリパラメーターを使用できます：

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

これは、ステートメントの前に`SET ROLE my_role` を実行するのと同等になります。

さらに、複数の `role` クエリパラメーターを指定することも可能です：

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

この場合、`?role=my_role&role=my_other_role`は、ステートメントの前に`SET ROLE my_role, my_other_role`を実行するのと同じように機能します。
## HTTPレスポンスコードの注意事項 {#http_response_codes_caveats}

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

この動作の理由はHTTPプロトコルの性質です。HTTPヘッダーが最初にHTTPコード200として送信され、その後にHTTPボディが送信され、エラーがプレーンテキストとしてボディに挿入されます。この動作は、`Native`、`TSV`、または`JSON`いずれのフォーマットが使用されていても独立しており、エラーメッセージは常にレスポンスストリームの中間に存在します。
この問題を緩和するために、`wait_end_of_query=1`を有効にすることができます（[レスポンスバッファリング](#response-buffering)）。この場合、HTTPヘッダーの送信はクエリが完全に解決されるまで遅延します。しかし、これは問題を完全には解決しません、なぜなら結果はまだ`http_response_buffer_size`内に収まらなければならず、`send_progress_in_http_headers`などの他の設定がヘッダーの遅延に干渉する可能性があるからです。
すべてのエラーをキャッチする唯一の方法は、要求されたフォーマットを使用する前にHTTPボディを解析することです。
## パラメータ付きクエリ {#cli-queries-with-parameters}

パラメータ付きのクエリを作成し、対応するHTTPリクエストパラメータから値を渡すことができます。詳細については、[CLI用のパラメータ付きクエリ](../interfaces/cli.md#cli-queries-with-parameters)を参照してください。
### 例 {#example}

``` bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```
### URLパラメーターのタブ {#tabs-in-url-parameters}

クエリパラメータは「エスケープ」形式から解析されます。これは、NULLを`\N`としてあいまいなく解析する可能性などの利点があります。これを意味するのは、タブ文字を`\t`（または`\`とタブ）としてエンコードする必要があるということです。例えば、次のようなタブが`abc`と`123`の間に存在し、入力文字列が二つの値に分割されます：

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

しかし、実際のタブをURLパラメータで`%09`を使用してエンコードしようとすると、正しく解析されません：

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Value abc	123 cannot be parsed as String for query parameter 'arg1' because it isn't parsed completely: only 3 of 7 bytes was parsed: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

URLパラメータを使用する場合、`\t`を`%5C%09`としてエンコードする必要があります。それにより、次のように記述できます：

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```
## 事前定義されたHTTPインターフェース {#predefined_http_interface}

ClickHouseはHTTPインターフェースを通じて特定のクエリをサポートしています。例えば、次のようにテーブルにデータを書き込むことができます：

``` bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouseは事前定義されたHTTPインターフェースもサポートしており、[Prometheusエクスポーター](https://github.com/ClickHouse/clickhouse_exporter)などのサードパーティツールとの統合を容易にします。

例：

- まず、このセクションをサーバー設定ファイルに追加します：

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

- これで、Prometheus形式のデータを求めてURLに直接リクエストできるようになります：

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

設定がconfig.xmlファイルに行われていて、`http_handlers`が多数の`rules`を含むことに気づいたでしょう。ClickHouseは受信したHTTPリクエストを事前定義されたタイプに一致させ、最初に一致したルールがハンドラーを実行します。その後、ClickHouseは一致が成功すれば、それに応じた事前定義クエリを実行します。

今や、`rule`は`method`、`headers`、`url`、`handler`を設定することができます：
- `method`はHTTPリクエストのメソッド部分のマッチングを担当します。`method`はHTTPプロトコルの定義に完全に準拠します。[method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)はオプショナルな設定です。設定ファイルに定義されていない場合、HTTPリクエストのメソッド部分とは一致しません。

- `url`はHTTPリクエストのURL部分の一致を担当します。これは[RE2](https://github.com/google/re2)の正規表現と互換性があります。これはオプショナルな設定です。設定ファイルに定義されていない場合、HTTPリクエストのURL部分とは一致しません。

- `headers`はHTTPリクエストのヘッダー部分の一致を担当します。これはRE2の正規表現と互換性があります。これはオプショナルな設定です。設定ファイルに定義されていない場合、HTTPリクエストのヘッダー部分とは一致しません。

- `handler`は主な処理部分を含みます。現在、`handler`は`type`、`status`、`content_type`、`http_response_headers`、`response_content`、`query`、`query_param_name`を設定できます。
    `type`は現在、3つのタイプ：[predefined_query_handler](#predefined_query_handler)、[dynamic_query_handler](#dynamic_query_handler)、[static](#static)をサポートしています。

    - `query` — `predefined_query_handler`タイプで使用し、ハンドラーが呼び出されたときにクエリを実行します。

    - `query_param_name` — `dynamic_query_handler`タイプで使用し、HTTPリクエストパラメーター内の`query_param_name`に対応する値を抽出して実行します。

    - `status` — `static`タイプで使用し、レスポンスステータスコードです。

    - `content_type` — 任意のタイプで使用し、レスポンス[コンテンツタイプ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)です。

    - `http_response_headers` — 任意のタイプで使用し、レスポンスヘッダーのマップです。コンテンツタイプを設定するためにも使用できます。

    - `response_content` — `static`タイプで使用し、クライアントに送信されるレスポンスコンテンツです。`file://`または`config://`のプレフィックスを使用する場合は、クライアントに送信するファイルまたは設定からコンテンツを見つけます。

次に、異なる `type` の設定方法を示します。
### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler`は`Settings`と`query_params`の値を設定することをサポートしています。`predefined_query_handler`タイプの中で`query`を設定できます。

`query`の値は、HTTPリクエストが一致した場合にClickHouseが実行する`predefined_query_handler`の事前定義クエリです。これは必須の設定です。

次の例は、[max_threads](../operations/settings/settings.md#max_threads) と `max_final_threads` 設定の値を定義し、これらの設定が正常に設定されているかどうかをチェックするためにシステムテーブルをクエリします。

:::note
デフォルトの`handlers`（`query`、`play`、`ping`など）を保持するためには、`<defaults/>`ルールを追加してください。
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

``` bash
$ curl -H 'XXX:TEST_HEADER_VALUE' -H 'PARAMS_XXX:max_final_threads' 'http://localhost:8123/query_param_with_url/max_threads?max_threads=1&max_final_threads=2'
max_final_threads	2
max_threads	1
```

:::note
1つの`predefined_query_handler`内では、1つの`query`のみをサポートされます。
:::
### dynamic_query_handler {#dynamic_query_handler}

`dynamic_query_handler`では、クエリがHTTPリクエストのパラメーターの形で記述されます。これに対する違いは、`predefined_query_handler`ではクエリが設定ファイルに書かれているという点です。`dynamic_query_handler`で`query_param_name`を設定できます。

ClickHouseはHTTPリクエストのURL内の`query_param_name`に対応する値を抽出し、実行します。`query_param_name`のデフォルト値は`/query`です。これはオプショナルな設定です。設定ファイルに定義がない場合、このパラメーターは渡されません。

この機能を試してみるために、例では、[max_threads](../operations/settings/settings.md#max_threads)および`max_final_threads`の値を定義し、設定が正常に行われたかどうかを確認します。

例：

``` xml
<http_handlers>
    <rule>
    <headers>
        <XXX>TEST_HEADER_VALUE_DYNAMIC</XXX>
    </headers>
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
```yaml
title: '静的ハンドラ'
sidebar_label: '静的ハンドラ'
keywords: '静的ハンドラ, ClickHouse, HTTP, クエリ'
description: 'ClickHouseの静的ハンドラ設定の詳細。'
```

### static {#static}

`static` は [content_type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) 、[status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) および `response_content` を返すことができます。 `response_content` は指定されたコンテンツを返すことができます。

例:

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

`http_response_headers` は `content_type` の代わりにコンテンツタイプを設定するために使用できます。

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

クライアントに送信される構成からコンテンツを見つけます。

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

ファイルからクライアントに送信されるコンテンツを見つけます。

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
## Valid JSON/XML response on exception during HTTP streaming {#valid-output-on-exception-http-streaming}

HTTP 経由でクエリを実行中に、データの一部がすでに送信されているときに例外が発生することがあります。 通常、特定のデータ形式が出力データに使用された場合でも、プレーンテキストでクライアントに例外が送信され、出力が指定されたデータ形式の観点から無効になる場合があります。 これを防ぐために、`http_write_exception_in_output_format` 設定（デフォルトで有効）を使用すると、ClickHouse に指定された形式で例外を書き込むよう指示できます（現在、XMLおよびJSON形式でサポートされています）。

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
