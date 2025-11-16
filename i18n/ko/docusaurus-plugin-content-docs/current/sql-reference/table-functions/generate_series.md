---
'slug': '/sql-reference/table-functions/generate_series'
'sidebar_position': 146
'sidebar_label': 'generate_series'
'title': 'generate_series (generateSeries)'
'description': '시작부터 끝까지 포함하여 정수를 포함하는 단일 `generate_series` 컬럼 (UInt64)을 가진 테이블을 반환합니다.'
'doc_type': 'reference'
---


# generate_series 테이블 함수

별칭: `generateSeries`

## 구문 {#syntax}

시작과 정지 값을 포함하는 정수를 포함하는 단일 'generate_series' 컬럼(`UInt64`)을 가진 테이블을 반환합니다:

```sql
generate_series(START, STOP)
```

값 사이의 간격이 `STEP`으로 주어지는 시작과 정지 값을 포함하는 정수를 포함하는 단일 'generate_series' 컬럼(`UInt64`)을 가진 테이블을 반환합니다:

```sql
generate_series(START, STOP, STEP)
```

## 예제 {#examples}

다음 쿼리는 동일한 내용을 가진 테이블을 반환하지만 열 이름이 다릅니다:

```sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

다음 쿼리는 동일한 내용을 가진 테이블을 반환하지만 열 이름이 다릅니다(하지만 두 번째 옵션이 더 효율적입니다):

```sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3);
```
