---
'description': 'ClickHouseでの分散トレースとメトリクス収集のためのOpenTelemetryの使用に関するガイド'
'sidebar_label': 'OpenTelemetryを使用したClickHouseのトレース'
'sidebar_position': 62
'slug': '/operations/opentelemetry'
'title': 'OpenTelemetryを使用したClickHouseのトレース'
'doc_type': 'guide'
---

[OpenTelemetry](https://opentelemetry.io/) は、分散アプリケーションからトレースとメトリクスを収集するためのオープンスタンダードです。ClickHouseはOpenTelemetryを一部サポートしています。

## ClickHouseへのトレースコンテキストの提供 {#supplying-trace-context-to-clickhouse}

ClickHouseは、[W3Cの推奨事項](https://www.w3.org/TR/trace-context/)に記載されているトレースコンテキストのHTTPヘッダーを受け入れます。また、ClickHouseサーバ間やクライアントとサーバ間の通信に使用されるネイティブプロトコルでもトレースコンテキストを受け入れます。手動テストの場合、Trace Contextの推奨に準拠するトレースコンテキストヘッダーを、`--opentelemetry-traceparent` および `--opentelemetry-tracestate` フラグを使用して `clickhouse-client` に提供することができます。

親トレースコンテキストが提供されない場合や、提供されたトレースコンテキストが上記のW3C標準に準拠していない場合、ClickHouseは新しいトレースを開始することがあります。その確率は、[opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability) 設定によって制御されます。

## トレースコンテキストの伝播 {#propagating-the-trace-context}

トレースコンテキストは、以下のケースで下流のサービスに伝播されます：

* [Distributed](../engines/table-engines/special/distributed.md) テーブルエンジンを使用しているときのリモートClickHouseサーバへのクエリ。

* [url](../sql-reference/table-functions/url.md) テーブル関数。トレースコンテキスト情報はHTTPヘッダーで送信されます。

## ClickHouse自体のトレース {#tracing-the-clickhouse-itself}

ClickHouseは、各クエリおよびクエリの実行ステージの一部（クエリの計画や分散クエリなど）に対して `trace spans` を作成します。

このトレース情報は、[Jaeger](https://jaegertracing.io/) や [Prometheus](https://prometheus.io/) など、OpenTelemetryをサポートする監視システムにエクスポートすることで役立ちます。ClickHouseは特定の監視システムに依存せず、代わりにシステムテーブルを介してトレースデータを提供します。OpenTelemetryのトレーススパン情報は、[system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) テーブルに保存されます。

このテーブルはサーバ構成で有効にする必要があります。デフォルトの設定ファイル `config.xml` の `opentelemetry_span_log` 要素を参照してください。デフォルトでは有効になっています。

タグまたは属性は、キーと値を含む2つの並行配列として保存されます。これらを操作するには、[ARRAY JOIN](../sql-reference/statements/select/array-join.md) を使用します。

## log-query-settings {#log-query-settings}

[log_query_settings](settings/settings.md) を設定することで、クエリ実行中のクエリ設定の変更をログに記録できます。これが有効な場合、クエリ設定に対する変更はOpenTelemetryスパンログに記録されます。この機能は、クエリパフォーマンスに影響を与える可能性のある構成変更を追跡するために、特に本番環境で役立ちます。

## 監視システムとの統合 {#integration-with-monitoring-systems}

現在、ClickHouseから監視システムにトレースデータをエクスポートするための準備されたツールはありません。

テストのために、[system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) テーブルに対して [URL](../engines/table-engines/special/url.md) エンジンを使用したマテリアライズドビューを設定することでエクスポートを設定でき、そのデータをトレースコレクタのHTTPエンドポイントにプッシュすることができます。例えば、最小限のスパンデータを `http://localhost:9411` で動作しているZipkinインスタンスに、Zipkin v2 JSON形式でプッシュするには：

```sql
CREATE MATERIALIZED VIEW default.zipkin_spans
ENGINE = URL('http://127.0.0.1:9411/api/v2/spans', 'JSONEachRow')
SETTINGS output_format_json_named_tuples_as_objects = 1,
    output_format_json_array_of_rows = 1 AS
SELECT
    lower(hex(trace_id)) AS traceId,
    CASE WHEN parent_span_id = 0 THEN '' ELSE lower(hex(parent_span_id)) END AS parentId,
    lower(hex(span_id)) AS id,
    operation_name AS name,
    start_time_us AS timestamp,
    finish_time_us - start_time_us AS duration,
    cast(tuple('clickhouse'), 'Tuple(serviceName text)') AS localEndpoint,
    cast(tuple(
        attribute.values[indexOf(attribute.names, 'db.statement')]),
        'Tuple("db.statement" text)') AS tags
FROM system.opentelemetry_span_log
```

エラーが発生した場合、そのエラーの発生したログデータの一部は静かに失われます。データが到着しない場合は、サーバーログでエラーメッセージを確認してください。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの可観測性ソリューションの構築 - パート2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
