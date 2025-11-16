---
'description': 'IN 연산자에 대한 문서, NOT IN, GLOBAL IN 및 GLOBAL NOT IN 연산자는 별도로 다룹니다.'
'slug': '/sql-reference/operators/in'
'title': 'IN 연산자'
'doc_type': 'reference'
---


# IN 연산자

`IN`, `NOT IN`, `GLOBAL IN`, 및 `GLOBAL NOT IN` 연산자는 기능이 매우 풍부하기 때문에 별도로 다루어집니다.

연산자의 왼쪽은 단일 컬럼이나 튜플이 될 수 있습니다.

예시:

```sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

왼쪽이 인덱스에 있는 단일 컬럼이고 오른쪽이 상수 집합인 경우, 시스템은 인덱스를 사용하여 쿼리를 처리합니다.

explicit하게 너무 많은 값을 나열하지 마십시오 (즉, 수백만). 데이터 세트가 크면 이를 임시 테이블에 넣으십시오 (예를 들어, [쿼리 처리용 외부 데이터](../../engines/table-engines/special/external-data.md) 섹션을 참조), 그런 다음 서브쿼리를 사용하십시오.

연산자의 오른쪽은 상수 표현식의 집합, 상수 표현식이 포함된 튜플의 집합(위 예시에서 보여진) 또는 괄호 안에 있는 데이터베이스 테이블의 이름이나 `SELECT` 서브쿼리가 될 수 있습니다.

ClickHouse는 `IN` 서브쿼리의 왼쪽과 오른쪽 부분의 유형이 다를 수 있도록 허용합니다. 이 경우, 오른쪽의 값을 왼쪽의 유형으로 변환하며, 마치 [accurateCastOrNull](/sql-reference/functions/type-conversion-functions#accuratecastornullx-t) 함수가 오른쪽에 적용된 것처럼 작동합니다.

이는 데이터 유형이 [Nullable](../../sql-reference/data-types/nullable.md)로 변하고, 변환이 수행될 수 없을 경우 [NULL](/operations/settings/formats#input_format_null_as_default)을 반환함을 의미합니다.

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

연산자의 오른쪽이 테이블의 이름인 경우(예: `UserID IN users`), 이는 서브쿼리 `UserID IN (SELECT * FROM users)`와 같습니다. 외부 데이터가 쿼리와 함께 전송될 때 이를 사용합니다. 예를 들어, 쿼리는 'users' 임시 테이블에 로드된 사용자 ID 집합과 함께 전송되어야 필터링됩니다.

연산자의 오른쪽에 Set 엔진이 있는 테이블 이름이 있는 경우(항상 RAM에 있는 준비된 데이터 세트), 쿼리마다 데이터 세트가 다시 생성되지 않습니다.

서브쿼리는 튜플 필터링을 위해 하나 이상의 컬럼을 지정할 수 있습니다.

예시:

```sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN` 연산자의 왼쪽과 오른쪽의 컬럼은 동일한 유형이어야 합니다.

`IN` 연산자와 서브쿼리는 집계 함수 및 람다 함수 를 포함하여 쿼리의 모든 부분에서 발생할 수 있습니다. 예시:

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

3월 17일 이후 매일, 3월 17일에 사이트를 방문한 사용자가 만든 페이지뷰 비율을 계산합니다. `IN` 절의 서브쿼리는 항상 단일 서버에서 한 번만 실행됩니다. 종속 서브쿼리는 없습니다.

## NULL 처리 {#null-processing}

요청 처리 중에 `IN` 연산자는 [NULL](/operations/settings/formats#input_format_null_as_default)와의 연산 결과가 항상 `0`과 같다고 가정합니다. 이는 `NULL`이 연산자의 오른쪽에 있든 왼쪽에 있든 관계없습니다. `NULL` 값은 아무 데이터 세트에 포함되지 않으며 서로 상응하지 않기 때문에 [transform_null_in = 0](../../operations/settings/settings.md#transform_null_in)일 경우 비교할 수 없습니다.

`t_null` 테이블의 예는 다음과 같습니다:

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

쿼리 `SELECT x FROM t_null WHERE y IN (NULL,3)`를 실행하면 다음과 같은 결과가 나옵니다:

```text
┌─x─┐
│ 2 │
└───┘
```

`y = NULL`인 행이 쿼리 결과에서 제외되는 것을 볼 수 있습니다. 이는 ClickHouse가 `NULL`이 `(NULL,3)` 집합에 포함되어 있는지를 결정할 수 없기 때문에 연산의 결과로 `0`을 반환하고, `SELECT`가 이 행을 최종 출력에서 제외하기 때문입니다.

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

## 분산 서브쿼리 {#distributed-subqueries}

서브쿼리가 있는 `IN` 연산자에는 두 가지 옵션이 있습니다(일반 `IN` / `JOIN` 및 `GLOBAL IN` / `GLOBAL JOIN`). 이들은 분산 쿼리 처리를 위해 실행되는 방식이 다릅니다.

:::note    
아래 설명된 알고리즘은 [설정](../../operations/settings/settings.md) `distributed_product_mode` 설정에 따라 다르게 작동할 수 있습니다.
:::

정규 `IN`을 사용하는 경우, 쿼리는 원격 서버로 전송되며 각 서버가 `IN` 또는 `JOIN` 절에서 서브쿼리를 실행합니다.

`GLOBAL IN` / `GLOBAL JOIN`을 사용하는 경우, 먼저 모든 서브쿼리가 `GLOBAL IN` / `GLOBAL JOIN`을 위해 실행되고, 결과가 임시 테이블에 수집됩니다. 그런 다음 이 임시 테이블이 각 원격 서버에 전송되어 이 임시 데이터를 사용하여 쿼리가 실행됩니다.

비분산 쿼리의 경우, 정규 `IN` / `JOIN`을 사용하십시오.

분산 쿼리 처리를 위한 `IN` / `JOIN` 절에서 서브쿼리를 사용할 때 주의하십시오.

몇 가지 예를 살펴보겠습니다. 클러스터의 각 서버에 일반 **local_table**이 있다고 가정해 봅시다. 각 서버에는 클러스터의 모든 서버를 조회할 수 있는 **Distributed** 유형의 **distributed_table** 테이블도 있습니다.

**distributed_table**에 대한 쿼리는 모든 원격 서버에 전송되어 **local_table**을 사용하여 실행됩니다.

예를 들어, 쿼리

```sql
SELECT uniq(UserID) FROM distributed_table
```

는 모든 원격 서버에 다음과 같이 전송됩니다:

```sql
SELECT uniq(UserID) FROM local_table
```

모든 서버에서 병렬로 실행되며, 중간 결과를 조합할 수 있는 단계에 도달할 때까지입니다. 그런 다음 중간 결과가 요청자 서버로 반환되어 병합되고, 최종 결과가 클라이언트에 전송됩니다.

이제 `IN`이 있는 쿼리를 살펴보겠습니다:

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

- 두 사이트의 청중 교차점을 계산합니다.

이 쿼리는 모든 원격 서버에 다음과 같이 전송됩니다:

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

즉, `IN` 절의 데이터 세트는 각 서버에서 독립적으로 수집되며, 각 서버에 로컬로 저장된 데이터만 포함됩니다.

서버 간에 데이터가 임의로 분산된 경우 쿼리가 올바르게 작동하도록 하려면 서브쿼리 안에 **distributed_table**를 지정할 수 있습니다. 쿼리는 다음과 같이 보일 것입니다:

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

이 쿼리는 모든 원격 서버에 다음과 같이 전송됩니다:

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

서브쿼리는 각 원격 서버에서 실행되기 시작합니다. 서브쿼리가 분산 테이블을 사용하므로, 각 원격 서버의 서브쿼리는 모든 원격 서버에 다시 전송됩니다:

```sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

예를 들어, 100개의 서버가 있는 클러스터가 있는 경우, 전체 쿼리를 실행하는 데 10,000개의 기본 요청이 필요하며, 이는 일반적으로 허용될 수 없는 것으로 간주됩니다.

이러한 경우에는 항상 `IN` 대신 `GLOBAL IN`을 사용하는 것이 좋습니다. 쿼리에 대해 어떻게 작동하는지 살펴보겠습니다:

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

요청자 서버는 서브쿼리를 실행합니다:

```sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

그 결과는 RAM의 임시 테이블에 저장됩니다. 그런 다음 요청은 각 원격 서버에 다음과 같이 전송됩니다:

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

임시 테이블 `_data1`은 모든 원격 서버에 쿼리와 함께 전송됩니다 (임시 테이블의 이름은 구현에 따라 정의됨).

이것은 일반 `IN`을 사용하는 것보다 더 최적화된 방법입니다. 그러나 다음 사항을 염두에 두십시오:

1.  임시 테이블을 생성할 때 데이터는 고유하게 되지 않습니다. 네트워크를 통한 전송량을 줄이려면 서브쿼리에서 DISTINCT를 지정하십시오. (정규 `IN`의 경우 이를 수행할 필요는 없습니다.)
2.  임시 테이블은 모든 원격 서버에 전송됩니다. 전송은 네트워크 구조를 고려하지 않습니다. 예를 들어, 요청자 서버와 상대적으로 매우 먼 데이터 센터에 10개의 원격 서버가 있는 경우, 데이터는 원격 데이터 센터로 10번 전송됩니다. `GLOBAL IN`을 사용할 때 대규모 데이터 세트를 피하십시오.
3.  원격 서버로 데이터를 전송할 때 네트워크 대역폭에 대한 제한은 구성할 수 없습니다. 네트워크가 과부하될 수 있습니다.
4.  서버 간에 데이터를 분산시켜 정기적으로 `GLOBAL IN`을 사용할 필요가 없도록 하십시오.
5.  자주 `GLOBAL IN`을 사용해야 하는 경우, ClickHouse 클러스터의 위치를 계획하여 하나의 복제본 그룹이 빠른 네트워크를 통해 상호 연결된 한 데이터 센터에만 존재하도록 하여 쿼리가 전체적으로 단일 데이터 센터 내에서 처리될 수 있도록 하십시오.

요청자 서버에서만 사용할 수 있는 로컬 테이블이 있는 경우, `GLOBAL IN` 절에 로컬 테이블을 지정하는 것도 타당합니다.

### 분산 서브쿼리 및 max_rows_in_set {#distributed-subqueries-and-max_rows_in_set}

분산 쿼리 중에 얼마나 많은 데이터가 전송되는지를 제어하기 위해 [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set) 및 [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)을 사용할 수 있습니다.

이는 특히 `GLOBAL IN` 쿼리가 대량의 데이터를 반환하는 경우 중요합니다. 다음 SQL을 고려하십시오:

```sql
SELECT * FROM table1 WHERE col1 GLOBAL IN (SELECT col1 FROM table2 WHERE <some_predicate>)
```

`some_predicate`가 충분히 선택적이지 않으면, 대량의 데이터를 반환하여 성능 문제를 일으킬 수 있습니다. 이러한 경우, 네트워크를 통한 데이터 전송을 제한하는 것이 좋습니다. 또한, [`set_overflow_mode`](/operations/settings/settings#set_overflow_mode)가 `throw` (기본값)로 설정되어 있어 이러한 임계값이 초과될 경우 예외가 발생함을 명심하십시오.

### 분산 서브쿼리 및 max_parallel_replicas {#distributed-subqueries-and-max_parallel_replicas}

[max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas)가 1보다 클 경우, 분산 쿼리는 추가적으로 변형됩니다.

예를 들어, 다음은:

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

각 서버에서 다음과 같이 변형됩니다:

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

여기서 `M`은 로컬 쿼리가 실행 중인 복제본에 따라 `1`과 `3` 사이입니다.

이 설정은 쿼리의 모든 MergeTree 계열 테이블에 영향을 미치며, 각 테이블에 대해 `SAMPLE 1/3 OFFSET (M-1)/3`을 적용한 것과 동일한 효과를 가집니다.

따라서 [max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) 설정을 추가하면 두 테이블이 동일한 복제본 스키마를 가지고 있고 UserID 또는 그 하위 키로 샘플링되는 경우에만 올바른 결과를 생성합니다. 특히, `local_table_2`가 샘플링 키가 없는 경우 잘못된 결과가 생성될 수 있습니다. 동일한 규칙이 `JOIN`에도 적용됩니다.

`local_table_2`가 요구 사항을 충족하지 않는 경우 해결책은 `GLOBAL IN` 또는 `GLOBAL JOIN`을 사용하는 것입니다.

테이블에 샘플링 키가 없는 경우, [parallel_replicas_custom_key](/operations/settings/settings#parallel_replicas_custom_key)에 대해 더 유연한 옵션을 사용하여 다른 최적화된 동작을 생성할 수 있습니다.
