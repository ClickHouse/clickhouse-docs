---
slug: /operations/opentelemetry
sidebar_position: 62
sidebar_label: OpenTelemetryを使用したClickHouseのトレース
title: "OpenTelemetryを使用したClickHouseのトレース"
---

[OpenTelemetry](https://opentelemetry.io/) は、分散アプリケーションからトレースやメトリクスを収集するためのオープンスタンダードです。ClickHouseはOpenTelemetryに対していくつかのサポートを提供しています。

## ClickHouseへのトレースコンテキストの供給 {#supplying-trace-context-to-clickhouse}

ClickHouseは、[W3Cの推奨事項](https://www.w3.org/TR/trace-context/) に記載されているトレースコンテキストHTTPヘッダーを受け付けます。また、ClickHouseサーバー間やクライアントとサーバー間の通信に使用されるネイティブプロトコルを通じてトレースコンテキストを受け取ります。手動テストの場合、トレースコンテキストヘッダーがTrace Contextの推奨に準拠している場合、`clickhouse-client`に対して`--opentelemetry-traceparent`および`--opentelemetry-tracestate`フラグを使用して供給することができます。

親トレースコンテキストが供給されないか、提供されたトレースコンテキストが上記のW3C標準に準拠していない場合、ClickHouseは新しいトレースを開始できます。この確率は、[opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability)設定によって制御されます。

## トレースコンテキストの伝播 {#propagating-the-trace-context}

トレースコンテキストは、次のケースで下流のサービスに伝播されます：

* [Distributed](../engines/table-engines/special/distributed.md) テーブルエンジンを使用する際のリモートClickHouseサーバーへのクエリ。

* [url](../sql-reference/table-functions/url.md) テーブル関数。トレースコンテキスト情報はHTTPヘッダーで送信されます。

## ClickHouse自体のトレース {#tracing-the-clickhouse-itself}

ClickHouseは、各クエリおよびクエリ実行のいくつかの段階（クエリの計画や分散クエリなど）に対して `trace spans` を作成します。

有用となるためには、トレース情報はOpenTelemetryをサポートする監視システム（[Jaeger](https://jaegertracing.io/) や [Prometheus](https://prometheus.io/) など）にエクスポートされる必要があります。ClickHouseは特定の監視システムへの依存を避け、システムテーブルを通じてトレースデータのみを提供します。OpenTelemetryが[標準で要求しているトレーススパン情報](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#span)は、[system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md)テーブルに保存されます。

このテーブルはサーバー構成で有効にする必要があります。デフォルトの設定ファイル `config.xml` における `opentelemetry_span_log` 要素を参照してください。デフォルトで有効になっています。

タグや属性は、キーと値を含む2つの並列配列として保存されます。これらを操作するには [ARRAY JOIN](../sql-reference/statements/select/array-join.md) を使用してください。

## クエリ設定のログ {#log-query-settings}

[log_query_settings](settings/settings.md) 設定を有効にすると、クエリ実行中のクエリ設定の変更をログに記録できます。これが有効化されると、クエリ設定に対して行われた変更はすべてOpenTelemetryスパンログに記録されます。この機能は、本番環境においてクエリのパフォーマンスに影響を与える可能性のある設定変更を追跡するのに特に役立ちます。

## 監視システムとの統合 {#integration-with-monitoring-systems}

現時点では、ClickHouseから監視システムにトレースデータをエクスポートするための準備されたツールはありません。

テストのために、[system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) テーブル上に[URL](../engines/table-engines/special/url.md)エンジンを使用したマテリアライズドビューを設定することでエクスポートを行うことができます。これにより、到着したログデータをトレースコレクターのHTTPエンドポイントにプッシュできます。例えば、最小限のスパンデータを `http://localhost:9411` で動作しているZipkinインスタンスにZipkin v2 JSON形式でプッシュするには、次のようにします：

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

エラーが発生した場合、エラーが発生したログデータの一部分が静かに失われます。データが届かない場合は、サーバーログをチェックしてエラーメッセージを確認してください。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseを使用した可観測性ソリューションの構築 - 第2部 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
