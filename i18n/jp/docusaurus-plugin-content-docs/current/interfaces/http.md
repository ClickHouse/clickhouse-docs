---
'description': 'ClickHouse の HTTP インターフェースに関する Documentation で、あらゆるプラットフォームおよびプログラミング言語から
  ClickHouse への REST API アクセスを提供しています。'
'sidebar_label': 'HTTP インターフェース'
'sidebar_position': 15
'slug': '/interfaces/http'
'title': 'HTTP インターフェース'
'doc_type': 'reference'
---

import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';



# HTTP インターフェース

## 前提条件 {#prerequisites}

この記事の例を実行するには、以下が必要です：
- ClickHouseサーバーの実行インスタンスを持っていること
- `curl` がインストールされていること。UbuntuまたはDebianでは、`sudo apt install curl`を実行するか、この [ドキュメント](https://curl.se/download.html) を参照してインストール手順を確認してください。

## 概要 {#overview}

HTTPインターフェースを使用すると、任意のプラットフォームから任意のプログラミング言語を使用して、REST APIの形式でClickHouseを使用できます。HTTPインターフェースはネイティブインターフェースよりも制限がありますが、言語サポートが優れています。

デフォルトでは、`clickhouse-server` は以下のポートで待機しています：
- ポート8123はHTTP用
- ポート8443はHTTPS用で有効にできます

パラメータなしで `GET /` リクエストを行うと、200のレスポンスコードと共に文字列 "Ok." が返されます：

```bash
$ curl 'http://localhost:8123/'
Ok.
```

"Ok." は[`http_server_default_response`](../operations/server-configuration-parameters/settings.md#http_server_default_response) に定義されたデフォルト値で、必要に応じて変更できます。

また、[HTTPレスポンスコードの注意点](#http_response_codes_caveats)も参照してください。

## Webユーザーインターフェース {#web-ui}

ClickHouseにはWebユーザーインターフェースが含まれており、以下のアドレスからアクセスできます：

```text
http://localhost:8123/play
```

Web UIはクエリ実行中の進捗表示、クエリキャンセル、結果ストリーミングをサポートしています。
クエリパイプラインのためのチャートとグラフを表示する秘密の機能があります。

Web UIはあなたのようなプロフェッショナルのために設計されています。

<Image img={PlayUI} size="md" alt="ClickHouse Web UIのスクリーンショット" />

ヘルスチェックスクリプトでは `GET /ping` リクエストを使用します。このハンドラーは常に "Ok."（末尾に改行がある）を返します。バージョン18.12.13から利用可能です。レプリカの遅延をチェックするために `/replicas_status` も参照してください。

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```

## HTTP/HTTPS経由のクエリ {#querying}

HTTP/HTTPS経由でクエリを実行するには、3つのオプションがあります：
- リクエストをURLの 'query' パラメータとして送信する
- POSTメソッドを使用する
- クエリの冒頭を 'query' パラメータで送り、残りをPOSTで送信する

:::note
URLのサイズはデフォルトで1 MiBに制限されています。この制限は `http_max_uri_size` 設定で変更できます。
:::

成功した場合、200のレスポンスコードとともにレスポンスボディに結果が返されます。
エラーが発生した場合、500のレスポンスコードとともにレスポンスボディにエラーの説明テキストが返されます。

GETを使用するリクエストは「読み取り専用」です。これは、データを変更するクエリにはPOSTメソッドを使用できることを意味します。 
クエリそのものはPOSTボディまたはURLパラメータのいずれかで送信できます。いくつかの例を見てみましょう。

以下の例では、`curl`を使用して `SELECT 1` のクエリを送信します。スペースにはURLエンコーディングが必要です： `%20`。

```bash title="command"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="Response"
1
```

この例では `wget` を `-nv`（ノンバーバス）および `-O-` パラメータと共に使用して結果を端末に出力しています。
この場合、スペースのためにURLエンコーディングを使用する必要はありません：

```bash title="command"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
```

```response
1
```

この例では生のHTTPリクエストをnetcatにパイプしています：

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

ご覧のように、`curl` コマンドはスペースをURLエスケープする必要があるため、いくらか不便です。
ただし、`wget`はすべてを自動的にエスケープしますが、HTTP 1.1でkeep-aliveおよびTransfer-Encoding: chunkedを使用する際に正しく機能しないため、使用を推奨しません。

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

クエリの一部がパラメータで送信され、残りがPOSTで送信されると、これら二つのデータ部分の間に改行が挿入されます。
例えば、これは動作しません：

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

デフォルトでは、データは [`TabSeparated`](formats.md#tabseparated) 形式で返されます。

クエリ内の `FORMAT` 句を使用して、他の形式を要求できます。例えば：

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

`default_format` URLパラメータまたは `X-ClickHouse-Format` ヘッダーを使用して、`TabSeparated` 以外のデフォルト形式を指定できます。

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

パラメータ化クエリとともにPOSTメソッドを使用できます。パラメータは、パラメータ名とタイプを持つ中括弧を使用して指定します。たとえば、`{name:Type}` のようになります。パラメータの値は `param_name` で渡されます：

```bash
$ curl -X POST -F 'query=select {p1:UInt8} + {p2:UInt8}' -F "param_p1=3" -F "param_p2=4" 'http://localhost:8123/'

7
```

## HTTP/HTTPS経由の挿入クエリ {#insert-queries}

データを送信するには、`INSERT` クエリには `POST` メソッドが必要です。この場合、クエリの冒頭をURLパラメータで書き、挿入するデータをPOSTで渡すことができます。挿入するデータは、たとえばMySQLからのタブ区切りダンプである可能性があります。このやり方で、`INSERT` クエリはMySQLの `LOAD DATA LOCAL INFILE` を置き換えます。

### 例 {#examples}

テーブルを作成するには：

```bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

馴染み深い `INSERT` クエリを使用してデータを挿入するには：

```bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

クエリからデータを別々に送信するには：

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

任意のデータ形式を指定できます。たとえば、'Values'形式、`INSERT INTO t VALUES` のときに使用される形式を指定できます：

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

タブ区切りダンプからデータを挿入するには、対応する形式を指定します：

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
データは並行クエリ処理のためランダムな順序で出力されます
:::

テーブルを削除するには：

```bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

データテーブルを返さない成功したリクエストには、空のレスポンスボディが返されます。

## 圧縮 {#compression}

圧縮は、大量のデータを送信する際のネットワークトラフィックを削減するために使用したり、即座に圧縮されるダンプを作成するために使用できます。

データを送信する際、内部のClickHouse圧縮フォーマットを使用できます。圧縮されたデータは非標準フォーマットであり、`clickhouse-compressor`プログラムが必要です。これはデフォルトで `clickhouse-client` パッケージにインストールされています。

データ挿入の効率を高めるために、[`http_native_compression_disable_checksumming_on_decompress`](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress) 設定を使用してサーバー側のチェックサム検証を無効にします。

URLに `compress=1` を指定すると、サーバーは送信するデータを圧縮します。URLに `decompress=1` を指定すると、サーバーは `POST` メソッドで渡されたデータを解凍します。

[HTTP圧縮](https://en.wikipedia.org/wiki/HTTP_compression) を使用することも選択できます。ClickHouseは以下の[圧縮メソッド](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens)をサポートしています：

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

圧縮された `POST` リクエストを送信するには、リクエストヘッダー `Content-Encoding: compression_method` を追加します。

ClickHouseがレスポンスを圧縮するようにするには、[`enable_http_compression`](../operations/settings/settings.md#enable_http_compression) 設定で圧縮を有効にし、リクエストに `Accept-Encoding: compression_method` ヘッダーを追加します。

すべての圧縮メソッドのデータ圧縮レベルは、[`http_zlib_compression_level`](../operations/settings/settings.md#http_zlib_compression_level) 設定を使用して構成できます。

:::info
一部のHTTPクライアントは、デフォルトでサーバーからデータを解凍する場合があります（`gzip`や`deflate`で）と、圧縮設定を正しく使用しても解凍されたデータを受け取ることがあります。
:::

## 例 {#examples-compression}

サーバーに圧縮データを送信するには：

```bash
echo "SELECT 1" | gzip -c | \
curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

サーバーから圧縮されたデータアーカイブを受け取るには：

```bash
curl -vsS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'

zcat result.gz
0
1
2
```

gunzipを使用してサーバーから圧縮データを受け取るには：

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```

## デフォルトデータベース {#default-database}

`database` URLパラメータまたは `X-ClickHouse-Database` ヘッダーを使用してデフォルトデータベースを指定できます。

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

デフォルトでは、サーバー設定で登録されたデータベースがデフォルトデータベースとして使用されます。初期設定では `default` という名前のデータベースです。あるいは、テーブル名の前にドットをつけて常にデータベースを指定することもできます。

## 認証 {#authentication}

ユーザー名とパスワードは、以下のいずれかの方法で指定できます：

1. HTTP基本認証を使用する。

   例：

   ```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. `user` および `password` URLパラメータで

   :::warning
   このメソッドは推奨されません。パラメータはWebプロキシによってログに記録されたり、ブラウザにキャッシュされる可能性があります。
   :::

   例：

   ```bash
echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3. 'X-ClickHouse-User' と 'X-ClickHouse-Key' ヘッダーを使用する

   例：

   ```bash
echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

ユーザー名が指定されていない場合、`default` という名前が使用されます。パスワードが指定されていない場合、空のパスワードが使用されます。
また、URLパラメータを使用して、単一のクエリの処理または設定プロファイル全体のための設定を指定することもできます。

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

詳細情報は以下を参照してください：
- [設定](/operations/settings/settings)
- [SET](/sql-reference/statements/set)

## HTTPプロトコル内でのClickHouseセッションの使用 {#using-clickhouse-sessions-in-the-http-protocol}

HTTPプロトコル内でClickHouseセッションを使用することもできます。これを行うには、リクエストに `session_id` `GET` パラメータを追加する必要があります。任意の文字列をセッションIDとして使用できます。

デフォルトでは、セッションは60秒の非アクティビティの後に終了します。このタイムアウト（秒）を変更するには、サーバー設定内の `default_session_timeout` 設定を変更するか、リクエストに `session_timeout` `GET` パラメータを追加します。

セッションの状態を確認するには、`session_check=1` パラメータを使用します。一度に1クエリしか実行できません。

クエリの進捗情報は、`X-ClickHouse-Progress` レスポンスヘッダーで受け取ることができます。これを行うには、[`send_progress_in_http_headers`](../operations/settings/settings.md#send_progress_in_http_headers) を有効にしてください。

以下はヘッダーシーケンスの例です：

```text
X-ClickHouse-Progress: {"read_rows":"2752512","read_bytes":"240570816","total_rows_to_read":"8880128","elapsed_ns":"662334"}
X-ClickHouse-Progress: {"read_rows":"5439488","read_bytes":"482285394","total_rows_to_read":"8880128","elapsed_ns":"992334"}
X-ClickHouse-Progress: {"read_rows":"8783786","read_bytes":"819092887","total_rows_to_read":"8880128","elapsed_ns":"1232334"}
```

可能なヘッダーフィールドは次のとおりです：

| ヘッダーフィールド         | 説明                             |
|----------------------------|---------------------------------|
| `read_rows`                | 読み取った行数。                |
| `read_bytes`               | 読み取ったデータのバイト数。     |
| `total_rows_to_read`       | 読み取る総行数。                |
| `written_rows`             | 書き込まれた行数。              |
| `written_bytes`            | 書き込まれたデータのバイト数。   |

HTTP接続が失われた場合、実行中のリクエストは自動的に停止しません。解析とデータフォーマットはサーバー側で行われ、ネットワークの使用は効果的でない場合があります。

以下のオプションのパラメータがあります：

| パラメータ                | 説明                                     |
|---------------------------|-----------------------------------------|
| `query_id`（オプション） | クエリIDとして渡すことができます（任意の文字列）。 [`replace_running_query`](/operations/settings/settings#replace_running_query) |
| `quota_key`（オプション）| クオータキーとして渡すことができます（任意の文字列）。 ["クオータ"](/operations/quotas)   |

HTTPインターフェースは、クエリのために外部データ（外部一時テーブル）を渡すことを許可します。詳細は、["クエリ処理のための外部データ"](/engines/table-engines/special/external-data)を参照してください。

## レスポンスバッファリング {#response-buffering}

レスポンスバッファリングはサーバー側で有効にできます。これを目的とした以下のURLパラメータが提供されています：
- `buffer_size`
- `wait_end_of_query`

以下の設定が使用されます：
- [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
- [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

`buffer_size`は、サーバーメモリ内でバッファリングする結果のバイト数を決定します。この閾値を超える結果ボディがある場合、バッファはHTTPチャネルに書き込まれ、残りのデータは直接HTTPチャネルに送信されます。

応答全体がバッファリングされるようにするには、`wait_end_of_query=1`を設定します。この場合、メモリに保存されていないデータは一時サーバーファイルにバッファリングされます。

例えば：

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
バッファリングを使用して、レスポンスコードとHTTPヘッダーがクライアントに送信された後にクエリ処理エラーが発生する状況を避けます。この状況では、エラーメッセージがレスポンスボディの最後に書き込まれ、クライアント側ではエラーが解析段階でしか検出できません。
:::

## クエリパラメータでロールを設定する {#setting-role-with-query-parameters}

この機能はClickHouse 24.4で追加されました。

特定のシナリオでは、ステートメントを実行する前に付与されたロールを最初に設定する必要があります。
ただし、`SET ROLE` とステートメントを同時に送信することはできません。複数ステートメントは許可されていません：

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

上記のコマンドはエラーになります：

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

この制限を克服するためには、代わりに `role` クエリパラメータを使用してください：

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

これは、ステートメントの前に `SET ROLE my_role` を実行するのと同じです。

さらに、複数の `role` クエリパラメータを指定することもできます：

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

この場合、`?role=my_role&role=my_other_role` は、ステートメントの前に `SET ROLE my_role, my_other_role` を実行するのと同様に機能します。

## HTTPレスポンスコードの注意点 {#http_response_codes_caveats}

HTTPプロトコルの制限により、HTTP 200のレスポンスコードはクエリが成功したことを保証しません。

以下はその例です：

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

この挙動の理由はHTTPプロトコルの性質です。HTTPヘッダーが最初にHTTPコード200で送信され、その後HTTPボディが続き、エラーがプレーンテキストとしてボディに注入されます。

この挙動は、使用される形式が `Native`、`TSV`、`JSON` のいずれであっても独立しており、エラーメッセージは常にレスポンスストリームの途中に存在します。

この問題を軽減するには、`wait_end_of_query=1` を有効にします（[レスポンスバッファリング](#response-buffering)）。この場合、HTTPヘッダーの送信はクエリ全体が解決されるまで遅延されます。しかし、これは完全には問題を解決しません。結果は依然として [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size) 内に収まる必要があり、[`send_progress_in_http_headers`](/operations/settings/settings#http_send_progress_in_http_headers) のような他の設定はヘッダーの遅延に干渉する可能性があります。

:::tip
すべてのエラーをキャッチする唯一の方法は、解析する前にHTTPボディを分析することです。
:::

## パラメータ付きクエリ {#cli-queries-with-parameters}

パラメータ付きクエリを作成し、それに対する値を対応するHTTPリクエストパラメータから渡すことができます。詳細については、[CLIのパラメータ付きクエリ](../interfaces/cli.md#cli-queries-with-parameters)を参照してください。

### 例 {#example-3}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```

### URLパラメータ内のタブ {#tabs-in-url-parameters}

クエリパラメータは「エスケープされた」形式から解析されます。これにはいくつかの利点があり、`null` を明確に解析する可能性があります。これは、タブ文字が `\t`（または `\` とタブ）としてエンコードされる必要があることを意味します。例えば、次の例では `abc` と `123` の間に実際のタブがあり、入力文字列が2つの値に分割されます：

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

ただし、URLパラメータ内で `%09` を使用して実際のタブをエンコードしようとすると、正しく解析されません：

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Value abc    123 cannot be parsed as String for query parameter 'arg1' because it isn't parsed completely: only 3 of 7 bytes was parsed: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

URLパラメータを使用する場合、`\t` を `%5C%09` としてエンコードする必要があります。例えば：

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```

## 事前定義されたHTTPインターフェース {#predefined_http_interface}

ClickHouseはHTTPインターフェースを通じて特定のクエリをサポートしています。例えば、次のようにテーブルにデータを書き込むことができます：

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouseはまた、[Prometheusエクスポータ](https://github.com/ClickHouse/clickhouse_exporter)のようなサードパーティツールとより容易に統合できる事前定義されたHTTPインターフェースをサポートしています。例を見てみましょう。

まず最初に、サーバー設定ファイルにこのセクションを追加します。

`http_handlers` は複数の `rule` を含むように設定されています。ClickHouseは受信したHTTPリクエストを `rule`内の事前定義されたタイプと一致させ、最初に一致したルールがハンドラーを実行します。次に、マッチが成功した場合、ClickHouseは対応する事前定義されたクエリを実行します。

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

これで、Prometheus形式でデータを直接リクエストできます：

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

`http_handlers`の構成オプションは次のように機能します。

`rule` は以下のパラメータを設定できます：
- `method`
- `headers`
- `url`
- `full_url`
- `handler`

これらの各パラメータについては以下のように説明します：

- `method` はHTTPリクエストのメソッド部分と一致させる役割を担います。`method` はHTTPプロトコルでの[`method`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)の定義に完全に準拠しています。これはオプショナル設定です。設定ファイルに定義がない場合、HTTPリクエストのメソッド部分とは一致しません。

- `url` はHTTPリクエストのURL部分（パスおよびクエリ文字列）と一致させる役割を担います。
  `url` が `regex:` で始まる場合、[RE2](https://github.com/google/re2)の正規表現を期待します。
  これはオプショナル設定です。設定ファイルに定義がない場合、HTTPリクエストのURL部分とは一致しません。

- `full_url` は `url` と同じですが、完全なURLを含みます。つまり、`schema://host:port/path?query_string`です。
  注意：ClickHouseは「仮想ホスト」をサポートしていませんので、`host` はIPアドレスであり、`Host` ヘッダーの値ではありません。

- `empty_query_string` - リクエストにクエリ文字列（`?query_string`）がないことを保証します

- `headers` はHTTPリクエストのヘッダー部分と一致させる役割を担います。RE2の正規表現と互換性があります。これはオプショナル設定です。設定ファイルに定義がない場合、HTTPリクエストのヘッダー部分とは一致しません。

- `handler` にはメイン処理部分が含まれます。

  次の `type` を持つことができます：
  - [`predefined_query_handler`](#predefined_query_handler)
  - [`dynamic_query_handler`](#dynamic_query_handler)
  - [`static`](#static)
  - [`redirect`](#redirect)

  次のパラメータがあります：
  - `query` — `predefined_query_handler` タイプで使用し、ハンドラーが呼び出されたときにクエリを実行します。
  - `query_param_name` — `dynamic_query_handler` タイプで使用し、HTTPリクエストパラメータ内の`query_param_name`値に対応する値を抽出して実行します。
  - `status` — `static` タイプで使用し、レスポンスステータスコードを設定します。
  - `content_type` — いずれのタイプでも使用し、レスポンスの[Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)を設定します。
  - `http_response_headers` — いずれのタイプでも使用し、レスポンスヘッダーのマップを設定します。これによりコンテンツタイプを設定することもできます。
  - `response_content` — `static` タイプで使用し、クライアントに送信されるレスポンスコンテンツです。`file://` または `config://` 接頭辞を使用する場合、ファイルまたは設定からコンテンツを見つけてクライアントに送信します。
  - `user` - クエリを実行するユーザー（デフォルトユーザーは `default` です）。
    **注意**：このユーザーのパスワードを指定する必要はありません。

さまざまな `type` の構成メソッドについては、次のように説明します。

### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler` は `Settings` と `query_params` の値を設定することをサポートしています。`predefined_query_handler` のタイプで `query` を設定できます。

`query` の値は `predefined_query_handler` の事前定義されたクエリであり、HTTPリクエストが一致したときにClickHouseによって実行され、その結果が返されます。これは必須の構成です。

以下の例では、[`max_threads`](../operations/settings/settings.md#max_threads) および [`max_final_threads`](/operations/settings/settings#max_final_threads) 設定の値を定義し、これらの設定が正しく設定されたかどうかを確認するためにシステムテーブルをクエリしています。

:::note
`query`、`play`、`ping`などのデフォルトの `handlers` を保持するには、 `<defaults/>` ルールを追加します。
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

:::note
1つの `predefined_query_handler` では1つの `query` のみがサポートされています。
:::

### dynamic_query_handler {#dynamic_query_handler}

`dynamic_query_handler` では、クエリがHTTPリクエストのパラメータとして書かれます。違いは、`predefined_query_handler` ではクエリが設定ファイルに書かれるということです。`query_param_name` は `dynamic_query_handler` で設定できます。

ClickHouseはHTTPリクエストのURL内の `query_param_name`の値に対応する値を抽出して実行します。`query_param_name` のデフォルト値は `/query` です。これはオプショナル設定です。設定ファイルに定義がない場合、そのパラメータは渡されません。

この機能を試すために、次の例では、[`max_threads`](../operations/settings/settings.md#max_threads) および `max_final_threads` 設定の値を定義し、設定が正しく設定されたかどうかを確認します。

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

`static` は[`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)、[status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)、および `response_content` を返すことができます。`response_content` は指定されたコンテンツを返すことができます。

たとえば、「Say Hi!」というメッセージを返すには：

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

設定からクライアントに送信するためのコンテンツを見つけることができます。

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

ファイルからクライアントに送信するためのコンテンツを見つけるには：

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

### redirect {#redirect}

`redirect` は `location` への `302` リダイレクトを行います。

たとえば、ClickHouse playのためにユーザーを自動的に `play` に追加する方法は次のとおりです：

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

ClickHouseは、設定可能な任意の種類のハンドラーに適用できるカスタムHTTPレスポンスヘッダーを設定することを許可します。これらのヘッダーは、ヘッダー名とその値を表すキーバリューペアを受け入れる `http_response_headers` 設定を使用して設定できます。この機能は、カスタムセキュリティヘッダー、CORSポリシー、またはClickHouse HTTPインターフェース全体にわたるその他のHTTPヘッダー要件を実装するのに特に便利です。

たとえば、以下のようなヘッダーを設定できます：
- 通常のクエリエンドポイント
- Web UI
- ヘルスチェック。

`common_http_response_headers` を指定することも可能です。これらは、設定されたすべてのHTTPハンドラーに適用されます。

設定されたすべてのハンドラーのHTTPレスポンスにヘッダーが含まれます。

以下の例では、すべてのサーバーレスポンスに `X-My-Common-Header` と `X-My-Custom-Header` の2つのカスタムヘッダーが含まれます。

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

## HTTPストリーミング中の例外時の有効なJSON/XMLレスポンス {#valid-output-on-exception-http-streaming}

クエリ実行中にHTTP経由で部分的にデータが送信されると例外が発生することがあります。通常、例外はプレーンテキストでクライアントに送信されます。
指定されたデータ形式が使用され、出力がその形式に関して無効になる可能性があります。
これを防ぐために、[`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format) 設定（デフォルトで有効）を使用すると、ClickHouseが指定された形式で例外を書き込むようになります（現在XMLおよびJSON形式でサポートされています）。

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
