---
slug: /interfaces/overview
sidebar_label: 概要
sidebar_position: 1
keywords: [clickhouse, ネットワーク, インターフェース, http, tcp, grpc, コマンドライン, クライアント, jdbc, odbc, ドライバー]
description: ClickHouseは3つのネットワークインターフェースを提供します
---

# ドライバーとインターフェース

ClickHouseは3つのネットワークインターフェースを提供しています（追加のセキュリティのためにTLSでラップすることもできます）：

- [HTTP](http.md)、これは文書化されており、直接使用するのが簡単です。
- [ネイティブTCP](../interfaces/tcp.md)、これはオーバーヘッドが少ないです。
- [gRPC](grpc.md)。

ほとんどの場合、それらと直接対話するのではなく、適切なツールやライブラリを使用することをお勧めします。以下はClickHouseにより公式にサポートされています：

- [コマンドラインクライアント](../interfaces/cli.md)
- [JDBCドライバー](../interfaces/jdbc.md)
- [ODBCドライバー](../interfaces/odbc.md)
- [C++クライアントライブラリ](../interfaces/cpp.md)

ClickHouseサーバーはパワーユーザー向けに組み込みの視覚インターフェースを提供します：

- Play UI: ブラウザで`/play`を開く;
- 高度なダッシュボード: ブラウザで`/dashboard`を開く;
- ClickHouseエンジニア用のバイナリシンボルビューア: ブラウザで`/binary`を開く;

また、ClickHouseと連携するためのさまざまなサードパーティライブラリもあります：

- [クライアントライブラリ](../interfaces/third-party/client-libraries.md)
- [統合](../interfaces/third-party/integrations.md)
- [視覚インターフェース](../interfaces/third-party/gui.md)
