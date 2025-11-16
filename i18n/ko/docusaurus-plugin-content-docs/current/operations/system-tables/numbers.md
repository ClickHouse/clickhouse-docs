---
'description': '시스템 테이블로 `number`라는 단일 UInt64 컬럼을 포함하며, 0부터 시작하는 거의 모든 자연수를 포함합니다.'
'keywords':
- 'system table'
- 'numbers'
'slug': '/operations/system-tables/numbers'
'title': 'system.numbers'
'doc_type': 'reference'
---


# system.numbers

이 테이블은 0부터 시작하는 거의 모든 자연수를 포함하는 단일 UInt64 컬럼 `number`를 포함합니다.

이 테이블은 테스트에 사용하거나, 브루트 포스 검색을 수행해야 할 때 사용할 수 있습니다.

이 테이블에 대한 읽기는 병렬화되지 않습니다.

**예제**

```sql
SELECT * FROM system.numbers LIMIT 10;
```

```response
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘

10 rows in set. Elapsed: 0.001 sec.
```

조건을 통해 출력 결과를 제한할 수도 있습니다.

```sql
SELECT * FROM system.numbers < 10;
```

```response
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘

10 rows in set. Elapsed: 0.001 sec.
```
