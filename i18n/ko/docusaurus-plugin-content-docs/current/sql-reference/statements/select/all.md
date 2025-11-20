---
'description': 'ALL 절에 대한 문서'
'sidebar_label': 'ALL'
'slug': '/sql-reference/statements/select/all'
'title': 'ALL 절'
'doc_type': 'reference'
---


# ALL 절

테이블에 여러 개의 일치하는 행이 있는 경우, `ALL`은 그 모든 행을 반환합니다. `SELECT ALL`은 `DISTINCT` 없이 `SELECT`와 동일합니다. `ALL`과 `DISTINCT`가 모두 지정된 경우에는 예외가 발생합니다.

`ALL`은 집계 함수 내부에서 지정할 수 있지만, 쿼리 결과에 실질적인 영향을 미치지 않습니다.

예를 들어:

```sql
SELECT sum(ALL number) FROM numbers(10);
```

다음과 동일합니다:

```sql
SELECT sum(number) FROM numbers(10);
```
