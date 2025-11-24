---
'description': 'ClickHouse Keeper 또는 ZooKeeper가 구성된 경우에만 존재하는 시스템 테이블입니다. 이 테이블은 구성
  파일에 정의된 Keeper 클러스터의 데이터를 노출합니다.'
'keywords':
- 'system table'
- 'zookeeper'
'slug': '/operations/system-tables/zookeeper'
'title': 'system.zookeeper'
'doc_type': 'reference'
---


# system.zookeeper

테이블은 ClickHouse Keeper 또는 ZooKeeper가 구성되지 않은 경우 존재하지 않습니다. `system.zookeeper` 테이블은 구성 파일에 정의된 Keeper 클러스터의 데이터를 노출합니다. 쿼리는 아래와 같이 `WHERE` 절에 `path =` 조건이나 `path IN` 조건이 필요합니다. 이는 우리가 데이터 요청을 원하는 자식의 경로에 해당합니다.

쿼리 `SELECT * FROM system.zookeeper WHERE path = '/clickhouse'`는 `/clickhouse` 노드의 모든 자식에 대한 데이터를 출력합니다. 모든 루트 노드의 데이터 출력을 원할 경우, path = '/'로 작성합니다. 'path'에 지정된 경로가 존재하지 않으면 예외가 발생합니다.

쿼리 `SELECT * FROM system.zookeeper WHERE path IN ('/', '/clickhouse')`는 `/` 및 `/clickhouse` 노드의 모든 자식에 대한 데이터를 출력합니다. 지정된 'path' 컬렉션에 존재하지 않는 경로가 있는 경우 예외가 발생합니다. 이는 Keeper 경로 쿼리를 일괄적으로 수행하는 데 사용할 수 있습니다.

쿼리 `SELECT * FROM system.zookeeper WHERE path = '/clickhouse' AND zookeeperName = 'auxiliary_cluster'`는 `auxiliary_cluster` ZooKeeper 클러스터의 데이터를 출력합니다. 지정된 'auxiliary_cluster'가 존재하지 않으면 예외가 발생합니다.

컬럼:

- `name` (String) — 노드의 이름.
- `path` (String) — 노드의 경로.
- `value` (String) — 노드 값.
- `zookeeperName` (String) — 기본 또는 보조 ZooKeeper 클러스터 중 하나의 이름.
- `dataLength` (Int32) — 값의 크기.
- `numChildren` (Int32) — 자손의 수.
- `czxid` (Int64) — 노드를 생성한 트랜잭션의 ID.
- `mzxid` (Int64) — 노드를 마지막으로 변경한 트랜잭션의 ID.
- `pzxid` (Int64) — 마지막으로 자손을 삭제하거나 추가한 트랜잭션의 ID.
- `ctime` (DateTime) — 노드 생성 시간.
- `mtime` (DateTime) — 노드의 마지막 수정 시간.
- `version` (Int32) — 노드 버전: 노드가 변경된 횟수.
- `cversion` (Int32) — 추가되거나 제거된 자손의 수.
- `aversion` (Int32) — ACL 변경 횟수.
- `ephemeralOwner` (Int64) — 일시적인 노드의 경우, 이 노드를 소유하는 세션의 ID.

예제:

```sql
SELECT *
FROM system.zookeeper
WHERE path = '/clickhouse/tables/01-08/visits/replicas'
FORMAT Vertical
```

```text
Row 1:
──────
name:           example01-08-1
value:
czxid:          932998691229
mzxid:          932998691229
ctime:          2015-03-27 16:49:51
mtime:          2015-03-27 16:49:51
version:        0
cversion:       47
aversion:       0
ephemeralOwner: 0
dataLength:     0
numChildren:    7
pzxid:          987021031383
path:           /clickhouse/tables/01-08/visits/replicas

Row 2:
──────
name:           example01-08-2
value:
czxid:          933002738135
mzxid:          933002738135
ctime:          2015-03-27 16:57:01
mtime:          2015-03-27 16:57:01
version:        0
cversion:       37
aversion:       0
ephemeralOwner: 0
dataLength:     0
numChildren:    7
pzxid:          987021252247
path:           /clickhouse/tables/01-08/visits/replicas
```
