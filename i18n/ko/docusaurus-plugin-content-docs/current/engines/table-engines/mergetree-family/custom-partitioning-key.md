---
description: 'MergeTree 테이블에 사용자 정의 파티셔닝 키를 추가하는 방법을 알아봅니다.'
sidebar_label: '사용자 정의 파티셔닝 키'
sidebar_position: 30
slug: /engines/table-engines/mergetree-family/custom-partitioning-key
title: '사용자 정의 파티셔닝 키'
doc_type: 'guide'
---

# 커스텀 파티셔닝 키 \{#custom-partitioning-key\}

:::note
대부분의 경우 파티션 키는 필요하지 않으며, 그 외의 대부분의 경우에도 관측성(observability) 용도로 일(day) 단위 파티셔닝을 사용하는 상황을 제외하면 월(month) 단위보다 더 세밀한 파티션 키는 필요하지 않습니다.

파티셔닝을 지나치게 세밀하게 설정해서는 안 됩니다. 데이터에 대해 클라이언트 식별자나 이름으로 파티셔닝하지 마십시오. 대신 클라이언트 식별자나 이름을 ORDER BY 표현식의 첫 번째 컬럼으로 두십시오.
:::

파티셔닝은 [MergeTree 패밀리 테이블](../../../engines/table-engines/mergetree-family/mergetree.md)에 대해 사용할 수 있으며, 여기에는 [복제된 테이블(Replicated Table)](../../../engines/table-engines/mergetree-family/replication.md)과 [materialized view](/sql-reference/statements/create/view#materialized-view)가 포함됩니다.

파티션은 지정된 기준에 따라 테이블 내 레코드를 논리적으로 묶은 것입니다. 파티션은 월 단위, 일 단위, 이벤트 타입별 등과 같은 임의의 기준으로 설정할 수 있습니다. 각 파티션은 해당 데이터 조작 작업을 단순화하기 위해 별도로 저장됩니다. 데이터에 액세스할 때 ClickHouse는 가능한 한 가장 작은 파티션 집합만 사용합니다. 파티션 키를 포함하는 쿼리에서는 ClickHouse가 파티션 내의 파트와 그래뉼을 선택하기 전에 먼저 해당 파티션을 필터링하므로, 파티션은 성능을 향상시킵니다.

파티션은 [테이블을 생성](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)할 때 `PARTITION BY expr` 절에서 지정합니다. 파티션 키는 테이블 컬럼을 사용하는 임의의 표현식이 될 수 있습니다. 예를 들어 월 단위 파티셔닝을 지정하려면 `toYYYYMM(date_column)` 표현식을 사용합니다:

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

파티션 키는 [기본 키](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)와 마찬가지로 표현식 튜플이 될 수도 있습니다. 예를 들어 다음과 같습니다:

```sql
ENGINE = ReplicatedCollapsingMergeTree('/clickhouse/tables/name', 'replica1', Sign)
PARTITION BY (toMonday(StartDate), EventType)
ORDER BY (CounterID, StartDate, intHash32(UserID));
```

이 예에서는 현재 주에 발생한 이벤트 유형별로 파티셔닝을 설정합니다.

기본적으로 부동소수점 파티션 키는 지원되지 않습니다. 이를 사용하려면 설정 [allow&#95;floating&#95;point&#95;partition&#95;key](../../../operations/settings/merge-tree-settings.md#allow_floating_point_partition_key)를 활성화해야 합니다.

테이블에 새 데이터를 삽입하면 이 데이터는 기본 키로 정렬된 별도의 파트(청크)로 저장됩니다. 삽입 후 10~15분이 지나면 같은 파티션에 속한 파트들이 하나의 전체 파트로 병합됩니다.

:::info
병합 작업은 파티션 표현식 값이 동일한 데이터 파트에 대해서만 수행됩니다. 이는 **너무 세분화된 파티션을 만들지 말아야 한다**는 의미입니다(대략 1,000개를 넘는 파티션). 그렇지 않으면 파일 시스템의 파일 수와 열린 파일 디스크립터 수가 불합리하게 많아져 `SELECT` 쿼리 성능이 저하됩니다.
:::

[system.parts](../../../operations/system-tables/parts.md) 테이블을 사용하여 테이블 파트와 파티션을 조회할 수 있습니다. 예를 들어, 월별 파티셔닝이 설정된 `visits` 테이블이 있다고 가정합니다. 이때 `system.parts` 테이블에 대해 `SELECT` 쿼리를 실행해 보겠습니다:

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

`partition` 컬럼에는 파티션 이름이 포함되어 있습니다. 이 예에서는 두 개의 파티션이 있습니다: `201901` 및 `201902`. 이 컬럼의 값을 사용하여 [ALTER ... PARTITION](../../../sql-reference/statements/alter/partition.md) 쿼리에서 파티션 이름을 지정할 수 있습니다.

`name` 컬럼에는 파티션 데이터 파트의 이름이 포함됩니다. 이 컬럼을 사용하여 [ALTER ATTACH PART](/sql-reference/statements/alter/partition#attach-partitionpart) 쿼리에서 파트의 이름을 지정할 수 있습니다.

파트 이름 `201901_1_9_2_11`을(를) 살펴보면 다음과 같습니다.

* `201901`는 파티션 이름입니다.
* `1`은 데이터 블록의 최소 번호입니다.
* `9`는 데이터 블록의 최대 번호입니다.
* `2`는 청크 레벨(생성된 MergeTree의 깊이)입니다.
* `11`은 뮤테이션(mutation) 버전입니다(파트에 뮤테이션이 적용된 경우).

:::info
구형 유형 테이블의 파트 이름은 다음과 같습니다: `20190117_20190123_2_2_0` (최소 날짜 - 최대 날짜 - 최소 블록 번호 - 최대 블록 번호 - 레벨).
:::

`active` 컬럼은 파트의 상태를 표시합니다. `1`은 활성(active) 상태이고, `0`은 비활성(inactive) 상태입니다. 예를 들어 더 큰 파트로 병합된 후 남아 있는 소스 파트는 비활성 파트입니다. 손상된 데이터 파트도 비활성으로 표시됩니다.

예제에서 볼 수 있듯이 동일한 파티션에 여러 개의 서로 분리된 파트가 있습니다(예: `201901_1_3_1` 및 `201901_1_9_2`). 이는 해당 파트들이 아직 병합되지 않았음을 의미합니다. ClickHouse는 삽입된 데이터 파트를 주기적으로, 삽입 후 대략 15분 정도 지나면 병합합니다. 추가로, [OPTIMIZE](../../../sql-reference/statements/optimize.md) 쿼리를 사용하여 비정기 병합을 수행할 수 있습니다. 예:

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

비활성화된 파트는 병합 후 약 10분이 지나면 삭제됩니다.

파트와 파티션 집합을 확인하는 또 다른 방법은 테이블의 디렉터리(`/var/lib/clickhouse/data/<database>/<table>/`)로 이동하는 것입니다. 예를 들어:

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

&#39;201901&#95;1&#95;1&#95;0&#39;, &#39;201901&#95;1&#95;7&#95;1&#39; 등의 폴더는 각 파트에 해당하는 디렉터리입니다. 각 파트는 대응되는 파티션과 연관되며 특정 월의 데이터만 포함합니다(이 예시의 테이블은 월 단위로 파티션을 구성합니다).

`detached` 디렉터리에는 [DETACH](/sql-reference/statements/detach) 쿼리를 사용하여 테이블에서 분리(detach)된 파트가 저장됩니다. 손상된 파트도 삭제되지 않고 이 디렉터리로 이동됩니다. 서버는 `detached` 디렉터리에 있는 파트를 사용하지 않습니다. 이 디렉터리의 데이터는 언제든지 추가, 삭제 또는 수정할 수 있으며, [ATTACH](/sql-reference/statements/alter/partition#attach-partitionpart) 쿼리를 실행하기 전에는 서버가 이를 인지하지 못합니다.

실행 중인 서버에서는 서버가 이를 인지하지 못하므로 파일 시스템에서 파트 집합이나 해당 데이터를 수동으로 변경할 수 없습니다. 비복제 테이블의 경우 서버를 중지한 상태에서 이러한 작업을 수행할 수는 있지만 권장되지는 않습니다. 복제된 테이블(Replicated Table)의 경우 어떤 상황에서도 파트 집합을 변경할 수 없습니다.

ClickHouse에서는 파티션에 대해 삭제, 한 테이블에서 다른 테이블로의 복사, 백업 생성과 같은 여러 작업을 수행할 수 있습니다. 가능한 모든 작업 목록은 [파티션 및 파트 조작(Manipulations With Partitions and Parts)](/sql-reference/statements/alter/partition) 섹션을 참고하십시오.

## 파티션 키를 사용한 Group By 최적화 \{#group-by-optimisation-using-partition-key\}

테이블의 파티션 키와 쿼리의 GROUP BY 키 조합에 따라, 파티션마다 집계를 독립적으로 수행할 수 있는 경우가 있습니다.
이 경우 각 실행 스레드에서 나온 부분 집계 결과를 마지막에 병합할 필요가 없습니다.
각 GROUP BY 키 값이 서로 다른 두 스레드의 작업 집합에 동시에 나타날 수 없다는 보장이 있기 때문입니다.

대표적인 예는 다음과 같습니다:

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
이러한 쿼리의 성능은 테이블 레이아웃에 크게 좌우됩니다. 그렇기 때문에 이 최적화는 기본적으로 활성화되어 있지 않습니다.
:::

우수한 성능을 위한 핵심 요소는 다음과 같습니다.

* 쿼리에 포함되는 파티션 수는 충분히 커야 합니다( `max_threads / 2` 보다 커야 함). 그렇지 않으면 쿼리가 시스템 자원을 충분히 활용하지 못합니다.
* 파티션이 너무 작지 않아야 하며, 그렇지 않으면 배치 처리(batch processing)가 행 단위 처리로 퇴화합니다.
* 모든 스레드가 대략 동일한 양의 작업을 수행할 수 있도록, 파티션 크기는 서로 비슷해야 합니다.

:::info
데이터를 파티션 간에 고르게 분산하기 위해 `partition by` 절의 컬럼에 해시 함수를 하나 적용하는 것이 좋습니다.
:::

관련 설정은 다음과 같습니다.

* `allow_aggregate_partitions_independently` - 이 최적화 사용 여부를 제어합니다.
* `force_aggregate_partitions_independently` - 정확성 측면에서는 적용 가능하지만, 효율성에 대한 내부 판단 로직에 의해 비활성화되는 경우에도 이 최적화를 강제로 사용하도록 합니다.
* `max_number_of_partitions_for_independent_aggregation` - 테이블이 가질 수 있는 파티션 수의 최댓값에 대한 하드 제한입니다.
