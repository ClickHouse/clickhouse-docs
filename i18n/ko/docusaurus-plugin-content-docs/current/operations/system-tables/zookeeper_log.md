---
description: 'ZooKeeper 서버에 대한 요청 파라미터와 이에 대한 응답 정보를 포함하는 시스템 테이블입니다.'
keywords: ['시스템 테이블', 'zookeeper_log']
slug: /operations/system-tables/zookeeper_log
title: 'system.zookeeper_log'
doc_type: 'reference'
---

# system.zookeeper_log \{#systemzookeeper_log\}

이 테이블에는 ZooKeeper 서버에 대한 요청의 파라미터와 그에 대한 응답의 파라미터 정보가 저장됩니다.

요청 시에는 요청 파라미터에 해당하는 컬럼만 채워지며, 나머지 컬럼은 기본값(`0` 또는 `NULL`)으로 채워집니다. 응답이 도착하면 응답에서 가져온 데이터가 나머지 컬럼에 추가됩니다.

요청 파라미터를 포함하는 컬럼:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름입니다.
* `type` ([Enum](../../sql-reference/data-types/enum.md)) — ZooKeeper 클라이언트의 이벤트 유형입니다. 다음 값 중 하나를 가질 수 있습니다.
  * `Request` — 요청이 전송되었습니다.
  * `Response` — 응답을 수신했습니다.
  * `Finalize` — 연결이 끊어졌으며 응답을 받지 못했습니다.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 이벤트가 발생한 날짜입니다.
* `event_time` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 이벤트가 발생한 날짜와 시간입니다.
* `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 요청을 보내는 데 사용된 ZooKeeper 서버의 IP 주소입니다.
* `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 요청을 보내는 데 사용된 ZooKeeper 서버의 포트입니다.
* `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 각 연결에 대해 ZooKeeper 서버가 설정하는 세션 ID입니다.
* `xid` ([Int32](../../sql-reference/data-types/int-uint.md)) — 세션 내에서 요청의 ID입니다. 일반적으로 순차적인 요청 번호입니다. 요청 행과 짝이 되는 `response`/`finalize` 행에서도 동일합니다.
* `has_watch` ([UInt8](../../sql-reference/data-types/int-uint.md)) — [watch](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#ch_zkWatches)가 설정되었는지를 나타내는 요청 플래그입니다.
* `op_num` ([Enum](../../sql-reference/data-types/enum.md)) — 요청 또는 응답의 유형입니다.
* `path` ([String](../../sql-reference/data-types/string.md)) — 요청에서 지정된 ZooKeeper 노드의 경로이거나, 요청에서 경로 지정을 요구하지 않는 경우 빈 문자열입니다.
* `data` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper 노드에 기록되는 데이터입니다 (`SET` 및 `CREATE` 요청의 경우 — 요청이 쓰고자 한 데이터, `GET` 요청에 대한 응답의 경우 — 읽힌 데이터) 또는 빈 문자열입니다.
* `is_ephemeral` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 노드가 [ephemeral 노드](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Ephemeral+Nodes)로 생성되는지 여부입니다.
* `is_sequential` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 노드가 [sequential 노드](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Sequence+Nodes+--+Unique+Naming)로 생성되는지 여부입니다.
* `version` ([Nullable(Int32)](../../sql-reference/data-types/nullable.md)) — 요청을 실행할 때 요청이 기대하는 ZooKeeper 노드의 버전입니다. `CHECK`, `SET`, `REMOVE` 요청에서 지원되며, 요청이 버전을 검사하지 않는 경우에는 `-1`, 버전 검사를 지원하지 않는 다른 요청의 경우에는 `NULL`이 사용됩니다.
* `requests_size` ([UInt32](../../sql-reference/data-types/int-uint.md)) — multi 요청에 포함된 요청의 개수입니다(여러 개의 연속된 일반 요청으로 구성되며 이를 원자적으로 실행하는 특수 요청). multi 요청에 포함된 모든 요청은 동일한 `xid`를 가집니다.
* `request_idx` ([UInt32](../../sql-reference/data-types/int-uint.md)) — multi 요청에 포함된 각 요청의 번호입니다(multi 요청 자체에 대해서는 `0`, 이후 포함된 요청들에 대해서는 `1`부터 순서대로 증가).

요청에 대한 응답 파라미터를 포함하는 컬럼:

* `zxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 트랜잭션 ID입니다. 요청이 성공적으로 실행되었을 때 ZooKeeper 서버가 발급하는 일련 번호입니다 (`0`은 요청이 실행되지 않았거나, 오류를 반환했거나, 클라이언트가 요청 실행 여부를 알지 못하는 경우를 의미합니다).
* `error` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — 오류 코드입니다. 여러 값을 가질 수 있으며, 그중 일부는 다음과 같습니다.
  * `ZOK` — 요청이 성공적으로 실행되었습니다.
  * `ZCONNECTIONLOSS` — 연결이 끊어졌습니다.
  * `ZOPERATIONTIMEOUT` — 요청 실행 제한 시간이 만료되었습니다.
  * `ZSESSIONEXPIRED` — 세션이 만료되었습니다.
  * `NULL` — 요청이 완료되었습니다.
* `watch_type` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch` 이벤트의 유형입니다 (`op_num` = `Watch`인 응답에 대해 적용되며, 나머지 응답의 경우에는 `NULL`입니다).
* `watch_state` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch` 이벤트의 상태입니다 (`op_num` = `Watch`인 응답에 대해 적용되며, 나머지 응답의 경우에는 `NULL`입니다).
* `path_created` ([String](../../sql-reference/data-types/string.md)) — 생성된 ZooKeeper 노드의 경로입니다 (`CREATE` 요청에 대한 응답의 경우). 노드가 `sequential`로 생성된 경우 `path`와 다를 수 있습니다.
* `stat_czxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 이 ZooKeeper 노드가 생성되게 한 변경의 `zxid`입니다.
* `stat_mzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 이 ZooKeeper 노드를 마지막으로 수정한 변경의 `zxid`입니다.
* `stat_pzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 이 ZooKeeper 노드의 자식 노드를 마지막으로 수정한 변경의 트랜잭션 ID입니다.
* `stat_version` ([Int32](../../sql-reference/data-types/int-uint.md)) — 이 ZooKeeper 노드 데이터에 대한 변경 횟수입니다.
* `stat_cversion` ([Int32](../../sql-reference/data-types/int-uint.md)) — 이 ZooKeeper 노드의 자식 노드에 대한 변경 횟수입니다.
* `stat_dataLength` ([Int32](../../sql-reference/data-types/int-uint.md)) — 이 ZooKeeper 노드 데이터 필드의 길이입니다.
* `stat_numChildren` ([Int32](../../sql-reference/data-types/int-uint.md)) — 이 ZooKeeper 노드의 자식 노드 수입니다.
* `children` ([Array(String)](../../sql-reference/data-types/array.md)) — 자식 ZooKeeper 노드 목록입니다 (`LIST` 요청에 대한 응답의 경우).

**예시**

쿼리:

```sql
SELECT * FROM system.zookeeper_log WHERE (session_id = '106662742089334927') AND (xid = '10858') FORMAT Vertical;
```

결과:

```text
Row 1:
──────
hostname:         clickhouse.eu-central1.internal
type:             Request
event_date:       2021-08-09
event_time:       2021-08-09 21:38:30.291792
address:          ::
port:             2181
session_id:       106662742089334927
xid:              10858
has_watch:        1
op_num:           List
path:             /clickhouse/task_queue/ddl
data:
is_ephemeral:     0
is_sequential:    0
version:          ᴺᵁᴸᴸ
requests_size:    0
request_idx:      0
zxid:             0
error:            ᴺᵁᴸᴸ
watch_type:       ᴺᵁᴸᴸ
watch_state:      ᴺᵁᴸᴸ
path_created:
stat_czxid:       0
stat_mzxid:       0
stat_pzxid:       0
stat_version:     0
stat_cversion:    0
stat_dataLength:  0
stat_numChildren: 0
children:         []

Row 2:
──────
type:             Response
event_date:       2021-08-09
event_time:       2021-08-09 21:38:30.292086
address:          ::
port:             2181
session_id:       106662742089334927
xid:              10858
has_watch:        1
op_num:           List
path:             /clickhouse/task_queue/ddl
data:
is_ephemeral:     0
is_sequential:    0
version:          ᴺᵁᴸᴸ
requests_size:    0
request_idx:      0
zxid:             16926267
error:            ZOK
watch_type:       ᴺᵁᴸᴸ
watch_state:      ᴺᵁᴸᴸ
path_created:
stat_czxid:       16925469
stat_mzxid:       16925469
stat_pzxid:       16926179
stat_version:     0
stat_cversion:    7
stat_dataLength:  0
stat_numChildren: 7
children:         ['query-0000000006','query-0000000005','query-0000000004','query-0000000003','query-0000000002','query-0000000001','query-0000000000']
```

**추가 참고**

* [ZooKeeper](../../operations/tips.md#zookeeper)
* [ZooKeeper 가이드](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html)
