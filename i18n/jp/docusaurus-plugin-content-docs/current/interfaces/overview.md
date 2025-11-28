---
description: 'ClickHouse への接続用ネットワークインターフェース、ドライバー、およびツールの概要'
keywords: ['clickhouse', 'network', 'interfaces', 'http', 'tcp', 'grpc', 'command-line',
  'client', 'jdbc', 'odbc', 'driver']
sidebar_label: '概要'
slug: /interfaces/overview
title: 'ドライバーとインターフェース'
doc_type: 'reference'
---

# ドライバとインターフェイス

ClickHouse は 2 つのネットワークインターフェイスを提供します（いずれも追加のセキュリティのためにオプションで TLS で保護できます）。

- [HTTP](http.md) — ドキュメントが整備されており、そのまま容易に利用できます。
- [ネイティブ TCP](../interfaces/tcp.md) — オーバーヘッドが小さいインターフェイスです。

ほとんどの場合、これらのインターフェイスに直接アクセスするのではなく、適切なツールやライブラリを使用することを推奨します。ClickHouse により公式にサポートされているものは次のとおりです。

- [コマンドラインクライアント](../interfaces/cli.md)
- [JDBC ドライバ](../interfaces/jdbc.md)
- [ODBC ドライバ](../interfaces/odbc.md)
- [C++ クライアントライブラリ](../interfaces/cpp.md)

ClickHouse は 2 つの RPC プロトコルもサポートしています。

- ClickHouse 向けに特別に設計された [gRPC プロトコル](grpc.md)
- [Apache Arrow Flight](arrowflight.md)

ClickHouse サーバーは、パワーユーザー向けに組み込みのビジュアルインターフェイスも提供しています。

- Play UI: ブラウザで `/play` を開きます。
- Advanced Dashboard: ブラウザで `/dashboard` を開きます。
- ClickHouse エンジニア向けバイナリシンボルビューア: ブラウザで `/binary` を開きます。

また、ClickHouse と連携して動作するサードパーティライブラリも多数提供されています。

- [クライアントライブラリ](../interfaces/third-party/client-libraries.md)
- [インテグレーション](../interfaces/third-party/integrations.md)
- [ビジュアルインターフェイス](../interfaces/third-party/gui.md)