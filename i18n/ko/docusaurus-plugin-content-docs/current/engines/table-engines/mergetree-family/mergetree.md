---
description: '`MergeTree` 계열 테이블 엔진은 높은 데이터 수집 속도와 대규모 데이터량을 처리하도록 설계되었습니다.'
sidebar_label: 'MergeTree'
sidebar_position: 11
slug: /engines/table-engines/mergetree-family/mergetree
title: 'MergeTree 테이블 엔진'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MergeTree 테이블 엔진 \{#mergetree-table-engine\}

`MergeTree` 엔진과 `ReplacingMergeTree`, `AggregatingMergeTree` 등 `MergeTree` 계열의 다른 엔진들은 ClickHouse에서 가장 널리 사용되며 가장 견고한 테이블 엔진입니다.

`MergeTree` 계열 테이블 엔진은 높은 데이터 수집 속도와 매우 큰 데이터 양을 처리하도록 설계되었습니다.
INSERT 작업은 테이블 파트를 생성하며, 생성된 파트는 백그라운드 프로세스에 의해 다른 테이블 파트와 병합됩니다.

`MergeTree` 계열 테이블 엔진의 주요 특징은 다음과 같습니다.

- 테이블의 기본 키는 각 테이블 파트 내에서의 정렬 순서(클러스터형 인덱스)를 결정합니다. 기본 키는 개별 행이 아니라 8192개의 행으로 이루어진 블록인 그래뉼(granule)을 참조합니다. 이를 통해 매우 큰 데이터 세트의 기본 키도 주 메모리에 상주시킬 수 있을 만큼 작게 유지하면서, 디스크에 있는 데이터에 빠르게 접근할 수 있습니다.

- 임의의 파티션 표현식을 사용하여 테이블을 파티션할 수 있습니다. 파티션 프루닝(partition pruning)을 통해 쿼리가 허용하는 경우 해당 파티션은 읽기에서 제외됩니다.

- 고가용성, 장애 조치, 무중단 업그레이드를 위해 여러 클러스터 노드에 데이터를 복제할 수 있습니다. [Data replication](/engines/table-engines/mergetree-family/replication.md)을 참조하십시오.

- `MergeTree` 테이블 엔진은 다양한 종류의 통계와 샘플링 방법을 지원하여 쿼리 최적화를 돕습니다.

:::note
이름이 비슷하지만, [Merge](/engines/table-engines/special/merge) 엔진은 `*MergeTree` 엔진과는 다른 엔진입니다.
:::

## 테이블 생성 \{#table_engine-mergetree-creating-a-table\}

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

매개변수에 대한 자세한 설명은 [CREATE TABLE](/sql-reference/statements/create/table.md) SQL 문을 참조하십시오.


### 쿼리 절 \{#mergetree-query-clauses\}

#### ENGINE \{#engine\}

`ENGINE` — 엔진 이름과 매개변수입니다. `ENGINE = MergeTree()`. `MergeTree` 엔진에는 매개변수가 없습니다.

#### ORDER BY \{#order_by\}

`ORDER BY` — 정렬 키입니다.

컬럼 이름들의 튜플 또는 임의의 표현식입니다. 예: `ORDER BY (CounterID + 1, EventDate)`.

기본 키가 정의되지 않은 경우(즉, `PRIMARY KEY`가 지정되지 않은 경우), ClickHouse는 정렬 키를 기본 키로 사용합니다.

정렬이 필요하지 않으면 `ORDER BY tuple()` 구문을 사용할 수 있습니다.
또는 `create_table_empty_primary_key_by_default` `SETTING`이 활성화된 경우, `CREATE TABLE` SQL 문에 `ORDER BY ()`가 암시적으로 추가됩니다. [기본 키 선택](#selecting-a-primary-key)을 참조하십시오.

#### PARTITION BY \{#partition-by\}

`PARTITION BY` — [파티셔닝 키](/engines/table-engines/mergetree-family/custom-partitioning-key.md)입니다. 선택 사항입니다. 대부분의 경우 파티션 키는 필요하지 않으며, 파티션이 필요하더라도 일반적으로 월 단위보다 더 세분화된 파티션 키는 필요하지 않습니다. 파티셔닝은 `ORDER BY` 표현식과는 달리 쿼리 속도를 높이지 않습니다. 지나치게 세분화된 파티셔닝은 절대로 사용하면 안 됩니다. 데이터는 클라이언트 식별자나 이름으로 파티셔닝하지 말고, 대신 `ORDER BY` 표현식에서 클라이언트 식별자나 이름을 첫 번째 컬럼으로 두십시오.

월 단위 파티셔닝의 경우 `toYYYYMM(date_column)` 표현식을 사용합니다. 여기서 `date_column`은 [Date](/sql-reference/data-types/date.md) 타입의 날짜를 가진 컬럼입니다. 이때 파티션 이름은 「YYYYMM」 형식을 가집니다.

#### PRIMARY KEY \{#primary-key\}

`PRIMARY KEY` — [정렬 키와 다른 경우](#choosing-a-primary-key-that-differs-from-the-sorting-key)에 지정하는 기본 키입니다. 선택 사항입니다.

정렬 키를 지정하면 (`ORDER BY` 절 사용) 기본 키도 암묵적으로 지정됩니다.
정렬 키 외에 기본 키를 별도로 지정할 필요는 보통 없습니다.

#### SAMPLE BY \{#sample-by\}

`SAMPLE BY` — 샘플링 식입니다. 옵션입니다.

지정한 경우 기본 키에 포함되어야 합니다.
샘플링 식은 부호 없는 정수를 반환해야 합니다.

예: `SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`.

####  TTL \{#ttl\}

`TTL` — 행의 저장 기간과 [디스크 및 볼륨 간](#table_engine-mergetree-multiple-volumes)의 자동 파트 이동 로직을 지정하는 규칙 목록입니다. 선택 사항입니다.

표현식은 `Date` 또는 `DateTime` 타입의 값이어야 하며, 예를 들어 `TTL date + INTERVAL 1 DAY`와 같습니다.

규칙 유형인 `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY`는 표현식이 만족될 때(현재 시각에 도달했을 때) 파트에 대해 수행할 동작을 지정합니다. 만료된 행 삭제, 특정 디스크(`TO DISK 'xxx'`) 또는 볼륨(`TO VOLUME 'xxx'`)으로의 파트 이동(해당 파트의 모든 행에 대해 표현식이 만족되는 경우), 또는 만료된 행의 값 집계를 포함합니다. 규칙의 기본 유형은 삭제(`DELETE`)입니다. 여러 규칙을 함께 지정할 수 있지만, `DELETE` 규칙은 하나만 지정할 수 있습니다.

자세한 내용은 [컬럼 및 테이블에 대한 TTL](#table_engine-mergetree-ttl)을 참조하십시오.

#### SETTINGS \{#settings\}

[MergeTree Settings](../../../operations/settings/merge-tree-settings.md)를 참조하십시오.

**Sections 설정 예제**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

이 예제에서는 월 단위로 파티셔닝을 설정합니다.

또한 사용자 ID의 해시를 사용하여 샘플링을 위한 표현식을 설정합니다. 이렇게 하면 각 `CounterID` 및 `EventDate`에 대해 테이블의 데이터를 의사 무작위화할 수 있습니다. 데이터를 조회할 때 [SAMPLE](/sql-reference/statements/select/sample) 절을 정의하면, ClickHouse는 일부 사용자에 대해 균등한 의사 무작위 데이터 샘플을 반환합니다.

`index_granularity` 설정은 기본값이 8192이므로 생략할 수 있습니다.

<details markdown="1">
  <summary>테이블 생성의 사용 중단된 방법</summary>

  :::note
  새 프로젝트에서는 이 방법을 사용하지 마십시오. 가능하다면 이전 프로젝트도 위에서 설명한 방법으로 전환하십시오.
  :::

  ```sql
  CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
  (
      name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
      name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
      ...
  ) ENGINE [=] MergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
  ```

  **MergeTree() 매개변수**

  * `date-column` — [Date](/sql-reference/data-types/date.md) 타입 컬럼의 이름입니다. ClickHouse는 이 컬럼을 기준으로 월 단위 파티션을 자동으로 생성합니다. 파티션 이름은 &quot;YYYYMM&quot; 형식입니다.
  * `sampling_expression` — 샘플링을 위한 표현식입니다.
  * `(primary, key)` — 기본 키입니다. 타입: [Tuple()](/sql-reference/data-types/tuple.md)
  * `index_granularity` — 인덱스의 세분도(granularity)입니다. 인덱스의 「마크(marks)」 사이에 존재하는 데이터 행의 개수입니다. 값 8192는 대부분의 작업에 적합합니다.

  **예시**

  ```sql
  MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
  ```

  `MergeTree` 엔진은 위에서 설명한 기본 엔진 구성 방법과 동일한 방식으로 구성됩니다.
</details>


## Data storage \{#mergetree-data-storage\}

테이블은 기본 키(primary key)에 따라 정렬된 데이터 파트로 구성됩니다.

테이블에 데이터가 삽입되면 별도의 데이터 파트가 생성되고, 각 파트는 기본 키를 기준으로 사전식(lexicographical)으로 정렬됩니다. 예를 들어 기본 키가 `(CounterID, Date)`인 경우, 파트 내 데이터는 `CounterID` 기준으로 정렬되고, 각 `CounterID` 안에서는 `Date` 기준으로 정렬됩니다.

서로 다른 파티션에 속한 데이터는 서로 다른 파트에 분리되어 저장됩니다. 백그라운드에서 ClickHouse는 더 효율적인 저장을 위해 데이터 파트를 머지(merge)합니다. 서로 다른 파티션에 속한 파트는 머지되지 않습니다. 머지 메커니즘은 동일한 기본 키를 가진 모든 행이 같은 데이터 파트에 위치함을 보장하지 않습니다.

데이터 파트는 `Wide` 또는 `Compact` 포맷으로 저장될 수 있습니다. `Wide` 포맷에서는 각 컬럼이 파일 시스템의 별도 파일에 저장되고, `Compact` 포맷에서는 모든 컬럼이 하나의 파일에 저장됩니다. `Compact` 포맷은 작고 빈번한 insert 작업의 성능을 높이는 데 사용할 수 있습니다.

데이터 저장 포맷은 테이블 엔진의 `min_bytes_for_wide_part` 및 `min_rows_for_wide_part` 설정으로 제어됩니다. 데이터 파트의 바이트 수나 행 수가 해당 설정 값보다 작으면 파트는 `Compact` 포맷으로 저장됩니다. 그렇지 않으면 `Wide` 포맷으로 저장됩니다. 두 설정이 모두 지정되지 않은 경우 데이터 파트는 `Wide` 포맷으로 저장됩니다.

각 데이터 파트는 논리적으로 그래뉼(granule)로 나뉩니다. 그래뉼은 ClickHouse가 데이터를 조회할 때 읽는 최소 불가분 데이터 집합입니다. ClickHouse는 행이나 값을 분할하지 않으므로, 각 그래뉼에는 항상 정수 개수의 행이 포함됩니다. 그래뉼의 첫 번째 행은 해당 행의 기본 키 값으로 마킹됩니다. 각 데이터 파트에 대해 ClickHouse는 마크를 저장하는 인덱스 파일을 생성합니다. 기본 키에 포함된 컬럼인지 여부와 관계없이, 각 컬럼에 대해 ClickHouse는 동일한 마크도 함께 저장합니다. 이러한 마크를 사용하여 컬럼 파일에서 데이터를 직접 찾을 수 있습니다.

그래뉼 크기는 테이블 엔진의 `index_granularity` 및 `index_granularity_bytes` 설정에 의해 제한됩니다. 그래뉼 내 행 개수는 행의 크기에 따라 `[1, index_granularity]` 범위에 속합니다. 단일 행의 크기가 설정 값보다 큰 경우에는 그래뉼 크기가 `index_granularity_bytes`를 초과할 수 있습니다. 이 경우 그래뉼의 크기는 해당 행의 크기와 같아집니다.

## 쿼리의 기본 키와 인덱스 \{#primary-keys-and-indexes-in-queries\}

`(CounterID, Date)` 기본 키를 예로 들면, 이 경우 정렬과 인덱스는 다음과 같이 나타낼 수 있습니다:

```text
Whole data:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Marks:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Marks numbers:   0      1      2      3      4      5      6      7      8      9      10
```

데이터 쿼리가 다음과 같이 지정된 경우:

* `CounterID in ('a', 'h')`인 경우, 서버는 마크 범위 `[0, 3)` 및 `[6, 8)`에서 데이터를 읽습니다.
* `CounterID IN ('a', 'h') AND Date = 3`인 경우, 서버는 마크 범위 `[1, 3)` 및 `[7, 8)`에서 데이터를 읽습니다.
* `Date = 3`인 경우, 서버는 마크 범위 `[1, 10]`에서 데이터를 읽습니다.

위 예시는 전체 스캔보다 인덱스를 사용하는 것이 항상 더 효율적임을 보여줍니다.

희소 인덱스는 추가 데이터를 더 읽게 만듭니다. 기본 키의 단일 범위를 읽을 때, 각 데이터 블록에서 최대 `index_granularity * 2`개의 추가 행을 더 읽을 수 있습니다.

희소 인덱스를 사용하면 대부분의 경우 이러한 인덱스가 컴퓨터의 RAM에 적재되므로, 매우 많은 테이블 행을 효율적으로 처리할 수 있습니다.

ClickHouse는 기본 키의 유일성을 요구하지 않습니다. 동일한 기본 키를 가진 여러 행을 삽입할 수 있습니다.

`PRIMARY KEY` 및 `ORDER BY` 절에서 `Nullable` 타입의 표현식을 사용할 수 있지만, 사용하는 것은 강력히 권장되지 않습니다. 이 기능을 허용하려면 [allow&#95;nullable&#95;key](/operations/settings/merge-tree-settings/#allow_nullable_key) SETTING을 활성화하십시오. `ORDER BY` 절에서 `NULL` 값에는 [NULLS&#95;LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values) 원칙이 적용됩니다.


### 기본 키 선택 \{#selecting-a-primary-key\}

기본 키에 포함할 수 있는 컬럼 수에는 명시적인 제한이 없습니다. 데이터 구조에 따라 기본 키에 더 많은 컬럼을 포함하거나 더 적은 컬럼을 포함할 수 있습니다. 이렇게 하면 다음과 같은 효과가 있을 수 있습니다:

- 인덱스 성능이 향상됩니다.

    기본 키가 `(a, b)`일 때, 다음 조건을 만족하면 컬럼 `c`를 추가하는 것이 성능 향상에 도움이 됩니다:

  - 컬럼 `c`에 대한 조건을 사용하는 쿼리가 있습니다.
  - `(a, b)` 값이 동일한 긴 데이터 범위(`index_granularity`보다 여러 배 더 긴 범위)가 자주 나타납니다. 다시 말해, 컬럼을 하나 더 추가함으로써 상당히 긴 데이터 범위를 건너뛸 수 있는 경우입니다.

- 데이터 압축이 개선됩니다.

    ClickHouse는 데이터를 기본 키 기준으로 정렬하므로, 일관성이 높을수록 압축 효율이 더 좋아집니다.

- [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) 및 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 엔진에서 데이터 파트를 머지할 때 추가적인 로직을 제공합니다.

    이 경우에는 기본 키와 다른 *정렬 키*를 지정하는 것이 합리적일 수 있습니다.

기본 키가 너무 길면 삽입 성능과 메모리 사용량에 부정적인 영향을 줍니다. 하지만 기본 키에 컬럼을 추가로 포함하더라도 `SELECT` 쿼리 동안의 ClickHouse 성능에는 영향을 주지 않습니다.

`ORDER BY tuple()` 구문을 사용하여 기본 키 없이 테이블을 생성할 수 있습니다. 이 경우 ClickHouse는 데이터를 삽입 순서대로 저장합니다. `INSERT ... SELECT` 쿼리로 데이터를 삽입할 때 데이터의 순서를 유지하려면 [max_insert_threads = 1](/operations/settings/settings#max_insert_threads)을 설정하십시오.

원래 삽입 순서대로 데이터를 조회하려면 [single-threaded](/operations/settings/settings.md/#max_threads) `SELECT` 쿼리를 사용하십시오.

### 정렬 키와 다른 기본 키 선택하기 \{#choosing-a-primary-key-that-differs-from-the-sorting-key\}

정렬 키(데이터 파트에서 행을 정렬하는 식)와 다른 기본 키(각 마크마다 인덱스 파일에 기록되는 값들의 식)를 지정할 수 있습니다. 이 경우 기본 키 식 튜플은 정렬 키 식 튜플의 접두사여야 합니다.

이 기능은 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) 및
[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md) 테이블 엔진을 사용할 때 유용합니다. 일반적으로 이러한 엔진을 사용할 때 테이블에는 두 종류의 컬럼이 있습니다: *dimensions* 와 *measures*. 전형적인 쿼리는 임의의 `GROUP BY` 와 dimensions에 대한 필터링을 사용하여 measure 컬럼의 값을 집계합니다. SummingMergeTree 와 AggregatingMergeTree 는 정렬 키 값이 동일한 행을 집계하므로, 모든 dimensions를 정렬 키에 추가하는 것이 자연스럽습니다. 그 결과 키 식은 긴 컬럼 목록으로 구성되며, 새 dimension이 추가될 때마다 이 목록을 자주 업데이트해야 합니다.

이러한 경우 효율적인 범위 스캔을 제공하는 일부 컬럼만 기본 키에 남기고, 나머지 dimension 컬럼은 정렬 키 튜플에 추가하는 것이 합리적입니다.

정렬 키의 [ALTER](/sql-reference/statements/alter/index.md) 작업은 비용이 적게 드는 연산입니다. 새 컬럼이 테이블과 정렬 키 둘 다에 동시에 추가되는 경우, 기존 데이터 파트를 변경할 필요가 없기 때문입니다. 이전 정렬 키가 새로운 정렬 키의 접두사이고 새로 추가된 컬럼에는 데이터가 없으므로, 테이블이 수정되는 시점에는 데이터가 이전 정렬 키와 새로운 정렬 키 모두에 대해 정렬된 상태로 유지됩니다.

### 쿼리에서 인덱스와 파티션의 사용 \{#use-of-indexes-and-partitions-in-queries\}

`SELECT` 쿼리에 대해 ClickHouse는 인덱스를 사용할 수 있는지 분석합니다. `WHERE/PREWHERE` 절에 (논리곱(AND) 조건 요소 중 하나이거나 전체가) 등호/부등호 비교 연산을 표현하는 식이 있거나, 기본 키 또는 파티셔닝 키에 속하는 컬럼이나 이들 컬럼에 대한 특정 부분 반복 형태의 함수, 혹은 이러한 식들의 논리 관계에 대해 고정 접두사를 가진 `IN` 또는 `LIKE` 조건이 있는 경우 인덱스를 사용할 수 있습니다.

따라서 기본 키의 하나 또는 여러 개 범위에 대해 쿼리를 빠르게 실행할 수 있습니다. 이 예시에서는 특정 추적 태그에 대한 쿼리, 특정 태그와 날짜 범위, 특정 태그와 특정 날짜, 여러 태그와 날짜 범위 등에 대해 쿼리가 빠르게 실행됩니다.

다음과 같이 설정된 엔진을 살펴보겠습니다:

```sql
ENGINE MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate)
SETTINGS index_granularity=8192
```

이 경우 쿼리는 다음과 같습니다.

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

ClickHouse는 기본 키 인덱스를 사용하여 부적절한 데이터를 걸러내고, 월별 파티셔닝 키를 사용하여 잘못된 날짜 범위에 속하는 파티션을 제외합니다.

위의 쿼리는 인덱스가 복잡한 표현식에 대해서도 사용된다는 것을 보여줍니다. 테이블에서 데이터를 읽는 방식은 인덱스를 사용하는 것이 전체 스캔보다 느려지지 않도록 구성됩니다.

아래 예제에서는 인덱스를 사용할 수 없습니다.

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

ClickHouse가 쿼리를 실행할 때 인덱스를 사용할 수 있는지 확인하려면 [force&#95;index&#95;by&#95;date](/operations/settings/settings.md/#force_index_by_date) 및 [force&#95;primary&#95;key](/operations/settings/settings#force_primary_key) 설정을 사용하면 됩니다.

월 단위 파티션 키는 해당 범위에 속하는 날짜를 포함하는 데이터 블록만 읽을 수 있게 합니다. 이 경우 하나의 데이터 블록에는 여러 날짜(최대 한 달 전체)에 대한 데이터가 포함될 수 있습니다. 블록 내부에서는 데이터가 기본 키(primary key)로 정렬되어 있으며, 기본 키의 첫 번째 컬럼에 날짜가 포함되지 않을 수 있습니다. 이러한 이유로, 기본 키 접두어를 지정하지 않고 날짜 조건만 사용하는 쿼리를 실행하면 단일 날짜에 대해 필요한 것보다 더 많은 데이터를 읽게 됩니다.


### 기본 키에서 결정적 표현식을 사용하는 인덱스 활용 \{#use-of-index-for-deterministic-expressions-in-primary-keys\}

기본 키에는 컬럼 이름뿐만 아니라 표현식도 포함할 수 있습니다. 이러한 표현식은 단순한 함수 체인으로만 제한되지 않고, 결정적이기만 하면 (예: 중첩된 함수나 복합 표현식 등) 임의의 표현식 트리일 수 있습니다.

표현식은 동일한 입력 값에 대해 항상 동일한 결과를 반환하면 **결정적**입니다(예: `length()`, `toDate()`, `lower()`, `left()`, `cityHash64()`, `toUUID()` 등은 결정적이지만 `now()`나 `rand()`는 그렇지 않습니다). 기본 키에 결정적 표현식이 포함되어 있으면 ClickHouse는 쿼리의 상수 값에 해당 표현식을 적용하고, 그 결과를 사용하여 기본 키 인덱스에 대한 조건을 구성할 수 있습니다. 이를 통해 `=`, `IN`, `has()`와 같은 조건에서 데이터 스키핑이 가능해집니다.

일반적인 사용 사례로는 기본 키를 더 compact하게 유지(예: 긴 `String` 대신 해시를 저장)하면서도, 원래 컬럼에 대한 조건이 여전히 인덱스를 사용할 수 있도록 하는 것입니다.

결정적이지만 단사(injective)가 아닌 기본 키의 예시:

```sql
ENGINE = MergeTree()
ORDER BY length(user_id)
```

인덱스를 사용할 수 있는 조건식의 예:

```sql
SELECT * FROM table WHERE user_id = 'alice';
SELECT * FROM table WHERE user_id IN ('alice', 'bob');
SELECT * FROM table WHERE has(['alice', 'bob'], user_id);
```

이러한 경우 ClickHouse는 `length('alice')`(및 다른 상수들)을 한 번만 계산하고, 해당 길이 값을 사용하여 기본 키 인덱스에서 범위를 좁힙니다. 문자열의 길이는 **단사 함수가 아니기 때문에** 서로 다른 `user_id` 문자열이 동일한 길이를 가질 수 있고, 이로 인해 인덱스가 추가로 그래뉼(거짓 양성)을 더 읽을 수 있습니다. 원래의 조건식(`user_id = ...`, `IN` 등)이 데이터를 읽은 이후에도 그대로 적용되므로 결과는 여전히 올바르게 유지됩니다.

결정적 표현식이 동시에 **단사 함수**(사용된 인자 타입에 대해 서로 다른 입력이 동일한 출력을 만들 수 없음)이기도 한 경우, ClickHouse는 부정 형태인 `!=`, `NOT IN`, `NOT has(...)`에 대해서도 인덱스를 효과적으로 사용할 수 있습니다. 예를 들어 `reverse(p)`와 `hex(p)`는 `String`에 대해 단사 함수입니다.

단사인 기본 키의 예:

```sql
ENGINE = MergeTree()
ORDER BY hex(p)
```

보다 복잡한 단사(injective) 함수 표현식도 지원합니다. 예를 들면 다음과 같습니다.

```sql
ENGINE = MergeTree()
ORDER BY reverse(tuple(reverse(p), hex(p)))
```

인덱스를 사용할 수 있는 예시 조건은 다음과 같습니다:

```sql
SELECT * FROM table WHERE p != 'abc';
SELECT * FROM table WHERE p NOT IN ('abc', '12345');
SELECT * FROM table WHERE NOT has(['abc', '12345'], p);
```


### 부분 단조 primary key에서 인덱스 사용 \{#use-of-index-for-partially-monotonic-primary-keys\}

예를 들어, 한 달의 날짜를 생각해 보겠습니다. 한 달 내에서는 [단조 수열](https://en.wikipedia.org/wiki/Monotonic_function)을 이루지만, 더 긴 기간 전체로 보면 단조 수열이 아닙니다. 이는 부분 단조 수열입니다. 사용자가 부분 단조인 primary key로 테이블을 생성하면 ClickHouse는 일반적인 방식으로 희소 인덱스를 생성합니다. 사용자가 이러한 유형의 테이블에서 데이터를 조회하면 ClickHouse는 쿼리 조건을 분석합니다. 사용자가 인덱스의 두 마크 사이 구간의 데이터를 가져오려 하고 이 두 마크가 모두 한 달 안에 속하는 경우, ClickHouse는 쿼리 파라미터와 인덱스 마크 간의 거리를 계산할 수 있으므로 이러한 특정 상황에서는 인덱스를 사용할 수 있습니다.

쿼리 파라미터 범위 내의 primary key 값들이 단조 수열을 이루지 않는 경우에는 ClickHouse가 인덱스를 사용할 수 없습니다. 이 경우 ClickHouse는 전체 스캔(full scan) 방식을 사용합니다.

ClickHouse는 이 로직을 한 달의 날짜 수열뿐만 아니라 부분 단조 수열을 나타내는 모든 primary key에 대해 사용합니다.

### 데이터 스키핑 인덱스 \{#table_engine-mergetree-data_skipping-indexes\}

인덱스 선언은 `CREATE` 쿼리의 컬럼 정의 부분에 있습니다.

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

`*MergeTree` 패밀리에 속한 테이블에는 데이터 스킵 인덱스를 지정할 수 있습니다.

이 인덱스는 블록 단위로 지정된 표현식에 대한 일부 정보를 집계합니다. 블록은 `granularity_value` 개의 그래뉼로 구성되며, 그래뉼의 크기는 테이블 엔진에서 `index_granularity` SETTING으로 지정합니다. 이후 이러한 집계값은 `SELECT` 쿼리에서 사용되어, `WHERE` 절의 조건을 만족할 수 없는 큰 데이터 블록을 건너뛰어 디스크에서 읽어야 하는 데이터 양을 줄입니다.

`GRANULARITY` 절은 생략할 수 있으며, `granularity_value`의 기본값은 1입니다.

**예시**

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

예제의 인덱스는 ClickHouse에서 다음 쿼리에서 디스크에서 읽어야 하는 데이터 양을 줄이는 데 활용할 수 있습니다.

```sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

데이터 스키핑 인덱스는 복합 컬럼에도 생성할 수 있습니다.

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


### 스킵 인덱스 유형 \{#skip-index-types\}

`MergeTree` 테이블 엔진은 다음 유형의 스킵 인덱스를 지원합니다.
스킵 인덱스를 활용한 성능 최적화에 대한 자세한 내용은
["ClickHouse 데이터 스키핑 인덱스 이해하기"](/optimize/skipping-indexes)를 참조하세요.

- [`MinMax`](#minmax) 인덱스
- [`Set`](#set) 인덱스
- [`bloom_filter`](#bloom-filter) 인덱스
- [`ngrambf_v1`](#n-gram-bloom-filter) 인덱스
- [`tokenbf_v1`](#token-bloom-filter) 인덱스
- [`text`](#text) 인덱스
- [`vector_similarity`](#vector-similarity) 인덱스

#### MinMax skip index \{#minmax\}

각 인덱스 그레뉼(index granule)마다 표현식의 최소값과 최대값이 저장됩니다.
(표현식이 `tuple` 타입인 경우, 각 튜플 요소에 대해 최소값과 최대값을 저장합니다.)

```text title="Syntax"
minmax
```


#### Set \{#set\}

각 인덱스 그래뉼마다 지정된 표현식의 고유 값이 최대 `max_rows`개까지 저장됩니다.
`max_rows = 0`은 「모든 고유 값을 저장」한다는 의미입니다.

```text title="Syntax"
set(max_rows)
```


#### 블룸 필터 \{#bloom-filter\}

각 인덱스 그래뉼(granule)은 지정된 컬럼에 대한 [블룸 필터](https://en.wikipedia.org/wiki/Bloom_filter)를 저장합니다.

```text title="Syntax"
bloom_filter([false_positive_rate])
```

`false_positive_rate` 파라미터는 0과 1 사이의 값을 가질 수 있으며(기본값: `0.025`), 양성 결과(positive)가 발생할 확률을 지정합니다. 이 값이 높을수록 읽어야 하는 데이터 양이 증가합니다.

다음 데이터 타입이 지원됩니다:

* `(U)Int*`
* `Float*`
* `Enum`
* `Date`
* `DateTime`
* `String`
* `FixedString`
* `Array`
* `LowCardinality`
* `Nullable`
* `UUID`
* `Map`

:::note Map 데이터 타입: 키 또는 값 기준 인덱스 생성 지정
`Map` 데이터 타입의 경우, 클라이언트는 [`mapKeys`](/sql-reference/functions/tuple-map-functions.md/#mapKeys) 또는 [`mapValues`](/sql-reference/functions/tuple-map-functions.md/#mapValues) 함수를 사용하여 인덱스를 키에 대해 생성할지 값에 대해 생성할지 지정할 수 있습니다.
:::


#### N-그램 블룸 필터 \{#n-gram-bloom-filter\}

각 인덱스 그래뉼은 지정된 컬럼의 [n-그램](https://en.wikipedia.org/wiki/N-gram)에 대한 [블룸 필터](https://en.wikipedia.org/wiki/Bloom_filter)를 저장합니다.

```text title="Syntax"
ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```

| Parameter                       | Description                                                            |
| ------------------------------- | ---------------------------------------------------------------------- |
| `n`                             | ngram 크기                                                               |
| `size_of_bloom_filter_in_bytes` | 블룸 필터 크기(바이트 단위)입니다. 이 값은 `256`이나 `512`처럼 크게 설정해도 됩니다. 압축이 잘 되기 때문입니다. |
| `number_of_hash_functions`      | 블룸 필터에서 사용하는 해시 함수 수입니다.                                               |
| `random_seed`                   | 블룸 필터 해시 함수에 사용할 시드입니다.                                                |

이 인덱스는 다음 데이터 타입에서만 동작합니다:

* [`String`](/sql-reference/data-types/string.md)
* [`FixedString`](/sql-reference/data-types/fixedstring.md)
* [`Map`](/sql-reference/data-types/map.md)

`ngrambf_v1`의 파라미터를 추정하려면 다음 [사용자 정의 함수(UDF)](/sql-reference/statements/create/function.md)를 사용할 수 있습니다.

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

* `total_number_of_all_grams`
* `probability_of_false_positives`

예를 들어 granule에 `4300`개의 ngram이 있고, false positive가 `0.0001` 미만일 것으로 예상한다고 가정합니다.
이때 나머지 매개변수는 다음 쿼리를 실행하여 추정할 수 있습니다:

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

물론 이러한 FUNCTION을 사용하여 다른 조건의 매개변수도 추정할 수 있습니다.
위 FUNCTION들은 [여기](https://hur.st/bloomfilter)의 블룸 필터 계산기를 참고합니다.


#### Token bloom filter \{#token-bloom-filter\}

`token` 블룸 필터는 `ngrambf_v1`와 동일하지만, n그램 대신 토큰(영숫자가 아닌 문자로 구분되는 문자열 시퀀스)을 저장합니다.

```text title="Syntax"
tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```


#### 희소 그램 블룸 필터 \{#sparse-grams-bloom-filter\}

희소 그램 블룸 필터는 `ngrambf_v1`과 유사하지만 ngram 대신 [희소 그램 토큰](/sql-reference/functions/string-functions.md/#sparseGrams)을 사용합니다.

```text title="Syntax"
sparse_grams(min_ngram_length, max_ngram_length, min_cutoff_length, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```


### Text index \{#text\}

토큰화된 문자열 데이터에 대해 역인덱스를 구축하여 효율적이고 일관된 전문 검색(full-text search)을 수행할 수 있습니다. 자세한 내용은 [여기](textindexes.md)를 참조하십시오.

#### 벡터 유사도 \{#vector-similarity\}

근사 최근접 이웃 검색을 지원합니다. 자세한 내용은 [여기](annindexes.md)를 참조하십시오.

### 함수 지원 \{#functions-support\}

`WHERE` 절의 조건에는 컬럼을 대상으로 동작하는 함수 호출이 포함될 수 있습니다. 컬럼이 인덱스에 포함되어 있는 경우, ClickHouse는 해당 함수를 수행할 때 이 인덱스를 사용하려고 시도합니다. ClickHouse는 인덱스를 활용하기 위해 서로 다른 함수 부분 집합을 지원합니다.

`set` 타입의 인덱스는 모든 함수에서 활용될 수 있습니다. 다른 인덱스 타입에 대한 지원은 다음과 같습니다:

| 함수/연산자/인덱스                                                                                                                | 기본 키 | minmax | ngrambf&#95;v1 | tokenbf&#95;v1 | bloom&#95;filter | sparse&#95;grams | 텍스트 |
| ------------------------------------------------------------------------------------------------------------------------- | ---- | ------ | -------------- | -------------- | ---------------- | ---------------- | --- |
| [equals(=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                                                 | ✔    | ✔      | ✔              | ✔              | ✔                | ✔                | ✔   |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notEquals)                                    | ✔    | ✔      | ✔              | ✔              | ✔                | ✔                | ✔   |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                                         | ✔    | ✔      | ✔              | ✔              | ✗                | ✔                | ✔   |
| [notLike](/sql-reference/functions/string-search-functions.md/#notLike)                                                   | ✔    | ✔      | ✔              | ✔              | ✗                | ✔                | ✔   |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                                       | ✗    | ✗      | ✔              | ✔              | ✗                | ✔                | ✔   |
| [startsWith](/sql-reference/functions/string-functions.md/#startsWith)                                                    | ✔    | ✔      | ✔              | ✔              | ✗                | ✔                | ✔   |
| [endsWith](/sql-reference/functions/string-functions.md/#endsWith)                                                        | ✗    | ✗      | ✔              | ✔              | ✗                | ✔                | ✔   |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multiSearchAny)                                     | ✗    | ✗      | ✔              | ✗              | ✗                | ✗                | ✗   |
| [in](/sql-reference/functions/in-functions)                                                                               | ✔    | ✔      | ✔              | ✔              | ✔                | ✔                | ✔   |
| [notIn](/sql-reference/functions/in-functions)                                                                            | ✔    | ✔      | ✔              | ✔              | ✔                | ✔                | ✔   |
| [less (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                                      | ✔    | ✔      | ✗              | ✗              | ✗                | ✗                | ✗   |
| [보다 큼 (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                                                   | ✔    | ✔      | ✗              | ✗              | ✗                | ✗                | ✗   |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessOrEquals)                                     | ✔    | ✔      | ✗              | ✗              | ✗                | ✗                | ✗   |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterOrEquals)                               | ✔    | ✔      | ✗              | ✗              | ✗                | ✗                | ✗   |
| [empty](/sql-reference/functions/array-functions/#empty)                                                                  | ✔    | ✔      | ✗              | ✗              | ✗                | ✗                | ✗   |
| [notEmpty](/sql-reference/functions/array-functions/#notEmpty)                                                            | ✗    | ✔      | ✗              | ✗              | ✗                | ✔                | ✗   |
| [has](/sql-reference/functions/array-functions#has)                                                                       | ✔    | ✔      | ✔              | ✔              | ✔                | ✔                | ✔   |
| [hasAny](/sql-reference/functions/array-functions#hasAny)                                                                 | ✗    | ✗      | ✔              | ✔              | ✔                | ✔                | ✗   |
| [hasAll](/sql-reference/functions/array-functions#hasAll)                                                                 | ✗    | ✗      | ✔              | ✔              | ✔                | ✔                | ✗   |
| [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken)                                                 | ✗    | ✗      | ✗              | ✔              | ✗                | ✗                | ✔   |
| [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull)                                     | ✗    | ✗      | ✗              | ✔              | ✗                | ✗                | ✔   |
| [hasTokenCaseInsensitive (`*`)](/sql-reference/functions/string-search-functions.md/#hasTokenCaseInsensitive)             | ✗    | ✗      | ✗              | ✔              | ✗                | ✗                | ✗   |
| [hasTokenCaseInsensitiveOrNull (`*`)](/sql-reference/functions/string-search-functions.md/#hasTokenCaseInsensitiveOrNull) | ✗    | ✗      | ✗              | ✔              | ✗                | ✗                | ✗   |
| [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens)                                         | ✗    | ✗      | ✗              | ✗              | ✗                | ✗                | ✔   |
| [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens)                                         | ✗    | ✗      | ✗              | ✗              | ✗                | ✗                | ✔   |
| [mapContains (mapContainsKey)](/sql-reference/functions/tuple-map-functions#mapContainsKey)                               | ✗    | ✗      | ✗              | ✗              | ✗                | ✗                | ✔   |
| [mapContainsKeyLike](/sql-reference/functions/tuple-map-functions#mapContainsKeyLike)                                     | ✗    | ✗      | ✗              | ✗              | ✗                | ✗                | ✔   |
| [mapContainsValue](/sql-reference/functions/tuple-map-functions#mapContainsValue)                                         | ✗    | ✗      | ✗              | ✗              | ✗                | ✗                | ✔   |
| [mapContainsValueLike](/sql-reference/functions/tuple-map-functions#mapContainsValueLike)                                 | ✗    | ✗      | ✗              | ✗              | ✗                | ✗                | ✔   |

`ngrambf_v1`는 상수 인자가 ngram 크기보다 작은 함수에는 쿼리 최적화를 위해 사용할 수 없습니다.

(*) `hasTokenCaseInsensitive` 및 `hasTokenCaseInsensitiveOrNull`이 효과를 발휘하려면, `tokenbf_v1` 인덱스를 소문자로 변환된 데이터에 대해 생성해야 합니다. 예를 들어 `INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`와 같이 생성합니다.

:::note
블룸 필터는 거짓 양성(false positive) 매칭이 발생할 수 있으므로, `ngrambf_v1`, `tokenbf_v1`, `sparse_grams`, `bloom_filter` 인덱스는 함수의 결과가 false일 것으로 예상되는 쿼리의 최적화에는 사용할 수 없습니다.

예를 들면 다음과 같습니다.

- 최적화 가능:
  - `s LIKE '%test%'`
  - `NOT s NOT LIKE '%test%'`
  - `s = 1`
  - `NOT s != 1`
  - `startsWith(s, 'test')`
- 최적화 불가능:
  - `NOT s LIKE '%test%'`
  - `s NOT LIKE '%test%'`
  - `NOT s = 1`
  - `s != 1`
  - `NOT startsWith(s, 'test')`
:::

## 프로젝션 \{#projections\}

프로젝션은 파트(part) 단위에서 정의되는 [materialized views](/sql-reference/statements/create/view)와 유사합니다. 쿼리에서 자동으로 사용되는 것과 함께 일관성 보장을 제공합니다.

:::note
프로젝션을 구현할 때는 [force_optimize_projection](/operations/settings/settings#force_optimize_projection) 설정도 함께 고려해야 합니다.
:::

프로젝션은 [FINAL](/sql-reference/statements/select/from#final-modifier) 수정자가 포함된 `SELECT` SQL 문에서는 지원되지 않습니다.

### Projection query \{#projection-query\}

프로젝션 쿼리는 프로젝션을 정의하는 쿼리입니다. 기본 테이블에서 데이터를 암묵적으로 조회합니다.
**구문**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

프로젝션은 [ALTER](/sql-reference/statements/alter/projection.md) SQL 문을 사용하여 수정하거나 삭제할 수 있습니다.


### Projection indexes \{#projection-index\}

Projection indexes 기능은 프로젝션 서브시스템을 확장하여 프로젝션 수준의 인덱스를 정의하는 가볍고 명시적인 방법을 제공합니다. 
개념적으로 프로젝션 인덱스는 여전히 프로젝션이지만, 단순화된 구문과 더 명확한 의도를 가지며, 구체화된 데이터로 사용되기보다는 필터링에 특화된 식을 정의합니다.

#### 구문 \{#projection-index-syntax\}

```sql
PROJECTION <name> INDEX <index_expr> TYPE <index_type>
```

예시:

```sql
CREATE TABLE example
(
    id UInt64,
    region String,
    user_id UInt32,
    PROJECTION region_proj INDEX region TYPE basic,
    PROJECTION uid_proj INDEX user_id TYPE basic
)
ENGINE = MergeTree
ORDER BY id;
```


#### 인덱스 유형 \{#projection-index-types\}

현재 지원되는 유형은 다음과 같습니다.

* **basic**: 표현식에 대해 일반적인 MergeTree 인덱스와 동일합니다.

이 프레임워크는 향후 더 많은 인덱스 유형을 추가할 수 있습니다.

### Projection storage \{#projection-storage\}

프로젝션은 파트 디렉터리 내부에 저장됩니다. 인덱스와 비슷하지만, 익명 `MergeTree` 테이블의 파트를 저장하는 하위 디렉터리를 포함합니다. 이 테이블은 프로젝션 정의 쿼리에 의해 생성됩니다. `GROUP BY` 절이 있으면, 하위 저장 엔진은 [AggregatingMergeTree](aggregatingmergetree.md)가 되고, 모든 집계 함수는 `AggregateFunction`으로 변환됩니다. `ORDER BY` 절이 있으면, `MergeTree` 테이블은 이를 기본 키 표현식으로 사용합니다. 머지 과정 동안 프로젝션 파트는 해당 저장 엔진의 머지 루틴을 통해 병합됩니다. 상위 테이블 파트의 체크섬은 프로젝션 파트의 체크섬과 결합됩니다. 기타 유지 관리 작업은 스킵 인덱스와 유사합니다.

### 쿼리 분석 \{#projection-query-analysis\}

1. 프로젝션이 주어진 쿼리를 처리할 수 있는지, 즉 기본 테이블에 쿼리를 실행했을 때와 동일한 결과를 생성하는지 확인합니다.
2. 읽어야 할 그래뉼 수가 가장 적은, 사용 가능한 최선의 프로젝션을 선택합니다.
3. 프로젝션을 사용하는 쿼리 파이프라인은 원래 파트를 사용하는 파이프라인과 다릅니다. 일부 파트에 프로젝션이 없는 경우, 런타임에 프로젝션을 적용하기 위한 파이프라인을 추가할 수 있습니다.

## 동시 데이터 액세스 \{#concurrent-data-access\}

동시 테이블 액세스를 위해 멀티 버저닝을 사용합니다. 즉, 테이블에서 읽기와 업데이트가 동시에 수행되는 경우, 데이터는 쿼리가 실행되는 시점에 유효한 파트 집합에서 읽습니다. 장시간 잠금이 발생하지 않습니다. 데이터 삽입은 읽기 작업을 방해하지 않습니다.

테이블에서의 읽기 작업은 자동으로 병렬 처리됩니다.

## 컬럼 및 테이블에 대한 TTL \{#table_engine-mergetree-ttl\}

값의 유효 기간을 정의합니다.

`TTL` 절은 전체 테이블과 각 컬럼마다 설정할 수 있습니다. 테이블 수준 `TTL`은 또한 디스크와 볼륨 간에 데이터를 자동으로 이동하는 로직이나, 모든 데이터의 유효 기간이 만료된 파트를 다시 압축하는 로직을 지정할 수 있습니다.

식은 [Date](/sql-reference/data-types/date.md), [Date32](/sql-reference/data-types/date32.md), [DateTime](/sql-reference/data-types/datetime.md) 또는 [DateTime64](/sql-reference/data-types/datetime64.md) 데이터 타입의 값으로 평가되어야 합니다.

**구문**

컬럼에 대한 TTL(time-to-live) 설정:

```sql
TTL time_column
TTL time_column + interval
```

`interval`을 정의하려면 [time interval](/sql-reference/operators#operators-for-working-with-dates-and-times) 연산자를 사용합니다. 예를 들면 다음과 같습니다.

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```


### 컬럼 TTL \{#mergetree-column-ttl\}

컬럼의 값이 만료되면 ClickHouse는 해당 값을 컬럼 데이터 타입의 기본값으로 대체합니다. 데이터 파트에서 해당 컬럼의 모든 값이 만료되면 ClickHouse는 파일 시스템상의 해당 데이터 파트에서 이 컬럼을 삭제합니다.

`TTL` 절은 키 컬럼에는 사용할 수 없습니다.

**예시**

#### `TTL`이 설정된 테이블 생성: \{#creating-a-table-with-ttl\}

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


#### 기존 테이블 컬럼에 TTL을 추가하기 \{#adding-ttl-to-a-column-of-an-existing-table\}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 DAY;
```


#### 컬럼 TTL 변경 \{#altering-ttl-of-the-column\}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 MONTH;
```


### 테이블 TTL \{#mergetree-table-ttl\}

테이블에는 만료된 행을 삭제하기 위한 표현식을 하나 설정할 수 있고, [디스크 또는 볼륨](#table_engine-mergetree-multiple-volumes) 간에 파트를 자동으로 이동하기 위한 표현식을 여러 개 설정할 수 있습니다. 테이블의 행이 만료되면 ClickHouse는 해당하는 모든 행을 삭제합니다. 파트를 이동하거나 재압축(recompress)할 때에는, 하나의 파트에 속한 모든 행이 `TTL` 표현식 조건을 만족해야 합니다.

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

각 `TTL` 표현식 뒤에는 `TTL` 규칙의 유형을 지정할 수 있습니다. 이 규칙은 표현식이 충족되었을 때(현재 시각에 도달했을 때) 수행되는 동작에 영향을 줍니다:

* `DELETE` - 만료된 행을 삭제합니다(기본 동작);
* `RECOMPRESS codec_name` - `codec_name` 코덱으로 데이터 파트를 다시 압축합니다;
* `TO DISK 'aaa'` - 파트를 디스크 `aaa`로 이동합니다;
* `TO VOLUME 'bbb'` - 파트를 디스크 `bbb`로 이동합니다;
* `GROUP BY` - 만료된 행을 집계합니다.

`DELETE` 동작은 `WHERE` 절과 함께 사용하여, 필터링 조건에 따라 만료된 행 중 일부만 삭제하도록 할 수 있습니다:

```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

`GROUP BY` 표현식은 테이블 기본 키의 접두어(prefix)여야 합니다.

컬럼이 `GROUP BY` 표현식의 일부가 아니고 `SET` 절에서 명시적으로 설정되지 않은 경우, 결과 행에서는 해당 컬럼이 그룹화된 행들 중 하나에서 임의로 선택된 값을 갖게 됩니다(마치 집계 함수 `any`가 적용된 것처럼 동작합니다).

**예제**


#### `TTL`이 설정된 테이블 생성: \{#creating-a-table-with-ttl-1\}

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


#### 테이블의 `TTL` 변경: \{#altering-ttl-of-the-table\}

```sql
ALTER TABLE tab
    MODIFY TTL d + INTERVAL 1 DAY;
```

행이 1개월 후 만료되도록 테이블을 생성합니다. 만료된 행 중에서 날짜가 월요일인 행은 삭제됩니다:

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


#### 만료된 행을 재압축하도록 테이블 생성: \{#creating-a-table-where-expired-rows-are-recompressed\}

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

만료된 행을 집계하는 테이블을 생성합니다. 결과적으로 생성된 행에서 `x`에는 그룹화된 행 전체에서의 최댓값이 들어가고, `y`에는 최솟값이 들어가며, `d`에는 그룹화된 행 가운데 임의의 값이 들어갑니다.

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


### 만료된 데이터 제거 \{#mergetree-removing-expired-data\}

`TTL`이 만료된 데이터는 ClickHouse가 데이터 파트를 머지(merge)할 때 제거됩니다.

ClickHouse가 데이터가 만료된 것을 감지하면 예정되지 않은(off-schedule) 머지 작업을 수행합니다. 이러한 머지의 빈도를 제어하려면 `merge_with_ttl_timeout`을 설정하십시오. 값이 너무 낮으면 많은 예정되지 않은 머지가 수행되어 리소스를 많이 소모할 수 있습니다.

머지 사이에 `SELECT` 쿼리를 실행하면 만료된 데이터를 조회할 수 있습니다. 이를 피하려면 `SELECT` 전에 [OPTIMIZE](/sql-reference/statements/optimize.md) 쿼리를 사용하십시오.

**함께 보기**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 설정

## 디스크 유형 \{#disk-types\}

로컬 블록 디바이스 외에도 ClickHouse는 다음과 같은 스토리지 유형을 지원합니다:

- [`s3` — S3 및 MinIO용](#table_engine-mergetree-s3)
- [`gcs` — GCS용](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` — Azure Blob Storage용](/operations/storing-data#azure-blob-storage)
- [`hdfs` — HDFS용](/engines/table-engines/integrations/hdfs)
- [`web` — 웹에서 읽기 전용용](/operations/storing-data#web-storage)
- [`cache` — 로컬 캐싱용](/operations/storing-data#using-local-cache)
- [`s3_plain` — S3로 백업용](/operations/backup/disk)
- [`s3_plain_rewritable` — S3의 변경 불가능(non-replicated) 테이블용](/operations/storing-data.md#s3-plain-rewritable-storage)

## 데이터 저장에 여러 블록 디바이스 사용하기 \{#table_engine-mergetree-multiple-volumes\}

### 소개 \{#introduction\}

`MergeTree` 계열의 테이블 엔진은 여러 블록 디바이스에 데이터를 저장할 수 있습니다. 예를 들어 특정 테이블의 데이터가 암묵적으로 「핫(hot)」 데이터와 「콜드(cold)」 데이터로 나뉘는 경우에 유용합니다. 가장 최근 데이터는 자주 조회되지만 필요한 공간은 많지 않습니다. 반대로 꼬리가 두꺼운(long-tail) 특성을 가진 과거 데이터는 드물게 조회됩니다. 여러 디스크를 사용할 수 있는 경우, 「핫」 데이터는 빠른 디스크(예: NVMe SSD 또는 메모리)에, 「콜드」 데이터는 상대적으로 느린 디스크(예: HDD)에 저장하도록 구성할 수 있습니다.

데이터 파트는 `MergeTree` 엔진 테이블에서 이동 가능한 최소 단위입니다. 하나의 파트에 속한 데이터는 하나의 디스크에 저장됩니다. 데이터 파트는 사용자 설정에 따라 백그라운드에서 디스크 간에 이동될 수 있으며, [ALTER](/sql-reference/statements/alter/partition) 쿼리를 통해서도 이동할 수 있습니다.

### 용어 \{#terms\}

- Disk — 파일 시스템에 마운트된 블록 디바이스입니다.
- Default disk — [path](/operations/server-configuration-parameters/settings.md/#path) 서버 설정에 지정된 경로를 저장하는 디스크입니다.
- Volume — 동일한 디스크들로 구성된 순서 있는 집합입니다([JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)와 유사).
- Storage policy — 여러 Volume과 이들 간의 데이터 이동 규칙으로 구성된 정책입니다.

설명한 개체의 이름은 시스템 테이블 [system.storage_policies](/operations/system-tables/storage_policies) 및 [system.disks](/operations/system-tables/disks)에서 확인할 수 있습니다. 구성된 storage policy 중 하나를 테이블에 적용하려면 `MergeTree` 엔진 계열 테이블의 `storage_policy` 설정을 사용합니다.

### 구성 \{#table_engine-mergetree-multiple-volumes_configure\}

디스크, 볼륨 및 스토리지 정책은 `config.d` 디렉터리 내의 파일에서 `<storage_configuration>` 태그 안에 선언해야 합니다.

:::tip
디스크는 쿼리의 `SETTINGS` 섹션에서도 선언할 수 있습니다. 이는 예를 들어 URL로 제공되는 디스크를 일시적으로 연결하여 애드 혹(ad-hoc) 분석을 수행할 때 유용합니다.
자세한 내용은 [동적 스토리지](/operations/storing-data#dynamic-configuration)를 참조하십시오.
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

* `<disk_name_N>` — 디스크 이름입니다. 모든 디스크 이름은 서로 달라야 합니다.
* `path` — 서버가 데이터를 저장할 경로입니다( `data` 및 `shadow` 폴더). 반드시 &#39;/&#39;로 끝나야 합니다.
* `keep_free_space_bytes` — 예약해 둘 디스크 여유 공간의 크기입니다.

디스크를 정의하는 순서는 중요하지 않습니다.

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


* `policy_name_N` — 정책 이름입니다. 정책 이름은 고유해야 합니다.
* `volume_name_N` — 볼륨 이름입니다. 볼륨 이름은 고유해야 합니다.
* `disk` — 볼륨 내의 디스크입니다.
* `max_data_part_size_bytes` — 해당 볼륨의 어떤 디스크에도 저장될 수 있는 파트의 최대 크기입니다. 머지된 파트의 크기를 추정했을 때 `max_data_part_size_bytes`보다 커질 것으로 예상되면 이 파트는 다음 볼륨에 기록됩니다. 기본적으로 이 기능을 사용하면 새롭거나 작은 파트를 고속(SSD) 볼륨에 유지하다가, 크기가 커지면 저속(HDD) 볼륨으로 이동할 수 있습니다. 정책에 볼륨이 하나만 있는 경우 이 설정을 사용하지 마십시오.
* `move_factor` — 사용 가능한 공간의 양이 이 계수 이하로 떨어지면(기본값 0.1) 데이터가 자동으로 다음 볼륨으로 이동되기 시작합니다(존재하는 경우). ClickHouse는 기존 파트를 크기 기준으로 가장 큰 것부터 작은 것 순서(내림차순)로 정렬하고, `move_factor` 조건을 충족하기에 충분한 총 크기를 갖는 파트들을 선택합니다. 모든 파트의 총 크기가 충분하지 않으면 모든 파트가 이동됩니다.
* `perform_ttl_move_on_insert` — 데이터 파트 INSERT 시 TTL 이동을 비활성화합니다. 기본적으로(활성화된 경우) TTL 이동 규칙에 따라 이미 만료된 데이터 파트를 삽입하면, 해당 파트는 즉시 이동 규칙에 지정된 볼륨/디스크로 이동됩니다. 대상 볼륨/디스크가 느린 경우(예: S3) 삽입 속도가 크게 느려질 수 있습니다. 비활성화된 경우 이미 만료된 데이터 파트는 기본 볼륨에 먼저 기록된 뒤, 곧바로 TTL 볼륨으로 이동됩니다.
* `load_balancing` - 디스크 밸런싱 정책으로, `round_robin` 또는 `least_used`입니다.
* `least_used_ttl_ms` - 모든 디스크의 사용 가능 공간을 갱신하기 위한 시간 제한(밀리초)을 설정합니다 (`0` - 항상 갱신, `-1` - 절대 갱신하지 않음, 기본값은 `60000`). 디스크가 ClickHouse에서만 사용되고 온라인 파일 시스템 크기 조정/축소가 발생하지 않는다면 `-1` 값을 사용할 수 있습니다. 그 외의 경우에는, 결국 잘못된 공간 분배로 이어지므로 권장되지 않습니다.
* `prefer_not_to_merge` — 이 설정은 사용하지 않아야 합니다. 이 볼륨에서 데이터 파트 머지를 비활성화합니다(이는 해롭고 성능 저하로 이어집니다). 이 설정을 활성화하면(그렇게 하지 마십시오) 이 볼륨에서 데이터 머지가 허용되지 않습니다(좋지 않습니다). 이 설정은(그러나 필요하지 않습니다) 느린 디스크에서 ClickHouse가 작동하는 방식을 사용자가 제어할 수 있게 해 줍니다(무언가를 제어하려 한다면 이미 잘못된 방향입니다). 하지만 ClickHouse가 더 잘 알고 있으므로, 이 설정은 사용하지 마십시오.
* `volume_priority` — 볼륨이 채워지는 우선순위(순서)를 정의합니다. 값이 낮을수록 우선순위가 높습니다. 매개변수 값은 자연수여야 하며, 1부터 부여된 N(가장 낮은 우선순위)까지 번호를 건너뛰지 않고 모두 포함해야 합니다.
  * *모든* 볼륨이 태그된 경우, 설정된 순서대로 우선순위를 갖습니다.
  * 일부 볼륨만 태그된 경우, 태그가 없는 볼륨은 가장 낮은 우선순위를 갖고, 설정 파일에 정의된 순서대로 우선순위가 정해집니다.
  * *어느* 볼륨도 태그되지 않은 경우, 설정에서 선언된 순서에 따라 우선순위가 설정됩니다.
  * 두 볼륨은 동일한 우선순위 값을 가질 수 없습니다.

구성 예:

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


다음 예시에서는 `hdd_in_order` 정책이 [라운드 로빈(round-robin)](https://en.wikipedia.org/wiki/Round-robin_scheduling) 방식을 구현합니다. 따라서 이 정책은 하나의 볼륨(`single`)만 정의하며, 데이터 파트는 해당 볼륨에 속한 모든 디스크에 순환 방식으로 저장됩니다. 이와 같은 정책은 여러 개의 비슷한 디스크가 시스템에 마운트되어 있지만 RAID가 구성되어 있지 않은 경우에 상당히 유용할 수 있습니다. 각 개별 디스크 드라이브는 신뢰성이 높지 않다는 점을 고려해야 하며, 레플리카 수를 3개 이상으로 설정하여 이를 보완하는 것이 좋습니다.

시스템에 서로 다른 종류의 디스크가 존재하는 경우에는 `moving_from_ssd_to_hdd` 정책을 대신 사용할 수 있습니다. `hot` 볼륨은 SSD 디스크(`fast_ssd`)로 구성되어 있으며, 이 볼륨에 저장될 수 있는 하나의 파트의 최대 크기는 1GB입니다. 크기가 1GB를 초과하는 모든 파트는 HDD 디스크 `disk1`을 포함하는 `cold` 볼륨에 바로 저장됩니다.
또한 디스크 `fast_ssd`의 사용량이 80%를 초과하면, 백그라운드 프로세스에 의해 데이터가 `disk1`으로 이전됩니다.

스토리지 정책에서 볼륨이 나열되는 순서는, 나열된 볼륨 중 하나 이상에 `volume_priority` 파라미터가 명시적으로 설정되어 있지 않은 경우 중요합니다.
어떤 볼륨이 가득 차면 데이터는 다음 볼륨으로 이동합니다. 디스크 나열 순서 또한 중요한데, 데이터가 디스크에 순환하면서 저장되기 때문입니다.

테이블을 생성할 때, 이미 구성된 스토리지 정책 중 하나를 해당 테이블에 적용할 수 있습니다:

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

`default` 스토리지 정책은 `<path>`에 지정된 하나의 디스크로만 구성된 단 하나의 볼륨을 사용함을 의미합니다.
테이블 생성 후 [ALTER TABLE ... MODIFY SETTING] 쿼리를 사용하여 스토리지 정책을 변경할 수 있으며, 새 정책에는 기존 디스크와 볼륨이 기존과 동일한 이름으로 모두 포함되어야 합니다.

데이터 파트(parts)의 백그라운드 이동을 수행하는 스레드 개수는 [background&#95;move&#95;pool&#95;size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size) 설정으로 변경할 수 있습니다.


### Details \{#details\}

`MergeTree` 테이블의 경우, 데이터는 다음과 같은 다양한 방식으로 디스크에 저장됩니다:

- `INSERT` 쿼리의 결과로 저장될 때.
- 백그라운드 머지와 [뮤테이션](/sql-reference/statements/alter#mutations) 중에.
- 다른 레플리카에서 데이터를 가져올 때.
- 파티션 동결의 결과로 [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)을 실행할 때.

뮤테이션과 파티션 동결을 제외한 모든 경우에, 파트는 지정된 스토리지 정책에 따라 볼륨과 디스크에 저장됩니다:

1.  파트를 저장하기에 충분한 디스크 공간이 있고(`unreserved_space > current_part_size`), 주어진 크기의 파트를 저장하는 것이 허용된(`max_data_part_size_bytes > current_part_size`) 첫 번째 볼륨(정의 순서 기준)이 선택됩니다.
2.  이 볼륨 내에서는, 이전 데이터 청크를 저장하는 데 사용되었던 디스크의 다음 디스크 중에서, 파트 크기보다 더 많은 여유 공간이 있는 디스크가 선택됩니다(`unreserved_space - keep_free_space_bytes > current_part_size`).

내부적으로, 뮤테이션과 파티션 동결은 [hard links](https://en.wikipedia.org/wiki/Hard_link)를 사용합니다. 서로 다른 디스크 간의 하드 링크는 지원되지 않으므로, 이러한 경우 결과 파트는 원래 파트와 동일한 디스크에 저장됩니다.

백그라운드에서는 구성 파일에 선언된 볼륨 순서에 따라, 사용 가능한 여유 공간(`move_factor` 파라미터)을 기준으로 파트가 볼륨 간에 이동됩니다.
데이터가 마지막 볼륨에서 다른 곳으로 이동되거나, 다른 볼륨에서 첫 번째 볼륨으로 이동되는 일은 없습니다. 백그라운드 이동을 모니터링하기 위해 시스템 테이블 [system.part_log](/operations/system-tables/part_log) (필드 `type = MOVE_PART`)와 [system.parts](/operations/system-tables/parts.md) (필드 `path` 및 `disk`)를 사용할 수 있습니다. 또한, 자세한 정보는 서버 로그에서 확인할 수 있습니다.

사용자는 [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition) 쿼리를 사용하여 파트 또는 파티션을 한 볼륨에서 다른 볼륨으로 강제로 이동시킬 수 있으며, 이때 백그라운드 작업에 대한 모든 제약이 적용됩니다. 이 쿼리는 직접 이동 작업을 시작하며 백그라운드 작업이 완료될 때까지 기다리지 않습니다. 사용 가능한 여유 공간이 충분하지 않거나 필요한 조건 중 하나라도 충족되지 않으면 오류 메시지가 반환됩니다.

데이터 이동은 데이터 복제에 영향을 주지 않습니다. 따라서 동일한 테이블에 대해 서로 다른 레플리카에서 서로 다른 스토리지 정책을 지정할 수 있습니다.

백그라운드 머지와 뮤테이션이 완료된 후, 오래된 파트는 일정 시간이 지난 뒤에만 제거됩니다(`old_parts_lifetime`).
이 시간 동안 오래된 파트는 다른 볼륨이나 디스크로 이동되지 않습니다. 따라서 파트가 최종적으로 제거될 때까지는, 사용 중인 디스크 공간을 계산할 때 이 파트들도 계속 포함됩니다.

사용자는 [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) 볼륨의 서로 다른 디스크에 새로운 큰 파트를 균형 있게 할당하기 위해 [min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min_bytes_to_rebalance_partition_over_jbod) 설정을 사용할 수 있습니다.

## 데이터 저장을 위한 외부 스토리지 사용 \{#table_engine-mergetree-s3\}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 계열 테이블 엔진은 `s3`, `azure_blob_storage`, `hdfs` 유형의 디스크를 사용하여 각각 `S3`, `AzureBlobStorage`, `HDFS`에 데이터를 저장할 수 있습니다. 자세한 내용은 [외부 스토리지 옵션 구성](/operations/storing-data.md/#configuring-external-storage)을 참조하십시오.

`s3` 유형의 디스크를 사용하는 외부 스토리지로 [S3](https://aws.amazon.com/s3/)를 사용하는 예입니다.

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

[외부 스토리지 옵션 구성](/operations/storing-data.md/#configuring-external-storage)도 참고하십시오.

공유 스토리지에서 단일 writer와 다중 reader 시나리오로 비복제 MergeTree 테이블을 설정할 수 있습니다. 이는 읽기 노드에서 설정할 수 있는 파트 목록 자동 새로 고침 기능을 통해 제공됩니다. 이 기능에는 레플리카 간에 공유되는 파일 시스템 메타데이터(또는 테이블 로컬 디스크에서 `table_disk = true` 설정)가 필요합니다. 자세한 내용은 [refresh&#95;parts&#95;interval 및 table&#95;disk](/operations/storing-data.md/#refresh-parts-interval-and-table-disk)를 참고하십시오.

:::note 캐시 구성
ClickHouse 22.3에서 22.7까지의 버전은 다른 캐시 구성을 사용하므로, 해당 버전을 사용하는 경우 [로컬 캐시 사용](/operations/storing-data.md/#using-local-cache)을 참고하십시오.
:::


## Virtual columns \{#virtual-columns\}

- `_part` — 파트 이름.
- `_part_index` — 쿼리 결과에서 파트의 순차 인덱스.
- `_part_starting_offset` — 쿼리 결과에서 파트의 누적 시작 행 번호.
- `_part_offset` — 파트 내 행 번호.
- `_part_granule_offset` — 파트 내 그라뉼 번호.
- `_partition_id` — 파티션 이름.
- `_part_uuid` — 고유 파트 식별자(MergeTree `assign_part_uuids` 설정이 활성화된 경우).
- `_part_data_version` — 파트의 데이터 버전(최소 블록 번호 또는 뮤테이션 버전).
- `_partition_value` — `partition by` 표현식의 값(튜플).
- `_sample_factor` — 샘플링 계수(쿼리에서 사용한 값).
- `_block_number` — 삽입 시 행에 할당되었던 원래 블록 번호로, `enable_block_number_column` SETTING이 활성화된 경우 머지 과정에서도 유지됩니다.
- `_block_offset` — 삽입 시 블록 내 행에 할당되었던 원래 행 번호로, `enable_block_offset_column` SETTING이 활성화된 경우 머지 과정에서도 유지됩니다.
- `_disk_name` — 저장소에 사용되는 디스크 이름.

## 컬럼 통계 \{#column-statistics\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

통계 선언은 `set allow_experimental_statistics = 1`을 활성화했을 때 `*MergeTree*` 패밀리 테이블에 대한 `CREATE` 쿼리의 컬럼 섹션에서 정의됩니다.

```sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

또한 `ALTER` SQL 문을 사용하여 통계를 관리할 수도 있습니다.

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

이 경량 통계는 컬럼 값들의 분포에 대한 정보를 집계합니다. 통계는 각 파트(part)에 저장되며, 각 INSERT가 수행될 때마다 업데이트됩니다.
`set use_statistics = 1`을 활성화한 경우에만 PREWHERE 최적화를 위해 사용할 수 있습니다.


### 사용 가능한 컬럼 통계 유형 \{#available-types-of-column-statistics\}

- `MinMax`

    숫자 컬럼에 대한 범위 필터의 선택도를 추정할 수 있도록 컬럼 값의 최소값과 최대값을 저장합니다.

    구문: `minmax`

- `TDigest`

    숫자 컬럼에 대해 근사 백분위수(예: 90번째 백분위수)를 계산할 수 있도록 하는 [TDigest](https://github.com/tdunning/t-digest) 스케치입니다.

    구문: `tdigest`

- `Uniq`

    컬럼에 포함된 서로 다른 값의 개수를 추정할 수 있도록 하는 [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 스케치입니다.

    구문: `uniq`

- `CountMin`

    컬럼의 각 값이 나타나는 빈도를 근사적으로 계산해 주는 [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) 스케치입니다.

    구문 `countmin`

### 지원되는 데이터 타입 \{#supported-data-types\}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String 또는 FixedString |
|-----------|----------------------------------------------------|-------------------------|
| CountMin  | ✔                                                  | ✔                       |
| MinMax    | ✔                                                  | ✗                       |
| TDigest   | ✔                                                  | ✗                       |
| Uniq      | ✔                                                  | ✔                       |

### 지원되는 연산 \{#supported-operations\}

|           | 동등 필터 (==) | 범위 필터 (`>, >=, <, <=`) |
|-----------|----------------|----------------------------|
| CountMin  | ✔              | ✗                          |
| MinMax    | ✗              | ✔                          |
| TDigest   | ✗              | ✔                          |
| Uniq      | ✔              | ✗                          |

## 컬럼 수준 설정 \{#column-level-settings\}

일부 MergeTree 설정은 컬럼 수준에서 개별적으로 설정할 수 있습니다:

* `max_compress_block_size` — 테이블에 데이터를 기록할 때, 압축되기 전 비압축 데이터 블록의 최대 크기입니다.
* `min_compress_block_size` — 다음 마크를 기록할 때 압축을 수행하기 위해 필요한 비압축 데이터 블록의 최소 크기입니다.

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

컬럼 수준 설정은 [ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md)을 사용하여 수정하거나 제거할 수 있습니다. 예:

* 컬럼 선언에서 `SETTINGS`를 제거합니다:

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

* 설정을 수정하려면:

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

* 하나 이상의 설정을 초기화하며, 테이블 CREATE 쿼리의 컬럼 표현식에 있는 설정 선언도 제거합니다.

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
