---
'description': '주기적으로 ZooKeeper 연결의 기록을 보여줍니다 (보조 ZooKeeper 포함).'
'keywords':
- 'system table'
- 'zookeeper_connection_log'
'slug': '/operations/system-tables/zookeeper_connection_log'
'title': 'system.zookeeper_connection_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.zookeeper_connection_log

<SystemTableCloud/>

'system.zookeeper_connection_log' 테이블은 ZooKeeper 연결의 기록(보조 ZooKeeper 포함)을 보여줍니다. 각 행은 연결과 관련된 하나의 이벤트에 대한 정보를 나타냅니다.

:::note
서버 종료로 인한 연결 끊김 이벤트는 테이블에 포함되지 않습니다.
:::

컬럼:

-   `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — ZooKeeper에 연결되거나 연결이 끊어진 서버의 호스트 이름.
-   `type` ([Enum8](../../sql-reference/data-types/enum.md)) - 이벤트의 유형. 가능한 값: `Connected`, `Disconnected`.
-   `event_date` ([Date](../../sql-reference/data-types/date.md)) - 항목의 날짜.
-   `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - 항목의 시간.
-   `event_time_microseconds` ([Date](../../sql-reference/data-types/datetime64.md)) - 마이크로초 정밀도의 항목 시간.
-   `name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper 클러스터의 이름.
-   `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouse가 연결된 ZooKeeper 노드의 호스트 이름/IP.
-   `port` ([UIn16](../../sql-reference/data-types/int-uint.md)) — ClickHouse가 연결된 ZooKeeper 노드의 포트.
-   `index` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ClickHouse가 연결되거나 연결이 끊어진 ZooKeeper 노드의 인덱스. 인덱스는 ZooKeeper 구성에서 가져옵니다.
-   `client_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 연결의 세션 ID.
-   `keeper_api_version` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Keeper API 버전.
-   `enabled_feature_flags` ([Array(Enum16)](../../sql-reference/data-types/array.md)) — 활성화된 기능 플래그. ClickHouse Keeper에만 해당됩니다. 가능한 값은 `FILTERED_LIST`, `MULTI_READ`, `CHECK_NOT_EXISTS`, `CREATE_IF_NOT_EXISTS`, `REMOVE_RECURSIVE`입니다.
-   `availability_zone` ([String](../../sql-reference/data-types/string.md)) — 가용 영역.
-   `reason` ([String](../../sql-reference/data-types/string.md)) — 연결 또는 연결 끊김의 이유.

예시:

```sql
SELECT * FROM system.zookeeper_connection_log;
```

```text
    ┌─hostname─┬─type─────────┬─event_date─┬──────────event_time─┬────event_time_microseconds─┬─name───────────────┬─host─┬─port─┬─index─┬─client_id─┬─keeper_api_version─┬─enabled_feature_flags───────────────────────────────────────────────────────────────────────┬─availability_zone─┬─reason──────────────┐
 1. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:35 │ 2025-05-12 19:49:35.713067 │ zk_conn_log_test_4 │ zoo2 │ 2181 │     0 │        10 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Initialization      │
 2. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:23 │ 2025-05-12 19:49:23.981570 │ default            │ zoo1 │ 2181 │     0 │         4 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Initialization      │
 3. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:28 │ 2025-05-12 19:49:28.104021 │ default            │ zoo1 │ 2181 │     0 │         5 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Initialization      │
 4. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.459251 │ zk_conn_log_test_2 │ zoo2 │ 2181 │     0 │         6 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Initialization      │
 5. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.574312 │ zk_conn_log_test_3 │ zoo3 │ 2181 │     0 │         7 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Initialization      │
 6. │ node     │ Disconnected │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.909890 │ default            │ zoo1 │ 2181 │     0 │         5 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Config changed      │
 7. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.909895 │ default            │ zoo2 │ 2181 │     0 │         8 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Config changed      │
 8. │ node     │ Disconnected │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.912010 │ zk_conn_log_test_2 │ zoo2 │ 2181 │     0 │         6 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Config changed      │
 9. │ node     │ Connected    │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.912014 │ zk_conn_log_test_2 │ zoo3 │ 2181 │     0 │         9 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Config changed      │
10. │ node     │ Disconnected │ 2025-05-12 │ 2025-05-12 19:49:29 │ 2025-05-12 19:49:29.912061 │ zk_conn_log_test_3 │ zoo3 │ 2181 │     0 │         7 │                  0 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS','REMOVE_RECURSIVE'] │                   │ Removed from config │
    └──────────┴──────────────┴────────────┴─────────────────────┴────────────────────────────┴────────────────────┴──────┴──────┴───────┴───────────┴────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────┴───────────────────┴─────────────────────┘
```
