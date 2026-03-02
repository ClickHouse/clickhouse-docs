---
description: 'GROUP BY 절에 대한 문서'
sidebar_label: 'GROUP BY'
slug: /sql-reference/statements/select/group-by
title: 'GROUP BY 절'
doc_type: 'reference'
---



# GROUP BY 절 \{#group-by-clause\}

`GROUP BY` 절은 `SELECT` 쿼리를 다음과 같이 동작하는 집계 모드로 전환합니다:

- `GROUP BY` 절에는 표현식 목록(또는 길이가 1인 목록으로 간주되는 단일 표현식)이 포함됩니다. 이 목록은 「그룹 키(grouping key)」 역할을 하며, 각 개별 표현식은 「키 표현식(key expression)」이라고 부릅니다.
- [SELECT](/sql-reference/statements/select/index.md), [HAVING](/sql-reference/statements/select/having.md), [ORDER BY](/sql-reference/statements/select/order-by.md) 절의 모든 표현식은 키 표현식에 기반하여 **계산되거나**, 키 표현식이 아닌 표현식(일반 컬럼 포함)에 대한 [집계 함수](../../../sql-reference/aggregate-functions/index.md)를 통해 **계산되어야만** 합니다. 다시 말해, 테이블에서 선택된 각 컬럼은 키 표현식으로 사용되거나 집계 함수 내부에서 사용되어야 하며, 두 가지 방식으로 동시에 사용할 수는 없습니다.
- 집계를 수행하는 `SELECT` 쿼리의 결과에는 원본 테이블에서 「그룹 키(grouping key)」의 고유 값 개수만큼의 행이 포함됩니다. 일반적으로 이는 행 수를 매우 크게(때로는 몇 자릿수까지) 줄이지만, 반드시 그런 것은 아닙니다. 모든 「그룹 키」 값이 서로 달랐다면 행 수는 그대로 유지됩니다.

컬럼 이름 대신 컬럼 번호로 테이블의 데이터를 그룹화하려면, 설정 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments)를 활성화하십시오.

:::note
테이블에 대해 집계를 실행하는 또 다른 방법이 있습니다. 쿼리에 포함된 테이블 컬럼이 집계 함수 내부에만 존재하는 경우에는 `GROUP BY 절`을 생략할 수 있으며, 키가 없는 집계를 수행하는 것으로 간주됩니다. 이러한 쿼리는 항상 정확히 1개의 행만 반환합니다.
:::



## NULL 처리 \{#null-processing\}

그룹화의 경우 ClickHouse는 [NULL](/sql-reference/syntax#null)을 하나의 값으로 해석하며, `NULL==NULL`로 처리합니다. 이는 대부분의 다른 문맥에서 `NULL`을 처리하는 방식과는 다릅니다.

이것이 무엇을 의미하는지 보여 주는 예시는 다음과 같습니다.

다음과 같은 테이블이 있다고 가정합니다.

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

`SELECT sum(x), y FROM t_null_big GROUP BY y` 쿼리를 실행하면 다음과 같은 결과가 나옵니다.

```text
┌─sum(x)─┬────y─┐
│      4 │    2 │
│      3 │    3 │
│      5 │ ᴺᵁᴸᴸ │
└────────┴──────┘
```

`y = NULL`에 대한 `GROUP BY`가 `NULL`이 하나의 값인 것처럼 `x`를 합산하는 것을 확인할 수 있습니다.

`GROUP BY`에 여러 키를 전달하면, 결과는 마치 `NULL`이 특정한 하나의 값인 것처럼 선택 결과의 모든 조합을 반환합니다.


## ROLLUP 수정자 \{#rollup-modifier\}

`ROLLUP` 수정자는 `GROUP BY` 목록에서 키 표현식의 순서를 기준으로 해당 키 표현식에 대한 소계를 계산하는 데 사용됩니다. 소계 행은 결과 테이블의 끝에 추가됩니다.

소계는 역순으로 계산됩니다. 먼저 목록의 마지막 키 표현식에 대한 소계를 계산한 다음, 그 이전 키 표현식에 대한 소계를 계산하는 식으로 첫 번째 키 표현식까지 진행합니다.

소계 행에서는 이미 &quot;그룹화된&quot; 키 표현식의 값이 `0` 또는 빈 문자열로 설정됩니다.

:::note
[HAVING](/sql-reference/statements/select/having.md) 절이 소계 결과에 영향을 줄 수 있습니다.
:::

**예시**

다음과 같은 테이블 t가 있다고 가정합니다.

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

`GROUP BY` 절에 키 표현식이 세 개 있으므로 결과에는 오른쪽에서 왼쪽으로 「롤업(rolled up)」된 소계를 포함한 네 개의 테이블이 포함됩니다:

* `GROUP BY year, month, day`;
* `GROUP BY year, month` (그리고 `day` 컬럼은 0으로 채워집니다);
* `GROUP BY year` (이때 `month, day` 컬럼은 둘 다 0으로 채워집니다);
* 그리고 총합(세 개의 키 표현식 컬럼이 모두 0입니다).

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

동일한 쿼리는 `WITH` 키워드를 사용해 작성할 수도 있습니다.

```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;
```

**관련 항목**

* SQL 표준 호환성을 위한 [group&#95;by&#95;use&#95;nulls](/operations/settings/settings.md#group_by_use_nulls) 설정을 참조하십시오.


## CUBE 수정자 \{#cube-modifier\}

`CUBE` 수정자는 `GROUP BY` 목록에 있는 키 표현식의 모든 조합에 대한 소계를 계산하는 데 사용됩니다. 소계 행은 결과 테이블의 마지막에 추가됩니다.

소계 행에서는 모든 「grouped」 키 표현식의 값이 `0` 또는 빈 문자열로 설정됩니다.

:::note
[HAVING](/sql-reference/statements/select/having.md) 절이 소계 결과에 영향을 줄 수 있습니다.
:::

**예시**

다음과 같은 테이블 t가 있다고 가정합니다:

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

`GROUP BY` 절에 세 개의 키 표현식이 있으므로, 결과에는 이들 키 표현식 조합 각각에 대한 소계를 포함하는 총 8개의 테이블이 생성됩니다:

* `GROUP BY year, month, day`
* `GROUP BY year, month`
* `GROUP BY year, day`
  * `GROUP BY year`
* `GROUP BY month, day`
* `GROUP BY month`
* `GROUP BY day`
* 및 전체 합계.

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

같은 쿼리는 `WITH` 키워드를 사용해 작성할 수도 있습니다.

```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH CUBE;
```

**추가 참고**

* SQL 표준 호환성을 위한 [group&#95;by&#95;use&#95;nulls](/operations/settings/settings.md#group_by_use_nulls) 설정을 참고하십시오.


## WITH TOTALS 수정자 \{#with-totals-modifier\}

`WITH TOTALS` 수정자가 지정되면, 추가 행이 하나 더 계산됩니다. 이 행에는 기본값(0 또는 빈 문자열)이 들어 있는 키 컬럼과, 모든 행에 대해 계산된 집계 함수 컬럼(즉, 「합계(total)」 값)이 포함됩니다.

이 추가 행은 다른 행들과는 별도로, `JSON*`, `TabSeparated*`, `Pretty*` 포맷에서만 생성됩니다:

- `XML` 및 `JSON*` 포맷에서는 이 행이 별도의 `totals` 필드로 출력됩니다.
- `TabSeparated*`, `CSV*`, `Vertical` 포맷에서는 이 행이 기본 결과 뒤에, 그 앞에 빈 행 하나를 두고(다른 데이터 다음에) 출력됩니다.
- `Pretty*` 포맷에서는 이 행이 기본 결과 뒤에 별도의 테이블로 출력됩니다.
- `Template` 포맷에서는 지정된 템플릿에 따라 이 행이 출력됩니다.
- 다른 포맷에서는 사용할 수 없습니다.

:::note
`totals`는 `SELECT` 쿼리 결과에서는 출력되지만, `INSERT INTO ... SELECT`에서는 출력되지 않습니다.
:::

`WITH TOTALS`는 [HAVING](/sql-reference/statements/select/having.md)이 있는 경우 서로 다른 방식으로 동작합니다. 동작은 `totals_mode` 설정에 따라 달라집니다.

### 합계 처리 구성 \{#configuring-totals-processing\}

기본적으로 `totals_mode = 'before_having'`입니다. 이 경우 `totals`는 HAVING 및 `max_rows_to_group_by`를 통과하지 못한 행을 포함하여, 모든 행에 대해 계산됩니다.

다른 대안들은 HAVING을 통과한 행만 `totals`에 포함하며, `max_rows_to_group_by` 및 `group_by_overflow_mode = 'any'` 설정과의 조합에서 서로 다르게 동작합니다.

`after_having_exclusive` – `max_rows_to_group_by`를 통과하지 못한 행은 포함하지 않습니다. 다시 말해, `max_rows_to_group_by`를 생략했을 때와 비교했을 때 `totals`의 행 수가 같거나 더 적게 됩니다.

`after_having_inclusive` – `totals`에 `max_rows_to_group_by`를 통과하지 못한 모든 행을 포함합니다. 다시 말해, `max_rows_to_group_by`를 생략했을 때와 비교했을 때 `totals`의 행 수가 같거나 더 많게 됩니다.

`after_having_auto` – HAVING을 통과한 행의 개수를 셉니다. 이 수가 일정 비율(기본적으로 50%)보다 크면, `totals`에 `max_rows_to_group_by`를 통과하지 못한 모든 행을 포함합니다. 그렇지 않으면 포함하지 않습니다.

`totals_auto_threshold` – 기본값은 0.5입니다. `after_having_auto`에 사용되는 계수입니다.

`max_rows_to_group_by` 및 `group_by_overflow_mode = 'any'`를 사용하지 않으면, 모든 `after_having` 변형은 동일하게 동작하므로 그중 아무 것이나 사용할 수 있습니다(예: `after_having_auto`).

`WITH TOTALS`는 서브쿼리 안에서 사용할 수 있으며, [JOIN](/sql-reference/statements/select/join.md) 절의 서브쿼리에서도 사용할 수 있습니다(이 경우 해당 합계 값들이 결합됩니다).



## GROUP BY ALL \{#group-by-all\}

`GROUP BY ALL`은 집계 함수가 아닌 SELECT 절의 모든 표현식을 GROUP BY에 직접 나열하는 것과 동일합니다.

예를 들어:

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY ALL
```

와 동일합니다

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY a * 2, b
```

특수한 경우로, 하나의 FUNCTION이 집계 함수와 다른 필드를 동시에 인수로 가지는 경우, `GROUP BY` 키에는 해당 FUNCTION에서 추출 가능한 비집계 필드가 최대한 많이 포함됩니다.

예를 들어:

```sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY ALL
```

와 동일합니다

```sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY substring(a, 4, 2), substring(a, 1, 2)
```


## 예제 \{#examples\}

예제:

```sql
SELECT
    count(),
    median(FetchTiming > 60 ? 60 : FetchTiming),
    count() - sum(Refresh)
FROM hits
```

MySQL과는 달리(표준 SQL을 준수하므로), 키나 집계 함수에 포함되지 않은 컬럼의 값을(상수 표현식을 제외하고는) 임의로 가져올 수 없습니다. 이를 우회하려면 &#39;any&#39; 집계 함수(처음으로 발견된 값을 가져옴)나 &#39;min/max&#39;를 사용할 수 있습니다.

예시:

```sql
SELECT
    domainWithoutWWW(URL) AS domain,
    count(),
    any(Title) AS title -- getting the first occurred page header for each domain.
FROM hits
GROUP BY domain
```

각 서로 다른 키 값마다 `GROUP BY`는 집계 함수 결과의 집합을 계산합니다.


## GROUPING SETS 수정자 \{#grouping-sets-modifier\}

가장 일반적인 수정자입니다.
이 수정자는 여러 개의 집계 키 집합(그룹화 집합, grouping sets)을 수동으로 지정할 수 있게 합니다.
각 그룹화 집합마다 집계를 별도로 수행한 다음, 모든 결과를 합칩니다.
어떤 컬럼이 그룹화 집합에 포함되지 않으면, 해당 컬럼은 기본값으로 채워집니다.

다른 말로 하면, 위에서 설명한 수정자들은 `GROUPING SETS`를 통해 표현할 수 있습니다.
`ROLLUP`, `CUBE`, `GROUPING SETS` 수정자를 사용하는 쿼리는 구문적으로는 동일하지만, 성능은 달라질 수 있습니다.
`GROUPING SETS`는 가능한 한 모든 처리를 병렬로 실행하려고 시도하는 반면, `ROLLUP`과 `CUBE`는 집계의 최종 병합을 단일 스레드에서 실행합니다.

원본 컬럼에 기본값이 포함되어 있는 경우, 어떤 행이 해당 컬럼들을 키로 사용하는 집계의 일부인지 여부를 구분하기 어려울 수 있습니다.
이 문제를 해결하기 위해 `GROUPING` 함수를 사용해야 합니다.

**예시**

다음 두 쿼리는 동일한 결과를 반환합니다.

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

* SQL 표준과의 호환성을 위해 [group&#95;by&#95;use&#95;nulls](/operations/settings/settings.md#group_by_use_nulls) 설정도 함께 참고하십시오.


## 구현 세부 사항 \{#implementation-details\}

집계는 컬럼 지향 DBMS에서 가장 중요한 기능 중 하나이며, 그 구현 부분은 ClickHouse에서 가장 강하게 최적화된 영역 중 하나입니다. 기본적으로 집계는 해시 테이블을 사용해 메모리에서 수행됩니다. 「그룹 키(grouping key)」 데이터 타입에 따라 자동으로 선택되는 40개 이상의 특수화가 있습니다.

### 테이블 정렬 키에 따른 GROUP BY 최적화 \{#group-by-optimization-depending-on-table-sorting-key\}

테이블이 어떤 키로 정렬되어 있고 `GROUP BY` 식에 해당 정렬 키의 접두(prefix) 또는 단사 함수(injective function)가 최소 하나 이상 포함되어 있으면, 집계를 더 효율적으로 수행할 수 있습니다. 이 경우 테이블에서 새로운 키를 읽을 때마다 집계의 중간 결과를 마무리하여 클라이언트로 전송할 수 있습니다. 이 동작은 [optimize_aggregation_in_order](../../../operations/settings/settings.md#optimize_aggregation_in_order) 설정으로 활성화됩니다. 이러한 최적화는 집계 동안 메모리 사용량을 줄이지만, 경우에 따라 쿼리 실행 속도를 느리게 만들 수 있습니다.

### 외부 메모리에서의 GROUP BY \{#group-by-in-external-memory\}

`GROUP BY` 수행 시 사용하는 메모리를 제한하기 위해, 임시 데이터를 디스크로 덤프하도록 설정할 수 있습니다. [max_bytes_before_external_group_by](/operations/settings/settings#max_bytes_before_external_group_by) 설정은 `GROUP BY` 임시 데이터를 파일 시스템으로 덤프하기 위한 RAM 사용량 임계값을 결정합니다. 0으로 설정되면(기본값) 비활성화됩니다.  
또는 [max_bytes_ratio_before_external_group_by](/operations/settings/settings#max_bytes_ratio_before_external_group_by)를 설정하여, 쿼리가 사용 중인 메모리가 일정 비율의 임계값에 도달했을 때만 외부 메모리에서 `GROUP BY`를 사용하도록 할 수 있습니다.

`max_bytes_before_external_group_by`를 사용할 때는 `max_memory_usage`를 그 약 2배 수준(또는 `max_bytes_ratio_before_external_group_by=0.5`)으로 설정할 것을 권장합니다. 집계에는 두 단계가 있기 때문입니다. (1) 데이터 읽기 및 중간 데이터 생성, (2) 중간 데이터 병합입니다. 파일 시스템으로의 덤프는 1단계에서만 수행될 수 있습니다. 임시 데이터가 덤프되지 않은 경우, 2단계에서는 1단계와 거의 동일한 양의 메모리가 추가로 필요할 수 있습니다.

예를 들어 [max_memory_usage](/operations/settings/settings#max_memory_usage)를 10000000000으로 설정했고 외부 집계를 사용하려는 경우, `max_bytes_before_external_group_by`를 10000000000으로, `max_memory_usage`를 20000000000으로 설정하는 것이 합리적입니다. 외부 집계가 트리거되면(임시 데이터가 한 번이라도 덤프된 경우), RAM의 최대 사용량은 `max_bytes_before_external_group_by`보다 약간 더 많을 뿐입니다.

분산 쿼리 처리 시 외부 집계는 원격 서버에서 수행됩니다. 요청 서버가 사용하는 RAM을 최소로 유지하려면 `distributed_aggregation_memory_efficient`를 1로 설정하십시오.

디스크로 덤프된 데이터를 병합할 때와 `distributed_aggregation_memory_efficient` 설정이 활성화된 상태에서 원격 서버의 결과를 병합할 때는 전체 RAM 양의 `1/256 * the_number_of_threads`까지 사용할 수 있습니다.

외부 집계가 활성화된 상태에서 데이터 양이 `max_bytes_before_external_group_by`보다 적어서(즉, 데이터가 덤프되지 않은 경우) 임시 데이터 덤프가 발생하지 않으면, 쿼리는 외부 집계를 사용하지 않을 때와 거의 동일한 속도로 실행됩니다. 임시 데이터가 덤프된 경우 실행 시간은 여러 배(대략 3배 정도) 길어집니다.

`GROUP BY` 이후에 [ORDER BY](/sql-reference/statements/select/order-by.md)와 [LIMIT](/sql-reference/statements/select/limit.md)가 있는 경우, 사용되는 RAM의 양은 전체 테이블 데이터가 아니라 `LIMIT`에 포함되는 데이터 양에 따라 달라집니다. 하지만 `ORDER BY`에 `LIMIT`이 없다면, 외부 정렬(`max_bytes_before_external_sort`)을 반드시 활성화해야 합니다.
