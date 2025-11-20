---
'description': '끊임없이 변화하는 객체 상태를 빠르게 기록하고, 백그라운드에서 이전 객체 상태를 삭제할 수 있게 합니다.'
'sidebar_label': 'VersionedCollapsingMergeTree'
'sidebar_position': 80
'slug': '/engines/table-engines/mergetree-family/versionedcollapsingmergetree'
'title': '버전이 있는 CollapsingMergeTree 테이블 엔진'
'doc_type': 'reference'
---


# VersionedCollapsingMergeTree 테이블 엔진

이 엔진은:

- 지속적으로 변경되는 객체 상태의 빠른 작성을 허용합니다.
- 백그라운드에서 오래된 객체 상태를 삭제합니다. 이로 인해 저장 용량이 크게 줄어듭니다.

자세한 내용은 [Collapsing](#table_engines_versionedcollapsingmergetree) 섹션을 참조하십시오.

이 엔진은 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)로부터 상속되며, 데이터 파트를 병합하는 알고리즘에 행을 병합하는 로직을 추가합니다. `VersionedCollapsingMergeTree`는 [CollapsingMergeTree](../../../engines/table-engines/mergetree-family/collapsingmergetree.md)와 동일한 목적을 가지고 있지만, 여러 스레드로 임의의 순서로 데이터를 삽입할 수 있는 다른 병합 알고리즘을 사용합니다. 특히, `Version` 컬럼은 잘못된 순서로 삽입되더라도 행을 올바르게 병합하는 데 도움을 줍니다. 반면, `CollapsingMergeTree`는 오로지 엄격하게 연속적인 삽입만 허용합니다.

## 테이블 생성하기 {#creating-a-table}

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

쿼리 매개변수에 대한 설명은 [쿼리 설명](../../../sql-reference/statements/create/table.md)를 참조하십시오.

### 엔진 매개변수 {#engine-parameters}

```sql
VersionedCollapsingMergeTree(sign, version)
```

| 매개변수 | 설명                                                                            | 타입                                                                                                                                                                                                                                                                                    |
|-----------|--------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sign`    | 행의 유형을 나타내는 컬럼의 이름: `1`은 "상태" 행, `-1`은 "취소" 행입니다. | [`Int8`](/sql-reference/data-types/int-uint)                                                                                                                                                                                                                                    |
| `version` | 객체 상태의 버전을 나타내는 컬럼의 이름입니다.                               | [`Int*`](/sql-reference/data-types/int-uint), [`UInt*`](/sql-reference/data-types/int-uint), [`Date`](/sql-reference/data-types/date), [`Date32`](/sql-reference/data-types/date32), [`DateTime`](/sql-reference/data-types/datetime) 또는 [`DateTime64`](/sql-reference/data-types/datetime64) |

### 쿼리 절 {#query-clauses}

`VersionedCollapsingMergeTree` 테이블을 생성할 때는 `MergeTree` 테이블을 생성할 때와 동일한 [절](../../../engines/table-engines/mergetree-family/mergetree.md)이 필요합니다.

<details markdown="1">

<summary>테이블 생성의 더 이상 사용되지 않는 방법</summary>

:::note
새 프로젝트에서는 이 방법을 사용하지 마십시오. 가능하다면, 이전 프로젝트를 위에서 설명한 방법으로 전환하십시오.
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] VersionedCollapsingMergeTree(date-column [, samp#table_engines_versionedcollapsingmergetreeling_expression], (primary, key), index_granularity, sign, version)
```

`sign`과 `version`을 제외한 모든 매개변수는 `MergeTree`에서와 동일하게 해석됩니다.

- `sign` — 행의 유형을 나타내는 컬럼의 이름: `1`은 "상태" 행, `-1`은 "취소" 행입니다.

    컬럼 데이터 타입 — `Int8`.

- `version` — 객체 상태의 버전을 나타내는 컬럼의 이름입니다.

    컬럼 데이터 타입은 `UInt*`이어야 합니다.

</details>

## 병합 {#table_engines_versionedcollapsingmergetree}

### 데이터 {#data}

지속적으로 변경되는 데이터를 어떤 객체에 대해 저장해야 하는 상황을 고려해보세요. 객체에 대해 하나의 행을 가지고 변경 사항이 있을 때마다 그 행을 업데이트하는 것이 합리적입니다. 그러나 업데이트 작업은 DBMS에 대해 데이터 스토리지를 다시 쓰는 것을 요구하기 때문에 비싼 비용과 느림을 초래합니다. 데이터를 빠르게 작성해야 할 경우 업데이트는 허용되지 않지만, 다음과 같이 객체의 변경 사항을 순차적으로 기록할 수 있습니다.

행을 작성할 때 `Sign` 컬럼을 사용하십시오. 만약 `Sign = 1`이면, 이는 행이 객체의 상태임을 의미합니다(이를 "상태" 행이라고 부릅니다). 만약 `Sign = -1`이면, 이는 동일한 속성을 가진 객체의 상태 취소를 나타냅니다(이를 "취소" 행이라고 부릅니다). 또한 각 객체의 상태를 별도의 번호로 식별해야 하는 `Version` 컬럼도 사용하십시오.

예를 들어, 사용자가 어떤 사이트에서 방문한 페이지 수와 그들이 얼마나 머물렀는지를 계산하고 싶다고 가정해 봅시다. 어느 시점에서 우리는 사용자 활동 상태를 다음과 같이 기록합니다:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

조금 후, 사용자의 활동 변경을 등록하고 이를 다음 두 행으로 기록합니다.

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

첫 번째 행은 객체(사용자)의 이전 상태를 취소합니다. 이것은 취소된 상태의 모든 필드를 복사해야 하며 `Sign`을 제외해야 합니다.

두 번째 행은 현재 상태를 포함합니다.

우리는 사용자 활동의 마지막 상태만 필요하므로, 

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

행을 삭제하여 잘못된 (오래된) 객체 상태를 병합할 수 있습니다. `VersionedCollapsingMergeTree`는 데이터를 병합하는 동안 이를 수행합니다.

왜 각 변경사항에 대해 두 개의 행이 필요한지 알고 싶다면 [Algorithm](#table_engines-versionedcollapsingmergetree-algorithm) 섹션을 참조하십시오.

**사용 시 유의사항**

1.  데이터를 기록하는 프로그램은 객체의 상태를 기억해야 이를 취소할 수 있습니다. "취소" 문자열은 기본 키 필드와 "상태" 문자열의 버전 및 반대의 `Sign`의 복사본을 포함해야 합니다. 이는 초기 저장소의 크기를 증가시키지만, 데이터를 빠르게 기록할 수 있도록 합니다.
2.  컬럼 내에서 긴 배열들이 늘어나는 것은 작성 부하로 인해 엔진의 효율성을 감소시킵니다. 데이터가 간단할수록 효율성이 더 좋아집니다.
3.  `SELECT` 결과는 객체 변경 이력의 일관성에 강하게 의존합니다. 데이터를 삽입하기 전에 정확하게 준비해야 합니다. 일관성이 없는 데이터로 인해 비예측적인 결과를 얻을 수 있으며, 예를 들어 세션 깊이와 같은 비부정적인 메트릭에 대해 부정적인 값을 얻을 수 있습니다.

### 알고리즘 {#table_engines-versionedcollapsingmergetree-algorithm}

ClickHouse는 데이터 파트를 병합할 때, 동일한 기본 키와 버전을 가진 서로 다른 `Sign`을 가진 각 행 쌍을 삭제합니다. 행의 순서는 중요하지 않습니다.

ClickHouse가 데이터를 삽입할 때, 행은 기본 키에 따라 정렬됩니다. `Version` 컬럼이 기본 키에 포함되어 있지 않으면, ClickHouse는 이를 마지막 필드로 기본 키에 암묵적으로 추가하고 정렬에 사용합니다.

## 데이터 선택하기 {#selecting-data}

ClickHouse는 동일한 기본 키를 가진 모든 행이 동일한 결과 데이터 파트에 존재하는지 또는 동일한 물리적 서버에 존재하는지 보장하지 않습니다. 이는 데이터를 작성할 때와 이후 데이터 파트를 병합할 때 모두 해당됩니다. 또한 ClickHouse는 여러 스레드를 사용하여 `SELECT` 쿼리를 처리하며, 결과의 행 순서를 예측할 수 없습니다. 이는 `VersionedCollapsingMergeTree` 테이블에서 완전히 "병합된" 데이터를 가져와야 할 경우 집계가 필요함을 의미합니다.

병합을 마치려면, `GROUP BY` 절과 기호를 고려한 집계 함수를 포함한 쿼리를 작성하십시오. 예를 들어, 수량을 계산하기 위해 `count()` 대신 `sum(Sign)`을 사용하십시오. 무언가의 합계를 계산하려면 `sum(Sign * x)`를 사용하고 `HAVING sum(Sign) > 0`을 추가하십시오.

집계 `count`, `sum` 및 `avg`는 이와 같은 방식으로 계산할 수 있습니다. 집계 `uniq`는 객체에 담긴 비병합 상태가 적어도 하나가 있을 경우 계산할 수 있습니다. 집계 `min` 및 `max`는 계산할 수 없으며, 이는 `VersionedCollapsingMergeTree`가 병합된 상태의 값 이력을 저장하지 않기 때문입니다.

"병합"된 데이터를 집계 없이 추출해야 하는 경우(예: 최신 값이 특정 조건과 일치하는 행이 존재하는지를 확인하기 위함), `FROM` 절에 `FINAL` 수식어를 사용할 수 있습니다. 이 접근 방식은 비효율적이며 대규모 테이블에는 사용하지 않아야 합니다.

## 사용 예 {#example-of-use}

예제 데이터:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

테이블 생성하기:

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

우리는 두 개의 서로 다른 데이터 파트를 생성하기 위해 두 개의 `INSERT` 쿼리를 사용합니다. 만약 단일 쿼리로 데이터를 삽입하면, ClickHouse는 하나의 데이터 파트를 생성하고 결코 병합을 수행하지 않습니다.

데이터 얻기:

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

우리는 여기에서 무엇을 보고 있으며 병합된 부분은 어디에 있습니까?
우리는 두 개의 `INSERT` 쿼리를 사용하여 두 개의 데이터 파트를 생성했습니다. `SELECT` 쿼리는 두 개의 스레드에서 수행되었으며 결과는 행의 임의의 순서입니다.
아직 데이터 파트가 병합되지 않았으므로 병합이 발생하지 않았습니다. ClickHouse는 우리가 예측할 수 없는 시점에서 데이터 파트를 병합합니다.

이렇기 때문에 우리는 집계가 필요합니다:

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

如果我们不需要聚合，并且想要强制合并，我们可以在 `FROM` 子句中使用 `FINAL` 修饰符。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

这是一个非常低效的选择数据的方法。不要在大型表上使用它.
