---
description: 'ClickHouse における分散トレースおよびメトリクス収集のための OpenTelemetry 利用ガイド'
sidebar_label: 'OpenTelemetry による ClickHouse のトレース'
sidebar_position: 62
slug: /operations/opentelemetry
title: 'OpenTelemetry による ClickHouse のトレース'
doc_type: 'guide'
---

[OpenTelemetry](https://opentelemetry.io/) は、分散アプリケーションからトレースやメトリクスを収集するためのオープン標準です。ClickHouse は OpenTelemetry を部分的にサポートしています。



## ClickHouseへのトレースコンテキストの提供 {#supplying-trace-context-to-clickhouse}

ClickHouseは、[W3C勧告](https://www.w3.org/TR/trace-context/)に記載されているトレースコンテキストHTTPヘッダーを受け入れます。また、ClickHouseサーバー間またはクライアントとサーバー間の通信に使用されるネイティブプロトコル経由でのトレースコンテキストも受け入れます。手動テストの場合、Trace Context勧告に準拠したトレースコンテキストヘッダーは、`--opentelemetry-traceparent`および`--opentelemetry-tracestate`フラグを使用して`clickhouse-client`に提供できます。

親トレースコンテキストが提供されない場合、または提供されたトレースコンテキストが上記のW3C標準に準拠していない場合、ClickHouseは[opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability)設定によって制御される確率で新しいトレースを開始できます。


## トレースコンテキストの伝播 {#propagating-the-trace-context}

トレースコンテキストは、以下の場合にダウンストリームサービスに伝播されます:

- [Distributed](../engines/table-engines/special/distributed.md) テーブルエンジンを使用する場合など、リモート ClickHouse サーバーへのクエリ。

- [url](../sql-reference/table-functions/url.md) テーブル関数。トレースコンテキスト情報は HTTP ヘッダーで送信されます。


## ClickHouse自体のトレーシング {#tracing-the-clickhouse-itself}

ClickHouseは、各クエリおよびクエリプランニングや分散クエリなどの一部のクエリ実行ステージに対して`トレーススパン`を作成します。

トレーシング情報を活用するには、[Jaeger](https://jaegertracing.io/)や[Prometheus](https://prometheus.io/)などのOpenTelemetryをサポートする監視システムにエクスポートする必要があります。ClickHouseは特定の監視システムへの依存を避け、システムテーブルを通じてトレーシングデータのみを提供します。[標準で要求される](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#span)OpenTelemetryトレーススパン情報は、[system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md)テーブルに格納されます。

このテーブルはサーバー設定で有効化する必要があります。デフォルト設定ファイル`config.xml`内の`opentelemetry_span_log`要素を参照してください。デフォルトで有効化されています。

タグまたは属性は、キーと値を含む2つの並列配列として保存されます。これらを操作するには[ARRAY JOIN](../sql-reference/statements/select/array-join.md)を使用してください。


## Log-query-settings {#log-query-settings}

[log_query_settings](settings/settings.md) 設定を使用すると、クエリ実行中のクエリ設定の変更をログに記録できます。有効にすると、クエリ設定に対するすべての変更がOpenTelemetryスパンログに記録されます。この機能は、クエリパフォーマンスに影響を与える可能性のある設定変更を追跡する際に、本番環境で特に有用です。


## 監視システムとの統合 {#integration-with-monitoring-systems}

現時点では、ClickHouseから監視システムへトレーシングデータをエクスポートする既製のツールは提供されていません。

テスト目的であれば、[system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md)テーブルに対して[URL](../engines/table-engines/special/url.md)エンジンを使用したマテリアライズドビューを設定することで、受信したログデータをトレースコレクターのHTTPエンドポイントへプッシュするエクスポート機能を構築できます。例えば、`http://localhost:9411`で実行中のZipkinインスタンスに最小限のスパンデータをZipkin v2 JSON形式でプッシュする場合は、以下のようにします:

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

エラーが発生した場合、エラーが発生したログデータの部分は通知なく失われます。データが到着しない場合は、サーバーログでエラーメッセージを確認してください。


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseで可観測性ソリューションを構築する - パート2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
