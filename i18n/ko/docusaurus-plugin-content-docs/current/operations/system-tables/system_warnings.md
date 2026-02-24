---
description: '이 테이블에는 ClickHouse 서버와 관련된 경고 메시지가 포함됩니다.'
keywords: [ '시스템 테이블', '경고' ]
slug: /operations/system-tables/system_warnings
title: 'system.warnings'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.warnings \{#systemwarnings\}

<SystemTableCloud />

이 테이블은 ClickHouse 서버에 대한 경고를 표시합니다.
동일한 유형의 경고는 하나의 경고로 합쳐집니다.
예를 들어, 연결된 데이터베이스 수 N이 구성 가능한 임계값 T를 초과하는 경우 N개의 개별 항목 대신 현재 값 N을 포함하는 단일 항목이 표시됩니다.
현재 값이 임계값 아래로 떨어지면 해당 항목은 테이블에서 제거됩니다.

이 테이블은 다음 설정으로 구성할 수 있습니다:

* [max&#95;table&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_table_num_to_warn)
* [max&#95;database&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_database_num_to_warn)
* [max&#95;dictionary&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_dictionary_num_to_warn)
* [max&#95;view&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_view_num_to_warn)
* [max&#95;part&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_part_num_to_warn)
* [max&#95;pending&#95;mutations&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_pending_mutations_to_warn)
* [max&#95;pending&#95;mutations&#95;execution&#95;time&#95;to&#95;warn](/operations/server-configuration-parameters/settings#max_pending_mutations_execution_time_to_warn)
* [max&#95;named&#95;collection&#95;num&#95;to&#95;warn](../server-configuration-parameters/settings.md#max_named_collection_num_to_warn)
* [resource&#95;overload&#95;warnings](/operations/settings/server-overload#resource-overload-warnings)

컬럼:

* `message` ([String](../../sql-reference/data-types/string.md)) — 경고 메시지입니다.
* `message_format_string` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 메시지를 포맷할 때 사용되는 포맷 문자열입니다.

**예시**

쿼리:

```sql
 SELECT * FROM system.warnings LIMIT 2 \G;
```

결과:

```text
Row 1:
──────
message:               The number of active parts is more than 10.
message_format_string: The number of active parts is more than {}.

Row 2:
──────
message:               The number of attached databases is more than 2.
message_format_string: The number of attached databases is more than {}.
```
