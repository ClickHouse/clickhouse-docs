---
'description': '`value` 배열에서 `key` 배열에 지정된 키에 따라 최대값을 계산합니다.'
'sidebar_position': 165
'slug': '/sql-reference/aggregate-functions/reference/maxmap'
'title': 'maxMap'
'doc_type': 'reference'
---


# maxMap

주어진 `key` 배열에 명시된 키에 따라 `value` 배열에서 최대값을 계산합니다.

**문법**

```sql
maxMap(key, value)
```
또는
```sql
maxMap(Tuple(key, value))
```

별칭: `maxMappedArrays`

:::note
- 키와 값 배열의 튜플을 전달하는 것은 두 개의 키와 값 배열을 전달하는 것과 동일합니다.
- `key`와 `value`의 요소 수는 총합이 계산되는 각 행에서 동일해야 합니다.
:::

**매개변수**

- `key` — 키 배열. [Array](../../data-types/array.md).
- `value` — 값 배열. [Array](../../data-types/array.md).

**반환 값**

- 정렬된 순서로 된 키 배열과 해당 키에 대해 계산된 값 배열의 튜플을 반환합니다. [Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md)).

**예시**

쿼리:

```sql
SELECT maxMap(a, b)
FROM VALUES('a Array(Char), b Array(Int64)', (['x', 'y'], [2, 2]), (['y', 'z'], [3, 1]))
```

결과:

```text
┌─maxMap(a, b)───────────┐
│ [['x','y','z'],[2,3,1]]│
└────────────────────────┘
```
