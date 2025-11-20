---
'description': '인수 값의 배열을 생성합니다. 값은 배열에 임의의(불확실한) 순서로 추가될 수 있습니다.'
'sidebar_position': 139
'slug': '/sql-reference/aggregate-functions/reference/grouparray'
'title': 'groupArray'
'doc_type': 'reference'
---


# groupArray

문법: `groupArray(x)` 또는 `groupArray(max_size)(x)`

인수 값의 배열을 생성합니다. 값은 배열에 임의의 (불확정적) 순서로 추가될 수 있습니다.

두 번째 버전(`max_size` 매개변수가 있는)은 결과 배열의 크기를 `max_size` 요소로 제한합니다. 예를 들어, `groupArray(1)(x)`는 `[any (x)]`와 같습니다.

일부 경우에는 실행 순서를 여전히 신뢰할 수 있습니다. 이는 `SELECT`가 `ORDER BY`를 사용하는 서브쿼리에서 오는 경우에 적용되며, 서브쿼리 결과가 충분히 작을 때 해당됩니다.

**예시**

```text
SELECT * FROM default.ck;

┌─id─┬─name─────┐
│  1 │ zhangsan │
│  1 │ ᴺᵁᴸᴸ     │
│  1 │ lisi     │
│  2 │ wangwu   │
└────┴──────────┘

```

쿼리:

```sql
SELECT id, groupArray(10)(name) FROM default.ck GROUP BY id;
```

결과:

```text
┌─id─┬─groupArray(10)(name)─┐
│  1 │ ['zhangsan','lisi']  │
│  2 │ ['wangwu']           │
└────┴──────────────────────┘
```

groupArray 함수는 위 결과를 기반으로 ᴺᵁᴸᴸ 값을 제거합니다.

- 별칭: `array_agg`.
