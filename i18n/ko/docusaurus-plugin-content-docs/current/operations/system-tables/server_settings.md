---
'description': '시스템 테이블로, `config.xml`에 지정된 서버의 전역 설정에 대한 정보를 포함합니다.'
'keywords':
- 'system table'
- 'server_settings'
'slug': '/operations/system-tables/server_settings'
'title': 'system.server_settings'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.server_settings

<SystemTableCloud/>

서버에 대한 전역 설정 정보를 포함하며, 이 설정은 `config.xml`에 지정됩니다.  
현재 이 테이블은 `config.xml`의 첫 번째 레이어에서만 설정을 표시하며, 중첩된 구성(예: [logger](../../operations/server-configuration-parameters/settings.md#logger))은 지원하지 않습니다.

컬럼:

- `name` ([String](../../sql-reference/data-types/string.md)) — 서버 설정 이름.
- `value` ([String](../../sql-reference/data-types/string.md)) — 서버 설정 값.
- `default` ([String](../../sql-reference/data-types/string.md)) — 서버 설정 기본값.
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 설정이 `config.xml`에 지정되었는지 여부를 나타냅니다.
- `description` ([String](../../sql-reference/data-types/string.md)) — 간단한 서버 설정 설명.
- `type` ([String](../../sql-reference/data-types/string.md)) — 서버 설정 값 유형.
- `changeable_without_restart` ([Enum8](../../sql-reference/data-types/enum.md)) — 서버 런타임에서 설정을 변경할 수 있는지 여부. 값:
  - `'No' `
  - `'IncreaseOnly'`
  - `'DecreaseOnly'`
  - `'Yes'`
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 설정이 더 이상 사용되지 않는지 여부를 나타냅니다.

**예제**

다음 예제는 이름에 `thread_pool`이 포함된 서버 설정 정보를 가져오는 방법을 보여줍니다.

```sql
SELECT *
FROM system.server_settings
WHERE name LIKE '%thread_pool%'
```

```text
┌─name──────────────────────────────────────────┬─value─┬─default─┬─changed─┬─description─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─type───┬─changeable_without_restart─┬─is_obsolete─┐
│ max_thread_pool_size                          │ 10000 │ 10000   │       0 │ The maximum number of threads that could be allocated from the OS and used for query execution and background operations.                           │ UInt64 │                         No │           0 │
│ max_thread_pool_free_size                     │ 1000  │ 1000    │       0 │ The maximum number of threads that will always stay in a global thread pool once allocated and remain idle in case of insufficient number of tasks. │ UInt64 │                         No │           0 │
│ thread_pool_queue_size                        │ 10000 │ 10000   │       0 │ The maximum number of tasks that will be placed in a queue and wait for execution.                                                                  │ UInt64 │                         No │           0 │
│ max_io_thread_pool_size                       │ 100   │ 100     │       0 │ The maximum number of threads that would be used for IO operations                                                                                  │ UInt64 │                         No │           0 │
│ max_io_thread_pool_free_size                  │ 0     │ 0       │       0 │ Max free size for IO thread pool.                                                                                                                   │ UInt64 │                         No │           0 │
│ io_thread_pool_queue_size                     │ 10000 │ 10000   │       0 │ Queue size for IO thread pool.                                                                                                                      │ UInt64 │                         No │           0 │
│ max_active_parts_loading_thread_pool_size     │ 64    │ 64      │       0 │ The number of threads to load active set of data parts (Active ones) at startup.                                                                    │ UInt64 │                         No │           0 │
│ max_outdated_parts_loading_thread_pool_size   │ 32    │ 32      │       0 │ The number of threads to load inactive set of data parts (Outdated ones) at startup.                                                                │ UInt64 │                         No │           0 │
│ max_unexpected_parts_loading_thread_pool_size │ 32    │ 32      │       0 │ The number of threads to load inactive set of data parts (Unexpected ones) at startup.                                                              │ UInt64 │                         No │           0 │
│ max_parts_cleaning_thread_pool_size           │ 128   │ 128     │       0 │ The number of threads for concurrent removal of inactive data parts.                                                                                │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_size               │ 1000  │ 1000    │       0 │ The maximum number of threads that would be used for IO operations for BACKUP queries                                                               │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_free_size          │ 0     │ 0       │       0 │ Max free size for backups IO thread pool.                                                                                                           │ UInt64 │                         No │           0 │
│ backups_io_thread_pool_queue_size             │ 0     │ 0       │       0 │ Queue size for backups IO thread pool.                                                                                                              │ UInt64 │                         No │           0 │
└───────────────────────────────────────────────┴───────┴─────────┴─────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴────────────────────────────┴─────────────┘

```

`WHERE changed`를 사용하는 것은 유용할 수 있습니다. 예를 들어, 구성 파일의 설정이 올바르게 로드되고 사용되고 있는지 확인하고 싶을 때 유용합니다.

<!-- -->

```sql
SELECT * FROM system.server_settings WHERE changed AND name='max_thread_pool_size'
```

**참고**

- [Settings](../../operations/system-tables/settings.md)
- [Configuration Files](../../operations/configuration-files.md)
- [Server Settings](../../operations/server-configuration-parameters/settings.md)
