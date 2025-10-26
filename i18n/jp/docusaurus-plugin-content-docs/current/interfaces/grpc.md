---
'description': 'ClickHouseのgRPCインターフェースに関するドキュメント'
'sidebar_label': 'gRPC インターフェース'
'sidebar_position': 25
'slug': '/interfaces/grpc'
'title': 'gRPC インターフェース'
'doc_type': 'reference'
---


# gRPC インターフェース

## 概要 {#grpc-interface-introduction}

ClickHouseは[gRPC](https://grpc.io/)インターフェースをサポートしています。これは、HTTP/2と[プロトコルバッファ](https://en.wikipedia.org/wiki/Protocol_Buffers)を使用するオープンソースのリモートプロシージャコールシステムです。ClickHouseにおけるgRPCの実装は以下をサポートしています：

- SSL;
- 認証;
- セッション;
- 圧縮;
- 同じチャネルを介した並列クエリ;
- クエリのキャンセル;
- 進捗状況とログの取得;
- 外部テーブル。

インターフェースの仕様は[clickhouse_grpc.proto](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto)に記述されています。

## gRPC 設定 {#grpc-interface-configuration}

gRPCインターフェースを使用するには、メインの[サーバー設定](../operations/configuration-files.md)で`grpc_port`を設定します。その他の設定オプションは次の例を参照してください。

```xml
<grpc_port>9100</grpc_port>
    <grpc>
        <enable_ssl>false</enable_ssl>

        <!-- The following two files are used only if SSL is enabled -->
        <ssl_cert_file>/path/to/ssl_cert_file</ssl_cert_file>
        <ssl_key_file>/path/to/ssl_key_file</ssl_key_file>

        <!-- Whether server requests client for a certificate -->
        <ssl_require_client_auth>false</ssl_require_client_auth>

        <!-- The following file is used only if ssl_require_client_auth=true -->
        <ssl_ca_cert_file>/path/to/ssl_ca_cert_file</ssl_ca_cert_file>

        <!-- Default compression algorithm (applied if client doesn't specify another algorithm, see result_compression in QueryInfo).
             Supported algorithms: none, deflate, gzip, stream_gzip -->
        <compression>deflate</compression>

        <!-- Default compression level (applied if client doesn't specify another level, see result_compression in QueryInfo).
             Supported levels: none, low, medium, high -->
        <compression_level>medium</compression_level>

        <!-- Send/receive message size limits in bytes. -1 means unlimited -->
        <max_send_message_size>-1</max_send_message_size>
        <max_receive_message_size>-1</max_receive_message_size>

        <!-- Enable if you want to get detailed logs -->
        <verbose_logs>false</verbose_logs>
    </grpc>
```

## 組み込みクライアント {#grpc-client}

提供された[仕様](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto)を使用して、gRPCに対応した任意のプログラミング言語でクライアントを記述できます。または、組み込みのPythonクライアントを使用することもできます。このクライアントは、リポジトリの[utils/grpc-client/clickhouse-grpc-client.py](https://github.com/ClickHouse/ClickHouse/blob/master/utils/grpc-client/clickhouse-grpc-client.py)に配置されています。組み込みのクライアントには、[grpcio および grpcio-tools](https://grpc.io/docs/languages/python/quickstart)のPythonモジュールが必要です。

クライアントは以下の引数をサポートしています：

- `--help` – ヘルプメッセージを表示して終了します。
- `--host HOST, -h HOST` – サーバー名。デフォルト値：`localhost`。IPv4またはIPv6アドレスも使用できます。
- `--port PORT` – 接続先ポート。このポートはClickHouseサーバー設定で有効にする必要があります（`grpc_port`を参照）。デフォルト値：`9100`。
- `--user USER_NAME, -u USER_NAME` – ユーザー名。デフォルト値：`default`。
- `--password PASSWORD` – パスワード。デフォルト値：空文字列。
- `--query QUERY, -q QUERY` – 非対話モードで処理するクエリ。
- `--database DATABASE, -d DATABASE` – デフォルトデータベース。指定しない場合、サーバー設定で設定されている現在のデータベースが使用されます（デフォルトは`default`）。
- `--format OUTPUT_FORMAT, -f OUTPUT_FORMAT` – 結果出力[形式](formats.md)。対話モードのデフォルト値：`PrettyCompact`。
- `--debug` – デバッグ情報を表示することを有効にします。

対話モードでクライアントを実行するには`--query`引数なしで呼び出します。

バッチモードでは、データを`stdin`を通じて渡すことができます。

**クライアント使用例**

以下の例では、テーブルが作成され、CSVファイルからデータがロードされます。その後、テーブルの内容がクエリされます。

```bash
./clickhouse-grpc-client.py -q "CREATE TABLE grpc_example_table (id UInt32, text String) ENGINE = MergeTree() ORDER BY id;"
echo -e "0,Input data for\n1,gRPC protocol example" > a.csv
cat a.csv | ./clickhouse-grpc-client.py -q "INSERT INTO grpc_example_table FORMAT CSV"

./clickhouse-grpc-client.py --format PrettyCompact -q "SELECT * FROM grpc_example_table;"
```

結果：

```text
┌─id─┬─text──────────────────┐
│  0 │ Input data for        │
│  1 │ gRPC protocol example │
└────┴───────────────────────┘
```
