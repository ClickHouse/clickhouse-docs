---
'description': 'ZooKeeper 서버에 대한 요청의 매개변수와 그로부터의 응답에 대한 정보를 포함하는 시스템 테이블.'
'keywords':
- 'system table'
- 'zookeeper_log'
'slug': '/operations/system-tables/zookeeper_log'
'title': 'system.zookeeper_log'
'doc_type': 'reference'
---


# system.zookeeper_log

이 표는 ZooKeeper 서버에 대한 요청의 매개변수와 그에 대한 응답 정보를 포함합니다.

요청의 경우 요청 매개변수가 있는 열만 채워지며, 나머지 열은 기본값(`0` 또는 `NULL`)으로 채워집니다. 응답이 도착하면 응답의 데이터가 다른 열에 추가됩니다.

요청 매개변수가 있는 열:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트명.
- `type` ([Enum](../../sql-reference/data-types/enum.md)) — ZooKeeper 클라이언트에서의 이벤트 유형. 다음 값 중 하나를 가질 수 있습니다:
  - `Request` — 요청이 전송되었습니다.
  - `Response` — 응답을 받았습니다.
  - `Finalize` — 연결이 끊어졌으며, 응답을 받지 못했습니다.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 이벤트가 발생한 날짜.
- `event_time` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 이벤트가 발생한 날짜와 시간.
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 요청을 만들기 위해 사용된 ZooKeeper 서버의 IP 주소.
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 요청을 만들기 위해 사용된 ZooKeeper 서버의 포트.
- `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 서버가 각 연결을 위해 설정하는 세션 ID.
- `xid` ([Int32](../../sql-reference/data-types/int-uint.md)) — 세션 내 요청의 ID. 이는 일반적으로 순차 요청 번호입니다. 요청 행과 연결된 `response`/`finalize` 행이 동일합니다.
- `has_watch` ([UInt8](../../sql-reference/data-types/int-uint.md)) — [watch](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#ch_zkWatches)가 설정되었는지를 나타내는 요청 여부.
- `op_num` ([Enum](../../sql-reference/data-types/enum.md)) — 요청 또는 응답의 유형.
- `path` ([String](../../sql-reference/data-types/string.md)) — 요청에서 지정된 ZooKeeper 노드의 경로, 요청이 경로 지정을 요구하지 않는 경우 빈 문자열.
- `data` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper 노드에 기록된 데이터(예: `SET` 및 `CREATE` 요청 — 요청이 쓰기를 원했던 내용, `GET` 요청에 대한 응답 — 읽은 내용) 또는 빈 문자열.
- `is_ephemeral` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 노드가 [ephemeral](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Ephemeral+Nodes)로 생성되고 있는지 여부.
- `is_sequential` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 노드가 [sequential](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Sequence+Nodes+--+Unique+Naming)로 생성되고 있는지 여부.
- `version` ([Nullable(Int32)](../../sql-reference/data-types/nullable.md)) — 요청 수행 시 요청된 ZooKeeper 노드의 버전. 이는 `CHECK`, `SET`, `REMOVE` 요청에 대해 지원되며 (버전을 확인하지 않는 요청의 경우는 `-1` 또는 다른 요청에서 버전 확인을 지원하지 않는 경우 `NULL`).
- `requests_size` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 다중 요청에 포함된 요청의 수 (연속적인 일반 요청 여러 개로 구성된 특별한 요청으로, 원자적으로 실행됨). 다중 요청에 포함된 모든 요청은 동일한 `xid`를 가집니다.
- `request_idx` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 다중 요청에 포함된 요청의 번호 (다중 요청에 대해선 `0`, 이후 `1`부터 순서대로).

응답 매개변수가 있는 열:

- `zxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 트랜잭션 ID. 성공적으로 실행된 요청에 대한 ZooKeeper 서버가 발급한 일련 번호(`0`은 요청이 실행되지 않았거나 오류가 발생했거나 클라이언트가 요청이 실행되었는지 모를 경우).
- `error` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — 오류 코드. 많은 값을 가질 수 있으며, 여기 몇 가지 예시가 있습니다:
  - `ZOK` — 요청이 성공적으로 실행되었습니다.
  - `ZCONNECTIONLOSS` — 연결이 끊어졌습니다.
  - `ZOPERATIONTIMEOUT` — 요청 실행 시간 초과가 만료되었습니다.
  - `ZSESSIONEXPIRED` — 세션이 만료되었습니다.
  - `NULL` — 요청이 완료되었습니다.
- `watch_type` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch` 이벤트의 유형 (응답에서 `op_num` = `Watch`인 경우), 나머지 응답에 대해선: `NULL`.
- `watch_state` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch` 이벤트의 상태 (응답에서 `op_num` = `Watch`인 경우), 나머지 응답에 대해선: `NULL`.
- `path_created` ([String](../../sql-reference/data-types/string.md)) — 생성된 ZooKeeper 노드의 경로 (응답에서 `CREATE` 요청에 대해), 노드가 `sequential`로 생성된 경우 `path`와 다를 수 있습니다.
- `stat_czxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 이 ZooKeeper 노드가 생성되도록 한 변경의 `zxid`.
- `stat_mzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 이 ZooKeeper 노드가 마지막으로 수정된 변경의 `zxid`.
- `stat_pzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — 이 ZooKeeper 노드의 자식이 마지막으로 수정된 변경의 트랜잭션 ID.
- `stat_version` ([Int32](../../sql-reference/data-types/int-uint.md)) — 이 ZooKeeper 노드의 데이터 변경 수.
- `stat_cversion` ([Int32](../../sql-reference/data-types/int-uint.md)) — 이 ZooKeeper 노드의 자식 변경 수.
- `stat_dataLength` ([Int32](../../sql-reference/data-types/int-uint.md)) — 이 ZooKeeper 노드의 데이터 필드 길이.
- `stat_numChildren` ([Int32](../../sql-reference/data-types/int-uint.md)) — 이 ZooKeeper 노드의 자식 수.
- `children` ([Array(String)](../../sql-reference/data-types/array.md)) — 자식 ZooKeeper 노드의 목록 (응답에서 `LIST` 요청에 대해).

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

**참고** 

- [ZooKeeper](../../operations/tips.md#zookeeper)
- [ZooKeeper 가이드](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html)
