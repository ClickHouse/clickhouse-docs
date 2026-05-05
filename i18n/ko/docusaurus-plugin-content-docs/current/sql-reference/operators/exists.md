---
description: '`EXISTS` 연산자 문서'
slug: /sql-reference/operators/exists
title: 'EXISTS'
doc_type: 'reference'
---

# EXISTS \{#exists\}

`EXISTS` 연산자는 서브쿼리 결과에 레코드가 몇 개 있는지 확인합니다. 결과가 비어 있으면 `0`을 반환하고, 그렇지 않으면 `1`을 반환합니다.

`EXISTS`는 [WHERE](../../sql-reference/statements/select/where.md) 절에서도 사용할 수 있습니다.

:::tip
서브쿼리에서는 메인 쿼리에 있는 테이블과 컬럼을 참조할 수 없습니다.
:::

**구문**

```sql
EXISTS(subquery)
```

**예시**

서브쿼리에서 값이 존재하는지 확인하는 쿼리:

```sql
SELECT EXISTS(SELECT * FROM numbers(10) WHERE number > 8), EXISTS(SELECT * FROM numbers(10) WHERE number > 11)
```

결과:

```text
┌─in(1, _subquery1)─┬─in(1, _subquery2)─┐
│                 1 │                 0 │
└───────────────────┴───────────────────┘
```

여러 행을 반환하는 서브쿼리가 있는 쿼리:

```sql
SELECT count() FROM numbers(10) WHERE EXISTS(SELECT number FROM numbers(10) WHERE number > 8);
```

결과:

```text
┌─count()─┐
│      10 │
└─────────┘
```

빈 결과를 반환하는 서브쿼리를 사용하는 쿼리:

```sql
SELECT count() FROM numbers(10) WHERE EXISTS(SELECT number FROM numbers(10) WHERE number > 11);
```

결과:

```text
┌─count()─┐
│       0 │
└─────────┘
```
