---
'description': '이 테이블은 ClickHouse 서버에 대한 경고 메시지를 포함하고 있습니다.'
'keywords':
- 'system table'
- 'warnings'
'slug': '/operations/system-tables/system_warnings'
'title': 'system.warnings'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.warnings

<SystemTableCloud/>

이 테이블은 ClickHouse 서버에 대한 경고를 표시합니다.
동일한 유형의 경고는 하나의 경고로 통합됩니다.
예를 들어, 첨부된 데이터베이스의 수 N이 구성 가능한 임계값 T를 초과하는 경우, N개의 별도 항목 대신 현재값 N을 포함하는 단일 항목이 표시됩니다.
현재값이 임계값 이하로 떨어지면 해당 항목은 테이블에서 제거됩니다.

테이블은 다음 설정으로 구성할 수 있습니다:

- [max_table_num_to_warn](../server-configuration-parameters/settings.md#max_table_num_to_warn)
- [max_database_num_to_warn](../server-configuration-parameters/settings.md#max_database_num_to_warn)
- [max_dictionary_num_to_warn](../server-configuration-parameters/settings.md#max_dictionary_num_to_warn)
- [max_view_num_to_warn](../server-configuration-parameters/settings.md#max_view_num_to_warn)
- [max_part_num_to_warn](../server-configuration-parameters/settings.md#max_part_num_to_warn)
- [max_pending_mutations_to_warn](../server-configuration-parameters/settings.md#max_pending_mutations_to_warn)
- [max_pending_mutations_execution_time_to_warn](/operations/server-configuration-parameters/settings#max_pending_mutations_execution_time_to_warn)
- [max_named_collection_num_to_warn](../server-configuration-parameters/settings.md#max_named_collection_num_to_warn)
- [resource_overload_warnings](/operations/settings/server-overload#resource-overload-warnings)

열:

- `message` ([String](../../sql-reference/data-types/string.md)) — 경고 메시지.
- `message_format_string` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 메시지를 형식화하는 데 사용되는 형식 문자열.

**예제**

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
