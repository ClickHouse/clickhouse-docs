---
'description': 'GROUP BY 절에 대한 문서'
'sidebar_label': 'GROUP BY'
'slug': '/sql-reference/statements/select/group-by'
'title': 'GROUP BY 절'
'doc_type': 'reference'
---


# GROUP BY 절

`GROUP BY` 절은 `SELECT` 쿼리를 집계 모드로 전환하며, 다음과 같이 작동합니다:

- `GROUP BY` 절에는 표현식 목록(또는 길이 1의 목록으로 간주되는 단일 표현식)이 포함됩니다. 이 목록은 "그룹 키" 역할을 하며, 각 개별 표현식은 "키 표현식"이라고 합니다.
- [SELECT](/sql-reference/statements/select/index.md), [HAVING](/sql-reference/statements/select/having.md), 및 [ORDER BY](/sql-reference/statements/select/order-by.md) 절의 모든 표현식은 **키 표현식**을 기반으로 **하거나** 비키 표현식(일반 컬럼 포함)에 대한 [집계 함수](../../../sql-reference/aggregate-functions/index.md) 기반으로 계산되어야 합니다. 다시 말해, 테이블에서 선택된 각 컬럼은 키 표현식 내에서 사용되거나 집계 함수 내부에서만 사용되어야 하며, 두 경우 모두 사용할 수는 없습니다.
- 집계된 `SELECT` 쿼리의 결과는 원본 테이블의 "그룹 키"의 고유값 수만큼의 행을 포함합니다. 일반적으로 이는 행 수를 대폭 줄이며, 경우에 따라 수량이 몇 배로 줄어들기도 하지만, 모든 "그룹 키" 값이 서로 다를 경우 행 수는 동일하게 유지됩니다.

테이블에서 컬럼 이름 대신 컬럼 번호로 데이터를 그룹화하려면 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) 설정을 활성화하십시오.

:::note
테이블에서 집계를 실행하는 다른 방법이 있습니다. 쿼리에 테이블 컬럼이 집계 함수 내부에만 포함되어 있으면, `GROUP BY 절`을 생략할 수 있으며, 빈 키 집합에 대한 집계가 발생하는 것으로 간주됩니다. 이러한 쿼리는 항상 정확히 한 행을 반환합니다.
:::

## NULL 처리 {#null-processing}

그룹화를 위해 ClickHouse는 [NULL](/sql-reference/syntax#null)을 값으로 해석하며, `NULL==NULL`로 간주합니다. 이는 대부분의 다른 맥락에서의 `NULL` 처리와 다릅니다.

다음은 이것이 의미하는 바를 보여주는 예입니다.

다음과 같은 테이블이 있다고 가정해 보겠습니다:

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

쿼리 `SELECT sum(x), y FROM t_null_big GROUP BY y`의 결과는 다음과 같습니다:

```text
┌─sum(x)─┬────y─┐
│      4 │    2 │
│      3 │    3 │
│      5 │ ᴺᵁᴸᴸ │
└────────┴──────┘
```

`y = NULL`에 대한 `GROUP BY`가 `NULL`이 이 값인 것처럼 `x`를 합산한 것을 볼 수 있습니다.

여러 키를 `GROUP BY`에 전달하면, 결과는 선택의 모든 조합을 제공하며, 마치 `NULL`이 특정 값인 것처럼 설명됩니다.

## ROLLUP 수정자 {#rollup-modifier}

`ROLLUP` 수정자는 `GROUP BY` 목록 내에서 키 표현식의 순서를 기준으로 하위 합계를 계산하는 데 사용됩니다. 하위 합계 행은 결과 테이블 뒤에 추가됩니다.

하위 합계는 반대 순서로 계산됩니다: 처음에는 목록의 마지막 키 표현식에 대해 하위 합계를 계산하고, 그 다음으로 이전 키 표현식에 대해, 그리고 첫 번째 키 표현식에 도달할 때까지 계속됩니다.

하위 합계 행에서 이미 "그룹화된" 키 표현식의 값은 `0` 또는 빈 줄로 설정됩니다.

:::note
[HAVING](/sql-reference/statements/select/having.md) 절은 하위 합계 결과에 영향을 미칠 수 있습니다.
:::

**예시**

테이블 t를 고려해 보십시오:

```text
┌─year─┬─month─┬─day─┐
│ 2019 │     1 │   5 │
│ 2019 │     1 │  15 │
│ 2020 │     1 │   5 │
│ 2020 │     1 │  15 │
│ 2020 │    10 │   5 │
│ 2020 │    10 │  15 │
└──────┴───────┴─────┘
```

쿼리:

```sql
SELECT year, month, day, count(*) FROM t GROUP BY ROLLUP(year, month, day);
```
`GROUP BY` 섹션에 세 개의 키 표현식이 있으므로 결과에는 오른쪽에서 왼쪽으로 "롤업"된 하위 합계가 포함된 네 개의 테이블이 포함됩니다:

- `GROUP BY year, month, day`;
- `GROUP BY year, month` (그리고 `day` 컬럼은 모든 값이 0으로 채워짐);
- `GROUP BY year` (현재 `month, day` 컬럼 모두 0으로 채워짐);
- 그리고 전체 합계 (모든 세 개의 키 표현식 컬럼이 0으로 채워짐).

```text
┌─year─┬─month─┬─day─┬─count()─┐
│ 2020 │    10 │  15 │       1 │
│ 2020 │     1 │   5 │       1 │
│ 2019 │     1 │   5 │       1 │
│ 2020 │     1 │  15 │       1 │
│ 2019 │     1 │  15 │       1 │
│ 2020 │    10 │   5 │       1 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│ 2019 │     1 │   0 │       2 │
│ 2020 │     1 │   0 │       2 │
│ 2020 │    10 │   0 │       2 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│ 2019 │     0 │   0 │       2 │
│ 2020 │     0 │   0 │       4 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│    0 │     0 │   0 │       6 │
└──────┴───────┴─────┴─────────┘
```
같은 쿼리는 `WITH` 키워드를 사용하여도 작성할 수 있습니다.
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;
```

**참고**

- SQL 표준 호환성을 위한 [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 설정을 참조하십시오.

## CUBE 수정자 {#cube-modifier}

`CUBE` 수정자는 `GROUP BY` 목록의 키 표현식의 모든 조합에 대한 하위 합계를 계산하는 데 사용됩니다. 하위 합계 행은 결과 테이블 뒤에 추가됩니다.

하위 합계 행에서 모든 "그룹화된" 키 표현식의 값은 `0` 또는 빈 줄로 설정됩니다.

:::note
[HAVING](/sql-reference/statements/select/having.md) 절은 하위 합계 결과에 영향을 미칠 수 있습니다.
:::

**예시**

테이블 t를 고려해 보십시오:

```text
┌─year─┬─month─┬─day─┐
│ 2019 │     1 │   5 │
│ 2019 │     1 │  15 │
│ 2020 │     1 │   5 │
│ 2020 │     1 │  15 │
│ 2020 │    10 │   5 │
│ 2020 │    10 │  15 │
└──────┴───────┴─────┘
```

쿼리:

```sql
SELECT year, month, day, count(*) FROM t GROUP BY CUBE(year, month, day);
```

`GROUP BY` 섹션에 세 개의 키 표현식이 있으므로 결과에는 모든 키 표현식 조합에 대한 하위 합계가 포함된 여덟 개의 테이블이 포함됩니다:

- `GROUP BY year, month, day`
- `GROUP BY year, month`
- `GROUP BY year, day`
- `GROUP BY year`
- `GROUP BY month, day`
- `GROUP BY month`
- `GROUP BY day`
- 그리고 전체 합계.

`GROUP BY`에서 제외된 컬럼은 0으로 채워집니다.

```text
┌─year─┬─month─┬─day─┬─count()─┐
│ 2020 │    10 │  15 │       1 │
│ 2020 │     1 │   5 │       1 │
│ 2019 │     1 │   5 │       1 │
│ 2020 │     1 │  15 │       1 │
│ 2019 │     1 │  15 │       1 │
│ 2020 │    10 │   5 │       1 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│ 2019 │     1 │   0 │       2 │
│ 2020 │     1 │   0 │       2 │
│ 2020 │    10 │   0 │       2 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│ 2020 │     0 │   5 │       2 │
│ 2019 │     0 │   5 │       1 │
│ 2020 │     0 │  15 │       2 │
│ 2019 │     0 │  15 │       1 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│ 2019 │     0 │   0 │       2 │
│ 2020 │     0 │   0 │       4 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│    0 │     1 │   5 │       2 │
│    0 │    10 │  15 │       1 │
│    0 │    10 │   5 │       1 │
│    0 │     1 │  15 │       2 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│    0 │     1 │   0 │       4 │
│    0 │    10 │   0 │       2 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│    0 │     0 │   5 │       3 │
│    0 │     0 │  15 │       3 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│    0 │     0 │   0 │       6 │
└──────┴───────┴─────┴─────────┘
```
같은 쿼리는 `WITH` 키워드를 사용하여도 작성할 수 있습니다.
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH CUBE;
```

**참고**

- SQL 표준 호환성을 위한 [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 설정을 참조하십시오.

## WITH TOTALS 수정자 {#with-totals-modifier}

`WITH TOTALS` 수정자가 지정되면 또 다른 행이 계산됩니다. 이 행은 기본값(0 또는 빈 줄)이 포함된 키 컬럼과 모든 행을 기준으로 계산된 집계 함수의 값이 있는 컬럼을 가집니다(총합 값).

이 추가 행은 `JSON*`, `TabSeparated*`, 및 `Pretty*` 형식에서 다른 행과 분리되어 생성됩니다:

- `XML` 및 `JSON*` 형식에서는 이 행이 별도의 'total' 필드로 출력됩니다.
- `TabSeparated*`, `CSV*` 및 `Vertical` 형식에서는 이 행이 주 결과 뒤에 추가되며, 빈 행이 앞에 추가됩니다(다른 데이터 뒤에).
- `Pretty*` 형식에서는 이 행이 주 결과 뒤에 별도의 테이블로 출력됩니다.
- `Template` 형식에서는 이 행이 지정된 템플릿에 따라 출력됩니다.
- 다른 형식에서는 이 행을 사용할 수 없습니다.

:::note
총합은 `SELECT` 쿼리의 결과에 출력되며, `INSERT INTO ... SELECT`에는 출력되지 않습니다.
:::

`WITH TOTALS`는 [HAVING](/sql-reference/statements/select/having.md) 절이 있을 때 다양한 방식으로 실행될 수 있습니다. 동작은 `totals_mode` 설정에 따라 달라집니다.

### 총합 처리 구성 {#configuring-totals-processing}

기본적으로, `totals_mode = 'before_having'`입니다. 이 경우, 'totals'는 HAVING 및 `max_rows_to_group_by`를 통과하지 못한 행을 포함한 모든 행을 기준으로 계산됩니다.

다른 대안은 'totals'에서 HAVING을 통과한 행만 포함하며, `max_rows_to_group_by` 설정 및 `group_by_overflow_mode = 'any'`와 함께 다르게 동작합니다.

`after_having_exclusive` – `max_rows_to_group_by`를 통과하지 못한 행을 포함하지 않습니다. 다시 말해, 'totals'는 `max_rows_to_group_by`를 생략했을 때보다 적거나 같은 수의 행을 가집니다.

`after_having_inclusive` – 'totals'에 `max_rows_to_group_by`를 통과하지 못한 모든 행을 포함합니다. 다시 말해, 'totals'는 `max_rows_to_group_by`를 생략했을 때보다 많거나 같은 수의 행을 가집니다.

`after_having_auto` – HAVING을 통과한 행 수를 계산합니다. 이 수가 특정 양(기본값은 50%) 이상인 경우, 'totals'에 `max_rows_to_group_by`를 통과하지 못한 모든 행을 포함합니다. 그렇지 않으면 포함하지 않습니다.

`totals_auto_threshold` – 기본값은 0.5입니다. `after_having_auto`에 대한 계수입니다.

`max_rows_to_group_by`와 `group_by_overflow_mode = 'any'`를 사용하지 않는 경우, 모든 `after_having` 변형은 동일하며, 그중 어떤 것이든 사용할 수 있습니다(예: `after_having_auto`).

서브쿼리에서도 `WITH TOTALS`를 사용할 수 있으며, 경우에 따라 [JOIN](/sql-reference/statements/select/join.md) 절 내의 서브쿼리에서도 사용 가능합니다(이 경우 해당 총 값이 결합됩니다).

## GROUP BY ALL {#group-by-all}

`GROUP BY ALL`은 집계 함수가 아닌 모든 SELECT된 표현식 목록과 동일합니다.

예를 들어:

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY ALL
```

는 다음과 동일합니다

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY a * 2, b
```

집계 함수와 다른 필드를 인수로 가지는 함수의 경우, `GROUP BY` 키에는 최대 비집계 필드가 포함됩니다.

예를 들어:

```sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY ALL
```

는 다음과 동일합니다

```sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY substring(a, 4, 2), substring(a, 1, 2)
```

## 예시 {#examples}

예시:

```sql
SELECT
    count(),
    median(FetchTiming > 60 ? 60 : FetchTiming),
    count() - sum(Refresh)
FROM hits
```

MySQL과 달리(그리고 표준 SQL에 따르기 때문에) 키나 집계 함수에 포함되지 않은 특정 컬럼의 값을 가져올 수 없습니다(상수 표현식 제외). 이를 해결하기 위해 'any' 집계 함수를 사용하거나(첫 번째로 발견된 값을 가져옵니다) 'min/max'를 사용할 수 있습니다.

예시:

```sql
SELECT
    domainWithoutWWW(URL) AS domain,
    count(),
    any(Title) AS title -- getting the first occurred page header for each domain.
FROM hits
GROUP BY domain
```

각기 다른 키 값을 만날 때마다, `GROUP BY`는 집계 함수 값의 집합을 계산합니다.

## GROUPING SETS 수정자 {#grouping-sets-modifier}

가장 일반적인 수정자입니다.
이 수정자는 여러 집계 키 집합(그룹화 집합)을 수동으로 지정할 수 있습니다.
집계는 각 그룹화 집합에 대해 별도로 수행되며, 그 후 모든 결과가 결합됩니다.
열이 그룹화 집합에 없으면 기본값으로 채워집니다.

즉, 위에서 설명한 수정자는 `GROUPING SETS`를 통해 표현될 수 있습니다.
`ROLLUP`, `CUBE` 및 `GROUPING SETS` 수정자가 구문적으로 동일하더라도, 성능은 다를 수 있습니다.
`GROUPING SETS`에서는 모든 것을 병렬로 실행하려고 할 때, `ROLLUP` 및 `CUBE`는 집계의 최종 병합을 단일 스레드로 수행합니다.

원본 열이 기본값을 포함할 때, 해당 열을 키로 사용하는 집계의 일부인지 여부를 구별하는 것이 어려울 수 있습니다.
이 문제를 해결하기 위해 `GROUPING` 함수가 사용되어야 합니다.

**예시**

다음 두 쿼리는 동일합니다.

```sql
-- Query 1
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;

-- Query 2
SELECT year, month, day, count(*) FROM t GROUP BY
GROUPING SETS
(
    (year, month, day),
    (year, month),
    (year),
    ()
);
```

**참고**

- SQL 표준 호환성을 위한 [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 설정을 참조하십시오.

## 구현 세부정보 {#implementation-details}

집계는 컬럼 지향 DBMS의 가장 중요한 기능 중 하나이며, 따라서 구현은 ClickHouse의 가장 최적화된 부분 중 하나입니다. 기본적으로 집계는 해시 테이블을 사용하여 메모리 내에서 수행됩니다. 40개 이상의 특수화가 있으며, 이는 "그룹 키" 데이터 유형에 따라 자동으로 선택됩니다.

### 테이블 정렬 키에 따른 GROUP BY 최적화 {#group-by-optimization-depending-on-table-sorting-key}

테이블이 어떤 키로 정렬되어 있고 `GROUP BY` 표현식이 최소 정렬 키의 접두사 또는 단사 함수를 포함하는 경우, 집계를 보다 효과적으로 수행할 수 있습니다. 이 경우 테이블에서 새로운 키를 읽을 때, 집계의 중간 결과는 마무리되고 클라이언트로 전송될 수 있습니다. 이 동작은 [optimize_aggregation_in_order](../../../operations/settings/settings.md#optimize_aggregation_in_order) 설정으로 전환됩니다. 이러한 최적화는 집계 중 메모리 사용량을 줄이지만, 경우에 따라 쿼리 실행 속도를 늦출 수 있습니다.

### 외부 메모리에서의 GROUP BY {#group-by-in-external-memory}

`GROUP BY` 중 메모리 사용량을 제한하기 위해 임시 데이터를 디스크로 덤프하는 것을 활성화할 수 있습니다.
[ max_bytes_before_external_group_by](/operations/settings/settings#max_bytes_before_external_group_by) 설정은 `GROUP BY` 임시 데이터를 파일 시스템에 덤프하기 위한 임계 RAM 소비를 결정합니다. 기본값 0으로 설정하면 비활성화됩니다.
대신 [max_bytes_ratio_before_external_group_by](/operations/settings/settings#max_bytes_ratio_before_external_group_by) 설정을 통해 `GROUP BY`가 외부 메모리에서 사용되도록 허용할 수 있습니다. 이 설정은 쿼리가 사용된 메모리의 특정 임계값에 도달해야 가능합니다.

`max_bytes_before_external_group_by`를 사용할 때, `max_memory_usage`를 약 두 배 높게 설정하는 것을 권장합니다(또는 `max_bytes_ratio_before_external_group_by=0.5`). 이는 집계에 두 가지 단계가 있기 때문입니다: 데이터를 읽고 중간 데이터를 형성(1단계)한 후 중간 데이터를 병합(2단계)하는 과정입니다. 데이터가 파일 시스템에 덤프되지 않으면, 2단계의 경우 1단계와 같은 양의 메모리를 사용할 수 있습니다.

예를 들어, [max_memory_usage](/operations/settings/settings#max_memory_usage)가 10000000000으로 설정되고 외부 집계를 사용하고 싶다면, `max_bytes_before_external_group_by`를 10000000000으로 설정하고 `max_memory_usage`를 20000000000으로 설정하는 것이 합리적입니다. 외부 집계가 트리거되면(최소한 하나의 임시 데이터 덤프가 있었던 경우) RAM의 최대 소비량은 `max_bytes_before_external_group_by`보다 약간 더 큽니다.

분산 쿼리 처리를 수행할 때, 외부 집계는 원격 서버에서 수행됩니다. 요청 서버가 적은 양의 RAM만 사용하려면 `distributed_aggregation_memory_efficient`를 1로 설정하십시오.

디스크에 플러시된 데이터를 병합할 때, 또한 `distributed_aggregation_memory_efficient` 설정이 활성화된 경우 원격 서버에서 결과를 병합할 때 사용되는 RAM의 양은 총 쓰레드 수의 `1/256 * the_number_of_threads`입니다.

외부 집계가 활성화된 경우, `max_bytes_before_external_group_by`의 데이터가 부족한 경우(즉, 데이터가 플러시되지 않음), 쿼리는 외부 집계 없이 실행된 것과 마찬가지로 빠르게 실행됩니다. 임시 데이터가 플러시된 경우, 실행 시간이 몇 배 더 길어집니다(약 세 배).

`GROUP BY` 뒤에 [ORDER BY](/sql-reference/statements/select/order-by.md)와 [LIMIT](/sql-reference/statements/select/limit.md)가 있는 경우, 사용되는 RAM의 양은 전체 테이블이 아닌 `LIMIT` 내의 데이터 양에 따라 달라집니다. 그러나 `ORDER BY`에 `LIMIT`가 없는 경우 외부 정렬을 활성화하는 것을 잊지 마십시오(`max_bytes_before_external_sort`).
