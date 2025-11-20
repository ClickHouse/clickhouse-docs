---
'description': 'MergeTree 테이블에 사용자 정의 파티셔닝 키를 추가하는 방법을 배워보세요.'
'sidebar_label': '사용자 정의 파티셔닝 키'
'sidebar_position': 30
'slug': '/engines/table-engines/mergetree-family/custom-partitioning-key'
'title': '사용자 정의 파티셔닝 키'
'doc_type': 'guide'
---


# 사용자 정의 파티셔닝 키

:::note
대부분의 경우 파티션 키가 필요하지 않으며, 대부분의 다른 경우에는 월 단위보다 더 세분화된 파티션 키가 필요하지 않습니다. 관찰 용도를 목표로 하는 경우 하루 단위로 파티셔닝하는 것이 일반적입니다.

너무 세분화된 파티셔닝을 사용해서는 안 됩니다. 클라이언트 식별자나 이름으로 데이터를 파티셔닝하지 마십시오. 대신 클라이언트 식별자나 이름을 ORDER BY 표현식의 첫 번째 컬럼으로 설정하십시오.
:::

파티셔닝은 [MergeTree 계열 테이블](../../../engines/table-engines/mergetree-family/mergetree.md)에서 사용할 수 있으며, 여기에는 [복제 테이블](../../../engines/table-engines/mergetree-family/replication.md)과 [물리화된 뷰](/sql-reference/statements/create/view#materialized-view)가 포함됩니다.

파티션은 지정된 기준에 따라 테이블의 레코드를 논리적으로 조합한 것입니다. 월, 일 또는 이벤트 유형과 같은 임의의 기준으로 파티션을 설정할 수 있습니다. 각 파티션은 이러한 데이터 조작을 단순화하기 위해 별도로 저장됩니다. 데이터를 액세스할 때 ClickHouse는 가능한 가장 작은 파티션 집합을 사용합니다. 파티션은 파티셔닝 키를 포함한 쿼리의 성능을 향상시키는데, ClickHouse가 파티션 내의 파트와 그래뉼을 선택하기 전에 해당 파티션을 필터링하기 때문입니다.

파티션은 [테이블 생성 시](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) `PARTITION BY expr` 절에서 지정됩니다. 파티션 키는 테이블 컬럼의 어떤 표현식일 수 있습니다. 예를 들어 월 단위로 파티셔닝을 지정하려면 표현식 `toYYYYMM(date_column)`를 사용하십시오:

```sql
CREATE TABLE visits
(
    VisitDate Date,
    Hour UInt8,
    ClientID UUID
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(VisitDate)
ORDER BY Hour;
```

파티션 키는 표현식의 튜플이 될 수도 있습니다(예: [기본 키](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)와 유사). 예:

```sql
ENGINE = ReplicatedCollapsingMergeTree('/clickhouse/tables/name', 'replica1', Sign)
PARTITION BY (toMonday(StartDate), EventType)
ORDER BY (CounterID, StartDate, intHash32(UserID));
```

이 예제에서는 현재 주 동안 발생한 이벤트 유형별로 파티셔닝을 설정했습니다.

기본적으로 부동 소수점 파티션 키는 지원되지 않습니다. 사용하려면 설정 [allow_floating_point_partition_key](../../../operations/settings/merge-tree-settings.md#allow_floating_point_partition_key)를 활성화하십시오.

테이블에 새로운 데이터 삽입 시, 이 데이터는 기본 키로 정렬된 별도의 파트(청크)로 저장됩니다. 삽입한 후 10-15분 후에 동일한 파티션의 파트가 전체 파트로 병합됩니다.

:::info
병합은 파티셔닝 표현식의 동일한 값을 가진 데이터 파트에 대해서만 작동합니다. 즉, **너무 세분화된 파티션을 만들지 않아야 합니다**(약 천 개 이상의 파티션은 안 됩니다). 그렇지 않으면 파일 시스템의 지나치게 많은 파일과 열린 파일 설명자로 인해 `SELECT` 쿼리의 성능이 저하됩니다.
:::

[system.parts](../../../operations/system-tables/parts.md) 테이블을 사용하여 테이블의 파트와 파티션을 볼 수 있습니다. 예를 들어 월 단위로 파티셔닝된 `visits` 테이블이 있다고 가정해 보겠습니다. `system.parts` 테이블에 대한 `SELECT` 쿼리를 수행해 보겠습니다:

```sql
SELECT
    partition,
    name,
    active
FROM system.parts
WHERE table = 'visits'
```

```text
┌─partition─┬─name──────────────┬─active─┐
│ 201901    │ 201901_1_3_1      │      0 │
│ 201901    │ 201901_1_9_2_11   │      1 │
│ 201901    │ 201901_8_8_0      │      0 │
│ 201901    │ 201901_9_9_0      │      0 │
│ 201902    │ 201902_4_6_1_11   │      1 │
│ 201902    │ 201902_10_10_0_11 │      1 │
│ 201902    │ 201902_11_11_0_11 │      1 │
└───────────┴───────────────────┴────────┘
```

`partition` 컬럼은 파티션의 이름을 포함합니다. 이 예제에서는 두 개의 파티션이 있습니다: `201901`과 `201902`. 이 컬럼 값을 사용하여 [ALTER ... PARTITION](../../../sql-reference/statements/alter/partition.md) 쿼리에서 파티션 이름을 지정할 수 있습니다.

`name` 컬럼은 파티션 데이터 파트의 이름을 포함합니다. 이 컬럼을 사용하여 [ALTER ATTACH PART](/sql-reference/statements/alter/partition#attach-partitionpart) 쿼리에서 파트의 이름을 지정할 수 있습니다.

파트의 이름을 분석해 보겠습니다: `201901_1_9_2_11`:

- `201901`은 파티션 이름입니다.
- `1`은 데이터 블록의 최소 번호입니다.
- `9`는 데이터 블록의 최대 번호입니다.
- `2`는 청크 레벨(형성된 merge tree의 깊이)입니다.
- `11`은 변형 버전(파트가 변형된 경우)입니다.

:::info
구형 테이블의 파트는 이름: `20190117_20190123_2_2_0` (최소 날짜 - 최대 날짜 - 최소 블록 번호 - 최대 블록 번호 - 레벨)입니다.
:::

`active` 컬럼은 파트의 상태를 보여줍니다. `1`은 활성, `0`은 비활성입니다. 비활성 파트는 예를 들어 더 큰 파트로 병합 후 남은 소스 파트입니다. 손상된 데이터 파트도 비활성으로 표시됩니다.

예제에서 알 수 있듯이 동일한 파티션에 여러 개의 개별 파트가 있습니다(예: `201901_1_3_1`과 `201901_1_9_2`). 이는 이 파트들이 아직 병합되지 않았음을 의미합니다. ClickHouse는 aproximadamente 15분 후에 삽입된 데이터의 파트를 정기적으로 병합합니다. 또한 [OPTIMIZE](../../../sql-reference/statements/optimize.md) 쿼리를 사용하여 비정기적으로 병합할 수 있습니다. 예:

```sql
OPTIMIZE TABLE visits PARTITION 201902;
```

```text
┌─partition─┬─name─────────────┬─active─┐
│ 201901    │ 201901_1_3_1     │      0 │
│ 201901    │ 201901_1_9_2_11  │      1 │
│ 201901    │ 201901_8_8_0     │      0 │
│ 201901    │ 201901_9_9_0     │      0 │
│ 201902    │ 201902_4_6_1     │      0 │
│ 201902    │ 201902_4_11_2_11 │      1 │
│ 201902    │ 201902_10_10_0   │      0 │
│ 201902    │ 201902_11_11_0   │      0 │
└───────────┴──────────────────┴────────┘
```

비활성 파트는 병합 후 약 10분 후에 삭제됩니다.

부품과 파티션의 집합을 보는 또 다른 방법은 테이블의 디렉터리로 들어가는 것입니다: `/var/lib/clickhouse/data/<database>/<table>/`. 예를 들어:

```bash
/var/lib/clickhouse/data/default/visits$ ls -l
total 40
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  1 16:48 201901_1_3_1
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 16:17 201901_1_9_2_11
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 15:52 201901_8_8_0
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 15:52 201901_9_9_0
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 16:17 201902_10_10_0
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 16:17 201902_11_11_0
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 16:19 201902_4_11_2_11
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 12:09 201902_4_6_1
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  1 16:48 detached
```

폴더 '201901_1_1_0', '201901_1_7_1' 등은 파트의 디렉터리입니다. 각 파트는 해당 파티션에 관련되어 있으며 특정 월에 대한 데이터만 포함되어 있습니다(이 예제의 테이블은 월 단위로 파티셔닝됨).

`detached` 디렉토리는 [DETACH](/sql-reference/statements/detach) 쿼리를 사용하여 테이블에서 분리된 파트를 포함합니다. 손상된 파트도 삭제되는 대신 이 디렉토리로 이동됩니다. 서버는 `detached` 디렉토리의 파트를 사용하지 않습니다. 이 디렉토리에서 데이터 추가, 삭제 또는 수정을 언제든지 할 수 있습니다 – 서버는 [ATTACH](/sql-reference/statements/alter/partition#attach-partitionpart) 쿼리를 실행할 때까지 이를 알지 못합니다.

운영 중인 서버에서는 파일 시스템에서 파트 집합이나 해당 데이터를 수동으로 변경할 수 없다는 점에 유의하십시오. 서버가 중지된 경우 비복제 테이블에 대해서는 이렇게 할 수 있지만 권장되지 않습니다. 복제 테이블의 경우, 어떤 경우에도 파트 집합을 변경할 수 없습니다.

ClickHouse는 파티션으로 작업을 수행할 수 있도록 허용합니다: 삭제, 한 테이블에서 다른 테이블로 복사, 또는 백업 생성. [파트 및 파티션 조작](/sql-reference/statements/alter/partition) 섹션에서 모든 작업 목록을 참조하십시오.

## 파티션 키를 사용한 그룹화 최적화 {#group-by-optimisation-using-partition-key}

테이블의 파티션 키와 쿼리의 그룹화 키 조합에 따라 각 파티션에 대해 독립적으로 집계를 실행할 수 있을 수 있습니다. 
그러면 마지막에 모든 실행 스레드에서 부분 집계된 데이터를 병합할 필요가 없게 됩니다. 왜냐하면 우리는 각 그룹화 키 값이 두 개의 서로 다른 스레드의 작업 집합에서 나타날 수 없다는 보장을 제공했기 때문입니다.

전형적인 예는 다음과 같습니다:

```sql
CREATE TABLE session_log
(
    UserID UInt64,
    SessionID UUID
)
ENGINE = MergeTree
PARTITION BY sipHash64(UserID) % 16
ORDER BY tuple();

SELECT
    UserID,
    COUNT()
FROM session_log
GROUP BY UserID;
```

:::note
이러한 쿼리의 성능은 테이블 레이아웃에 크게 의존합니다. 따라서 최적화는 기본적으로 비활성화됩니다.
:::

좋은 성능의 주요 요소:

- 쿼리에 포함된 파티션 수가 충분히 커야 합니다(`max_threads / 2`보다 많아야 함), 그렇지 않으면 쿼리가 기계를 충분히 활용하지 못합니다.
- 파티션이 너무 작지 않아야 하므로 일괄 처리가 행 단위 처리로 전환되지 않아야 합니다.
- 파티션의 크기가 유사해야 하므로 모든 스레드가 대략 유사한 양의 작업을 수행할 수 있습니다.

:::info
데이터를 파티션 간에 고르게 분배하기 위해 `partition by` 절의 컬럼에 해시 함수를 적용하는 것이 권장됩니다.
:::

관련 설정은 다음과 같습니다:

- `allow_aggregate_partitions_independently` - 최적화 사용 가능 여부 제어
- `force_aggregate_partitions_independently` - 정확성 측면에서 적용 가능한 경우 사용 강제
- `max_number_of_partitions_for_independent_aggregation` - 테이블이 가질 수 있는 최대 파티션 수에 대한 하드 제한
