---
'description': '시스템 테이블은 값 0을 포함하는 단일 `dummy` UInt8 컬럼이 있는 단일 행을 포함합니다. 다른 DBMS에서
  발견되는 `DUAL` 테이블과 유사합니다.'
'keywords':
- 'system table'
- 'one'
'slug': '/operations/system-tables/one'
'title': 'system.one'
'doc_type': 'reference'
---


# system.one

이 테이블은 값 0을 포함하는 단일 `dummy` UInt8 컬럼이 있는 단일 행을 포함합니다.

이 테이블은 `SELECT` 쿼리가 `FROM` 절을 지정하지 않을 경우 사용됩니다.

이는 다른 DBMS에서 발견되는 `DUAL` 테이블과 유사합니다.

**예제**

```sql
SELECT * FROM system.one LIMIT 10;
```

```response
┌─dummy─┐
│     0 │
└───────┘

1 rows in set. Elapsed: 0.001 sec.
```
