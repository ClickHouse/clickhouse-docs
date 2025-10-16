---
'description': 'Apache Arrow Flight インターフェースに関するドキュメントで、ClickHouse に Flight SQL クライアントが接続できるようにします。'
'sidebar_label': 'Arrow Flight インターフェース'
'sidebar_position': 26
'slug': '/interfaces/arrowflight'
'title': 'Arrow Flight インターフェース'
'doc_type': 'reference'
---


# Apache Arrow Flight Interface

ClickHouseは、効率的な列指向データの転送のために設計された高性能RPCフレームワークである[Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html)プロトコルとの統合をサポートしています。このプロトコルは、Arrow IPC形式を使用してgRPCを介してデータを転送します。

このインターフェースにより、Flight SQLクライアントはClickHouseをクエリでき、結果をArrow形式で取得でき、分析ワークロードに対して高いスループットと低いレイテンシを提供します。

## Features {#features}

* Arrow Flight SQLプロトコルを介してSQLクエリを実行
* Apache Arrow形式でクエリ結果をストリーム配信
* Arrow FlightをサポートするBIツールやカスタムデータアプリケーションとの統合
* gRPCを介した軽量で高性能な通信

## Limitations {#limitations}

Arrow Flightインターフェースは現在実験的で、アクティブな開発中です。既知の制限には以下が含まれます：

* ClickHouse特有の複雑なSQL機能のサポートが限られている
* すべてのArrow Flight SQLメタデータ操作がまだ実装されていない
* リファレンス実装にビルトインの認証やTLS構成がない

互換性の問題が発生した場合や貢献したい場合は、[issueを作成](https://github.com/ClickHouse/ClickHouse/issues)してください。

## Running the Arrow Flight Server {#running-server}

セルフマネージドのClickHouseインスタンスでArrow Flightサーバーを有効にするには、サーバー設定に以下の構成を追加します：

```xml
<clickhouse>
    <arrowflight_port>9005</arrowflight_port>
</clickhouse>
```

ClickHouseサーバーを再起動します。正常に起動すると、以下のようなログメッセージが表示されます：

```bash
{} <Information> Application: Arrow Flight compatibility protocol: 0.0.0.0:9005
```

## Connecting to ClickHouse via Arrow Flight SQL {#connecting-to-clickhouse}

Arrow Flight SQLをサポートする任意のクライアントを使用できます。例えば、`pyarrow`を使用する場合：

```python
import pyarrow.flight

client = pyarrow.flight.FlightClient("grpc://localhost:9005")
ticket = pyarrow.flight.Ticket(b"SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket)

for batch in reader:
    print(batch.to_pandas())
```

## Compatibility {#compatibility}

Arrow Flightインターフェースは、以下のようなArrow Flight SQLをサポートするツールと互換性があります：

* Python（`pyarrow`）
* Java（`arrow-flight`）
* C++および他のgRPC互換言語

ツールにネイティブなClickHouseコネクタ（例：JDBC、ODBC）が利用可能な場合、パフォーマンスやフォーマットの互換性のためにArrow Flightが特に要求されない限り、それを使用することをお勧めします。

## Query Cancellation {#query-cancellation}

長時間実行されるクエリは、クライアント側からgRPC接続を閉じることでキャンセルできます。より高度なキャンセル機能のサポートが計画されています。

---

詳細については、以下を参照してください：

* [Apache Arrow Flight SQL仕様](https://arrow.apache.org/docs/format/FlightSql.html)
* [ClickHouse GitHub Issue #7554](https://github.com/ClickHouse/ClickHouse/issues/7554)
