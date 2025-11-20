---
'description': '`EXISTS` 연산자에 대한 문서'
'slug': '/sql-reference/operators/exists'
'title': 'EXISTS'
'doc_type': 'reference'
---


# EXISTS

`EXISTS` 연산자는 서브 쿼리의 결과에 기록된 레코드 수를 확인합니다. 만약 결과가 비어 있다면, 연산자는 `0`을 반환합니다. 그렇지 않으면 `1`을 반환합니다.

`EXISTS`는 [WHERE](../../sql-reference/statements/select/where.md) 절에서도 사용할 수 있습니다.

:::tip    
서브 쿼리에서는 주 쿼리 테이블 및 컬럼에 대한 참조가 지원되지 않습니다.
:::

**구문**

```sql
EXISTS(subquery)
```

**예제**

서브 쿼리에서 값의 존재 여부를 확인하는 쿼리:

```sql
SELECT EXISTS(SELECT * FROM numbers(10) WHERE number > 8), EXISTS(SELECT * FROM numbers(10) WHERE number > 11)
```

결과:

```text
┌─in(1, _subquery1)─┬─in(1, _subquery2)─┐
│                 1 │                 0 │
└───────────────────┴───────────────────┘
```

여러 행을 반환하는 서브 쿼리와 함께하는 쿼리:

```sql
SELECT count() FROM numbers(10) WHERE EXISTS(SELECT number FROM numbers(10) WHERE number > 8);
```

결과:

```text
┌─count()─┐
│      10 │
└─────────┘
```

빈 결과를 반환하는 서브 쿼리와 함께하는 쿼리:

```sql
SELECT count() FROM numbers(10) WHERE EXISTS(SELECT number FROM numbers(10) WHERE number > 11);
```

결과:

```text
┌─count()─┐
│       0 │
└─────────┘
```
