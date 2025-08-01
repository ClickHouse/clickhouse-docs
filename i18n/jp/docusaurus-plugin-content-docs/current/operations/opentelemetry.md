---
description: 'Guide to using OpenTelemetry for distributed tracing and metrics collection
  in ClickHouse'
sidebar_label: 'Tracing ClickHouse with OpenTelemetry'
sidebar_position: 62
slug: '/operations/opentelemetry'
title: 'Tracing ClickHouse with OpenTelemetry'
---



[OpenTelemetry](https://opentelemetry.io/) は、分散アプリケーションからトレースとメトリクスを収集するためのオープン標準です。ClickHouse は OpenTelemetry の一部をサポートしています。

## ClickHouse にトレースコンテキストを供給する {#supplying-trace-context-to-clickhouse}

ClickHouse は、[W3C リコメンデーション](https://www.w3.org/TR/trace-context/) に記載されているトレースコンテキスト HTTP ヘッダーを受け入れます。また、ClickHouse サーバー間やクライアントとサーバー間の通信に使用されるネイティブプロトコルを介してトレースコンテキストを受け入れます。手動テストの場合、Trace Context リコメンデーションに準拠したトレースコンテキストヘッダーは、`clickhouse-client` に `--opentelemetry-traceparent` および `--opentelemetry-tracestate` フラグを使用して供給できます。

親トレースコンテキストが供給されない場合や、提供されたトレースコンテキストが上記の W3C 標準に準拠していない場合、ClickHouse は新しいトレースを開始することができます。その確率は [opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability) 設定で制御されます。

## トレースコンテキストの伝播 {#propagating-the-trace-context}

トレースコンテキストは、以下のケースで下流サービスに伝播されます：

* [Distributed](../engines/table-engines/special/distributed.md) テーブルエンジンを使用する場合の、リモート ClickHouse サーバーへのクエリ。

* [url](../sql-reference/table-functions/url.md) テーブル関数。トレースコンテキスト情報は HTTP ヘッダーで送信されます。

## ClickHouse 自体のトレース {#tracing-the-clickhouse-itself}

ClickHouse は、各クエリおよびクエリ実行のいくつかのステージ（クエリ計画または分散クエリなど）について `trace spans` を作成します。

役立つためには、トレース情報を [Jaeger](https://jaegertracing.io/) や [Prometheus](https://prometheus.io/) などの OpenTelemetry をサポートする監視システムにエクスポートする必要があります。ClickHouse は特定の監視システムへの依存を避け、トレースデータをシステムテーブルを通じてのみ提供します。標準で要求される OpenTelemetry トレーススパン情報は、[system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) テーブルに保存されます。

テーブルはサーバー構成で有効にする必要があります。デフォルトの設定ファイル `config.xml` の中にある `opentelemetry_span_log` 要素を参照してください。デフォルトでは有効になっています。

タグまたは属性は、キーと値を含む 2 つの平行配列として保存されます。[ARRAY JOIN](../sql-reference/statements/select/array-join.md) を使用してこれらに対処してください。

## log-query-settings {#log-query-settings}

[log_query_settings](settings/settings.md) 設定を使用すると、クエリ実行中のクエリ設定の変更をログに記録できます。有効にすると、クエリ設定に加えられた変更は OpenTelemetry スパンログに記録されます。この機能は、クエリパフォーマンスに影響を与える可能性のある設定変更を追跡するために、特に本番環境で役立ちます。

## 監視システムとの統合 {#integration-with-monitoring-systems}

現在、ClickHouse から監視システムにトレースデータをエクスポートするための準備が整ったツールはありません。

テスト用に、[system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) テーブルに対して [URL](../engines/table-engines/special/url.md) エンジンを使用するマテリアライズドビューを設定することで、トレースコレクタの HTTP エンドポイントにログデータをプッシュすることができます。例えば、`http://localhost:9411` で稼働している Zipkin インスタンスに最小のスパンデータを Zipkin v2 JSON 形式でプッシュするには、以下の SQL を実行します。

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

エラーが発生した場合、エラーが発生したログデータの一部は静かに失われます。データが届かない場合は、サーバーログでエラーメッセージを確認してください。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse を使用した可観測性ソリューションの構築 - パート 2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
