---
'description': 'ZooKeeper가 구성되어 있을 경우에만 존재하는 시스템 테이블. 현재 ZooKeeper에 대한 연결(보조 ZooKeeper
  포함)을 보여줍니다.'
'keywords':
- 'system table'
- 'zookeeper_connection'
'slug': '/operations/system-tables/zookeeper_connection'
'title': 'system.zookeeper_connection'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.zookeeper_connection

<SystemTableCloud/>

이 테이블은 ZooKeeper가 구성되지 않은 경우 존재하지 않습니다. 'system.zookeeper_connection' 테이블은 ZooKeeper(보조 ZooKeeper 포함)에 대한 현재 연결을 보여줍니다. 각 행은 하나의 연결에 대한 정보를 표시합니다.

컬럼:

-   `name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper 클러스터의 이름.
-   `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouse가 연결된 ZooKeeper 노드의 호스트 이름/IP.
-   `port` ([UIn16](../../sql-reference/data-types/int-uint.md)) — ClickHouse가 연결된 ZooKeeper 노드의 포트.
-   `index` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — ClickHouse가 연결된 ZooKeeper 노드의 인덱스. 인덱스는 ZooKeeper 구성에서 가져온 것입니다. 연결되지 않은 경우 이 컬럼은 NULL입니다.
-   `connected_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 연결이 설정된 시간.
-   `session_uptime_elapsed_seconds` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 연결이 설정된 이후 경과된 초.
-   `is_expired` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 현재 연결이 만료되었는지 여부.
-   `keeper_api_version` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Keeper API 버전.
-   `client_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 연결의 세션 ID.
-   `xid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 현재 세션의 XID.
-   `enabled_feature_flags` ([Array(Enum16)](../../sql-reference/data-types/array.md)) — 활성화된 기능 플래그. ClickHouse Keeper에만 적용됩니다. 가능한 값은 `FILTERED_LIST`, `MULTI_READ`, `CHECK_NOT_EXISTS`, `CREATE_IF_NOT_EXISTS`, `REMOVE_RECURSIVE`입니다.
-   `availability_zone` ([String](../../sql-reference/data-types/string.md)) — 가용성 영역.

예시:

```sql
SELECT * FROM system.zookeeper_connection;
```

```text
┌─name────┬─host──────┬─port─┬─index─┬──────connected_time─┬─session_uptime_elapsed_seconds─┬─is_expired─┬─keeper_api_version─┬─client_id─┬─xid─┬─enabled_feature_flags────────────────────────────────────────────────────┬─availability_zone─┐
│ default │ 127.0.0.1 │ 2181 │     0 │ 2025-04-10 14:30:00 │                            943 │          0 │                  0 │       420 │  69 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS'] │ eu-west-1b        │
└─────────┴───────────┴──────┴───────┴─────────────────────┴────────────────────────────────┴────────────┴────────────────────┴───────────┴─────┴──────────────────────────────────────────────────────────────────────────┴───────────────────┘
```
