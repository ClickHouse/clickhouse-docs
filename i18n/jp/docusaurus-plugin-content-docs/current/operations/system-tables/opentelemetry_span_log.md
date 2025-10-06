---
'description': 'システムテーブルは、実行されたクエリのトレーススパンに関する情報を含んでいます。'
'keywords':
- 'system table'
- 'opentelemetry_span_log'
'slug': '/operations/system-tables/opentelemetry_span_log'
'title': 'system.opentelemetry_span_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.opentelemetry_span_log

<SystemTableCloud/>

実行されたクエリのための[トレーススパン](https://opentracing.io/docs/overview/spans/)に関する情報が含まれています。

カラム:

- `trace_id` ([UUID](../../sql-reference/data-types/uuid.md)) — 実行されたクエリのトレースのID。
- `span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span`のID。
- `parent_span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 親`trace span`のID。
- `operation_name` ([String](../../sql-reference/data-types/string.md)) — 操作の名前。
- `kind` ([Enum8](../../sql-reference/data-types/enum.md)) — スパンの[SpanKind](https://opentelemetry.io/docs/reference/specification/trace/api/#spankind)。
  - `INTERNAL` — スパンがアプリケーション内の内部操作を表すことを示します。
  - `SERVER` — スパンが同期待ちのRPCまたはその他のリモートリクエストのサーバー側処理をカバーしていることを示します。
  - `CLIENT` — スパンがリモートサービスへのリクエストを説明していることを示します。
  - `PRODUCER` — スパンが非同期リクエストのイニシエーターを説明していることを示します。この親スパンは、対応する子CONSUMERスパンが開始される前に終了することがよくあります。
  - `CONSUMER` - スパンが非同期PRODUCERリクエストの子を説明していることを示します。
- `start_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span`の開始時間（マイクロ秒）。
- `finish_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span`の終了時間（マイクロ秒）。
- `finish_date` ([Date](../../sql-reference/data-types/date.md)) — `trace span`の終了日。
- `attribute.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — `trace span`に依存する[属性](https://opentelemetry.io/docs/go/instrumentation/#attributes)の名前。これらは、[OpenTelemetry](https://opentelemetry.io/)標準の推奨に従って記入されます。
- `attribute.values` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — `trace span`に依存する属性の値。これらは、`OpenTelemetry`標準の推奨に従って記入されます。

**例**

クエリ:

```sql
SELECT * FROM system.opentelemetry_span_log LIMIT 1 FORMAT Vertical;
```

結果:

```text
Row 1:
──────
trace_id:         cdab0847-0d62-61d5-4d38-dd65b19a1914
span_id:          701487461015578150
parent_span_id:   2991972114672045096
operation_name:   DB::Block DB::InterpreterSelectQuery::getSampleBlockImpl()
kind:             INTERNAL
start_time_us:    1612374594529090
finish_time_us:   1612374594529108
finish_date:      2021-02-03
attribute.names:  []
attribute.values: []
```

**関連情報**

- [OpenTelemetry](../../operations/opentelemetry.md)
