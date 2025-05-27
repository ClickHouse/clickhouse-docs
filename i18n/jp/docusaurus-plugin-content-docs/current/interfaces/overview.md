---
'description': 'ClickHouseへの接続のためのネットワークインターフェース、ドライバー、およびツールの概要'
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
'title': 'Drivers and Interfaces'
---




# ドライバーとインターフェース

ClickHouseは、3つのネットワークインターフェースを提供します（追加のセキュリティのためにTLSでラップすることがオプションで可能です）：

- [HTTP](http.md)：文書化されており、直接使用するのが簡単です。
- [ネイティブTCP](../interfaces/tcp.md)：オーバーヘッドが少ないです。
- [gRPC](grpc.md)。

ほとんどの場合、これらと直接対話するのではなく、適切なツールやライブラリを使用することを推奨します。以下はClickHouseによって公式にサポートされています：

- [コマンドラインクライアント](../interfaces/cli.md)
- [JDBCドライバー](../interfaces/jdbc.md)
- [ODBCドライバー](../interfaces/odbc.md)
- [C++クライアントライブラリ](../interfaces/cpp.md)

ClickHouseサーバーは、パワーユーザー向けの組み込みビジュアルインターフェースを提供しています：

- プレイUI：ブラウザで`/play`を開く；
- 高度なダッシュボード：ブラウザで`/dashboard`を開く；
- ClickHouseエンジニアのためのバイナリシンボルビューア：ブラウザで`/binary`を開く；

また、ClickHouseと連携するための多くのサードパーティライブラリも存在します：

- [クライアントライブラリ](../interfaces/third-party/client-libraries.md)
- [統合](../interfaces/third-party/integrations.md)
- [ビジュアルインターフェース](../interfaces/third-party/gui.md)
