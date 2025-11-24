---
'description': '값 그룹에서 최대값을 계산하는 집계 함수입니다.'
'sidebar_position': 162
'slug': '/sql-reference/aggregate-functions/reference/max'
'title': 'max'
'doc_type': 'reference'
---

값 그룹에서 최대값을 계산하는 집계 함수입니다.

예제:

```sql
SELECT max(salary) FROM employees;
```

```sql
SELECT department, max(salary) FROM employees GROUP BY department;
```

두 값 중 최대값을 선택하기 위한 비집계 함수가 필요하다면 `greatest`를 참조하세요:

```sql
SELECT greatest(a, b) FROM table;
```
