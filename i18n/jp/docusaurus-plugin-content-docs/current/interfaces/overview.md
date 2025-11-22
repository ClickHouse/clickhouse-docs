---
description: 'ClickHouse への接続に使用するネットワークインターフェース、ドライバーおよびツールの概要'
keywords: ['clickhouse', 'network', 'interfaces', 'http', 'tcp', 'grpc', 'command-line',
  'client', 'jdbc', 'odbc', 'driver']
sidebar_label: '概要'
slug: /interfaces/overview
title: 'ドライバーとインターフェース'
doc_type: 'reference'
---

# ドライバとインターフェース

ClickHouse は 2 つのネットワークインターフェースを提供します（必要に応じて TLS で保護してセキュリティを強化できます）:

- [HTTP](http.md) — ドキュメントが整備されており、直接利用しやすいインターフェース。
- [ネイティブ TCP](../interfaces/tcp.md) — オーバーヘッドが少ないインターフェース。

多くの場合、これらのインターフェースと直接やり取りするのではなく、適切なツールやライブラリを利用することが推奨されます。ClickHouse によって公式にサポートされているものは次のとおりです:

- [コマンドラインクライアント](../interfaces/cli.md)
- [JDBC ドライバ](../interfaces/jdbc.md)
- [ODBC ドライバ](../interfaces/odbc.md)
- [C++ クライアントライブラリ](../interfaces/cpp.md)

ClickHouse は 2 つの RPC プロトコルにも対応しています:

- ClickHouse 用に特別に設計された [gRPC プロトコル](grpc.md)。
- [Apache Arrow Flight](arrowflight.md)。

ClickHouse サーバーは、パワーユーザー向けの組み込みビジュアルインターフェースも提供します:

- Play UI: ブラウザで `/play` を開きます。
- Advanced Dashboard: ブラウザで `/dashboard` を開きます。
- ClickHouse エンジニア向けバイナリシンボルビューア: ブラウザで `/binary` を開きます。

ClickHouse を扱うためのサードパーティライブラリも幅広く提供されています:

- [クライアントライブラリ](../interfaces/third-party/client-libraries.md)
- [連携機能](../interfaces/third-party/integrations.md)
- [ビジュアルインターフェース](../interfaces/third-party/gui.md)