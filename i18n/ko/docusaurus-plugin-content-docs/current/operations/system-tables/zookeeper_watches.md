---
description: '이 ClickHouse 서버에 등록된 현재 활성화된 ZooKeeper watch를 표시하는 시스템 테이블.'
keywords: ['시스템 테이블', 'zookeeper_watches']
slug: /operations/system-tables/zookeeper_watches
title: 'system.zookeeper_watches'
doc_type: 'reference'
---

## 설명 \{#description\}

이 ClickHouse 서버가 ZooKeeper 노드(보조 ZooKeeper 인스턴스 포함)에 등록한 현재 활성 상태의 [watch](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#ch_zkWatches)를 표시합니다. 각 행은 하나의 watch를 나타냅니다.

## 컬럼 \{#columns\}

* `zookeeper_name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper 연결 이름입니다(주 연결은 `default`, 보조 연결은 해당 이름).
* `create_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — watch가 생성된 시각입니다.
* `create_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — watch가 생성된 시각이며, 마이크로초 정밀도를 가집니다.
* `path` ([String](../../sql-reference/data-types/string.md)) — 감시 중인 ZooKeeper 경로입니다.
* `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — watch를 등록한 연결의 세션 ID입니다.
* `request_xid` ([Int64](../../sql-reference/data-types/int-uint.md)) — watch를 생성한 요청의 XID입니다.
* `op_num` ([Enum](../../sql-reference/data-types/enum.md)) — watch를 생성한 요청의 타입입니다.
* `watch_type` ([Enum8](../../sql-reference/data-types/enum.md)) — watch 타입입니다. 가능한 값:
  * `Children` — 하위 노드 목록의 변화를 감시합니다(`List` 작업으로 설정됨).
  * `Exists` — 노드의 생성 또는 삭제를 감시합니다.
  * `Data` — 노드 데이터의 변화를 감시합니다(`Get` 작업으로 설정됨).

예시:

```sql
SELECT * FROM system.zookeeper_watches FORMAT Vertical;
```

```text
Row 1:
──────
zookeeper_name:           default
create_time:              2026-03-16 12:00:00
create_time_microseconds: 2026-03-16 12:00:00.123456
path:                     /clickhouse/task_queue/ddl
session_id:               106662742089334927
request_xid:              10858
op_num:                   List
watch_type:               Children
```

**관련 항목**

* [ZooKeeper](../../operations/tips.md#zookeeper)
* [ZooKeeper 안내서](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html)