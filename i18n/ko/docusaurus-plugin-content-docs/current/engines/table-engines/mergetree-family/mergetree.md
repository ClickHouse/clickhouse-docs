---
'description': '`MergeTree`-가족 테이블 엔진은 높은 데이터 수집 속도와 방대한 데이터 볼륨을 위해 설계되었습니다.'
'sidebar_label': 'MergeTree'
'sidebar_position': 11
'slug': '/engines/table-engines/mergetree-family/mergetree'
'title': 'MergeTree 테이블 엔진'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MergeTree 테이블 엔진

`MergeTree` 엔진 및 `MergeTree` 계열의 다른 엔진들(e.g. `ReplacingMergeTree`, `AggregatingMergeTree`)은 ClickHouse에서 가장 일반적으로 사용되고 가장 강력한 테이블 엔진입니다.

`MergeTree` 계열의 테이블 엔진은 높은 데이터 수집 속도와 대량의 데이터 양을 처리하기 위해 설계되었습니다. 삽입 작업은 테이블 파트를 생성하며, 이는 백그라운드 프로세스에 의해 다른 테이블 파트와 병합됩니다.

`MergeTree` 계열 테이블 엔진의 주요 기능:

- 테이블의 기본 키는 각 테이블 파트 내에서 정렬 순서를 결정합니다(클러스터링 인덱스). 기본 키는 개별 행이 아니라 8192개의 행으로 구성된 블록인 그라뉼을 참조합니다. 이를 통해 대량의 데이터 세트의 기본 키가 메인 메모리에 로드할 수 있을 만큼 작으면서도, 디스크의 데이터에 빠르게 접근할 수 있도록 합니다.

- 테이블은 임의의 파티션 표현식을 사용하여 파티셔닝할 수 있습니다. 파티션 프루닝(pruning)은 쿼리가 허용하는 경우 읽기에서 파티션이 생략되도록 보장합니다.

- 데이터는 고가용성, 장애 조치 및 제로 다운타임 업그레이드를 위해 여러 클러스터 노드에 복제될 수 있습니다. [데이터 복제](/engines/table-engines/mergetree-family/replication.md)를 참조하십시오.

- `MergeTree` 테이블 엔진은 쿼리 최적화를 지원하기 위해 다양한 통계 종류 및 샘플링 방법을 지원합니다.

:::note
비슷한 이름에도 불구하고, [Merge](/engines/table-engines/special/merge) 엔진은 `*MergeTree` 엔진과 다릅니다.
:::
## 테이블 생성하기 {#table_engine-mergetree-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [[NOT] NULL] [DEFAULT|MATERIALIZED|ALIAS|EPHEMERAL expr1] [COMMENT ...] [CODEC(codec1)] [STATISTICS(stat1)] [TTL expr1] [PRIMARY KEY] [SETTINGS (name = value, ...)],
    name2 [type2] [[NOT] NULL] [DEFAULT|MATERIALIZED|ALIAS|EPHEMERAL expr2] [COMMENT ...] [CODEC(codec2)] [STATISTICS(stat2)] [TTL expr2] [PRIMARY KEY] [SETTINGS (name = value, ...)],
    ...
    INDEX index_name1 expr1 TYPE type1(...) [GRANULARITY value1],
    INDEX index_name2 expr2 TYPE type2(...) [GRANULARITY value2],
    ...
    PROJECTION projection_name_1 (SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY]),
    PROJECTION projection_name_2 (SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY])
) ENGINE = MergeTree()
ORDER BY expr
[PARTITION BY expr]
[PRIMARY KEY expr]
[SAMPLE BY expr]
[TTL expr
    [DELETE|TO DISK 'xxx'|TO VOLUME 'xxx' [, ...] ]
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ] ]
[SETTINGS name = value, ...]
```

파라미터에 대한 자세한 설명은 [CREATE TABLE](/sql-reference/statements/create/table.md) 문을 참조하십시오.
### 쿼리 절 {#mergetree-query-clauses}
#### ENGINE {#engine}

`ENGINE` — 엔진의 이름과 파라미터입니다. `ENGINE = MergeTree()`. `MergeTree` 엔진은 파라미터가 없습니다.
#### ORDER BY {#order_by}

`ORDER BY` — 정렬 키입니다.

컬럼 이름 또는 임의의 표현식의 튜플. 예: `ORDER BY (CounterID + 1, EventDate)`.

기본 키가 정의되지 않은 경우(즉, `PRIMARY KEY`가 지정되지 않은 경우), ClickHouse는 정렬 키를 기본 키로 사용합니다.

정렬이 필요하지 않은 경우, 구문 `ORDER BY tuple()`을 사용할 수 있습니다. 또한, `create_table_empty_primary_key_by_default` 설정이 활성화된 경우, `CREATE TABLE` 문에 암묵적으로 `ORDER BY ()`가 추가됩니다. [기본 키 선택하기](#selecting-a-primary-key)를 참조하십시오.
#### PARTITION BY {#partition-by}

`PARTITION BY` — [파티셔닝 키](/engines/table-engines/mergetree-family/custom-partitioning-key.md). 선택적입니다. 대부분의 경우 파티션 키가 필요하지 않으며, 만약 파티셔닝이 필요하다면, 일반적으로 월 단위보다 더 세분화된 파티션 키는 필요하지 않습니다. 파티셔닝은 쿼리를 가속화하지 않습니다(ORDER BY 표현식과는 대조적으로). 너무 세분화된 파티셔닝을 사용해서는 안 됩니다. 클라이언트 식별자나 이름으로 데이터를 파티셔닝하지 마십시오(대신 클라이언트 식별자나 이름을 ORDER BY 표현식의 첫 번째 컬럼으로 만드십시오).

월 단위로 파티셔닝하기 위해, `toYYYYMM(date_column)` 표현식을 사용하십시오. 여기서 `date_column`은 [Date](/sql-reference/data-types/date.md) 타입의 날짜 컬럼입니다. 파티션 이름은 `"YYYYMM"` 형식을 갖습니다.
#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — 정렬 키와 [다를 경우](#choosing-a-primary-key-that-differs-from-the-sorting-key) 기본 키입니다. 선택적입니다.

정렬 키를 지정하는 것은( `ORDER BY` 절 사용) 기본 키를 암묵적으로 지정하는 것입니다. 정렬 키 외에 기본 키를 지정할 필요는 보통 없습니다.
#### SAMPLE BY {#sample-by}

`SAMPLE BY` — 샘플링 표현식입니다. 선택적입니다.

지정된 경우, 이는 기본 키에 포함되어야 합니다. 샘플링 표현식은 부unsigned 정수를 산출해야 합니다.

예: `SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`.
#### TTL {#ttl}

`TTL` — 행의 저장 기간과 자동 파트 이동의 로직을 지정하는 규칙 목록입니다 [디스크 및 볼륨 간에](#table_engine-mergetree-multiple-volumes). 선택적입니다.

표현식은 `Date` 또는 `DateTime`을 산출해야 하며, 예: `TTL date + INTERVAL 1 DAY`.

규칙의 유형 `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY`는 표현식이 만족되었을 때(현재 시간에 도달할 때) 해당 파트에 대해 수행할 동작을 지정합니다: 만료된 행 제거, 특정 디스크(`TO DISK 'xxx'`) 또는 볼륨(`TO VOLUME 'xxx'`)으로 파트 이동, 혹은 만료된 행의 값 집계. 규칙의 기본 유형은 제거(`DELETE`)입니다. 여러 규칙 목록을 지정할 수 있지만, `DELETE` 규칙은 하나만 있어야 합니다.

자세한 내용은 [컬럼 및 테이블에 대한 TTL](#table_engine-mergetree-ttl)을 참조하십시오.
#### SETTINGS {#settings}

[MergeTree 설정](../../../operations/settings/merge-tree-settings.md)을 참조하십시오.

**섹션 설정 예**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

위 예제에서는 월 단위로 파티셔닝을 설정했습니다.

또한 사용자 ID를 해시한 표현식으로 샘플링을 설정했습니다. 이를 통해 각 `CounterID`와 `EventDate`에 대해 테이블의 데이터를 의사 랜덤화할 수 있습니다. 데이터 선택 시 [SAMPLE](/sql-reference/statements/select/sample) 절을 정의하면, ClickHouse는 사용자의 하위 집합에 대해 균등하게 의사 랜덤 데이터 샘플을 반환합니다.

`index_granularity` 설정은 기본값 8192이므로 생략할 수 있습니다.

<details markdown="1">

<summary>테이블 생성에 대한 더 이상 사용되지 않는 방법</summary>

:::note
새 프로젝트에서는 이 방법을 사용하지 마십시오. 가능한 경우, 이전 프로젝트를 위의 방법으로 전환하십시오.
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] MergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

**MergeTree() 파라미터**

- `date-column` — [Date](/sql-reference/data-types/date.md) 타입의 컬럼 이름. ClickHouse는 이 컬럼을 기준으로 월별 파티션을 자동으로 생성합니다. 파티션 이름은 `"YYYYMM"` 형식입니다.
- `sampling_expression` — 샘플링을 위한 표현식.
- `(primary, key)` — 기본 키. 타입: [Tuple()](/sql-reference/data-types/tuple.md)
- `index_granularity` — 인덱스의 그라뉼러티. 인덱스의 "마크" 사이에 있는 데이터 행의 수. 값 8192는 대부분의 작업에 적합합니다.

**예**

```sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

`MergeTree` 엔진은 위의 예제와 동일한 방식으로 주요 엔진 구성 방법으로 설정됩니다.
</details>
## 데이터 저장소 {#mergetree-data-storage}

테이블은 기본 키에 의해 정렬된 데이터 파트로 구성됩니다.

데이터가 테이블에 삽입될 때, 별도의 데이터 파트가 생성되고 각 파트는 기본 키에 따라 사전식으로 정렬됩니다. 예를 들어, 기본 키가 `(CounterID, Date)`인 경우, 파트의 데이터는 `CounterID`에 따라 정렬되며, 각 `CounterID` 내에서 `Date`에 따라 정렬됩니다.

서로 다른 파티션에 속하는 데이터는 서로 다른 파트로 분리됩니다. ClickHouse는 백그라운드에서 데이터 파트를 병합하여 더 효율적인 저장을 구현합니다. 서로 다른 파티션에 속하는 파트는 병합되지 않습니다. 병합 메커니즘은 동일한 기본 키를 가진 모든 행이 같은 데이터 파트에 있을 것이라고 보장하지 않습니다.

데이터 파트는 `Wide` 또는 `Compact` 형식으로 저장될 수 있습니다. `Wide` 형식에서는 각 컬럼이 파일 시스템의 별도 파일에 저장되고, `Compact` 형식에서는 모든 컬럼이 하나의 파일에 저장됩니다. `Compact` 형식은 작고 빈번한 삽입의 성능을 향상시킬 수 있습니다.

데이터 저장 형식은 테이블 엔진의 `min_bytes_for_wide_part` 및 `min_rows_for_wide_part` 설정에 의해 제어됩니다. 데이터 파트의 바이트 또는 행 수가 해당 설정 값보다 적으면 파트는 `Compact` 형식으로 저장됩니다. 그렇지 않으면 `Wide` 형식으로 저장됩니다. 이러한 설정이 설정되지 않은 경우, 데이터 파트는 `Wide` 형식으로 저장됩니다.

각 데이터 파트는 논리적으로 그라뉼로 나뉘어 있습니다. 그라뉼은 ClickHouse가 데이터를 선택할 때 읽는 가장 작은 불가분 데이터 세트입니다. ClickHouse는 행이나 값을 나누지 않으므로 각 그라뉼에는 항상 정수 개수의 행이 포함됩니다. 그라뉼의 첫 번째 행은 행의 기본 키 값으로 표시됩니다. ClickHouse는 각 데이터 파트에 대해 마크를 저장하는 인덱스 파일을 생성합니다. 각 컬럼(기본 키에 있는지 여부에 상관없이)에 대해 ClickHouse는 동일한 마크를 저장합니다. 이러한 마크는 컬럼 파일에서 직접 데이터를 찾을 수 있도록 해줍니다.

그라뉼 크기는 테이블 엔진의 `index_granularity` 및 `index_granularity_bytes` 설정에 의해 제한됩니다. 그라뉼 내의 행 수는 행의 크기에 따라 `[1, index_granularity]` 범위 내에 있어야 합니다. 그라뉼의 크기는 행의 크기가 설정 값보다 클 경우 `index_granularity_bytes`를 초과할 수 있습니다. 이 경우 그라뉼의 크기는 행의 크기와 동일합니다.
## 쿼리에서의 기본 키 및 인덱스 {#primary-keys-and-indexes-in-queries}

`(CounterID, Date)` 기본 키를 예로 들어보겠습니다. 이 경우 정렬 및 인덱스는 다음과 같이 설명할 수 있습니다:

```text
Whole data:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Marks:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Marks numbers:   0      1      2      3      4      5      6      7      8      9      10
```

데이터 쿼리에서 다음과 같이 지정할 경우:

- `CounterID in ('a', 'h')`, 서버는 마크 범위 `[0, 3)` 및 `[6, 8)`의 데이터를 읽습니다.
- `CounterID IN ('a', 'h') AND Date = 3`, 서버는 마크 범위 `[1, 3)` 및 `[7, 8)`의 데이터를 읽습니다.
- `Date = 3`, 서버는 마크 범위 `[1, 10]`의 데이터를 읽습니다.

위의 예제는 항상 전체 스캔보다 인덱스를 사용하는 것이 더 효과적임을 보여줍니다.

스파스 인덱스는 추가 데이터를 읽을 수 있게 해줍니다. 기본 키의 단일 범위를 읽는 경우, 각 데이터 블록에서 최대 `index_granularity * 2`의 추가 행을 읽을 수 있습니다.

스파스 인덱스를 사용하면 매우 큰 수의 테이블 행을 처리할 수 있습니다. 대다수의 경우, 이러한 인덱스는 컴퓨터의 RAM에 적합합니다.

ClickHouse는 고유 기본 키를 요구하지 않습니다. 동일한 기본 키를 가진 여러 행을 삽입할 수 있습니다.

`PRIMARY KEY` 및 `ORDER BY` 절에서 `Nullable` 타입 표현식을 사용할 수 있지만 강력히 권장하지 않습니다. 이 기능을 허용하려면 [allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key) 설정을 활성화하십시오. `ORDER BY` 절에 있는 `NULL` 값에 대해서는 [NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values) 원칙이 적용됩니다.
### 기본 키 선택하기 {#selecting-a-primary-key}

기본 키의 열 수는 명시적으로 제한되지 않습니다. 데이터 구조에 따라 기본 키에 더 많은 또는 적은 열을 포함할 수 있습니다. 이는 다음과 같은 효과가 있을 수 있습니다:

- 인덱스의 성능을 향상시킵니다.

    기본 키가 `(a, b)`이면 다른 열 `c`를 추가하면 다음 조건이 충족될 경우 성능이 향상됩니다:

  - 열 `c`에 조건이 있는 쿼리가 있습니다.
  - 동일한 `(a, b)` 값에 대해 긴 데이터 범위(인덱스의 그라뉼러티보다 몇 배 더 긴)가 흔히 발생합니다. 즉, 다른 열을 추가하면 꽤 긴 데이터 범위를 건너뛸 수 있게 됩니다.

- 데이터 압축을 향상시킵니다.

    ClickHouse는 기본 키에 따라 데이터를 정렬하므로 일관성이 높을수록 압축이 더 잘 이루어집니다.

- [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) 및 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 엔진에서 데이터 파트를 병합할 때 추가 로직을 제공합니다.

    이 경우 기본 키와 다른 *정렬 키*를 지정하는 것이 의미가 있습니다.

긴 기본 키는 삽입 성능과 메모리 소비에 부정적인 영향을 미치지만, 기본 키의 추가 열은 `SELECT` 쿼리에서 ClickHouse 성능에 영향을 미치지 않습니다.

`ORDER BY tuple()` 구문을 사용하여 기본 키 없이 테이블을 생성할 수 있습니다. 이 경우 ClickHouse는 데이터를 삽입 순서로 저장합니다. `INSERT ... SELECT` 쿼리로 데이터를 삽입할 때 데이터 순서를 유지하려면 [max_insert_threads = 1](/operations/settings/settings#max_insert_threads)로 설정하십시오.

초기 순서에서 데이터를 선택하려면 [단일 스레드](/operations/settings/settings.md/#max_threads) `SELECT` 쿼리를 사용하십시오.
### 정렬 키와 다른 기본 키 선택하기 {#choosing-a-primary-key-that-differs-from-the-sorting-key}

기본 키(인덱스 파일에 각 마크에 대해 기록되는 값의 표현식)를 정렬 키(데이터 파트에서 행을 정렬하는 표현식)와 다르게 지정할 수 있습니다. 이 경우 기본 키 표현식 튜플은 정렬 키 표현식 튜플의 접두사여야 합니다.

이 기능은 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 및 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md) 테이블 엔진을 사용할 때 유용합니다. 이러한 엔진을 사용할 때 일반적으로 테이블에는 두 가지 유형의 열이 있습니다: *차원* 및 *측정*. 전형적인 쿼리는 차원에 따라 필터링하며 임의의 `GROUP BY`로 측정 열의 값을 집계합니다. SummingMergeTree 및 AggregatingMergeTree는 정렬 키의 동일한 값을 가진 행을 집계하므로, 모든 차원을 여기에 추가하는 것이 자연스러운 결과입니다. 결과적으로, 키 표현식은 긴 열 목록으로 구성되며 이 목록은 자주 새로 추가된 차원으로 업데이트되어야 합니다.

이 경우, 효율적인 범위 스캔을 제공하는 기본 키에 몇 개의 열만 남기고 나머지 차원 열을 정렬 키 튜플에 추가하는 것이 의미가 있습니다.

정렬 키의 [ALTER](/sql-reference/statements/alter/index.md) 작업은 경량 작업입니다. 새 열이 동시에 테이블과 정렬 키에 추가될 때 기존 데이터 파트는 변경될 필요가 없기 때문입니다. 기존 정렬 키가 새로운 정렬 키의 접두사이므로 새로 추가된 열에는 데이터가 없고, 테이블 수정 시 기존 및 새로운 정렬 키에 따라 데이터가 정렬됩니다.
### 쿼리에서 인덱스 및 파티션 사용하기 {#use-of-indexes-and-partitions-in-queries}

`SELECT` 쿼리의 경우, ClickHouse는 인덱스를 사용할 수 있는지 분석합니다. 인덱스는 `WHERE/PREWHERE` 절에 기본 키 또는 파티셔닝 키에 있는 컬럼 또는 표현식에 대해 고정된 접두사가 있는 동등성 또는 불평등 비교를 나타내는 표현식이 포함되어 있거나, 특정 부분 반복 함수의 표현식 및 이들 표현식의 논리 관계가 있는 경우 사용할 수 있습니다.

따라서 특정 추적 태그에 대해, 특정 태그와 날짜 범위에 대해, 특정 태그 및 날짜에 대해, 날짜 범위가 있는 여러 태그에 대해 쿼리를 빠르게 실행할 수 있습니다.

아래와 같이 구성된 엔진을 살펴보겠습니다:
```sql
ENGINE MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate)
SETTINGS index_granularity=8192
```

이 경우 쿼리에서는:

```sql
SELECT count() FROM table
WHERE EventDate = toDate(now())
AND CounterID = 34

SELECT count() FROM table
WHERE EventDate = toDate(now())
AND (CounterID = 34 OR CounterID = 42)

SELECT count() FROM table
WHERE ((EventDate >= toDate('2014-01-01')
AND EventDate <= toDate('2014-01-31')) OR EventDate = toDate('2014-05-01'))
AND CounterID IN (101500, 731962, 160656)
AND (CounterID = 101500 OR EventDate != toDate('2014-05-01'))
```

ClickHouse는 불완전한 데이터를 잘라내기 위해 기본 키 인덱스를 사용하고, 잘못된 날짜 범위에 있는 파티션을 잘라내기 위해 월별 파티셔닝 키를 사용합니다.

위 쿼리는 복잡한 표현식에 대해서도 인덱스가 사용됨을 보여줍니다. 테이블에서의 읽기는 인덱스를 사용하여 전체 스캔보다 느릴 수 없도록 조직됩니다.

아래 예에서는 인덱스를 사용할 수 없습니다.

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

ClickHouse가 쿼리 실행 시 인덱스를 사용할 수 있는지 확인하려면 [force_index_by_date](/operations/settings/settings.md/#force_index_by_date) 및 [force_primary_key](/operations/settings/settings#force_primary_key) 설정을 사용하십시오.

월별 파티셔닝 키는 적절한 범위의 날짜를 포함하는 데이터 블록만 읽을 수 있게 해줍니다. 이 경우 데이터 블록은 여러 날짜(한 달 전체에 해당할 수 있음)의 데이터를 포함할 수 있습니다. 블록 내에서 데이터는 기본 키에 따라 정렬되며, 이 기본 키는 첫 번째 열에 날짜를 포함하지 않을 수 있습니다. 따라서 기본 키 접두사를 지정하지 않고 단일 날짜 조건만 있는 쿼리를 사용할 경우, 단일 날짜에 비해 더 많은 데이터가 읽힐 수 있습니다.
### 부분 단조 기본 키에 대한 인덱스 사용하기 {#use-of-index-for-partially-monotonic-primary-keys}

예를 들어, 월의 날짜를 고려해 보겠습니다. 이들은 한 달 동안 [단조 수열](https://en.wikipedia.org/wiki/Monotonic_function)을 형성하지만, 더 긴 기간에 대해서는 단조가 아닙니다. 이는 부분적으로 단조 수열입니다. 사용자가 부분 단조 기본 키로 테이블을 만든 경우, ClickHouse는 일반적으로 스파스 인덱스를 생성합니다. 사용자가 이러한 종류의 테이블에서 데이터를 선택할 때 ClickHouse는 쿼리 조건을 분석합니다. 사용자가 인덱스의 두 마크 사이의 데이터를 얻고자 할 때, 이 두 마크가 한 달 내에 포함되면 ClickHouse는 인덱스를 사용할 수 있습니다. 왜냐하면 쿼리의 매개변수와 인덱스 마크 간의 거리를 계산할 수 있기 때문입니다.

쿼리 매개변수 범위의 기본 키 값이 단조 수열을 나타내지 않으면 ClickHouse는 인덱스를 사용할 수 없습니다. 이 경우 ClickHouse는 전체 스캔 방법을 사용합니다.

ClickHouse는 월 날짜 수열뿐만 아니라 부분적으로 단조 수열을 나타내는 모든 기본 키에 대해 이러한 논리를 사용합니다.
### 데이터 스킵 인덱스 {#table_engine-mergetree-data_skipping-indexes}

인덱스 선언은 `CREATE` 쿼리의 컬럼 섹션에 있습니다.

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

`*MergeTree` 계열의 테이블에 대해 데이터 스킵 인덱스를 지정할 수 있습니다.

이러한 인덱스는 지정된 표현식에 대한 정보를 `granularity_value` 그라뉼로 구성된 블록에서 집계합니다(그라뉼의 크기는 테이블 엔진에서 `index_granularity` 설정을 사용하여 지정됩니다). 그런 다음 이 집계는 `SELECT` 쿼리에서 사용되어 `where` 쿼리를 만족하지 않는 큰 데이터 블록을 건너뛰는 방식으로 디스크에서 읽어야 하는 데이터 양을 줄이는 데 사용됩니다.

`GRANULARITY` 절은 생략할 수 있으며, `granularity_value`의 기본값은 1입니다.

**예**

```sql
CREATE TABLE table_name
(
    u64 UInt64,
    i32 Int32,
    s String,
    ...
    INDEX idx1 u64 TYPE bloom_filter GRANULARITY 3,
    INDEX idx2 u64 * i32 TYPE minmax GRANULARITY 3,
    INDEX idx3 u64 * length(s) TYPE set(1000) GRANULARITY 4
) ENGINE = MergeTree()
...
```

위의 예의 인덱스는 ClickHouse가 다음 쿼리에서 디스크에서 읽어야 하는 데이터 양을 줄이는 데 사용할 수 있습니다:

```sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

데이터 스킵 인덱스는 복합 컬럼에도 생성할 수 있습니다:

```sql
-- on columns of type Map:
INDEX map_key_index mapKeys(map_column) TYPE bloom_filter
INDEX map_value_index mapValues(map_column) TYPE bloom_filter

-- on columns of type Tuple:
INDEX tuple_1_index tuple_column.1 TYPE bloom_filter
INDEX tuple_2_index tuple_column.2 TYPE bloom_filter

-- on columns of type Nested:
INDEX nested_1_index col.nested_col1 TYPE bloom_filter
INDEX nested_2_index col.nested_col2 TYPE bloom_filter
```
### 스킵 인덱스 유형 {#skip-index-types}

`MergeTree` 테이블 엔진은 다음 유형의 스킵 인덱스를 지원합니다. 성능 최적화를 위해 스킵 인덱스를 사용하는 방법에 대한 자세한 내용은 ["ClickHouse 데이터 스킵 인덱스 이해하기"](/optimize/skipping-indexes)를 참조하십시오.

- [`MinMax`](#minmax) 인덱스
- [`Set`](#set) 인덱스
- [`bloom_filter`](#bloom-filter) 인덱스
- [`ngrambf_v1`](#n-gram-bloom-filter) 인덱스
- [`tokenbf_v1`](#token-bloom-filter) 인덱스
#### MinMax 스킵 인덱스 {#minmax}

각 인덱스 그라뉼에 대해, 표현식의 최소 및 최대 값이 저장됩니다. 
(표현식이 `tuple` 타입인 경우, 각 튜플 요소에 대해 최소 및 최대 값을 저장합니다.)

```text title="Syntax"
minmax
```
#### Set {#set}

각 인덱스 그라뉼에 대해 지정된 표현식의 최대 `max_rows`개의 고유 값이 저장됩니다. `max_rows = 0`은 "모든 고유 값 저장"을 의미합니다.

```text title="Syntax"
set(max_rows)
```
#### Bloom filter {#bloom-filter}

각 인덱스 그라뉼에 대해 지정된 컬럼의 [bloom filter](https://en.wikipedia.org/wiki/Bloom_filter)가 저장됩니다.

```text title="Syntax"
bloom_filter([false_positive_rate])
```

`false_positive_rate` 매개변수는 0과 1 사이의 값을 가질 수 있으며(기본값: `0.025`), 양성 비율의 확률을 지정합니다(읽어야 하는 데이터 양을 늘리는 결과를 낳습니다).

지원되는 데이터 타입은 다음과 같습니다:
- `(U)Int*`
- `Float*`
- `Enum`
- `Date`
- `DateTime`
- `String`
- `FixedString`
- `Array`
- `LowCardinality`
- `Nullable`
- `UUID`
- `Map`

:::note Map 데이터 타입: 키 또는 값으로 인덱스 생성 지정
`Map` 데이터 타입의 경우, 클라이언트가 [`mapKeys`](/sql-reference/functions/tuple-map-functions.md/#mapkeys) 또는 [`mapValues`](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 함수를 사용하여 키 또는 값 중 어느 쪽을 위한 인덱스를 생성해야 하는지 지정할 수 있습니다.
:::
#### N-gram bloom filter {#n-gram-bloom-filter}

각 인덱스 그라뉼에 대해 지정된 컬럼의 [n-그램](https://en.wikipedia.org/wiki/N-gram)의 [bloom filter](https://en.wikipedia.org/wiki/Bloom_filter)가 저장됩니다.

```text title="Syntax"
ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```

| 매개변수                         | 설명 |
|----------------------------------|------|
| `n`                              | n그램 크기 |
| `size_of_bloom_filter_in_bytes`  | Bloom 필터의 바이트 단위 크기. 예를 들어 `256` 또는 `512`와 같이 큰 값을 사용할 수 있습니다. 잘 압축될 수 있기 때문입니다.|
| `number_of_hash_functions`       | Bloom 필터에서 사용되는 해시 함수의 수. |
| `random_seed` | Bloom 필터 해시 함수의 시드. |

이 인덱스는 다음 데이터 타입과만 작동합니다:
- [`String`](/sql-reference/data-types/string.md)
- [`FixedString`](/sql-reference/data-types/fixedstring.md)
- [`Map`](/sql-reference/data-types/map.md)

`ngrambf_v1`의 매개변수를 추정하기 위해, 다음 [사용자 정의 함수 (UDFs)](/sql-reference/statements/create/function.md)를 사용할 수 있습니다.

```sql title="UDFs for ngrambf_v1"
CREATE FUNCTION bfEstimateFunctions [ON CLUSTER cluster]
AS
(total_number_of_all_grams, size_of_bloom_filter_in_bits) -> round((size_of_bloom_filter_in_bits / total_number_of_all_grams) * log(2));

CREATE FUNCTION bfEstimateBmSize [ON CLUSTER cluster]
AS
(total_number_of_all_grams,  probability_of_false_positives) -> ceil((total_number_of_all_grams * log(probability_of_false_positives)) / log(1 / pow(2, log(2))));

CREATE FUNCTION bfEstimateFalsePositive [ON CLUSTER cluster]
AS
(total_number_of_all_grams, number_of_hash_functions, size_of_bloom_filter_in_bytes) -> pow(1 - exp(-number_of_hash_functions/ (size_of_bloom_filter_in_bytes / total_number_of_all_grams)), number_of_hash_functions);

CREATE FUNCTION bfEstimateGramNumber [ON CLUSTER cluster]
AS
(number_of_hash_functions, probability_of_false_positives, size_of_bloom_filter_in_bytes) -> ceil(size_of_bloom_filter_in_bytes / (-number_of_hash_functions / log(1 - exp(log(probability_of_false_positives) / number_of_hash_functions))))
```

이 함수들을 사용하려면 최소 두 개의 매개변수를 지정해야 합니다:
- `total_number_of_all_grams`
- `probability_of_false_positives`

예를 들어, 그라뉼에 `4300`개의 n그램이 있고, false positive가 `0.0001` 미만일 것으로 예상되는 경우, 다른 매개변수는 다음 쿼리를 실행하여 추정할 수 있습니다:

```sql
--- estimate number of bits in the filter
SELECT bfEstimateBmSize(4300, 0.0001) / 8 AS size_of_bloom_filter_in_bytes;

┌─size_of_bloom_filter_in_bytes─┐
│                         10304 │
└───────────────────────────────┘

--- estimate number of hash functions
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) as number_of_hash_functions

┌─number_of_hash_functions─┐
│                       13 │
└──────────────────────────┘
```

물론, 이러한 함수들을 사용하여 다른 조건의 매개변수를 추정할 수도 있습니다.
위 함수들은 여기에 있는 bloom filter 계산기와 관련이 있습니다 [여기](https://hur.st/bloomfilter).
#### Token bloom filter {#token-bloom-filter}

토큰 bloom 필터는 `ngrambf_v1`과 동일하지만 n그램 대신 토큰(비 알파벳 문자로 구분된 시퀀스)을 저장합니다.

```text title="Syntax"
tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```
#### 벡터 유사도 {#vector-similarity}

근사 최근접 이웃 검색을 지원합니다. 자세한 내용은 [여기](annindexes.md) 를 참조하십시오.
### 텍스트 (실험적) {#text}

전체 텍스트 검색을 지원합니다. 자세한 내용은 [여기](invertedindexes.md) 를 참조하십시오.
### 함수 지원 {#functions-support}

`WHERE` 절의 조건에는 컬럼으로 작업하는 함수 호출이 포함됩니다. 해당 컬럼이 인덱스의 일부인 경우, ClickHouse는 이러한 함수를 수행할 때 이 인덱스를 사용하려고 합니다. ClickHouse는 인덱스를 사용하기 위한 다양한 함수의 하위 집합을 지원합니다.

`set` 유형의 인덱스는 모든 함수에서 활용될 수 있습니다. 다른 인덱스 유형의 지원은 다음과 같습니다:

| 함수 (연산자) / 인덱스                                                                                                      | 기본 키 | minmax | ngrambf_v1 | tokenbf_v1 | bloom_filter | 텍스트 |
|----------------------------------------------------------------------------------------------------------------------------|---------|--------|------------|------------|--------------|--------|
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                                                | ✔       | ✔      | ✔          | ✔          | ✔            | ✔      |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notEquals)                                      | ✔       | ✔      | ✔          | ✔          | ✔            | ✔      |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                                          | ✔       | ✔      | ✔          | ✔          | ✗            | ✔      |
| [notLike](/sql-reference/functions/string-search-functions.md/#notLike)                                                    | ✔       | ✔      | ✔          | ✔          | ✗            | ✔      |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                                        | ✗       | ✗      | ✔          | ✔          | ✗            | ✔      |
| [startsWith](/sql-reference/functions/string-functions.md/#startsWith)                                                     | ✔       | ✔      | ✔          | ✔          | ✗            | ✔      |
| [endsWith](/sql-reference/functions/string-functions.md/#endsWith)                                                         | ✗       | ✗      | ✔          | ✔          | ✗            | ✔      |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multiSearchAny)                                     | ✗       | ✗      | ✔          | ✗          | ✗            | ✗      |
| [in](/sql-reference/functions/in-functions)                                                                                | ✔       | ✔      | ✔          | ✔          | ✔            | ✔      |
| [notIn](/sql-reference/functions/in-functions)                                                                             | ✔       | ✔      | ✔          | ✔          | ✔            | ✔      |
| [less (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                                      | ✔       | ✔      | ✗          | ✗          | ✗            | ✗      |
| [greater (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                                                | ✔       | ✔      | ✗          | ✗          | ✗            | ✗      |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessOrEquals)                                     | ✔       | ✔      | ✗          | ✗          | ✗            | ✗      |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterOrEquals)                                 | ✔       | ✔      | ✗          | ✗          | ✗            | ✗      |
| [empty](/sql-reference/functions/array-functions/#empty)                                                                  | ✔       | ✔      | ✗          | ✗          | ✗            | ✗      |
| [notEmpty](/sql-reference/functions/array-functions/#notEmpty)                                                            | ✔       | ✔      | ✗          | ✗          | ✗            | ✗      |
| [has](/sql-reference/functions/array-functions#has)                                                                       | ✗       | ✗      | ✔          | ✔          | ✔            | ✔      |
| [hasAny](/sql-reference/functions/array-functions#hasAny)                                                                 | ✗       | ✗      | ✔          | ✔          | ✔            | ✗      |
| [hasAll](/sql-reference/functions/array-functions#hasAll)                                                                 | ✗       | ✗      | ✔          | ✔          | ✔            | ✗      |
| [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken)                                                 | ✗       | ✗      | ✗          | ✔          | ✗            | ✔      |
| [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull)                                      | ✗       | ✗      | ✗          | ✔          | ✗            | ✔      |
| [hasTokenCaseInsensitive (`*`)](/sql-reference/functions/string-search-functions.md/#hasTokenCaseInsensitive)             | ✗       | ✗      | ✗          | ✔          | ✗            | ✗      |
| [hasTokenCaseInsensitiveOrNull (`*`)](/sql-reference/functions/string-search-functions.md/#hasTokenCaseInsensitiveOrNull) | ✗       | ✗      | ✗          | ✔          | ✗            | ✗      |
| [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens)                                           | ✗       | ✗      | ✗          | ✗          | ✗            | ✔      |
| [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens)                                           | ✗       | ✗      | ✗          | ✗          | ✗            | ✔      |
| [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains)                                                 | ✗       | ✗      | ✗          | ✗          | ✗            | ✔      |

인덱스의 크기가 n그램 크기보다 작은 상수 인자를 가진 함수는 `ngrambf_v1`에 의해 쿼리 최적화에 사용될 수 없습니다.

(*) `hasTokenCaseInsensitive` 및 `hasTokenCaseInsensitiveOrNull`가 효과적이려면, `tokenbf_v1` 인덱스는 소문자로 변환된 데이터에 대해 생성되어야 합니다. 예를 들어 `INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`와 같이 지정할 수 있습니다.

:::note
Bloom 필터는 false positive 일치를 가질 수 있으므로, `ngrambf_v1`, `tokenbf_v1` 및 `bloom_filter` 인덱스는 쿼리의 결과가 false로 예상되는 최적화에 사용할 수 없습니다.

예를 들어:

- 최적화할 수 있음:
  - `s LIKE '%test%'`
  - `NOT s NOT LIKE '%test%'`
  - `s = 1`
  - `NOT s != 1`
  - `startsWith(s, 'test')`
- 최적화할 수 없음:
  - `NOT s LIKE '%test%'`
  - `s NOT LIKE '%test%'`
  - `NOT s = 1`
  - `s != 1`
  - `NOT startsWith(s, 'test')`
:::
## 프로젝션 {#projections}
프로젝션은 [물리화된 뷰](/sql-reference/statements/create/view)와 비슷하지만 부분 수준에서 정의됩니다. 쿼리에서 자동으로 사용되며 일관성 보장을 제공합니다.

:::note
프로젝션을 구현할 때는 [force_optimize_projection](/operations/settings/settings#force_optimize_projection) 설정도 고려해야 합니다.
:::

`FINAL`(/sql-reference/statements/select/from#final-modifier) 수정자가 있는 `SELECT` 문에서는 프로젝션이 지원되지 않습니다.
### 프로젝션 쿼리 {#projection-query}
프로젝션 쿼리는 프로젝션을 정의하는 것입니다. 암묵적으로 부모 테이블에서 데이터를 선택합니다.
**구문**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

프로젝션은 [ALTER](/sql-reference/statements/alter/projection.md) 문으로 수정하거나 제거할 수 있습니다.
### 프로젝션 저장소 {#projection-storage}
프로젝션은 파트 디렉터리 내에 저장됩니다. 인덱스와 유사하지만 익명의 `MergeTree` 테이블 파트를 저장하는 하위 디렉터리를 포함합니다. 테이블은 프로젝션의 정의 쿼리에 의해 유도됩니다. `GROUP BY` 절이 있는 경우, 기본 스토리지 엔진은 [AggregatingMergeTree](aggregatingmergetree.md)로 변경되며 모든 집계 함수는 `AggregateFunction`으로 변환됩니다. `ORDER BY` 절이 있는 경우, `MergeTree` 테이블은 이를 기본 키 표현식으로 사용합니다. 병합 프로세스 동안 프로젝션 파트는 이를 통한 스토리지의 병합 루틴에 의해 병합됩니다. 부모 테이블 파트의 체크섬과 프로젝션의 파트가 결합됩니다. 다른 유지 관리 작업은 스킵 인덱스와 유사합니다.
### Query analysis {#projection-query-analysis}
1. 주어진 쿼리에 대해 프로젝션을 사용할 수 있는지 확인합니다. 즉, 기본 테이블에 쿼리하는 것과 동일한 결과를 생성합니다.
2. 읽을 수 있는 최소한의 세분성을 포함하는 가장 적합한 매치를 선택합니다.
3. 프로젝션을 사용하는 쿼리 파이프라인은 원래 파트를 사용하는 것과 다릅니다. 일부 파트에 프로젝션이 없는 경우, "프로젝션"을 동적으로 추가할 수 있습니다.
## Concurrent data access {#concurrent-data-access}

동시 테이블 액세스의 경우, 다중 버전 관리를 사용합니다. 즉, 테이블이 동시에 읽히고 업데이트될 때 쿼리 시점에 현재인 파트 집합에서 데이터를 읽습니다. 긴 잠금이 없습니다. 삽입이 읽기 작업을 방해하지 않습니다.

테이블에서 읽기는 자동으로 병렬화됩니다.
## TTL for columns and tables {#table_engine-mergetree-ttl}

값의 유효 기간을 결정합니다.

`TTL` 절은 전체 테이블 및 각 개별 컬럼에 대해 설정할 수 있습니다. 테이블 수준의 `TTL`은 데이터가 디스크와 볼륨 간에 자동으로 이동하는 논리 또는 모든 데이터가 만료된 파트를 재압축하는 방법을 지정할 수 있습니다.

식은 [Date](/sql-reference/data-types/date.md), [Date32](/sql-reference/data-types/date32.md), [DateTime](/sql-reference/data-types/datetime.md) 또는 [DateTime64](/sql-reference/data-types/datetime64.md) 데이터 타입으로 평가되어야 합니다.

**구문**

컬럼에 대한 시간-유효성을 설정합니다:

```sql
TTL time_column
TTL time_column + interval
```

`interval`을 정의하려면 [시간 간격](/sql-reference/operators#operators-for-working-with-dates-and-times) 연산자를 사용합니다. 예:

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```
### Column TTL {#mergetree-column-ttl}

컬럼의 값이 만료되면 ClickHouse는 해당 컬럼 데이터 타입의 기본 값으로 교체합니다. 데이터 파트의 모든 컬럼 값이 만료되면 ClickHouse는 이 컬럼을 파일 시스템의 데이터 파트에서 삭제합니다.

`TTL` 절은 키 컬럼에 대한 사용이 불가능합니다.

**예시**
#### Creating a table with `TTL`: {#creating-a-table-with-ttl}

```sql
CREATE TABLE tab
(
    d DateTime,
    a Int TTL d + INTERVAL 1 MONTH,
    b Int TTL d + INTERVAL 1 MONTH,
    c String
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(d)
ORDER BY d;
```
#### Adding TTL to a column of an existing table {#adding-ttl-to-a-column-of-an-existing-table}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 DAY;
```
#### Altering TTL of the column {#altering-ttl-of-the-column}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 MONTH;
```
### Table TTL {#mergetree-table-ttl}

테이블에는 만료된 행을 제거하기 위한 표현식 및 [디스크 또는 볼륨](#table_engine-mergetree-multiple-volumes) 간의 파트 자동 이동에 대한 여러 표현식이 있을 수 있습니다. 테이블의 행이 만료되면 ClickHouse는 모든 해당 행을 삭제합니다. 파트를 이동하거나 재압축하려면 파트의 모든 행이 `TTL` 표현식 기준을 충족해야 합니다.

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

TTL 규칙의 유형은 각 TTL 표현식 뒤에 올 수 있습니다. 이 규칙은 표현식이 만족될 때 수행할 작업에 영향을 미칩니다(현재 시간에 도달할 때):

- `DELETE` - 만료된 행 삭제(기본 동작);
- `RECOMPRESS codec_name` - `codec_name`으로 데이터 파트를 재압축합니다;
- `TO DISK 'aaa'` - 파트를 디스크 `aaa`로 이동합니다;
- `TO VOLUME 'bbb'` - 파트를 디스크 `bbb`로 이동합니다;
- `GROUP BY` - 만료된 행 집계.

`DELETE` 동작은 만료된 행의 일부만 삭제할 수 있도록 `WHERE` 절과 함께 사용할 수 있습니다:
```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

`GROUP BY` 표현식은 테이블 기본 키의 접두사여야 합니다.

컬럼이 `GROUP BY` 표현식의 일부가 아니며 `SET` 절에서 명시적으로 설정되지 않은 경우 결과 행에는 그룹화된 행에서 우연한 값이 포함됩니다(집계 함수 `any`가 적용된 것처럼).

**예시**
#### Creating a table with `TTL`: {#creating-a-table-with-ttl-1}

```sql
CREATE TABLE tab
(
    d DateTime,
    a Int
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(d)
ORDER BY d
TTL d + INTERVAL 1 MONTH DELETE,
    d + INTERVAL 1 WEEK TO VOLUME 'aaa',
    d + INTERVAL 2 WEEK TO DISK 'bbb';
```
#### Altering `TTL` of the table: {#altering-ttl-of-the-table}

```sql
ALTER TABLE tab
    MODIFY TTL d + INTERVAL 1 DAY;
```

하나의 달 이후에 만료되는 행을 포함하는 테이블을 생성합니다. 월요일인 만료된 행이 삭제됩니다:

```sql
CREATE TABLE table_with_where
(
    d DateTime,
    a Int
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(d)
ORDER BY d
TTL d + INTERVAL 1 MONTH DELETE WHERE toDayOfWeek(d) = 1;
```
#### Creating a table, where expired rows are recompressed: {#creating-a-table-where-expired-rows-are-recompressed}

```sql
CREATE TABLE table_for_recompression
(
    d DateTime,
    key UInt64,
    value String
) ENGINE MergeTree()
ORDER BY tuple()
PARTITION BY key
TTL d + INTERVAL 1 MONTH RECOMPRESS CODEC(ZSTD(17)), d + INTERVAL 1 YEAR RECOMPRESS CODEC(LZ4HC(10))
SETTINGS min_rows_for_wide_part = 0, min_bytes_for_wide_part = 0;
```

만료된 행이 집계되는 테이블을 생성합니다. 결과 행 `x`는 그룹화된 행에서 최대 값, `y`는 최소 값, `d`는 그룹화된 행에서의 우연한 값을 포함합니다.

```sql
CREATE TABLE table_for_aggregation
(
    d DateTime,
    k1 Int,
    k2 Int,
    x Int,
    y Int
)
ENGINE = MergeTree
ORDER BY (k1, k2)
TTL d + INTERVAL 1 MONTH GROUP BY k1, k2 SET x = max(x), y = min(y);
```
### Removing expired data {#mergetree-removing-expired-data}

만료된 `TTL` 데이터는 ClickHouse가 데이터 파트를 병합할 때 제거됩니다.

ClickHouse가 데이터가 만료되었음을 감지하면 비정기적 병합을 수행합니다. 이러한 병합의 빈도를 제어하려면 `merge_with_ttl_timeout`을 설정할 수 있습니다. 값이 너무 낮으면 많은 비정기적 병합이 발생하여 많은 리소스를 소모할 수 있습니다.

병합 간에 `SELECT` 쿼리를 수행하는 경우 만료된 데이터를 얻을 수 있습니다. 이를 방지하려면 `SELECT` 전에 [OPTIMIZE](/sql-reference/statements/optimize.md) 쿼리를 사용하십시오.

**참고** 

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 설정
## Disk types {#disk-types}

로컬 블록 장치 외에도 ClickHouse는 다음과 같은 스토리지 유형을 지원합니다:
- [`s3` for S3 and MinIO](#table_engine-mergetree-s3)
- [`gcs` for GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` for Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` for HDFS](/engines/table-engines/integrations/hdfs)
- [`web` for read-only from web](/operations/storing-data#web-storage)
- [`cache` for local caching](/operations/storing-data#using-local-cache)
- [`s3_plain` for backups to S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` for immutable, non-replicated tables in S3](/operations/storing-data.md#s3-plain-rewritable-storage)
## Using multiple block devices for data storage {#table_engine-mergetree-multiple-volumes}
### Introduction {#introduction}

`MergeTree` 계열 테이블 엔진은 여러 블록 장치에 데이터를 저장할 수 있습니다. 예를 들어, 특정 테이블의 데이터가 암묵적으로 "핫"과 "콜드"로 분할된 경우 유용할 수 있습니다. 가장 최근의 데이터는 정기적으로 요청되지만 소량의 공간만 필요합니다. 반면에, 두꺼운 꼬리의 역사적 데이터는 드물게 요청됩니다. 여러 디스크가 있을 경우, "핫" 데이터는 빠른 디스크(예: NVMe SSD 또는 메모리)에 위치할 수 있으며 "콜드" 데이터는 상대적으로 느린 디스크에 위치할 수 있습니다(예: HDD).

데이터 파트는 `MergeTree` 엔진 테이블의 최소 이동 가능한 단위입니다. 하나의 파트에 속하는 데이터는 하나의 디스크에 저장됩니다. 데이터 파트는 사용자 설정에 따라 백그라운드에서 디스크 간에 이동될 수 있으며, [ALTER](/sql-reference/statements/alter/partition) 쿼리를 통해서도 이동할 수 있습니다.
### Terms {#terms}

- 디스크 — 파일 시스템에 마운트된 블록 장치입니다.
- 기본 디스크 — [path](/operations/server-configuration-parameters/settings.md/#path) 서버 설정에 지정된 경로를 저장하는 디스크입니다.
- 볼륨 — 동일한 디스크의 순차적인 집합(유사 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)).
- 스토리지 정책 — 볼륨 집합 및 그들 간의 데이터 이동 규칙.

설명된 개체에 부여된 이름은 시스템 테이블 [system.storage_policies](/operations/system-tables/storage_policies) 및 [system.disks](/operations/system-tables/disks)에서 찾을 수 있습니다. 테이블에 대해 구성된 스토리지 정책 중 하나를 적용하려면 `MergeTree` 엔진 계열 테이블의 `storage_policy` 설정을 사용합니다.
### Configuration {#table_engine-mergetree-multiple-volumes_configure}

디스크, 볼륨 및 스토리지 정책은 `<storage_configuration>` 태그 안에서 `config.d` 디렉토리의 파일에 선언되어야 합니다.

:::tip
디스크는 쿼리의 `SETTINGS` 섹션에서도 선언할 수 있습니다. 이는 아드혹 분석을 위해 유용하며, 예를 들어 URL에 호스팅된 디스크를 임시로 부착할 수 있습니다.
[동적 저장소](/operations/storing-data#dynamic-configuration)에 대한 자세한 내용을 참조하십시오.
:::

구성 구조:

```xml
<storage_configuration>
    <disks>
        <disk_name_1> <!-- disk name -->
            <path>/mnt/fast_ssd/clickhouse/</path>
        </disk_name_1>
        <disk_name_2>
            <path>/mnt/hdd1/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_2>
        <disk_name_3>
            <path>/mnt/hdd2/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_3>

        ...
    </disks>

    ...
</storage_configuration>
```

태그:

- `<disk_name_N>` — 디스크 이름. 이름은 모든 디스크에서 달라야 합니다.
- `path` — 서버가 데이터를 저장할 경로(`data` 및 `shadow` 폴더), `/`로 끝나야 합니다.
- `keep_free_space_bytes` — 예약할 자유 디스크 공간의 양입니다.

디스크 정의의 순서는 중요하지 않습니다.

스토리지 정책 구성 마크업:

```xml
<storage_configuration>
    ...
    <policies>
        <policy_name_1>
            <volumes>
                <volume_name_1>
                    <disk>disk_name_from_disks_configuration</disk>
                    <max_data_part_size_bytes>1073741824</max_data_part_size_bytes>
                    <load_balancing>round_robin</load_balancing>
                </volume_name_1>
                <volume_name_2>
                    <!-- configuration -->
                </volume_name_2>
                <!-- more volumes -->
            </volumes>
            <move_factor>0.2</move_factor>
        </policy_name_1>
        <policy_name_2>
            <!-- configuration -->
        </policy_name_2>

        <!-- more policies -->
    </policies>
    ...
</storage_configuration>
```

태그:

- `policy_name_N` — 정책 이름. 정책 이름은 고유해야 합니다.
- `volume_name_N` — 볼륨 이름. 볼륨 이름은 고유해야 합니다.
- `disk` — 볼륨 내의 디스크.
- `max_data_part_size_bytes` — 볼륨의 디스크에 저장할 수 있는 파트의 최대 크기. 병합된 파트의 크기가 `max_data_part_size_bytes`보다 클 것으로 예상되면 해당 파트는 다음 볼륨에 기록됩니다. 기본적으로 이 기능은 새로운/작은 파트를 핫 (SSD) 볼륨에 유지하고, 큰 크기에 도달했을 때 콜드 (HDD) 볼륨으로 이동할 수 있도록 합니다. 정책에 단 하나의 볼륨만 있을 경우 이 설정은 사용하지 마십시오.
- `move_factor` — 사용 가능한 공간이 이 계수보다 적어지면 데이터가 다음 볼륨으로 자동으로 이동하기 시작합니다(기본값: 0.1). ClickHouse는 기존의 파트를 크기별로 내림차순으로 정렬하여 `move_factor` 조건을 충족하는 파트를 선택합니다. 모든 파트의 총 크기가 부족하면 모든 파트가 이동됩니다.
- `perform_ttl_move_on_insert` — 데이터 파트 삽입 시의 TTL 이동을 비활성화합니다. 기본적으로(활성화된 경우) 이미 TTL 이동 규칙에 의해 만료된 데이터 파트를 삽입하면 즉시 이동 규칙에 선언된 볼륨/디스크로 이동됩니다. 이 경우 목적지 볼륨/디스크가 느린 경우 삽입 속도가 크게 느려질 수 있습니다(예: S3). 비활성화하면 이미 만료된 데이터 파트가 기본 볼륨에 작성된 다음 TTL 볼륨으로 바로 이동됩니다.
- `load_balancing` - 디스크 균형을 위한 정책, `round_robin` 또는 `least_used`.
- `least_used_ttl_ms` - 모든 디스크에서 사용 가능한 공간을 업데이트하기 위한 타임아웃(millisekond 단위)(`0` - 항상 업데이트, `-1` - 업데이트하지 않음, 기본값은 `60000`). 디스크가 ClickHouse에 의해서만 사용되고 온라인 파일 시스템 크기 조정의 영향을 받지 않으면 `-1`을 사용할 수 있습니다. 다른 경우에는 권장되지 않으며, 결국 잘못된 공간 배분으로 이어질 수 있습니다.
- `prefer_not_to_merge` — 이 설정은 사용하지 않아야 합니다. 이 볼륨에서 데이터 파트의 병합을 비활성화합니다(이것은 유해하며 성능 저하를 초래합니다). 이 설정이 활성화되면(활성화하지 마시오) 이 볼륨에서 데이터 병합이 허용되지 않습니다(이는 나쁩니다). 이는 ClickHouse가 느린 디스크와 어떻게 작동하는지 통제할 수 있게 해줍니다(하지만 ClickHouse가 더 잘 알므로 이 설정은 사용하지 마십시오).
- `volume_priority` — 볼륨이 채워지는 우선순위를 정의합니다(순서). 값이 낮을수록 우선순위가 높습니다. 매개변수 값은 자연수여야 하며 1에서 N까지(가장 낮은 우선순위) 점프 없이 범위를 포괄해야 합니다.
  * 모든 볼륨에 태그가 붙어 있을 경우, 주어진 순서로 우선순위가 정해집니다.
  * 일부 볼륨만 태그가 붙어 있을 경우, 태그가 없는 볼륨은 가장 낮은 우선순위를 가지고 있으며, 구성에서 정의된 순서에 따라 우선순위가 정해집니다.
  * 태그가 없는 경우, 우선순위는 그들이 구성에 선언된 순서에 따라 정해집니다.
  * 두 볼륨은 동일한 우선순위 값을 가질 수 없습니다.

구성 예제:

```xml
<storage_configuration>
    ...
    <policies>
        <hdd_in_order> <!-- policy name -->
            <volumes>
                <single> <!-- volume name -->
                    <disk>disk1</disk>
                    <disk>disk2</disk>
                </single>
            </volumes>
        </hdd_in_order>

        <moving_from_ssd_to_hdd>
            <volumes>
                <hot>
                    <disk>fast_ssd</disk>
                    <max_data_part_size_bytes>1073741824</max_data_part_size_bytes>
                </hot>
                <cold>
                    <disk>disk1</disk>
                </cold>
            </volumes>
            <move_factor>0.2</move_factor>
        </moving_from_ssd_to_hdd>

        <small_jbod_with_external_no_merges>
            <volumes>
                <main>
                    <disk>jbod1</disk>
                </main>
                <external>
                    <disk>external</disk>
                </external>
            </volumes>
        </small_jbod_with_external_no_merges>
    </policies>
    ...
</storage_configuration>
```

주어진 예에서 `hdd_in_order` 정책은 [라운드 로빈](https://en.wikipedia.org/wiki/Round-robin_scheduling) 접근 방식을 구현합니다. 이 정책은 단일 볼륨(`single`)만 정의하며, 데이터 파트는 모든 디스크에 순환 방식으로 저장됩니다. 이 정책은 시스템에 몇 개의 유사한 디스크가 마운트되어 있지만 RAID가 구성되지 않은 경우 매우 유용합니다. 각 개별 디스크 드라이브는 신뢰할 수 없으며, 복제 계수를 3 이상으로 보완할 수 있습니다.

시스템에 서로 다른 종류의 디스크가 있는 경우 `moving_from_ssd_to_hdd` 정책을 대신 사용할 수 있습니다. 볼륨 `hot`은 SSD 디스크(`fast_ssd`)로 구성되어 있으며, 이 볼륨에 저장할 수 있는 파트의 최대 크기는 1GB입니다. 1GB보다 큰 모든 파트는 HDD 디스크 `disk1`을 포함하는 `cold` 볼륨에 직접 저장됩니다.
또한, 디스크 `fast_ssd`가 80% 이상 채워지면 데이터를 백그라운드 프로세스를 통해 `disk1`으로 전송합니다.

스토리지 정책 내에서 볼륨 나열 순서는 적어도 하나의 볼륨에 명시적인 `volume_priority` 매개변수가 없는 경우 중요합니다.
하나의 볼륨이 과도하게 채워지면 데이터가 다음 볼륨으로 이동됩니다. 디스크 나열 순서도 중요하며, 데이터는 순차적으로 저장됩니다.

테이블을 생성할 때 구성된 스토리지 정책 중 하나를 적용할 수 있습니다:

```sql
CREATE TABLE table_with_non_default_policy (
    EventDate Date,
    OrderID UInt64,
    BannerID UInt64,
    SearchPhrase String
) ENGINE = MergeTree
ORDER BY (OrderID, BannerID)
PARTITION BY toYYYYMM(EventDate)
SETTINGS storage_policy = 'moving_from_ssd_to_hdd'
```

`default` 스토리지 정책은 `<path>`에 지정된 단일 디스크로만 구성된 단일 볼륨을 사용하는 것을 의미합니다.
[ALTER TABLE ... MODIFY SETTING] 쿼리로 테이블 생성 후 스토리지 정책을 변경할 수 있으며, 새로운 정책에는 동일한 이름의 모든 이전 디스크 및 볼륨이 포함되어야 합니다.

백그라운드에서 데이터 파트 이동을 수행하는 스레드 수는 [background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size) 설정으로 변경할 수 있습니다.
### Details {#details}

`MergeTree` 테이블의 경우, 데이터는 다양한 방법으로 디스크에 저장됩니다:

- 삽입(`INSERT` 쿼리)의 결과로.
- 백그라운드 병합 및 [변형](/sql-reference/statements/alter#mutations) 동안.
- 다른 복제본에서 다운로드할 때.
- 파티션 동결의 결과로 [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition).

변형 및 파티션 동결을 제외한 모든 경우에, 파트는 주어진 스토리지 정책에 따라 볼륨과 디스크에 저장됩니다:

1.  파트를 저장하기 위한 충분한 디스크 공간이 있는 첫 번째 볼륨(정의 순서 상) ( `unreserved_space > current_part_size`)이 선택됩니다.
2.  이 볼륨 내에서 이전 데이터 청크를 저장하기 위해 사용되었던 것 다음에 오는 디스크가 선택되며, 파트 크기 이상(`unreserved_space - keep_free_space_bytes > current_part_size`)의 여유 공간이 있습니다.

설정 하드 링크([hard links](https://en.wikipedia.org/wiki/Hard_link))를 통해 변형 및 파티션 동결이 이루어집니다. 서로 다른 디스크 간의 하드 링크는 지원되지 않으므로, 이러한 경우 결과 파트는 초기 파트와 동일한 디스크에 저장됩니다.

백그라운드에서 파트는 자유 공간 양(`move_factor` 매개변수)에 따라 구성 파일에 선언된 볼륨 순서에 따라 이동됩니다.
데이터는 마지막 볼륨에서 첫 번째 볼륨으로는 전송되지 않습니다. 시스템 테이블 [system.part_log](/operations/system-tables/part_log) (필드 `type = MOVE_PART`) 및 [system.parts](/operations/system-tables/parts.md) (필드 `path` 및 `disk`)를 사용하여 백그라운드 이동을 모니터링할 수 있습니다. 또한 서버 로그에서 자세한 정보를 찾을 수 있습니다.

사용자는 [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition) 쿼리를 사용하여 파트 또는 파티션을 한 볼륨에서 다른 볼륨으로 강제로 이동할 수 있으며, 모든 백그라운드 작업에 대한 제한이 고려됩니다. 쿼리는 자체적으로 이동을 시작하며, 백그라운드 작업이 완료될 때까지 기다리지는 않습니다. 충분한 여유 공간이 없거나 필요 조건이 충족되지 않으면 오류 메시지가 표시됩니다.

데이터 이동은 데이터 복제와 간섭하지 않습니다. 따라서 동일한 테이블에 대해 서로 다른 복제본에서 다른 스토리지 정책을 지정할 수 있습니다.

백그라운드 병합 및 변형이 완료되면 임시 부분은 특정 시간(`old_parts_lifetime`)이 경과한 후에만 제거됩니다.
이 시간 동안, 그들은 다른 볼륨이나 디스크로 이동되지 않습니다. 따라서 파트가 최종적으로 제거될 때까지는 여전히 점유된 디스크 공간 평가에 포함됩니다.

사용자는 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 볼륨의 서로 다른 디스크에 새로운 큰 파트를 균형 있게 배정할 수 있습니다. 이는 [min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min_bytes_to_rebalance_partition_over_jbod) 설정을 사용하여 수행됩니다.
## Using external storage for data storage {#table_engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 계열 테이블 엔진은 `S3`, `AzureBlobStorage`, `HDFS`에 데이터를 저장할 수 있습니다. 각각 `s3`, `azure_blob_storage`, `hdfs` 유형의 디스크를 사용합니다. 외부 스토리지 옵션 구성을 위한 자세한 내용은 [configuring external storage options](/operations/storing-data.md/#configuring-external-storage)를 참조하십시오.

디스크 유형 `s3`를 사용하여 외부 스토리지를 위한 [S3](https://aws.amazon.com/s3/)의 예입니다.

구성 마크업:
```xml
<storage_configuration>
    ...
    <disks>
        <s3>
            <type>s3</type>
            <support_batch_delete>true</support_batch_delete>
            <endpoint>https://clickhouse-public-datasets.s3.amazonaws.com/my-bucket/root-path/</endpoint>
            <access_key_id>your_access_key_id</access_key_id>
            <secret_access_key>your_secret_access_key</secret_access_key>
            <region></region>
            <header>Authorization: Bearer SOME-TOKEN</header>
            <server_side_encryption_customer_key_base64>your_base64_encoded_customer_key</server_side_encryption_customer_key_base64>
            <server_side_encryption_kms_key_id>your_kms_key_id</server_side_encryption_kms_key_id>
            <server_side_encryption_kms_encryption_context>your_kms_encryption_context</server_side_encryption_kms_encryption_context>
            <server_side_encryption_kms_bucket_key_enabled>true</server_side_encryption_kms_bucket_key_enabled>
            <proxy>
                <uri>http://proxy1</uri>
                <uri>http://proxy2</uri>
            </proxy>
            <connect_timeout_ms>10000</connect_timeout_ms>
            <request_timeout_ms>5000</request_timeout_ms>
            <retry_attempts>10</retry_attempts>
            <single_read_retries>4</single_read_retries>
            <min_bytes_for_seek>1000</min_bytes_for_seek>
            <metadata_path>/var/lib/clickhouse/disks/s3/</metadata_path>
            <skip_access_check>false</skip_access_check>
        </s3>
        <s3_cache>
            <type>cache</type>
            <disk>s3</disk>
            <path>/var/lib/clickhouse/disks/s3_cache/</path>
            <max_size>10Gi</max_size>
        </s3_cache>
    </disks>
    ...
</storage_configuration>
```

외부 스토리지 옵션 구성에 대한 자세한 정보는 [configuring external storage options](/operations/storing-data.md/#configuring-external-storage)를 참조하십시오.

:::note 캐시 구성
ClickHouse 버전 22.3~22.7에서는 다른 캐시 구성을 사용합니다. 이러한 버전 중 하나를 사용하는 경우 [using local cache](/operations/storing-data.md/#using-local-cache)를 참조하십시오.
:::
## Virtual columns {#virtual-columns}

- `_part` — 파트의 이름.
- `_part_index` — 쿼리 결과에서의 파트의 순차 인덱스.
- `_part_starting_offset` — 쿼리 결과에서의 파트의 누적 시작 행.
- `_part_offset` — 파트 내의 행 번호.
- `_part_granule_offset` — 파트 내의 그래뉼 번호.
- `_partition_id` — 파티션의 이름.
- `_part_uuid` — 고유 파트 식별자(경우에 따라 MergeTree 설정 `assign_part_uuids`가 활성화됨).
- `_part_data_version` — 파트의 데이터 버전(최소 블록 번호 또는 변형 버전).
- `_partition_value` — `partition by` 표현식의 값(튜플).
- `_sample_factor` — 샘플 계수(쿼리에서).
- `_block_number` — 삽입 시 배정된 원래 블록 번호이며, `enable_block_number_column` 설정이 활성화된 경우 병합 시 보존됩니다.
- `_block_offset` — 삽입 시 배정된 블록 내의 원래 행 번호이며, `enable_block_offset_column` 설정이 활성화된 경우 병합 시 보존됩니다.
- `_disk_name` — 저장소에 사용된 디스크의 이름.
## Column statistics {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

통계 선언은 `*MergeTree*` 계열 테이블의 `CREATE` 쿼리에서 열 섹션에 있으며, `set allow_experimental_statistics = 1`을 활성화해야 합니다.

```sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

또한 `ALTER` 문으로 통계를 조작할 수 있습니다.

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

이 경량 통계는 컬럼의 값 분포에 대한 정보를 집계합니다. 통계는 각 파트에 저장되며 각 삽입이 발생할 때 업데이트됩니다.
`set allow_statistics_optimize = 1`을 활성화하면 사전 최적화에 사용할 수 있습니다.
### Available types of column statistics {#available-types-of-column-statistics}

- `MinMax`

    컬럼의 최소 및 최대 값으로, 숫자 컬럼에 대한 범위 필터의 선택성을 추정할 수 있습니다.

    구문: `minmax`

- `TDigest`

    [TDigest](https://github.com/tdunning/t-digest) 스케치로, 숫자 컬럼에 대한 근사 백분위수(예: 90백분위수)를 계산할 수 있습니다.

    구문: `tdigest`

- `Uniq`

    [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 스케치로, 컬럼에 얼마나 많은 고유한 값이 포함되어 있는지를 추정할 수 있습니다.

    구문: `uniq`

- `CountMin`

    [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) 스케치로, 컬럼의 각 값의 빈도에 대한 근사 개수를 제공합니다.

    구문: `countmin`
### Supported data types {#supported-data-types}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String or FixedString |
|-----------|----------------------------------------------------|-----------------------|
| CountMin  | ✔                                                  | ✔                     |
| MinMax    | ✔                                                  | ✗                     |
| TDigest   | ✔                                                  | ✗                     |
| Uniq      | ✔                                                  | ✔                     |
### Supported operations {#supported-operations}

|           | Equality filters (==) | Range filters (`>, >=, <, <=`) |
|-----------|-----------------------|------------------------------|
| CountMin  | ✔                     | ✗                            |
| MinMax    | ✗                     | ✔                            |
| TDigest   | ✗                     | ✔                            |
| Uniq      | ✔                     | ✗                            |
## Column-level settings {#column-level-settings}

특정 MergeTree 설정은 컬럼 수준에서 재정의할 수 있습니다:

- `max_compress_block_size` — 테이블에 쓰기 전 압축하지 않은 데이터 블록의 최대 크기.
- `min_compress_block_size` — 다음 마크에 쓰기 위한 압축에 필요한 압축하지 않은 데이터 블록의 최소 크기.

예시:

```sql
CREATE TABLE tab
(
    id Int64,
    document String SETTINGS (min_compress_block_size = 16777216, max_compress_block_size = 16777216)
)
ENGINE = MergeTree
ORDER BY id
```

컬럼 수준의 설정은 [ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md)으로 수정하거나 제거할 수 있습니다. 예를 들어:

- 컬럼 선언에서 `SETTINGS`를 제거합니다:

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- 설정을 수정합니다:

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- 하나 이상의 설정을 리셋하며, 이는 테이블의 CREATE 쿼리에서 컬럼 표현식의 설정 선언도 제거합니다.

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
