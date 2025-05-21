---
description: 'ClickHouse における分散トレーシングとメトリクス収集のための OpenTelemetry の使用ガイド'
sidebar_label: 'OpenTelemetry による ClickHouse のトレーシング'
sidebar_position: 62
slug: /operations/opentelemetry
title: 'OpenTelemetry による ClickHouse のトレーシング'
---

[OpenTelemetry](https://opentelemetry.io/) は、分散アプリケーションからトレースとメトリクスを収集するためのオープンスタンダードです。ClickHouse は OpenTelemetry に対していくつかのサポートを提供しています。

## ClickHouse へのトレースコンテキストの供給 {#supplying-trace-context-to-clickhouse}

ClickHouse は、[W3C の推奨](https://www.w3.org/TR/trace-context/)に記載されているトレースコンテキストの HTTP ヘッダーを受け入れます。また、ClickHouse サーバー間またはクライアントとサーバー間の通信に使用されるネイティブプロトコルでもトレースコンテキストを受け入れます。手動テストの場合、トレースコンテキストヘッダーは `--opentelemetry-traceparent` および `--opentelemetry-tracestate` フラグを使用して `clickhouse-client` に供給できます。

親トレースコンテキストが供給されない場合や、提供されたトレースコンテキストが上記の W3C 標準に準拠していない場合、ClickHouse は新しいトレースを開始することがあり、その確率は [opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability) 設定によって制御されます。

## トレースコンテキストの伝播 {#propagating-the-trace-context}

トレースコンテキストは、以下のケースで下流サービスに伝播されます：

* [Distributed](../engines/table-engines/special/distributed.md) テーブルエンジンを使用する場合のリモート ClickHouse サーバーへのクエリ。

* [url](../sql-reference/table-functions/url.md) テーブル関数。トレースコンテキスト情報は HTTP ヘッダーで送信されます。

## ClickHouse 自身のトレーシング {#tracing-the-clickhouse-itself}

ClickHouse は、各クエリおよびクエリ実行のいくつかのステージ（クエリ計画や分散クエリなど）に対して `trace spans` を作成します。

有用であるためには、トレース情報を [Jaeger](https://jaegertracing.io/) や [Prometheus](https://prometheus.io/) などの OpenTelemetry をサポートする監視システムにエクスポートする必要があります。ClickHouse は特定の監視システムへの依存を避け、代わりにシステムテーブルを介してトレースデータを提供します。基準に従った OpenTelemetry トレーススパン情報は、[system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) テーブルに保存されます。

テーブルはサーバー設定で有効にする必要があります。デフォルトの設定ファイル `config.xml` 内の `opentelemetry_span_log` 要素を参照してください。デフォルトでは有効になっています。

タグまたは属性は、キーと値を含む2つの並列配列として保存されます。これらを扱うには [ARRAY JOIN](../sql-reference/statements/select/array-join.md) を使用してください。

## log-query-settings {#log-query-settings}

[log_query_settings](settings/settings.md) を設定することで、クエリ実行中のクエリ設定の変更をログすることができます。有効にすると、クエリ設定に加えられた変更は OpenTelemetry スパンログに記録されます。この機能は、クエリのパフォーマンスに影響を与える可能性のある構成変更を追跡するために、特に本番環境で役立ちます。

## 監視システムとの統合 {#integration-with-monitoring-systems}

現時点では、ClickHouse のトレースデータを監視システムにエクスポートするための準備されたツールはありません。

テストのために、[system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) テーブル上に [URL](../engines/table-engines/special/url.md) エンジンを使用したマテリアライズドビューを設定することが可能で、到着したログデータをトレースコレクターの HTTP エンドポイントにプッシュします。たとえば、`http://localhost:9411` で実行されている Zipkin インスタンスに最小限のスパンデータを Zipkin v2 JSON 形式でプッシュするには、次のようにします：

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

エラーが発生した場合、エラーが発生したログデータの部分は静かに失われます。データが到着しない場合は、サーバーログでエラーメッセージを確認してください。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse での可観測性ソリューションの構築 - パート 2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
