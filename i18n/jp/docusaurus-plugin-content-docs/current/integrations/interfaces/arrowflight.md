---
description: 'ClickHouse における Apache Arrow Flight インターフェースに関するドキュメントです。Flight SQL クライアントから ClickHouse へ接続するためのインターフェースです'
sidebar_label: 'Arrow Flight インターフェース'
sidebar_position: 26
slug: /interfaces/arrowflight
title: 'Arrow Flight インターフェース'
doc_type: 'reference'
---

# Apache Arrow Flight インターフェイス {#apache-arrow-flight-interface}

ClickHouse は [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) プロトコルとの統合をサポートしています。これは、gRPC 上で Arrow IPC 形式を用いて効率的に列指向データを転送するために設計された高性能な RPC フレームワークです。

このインターフェイスを使用すると、Flight SQL クライアントは ClickHouse にクエリを実行し、結果を Arrow 形式で取得できます。これにより、分析ワークロード向けに高いスループットと低いレイテンシーを実現できます。

## 機能 {#features}

* Arrow Flight SQL プロトコル経由で SQL クエリを実行
* Apache Arrow 形式でクエリ結果をストリーミング
* Arrow Flight をサポートする BI ツールや独自データアプリケーションとの連携
* gRPC を用いた軽量かつ高性能な通信

## 制限事項 {#limitations}

Arrow Flight インターフェイスは現在、実験的な段階であり、積極的に開発が進められています。既知の制限事項には次のものが含まれます。

* ClickHouse 固有の複雑な SQL 機能に対するサポートが限定的
* Arrow Flight SQL のメタデータ操作がすべて実装されているわけではない
* リファレンス実装には認証や TLS 設定が組み込まれていない

互換性の問題が発生した場合や、コントリビュートを検討されている場合は、ClickHouse リポジトリで [issue を作成](https://github.com/ClickHouse/ClickHouse/issues)してください。

## Arrow Flight サーバーの起動 {#running-server}

セルフマネージド ClickHouse インスタンスで Arrow Flight サーバーを有効にするには、サーバー設定ファイルに次の設定を追加します：

```xml
<clickhouse>
    <arrowflight_port>9005</arrowflight_port>
</clickhouse>
```

ClickHouse サーバーを再起動します。起動に成功すると、次のようなログメッセージが表示されます。

```bash
{} <Information> Application: Arrow Flight compatibility protocol: 0.0.0.0:9005
```


## Arrow Flight SQL を介して ClickHouse に接続する {#connecting-to-clickhouse}

Arrow Flight SQL をサポートする任意のクライアントを使用できます。たとえば、`pyarrow` を使用する場合は次のとおりです。

```python
import pyarrow.flight

client = pyarrow.flight.FlightClient("grpc://localhost:9005")
ticket = pyarrow.flight.Ticket(b"SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket)

for batch in reader:
    print(batch.to_pandas())
```


## 互換性 {#compatibility}

Arrow Flight インターフェイスは、次のような言語で実装されたカスタムアプリケーションを含め、Arrow Flight SQL をサポートするツールと互換性があります：

* Python (`pyarrow`)
* Java (`arrow-flight`)
* C++ およびその他の gRPC 互換言語

利用しているツール向けにネイティブな ClickHouse コネクタ（例：JDBC、ODBC）が利用可能な場合、性能面や形式互換性の要件から Arrow Flight を特に必要とする場合を除き、そのコネクタの利用を優先してください。

## クエリのキャンセル {#query-cancellation}

長時間実行されるクエリは、クライアント側で gRPC 接続を閉じることでキャンセルできます。より高度なキャンセル機能のサポートも今後追加される予定です。

---

詳細については、次を参照してください。

* [Apache Arrow Flight SQL specification](https://arrow.apache.org/docs/format/FlightSql.html)
* [ClickHouse GitHub Issue #7554](https://github.com/ClickHouse/ClickHouse/issues/7554)