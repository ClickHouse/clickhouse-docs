---
description: '계측 포인트를 포함하는 시스템 테이블'
keywords: ['시스템 테이블', '계측']
slug: /operations/system-tables/instrumentation
title: 'system.instrumentation'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.instrumentation \{#systeminstrumentation\}

<SystemTableCloud />

LLVM의 XRay 기능을 사용한 계측 지점을 포함합니다.

Columns:

* `id` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 계측 지점의 ID입니다.
* `function_id` ([Int32](../../sql-reference/data-types/int-uint.md)) — ELF 바이너리의 `xray_instr_map` 섹션에서 함수에 할당된 ID입니다.
* `function_name` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 함수를 계측하는 데 사용되는 이름입니다.
* `handler` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 핸들러 유형입니다.
* `entry_type` ([Enum(&#39;Entry&#39; = 0, &#39;Exit&#39; = 1, &#39;EntryAndExit&#39; = 2)](../../sql-reference/data-types/enum.md)) — 진입 유형입니다: `Entry`, `Exit` 또는 `EntryAndExit`입니다.
* `symbol` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 완전한 디맹글링 심볼입니다.
* `parameters` ([Array(Dynamic)](../../sql-reference/data-types/array.md)) — 핸들러 호출의 매개변수입니다.

**예시**

```sql
SELECT * FROM system.instrumentation FORMAT Vertical;
```

```text
Row 1:
──────
id:            0
function_id:   231280
function_name: QueryMetricLog::startQuery
handler:       log
entry_type:    Entry
symbol:        DB::QueryMetricLog::startQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>, unsigned long)
parameters:    ['test']

Row 2:
──────
id:            1
function_id:   231280
function_name: QueryMetricLog::startQuery
handler:       profile
entry_type:    EntryAndExit
symbol:        DB::QueryMetricLog::startQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>, unsigned long)
parameters:    []

Row 3:
──────
id:            2
function_id:   231280
function_name: QueryMetricLog::startQuery
handler:       sleep
entry_type:    Exit
symbol:        DB::QueryMetricLog::startQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>, unsigned long)
parameters:    [0.3]

3 rows in set. Elapsed: 0.302 sec.
```

**참고 항목**

* [SYSTEM INSTRUMENT](../../sql-reference/statements/system.md#instrument) — 계측 포인트를 추가하거나 제거합니다.
* [system.trace&#95;log](../../operations/system-tables/trace_log.md) — 프로파일링 로그를 확인합니다.
* [system.symbols](../../operations/system-tables/symbols.md) — 계측 포인트로 사용할 심볼을 확인합니다.
