---
'description': 'MergeTree에서 상속되지만 병합 프로세스 중 행을 축소하는 로직을 추가합니다.'
'keywords':
- 'updates'
- 'collapsing'
'sidebar_label': 'CollapsingMergeTree'
'sidebar_position': 70
'slug': '/engines/table-engines/mergetree-family/collapsingmergetree'
'title': 'CollapsingMergeTree 테이블 엔진'
'doc_type': 'guide'
---


# CollapsingMergeTree 테이블 엔진

## 설명 {#description}

`CollapsingMergeTree` 엔진은 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)에서 상속되며, 병합 프로세스 중에 행을 축소하는 논리를 추가합니다. 
`CollapsingMergeTree` 테이블 엔진은 정렬 키(`ORDER BY`)의 모든 필드가 동일할 경우, `Sign`이라는 특수 필드를 제외하고, 쌍의 행을 비동기적으로 삭제(축소)합니다. 
`Sign` 필드는 `1` 또는 `-1`의 값을 가질 수 있습니다. 
상대 값이 없는 `Sign`을 가진 행은 유지됩니다.

자세한 내용은 문서의 [Collapsing](#table_engine-collapsingmergetree-collapsing) 섹션을 참조하세요.

:::note
이 엔진은 저장 공간의 양을 크게 줄일 수 있으며, 그 결과로 `SELECT` 쿼리의 효율성을 높입니다.
:::

## 매개변수 {#parameters}

`Sign` 매개변수를 제외한 모든 매개변수는 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree)와 동일한 의미를 가집니다.

- `Sign` — `1`은 "상태" 행이고 `-1`은 "취소" 행인 행의 유형을 가진 열의 이름입니다. 유형: [Int8](/sql-reference/data-types/int-uint).

## 테이블 생성 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) 
ENGINE = CollapsingMergeTree(Sign)
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

<details markdown="1">

<summary> 테이블 생성을 위한 더 이상 권장되지 않는 방법 </summary>

:::note
아래 방법은 새로운 프로젝트에서 사용을 권장하지 않습니다. 
가능한 경우, 오래된 프로젝트를 새 방법으로 업데이트하는 것을 권장합니다.
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) 
ENGINE [=] CollapsingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, Sign)
```

`Sign` — `1`은 "상태" 행이고 `-1`은 "취소" 행인 행의 유형을 가진 열의 이름입니다. [Int8](/sql-reference/data-types/int-uint).

</details>

- 쿼리 매개변수에 대한 설명은 [쿼리 설명](../../../sql-reference/statements/create/table.md)를 참조하세요.
- `CollapsingMergeTree` 테이블을 생성할 때는 `MergeTree` 테이블을 생성할 때와 마찬가지로 동일한 [쿼리 절](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)이 필요합니다.

## 축소 {#table_engine-collapsingmergetree-collapsing}

### 데이터 {#data}

특정 객체에 대해 지속적으로 변화하는 데이터를 저장해야 하는 상황을 고려해 보세요. 
객체당 하나의 행을 두고 변동이 있을 때마다 업데이트하는 것이 논리적으로 들릴 수 있지만,
업데이트 작업은 DBMS에 비용이 크고 느리며, 저장소의 데이터를 다시 작성해야 하기 때문에 그렇습니다. 
빠르게 데이터를 작성해야 할 경우, 많은 수의 업데이트를 수행하는 것은 용납할 수 없는 접근 방식입니다. 
하지만 객체의 변경 사항을 순차적으로 작성할 수 있습니다. 
이를 위해 우리는 특수한 열 `Sign`을 사용합니다.

- `Sign` = `1`이면 해당 행은 "상태" 행을 의미합니다: _현재 유효한 상태를 나타내는 필드를 포함하는 행_입니다. 
- `Sign` = `-1`이면 해당 행은 "취소" 행을 의미합니다: _동일한 속성을 가진 객체의 상태를 취소하는 데 사용되는 행_입니다.

예를 들어, 우리는 사용자가 특정 웹사이트에서 체크한 페이지 수와 그 페이지에 방문한 시간을 계산하고 싶습니다. 
어떤 특정 순간에 사용자 활동의 상태를 다음과 같은 행으로 기록합니다:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

나중에 사용자 활동의 변화를 기록하고 다음 두 행으로 이를 작성합니다:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

첫 번째 행은 객체의 이전 상태(이 경우 사용자)를 취소합니다. 
이는 "취소된" 행의 모든 정렬 키 필드를 `Sign`을 제외하고 복사해야 합니다. 
위의 두 번째 행은 현재 상태를 포함합니다.

우리는 사용자 활동의 마지막 상태만 필요하므로, 아래와 같이 삽입한 원래 "상태" 행과 "취소" 행을 삭제할 수 있습니다. 
이를 통해 객체의 유효하지 않은(구식) 상태가 축소됩니다:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │ -- old "state" row can be deleted
│ 4324182021466249494 │         5 │      146 │   -1 │ -- "cancel" row can be deleted
│ 4324182021466249494 │         6 │      185 │    1 │ -- new "state" row remains
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree`는 데이터 파트의 병합이 진행되는 동안 정확히 이러한 _축소_ 동작을 수행합니다.

:::note
각 변경사항에 두 개의 행이 필요한 이유는 [알고리즘](#table_engine-collapsingmergetree-collapsing-algorithm) 단락에서 더 논의됩니다.
:::

**이러한 접근 방식의 특이점**

1.  데이터를 기록하는 프로그램은 객체의 상태를 기억하여 이를 취소할 수 있어야 합니다. "취소" 행은 "상태" 행의 정렬 키 필드를 복사하고 반대의 `Sign`을 가져야 합니다. 이는 초기 저장 크기를 증가시키지만 데이터를 빠르게 작성할 수 있게 합니다.
2.  컬럼에 길게 자라는 배열은 쓰기 부담이 증가하여 엔진의 효율성을 떨어뜨립니다. 데이터가 단순할수록 효율성이 높아집니다.
3.  `SELECT` 결과는 객체 변경 기록의 일관성에 많이 의존합니다. 삽입을 위한 데이터를 준비할 때 주의를 기울이세요. 일관되지 않은 데이터로 인해 예측할 수 없는 결과를 얻을 수 있습니다. 예를 들어, 세션 깊이와 같은 비부정적 메트릭에 대해 부정적 값을 얻을 수 있습니다.

### 알고리즘 {#table_engine-collapsingmergetree-collapsing-algorithm}

클릭하우스가 데이터 [파트](/concepts/glossary#parts)를 병합할 때, 
같은 정렬 키(`ORDER BY`)를 가진 연속적인 행 그룹은 최대 두 행으로 축소됩니다: 
`Sign` = `1`인 "상태" 행과 `Sign` = `-1`인 "취소" 행이 있습니다. 
다시 말해, 클릭하우스에서 항목이 축소됩니다.

각 결과 데이터 파트에 대해 클릭하우스는 다음을 저장합니다:

|  |                                                                                                                                     |
|--|-------------------------------------------------------------------------------------------------------------------------------------|
|1.| "상태" 행과 "취소" 행의 수가 일치하고 마지막 행이 "상태" 행인 경우 첫 번째 "취소" 행과 마지막 "상태" 행. |
|2.| "상태" 행이 "취소" 행보다 더 많으면 마지막 "상태" 행.                                                            |
|3.| "취소" 행이 "상태" 행보다 더 많으면 첫 번째 "취소" 행.                                                          |
|4.| 그 외 모든 경우에는 없음.                                                                                               |

추가로, "상태" 행이 "취소" 행보다 두 개 이상 더 많은 경우 또는 "취소" 행이 "상태" 행보다 두 개 이상 더 많은 경우 병합이 계속됩니다. 
그러나 클릭하우스는 이 상황을 논리적 오류로 취급하고 서버 로그에 기록합니다. 
이 오류는 동일 데이터가 여러 번 삽입되는 경우 발생할 수 있습니다. 
따라서 축소는 통계 계산 결과를 변경해서는 안 됩니다. 
변경 사항은 점진적으로 축소되어 결국 거의 모든 객체의 마지막 상태만 남게 됩니다.

`Sign` 열은 병합 알고리즘이 동일한 정렬 키를 가진 모든 행이 동일한 결과 데이터 파트에 있을 것이라고 보장하지 않기 때문에 필요합니다. 
또한 물리적 서버에서 이들을 동일하게 존재하지 않을 수도 있습니다. 
클릭하우스는 여러 스레드로 `SELECT` 쿼리를 처리하며 결과에서 행의 순서를 예측할 수 없습니다. 

집계는 `CollapsingMergeTree` 테이블에서 완전히 "축소된" 데이터를 얻어야 할 경우 필요합니다. 
축소를 완료하려면 `GROUP BY` 절과 Sign을 고려한 집계 함수를 포함하는 쿼리를 작성하세요. 
예를 들어, 수량을 계산하려면 `count()` 대신 `sum(Sign)`을 사용하세요. 
어떤 것의 합을 계산하려면 `sum(Sign * x)`와 함께 `HAVING sum(Sign) > 0`을 사용하세요. 
아래 [예제](#example-of-use)와 같이 `sum(x)`를 사용하지 마세요.

집계 함수 `count`, `sum`, `avg`는 이렇게 계산할 수 있습니다. 
객체에 최소한 하나의 비축소 상태가 있는 경우 집계 `uniq`를 계산할 수 있습니다. 
집계 `min` 및 `max`는 계산할 수 없으며, 
왜냐하면 `CollapsingMergeTree`는 축소된 상태의 기록을 저장하지 않기 때문입니다.

:::note
집계 없이 데이터를 추출해야 하는 경우 
(예: 최신 값이 특정 조건과 일치하는 행이 있는지 확인하기 위해), 
`FROM` 절에 대해 [`FINAL`](../../../sql-reference/statements/select/from.md#final-modifier) 수식어를 사용할 수 있습니다. 이는 결과를 반환하기 전에 데이터를 병합합니다. 
CollapsingMergeTree의 경우 각 키에 대해 최신 상태 행만 반환됩니다.
:::

## 예제 {#examples}

### 사용 예제 {#example-of-use}

다음 예제 데이터를 가진 경우:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree`를 사용하여 `UAct`라는 테이블을 생성해 봅시다:

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews UInt8,
    Duration UInt8,
    Sign Int8
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID
```

다음으로 일부 데이터를 삽입합니다:

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1),(4324182021466249494, 6, 185, 1)
```

두 개의 `INSERT` 쿼리를 사용하여 두 개의 서로 다른 데이터 파트를 생성합니다. 

:::note
단일 쿼리로 데이터를 삽입하면 ClickHouse는 단 하나의 데이터 파트만 생성하며 절대 병합하지 않습니다.
:::

다음과 같은 방법으로 데이터를 선택할 수 있습니다:

```sql
SELECT * FROM UAct
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

반환된 데이터를 살펴보고 축소가 발생했는지 확인해 봅시다...
두 개의 `INSERT` 쿼리로 두 개의 데이터 파트를 생성했습니다. 
`SELECT` 쿼리는 두 개의 스레드에서 수행되었으며, 우리는 무작위로 행의 순서를 얻었습니다. 
그러나 데이터 파트의 병합이 아직 이루어지지 않았기 때문에 축소 **가 발생하지 않았습니다**. 
클릭하우스는 알 수 없는 순간에 백그라운드에서 데이터 파트를 병합합니다.

따라서 우리는 집계가 필요하며, 
우리는 [`sum`](/sql-reference/aggregate-functions/reference/sum) 집계 함수와 [`HAVING`](/sql-reference/statements/select/having) 절을 사용하여 이를 수행합니다:

```sql
SELECT
    UserID,
    sum(PageViews * Sign) AS PageViews,
    sum(Duration * Sign) AS Duration
FROM UAct
GROUP BY UserID
HAVING sum(Sign) > 0
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

집계가 필요하지 않고 축소를 강제로 실행하려면, 
`FROM` 절에 대해 `FINAL` 수식어를 사용할 수도 있습니다.

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```
:::note
이 데이터 선택 방식은 덜 효율적이며, 대량의 스캔된 데이터를 사용 (수백만 행)할 경우 사용을 권장하지 않습니다.
:::

### 다른 접근 방식의 예 {#example-of-another-approach}

이 접근 방식의 아이디어는 병합이 키 필드만 고려한다는 것입니다. 
따라서 "취소" 행에서는 `Sign` 열을 사용하지 않고 행을 합산할 때 이전 버전을 동등하게 만드는 부정적인 값을 지정할 수 있습니다.

이 예제를 위해 아래 샘플 데이터를 사용할 것입니다:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │        -5 │     -146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

이 접근 방식을 위해 `PageViews`와 `Duration`의 데이터 유형을 부정적 값을 저장할 수 있도록 변경할 필요가 있습니다. 
따라서 `collapsingMergeTree`를 사용하여 테이블 `UAct`를 생성할 때 이들 열의 값을 `UInt8`에서 `Int16`으로 변경합니다:

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews Int16,
    Duration Int16,
    Sign Int8
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID
```

데이터를 테이블에 삽입하여 접근 방식을 테스트해 봅시다.

예제나 작은 테이블의 경우, 이는 허용됩니다:

```sql
INSERT INTO UAct VALUES(4324182021466249494,  5,  146,  1);
INSERT INTO UAct VALUES(4324182021466249494, -5, -146, -1);
INSERT INTO UAct VALUES(4324182021466249494,  6,  185,  1);

SELECT * FROM UAct FINAL;
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

```sql
SELECT
    UserID,
    sum(PageViews) AS PageViews,
    sum(Duration) AS Duration
FROM UAct
GROUP BY UserID
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

```sql
SELECT COUNT() FROM UAct
```

```text
┌─count()─┐
│       3 │
└─────────┘
```

```sql
OPTIMIZE TABLE UAct FINAL;

SELECT * FROM UAct
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```
