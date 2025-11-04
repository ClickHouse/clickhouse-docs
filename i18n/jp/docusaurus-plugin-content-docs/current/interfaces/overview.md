---
'description': 'ClickHouse への接続に関するネットワークインターフェース、ドライバー、およびツールの概要'
'keywords':
- 'clickhouse'
- 'network'
- 'interfaces'
- 'http'
- 'tcp'
- 'grpc'
- 'command-line'
- 'client'
- 'jdbc'
- 'odbc'
- 'driver'
'sidebar_label': '概要'
'slug': '/interfaces/overview'
'title': 'ドライバーとインターフェース'
'doc_type': 'reference'
---


# ドライバーとインターフェース

ClickHouseは、2つのネットワークインターフェースを提供しています（追加のセキュリティのためにTLSでラップすることも可能です）：

- [HTTP](http.md)：文書化されており、直接使用するのが簡単です。
- [Native TCP](../interfaces/tcp.md)：オーバーヘッドが少ないです。

ほとんどの場合、これらに直接対話するのではなく、適切なツールやライブラリを使用することが推奨されます。以下はClickHouseによって公式にサポートされているものです：

- [コマンドラインクライアント](../interfaces/cli.md)
- [JDBCドライバー](../interfaces/jdbc.md)
- [ODBCドライバー](../interfaces/odbc.md)
- [C++クライアントライブラリ](../interfaces/cpp.md)

ClickHouseは、2つのRPCプロトコルもサポートしています：
- ClickHouse専用に設計された[gRPCプロトコル](grpc.md)。
- [Apache Arrow Flight](arrowflight.md)。

ClickHouseサーバーは、パワーユーザー向けの埋め込みビジュアルインターフェースを提供します：

- Play UI: ブラウザで `/play` を開く;
- 高度なダッシュボード: ブラウザで `/dashboard` を開く;
- ClickHouseエンジニア向けのバイナリシンボルビューア: ブラウザで `/binary` を開く;

ClickHouseで使用するためのさまざまなサードパーティライブラリも存在します：

- [クライアントライブラリ](../interfaces/third-party/client-libraries.md)
- [統合](../interfaces/third-party/integrations.md)
- [ビジュアルインターフェース](../interfaces/third-party/gui.md)
