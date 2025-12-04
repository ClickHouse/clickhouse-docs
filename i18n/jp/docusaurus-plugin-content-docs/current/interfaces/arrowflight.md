---
description: 'ClickHouse の Apache Arrow Flight インターフェイスに関するドキュメントで、Flight SQL クライアントから ClickHouse への接続を可能にします'
sidebar_label: 'Arrow Flight インターフェイス'
sidebar_position: 26
slug: /interfaces/arrowflight
title: 'Arrow Flight インターフェイス'
doc_type: 'reference'
---

# Apache Arrow Flight インターフェイス {#apache-arrow-flight-interface}

ClickHouse は、Arrow IPC フォーマットを gRPC 上で利用して効率的なカラム型データ転送を行う、高性能な RPC フレームワークである [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) プロトコルとの連携をサポートしています。

このインターフェイスにより、Flight SQL クライアントは ClickHouse に対してクエリを実行し、結果を Arrow フォーマットで取得できます。これにより、分析ワークロード向けに高スループットかつ低レイテンシなクエリ処理が可能になります。

## 機能 {#features}

* Arrow Flight SQL プロトコル経由で SQL クエリを実行
* クエリ結果を Apache Arrow 形式でストリーミング配信
* Arrow Flight をサポートする BI ツールや独自のデータアプリケーションとの統合
* gRPC を用いた軽量かつ高性能な通信

## 制限事項 {#limitations}

Arrow Flight インターフェイスは現在、実験的な段階であり、活発に開発が進められています。既知の制限事項には次のようなものがあります。

* ClickHouse 固有の複雑な SQL 機能に対するサポートが限定的です
* すべての Arrow Flight SQL メタデータ操作がまだ実装されていません
* リファレンス実装には、組み込みの認証機能や TLS 設定はありません

互換性の問題が発生した場合やコントリビュートを希望される場合は、ClickHouse リポジトリで[issue を作成](https://github.com/ClickHouse/ClickHouse/issues)してください。

## Arrow Flight サーバーの実行 {#running-server}

自己管理の ClickHouse インスタンスで Arrow Flight サーバーを有効化するには、サーバー設定に次の構成を追加します。

```xml
<clickhouse>
    <arrowflight_port>9005</arrowflight_port>
</clickhouse>
```

ClickHouse サーバーを再起動します。起動に成功すると、次のようなログメッセージが表示されます。

```bash
{} <Information> Application: Arrow Flight互換プロトコル: 0.0.0.0:9005
```

## Arrow Flight SQL を使用して ClickHouse に接続する {#connecting-to-clickhouse}

Arrow Flight SQL をサポートする任意のクライアントを利用できます。たとえば、`pyarrow` を使う場合は次のとおりです。

```python
import pyarrow.flight

client = pyarrow.flight.FlightClient("grpc://localhost:9005")
ticket = pyarrow.flight.Ticket(b"SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket)

for batch in reader:
    print(batch.to_pandas())
```

## 互換性 {#compatibility}

Arrow Flight インターフェースは、次のような技術スタックで構築されたカスタムアプリケーションを含め、Arrow Flight SQL をサポートするツールと互換性があります。

* Python (`pyarrow`)
* Java (`arrow-flight`)
* C++ およびその他の gRPC 互換言語

利用しているツール向けにネイティブな ClickHouse コネクタ（例: JDBC、ODBC）が利用可能な場合、パフォーマンスやフォーマット互換性の理由で Arrow Flight が明示的に必要な場合を除き、そちらを優先して使用してください。

## クエリのキャンセル {#query-cancellation}

長時間実行中のクエリは、クライアント側で gRPC 接続を閉じることでキャンセルできます。より高度なキャンセル機能のサポートの追加が計画されています。

---

詳しくは次を参照してください。

* [Apache Arrow Flight SQL specification](https://arrow.apache.org/docs/format/FlightSql.html)
* [ClickHouse GitHub Issue #7554](https://github.com/ClickHouse/ClickHouse/issues/7554)
