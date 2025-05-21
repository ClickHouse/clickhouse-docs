---
description: 'ClickHouse に接続するためのネットワークインターフェース、ドライバー、およびツールの概要'
keywords: ['clickhouse', 'network', 'interfaces', 'http', 'tcp', 'grpc', 'command-line',
  'client', 'jdbc', 'odbc', 'driver']
sidebar_label: '概要'
slug: /interfaces/overview
title: 'ドライバーとインターフェース'
---


# ドライバーとインターフェース

ClickHouse は3つのネットワークインターフェースを提供します（オプションでTLSでラップして追加のセキュリティを確保できます）：

- [HTTP](http.md) は、ドキュメントがあり、直接使用するのが簡単です。
- [Native TCP](../interfaces/tcp.md) は、オーバーヘッドが少ないです。
- [gRPC](grpc.md)。

ほとんどの場合、これらと直接やり取りするのではなく、適切なツールやライブラリを使用することをお勧めします。以下は、ClickHouse によって正式にサポートされているものです：

- [コマンドラインクライアント](../interfaces/cli.md)
- [JDBC ドライバー](../interfaces/jdbc.md)
- [ODBC ドライバー](../interfaces/odbc.md)
- [C++ クライアントライブラリ](../interfaces/cpp.md)

ClickHouse サーバーは、パワーユーザー向けに埋め込みのビジュアルインターフェースを提供します：

- Play UI: ブラウザーで `/play` を開く；
- 高度なダッシュボード: ブラウザーで `/dashboard` を開く；
- ClickHouse エンジニア向けのバイナリシンボルビューア: ブラウザーで `/binary` を開く；

また、ClickHouse と連携するためのさまざまなサードパーティライブラリもあります：

- [クライアントライブラリ](../interfaces/third-party/client-libraries.md)
- [統合](../interfaces/third-party/integrations.md)
- [ビジュアルインターフェース](../interfaces/third-party/gui.md)
