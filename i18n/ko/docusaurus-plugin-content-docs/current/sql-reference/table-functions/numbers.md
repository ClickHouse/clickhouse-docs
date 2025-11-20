---
'slug': '/sql-reference/table-functions/numbers'
'sidebar_position': 145
'sidebar_label': '숫자'
'title': '숫자'
'description': '지정 가능한 정수를 포함하는 단일 `number` 컬럼이 있는 테이블을 반환합니다.'
'doc_type': 'reference'
---


# numbers 테이블 함수

`numbers(N)` – 0부터 N-1까지의 정수를 포함하는 단일 'number' 컬럼 (UInt64)을 갖는 테이블을 반환합니다.  
`numbers(N, M)` - N부터 (N + M - 1)까지의 정수를 포함하는 단일 'number' 컬럼 (UInt64)을 갖는 테이블을 반환합니다.  
`numbers(N, M, S)` - N부터 (N + M - 1)까지의 정수를 포함하며, 단계 S를 적용한 단일 'number' 컬럼 (UInt64)을 갖는 테이블을 반환합니다.

`system.numbers` 테이블과 유사하게, 테스트와 연속 값을 생성하는 데 사용될 수 있으며, `numbers(N, M)`는 `system.numbers`보다 더 효율적입니다.

다음 쿼리는 같습니다:

```sql
SELECT * FROM numbers(10);
SELECT * FROM numbers(0, 10);
SELECT * FROM system.numbers LIMIT 10;
SELECT * FROM system.numbers WHERE number BETWEEN 0 AND 9;
SELECT * FROM system.numbers WHERE number IN (0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
```

다음 쿼리도 같습니다:

```sql
SELECT number * 2 FROM numbers(10);
SELECT (number - 10) * 2 FROM numbers(10, 10);
SELECT * FROM numbers(0, 20, 2);
```

예시:

```sql
-- Generate a sequence of dates from 2010-01-01 to 2010-12-31
SELECT toDate('2010-01-01') + number AS d FROM numbers(365);
```
