---
description: 'ZooKeeper 연결 기록(보조 ZooKeeper 포함)을 표시합니다.'
keywords: ['system table', 'zookeeper_connection_log']
slug: /operations/system-tables/zookeeper_connection_log
title: 'system.zookeeper_connection_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.zookeeper_connection_log \{#systemzookeeper_connection_log\}

<SystemTableCloud />

`system.zookeeper_connection_log` 테이블은 ZooKeeper 연결 이력(보조 ZooKeeper 포함)을 보여줍니다. 각 행은 연결과 관련된 하나의 이벤트 정보를 나타냅니다.

:::note
이 테이블에는 서버 종료로 인해 발생한 연결 종료(disconnection) 이벤트는 포함되지 않습니다.
:::

컬럼:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — ZooKeeper에 연결되거나 연결이 해제된 서버의 호스트 이름입니다.
* `type` ([Enum8](../../sql-reference/data-types/enum.md)) - 이벤트의 유형입니다. 가능한 값: `Connected`, `Disconnected`.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) - 항목이 기록된 날짜입니다.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - 항목이 기록된 시간입니다.
* `event_time_microseconds` ([Date](../../sql-reference/data-types/datetime64.md)) - 마이크로초 정밀도의 기록 시간입니다.
* `name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper 클러스터 이름입니다.
* `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouse가 연결한 ZooKeeper 노드의 호스트 이름/IP입니다.
* `port` ([UIn16](../../sql-reference/data-types/int-uint.md)) — ClickHouse가 연결한 ZooKeeper 노드의 포트입니다.
* `index` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ClickHouse가 연결하거나 연결을 해제한 ZooKeeper 노드의 인덱스입니다. ZooKeeper 설정에 정의된 인덱스입니다.
* `client_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 연결의 세션 ID입니다.
* `keeper_api_version` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Keeper API 버전입니다.
* `enabled_feature_flags` ([Array(Enum16)](../../sql-reference/data-types/array.md)) — 활성화된 기능 플래그입니다. ClickHouse Keeper에만 적용됩니다. 가능한 값은 `FILTERED_LIST`, `MULTI_READ`, `CHECK_NOT_EXISTS`, `CREATE_IF_NOT_EXISTS`, `REMOVE_RECURSIVE`입니다.
* `availability_zone` ([String](../../sql-reference/data-types/string.md)) — 가용 영역입니다.
* `reason` ([String](../../sql-reference/data-types/string.md)) — 연결 또는 연결 종료의 원인입니다.

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