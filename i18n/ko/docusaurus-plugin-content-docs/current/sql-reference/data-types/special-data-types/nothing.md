---
'description': 'Nothing 특별한 데이터 유형에 대한 문서'
'sidebar_label': 'Nothing'
'sidebar_position': 60
'slug': '/sql-reference/data-types/special-data-types/nothing'
'title': 'Nothing'
'doc_type': 'reference'
---


# Nothing

이 데이터 유형의 유일한 목적은 값이 예상되지 않는 경우를 나타내는 것입니다. 그래서 `Nothing` 유형 값을 생성할 수 없습니다.

예를 들어, 리터럴 [NULL](/sql-reference/syntax#null)은 `Nullable(Nothing)` 유형을 가집니다. [Nullable](../../../sql-reference/data-types/nullable.md)에 대한 더 많은 내용을 참조하세요.

`Nothing` 유형은 빈 배열을 나타내는 데에도 사용할 수 있습니다:

```sql
SELECT toTypeName(array())
```

```text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```
