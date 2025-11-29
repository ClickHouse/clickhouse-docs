---
description: '実行されたクエリのトレーススパンに関する情報を含むシステムテーブル。'
keywords: ['システムテーブル', 'opentelemetry_span_log']
slug: /operations/system-tables/opentelemetry_span_log
title: 'system.opentelemetry_span_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.opentelemetry&#95;span&#95;log {#systemopentelemetry&#95;span&#95;log}

<SystemTableCloud />

実行されたクエリに対する [trace span](https://opentracing.io/docs/overview/spans/) に関する情報を含みます。

列:

* `trace_id` ([UUID](../../sql-reference/data-types/uuid.md)) — 実行されたクエリのトレース ID。
* `span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span` の ID。
* `parent_span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 親 `trace span` の ID。
* `operation_name` ([String](../../sql-reference/data-types/string.md)) — オペレーション名。
* `kind` ([Enum8](../../sql-reference/data-types/enum.md)) — スパンの [SpanKind](https://opentelemetry.io/docs/reference/specification/trace/api/#spankind)。
  * `INTERNAL` — スパンがアプリケーション内部のオペレーションを表すことを示します。
  * `SERVER` — スパンが同期 RPC またはその他のリモートリクエストのサーバー側処理をカバーしていることを示します。
  * `CLIENT` — スパンが何らかのリモートサービスへのリクエストを表していることを示します。
  * `PRODUCER` — スパンが非同期リクエストの起点となる処理を表していることを示します。この親スパンは、対応する子の CONSUMER スパンよりも前に終了することが多く、場合によっては子スパンが開始する前に終了します。
  * `CONSUMER` — スパンが非同期 PRODUCER リクエストの子を表していることを示します。
* `start_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span` の開始時刻（マイクロ秒）。
* `finish_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span` の終了時刻（マイクロ秒）。
* `finish_date` ([Date](../../sql-reference/data-types/date.md)) — `trace span` の終了日。
* `attribute.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — `trace span` に応じた [Attribute](https://opentelemetry.io/docs/go/instrumentation/#attributes) 名。 [OpenTelemetry](https://opentelemetry.io/) 標準の推奨事項に従って設定されます。
* `attribute.values` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — `trace span` に応じた Attribute の値。`OpenTelemetry` 標準の推奨事項に従って設定されます。

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

**関連項目**

* [OpenTelemetry](../../operations/opentelemetry.md)
