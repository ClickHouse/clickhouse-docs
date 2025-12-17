---
description: 'ClickHouse の gRPC インターフェイスに関するドキュメント'
sidebar_label: 'gRPC インターフェイス'
sidebar_position: 25
slug: /interfaces/grpc
title: 'gRPC インターフェイス'
doc_type: 'reference'
---

# gRPC インターフェース {#grpc-interface}

## はじめに {#grpc-interface-introduction}

ClickHouse は [gRPC](https://grpc.io/) インターフェースをサポートしています。gRPC は、HTTP/2 と [Protocol Buffers](https://en.wikipedia.org/wiki/Protocol_Buffers) を使用するオープンソースのリモートプロシージャコールシステムです。ClickHouse における gRPC の実装は、次の機能をサポートします。

- SSL
- 認証
- セッション
- 圧縮
- 同一チャネル経由での並列クエリ
- クエリのキャンセル
- 進捗およびログの取得
- 外部テーブル

このインターフェースの仕様は [clickhouse_grpc.proto](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto) に記載されています。

## gRPC 構成 {#grpc-interface-configuration}

gRPC インターフェイスを使用するには、メインの[サーバー構成](../operations/configuration-files.md)で `grpc_port` を設定します。その他の構成オプションについては、以下の例を参照してください。

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

提供されている[仕様](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto)に基づき、gRPC がサポートしている任意のプログラミング言語でクライアントを実装できます。
あるいは、組み込みの Python クライアントを使用することもできます。これはリポジトリ内の [utils/grpc-client/clickhouse-grpc-client.py](https://github.com/ClickHouse/ClickHouse/blob/master/utils/grpc-client/clickhouse-grpc-client.py) に配置されています。組み込みクライアントを使用するには、Python モジュール [grpcio および grpcio-tools](https://grpc.io/docs/languages/python/quickstart) が必要です。

クライアントは以下の引数をサポートします。

* `--help` – ヘルプメッセージを表示して終了します。
* `--host HOST, -h HOST` – サーバー名。デフォルト値: `localhost`。IPv4 または IPv6 アドレスも使用できます。
* `--port PORT` – 接続先ポート。このポートは ClickHouse サーバー設定で有効化されている必要があります（`grpc_port` を参照）。デフォルト値: `9100`。
* `--user USER_NAME, -u USER_NAME` – ユーザー名。デフォルト値: `default`。
* `--password PASSWORD` – パスワード。デフォルト値: 空文字列。
* `--query QUERY, -q QUERY` – 非対話モードで実行するクエリ。
* `--database DATABASE, -d DATABASE` – デフォルトデータベース。指定されていない場合は、サーバー設定で現在設定されているデータベースが使用されます（デフォルトは `default`）。
* `--format OUTPUT_FORMAT, -f OUTPUT_FORMAT` – 結果の出力[フォーマット](formats.md)。対話モードでのデフォルト値: `PrettyCompact`。
* `--debug` – デバッグ情報の表示を有効にします。

対話モードでクライアントを実行するには、`--query` 引数を付けずに実行します。

バッチモードでは、クエリデータを `stdin` 経由で渡すことができます。

**クライアントの使用例**

次の例では、テーブルを作成し、CSV ファイルからデータをロードします。その後、そのテーブルの内容をクエリします。

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
