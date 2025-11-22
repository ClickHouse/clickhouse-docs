---
description: 'ClickHouse の Apache Arrow Flight インターフェイスに関するドキュメント。Flight SQL クライアントから ClickHouse への接続を可能にします'
sidebar_label: 'Arrow Flight インターフェイス'
sidebar_position: 26
slug: /interfaces/arrowflight
title: 'Arrow Flight インターフェイス'
doc_type: 'reference'
---



# Apache Arrow Flight インターフェイス

ClickHouse は、[Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) プロトコルをサポートしています。これは、gRPC 上で Arrow IPC フォーマットを使用して効率的にカラムナー形式のデータを転送するために設計された、高性能な RPC フレームワークです。

このインターフェイスにより、Flight SQL クライアントは ClickHouse に対してクエリを実行し、結果を Arrow フォーマットで取得できます。これにより、分析ワークロードに対して高スループットかつ低レイテンシを実現できます。



## 機能 {#features}

- Arrow Flight SQLプロトコル経由でのSQLクエリ実行
- Apache Arrow形式でのクエリ結果のストリーミング
- Arrow Flightをサポートする BIツールおよびカスタムデータアプリケーションとの統合
- gRPC上での軽量かつ高性能な通信


## 制限事項 {#limitations}

Arrow Flightインターフェースは現在実験的機能であり、活発に開発が進められています。既知の制限事項は以下の通りです:

- ClickHouse固有の複雑なSQL機能に対するサポートが限定的
- すべてのArrow Flight SQLメタデータ操作が未実装
- リファレンス実装に組み込みの認証やTLS設定が存在しない

互換性の問題が発生した場合、または貢献をご希望の場合は、ClickHouseリポジトリで[issueを作成](https://github.com/ClickHouse/ClickHouse/issues)してください。


## Arrow Flightサーバーの実行 {#running-server}

セルフマネージド型のClickHouseインスタンスでArrow Flightサーバーを有効化するには、サーバー設定に以下の構成を追加します：

```xml
<clickhouse>
    <arrowflight_port>9005</arrowflight_port>
</clickhouse>
```

ClickHouseサーバーを再起動します。正常に起動すると、以下のようなログメッセージが表示されます：

```bash
{} <Information> Application: Arrow Flight compatibility protocol: 0.0.0.0:9005
```


## Arrow Flight SQLを介したClickHouseへの接続 {#connecting-to-clickhouse}

Arrow Flight SQLをサポートする任意のクライアントを使用できます。例えば、`pyarrow`を使用する場合:

```python
import pyarrow.flight

client = pyarrow.flight.FlightClient("grpc://localhost:9005")
ticket = pyarrow.flight.Ticket(b"SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket)

for batch in reader:
    print(batch.to_pandas())
```


## 互換性 {#compatibility}

Arrow Flightインターフェースは、Arrow Flight SQLをサポートするツールと互換性があります。以下を使用して構築されたカスタムアプリケーションも含まれます：

- Python（`pyarrow`）
- Java（`arrow-flight`）
- C++およびその他のgRPC互換言語

使用するツールにネイティブのClickHouseコネクタが利用可能な場合（例：JDBC、ODBC）は、パフォーマンスやフォーマットの互換性のために特にArrow Flightが必要でない限り、ネイティブコネクタの使用を推奨します。


## クエリのキャンセル {#query-cancellation}

長時間実行されるクエリは、クライアント側からgRPC接続を切断することでキャンセルできます。より高度なキャンセル機能のサポートは今後予定されています。

---

詳細については、以下を参照してください：

- [Apache Arrow Flight SQL仕様](https://arrow.apache.org/docs/format/FlightSql.html)
- [ClickHouse GitHub Issue #7554](https://github.com/ClickHouse/ClickHouse/issues/7554)
