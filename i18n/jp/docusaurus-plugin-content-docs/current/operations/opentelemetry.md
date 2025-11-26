---
description: 'ClickHouse における OpenTelemetry を用いた分散トレーシングおよびメトリクス収集のためのガイド'
sidebar_label: 'OpenTelemetry による ClickHouse のトレーシング'
sidebar_position: 62
slug: /operations/opentelemetry
title: 'OpenTelemetry による ClickHouse のトレーシング'
doc_type: 'guide'
---

[OpenTelemetry](https://opentelemetry.io/) は、分散アプリケーションからトレースとメトリクスを収集するためのオープンな標準仕様です。ClickHouse は OpenTelemetry を一部サポートしています。



## ClickHouse へのトレースコンテキストの指定 {#supplying-trace-context-to-clickhouse}

ClickHouse は、[W3C 勧告](https://www.w3.org/TR/trace-context/) で説明されているトレースコンテキスト HTTP ヘッダーを受け付けます。また、ClickHouse サーバー間やクライアントとサーバー間の通信に使用されるネイティブプロトコルを介して渡されるトレースコンテキストも受け付けます。手動でテストする場合、Trace Context 勧告に準拠したトレースコンテキストヘッダーは、`clickhouse-client` に対して `--opentelemetry-traceparent` および `--opentelemetry-tracestate` フラグを使用して指定できます。

親トレースコンテキストが指定されていない場合、または指定されたトレースコンテキストが上記の W3C 標準に準拠していない場合、ClickHouse は新しいトレースを開始します。その発生確率は、[opentelemetry_start_trace_probability](/operations/settings/settings#opentelemetry_start_trace_probability) 設定で制御されます。



## トレースコンテキストの伝播 {#propagating-the-trace-context}

トレースコンテキストは、次の場合に下流のサービスへ伝播されます。

* [Distributed](../engines/table-engines/special/distributed.md) テーブルエンジンを使用する場合など、リモートの ClickHouse サーバーに対してクエリを実行する場合。

* [url](../sql-reference/table-functions/url.md) テーブル関数を使用する場合。この場合、トレースコンテキスト情報は HTTP ヘッダーで送信されます。



## ClickHouse 自体のトレース {#tracing-the-clickhouse-itself}

ClickHouse は、各クエリおよびクエリ計画や分散クエリなど一部のクエリ実行ステージごとに `trace spans` を作成します。

トレース情報を有用にするには、[Jaeger](https://jaegertracing.io/) や [Prometheus](https://prometheus.io/) など、OpenTelemetry をサポートするモニタリングシステムにエクスポートする必要があります。ClickHouse は特定のモニタリングシステムへの依存を避け、代わりにシステムテーブルを通じてのみトレースデータを提供します。標準で[要求されている](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/overview.md#span) OpenTelemetry のトレーススパン情報は、[system.opentelemetry_span_log](../operations/system-tables/opentelemetry_span_log.md) テーブルに保存されます。

このテーブルを利用するには、サーバー設定で有効化されている必要があります。デフォルトの設定ファイル `config.xml` 内の `opentelemetry_span_log` 要素を参照してください。デフォルトでは有効になっています。

タグまたは属性は、キーと値を含む 2 つの並列配列として保存されます。これらを扱うには [ARRAY JOIN](../sql-reference/statements/select/array-join.md) を使用します。



## Log-query-settings {#log-query-settings}

[log_query_settings](settings/settings.md) 設定を有効にすると、クエリの実行中に行われたクエリ設定の変更内容をログとして記録できるようになります。有効化されている場合、クエリ設定に対して行われたあらゆる変更は OpenTelemetry のスパンログに記録されます。この機能は、本番環境においてクエリ性能に影響を与えうる設定変更を追跡するのに特に有用です。



## 監視システムとの統合

現時点では、ClickHouse から監視システムへトレースデータをエクスポートするための既製ツールは用意されていません。

テスト用途として、[system.opentelemetry&#95;span&#95;log](../operations/system-tables/opentelemetry_span_log.md) テーブルに対して [URL](../engines/table-engines/special/url.md) エンジンを使用したマテリアライズドビューをセットアップすることで、受信したログデータをトレースコレクターの HTTP エンドポイントに送信できます。例えば、`http://localhost:9411` で稼働している Zipkin インスタンスに、Zipkin v2 の JSON フォーマットで最小限の span データを送信するには、次のようにします。

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

エラーが発生した場合、そのエラーが発生した対象のログデータの一部は、エラーを通知することなく失われます。データが届かない場合は、サーバーログでエラーメッセージを確認してください。


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse を用いたオブザーバビリティソリューションの構築 - パート 2: トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
