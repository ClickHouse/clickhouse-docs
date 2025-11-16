---
'description': '값 그룹에서 최소값을 계산하는 집계 함수.'
'sidebar_position': 168
'slug': '/sql-reference/aggregate-functions/reference/min'
'title': 'min'
'doc_type': 'reference'
---

값의 그룹에서 최소값을 계산하는 집계 함수입니다.

예:

```sql
SELECT min(salary) FROM employees;
```

```sql
SELECT department, min(salary) FROM employees GROUP BY department;
```

두 값 중 최소값을 선택하는 비집계 함수가 필요하다면 `least`를 참조하세요:

```sql
SELECT least(a, b) FROM table;
```
