---
description: 'ClickHouse への接続に使用するネットワークインターフェース、ドライバ、およびツールの概要'
keywords: ['clickhouse', 'ネットワーク', 'インターフェース', 'http', 'tcp', 'grpc', 'コマンドライン',
  'クライアント', 'jdbc', 'odbc', 'ドライバ']
sidebar_label: '概要'
slug: /interfaces/overview
title: 'ドライバとインターフェース'
doc_type: 'reference'
---

# ドライバーとインターフェース {#drivers-and-interfaces}

ClickHouse は 2 つのネットワークインターフェースを提供します（必要に応じて、追加のセキュリティのために TLS で保護できます）:

* [HTTP](http.md) — ドキュメントが整備されており、直接利用しやすいインターフェースです。
* [ネイティブ TCP](../interfaces/tcp.md) — オーバーヘッドが少ないインターフェースです。

ほとんどの場合、これらのインターフェースに直接アクセスするのではなく、適切なツールやライブラリを使用することを推奨します。以下は ClickHouse によって公式にサポートされているコンポーネントです:

* [コマンドラインクライアント](/interfaces/cli)
* [JDBC ドライバー](/interfaces/jdbc)
* [ODBC ドライバー](/interfaces/odbc)
* [C++ クライアントライブラリ](/interfaces/cpp)

ClickHouse は 2 つの RPC プロトコルにも対応しています:

* ClickHouse 用に特別に設計された [gRPC プロトコル](grpc.md)
* [Apache Arrow Flight](arrowflight.md)

ClickHouse サーバーには、パワーユーザー向けの組み込みビジュアルインターフェースも用意されています:

* Play UI: ブラウザで `/play` を開きます。
* Advanced Dashboard: ブラウザで `/dashboard` を開きます。
* ClickHouse エンジニア向けバイナリシンボルビューア: ブラウザで `/binary` を開きます。

また、ClickHouse を扱うためのサードパーティ製ライブラリも多数存在します:

* [クライアントライブラリ](../../interfaces/third-party/client-libraries.md)
* [連携](../../interfaces/third-party/integrations.md)
* [ビジュアルインターフェース](../../interfaces/third-party/gui.md)