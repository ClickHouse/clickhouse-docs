---
description: '지속적으로 변경되는 객체 상태를 빠르게 기록하며, 백그라운드에서 오래된 객체 상태를 삭제할 수 있게 합니다.'
sidebar_label: 'VersionedCollapsingMergeTree'
sidebar_position: 80
slug: /engines/table-engines/mergetree-family/versionedcollapsingmergetree
title: 'VersionedCollapsingMergeTree 테이블 엔진'
doc_type: 'reference'
---



# VersionedCollapsingMergeTree 테이블 엔진 \{#versionedcollapsingmergetree-table-engine\}

이 엔진은 다음과 같은 특징이 있습니다.

- 지속적으로 변하는 객체 상태를 빠르게 기록할 수 있습니다.
- 오래된 객체 상태를 백그라운드에서 삭제합니다. 이를 통해 저장소 사용량을 크게 줄일 수 있습니다.

자세한 내용은 [Collapsing](#table_engines_versionedcollapsingmergetree) 섹션을 참조하십시오.

이 엔진은 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)를 상속하며, 데이터 파트 병합 알고리즘에 행을 축약(collapse)하는 로직을 추가합니다. `VersionedCollapsingMergeTree`는 [CollapsingMergeTree](../../../engines/table-engines/mergetree-family/collapsingmergetree.md)와 동일한 목적을 가지지만, 여러 스레드를 사용해 임의의 순서로 데이터를 삽입할 수 있게 해 주는 다른 축약(collapse) 알고리즘을 사용합니다. 특히 `Version` 컬럼은 잘못된 순서로 삽입되더라도 행을 올바르게 축약하는 데 도움이 됩니다. 반면 `CollapsingMergeTree`는 엄격하게 순차적인 삽입만 허용합니다.



## 테이블 생성 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = VersionedCollapsingMergeTree(sign, version)
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

쿼리 매개변수에 대한 설명은 [쿼리 설명](../../../sql-reference/statements/create/table.md)을 참조하십시오.

### 엔진 매개변수 \{#engine-parameters\}

```sql
VersionedCollapsingMergeTree(sign, version)
```

| Parameter | Description                                                | Type                                                                                                                                                                                                                                                                                          |
| --------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sign`    | 행의 유형을 나타내는 컬럼 이름입니다. `1`은 「state」 행, `-1`은 「cancel」 행입니다. | [`Int8`](/sql-reference/data-types/int-uint)                                                                                                                                                                                                                                                  |
| `version` | 객체 상태 버전을 나타내는 컬럼 이름입니다.                                   | [`Int*`](/sql-reference/data-types/int-uint), [`UInt*`](/sql-reference/data-types/int-uint), [`Date`](/sql-reference/data-types/date), [`Date32`](/sql-reference/data-types/date32), [`DateTime`](/sql-reference/data-types/datetime) 또는 [`DateTime64`](/sql-reference/data-types/datetime64) |

### Query 절 \{#query-clauses\}

`VersionedCollapsingMergeTree` 테이블을 생성할 때는 `MergeTree` 테이블을 생성할 때와 동일한 [절](../../../engines/table-engines/mergetree-family/mergetree.md)이 필요합니다.

<details markdown="1">
  <summary>테이블 생성의 사용 중단된 방식</summary>

  :::note
  새로운 프로젝트에서는 이 방법을 사용하지 마십시오. 가능하다면 기존 프로젝트도 위에서 설명한 방법으로 전환하십시오.
  :::

  ```sql
  CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
  (
      name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
      name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
      ...
  ) ENGINE [=] VersionedCollapsingMergeTree(date-column [, samp#table_engines_versionedcollapsingmergetreeling_expression], (primary, key), index_granularity, sign, version)
  ```

  `sign`과 `version`을 제외한 모든 매개변수는 `MergeTree`에서와 동일한 의미를 가집니다.

  * `sign` — 행의 유형을 나타내는 컬럼 이름입니다. `1`은 「state」 행, `-1`은 「cancel」 행입니다.

    컬럼 데이터 타입 — `Int8`.

  * `version` — 객체 상태 버전을 나타내는 컬럼 이름입니다.

    컬럼 데이터 타입은 `UInt*`이어야 합니다.
</details>


## Collapsing \{#table_engines_versionedcollapsingmergetree\}

### Data \{#data\}

특정 객체에 대해 지속적으로 변경되는 데이터를 저장해야 하는 상황을 가정해 보십시오. 하나의 객체에 대해 하나의 행을 두고, 변경이 있을 때마다 해당 행을 업데이트하는 것이 합리적입니다. 그러나 업데이트 작업은 스토리지에 있는 데이터를 다시 기록해야 하므로 DBMS 입장에서 비용이 많이 들고 느립니다. 데이터를 빠르게 기록해야 할 때에는 업데이트를 사용할 수 없지만, 대신 객체에 대한 변경 내용을 다음과 같이 순차적으로 기록할 수 있습니다.

행을 기록할 때 `Sign` 컬럼을 사용합니다. `Sign = 1`이면 그 행이 객체의 상태를 나타낸다는 의미입니다(이를 「state」 행이라고 부르겠습니다). `Sign = -1`이면 동일한 속성을 가진 객체의 상태를 취소한다는 의미입니다(이를 「cancel」 행이라고 부르겠습니다). 또한 각 객체 상태를 서로 구분할 수 있도록 고유한 번호를 부여하는 `Version` 컬럼을 사용합니다.

예를 들어, 어떤 사이트에서 사용자가 방문한 페이지 수와 그곳에 머문 시간을 계산하려고 한다고 가정하겠습니다. 특정 시점에 다음과 같은 사용자 활동 상태를 나타내는 행을 기록합니다.

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

이후 어느 시점에 사용자 활동의 변화를 기록하며, 이를 다음의 두 행으로 저장합니다.

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

첫 번째 행은 객체(사용자)의 이전 상태를 소거합니다. 이 행에는 `Sign`을 제외한 소거되는 상태의 모든 필드가 복사되어야 합니다.

두 번째 행에는 현재 상태가 포함됩니다.

사용자 활동의 마지막 상태만 필요하므로, 행들은

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

이 행들은 삭제할 수 있으며, 객체의 잘못된(이전) 상태를 접어(collapse) 버립니다. `VersionedCollapsingMergeTree` 엔진은 데이터 파트를 병합하는 동안 이 작업을 수행합니다.

각 변경마다 2개의 행이 필요한 이유는 [Algorithm](#table_engines-versionedcollapsingmergetree-algorithm)을 참고하십시오.

**사용 시 참고 사항**

1. 데이터를 기록하는 프로그램은 취소가 가능하도록 객체의 상태를 기억해야 합니다. 「Cancel」 문자열에는 기본 키 필드의 복사본과 「state」 문자열의 버전, 그리고 반대의 `Sign`이 포함되어야 합니다. 이렇게 하면 초기 저장 공간 사용량은 증가하지만 데이터를 빠르게 기록할 수 있습니다.
2. 컬럼에 긴 배열이 계속 누적되면 기록 부하로 인해 엔진 효율이 저하됩니다. 데이터가 단순할수록 효율이 더 좋습니다.
3. `SELECT` 결과는 객체 변경 이력의 일관성에 크게 의존합니다. 데이터를 삽입하기 전에 주의 깊게 준비해야 합니다. 세션 깊이와 같이 음수가 될 수 없는 메트릭에 음수 값이 나타나는 등, 일관성이 없는 데이터에서는 예측할 수 없는 결과가 발생할 수 있습니다.

### Algorithm \{#table_engines-versionedcollapsingmergetree-algorithm\}

ClickHouse가 데이터 파트를 병합할 때는 기본 키와 버전은 같고 `Sign`이 서로 다른 행 쌍을 각각 삭제합니다. 행의 순서는 상관없습니다.

ClickHouse가 데이터를 삽입할 때는 기본 키를 기준으로 행을 정렬합니다. `Version` 컬럼이 기본 키에 포함되어 있지 않으면 ClickHouse는 이를 기본 키의 마지막 필드로 암묵적으로 추가하여 정렬에 사용합니다.


## 데이터 선택 \{#selecting-data\}

ClickHouse는 동일한 기본 키를 가진 모든 행이 동일한 결과 데이터 파트에 저장되거나, 심지어 동일한 물리 서버에 존재할 것이라고 보장하지 않습니다. 이는 데이터 쓰기 시점과 이후 데이터 파트 병합 시점 모두에 해당합니다. 또한 ClickHouse는 여러 스레드로 `SELECT` 쿼리를 처리하므로 결과에서 행의 순서를 예측할 수 없습니다. 따라서 `VersionedCollapsingMergeTree` 테이블에서 완전히 "접힌(collapsed)" 데이터를 얻어야 하는 경우에는 집계가 필요합니다.

접힘을 최종적으로 완료하려면, `GROUP BY` 절과 부호를 반영하는 집계 함수를 사용하여 쿼리를 작성합니다. 예를 들어 개수를 계산할 때는 `count()` 대신 `sum(Sign)`을 사용합니다. 값의 합을 계산할 때는 `sum(x)` 대신 `sum(Sign * x)`를 사용하고, `HAVING sum(Sign) > 0`을 추가합니다.

`count`, `sum`, `avg` 집계 함수는 이 방식으로 계산할 수 있습니다. 객체에 최소 하나의 비접힘(non-collapsed) 상태가 있는 경우에는 `uniq` 집계도 계산할 수 있습니다. `min`과 `max` 집계는 `VersionedCollapsingMergeTree`가 접힌 상태 값의 이력을 저장하지 않기 때문에 계산할 수 없습니다.

집계를 하지 않고 "접힘"을 적용한 데이터를 추출해야 하는 경우(예: 최신 값이 특정 조건과 일치하는 행이 존재하는지 확인하기 위한 경우), `FROM` 절에 대해 `FINAL` 수정자를 사용할 수 있습니다. 이 방법은 비효율적이며, 대용량 테이블에는 사용하지 않는 것이 좋습니다.



## 사용 예 \{#example-of-use\}

예제 데이터:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

테이블 생성:

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews UInt8,
    Duration UInt8,
    Sign Int8,
    Version UInt8
)
ENGINE = VersionedCollapsingMergeTree(Sign, Version)
ORDER BY UserID
```

데이터 삽입하기:

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1, 1),(4324182021466249494, 6, 185, 1, 2)
```

두 개의 서로 다른 데이터 파트를 생성하기 위해 두 개의 `INSERT` 쿼리를 사용합니다. 하나의 쿼리로 데이터를 삽입하면 ClickHouse는 하나의 데이터 파트만 생성하며 어떠한 병합(merge)도 수행하지 않습니다.

데이터 가져오기:

```sql
SELECT * FROM UAct
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 │
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

지금 보고 있는 내용은 무엇이며, 축약된 파트는 어디에 있습니까?
두 개의 `INSERT` 쿼리를 사용하여 두 개의 데이터 파트를 생성했습니다. `SELECT` 쿼리는 두 개의 스레드에서 수행되었고, 그 결과는 행의 임의 순서입니다.
데이터 파트가 아직 병합되지 않았기 때문에 축약이 발생하지 않았습니다. ClickHouse는 데이터 파트를 사용자가 예측할 수 없는 시점에 병합합니다.

따라서 집계가 필요합니다:

```sql
SELECT
    UserID,
    sum(PageViews * Sign) AS PageViews,
    sum(Duration * Sign) AS Duration,
    Version
FROM UAct
GROUP BY UserID, Version
HAVING sum(Sign) > 0
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │       2 │
└─────────────────────┴───────────┴──────────┴─────────┘
```

집계가 필요하지 않고 collapsing을 강제로 수행하려는 경우 `FROM` 절에서 `FINAL` 수정자를 사용할 수 있습니다.

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

데이터를 조회하는 방식으로는 매우 비효율적입니다. 대용량 테이블에는 사용하지 마십시오.
