---
description: 'ClickHouse の gRPC インターフェースに関するドキュメント'
sidebar_label: 'gRPC インターフェース'
sidebar_position: 25
slug: /interfaces/grpc
title: 'gRPC インターフェース'
doc_type: 'reference'
---



# gRPC インターフェース



## はじめに {#grpc-interface-introduction}

ClickHouseは[gRPC](https://grpc.io/)インターフェースをサポートしています。gRPCは、HTTP/2と[Protocol Buffers](https://en.wikipedia.org/wiki/Protocol_Buffers)を使用するオープンソースのリモートプロシージャコールシステムです。ClickHouseのgRPC実装は以下の機能をサポートしています:

- SSL
- 認証
- セッション
- 圧縮
- 同一チャネルを通じた並列クエリ
- クエリのキャンセル
- 進捗状況とログの取得
- 外部テーブル

インターフェースの仕様は[clickhouse_grpc.proto](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto)に記載されています。


## gRPC設定 {#grpc-interface-configuration}

gRPCインターフェースを使用するには、メインの[サーバー設定](../operations/configuration-files.md)で`grpc_port`を設定します。その他の設定オプションについては、以下の例を参照してください:

```xml
<grpc_port>9100</grpc_port>
    <grpc>
        <enable_ssl>false</enable_ssl>

        <!-- 以下の2つのファイルはSSLが有効な場合にのみ使用されます -->
        <ssl_cert_file>/path/to/ssl_cert_file</ssl_cert_file>
        <ssl_key_file>/path/to/ssl_key_file</ssl_key_file>

        <!-- サーバーがクライアントに証明書を要求するかどうか -->
        <ssl_require_client_auth>false</ssl_require_client_auth>

        <!-- 以下のファイルはssl_require_client_auth=trueの場合にのみ使用されます -->
        <ssl_ca_cert_file>/path/to/ssl_ca_cert_file</ssl_ca_cert_file>

        <!-- デフォルトの圧縮アルゴリズム(クライアントが別のアルゴリズムを指定しない場合に適用されます。QueryInfoのresult_compressionを参照)。
             サポートされているアルゴリズム: none, deflate, gzip, stream_gzip -->
        <compression>deflate</compression>

        <!-- デフォルトの圧縮レベル(クライアントが別のレベルを指定しない場合に適用されます。QueryInfoのresult_compressionを参照)。
             サポートされているレベル: none, low, medium, high -->
        <compression_level>medium</compression_level>

        <!-- 送受信メッセージサイズの制限(バイト単位)。-1は無制限を意味します -->
        <max_send_message_size>-1</max_send_message_size>
        <max_receive_message_size>-1</max_receive_message_size>

        <!-- 詳細なログを取得する場合は有効にします -->
        <verbose_logs>false</verbose_logs>
    </grpc>
```


## 組み込みクライアント {#grpc-client}

提供されている[仕様](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto)を使用して、gRPCがサポートする任意のプログラミング言語でクライアントを作成できます。
または、組み込みのPythonクライアントを使用することもできます。これはリポジトリの[utils/grpc-client/clickhouse-grpc-client.py](https://github.com/ClickHouse/ClickHouse/blob/master/utils/grpc-client/clickhouse-grpc-client.py)に配置されています。組み込みクライアントには[grpcioおよびgrpcio-tools](https://grpc.io/docs/languages/python/quickstart) Pythonモジュールが必要です。

クライアントは以下の引数をサポートしています:

- `--help` – ヘルプメッセージを表示して終了します。
- `--host HOST, -h HOST` – サーバー名。デフォルト値: `localhost`。IPv4またはIPv6アドレスも使用できます。
- `--port PORT` – 接続先のポート。このポートはClickHouseサーバー設定で有効にする必要があります(`grpc_port`を参照)。デフォルト値: `9100`。
- `--user USER_NAME, -u USER_NAME` – ユーザー名。デフォルト値: `default`。
- `--password PASSWORD` – パスワード。デフォルト値: 空文字列。
- `--query QUERY, -q QUERY` – 非対話モード使用時に処理するクエリ。
- `--database DATABASE, -d DATABASE` – デフォルトデータベース。指定されていない場合、サーバー設定で設定されている現在のデータベースが使用されます(デフォルトでは`default`)。
- `--format OUTPUT_FORMAT, -f OUTPUT_FORMAT` – 結果出力[形式](formats.md)。対話モードのデフォルト値: `PrettyCompact`。
- `--debug` – デバッグ情報の表示を有効にします。

対話モードでクライアントを実行するには、`--query`引数なしで呼び出します。

バッチモードでは、クエリデータを`stdin`経由で渡すことができます。

**クライアント使用例**

以下の例では、テーブルを作成し、CSVファイルからデータを読み込みます。その後、テーブルの内容をクエリします。

```bash
./clickhouse-grpc-client.py -q "CREATE TABLE grpc_example_table (id UInt32, text String) ENGINE = MergeTree() ORDER BY id;"
echo -e "0,Input data for\n1,gRPC protocol example" > a.csv
cat a.csv | ./clickhouse-grpc-client.py -q "INSERT INTO grpc_example_table FORMAT CSV"

./clickhouse-grpc-client.py --format PrettyCompact -q "SELECT * FROM grpc_example_table;"
```

結果:

```text
┌─id─┬─text──────────────────┐
│  0 │ Input data for        │
│  1 │ gRPC protocol example │
└────┴───────────────────────┘
```
