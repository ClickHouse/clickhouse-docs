---
'description': '테스트 목적으로 많은 행을 생성하는 가장 빠른 방법으로 사용됩니다. `system.zeros` 및 `system.zeros_mt`
  시스템 인덱스와 유사합니다.'
'sidebar_label': 'zeros'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/zeros'
'title': 'zeros'
'doc_type': 'reference'
---


# zeros 테이블 함수

* `zeros(N)` – 정수 0을 `N`번 포함하는 단일 'zero' 컬럼(UInt8)으로 구성된 테이블을 반환합니다.
* `zeros_mt(N)` – `zeros`와 같지만 여러 스레드를 사용합니다.

이 함수는 많은 행을 생성하는 가장 빠른 방법으로 테스트 목적으로 사용됩니다. `system.zeros` 및 `system.zeros_mt` 시스템 테이블과 유사합니다.

다음 쿼리는 동등합니다:

```sql
SELECT * FROM zeros(10);
SELECT * FROM system.zeros LIMIT 10;
SELECT * FROM zeros_mt(10);
SELECT * FROM system.zeros_mt LIMIT 10;
```

```response
┌─zero─┐
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
└──────┘
```
