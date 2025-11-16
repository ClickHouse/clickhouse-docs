---
'description': '`value` 배열에서 `key` 배열에 지정된 키에 따라 최소값을 계산합니다.'
'sidebar_position': 169
'slug': '/sql-reference/aggregate-functions/reference/minmap'
'title': 'minMap'
'doc_type': 'reference'
---


# minMap

`key` 배열에 지정된 키에 따라 `value` 배열에서 최솟값을 계산합니다.

**문법**

```sql
`minMap(key, value)`
```
또는
```sql
minMap(Tuple(key, value))
```

별칭: `minMappedArrays`

:::note
- 키와 값 배열의 튜플을 전달하는 것은 키 배열과 값 배열을 전달하는 것과 동일합니다.
- `key`와 `value`의 요소 수는 총합을 계산하는 각 행에 대해 동일해야 합니다.
:::

**매개변수**

- `key` — 키 배열. [Array](../../data-types/array.md).
- `value` — 값 배열. [Array](../../data-types/array.md).

**반환 값**

- 정렬된 순서로 된 키 배열과 해당 키에 대해 계산된 값 배열로 이루어진 튜플을 반환합니다. [Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md)).

**예제**

쿼리:

```sql
SELECT minMap(a, b)
FROM VALUES('a Array(Int32), b Array(Int64)', ([1, 2], [2, 2]), ([2, 3], [1, 1]))
```

결과:

```text
┌─minMap(a, b)──────┐
│ ([1,2,3],[2,1,1]) │
└───────────────────┘
```
