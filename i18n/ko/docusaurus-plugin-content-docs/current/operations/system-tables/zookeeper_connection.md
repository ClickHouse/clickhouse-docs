---
description: 'ZooKeeper가 구성된 경우에만 존재하는 system 테이블입니다. 현재 ZooKeeper(보조 ZooKeeper 포함)에 대한 연결을 표시합니다.'
keywords: ['system table', 'zookeeper_connection']
slug: /operations/system-tables/zookeeper_connection
title: 'system.zookeeper_connection'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.zookeeper_connection \{#systemzookeeper_connection\}

<SystemTableCloud />

ZooKeeper가 구성되지 않은 경우 이 테이블은 존재하지 않습니다. `system.zookeeper_connection` 테이블은 ZooKeeper(보조 ZooKeeper 포함)에 대한 현재 연결을 보여줍니다. 각 행은 하나의 연결에 대한 정보를 나타냅니다.

컬럼:

* `name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper 클러스터 이름입니다.
* `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouse가 연결된 ZooKeeper 노드의 호스트 이름/IP 주소입니다.
* `port` ([UIn16](../../sql-reference/data-types/int-uint.md)) — ClickHouse가 연결된 ZooKeeper 노드의 포트입니다.
* `index` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — ClickHouse가 연결된 ZooKeeper 노드의 인덱스입니다. 인덱스는 ZooKeeper 설정에 정의되어 있습니다. 연결되어 있지 않으면 이 컬럼은 NULL입니다.
* `connected_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 연결이 설정된 시각입니다.
* `session_uptime_elapsed_seconds` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 연결이 설정된 이후 경과한 초입니다.
* `is_expired` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 현재 연결이 만료되었는지 여부입니다.
* `keeper_api_version` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Keeper API 버전입니다.
* `client_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 연결의 세션 ID입니다.
* `xid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 현재 세션의 XID입니다.
* `enabled_feature_flags` ([Array(Enum16)](../../sql-reference/data-types/array.md)) — 활성화된 기능 플래그입니다. ClickHouse Keeper에만 적용됩니다. 가능한 값은 `FILTERED_LIST`, `MULTI_READ`, `CHECK_NOT_EXISTS`, `CREATE_IF_NOT_EXISTS`, `REMOVE_RECURSIVE`입니다.
* `availability_zone` ([String](../../sql-reference/data-types/string.md)) — 가용 영역입니다.
* `session_timeout_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 세션 타임아웃(밀리초 단위)입니다.
* `last_zxid_seen` ([Int64](../../sql-reference/data-types/int-uint.md)) — 현재 세션에서 마지막으로 확인한 zxid입니다.

예시:

```sql
SELECT * FROM system.zookeeper_connection;
```

```text
┌─name────┬─host──────┬─port─┬─index─┬──────connected_time─┬─session_uptime_elapsed_seconds─┬─is_expired─┬─keeper_api_version─┬─client_id─┬─xid─┬─enabled_feature_flags────────────────────────────────────────────────────┬─availability_zone─┐
│ default │ 127.0.0.1 │ 2181 │     0 │ 2025-04-10 14:30:00 │                            943 │          0 │                  0 │       420 │  69 │ ['FILTERED_LIST','MULTI_READ','CHECK_NOT_EXISTS','CREATE_IF_NOT_EXISTS'] │ eu-west-1b        │
└─────────┴───────────┴──────┴───────┴─────────────────────┴────────────────────────────────┴────────────┴────────────────────┴───────────┴─────┴──────────────────────────────────────────────────────────────────────────┴───────────────────┘
```
