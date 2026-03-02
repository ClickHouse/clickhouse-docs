---
description: 'NOT IN, GLOBAL IN 및 GLOBAL NOT IN 연산자는 별도로 다루며, 그 외 IN 연산자에 대한 문서입니다'
slug: /sql-reference/operators/in
title: 'IN 연산자'
doc_type: 'reference'
---

# IN 연산자 \{#in-operators\}

`IN`, `NOT IN`, `GLOBAL IN`, `GLOBAL NOT IN` 연산자는 기능이 다양하므로 별도로 설명합니다.

연산자의 왼쪽에는 단일 컬럼 또는 튜플이 올 수 있습니다.

예시:

```sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

왼쪽이 인덱스에 포함된 단일 컬럼이고, 오른쪽이 상수들의 집합인 경우 시스템은 쿼리를 처리할 때 인덱스를 사용합니다.

값을 너무 많이 직접 나열하지 마십시오(예: 수백만 개). 데이터 세트가 큰 경우에는 임시 테이블에 넣은 다음(예시는 [쿼리 처리용 외부 데이터](../../engines/table-engines/special/external-data.md) 섹션을 참조), 서브쿼리를 사용하십시오.

연산자의 오른쪽에는 상수 표현식의 집합, 상수 표현식을 포함한 튜플의 집합(위 예시와 같이), 또는 데이터베이스 테이블 이름이나 괄호로 감싼 `SELECT` 서브쿼리가 올 수 있습니다.

ClickHouse는 `IN` 서브쿼리의 왼쪽과 오른쪽 부분의 데이터 타입이 서로 달라도 허용합니다.
이 경우 오른쪽 값은 왼쪽의 데이터 타입으로 변환되며, 이는 오른쪽에 [accurateCastOrNull](/sql-reference/functions/type-conversion-functions#accurateCastOrNull) 함수가 적용된 것과 같습니다.

이는 데이터 타입이 [널 허용(Nullable)](../../sql-reference/data-types/nullable.md)이 되며, 변환을 수행할 수 없으면 [NULL](/operations/settings/formats#input_format_null_as_default)을 반환함을 의미합니다.

**예시**

쿼리:

```sql
SELECT '1' IN (SELECT 1);
```

결과:

```text
┌─in('1', _subquery49)─┐
│                    1 │
└──────────────────────┘
```

연산자의 오른쪽이 테이블 이름인 경우(예: `UserID IN users`), 이는 `UserID IN (SELECT * FROM users)` 서브쿼리와 동일합니다. 쿼리와 함께 전송되는 외부 데이터로 작업할 때 사용합니다. 예를 들어, 필터링해야 하는 사용자 ID 집합을 &#39;users&#39; 임시 테이블에 적재한 뒤, 이 임시 테이블과 함께 쿼리를 전송할 수 있습니다.

연산자의 오른쪽이 Set 엔진(항상 RAM에 상주하는 준비된 데이터 세트)을 사용하는 테이블 이름인 경우, 해당 데이터 세트는 쿼리마다 다시 생성되지 않습니다.

서브쿼리는 튜플을 필터링하기 위해 둘 이상의 컬럼을 지정할 수 있습니다.

예:

```sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN` 연산자 왼쪽과 오른쪽의 컬럼은 동일한 타입이어야 합니다.

`IN` 연산자와 서브쿼리는 집계 함수 및 람다 함수 내부를 포함하여 쿼리의 어느 위치에서나 사용할 수 있습니다.
예시:

```sql
SELECT
    EventDate,
    avg(UserID IN
    (
        SELECT UserID
        FROM test.hits
        WHERE EventDate = toDate('2014-03-17')
    )) AS ratio
FROM test.hits
GROUP BY EventDate
ORDER BY EventDate ASC
```

```text
┌──EventDate─┬────ratio─┐
│ 2014-03-17 │        1 │
│ 2014-03-18 │ 0.807696 │
│ 2014-03-19 │ 0.755406 │
│ 2014-03-20 │ 0.723218 │
│ 2014-03-21 │ 0.697021 │
│ 2014-03-22 │ 0.647851 │
│ 2014-03-23 │ 0.648416 │
└────────────┴──────────┘
```

3월 17일 이후 각 날짜에 대해, 3월 17일에 사이트를 방문했던 사용자가 만든 페이지뷰 비율을 계산합니다.
`IN` 절의 서브쿼리는 항상 단일 서버에서 한 번만 실행됩니다. 종속 서브쿼리는 없습니다.

## NULL 처리 \{#null-processing\}

요청을 처리할 때 `IN` 연산자는 [NULL](/operations/settings/formats#input_format_null_as_default)과의 연산 결과가, 연산자 오른쪽에 `NULL`이 있든 왼쪽에 있든 상관없이 항상 `0`과 같다고 가정합니다. [transform&#95;null&#95;in = 0](../../operations/settings/settings.md#transform_null_in)인 경우, `NULL` 값은 어떤 데이터셋에도 포함되지 않으며, 서로 일치하지 않고, 비교할 수도 없습니다.

다음은 `t_null` 테이블을 사용하는 예시입니다:

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

`SELECT x FROM t_null WHERE y IN (NULL,3)` 쿼리를 실행하면 다음 결과가 반환됩니다:

```text
┌─x─┐
│ 2 │
└───┘
```

`y = NULL`인 행이 쿼리 결과에서 제외되는 것을 확인할 수 있습니다. 이는 ClickHouse가 `NULL`이 `(NULL,3)` 집합에 포함되는지 결정할 수 없기 때문에 연산 결과로 `0`을 반환하고, 그 결과 `SELECT`가 최종 출력에서 이 행을 제외하기 때문입니다.

```sql
SELECT y IN (NULL, 3)
FROM t_null
```

```text
┌─in(y, tuple(NULL, 3))─┐
│                     0 │
│                     1 │
└───────────────────────┘
```

## 분산 서브쿼리 \{#distributed-subqueries\}

서브쿼리가 있는 `IN` 연산자(`JOIN` 연산자와 유사함)에는 두 가지 방식이 있습니다. 일반 `IN` / `JOIN`과 `GLOBAL IN` / `GLOBAL JOIN`으로, 분산 쿼리 처리 시 실행되는 방식이 서로 다릅니다.

:::note
아래에 설명된 알고리즘은 [settings](../../operations/settings/settings.md) 중 `distributed_product_mode` 설정에 따라 다르게 동작할 수 있습니다.
:::

일반 `IN`을 사용할 때는 쿼리가 원격 서버로 전송되고, 각 서버가 `IN` 또는 `JOIN` 절의 서브쿼리를 실행합니다.

`GLOBAL IN` / `GLOBAL JOIN`을 사용할 경우, 먼저 `GLOBAL IN` / `GLOBAL JOIN`에 대한 모든 서브쿼리를 실행하고, 그 결과를 임시 테이블에 수집합니다. 그런 다음 이 임시 테이블을 각 원격 서버로 전송한 후, 각 서버에서 이 임시 데이터를 사용하여 쿼리를 실행합니다.

비분산 쿼리에서는 일반 `IN` / `JOIN`을 사용하십시오.

분산 쿼리 처리에서 `IN` / `JOIN` 절에 서브쿼리를 사용할 때에는 주의해야 합니다.

몇 가지 예를 살펴보겠습니다. 클러스터의 각 서버에 일반 **local&#95;table**이 있다고 가정합니다. 각 서버에는 또한 클러스터의 모든 서버를 참조하는 **Distributed** 타입의 **distributed&#95;table** 테이블이 있습니다.

**distributed&#95;table**에 대한 쿼리는 모든 원격 서버로 전송되며, 각 서버에서 **local&#95;table**을 사용하여 실행됩니다.

예를 들어, 다음 쿼리를 고려해 보겠습니다.

```sql
SELECT uniq(UserID) FROM distributed_table
```

다음과 같은 형태로 모든 원격 서버에 전송됩니다

```sql
SELECT uniq(UserID) FROM local_table
```

그리고 중간 결과를 합칠 수 있는 단계에 도달할 때까지 각 서버에서 병렬로 실행합니다. 그런 다음 중간 결과가 요청을 받은 서버로 반환되어 해당 서버에서 병합되고, 최종 결과가 클라이언트로 전송됩니다.

이제 `IN`이 포함된 쿼리를 살펴보겠습니다:

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

* 두 사이트의 사용자 교집합을 계산합니다.

이 쿼리는 모든 원격 서버에 다음과 같이 전송됩니다.

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

다시 말해, `IN` 절에 사용되는 데이터 집합은 각 서버에 로컬로 저장된 데이터에 대해서만, 각 서버에서 독립적으로 수집됩니다.

이 동작은 이 상황을 미리 고려하여, 단일 UserID에 대한 데이터가 서버 중 하나에만 온전히 존재하도록 클러스터 서버에 데이터를 분산해 둔 경우에 올바르고 최적으로 동작합니다. 이 경우 필요한 모든 데이터는 각 서버에서 로컬에서 모두 사용할 수 있습니다. 그렇지 않으면 결과는 부정확해집니다. 이러한 방식의 쿼리를 「local IN」이라고 부릅니다.

데이터가 클러스터 서버 전체에 무작위로 분산되어 있는 경우 쿼리가 정확하게 동작하도록 하려면, 서브쿼리 안에 **distributed&#95;table** 을 지정할 수 있습니다. 쿼리는 다음과 같습니다:

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

이 쿼리는 다음과 같은 형태로 모든 원격 서버에 전송됩니다.

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

하위 쿼리는 각 원격 서버에서 실행되기 시작합니다. 하위 쿼리가 분산 테이블을 사용하므로, 각 원격 서버에서 실행되는 하위 쿼리는 다음과 같이 모든 원격 서버로 다시 전송됩니다.

```sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

예를 들어, 서버 100개로 구성된 클러스터가 있는 경우 전체 쿼리를 실행하려면 10,000개의 개별 요청이 필요하며, 이는 일반적으로 허용할 수 없는 수준으로 간주됩니다.

이럴 때는 항상 `IN` 대신 `GLOBAL IN`을 사용해야 합니다. 이제 이 쿼리에서 어떻게 동작하는지 살펴보겠습니다.

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

요청을 보낸 서버가 서브쿼리를 실행합니다.

```sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

그리고 결과는 RAM 상의 임시 테이블에 저장됩니다. 그런 다음 요청은 각 원격 서버에 다음과 같이 전송됩니다.

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

임시 테이블 `_data1`은(는) 쿼리와 함께 모든 원격 서버로 전송됩니다(임시 테이블의 이름은 구현에 의해 결정됩니다).

이는 일반적인 `IN`을(를) 사용하는 것보다 더 효율적입니다. 다만 다음 사항을 유의하십시오:

1. 임시 테이블을 생성할 때는 데이터의 고유성이 보장되지 않습니다. 네트워크를 통해 전송되는 데이터 양을 줄이려면 서브쿼리에서 DISTINCT를 지정하십시오. (일반 `IN`의 경우에는 그럴 필요가 없습니다.)
2. 임시 테이블은 모든 원격 서버로 전송됩니다. 전송 시 네트워크 토폴로지는 고려되지 않습니다. 예를 들어, 10개의 원격 서버가 요청 서버와 매우 멀리 떨어진 데이터 센터에 있는 경우, 해당 원격 데이터 센터로의 채널을 통해 데이터가 10번 전송됩니다. `GLOBAL IN`을 사용할 때는 큰 데이터 세트를 피하도록 하십시오.
3. 데이터를 원격 서버로 전송할 때 네트워크 대역폭에 대한 제한은 설정할 수 없습니다. 네트워크가 과부하될 수 있습니다.
4. 정기적으로 `GLOBAL IN`을 사용할 필요가 없도록 데이터를 서버 간에 분산하도록 하십시오.
5. `GLOBAL IN`을 자주 사용해야 한다면, 하나의 레플리카 그룹이 빠른 네트워크로 상호 연결된 하나의 데이터 센터 내에만 존재하도록 ClickHouse 클러스터의 위치를 설계하여, 쿼리가 단일 데이터 센터 내에서만 완전히 처리될 수 있도록 하십시오.

또한 `GLOBAL IN` 절에서 로컬 테이블을 지정하는 것도 좋습니다. 이 로컬 테이블이 요청 서버에서만 사용 가능하지만 원격 서버에서도 해당 데이터를 사용하려는 경우에 유용합니다.

### 분산 서브쿼리와 max_rows_in_set \{#distributed-subqueries-and-max_rows_in_set\}

[`max_rows_in_set`](/operations/settings/settings#max_rows_in_set) 및 [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)을(를) 사용하여 분산 쿼리를 수행할 때 전송되는 데이터 양을 제어할 수 있습니다.

`GLOBAL IN` 쿼리가 많은 양의 데이터를 반환하는 경우 특히 중요합니다. 다음 SQL을 살펴보십시오:

```sql
SELECT * FROM table1 WHERE col1 GLOBAL IN (SELECT col1 FROM table2 WHERE <some_predicate>)
```

`some_predicate`의 선택성이 충분히 높지 않으면 대량의 데이터를 반환하여 성능 문제를 유발할 수 있습니다. 이때는 네트워크를 통해 전송되는 데이터 양을 제한하는 것이 바람직합니다. 또한 [`set_overflow_mode`](/operations/settings/settings#set_overflow_mode)가 기본적으로 `throw`로 설정되어 있어, 해당 임계값에 도달하면 예외가 발생한다는 점에 유의하십시오.

### 분산 서브쿼리와 max_parallel_replicas \{#distributed-subqueries-and-max_parallel_replicas\}

[max&#95;parallel&#95;replicas](#distributed-subqueries-and-max_parallel_replicas)가 1보다 큰 경우, 분산 쿼리에 추가 변환이 적용됩니다.

예를 들어, 다음과 같습니다.

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

각 서버에서 다음과 같은 형태로 변환됩니다.

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

여기서 `M`은 로컬 쿼리가 실행되는 레플리카에 따라 `1`에서 `3` 사이의 값을 가집니다.

이 설정들은 쿼리 내 모든 MergeTree 계열 테이블에 영향을 미치며, 각 테이블에 `SAMPLE 1/3 OFFSET (M-1)/3`을 적용한 것과 동일한 효과를 냅니다.

따라서 [max&#95;parallel&#95;replicas](#distributed-subqueries-and-max_parallel_replicas) 설정을 추가하는 경우, 두 테이블이 동일한 복제 방식(scheme)을 사용하고 UserID 또는 해당 하위 키(subkey)를 기준으로 샘플링되는 경우에만 올바른 결과가 생성됩니다. 특히 `local_table_2`에 샘플링 키가 없는 경우 잘못된 결과가 생성됩니다. 동일한 규칙이 `JOIN`에도 적용됩니다.

`local_table_2`가 이러한 요구 사항을 충족하지 않는 경우 사용할 수 있는 한 가지 우회 방법은 `GLOBAL IN` 또는 `GLOBAL JOIN`을 사용하는 것입니다.

테이블에 샘플링 키가 없는 경우, 서로 다른 보다 최적화된 동작을 제공할 수 있는 [parallel&#95;replicas&#95;custom&#95;key](/operations/settings/settings#parallel_replicas_custom_key)에 대한 더 유연한 옵션을 사용할 수 있습니다.
