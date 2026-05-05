---
description: 'Nothing 특수 데이터 타입 문서'
sidebar_label: 'Nothing'
sidebar_position: 60
slug: /sql-reference/data-types/special-data-types/nothing
title: 'Nothing'
doc_type: 'reference'
---

# Nothing \{#nothing\}

이 데이터 형식의 유일한 목적은 값이 존재하지 않을 것으로 예상되는 경우를 표현하는 것입니다. 따라서 `Nothing` 형식의 값을 생성할 수 없습니다.

예를 들어, 리터럴 [NULL](/sql-reference/syntax#null)은 `Nullable(Nothing)` 형식을 가집니다. [널 허용](../../../sql-reference/data-types/nullable.md)에 대한 자세한 내용은 해당 문서를 참조하십시오.

`Nothing` 형식은 비어 있는 배열을 나타내는 데에도 사용할 수 있습니다.

```sql
SELECT toTypeName(array())
```

```text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```
