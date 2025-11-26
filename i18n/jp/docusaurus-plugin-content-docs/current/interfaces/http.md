---
description: 'ClickHouse の HTTP インターフェイスに関するドキュメント。あらゆるプラットフォームおよびプログラミング言語から、REST
  API を通じて ClickHouse にアクセスできます'
sidebar_label: 'HTTP インターフェイス'
sidebar_position: 15
slug: /interfaces/http
title: 'HTTP インターフェイス'
doc_type: 'reference'
---

import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';


# HTTP インターフェース



## 前提条件 {#prerequisites}

この記事の例を実行するには、次のものが必要です：
- 稼働中の ClickHouse サーバーインスタンス
- `curl` がインストールされていること。Ubuntu または Debian では `sudo apt install curl` を実行するか、インストール手順については[こちらのドキュメント](https://curl.se/download.html)を参照してください。



## 概要

HTTP インターフェイスを使用すると、REST API の形であらゆるプラットフォームやプログラミング言語から ClickHouse を利用できます。HTTP インターフェイスはネイティブインターフェイスよりも機能面では制限がありますが、言語サポートは優れています。

デフォルトでは、`clickhouse-server` は次のポートで待ち受けます:

* HTTP 用にポート 8123
* HTTPS 用にポート 8443（有効化可能）

パラメーターなしで `GET /` リクエストを送信すると、文字列 &quot;Ok.&quot; とともにステータスコード 200 が返されます。

```bash
$ curl 'http://localhost:8123/'
Ok.
```

&quot;Ok.&quot; は、[`http_server_default_response`](../operations/server-configuration-parameters/settings.md#http_server_default_response) で定義されている既定値であり、必要に応じて変更できます。

あわせて [HTTP 応答コードに関する注意事項](#http_response_codes_caveats) も参照してください。


## Web ユーザーインターフェイス

ClickHouse には Web ユーザーインターフェイスが用意されており、以下のアドレスからアクセスできます。

```text
http://localhost:8123/play
```

Web UI は、クエリ実行中の進行状況の表示、クエリのキャンセル、結果のストリーミング表示をサポートしています。
また、クエリパイプラインに対してチャートやグラフを表示する隠し機能も備えています。

クエリが正常に実行されると、ダウンロードボタンが表示され、CSV、TSV、JSON、JSONLines、Parquet、Markdown など、または ClickHouse がサポートする任意のカスタムフォーマットでクエリ結果をダウンロードできます。ダウンロード機能はクエリキャッシュを利用して、クエリを再実行することなく効率的に結果を取得します。UI 上では多数あるページのうち 1 ページ分しか表示されていない場合でも、ダウンロードされるのは結果セット全体です。

Web UI は、あなたのようなプロフェッショナル向けに設計されています。

<Image img={PlayUI} size="md" alt="ClickHouse Web UI のスクリーンショット" />

ヘルスチェック用スクリプトでは `GET /ping` リクエストを使用してください。このハンドラーは常に &quot;Ok.&quot;（末尾に改行付き）を返します。バージョン 18.12.13 以降で利用可能です。レプリカの遅延を確認するには `/replicas_status` も参照してください。

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```


## HTTP/HTTPS でのクエリ実行

HTTP/HTTPS 経由でクエリを実行する方法は次の 3 つです。

* リクエストを URL の `query` パラメータとして送信する
* POST メソッドを使用する
* クエリの先頭部分を `query` パラメータで送り、残りを POST で送信する

:::note
URL のサイズはデフォルトで 1 MiB に制限されています。この値は `http_max_uri_size` 設定で変更できます。
:::

成功した場合は、ステータスコード 200 と、レスポンスボディ内に結果が返されます。
エラーが発生した場合は、ステータスコード 500 と、レスポンスボディ内にエラー内容のテキストが返されます。

GET を使用するリクエストは「読み取り専用」です。つまり、データを変更するクエリには POST メソッドしか使用できません。
クエリ自体は、POST ボディまたは URL パラメータのどちらかで送信できます。いくつか例を見てみましょう。

次の例では、curl を使用してクエリ `SELECT 1` を送信します。スペースを表す URL エンコード `%20` の使用に注意してください。

```bash title="command"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="Response"
1
```

この例では、`-nv`（非詳細）および `-O-` オプションを指定した wget を使用して、結果をターミナルに出力しています。
この場合、スペース文字に対して URL エンコードを使用する必要はありません。

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

ご覧のとおり、`curl` コマンドはスペース文字を URL エスケープしなければならないという点で、やや不便です。
`wget` は自動的にすべてをエスケープしてくれますが、keep-alive と Transfer-Encoding: chunked を使用した場合に HTTP/1.1 上でうまく動作しないため、使用は推奨しません。

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

クエリの一部がパラメータで送信され、別の一部が POST で送信される場合、これら 2 つのデータ部分の間に改行が挿入されます。
例えば、次のようなものは動作しません。

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: 構文エラー: 位置0で失敗: SEL
ECT 1
, 期待される値: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

デフォルトでは、データは [`TabSeparated`](/interfaces/formats/TabSeparated) 形式で返されます。

`FORMAT` 句は、クエリ内で別の形式での出力を指定するために使用します。例えば、次のように指定します。

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

`TabSeparated` 以外のデフォルトのフォーマットを指定するには、`default_format` URL パラメータまたは `X-ClickHouse-Format` ヘッダーを使用できます。

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

パラメータ化されたクエリには POST メソッドを使用できます。パラメータは、パラメータ名と型を波括弧で指定します。例えば `{name:Type}` のように記述します。パラメータ値は `param_name` として渡します。

```bash
$ curl -X POST -F 'query=select {p1:UInt8} + {p2:UInt8}' -F "param_p1=3" -F "param_p2=4" 'http://localhost:8123/'

7
```


## HTTP/HTTPS 経由での INSERT クエリ

`INSERT` クエリでは、データ送信に `POST` メソッドが必要です。この場合、クエリの先頭部分を URL パラメータに記述し、挿入するデータ本体を POST メソッドで送信できます。挿入するデータとしては、例えば MySQL からのタブ区切りダンプなどが利用できます。この方法では、`INSERT` クエリによって MySQL の `LOAD DATA LOCAL INFILE` と同等の処理を行えます。

### 例

テーブルを作成するには:

```bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

使い慣れた `INSERT` クエリでデータを挿入するには、次のようにします。

```bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

クエリとは別にデータを送信するには、次のようにします。

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

任意のデータフォーマットを指定できます。たとえば、`INSERT INTO t VALUES` と記述するときに使用するものと同じ「Values」フォーマットを指定できます。

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

タブ区切りダンプからデータを挿入するには、対応するフォーマットを指定してください。

```bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

テーブルの内容を確認するには、次のようにします：

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
並列クエリ処理のため、データはランダムな順序で出力されます
:::

テーブルを削除するには：

```bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

データテーブルを返さない成功したリクエストでは、空のレスポンスボディが返されます。


## 圧縮 {#compression}

大量のデータを送信する際のネットワークトラフィックを削減したり、その場で圧縮済みのダンプを作成したりするために、圧縮を使用できます。

データ送信時に、ClickHouse の内部圧縮フォーマットを使用できます。圧縮されたデータは独自フォーマットであり、これを扱うには `clickhouse-compressor` プログラムが必要です。これは `clickhouse-client` パッケージと共にデフォルトでインストールされます。 

データ挿入の効率を高めるには、[`http_native_compression_disable_checksumming_on_decompress`](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress) 設定を使用して、サーバー側のチェックサム検証を無効にします。

URL に `compress=1` を指定すると、サーバーは送信するデータを圧縮します。URL に `decompress=1` を指定すると、サーバーは `POST` メソッドで送信したデータを解凍します。

[HTTP 圧縮](https://en.wikipedia.org/wiki/HTTP_compression) を使用することもできます。ClickHouse は次の [圧縮方式](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens) をサポートしています。

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

圧縮された `POST` リクエストを送信するには、リクエストヘッダーに `Content-Encoding: compression_method` を追加します。

ClickHouse にレスポンスを圧縮させるには、リクエストに `Accept-Encoding: compression_method` ヘッダーを追加します。 

すべての圧縮方式に対して、[`http_zlib_compression_level`](../operations/settings/settings.md#http_zlib_compression_level) 設定を使用してデータ圧縮レベルを設定できます。

:::info
一部の HTTP クライアントは、デフォルトで（`gzip` および `deflate` を用いて）サーバーからのデータを自動的に解凍する場合があり、その場合は圧縮設定を正しく使用していても、解凍済みのデータを受け取ることがあります。
:::



## 例

圧縮データをサーバーに送信するには：

```bash
echo "SELECT 1" | gzip -c | \
curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

サーバーから圧縮されたデータアーカイブを受信するには：

```bash
curl -vsS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'

zcat result.gz
0
1
2
```

サーバーから圧縮データを受信し、展開されたデータを取得するには、gunzip を使用します。

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```


## デフォルトデータベース

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

既定では、サーバー設定で登録されているデータベースが既定のデータベースとして使用されます。インストール直後の状態では、これは `default` という名前のデータベースです。あるいは、テーブル名の前にドットを付けてデータベース名を明示的に指定することもできます。


## 認証

ユーザー名とパスワードは、次の3つの方法のいずれかで指定できます。

1. HTTP Basic 認証を使用する。

例：

```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. `user` および `password` を URL パラメータで指定する方法

:::warning
パラメータが Web プロキシでログに記録されたり、ブラウザにキャッシュされたりする可能性があるため、この方法は推奨しません
:::

例:

```bash
echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3. 「X-ClickHouse-User」ヘッダーと「X-ClickHouse-Key」ヘッダーを使用する

例：

```bash
echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

ユーザー名が指定されていない場合は、`default` というユーザー名が使用されます。パスワードが指定されていない場合は、空のパスワードが使用されます。
単一のクエリや設定プロファイル全体に対する任意の設定を指定するために、URL パラメータを使用することもできます。

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

* [設定](/operations/settings/settings)
* [SET](/sql-reference/statements/set)


## HTTP プロトコルでの ClickHouse セッションの使用

ClickHouse セッションは HTTP プロトコルでも使用できます。そのためには、リクエストに `session_id` の `GET` パラメータを追加する必要があります。セッション ID には任意の文字列を指定できます。

デフォルトでは、セッションは 60 秒間アクティビティがないと終了します。このタイムアウト値（秒）を変更するには、サーバー設定の `default_session_timeout` を変更するか、リクエストに `session_timeout` の `GET` パラメータを追加します。

セッションの状態を確認するには、`session_check=1` パラメータを指定します。1 つのセッション内で同時に実行できるクエリは 1 つだけです。

クエリの進行状況に関する情報は、`X-ClickHouse-Progress` レスポンスヘッダーで受け取ることができます。そのためには、[`send_progress_in_http_headers`](../operations/settings/settings.md#send_progress_in_http_headers) を有効にします。

以下にヘッダーのシーケンス例を示します。

```text
X-ClickHouse-Progress: {"read_rows":"261636","read_bytes":"2093088","total_rows_to_read":"1000000","elapsed_ns":"14050417","memory_usage":"22205975"}
X-ClickHouse-Progress: {"read_rows":"654090","read_bytes":"5232720","total_rows_to_read":"1000000","elapsed_ns":"27948667","memory_usage":"83400279"}
X-ClickHouse-Progress: {"read_rows":"1000000","read_bytes":"8000000","total_rows_to_read":"1000000","elapsed_ns":"38002417","memory_usage":"80715679"}
```

利用可能なヘッダーフィールドは次のとおりです。

| Header field         | Description         |
| -------------------- | ------------------- |
| `read_rows`          | 読み込まれた行数。           |
| `read_bytes`         | バイト単位での読み込みデータ量。    |
| `total_rows_to_read` | 読み取る予定の総行数。         |
| `written_rows`       | 書き込まれた行数。           |
| `written_bytes`      | バイト単位での書き込みデータ量。    |
| `elapsed_ns`         | ナノ秒単位のクエリ実行時間。      |
| `memory_usage`       | クエリで使用されたメモリ量（バイト）。 |

実行中のリクエストは、HTTP 接続が失われても自動的には停止しません。パース処理とデータのフォーマットはサーバー側で実行されるため、ネットワークの利用が非効率になる場合があります。

次のオプションパラメータが存在します。

| Parameters             | Description                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `query_id` (optional)  | クエリ ID として渡すことができます（任意の文字列）。 [`replace_running_query`](/operations/settings/settings#replace_running_query) |
| `quota_key` (optional) | クオータキーとして渡すことができます（任意の文字列）。 [「Quotas」](/operations/quotas)                                                  |

HTTP インターフェイスでは、クエリ用に外部データ（外部一時テーブル）を渡すことができます。詳細は [「External data for query processing」](/engines/table-engines/special/external-data) を参照してください。


## レスポンスのバッファリング

レスポンスのバッファリングはサーバー側で有効化できます。このために、次の URL パラメータが用意されています。

* `buffer_size`
* `wait_end_of_query`

次の設定を使用できます。

* [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
* [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

`buffer_size` は、サーバーメモリ内でバッファリングする結果のバイト数を指定します。レスポンスボディがこの閾値より大きい場合、バッファは HTTP チャネルに書き出され、残りのデータは直接 HTTP チャネルに送信されます。

レスポンス全体を確実にバッファリングするには、`wait_end_of_query=1` を設定します。この場合、メモリに保持されないデータはサーバー上の一時ファイルにバッファリングされます。

例:

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
バッファリングを使用して、レスポンスコードおよび HTTP ヘッダーがクライアントに送信された後にクエリの処理エラーが発生する状況を回避してください。このような場合、エラーメッセージはレスポンスボディの末尾に書き込まれ、クライアント側ではパース処理の段階になって初めてエラーを検知できます。
:::


## クエリパラメーターを使用してロールを設定する

この機能は ClickHouse 24.4 で追加されました。

特定のケースでは、ステートメント自体を実行する前に、付与されたロールを先に設定する必要がある場合があります。
ただし、マルチステートメントは許可されていないため、`SET ROLE` とステートメントをまとめて送信することはできません。

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

上記のコマンドを実行すると、エラーが発生します。

```sql
コード: 62. DB::Exception: 構文エラー (複数のステートメントは許可されていません)
```

この制限を回避するには、代わりに `role` クエリパラメータを使用してください。

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

これは、ステートメントの前に `SET ROLE my_role` を実行するのと同じ意味になります。

また、`role` クエリパラメータを複数指定することもできます。

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

この場合、`?role=my_role&role=my_other_role` は、ステートメントを実行する前に `SET ROLE my_role, my_other_role` を実行した場合と同様に動作します。


## HTTP レスポンスコードに関する注意点

HTTP プロトコルの制約上、HTTP 200 のレスポンスコードであっても、クエリが成功したことは保証されません。

以下に例を示します。

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: 'throwIf' 関数に渡された値が非ゼロです: 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))' の実行中
```

この動作が発生する理由は、HTTP プロトコルの性質によるものです。まず HTTP ヘッダーが HTTP ステータスコード 200 とともに送信され、その後に HTTP ボディが続き、そのボディの中にエラーがプレーンテキストとして差し込まれます。

この動作は使用されるフォーマット、つまり `Native`、`TSV`、`JSON` のいずれであっても変わらず、エラーメッセージは常にレスポンスストリームの途中に現れます。

この問題は、`wait_end_of_query=1`（[Response Buffering](#response-buffering)）を有効にすることで軽減できます。この場合、クエリ全体が完了するまで HTTP ヘッダーの送信が遅延されます。ただし、この方法でも問題は完全には解決されません。というのも、結果は依然として [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size) の範囲内に収まる必要があり、[`send_progress_in_http_headers`](/operations/settings/settings#send_progress_in_http_headers) などの他の設定がヘッダー送信の遅延と干渉し得るためです。

:::tip
すべてのエラーを確実に検出する唯一の方法は、必要なフォーマットでパースする前に HTTP ボディを解析することです。
:::

ClickHouse におけるこのような例外は、`http_write_exception_in_output_format=0`（デフォルト）の場合、使用されるフォーマット（`Native`、`TSV`、`JSON` など）に関係なく、以下のように一貫した例外フォーマットを持ちます。これにより、クライアント側でエラーメッセージをパースおよび抽出しやすくなります。

```text
\r\n
__exception__\r\n
<TAG>\r\n
<error message>\r\n
<message_length> <TAG>\r\n
__exception__\r\n

```

ここで `<TAG>` は 16 バイトのランダムなタグであり、`X-ClickHouse-Exception-Tag` レスポンスヘッダーで送信されるタグと同じです。
`<error message>` は実際の例外メッセージです（正確な長さは `<message_length>` で確認できます）。上で説明した例外ブロック全体のサイズは最大 16 KiB です。

`JSON` 形式での例を次に示します。

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

こちらは `CSV` 形式の同様の例です

```bash
$ curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)+FORMAT+CSV"
...
<
0,0
0,0
```


**例外**
rumfyutuqkncbgau
Code: 395. DB::Exception: `throwIf` 関数に渡された値がゼロ以外です: `FUNCTION throwIf(equals(__table1.number, 2_UInt8) :: 1) -> throwIf(equals(__table1.number, 2_UInt8)) UInt8 : 0` を実行中に発生しました。 (FUNCTION&#95;THROW&#95;IF&#95;VALUE&#95;IS&#95;NON&#95;ZERO) (version 25.11.1.1)
262 rumfyutuqkncbgau
**例外**

```
```


## パラメーター付きクエリ

パラメーター付きのクエリを作成し、対応する HTTP リクエストのパラメーターから値を渡すことができます。詳細については、[CLI 向けパラメーター付きクエリ](../interfaces/cli.md#cli-queries-with-parameters)を参照してください。

### 例

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```

### URL パラメータ内のタブ文字

クエリパラメータは「エスケープ」形式から解析されます。これには、`\N` を null としてあいまいさなく解析できるといった利点があります。これは、タブ文字は `\t`（または `\` とタブ文字）としてエンコードする必要があることを意味します。たとえば、次の例では `abc` と `123` の間に実際のタブ文字が含まれており、入力文字列は 2 つの値に分割されます。

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

しかし、URL パラメータで実際のタブ文字を `%09` としてエンコードしても、正しく解釈されません。

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: クエリパラメータ 'arg1' の値 abc    123 を String として解析できません。完全に解析されていないため: 7バイト中3バイトのみ解析されました: abc。(BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

URL パラメータを使用する場合は、`\t` を `%5C%09` にエンコードする必要があります。例：

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```


## あらかじめ定義された HTTP インターフェイス

ClickHouse は、HTTP インターフェイス経由で特定のクエリをサポートしています。たとえば、次のようにテーブルにデータを書き込むことができます。

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouse は、[Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter) のようなサードパーティツールとの連携を容易にする Predefined HTTP Interface もサポートしています。例を見てみましょう。

まず、このセクションをサーバー設定ファイルに追加します。

`http_handlers` には複数の `rule` を含めるように設定します。ClickHouse は受信した HTTP リクエストを `rule` で定義されたタイプと照合し、最初にマッチした `rule` のハンドラーが実行されます。その後、マッチに成功すると、ClickHouse は対応する事前定義クエリを実行します。

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

これで、Prometheus 形式のデータを取得するための URL を直接リクエストできます。


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


# HELP "Merge" "実行中のバックグラウンドマージ数"
# TYPE "Merge" counter
"Merge" 0



# HELP "PartMutation" "ミューテーション数 (ALTER DELETE/UPDATE)"
# TYPE "PartMutation" counter
"PartMutation" 0



# HELP "ReplicatedFetch" "レプリカから取得中のデータパーツ数"
# TYPE "ReplicatedFetch" counter
"ReplicatedFetch" 0



# HELP &quot;ReplicatedSend&quot; &quot;レプリカへ送信中のデータパーツ数&quot;

# TYPE &quot;ReplicatedSend&quot; counter

&quot;ReplicatedSend&quot; 0

* ホスト localhost への接続 #0 はそのまま維持されています

* ホスト localhost への接続 #0 はそのまま維持されています

```

`http_handlers`の設定オプションは以下のように動作します。

`rule`では以下のパラメータを設定できます:
- `method`
- `headers`
- `url`
- `full_url`
- `handler`

各パラメータについて以下で説明します:

- `method`はHTTPリクエストのメソッド部分のマッチングを担当します。`method`はHTTPプロトコルにおける[`method`]    
  (https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)の定義に完全に準拠しています。これはオプションの設定です。設定ファイルで定義されていない場合、HTTPリクエストのメソッド部分とはマッチングしません。

- `url`はHTTPリクエストのURL部分(パスとクエリ文字列)のマッチングを担当します。
  `url`に`regex:`のプレフィックスが付いている場合、[RE2](https://github.com/google/re2)の正規表現を使用します。
  これはオプションの設定です。設定ファイルで定義されていない場合、HTTPリクエストのURL部分とはマッチングしません。

- `full_url`は`url`と同様ですが、完全なURL、すなわち`schema://host:port/path?query_string`を含みます。
  注意: ClickHouseは「仮想ホスト」をサポートしていないため、`host`はIPアドレスです(`Host`ヘッダーの値ではありません)。

- `empty_query_string` - リクエストにクエリ文字列(`?query_string`)が存在しないことを保証します

- `headers`はHTTPリクエストのヘッダー部分のマッチングを担当します。RE2の正規表現と互換性があります。これはオプションの設定です。設定ファイルで定義されていない場合、HTTPリクエストのヘッダー部分とはマッチングしません。

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
  - `http_response_headers` — 任意のタイプで使用し、レスポンスヘッダーマップを指定します。コンテンツタイプの設定にも使用できます。
  - `response_content` — `static`タイプで使用し、クライアントに送信されるレスポンスコンテンツを指定します。プレフィックス'file://'または'config://'を使用する場合、ファイルまたは設定からコンテンツを取得してクライアントに送信します。
  - `user` - クエリを実行するユーザー(デフォルトユーザーは`default`)。
    **注意**: このユーザーのパスワードを指定する必要はありません。

異なる`type`の設定方法について次に説明します。

### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler`は`Settings`と`query_params`の値の設定をサポートします。`predefined_query_handler`タイプで`query`を設定できます。

`query`値は`predefined_query_handler`の事前定義されたクエリであり、HTTPリクエストがマッチしたときにClickHouseによって実行され、クエリの結果が返されます。これは必須の設定です。

以下の例では、[`max_threads`](../operations/settings/settings.md#max_threads)と[`max_final_threads`](/operations/settings/settings#max_final_threads)設定の値を定義し、その後システムテーブルをクエリしてこれらの設定が正常に設定されたかを確認します。

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
1つの `predefined_query_handler` では、1つの `query` のみがサポートされます。
:::

### dynamic&#95;query&#95;handler

`dynamic_query_handler` では、クエリは HTTP リクエストのパラメータとして記述されます。`predefined_query_handler` との違いは、後者ではクエリが設定ファイル内に記述される点です。`query_param_name` は `dynamic_query_handler` 内で設定できます。

ClickHouse は、HTTP リクエストの URL 内で `query_param_name` に対応する値を抽出して実行します。`query_param_name` のデフォルト値は `/query` です。これは省略可能な設定項目です。設定ファイル内に定義がない場合は、パラメータは渡されません。

この機能を試すために、次の例では [`max_threads`](../operations/settings/settings.md#max_threads) と `max_final_threads` の値を定義し、さらに設定が正しく反映されたかどうかを確認する `query` を実行します。

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

### static

`static` は [`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)、[status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)、および `response_content` を返すことができます。`response_content` で指定したコンテンツを返せます。

たとえば、&quot;Say Hi!&quot; というメッセージを返すには次のようにします。

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

`content_type` の代わりに `http_response_headers` を使用して Content-Type を設定できます。


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
                <response_content>こんにちは！</response_content>
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

クライアントに送信される設定内容を特定します。

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

クライアントに送信したファイル内の内容を確認するには、次のようにします。


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
$ sudo echo "<html><body>相対パスファイル</body></html>" > $user_files_path/relative_path_file.html
$ sudo echo "<html><body>絶対パスファイル</body></html>" > $user_files_path/absolute_path_file.html
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
<html><body>絶対パスファイル</body></html>
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
<html><body>相対パスファイル</body></html>
* Connection #0 to host localhost left intact
```

### redirect

`redirect` は `location` へ `302` リダイレクトを行います。

例えば、ClickHouse play でユーザーを自動的に `play` に設定するには次のようにします。

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


## HTTP レスポンスヘッダー

ClickHouse では、設定可能なあらゆる種類のハンドラーに適用できるカスタム HTTP レスポンスヘッダーを設定できます。これらのヘッダーは、ヘッダー名とその値を表すキーと値のペアを指定する `http_response_headers` 設定を使用して設定します。この機能は、カスタムセキュリティヘッダーや CORS ポリシー、その他 ClickHouse の HTTP インターフェイス全体で必要となる HTTP ヘッダー要件を実装するのに特に有用です。

たとえば、次のような対象にヘッダーを設定できます:

* 通常のクエリエンドポイント
* Web UI
* ヘルスチェック

また、`common_http_response_headers` を指定することも可能です。これらは、設定で定義されたすべての HTTP ハンドラーに適用されます。

ヘッダーは、設定されたすべてのハンドラーに対する HTTP レスポンスに含まれます。

以下の例では、すべてのサーバーレスポンスに `X-My-Common-Header` と `X-My-Custom-Header` という 2 つのカスタムヘッダーが含まれます。

```xml
<clickhouse>
    <http_handlers>
        <common_http_response_headers>
            <X-My-Common-Header>共通ヘッダー</X-My-Common-Header>
        </common_http_response_headers>
        <rule>
            <methods>GET</methods>
            <url>/ping</url>
            <handler>
                <type>ping</type>
                <http_response_headers>
                    <X-My-Custom-Header>カスタムヘッダー</X-My-Custom-Header>
                </http_response_headers>
            </handler>
        </rule>
    </http_handlers>
</clickhouse>
```


## HTTP ストリーミング中の例外発生時における有効な JSON/XML レスポンス

クエリが HTTP 経由で実行されている間に、データの一部がすでに送信された後で例外が発生することがあります。通常、例外はプレーンテキストとしてクライアントに送信されます。
特定のデータフォーマットを使用してデータを出力している場合、そのフォーマットの観点から出力が不正になってしまう可能性があります。
これを防ぐには、ClickHouse に例外を指定したフォーマットで書き出すよう指示する設定 [`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format)（デフォルトでは無効）を使用できます（現在は XML および JSON* フォーマットでサポートされています）。

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
