---
slug: /operations/opentelemetry
sidebar_position: 62
sidebar_label: OpenTelemetryを使用したClickHouseのトレース
title: "OpenTelemetryを使用したClickHouseのトレース"
---

[OpenTelemetry](https://opentelemetry.io/)は、分散アプリケーションからトレースやメトリクスを収集するためのオープンスタンダードです。ClickHouseはOpenTelemetryの一部をサポートしています。

## ClickHouseへのトレースコンテキストの提供 {#supplying-trace-context-to-clickhouse}

ClickHouseは、[W3Cの推奨事項](https://www.w3.org/TR/trace-context/)に従ったトレースコンテキストHTTPヘッダーを受け入れます。また、ClickHouseサーバー間またはクライアントとサーバー間の通信に使用されるネイティブプロトコルを介してトレースコンテキストも受け入れます。手動テストのために、Trace Contextの推奨事項に準拠したトレースコンテキストヘッダーを、`clickhouse-client`に`--opentelemetry-traceparent`および`--opentelemetry-tracestate`フラグを使用して提供できます。

親トレースコンテキストが提供されない場合、または提供されたトレースコンテキストが上記のW3C標準に準拠していない場合、ClickHouseは[opentelemetry_start_trace_probability](../operations/settings/settings.md#opentelemetry-start-trace-probability)設定で制御される確率で新しいトレースを開始できます。

## トレースコンテキストの伝播 {#propagating-the-trace-context}

トレースコンテキストは、以下のケースで下流のサービスに伝播されます：

* [Distributed](../engines/table-engines/special/distributed.md)テーブルエンジンを使用する際のリモートClickHouseサーバーへのクエリ。

* [url](../sql-reference/table-functions/url.md)テーブル関数。トレースコンテキスト情報はHTTPヘッダーで送信されます。

## ClickHouse自体のトレース {#tracing-the-clickhouse-itself}

ClickHouseは、各クエリおよびクエリ実行段階（クエリプランニングや分散クエリなど）に対して`trace spans`を作成します。

トレーシング情報が有用であるためには、[Jaeger](https://jaegertracing.io/)や[Prometheus](https://prometheus.io/)などのOpenTelemetryをサポートするモニタリングシステムにエクスポートされる必要があります。ClickHouseは特定のモニタリングシステムへの依存を避け、代わりにシステムテーブルを通じてトレースデータを提供します。OpenTelemetryトレーススパン情報は、[必要な標準の情報](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#span)は、[system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md)テーブルに保存されます。

このテーブルはサーバー構成で有効にする必要があります。デフォルトの設定ファイル`config.xml`内の`opentelemetry_span_log`要素を参照してください。デフォルトでは有効になっています。

タグや属性は、キーと値を含む二つの並列配列として保存されます。[ARRAY JOIN](../sql-reference/statements/select/array-join.md)を使用して、それらを操作します。

## log-query-settings {#log-query-settings}

[log_query_settings](settings/settings.md)を設定すると、クエリ実行中のクエリ設定の変更をログに記録できます。これを有効にすると、クエリ設定に対して行われた変更はOpenTelemetryスパンログに記録されます。この機能は、クエリパフォーマンスに影響を与える可能性のある設定変更を追跡するために、特に本番環境で便利です。

## モニタリングシステムとの統合 {#integration-with-monitoring-systems}

現在、ClickHouseからモニタリングシステムにトレースデータをエクスポートできるツールは用意されていません。

テストのために、[system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md)テーブルを使用して[URL](../engines/table-engines/special/url.md)エンジンでマテリアライズドビューを設定することが可能で、到着したログデータをトレースコレクターのHTTPエンドポイントにプッシュします。例えば、最小限のスパンデータを`http://localhost:9411`で実行されているZipkinインスタンスにプッシュする場合（Zipkin v2 JSON形式）：

```sql
CREATE MATERIALIZED VIEW default.zipkin_spans
ENGINE = URL('http://127.0.0.1:9411/api/v2/spans', 'JSONEachRow')
SETTINGS output_format_json_named_tuples_as_objects = 1,
    output_format_json_array_of_rows = 1 AS
SELECT
    lower(hex(trace_id)) AS traceId,
    case when parent_span_id = 0 then '' else lower(hex(parent_span_id)) end AS parentId,
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

エラーが発生した場合、エラーが発生したログデータの一部は静かに失われます。データが到着しない場合は、サーバーログでエラーメッセージを確認してください。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseを使用した可観測性ソリューションの構築 - パート2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
