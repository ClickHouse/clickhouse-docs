---
slug: /interfaces/overview
sidebar_label: 概要
sidebar_position: 1
keywords: [clickhouse, network, interfaces, http, tcp, grpc, command-line, client, jdbc, odbc, driver]
description: ClickHouseは3つのネットワークインターフェースを提供します
---


# ドライバーとインターフェース

ClickHouseは3つのネットワークインターフェースを提供します（追加のセキュリティのためにTLSでラップすることもできます）：

- [HTTP](http.md)：文書化されており、直接使用するのが簡単です。
- [ネイティブTCP](../interfaces/tcp.md)：オーバーヘッドが少なくなります。
- [gRPC](grpc.md)。

ほとんどの場合、これらと直接対話するのではなく、適切なツールやライブラリを使用することをお勧めします。以下はClickHouseによって公式にサポートされています：

- [コマンドラインクライアント](../interfaces/cli.md)
- [JDBCドライバー](../interfaces/jdbc.md)
- [ODBCドライバー](../interfaces/odbc.md)
- [C++クライアントライブラリ](../interfaces/cpp.md)

ClickHouseサーバーは、パワーユーザー向けに埋め込みの視覚インターフェースを提供します：

- プレイUI：ブラウザで`/play`を開く；
- 高度なダッシュボード：ブラウザで`/dashboard`を開く；
- ClickHouseエンジニア向けのバイナリシンボルビューワー：ブラウザで`/binary`を開く；

ClickHouseと連携するためのさまざまなサードパーティライブラリもあります：

- [クライアントライブラリ](../interfaces/third-party/client-libraries.md)
- [インテグレーション](../interfaces/third-party/integrations.md)
- [視覚インターフェース](../interfaces/third-party/gui.md)
