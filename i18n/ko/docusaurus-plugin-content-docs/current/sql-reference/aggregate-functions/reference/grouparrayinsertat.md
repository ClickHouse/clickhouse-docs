---
'description': '지정된 위치에 값을 배열에 삽입합니다.'
'sidebar_position': 140
'slug': '/sql-reference/aggregate-functions/reference/grouparrayinsertat'
'title': 'groupArrayInsertAt'
'doc_type': 'reference'
---


# groupArrayInsertAt

지정된 위치에 값을 배열에 삽입합니다.

**구문**

```sql
groupArrayInsertAt(default_x, size)(x, pos)
```

하나의 쿼리에서 여러 값이 동일한 위치에 삽입되는 경우, 함수는 다음과 같이 작동합니다:

- 단일 스레드에서 쿼리가 실행되면, 삽입된 값 중 첫 번째 값이 사용됩니다.
- 여러 스레드에서 쿼리가 실행되면, 결과 값은 삽입된 값 중 임의의 값이 됩니다.

**매개변수**

- `x` — 삽입할 값. [표현식](/sql-reference/syntax#expressions)로, [지원되는 데이터 타입](../../../sql-reference/data-types/index.md) 중 하나를 반환합니다.
- `pos` — 지정된 요소 `x`가 삽입될 위치. 배열의 인덱스 번호는 0부터 시작합니다. [UInt32](/sql-reference/data-types/int-uint#integer-ranges).
- `default_x` — 빈 위치에 대체할 기본값. 선택적 매개변수. `x` 매개변수에 대해 구성된 데이터 타입을 반환하는 [표현식](/sql-reference/syntax#expressions)입니다. `default_x`가 정의되지 않으면, [기본값](/sql-reference/statements/create/table)이 사용됩니다.
- `size` — 결과 배열의 길이. 선택적 매개변수. 이 매개변수를 사용할 때, 기본값 `default_x`를 지정해야 합니다. [UInt32](/sql-reference/data-types/int-uint#integer-ranges).

**반환 값**

- 삽입된 값이 포함된 배열.

유형: [Array](/sql-reference/data-types/array).

**예시**

쿼리:

```sql
SELECT groupArrayInsertAt(toString(number), number * 2) FROM numbers(5);
```

결과:

```text
┌─groupArrayInsertAt(toString(number), multiply(number, 2))─┐
│ ['0','','1','','2','','3','','4']                         │
└───────────────────────────────────────────────────────────┘
```

쿼리:

```sql
SELECT groupArrayInsertAt('-')(toString(number), number * 2) FROM numbers(5);
```

결과:

```text
┌─groupArrayInsertAt('-')(toString(number), multiply(number, 2))─┐
│ ['0','-','1','-','2','-','3','-','4']                          │
└────────────────────────────────────────────────────────────────┘
```

쿼리:

```sql
SELECT groupArrayInsertAt('-', 5)(toString(number), number * 2) FROM numbers(5);
```

결과:

```text
┌─groupArrayInsertAt('-', 5)(toString(number), multiply(number, 2))─┐
│ ['0','-','1','-','2']                                             │
└───────────────────────────────────────────────────────────────────┘
```

하나의 위치에 여러 스레드를 사용한 요소 삽입.

쿼리:

```sql
SELECT groupArrayInsertAt(number, 0) FROM numbers_mt(10) SETTINGS max_block_size = 1;
```

이 쿼리의 결과로 `[0,9]` 범위의 무작위 정수를 얻습니다. 예를 들어:

```text
┌─groupArrayInsertAt(number, 0)─┐
│ [7]                           │
└───────────────────────────────┘
```
